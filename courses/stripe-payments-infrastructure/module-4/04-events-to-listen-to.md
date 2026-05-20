---
module: 4
position: 4
title: "The events you actually need to listen to"
objective: "Build a minimal but complete webhook handler for common product types."
estimated_minutes: 8
---

# The events you actually need to listen to

## The puzzle

Stripe emits hundreds of event types. Subscribing to "all" floods your handler with noise. Subscribing to too few misses critical state changes. The right set depends on your product type.

This lesson is the practical cheat sheet: minimal but complete event sets by product shape.

## The simple version

For most products, you handle 5-15 event types. Pick by product shape:

- **One-time payments only**: `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`.
- **Subscriptions**: add `customer.subscription.*` + `invoice.*` + `invoice.payment_failed`.
- **Marketplace / Connect**: add `account.updated`, `transfer.*`, `payout.*`.
- **Disputes (any product)**: `charge.dispute.*`.

Subscribe to exactly those; ignore the rest.

## The technical version

### Minimal handler — one-time payments

For a product where users buy individual items (no subscriptions):

```js
case "checkout.session.completed":
  // Fulfill the order
  await fulfillOrder(event.data.object);
  break;

case "payment_intent.succeeded":
  // Backup confirmation (Checkout already covers this)
  await markPaymentSuccess(event.data.object);
  break;

case "payment_intent.payment_failed":
  await notifyPaymentFailure(event.data.object);
  break;

case "charge.refunded":
  // Customer support issued refund
  await markRefunded(event.data.object);
  break;

case "charge.dispute.created":
  await alertDispute(event.data.object);
  break;
```

5 events covers most one-time payment products end-to-end.

### Subscription product

Add to the above:

```js
case "customer.subscription.created":
  await activateSubscription(event.data.object);
  break;

case "customer.subscription.updated":
  // Plan change, trial end, etc.
  await syncSubscription(event.data.object);
  break;

case "customer.subscription.deleted":
  await deactivateSubscription(event.data.object);
  break;

case "invoice.paid":
  // Recurring billing succeeded
  await extendSubscriptionAccess(event.data.object);
  break;

case "invoice.payment_failed":
  // Dunning: notify user, restrict in grace period
  await startDunning(event.data.object);
  break;

case "invoice.payment_action_required":
  // 3DS / SCA challenge needed
  await notifyAuthRequired(event.data.object);
  break;

case "customer.subscription.trial_will_end":
  // Trial ending in 3 days; nudge user
  await notifyTrialEnding(event.data.object);
  break;
```

That's the complete subscription lifecycle in webhooks. Combined with one-time events, this is the handler for a typical SaaS.

### Marketplace (Stripe Connect)

For platforms paying out to connected accounts:

```js
case "account.updated":
  // Connected account onboarding status changed
  await syncConnectedAccount(event.data.object);
  break;

case "transfer.created":
  await recordTransferToAccount(event.data.object);
  break;

case "payout.paid":
  await markPayoutComplete(event.data.object);
  break;

case "payout.failed":
  await alertPayoutFailure(event.data.object);
  break;

case "capability.updated":
  // Connected account gained or lost capability
  await syncCapability(event.data.object);
  break;
```

Connect introduces a whole new domain. These events keep your DB in sync with Stripe's view of connected accounts.

### Dispute / chargeback flow

Independent of product type:

```js
case "charge.dispute.created":
  await openDisputeCase(event.data.object);
  break;

case "charge.dispute.updated":
  await syncDisputeStatus(event.data.object);
  break;

case "charge.dispute.funds_withdrawn":
  // Stripe debited your account for the disputed amount
  await markFundsWithdrawn(event.data.object);
  break;

case "charge.dispute.closed":
  // Outcome: won, lost, or warning
  await closeDisputeCase(event.data.object);
  break;
```

Module 5 covers disputes in depth.

### Setup-flow events

For SetupIntents (saving payment methods without charging):

```js
case "setup_intent.succeeded":
  await markPaymentMethodSaved(event.data.object);
  break;

case "setup_intent.setup_failed":
  await notifySetupFailure(event.data.object);
  break;
```

### Common events to skip

Often noise:

- `charge.succeeded`: usually duplicate of `payment_intent.succeeded`.
- `invoice.created`: noisy; you usually care about paid/failed.
- `customer.updated`: high frequency; subscribe only if you mirror customer profiles in your DB.
- `payment_method.attached`: usually covered by SetupIntent or Subscription events.
- `customer.tax_id.created`: only if you track tax IDs.

Subscribe selectively. Stripe Dashboard → Webhooks → Endpoint → Edit → event types. Pick from a list; don't subscribe to "all events" unless you really need to.

### Special events for marketplaces with subscriptions

If you run subscriptions across connected accounts (rare; complex), you also need:

- `customer.subscription.*` per connected account.
- `invoice.*` per connected account.
- These come from each Connected account, not your platform account.

You configure separate webhook endpoints per Connected account, or use account events on your platform.

### Event filtering at subscription

In dashboard, you can subscribe to:

- **All events from this endpoint** (noisy).
- **Specific event types** (recommended).
- **All events from a specific Connected account** (for Connect).

