---
module: 1
position: 4
title: "What Cloudflare doesn't do (and what to use instead)"
objective: "Recognize the limits of the platform — when you need other tools."
estimated_minutes: 7
---

# What Cloudflare doesn't do (and what to use instead)

## The puzzle

The previous lesson covered what Cloudflare solves well. This one is the inverse: when you should NOT reach for Cloudflare, and what to use instead.

Knowing both sides keeps your architecture honest and your bill predictable.

## The simple version

Cloudflare isn't the right tool for:

1. **Heavy backend compute** (long-running jobs, ML training).
2. **Primary relational databases** at scale.
3. **Stateful long-lived connections** beyond what Durable Objects can hold.
4. **Complex application servers** that need rich ecosystems.
5. **Anything requiring software-vendor integrations** Cloudflare hasn't built.
6. **Workloads requiring per-region compliance** beyond Cloudflare's edge model.

For each, there's a better tool — usually traditional cloud providers (AWS, GCP, Azure), managed-DB providers (Supabase, Neon, Railway, RDS), or specialized services.

## The technical version

### Workers have real limits

Workers are amazing for short, low-latency, stateless tasks. They have limits:

- **CPU time per request**: ~50ms on free, up to 30s on paid. Long computations don't fit.
- **Memory**: 128 MB. Heavy in-memory work doesn't fit.
- **Concurrency**: high per-isolate but each request is isolated.
- **No filesystem, no native processes, no GPU**.
- **JS/WASM runtime**: not arbitrary binaries.

For workloads that exceed these, you need traditional servers (containers, VMs, lambda-style functions on AWS/GCP).

### When to NOT use Workers

- **Long-running tasks** (>30s) → use background workers on traditional cloud.
- **Heavy ML inference** (large models) → use specialized inference platforms (HuggingFace, Replicate, AWS Bedrock, etc.) or your own GPU instances.
- **Complex stateful logic** → use containers/VMs with shared state.
- **Heavy dependencies** → some npm packages don't work on Workers due to Node API limits.

### Database limits

D1 (SQLite at the edge) is great for:

- Read-heavy workloads.
- Small-to-medium write throughput.
- Simple schemas.
- App-local data with global access.

D1 isn't great for:

- High-write workloads.
- Complex relational queries (joins across many tables, deep window functions).
- Apps needing primary-DB ACID with broad isolation requirements.
- Workloads needing >10 GB.

For those: Postgres on Supabase/Neon/RDS, MySQL on Planetscale, MongoDB Atlas. Use Cloudflare Hyperdrive to connect from Workers efficiently.

### Real-time and stateful

Durable Objects are powerful — single-threaded JS instances with persistent state, addressable by ID. They work for:

- Real-time collaboration on a doc/room.
- Game state for a session.
- Coordinated state for a small group.

They don't scale to:

- Millions of concurrent active states.
- Heavy cross-state coordination.
- Workloads needing real DB queries against the state.

For those: traditional WebSocket servers + a real DB, or specialized real-time services (Ably, Pusher, Liveblocks).

### Object storage limits

R2 is great for:

- File storage with free egress.
- Media (video, images, files).
- Backups, archives.

R2 isn't optimized for:

- Very high request rate per object (cache works around this).
- Extremely complex permission models (basic IAM is supported but less granular than S3).
- Workflows tightly integrated with AWS services (you'd use S3).

### Software ecosystem gaps

Some tools have deep integrations with AWS, GCP, Azure that Cloudflare doesn't match:

- **Specialized AWS services**: SageMaker, Glue, Redshift, etc. No Cloudflare equivalent.
- **GCP-specific**: BigQuery, Vertex AI, etc.
- **Azure-specific**: Cosmos DB, specialized enterprise tools.

For deep dependencies on those, you stay there. Cloudflare can still be the edge.

### When traditional cloud wins

The case for AWS/GCP/Azure is strongest when:

- You need rich service ecosystems (many specialized services).
- You have heavy compute or storage workloads.
- You need long-running stateful services.
- You're already tied into one provider deeply.
- Compliance requires specific provider attestations.

The case for Cloudflare is strongest when:

- You need global low-latency edge.
- You need DDoS protection.
- You have static / Jamstack workloads.
- You want simple ops for smaller-scale apps.
- You need free egress (R2) for media-heavy apps.

Many production systems are hybrid: AWS/GCP for the core; Cloudflare for the edge.

### Cost surprises

Where Cloudflare's pricing can surprise:

- **Workers** at high traffic with KV writes can add up.
- **R2** storage cost grows with size (egress is free but storage isn't).
- **Enterprise WAF** with high rule complexity adds up.
- **Workers AI** inference can scale beyond expectations.

Monitor cost from day 1. Cloudflare's dashboard surfaces consumption clearly; check it weekly.

### Migration friction

Moving away from Cloudflare is generally easy at the edge layer (swap DNS, point elsewhere) and harder for Cloudflare-native deployments (Workers + D1 + R2 require migration to equivalents elsewhere).

For long-term flexibility:

- **Edge layer**: Cloudflare is largely fungible with other CDNs.
- **Workers**: depend on Cloudflare-specific APIs; some lock-in.
- **D1, KV, R2**: each has migration paths but real lock-in.

Pick deliberately. The benefits often outweigh lock-in for many workloads; just know it's there.

## Three real-world scenarios

**Scenario 1: The Workers limit.**
A team tried running a 10-second ML inference inside a Worker. Free tier 50ms CPU limit; paid 30s ceiling. The job ran fine but neared the limit. They moved to a dedicated inference service; kept Workers for the routing/light edge logic. Better fit.

**Scenario 2: The D1 ceiling.**
A team built their CRM on D1. Worked until they had 5K+ concurrent users with heavy write patterns. Moved primary DB to Postgres on Neon; kept D1 for read-only edge cache of common queries. Right architecture; right tools.

**Scenario 3: The hybrid that worked.**
A team's product had a global edge frontend (Cloudflare Pages + Workers) and a heavy ML backend (GPU instances on Lambda Labs). Cloudflare handled distribution, security, and light logic; Lambda Labs did the compute-heavy work. Each tool used for what it's best at.

## Common mistakes to avoid

- **Forcing everything into Workers.** Some workloads don't fit.
- **D1 as primary DB for high-write apps.** It's read-heavy-optimized.
- **R2 expectations matching S3** — overlapping but not identical.
- **Underestimating Workers lock-in.** Migration is possible but real.
- **Ignoring traditional cloud strengths.** Hybrid is usually the answer.

## Read more

- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [D1 limits](https://developers.cloudflare.com/d1/platform/limits/)
- [R2 vs S3 comparison](https://developers.cloudflare.com/r2/reference/)

## Summary

- **Workers**: limited CPU, memory, runtime. Great for short tasks; not for heavy compute.
- **D1**: read-heavy SQLite. Not a Postgres replacement at scale.
- **Durable Objects**: state per ID; not a real-time platform at millions of connections.
- **R2**: free egress is the killer; ecosystem less mature than S3.
- **Software ecosystem**: AWS/GCP/Azure have deep specialized services Cloudflare doesn't.
- **Hybrid is usually the right answer**: Cloudflare at the edge, traditional cloud for heavy work.
- **Watch for lock-in** especially on D1/KV/R2; pick deliberately.

That wraps Module 1. Next: DNS, SSL, and securing a domain.
