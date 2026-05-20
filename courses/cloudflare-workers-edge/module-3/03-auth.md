---
module: 3
position: 3
title: "Authentication patterns"
objective: "JWT, sessions, OAuth at the edge."
estimated_minutes: 6
---

# Authentication patterns

## Auth at the edge

Workers receive requests; need to know who's calling; route or reject accordingly. Common patterns:

- **JWT verification.** Stateless tokens; verify signature; check claims.
- **Session lookup.** Token in cookie/header; look up in KV/DO; load user.
- **OAuth callbacks.** Receive provider redirect; exchange code; create session.
- **API keys.** Long-lived tokens scoped to integrations.

This lesson covers the patterns; specific provider integration follows the same shape.

## JWT verification

Workers can verify JWTs without external calls — fast, cheap:

```ts
import { jwt } from 'hono/jwt';

app.use('/api/*', jwt({ secret: c.env.JWT_SECRET }));

app.get('/api/me', (c) => {
  const payload = c.get('jwtPayload');  // typed in newer Hono
  return c.json({ userId: payload.sub });
});
```

The middleware:
1. Extracts JWT from `Authorization: Bearer ...` (or cookie).
2. Verifies signature against the secret.
3. Checks expiration.
4. Makes payload available on context.
5. Rejects with 401 if invalid.

For RSA/ECDSA (verifying tokens from external providers like Auth0, Clerk, Supabase Auth):

```ts
import { jwt } from 'hono/jwt';

app.use('/api/*', jwt({
  jwks: { uri: 'https://provider.auth0.com/.well-known/jwks.json' },
}));
```

Fetches public keys; verifies; caches. No shared secret needed for asymmetric.

## Session-based auth

For session tokens stored in KV:

```ts
app.use('/api/*', async (c, next) => {
  const token = getCookie(c, 'session') || c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'No session' }, 401);
  
  const user = await c.env.SESSIONS.get(`session:${token}`, 'json');
  if (!user) return c.json({ error: 'Invalid session' }, 401);
  
  c.set('user', user);
  await next();
});

app.get('/api/me', (c) => {
  return c.json(c.get('user'));
});
```

Session in KV; lookup per request; sub-ms read from edge cache after first hit.

For DOs-based sessions (more flexible; allows revocation, real-time updates):

```ts
const doId = c.env.SESSIONS_DO.idFromName(`session:${token}`);
const stub = c.env.SESSIONS_DO.get(doId);
const user = await stub.fetch('https://internal/get').then(r => r.json());
```

DO gives strong consistency and richer behavior; KV is faster for simple lookups.

## Setting cookies

```ts
import { setCookie } from 'hono/cookie';

app.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  // ... verify credentials
  const token = await createSession(user, c.env);
  
  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  
  return c.json({ ok: true });
});
```

`httpOnly` prevents JS access (XSS protection); `secure` requires HTTPS; `sameSite: 'Lax'` blocks most CSRF.

For cross-site setups: `sameSite: 'None'` + `secure: true` required.

## OAuth callbacks

For OAuth providers (Google, GitHub, etc.):

```ts
app.get('/auth/google', (c) => {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', c.env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', `${c.env.APP_URL}/auth/google/callback`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  return c.redirect(url.toString());
});

app.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) return c.text('Missing code', 400);
  
  // Exchange code for tokens:
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${c.env.APP_URL}/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });
  
  const { access_token } = await tokenRes.json();
  
  // Get user info:
  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const profile = await userRes.json();
  
  // Upsert user in DB:
  const user = await upsertUser(profile, c.env);
  
  // Create session:
  const token = crypto.randomUUID();
  await c.env.SESSIONS.put(`session:${token}`, JSON.stringify(user), {
    expirationTtl: 60 * 60 * 24 * 30,
  });
  
  setCookie(c, 'session', token, { /* ... */ });
  return c.redirect('/dashboard');
});
```

Standard OAuth flow at the edge. Same shape for any provider.

