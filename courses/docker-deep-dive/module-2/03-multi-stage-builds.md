---
module: 2
position: 3
title: "Multi-stage builds — the modern pattern"
objective: "Produce small production images."
estimated_minutes: 7
---

# Multi-stage builds — the modern pattern

## The puzzle

A naive Node.js image contains the full Node toolchain, all dev dependencies, and the source code. It might be 1.5 GB. The actual application runtime needs maybe 200 MB. Multi-stage builds let you build in one stage with all the tools and copy only the artifacts to a clean final stage. Smaller images, smaller attack surface, faster pulls.

## The simple version

A multi-stage Dockerfile has multiple FROM statements:

```dockerfile
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist /app
COPY --from=builder /app/node_modules /app/node_modules
CMD ["node", "server.js"]
```

The builder stage has everything needed to build (full Node, all dependencies, source code). The final stage is just alpine plus what was copied from builder. The build stage's layers are discarded; only the final stage ships.

Result: small image (just runtime), with the same build process producing it. The pattern works for any language — compile in one stage, copy binary to a minimal final stage.

## The technical version

### Why multi-stage

Without multi-stage, you face a choice:

- **Use a "build image"** (large; has compilers, dev tools) → bloated production image.
- **Build outside Docker** then COPY artifacts → loses reproducibility.

Multi-stage solves both: build inside Docker (reproducible) but only ship the artifacts (small).

### Stages

Each FROM creates a new stage. Stages can:

