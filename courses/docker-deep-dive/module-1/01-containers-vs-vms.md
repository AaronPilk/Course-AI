---
module: 1
position: 1
title: "Containers vs VMs — the actual difference"
objective: "Understand what isolation containers provide."
estimated_minutes: 7
---

# Containers vs VMs — the actual difference

## The puzzle

People say containers are "lightweight VMs." That's a useful intuition for beginners and wrong if you take it literally. Containers and VMs achieve isolation through fundamentally different mechanisms with different security properties, performance characteristics, and operational behaviors. Understanding the difference matters when you're deciding what to run where, what level of isolation you actually need, and why some workloads belong in containers and others don't.

## The simple version

A **VM** runs a full guest operating system on virtualized hardware. The hypervisor (KVM, Hyper-V, ESXi) emulates CPU, memory, disk, network — each VM has its own kernel.

A **container** runs as a process (or processes) on the host OS, isolated from other processes by Linux kernel features (namespaces and cgroups). It shares the host kernel. There's no hardware virtualization.

Consequences:

- **Containers start in milliseconds**; VMs start in seconds-to-minutes.
- **Containers are denser** — hundreds or thousands per host vs dozens of VMs.
- **VMs have stronger isolation** — kernel exploits don't cross VM boundaries easily.
- **Containers share the host kernel** — exotic kernel features in the container aren't available unless the host kernel supports them.

For most server workloads, containers are sufficient and dramatically more efficient. For multi-tenant SaaS hosting untrusted code, VMs (or VM-grade isolation like Firecracker) are still preferred.

## The technical version

### Hardware virtualization

A VM hypervisor virtualizes hardware. The guest OS thinks it has real CPU, RAM, disk, network — but they're virtualized by the hypervisor. Each VM is a self-contained system with its own kernel, init system, drivers.

Properties:

- **Strong isolation**: a guest OS bug doesn't affect the host or other guests.
- **OS choice**: run any OS supported by the hypervisor on any host OS.
- **Boot time**: full OS boot, typically 10-60 seconds.
- **Memory overhead**: each VM allocates RAM for its kernel, plus all the duplicated OS resources.
- **Disk overhead**: each VM has its own filesystem image.

### Containerization

A container is just a process tree on the host, isolated by Linux kernel features:

- **Namespaces**: isolate what the process sees (filesystem, network, processes, users, IPC).
- **cgroups**: limit what the process consumes (CPU, memory, I/O).
- **Capabilities**: drop Linux privileges the process doesn't need.
- **Seccomp**: restrict syscalls.

The process runs directly on the host kernel. No virtualized hardware, no guest OS.

Properties:

- **Start time**: milliseconds (just process startup).
- **Memory overhead**: minimal beyond what the process itself uses.
- **Density**: hundreds to thousands of containers per host.
- **Isolation**: strong process-level isolation; not VM-grade.
- **Kernel**: shared with host.

### Where the line gets fuzzy

Modern technologies blur the boundary:

- **Firecracker microVMs**: AWS's lightweight VMs that boot in milliseconds. Used for Lambda and Fargate. VM-grade isolation with container-grade startup.
- **Kata Containers**: containers wrapped in microVMs for stronger isolation.
- **gVisor**: a user-space kernel that handles syscalls for containers, adding a layer between container and host kernel.

For most workloads, standard containers (sharing the host kernel) are sufficient. For multi-tenant code execution (serverless functions, sandboxed builds, untrusted code), microVM-based options add real security.

### Density and density math

A typical 8-core 32 GB host:

- **VMs**: 4-8 VMs comfortably (each needs at least 1 GB RAM and some CPU for its kernel).
- **Containers**: 50-200 containers easily, more for tiny processes.

This 10-50x density difference is why containers transformed infrastructure economics. The same physical hardware runs dramatically more workloads.

### Startup time

VM cold start: 10-60 seconds depending on OS and configuration.

Container cold start: 1-100 milliseconds. The Linux process starts, namespaces and cgroups attach, and it's running.

For workloads where startup time matters (autoscaling under bursty load, serverless functions, fast deploys), containers win clearly.

### Isolation strength

VM isolation is generally considered stronger:

- Each VM has its own kernel; a kernel bug in one doesn't affect others.
- Hypervisor exploits are rare and high-profile (Spectre/Meltdown class).
- Decades of hardening for multi-tenant cloud workloads.

Container isolation is process-level:

- All containers share the host kernel.
- A kernel exploit from a privileged container can affect the host and other containers.
- Hardening relies on dropping capabilities, seccomp, AppArmor/SELinux, non-root users.

