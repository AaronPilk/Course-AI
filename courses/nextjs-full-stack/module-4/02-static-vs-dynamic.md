---
module: 4
position: 2
title: "Static vs dynamic rendering"
objective: "ISR, SSG, SSR — when to use which."
estimated_minutes: 7
---

# Static vs dynamic rendering

## The three rendering modes

Next.js routes render in one of three modes:

- **Static (SSG)** — pre-rendered at build time, served from CDN.
- **Dynamic (SSR)** — rendered on every request, on the server.
- **ISR** — pre-rendered statically, periodically regenerated.

The framework picks based on what the route does. You can override explicitly. Picking right makes the difference between sub-100ms TTFB and seconds.

## How the framework decides

By default, Next.js renders routes statically. A route becomes dynamic when:

- It uses `cookies()`, `headers()`, or `searchParams`.
- It uses a `fetch()` with `cache: 'no-store'`.
- It explicitly declares `export const dynamic = 'force-dynamic'`.
- It uses other dynamic functions like `noStore()`.

If none of those apply, the route is static.

This means a typical content page (Server Component, just fetches public data) renders statically with no opt-in needed. Add `cookies()` for auth and it becomes dynamic automatically.

## Static rendering — when it wins

Static is best for:

- **Marketing pages.** Landing page, about, pricing — content doesn't change per user.
- **Blogs and documentation.** Post content varies by URL but is the same for everyone.
- **Product catalogs.** SKUs and details that change rarely.
- **Help center articles.**

Performance: CDN-served, sub-100ms TTFB, scales infinitely.

Tradeoffs: stale data between revalidations; not personalized.

## Dynamic rendering — when it wins

Dynamic is best for:

- **User dashboards.** Content varies per user; cookies/auth needed.
- **Search results.** Query string drives the content.
- **Real-time data.** Stock prices, sports scores, live counters.
- **Account settings, profile pages.** Authenticated, user-specific.

Performance: 100-500ms typical TTFB; runs server every request.

Tradeoffs: slower; doesn't scale to zero-cost like static; consumes server resources.

## ISR — the middle path

Incremental Static Regeneration combines the two:

- Build time: pre-render some or all pages.
- Runtime: serve the cached version from CDN.
- Periodically: regenerate stale pages in the background.

The page LOOKS static (fast, CDN-served) but stays fresh.

```tsx
// app/blog/[slug]/page.tsx
export const revalidate = 60; // re-generate at most every 60 seconds.

export default async function Post({ params }) {
  const post = await getPost(params.slug);
  return <Article post={post} />;
}
```

Behavior:

- First request after revalidate window expires: serves stale, kicks off regeneration in background.
- Subsequent requests after regeneration completes: get the new version.
- No user waits for regeneration.

This is the "best of both worlds" mode for content that changes occasionally but doesn't need to be live.

## Per-fetch revalidation

Different fetches in the same page can have different revalidate windows:

```tsx
// User profile rarely changes — long cache.
const profile = await fetch('/api/profile/123', {
  next: { revalidate: 3600 }, // 1 hour
});

// Stats update more frequently.
const stats = await fetch('/api/stats/123', {
  next: { revalidate: 60 }, // 1 minute
});
```

The page is dynamic in effect but each fetch caches independently. Useful when different data has different freshness needs.

## Explicit dynamic / static

Force a route's behavior:

```tsx
// Force dynamic — every request renders.
export const dynamic = 'force-dynamic';

// Force static — error if dynamic functions are used.
export const dynamic = 'force-static';

// Default (let the framework decide).
// export const dynamic = 'auto';
```

`force-static` is useful for pages you want fully cached even though they use cookies for some metadata purpose. (Use with care.)

`force-dynamic` is rarely needed — usually you have a dynamic function that already triggers it. Explicit declaration documents intent.

## Per-page revalidate

```tsx
export const revalidate = 60;
```

Sets the route's max-age. Equivalent to setting `revalidate: 60` on all fetches in the page. Useful for whole-page freshness needs.

## generateStaticParams for dynamic routes

Dynamic routes (`[slug]`) need explicit pre-generation:

```tsx
export async function generateStaticParams() {
  const posts = await db.posts.findMany({ select: { slug: true } });
  return posts.map(post => ({ slug: post.slug }));
}

export const revalidate = 60;
```

Build time: all known slugs are pre-rendered. Runtime: new slugs render on-demand (if `dynamicParams = true`, the default). Revalidate window keeps existing slugs fresh.

This is the standard pattern for blogs, documentation, product pages — dynamic by URL but static by content.

## When to mix

A single site usually mixes all three:

- **Static**: marketing, public blog, FAQ. (Default behavior, no `revalidate` needed.)
- **ISR**: blog post pages (`generateStaticParams` + `revalidate: 3600`).
- **Dynamic**: user dashboard, account settings (no special config needed; cookies trigger it).

Each route picks its mode based on freshness and personalization needs.

## Performance comparison

For a typical e-commerce product page:

- **Static (built daily):** 50ms TTFB. Can be wrong (stale price, out-of-stock not reflected).
- **ISR (revalidate 60s):** 50ms TTFB. Lags up to 60s but converges.
- **Dynamic:** 300ms TTFB. Always live.

For a checkout page (per-user cart):

- **Static:** Doesn't work; needs auth.
- **ISR:** Doesn't work; per-user.
- **Dynamic:** 300ms TTFB. Required.

Match the mode to what the page needs.

## Force-dynamic gotchas

Adding `export const dynamic = 'force-dynamic'` disables all caching for the route. Every request runs through the data cache layer too — fetches without `next.revalidate` still hit origin.

For pages that should be dynamic for rendering but cache-friendly for data:

```tsx
export const dynamic = 'force-dynamic';

async function Page() {
  // Still cached at the data layer.
  const posts = await fetch('/api/posts', {
    next: { revalidate: 60 },
  });
  return <Posts posts={posts} />;
}
```

The page renders fresh each request but reuses cached data within the window. Mix carefully.

## Common patterns

**Mostly-static site with a few dynamic pages:**
- Default static; specific pages with cookies/auth opt into dynamic.

**Mostly-dynamic app (dashboard, SaaS):**
- Default dynamic (due to auth); specific marketing pages explicitly static.

**Content-heavy site with a few personalized features:**
- Static + ISR for content; dynamic routes for personalization; "logged in?" check via Client Component overlay.

## Mistakes to avoid

- **Forcing dynamic when not needed.** Slow pages.
- **Static when content needs to be live.** Stale data.
- **No revalidate on dynamic routes.** Cached forever after first generation.
- **`cookies()` in pages that should be static.** Forces dynamic accidentally.
- **`force-static` with dynamic functions.** Build fails.

## Summary

- Static (SSG): pre-built at build time; CDN-served; fastest. Default for content pages.
- Dynamic (SSR): rendered every request; required for per-user / per-request content.
- ISR: static + periodic regeneration; best for content that changes occasionally.
- Use `revalidate` to set freshness window.
- `generateStaticParams` for dynamic routes with finite IDs.
- Mix all three within a site.

Next: image and font optimization.
