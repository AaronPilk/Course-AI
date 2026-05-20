---
module: 4
position: 2
title: "Port mapping and exposure"
objective: "Get traffic in and out correctly."
estimated_minutes: 6
---

# Port mapping and exposure

## The simple version

Two related but distinct concepts:

- **EXPOSE** (Dockerfile): documents which ports the container listens on. Doesn't actually open anything.
- **Publish** (`-p` at run): maps a host port to a container port. Actually creates the traffic flow.

Forms:

- `-p 8080:80` — host port 8080 → container port 80, all interfaces.
- `-p 127.0.0.1:8080:80` — bound to host's loopback only.
- `-p 8080:80/udp` — UDP instead of TCP.
- `-p 80` — random host port → container port 80.
- `-P` — publish all EXPOSEd ports to random host ports.

## The technical version

### Publishing mechanics

`-p` creates a userland proxy or iptables DNAT rule (Docker chooses based on config). The host listens on the published port; matching traffic is forwarded to the container's IP at the target port.

Inside the container, the app binds to its port normally — it doesn't know about the mapping.

### EXPOSE vs publish

EXPOSE is metadata only. Tools that read images (Compose, K8s manifest generators) may use it as a hint. Without a published port, EXPOSE alone doesn't let outside traffic in.

Always publish in `docker run` (or use Compose's `ports:`).

### Inbound traffic flow

External client → host port → iptables/userland-proxy → container's network namespace → app process.

The container app sees the original source IP from outside (mostly; some configurations NAT). Inside the container, `0.0.0.0:80` listening is reachable via the host port.

### Outbound traffic

Containers can reach the internet by default (bridge → host's outbound). For private networks (no internet), use `--network none` or custom networks without external access.

For containers on user-defined bridges, outbound goes through SNAT to the host's IP — external services see the host's IP, not the container's private IP.

### Binding to specific interfaces

`-p 127.0.0.1:8080:80` only accepts connections on the host's loopback. Useful for development services not meant to be exposed.

`-p 0.0.0.0:8080:80` accepts on all interfaces (default if you omit the host IP).

For multi-interface hosts (cloud VMs with public + private NICs), bind explicitly to the right interface.

### Port range publishing

`-p 8080-8090:80-90` — range mapping. Useful for clustered services with sequential ports.

### Compose port syntax

```yaml
services:
  api:
    image: myapp
    ports:
      - "8080:80"           # host:container
      - "127.0.0.1:8081:80" # host IP:host:container
      - "9000-9010:9000-9010"
```

Same semantics as `-p`, in YAML.

### Inter-container communication

Containers on the same network don't need port publishing to talk to each other — they reach each other directly on internal IPs (or container DNS names on custom bridges).

`-p` is only for ingress from outside the Docker network (the host).

### Common issues

- **Forgot to publish**: app inside container is listening, but host can't reach it. Add `-p`.
- **App bound to localhost in container**: `-p` works at the network level, but the app inside has to listen on `0.0.0.0`, not `127.0.0.1`. Containers' "localhost" is the container, not the host.
- **Port already in use on host**: another process has it; pick a different host port or stop the other.
- **Firewall on host**: even with `-p`, host firewall (iptables, ufw) can block.

### Reverse proxy pattern

Don't publish every service's port. Run one reverse proxy (NGINX, Traefik, Caddy) with `-p 443:443`; have it route internally to other containers on the same network by container name. One port to manage; clean SSL termination; easy to add new services without exposing each one.

## Summary

- EXPOSE = documentation; publish = actual traffic flow.
- `-p HOST:CONTAINER` is the basic form.
- App inside must listen on `0.0.0.0`, not `127.0.0.1`.
- Containers on the same network reach each other without publishing.
- Reverse proxy beats one port-publish per service.
