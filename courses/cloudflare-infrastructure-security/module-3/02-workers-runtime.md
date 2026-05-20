---
module: 3
position: 2
title: "The Workers runtime — isolates, limits, and what's available"
objective: "Understand the constraints and capabilities of the Workers environment."
estimated_minutes: 9
---

# The Workers runtime — isolates, limits, and what's available

## The puzzle

Workers are JavaScript but not Node.js. They're serverless but not Lambda. They're fast but have specific limits. To use them well, you need to understand the runtime model — what's available, what isn't, and why it matters.

## The simple version

Workers run as **V8 isolates**:

- Each request gets its own isolated execution context.
- Cold starts are sub-5ms (no process to spawn).
- The API surface is **web-standard**, not Node-specific.
- **Limits**: CPU time per request, memory, subrequests, request rate.

You write code; Cloudflare runs millions of isolates worldwide. No region picking, no autoscaling config, no servers.

## The technical version

### Isolates explained

A traditional serverless function (AWS Lambda, etc.) spins up a container or VM per invocation. Cold starts are slow (hundreds of ms to seconds) because there's process startup overhead.

Workers use V8 isolates — a lightweight sandbox *inside* a single V8 process. Spinning up a new isolate is ~5ms. Cloudflare runs hundreds of thousands of isolates per machine. Cost is low; latency is low.

The trade: isolates share a process, so you can't run arbitrary native code, native processes, or filesystem access. Web APIs only (plus WASM).

### Available APIs

Web-standard APIs that work:

- **`fetch`** — make outbound HTTP requests.
- **`Request`, `Response`, `Headers`, `URL`, `URLSearchParams`**.
- **`crypto.subtle`** — cryptographic primitives.
- **`TextEncoder`, `TextDecoder`**.
- **`atob`, `btoa`**.
- **`AbortController`, `AbortSignal`**.
- **WebSocket** (limited cases).
- **`setTimeout`, `setInterval`** (but no long-running ones).

Cloudflare-specific:

- **`env`** object with all bindings.
- **`ctx.waitUntil`** for fire-and-forget tasks after response.
- **`ctx.passThroughOnException`** for fallback behavior.

### Node.js compatibility

For npm packages that rely on Node APIs, Cloudflare provides a Node.js compatibility mode:

```toml
# wrangler.toml
compatibility_flags = ["nodejs_compat"]
```

This enables a subset of Node APIs (`buffer`, `path`, `crypto`, parts of `process`, etc.) as polyfills. Helps with packages like `pg`, `mysql2`, certain auth libraries, etc.

Not everything works — but a growing share of the npm ecosystem does.

### Limits in detail

**CPU time per request**:

- Free: 10ms.
- Paid: up to 30 seconds (default 30s ceiling; configurable lower).
- Unbound: up to 5 minutes per request.

This is *actual CPU time*, not wall-clock. A request waiting on a `fetch()` doesn't count toward CPU time.

**Memory**: 128 MB per isolate.

**Subrequests**: 50 outbound `fetch()` calls per request (paid; free is lower).

**Request rate**: rate limits at the platform level prevent abuse.

**Total response size**: 100 MB body limit.

**Worker size**: deployed Worker must be <10 MB compressed.

### Cost model

Workers Paid ($5/month) includes:

- 10 million requests/month.
- 30M CPU-ms/month.

Beyond included usage: $0.30 per million requests; $12.50 per million CPU-ms.

For most apps, you pay $5/month for a long time before you hit the included tier.

### Environment variables and secrets

```toml
# wrangler.toml — plain env vars (visible)
[vars]
DEBUG = "true"
PUBLIC_API_URL = "https://api.example.com"
```

Secrets are different — they don't go in wrangler.toml:

```bash
wrangler secret put STRIPE_SECRET_KEY
# Prompts for the value; encrypts and stores.
```

Access in code:

```js
export default {
  async fetch(request, env) {
    const debug = env.DEBUG;
    const apiKey = env.STRIPE_SECRET_KEY;
    // ...
  }
};
```

Never check secrets into git. Always use `wrangler secret`.

### Bindings

Bindings give your Worker access to other Cloudflare resources:

