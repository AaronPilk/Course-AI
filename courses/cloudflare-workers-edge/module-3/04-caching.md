---
module: 3
position: 4
title: "Caching strategies"
objective: "Cache API, CDN, and KV."
estimated_minutes: 6
---

# Caching strategies

## Layers of cache

Cloudflare Workers have multiple caching options:

1. **Cloudflare CDN cache.** Automatic for cacheable responses.
2. **Workers Cache API.** Programmatic per-request caching.
3. **KV cache.** Eventually consistent global cache.
4. **Workers Cache via Cache API + R2.** Edge cache for object storage.

Each fits different needs. Often you'll stack them.

## CDN cache (free)

For URLs with cacheable responses, the Cloudflare CDN caches automatically based on `Cache-Control` headers:

```ts
return new Response(data, {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300, s-maxage=600',
  },
});
```

- `max-age`: browser cache TTL (5 min).
- `s-maxage`: CDN cache TTL (10 min); overrides max-age for proxies.

Subsequent requests for the same URL within the window hit the CDN, not your Worker. Zero CPU cost; sub-50ms anywhere.

For dynamic Workers that should NOT be cached: set `Cache-Control: no-store` or `private`.

## Workers Cache API

For programmatic control:

```ts
async fetch(request: Request, env: Env, ctx: ExecutionContext) {
  const cache = caches.default;
  const cacheKey = new Request(request.url, request);
  
  // Try cache:
  let response = await cache.match(cacheKey);
  if (response) return response;
  
  // Cache miss; compute:
  const data = await fetchData();
  response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
  
  // Store in cache for next time:
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  
  return response;
}
```

`caches.default` is the per-Cloudflare-data-center cache (not global). Each edge location maintains its own; a hit in Tokyo doesn't help San Francisco.

For per-user, per-path, or per-method caching, customize the cacheKey:

```ts
const cacheKey = new Request(`${request.url}?user=${userId}`, request);
```

## KV as global cache

For globally-replicated caches (slower writes; faster reads everywhere):

```ts
async fetch(request: Request, env: Env, ctx: ExecutionContext) {
  const key = `feed:${userId}`;
  
  // Try KV:
  const cached = await env.CACHE.get(key, 'json');
  if (cached) return Response.json(cached);
  
  // Cache miss:
  const data = await computeFeed(userId, env);
  
  // Store in KV with TTL:
  ctx.waitUntil(env.CACHE.put(key, JSON.stringify(data), { expirationTtl: 300 }));
  
  return Response.json(data);
}
```

KV: global; sub-ms reads from edge cache after first access; eventually consistent on writes.

Cache API: per-edge-location; instant in same region; nothing in other regions until that region populates.

KV is better for "globally cached value" patterns. Cache API is better for HTTP-style URL-based caching.

## Stale-while-revalidate

Combine fresh-feeling responses with background refresh:

```ts
async fetch(request: Request, env: Env, ctx: ExecutionContext) {
  const key = `data:${id}`;
  
  const cached = await env.CACHE.get(key, 'json');
  if (cached) {
    // Serve cached immediately; refresh in background:
    ctx.waitUntil(refreshCache(key, env));
    return Response.json(cached);
  }
  
  // First request; compute synchronously:
  const data = await compute(id);
  await env.CACHE.put(key, JSON.stringify(data), { expirationTtl: 60 });
  return Response.json(data);
}
```

User always sees fast response; data refreshes in the background. Trades some staleness for snappy UX.

## Cache invalidation

Cache invalidation is hard. Strategies:

**Time-based (TTL):** simplest. Just expire. Data is stale for at most the TTL.

**Tag-based (CF Pages / commercial CDNs):** invalidate by tag. Cloudflare Cache Tags (Enterprise feature) lets you `PURGE` by tag.

**Key-pattern (KV):** delete specific keys when underlying data changes:

```ts
// When a user updates their profile:
await c.env.DB.prepare('UPDATE users SET ...').run();
await c.env.CACHE.delete(`user:${userId}`);
```

**Version key in URL:** `data.json?v=2`. Old URL cached forever; new URL cached fresh. Used for assets.

Pick based on freshness requirements. Most data tolerates a minute or two of staleness; some doesn't.

## Vary headers

For per-user cached responses:

```ts
return new Response(personalData, {
  headers: {
    'Cache-Control': 'private, max-age=60',
    'Vary': 'Authorization',
  },
});
```

`Vary: Authorization` means cache by Authorization header. Different users get different cached responses.

But `private` in Cache-Control means "browser caches; CDN doesn't" — so this only helps the user's own browser.

For per-user CDN caching, you'd customize cache keys via Workers Cache API instead.

## Conditional requests

For freshness checks:

```ts
const cached = await env.STORAGE.get(key);
if (cached) {
  const etag = cached.etag;
  const ifNoneMatch = request.headers.get('If-None-Match');
  if (ifNoneMatch === etag) return new Response(null, { status: 304 });
  return new Response(cached.body, {
    headers: { 'ETag': etag, 'Cache-Control': 'max-age=60' },
  });
}
```

304 Not Modified saves bandwidth — the client knows its version is still good.

R2 supports ETags natively; KV doesn't directly.

## Cache + R2 for images

Common pattern: serve images from R2 + Cache API at the edge:

```ts
async fetch(request: Request, env: Env, ctx: ExecutionContext) {
  const url = new URL(request.url);
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), request);
  
  let response = await cache.match(cacheKey);
  if (response) return response;
  
  const obj = await env.ASSETS.get(url.pathname.slice(1));
  if (!obj) return new Response('Not found', { status: 404 });
  
  response = new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400, immutable',
      'ETag': obj.httpEtag,
    },
  });
  
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
```

First request fetches from R2 + caches; subsequent serves from edge cache. Combined with Image Resizing for transforms.

## When NOT to cache

- **User-specific writes.** Always fresh.
- **Auth-critical responses.** Don't cache 200 OK from a failed auth check.
- **Personalized highly-dynamic content.** Cache key explosion.
- **Single-use tokens / nonces.** Caching defeats the purpose.

Default to caching public, static content. Be deliberate about what doesn't cache.

## Diagnosing cache behavior

`CF-Cache-Status` header in responses:

- `HIT` — served from cache.
- `MISS` — fetched fresh; cached now.
- `EXPIRED` — was cached but TTL passed.
- `BYPASS` — explicitly skipped cache.
- `DYNAMIC` — not eligible for caching.

Combined with `wrangler tail` and request logging, you can diagnose what's hitting cache vs origin.

## Mistakes to avoid

- **No Cache-Control headers.** Default behavior often surprises.
- **Caching error responses.** Users see cached errors after fix deployed.
- **Per-user URLs without cache key isolation.** One user's data shown to another.
- **Long TTLs without invalidation strategy.** Stale data lingers.
- **Forgetting `ctx.waitUntil` on cache.put.** Cache write blocks the response.

## Summary

- Cloudflare CDN caches automatically based on Cache-Control.
- Workers Cache API for programmatic per-Worker caching.
- KV for globally-replicated caches (slower writes; fast global reads).
- Stale-while-revalidate via cached + waitUntil background refresh.
- Customize cache keys for per-user or per-context caching.
- Pair Cache API + R2 for fast image/asset serving.
- Default to caching; be deliberate about what doesn't.

Next module: beyond HTTP.