- Reference earlier stages by name (`AS builder`).
- COPY files from earlier stages (`COPY --from=builder /path /path`).
- Run independently (they don't share filesystem unless you COPY).

When you `docker build`, all stages run, but only the final stage ends up in the image. Other stages are intermediate; their layers exist on the build host but aren't part of the published image.

You can target a specific stage:

```bash
docker build --target builder -t myapp:dev .
```

Useful for dev/test stages (with debugging tools) vs production stages.

### A clean Node.js example

```dockerfile
# Stage 1: install dependencies
FROM node:20.10.0-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: build the application
FROM node:20.10.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: production runtime
FROM node:20.10.0-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/server.js"]
```

Three stages:

1. **deps**: production-only `node_modules`.
2. **builder**: full dependencies + source + build → produces `dist/`.
3. **runner**: alpine + non-root user + `node_modules` from deps + `dist` from builder.

The final image has only what's needed at runtime: minimal alpine, Node binary (from `node:20-alpine`), production node_modules, and built dist. Build tooling, dev dependencies, source code, npm cache — all discarded.

### A Go example

Go produces a static binary; the final image can be even smaller:

```dockerfile
FROM golang:1.21 AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /out/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
```

The final image is distroless — no shell, no package manager, no userspace beyond what the binary needs. The Go binary is statically linked. Image size: ~20 MB.

For Go, Rust, or other languages producing static binaries, multi-stage + distroless is the canonical pattern.

### Naming stages

Stage names (`AS deps`, `AS builder`) make COPY references readable:

```dockerfile
COPY --from=builder /app/dist /app
```

Without names, you reference by index (0, 1, 2, ...) which is fragile. Always name your stages.

### COPY between stages

`COPY --from=<stage>` brings files from one stage's filesystem into the current stage. The source path is in the named stage; the destination is in the current stage's image.

You can also COPY from external images:

```dockerfile
COPY --from=nginx:1.25 /etc/nginx/nginx.conf /etc/nginx/nginx.conf
```

This pulls files from a third-party image directly — useful for grabbing default configs, binaries, etc.

### Parallel stage execution

BuildKit (modern Docker builder) runs independent stages in parallel. If stage B doesn't depend on stage A, they run concurrently.

```dockerfile
FROM golang:1.21 AS build-server
# ...

FROM golang:1.21 AS build-client
# ...

FROM alpine AS runner
COPY --from=build-server /server /server
COPY --from=build-client /client /client
```

build-server and build-client run in parallel. The final stage waits for both.

For complex builds, this can dramatically reduce wall-clock time.

### Targeted builds for development

You can use multi-stage for both production and development:

```dockerfile
FROM node:20 AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=builder --chown=app:app /app/dist /app/dist
COPY --from=builder --chown=app:app /app/node_modules /app/node_modules
CMD ["node", "dist/server.js"]
```

Then:

- Dev: `docker build --target dev -t myapp:dev .` — large image with dev tools.
- Prod: `docker build -t myapp:prod .` — small final image.

Same Dockerfile, different targets, different artifacts. Reduces drift between dev and prod environments.

### When NOT to use multi-stage

Multi-stage adds Dockerfile complexity. Skip when:

- The base image is already minimal and the app's full setup is small.
- Build time is more important than image size (rare).
- A single-stage Dockerfile produces a comparable image (e.g., pure Python with no compilation).

For most non-trivial apps in 2026, multi-stage is the right default.

### Common multi-stage patterns

**Build + runtime**: most common. Compile/bundle in builder; ship runtime artifacts.

**Build + test + runtime**: include a test stage that runs unit tests; build only succeeds if tests pass.

**Multi-arch**: builder stages per architecture; final stage chooses based on target platform.

**Library extraction**: COPY files from a specific OS or version image into a different runtime base.

### Inspecting the result

After multi-stage build:

```bash
docker images myapp     # see final image size
docker history myapp    # see layers (only from final stage)
dive myapp              # interactive browse
```

Compare to a single-stage build of the same app. The difference is usually dramatic.

### Real-world impact

For a typical Node.js app:

- Single-stage: ~1 GB.
- Multi-stage with full Node base: ~300 MB.
- Multi-stage with Alpine: ~150 MB.
- Multi-stage with distroless: ~100 MB.

For Go apps:

- Single-stage: ~1 GB.
- Multi-stage with Alpine: ~30 MB.
- Multi-stage with distroless: ~20 MB.
- Multi-stage with scratch (statically linked, nothing else): ~10 MB.

Smaller is better for: pull speed, attack surface, registry costs, container startup.

### Combining multi-stage with cache features

You can layer all of Module 2's techniques:

```dockerfile
# syntax=docker/dockerfile:1.4

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=deps --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist ./dist
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["node", "dist/server.js"]
```

This Dockerfile is:

- Multi-stage (small final image).
- BuildKit cache mount (fast repeat builds).
- Non-root user (security).
- Specific image tags (reproducibility).
- Healthcheck declared.
- Layer-cache friendly (deps before source).

This is a modern production Dockerfile baseline. Use it as a template.

## Three real-world scenarios

**Scenario 1: A 1.5GB Java app shrunk to 200MB.**
Original: `FROM openjdk:17` (large base) + Maven + source + build + run. Multi-stage: `FROM maven:3.9-eclipse-temurin-17 AS builder` for build, `FROM eclipse-temurin:17-jre-alpine` (JRE-only, not JDK) for runtime, copy only the JAR. Final image: 200MB, no Maven, no source, just JRE + JAR.

**Scenario 2: A Go service in a 12MB image.**
`FROM golang:1.21 AS builder`, build static binary, then `FROM gcr.io/distroless/static-debian12` (no userspace except what binary needs), copy binary. 12MB image; nothing for attackers to use even if compromised; pulls in 1 second.

**Scenario 3: Different images for dev and prod from one Dockerfile.**
Single Dockerfile with `dev`, `builder`, and `runner` stages. CI uses `--target runner` for production; developers use `--target dev` for local with hot reload. No drift between environments; one source of truth for build process.

## Common mistakes to avoid

- **Single-stage builds** for compiled apps — image bloat.
- **Not naming stages** — index-based COPY is fragile.
- **Forgetting `--chown`** when copying from builder — wrong ownership.
- **Not pinning base image versions** — non-reproducible.
- **No `.dockerignore`** — builder still sees unneeded files.
- **Builder stage with secrets** — even discarded, can leak if not careful.

## Read more

- Docker docs: "Multi-stage builds."
- Distroless images: github.com/GoogleContainerTools/distroless.
- BuildKit documentation.

## Summary

- **Multi-stage = multiple FROMs**; only final stage ships.
- **Build stage** has full toolchain; **runtime stage** is minimal.
- **COPY --from=<stage>** moves artifacts.
- **Name stages** (`AS builder`) for readable references.
- **Targeted builds** support dev and prod from one Dockerfile.
- **Parallel stages** via BuildKit reduce wall-clock time.
- **Distroless** + static binaries = smallest possible images.
- **Universal pattern** for modern production images.

Next: base images and image size strategy.
