---
module: 1
position: 3
title: "Bindings: how Workers access services"
objective: "Type-safe access to storage, queues, and more."
estimated_minutes: 6
---

# Bindings: how Workers access services

## What bindings are

In most cloud platforms, accessing services means: store credentials, configure SDKs, manage connections. AWS Lambda calling DynamoDB needs IAM roles, region config, the AWS SDK.

Workers do this differently. A "binding" is a typed, pre-wired reference to a service. You declare it in `wrangler.toml`; it appears as a property on `env` at runtime. No credentials in code; no SDK configuration; no connection management.

## Declaring bindings

```toml
# wrangler.toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2026-05-19"

# KV namespace:
[[kv_namespaces]]
binding = "USER_CACHE"
id = "abc123..."

# R2 bucket:
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "my-assets"

# D1 database:
[[d1_databases]]
binding = "DB"
database_name = "production"
database_id = "xyz789..."

# Durable Objects:
[[durable_objects.bindings]]
name = "ROOM"
class_name = "ChatRoom"

# Queues:
[[queues.producers]]
queue = "my-queue"
binding = "MY_QUEUE"

[[queues.consumers]]
queue = "my-queue"

# Service binding (another Worker):
[[services]]
binding = "AUTH_SERVICE"
service = "auth-worker"

# Static env var:
[vars]
PUBLIC_API_URL = "https://api.example.com"

# Secrets (set via CLI):
# wrangler secret put STRIPE_SECRET_KEY
```

Each binding gets a name (`USER_CACHE`, `ASSETS`, etc.) and a configuration. The name becomes the property on env.

## Using bindings

```ts
type Env = {
  USER_CACHE: KVNamespace;
  ASSETS: R2Bucket;
  DB: D1Database;
  ROOM: DurableObjectNamespace;
  MY_QUEUE: Queue;
  AUTH_SERVICE: Fetcher;
  PUBLIC_API_URL: string;
  STRIPE_SECRET_KEY: string;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // KV:
    const user = await env.USER_CACHE.get('user:123');
    
    // R2:
    const file = await env.ASSETS.get('image.jpg');
    
    // D1:
    const { results } = await env.DB.prepare('SELECT * FROM posts').all();
    
    // Service binding (call another Worker):
    const authRes = await env.AUTH_SERVICE.fetch('https://internal/verify');
    
    // Queue:
    await env.MY_QUEUE.send({ type: 'process_user', userId: 123 });
    
    return Response.json({ results });
  },
};
```

Each binding has a typed API. No SDK to install, no credentials to manage, no region selection.

## Why this matters

Compared to AWS Lambda:

**No credentials.** Cloudflare grants Workers access to bindings; no IAM roles to configure (within a Cloudflare account).

**No region selection.** Bindings work from any edge location.

**Type safety.** TypeScript types flow from your bindings to your code.

**Low latency.** Bindings communicate over Cloudflare's internal network — sub-millisecond.

**No cold starts** on dependencies. KV lookup from a freshly-spawned isolate is the same speed as from a warm one.

The result: less code, fewer config files, faster runtime.

## Types for bindings

Generate types from your wrangler config:

```bash
wrangler types
```

Creates `worker-configuration.d.ts` with types for all your bindings. Import in your code:

```ts
import { Env } from './worker-configuration';
```

Update types when bindings change. Auto-update via `npm run dev` (wrangler watches).

## Service bindings — Workers calling Workers

Multiple Workers in your account can call each other directly:

```toml
[[services]]
binding = "AUTH"
service = "auth-worker"
```

```ts
// In API worker:
const authResponse = await env.AUTH.fetch(new Request('https://internal/verify', {
  method: 'POST',
  body: JSON.stringify({ token }),
}));
```

The URL doesn't matter (it's internal); just any URL. The call goes directly between Workers — no DNS, no TLS, no public network hop. Sub-millisecond.

Pattern: split your app into focused Workers (auth, API, asset transformer); compose via service bindings.

## RPC bindings (newer)

The latest pattern: Workers can expose RPC methods to other Workers:

```ts
// auth-worker:
export class Auth extends WorkerEntrypoint {
  async verifyToken(token: string) {
    // ... verify
    return { userId: '...' };
  }
}

export default { fetch(request) { return new Response('Auth Worker'); } };
```

