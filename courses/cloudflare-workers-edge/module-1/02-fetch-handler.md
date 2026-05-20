---
module: 1
position: 2
title: "The Fetch handler"
objective: "Request in, Response out — that's the API."
estimated_minutes: 6
---

# The Fetch handler

## The minimal Worker

```ts
export default {
  async fetch(request: Request): Promise<Response> {
    return new Response('Hello, world!');
  },
};
```

That's it. A complete Worker. Every HTTP request to your Worker calls this function; it returns a Response.

The signature is:

```ts
fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response>
```

Three arguments:

- `request` — the incoming HTTP request as a Web standard Request object.
- `env` — bindings (KV namespaces, R2 buckets, D1 databases, secrets, environment variables).
- `ctx` — execution context with `waitUntil` and `passThroughOnException`.

## Working with Request

Standard Web APIs:

```ts
async fetch(request: Request) {
  const url = new URL(request.url);
  const method = request.method;
  const headers = request.headers;
  
  // Path:
  const path = url.pathname;
  // Query params:
  const id = url.searchParams.get('id');
  // Body (only async):
  const body = await request.json();
  // ... or request.text() / request.formData() / request.arrayBuffer()
  
  return new Response(`Got ${method} to ${path}`);
}
```

The request object is the same shape you'd find in service workers, Deno, Bun. Code is portable.

## Working with Response

```ts
// Plain text:
new Response('Hello');

// JSON:
new Response(JSON.stringify({ hi: 'world' }), {
  headers: { 'Content-Type': 'application/json' },
});

// Or shorthand:
Response.json({ hi: 'world' });

// Status + headers:
new Response('Not Found', { status: 404 });
new Response('Hello', {
  status: 200,
  headers: {
    'Content-Type': 'text/plain',
    'Cache-Control': 'max-age=3600',
  },
});

// Stream:
const stream = new ReadableStream(/* ... */);
new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
```

For binary content: pass an `ArrayBuffer`, `Uint8Array`, or `Blob` as the body.

## Forwarding to origin

Common pattern: Workers as smart proxy in front of an origin server.

```ts
async fetch(request: Request) {
  // Add auth header before forwarding:
  const modified = new Request(request);
  modified.headers.set('X-Internal-Auth', 'secret');
  
  // Forward to origin:
  const response = await fetch('https://origin.example.com' + new URL(request.url).pathname, modified);
  
  // Modify response (e.g., add CSP header):
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', "default-src 'self'");
  
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
```

Standard pattern: receive request, transform, forward, transform response, return.

## Routing

The fetch handler is one function. For multiple routes:

```ts
async fetch(request: Request) {
  const url = new URL(request.url);
  
  if (url.pathname.startsWith('/api/users')) {
    return handleUsers(request);
  }
  if (url.pathname.startsWith('/api/posts')) {
    return handlePosts(request);
  }
  
  return new Response('Not Found', { status: 404 });
}
```

Works but gets messy. For real apps, use Hono (covered Module 3):

```ts
import { Hono } from 'hono';
const app = new Hono();
app.get('/api/users/:id', (c) => c.json({ id: c.req.param('id') }));
app.post('/api/posts', async (c) => { ... });
export default app;
```

Hono is ~10KB; provides Express-like routing, middleware, validation. Standard choice for Workers in 2026.

## env — the bindings

Bindings give Workers access to other services:

```toml
# wrangler.toml
name = "my-worker"
main = "src/index.ts"

[[kv_namespaces]]
binding = "MY_KV"
id = "abc123"

[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "my-bucket"

[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "xyz789"

[vars]
PUBLIC_API_URL = "https://api.example.com"

# Secrets via `wrangler secret put SECRET_NAME`
```

In code:

```ts
type Env = {
  MY_KV: KVNamespace;
  MY_BUCKET: R2Bucket;
  DB: D1Database;
  PUBLIC_API_URL: string;
  STRIPE_SECRET_KEY: string;     // from secrets
};

async fetch(request: Request, env: Env) {
  await env.MY_KV.put('key', 'value');
  const file = await env.MY_BUCKET.get('path/to/file');
  const result = await env.DB.prepare('SELECT * FROM users').all();
}
```

