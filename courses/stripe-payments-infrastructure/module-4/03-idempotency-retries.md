---
module: 4
position: 3
title: "Idempotency, retries, and event ordering"
objective: "Handle Stripe's at-least-once delivery without breaking your database."
estimated_minutes: 8
---

# Idempotency, retries, and event ordering

## The puzzle

Stripe delivers webhooks at least once — sometimes twice, sometimes ten times if your endpoint had issues. They can also arrive out of order. If your handler processes each delivery as new and trusts the order, you'll have duplicate side effects and state inconsistencies.

This lesson is the discipline: how to make your handler resilient to the realities of Stripe's webhook delivery.

## The simple version

Three rules:

1. **Idempotency**: dedupe by `event.id` so duplicate deliveries are no-ops.
2. **Out-of-order tolerance**: don't assume Stripe events arrive in chronological order; use timestamps or refetch.
3. **Quick acknowledgment**: return 200 fast; do heavy work async.

## The technical version

### The duplicate problem

Stripe might deliver the same event multiple times. Common reasons:

- Your endpoint timed out; Stripe retries.
- Your endpoint returned 5xx; Stripe retries.
- Network blip; Stripe sees no ack; retries.
- Stripe internal redelivery for reliability.

Without dedup: each delivery runs your handler again. Each run might:

- Insert a duplicate row.
- Send a duplicate email.
- Grant access twice.
- Increment a counter.

End state: drift between Stripe and your DB. Bug discovered later when reconciliation fails.

### Dedup by event ID

```js
async function handleWebhook(event) {
  // Atomic check + insert
  const claimed = await db.processedEvents.tryInsert({
    id: event.id,
    type: event.type,
    received_at: new Date()
  });
  
  if (!claimed) {
    // Already processed; safe to skip
    return { received: true };
  }
  
  // Process the event
  try {
    await processEvent(event);
    await db.processedEvents.update(event.id, { status: "completed" });
  } catch (err) {
    await db.processedEvents.update(event.id, { status: "failed", error: err.message });
    throw err;
  }
}
```

The `tryInsert` is atomic — only one process succeeds in claiming an event ID. Subsequent attempts get rejected (unique constraint), and the handler skips processing.

Use a unique index on `event_id` to enforce this at the DB level.

### Out-of-order events

Stripe doesn't guarantee chronological delivery. Common scenario:

```
12:00:00 — invoice.created
12:00:01 — invoice.paid
12:00:02 — customer.subscription.updated  (status: active)
```

Your endpoint might receive them in any order. If your handler trusts arrival order:

```js
// WRONG — assumes order
case "invoice.created":
  await db.invoices.create({ id: invoice.id, status: "draft" });
  break;
case "invoice.paid":
  await db.invoices.update(invoice.id, { status: "paid" });
  break;
```

