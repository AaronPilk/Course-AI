---
module: 1
position: 2
title: "Namespaces and cgroups — the kernel features under containers"
objective: "Know what gives containers their boundaries."
estimated_minutes: 7
---

# Namespaces and cgroups — the kernel features under containers

## The puzzle

Containers aren't magic. They're regular Linux processes with kernel features applied to them that make each one *think* it's alone on the machine. Two kernel features do the work: namespaces (what the process sees) and cgroups (what the process can consume). Understanding these directly demystifies a lot of container behavior.

## The simple version

Two complementary kernel features:

1. **Namespaces** isolate what a process sees:
   - **mount**: own filesystem view.
   - **pid**: own process tree (PID 1 is your init).
   - **net**: own network interfaces, routing table.
   - **uts**: own hostname.
   - **ipc**: own message queues / semaphores.
   - **user**: own UID/GID mappings.
   - **cgroup**: own cgroup hierarchy view.
   - **time** (newer): own clock.

2. **cgroups** (control groups) limit what a process can consume:
   - CPU shares and quotas.
   - Memory limits.
   - I/O bandwidth.
   - Network bandwidth (with extra tooling).
   - PID limits (max processes).

Run a process with the right namespaces + cgroups + dropped capabilities + seccomp restrictions, and it's a "container." That's the whole trick.

## The technical version

### Namespaces in detail

When you run a container, the runtime calls `unshare()` (or clone with namespace flags) to create new namespaces for the process. The new process and its children live in those namespaces; the host (and other containers) don't see them.

**Mount namespace**: the process sees a different filesystem root. Docker mounts the container image's filesystem here. The host's `/etc/passwd` is invisible inside the container's mount namespace; the container's `/etc/passwd` (from its image) is what processes see.

**PID namespace**: processes inside get PIDs starting from 1. The container's init process (PID 1) is the process you started. Outside the container, that process has its own host PID — different number. `ps` inside shows only container processes; outside shows everything.

**Network namespace**: own loopback, own network interfaces, own routing. Containers don't see each other's network unless deliberately connected (via bridges, overlays).

**User namespace** (optional, modern): map UIDs/GIDs. Root inside the container can map to a non-root user on the host — significantly safer.

You can experiment without Docker:

```bash
sudo unshare --pid --fork --mount-proc bash
ps aux  # only sees processes started in this namespace
```

That's a basic "container" — process isolation via namespaces.

### cgroups in detail

cgroups (specifically cgroups v2 in modern Linux) limit resource consumption. A cgroup is a kernel structure that applies to a set of processes:

- **CPU**: shares (relative weight) and quota (max CPU time per period).
- **Memory**: max RSS (resident set size); on overflow, the OOM killer fires.
- **I/O**: read/write bandwidth and IOPS limits.
- **PIDs**: max number of processes.

When Docker creates a container, it places its processes into a cgroup with the configured limits. The kernel enforces them.

`docker run --memory 256m --cpus 0.5 ...` sets memory and CPU limits via cgroups.

You can see cgroups directly: `/sys/fs/cgroup/...` in Linux. Each container has its own cgroup; resource accounting and limits live there.

### Capabilities

Linux capabilities split root's privileges into ~40 discrete grants:

- `CAP_NET_BIND_SERVICE`: bind to ports < 1024.
- `CAP_SYS_ADMIN`: many privileged operations.
- `CAP_SYS_TIME`: set system clock.
- `CAP_NET_ADMIN`: configure network.

By default, Docker containers run with a restricted set of capabilities — much less than root on the host. You can drop more (`--cap-drop=ALL`) or add specific ones (`--cap-add=NET_ADMIN`).

Dropping capabilities is one of the strongest container hardening techniques.

### Seccomp

Seccomp filters which syscalls a process can make. Docker's default profile blocks ~50 syscalls that are rarely needed and known to enable container escapes (e.g., `ptrace`, `mount`).

Custom seccomp profiles can be applied per container. For high-security workloads, use a tighter profile.

### AppArmor and SELinux

Mandatory access control systems that add another layer. AppArmor (Ubuntu) and SELinux (RHEL) restrict what processes can do beyond standard Linux permissions.

Docker integrates with both. Default profiles are sane; custom profiles for sensitive workloads.

### How Docker uses all this

When you `docker run`:

1. Docker (via containerd via runc) creates new namespaces for the process.
2. Mounts the container image's filesystem as the new root.
3. Sets up network interfaces inside the network namespace.
4. Places the process in a cgroup with configured limits.
5. Drops capabilities, applies seccomp profile.
6. Starts the entrypoint process as PID 1 inside the namespace.

