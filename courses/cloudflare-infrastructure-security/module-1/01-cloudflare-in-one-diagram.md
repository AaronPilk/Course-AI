---
module: 1
position: 1
title: "Cloudflare in one diagram — what's actually happening"
objective: "Draw the request path from user to Cloudflare to origin and explain each hop."
estimated_minutes: 9
---

# Cloudflare in one diagram — what's actually happening

## The puzzle

Cloudflare is sold as many things: CDN, DDoS protection, DNS, security, edge compute, Zero Trust, R2 storage, AI inference. The marketing covers everything; the *what is it actually* gets lost.

If you can hold the request path in your head — what happens between a user typing a URL and your origin server responding — every Cloudflare product becomes intuitive. Without it, you're poking buttons in a dashboard.

## The simple version

When a user requests your domain on Cloudflare:

```
User → DNS lookup → nearest Cloudflare PoP → (caching, security, Workers) → origin
                                              ← response ←
```

Cloudflare sits in the middle as a **reverse proxy**. Every product is a layer on that proxy — caching responses, blocking bad traffic, running your code at the edge before reaching origin (or in place of it).

That's the whole mental model. The rest is details.

## The technical version

### The request lifecycle

1. **User types `example.com`** in their browser.
2. **DNS lookup**: returns one of Cloudflare's anycast IPs because your DNS is on Cloudflare and proxy mode is on (the orange cloud).
3. **TCP connection** to the nearest Cloudflare PoP (data center). Cloudflare has 300+ globally.
4. **TLS handshake** between the user and Cloudflare's edge.
5. **Cloudflare's edge** processes the request:
   - **DDoS / security checks**: block obvious bad actors.
   - **WAF rules**: block matching attack patterns.
   - **Rate limits**: enforce your limits.
   - **Cache lookup**: if cacheable and present, serve from cache. Done.
   - **Worker runs**: if you have a Worker bound to this route, it runs here.
6. **If origin needed**: Cloudflare opens a second connection to your origin server.
7. **Origin responds**.
8. **Cloudflare may cache the response**.
9. **Edge sends response back** to the user.

Every Cloudflare product slots into one of these steps. Caching at step 5. WAF at step 5. Workers at step 5 (or replacing 6+ entirely). Zero Trust at step 5 (deciding whether the user is allowed).

### Why this matters for architecture

Cloudflare is **always in the request path** when proxy mode is on. That means:

- It sees every request and response.
- It can block, modify, transform, or short-circuit any of them.
- Your origin doesn't see traffic Cloudflare blocked (DDoS, WAF rejects, cache hits).
- Your origin's IP can stay hidden — only Cloudflare's IPs are public.

This is the leverage. One position in the request path; many layers of value.

### Proxy mode (orange cloud) vs. DNS-only (gray cloud)

Each DNS record in Cloudflare can be:

- **Orange cloud (proxied)**: traffic flows through Cloudflare. All features active.
- **Gray cloud (DNS only)**: Cloudflare serves the DNS record; traffic goes directly to your origin. No features.

For features to apply, the record must be orange. Common confusion: people enable a Cloudflare feature but their DNS record is gray. Feature does nothing.

### Free tier vs. paid

Most of Cloudflare's *core* features are free:

- DNS, anycast routing, CDN caching, basic DDoS, free SSL, Workers (with generous limits).

Paid tiers add:

- Enterprise WAF rules, advanced rate limiting, image optimization, more Workers compute, premium support, advanced analytics.

For most small-to-mid sites, free + Workers Paid ($5/month for compute) covers what you need. Larger workloads scale into Business / Enterprise plans.

### The "Cloudflare in front of everything" pattern

A common deployment:

- Domain points at Cloudflare DNS (orange cloud).
- WAF rules block obvious attacks.
- Caching set for static assets.
- A Worker handles edge logic (auth, A/B routing, redirects).
- Origin is on a cloud provider, behind Cloudflare's IP range.

Compare to: domain pointed at an origin IP directly. Every attack hits your server. Every cacheable response is regenerated. Every redirect goes to origin.

The pattern is foundational for modern web architecture.

### What changes when you put Cloudflare in front

- **Origin IP can be hidden** (and should be — Cloudflare-only IP allowlist).
- **Cache hits never reach origin** — big traffic reduction.
- **Bad traffic dropped at edge** — DDoS, WAF, rate limits.
- **Lower TLS latency** — handshakes terminate at the nearest PoP, not your distant origin.
- **Real client IP is in headers** — `cf-connecting-ip` because your origin sees Cloudflare's IP.

That last one trips people up frequently. Your access logs and rate limiters need to read `cf-connecting-ip`, not the connection's remote IP.

### Where Cloudflare doesn't sit

If you skip Cloudflare entirely (gray cloud or no Cloudflare):

- Direct user → origin connection.
- No caching, no security, no edge compute.
- Origin IP is public.
- TLS terminates at origin.

Sometimes this is correct (you're using a different CDN, or testing without Cloudflare). Most of the time it's a misconfiguration.

### The PoP topology

Cloudflare has 300+ PoPs (Points of Presence) worldwide. Each one:

- Runs the full edge stack (caching, security, Workers).
- Connects via anycast routing — users automatically hit the nearest PoP.
- Replicates configuration globally within ~30 seconds of changes.

That replication is why "I just changed my WAF rule, why is it not applying?" usually resolves itself in seconds — it's propagating.

## Three real-world scenarios

**Scenario 1: The orange-cloud surprise.**
A developer enabled WAF rules but their main A record was DNS-only. Traffic bypassed Cloudflare entirely; the rules were never applied. They orange-clouded the record; rules took effect. Lesson: proxy mode is required for Cloudflare features to fire.

**Scenario 2: The hidden origin IP win.**
A team's origin was getting hammered by DDoS. They moved DNS to Cloudflare, orange-clouded, and restricted origin firewall to Cloudflare's IP range only. DDoS traffic stopped reaching origin entirely. The attackers couldn't find the real IP anymore.

**Scenario 3: The wrong client IP.**
A team's rate limiter used the raw remote IP. Behind Cloudflare, every request appeared to come from a Cloudflare IP — rate limits applied app-wide, not per-user. Switching to `cf-connecting-ip` fixed it.

## Common mistakes to avoid

- **Gray-cloud records when you want Cloudflare features** — features don't apply.
- **Origin firewall not restricted to Cloudflare IPs** — attackers route around Cloudflare.
- **Reading wrong client IP** — log and rate-limit using `cf-connecting-ip`.
- **Assuming gray-cloud = "Cloudflare off but DNS managed"** — yes, but consequences must be understood.
- **Treating Cloudflare as one product** — it's a stack of products at one position in the path.

## Read more

- [Cloudflare developers — Get started](https://developers.cloudflare.com/fundamentals/get-started/)
- [Anycast explained](https://www.cloudflare.com/learning/cdn/glossary/anycast-network/)
- [How Cloudflare works (high level)](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/)

## Summary

- Cloudflare sits between users and your origin as a **reverse proxy**.
- The request path: user → DNS → nearest PoP → (security, cache, Workers) → origin.
- Every Cloudflare product is a layer on this proxy.
- **Proxy mode (orange cloud)** is required for features to apply.
- **Hide your origin IP** behind Cloudflare; restrict origin firewall to Cloudflare's IP range.
- **Use `cf-connecting-ip`** in app logic that needs the real client IP.
- **PoP-and-anycast topology** = users automatically hit the nearest location.

Next: anycast and the edge.
