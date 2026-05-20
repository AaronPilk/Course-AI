---
module: 2
position: 1
title: "Dockerfiles — instruction by instruction"
objective: "Understand each directive and when to use it."
estimated_minutes: 7
---

# Dockerfiles — instruction by instruction

## The puzzle

A Dockerfile is the recipe for an image. Most teams write them by copying examples and tweaking until they work. That gets results, but bad Dockerfiles produce bloated images, slow builds, and security issues. Understanding what each instruction actually does — and how they interact — is the difference between a Dockerfile that's a constant headache and one that's reliable production infrastructure.

## The simple version

The core instructions:

- **FROM**: base image. The first instruction in nearly every Dockerfile.
- **WORKDIR**: set the working directory for subsequent instructions.
- **COPY** / **ADD**: copy files from build context into the image. Prefer COPY.
- **RUN**: execute a command at build time; creates a new layer.
- **CMD**: default command when container starts.
- **ENTRYPOINT**: the executable for the container; CMD becomes its arguments.
- **ENV**: set environment variables at runtime.
- **ARG**: build-time variables.
- **EXPOSE**: documents which ports the container listens on (doesn't actually open them).
- **USER**: switch user for subsequent instructions and runtime.
- **HEALTHCHECK**: command to test if the container is healthy.
- **VOLUME**: declare a directory as a volume mount point.
- **LABEL**: metadata key-value pairs.

The discipline: pick the right instruction; understand its caching behavior; respect best practices for production images.

## The technical version

### FROM

Sets the base image. Examples:

```dockerfile
FROM node:20-alpine
FROM python:3.12-slim
FROM gcr.io/distroless/static-debian12
FROM scratch  # truly empty; only for static binaries
```

Choices to make consciously:

- **Specific version tags**: `node:20.10.0-alpine` is more reproducible than `node:latest`.
- **Distro flavor**: alpine (musl libc, ~5MB base), slim (Debian-based, smaller), full (large but compatible).
- **Distroless**: Google's images with just the language runtime, no shell, no package manager. Very small, very secure.

Multi-stage builds use multiple FROMs (covered in lesson 3).

### WORKDIR

Sets the working directory for RUN, COPY, ADD, ENTRYPOINT, CMD:

```dockerfile
WORKDIR /app
COPY . .         # copies to /app
RUN npm install  # runs in /app
```

Creates the directory if it doesn't exist. Use absolute paths.

### COPY vs ADD

Both copy files from build context into the image.

- **COPY**: simple, predictable. Recommended default.
- **ADD**: same as COPY plus can fetch URLs and auto-extract tar files. Usually overkill; prefer COPY + RUN for URL fetches.

Examples:

```dockerfile
COPY package.json package-lock.json ./
COPY src ./src
COPY --chown=app:app config.yaml /etc/app/
COPY --from=builder /app/dist /app/dist
```

`--chown` sets ownership. `--from` references a previous stage (multi-stage).

### RUN

Executes a command during build:

```dockerfile
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
```

Each RUN creates a layer. Combine related steps in one RUN to avoid orphaned files in intermediate layers (cleanup wouldn't reduce image size if split across layers).

Shell form: `RUN apt-get update` — runs via /bin/sh.
Exec form: `RUN ["apt-get", "update"]` — direct exec, no shell.

Use exec form when you don't want shell interpretation; shell form when you need shell features.

### CMD and ENTRYPOINT

The runtime command. Two related instructions:

```dockerfile
ENTRYPOINT ["node", "server.js"]
CMD ["--port", "8080"]
```

Result: container starts with `node server.js --port 8080`. CMD provides default arguments; can be overridden at `docker run`. ENTRYPOINT is the executable.

Common pattern: ENTRYPOINT for the binary, CMD for arguments:

```dockerfile
ENTRYPOINT ["python3", "app.py"]
CMD ["--config", "/etc/app/default.yaml"]
```

Override with: `docker run image --config /etc/app/prod.yaml`.

Shell form is shorthand for exec form wrapped in /bin/sh -c, with the side effect of breaking signal handling (SIGTERM goes to sh, not your app). Use exec form for production.

### ENV vs ARG

- **ENV**: set environment variables in the image; available at build time AND runtime.
- **ARG**: build-time only; not in the final image.

```dockerfile
ARG BUILD_VERSION=1.0
ENV APP_VERSION=$BUILD_VERSION

# Build with: docker build --build-arg BUILD_VERSION=2.0 .
```

Don't put secrets in ARG (they're visible in image history). Use BuildKit's `--secret` for build-time secrets.

ENV values are visible via `docker inspect`. Don't put secrets here either.

### EXPOSE

Documents which ports the container listens on:

```dockerfile
EXPOSE 8080
```

This is metadata — it doesn't actually open the port. You still need `-p 8080:8080` at run time or a port mapping in the orchestrator.

EXPOSE helps tools (Docker Compose, K8s manifests generated from images) but isn't functional otherwise.

### USER

Switch to a non-root user:

```dockerfile
RUN useradd -m -u 10000 app
USER 10000
```

After USER, subsequent instructions (and the runtime entrypoint) run as that user. Best practice: never run as root in production.

Some base images include a non-root user (e.g., `node` user in node images). Some don't; create one explicitly.

### HEALTHCHECK

Define a command to check container health:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/health || exit 1
```

Docker periodically runs this. Container status reflects health. Orchestrators (Docker Compose, Swarm) use this. Kubernetes uses its own probes (livenessProbe, readinessProbe in the Pod spec) and ignores Dockerfile HEALTHCHECK.

### VOLUME

Declare a path as a volume mount point:

```dockerfile
VOLUME /data
```

If no volume is provided at runtime, Docker creates an anonymous volume. The directory's contents from the image are preserved as the volume's initial state.

Use sparingly. Volumes for data persistence are usually configured at run time, not in the Dockerfile.

### LABEL

Metadata:

```dockerfile
LABEL maintainer="team@example.com"
LABEL org.opencontainers.image.source="https://github.com/example/repo"
LABEL org.opencontainers.image.licenses="MIT"
```

Visible via `docker inspect`. Some tooling (registries, scanners) uses labels for discovery and policy.

### SHELL

Change the default shell for shell-form RUN:

```dockerfile
SHELL ["/bin/bash", "-c"]
RUN echo $BASH_VERSION  # uses bash now
```

Rare; usually defaults work.

### ONBUILD (rare)

Defer an instruction to images built FROM this one. Like a template hook. Use cases are narrow; mostly seen in language base images.

### .dockerignore

A file at the build context root that excludes files from the build:

```
node_modules
.git
*.log
.env
```

Without `.dockerignore`, every file in your project is sent to the daemon for the build, slows things down, and can leak (e.g., committing `.env` into the image).

`.dockerignore` is the universal accompaniment to a Dockerfile. Always have one.

### Instruction ordering matters

Combine the rules from lessons in module 1:

1. **FROM** (locked to specific version).
2. **Base setup that rarely changes** (system packages, language runtime updates).
3. **Dependency install setup** (COPY lock files, RUN install).
4. **Application source** (COPY source code).
5. **Runtime config** (ENV, EXPOSE, USER, ENTRYPOINT, CMD).

This ordering maximizes cache hits during iterative builds and minimizes layer reuse waste.

### A real-world Dockerfile

A clean Node.js Dockerfile:

```dockerfile
FROM node:20.10.0-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/server.js"]
```

This is multi-stage (lesson 3): build dependencies separately, only the runtime files end up in the final image. Small, fast, secure.

### Common Dockerfile mistakes

A handful that show up everywhere:

**Latest tag**:

```dockerfile
FROM node:latest  # ← bad
```

`latest` floats; builds aren't reproducible. Use specific versions.

**No non-root user**:

```dockerfile
# No USER instruction → runs as root
```

Add a non-root user; switch with USER.

**Copying everything at once**:

```dockerfile
COPY . .            # ← destroys cache on any source change
RUN npm install     # ← reinstalls every build
```

Copy lock files first, install, then copy source.

**Cleanup not in same RUN**:

```dockerfile
RUN apt-get update && apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*  # ← cleanup in separate layer = orphaned files
```

Combine into one RUN to actually reduce image size.

**Secrets in ARG or ENV**:

```dockerfile
ARG DB_PASSWORD          # ← visible in image history
ENV API_KEY=secret123    # ← visible in image
```

Use BuildKit secrets for build-time; runtime secrets injected at run time.

**Shell-form CMD**:

```dockerfile
CMD npm start  # ← runs via shell; signals go to sh, not your app
```

Use exec form: `CMD ["npm", "start"]` (or better, `CMD ["node", "server.js"]`).

### Inspecting a Dockerfile

After building, look at:

```bash
docker history <image>    # see each layer and its instruction
docker image inspect <image>
dive <image>              # interactive layer browser
```

These reveal what your Dockerfile actually produced. Useful for catching bloated layers, unnecessary tools, or accidental secrets.

### Tools beyond raw Dockerfiles

- **BuildKit**: modern Docker builder; supports parallel stages, secrets, mounts. Default in modern Docker.
- **buildx**: Docker CLI plugin for multi-architecture builds.
- **Buildpacks** (Cloud Native Buildpacks): build images without writing Dockerfiles; opinionated, reproducible.
- **ko** (Go-specific): builds Go binaries into images without Docker daemon.
- **kaniko**: build images inside containers without root.

For most teams, BuildKit + a clean Dockerfile + multi-stage build is the right setup. The alternatives are for specific needs.

## Three real-world scenarios

**Scenario 1: A 1.5GB image.**
Investigation: COPY of entire repo (includes .git, dist, tests), apt-get installs without cleanup, dev dependencies installed, no multi-stage. Optimized: .dockerignore, multi-stage build with separate deps and runner stages, combined apt-get + cleanup in single RUN. Final image: 180MB. 8x reduction with one focused effort.

**Scenario 2: Container running as root.**
Standard Dockerfile, no USER instruction. Container ran as root. After a CVE in the app, attacker had root inside the container, easier path to container escape attempts. Added a non-root user; container runs constrained; same code, dramatically smaller attack surface.

**Scenario 3: Builds take 4 minutes for source-only changes.**
Investigation: `COPY . .` early, then `RUN npm install` later. Source change invalidates COPY; cache miss; npm install reruns from scratch. Reordered to COPY lock files first, install, then COPY source. Source-only builds: 30 seconds.

## Common mistakes to avoid

- **`FROM image:latest`** — non-reproducible.
- **`USER root`** in production images.
- **`COPY . .` before dependency install** — destroys cache.
- **Cleanup in separate RUN** — orphaned files inflate image.
- **Secrets in ARG / ENV / layers** — leaks via image.
- **Shell-form CMD** — breaks signal handling.
- **No .dockerignore** — huge build contexts, possible secret leaks.
- **`ADD` for everything** — COPY is clearer.

## Read more

- Docker docs: "Dockerfile reference" and "Best practices."
- "Top 10 Dockerfile mistakes" articles.
- BuildKit documentation.

## Summary

- **FROM, WORKDIR, COPY, RUN, CMD, ENTRYPOINT, ENV, USER, EXPOSE, HEALTHCHECK, LABEL** are the core instructions.
- **Order for cache friendliness**: stable first, frequent-change last.
- **COPY beats ADD**; exec-form beats shell-form.
- **Non-root USER** is non-negotiable for production.
- **Cleanup in same RUN** — splits orphan files.
- **No secrets in ARG, ENV, or layers** — use BuildKit secrets.
- **`.dockerignore`** is mandatory.
- **Multi-stage builds** are covered in lesson 3.

Next: layer caching deep dive.
