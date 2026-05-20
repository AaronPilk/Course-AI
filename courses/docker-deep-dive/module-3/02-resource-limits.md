---
module: 3
position: 2
title: "Container resource limits and behavior"
objective: "Apply CPU, memory, and other constraints."
estimated_minutes: 6
---

# Container resource limits and behavior

## The simple version

By default, a container can use unlimited host resources. In production, set limits:

- **`--memory 512m`**: hard memory cap. OOM kill if exceeded.
- **`--cpus 1.5`**: CPU quota (1.5 cores' worth of time per period).
- **`--memory-reservation`**: soft limit (kernel pressure when host is contended).
- **`--pids-limit`**: max processes.
- **`--ulimit`**: file descriptors, etc.
- **`--blkio-weight`**: I/O priority.

All enforced via cgroups (Linux kernel feature). No container, no matter how buggy, consumes more than its limits — protecting the host and other containers from noisy neighbors.

## The technical version

### Memory

`--memory 512m` sets a hard memory limit. When the container's memory usage exceeds it, the kernel OOM killer fires inside the container's cgroup, killing a process (usually PID 1). Container exits with code 137 (128 + SIGKILL=9). Logs show "OOMKilled" in `docker inspect`.

`--memory-swap` controls swap usage. By default, swap = memory (effectively no swap). Set higher to allow swap; set equal to disable swap.

For most production workloads: set memory limit; don't allow swap; monitor for OOM kills.

### CPU

Two CPU models:

- **`--cpus N`** (modern): fractional CPUs. `--cpus 1.5` = 150% of one core's time per scheduling period.
- **`--cpu-shares N`** (legacy): relative weighting between containers. Default 1024.
- **`--cpuset-cpus 0,1`**: pin to specific physical cores.

CPU limits are "soft" in that they don't crash the container — they just throttle. A container that wants more CPU than its quota allows just runs slower.

For latency-sensitive workloads: set CPU requests appropriately; consider `--cpuset` to avoid context switches.

### Pids and fds

`--pids-limit 100`: cap process count. Stops fork bombs from taking out the host.

`--ulimit nofile=65536:65536`: file descriptor limit. Default depends on host config; bump for high-concurrency network apps.

### Block I/O

`--device-read-bps`, `--device-write-bps`: bandwidth caps on specific devices.

`--blkio-weight 500`: relative I/O priority (10-1000, default 500).

Rarely used in single-host Docker; orchestrators have richer I/O QoS.

### Default limits

Without flags, containers inherit host limits. This means one container can starve the others or crash the host. Always set memory limits in production.

### Inspecting limits

```
docker inspect --format '{{.HostConfig.Memory}}' container
docker stats             # live resource usage
docker top container     # processes inside
```

For deeper inspection: `/sys/fs/cgroup/...` shows the cgroup's actual configuration and usage.

### Memory math gotchas

Container memory limits include all containers' processes (not just the main one) and various overhead. JVM heap should be ~70% of container memory limit (the JVM has off-heap usage). Node.js needs `--max-old-space-size` set to align with container memory or it OOMs unexpectedly.

For each language runtime: configure max heap relative to container memory; don't just trust defaults.

### Capacity planning

Production sizing process: measure actual usage in load tests, set limits at p99 + headroom (typically 30-50%). Too tight = OOM kills under load. Too loose = wasted capacity, fewer containers per host.

`docker stats` for live data; Prometheus + node-exporter + cAdvisor for time-series; profile during peak.

## Common mistakes

- No memory limit → one container takes down host.
- JVM heap = container limit → OOM (overhead not accounted).
- Tiny pids limit → mysterious failures with thread-heavy apps.
- CPU pinning without need → fragmentation, lower density.

## Summary

- cgroups enforce limits; OOM killer fires on memory overruns.
- Always set memory limits in production.
- CPU limits throttle, don't crash.
- JVM/Node heap must align with container memory.
- Default = unlimited; production = explicit.
