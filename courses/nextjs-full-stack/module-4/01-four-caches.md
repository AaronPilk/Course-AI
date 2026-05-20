---
module: 4
position: 1
title: "The four caches"
objective: "Request, data, full route, router caches."
estimated_minutes: 7
---

# The four caches

## Why caching is confusing in Next.js

Next.js has four distinct caching layers. Each operates at a different level and is invalidated by different mechanisms. The complexity exists because each layer optimizes a different concern, but the result is that "why is my data stale?" or "why is my data not stale?" can be hard to debug without knowing which cache is involved.

This lesson is a map of all four. Understand them once; reach for the right one when debugging.

## Layer 1: Request memoization

**What it does:** Deduplicates identical `fetch()` calls within a single render pass.

If three Server Components on the same page each call `fetch('/api/me')`, the actual HTTP request happens once. The result is cached in memory for the duration of that request and returned to all callers.

**Lifetime:** Single request. Discarded after the response is sent.

**Invalidation:** None needed — it's per-request.

**What's cached:** `fetch()` calls with the same URL + options.

**Why it matters:** You can call data-fetching functions multiple times in a render tree without worrying about N+1 HTTP requests. Build composition naturally; the framework dedupes.

```tsx
// In two Server Components both calling getUser():
async function getUser() {
  return fetch('/api/me').then(r => r.json());
}

// Both components run, but fetch happens once.
```

## Layer 2: Data cache

