---
module: 3
position: 1
title: "Workers — what they are and what they're for"
objective: "Write and deploy a basic Worker."
estimated_minutes: 10
---

# Workers — what they are and what they're for

## The puzzle

Imagine code that runs at every Cloudflare PoP, intercepting every request, free to modify, route, cache, or respond directly. No server to provision. No region to pick. Cold-starts under 5ms. That's Cloudflare Workers.

It sounds like serverless functions. It's actually different in important ways. This lesson is what Workers actually are, what they're best for, and how to write your first one.

## The simple version

A Worker is a JavaScript (or WASM) function that runs on Cloudflare's edge — at every PoP, in front of every request. You write code, deploy it, bind it to a route, and Cloudflare runs it.

What Workers do well:

- **HTTP request handling** at the edge.
- **Routing, redirects, A/B testing, auth checks**.
- **Modifying requests/responses** (headers, bodies, etc.).
- **Calling APIs and stitching responses**.
- **Cache control**.
- **Edge compute** instead of round-tripping to origin.

## The technical version

### A minimal Worker

```js
export default {
  async fetch(request, env, ctx) {
    return new Response("Hello from the edge!", {
      headers: { "Content-Type": "text/plain" }
    });
  }
};
```

That's a working Worker. It responds to every request with "Hello from the edge!" Save as `index.js`, deploy with Wrangler (Cloudflare's CLI), and it runs at every PoP worldwide.

### Setup with Wrangler

```bash
# Install Wrangler
npm install -g wrangler

# Log in to Cloudflare
wrangler login

# Create a new Worker project
wrangler init my-worker

# Deploy
cd my-worker
wrangler deploy
```

Wrangler is the standard tool. It handles auth, deployment, local dev (`wrangler dev`), and the `wrangler.toml` config file.

### The Worker runtime

Workers don't run on Node.js. They run on V8 isolates (the same engine Chrome uses for JavaScript). This means:

- **Fast cold starts**: under 5ms (no process to spin up).
- **Limited Node APIs**: no `fs`, no native bindings, no most npm packages that rely on Node internals.
- **Web APIs are available**: `fetch`, `Request`, `Response`, `Headers`, `crypto`, `URL`, etc.
- **WASM is supported** — you can run compiled code (Rust, C++) at the edge.

Modern frameworks (Hono, Nuxt with edge runtime, Next.js Edge Runtime) target this environment.

### What you bind to a Worker

In `wrangler.toml`, you bind:

- **Routes**: which URLs trigger this Worker (`example.com/*`, `api.example.com/*`).
- **KV namespaces**: edge key-value store.
- **D1 databases**: edge SQLite.
- **R2 buckets**: object storage.
- **Durable Objects**: stateful primitives.
- **Workers AI**: ML inference.
- **Environment variables and secrets**.
- **Service bindings** to other Workers.

The bindings become available on the `env` object in your handler.

### Routing a Worker

A Worker can be bound to:

- **Specific routes** on your domain (`example.com/api/*`).
- **All routes** on a domain (`example.com/*`).
- **A subdomain** of `workers.dev` for testing (`my-worker.username.workers.dev`).

When a route matches, the Worker handles the request instead of (or in addition to) going to origin.

### Calling origin from a Worker

Sometimes you want the Worker to fetch from origin, modify, and return:

```js
export default {
  async fetch(request, env, ctx) {
    // Fetch from origin
    const response = await fetch(request);
    
    // Modify response
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-Custom-Header", "added-at-edge");
    
    return newResponse;
  }
};
```

`fetch(request)` to the same URL routes to origin (skipping the Worker), so you can use Workers as middleware around origin.

### When Workers replace origin entirely

For simple APIs and dynamic content, Workers can be the entire backend:

```js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === "/api/hello") {
      return Response.json({ message: "Hello", time: new Date().toISOString() });
    }
    
    if (url.pathname === "/api/users") {
      const data = await env.MY_DB.prepare("SELECT * FROM users").all();
      return Response.json(data);
    }
    
    return new Response("Not found", { status: 404 });
  }
};
```

No origin server. Workers + bindings = the whole stack.

### Limits

Free tier:

- **CPU time per request**: 10ms (yes, very limited).
- **Memory**: 128 MB.
- **Subrequests**: 50 per request.
- **Requests per day**: 100,000.

Workers Paid ($5/month):

- **CPU time per request**: up to 30 seconds.
- **Memory**: 128 MB.
- **Subrequests**: 50 per request.
- **Requests**: 10 million included, then per-request pricing.

Workers Unbound (per-request pricing): higher CPU limits available.

For most use cases, paid tier is fine. Free tier is generous for prototypes.

### Hono — the framework

Most production Workers don't use raw fetch handlers. They use a framework like Hono:

```js
import { Hono } from "hono";

const app = new Hono();

app.get("/api/hello", (c) => c.text("Hello"));
app.get("/api/users/:id", async (c) => {
  const id = c.req.param("id");
  const user = await c.env.MY_DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
  return c.json(user);
});

export default app;
```

Hono looks like Express. Fast cold starts. Great DX. Most Cloudflare Workers tutorials assume Hono or similar.

### Local development

```bash
wrangler dev
```

Runs the Worker locally with full bindings (KV, D1, R2, etc.) using simulation. Fast iteration. Most dev happens here; production deploys are minutes apart from local testing.

### When to reach for Workers

- **Edge logic**: routing, auth checks, A/B testing, redirects.
- **API gateways**: stitching multiple backends, transforming responses.
- **Stateless dynamic content**: lightweight APIs.
- **Image / video transformation**: with Workers + R2.
- **Personalization at the edge**: A/B variants, geo-aware content.

### When NOT to reach for Workers

- **Long computations** (>30s): doesn't fit.
- **Heavy memory**: 128 MB ceiling.
- **Stateful long-lived processes**: use Durable Objects.
- **Existing complex Node.js code**: porting can be painful.

## Three real-world scenarios

**Scenario 1: The auth-check at the edge.**
A team added a Worker in front of their app to validate JWT tokens. Invalid requests return 401 from the edge; valid requests pass through to origin. Origin no longer wastes CPU on bad requests. Latency dropped on valid; rejection latency went near-zero on invalid.

**Scenario 2: The Worker-only API.**
A team built a small API on Workers + KV. No origin. Free tier; $0 infra cost for months. Worked for tens of thousands of users. They moved to D1 when KV's eventual consistency became a problem; still all on Cloudflare.

**Scenario 3: The image-transform Worker.**
A team transformed images at the edge — resize, format conversion, watermarking — on first request, then cached. Origin's image storage stayed simple; Workers + R2 did everything dynamic.

## Common mistakes to avoid

- **Treating Workers as Node.js.** They aren't. Many npm packages won't work.
- **Long synchronous work.** CPU time limits will hit.
- **Forgetting `ctx.waitUntil`** for fire-and-forget tasks (logging, analytics).
- **No bindings set up** — calls to `env.MY_DB` fail silently.
- **Local-only success.** Test in deployed dev environment before declaring done.

## Read more

- [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
- [Hono framework](https://hono.dev/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)

## Summary

- **Workers** are V8-isolate functions running at every Cloudflare PoP.
- **Sub-5ms cold starts**, web-standard APIs, WASM support.
- **Wrangler** is the standard CLI for dev and deploy.
- **Bindings** connect Workers to KV, D1, R2, Durable Objects, AI, secrets.
- **Hono** is the most-used Worker framework.
- **CPU and memory limits apply**: 30s max, 128 MB.
- Workers can run **in front of origin**, **replace origin entirely**, or **be the whole stack** with bindings.

Next: the Workers runtime in depth.
