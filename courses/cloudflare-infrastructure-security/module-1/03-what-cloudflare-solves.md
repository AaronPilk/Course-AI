---
module: 1
position: 3
title: "What problems Cloudflare actually solves"
objective: "Distinguish marketing claims from the real benefits in your architecture."
estimated_minutes: 8
---

# What problems Cloudflare actually solves

## The puzzle

Cloudflare's homepage promises everything: faster sites, secure networks, AI inference, edge compute, Zero Trust, video, R2 storage. If you take the marketing at face value, you'd think Cloudflare replaces your entire infrastructure.

Reality is narrower. Cloudflare is exceptionally good at a specific set of problems. Knowing which ones lets you use it well; treating it as a universal solution leads to misfit deployments and surprise bills.

## The simple version

Cloudflare reliably solves:

1. **Global latency** — anycast + caching = fast for users anywhere.
2. **DDoS protection** — absorbs huge attacks at the edge.
3. **DNS performance and management**.
4. **Free TLS** — SSL on every domain, easily.
5. **Edge compute** — small programs running close to users (Workers).
6. **Bot traffic management** — separating humans from bots.
7. **Zero Trust internal access** — replacing VPNs for many cases.

Cloudflare partially solves:

- **Static site hosting** (Pages) — competitive with Netlify/Vercel for many use cases.
- **Object storage** (R2) — competitive with S3 for many use cases.
- **Edge databases** (D1, Hyperdrive) — improving but not yet primary DB for most.

Cloudflare doesn't replace:

- **Your application origin** for stateful or compute-heavy work.
- **Primary databases** (Postgres, etc).
- **Complex backend services**.
- **AI training** (Workers AI is inference, not training).

## The technical version

### Where Cloudflare clearly wins

**DDoS protection**: Cloudflare's network is designed to absorb terabits-per-second attacks. Single-PoP capacity can already exceed many traditional networks. For any internet-facing service, putting Cloudflare in front is a structural defense that's hard to replicate.

**Global latency**: anycast + cache = users anywhere get fast responses. For static content (HTML, CSS, JS, images), Cloudflare is essentially free latency reduction.

**Free TLS**: Universal SSL handles cert issuance, renewal, and termination. The "lock icon" gets harder to break.

**DNS**: 1.1.1.1 is one of the fastest resolvers; Cloudflare's authoritative DNS for your domains is fast and free.

**Edge compute (Workers)**: when you need code to run near users without managing servers, Workers is hard to beat on cost + speed for simple use cases.

### Where Cloudflare partially wins

**Static site hosting (Pages)**: Cloudflare Pages is competitive with Netlify and Vercel for static + light Jamstack workloads. For complex Next.js apps with heavy server-side rendering or specific framework integrations, Vercel's Next.js support is deeper. Pages is improving fast.

**Object storage (R2)**: free egress is the killer feature — you don't pay to serve files from R2. For many media/file workloads, this beats S3 economics. But R2's ecosystem (tooling, integrations) is younger.

**Workers AI**: inference at the edge, with select models. Useful for many workloads; the model lineup is smaller than OpenAI/Anthropic but pricing can be much cheaper for simple inference.

**D1 (SQLite at the edge)**: works for many app needs but not a Postgres replacement. Good for low-write, read-heavy workloads.

### Where Cloudflare isn't the answer

**Primary application servers** for stateful workloads — most apps still want a "real" backend on AWS, GCP, Vercel, Fly, etc.

**Primary databases** — Postgres, MongoDB, etc. live elsewhere. Cloudflare's Hyperdrive connects efficiently to them; it doesn't replace them.

**Long-running computations** — Workers have per-request CPU limits. For long jobs, run them elsewhere and trigger from Workers.

**Complex backend services** with deep integrations — likely fits better in a traditional cloud.

### The "Cloudflare in front" pattern

Most production deployments use Cloudflare *in front of* their architecture, not *instead of* it:

```
Users
  ↓ (anycast)
Cloudflare edge
  ↓ (DDoS, WAF, cache, Workers, sometimes terminating here)
Origin (your real app on cloud provider)
  ↓
Database
```

