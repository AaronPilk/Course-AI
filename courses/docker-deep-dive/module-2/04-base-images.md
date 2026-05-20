---
module: 2
position: 4
title: "Base images and image size"
objective: "Pick base images deliberately."
estimated_minutes: 7
---

# Base images and image size

## The puzzle

The first line of your Dockerfile — `FROM something` — has more impact on your final image than almost any other decision. Choosing `node:20` vs `node:20-alpine` vs `node:20-slim` vs `distroless` produces dramatically different images in size, security posture, and operational behavior. The choice deserves thought; it usually gets none.

## The simple version

Common base image families, smallest to largest:

1. **scratch** (0 bytes): empty image. Only for fully static binaries.
2. **distroless**: language runtime + minimal libs. No shell, no package manager.
3. **alpine**: tiny Linux distro using musl libc and BusyBox.
4. **slim variants**: Debian-based, stripped down.
5. **full distro**: Debian, Ubuntu, Rocky — full userspace.

For most languages, multi-stage with a slim or distroless final stage hits the sweet spot of size + compatibility. Pick deliberately based on what the app actually needs.

## The technical version

### Scratch

The empty base. Nothing in it.

```dockerfile
FROM scratch
COPY server /
ENTRYPOINT ["/server"]
```

Use when you have a statically-linked binary that needs nothing else. Common for Go, Rust, C++. The image is just your binary.

Properties:

- Tiny (your binary's size).
- No shell, no DNS resolver, no anything.
- Can't `docker exec` shell into it (no shell exists).
- TLS may need additional cert files.

For Go: build with `CGO_ENABLED=0` to get a pure static binary that scratch can run.

### Distroless

Google's distroless images contain just enough to run a specific language: the language runtime + minimal libs + CA certs. No shell, no package manager, no busybox.

Examples:

- `gcr.io/distroless/static-debian12`: for static binaries (with TLS support).
- `gcr.io/distroless/base-debian12`: glibc + a few libs.
- `gcr.io/distroless/nodejs20-debian12`: Node.js runtime only.
- `gcr.io/distroless/python3-debian12`: Python runtime only.
- `gcr.io/distroless/java21-debian12`: JRE only.

Properties:

- Small (10-50 MB depending on language).
- Very secure — no tools for attackers if they get code execution.
- No shell means harder to debug; use `:debug` tag variants which include busybox.
- Maintained by Google with security updates.

Distroless is the modern default for production images. Combined with multi-stage builds, you get a small, secure base.

### Alpine

Alpine is a tiny Linux distribution: ~5 MB base, uses musl libc instead of glibc, includes busybox utilities.

```dockerfile
FROM alpine:3.19
RUN apk add --no-cache curl
```

Properties:

- Small base (~5 MB).
- Includes shell (BusyBox sh) and package manager (apk).
- Uses musl libc — can cause issues with binaries compiled against glibc.
- DNS resolution differs from glibc (musl is more strict about /etc/resolv.conf).
- Most language base images have alpine variants: `node:20-alpine`, `python:3.12-alpine`, etc.

Alpine is widely used as a small-but-usable base. Watch for musl-vs-glibc compatibility issues with native dependencies.

### Slim variants

Debian-based, with non-essential packages removed:

```dockerfile
FROM python:3.12-slim
FROM debian:12-slim
```

Properties:

- Larger than alpine (~80 MB base) but compatible (uses glibc).
- Apt package manager available.
- Good middle ground for apps with glibc-compiled dependencies.

For Python apps with native dependencies (numpy, pandas, scientific Python), slim variants avoid musl headaches.

### Full distros

`debian:12`, `ubuntu:22.04`, etc. Hundreds of MB. Include everything a normal Linux server has.

Rarely needed for production. Useful for dev images that need lots of tools, or for migrations from VM-based deployments.

### Language-specific base images

Most languages have official Docker Hub images:

- `node:20.10.0-alpine`, `node:20.10.0-slim`, `node:20.10.0`.
- `python:3.12.1-alpine`, `python:3.12.1-slim`, `python:3.12.1`.
- `golang:1.21.5-alpine`, `golang:1.21.5`.
- `eclipse-temurin:17-jre-alpine` (for Java; jre vs jdk matters).
- `ruby:3.3-alpine`, `php:8.3-alpine`.

These have the language runtime pre-installed. The `-slim` and `-alpine` variants are smaller; the unsuffixed is the full version (usually Debian-based).

### Picking by use case

**Statically-compiled binary (Go, Rust, C++)**: scratch or distroless/static.

**Compiled language with runtime (Java, .NET)**: distroless or jre/jdk-alpine.

**Interpreted language with simple dependencies (small Python/Node app)**: alpine or distroless.

**Interpreted language with native dependencies (Python with NumPy/Pandas, Node with native modules)**: slim variant; alpine can cause compilation issues.

**Database engines, complex servers**: official images (postgres, redis, nginx, etc.) — pre-tuned for the workload.

### Reproducibility — pin the tag

`FROM node:20` is a floating tag — what `:20` points to can change as new Node 20.x.y versions release. Builds aren't reproducible.

Better:

```dockerfile
FROM node:20.10.0-alpine3.19
```

Specific Node version, specific Alpine version. Builds the same image today and tomorrow.

For maximum reproducibility, pin to a digest:

```dockerfile
FROM node:20.10.0-alpine3.19@sha256:abc123...
```

The digest is content-addressed; absolutely immutable. Tools like Dependabot or Renovate can update these automatically.

### Image size impact

A rough comparison for a Node app:

| Base | Size | Notes |
|------|------|-------|
| `node:20` | 1.1 GB | Debian + Node + npm + lots of tools |
| `node:20-slim` | 250 MB | Debian-based, stripped |
| `node:20-alpine` | 180 MB | Alpine + Node |
| `gcr.io/distroless/nodejs20-debian12` | 120 MB | Just Node runtime |

For a Go binary:

| Base | Size | Notes |
|------|------|-------|
| `golang:1.21` | 1.0 GB | Full Go toolchain |
| `alpine:3.19` | 15 MB | Binary + minimal Alpine |
| `gcr.io/distroless/static-debian12` | 5 MB | Binary + CA certs |
| `scratch` | 3 MB | Just the binary |

Image size affects:

- Pull time during deploys.
- Storage cost in registries (especially at high image count or version retention).
- Cold start time in serverless/K8s.
- Network costs for cross-region pulls.
- Attack surface (more software = more potential vulnerabilities).

### Maintenance and updates

Base images need updates:

- **CVEs**: security patches in base images get released regularly.
- **Language updates**: minor and patch versions add fixes.

Rebuild images periodically to pick up base updates. Tools:

- **Dependabot / Renovate**: open PRs when newer base images are available.
- **Trivy in CI**: scan images for known vulnerabilities.
- **Container registries**: AWS ECR scan, GitHub container scanning, etc.

For production: rebuild and redeploy at least weekly to capture security updates. For specific CVEs, rebuild immediately.

### Operating system choice

Different distros have different security posture, update frequency, and ecosystem:

- **Debian**: stable, long-supported. Common default.
- **Ubuntu**: Debian-based; newer packages.
- **Alpine**: rolling release; musl-based.
- **Distroless**: Debian-based but minimal.
- **Rocky / Alma**: RHEL-compatible.

For most workloads, Debian-based (slim or distroless) is the safe choice. Alpine for smaller images where musl is acceptable.

### When to roll your own base

For most cases, use official or distroless images. Roll your own only when:

- Compliance requires specific OS configuration.
- You have hardened images mandated by your security team.
- Specific patches not yet in upstream.

Maintaining a custom base image is significant ongoing work. Avoid unless necessary.

### Multi-architecture support

For ARM and x86 (common in 2026 with M-series Macs and Graviton):

```bash
docker buildx build --platform linux/amd64,linux/arm64 ...
```

Most official base images support both. Distroless supports them. Some specialty images don't.

Test on the architecture you'll deploy to. ARM builds run via QEMU emulation on x86 builders; can be slow but works.

### The "scratch" gotcha

`FROM scratch` truly has nothing. Notable absences:

- No `/etc/passwd` — set USER as a UID directly.
- No CA certificates — if your app makes HTTPS calls, copy in `/etc/ssl/certs/ca-certificates.crt`.
- No timezone data — copy in `/usr/share/zoneinfo` if needed.
- No `/tmp` — create if your app needs it.

`gcr.io/distroless/static` is scratch + CA certs + minimal other essentials. Usually a safer default.

### A typical decision

For a new Go web service in 2026:

```dockerfile
FROM golang:1.21.5-alpine3.19 AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /out/server /server
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]
```

- Specific version tags (reproducible).
- Multi-stage (build separate from runtime).
- Static binary (`CGO_ENABLED=0`).
- Distroless final image (smallest secure).
- Non-root user.
- Strip debug info (`-s -w`) for smaller binary.

This is a modern Go production Dockerfile. The same pattern applies to other languages with adjustments.

## Three real-world scenarios

**Scenario 1: Python app with NumPy on Alpine.**
Built on `python:3.12-alpine` — saved 60% vs full Python image. But pip install of NumPy compiled from source for ~20 minutes per build because of musl-incompatible wheels. Switched to `python:3.12-slim` (Debian-based, glibc). Build times dropped to seconds (pip uses pre-built wheels); image size slightly larger but acceptable. Right base for the workload.

**Scenario 2: A 1.1 GB Java image.**
`FROM openjdk:17` shipped full JDK + Maven + tools. Multi-stage: builder uses Maven image; runtime uses `eclipse-temurin:17-jre-alpine` (just the JRE). Final image: 200 MB. 5x reduction; no functional change.

**Scenario 3: An organization standardizing base images.**
Security team mandated specific base images with internal CVE patches. Mirrored official distroless images to internal registry; added a Renovate config to pull updates weekly; all teams `FROM internal-registry/distroless/static-debian12:latest`. Centralized base image management with team-level autonomy on top.

## Common mistakes to avoid

- **Unpinned base tags** (`FROM node`) — non-reproducible.
- **Alpine for native-dep workloads** — musl issues.
- **Full distro when slim or distroless would work** — bloated.
- **Scratch without CA certs** for HTTPS-calling apps.
- **Hand-rolled base images** when official ones suffice.
- **Not rebuilding regularly** for security updates.
- **Wrong language variant** (JDK when JRE suffices).

## Read more

- Distroless images: github.com/GoogleContainerTools/distroless.
- Docker Hub official images library.
- "Choosing a base image" guides from Snyk, Aqua, etc.

## Summary

- **Base image choice dramatically affects size, security, compatibility.**
- **scratch / distroless**: smallest, most secure; for static binaries or specific runtimes.
- **alpine**: small, with shell; musl-based (compatibility caveats).
- **slim**: Debian-based, stripped; good middle ground.
- **Full distros**: rarely needed for production.
- **Pin versions or digests** for reproducibility.
- **Update regularly** for security patches.
- **Match base to workload**: native deps → glibc; static binary → scratch/distroless.

That wraps Module 2. Next: the runtime — what `docker run` does.