Bindings are typed; auto-completes in TypeScript; the runtime guarantees they're connected to the right service.

No service URLs or API tokens to manage. Cloudflare wires it up.

## ctx — execution context

The third argument provides:

```ts
async fetch(request: Request, env: Env, ctx: ExecutionContext) {
  // Background work that continues after Response is sent:
  ctx.waitUntil(logRequestAsync(request));
  
  return new Response('OK');
}
```

`waitUntil` lets you do work AFTER returning the Response to the user. Logging, analytics, cache updates — anything that shouldn't block the response.

`passThroughOnException` causes uncaught exceptions to fall through to origin instead of erroring (useful for fail-open semantics in front of a website).

## Async vs sync

The fetch handler can be sync or async:

```ts
// Sync (returns Response directly):
fetch(request) { return new Response('Hi'); }

// Async (returns Promise<Response>):
async fetch(request) { const data = await fetch('/api'); return new Response('Hi'); }
```

Use async whenever you await anything. Most non-trivial Workers are async.

## Error handling

Uncaught exceptions become a 500 response. Wrap risky code:

```ts
async fetch(request: Request, env: Env) {
  try {
    const data = await env.DB.prepare('SELECT * FROM users').all();
    return Response.json(data);
  } catch (err) {
    console.error('DB query failed:', err);
    return new Response('Internal error', { status: 500 });
  }
}
```

`console.error` shows up in Workers logs (Wrangler tail) — first place to debug.

## Multiple handlers

Beyond `fetch`, Workers support other handlers:

```ts
export default {
  async fetch(request, env, ctx) { /* HTTP */ },
  async scheduled(event, env, ctx) { /* Cron jobs */ },
  async queue(batch, env, ctx) { /* Queue consumer */ },
  async email(message, env, ctx) { /* Email Workers */ },
  // ... and more
};
```

A single Worker can handle multiple event types. Cron triggers, queue messages, email events — all dispatch to the relevant handler.

Covered in Module 4.

## Strict mode and TypeScript

TypeScript is the dominant language for Workers in 2026. Wrangler scaffolds TS by default:

```bash
npm create cloudflare@latest my-worker
```

The generated `wrangler.toml` includes a `compatibility_date` (pins runtime version) and `compatibility_flags` (enables features like `nodejs_compat`):

```toml
compatibility_date = "2026-05-19"
compatibility_flags = ["nodejs_compat"]
```

`nodejs_compat` enables a subset of Node APIs (Buffer, process, some fs operations). Use sparingly — preferring Web APIs keeps code portable.

## Local development

```bash
wrangler dev
```

Spins up a local Workers runtime (same V8 isolate model as production). Bindings are mocked (KV in-memory; R2 to disk; D1 SQLite locally). Code changes hot-reload.

For more realistic testing:

```bash
wrangler dev --remote
```

Runs against actual production bindings (KV in CF; D1 in CF; etc.). Useful for testing data that's only in production.

## Mistakes to avoid

- **Storing state in module scope** assuming it persists across requests. Isolates can be torn down anytime.
- **Heavy work in the request path.** Use `ctx.waitUntil` to defer.
- **Unhandled rejections.** Cause 500s and weird behavior.
- **Assuming Node APIs work.** Many don't; use Web APIs.
- **`fetch()` without timeouts.** A slow upstream stalls your Worker.

## Summary

- Workers export a default object with handlers.
- `fetch(request, env, ctx)` is the most common: Request in, Response out.
- env carries bindings (KV, R2, D1, secrets) — typed and auto-wired.
- ctx.waitUntil for background work after response.
- Use Hono for real routing; raw if/else for tiny Workers.
- Wrangler dev for local; wrangler dev --remote for prod bindings.
- TypeScript + Web APIs = portable, idiomatic Workers code.

Next: bindings — how Workers access services.
