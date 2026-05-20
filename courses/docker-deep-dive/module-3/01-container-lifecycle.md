---
module: 3
position: 1
title: "The container lifecycle in detail"
objective: "Walk from `docker run` to a running process."
estimated_minutes: 7
---

# The container lifecycle in detail

## The puzzle

You type `docker run`. Something happens. Knowing exactly what happens — image pull, container creation, namespace setup, process start, lifecycle states — turns "it doesn't work" from mystery into checklist.

## The simple version

`docker run image:tag` does:

1. Resolve image (pull if not local).
2. Create container record (allocated ID, networking, volumes prepared).
3. Set up namespaces, cgroups, capabilities.
4. Mount image filesystem as root.
5. Start the entrypoint as PID 1 inside.
6. Track lifecycle (running → exited/killed/dead).

Subcommands: `docker create` does steps 1-4 without starting; `docker start` runs step 5; `docker run` is `create + start`.

States: Created, Running, Restarting, Removing, Paused, Exited, Dead.

## The technical version

### What `docker run` actually invokes

The Docker CLI calls the daemon's REST API. The daemon:

1. **Image resolution**: looks up the image locally. If absent, pulls from registry (manifest + layers). Layers cached on disk and reused across containers.

2. **Container record creation**: assigns a unique container ID, configures networking (default bridge unless `--network` specified), prepares volume mounts, sets environment variables.

3. **Runtime call**: passes the configuration to containerd, which prepares an OCI bundle (a directory with the filesystem + a `config.json` describing the container).

4. **runc invocation**: runc reads the bundle, calls Linux kernel syscalls to create namespaces (clone with CLONE_NEW* flags), configures cgroups in /sys/fs/cgroup, applies capabilities/seccomp/AppArmor profile, mounts the filesystem.

5. **Entrypoint exec**: runc execs the configured ENTRYPOINT + CMD inside the new namespaces. That process is now PID 1 inside the container.

6. **Daemon supervision**: dockerd watches the process via containerd. On exit, it records exit code, runs restart policy if applicable, cleans up.

### Container states

`docker ps -a` shows the state:

- **Created**: container exists but never started.
- **Running**: process is alive.
- **Restarting**: between restart attempts (per restart policy).
- **Paused**: process frozen via `docker pause` (uses cgroups freezer).
- **Exited**: process finished; container retained (use `--rm` to auto-remove).
- **Dead**: cleanup failed; manual intervention needed.

State transitions are well-defined. `docker events` streams them.

### Useful run flags

```
docker run \
  --name myapp \
  --rm \                     # remove on exit
  -d \                       # detach (run in background)
  -p 8080:80 \               # port map host:container
  -v /host/data:/data \      # bind mount
  -e DATABASE_URL=... \      # env var
  --memory 512m \
  --cpus 1 \
  --user 1000:1000 \
  --read-only \              # readonly root fs
  --network mynet \
  --restart unless-stopped \
  image:tag command args
```

Each flag corresponds to runtime configuration written into the OCI bundle's config.json.

### Detached vs foreground

`-d` (detach) runs the container in the background; the CLI returns immediately with the container ID. Without `-d`, the CLI attaches to the container's stdout/stderr/stdin.

For development: foreground is convenient (see logs, Ctrl-C to stop). For production/scripts: detached + log driver.

### `docker exec`

Run a command inside a running container:

```
docker exec -it myapp bash
docker exec myapp ps aux
```

`exec` creates a new process in the container's existing namespaces — same network, same filesystem view as the container's main process. Useful for debugging.

`exec` doesn't restart the container or change its lifecycle. The new process is independent of PID 1.

### Stopping containers

`docker stop` sends SIGTERM, waits for grace period (default 10s), then SIGKILL.

`docker kill` sends SIGKILL immediately (or whatever signal you specify).

For graceful shutdown, the container must handle SIGTERM. Apps that ignore it get the hammer after grace period.

`docker stop -t 30 myapp` allows 30s grace.

### Restart policies

`--restart` controls what happens when the container exits:

- **no** (default): don't restart.
- **on-failure**: restart only on non-zero exit. Limit attempts with `:N`.
- **always**: restart no matter what; even on daemon restart.
- **unless-stopped**: like always, but doesn't restart if you `docker stop` it manually.

For long-running services managed without orchestration: `unless-stopped`. With Kubernetes / Compose / systemd: those handle restarts; set `--restart no` to avoid double-restart.

### Logs

Container stdout/stderr is captured by the configured log driver:

- **json-file** (default): writes to /var/lib/docker/containers/.../*-json.log.
- **journald**: systemd journal.
- **fluentd**, **awslogs**, **gcplogs**, **splunk**: ship to external systems.

`docker logs myapp` reads from the configured driver. For production, ship to a log aggregator; don't rely on local files (they grow forever without rotation).

Log rotation: configure max-size and max-file in daemon config or per-container. Forgetting this on busy containers fills disks.

### Container filesystem after exit

When a container exits, its writable layer persists until the container is removed. Useful for inspecting state after a crash. Wasteful if you accumulate exited containers.

`--rm` cleans up on exit. For long-running production services, omit `--rm` so you can inspect post-mortem.

`docker system prune` cleans up stopped containers, dangling images, unused networks. Schedule it on dev machines to reclaim space.

### `docker inspect`

Full JSON of a container's configuration and state:

```
docker inspect myapp | jq '.[0].State'
docker inspect myapp | jq '.[0].NetworkSettings.IPAddress'
```

Useful for scripting and debugging.

### What can go wrong in the lifecycle

- **Image pull fails**: bad reference, auth issue, registry down. Error before container creation.
- **Volume mount fails**: source path doesn't exist on host. Container won't start.
- **Entrypoint fails immediately**: bad binary, missing dependency, config issue. Container exits with non-zero status.
- **OOM during runtime**: kernel kills the process; container exits with 137 (128 + 9).
- **Healthcheck failure** (with --restart): restart loop.

`docker logs` + `docker inspect` are the primary diagnostic tools.

### Init process inside

By default, your ENTRYPOINT runs as PID 1. PID 1 has special responsibilities in Unix: reaping zombie children, handling signals correctly. Many apps weren't written to be PID 1 — they leak zombies, ignore SIGTERM.

`docker run --init` adds a tiny init process (tini) that handles the PID 1 responsibilities and execs your app as a child. Recommended for non-init-aware apps.

In Kubernetes, this isn't an issue — pause containers handle PID 1; your app is a normal child.

### Real-world patterns

For production single-host: `docker run -d --restart unless-stopped --log-opt max-size=10m --log-opt max-file=3 ...`

For development: `docker run --rm -it -p 8080:8080 -v $(pwd):/app ...`

For CI/CD jobs: `docker run --rm --network=host ...`

Each style fits the use case.

## Common mistakes to avoid

- **No log rotation** — disk fills.
- **No restart policy** for production single-host — services don't survive reboots.
- **Always `--rm`** in production — can't inspect after crash.
- **Ignoring SIGTERM** in app — no graceful shutdown.
- **Conflicting restart policies** with orchestrator — double-restarts.

## Summary

- `docker run` = pull + create + start; namespaces + cgroups + entrypoint as PID 1.
- States: Created, Running, Restarting, Paused, Exited, Dead.
- `docker exec` adds processes to existing containers.
- `docker stop` SIGTERM then SIGKILL; configure grace period.
- Restart policies: no/on-failure/always/unless-stopped.
- Log drivers + rotation matter at scale.
- `--init` for non-init-aware apps.

Next: resource limits and behavior.
