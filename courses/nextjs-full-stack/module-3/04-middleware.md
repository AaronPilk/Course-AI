---
module: 3
position: 4
title: "Middleware and edge logic"
objective: "Auth, A/B testing, geo, redirects."
estimated_minutes: 7
---

# Middleware and edge logic

## What middleware is

`middleware.ts` is a single file at your project root (or in `src/`) that runs before every matching request. It executes on Vercel's Edge runtime (or your hosting provider's edge) — close to the user, fast, with limited APIs.

Common uses:

- **Auth gating.** Redirect unauthenticated users to login.
- **Redirects and rewrites.** Restructure URLs without changing routing.
- **A/B testing.** Route users to different variants based on cookies or headers.
- **Geographic routing.** Direct users to region-specific content.
- **Bot detection / rate limiting.**
- **Custom headers.** Add CSP, security headers.
- **Locale detection.** Route to language-specific paths.

Middleware is the place for cross-cutting concerns that apply to many routes.

## Basic structure

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Run logic on the request.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

`matcher` defines which paths run middleware. The default in the example matches everything except API routes, static assets, and favicon — a common pattern.

## The matcher

Matcher syntax:

```tsx
export const config = {
  matcher: [
    '/dashboard/:path*',     // /dashboard and all sub-paths
    '/api/admin/:path*',     // /api/admin and all sub-paths
    '/((?!_next/static).*)', // everything except _next/static
  ],
};
```

You can also use the `matcher` field with negative patterns or specific paths. Performance matters — middleware runs on every matched request, including assets if you don't exclude them.

## Auth redirect pattern

```tsx
export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const path = request.nextUrl.pathname;
  
  // Protect /dashboard
  if (path.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect logged-in users away from login
  if (path === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}
```

Middleware redirects happen before any page renders — fast, no flash of unauthenticated content.

## Rewrites — change route without URL change

```tsx
export function middleware(request: NextRequest) {
  // Internal: /products/old-id rewrites to /products/new-id
  if (request.nextUrl.pathname === '/products/old-id') {
    return NextResponse.rewrite(new URL('/products/new-id', request.url));
  }
  return NextResponse.next();
}
```

URL stays `/products/old-id` in the browser; the server renders `/products/new-id`. Useful for legacy URLs or A/B testing routes.

## Redirects — change URL

```tsx
if (request.nextUrl.pathname === '/old-page') {
  return NextResponse.redirect(new URL('/new-page', request.url), 301);
}
```

301 for permanent, 302/307 for temporary. The browser navigates to the new URL.

## A/B testing via middleware

```tsx
export function middleware(request: NextRequest) {
  const bucket = request.cookies.get('ab-bucket')?.value;
  
  if (!bucket && request.nextUrl.pathname === '/landing') {
    // Assign user to a bucket.
    const newBucket = Math.random() < 0.5 ? 'a' : 'b';
    const response = NextResponse.next();
    response.cookies.set('ab-bucket', newBucket, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }
  
  // Route to variant.
  if (request.nextUrl.pathname === '/landing' && bucket === 'b') {
    return NextResponse.rewrite(new URL('/landing-b', request.url));
  }
  
  return NextResponse.next();
}
```

Sticky bucket: once assigned, always shown the same variant. Track conversions per bucket.

## Geo routing

Vercel provides geo info on the request:

```tsx
export function middleware(request: NextRequest) {
  const country = request.geo?.country;
  const city = request.geo?.city;
  
  if (country === 'GB' && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/uk', request.url));
  }
  
  // Pass region info to the page via headers.
  const response = NextResponse.next();
  response.headers.set('x-user-country', country || 'US');
  return response;
}
```

The page (or Server Components reading headers via `headers()`) can adapt to user location.

## Locale detection

```tsx
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // If path doesn't have a locale prefix, detect and redirect.
  if (!path.match(/^\/(en|es|fr|de)\//)) {
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferred = parseAcceptLanguage(acceptLanguage);
    const locale = ['en', 'es', 'fr', 'de'].includes(preferred) ? preferred : 'en';
    return NextResponse.redirect(new URL(`/${locale}${path}`, request.url));
  }
  
  return NextResponse.next();
}
```

For internationalized sites; route users to the right language version automatically.

## Security headers

```tsx
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}
```

Apply via middleware or via Next.js's `next.config.js` headers. Middleware is more flexible (conditional headers per route).

## Rate limiting

```tsx
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }
  
  return NextResponse.next();
}
```

Per-IP rate limit on API routes. Use a serverless KV store (Upstash, Vercel KV) for the counter.

## Edge runtime constraints

Middleware runs on Edge — fast and global but with limits:

- **No Node.js APIs.** No fs, no native bindings.
- **Limited libraries.** Some npm packages don't work; check before adopting.
- **Strict timeouts.** Must complete quickly (typically <30s; usually <100ms).
- **No direct database connections.** Use HTTP-based databases (Upstash, Neon serverless, Supabase via HTTP) or pass to a Node runtime page/action for DB work.

If you need Node APIs in middleware: you can switch with `export const runtime = 'nodejs'` (in some hosting configurations), but you lose the Edge benefits.

## When NOT to use middleware

Middleware runs on every matched request. Heavy logic in middleware adds latency to everything. Skip when:

- **The check needs a database.** Move to layout or page.
- **Logic is page-specific.** Put it in the page.
- **It's expensive.** Edge time costs add up.

Use middleware for fast, cross-cutting checks. Save real work for pages and actions.

## Debugging middleware

Middleware errors can be hard to debug — they happen before any page renders. Tips:

- Log generously in development; remove for production.
- Use try/catch around any risky operations; return `NextResponse.next()` on failure.
- Test on Vercel Preview deployments, not just localhost (Edge runtime behaves differently).
- Use Vercel's runtime logs to see middleware execution.

## Common patterns combined

A typical production middleware:

```tsx
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 1. Add security headers.
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // 2. Auth check on protected routes.
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // 3. Refresh near-expiry sessions.
  const token = request.cookies.get('session')?.value;
  if (token && nearExpiry(token)) {
    const refreshed = await refresh(token);
    response.cookies.set('session', refreshed, { httpOnly: true });
  }
  
  // 4. Geo info pass-through.
  response.headers.set('x-country', request.geo?.country || 'US');
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## Mistakes to avoid

- **Heavy work in middleware.** Adds latency everywhere.
- **DB queries in middleware.** Edge runtime issues; slow.
- **Matcher too broad.** Runs on assets, wasting compute.
- **Forgetting to handle errors.** Throws break the entire request pipeline.
- **Using Node APIs in Edge runtime.** Build fails.

## Summary

- Middleware runs before every matched request, at the edge.
- Use for auth gating, redirects, rewrites, A/B testing, geo, headers, rate limiting.
- Matcher controls which paths run middleware.
- Edge runtime has constraints: no Node APIs, no direct DB, strict timeouts.
- Save real work for pages/actions; middleware is for fast cross-cutting checks.

Next module: caching, revalidation, and performance.