For trusted workloads (your own services), container isolation is fine. For untrusted code (multi-tenant SaaS where customers bring their own code), use VMs or microVMs.

### Performance

Containers have nearly-native performance:

- No hardware virtualization overhead.
- Direct host kernel syscalls.
- Direct device access (subject to namespaces).

VMs have some overhead from hardware virtualization, though modern hypervisors are very efficient (~5-10% overhead for CPU/network).

For most workloads, both options perform fine. For latency-critical or I/O-heavy workloads, containers' direct kernel access has measurable benefits.

### OS support

Containers on Linux: native, primary platform.

Containers on macOS / Windows: typically run in a Linux VM under the hood (Docker Desktop's VM). The "container" you launch is in that VM. Native Windows containers exist but are less common.

For cross-platform development, containers work everywhere but the underlying mechanism varies.

### What this means in practice

When to use containers:

- Your own server-side workloads.
- Microservices.
- CI/CD pipelines.
- Development environments (Dev Containers, Docker Compose).
- Batch processing.
- Anywhere you'd want fast startup + high density.

When to use VMs (or microVMs):

- Multi-tenant code execution with untrusted code.
- Strict isolation regulatory requirements.
- Different OSes on shared hardware.
- Legacy software that requires a full OS.

Most modern infrastructure uses both: containers for the application tier, VMs (often K8s nodes) underneath. Containers running inside VMs on shared hardware is the standard cloud pattern.

### Common misconceptions

**"Containers are secure because they're isolated"**: containers isolate processes; they don't isolate kernels. A privilege escalation in the host kernel affects all containers.

**"Containers are lightweight VMs"**: useful initial intuition, technically wrong. They're isolated processes, not virtualized hardware.

**"Docker is the runtime"**: Docker is a higher-level tool. The actual runtime is containerd + runc (we'll cover this).

**"Containers solve OS dependency hell"**: they make it explicit and portable, not nonexistent. The Dockerfile is still doing OS-level setup; just in a reproducible way.

### Why this matters

Knowing what containers actually are explains:

- Why container escape vulnerabilities exist and are taken seriously.
- Why running containers as root is dangerous (privilege escalation can affect host).
- Why some kernel features need host kernel support.
- Why containers can be 100x more dense than VMs.
- Why the choice between containers and VMs isn't always obvious.

## Three real-world scenarios

**Scenario 1: A SaaS company hosting customer code.**
Customers upload code to run on the platform. Trust boundary matters. Plain Docker containers wouldn't be enough — a malicious customer could potentially exploit kernel bugs. Solution: AWS Lambda (Firecracker microVMs), or gVisor-wrapped containers. VM-grade isolation with container-grade ergonomics.

**Scenario 2: A microservices migration.**
Team running 10 services as VMs (~80 GB total memory). Migrated to containers on shared hosts: same 10 services use ~16 GB total. 5x density improvement, faster deploys, same functionality. Standard pattern; works because the services are trusted (own code).

**Scenario 3: A developer's local environment.**
Developer needs PostgreSQL, Redis, the app, and a Mongo instance for dev. VMs would be slow to start, heavy on the laptop. Docker Compose spins all four up in seconds. Tear down and restart instantly. Standard developer pattern; containers' speed and density transform the workflow.

## Common mistakes to avoid

- **Treating containers as VM-equivalent for security**: weaker isolation; design accordingly.
- **Running untrusted code in plain Docker**: use microVMs (Firecracker, Kata) or gVisor instead.
- **Forgetting the shared kernel**: kernel-level vulnerabilities affect all containers.
- **Comparing only startup time**: VMs offer stronger isolation that may be worth the slowness.
- **Choosing one over the other dogmatically**: most modern stacks use both.

## Read more

- "What's a Container, Anyway?" (Docker docs).
- Firecracker documentation (AWS).
- *Linux Kernel Development* by Robert Love — namespaces and cgroups chapters.
- gVisor documentation.

## Summary

- **VMs virtualize hardware**; containers isolate processes via Linux kernel features.
- **Containers share the host kernel**; VMs run their own.
- **Containers**: faster startup (ms vs seconds), higher density (10-50x), weaker isolation.
- **VMs**: stronger isolation, OS choice, slower startup, lower density.
- **Modern microVMs** (Firecracker, Kata) blur the line for serverless and multi-tenant.
- **Containers for trusted workloads; VMs or microVMs for untrusted**.
- **Most stacks use both**: containers in VMs on shared hardware.

Next: namespaces and cgroups in detail.