```toml
# In API worker's wrangler.toml:
[[services]]
binding = "AUTH"
service = "auth-worker"
entrypoint = "Auth"
```

```ts
// In API worker:
const { userId } = await env.AUTH.verifyToken('token-value');
```

Type-safe method calls between Workers. The newer pattern; cleaner than fetch-based service calls.

## Environment variables vs secrets

```toml
# Public env vars (committed):
[vars]
PUBLIC_API_URL = "https://api.example.com"
ANALYTICS_ID = "G-12345"
```

```bash
# Secrets (encrypted; not committed):
wrangler secret put DATABASE_PASSWORD
wrangler secret put STRIPE_SECRET_KEY
```

Both appear on env. The difference: vars are visible in dashboard and committed config; secrets are encrypted, never displayed, set only via CLI/API.

Rule: anything sensitive → secret. Public config → var.

## Different bindings per environment

For staging vs production with different bindings:

```toml
[env.staging]
[[env.staging.kv_namespaces]]
binding = "USER_CACHE"
id = "staging-kv-id"

[env.production]
[[env.production.kv_namespaces]]
binding = "USER_CACHE"
id = "production-kv-id"
```

```bash
wrangler deploy --env staging       # uses staging bindings
wrangler deploy --env production    # uses production bindings
```

Same code; different connected services. Standard pattern for environment separation.

## Limits and quotas

Some binding limits to know:

- **KV:** 1K writes/sec per namespace (free tier; higher on paid); list operations rate-limited.
- **R2:** Generous; you'll likely hit billing before limits.
- **D1:** Beta limits apply; read/write capacity tiers.
- **Durable Objects:** One instance per ID; coordination, not throughput.

Check current limits in Cloudflare docs. They evolve.

## Local development with bindings

`wrangler dev` mocks bindings locally:

- **KV:** in-memory.
- **R2:** local disk.
- **D1:** local SQLite.
- **Service bindings:** can route to other locally-running Workers.
- **Secrets:** read from .dev.vars.

```bash
# .dev.vars (gitignored):
DATABASE_PASSWORD=local-password
STRIPE_SECRET_KEY=sk_test_...
```

Local development feels production-like; bindings work as expected. Switch to `--remote` for actual production data.

## Hyperdrive — connecting to external databases

For Postgres / MySQL outside Cloudflare:

```toml
[[hyperdrive]]
binding = "POSTGRES"
id = "abc123"
```

```ts
import { Client } from 'pg';
const client = new Client({ connectionString: env.POSTGRES.connectionString });
await client.connect();
```

Hyperdrive is a connection pool + cache living at Cloudflare's edge in front of your external database. Workers connect to Hyperdrive (fast, edge-cached) rather than directly to the DB. Reduces latency and connection-count pressure on the origin database.

Useful when you can't migrate to D1 but want Workers in front of an existing Postgres.

## AI bindings

Cloudflare Workers AI exposes ML models via bindings:

```toml
[ai]
binding = "AI"
```

```ts
const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  messages: [{ role: 'user', content: 'Hello' }],
});
```

Models run on Cloudflare's GPU network; pay per inference. Latencies competitive with OpenAI/Anthropic; no key management; bindings.

Covered Module 4.

## Mistakes to avoid

- **Hardcoding credentials.** Use bindings or secrets.
- **No env types.** TypeScript can't catch missing bindings.
- **Same binding name for different services across envs.** Confusing.
- **Forgetting to set production secrets.** Workers fail at runtime.
- **No `.dev.vars` for local secrets.** Falls back to undefined.

## Summary

- Bindings = typed, pre-wired references to services in wrangler.toml.
- Available on env at runtime; no credentials in code.
- Bindings for KV, R2, D1, Durable Objects, Queues, service-to-service, AI, more.
- Generate TS types via `wrangler types`.
- Service bindings let Workers call each other directly (no public network hop).
- Hyperdrive for connecting to external Postgres/MySQL with edge pooling.
- Local dev mocks bindings; `--remote` for real ones.

Next: Workers vs Lambda vs Vercel Functions.
