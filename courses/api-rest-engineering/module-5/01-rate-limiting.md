---
module: 5
position: 1
title: "Rate limiting and quotas"
objective: "Protect the API + structure economic tiers."
estimated_minutes: 5
---

# Rate limiting and quotas

## Why rate limit

Every API needs limits:
- **Abuse prevention.** Stop scrapers, brute-force attacks.
- **Fairness.** One consumer can't degrade others.
- **Cost control.** Bound usage, especially for paid APIs.
- **Capacity planning.** Predictable load.

Without limits, one buggy or malicious consumer can saturate your service. Limits per-consumer keep one bad actor from ruining everyone's experience.

## What to limit

Common units:
- **Requests per second / minute / hour.** Total request count.
- **Concurrent requests.** How many in-flight at once.
- **Resource usage.** Bytes downloaded, compute time, AI tokens.
- **Specific endpoint.** Login attempts, expensive queries.

Granularity matters. A 1000/hour limit allows bursts of 1000 in one second, which might be more damaging than 100/minute (steadier).

## Algorithms

**Fixed window.**

Reset counter every N seconds.
```
12:00:00 → counter = 0
12:00:01-12:00:59 → increment per request
12:01:00 → reset
```

Simple. Edge case: 100 requests at 12:00:59 + 100 more at 12:01:00 = 200 in 1 second.

**Sliding window.**

Track requests in a rolling window. More accurate; no boundary bursts.

**Token bucket.**

Bucket holds N tokens; each request consumes one; tokens refill at rate R. Allows bursts up to bucket size; sustained rate is R.

```
bucket_size = 100
refill_rate = 10/sec

# 100 requests → consumed; then need to wait for refill.
# 1 request every 100ms → sustainable forever.
```

Industry standard for fair, burst-tolerant rate limiting. Most API gateways implement this.

**Leaky bucket.**

Requests drain at constant rate. Smooths bursts. Less burst-friendly than token bucket.

Pick token bucket for most cases; allows users to burst when they need to.

## Where to apply

**At API gateway.** Centralized. Same logic for all endpoints. Configurable per endpoint, per consumer.

**At app level.** Endpoint-specific logic (e.g., per-tenant counts, complex business rules).

**At downstream level.** Protecting expensive resources (databases, AI inference).

Layered limits are common: API gateway has global limit; app has per-tenant; database has per-query.

## Identifying who to limit

- **By API key.** Each key has its own bucket. Most common for paid APIs.
- **By user ID.** Authenticated user.
- **By IP.** Unauthenticated traffic; sign-in attempts.
- **By tenant.** Multi-tenant SaaS; per-tenant fairness.

Combine when needed: "per IP for unauth; per user for auth; per tenant for billable resources."

## Response headers

When rate limiting is active, tell consumers their budget:

```
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1716200000
```

- `X-RateLimit-Limit` — max in current window.
- `X-RateLimit-Remaining` — remaining in current window.
- `X-RateLimit-Reset` — Unix timestamp when window resets.

GitHub's headers are widely copied. RFC 9213 standardizes a more verbose format (`RateLimit-Policy`, `RateLimit`). Either works.

## When the limit is hit

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1716200060

{
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded. Retry in 60 seconds."
  }
}
```

`Retry-After` is the standard header for "wait this long." Clients with respect for HTTP semantics honor it.

## Quotas — longer-term budgets

Rate limit = how fast (per second/minute).
Quota = how much total (per day/month).

```
"100 requests/second" — rate limit
"1M requests/month" — quota
```

Quotas are usually billed (free tier: 1K/month; pro: 100K; enterprise: unlimited). Implementation similar to rate limits but with longer windows.

## Multi-tier rate limits

Different tiers get different limits:

```
free:      100 req/min, 10K/day
pro:       1000 req/min, 1M/day
enterprise: custom
```

Stripe, GitHub, OpenAI all do this. Pricing page is the source of truth; rate limiter checks consumer tier and applies appropriate limits.

## Custom limits per consumer

For enterprise customers, custom limits negotiated. Often higher than tier default; sometimes specific endpoints (priority access).

Implementation: per-consumer override in the rate limit store.

## Distributed rate limiting

For multi-region API gateways: state must be shared across regions, or rate limits become per-region (looser than intended).

Common approaches:
- **Redis with sliding-window logic.** Centralized; small latency hit per request.
- **Eventual consistency.** Each region tracks; reconcile periodically. Some leak.
- **Approximate.** Count-min sketch or similar; small approximation, fast.

Cloudflare, Akamai, AWS API Gateway provide rate limiting that handles this. Self-hosted: Envoy with Redis is a common pattern.

## When NOT to use 429

Some teams use 503 for rate limiting. Problems: 503 means "service unavailable" — generic; signals server is down. Clients may retry hard. 429 specifically means "you went too fast; back off" — clearer.

Use 429 + Retry-After for rate limiting; 503 + Retry-After for genuine service outages.

## Common mistakes

- **No rate limits at all.** One consumer can DoS you.
- **Same limit for all.** Big customers throttled with small ones.
- **No headers.** Consumers can't plan; just hit the wall.
- **No Retry-After.** Clients guess; some retry every ms.
- **Limit too strict.** Legitimate use cases blocked.
- **Limit too loose.** Doesn't actually protect.

## Summary

- Rate limit to prevent abuse, ensure fairness, control cost.
- Token bucket allows bursts within a sustained rate.
- Headers (`X-RateLimit-*` or RFC 9213) let consumers plan.
- 429 + Retry-After when limit hit.
- Tiers (free/pro/enterprise) with different limits.
- Distributed rate limiting needs shared state (Redis).

Next: caching and conditional requests.
