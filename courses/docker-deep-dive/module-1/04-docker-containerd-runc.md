---
module: 1
position: 4
title: "Docker, containerd, runc, OCI — who does what"
objective: "Map the runtime architecture."
estimated_minutes: 7
---

# Docker, containerd, runc, OCI — who does what

## The puzzle

You type `docker run`. Something happens; a container starts. But Docker the company doesn't actually run your container — a chain of components does. Containerd, runc, the kernel. Knowing what each piece does explains a lot: why Kubernetes can run "without Docker," why container images work across runtimes, and why most production setups don't actually use Docker the daemon.

## The simple version

The container runtime stack, top to bottom:

1. **Docker CLI** (`docker` command): user interface.
2. **Docker daemon (dockerd)**: orchestrates higher-level operations.
3. **containerd**: container lifecycle management (CRI-compatible).
4. **runc**: low-level OCI runtime that creates the actual container.
5. **Linux kernel**: namespaces, cgroups, etc. — the actual isolation.

The **OCI (Open Container Initiative)** defines standards: image format (OCI Image Spec) and runtime behavior (OCI Runtime Spec). Anything implementing these standards interoperates.

In Kubernetes since 1.24+, Docker isn't required — `containerd` (or CRI-O) directly handles containers. The Docker daemon isn't part of the production stack on most modern K8s clusters.

## The technical version

### The Open Container Initiative

OCI is an industry effort to standardize containers. Two key specs:

- **OCI Image Spec**: how container images are structured (layers, manifest, config). All major image tooling produces OCI-compliant images.
- **OCI Runtime Spec**: how a runtime should create a container from a filesystem and configuration JSON.

Because of OCI, you can build an image with Docker and run it with containerd or CRI-O or Podman. Same image, multiple runtimes.

### Docker CLI and daemon

`docker` is the CLI you type. It talks to the Docker daemon (`dockerd`) via a Unix socket (`/var/run/docker.sock`) or TCP.

The daemon:

- Manages images locally.
- Coordinates with containerd to run containers.
- Implements Docker-specific features (Compose, Swarm, BuildKit integration).
- Exposes the Docker API.

The daemon is the historical "Docker" — Docker the company built this. For development workstations, it's the standard.

### containerd

containerd is a daemon that does the actual container lifecycle work. It was extracted from Docker and donated to the CNCF.

It:

- Pulls and stores OCI images.
- Creates container bundles from images.
- Calls runc to start containers.
- Manages container lifecycle (start, stop, kill).
- Exposes a gRPC API.

containerd is what Kubernetes talks to (via the CRI). For production K8s, containerd typically runs directly without dockerd in the picture.

### runc

runc is the low-level OCI runtime. It takes:

- A container bundle (a filesystem + a config.json describing what to run).
- Calls Linux kernel APIs to set up namespaces, cgroups, capabilities, seccomp.
- Executes the container's entrypoint inside.

runc is a small standalone binary (~10MB). It's what actually creates the container. Everything above it is orchestration.

Alternatives to runc exist:

- **crun**: lighter, faster C implementation.
- **gVisor (runsc)**: user-space kernel for additional isolation.
- **Kata (kata-runtime)**: wraps containers in microVMs.

You can configure containerd to use any OCI-compliant runtime, including gVisor or Kata for specific workloads.

### How `docker run` actually works

When you `docker run image:tag command`:

