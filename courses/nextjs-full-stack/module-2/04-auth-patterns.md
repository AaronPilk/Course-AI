---
module: 2
position: 4
title: "Authentication patterns"
objective: "Cookies, middleware, and route protection."
estimated_minutes: 7
---

# Authentication patterns

## The auth surface in App Router

Authentication in App Router involves several touchpoints:

- **Reading session** in Server Components and Server Actions.
- **Setting/clearing cookies** during login/logout.
- **Protecting routes** that require auth.
- **Redirecting** unauthenticated users.
- **Refreshing tokens** without breaking the user's flow.

The App Router gives you the building blocks (`cookies`, `headers`, middleware, `redirect`). Most teams use a library on top: NextAuth.js (Auth.js), Clerk, Supabase Auth, Lucia, or roll their own with a session store.

This lesson covers the patterns; pick your library or implementation.

## Reading the session

In Server Components and Server Actions:

```tsx
import { cookies } from 'next/headers';

async function getSession() {
  const sessionToken = cookies().get('session')?.value;
  if (!sessionToken) return null;
  return await verifySession(sessionToken);
}

export default async function ProtectedPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  
  return <Dashboard user={session.user} />;
}
```

`cookies()` is a server-only function; calling it forces dynamic rendering for the route (it depends on request data).

Always verify the session — don't trust the cookie value blindly. Use HMAC signing, JWT verification, or a session store lookup.

## Setting cookies during login

```tsx
'use server';
import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  const user = await authenticate(email, password);
  if (!user) return { error: 'Invalid credentials' };
  
  const token = await createSessionToken(user.id);
  
  cookies().set('session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  
  redirect('/dashboard');
}
```

Cookie attributes that matter:

- **httpOnly: true** — prevents JavaScript access (XSS protection).
- **secure: true** — HTTPS only.
- **sameSite: 'lax'** — protects against CSRF; 'strict' for extra safety.
- **path: '/'** — cookie applies to all routes.

## Clearing cookies on logout

```tsx
'use server';
import { cookies } from 'next/headers';

export async function logout() {
  cookies().delete('session');
  redirect('/');
}
```

Optionally invalidate the session in your store too:

```tsx
const token = cookies().get('session')?.value;
if (token) await invalidateSession(token);
cookies().delete('session');
```

## Middleware for route protection

`middleware.ts` runs before every request matching its config. Use it to protect routes:

```tsx
// middleware.ts (project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  
  // Protect /dashboard and /settings
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Redirect logged-in users away from login
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/login'],
};
```

Middleware runs on Edge by default — fast, but limited APIs (no Node.js APIs, no databases directly). Use middleware for checks that don't need full server resources.

For protection that needs database lookups (e.g., "is the user's subscription still active?"), do that in Server Components or Server Actions; middleware just checks the cookie's existence.

## The "verify in middleware vs verify in page" question

Middleware can verify a session token (JWT signature, expiration). It usually shouldn't hit the database — that's slow and runs on every request, including assets if the matcher is broad.

Pattern:

- **Middleware**: cheap check — does the cookie exist? Is the JWT signature valid? Is it expired? Redirect early if not.
- **Page/Layout**: full verification — load the user, check status, RBAC checks.

A layout above protected routes can run the deeper check:

```tsx
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session || !session.user.active) redirect('/login');
  return <>{children}</>;
}
```

Middleware catches obvious unauth requests early; the layout enforces the real auth check.

## Server Action auth checks

Every Server Action that needs auth should verify on its own:

```tsx
'use server';

export async function deletePost(id: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  
  const post = await db.posts.findUnique({ where: { id } });
  if (post.authorId !== session.user.id) throw new Error('Forbidden');
  
  await db.posts.delete({ where: { id } });
  revalidatePath('/posts');
}
```

Don't rely on UI gating (hiding the delete button) — the server is the security boundary. Anyone can call the action directly.

## OAuth flows

OAuth providers (Google, GitHub, etc.) require a callback URL handler. Use `route.ts`:

```tsx
// app/auth/callback/google/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  // Exchange code for tokens with Google.
  const tokens = await exchangeCode(code);
  const profile = await fetchProfile(tokens.access_token);
  
  // Upsert user.
  const user = await upsertUser({ provider: 'google', ...profile });
  
  // Create session.
  const token = await createSessionToken(user.id);
  cookies().set('session', token, { httpOnly: true, secure: true, sameSite: 'lax' });
  
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

Libraries (Auth.js, Clerk) handle this for you. Roll your own only if you have specific needs.

## CSRF protection

Server Actions are CSRF-protected by default — Next.js validates Origin and content type. As long as your form uses `action={serverAction}`, you're protected.

For custom POST endpoints (route.ts handlers), validate Origin manually or use a CSRF token pattern.

## Session refresh

Long-lived sessions need a refresh strategy:

- **JWT with short expiration + refresh token**: client refreshes when access expires.
- **Database session with sliding expiration**: server extends on each request.
- **Both**: belt and suspenders.

In Next.js, middleware can detect near-expiration JWTs and refresh them transparently:

```tsx
export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return NextResponse.next();
  
  const { exp, userId } = await verifyJWT(session);
  
  if (exp - Date.now() < 5 * 60 * 1000) {  // < 5 min remaining
    const newToken = await createJWT(userId);
    const response = NextResponse.next();
    response.cookies.set('session', newToken, { /* ... */ });
    return response;
  }
  
  return NextResponse.next();
}
```

The client doesn't see the refresh; just stays logged in seamlessly.

## Library recommendations

**NextAuth.js (Auth.js)**: open source, supports many providers, JWT and database sessions, well-integrated with App Router.

**Clerk**: managed, polished UI components, MFA, organizations built-in. Pay for the convenience.

**Supabase Auth**: pairs with Supabase backend (covered in Course #16); database integration built-in.

**Lucia**: lightweight session library; you bring your own UI and database.

**Roll your own**: only if you have specific compliance needs or want full control. Most teams shouldn't.

## Multi-tenant patterns

For B2B apps where users belong to multiple orgs:

- Store `current_org_id` in the session or as a separate cookie.
- Middleware can validate org membership.
- Server Components/Actions check both auth and org context.
- Switching orgs updates the cookie and revalidates.

Covered in Supabase course Module 3; same patterns apply with any backend.

## Mistakes to avoid

- **Trusting client-side gating.** Hide UI but verify on the server.
- **No httpOnly on session cookies.** XSS can steal them.
- **Same-site: 'none' without good reason.** CSRF risk.
- **Database lookups in middleware.** Slow on every request.
- **Forgetting to invalidate sessions on logout.** Server-side token still valid.
- **Hardcoded JWT secrets in code.** Use env vars; rotate periodically.

## Summary

- `cookies()` in Server Components/Actions for session reads.
- Set cookies with httpOnly, secure, sameSite for safety.
- Middleware for cheap auth checks; layouts/Server Actions for deeper checks.
- Every Server Action that needs auth must verify on its own.
- CSRF protection is automatic for Server Actions.
- Use a library (Auth.js, Clerk, Supabase) unless you have specific needs.
- Refresh tokens in middleware for seamless long-lived sessions.

Next module: routing patterns.
