---
module: 2
position: 2
title: "Layer caching — making builds fast"
objective: "Order instructions for maximum cache hit."
estimated_minutes: 7
---

# Layer caching — making builds fast

## The puzzle

A team complains: "Our Docker builds take 5 minutes for a one-line change." Almost always, the answer is broken layer caching. Docker has a sophisticated cache that should make incremental builds nearly instant. When it doesn't, you've configured around it. Understanding cache mechanics turns 5-minute builds into 30-second builds with no infrastructure changes.

## The simple version

Docker's build cache:

1. For each instruction, compute a hash of the instruction + its inputs.
2. Check if a layer with that hash exists locally.
3. Hit: reuse the cached layer.
4. Miss: execute the instruction; cache the result for next time.
5. Once any instruction misses, all subsequent instructions also miss (cascade).

The discipline: put stable instructions early; frequently-changing instructions late. Especially: copy dependency lock files and install dependencies BEFORE copying source code. This single rule transforms most Dockerfiles.

## The technical version

### Cache key computation

For most instructions, the cache key is the instruction string. For COPY/ADD, it's the instruction string plus the hash of the files being copied.

So:

- `RUN apt-get install -y curl` — cache key is the string.
- `COPY package.json ./` — cache key includes the hash of package.json.

Change a file being COPY'd → cache key changes → cache miss.
Change a RUN command's string → cache miss.
Change the order of instructions → all subsequent caches miss.

### The cascade

Cache misses cascade because layer N+1 depends on layer N's filesystem state. If N changes, N+1's starting point is different; its cache is invalid.

This is why instruction order matters. Putting `COPY . .` early means ANY source file change invalidates the cache for everything after.

### The classic optimization

A naive Dockerfile:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .                   # ← changes whenever any file changes
RUN npm ci --omit=dev      # ← cache invalidated, reinstalls
CMD ["node", "server.js"]
```

Every source code change reinstalls dependencies. Slow.

The optimized version:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./      # ← changes only when dependencies change
RUN npm ci --omit=dev      # ← cached when package.json unchanged
COPY . .                   # ← cache invalidated only when source changes
CMD ["node", "server.js"]
```

Now source-only changes skip npm install. Builds drop from minutes to seconds for the common case.

This pattern works for any package manager:

- Python: `COPY requirements.txt`, `RUN pip install -r requirements.txt`, then COPY source.
- Go: `COPY go.mod go.sum`, `RUN go mod download`, then COPY source.
- Rust: `COPY Cargo.toml Cargo.lock`, `RUN cargo fetch`, then COPY source.

### Multi-instruction dependencies

For more complex builds:

```dockerfile
FROM debian:12-slim
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*    # ← system deps; stable
COPY config.json /etc/app/             # ← config; changes occasionally  
COPY package*.json ./                  # ← dependency manifest
RUN npm ci --omit=dev                  # ← cached on package.json
COPY . .                                # ← source; frequent changes
```

Each layer's cache invalidation only affects layers below it. System deps change rarely → cached. Config changes occasionally → only that layer and below invalidate. Source changes constantly → only the source COPY and after.

### Disabling cache

When you want to force a rebuild:

```bash
docker build --no-cache .              # rebuild every layer
docker build --pull .                  # pull base image fresh
```