1. `docker` CLI sends a request to dockerd.
2. dockerd checks if the image is local; pulls if not (talking to containerd's content store).
3. dockerd creates a container record via containerd's API.
4. containerd unpacks image layers into a directory and creates a config.json.
5. containerd asks runc to create the container with that bundle.
6. runc sets up namespaces, cgroups, etc., and execs the entrypoint.
7. The process is running. containerd watches its lifecycle.

dockerd is the orchestrator; containerd does the heavy lifting; runc is the actual runtime; the kernel makes isolation real.

### Kubernetes and the Docker shim

Originally, Kubernetes had a "dockershim" — code that let kubelets talk to Docker. As CRI (Container Runtime Interface) matured, dockershim became unnecessary; Kubernetes 1.24 removed it.

Modern K8s uses CRI directly: kubelet → CRI → containerd (or CRI-O) → runc. No Docker daemon in the picture.

Production K8s clusters typically don't run `dockerd`. Developers run Docker locally to build images; clusters run containerd to run them. Same OCI images, different runtimes.

### CRI-O

CRI-O is a Kubernetes-specific container runtime — implements CRI directly without containerd's general-purpose features. Lighter, more focused.

Red Hat / OpenShift uses CRI-O by default. Other K8s distributions use containerd. Both work; choice depends on packaging and preferences.

### Podman and alternatives

**Podman**: daemon-less Docker alternative. CLI is largely compatible (`alias docker=podman` works for most commands). Pods of containers can be defined. Runs containers via runc directly.

**nerdctl**: containerd's user-facing CLI. Like `docker` but talks to containerd directly.

**BuildKit**: image-building engine, can run independently of Docker.

For Linux servers, Podman is increasingly common — no privileged daemon required. For development workstations, Docker Desktop is still dominant.

### What it means for you

For day-to-day development: use Docker (or Docker Desktop on macOS/Windows). The CLI ergonomics are mature.

For production:

- Build images with Docker (or BuildKit).
- Run them on Kubernetes with containerd or CRI-O.
- The same OCI image works everywhere.

For non-K8s production (Linux servers running containers directly): consider Podman or systemd + containerd. The Docker daemon doesn't need to be your runtime.

### Image format details

An OCI image is:

- **Manifest** (JSON): lists layers, config, metadata.
- **Config** (JSON): environment variables, entrypoint, exposed ports.
- **Layers** (tarballs): the filesystem changes.

All content-addressed. The manifest hash is the image's digest.

Registries store these blobs. Pulling an image fetches the manifest, then layers not already local. Pushing is the inverse.

### Image distribution

Registries (Docker Hub, ECR, GHCR, Harbor, etc.) speak the OCI Distribution Spec. The same client can push/pull from any of them.

A push:

1. Hash each layer.
2. Check which the registry already has.
3. Upload missing layers.
4. Upload the manifest referencing them.

This is why pushes are usually fast after the first one — only new layers transfer.

### Performance characteristics

- **Image pull**: depends on layer sizes; can be parallel.
- **Container start**: milliseconds once image is local.
- **First-run cold start** (image not local): pull + start, can be seconds.

For production: ensure images are pre-pulled to Nodes (Kubernetes does this on Pod scheduling); use registry close to the cluster; use image pull secrets correctly.

### When you might encounter the lower layers

For most container operations, you stay at the docker (or kubectl) layer. You hit lower layers when:

- Debugging container lifecycle issues (containerd logs).
- Implementing a custom runtime.
- Working with image content (BuildKit, alternative builders).
- Performance tuning (which runc variant, image preload strategies).

The abstraction holds for most users; knowing the layers exists matters when it doesn't.

### The shift

The container ecosystem has matured significantly:

- Early: Docker was the runtime; everything went through dockerd.
- Middle: containerd was extracted; Docker became a higher-level wrapper.
- Now: containerd is the dominant production runtime; Docker is one client among several; the OCI standards ensure interoperability.

For new infrastructure: don't assume "container runtime" means "Docker daemon." It might mean containerd directly. The OCI image format is the durable contract.

## Three real-world scenarios

**Scenario 1: K8s 1.24 upgrade and "Docker support" removal.**
Team's K8s nodes were running Docker; upgrade to 1.24 deprecated this. Migration: switch nodes to containerd directly. No changes to images (still OCI); no changes to kubectl interactions. Smooth transition — containerd had been doing the work all along; dockerd was just an extra layer.

**Scenario 2: A Podman migration on production servers.**
Linux servers running containers via Docker. Security team wanted to eliminate the privileged daemon. Switched to Podman: containers run as the invoking user; no daemon to compromise. CLI changes were minimal (most `docker` commands work as `podman`). Improved security posture; same OCI images; production unchanged from the application's perspective.

**Scenario 3: Using gVisor for multi-tenant workloads.**
SaaS platform running customer code wanted stronger isolation than plain containers. Configured containerd to use gVisor (runsc) for specific workloads. Same OCI images; same K8s operations; but gVisor's user-space kernel handles syscalls, providing VM-grade isolation per container. Small performance penalty; significant security improvement.

## Common mistakes to avoid

- **Equating Docker with the container runtime** — Docker is one of many.
- **Assuming K8s requires Docker** — it hasn't since 1.24.
- **Privileged Docker daemon as production runtime** — Podman or containerd often better.
- **Not knowing the runtime your production uses** — surprises during upgrades.
- **Treating OCI images as Docker-specific** — they work across runtimes.

## Read more

- OCI Image Spec and Runtime Spec.
- containerd documentation.
- runc documentation.
- Podman documentation.

## Summary

- **Docker CLI → dockerd → containerd → runc → kernel** is the classic stack.
- **OCI defines image and runtime standards**; ensures interoperability.
- **containerd** does the lifecycle work; runc is the actual runtime.
- **K8s uses containerd (or CRI-O) directly** since 1.24 — no Docker daemon.
- **Alternative runtimes** (gVisor, Kata) for extra isolation.
- **Podman** as a daemon-less Docker alternative.
- **OCI images work everywhere** — Docker, containerd, Podman, K8s all interoperate.
- **Knowing the layers** helps when abstractions leak.

That wraps Module 1. Next: building images well.