Cloudflare handles the edge concerns (latency, security, caching, some logic). Your origin handles application state, complex compute, primary data. This is the canonical pattern; it works.

### The "Cloudflare-native" pattern

For specific workloads, you can build entirely on Cloudflare:

- **Pages** for the frontend.
- **Workers** for backend logic.
- **D1 / Durable Objects** for state.
- **R2** for files.
- **Workers AI** for ML.

This is great for greenfield projects with smaller scale needs. Costs are low; ops is simpler. It hits limits at large scale or with complex data models — but most products never reach those limits.

### Picking what to use

A heuristic by workload type:

| Workload | Cloudflare fit |
| --- | --- |
| Static site / blog | Pages + DNS + CDN. Done. |
| API with global users | Workers + KV/D1, or origin on cloud + Cloudflare in front. |
| E-commerce with backend | Origin on cloud + Cloudflare in front for edge + security. |
| Real-time multiplayer | Durable Objects for state; Workers for routing. |
| ML inference at scale | Origin on GPU cloud; Cloudflare for caching common responses. |
| Internal tools | Origin on cloud, fronted by Cloudflare Access (Zero Trust). |
| File hosting / media | R2 + Cloudflare CDN. Free egress is hard to beat. |

Match the workload to the Cloudflare product family. Don't force-fit.

### The cost picture

For most workloads:

- Cloudflare's free tier is generous.
- Workers Paid ($5/month) covers small apps comfortably.
- Pages is free for hobby; pro is reasonable.
- R2 charges for storage; egress is free.
- Enterprise plans scale into thousands/month based on traffic and features.

Compare to AWS/GCP equivalent line items. Cloudflare often comes out cheaper for edge-heavy patterns; AWS/GCP can be cheaper for compute-heavy backends. Mix and match.

## Three real-world scenarios

**Scenario 1: The right-fit deployment.**
A team built a global media product: Cloudflare Pages for frontend, R2 for media (free egress), Workers for API logic, D1 for read-heavy metadata. Total infra cost was a fraction of equivalent AWS. They had no servers to manage.

**Scenario 2: The wrong fit.**
A team tried to run their primary Postgres-backed application entirely on Workers + D1. D1 couldn't handle their write throughput; complex queries didn't fit the model. They moved primary DB back to Postgres on a managed cloud; kept Workers + Cloudflare for the edge. Better fit; better performance.

**Scenario 3: The DDoS save.**
A startup got a 2 Tbps DDoS aimed at their domain. They had Cloudflare in front; the attack distributed across PoPs, dropped at the edge. Origin saw zero impact. Without Cloudflare, they'd have been down for hours and possibly lost their AWS account to abuse policies.

## Common mistakes to avoid

- **Treating Cloudflare as universal cloud replacement.** It's edge-first; origin is still needed for most apps.
- **Trying to put everything in Workers.** Some workloads don't fit; complex CPU jobs hit limits.
- **Ignoring the free tier.** For small apps, free tier covers everything; no reason to start on paid.
- **Skipping caching as "we'll add it later."** Caching is where most of the speed wins are.
- **Putting Cloudflare in front but not restricting origin firewall.** Attackers route around.

## Read more

- [Cloudflare developers — products overview](https://developers.cloudflare.com)
- [Cloudflare network](https://www.cloudflare.com/network/)
- [Workers vs Pages vs traditional hosting](https://blog.cloudflare.com)

## Summary

- Cloudflare **clearly wins** on DDoS, global latency, DNS, free TLS, edge compute, bot management, Zero Trust.
- **Partially wins** on static hosting (Pages), object storage (R2), edge databases (D1), AI inference (Workers AI).
- **Doesn't replace** application origin, primary DB, complex backend services, AI training.
- The canonical pattern: **Cloudflare in front** of your real app, handling edge concerns.
- The Cloudflare-native pattern works for greenfield, smaller-scale projects.
- **Match workload to product**; don't force-fit.

Next: what Cloudflare doesn't do — when to reach for other tools.