```toml
# wrangler.toml
[[kv_namespaces]]
binding = "MY_KV"
id = "abc123..."

[[d1_databases]]
binding = "MY_DB"
database_name = "my-db"
database_id = "def456..."

[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "my-bucket"

[ai]
binding = "AI"
```

Access in code as `env.MY_KV`, `env.MY_DB`, etc.

Bindings are checked at deploy time — a missing binding fails the deploy, not at runtime.

### Request lifecycle

```
1. Request arrives at Cloudflare PoP.
2. PoP routes to matching Worker.
3. Isolate spins up if not warm (~5ms).
4. fetch handler runs.
5. Response returned to client.
6. ctx.waitUntil tasks continue (analytics, logging, cache updates).
```

### Concurrency

A single isolate can handle multiple concurrent requests. Async patterns are first-class:

```js
async function handle(request) {
  const [user, settings, recent] = await Promise.all([
    env.MY_DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first(),
    env.MY_KV.get(`settings:${userId}`),
    fetch(`https://api.external.com/recent?user=${userId}`)
  ]);
  // ...
}
```

`Promise.all` for parallel work is the right pattern. Sequential `await` chains burn wall-clock time unnecessarily.

### Logging

```js
console.log("Something happened");
```

Logs appear in Cloudflare dashboard or via `wrangler tail` (live tail of production logs):

```bash
wrangler tail my-worker
```

Logs are not durable storage; for permanent logs, send to a logging service via `fetch()`.

### Error handling

Uncaught exceptions return 1101 Internal Worker Error to the client. Catch them:

```js
export default {
  async fetch(request, env, ctx) {
    try {
      return await handle(request, env);
    } catch (err) {
      console.error("Worker error:", err);
      return new Response("Internal error", { status: 500 });
    }
  }
};
```

Or set `ctx.passThroughOnException()` — on errors, the Worker passes through to origin (or returns a default response).

### Local development limits

`wrangler dev` simulates the runtime locally. Most things work; some differences:

- Performance can differ.
- Some bindings simulate via local stores (D1 uses local SQLite; R2 uses local files).
- Cold-start timing isn't representative.

Deploy to a staging environment (`wrangler.toml` environments) for realistic perf testing.

## Three real-world scenarios

**Scenario 1: The CPU-limit catch.**
A team's Worker did a heavy crypto operation that took 50ms CPU. On free tier (10ms limit), requests started failing. They upgraded to paid; problem solved. Lesson: profile CPU time, not just wall-clock.

**Scenario 2: The Node-compat enabler.**
A team needed `pg` for a Postgres connection. Pure Workers runtime doesn't support raw TCP for Postgres. They enabled `nodejs_compat` and used `pg`; it worked via the Node-API polyfills. Later moved to Cloudflare Hyperdrive for better pooling.

**Scenario 3: The forgotten waitUntil.**
A team logged analytics inline in the handler. Each request waited for the log POST to complete before returning. Latency was poor. Switched to `ctx.waitUntil(logAnalytics(...))` — fire-and-forget; response returns immediately; log runs in background. Latency dropped.

## Common mistakes to avoid

- **Long synchronous work**: hits CPU time limits.
- **Sequential awaits instead of `Promise.all`**: wastes wall-clock latency.
- **Logging inline instead of `ctx.waitUntil`**: blocks response.
- **Secrets in wrangler.toml**: visible in git; use `wrangler secret`.
- **Assuming Node APIs work**: many don't unless `nodejs_compat` is on.
- **No error handling**: uncaught throws return 1101 to clients.

## Read more

- [Workers runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/)
- [Node.js compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

## Summary

- Workers run on **V8 isolates** — sub-5ms cold starts, web-standard APIs.
- **Limits**: 30s CPU (paid), 128 MB memory, 50 subrequests.
- **Bindings** in wrangler.toml; **secrets** via `wrangler secret`.
- **`ctx.waitUntil`** for fire-and-forget background work.
- **`Promise.all`** for parallel async; don't sequential-await unnecessarily.
- **`nodejs_compat` flag** enables a subset of Node APIs for legacy packages.
- **`wrangler tail`** for live logs from production.

Next: Cloudflare Pages and the Jamstack model.
