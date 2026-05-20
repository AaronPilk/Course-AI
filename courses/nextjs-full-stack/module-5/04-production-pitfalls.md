---
module: 5
position: 4
title: "Common production pitfalls"
objective: "Hydration errors, cache misses, build failures."
estimated_minutes: 7
---

# Common production pitfalls

## The recurring ones

Across hundreds of Next.js apps shipping to production, a small set of issues comes up repeatedly. This lesson is a catalog: each pitfall, why it happens, how to fix it, how to prevent it.

## Hydration mismatch errors

**Symptom:** Console error: "Hydration failed because the initial UI does not match what was rendered on the server."

**Cause:** The HTML rendered on the server differs from what React tries to render on the client during hydration. React notices and complains.

Common triggers:

- **Using `Date.now()` or `Math.random()` in render.** Different value server vs client.
- **Using `window`, `localStorage`, `navigator` in Server Components (or in Client Components without checking).** Available client-side only.
- **Browser extensions modifying the HTML** (rare but happens).
- **CSS-in-JS solutions not properly configured for SSR.**
- **Conditional rendering based on `typeof window !== 'undefined'`** at top level.

**Fixes:**

- Move client-only logic into `useEffect`:
  ```tsx
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  ```
- Use `suppressHydrationWarning` for genuinely-different content (rare; like timestamps):
  ```tsx
  <time suppressHydrationWarning>{new Date().toISOString()}</time>
  ```
- Use the `useSyncExternalStore` pattern for client-only stores.

## Stale data after mutations

Covered Module 2 but worth repeating: most "data is stale" issues trace to missing `revalidatePath` or `revalidateTag` in Server Actions. Verify the action has revalidation calls before the redirect / return.

## Environment variable not defined

**Symptom:** `process.env.X is undefined` in production despite working locally.

**Causes:**

- Env not set in production hosting (Vercel dashboard → Environment Variables).
- Env set but only for Preview, not Production scope.
- Typo in env name.
- Used `process.env.X` in a Client Component without `NEXT_PUBLIC_` prefix.

**Fix:** Add env validation at startup (Module 2 of this course's previous lessons). Missing env vars fail fast with clear error.

## Build size warnings

**Symptom:** Build output warns about large pages or large `_app` JS bundle.

**Cause:** Heavy libraries (charts, editors, date libraries) imported into pages that should be small.

**Fix:**
- Run `@next/bundle-analyzer` to identify culprits.
- Dynamic imports for heavy client-only libraries.
- Push `'use client'` to leaf components, not pages.
- Use smaller alternatives (Day.js vs Moment, native Date over moment, etc.).

## TypeScript errors in production builds

**Symptom:** `next build` fails with TS errors that didn't show locally.

**Causes:**

- Local dev mode uses ts-loader's loose checking; build uses strict.
- IDE caching outdated.
- Pre-commit hooks not catching them.

**Fix:**

- Run `tsc --noEmit` locally before committing.
- Use CI to enforce: `tsc --noEmit && next build`.
- Don't disable strict types to hide problems.

## Memory leaks in serverless

**Symptom:** Function timeouts; cold starts; memory limit hits.

**Causes:**

- Holding references to large objects across requests (closures in module scope).
- Reusing connections incorrectly (some DB drivers leak on serverless).
- Event listeners not removed.

**Fix:**

- Don't store request-scoped data in module-level variables.
- Use connection-pooling-friendly DB drivers (use Prisma's connection pool, Postgres connection poolers).
- Verify with serverless-specific testing.

## Wrong URLs in production

**Symptom:** Links work locally but break in production (or vice versa).

**Causes:**

- Hardcoded `http://localhost:3000` in code.
- Wrong env var for the production URL.
- Missing protocol in env vars.

**Fix:**

- Use environment-aware URL construction:
  ```tsx
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  ```
- Set `NEXT_PUBLIC_BASE_URL` per environment.
- For Vercel deployments, use `process.env.VERCEL_URL` for preview deployments:
  ```tsx
  const url = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  ```

## Image domain errors

**Symptom:** `Invalid src prop on next/image, hostname X is not configured.`

**Cause:** External image domain not in `next.config.js`.

**Fix:**

```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
};
```

## CORS errors

**Symptom:** API requests to your Next.js API routes fail with CORS errors when called from another origin.

**Cause:** API routes don't have CORS headers by default; browser blocks cross-origin requests.

**Fix:** Set headers in the route or middleware:

```tsx
// app/api/posts/route.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN!,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return Response.json({ data }, { headers: corsHeaders });
}
```

Restrict `Access-Control-Allow-Origin` to specific origins; `*` only for truly public APIs.

## Cookies not setting

**Symptom:** Login flow runs, but the user isn't logged in afterward.

**Causes:**

- Setting cookies from a place that doesn't have access (e.g., Server Component, not Server Action).
- Missing `httpOnly: true`, `secure: true` requirements rejecting in browser.
- SameSite policy too strict for the flow.
- Path mismatch (cookie set on `/dashboard` not visible on `/api`).

**Fix:**

- Set cookies in Server Actions, Route Handlers, or middleware (not Server Components).
- Verify cookie attributes for the deployment environment (must be `secure: true` in HTTPS production).
- Check the browser's cookie list in DevTools to confirm the cookie was set.

## Build failures only on Vercel

**Symptom:** Builds locally; fails on Vercel.

**Causes:**

- Different Node version in package.json vs Vercel's default.
- Case-sensitivity differences (macOS dev is case-insensitive, Linux production is case-sensitive).
- Missing files committed to git.
- Different env vars.

**Fix:**

- Pin Node version: `"engines": { "node": "20.x" }`.
- Run case-sensitive checks: `npm run build` on a clean clone on Linux.
- Verify all needed files are committed.

## Hydration warnings for theme switching

**Symptom:** Dark/light mode causes hydration warnings.

**Cause:** Server doesn't know the user's theme preference; client knows from localStorage; HTML rendered differently.

**Fix:** Use a theme-management library (next-themes) that handles SSR properly with a `suppressHydrationWarning` strategy. Or render theme-aware UI only after hydration.

## Slow first paint on Vercel

**Symptom:** Production TTFB is slow.

**Causes:**

- Page is dynamic (uses cookies/headers) and serverless cold start adds latency.
- Database in a different region than the serverless function.
- Heavy synchronous work in render.

**Fix:**

- Co-locate function and database regions.
- Move heavy work to Suspense'd async components.
- Consider Edge runtime for simple routes.
- Pre-render where possible.

## Pre-launch checklist

Before going live:

1. Production build succeeds.
2. TypeScript strict passes.
3. All env vars set in production.
4. External image domains configured.
5. Error tracking active.
6. Web Vitals measured.
7. Bundle analyzer shows nothing surprising.
8. Cookies and auth work in production environment.
9. Cache invalidation tested.
10. Backup / rollback plan defined.

A failing item delays launch. Worth checking the whole list rather than discovering during the launch demo.

## Mistakes to avoid

- **Shipping without env validation.** Missing vars in production = crashes.
- **No error tracking from day one.** Issues invisible until users report.
- **Local-only testing.** Vercel preview is the production-like environment.
- **Hydration warnings ignored.** They cause real bugs eventually.
- **Caching not understood.** Stale data or unnecessary re-fetches.

## Summary

- Hydration errors trace to server/client divergence; fix or suppress with care.
- Stale data = missing revalidation in Server Actions.
- Env vars must be set per environment; validate at startup.
- External images need `remotePatterns`; cookies need proper attributes.
- Pin Node version; test on clean Linux build.
- Pre-launch checklist before going live.

Course complete.
