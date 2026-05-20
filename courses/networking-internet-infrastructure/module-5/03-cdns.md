---
module: 5
position: 3
title: "CDNs and the edge"
objective: "Serve fast globally by getting close to users."
estimated_minutes: 5
---

# CDNs and the edge

## What a CDN does

Content Delivery Network: a network of servers distributed worldwide (POPs — points of presence) that cache content closer to users. Modern CDNs do much more — security, optimization, edge compute — but origin is content delivery.

For a user in Sydney requesting your assets:
1. DNS or anycast routes to nearest POP (Sydney CDN POP).
2. POP returns cached content directly (5-20ms latency).
3. If cache miss, POP fetches from your origin (potentially across continents), caches, returns.
4. Subsequent users hit the cache.

Result: most requests served from nearby; origin handles fewer requests; latency dramatically reduced.

## Major CDNs

- **Cloudflare.** Largest by edge locations (~300+). Free tier; broad feature set.
- **Akamai.** Original CDN; enterprise.
- **Fastly.** Programmable edge; popular with developers.
- **Amazon CloudFront.** AWS-integrated.
- **Google Cloud CDN.** GCP-integrated; uses Google's network.
- **Bunny.net.** Cost-conscious; popular for video.

Each has trade-offs in pricing, feature set, regions. For most apps: start with Cloudflare's free tier for HTTP, scale up as needs grow.

## Caching at the edge

The simplest CDN value: cache static content (HTML, CSS, JS, images, video) near users. Configure via:

**Cache-Control headers:**

```
Cache-Control: public, max-age=86400, immutable
```

- `public` — anyone can cache (CDNs, browsers).
- `max-age=86400` — for 1 day.
- `immutable` — content never changes (good for versioned files).

Versioning assets (`/static/main-abc123.js`) lets you cache aggressively — change the URL when content changes, browsers fetch the new one.

For HTML: shorter TTLs (60-300s) because content changes; for static assets: long TTLs (1 day to 1 year).

## Cache invalidation

The hard problem. When content changes mid-cycle:

- **Purge by URL.** CDN API to remove a specific cached object.
- **Purge by tag.** Set `Cache-Tag: blog-post-123` on responses; later purge all matching that tag.
- **Surrogate keys** (Fastly). Similar tag-based purging.
- **TTL expiration.** Wait it out.

For frequently-changing pages: cache aggressively with short TTLs + selective purging on change.

## Stale-while-revalidate

```
Cache-Control: max-age=60, stale-while-revalidate=86400
```

CDN serves stale content for up to 24h while fetching fresh in background. User sees fast response (cached); CDN updates cache. Reduces latency at the cost of slightly-stale content.

## Edge compute

Beyond caching, modern CDNs run code at the edge:

- **Cloudflare Workers.** V8 isolates running JS/Rust/etc. Sub-ms cold start.
- **Lambda@Edge / CloudFront Functions.** AWS's edge compute.
- **Fastly Compute@Edge.** WebAssembly-based.
- **Vercel Edge Functions.** Built on Cloudflare Workers infra.

Use cases:
- A/B testing routing.
- Auth checks before origin.
- Personalization (geo-based content).
- API aggregation.
- Image resizing.

Latency benefit: code runs in the same POP as the user, often sub-100ms total round trip including business logic.

## DDoS protection

CDNs naturally absorb DDoS — attack traffic distributes across the POP network instead of overwhelming origin. Major CDNs have specific defenses: rate limiting, JavaScript challenges, ML-based bot detection.

For high-risk targets (financial, gaming, controversial sites), CDNs are essentially required.

## Image and video optimization

CDNs increasingly transform content at the edge:

- **Image resizing.** Origin has 4K image; CDN returns 800px for mobile users.
- **Format conversion.** Serves WebP/AVIF to browsers that support; JPEG to others.
- **Video transcoding.** Adaptive bitrate streaming based on bandwidth.
- **Compression.** Brotli/gzip automatically.

Reduces bytes transferred dramatically; faster load times; lower data costs for users.

## CDN as a security layer

Beyond DDoS:

- **TLS.** CDN terminates; you get HTTPS for free with Let's Encrypt-style auto-cert.
- **WAF (Web Application Firewall).** Block common attacks (SQLi, XSS patterns) at the edge.
- **Bot management.** Detect / block scrapers.
- **Geo blocking.** Restrict by country.
- **Hotlink protection.** Don't let other sites embed your images.

Cloudflare in particular bundles many of these in tiers. For most apps: front everything with the CDN; benefit from security as a side effect.

## When to use a CDN

Almost always for public-facing web. Specifically:

- Static asset delivery → mandatory.
- API responses (with proper Cache-Control) → often worth it.
- Image / video → essential.
- WebSocket / streaming → CDN passes through; less benefit unless using their realtime products.

Skip: internal-only services (waste; latency to CDN > direct).

## Self-hosting CDN-like features

If your scale is small or you have unique requirements:

- nginx with proxy_cache as a basic CDN.
- Varnish as a sophisticated cache.
- Self-hosted across regions with a global LB.

Almost always more expensive (in time) than using a managed CDN. Worth it only at very specific use cases.

## Common pitfalls

- **No cache-control headers.** CDN caches with defaults that might not match intent.
- **Caching auth-required pages publicly.** Leaks one user's data to others. `Cache-Control: private`.
- **Not invalidating after deploys.** Old assets served from cache.
- **Long TTL on HTML.** Site updates not visible.
- **Origin not protected.** Attackers bypass CDN by IP-targeting origin. Allow only CDN IPs at origin firewall.

## Summary

- CDN = distributed cache + edge compute + security layer.
- Cache-Control headers govern caching; long TTL + versioned URLs for assets.
- Edge compute (Workers, Lambda@Edge, Compute@Edge) runs code near users.
- DDoS, WAF, bot mgmt, image optimization come bundled.
- Front public web apps with a CDN by default.
- Lock down origin to allow only CDN IPs.

Next: latency and bandwidth physics.
