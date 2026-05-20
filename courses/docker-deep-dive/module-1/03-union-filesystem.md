---
module: 1
position: 3
title: "The union filesystem — layered images explained"
objective: "Understand why images are layered and what that buys you."
estimated_minutes: 7
---

# The union filesystem — layered images explained

## The puzzle

When you build a Docker image, each instruction in the Dockerfile becomes a layer. The final image is a stack of layers. Why? Because of the union filesystem — a Linux feature that lets multiple filesystems be "merged" into one view. This is what makes Docker image distribution fast, builds cacheable, and storage efficient. Understanding layers is the foundation of writing good Dockerfiles.

## The simple version

A Docker image is a stack of read-only layers, plus a writable layer for the running container:

```
+-----------------------------+
| container writable layer    |  <- changes here
+-----------------------------+
| Dockerfile layer N (top)    |
| Dockerfile layer N-1        |
| ...                         |
| base image layer (bottom)   |
+-----------------------------+
```

The union filesystem (overlayfs in modern Docker) presents these as one merged filesystem. Files in upper layers shadow files in lower layers. When the container writes, it writes to the top writable layer (copy-on-write).

Benefits:

- **Shared layers** between images save disk space.
- **Pulled layers** are cached locally; repulls only fetch new layers.
- **Build cache** reuses layers when Dockerfile instructions haven't changed.
- **Fast container starts** because layers are already on disk.

The discipline: order Dockerfile instructions so layers cache well; minimize unique-per-build layers.

## The technical version

### Image layers

Each Dockerfile instruction that modifies the filesystem creates a layer:

```dockerfile
FROM node:20-alpine       # base layers
WORKDIR /app              # metadata (no fs change)
COPY package*.json ./     # layer with package files
RUN npm install           # layer with node_modules
COPY . .                  # layer with source code
CMD ["node", "server.js"] # metadata (no fs change)
```

Each `COPY` and `RUN` produces a layer. Each layer is a tarball stored separately. The final image is the ordered list of these layers plus metadata.

When pulled, Docker downloads each layer separately. Layers shared across images (same base, same intermediate steps) are downloaded once and reused.

### Overlayfs

OverlayFS is the kernel module that combines layers into a single view. It works on directories:

- **Lower dir(s)**: read-only layers from the image.
- **Upper dir**: the writable layer (copy-on-write).
- **Merged dir**: what processes see.

When a process reads a file, OverlayFS finds it in the topmost layer that has it. When a process writes a file, OverlayFS copies it to the upper dir (if it was in a lower layer) and modifies the copy. The lower layers stay read-only.

This is why Docker can ship a read-only image and have many container instances running with their own writable upper layers. Same image, isolated writes.

### Build cache

Docker's build cache uses layers to avoid redoing work:

1. Compute a hash of each instruction (including its inputs).
2. If a cached layer exists with the same hash, reuse it.
3. Once a cache miss occurs, invalidate all subsequent layers.

This is why instruction ordering matters. A common mistake:

```dockerfile
FROM node:20
WORKDIR /app
COPY . .              # changes whenever any file changes
RUN npm install       # cache invalidated whenever any file changes
```

