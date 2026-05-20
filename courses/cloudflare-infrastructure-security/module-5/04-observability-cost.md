---
module: 5
position: 4
title: "Observability, logs, and the cost model"
objective: "Monitor your Cloudflare setup and understand what you're paying for."
estimated_minutes: 8
---

# Observability, logs, and the cost model

## The puzzle

Cloudflare's dashboard shows analytics, security events, Workers metrics. Bills arrive monthly. Without active monitoring, you find out about issues from customers and surprise bills from the credit card statement.

This lesson is what to monitor, where to find it, and how the pricing actually works.

## The simple version

Three observability surfaces:

1. **Analytics**: traffic, cache hit rate, latency, status codes.
2. **Security**: WAF events, rate limit fires, bot scores, DDoS mitigation.
3. **Cost**: per-product spend, projection vs budget.

Set up dashboards once. Review weekly. Alert on anomalies.

For pricing: free tier covers a lot; paid tiers add features and capacity. The bill grows with traffic, requests, storage, and specific feature usage.

## The technical version

### Analytics

Cloudflare's Analytics dashboard surfaces:

- **Total requests** per day/hour.
- **Cache hit ratio** — high is good (less origin traffic, lower latency).
- **Bandwidth** — total transferred.
- **Status codes** — 2xx, 4xx, 5xx breakdown.
- **Top URLs** — what's being requested.
- **Top countries** — geo distribution.

For paid plans, more granular slicing (per-zone, per-property, per-URL).

What to watch:

- **Cache hit rate dropping**: caching is broken; investigate.
- **5xx rate increasing**: origin problems.
- **Bandwidth spikes**: could be legitimate growth or attack.

### Security analytics

The Security tab shows:

- **Blocked requests** per rule.
- **Challenges issued** and outcomes.
- **Bot Score distribution** of incoming traffic.
- **Top sources** of blocked traffic (IPs, ASNs).
- **WAF false-positive candidates** (rules that fire on many requests).

Review weekly. Look for:

- New attack patterns.
- False positives (legitimate traffic being blocked).
- Rule effectiveness (rules that never fire might be dead).

### Logs and Logpush

The dashboard shows recent events; for deeper analysis you want Logpush (paid):

- **Stream logs** to S3, R2, GCS, Datadog, BigQuery, Sumo, etc.
- **Full request data** including headers, response codes, latency, cache status.
- **Custom queries** in your destination.

Without Logpush, you're limited to dashboard summaries; with it, you can do real forensics.

### Workers analytics

For Workers:

- **Requests per Worker** per day.
- **CPU time per Worker** (key metric for paid tier billing).
- **Errors** (1101 codes; uncaught exceptions).
- **Subrequest counts**.

`wrangler tail` streams live logs from production for debugging.

### Cost dashboard

Cloudflare's billing surface:

- **Subscriptions** (Pro / Business / Enterprise + Workers Paid).
- **Workers usage** vs. included tier (10M requests; 30M CPU-ms on Workers Paid).
- **R2 storage and operations**.
- **D1 reads/writes/storage**.
- **Pages builds and bandwidth** (free tier huge).

Review monthly. Compare against expectations.

### Pricing snapshot

Approximate, may change — always check current docs:

**Free tier**:

- DNS, basic security, basic CDN, Universal SSL, 100K Workers requests/day.

**Pro ($20/mo)**:

- All free + WAF managed rules + better analytics + Image Resizing.

**Business ($200/mo)**:

- Pro + advanced WAF + customer support + various SaaS features.

**Enterprise**:

- Negotiated. Includes everything + dedicated support + custom contracts.

**Workers Paid ($5/mo)**:

- 10M requests/month included.
- 30M CPU-ms/month included.
- After: $0.30/M requests, $12.50/M CPU-ms.

**R2**:

- Storage: $0.015/GB/mo.
- Class A operations (writes): $4.50/M.
- Class B operations (reads): $0.36/M.
- Egress: free.

**D1**:

- Storage: $0.75/GB.
- Reads/writes: per-row pricing with generous free tier.

**Pages**:

- Free tier: 500 builds/month, unlimited bandwidth, unlimited sites.
- Pro ($20/mo): 5,000 builds/month + concurrent builds.

For most small teams: Cloudflare $0/month (free tier) + Workers Paid $5/month = $5/month covers a lot.

### Cost surprises to avoid

Where bills sneak up:

