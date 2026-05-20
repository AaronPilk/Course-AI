---
module: 5
position: 2
title: "Load balancers: L4 vs L7"
objective: "Distribute traffic intelligently across many backends."
estimated_minutes: 5
---

# Load balancers: L4 vs L7

## What a load balancer does

Sits between clients and a fleet of backend servers. Distributes incoming requests across them based on some policy.

Benefits:
- **Horizontal scaling.** Add more backends; LB spreads load.
- **Fault tolerance.** Backend dies; LB stops sending to it.
- **Smooth deploys.** Drain traffic before maintenance.
- **Centralized features.** TLS termination, auth, rate limiting.

## L4 vs L7 — the key distinction

**Layer 4 (Transport).** LB looks at TCP/UDP headers — IPs and ports. Decides which backend to forward the connection to. Doesn't inspect content.

- Fast: per-connection decision is cheap.
- Protocol-agnostic: works for any TCP/UDP — databases, mail, custom.
- High throughput.
- Examples: AWS NLB, GCP TCP/UDP LB, HAProxy in TCP mode, IPVS.

**Layer 7 (Application).** LB understands HTTP. Routes by path, header, hostname, cookie. Can rewrite, redirect, cache.

- Slower than L4 (parses HTTP per request).
- HTTP-only.
- Enables sophisticated routing (canary, A/B, path-based microservices).
- Examples: AWS ALB, GCP HTTPS LB, nginx, Envoy, HAProxy in HTTP mode, Cloudflare.

Production stacks often use both: L4 for raw TCP/UDP throughput, L7 layered above for HTTP-aware routing.

## Algorithms

How an LB picks a backend:

- **Round robin.** A → B → C → A. Simple; no awareness of load.
- **Least connections.** Backend with fewest active connections wins. Adapts to slow backends.
- **IP hash.** Hash source IP → same client always to same backend. Sticky.
- **Weighted.** Heavier backends get more traffic.
- **Least response time.** Pick the fastest-responding backend.
- **Random with two choices ("power of two").** Pick two at random; route to less-loaded. Performs nearly as well as least-connections with much less coordination.

For most apps: round robin or least-connections. Pick based on whether backends are equal or heterogeneous.

## Health checks

LBs poll each backend periodically:

- **TCP check.** Can I connect to port X? Cheap; doesn't detect app-level issues.
- **HTTP check.** GET /health → 200 OK? Detects app-level health.
- **Custom check.** Run a script that knows your app's state.

Failing backends marked unhealthy; removed from rotation. Recovery: backend passes N consecutive checks; re-added.

Tuning matters:
- **Too aggressive.** Flapping on transient issues; thrashing.
- **Too lax.** Sends to broken backend for minutes.
- Typical: 5-30s interval, 2-3 failures to mark unhealthy, 2-3 successes to mark healthy again.

## TLS termination

Often the LB terminates TLS — decrypts client traffic, forwards plain HTTP to backends. Saves backends from doing TLS each.

Trade-offs:
- **+** Centralized cert management. Faster backends.
- **-** Plaintext between LB and backend. Defense in depth requires re-encryption (mTLS) for sensitive traffic.

Modern microservices use mTLS everywhere via service mesh (Istio, Linkerd) so traffic is always encrypted regardless of LB.

## Session affinity (sticky sessions)

For apps where client → specific backend continuity matters:

- **Cookie-based.** LB sets a cookie identifying the backend; subsequent requests routed there.
- **IP-based.** Same client IP → same backend.

Stickiness reduces flexibility (failure of "your" backend = your session lost), so prefer stateless backends + shared session storage (Redis). Use sticky only when truly necessary.

## Connection patterns

**HTTP keep-alive.** Client reuses connection for many requests. LB needs to handle this; L4 typically passes through; L7 may reuse a backend connection for the same client's subsequent requests.

**HTTP/2 multiplexing.** Many requests per connection. L7 LBs need to understand and route at the stream level.

**WebSocket.** Long-lived bidirectional. LB needs to support upgrade + persistent connections; some L7 LBs default to short timeouts that kill websockets unexpectedly. Tune `proxy_read_timeout` etc.

**gRPC.** HTTP/2-based. Some LBs don't speak gRPC; check support.

## DNS-based "load balancing"

Return multiple IPs in DNS:

```
example.com A 1.1.1.1
example.com A 2.2.2.2
example.com A 3.3.3.3
```

Client picks one. Crude — no health awareness, no quick failover (TTL-bound), but cheap and works at scale.

GeoDNS / latency-based DNS routes clients to the closest region. Combined with regional LBs underneath, gives global distribution.

## Failover patterns

**Active/passive.** Primary LB + standby. Standby takes over on failure (BGP announcement, virtual IP, anycast).

**Active/active.** Multiple LBs all running; traffic distributed via DNS/anycast. Survives any single LB failure.

For most cloud setups: managed LBs are highly available by design. Self-hosted requires more care.

## Common pitfalls

- **No health check OR weak one.** LB sends traffic to dead backends.
- **TCP-only health check.** App is up at TCP level but broken at HTTP level.
- **Forgotten WebSocket timeouts.** Long-lived connections drop unexpectedly.
- **Single LB.** Single point of failure.
- **Slow draining.** Backends terminated mid-request during deploys.

## Summary

- L4 = TCP/IP-level, fast, any protocol. L7 = HTTP-aware, rich routing.
- Algorithms: round robin, least connections, IP hash, weighted, power-of-two.
- Health checks are critical; tune to avoid flapping.
- TLS often terminates at LB; consider mTLS to backends for defense in depth.
- Sticky sessions add fragility; prefer stateless backends + shared session store.
- WebSocket / gRPC require LB support and timeout tuning.

Next: CDNs and the edge.
