---
module: 1
position: 4
title: "Workers vs Lambda vs Vercel Functions"
objective: "Picking the right serverless model."
estimated_minutes: 6
---

# Workers vs Lambda vs Vercel Functions

## The serverless landscape

Three main options for serverless JS in 2026:

- **AWS Lambda** — original; container/microVM based; full Node.js.
- **Vercel Functions** — built on Lambda + Edge; integrated with Next.js.
- **Cloudflare Workers** — V8 isolates at edge; constrained but fast.

Plus newer entrants: Deno Deploy (Workers-like), Bun on Fly.io, AWS Lambda@Edge, etc.

This lesson compares the three dominant choices.

## Where each runs

**Lambda:** in a specific AWS region. Cold start when scaling up; warm requests are fast.

**Vercel Functions:** depends on type. "Regional Functions" run in a chosen region (Lambda underneath). "Edge Functions" run globally on Vercel's Edge runtime (Workers-equivalent technology).

**Workers:** globally at Cloudflare's 300+ edge locations. Every request runs near the user.

For global apps, Workers (or Vercel Edge Functions) win on latency. For region-pinned apps, Lambda may suffice.

## Startup performance

**Lambda:** 100ms-1s cold starts depending on language, package size, VPC config. Provisioned Concurrency eliminates cold starts at cost.

**Vercel Regional Functions:** same as Lambda.

**Vercel Edge Functions:** like Workers; <5ms.

**Workers:** <5ms cold start; effectively instant.

For latency-sensitive APIs hit infrequently, Workers' lack of cold starts is decisive.

## Pricing

**Lambda:** $0.20 per 1M requests + per-ms compute time. Generous free tier (1M requests + 400K GB-seconds/month).

**Vercel Functions:** included in plan; pro plan generous limits.

**Workers:** $5/month for 10M requests + $0.30 per million additional; CPU time charged separately.

For high-traffic, light-compute (typical edge APIs): Workers dramatically cheaper.

For heavy-compute (long-running queries, ML inference): Lambda often cheaper per work-unit.

For Vercel-hosted Next.js apps: included; no separate calculation.

## Runtime capabilities

**Lambda:**
- Full Node.js / Python / Go / Java / .NET / Ruby.
- Native modules.
- Filesystem (/tmp 512MB-10GB).
- VPC integration.
- Up to 10GB RAM, 15min runtime.

**Vercel Regional Functions:**
- Node.js or Python.
- Filesystem in /tmp.
- 1024MB RAM default; configurable up.
- 60s max default; longer for paid.

**Vercel Edge Functions:**
- Web APIs.
- No filesystem.
- 128MB.
- 30s wall, 1.5s-30s CPU.

**Workers:**
- V8 isolates with Web APIs.
- nodejs_compat for some Node APIs.
- No filesystem.
- 128MB default (paid up to 1GB).
- 30s CPU on paid; 10ms on free; longer wallclock for some patterns.

For "I need to run pandas" or "I need to use Sharp," Lambda is the answer. For HTTP API work, Workers fit.

## Ecosystem

**Lambda:** mature; vast tooling; SAM, Serverless Framework, AWS CDK; lots of community examples.

**Vercel:** tight Next.js integration; Vercel-specific helpers; smaller ecosystem.

**Workers:** Wrangler CLI, Hono framework, Cloudflare-specific helpers; growing rapidly; smaller but high-quality ecosystem.

For Lambda there's an action / SDK for everything. For Workers, you may sometimes find yourself writing the integration directly.

## Storage and stateful primitives

**Lambda:** DynamoDB, RDS, S3, ElastiCache, etc. — separate services with full SDKs.

**Vercel:** Vercel KV (Redis), Vercel Postgres, Vercel Blob — managed integrations.

**Workers:** KV, R2, D1, Durable Objects, Queues, Vectorize — Cloudflare-native via bindings.

Each ecosystem has equivalents for most needs. The differences are coupling: Workers' bindings make Cloudflare-native storage extremely smooth; using external storage (your existing Postgres) requires Hyperdrive or direct connections.

