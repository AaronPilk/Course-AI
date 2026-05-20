---
module: 3
position: 2
title: "Routing and the Hono framework"
objective: "Building APIs cleanly."
estimated_minutes: 6
---

# Routing and the Hono framework

## Why a framework

A raw Worker is a single `fetch` function. For one route this is fine. For 20 routes with middleware, validation, error handling, it gets messy fast.

Hono (honojs.dev) is the dominant Workers framework in 2026. Small (~10KB), fast, Express-like, designed for edge runtimes.

## Setup

```bash
npm install hono
```

```ts
// src/index.ts
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Hello, world!'));

export default app;
```

That's a complete Hono Worker. Replace the default Worker export with `app`; Hono handles routing.

## Routes

```ts
app.get('/users', (c) => c.json([]));
app.get('/users/:id', (c) => {
  const id = c.req.param('id');
  return c.json({ id });
});
app.post('/users', async (c) => {
  const body = await c.req.json();
  return c.json({ created: body }, 201);
});
app.put('/users/:id', async (c) => { /* ... */ });
app.delete('/users/:id', async (c) => { /* ... */ });
```

Pattern matches Express, Fastify, Koa. Familiar mental model.

## Context object

The `c` argument has helpers:

```ts
// Request:
c.req.url                     // full URL
c.req.method                  // HTTP method
c.req.path                    // pathname
c.req.param('id')             // URL params
c.req.query('q')              // query string
c.req.header('Authorization') // request header
await c.req.json()            // JSON body
await c.req.text()            // text body
await c.req.formData()        // form data

// Response helpers:
c.text('Hello')               // plain text
c.json({ ... })               // JSON
c.html('<h1>Hi</h1>')         // HTML
c.redirect('/somewhere')      // 302 redirect
c.notFound()                  // 404
c.body('raw', 200, { ... })   // full control

// Set status / headers:
c.status(201);
c.header('Cache-Control', 'max-age=60');
```

Cleaner than building Request/Response manually for every endpoint.

## Bindings access

Hono exposes env via context:

```ts
type Env = {
  DB: D1Database;
  KV: KVNamespace;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/users', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM users').all();
  return c.json(results);
});
```

The `<{ Bindings: Env }>` generic gives TypeScript types for c.env.

## Middleware

```ts
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

app.use('*', logger());
app.use('/api/*', cors({ origin: 'https://example.com' }));

app.use('/admin/*', async (c, next) => {
  const auth = c.req.header('Authorization');
  if (!isValidAdmin(auth)) return c.text('Forbidden', 403);
  await next();
});

app.get('/admin/users', /* ... */);
```

Middleware patterns:

- `app.use('*', ...)` — apply to all routes.
- `app.use('/path/*', ...)` — apply to a prefix.
- `await next()` — continue to the next handler.
- Return without calling `next()` — short-circuit (e.g., auth failure).

## Built-in middleware

Hono includes useful middleware:

- **logger** — request logging.
- **cors** — CORS headers.
- **cache** — response caching.
- **csrf** — CSRF protection.
- **basicAuth** / **bearerAuth** — auth middleware.
- **jwt** — JWT verification.
- **compress** — response compression.
- **etag** — ETag handling.
- **secureHeaders** — security headers (CSP, etc.).

Most apps stack 3-5 middleware on the global app.

## Validation with Zod

Type-safe input validation:

```ts
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const PostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
});

app.post(
  '/posts',
  zValidator('json', PostSchema),
  async (c) => {
    const data = c.req.valid('json');  // typed!
    // ... use data.title, data.body
    return c.json({ created: true });
  }
);
```

Invalid inputs auto-reject with 400; valid inputs are typed in the handler. Standard pattern.

## Route groups

For organization:

```ts
const api = new Hono();
api.get('/users', /* ... */);
api.get('/posts', /* ... */);

const admin = new Hono();
admin.get('/dashboard', /* ... */);
admin.use('*', authMiddleware);

app.route('/api', api);
app.route('/admin', admin);
```

Compose sub-apps. Useful for splitting large APIs into files.

## Error handling

```ts
import { HTTPException } from 'hono/http-exception';

app.get('/posts/:id', async (c) => {
  const post = await getPost(c.req.param('id'));
  if (!post) throw new HTTPException(404, { message: 'Not found' });
  return c.json(post);
});

// Global error handler:
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error(err);
  return c.text('Internal error', 500);
});

// 404 handler:
app.notFound((c) => c.text('Not found', 404));
```

Centralized error handling; throw exceptions in routes; handle in one place.

## Static file serving

For Pages-integrated Workers or static-asset serving:

```ts
import { serveStatic } from 'hono/cloudflare-workers';

app.get('/static/*', serveStatic({ root: './public' }));
```

For most apps, use Cloudflare Pages for static; Workers for dynamic. Hybrid works too.

## OpenAPI / RPC

Hono can generate OpenAPI specs and provides a typed RPC client (HC) for type-safe end-to-end:

```ts
import { hc } from 'hono/client';

const client = hc<typeof app>('https://api.example.com');
const res = await client.users[':id'].$get({ param: { id: '123' } });
const data = await res.json();
// data is typed!
```

Frontend types flow from the Worker definition. Powerful for full-stack TS apps where frontend and Worker share a repo.

## Performance

Hono is fast — usually faster than alternatives on edge runtimes. Designed for low overhead, small bundle. The performance footprint is minimal vs the developer-experience win.

For pure single-route Workers, raw `fetch` is marginally faster (no framework overhead). For anything with 2+ routes, Hono is the right choice.

## Other frameworks

**itty-router** — tiny (~1KB); routing only; minimal.

**Sunder** — earlier Workers framework; less active.

**Cloudflare Pages Functions** — Pages's built-in routing; for Pages-integrated functions.

For most teams: Hono is the default. itty-router for tiny one-off Workers.

## Testing

Hono apps test easily:

```ts
import { describe, it, expect } from 'vitest';
import app from './src/index';

describe('API', () => {
  it('returns user', async () => {
    const res = await app.request('/users/123');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ id: '123' });
  });
});
```

`app.request()` directly invokes the Hono app — no server, no HTTP layer. Fast unit tests.

For integration tests with bindings, use Miniflare or the Workers test runner.

## Mistakes to avoid

- **Raw Worker for 20-route APIs.** Use Hono.
- **No global error handler.** Errors bubble as 500s without context.
- **No validation.** Invalid inputs cause runtime errors deep in handlers.
- **Heavy middleware.** Each adds overhead per request.
- **No CORS for cross-origin APIs.** Browser blocks requests.

## Summary

- Hono is the dominant Workers framework: ~10KB, Express-like.
- `app.get`, `app.post`, etc. for routes; middleware via `app.use`.
- Context (`c`) provides request/response helpers.
- Bindings typed via `<{ Bindings: Env }>` generic.
- Built-in middleware for logger, CORS, auth, validation, security.
- Zod validation via `@hono/zod-validator`.
- RPC client (`hc`) for type-safe frontend → Worker calls.

Next: authentication patterns.
