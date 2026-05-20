---
module: 1
position: 1
title: "What Workers are (and aren't)"
objective: "V8 isolates, not containers."
estimated_minutes: 6
---

# What Workers are (and aren't)

## The pitch

Cloudflare Workers run JavaScript at 300+ data centers globally. A user in Tokyo hits a Worker; it executes in Tokyo. Sub-millisecond startup. No cold starts. Sub-50ms latencies anywhere in the world.

That's the promise. Underneath it's a specific architecture worth understanding.

## V8 isolates, not containers

Traditional serverless (Lambda, Vercel Functions) runs each function in a container or microVM. Spinning one up takes 100ms-1s (the "cold start"). Multiple functions per host but each isolated by container boundaries.

Workers use V8 isolates instead — the same isolation V8 uses to run multiple tabs in your browser. Spinning up an isolate takes <5ms. Multiple Workers share a process; each in its own isolate; protected by V8's same boundary that protects browser tabs from each other.

Implication: no cold starts. A Worker that hasn't run in days fires instantly when a request comes in. Single-digit milliseconds of overhead vs hundreds of milliseconds for traditional serverless.

## The trade-offs

V8 isolates are powerful but constrained:

**No filesystem.** No `/tmp`; no reading local files. Use R2 for object storage.

**No native modules.** No Sharp for images, no native crypto. Use Web APIs (Web Crypto, ImageMagick via WASM).

**Stricter runtime.** Most npm packages work; some don't. Anything assuming Node.js APIs (fs, child_process, native bindings) fails.

**Smaller memory.** ~128MB per request typical; not for heavy ML inference.

**Time limits.** 30s CPU on free tier, longer on paid; longer wallclock for background tasks.

These constraints are also strengths — they enforce a programming model that scales.

## The Workers runtime

Workers run on a Cloudflare-built JavaScript runtime that implements:

- **Standard Web APIs** — fetch, Request, Response, URL, ReadableStream, Crypto, Cache API, etc.
- **A subset of Node.js compatibility** — enabled via `nodejs_compat` flag for many but not all Node APIs.
- **WebAssembly** — run WASM modules; useful for image processing, regex engines, ML models.

Code written against Web APIs is portable across Workers, Deno, Bun, and modern browsers. The "Workers way" is the standards-track way.

## The deployment model

Push code → Cloudflare distributes to every edge location → traffic routes to the nearest.

Deploy speed: typically 30 seconds globally. No region selection; the Worker runs wherever the request arrives.

Updates are atomic per-deployment — old traffic finishes on the old version; new traffic gets the new version. No mixed-state.

## Use cases

Workers fit:

**API gateways and BFFs.** Receive requests, transform, route to origins.

**Edge transforms.** Modify HTML, inject scripts, A/B test routing.

**Authentication.** Verify JWTs, check session validity before forwarding.

**Rate limiting.** Per-IP, per-user limits in front of origins.

**Geographic routing.** Send EU users to EU origin; US to US.

**Static asset transforms.** Image resizing, format conversion.

**Webhooks.** Receive POSTs from third parties; process, persist, respond.

**Async tasks.** Cron-triggered work; queue consumers.

What Workers don't fit:

**Heavy ML inference.** Memory constrained. (Workers AI has dedicated GPUs for this.)

**Long-running processes.** 30s CPU limit; not for video transcoding.

**Big computational batches.** Different tool entirely.

**Code that must access POSIX APIs.** No.

## Pricing model

Workers price per request + per CPU millisecond:

- **Free tier:** 100k requests/day; 10ms CPU per request.
- **Paid:** $5/month for 10M requests; $0.50 per million additional. Plus CPU-time charges past free.

Compared to Lambda/Vercel: Workers are dramatically cheaper for high-traffic, light-compute workloads. Less attractive if you need long CPU per request.

For a typical edge API processing 10M requests/month: $5-15. Vercel/Lambda equivalent: $50-200+.

## Workers vs Lambda vs Vercel

**Workers:**
- Edge-distributed; sub-50ms global.
- V8 isolates; no cold starts.
- Standards-based APIs.
- Cheaper for high-traffic light-compute.
- Constrained runtime.

**Lambda:**
- Regional; cold starts.
- Full Node.js / Python / etc.
- More flexibility; longer runtime.
- More expensive at scale.
- Mature ecosystem.

**Vercel Functions:**
- Built on Lambda or Edge (Vercel's Workers-like runtime).
- Tight integration with Next.js.
- Vercel Edge Functions are Workers-equivalent in many ways.

Pick by workload:

- **High-traffic, fast responses, light compute:** Workers.
- **Heavy compute, batch jobs, ML inference:** Lambda or specialized infra.
- **Next.js apps:** Vercel; Edge Runtime where applicable.
- **Need long-running tasks:** Workers Queues + persistent storage; or different infra.

## The Workers programming model

A Worker exports a default `fetch` handler:

```ts
// src/index.ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return new Response('Hello, world!');
  },
};
```

That's a complete Worker. Deploy with `wrangler deploy`.

- `request` — the incoming Request (Web API standard).
- `env` — bindings to other services (KV, R2, D1, secrets).
- `ctx` — execution context (waitUntil for background work).

Return a Response. Done.

For more complex apps, frameworks like Hono provide routing, middleware, validation:

```ts
import { Hono } from 'hono';
const app = new Hono();
app.get('/users/:id', (c) => c.json({ user: c.req.param('id') }));
export default app;
```

## What Workers replace

Workers can serve the role of:

- **CloudFront Functions / Lambda@Edge.** AWS equivalents; Workers usually have lower latency and friendlier DX.
- **Express servers for simple APIs.** Less code; less infrastructure.
- **API gateways.** Auth, rate limiting, transforms.
- **Glue layers.** Between client and origin services.

Many teams use Workers in front of legacy origin servers as a smart proxy — adding caching, auth, geo-routing without touching the origin.

## When NOT to use Workers

If your app needs:
- Long CPU per request (video transcoding, complex computation).
- Big memory (>128MB; configurable up to several hundred MB but not GBs).
- Specific Node APIs not in the compatibility layer.
- Stateful sessions (use Durable Objects).
- Local filesystem persistence.

For these, traditional servers or Lambda fit better. Or split: Workers at the edge for fast paths; backend for heavy lifting.

## Mistakes to avoid

- **Assuming full Node.js.** Many APIs missing.
- **Using sync FS operations.** Doesn't exist.
- **Long-running computations.** CPU limits will kick in.
- **Storing state in memory between requests.** Isolates may be torn down at any time.
- **Heavy npm dependencies.** Some don't work; bundle size matters.

## Summary

- Workers = V8 isolates running JS at Cloudflare's 300+ edge locations.
- No cold starts; sub-millisecond startup; sub-50ms global latency.
- Constrained runtime: no FS, no native modules, time/memory limits.
- Standards-based: Web APIs (fetch, Request, Response, Crypto).
- Cheaper than Lambda for high-traffic, light-compute workloads.
- Use for edge APIs, BFFs, auth, transforms, webhooks.
- Not for heavy ML, long-running tasks, or POSIX-dependent code.

Next: the Fetch handler.