Pick specific event types. Less work for your handler; less log noise; cheaper.

### Handler structure pattern

```js
const handlers = {
  "checkout.session.completed": handleCheckoutCompleted,
  "payment_intent.succeeded": handlePaymentSuccess,
  "payment_intent.payment_failed": handlePaymentFailed,
  "customer.subscription.created": handleSubscriptionCreated,
  "customer.subscription.updated": handleSubscriptionUpdated,
  "customer.subscription.deleted": handleSubscriptionDeleted,
  "invoice.paid": handleInvoicePaid,
  "invoice.payment_failed": handleInvoicePaymentFailed,
  "invoice.payment_action_required": handleInvoiceActionRequired,
  "charge.refunded": handleRefund,
  "charge.dispute.created": handleDisputeCreated,
};

async function handleWebhook(event) {
  const handler = handlers[event.type];
  if (!handler) {
    console.log(`Unhandled event type: ${event.type}`);
    return;
  }
  await handler(event.data.object, event);
}
```

Routing table over a switch — easier to test and add new handlers.

### Sample handler

```js
async function handleSubscriptionUpdated(subscription) {
  // Idempotency already enforced upstream
  const userId = subscription.metadata.user_id;
  if (!userId) {
    console.error("No user_id in subscription metadata", subscription.id);
    return;
  }
  
  await db.users.update(userId, {
    plan: subscription.items.data[0].price.id,
    subscription_status: subscription.status,
    current_period_end: new Date(subscription.current_period_end * 1000)
  });
  
  // Notify user of state change
  if (subscription.status === "past_due") {
    await emails.send("payment_issue", userId);
  } else if (subscription.status === "active" && subscription.previous_attributes?.status === "past_due") {
    await emails.send("payment_recovered", userId);
  }
}
```

Use `metadata.user_id` to link back to your DB. Sync subscription state. Send notifications based on transitions.

### Logging strategy

Log:

- Event ID, type, timestamp.
- Handler outcome (success / error).
- Important fields (user_id, amount, status).

Don't log:

- Full event payloads (often have PII).
- Card details (you shouldn't have them anyway).
- Email addresses + names together unless your privacy policy allows.

Log enough to debug; not so much that compliance breaks.

### Testing handlers

```bash
# Trigger specific event types from CLI
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
```

Builds a realistic test event and POSTs to your `stripe listen` forward. Test each handler with synthetic events; iterate fast.

### Periodic reconciliation

Webhook handlers + reconciliation = belt and suspenders.

```js
async function reconcileSubscriptions() {
  const localSubs = await db.subscriptions.findAll();
  for (const local of localSubs) {
    const stripeSub = await stripe.subscriptions.retrieve(local.stripe_id);
    if (local.status !== stripeSub.status) {
      console.warn(`Drift detected: ${local.id} local=${local.status} stripe=${stripeSub.status}`);
      await db.subscriptions.update(local.id, { status: stripeSub.status });
    }
  }
}
```

Run daily. Catches missed events, bugs, manual changes in Stripe Dashboard.

## Three real-world scenarios

**Scenario 1: The minimal complete handler.**
A team listed every event type they thought they "might need" — 40+ events. Handler became unmaintainable. They audited what they actually used: 11 events. Trimmed the subscription. Logs got readable; handler simplified; no functional loss.

**Scenario 2: The trial-ending nudge.**
A team subscribed to `customer.subscription.trial_will_end`. Email user 3 days before trial ends: "Your trial expires soon; add a card or you'll lose access." Trial-to-paid conversion jumped because users got a clear, actionable reminder.

**Scenario 3: The reconciliation catch.**
A team's webhook handler had a bug for 2 hours; some events failed. They had a daily reconciliation job; it caught the drift overnight; auto-synced. Customers never noticed. Without reconciliation, they'd have had support tickets for a week as customers slowly noticed wrong subscription statuses.

## Common mistakes to avoid

- **Subscribe to "all events"** — noisy, expensive in handler work.
- **Miss `invoice.payment_action_required`** — 3DS recovery flow broken.
- **Miss `customer.subscription.trial_will_end`** — trial conversion suffers.
- **No reconciliation job** — drift accumulates.
- **Forgetting `metadata.user_id`** — can't link events back to your users.
- **Treating `charge.succeeded` as primary** — `payment_intent.succeeded` is the modern equivalent.

## Read more

- [Event types reference](https://docs.stripe.com/api/events/types)
- [Choosing events to listen to](https://docs.stripe.com/webhooks/quickstart)
- [Reconciliation patterns](https://docs.stripe.com/billing/automation/reconciliation)

## Summary

- **Subscribe selectively** to the events your product actually needs.
- **One-time payments**: ~5 events; **subscriptions**: ~13 events.
- **Connect (marketplaces)**: add `account.*`, `transfer.*`, `payout.*`.
- **Disputes**: `charge.dispute.*` for any product.
- **Handler routing table** beats switch statement for maintainability.
- **`metadata.user_id`** links events to your DB.
- **Daily reconciliation** catches drift from missed events or bugs.

That wraps Module 4. Next: production Stripe — disputes, tax, and the long tail.
