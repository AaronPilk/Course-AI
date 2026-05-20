---
module: 5
position: 1
title: "Container security — non-root, capabilities, seccomp"
objective: "Limit what containers can do."
estimated_minutes: 6
---

# Container security — non-root, capabilities, seccomp

## The simple version

Containers share the host kernel. A compromise inside a privileged container is much closer to host compromise than people assume. Hardening:

1. **Run as non-root** inside the container (USER directive in Dockerfile).
2. **Drop capabilities** you don't need (`--cap-drop=ALL`, add back only what's needed).
3. **Read-only root filesystem** (`--read-only`).
4. **Apply seccomp** (default is sane; tighten for high-risk).
5. **Don't use --privileged** unless absolutely required.
6. **Don't mount the Docker socket**.

Combined: the same vulnerability in your app has dramatically smaller blast radius.

## The technical version

### Non-root in Dockerfile

```dockerfile
FROM alpine:3.19
RUN addgroup -S app && adduser -S app -G app
USER app
```

All subsequent operations (and the runtime entrypoint) run as `app`, not root. The container can't bind privileged ports (< 1024) by default — use ports above 1024 or grant `CAP_NET_BIND_SERVICE`.

For images that need to start as root (e.g., to install packages, set permissions), switch to non-root before the final ENTRYPOINT:

```dockerfile
RUN apt-get install ...   # as root
RUN chown -R app:app /app
USER app
CMD ["./server"]
```

### Capabilities

Linux capabilities split root's privileges into ~40 grants. By default, Docker grants a restricted subset to containers; you can tighten further:

```
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myapp
```

Drop everything; add back only what the app needs. Most apps need nothing (no `CAP_NET_RAW`, no `CAP_SYS_ADMIN`, none).

### Read-only root filesystem

```
docker run --read-only --tmpfs /tmp --tmpfs /var/run myapp
```

Container can't write to its own filesystem except mounted volumes and tmpfs locations. Prevents many post-compromise actions (writing rootkits, modifying app binaries, creating persistence).

Apps may need writable `/tmp` or specific paths — mount tmpfs at those locations.

### Seccomp

Default Docker seccomp profile blocks ~50 syscalls that are rare and dangerous (mount, ptrace, kexec_load, etc.). For most apps, the default is fine.

For higher security, custom profiles can be applied:

```
docker run --security-opt seccomp=custom-profile.json myapp
```

Generate a tight profile by running your app under audit mode and capturing actual syscalls.

### Privileged mode

`--privileged` removes most isolation:
- All capabilities granted.
- AppArmor / SELinux disabled.
- No seccomp.
- Access to all devices.
- Can mount filesystems.

Use only when truly necessary (Docker-in-Docker, hardware access). For containers that need *some* extra privileges, grant specific capabilities — almost never need full `--privileged`.

### AppArmor / SELinux

Mandatory access control adds another layer beyond capabilities. Default Docker profiles are sensible. Custom profiles for hardened workloads.

In K8s, Pod Security Standards integrate these.

### Don't mount the Docker socket

`-v /var/run/docker.sock:/var/run/docker.sock` = host root inside the container. Anything that talks to the Docker daemon (which runs as root) can spawn privileged containers, mount any host path, etc.

If a container genuinely needs to manage Docker (CI runners, monitoring), use a scoped API proxy (limit which Docker operations are allowed) rather than raw socket access.

### Minimal base images

Less software = less attack surface. Distroless or scratch images have no shell, no package manager, no utilities for attackers to use post-compromise. Even with code execution, the attacker can't `wget` an exploit kit or `apk add` a backdoor.

### Combining everything

Production-grade Dockerfile + runtime flags:

```dockerfile
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /app/server /
USER nonroot:nonroot
ENTRYPOINT ["/server"]
```

```
docker run \
  --read-only \
  --cap-drop=ALL \
  --security-opt no-new-privileges \
  --user 65532:65532 \
  -p 8080:8080 \
  myapp:v1.2.3
```

Non-root user, no capabilities, no privilege escalation, read-only FS, minimal image. A bug in the app has a vastly smaller blast radius.

### What this gains you

Real attacker scenarios:

- **Code execution in app**: with hardening, can't write to FS, can't escalate, can't spawn privileged commands, no useful tools in the image. Damage usually limited to data the app already had access to (which IAM should also restrict).
- **Container escape attempts**: dropped capabilities + seccomp + AppArmor make the syscalls needed for many escapes unavailable.
- **Persistence**: read-only FS prevents writing backdoors.

Each layer prevents some class; combined they make compromise significantly costlier.

## Summary

- Non-root user is non-negotiable in production.
- Drop capabilities; add back only what's needed.
- Read-only root filesystem + tmpfs for writable paths.
- Default seccomp is fine; tighten for high-risk workloads.
- Never `--privileged` unless required; never mount Docker socket carelessly.
- Distroless/scratch base for minimal attack surface.
