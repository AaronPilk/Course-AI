---
module: 5
position: 4
title: "The Docker mistakes that bite you"
objective: "Avoid the failure modes everyone hits once."
estimated_minutes: 7
---

# The Docker mistakes that bite you

## The simple version

The recurring Docker mistakes across teams:

1. **`:latest` tag in production** — non-reproducible.
2. **Running as root** — easy container escape on compromise.
3. **No `.dockerignore`** — bloated builds, leaked files.
4. **`COPY . .` before dependency install** — destroyed cache.
5. **Cleanup in separate RUN** — orphaned layers.
6. **Secrets in image layers** — extractable forever.
7. **No log rotation** — disk fills.
8. **No memory limits** — one container kills the host.
9. **Privileged for convenience** — removes isolation.
10. **Database data without a volume** — gone on restart.
11. **Docker socket mounted** — host root from container.
12. **Bloated images** — slow pulls, big attack surface.
13. **No health check** — broken containers undetected.
14. **Shell-form CMD** — broken signal handling.
15. **Floating base image tags** — non-reproducible builds.

Each is preventable. Knowing them in advance avoids painful learning.

## The technical version

### Tag discipline

`:latest` floats. Two builds against `:latest` can produce different images. Production deploys become non-reproducible.

Fix: specific version tags AND digest pinning for production references.

```dockerfile
FROM node:20.10.0-alpine3.19@sha256:abc123...
```

CI builds tag the image with the git SHA AND a semver tag. Production references the digest.

### Root and privileges

Containers running as root have an easier path to host compromise on exploit. Always add a non-root user and `USER` directive. Drop capabilities with `--cap-drop=ALL`; add only what's needed. Read-only root filesystem (`--read-only` with tmpfs for needed writable paths).

`--privileged` is rarely needed. Audit for it; remove where possible.

### Build context hygiene

Without `.dockerignore`, every file in the project goes to the build:

- Slows builds (sending GB to the daemon).
- Bloats images (any `COPY . .` includes everything).
- Risks leaks (committed `.env`, `.git` history, SSH keys, certs).

Standard `.dockerignore`:

```
.git
.env*
node_modules
*.log
.DS_Store
dist
build
coverage
.vscode
.idea
README.md
```

Adjust per project.

### Cache friendliness

Order instructions: stable first, frequent-change last. COPY lock files, install dependencies, then COPY source. Combine install + cleanup into one RUN. Avoid timestamps and ARGs near expensive instructions.

### Secrets handling

Never:

- COPY secrets into the image (then RM later — still in earlier layers).
- ENV with secret values (visible in `docker inspect`).
- ARG with secrets (visible in image metadata).

Use BuildKit `--secret` for build-time secrets:

```dockerfile
# syntax=docker/dockerfile:1.4
RUN --mount=type=secret,id=mysecret cat /run/secrets/mysecret
```

For runtime secrets: external secret stores (Secrets Manager, Vault) + injection at runtime.

### Log rotation

Default json-file driver doesn't rotate. Configure per container:

```
docker run --log-opt max-size=10m --log-opt max-file=3 ...
```

Or set defaults in `/etc/docker/daemon.json`. Without rotation, busy containers fill disks.

### Resource limits

Always set memory limits in production. Without them, one container can take down the host. JVM heap size should be ~70% of container memory (overhead). Don't autoscale on memory (sticky).

### Volumes for data

Database data, user uploads, anything that should survive container restart — volume-mount it. Without a volume, data lives in the writable layer and disappears on container removal.

### Socket exposure

`-v /var/run/docker.sock:/var/run/docker.sock` is effectively host root inside the container. Anything talking to the daemon can spawn privileged containers. Use a scoped API proxy if a container truly needs Docker management.

### Bloat

Single-stage builds with full SDKs in production are bloated. Multi-stage builds reduce dramatically:

- Go: 1 GB → 10-20 MB.
- Node: 1 GB → 150 MB.
- Java: 1.5 GB → 200 MB.

Distroless or scratch final stages where possible.

### Healthchecks

Without HEALTHCHECK (or Kubernetes probes), broken containers continue receiving traffic until clients complain. Define a `/health` endpoint that verifies real readiness; configure HEALTHCHECK or K8s readiness/liveness.

### Signal handling

Shell-form CMD wraps in `/bin/sh -c`; signals go to sh, not your app. Use exec form: `CMD ["binary", "arg"]`. Combined with `--init` for non-init-aware apps for PID 1 zombie reaping.

### Reproducibility

For supply-chain integrity:

- Pin base image to specific version (or digest).
- Use `npm ci` (lock-file-respecting) over `npm install`.
- Use `pip install -r requirements.txt` with hashes.
- Pin all dependencies.
- Sign images at build; verify at deploy.

### Operational hygiene

Periodic cleanup:

```
docker system prune -a              # remove all unused images, containers, networks
docker volume prune                  # remove dangling volumes
```

In production, lifecycle policies in the registry; node-level cleanup via image GC settings in containerd.

### Audit your images

For a quick health check on existing images:

```
docker history myimage          # layers, sizes, instructions
dive myimage                    # interactive layer browser
trivy image myimage             # vulnerability scan
docker inspect myimage          # full metadata
```

Most bloat and security issues surface within minutes via these.

### The full production-ready Dockerfile baseline

```dockerfile
# syntax=docker/dockerfile:1.4
FROM node:20.10.0-alpine3.19 AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

FROM node:20.10.0-alpine3.19 AS builder
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM node:20.10.0-alpine3.19 AS runner
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

Plus runtime:

```
docker run -d \
  --restart unless-stopped \
  --memory 512m \
  --read-only --tmpfs /tmp \
  --cap-drop=ALL \
  --security-opt no-new-privileges \
  --log-opt max-size=10m --log-opt max-file=3 \
  -p 8080:8080 \
  myapp:v1.2.3
```

This combines everything: multi-stage, pinned versions, non-root, hardened runtime, log rotation. The baseline for any production Docker workload.

## Summary

- Tags pinned; not `:latest`.
- Non-root + dropped capabilities + read-only FS.
- `.dockerignore` always.
- Order Dockerfile for cache friendliness.
- Cleanup in same RUN; secrets via BuildKit `--secret`.
- Log rotation + memory limits + volumes for data.
- Multi-stage builds for small production images.
- Healthchecks and signal handling for self-healing.
- Audit with history/dive/trivy.

That wraps Module 5 and the course. Docker is a deep enough surface to keep learning indefinitely; the disciplines in these five modules carry you through nearly every real-world situation.