Use `--no-cache` when you suspect cache is stale (e.g., base image security update that didn't change tags). Use `--pull` to refresh base images.

For specific layers, you can invalidate by changing the instruction. A common trick: add `ARG CACHEBUST=1` and run `docker build --build-arg CACHEBUST=$(date +%s)` to force invalidation from that point.

### BuildKit improvements

BuildKit (modern Docker builder, default in recent versions) adds capabilities:

- **Parallel stages**: multi-stage builds run independent stages concurrently.
- **Inline cache**: include cache metadata in pushed images so other builders can use it.
- **Registry-based cache**: cache layers in a registry for sharing across CI runs.
- **Secret mounts**: build-time secrets without persisting in layers.
- **SSH mounts**: pass SSH agent to build for private repos.
- **Bind mounts**: mount build context paths during RUN without copying.

For CI/CD, registry-backed cache is a big win:

```bash
docker build \
  --cache-from type=registry,ref=registry.example.com/myapp:cache \
  --cache-to type=registry,ref=registry.example.com/myapp:cache,mode=max \
  -t myapp:latest .
```

CI builds pull the cache from the registry; cache hits across runs. First build slow; subsequent builds fast.

### Bind mounts during build

BuildKit's bind mounts let you access host paths during RUN without COPY:

```dockerfile
# syntax=docker/dockerfile:1.4
RUN --mount=type=bind,source=.,target=/src \
    cd /src && go build -o /app/main ./cmd/server
```

The source code isn't COPY'd; it's bind-mounted during the RUN. Useful for builds where you don't want intermediate source-copy layers.

### Cache mounts

For directories that should persist between builds (like package manager caches):

```dockerfile
# syntax=docker/dockerfile:1.4
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

The `/root/.npm` is a cache shared across builds. Doesn't end up in the image, but speeds up subsequent installs significantly.

Similar for pip (`/root/.cache/pip`), apt (`/var/cache/apt`), Go modules, etc.

### Cache busting intentionally

Sometimes you want to ensure something always runs (e.g., security updates). Combine apt update with the install in one RUN; consider rebuilding the base image regularly rather than trying to invalidate from CI.

For security-critical patches: rebuild from latest base image periodically (weekly cron, or after CVE notification). Don't try to defeat the cache; refresh the inputs.

### Distributed cache

Beyond registry cache, you can use external cache backends:

- **S3 / Azure Blob**: GitHub Actions cache plugin supports this.
- **GitHub Actions cache**: built-in for Actions workflows.
- **Local CI cache directories**: faster but per-runner.

For matrix builds across many configurations, shared cache is essential. Without it, each variant rebuilds from scratch.

### CI/CD considerations

A few patterns:

**Caching from the previous image tag**:

```bash
docker pull myapp:latest || true
docker build --cache-from myapp:latest -t myapp:new .
```

Pulls the previous image so its layers can serve as cache. Useful for simple CI setups.

**Multi-arch builds with shared cache**:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --cache-from type=registry,ref=...:cache \
  --cache-to type=registry,ref=...:cache \
  -t myapp:tag --push .
```

Both architectures use the same cache layout.

**Stage-specific cache invalidation**:

In multi-stage builds (lesson 3), each stage caches independently. Changing the runner stage doesn't invalidate the builder stage.

### Common cache busts

A few patterns that surprise people:

**Timestamps**:

```dockerfile
RUN echo "Built at $(date)" > /build_info  # ← invalidates every build
```

If you must have build metadata, use ARG and pass via build-time:

```dockerfile
ARG BUILD_DATE
RUN echo "$BUILD_DATE" > /build_info
```

**Floating tags**:

```dockerfile
FROM node:20           # ← floats; can change without your changes
FROM node:20-alpine    # ← also floats
```

Use specific versions or digest pinning when reproducibility matters.

**Network changes**:

```dockerfile
RUN curl -O https://example.com/binary  # ← cached based on URL, not content
```

If the URL is stable but the content can change (e.g., `latest.tar.gz`), cache may serve stale content. Pin to versioned URLs.

### Inspecting cache behavior

```bash
docker build --progress=plain .    # see cache hits/misses per instruction
docker history <image>             # see resulting layers
```

`--progress=plain` shows `CACHED` next to instructions that hit the cache. Useful for verifying optimization works.

### Real-world: a build cache audit

Process for any Dockerfile that feels slow:

1. Build twice in a row with no changes. Second build should be near-instant (everything cached).
2. Make a single source code change. Rebuild. Note where cache invalidates.
3. If cache invalidates earlier than the source change implies, reorder instructions.
4. Look for instructions whose hash changes unnecessarily (timestamps, ARG, floating refs).

After this audit, most Dockerfiles improve dramatically.

## Three real-world scenarios

**Scenario 1: A 5-minute build optimized to 30 seconds.**
Investigation: `COPY . .` was first, then `RUN apt-get install`, then `RUN pip install`. Every source change reinstalled everything. Reordered: apt install (rare changes), then COPY requirements.txt + pip install (changes when deps change), then COPY source (frequent). Subsequent source changes: 30 second builds.

**Scenario 2: CI builds slow but local builds fast.**
Local development reuses the layer cache; CI starts fresh each time. Added registry cache via BuildKit (`--cache-from`, `--cache-to`). First CI build still slow but pushes cache to registry. Subsequent CI runs pull cache; builds drop to ~1 minute.

**Scenario 3: A team can't figure out why npm install runs every build.**
Investigation: someone added `ARG VERSION` and `LABEL version=$VERSION` above `RUN npm install`. The VERSION ARG changes per build, invalidating the LABEL layer, which invalidates everything below — including npm install. Moved VERSION-related instructions to the end of the Dockerfile (after the expensive steps). Cache restored.

## Common mistakes to avoid

- **`COPY . .` before dependency install** — destroys cache.
- **Timestamps in RUN commands** — invalidates every build.
- **Floating base image tags** when reproducibility matters.
- **ARGs before expensive steps** — accidentally cache-busting.
- **No `.dockerignore`** — unnecessary files trigger COPY cache misses.
- **Not using BuildKit features** — missing cache mounts and registry cache.
- **Frequent runtime config near top** — invalidates everything below.

## Read more

- Docker docs: "Build cache."
- BuildKit documentation on cache backends.
- "Improving Docker build performance" blog posts.

## Summary

- **Build cache** keys on instruction + inputs.
- **Cache cascades**: one miss invalidates all subsequent layers.
- **Order rule**: stable first, frequently-changing last.
- **Copy lock files + install before source code** — universal pattern.
- **BuildKit** adds cache mounts, registry cache, secrets, parallel stages.
- **Registry cache** for CI/CD sharing across runs.
- **Audit by building twice, then with one change** to see invalidation patterns.

Next: multi-stage builds.