Better:

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install       # cached when package.json unchanged
COPY . .              # cache invalidated when source files change
```

The second order: changing source code doesn't reinstall dependencies. Builds go from minutes to seconds.

### Layer sharing across images

If two images share the same base (`node:20-alpine`) and same early Dockerfile steps, those layers are shared on disk:

- Image A: `[alpine] [node] [npm install foo]`
- Image B: `[alpine] [node] [npm install bar]`

The `[alpine]` and `[node]` layers exist once on disk. Only the differing layers (`[npm install foo]` vs `[npm install bar]`) take additional space.

When pulling, only missing layers download. If you've already pulled `node:20-alpine`, building a new image based on it pulls nothing for the base.

### Layer immutability

Layers are content-addressed (identified by hash). Modifying a layer's contents creates a new layer with a new hash. You can't actually modify a layer in place.

This is why a Dockerfile that deletes files in a later instruction doesn't reduce the image size — the file is still in the lower layer, just hidden by the upper layer's deletion marker.

```dockerfile
COPY large-file.bin /tmp/
RUN process-large-file && rm /tmp/large-file.bin
```

This leaves `large-file.bin` in a layer (the COPY) and adds a whiteout in another (the RUN). The image is still big.

Fix with a single RUN that does the cleanup:

```dockerfile
RUN curl -O large-file.bin && process-large-file && rm large-file.bin
```

The single layer has the file briefly during the layer build, but the layer's final state doesn't include it. Image stays small.

### Image manifests

A Docker image is described by a manifest — a JSON document listing the layers, metadata, environment variables, exposed ports, etc. The manifest itself is content-addressed.

Image references can use:

- **Tag** (`myapp:v1.0`): human-friendly, mutable. Bad for reproducibility; tags can be reassigned.
- **Digest** (`myapp@sha256:abcd1234...`): immutable, content-addressed. Best for production.

For production deployments, reference images by digest. Tags can be retagged (an attacker who compromises a registry can swap what `:v1.0` points to); digests can't.

### Storage drivers

Docker has had multiple storage drivers over the years:

- **overlay2** (current default): uses overlayfs; fast and reliable.
- **aufs** (older): predecessor to overlayfs.
- **devicemapper, btrfs, zfs**: alternative drivers.

For nearly all modern setups, overlay2 is correct. You shouldn't need to think about this unless you have very specific requirements.

### Multi-stage builds (preview)

A common pattern: build dependencies in one stage, copy artifacts to a smaller stage. The build layers don't end up in the final image:

```dockerfile
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist /app
CMD ["node", "server.js"]
```

The final image has only the runtime alpine layers + the copied dist. Builder stage's layers (with full node, npm, source) are discarded. We'll cover this more in Module 2.

### Layer count

Older Docker advice was "minimize layers." Modern Docker is less sensitive — many layers is fine. Don't sacrifice readability to combine instructions just to reduce count.

What matters more: total image size, security (no secrets in any layer), build cache friendliness.

### Layers and security

A common security mistake: putting a secret in a build layer, then trying to remove it:

```dockerfile
COPY id_rsa /root/.ssh/   # layer has the secret
RUN ssh-add ... && rm /root/.ssh/id_rsa  # remove from later layer
```

The secret is still in the earlier layer. Anyone with the image can extract it.

Use BuildKit's `--secret` flag for build-time secrets:

```dockerfile
# syntax=docker/dockerfile:1.4
RUN --mount=type=secret,id=mysecret cat /run/secrets/mysecret
```

The secret is available only during that RUN; never persisted in a layer.

### Inspecting layers

Tools:

```bash
docker history <image>   # see layers and sizes
docker image inspect <image>
dive <image>              # third-party; interactive layer inspector
```

`dive` is especially useful — shows what each layer added to the filesystem.

### What this means in practice

Layer awareness changes how you write Dockerfiles:

- Order to maximize cache hits: stable instructions first, frequently-changing last.
- Combine related cleanup into single RUN to avoid orphaned files.
- Use multi-stage builds to keep production images small.
- Never put secrets in layers.
- Pin images by digest for reproducibility.

These produce smaller, faster, more secure images. The discipline scales — once you internalize it, all your Dockerfiles benefit.

## Three real-world scenarios

**Scenario 1: A 2GB image that should be 200MB.**
Dockerfile copies the entire repo, including .git history (50MB+), node_modules from dev install (1GB+), and tests/docs not needed at runtime. Fix: .dockerignore for unnecessary files; multi-stage build to discard dev dependencies; size drops to 180MB. Faster pulls, less storage cost, fewer attack-surface bytes.

**Scenario 2: Builds take 5 minutes when they should take 30 seconds.**
Dockerfile has `COPY . .` early. Every source code change invalidates cache and rebuilds everything from npm install onward. Fix: copy package.json, run install, then copy source. Source-only changes skip install; builds drop to 30 seconds.

**Scenario 3: A secret leaked via image.**
A developer COPY'd an SSH key for git access during build, then RM'd it. Image was pushed publicly. Someone extracted the key from the early layer. Fix: rotate the key; switch to BuildKit secrets; audit all images for similar mistakes.

## Common mistakes to avoid

- **`COPY . .` before dependency install** — destroys cache.
- **Removing files in later RUN** — doesn't reduce image size.
- **Secrets in layers** — extractable from the image.
- **No .dockerignore** — copying unneeded files into builds.
- **Tags in production** — not reproducible; use digests.
- **No multi-stage** — production image bloated with build tools.

## Read more

- Docker docs: "About storage drivers."
- BuildKit documentation.
- "dive" tool documentation.

## Summary

- **Images are stacks of read-only layers + a writable container layer.**
- **OverlayFS** merges them; copy-on-write for the writable layer.
- **Each Dockerfile instruction** producing fs changes = one layer.
- **Build cache** keys on instruction hash; orderings matter.
- **Layers are content-addressed**; reused across images.
- **Pin by digest** in production for reproducibility.
- **Secrets in layers persist** — use BuildKit's `--secret` for build-time secrets.
- **Multi-stage builds** keep production images small.

Next: Docker, containerd, runc, and OCI — who does what.
