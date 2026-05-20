---
module: 3
position: 4
title: "Idempotency and retries"
objective: "Make POST safe to retry."
estimated_minutes: 5
---

# Idempotency and retries

## Why retries are required

Networks fail. Clients time out and retry. Servers crash mid-write. Without retries, every transient blip causes user-visible failure.

But retries on non-idempotent operations create duplicates: `POST /charges` retried = 2 charges, 2 customers angry.

The solution: idempotency keys.

## How idempotency keys work

Client generates a unique key per logical operation:

```
POST /charges
Idempotency-Key: idem_abc123def

{
  "amount": 1000,
  "currency": "usd"
}
```

Server:
1. Check if this key has been seen before.
2. If yes, return the cached response (no re-execution).
3. If no, execute, cache the response keyed by Idempotency-Key, return it.

Now retries are safe. Same Idempotency-Key = same response. The server only charged once.

## Storage

Cache idempotency results in a fast key-value store:

```
key:    "idem_abc123def"
value:  { status: 200, body: {...} }
ttl:    24 hours
```

Redis is common. Persistent enough; fast enough.

TTL: 24 hours typical. Long enough that retries reasonably space out; short enough that storage doesn't grow indefinitely.

## The Stripe pattern

Stripe pioneered this for public APIs. Their pattern:

- Idempotency-Key header.
- Applied to any state-changing operation (POST, PATCH, DELETE).
- 24-hour cache.
- If the key matches a previous successful request: return cached.
- If the key matches a previous failed request: re-execute (transient failures should be retryable).
- If different parameters submitted with same key: error.

Widely copied. Github, AWS, others use similar patterns.

## Client responsibilities

Client generates the key. Recommendations:

- UUID v4 per logical operation.
- Generate before submit; reuse on retry.
- Don't reuse across different operations.

```javascript
async function createCharge(amount) {
  const key = uuid();
  return await retryWithBackoff(async () => {
    return await fetch('/charges', {
      method: 'POST',
      headers: { 'Idempotency-Key': key },
      body: JSON.stringify({ amount })
    });
  });
}
```

Same key throughout retries. Each new operation gets a new key.

## Retry strategy

For 5xx and network errors:

```
attempt 1 → fail → wait 1s
attempt 2 → fail → wait 2s
attempt 3 → fail → wait 4s
attempt 4 → fail → wait 8s
...
```

Exponential backoff. Add jitter to prevent thundering herd:

```python
import random
delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
```

Cap attempts (3-5) and max delay (60-120s). Past that, give up and surface error.

For 4xx errors: don't retry (the request is wrong; retrying doesn't help).

For 429 (rate limited): respect `Retry-After` header.

## Retry-After header

Server tells client when to retry:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

Or with HTTP date:

```
Retry-After: Wed, 21 Oct 2026 07:28:00 GMT
```

Clients should honor it. If you ignore Retry-After and retry early, you're hammering harder than the server can handle.

## Operations that are naturally idempotent

Some methods are idempotent by definition:

- **GET.** Read; no side effects.
- **PUT.** Replace with the same content N times = same result.
- **DELETE.** Delete N times = still deleted.

For these, no idempotency key needed. Retries are inherently safe.

POST and most PATCH operations need the key.

## Side effects beyond your service

Idempotency keys handle YOUR side. Downstream services may not be idempotent:

```
POST /charges
  ↓
Your service handles idempotency key.
  ↓
Calls payment processor (no idempotency key support).
  ↓
Payment processor charges twice if retried.
```

For correctness, you need idempotency end-to-end. Either:
- Downstream supports its own idempotency keys (most do — Stripe, Square, etc.).
- You make the call only once even if retried (mark "charge initiated" in DB; check before calling).

Distributed idempotency is harder than single-service. Plan it.

## Optimistic concurrency control

Related concept: when multiple clients edit the same resource, prevent overwrites.

```
GET /users/123
→ ETag: "v3"
→ {"id": 123, "name": "Aaron"}

PATCH /users/123
If-Match: "v3"
{"name": "Aaron B"}

→ 200 OK with ETag: "v4"
```

Server checks: is the version still v3? If yes, apply update; return v4. If no (someone else edited), return 412 Precondition Failed.

Client retries with the new version, possibly merging the changes. Prevents the lost-update problem on collaborative resources.

## Combining idempotency + optimistic concurrency

For a PATCH:
- `If-Match`: prevent overwriting concurrent changes.
- `Idempotency-Key`: make retries safe.

Different concerns; can compose. Most simple APIs only need idempotency keys; collaborative apps add If-Match.

## Mistakes to avoid

- **Retry without idempotency keys on POST.** Duplicate charges.
- **No retry on 5xx / network errors.** Transient failures bubble to users.
- **Retry on 4xx.** Pointless and noisy.
- **Ignore Retry-After.** Hammer the server.
- **Retries without exponential backoff.** Cascading failures.
- **Idempotency cache too short / too long.** Tune to your retry windows.

## Summary

- POST + Idempotency-Key header makes non-idempotent operations safe to retry.
- Server caches result by key; replay returns cached response.
- Client generates UUID per logical operation; reuses across retries.
- Exponential backoff with jitter; cap attempts and delays.
- Retry 5xx, network errors, 429 (per Retry-After). Don't retry 4xx.
- Optimistic concurrency (If-Match/ETag) for collaborative resources.

Module 3 complete. Next module: versioning.