If `invoice.paid` arrives before `invoice.created`, the update fails (row doesn't exist).

Fixes:

**1. Upsert instead of insert/update**:

```js
await db.invoices.upsert({
  id: invoice.id,
  status: invoice.status,  // use authoritative status from event
  amount: invoice.amount_paid,
  customer_id: invoice.customer
});
```

The event itself carries the current state. Upsert based on the event's data, not a state machine your code imposes.

**2. Check event timestamp**:

```js
const existing = await db.subscriptions.findById(sub.id);
if (existing && existing.last_event_ts > event.created) {
  // We have newer state; skip this older event
  return { received: true };
}
await db.subscriptions.upsert({
  ...sub,
  last_event_ts: event.created
});
```

Save the timestamp of the most recent event you've processed; skip older events.

**3. Refetch from Stripe**:

For high-stakes operations, refetch the object from Stripe to get the latest state:

```js
case "invoice.paid":
  const current = await stripe.invoices.retrieve(event.data.object.id);
  if (current.status !== "paid") {
    // Event is stale; current state is different
    return { received: true };
  }
  await fulfillInvoice(current);
  break;
```

The refetch is authoritative; the event payload is a hint.

### Stripe's delivery semantics

- **At-least-once**: never zero; sometimes more.
- **Not strictly ordered**: events related to one object can arrive out of order.
- **Eventual consistency**: all events arrive within ~hours (often seconds), even after long outages on your side.

Build your handler around these properties. Don't assume strict order or exactly-once.

### Quick acknowledgment pattern

```js
export async function POST(req) {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return new Response("Bad signature", { status: 400 });
  }
  
  // Persist immediately
  await db.webhookQueue.insert({ id: event.id, payload: event });
  
  // Process async
  await queue.enqueue("process_stripe_event", event.id);
  
  // Ack fast
  return Response.json({ received: true });
}
```

Webhook handler is sub-second. The background worker picks up from the queue and processes:

```js
async function processQueuedEvent(eventId) {
  const stored = await db.webhookQueue.findById(eventId);
  await handleEvent(stored.payload);
  await db.webhookQueue.delete(eventId);
}
```

If processing fails, the event stays in the queue for retry. Idempotency keeps duplicates safe.

### Error handling in handlers

When your handler errors:

- **Return non-2xx**: Stripe will retry.
- **Return 200**: Stripe considers it processed; won't retry.

For transient failures (DB blip, downstream timeout): return 5xx so Stripe retries.

For permanent failures (bad data, no recovery possible): return 200 and log the error; manual intervention later. Don't waste Stripe's retry budget on impossible recoveries.

### Stripe's retry schedule

Default: at-least-once delivery with retries over up to 3 days. The pattern is approximately:

- Initial attempt.
- Retry after seconds.
- Retry after minutes.
- Retry after hours.
- Final retry hours later.

If your endpoint is down for 1 hour, missed events queue up and replay. After 3 days, Stripe gives up.

### Event replay

In the Stripe Dashboard → Webhooks → click an event:

- See the payload.
- See delivery attempts.
- Manually resend.

Useful when:

- A bug caused a handler to fail; you fixed the bug; want to replay events.
- You want to test a handler with real production payloads.

### Backfill on the side

When you change a handler's behavior, you might want to re-process old events. Options:

1. **Manually replay** specific events via dashboard.
2. **Query Stripe's events API**:
   ```js
   const events = await stripe.events.list({
     type: "invoice.paid",
     created: { gte: yesterday }
   });
   ```
3. **Batch reconcile** by reading current Stripe state and updating your DB.

For most products: reconciliation jobs running periodically (daily) catch any drift.

### Event ordering when it matters

For a few specific flows, order matters more:

- **Subscription state transitions**: `incomplete → active` should be processed before downstream actions.
- **Payment-then-refund**: refund only makes sense after the original payment is processed.

Patterns:

- **Refetch from Stripe** in your handler so you always have current state.
- **Queue with dependencies**: process events in order per object (subscription_id, invoice_id) even if globally out of order.
- **Defer if not ready**: if you receive `invoice.paid` for an unknown invoice, refetch — likely creates the row.

### Reconciliation

Periodically reconcile your DB against Stripe. Daily / weekly job:

```js
async function reconcile() {
  const stripeSubs = await stripe.subscriptions.list({ limit: 100 });
  for await (const sub of stripeSubs.autoPagingEach()) {
    const local = await db.subscriptions.findById(sub.id);
    if (!local || local.status !== sub.status) {
      await db.subscriptions.upsert({ id: sub.id, status: sub.status, ... });
    }
  }
}
```

Catches drift from missed events, bugs, or manual changes in Stripe Dashboard.

## Three real-world scenarios

**Scenario 1: The duplicate emails.**
A team didn't dedupe by event ID. On Stripe's retries, the same `payment_intent.succeeded` ran 3x; user got 3 confirmation emails. Customer support tickets followed. Added the `processedEvents` table; problem disappeared. One-day fix; should have been there from day 1.

**Scenario 2: The out-of-order subscription.**
A team's handler used a state machine assuming `customer.subscription.created → invoice.created → invoice.paid → active`. In one case, `invoice.paid` arrived first; handler errored on missing parent row; subscription stuck. Refactored to upsert based on event payload (using the authoritative state from the event); order independence achieved.

**Scenario 3: The replay save.**
A bug caused webhook processing failures for 2 hours. Fix deployed. Team manually replayed affected events via dashboard; everyone caught up. Without replay, would have needed reconciliation job or customer support outreach. Lesson: replay UI is your friend.

## Common mistakes to avoid

- **No event-ID dedup** — duplicate side effects on retries.
- **Assuming event order** — handlers break when events arrive out of order.
- **Slow handlers** — Stripe times out; retries flood.
- **Treating event payload as final** — refetch when stakes warrant.
- **No reconciliation job** — drift accumulates silently.
- **Returning 200 on retriable errors** — Stripe stops retrying; events lost.

## Read more

- [Webhook idempotency](https://docs.stripe.com/webhooks/best-practices#idempotency)
- [Event order](https://docs.stripe.com/webhooks#event-order)
- [Replaying events](https://docs.stripe.com/webhooks#replay-events)

## Summary

- **Dedupe by `event.id`** — atomic insert with unique constraint.
- **Don't assume event order** — use upsert + authoritative state from event, or refetch.
- **Quick ack + async process** for slow handlers.
- **Return 5xx for retriable errors**; 200 for permanent failures (and log).
- **Daily reconciliation** catches drift.
- **Replay events** via dashboard when needed.

Next: the events you actually need to listen to.
