---
module: 4
position: 4
title: "Performance debugging"
objective: "Lighthouse, Web Vitals, bundle analyzer."
estimated_minutes: 7
---

# Performance debugging

## The diagnostic workflow

Performance problems in Next.js apps usually fit a small set of categories: oversized JS bundles, slow server data fetches, missing image optimization, third-party scripts, render-blocking resources. Each has standard diagnostic tools.

This lesson covers the workflow: measure → identify the bottleneck → fix → measure again.

## Core Web Vitals

The three metrics that matter most:

- **LCP (Largest Contentful Paint):** time until the largest element renders. Target <2.5s.
- **INP (Interaction to Next Paint):** how snappy the page feels. Target <200ms.
- **CLS (Cumulative Layout Shift):** how much layout shifts during load. Target <0.1.

Google uses these in search ranking. Users feel them as "fast, snappy, stable."

## Lighthouse

Chrome DevTools' Lighthouse runs a full audit on a page:

1. Open DevTools → Lighthouse tab.
2. Select "Mobile" (most users are mobile; desktop is easy mode).
3. Click "Analyze page load."
4. Wait 30 seconds.
5. Get scored on Performance, Accessibility, Best Practices, SEO.

Lighthouse output:

- **Numerical scores** (0-100) per category.
- **Specific issues** with explanations and links to docs.
- **Filmstrip** showing how the page rendered over time.
- **Tree of recommendations** prioritized by impact.

Run on staging or production URLs. Lighthouse on dev mode shows misleadingly slow numbers (no minification, no caching).

## What Lighthouse flags

Common Lighthouse complaints for Next.js apps:

**"Largest Contentful Paint slow"**:
- Hero image not optimized (`<img>` instead of `<Image>`).
- Hero image missing `priority`.
- Font loading blocking text render.

**"Reduce unused JavaScript"**:
- Large client bundles from heavy libraries.
- Components marked `'use client'` that don't need to be.

**"Reduce server response time"**:
- Slow server queries.
- No caching on dynamic routes.

**"Avoid an excessive DOM size"**:
- Rendering 10k items at once instead of virtualizing.

**"Properly size images"**:
- Missing `sizes` prop on responsive images.

Each issue has a fix; Lighthouse tells you where to look.

## Real user monitoring (RUM)

Lighthouse measures one synthetic load. Real users have different networks, devices, geographies. RUM tools measure actual users:

- **Vercel Analytics** — built-in for Vercel deployments; tracks CWV per page.
- **Google Search Console** — Core Web Vitals report based on Chrome User Experience data.
- **Sentry Performance** — combines errors with performance.
- **Datadog RUM, New Relic Browser** — enterprise options.

RUM tells you what users actually experience; Lighthouse tells you what's possible. Use both.

## Bundle analysis

Heavy JavaScript bundles hurt every metric. Find what's in your bundle:

```bash
npm install @next/bundle-analyzer
```

```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... other config
});
```

```bash
ANALYZE=true npm run build
```

Opens visual treemaps showing which modules contribute how much to your bundle. Common surprises:

- **Charting libraries** (Chart.js, D3) bundled for client pages that only use a fraction.
- **Date libraries** (moment.js, date-fns whole package) when only a few functions are used.
- **Markdown renderers** (marked, remark) pulled into client bundle unnecessarily.
- **Lodash full import** when individual functions would suffice.

Solutions:

- **Dynamic imports** for libraries used only conditionally.
- **Tree-shaking imports** (`import { specific } from 'lib'`).
- **Server-side only** logic moved to Server Components (no client bundle).
- **Smaller alternatives** (Day.js vs Moment).

## Dynamic imports for client-only heavy code

```tsx
'use client';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('./chart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export function Dashboard() {
  return <Chart data={...} />;
}
```

`Chart` loads only when this component mounts; not part of initial bundle. The skeleton shows while the chunk downloads.

Use for:
- Charts, rich text editors, anything heavy.
- Modals and dialogs (load when opened).
- Tabs (load when first viewed).

## Server timings

To debug slow server rendering:

```tsx
// Add a Server-Timing header.
import { unstable_after } from 'next/server';

export default async function Page() {
  const start = Date.now();
  const data = await fetchSlowData();
  console.log('fetch took', Date.now() - start);
  return <Content data={data} />;
}
```

