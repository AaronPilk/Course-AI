---
module: 1
position: 4
title: "Idempotency — Stripe's superpower"
objective: "Use idempotency keys to make payment operations safe to retry."
estimated_minutes: 8
---

# Idempotency — Stripe's superpower

## The puzzle

Network requests fail. APIs time out. Your server crashes mid-operation. In any of these cases: you don't know if the request reached Stripe or not. You can retry, but if the first request actually succeeded, you'll have duplicate charges, duplicate refunds, duplicate subscriptions.

Stripe's solution: **idempotency keys**. Pass the same key twice, get the same result both times — no duplicate side effects.

## The simple version

For any mutating operation (create PaymentIntent, refund, subscription), pass an `idempotencyKey` header:

```js
await stripe.paymentIntents.create({
  amount: 2000,
  currency: "usd",
  customer: customer.id
}, {
  idempotencyKey: `order-${orderId}`
});
```

If the request reaches Stripe and you retry with the same key (because you didn't get a response), Stripe returns the original result instead of creating a duplicate. Same key twice = same outcome.

## The technical version

### How Stripe's idempotency works

1. Stripe receives a request with `Idempotency-Key: order-123`.
2. Stripe processes the request, stores the result under that key.
3. If a second request comes with the same key:
   - **If Stripe sees it before the first completes**: blocks until the first completes; returns its result.
   - **If after the first completes**: returns the stored result without re-processing.
   - **If parameters differ**: returns an error (you sent the same key with different data).

Keys are cached for 24 hours. After that, they expire and a new request with the same key creates a fresh operation.

### Choosing keys

A good idempotency key:

- **Unique to the logical operation**: not "create-payment-intent" but "create-payment-intent-for-order-123".
- **Stable across retries**: same key on retries; not regenerated each attempt.
- **Random or deterministic**: UUID, hash, or business-meaningful identifier.

Common patterns:

```js
// UUID generated once per task, stored:
const key = uuidv4();
await store.save(operationId, key);
// Later: retrieve key on retry

// Or business-meaningful:
const key = `payment-${userId}-${orderId}`;

// Or hashed input:
const key = sha256(JSON.stringify({ userId, amount, timestamp }));
```

Whichever pattern, ensure the key is stable across retries of the same logical operation.

### Where idempotency applies

Stripe accepts idempotency keys on most POST endpoints:

- Creating PaymentIntents, Customers, Subscriptions, Invoices, etc.
- Refunds and Disputes.
- Most mutating operations.

Read operations (GET) don't need idempotency — they're already idempotent.

### Idempotency in your own code

Stripe's idempotency only covers your server → Stripe leg. You need idempotency on:

- **Your own webhook handlers** (so duplicate webhook deliveries don't double-process).
- **Your DB writes** triggered by Stripe responses.
- **Your retry logic**.

Without end-to-end idempotency, you can still get duplicate side effects in your own database even if Stripe is clean.

### The full retry pattern

```js
async function chargeForOrder(orderId, amount) {
  const order = await db.orders.get(orderId);
  
  // Generate or reuse idempotency key
  if (!order.idempotency_key) {
    order.idempotency_key = uuidv4();
    await db.orders.update(orderId, { idempotency_key: order.idempotency_key });
  }
  
  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: order.customer_id
    }, {
      idempotencyKey: order.idempotency_key
    });
    
    await db.orders.update(orderId, { payment_intent_id: intent.id });
    return intent;
  } catch (err) {
    // Retry safely with the same key
    throw err;
  }
}
```

Key stored in DB; same key on every retry; Stripe returns same intent ID.

### Mismatched parameters

A common gotcha: same idempotency key with different parameters:

```js
await stripe.paymentIntents.create({ amount: 2000, ... }, { idempotencyKey: "x" });
await stripe.paymentIntents.create({ amount: 3000, ... }, { idempotencyKey: "x" });  // Error
```

Stripe rejects the second call with "different request parameters." Either use a new key or send identical parameters.

If your retry logic changes parameters (e.g. recalculates total), it'll error. Make sure retry uses the same data as the original.

### Webhooks and idempotency

When Stripe sends a webhook, you should:

1. Check if you've processed this event before (by Event ID).
2. If yes, return 200 and skip.
3. If no, process it; mark as processed.

```js
async function handleWebhook(event) {
  const exists = await db.processedEvents.find(event.id);
  if (exists) {
    return { received: true };
  }
  
  await processEvent(event);
  await db.processedEvents.create({ id: event.id, processed_at: new Date() });
  return { received: true };
}
```

Stripe retries webhooks on failures. Without dedup, you'd process the same event multiple times.

### Edge cases

- **Long-running operations**: if a request takes longer than your client timeout, you retry with the same key while the original is still in flight. Stripe blocks the second request until the first completes; you get the same result.
- **Cross-region requests**: idempotency keys work globally. Same key from different regions = same result.
- **Different API versions**: same key with different API versions can return different shapes. Pin your API version.

### Best practices

1. **Store keys** in your database alongside the operation they cover.
2. **Generate once, retry many** — never regenerate keys on retries.
3. **24-hour cache** — Stripe keeps keys for 24 hours. Old retries get fresh operations.
4. **Pair with webhook dedup** — your full pipeline needs idempotency at every step.
5. **Test the retry path** — simulate failures in dev; verify no duplicates.

## Three real-world scenarios

**Scenario 1: The double-charge prevention.**
A team's checkout flow occasionally crashed after creating a PaymentIntent but before saving the ID locally. Without idempotency keys, retries would create duplicate intents and double-charge. With keys stored in DB: retry returns same intent; charge happens once.

**Scenario 2: The webhook flood.**
Stripe delivered a webhook successfully but your endpoint timed out before responding. Stripe retried 5 times. Without dedup, your DB processed the event 5 times — duplicated metric inserts, sent 5 confirmation emails. They added Event ID dedup; problem disappeared.

**Scenario 3: The parameter mismatch.**
A team's retry logic recalculated the order total (which had changed slightly due to coupons). Same idempotency key, different amount → Stripe errored. Fix: stored the exact request parameters alongside the key; reused them on retry, not recalculated.

## Common mistakes to avoid

- **No idempotency keys** on mutating operations.
- **Regenerated keys on retries** — defeats the purpose.
- **Different parameters with same key** — Stripe errors.
- **No webhook dedup** — duplicate event processing.
- **Keys not stored** — can't reuse on retries.
- **Trusting Stripe's idempotency for your DB writes** — you need your own dedup too.

## Read more

- [Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [Webhook best practices](https://docs.stripe.com/webhooks/best-practices)
- Stripe Engineering blog on designing idempotent APIs

## Summary

- **Idempotency keys** on every mutating Stripe call make retries safe.
- **Generate once per logical operation; reuse on retries**; store in DB.
- **Keys cached 24 hours** by Stripe; same parameters required on reuse.
- **Webhook dedup** by Event ID on your side; Stripe retries on failures.
- **End-to-end discipline** — Stripe alone isn't enough; your DB and webhooks also need idempotency.

That wraps Module 1. Next: accepting a payment end-to-end.
