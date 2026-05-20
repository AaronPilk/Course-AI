---
module: 4
position: 1
title: "Webhooks 101 — what they are and why every integration needs them"
objective: "Set up a webhook endpoint and process events."
estimated_minutes: 8
---

# Webhooks 101 — what they are and why every integration needs them

## The puzzle

Your customer pays via Stripe. Your server needs to know — to mark the order paid, send a confirmation, grant access. You can poll Stripe ("any new payments?"), but polling is slow, expensive, and unreliable. Webhooks are the right answer.

Stripe pushes events to your server when things happen. Your server reacts. This lesson is the basic mechanics.

## The simple version

A webhook is an HTTPS POST from Stripe to your server when an event happens:

```
PaymentIntent succeeded → Stripe POSTs payment_intent.succeeded to your webhook URL
Subscription created → Stripe POSTs customer.subscription.created
Invoice paid → Stripe POSTs invoice.paid
```

You handle the event in your code. Your DB stays in sync with Stripe.

## The technical version

### Setting up a webhook endpoint

1. **Build a route** on your server (e.g. `/api/stripe/webhook`).
2. **Register the URL** in Stripe Dashboard → Developers → Webhooks → Add endpoint.
3. **Pick event types** to subscribe to.
4. **Get the signing secret** (`whsec_...`).
5. **Handle events** in your code.

### Minimal handler

```js
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();  // RAW body, not parsed JSON
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }
  
  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSuccess(event.data.object);
      break;
    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object);
      break;
    // ... other events
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return Response.json({ received: true });
}
```

Three things to notice:

1. **Raw body**: signature verification needs the raw body, not parsed JSON.
2. **Signature verification**: validate every event before trusting it.
3. **Return 200 quickly**: tell Stripe you received it.

### Event types you'll handle most

For a typical SaaS:

- **`checkout.session.completed`**: a Checkout flow finished.
- **`payment_intent.succeeded`**: a payment succeeded.
- **`payment_intent.payment_failed`**: a payment failed.
- **`invoice.paid`**: an invoice was paid (subscription billing).
- **`invoice.payment_failed`**: invoice payment failed.
- **`customer.subscription.created`**: new subscription.
- **`customer.subscription.updated`**: subscription changed.
- **`customer.subscription.deleted`**: subscription canceled.
- **`charge.refunded`**: a refund was issued.

Subscribe in the dashboard to only the events you actually handle. Less noise; less work.

### Event payload structure

Every event has:

```json
{
  "id": "evt_abc123",
  "type": "payment_intent.succeeded",
  "data": {
    "object": { /* the relevant Stripe object */ }
  },
  "api_version": "2024-04-10",
  "created": 1719859200
}
```

The `data.object` is the relevant resource (PaymentIntent, Subscription, etc.) at the time of the event.

For some events, `data.previous_attributes` shows what changed (useful for `customer.subscription.updated`).

### Stripe's retry behavior

If your endpoint returns non-2xx or times out, Stripe retries:

- **Schedule**: at-least-once delivery; retries over hours then days.
- **Up to 3 days** by default.
- **Exponential backoff**.

If your endpoint is down for hours, events queue and replay when you're back up. Resilient.

### Idempotency in your handler

Stripe might deliver the same event multiple times (retries, network blips). Your handler MUST be idempotent — same event processed twice should be a no-op the second time:

```js
async function handleEvent(event) {
  const exists = await db.processedEvents.findById(event.id);
  if (exists) return;  // already processed
  
  await processEvent(event);
  await db.processedEvents.create({ id: event.id, processed_at: new Date() });
}
```

Without this, duplicate events double-process — duplicate confirmations, duplicate metric inserts, duplicate user grants. Common bug; easy to fix.

### Timeout handling

Stripe waits ~30 seconds for a webhook response. If your handler is slow:

1. Stripe times out.
2. Marks event as failed.
3. Retries.

Pattern: **acknowledge quickly; process async**.

```js
export async function POST(req) {
  // Verify signature, parse event ...
  const event = stripe.webhooks.constructEvent(...);
  
  // Enqueue the heavy work
  await queue.enqueue("process_stripe_event", event.id);
  
  // Ack fast
  return Response.json({ received: true });
}
```

Heavy work runs in a background job. Webhook handler stays under a second.

### Multiple webhook endpoints

You can register multiple endpoints:

- Production endpoint at `https://yourapp.com/api/stripe/webhook`.
- Staging endpoint at `https://staging.yourapp.com/api/stripe/webhook`.
- Localhost via Stripe CLI for dev.

Each has its own signing secret. Don't mix them up.

### Dashboard event monitoring

Stripe Dashboard → Developers → Webhooks → click your endpoint:

- **Successful deliveries**: count + recent events.
- **Failed deliveries**: events that returned non-2xx; retried.
- **Event payloads**: inspect what Stripe sent.

When debugging: dashboard is the first place to look.

### Reading Stripe objects from events

Don't trust the object in the event blindly. For sensitive operations, refetch:

```js
case "payment_intent.succeeded":
  // Refetch to get latest state
  const intent = await stripe.paymentIntents.retrieve(event.data.object.id);
  if (intent.status !== "succeeded") {
    // Don't fulfill — event was stale
    return Response.json({ received: true });
  }
  await fulfillOrder(intent.metadata.order_id);
  break;
```

For most events the in-event object is fine. For high-stakes operations, refetch.

### Filtering events

In dashboard, choose only the event types you handle. Default subscriptions to "all events" is noisy.

If you must subscribe broadly (e.g. for auditing), at minimum log everything to a side store and process only the events you care about in your main handler.

## Three real-world scenarios

**Scenario 1: The fulfillment via webhook win.**
A team fulfilled orders on the success page. ~5% of orders went unfulfilled because users closed the tab before redirect. They added webhook-based fulfillment on `checkout.session.completed`. Unfulfilled rate dropped to ~0%. Now the success page is just UX confirmation; the webhook is the source of truth.

**Scenario 2: The duplicate processing bug.**
A team didn't dedupe by `event.id`. On Stripe's retries, the same event ran multiple times — duplicate access grants, duplicate emails. Added `processedEvents` table; problem disappeared. One-day fix; should have been there from day 1.

**Scenario 3: The slow handler timeout.**
A team's webhook handler ran heavy DB writes inline. P99 latency was ~45 seconds. Stripe timed out half of webhooks; retries piled up. Switched to enqueue + async processing. P99 dropped to 200ms; retries stopped.

## Common mistakes to avoid

- **No signature verification** — attackers can forge events.
- **No idempotency by event ID** — duplicate processing on retries.
- **Slow handlers** — Stripe times out; retries multiply.
- **Subscribing to all events** — noisy logs; slow handlers process garbage.
- **Trusting event payloads for high-stakes** — refetch when stakes warrant.
- **No staging webhook** — testing in prod or not testing.

## Read more

- [Webhooks overview](https://docs.stripe.com/webhooks)
- [Webhook events reference](https://docs.stripe.com/api/events)
- [Webhook best practices](https://docs.stripe.com/webhooks/best-practices)

## Summary

- **Webhooks** push events from Stripe to your server when things happen.
- **Register** endpoint URL + event types + signing secret in dashboard.
- **Verify signature** on every event; use `stripe.webhooks.constructEvent`.
- **Idempotency by event ID** prevents duplicate processing on Stripe retries.
- **Acknowledge fast; process async** to avoid timeouts.
- **Subscribe to specific event types**, not all.
- **Refetch for high-stakes operations** if event payload is stale-risk.

Next: signature verification — the security layer.
