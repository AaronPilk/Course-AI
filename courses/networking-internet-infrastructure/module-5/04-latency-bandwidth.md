---
module: 5
position: 4
title: "Latency, bandwidth, and physical limits"
objective: "What you can't optimize away, and what you can."
estimated_minutes: 5
---

# Latency, bandwidth, and physical limits

## Two different things

**Latency.** How long for one packet to get there. Measured in ms.

**Bandwidth.** How many bits per second you can push. Measured in Mbps / Gbps.

A pipe with high bandwidth can have high latency (think satellite — fat pipe, big delay). A pipe with low latency can have low bandwidth (think 1990s modem — quick but tiny).

For user experience: both matter, but latency dominates for interactive apps.

## The physics

**Latency.** Bounded by the speed of light. In fiber: ~200,000 km/s (slower than vacuum due to refractive index). Across the Atlantic (~5,500 km): theoretical minimum RTT is ~55ms. Real-world adds: switches, queues, processing → 70-100ms typical NYC↔London.

You can't reduce latency below physics. You CAN bring servers closer to users (CDN, edge compute) and reduce protocol overhead.

**Bandwidth.** Bounded by economics. Fiber can carry 10s of Tbps; spinning up more fiber costs capital. Submarine cable capacity has grown exponentially; modern transatlantic cables push tens of Tbps.

For end users: bandwidth depends on their last-mile connection (gigabit fiber → 1 Gbps; 4G mobile → ~10-50 Mbps; sat link → varies).

## Latency contributions

For a typical request:

```
User → ISP → backbone → CDN POP → backend → DB → ...
  ~5ms    ~10-50ms        cache    1-100ms   1-10ms
```

The end-to-end is the sum. Each component contributes.

Where you can optimize:

- **DNS.** First lookup is ~10-50ms; cached is sub-ms. Use fast DNS (1.1.1.1) + reasonable TTLs.
- **TCP / TLS handshake.** ~RTT × 3 historically; modern (TLS 1.3 + QUIC) closer to 1 RTT.
- **CDN.** Sub-50ms to nearest POP for cached content; uses anycast.
- **Backend.** App-level; can be milliseconds or seconds depending on what it does.
- **Database.** Local queries (1-10ms); distributed/cross-region (100ms+).

A typical fast API request: 5ms (browser-to-edge) + 50ms (edge-to-origin) + 20ms (app processing) + 5ms (response) = ~80ms end-to-end. Good.

## Bandwidth-delay product

```
BDP = bandwidth × RTT
```

This is the amount of data "in flight" on a long-haul connection. For 1 Gbps × 100ms = 12.5 MB.

If your TCP window is smaller, you can't fill the pipe. Modern OSes auto-tune; older configurations had artificially-small windows that throttled long-haul throughput.

Implication: high-bandwidth + high-latency links require proper TCP tuning. AWS / GCP between regions, satellites, etc.

## Why CDNs matter so much

The CDN moves the "user-to-server" hop from "across the world" to "around the corner." That's RTT going from 200ms to 20ms — 10× improvement on the latency that dominates page load.

For static content: CDN serves directly. For dynamic content with edge compute: response can be generated entirely at the edge, no origin round-trip.

The flip side: origin still matters. CDN caches what's cacheable; everything else still hits origin. Make origin fast OR cache aggressively.

## Tail latency

P50 (median) might be 50ms; P99 (worst 1%) might be 500ms. P99.9 might be 5 seconds.

Tail latency dominates user perception — a page with median 50ms but P99 5s feels broken regularly. Causes:
- Garbage collection pauses.
- Slow database queries occasionally.
- Network glitches.
- Failover delays.
- Saturated downstream services.

Measure and optimize the tail, not just the average. p99 matters more than p50 for UX.

## Mobile and bad networks

Mobile networks are different:
- **Latency.** 30-200ms RTT depending on tech (4G fast; 3G slow; 5G excellent in coverage).
- **Bandwidth.** Variable; can drop dramatically in spots.
- **Packet loss.** Higher than wired.
- **Connection migration.** Switching cells / Wi-Fi handoffs.

HTTP/3 / QUIC are particularly valuable here. CDN edges matter more. Optimize for variable conditions: progressive enhancement, lazy loading, resilient retries.

## Bandwidth optimization

For users on slow networks:
- **Compression.** gzip / brotli for everything compressible.
- **Image formats.** WebP / AVIF over JPEG / PNG.
- **HTTP/2 / HTTP/3.** Header compression, multiplexing.
- **Code splitting.** Don't ship megabytes of JS upfront.
- **Lazy loading.** Images, components below the fold.
- **Service workers.** Offline support; cached responses.

Lighthouse + WebPageTest measure these. Real User Monitoring (RUM) shows actual user experience.

## Bufferbloat

Routers and modems with too-large buffers absorb a lot of data, which sounds good (no drops) but causes massive latency under load — a 4G modem buffering 5MB means hundreds of ms of queue delay for every packet.

Modern routers use smart queueing (CAKE, fq_codel) to keep buffers tight. Older / cheap consumer hardware can suffer.

You can't usually fix bufferbloat on someone else's network; design apps to be resilient (don't open thousands of parallel connections; respect TCP congestion signals).

## Common confusions

- **"My internet is fast."** Bandwidth usually; latency to specific sites varies wildly.
- **"Upgrading to gigabit will fix slow loading."** Maybe — depends what's slow. Often latency dominates, not bandwidth.
- **"Edge compute makes everything faster."** Cached/static, yes. Dynamic with backend round-trip — limited by backend latency.
- **"Caching is always a win."** Stale data risks; cache invalidation is famously hard.

## Summary

- Latency: bounded by physics (speed of light in fiber). 55ms minimum NYC↔London.
- Bandwidth: bounded by economics. Less critical than latency for most user experience.
- CDN + edge compute brings work near users; biggest UX win available.
- Measure p99 / p99.9 tail latency; that's what users feel.
- Mobile / variable networks reward HTTP/3, compression, progressive enhancement.
- TCP tuning matters on long-haul + high-bandwidth (BDP).

## Course complete

You've covered networking from physical cables through global routing to application-layer protocols. The mental model is the through-line: each layer trusts the one below; debugging means narrowing which layer is failing; optimization means matching the technology to the constraint.

Next steps: when you next debug a "slow API" or "site down," reach for the layered diagnostic flow. The toolkit is `dig`, `mtr`, `nc`, `curl -v`, `tcpdump`, `ss`. The right diagnostic in the right layer answers most network questions in minutes.
