---
module: 1
position: 2
title: "Anycast and the edge — why Cloudflare is fast"
objective: "Understand the anycast routing model and the global PoP architecture."
estimated_minutes: 9
---

# Anycast and the edge — why Cloudflare is fast

## The puzzle

You're in Tokyo. Your origin server is in Virginia. A request to your domain on Cloudflare takes 20ms; the same request without Cloudflare would take 200ms. Cloudflare didn't make your origin faster — it made the distance from the user to "something useful" much shorter.

The technique is called **anycast**. It's the structural reason Cloudflare is fast, and once you understand it, you stop being surprised by the latency numbers.

## The simple version

Cloudflare has 300+ data centers (PoPs) worldwide. Each one announces the same set of IP addresses on the internet. When a user requests one of those IPs, the internet's routing fabric automatically delivers the packet to the **nearest** PoP.

That's anycast: one IP, many physical locations, automatic shortest-path routing. Users hit nearby PoPs without anyone configuring it.

## The technical version

### How anycast routing works

Normal IPs are unicast — one IP, one machine. Anycast IPs are claimed by many machines simultaneously, and BGP (the internet's routing protocol) picks the topologically closest one.

When Cloudflare announces `1.1.1.1` from PoPs in San Francisco, Tokyo, Frankfurt, etc., each major ISP receives several routes for `1.1.1.1`. They pick the one with the shortest BGP path. A user in San Francisco gets routed to the SF PoP; a user in Tokyo gets routed to the Tokyo PoP.

You don't configure this. The internet figures it out.

### Why latency drops so much

A normal request to an origin in Virginia from Tokyo:

- TCP handshake: 1 round trip × 100-150ms = 100-150ms.
- TLS handshake: 2 round trips = 200-300ms.
- Request: 1 round trip = 100-150ms.

Total just to start receiving data: ~400-600ms.

With Cloudflare in front (TLS terminates at Tokyo PoP):

- TCP + TLS handshakes happen between user and Tokyo PoP: ~30-50ms total.
- The PoP keeps a persistent connection to origin in Virginia.
- The PoP fetches the response: ~150ms.
- Returns to user: ~20ms.

Total: ~200ms. Much faster, especially on the handshake-heavy first request.

For cache hits, it's even better — no origin call needed. Total: ~50ms.

### PoP capabilities

Every Cloudflare PoP runs the same software stack:

- DNS resolver (1.1.1.1 service).
- Edge proxy (handles HTTP/HTTPS/WebSocket).
- Cache.
- Workers runtime.
- Security engines (DDoS, WAF, rate limiting).
- Logging and analytics.

So whichever PoP a user lands on, they get the full Cloudflare stack. No "premium PoP" or "feature PoP" — symmetry is the design.

### Capacity and DDoS

Anycast also distributes load. If a user blasts requests, they hit *their nearest* PoP. A DDoS from a botnet of millions doesn't concentrate at one PoP — it spreads across whichever PoPs are closest to each bot.

This is why Cloudflare absorbs huge DDoS attacks (terabits per second) without falling over. The attack is geographically distributed by definition; Cloudflare's network is built to absorb that.

### What anycast doesn't help

- **First-byte latency from your origin** still depends on the distance Cloudflare's PoP → origin. Caching reduces this; otherwise it's there.
- **Cache misses** still require a trip to origin. Workers can substitute for origin entirely.
- **Real-time data freshness** — anycast doesn't help if you need uncached origin data.
- **Cross-region database queries** — those are an origin problem, not a Cloudflare problem.

### Global vs. regional latency

For most users:

- User → nearest PoP: 5-30ms.
- PoP → cache lookup: <1ms.
- PoP → origin (if needed): depends on origin location.

Putting your origin in a region close to *most of your users* helps even with Cloudflare. Some users will be far from origin; cache and Workers handle that.

For truly global apps, multi-region origins or full edge compute (Workers + Durable Objects) keeps everything close.

### Routing variability

BGP routing isn't always optimal. Sometimes a user in city A gets routed to a PoP in city B even though city C is closer. This is mostly fine but creates occasional latency outliers.

Cloudflare publishes per-PoP performance data and works with ISPs to improve routes; for the most part, the routing works.

### How to check your routing

```bash
# Discover which Cloudflare PoP you're hitting
curl -s https://www.cloudflare.com/cdn-cgi/trace
```

Returns the colo code (PoP identifier) and other diagnostic info. Useful when troubleshooting latency or geo-routing issues.

### Anycast and IPv6

Same model applies. Cloudflare announces IPv6 anycast ranges; IPv6-capable clients get routed similarly. Many modern networks dual-stack — Cloudflare handles both transparently.

### When anycast helps and when it doesn't

Anycast is the structural reason Cloudflare is fast for *reaching the edge*. From there:

- Cached responses: fast (no further trip).
- Workers: fast (run at the PoP).
- Origin-required: as fast as your origin can serve.

If your origin is slow, anycast can't fix it. What anycast fixes is *getting the user to a Cloudflare PoP* quickly.

## Three real-world scenarios

**Scenario 1: The TTFB drop.**
A team measured time-to-first-byte before and after Cloudflare. Drop from 250ms to 80ms globally. The TLS handshake savings dominated; cache hits added more. No origin changes; the latency improvement was structural.

**Scenario 2: The DDoS that didn't matter.**
A startup got a 2 Tbps DDoS aimed at one domain. Cloudflare's network absorbed it across hundreds of PoPs; their origin was unaffected. They wouldn't have survived without anycast distribution.

**Scenario 3: The asymmetric latency.**
A team had users worldwide but origin in US-East. Cloudflare made global users fast on cache hits but slow on cache misses (US-East trip required). They moved origin to a multi-region setup with reads in EU and APAC. Cache misses got faster for non-US users.

## Common mistakes to avoid

- **Thinking Cloudflare = origin.** It's a proxy; origin still matters.
- **Single-region origin behind global Cloudflare** is fine if cache hit rate is high; bad if most requests hit origin.
- **Not measuring cache hit rate.** A 30% hit rate on a global app leaves a lot of latency unsolved.
- **Treating anycast as magic.** Routing has edges; latency outliers exist.

## Read more

- [Cloudflare global network](https://www.cloudflare.com/network/)
- [Anycast explained](https://www.cloudflare.com/learning/cdn/glossary/anycast-network/)
- [How Cloudflare measures network performance](https://blog.cloudflare.com/network-performance-update/)

## Summary

- **Anycast** = one IP, many physical locations, BGP routes to nearest.
- 300+ Cloudflare PoPs worldwide, each running the full stack.
- **Latency drops** on TLS handshakes, cache hits, and edge execution.
- **DDoS absorption** is structural — attacks distribute geographically.
- **Origin location still matters** for cache misses.
- Check your routing with `https://www.cloudflare.com/cdn-cgi/trace`.

Next: what problems Cloudflare actually solves.
