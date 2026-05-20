---
module: 1
position: 4
title: "Streaming and Suspense"
objective: "Progressive rendering for fast TTFB."
estimated_minutes: 7
---

# Streaming and Suspense

## The TTFB problem

Traditional SSR renders the entire page on the server, then sends the complete HTML to the browser. Time to First Byte (TTFB) waits for the slowest piece of data. A dashboard with one slow query holds back everything.

Streaming changes this. The server starts sending HTML as soon as the fast parts are ready, then streams in the slower parts as they resolve. The browser shows content immediately; slow components arrive progressively.

This is one of the App Router's biggest wins. Combined with Suspense, you get fast-TTFB pages even when individual parts are slow.

## How streaming works

The React Server Components protocol sends HTML in chunks. When the server hits a `Suspense` boundary with an unresolved child, it sends the fallback HTML immediately and continues processing the rest of the page. When the suspended data resolves, the server sends the real content as a stream chunk; the browser swaps it in.

```tsx
import { Suspense } from 'react';

export default function Dashboard() {
  return (
    <div>
      <Header />  {/* Renders immediately */}
      <Suspense fallback={<Skeleton />}>
        <SlowList />  {/* Streams when ready */}
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <SlowChart />  {/* Streams when ready, independently */}
      </Suspense>
    </div>
  );
}
```

Result: Header renders instantly; the two skeletons appear immediately; the real list and chart fade in as each finishes loading. Independently — neither blocks the other.

## Async Server Components and Suspense

Any async Server Component can be suspended:

```tsx
async function SlowList() {
  const items = await fetchSlowItems();
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;
}
```

When the page hits this component, if it hasn't resolved yet, React suspends. The nearest Suspense boundary shows its fallback. When the fetch finishes, the component renders and streams to the browser.

No special hook or wrapper needed. `async` functions + Suspense compose naturally.

## loading.tsx — automatic top-level Suspense

`loading.tsx` in a route folder is automatically wrapped around the entire page in a Suspense boundary:

```
app/dashboard/
├── loading.tsx
└── page.tsx
```

Equivalent to:

```tsx
<Suspense fallback={<LoadingFromFile />}>
  <DashboardPage />
</Suspense>
```

Useful for whole-page loading states. For fine-grained progressive rendering, use Suspense directly inside the page.

## Composition patterns

The most powerful streaming pattern: a page with multiple Suspense boundaries, each isolating a slow component.

```tsx
export default function Page() {
  return (
    <div>
      {/* Renders instantly — no data fetch */}
      <Hero />
      
      {/* Streams independently */}
      <Suspense fallback={<RecentPostsSkeleton />}>
        <RecentPosts />
      </Suspense>
      
      <Suspense fallback={<PopularPostsSkeleton />}>
        <PopularPosts />
      </Suspense>
      
      <Suspense fallback={<CommentsSkeleton />}>
        <RecentComments />
      </Suspense>
      
      {/* Renders instantly */}
      <Footer />
    </div>
  );
}
```

Each Suspense boundary is independent. Whichever data resolves first streams first. The header and footer render immediately.

## Streaming and SEO

A common worry: does streaming hurt SEO? Generally no:

- Google's crawlers wait for the full page including streamed content.
- The initial HTML payload includes enough structure for indexing.
- Streamed-in content is part of the final DOM and is indexed.

If you have content that's critical for SEO and don't want it inside Suspense (e.g., main page heading and body), keep it outside the Suspense boundaries. Streaming is for components that benefit from progressive loading, not your primary content.

## Streaming and crawlers

Some HTTP clients don't handle streamed responses well — particularly older HTTP libraries and some webhook receivers. In those cases, you may need to disable streaming for specific endpoints. But for browsers, streaming is universally supported.

## Errors within Suspense

If a suspended component throws, the error propagates to the nearest error boundary. You can combine Suspense + error.tsx for graceful failure:

```tsx
<Suspense fallback={<Skeleton />}>
  <RiskyComponent />
</Suspense>
```

If `RiskyComponent` throws, the page's `error.tsx` catches it. The user sees the error UI; the rest of the page (above the boundary) remains rendered.

For finer-grained errors (one component failing but others should render), wrap each in both Suspense and a custom error boundary.

## When NOT to stream

Streaming isn't always the right tool:

- **Above-the-fold content.** Don't stream what should be visible immediately; render eagerly.
- **Fast queries.** If a query takes 10ms, don't bother with Suspense; the overhead exceeds the win.
- **Critical data.** Authentication checks, paywalls — should resolve before rendering, not stream in.

Use Suspense for components that legitimately take time (300ms+) and benefit from progressive loading. Don't reach for it for every component.

## Combined static + streaming

A common pattern: most of the page is static (CDN-served, instant TTFB); a few sections stream in dynamic content.

```tsx
export default function Page() {
  return (
    <div>
      <StaticHero />          {/* Pre-rendered, instant */}
      <StaticFeatureList />   {/* Pre-rendered, instant */}
      
      <Suspense fallback={<Skeleton />}>
        <DynamicPersonalizedSection />  {/* Streams in */}
      </Suspense>
      
      <StaticFooter />        {/* Pre-rendered, instant */}
    </div>
  );
}
```

Best of both worlds: static-fast page with personalized dynamic pieces. The dynamic Suspense boundary opts that section out of static caching while keeping the rest cached.

## Sequential vs parallel data inside Suspense

A common pattern: each Suspense wraps a single data fetch. They run in parallel automatically because the framework processes the tree concurrently.

```tsx
<>
  <Suspense fallback={<A />}>
    <ComponentThatFetchesA />  {/* Starts fetching immediately */}
  </Suspense>
  <Suspense fallback={<B />}>
    <ComponentThatFetchesB />  {/* Starts fetching immediately */}
  </Suspense>
</>
```

Both fetches kick off in parallel; the slower one suspends longer; both stream when ready.

## Suspense in Client Components

Client Components can also use Suspense — useful when integrating with data libraries (React Query, SWR, etc.):

```tsx
'use client';
import { useSuspenseQuery } from '@tanstack/react-query';

function ClientList() {
  const { data } = useSuspenseQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  });
  return <ul>{data.map(...)}</ul>;
}

// Parent:
<Suspense fallback={<Skeleton />}>
  <ClientList />
</Suspense>
```

The Client Component suspends in the browser; same Suspense semantics.

## Streaming and SEO meta tags

Meta tags (title, description, og:image) must render in the initial HTML for crawlers to see them. Don't put them inside Suspense boundaries — use `generateMetadata` for dynamic meta tags:

```tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return { title: post.title };
}
```

Next.js handles `generateMetadata` separately from the streamed body, ensuring it's in the initial HTML.

## Mistakes to avoid

- **Streaming above-the-fold content.** Defeats the purpose.
- **Too-granular Suspense.** Wrapping every tiny component creates overhead.
- **No fallback UI.** Empty fallback = flash of nothing.
- **Forgetting error boundaries with Suspense.** Streamed errors crash the page.
- **Streaming critical paywall/auth checks.** Should block, not stream.

## Summary

- Streaming sends HTML progressively as parts of the page resolve.
- `Suspense` boundaries define stream points; fallback shows while suspended.
- Each Suspense boundary is independent — slow parts don't block fast parts.
- `loading.tsx` wraps the whole page in Suspense automatically.
- Combine with parallel fetches for max performance.
- Don't stream above-the-fold or critical content.
- generateMetadata for meta tags (not streamed).

Next module: mutations with Server Actions.
