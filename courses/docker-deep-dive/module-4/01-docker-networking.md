---
module: 4
position: 1
title: "Docker networking — bridge, host, overlay"
objective: "Pick the right network mode."
estimated_minutes: 6
---

# Docker networking — bridge, host, overlay

## The simple version

Docker has several network modes:

- **bridge** (default): a private virtual network on the host; containers get IPs in it; NAT to the host's network for outbound.
- **host**: the container shares the host's network namespace; no isolation, no port mapping needed.
- **none**: no networking; isolated.
- **overlay**: multi-host networking for Swarm/clusters; encapsulated packets.
- **macvlan / ipvlan**: container gets a real MAC/IP on the physical network.
- **container:<name>**: shares another container's network namespace.

For most single-host workloads: custom bridge networks (not the default bridge — better DNS). For Swarm/K8s, the orchestrator handles networking.

## The technical version

### Default bridge vs custom bridge

The default `bridge` network has DNS limitations — containers can't resolve each other by name. Custom bridge networks include built-in DNS:

```
docker network create mynet
docker run --network mynet --name api ...
docker run --network mynet --name web ...
# web can resolve "api" via DNS
```

Custom bridges are the right default for any multi-container setup. Docker Compose creates one automatically.

### Host network

```
docker run --network host nginx
```

Container uses host's network namespace directly. Pros: zero networking overhead, no port mapping. Cons: no isolation, port conflicts with other host services, can't run multiple containers on the same port.

Use for: performance-critical workloads, when you specifically need host-level networking.

### Overlay networks

For multi-host clusters (Docker Swarm): a virtual network spans multiple Docker hosts. Containers on different hosts communicate via VXLAN encapsulation as if on one network.

In Kubernetes, the CNI plugin handles equivalent functionality (covered in the K8s course).

### Container-to-container DNS

On a custom bridge or overlay, Docker provides DNS for container names. `api` resolves to the api container's IP. Built into the embedded DNS resolver at 127.0.0.11.

Useful in Compose stacks: services reference each other by name, no IP hardcoding.

### Port publishing

`-p HOST_PORT:CONTAINER_PORT` maps a host port to a container port. Docker creates iptables rules (DNAT) that forward traffic from the host port to the container's IP.

`-p 8080:80` → host's port 8080 → container's port 80.

For TCP: `-p 8080:80`. For UDP: `-p 53:53/udp`. For all interfaces: `-p 8080:80`; for localhost only: `-p 127.0.0.1:8080:80`.

`-P` (uppercase) publishes all exposed ports to random host ports (useful for tests).

### Network inspection

```
docker network ls
docker network inspect mynet
docker network connect mynet container
docker network disconnect mynet container
```

`inspect` shows containers attached, IPs, subnets.

### Common patterns

- **Compose stack**: one custom bridge network; services find each other by name.
- **Reverse proxy**: NGINX/Traefik on bridge with port published; routes to internal services.
- **Database isolation**: separate network just for the DB; only its consumers attached.

### Common issues

- **Default bridge**: no DNS between containers; use custom bridge.
- **Port conflicts**: multiple containers want host port 80; use different ports or a reverse proxy.
- **Container can't reach host**: use `host.docker.internal` (macOS/Windows) or the bridge gateway IP (Linux).
- **Container can reach internet but not host's other services**: firewall rules or network isolation.

## Summary

- Bridge for most containers; custom bridge for DNS.
- Host for performance/no-isolation use cases.
- Overlay for multi-host.
- Port publish for ingress from host.
- DNS resolution by container name on custom bridges.
