---
module: 5
position: 3
title: "Limits and how to live within them"
objective: "CPU time, request size, subrequests, and other ceilings."
estimated_minutes: 6
---

# Limits and how to live within them

## Why limits matter

Workers run in a shared multi-tenant environment. Limits exist to:

- Keep individual Workers from monopolizing CPU.
- Cap memory and bandwidth per request.
- Make pricing predictable.
- Prevent runaway code from billing you into oblivion.

Hit a limit and your request fails — with a specific error. Knowing the limits and designing around them is the difference between "Workers work great" and "Workers keep timing out under load."

## CPU time

The most important limit. Wall time and CPU time are different:

- **Wall time.** How long the request takes overall (includes time waiting on subrequests).
- **CPU time.** How long the JS engine spent actively computing.

Workers can wait for many seconds on external fetches (wall time), but only have a CPU budget:

- **Free plan.** 10ms CPU per invocation.
- **Paid plan.** 30s CPU per invocation (was 50ms; raised dramatically in 2024).

If CPU exceeds the limit, the request is terminated with `Worker exceeded CPU time limit`.

Most Workers comfortably stay under 10ms — fetching, parsing JSON, returning a response is cheap. Where you blow CPU:

- Tight loops over large arrays.
- Synchronous parsing of huge JSON / XML / CSV.
- Cryptography (especially RSA / scrypt without WebCrypto).
- ML inference outside Workers AI (rare; Workers AI offloads to GPU).

Fix: stream, paginate, or offload heavy work to Queues / Durable Objects (which have their own budgets).

## Request size

- **Request body.** 100 MB max (free), 500 MB (paid).
- **Response body.** Same as request — capped by plan.

For larger payloads, stream chunks or use R2 for uploads/downloads directly.

## Memory

- **128 MB per request** on both plans.

Mostly hit by:

- Loading entire files into memory (parse a 100MB CSV → OOM).
- Building large response strings (concatenate 50MB of JSON → close to OOM).

Stream where possible. For big files, R2 + signed URLs lets clients upload/download directly without flowing through the Worker.

## Subrequests

A Worker can make a limited number of fetches per invocation:

- **Free plan.** 50 subrequests per invocation.
- **Paid plan.** 1000 subrequests per invocation.

A subrequest is any outbound `fetch()` — to your origin, another Worker via service binding, an external API. Service bindings count.

Hit the limit and `fetch()` throws `Too many subrequests`. Designs that loop and call APIs per item are dangerous — switch to bulk endpoints or batching.

## Script size

- **10 MB compressed worker bundle.**

Most Workers are well under this. Risk areas:

- Bundling huge dependencies (entire AWS SDK, ffmpeg.wasm).
- Inlining large data blobs.

Use Wrangler's `wrangler deploy --dry-run --outdir dist` to see bundle size. Tree-shake; lazy-load via dynamic imports when possible (note: not all dynamic imports are tree-shakeable in Workers — test).

## Number of Workers

- **500 per account** on the Workers free plan.
- **Unlimited** on paid.

For most teams, this never matters. For multi-tenant SaaS where each customer gets a Worker — quickly relevant. Workers for Platforms (an enterprise offering) raises this ceiling and adds management.

## Bindings per Worker

Soft limits, generally not hit:

- KV namespaces, R2 buckets, D1 databases, DOs, secrets — dozens fine.
- Service bindings — same.

If a Worker has 50+ bindings, you're probably mis-modeling — split into multiple Workers with smaller binding sets.

## Environment variables

- **128 max** per Worker.
- **5 KB max** per variable value.

For larger config blobs, store in KV or D1 and load at request time (with caching).

## Cron triggers

- **Up to 5 cron triggers per Worker.**
- Each trigger runs independently.

If you need more, split into multiple Workers each with their own crons.

## Durable Objects limits

DOs add their own ceilings:

- **CPU time per request.** Same as Workers — 30s paid.
- **Storage.** 50 GB per DO; 10 MB per key/value.
- **Concurrent requests per DO.** Serialized — one at a time per object. Many DOs in parallel is fine.

The serialization is intentional (consistency); design hot keys carefully.

## Common error modes

```
Worker exceeded CPU time limit
```
→ Heavy computation. Reduce work or move to Queue / DO.

```
Too many subrequests
```
→ Inner loop hitting APIs. Batch or rethink the algorithm.

```
Response body exceeds the maximum size
```
→ Streaming would help, or R2 + redirect.

```
Script exceeded the maximum size of 1 MiB (compressed) on the free plan
```
→ Hitting paid bundle size on free plan (1 MB free, 10 MB paid). Upgrade or slim bundle.

```
The script will never generate a response
```
→ Forgot to return, or hung waiting on something that never resolves.

## Handling limits gracefully

For user-facing apps, structure for limits:

```ts
async function handleLargeJob(items: Item[], env: Env) {
  // Don't process inline if items are many
  if (items.length > 100) {
    await env.JOBS_QUEUE.send({ items });
    return new Response('queued', { status: 202 });
  }
  
  // Process inline if small
  for (const item of items) {
    await processItem(item, env);
  }
  return new Response('done', { status: 200 });
}
```

The queue handler has the same per-invocation limits, but you batch and chunk inside it — many small invocations are easy.

## Monitoring approaches

Workers Analytics has CPU time distribution per route. A bump in p99 CPU is often the first sign you're heading toward limits under load:

```sql
SELECT
  blob2 AS path,
  AVG(double1) AS avg_cpu_ms,
  MAX(double1) AS max_cpu_ms
FROM analytics_dataset
WHERE timestamp >= NOW() - INTERVAL '1' DAY
GROUP BY path
ORDER BY max_cpu_ms DESC
```

When max approaches your plan's ceiling, refactor before requests start failing.

## Mistakes to avoid

- **Synchronous heavy work.** Parse 10MB JSON in one go → CPU limit.
- **No subrequest budget.** Loop over 200 items, fetch each → 1000 limit hit.
- **No streaming for large bodies.** OOM under realistic load.
- **Free plan in production.** 10ms CPU is fine for hobby projects, painful for real apps.
- **Not watching p99.** Averages look fine; tail latency hits limits first.

## Summary

- CPU time: 10ms free, 30s paid. Wall time is separate.
- Request/response body: 100MB free, 500MB paid; stream when big.
- Memory: 128MB per request.
- Subrequests: 50 free, 1000 paid.
- Script size: 1MB free, 10MB paid bundle (compressed).
- Watch p99 in Analytics to spot trends before they fail.
- Queue / DO offload heavy work; R2 for big files.

Next: cost optimization and where money leaks.
