---
module: 4
position: 3
title: "Volumes vs bind mounts"
objective: "Persist data correctly."
estimated_minutes: 6
---

# Volumes vs bind mounts

## The simple version

Containers are ephemeral — when removed, their writable layer goes too. For data that must survive: volumes or bind mounts.

- **Volume**: Docker-managed storage. Lives in `/var/lib/docker/volumes/...`. Portable across containers; abstracted from the host filesystem.
- **Bind mount**: a specific host path mounted into the container. Direct host filesystem; not managed by Docker.
- **tmpfs**: in-memory; data lost when container stops.

For production data: volumes. For development (mounting source code for hot reload): bind mounts. For sensitive temporary data: tmpfs.

## The technical version

### Volumes

```
docker volume create mydata
docker run -v mydata:/data myimage
docker volume inspect mydata
docker volume rm mydata
```

Docker manages the storage location. Volumes survive container removal. Multiple containers can share a volume (one writer, many readers is safer than concurrent writes).

Compose:

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

### Bind mounts

```
docker run -v /host/path:/container/path myimage
docker run --mount type=bind,source=/host/path,target=/container/path myimage
```

The container sees the host's directory directly. Changes in either are immediately visible to the other.

Common dev use: mount source code so changes outside reflect inside.

```
docker run -v $(pwd):/app -p 3000:3000 myapp:dev
```

### tmpfs

```
docker run --tmpfs /cache myimage
```

`/cache` exists only in RAM. Fast; gone on stop. For sensitive temp data that shouldn't touch disk.

### Volume drivers

By default, volumes are on local disk. Volume drivers add backends:

- **local-persist**: pin to a specific host path.
- **nfs / cifs**: shared network filesystem.
- **AWS / Azure / GCP** cloud-specific drivers.

For production single-host: local is fine. For multi-host (Swarm, K8s without a CSI driver): network volumes get complicated. Most teams use K8s' PV/PVC abstraction (covered in K8s course) for cluster storage.

### Permissions gotchas

Bind mounts preserve host file ownership. Container processes run as some UID; if the host path is owned by a different UID, writes fail.

Solutions:
- Match container user to host user (`-u $(id -u)` for dev).
- Set permissions on host before mounting.
- Use a volume instead of bind mount.

For development: bind mounts; live with the friction. For production: volumes avoid this entirely.

### Anonymous volumes

`docker run -v /data myimage` (no name) creates an anonymous volume. Survives container removal but is hard to find later. Avoid; use named volumes.

### Backups

Volumes are just directories on the host. Backup via:
- `docker run --rm -v mydata:/data -v $(pwd):/backup alpine tar czf /backup/mydata.tar.gz -C /data .`
- Or a Compose service that mounts the volume and runs backup tooling.

For databases: app-level backups (pg_dump, mysqldump) are better than raw filesystem copies — they capture transactional state.

### When to use each

- **Volume**: production data, persistent app state, database files.
- **Bind mount**: development (source code), config files from host.
- **tmpfs**: sensitive temp data, fast scratch space.

### Common issues

- **Database files in image**: every container start uses the image's snapshot; data resets. Always volume-mount data directories.
- **Permission errors**: bind mount UID mismatch.
- **Disk full**: orphaned anonymous volumes. `docker volume prune` cleans them.
- **Performance on macOS/Windows**: bind mounts go through the VM; slower than native Linux. Use named volumes for production-like perf.

## Summary

- Volumes: Docker-managed, portable, production default.
- Bind mounts: host path directly; dev use case primarily.
- tmpfs: in-memory, ephemeral, fast.
- Permission gotchas with bind mounts (UID mismatch).
- Always volume-mount database data dirs.
