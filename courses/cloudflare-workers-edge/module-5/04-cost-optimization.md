---
module: 5
position: 4
title: "Cost optimization"
objective: "Pricing model and where money leaks."
estimated_minutes: 6
---

# Cost optimization

## The Workers pricing model

Workers has two costs:

- **Requests.** Per million invocations.
- **CPU time.** Per million CPU-milliseconds.

Free plan: 100,000 requests/day, 10ms CPU max per request.

Paid plan ($5/month base):
- 10M requests/month included; $0.30 per additional million.
- 30M CPU-ms/month included; $0.02 per million CPU-ms beyond.

For most apps, you'll hit one of these. CPU-time is the more variable cost — a Worker doing heavy parsing burns through CPU credits faster than one returning cached responses.

Compared to AWS Lambda / Vercel Functions: Workers' pricing favors short, cache-heavy work — exactly what edge compute is best at.

## Storage costs

Each storage primitive has its own pricing:

- **KV.** $0.50/GB-month + reads/writes. Reads cheap, writes more expensive.
- **R2.** $0.015/GB-month + operation costs. Zero egress.
- **D1.** Storage + rows read + rows written. Rows-read is the big one.
- **Durable Objects.** Per-DO requests + duration + storage.
- **Analytics Engine.** Per-million writes + per-million queries.

R2's zero egress is the biggest cost win compared to S3 — serving large files to many users is dramatically cheaper.

## Where money leaks

### 1. Cache misses on hot paths

A Worker doing 10M req/month at $0.30/M = $3/month. But if each request hits an upstream API costing $0.001 → $10,000/month in API costs.

Cache aggressively. The Worker is cheap; the upstream is expensive.

### 2. Excessive CPU on parsing

```ts
// ❌ Parse 5MB JSON on every request → 200ms CPU each → $$ at scale
const config = JSON.parse(await env.CONFIG_KV.get('massive-config'));

// ✅ Cache the parsed object in module scope (lasts the lifetime of the isolate)
let cachedConfig: Config | null = null;
async function getConfig(env: Env) {
  if (cachedConfig) return cachedConfig;
  cachedConfig = JSON.parse(await env.CONFIG_KV.get('massive-config'));
  return cachedConfig;
}
```

Module-scoped caches persist across requests served by the same isolate. Free wins for expensive immutable data.

### 3. Over-writing KV

Every KV write costs and is eventually-consistent. Common mistake: incrementing a counter in KV per request → millions of writes.

For counters, use Durable Objects (better suited) or Analytics Engine (cheap writes, no per-request consistency needed).

### 4. D1 rows-read explosion

```ts
// ❌ Select all rows then filter in code
const users = await db.prepare("SELECT * FROM users").all();
const active = users.results.filter(u => u.active);

// ✅ Filter in SQL
const active = await db.prepare("SELECT * FROM users WHERE active = 1").all();
```

D1 charges per row read. SQL filtering reads less, parses less, costs less.

### 5. Workers AI calls without caching

Workers AI is metered per request. Same prompt twice = pay twice unless you cache:

```ts
async function summarize(text: string, env: Env) {
  const key = `summary:${await sha256(text)}`;
  const cached = await env.SUMMARIES.get(key);
  if (cached) return cached;
  
  const result = await env.AI.run('@cf/meta/llama-3-8b-instruct', { ... });
  await env.SUMMARIES.put(key, result.response, { expirationTtl: 86400 });
  return result.response;
}
```

For chatbots with repeated prompts, the cache hit rate often exceeds 50%.

### 6. Logpush to expensive destinations

Sending 100% of requests to Datadog at $1.50/GB ingestion can easily dwarf Workers costs.

Sample. Filter. Don't ship debug logs from production.

## Optimizing CPU

The biggest controllable cost. Cheap moves:

- **Defer initialization.** Don't parse all configs on every request — module-scope cache, or lazy-init.
- **Stream parsing.** Pass through large bodies instead of buffering.
- **Avoid synchronous crypto.** Use WebCrypto (`crypto.subtle`) — runs in native code, doesn't bill against your JS CPU.
- **Reduce JSON.** Smaller payloads parse faster.
- **Compile regex once.** Define at module scope, not inside request handler.

## Optimizing requests

A "request" in Workers' billing is one Worker invocation. Subrequests don't count separately for Workers billing (though they have the per-invocation limit and may have their own costs at the destination).

Reduce request count by:

- **Batching client API calls.** Frontend that hits 5 endpoints per page → consolidate.
- **CDN cache.** If Cloudflare's edge cache can serve it, the Worker doesn't run.
- **Long-poll instead of poll.** WebSockets via Durable Objects beats clients polling every 5s.

## Calculating per-feature cost

Before deploying expensive features, estimate:

```
Cost per request = 
  ($0.30 / 1M)              // Worker request
  + (avg CPU ms × $0.02 / 1M)  // CPU
  + KV reads × $0.50/M
  + KV writes × $5.00/M
  + D1 rows read × …
```

For most edge Workers (cache-heavy, cheap CPU), $0.50-2 per million requests is realistic. Heavy AI / D1-heavy Workers go higher.

Cloudflare's pricing page has the current numbers; do the math before launching.

## Comparing to alternatives

For straightforward edge HTTP + caching, Workers is generally:

- **vs Vercel Functions.** Significantly cheaper for high request counts.
- **vs AWS Lambda + CloudFront.** Cheaper for global apps, fewer moving parts.
- **vs DIY EC2.** No comparison — Workers wins on ops cost alone.

Where Workers loses: long-running compute (use Lambda or EC2 — Workers' 30s ceiling rules these out), GPU-heavy ML beyond Workers AI's offering.

## Reserved CPU pricing

For predictable high-volume workloads, Cloudflare offers committed-use discounts (sales-led). For most teams, on-demand pricing is fine.

## Monitoring spend

Dashboard → Workers → Metrics → Usage tab. Shows current spend per Worker, request counts, CPU time. Set up billing alerts in account settings.

For production Workers, audit monthly:

1. Per-Worker spend — anything trending up?
2. Top CPU consumers — refactor opportunities?
3. KV writes — anything looking pathological?
4. D1 rows-read — query analyzer reveal slow queries?

A 30-minute monthly review catches the leaks early.

## Mistakes to avoid

- **No caching on expensive upstreams.** API costs balloon.
- **Synchronous parsing of large blobs.** CPU charges.
- **KV writes on every request.** Use DO or Analytics Engine for counters.
- **`SELECT *` in D1.** Rows-read charges.
- **Logpush 100% of requests.** Destination ingestion costs.
- **No billing alerts.** Bad month happens silently.

## Summary

- Workers cost = requests + CPU-time; both cheap relative to alternatives.
- Cache aggressively — Worker is cheap, upstream is expensive.
- Module-scope caches across requests in the same isolate.
- WebCrypto > JS crypto for CPU.
- D1: filter in SQL not code. KV: rare writes. DO: counters.
- Workers AI: cache results to avoid paying for repeated prompts.
- Audit monthly; set billing alerts.

## Course complete

You've covered the Workers stack from runtime model through storage primitives, real-world building patterns, beyond-HTTP capabilities, and production operations. Workers is the most production-ready edge platform in 2026 — the patterns here transfer broadly across edge compute regardless of vendor.

Next steps: build something real. Deploy a Worker to your domain, wire up KV and D1, ship a feature behind cron and queues, set up observability, watch it run. The platform rewards experimentation — most concepts here cost cents to try at full scale.