## API keys

For machine-to-machine auth:

```ts
app.use('/api/*', async (c, next) => {
  const key = c.req.header('X-API-Key');
  if (!key) return c.json({ error: 'API key required' }, 401);
  
  const keyData = await c.env.API_KEYS.get(`key:${hash(key)}`, 'json');
  if (!keyData) return c.json({ error: 'Invalid key' }, 401);
  
  if (keyData.expires_at && keyData.expires_at < Date.now()) {
    return c.json({ error: 'Expired' }, 401);
  }
  
  c.set('apiKey', keyData);
  await next();
});
```

Hash keys before storing (so DB compromise doesn't leak keys). Scope keys (per-customer, per-integration); track usage; allow rotation.

## CSRF protection

For session-cookie-based auth:

```ts
import { csrf } from 'hono/csrf';

app.use('/api/*', csrf({ origin: 'https://example.com' }));
```

CSRF middleware checks Origin header against allowed origins for state-changing requests. Standard pattern; built into Hono.

For JWT in Authorization header (not cookies): CSRF is less of a concern.

## Rate limiting + auth

Pair authentication with rate limiting:

```ts
app.use('/api/*', async (c, next) => {
  // Auth first:
  await jwtMiddleware(c);
  const userId = c.get('userId');
  
  // Rate limit per-user:
  const allowed = await checkRateLimit(userId, c.env);
  if (!allowed) return c.json({ error: 'Rate limited' }, 429);
  
  await next();
});
```

For strict rate limits: Durable Objects keyed by user. For approximate: KV with windowing.

## Integration with Supabase Auth

If you use Supabase as the auth provider:

```ts
import { createClient } from '@supabase/supabase-js';

app.use('/api/*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'No token' }, 401);
  
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return c.json({ error: 'Invalid token' }, 401);
  
  c.set('user', user);
  await next();
});
```

Same pattern for Clerk, Auth.js, any external auth provider — verify their token; load user.

## Token refresh

For long-lived sessions:

```ts
app.post('/auth/refresh', async (c) => {
  const refreshToken = getCookie(c, 'refresh_token');
  if (!refreshToken) return c.json({ error: 'No refresh token' }, 401);
  
  const session = await c.env.SESSIONS.get(`refresh:${refreshToken}`, 'json');
  if (!session) return c.json({ error: 'Invalid refresh' }, 401);
  
  // Issue new access token:
  const newAccess = await signJWT({ sub: session.userId }, c.env.JWT_SECRET, { expiresIn: '1h' });
  
  return c.json({ access_token: newAccess });
});
```

Short-lived access tokens (1h) + long-lived refresh tokens (30d) is the standard pattern.

## Logout

```ts
app.post('/auth/logout', async (c) => {
  const token = getCookie(c, 'session');
  if (token) {
    await c.env.SESSIONS.delete(`session:${token}`);
  }
  setCookie(c, 'session', '', { maxAge: 0 });
  return c.json({ ok: true });
});
```

Invalidate the session server-side AND clear the cookie client-side.

## Mistakes to avoid

- **Hardcoded JWT secrets.** Use Wrangler secrets.
- **No httpOnly cookies.** XSS-stealable sessions.
- **Long-lived JWTs without refresh.** Stolen token = persistent access.
- **No CSRF on cookie-based auth.** Vulnerable to cross-site requests.
- **Verifying JWTs by calling external API on every request.** Slow; do it locally with cached JWKS.

## Summary

- JWT verification with `hono/jwt` middleware (sync local crypto).
- Session-based auth via KV (fast lookup) or Durable Objects (strong consistency).
- Set cookies with httpOnly, secure, sameSite.
- OAuth flow: redirect to provider; receive callback; exchange code; create session.
- API keys hashed in storage; scope per integration.
- CSRF middleware for cookie-based auth.
- Integrate with external auth providers (Supabase, Clerk, Auth0) by verifying their tokens.

Next: caching strategies.