Vercel's runtime logs and tooling show server execution times. For deeper profiling:

- Wrap suspected slow code with `console.time` / `console.timeEnd`.
- Use `unstable_after` to defer logging until after response sent.
- For DB queries, log query times at the database layer (Postgres slow query log).

## Network waterfall

Chrome DevTools → Network tab shows every request. Look for:

- **Long initial server response.** TTFB > 1s suggests slow rendering or no caching.
- **Long font/CSS loads blocking render.** Inline critical CSS, use `next/font`.
- **Large bundles.** Bundle analyzer first.
- **Sequential requests when parallel would work.** Frontend doing waterfall fetching.
- **Third-party scripts blocking the main thread.** Move to `<Script strategy="afterInteractive">` or `lazyOnload`.

The Network tab + filter to "Doc" + "JS" + "CSS" + "Font" shows the critical path.

## Third-party scripts

Analytics, chat widgets, A/B testing tools add significant overhead:

```tsx
import Script from 'next/script';

<Script
  src="https://example.com/analytics.js"
  strategy="afterInteractive"  // Load after the page is interactive.
/>

<Script
  src="https://example.com/chat-widget.js"
  strategy="lazyOnload"  // Load when idle.
/>
```

Strategies:

- `beforeInteractive` — blocks rendering; rare.
- `afterInteractive` (default) — loads after page interactive.
- `lazyOnload` — loads when idle.
- `worker` — load via Web Worker (experimental).

`lazyOnload` for chat widgets, marketing scripts, anything not critical.

## Compression

Ensure responses are compressed:

- Brotli > Gzip > none.
- Vercel and most hosts auto-compress; verify in DevTools (Response Headers should show `content-encoding`).

Self-hosted Next.js with Nginx/Caddy needs explicit compression config.

## Caching headers

For static assets:

- Hash-named files (Next.js does this) → cache forever with `Cache-Control: public, max-age=31536000, immutable`.
- Unhashed files (rare in Next.js) → shorter max-age.

For pages:

- Static pages: cached by CDN, served from edge.
- Dynamic pages: usually no cache; tune via `revalidate`.

Verify in Network tab → response headers. `Cache-Control` and `Age` tell you what's happening.

## Profiling React renders

If client-side rendering is slow, React DevTools Profiler:

1. Install React DevTools browser extension.
2. Open the Profiler tab.
3. Hit record, interact with the page, stop.
4. See flame chart of component renders.

Look for:

- Components rendering far more often than expected.
- Re-renders triggered by parent re-renders (consider memoization).
- Expensive components rendering frequently.

`useMemo`, `useCallback`, `React.memo` for genuine perf bottlenecks. Don't over-apply.

## Production vs development

Always profile production builds:

- Dev mode disables minification, runs React DevMode (slower), no caching.
- Production has fast minified JS, full caching, optimized images.

`npm run build && npm run start` runs production locally. Or test on a Vercel preview deployment.

Dev-mode Lighthouse scores are meaningless. Production is what matters.

## A performance checklist

Before declaring a page "done":

1. Run Lighthouse on production URL; aim for 90+ on Performance.
2. CWV pass: LCP <2.5s, INP <200ms, CLS <0.1.
3. Bundle analyzer shows no surprising bloat.
4. Hero image uses `<Image priority>`.
5. Fonts via `next/font`.
6. Third-party scripts use appropriate strategy.
7. RUM data confirms real-user experience matches Lighthouse.

If any fails, fix before launch.

## Mistakes to avoid

- **Optimizing in dev mode.** Different from production.
- **Lighthouse on localhost.** Network conditions misleading.
- **No bundle analyzer.** Bloat hides in plain sight.
- **Optimizing every component.** Bottlenecks are usually concentrated.
- **Ignoring third-party scripts.** Analytics and chat are often the biggest perf drags.

## Summary

- Run Lighthouse on production; aim for 90+.
- Core Web Vitals: LCP <2.5s, INP <200ms, CLS <0.1.
- Bundle analyzer for JS bloat; dynamic imports for heavy client-only code.
- `next/image` + `next/font` for media.
- `<Script strategy="lazyOnload">` for non-critical third-party scripts.
- Use RUM (Vercel Analytics, Search Console) for real-user data.
- Profile production builds, not dev.

Next module: production deployment.