That's the "container." All Linux kernel primitives — Docker is orchestrating them.

### Container escape vulnerabilities

When you hear about container escapes, they're usually:

- Kernel exploits that work around namespace isolation.
- Misuse of capabilities (container with too many).
- Mount escapes via shared volumes.
- Process privilege escalation when running as root.

Hardening: non-root inside container, dropped capabilities, restrictive seccomp, no privileged flag, no mounted Docker socket. Combined: hard to escape.

### Privileged containers

`docker run --privileged` removes most of the isolation. The container gets:

- All capabilities.
- Permissive seccomp.
- No AppArmor / SELinux restrictions.
- Can mount filesystems.
- Can access devices.

Use only when truly necessary (e.g., a container running Docker itself, or accessing hardware). Avoid in production.

### Why containers feel "isolated" but aren't VM-level isolated

Namespaces give each container its own view of the world. Cgroups limit resource consumption. Combined, they look very VM-like.

But the kernel is shared. A kernel-level exploit affects everything. Hypervisor-level isolation (VMs, microVMs) is genuinely stronger because the kernel boundary is the hypervisor, not the host kernel.

For trusted workloads, container isolation is fine. For untrusted code, layer additional isolation (gVisor, Kata, Firecracker).

### Linux distros and containers

Containers run on Linux. The container's image is an OS-like filesystem (Alpine, Ubuntu, Debian image layers). The container's processes use the host kernel but with the container image's libraries.

This is why container images can be small: they don't include a kernel. They include just enough OS userspace to run the application.

For Windows containers on Windows hosts, similar idea with Windows kernel features. For containers on macOS/Windows hosts, a Linux VM runs underneath.

### Trying namespaces directly

You can play with namespaces without Docker:

```bash
sudo unshare --pid --net --mount --fork --mount-proc bash
hostname  # but this is shared (uts namespace not used)
ps aux    # shows only namespace processes
ip addr   # own network interfaces
```

Add cgroup limits:

```bash
mkdir /sys/fs/cgroup/test
echo 100000 > /sys/fs/cgroup/test/memory.max  # 100KB? too low; use bytes
echo $$ > /sys/fs/cgroup/test/cgroup.procs
```

Now this shell is in a cgroup with limits. Docker does this and more.

### What this means for security

Knowing the mechanics explains the hardening checklist:

- **Run as non-root**: kernel exploits and capability abuse easier with root.
- **Drop capabilities**: reduce attack surface.
- **Restrictive seccomp**: limit syscalls.
- **Don't run privileged**: keeps namespace isolation in place.
- **Read-only root filesystem**: limit what attacker can modify.
- **Minimal base image**: fewer tools for attackers.

Each addresses a specific mechanism that namespaces alone don't cover.

## Three real-world scenarios

**Scenario 1: A container can write to the host filesystem unexpectedly.**
Investigation: it was started with `--privileged` and a bind-mounted host directory. Privileged + bind mount = no namespace isolation for that path. Fix: drop privileged; mount only what's actually needed read-only.

**Scenario 2: A container runs out of memory but the host isn't full.**
The container's cgroup memory limit was 256MB. App tried to use 512MB. The OOM killer (in the container's cgroup) killed the container's process. From inside the container, looks like a normal OOM. From outside, the host is fine. Fix: raise the limit or fix the app's memory usage.

**Scenario 3: A "container escape" via Docker socket mount.**
A container was mounted with `/var/run/docker.sock` from the host. Code running in the container could create new containers, including privileged ones. Trivial escape. Fix: never mount the Docker socket into a container unless you know exactly why. If a container truly needs to manage Docker, give it a scoped API instead.

## Common mistakes to avoid

- **`--privileged` for convenience** — removes most isolation.
- **Mounted Docker socket** — full host access from container.
- **Running as root in container** — container escape easier.
- **Excessive capabilities** — same.
- **No resource limits** — one container exhausts host.
- **Believing "container = isolated" without hardening**.

## Read more

- "Linux Containers from Scratch" tutorials.
- *Container Security* by Liz Rice.
- Linux man pages: `namespaces(7)`, `cgroups(7)`, `capabilities(7)`.

## Summary

- **Namespaces** isolate what a process sees (mount, pid, net, uts, ipc, user, cgroup).
- **cgroups** limit what a process consumes (CPU, memory, I/O).
- **Capabilities** split root privileges; drop the ones you don't need.
- **Seccomp** filters syscalls.
- **AppArmor/SELinux** add MAC layer.
- **Docker orchestrates** these primitives; nothing magical underneath.
- **Container escape vulnerabilities** target the shared kernel; hardening reduces attack surface.

Next: the union filesystem and layered images.