**What it does:** Persists `fetch()` results across requests, across users, across deployments (if you don't bust them).

By default, every `fetch()` is cached indefinitely. Different requests for the same page hit the cache; no re-fetch unless you opt out or trigger revalidation.

**Lifetime:** Indefinite by default; configurable via `next.revalidate` or `revalidateTag`/`revalidatePath`.

**Invalidation:**
- `cache: 'no-store'` opts out per-call.
- `next: { revalidate: 60 }` sets time-based revalidation.
- `next: { tags: ['posts'] }` + `revalidateTag('posts')` for tag-based.
- `revalidatePath('/posts')` for path-based.

**What's cached:** `fetch()` results with cacheable options. Calls with `cache: 'no-store'` skip this layer entirely.

This is what most "Next.js caching" discussions mean. The data cache is why you can have static + ISR + dynamic pages from the same fetch syntax.

```tsx
// Cached forever.
const posts = await fetch('/api/posts');

// Cached for 60s.
const posts = await fetch('/api/posts', { next: { revalidate: 60 } });

// Never cached.
const posts = await fetch('/api/posts', { cache: 'no-store' });
```

## Layer 3: Full route cache

**What it does:** Caches the rendered HTML and React tree of static routes at build time (and during ISR revalidation).

When a request comes in for a static route, Next.js serves the pre-built HTML from cache instead of rendering from scratch. CDN-friendly, sub-100ms TTFB.

**Lifetime:** Until the route is revalidated (via ISR or explicit revalidation).

**Invalidation:**
- `revalidatePath(path)` invalidates the full route cache for that path.
- Time-based revalidation when a fetch in the route hits its revalidate window.

**What's cached:** The fully-rendered HTML + RSC payload for static routes.

A route becomes "dynamic" (skips this cache) when it uses any dynamic function (cookies, headers, searchParams) or fetches with `cache: 'no-store'`.

The full route cache is what makes Next.js dramatically faster than vanilla server rendering — most pages serve as static.

## Layer 4: Router cache (client-side)

**What it does:** Caches the rendered output of route segments on the client. When you navigate between pages, the framework can re-use cached segments instead of fetching them again.

**Lifetime:** Per session in memory. Cleared on hard reload, navigation away, or explicit invalidation.

**Invalidation:**
- `router.refresh()` clears the router cache.
- `revalidatePath` / `revalidateTag` clear it on next navigation.
- Hard reload clears everything.

**What's cached:** RSC payloads received from the server for visited routes.

This is why the back button is instant — the previous page is in the router cache. Also why you sometimes see "stale" UI after a mutation: the router cache still has the old version. `router.refresh()` after a non-revalidating mutation fixes it.

## How they interact

The flow when a user requests a page:

1. **Router cache hit?** → Serve from client cache. Done.
2. Otherwise, request goes to server.
3. **Full route cache hit?** → Serve cached HTML/RSC. Done.
4. Otherwise, render the page.
5. During render, `fetch()` calls check **data cache**:
   - Hit → return cached data.
   - Miss → make the real HTTP call, store in data cache.
6. During render, **request memoization** dedupes within the render pass.
7. Render completes, response sent.
8. Static routes' rendered output is stored in the full route cache.
9. Client receives, caches in the router cache.

Each layer has its own invalidation. Bug-hunting: figure out which layer is serving stale data.

## Bypassing caches

To opt out everywhere:

```tsx
// Per-fetch:
fetch(url, { cache: 'no-store' });

// Per-page (forces all fetches in this page to dynamic):
export const dynamic = 'force-dynamic';

// Per-page (opts into dynamic but doesn't force):
import { cookies } from 'next/headers';
cookies(); // Now the page is dynamic.

// Disable client router cache:
// (no clean way; use `router.refresh()` after mutations)
```

For purely-static pages with no user-specific content, default caching is correct. For per-user dashboards, you usually want dynamic rendering.

## Cache hierarchy diagram

```
Client (Router Cache)
    ↓ miss
CDN/Server (Full Route Cache)
    ↓ miss
Server Renders Page
    ↓ during render
    ├─ Request Memoization (within this render)
    └─ Data Cache (across requests)
            ↓ miss
        Origin (database, API, file system)
```

Each miss falls through to the next layer.

## Debugging stale data

When data looks stale, identify the cache:

**Client UI updated but stale on hard reload:** Probably router cache (cleared on hard reload, so issue is elsewhere). Or full route cache for static pages.

**Static page shows old content even after rebuild:** Full route cache + data cache. May need `revalidatePath` or rebuild with `revalidate: 0`.

**Server Action ran but page still shows old data:** Missing `revalidatePath` / `revalidateTag` in the action. Data cache still has old version.

**fetch shows different data than expected:** Probably data cache. Add `cache: 'no-store'` to verify; reapply caching once correct.

A systematic approach: add explicit revalidation; if that fixes it, you know which cache; tune from there.

## Debugging missing cache

When data is fresh but should be cached:

**Pages slow despite no apparent dynamic behavior:** Check for accidental dynamic functions (cookies, headers, searchParams) forcing dynamic rendering.

**fetch always hits origin:** Verify caching options; default should be cache-by-default. `cache: 'no-store'` or dynamic page disables it.

## Explicit cache control

For non-fetch data (database queries, computations), use `unstable_cache`:

```tsx
import { unstable_cache } from 'next/cache';

const getPostBySlug = unstable_cache(
  async (slug: string) => db.posts.findUnique({ where: { slug } }),
  ['post-by-slug'],
  { revalidate: 60, tags: ['posts'] }
);
```

Wraps an async function; same data-cache semantics as fetch. Useful for direct DB access.

## Production cache strategy

A typical site:

- **Marketing pages:** static + full route cache. Revalidate on demand when content changes.
- **Blog posts:** static + ISR (`revalidate: 3600`). Tags for explicit invalidation when posts update.
- **Dashboard:** dynamic (cookies for auth). Selective `unstable_cache` for slow shared queries.
- **API integrations (external):** time-based revalidation for non-critical, tag-based for important.

Mix the cache strategies based on freshness needs.

## Mistakes to avoid

- **`cache: 'no-store'` everywhere.** Defeats caching.
- **Forgetting revalidation after mutations.** Stale data displayed.
- **Confusing data cache and router cache.** Different layers, different fixes.
- **Dynamic functions in components that should be static.** Forces unnecessary dynamic.
- **Not tagging fetches.** Hard to invalidate later.

## Summary

- Four caches: request memoization (per-request dedup), data cache (per-fetch), full route cache (per-route HTML), router cache (per-client).
- Default to caching; opt out per-fetch with `cache: 'no-store'` or revalidation.
- `revalidatePath` / `revalidateTag` invalidate data + full route + router cache for relevant paths.
- Debug stale: which cache is serving the old data? Address that layer.
- Production: mix static + ISR + dynamic based on freshness.

Next: static vs dynamic rendering.
