---
module: 5
position: 2
title: "Caching and conditional requests"
objective: "Serve faster, reduce origin load."
estimated_minutes: 5
---

# Caching and conditional requests

## What HTTP caching solves

If many users request the same data, computing it for each is wasteful. HTTP has a rich caching model — browser caches, intermediate proxy caches, CDNs all participate via headers.

For APIs that return cacheable content (public data, infrequently-changing resources), caching dramatically reduces origin load and improves latency.

## Cache-Control

The primary directive:

```
Cache-Control: public, max-age=3600
```

- **public.** Anyone can cache (CDNs, browsers).
- **private.** Only browser; CDNs don't cache (per-user data).
- **no-cache.** Cache it, but always validate before using.
- **no-store.** Don't cache at all.
- **max-age=N.** Fresh for N seconds.
- **s-maxage=N.** Like max-age but for shared caches (CDNs).
- **stale-while-revalidate=N.** Serve stale for N seconds while fetching fresh.
- **immutable.** Never re-validate (for versioned URLs).

For typical APIs:

```
# Public reference data
Cache-Control: public, max-age=86400, stale-while-revalidate=3600

# User-specific
Cache-Control: private, max-age=60

# Never cacheable
Cache-Control: no-store
```

## ETags and conditional GETs

ETag = a hash or version identifier for the response:

```
GET /users/123
→ 200 OK
  ETag: "v3-abc123"
  {...}
```

Next request, client includes the ETag:

```
GET /users/123
If-None-Match: "v3-abc123"

→ 304 Not Modified
  (no body)
```

If the resource hasn't changed, server returns 304 (much smaller); client uses cached body. Saves bandwidth and serialization.

For your API: compute ETags from a row's `updated_at` or content hash. Implementations: hash the response, or use database version columns.

## Last-Modified

Older mechanism, similar idea:

```
GET /users/123
→ Last-Modified: Wed, 15 May 2026 14:00:00 GMT

GET /users/123
If-Modified-Since: Wed, 15 May 2026 14:00:00 GMT

→ 304 Not Modified
```

ETag is more precise (handles non-time-based changes). Use ETag where possible; Last-Modified as fallback.

## What to cache, what not

**Cache (public, longer TTL):**
- Static content (images, CSS, JS).
- Reference data (country list, currency rates).
- Aggregations (yesterday's leaderboard).

**Cache (private, shorter TTL):**
- User-specific reads that change slowly (`GET /users/me`).
- Settings; preferences.

**Don't cache:**
- Anything with auth-bound content unless you're sure of cache key separation.
- Writes (POST, PATCH, DELETE).
- Real-time data (live stock prices, chat messages).

The dangerous mistake: caching authenticated responses publicly. One user's response is served to others. Always set `private` for auth-bound content; `public` only for genuinely shared content.

## CDN-friendly APIs

For maximum cache hits at the CDN layer:

- Use `Cache-Control: public, max-age=N` for cacheable endpoints.
- Use `Vary: Authorization` if responses differ per token (CDN caches per-Auth value).
- Use `Vary: Accept-Language` if responses differ per language.
- Don't include session cookies in URLs (defeats caching).

Cloudflare, Fastly, CloudFront cache based on Cache-Control. Pair with edge compute for dynamic personalization without busting cache.

## Vary header

Tell caches which request headers affect the response:

```
Cache-Control: public, max-age=3600
Vary: Accept-Language, Authorization
```

CDN now caches separately per-language and per-token. Without Vary, cache might serve one user's response to another.

For private content: `Vary: Authorization` is critical. Without it, cache might serve user A's "GET /me" to user B.

## Cache invalidation

The hard problem. When content changes mid-TTL:

- **Wait for TTL.** Stale content until expiry.
- **CDN purge API.** Most CDNs let you POST to remove specific URLs from cache.
- **Cache tags.** Tag responses; purge by tag (Fastly Surrogate-Key, Cloudflare Cache-Tag).
- **Bust via URL.** Versioned URLs (`/v123/users/123`) — change URL, old version eventually expires.

For frequently-updated resources: short TTLs + `stale-while-revalidate` so cache returns fast (stale) while updating in background.

## API client caching

Sophisticated clients (browsers, mobile apps with HTTP libraries) cache responses according to headers. Your API benefits:

```
HTTP/1.1 200 OK
Cache-Control: max-age=60
ETag: "v1-abc"
```

Next request within 60 seconds → client uses cached. After 60s → conditional GET with If-None-Match; gets 304 or 200.

For backend services calling APIs: HTTP client libraries (urllib3, requests-cache, axios with cache adapter) handle this. Free wins.

## Avoiding cache poisoning

If a malicious request cached as response that affects others:

- **Don't include user-controlled input in cache keys** without `Vary`.
- **Sanitize what goes into responses.**
- **Use `private` for anything user-specific.**

Cache poisoning attacks (Web Cache Deception) have hit real apps. Audit your cache config.

## When caching is the wrong tool

For:
- Highly-personalized responses (every response differs).
- Real-time data (every second).
- High-write workload (cache invalidation cost > savings).

Skip HTTP caching; might still cache at the database / app layer (Redis, memcached) for compute reuse without HTTP semantics.

## Mistakes to avoid

- **No Cache-Control headers.** Caches use defaults that may not match intent.
- **Public caching of private data.** One user's data served to others.
- **Long TTL without versioning URLs.** Updates not visible.
- **Forgetting Vary.** Wrong response served to wrong client.
- **No ETag/Last-Modified.** Bandwidth wasted on unchanged data.

## Summary

- `Cache-Control: public/private + max-age` is the main directive.
- ETag + If-None-Match → 304 Not Modified saves bandwidth.
- Use `Vary: Authorization` for auth-aware caching.
- Private content: `Cache-Control: private`.
- Versioned URLs + `immutable` for static assets.
- CDN purge for invalidation; tags for grouped purges.

Next: observability.