## Picking by workload

**Building a new edge-first API or BFF:**
Workers. Fast, cheap, global.

**Next.js app with Server Components and Server Actions:**
Vercel (matches the framework). Edge Runtime for fast paths; Node Runtime for needs-Node-APIs paths.

**Heavy ML inference / data processing / video transcoding:**
Lambda (or dedicated infra). Workers can't handle the CPU/memory.

**Existing AWS ecosystem (RDS, S3, lots of AWS services):**
Lambda. Bindings + integrations are deeply AWS-shaped.

**Long-running tasks / batch jobs:**
Lambda (15min) or dedicated. Workers' time limits don't fit.

**Cron jobs at edge cost:**
Workers Cron Triggers. Cheaper than EventBridge + Lambda for high-frequency.

**WebSocket / real-time:**
Workers + Durable Objects. Edge connections; coordination at single-leader Durable Object.

## Hybrid architectures

Many real apps mix:

- Workers at the edge for auth, routing, caching.
- Origin servers (Vercel, Lambda, EC2) for heavy compute.
- Cloudflare KV/R2 for fast edge data; AWS RDS for transactional data.

Workers as a smart proxy in front of an origin: receive request, auth-check, cache-check, forward only when needed, transform response. Reduces origin load dramatically.

## What about Deno Deploy?

Deno Deploy is similar to Workers in approach (edge isolates, Web APIs). Smaller ecosystem; less integrated storage primitives. Solid alternative if you prefer Deno's Node.js-compatible-but-modern stance.

For most teams: Workers or Vercel Edge wins on ecosystem maturity.

## What about Bun?

Bun is a JavaScript runtime competing with Node.js. Bun-on-edge platforms (Bun.sh, Fly.io running Bun) are emerging.

Bun is faster and more JS-feature-complete than Workers' V8 isolates for some workloads. But the edge story isn't as mature; deployment isn't as smooth. Worth watching.

## Lambda@Edge

AWS's edge product — runs Lambda functions at CloudFront edge locations. In theory similar to Workers; in practice slower (cold starts even at edge), more expensive, less ergonomic.

Use if you're deep in AWS and need edge logic. Otherwise Workers / Vercel Edge are smoother.

## The decision matrix

| Factor | Lambda | Vercel | Workers |
|--------|--------|--------|---------|
| Global latency | Region-dependent | Edge or region | Sub-50ms global |
| Cold starts | 100ms-1s | Varies | None |
| Heavy compute | Yes | Yes (Regional) | No |
| Cost (light, high-traffic) | $$ | Included in plan | $ |
| Cost (heavy compute) | $$ | $$ | N/A |
| Ecosystem maturity | High | Medium | Medium |
| Storage primitives | AWS services | Vercel + others | Cloudflare bindings |
| Next.js integration | Via Vercel | Tight | Via OpenNext |

## What this course assumes

The rest of the course assumes you've picked Workers (or are seriously evaluating). Module 2 covers Cloudflare's storage primitives, Module 3 covers building real apps, Modules 4-5 cover advanced and production topics.

If you ultimately pick Lambda or Vercel, much of the conceptual content transfers — the storage primitives differ; the runtime differs; the deployment story differs. The principle of edge-first thinking applies broadly.

## Mistakes to avoid

- **Force-fitting Workers to heavy-compute workloads.** They're not for it.
- **Using Lambda for ultra-light high-traffic edge work.** Wasteful.
- **Ignoring cold starts in latency-sensitive paths.** Lambda hurts here.
- **Picking based on team familiarity alone.** Evaluate fit; learn the new thing if it fits better.

## Summary

- Workers: V8 isolates at edge; sub-millisecond startup; constrained but fast and cheap.
- Lambda: containers in region; full Node; flexible but cold starts.
- Vercel Functions: hybrid (Edge + Regional); tight Next.js integration.
- Pick by latency needs, compute intensity, existing ecosystem, cost shape.
- Hybrid is common: Workers at edge + origin for heavy compute.

Next module: storage primitives.