- **Workers traffic spike**: viral content can blow through included tier.
- **R2 operations**: lots of small reads add up.
- **D1 reads at scale**: per-row pricing scales with traffic.
- **Workers AI inference**: heavy inference workloads scale beyond expectations.
- **Logpush to expensive destinations** (Datadog, etc.): log destination costs separate.

Monitor weekly; set alerts where possible.

### Setting up alerting

Cloudflare offers notifications for:

- High traffic spikes (potential DDoS).
- WAF rule misconfigurations.
- Certificate expiration.
- Account-level events.

External alerting (via Logpush + your monitoring stack):

- 5xx rate threshold.
- Latency P95 threshold.
- Cache hit rate dropping below target.
- Specific WAF rules firing more than expected.

Build the alerting infra once; it pays back forever.

### Capacity planning

For new launches:

- Estimate traffic per request (avg + p95).
- Estimate cache hit rate (probably 30-70% for typical apps).
- Multiply: requests × (1 - hit_rate) = origin traffic.
- Size origin and DB for that.
- Cloudflare absorbs spikes; origin is still your problem.

### Things to monitor every week

Minimum weekly review:

- Total requests trend.
- 5xx rate.
- Cache hit rate.
- Cost vs. expected.
- Top WAF rules firing.
- New false-positive complaints.

10-minute scan; catches most issues before they grow.

### Quarterly review

- All Page Rules / Rules Engine entries — any to clean up?
- WAF custom rules — any too noisy, any dead?
- DNS records — any abandoned, any pointing to old IPs?
- API tokens — any unused, any over-privileged?
- Tunnel configs — any stale?

Drift accumulates. Periodic cleanup prevents config rot.

## Three real-world scenarios

**Scenario 1: The cache hit rate drop.**
A team noticed weekly cache hit rate had dropped from 65% to 28%. Investigation: a recent prompt change had added a varying header. Fixed; rate recovered. Caught early because dashboard review was weekly habit.

**Scenario 2: The Workers cost spike.**
A team's Workers consumption was 40M requests/month, comfortably in paid tier. A viral campaign pushed it to 200M requests/month — bill ballooned. They added per-day caps and alerts; renegotiated pricing for higher volume. Lesson: alerts on usage growth catch surprises.

**Scenario 3: The R2 operations bill.**
A team had millions of small reads (cache lookups) hitting R2 directly. Class B ops at $0.36/M added up. They added Worker-level caching in front of R2. Operation counts dropped 90%; bill dropped accordingly.

## Common mistakes to avoid

- **No weekly review** — issues invisible until customer complaints.
- **No cost alerts** — surprise bills.
- **No Logpush in regulated industries** — required for compliance often.
- **Trusting dashboard summaries only** — granular issues hidden.
- **No quarterly config review** — drift accumulates over years.

## Read more

- [Cloudflare Analytics](https://developers.cloudflare.com/analytics/)
- [Cloudflare Logpush](https://developers.cloudflare.com/logs/logpush/)
- [Cloudflare pricing](https://www.cloudflare.com/plans/)
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

## Summary

- **Analytics, Security, Cost** — three weekly observability surfaces.
- **Logpush** for log streaming to your aggregator (paid).
- **Free tier covers a lot**; Workers Paid ($5/mo) covers most small apps.
- **Cost surprises** in Workers, R2 ops, D1 reads, Workers AI, Logpush destinations.
- **Set alerts** on cost growth, 5xx, cache hit rate, WAF anomalies.
- **Quarterly config review** prevents drift.
- **Capacity plan** for cache misses (the part Cloudflare doesn't absorb).

## You finished the course

The five modules of Cloudflare Infrastructure & Internet Security:

1. **What Cloudflare Actually Is** — mental model, anycast, what it solves and doesn't.
2. **DNS, SSL, and Securing a Domain** — DNS records, proxy mode, SSL modes, common mistakes.
3. **Workers, Pages, and Edge Compute** — Workers, runtime, Pages, storage primitives.
4. **Security at the Edge** — DDoS, WAF, rate limits, bots, security mistakes.
5. **Zero Trust and Production Patterns** — Zero Trust, Tunnel, deployment patterns, observability.

You now have the full Cloudflare stack: from the mental model through configuration, code at the edge, security tuning, Zero Trust replacement of VPNs, and the observability/cost discipline to operate it.

Go build something. And when you ship, walk the migration playbook.
