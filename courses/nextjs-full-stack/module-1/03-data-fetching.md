---
module: 1
position: 3
title: "Data fetching on the server"
objective: "fetch, caching, revalidation, dynamic vs static."
estimated_minutes: 7
---

# Data fetching on the server

## The new data-fetching model

In the App Router, data fetching is co-located with the component that uses it, runs on the server (in Server Components), and uses standard Web `fetch()` — no more `getServerSideProps`, `getStaticProps`, or `getInitialProps`.

```tsx
// app/blog/page.tsx — a Server Component
export default async function BlogPage() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());
  return <PostList posts={posts} />;
}
```

The component is `async` and you `await` data directly. No prop drilling from a special data-fetching function; the data exists where you render it.

## Caching with fetch

Next.js extends Web `fetch` with caching options. By default, fetched data is cached and treated as static (same response across requests). You opt out per call.

**Static (default — cached forever, until rebuilt):**
```tsx
const data = await fetch('https://api.example.com/posts');
```

**Dynamic (no cache; runs every request):**
```tsx
const data = await fetch('https://api.example.com/posts', {
  cache: 'no-store',
});
```

**Time-based revalidation (cached but re-fetched every N seconds):**
```tsx
const data = await fetch('https://api.example.com/posts', {
  next: { revalidate: 60 }, // re-fetch at most once per 60 seconds
});
```

**Tag-based revalidation (re-fetch when a tag is invalidated):**
```tsx
const data = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] },
});

// Later, in a Server Action or API route:
import { revalidateTag } from 'next/cache';
revalidateTag('posts');
```

The fetch-level caching is the lever for static vs dynamic. Most sites want a mix: some pages static (marketing, blog), some dynamic (dashboard, account), some ISR (revalidate every hour).

## Database access (without fetch)

For direct DB access (not via fetch), caching is controlled differently. Use `unstable_cache`:

```tsx
import { unstable_cache } from 'next/cache';

const getPosts = unstable_cache(
  async () => db.posts.findMany(),
  ['posts'],
  { revalidate: 60, tags: ['posts'] }
);

export default async function Page() {
  const posts = await getPosts();
  return <PostList posts={posts} />;
}
```

`unstable_cache` wraps an async function; calls with the same arguments hit the cache. Revalidation works like fetch.

(The `unstable_` prefix is a quirk; the API is widely used in production.)

## Dynamic functions force dynamic rendering

Some operations require runtime knowledge — they can't be statically pre-rendered. Using them in a Server Component forces dynamic rendering for that route:

- `headers()` — read request headers.
- `cookies()` — read cookies.
- `searchParams` (page prop) — read URL query params.
- `useSearchParams()` in Client Components — same.

```tsx
import { cookies } from 'next/headers';

export default async function Page() {
  const session = cookies().get('session');
  // Now this page is dynamic (renders on every request).
}
```

Mixing dynamic functions with static data unsurprisingly forces dynamic rendering for the page — Next.js can't pre-render what depends on request-time data.

## Static vs dynamic — when each wins

**Static rendering (the default for fetch without dynamic functions):**
- Generated at build time (or first request, then cached).
- Served from CDN.
- Sub-100ms TTFB.
- Best for marketing pages, blogs, documentation.

**Dynamic rendering (request-time):**
- Runs on the server every request.
- Slower TTFB (100-500ms typical).
- Required when content varies per user, time, or request.
- Best for dashboards, authenticated pages, search results.

**Incremental Static Regeneration (ISR — static with periodic revalidation):**
- Generated at build, then re-generated in the background every N seconds when a request comes in.
- CDN-served between revalidations.
- Best when content updates periodically but doesn't need to be live.

The combination: static for what you can pre-render; dynamic for what you can't; ISR for the middle.

## generateStaticParams for dynamic routes

For dynamic routes (`[slug]`), use `generateStaticParams` to pre-render all variations at build time:

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await db.posts.findMany();
  return posts.map(post => ({ slug: post.slug }));
}

export default async function Post({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return <Article post={post} />;
}
```

Now every blog post is statically generated at build time. Combined with ISR (`revalidate: 60`), new posts can be added without rebuilding the whole site.

## Parallel data fetching

Multiple fetches in the same component? Run them in parallel:

```tsx
export default async function Dashboard() {
  // Sequential (slow):
  // const user = await fetchUser();
  // const posts = await fetchPosts();

  // Parallel (fast):
  const [user, posts] = await Promise.all([
    fetchUser(),
    fetchPosts(),
  ]);

  return <DashboardUI user={user} posts={posts} />;
}
```

Always use `Promise.all` for independent fetches.

## Sequential when fetches depend on each other

If fetch B needs result from fetch A, sequential is fine:

```tsx
const user = await fetchUser();
const posts = await fetchPostsByUser(user.id);
```

But: prefer pushing this to a single query when possible. A `JOIN` in SQL beats two HTTP round-trips.

## Sharing fetched data across components

Two Server Components on the same page that need the same data: React's request deduplication handles it. Multiple `fetch()` calls to the same URL within a single request are de-duped automatically.

```tsx
// In two different components, both call:
const user = await fetch('/api/me');
// Next.js dedupes the actual fetch.
```

No need to lift state up; the framework handles deduplication.

## Streaming and partial rendering

Long-running fetches block the page from rendering. The fix: `Suspense`:

```tsx
import { Suspense } from 'react';

export default async function Dashboard() {
  return (
    <div>
      <FastHeader />  {/* Renders immediately */}
      <Suspense fallback={<Skeleton />}>
        <SlowChart />  {/* Streams in when ready */}
      </Suspense>
    </div>
  );
}

async function SlowChart() {
  const data = await fetchSlowData();
  return <Chart data={data} />;
}
```

The page streams to the client: fast parts immediately, slow parts when ready. Covered in the next lesson.

## Errors in data fetching

If a server fetch throws, the nearest `error.tsx` boundary catches it. Show a fallback UI instead of crashing:

```tsx
// app/dashboard/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Failed to load dashboard</h2>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
```

For non-fatal errors (one component fails but others should render), wrap that component in its own Suspense + error boundary.

## API routes vs Server Components for data

When to use API routes (route.ts) vs Server Components for data:

**Server Components:** for data shown on a page. Direct DB access, no HTTP overhead.

**API routes:** for data consumed externally (mobile app, webhooks, third-party integrations).

Don't write an internal API route just to fetch it from your own Next.js app. Server Components are the path.

## Performance recipes

- **Cache by default.** Most data doesn't need to be live; cache aggressively.
- **Revalidate by tag.** Mutations invalidate specific tags; surrounding data stays cached.
- **Parallel fetches always.** Sequential is the trap.
- **Pre-generate dynamic routes.** generateStaticParams + ISR.
- **Stream slow data.** Suspense splits the page.

## Mistakes to avoid

- **`cache: 'no-store'` everywhere.** Defeats caching benefits.
- **Sequential fetches when parallel would work.** Slow pages.
- **Forgetting generateStaticParams.** Each request hits the DB.
- **Reading cookies/headers without intent.** Forces dynamic rendering accidentally.
- **No error boundaries.** One failed fetch crashes the whole page.

## Summary

- Data fetching is co-located in Server Components; use `await fetch()`.
- Default cache behavior is "cache forever"; opt into dynamic or time/tag revalidation.
- Dynamic functions (cookies, headers, searchParams) force dynamic rendering.
- generateStaticParams pre-renders dynamic routes; combine with ISR.
- Parallel fetches via Promise.all; deduplication is automatic.
- Stream slow data via Suspense; isolate errors via error boundaries.

Next: streaming and Suspense.
