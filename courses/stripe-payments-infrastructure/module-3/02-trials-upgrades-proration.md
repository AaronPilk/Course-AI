---
module: 3
position: 2
title: "Trials, upgrades, downgrades, and proration"
objective: "Handle plan changes mid-cycle correctly."
estimated_minutes: 9
---

# Trials, upgrades, downgrades, and proration

## The puzzle

A customer is on the $20/mo Pro plan. Mid-cycle, they upgrade to the $50/mo Premium plan. How much do you charge them now? How long until next bill? When they downgrade two months later, what happens?

Stripe's proration handles this. The mechanics are clean once you understand the model. Misconfigure and you'll surprise customers with weird bills.

## The simple version

Stripe handles plan changes via **proration**:

- **Upgrade**: charge the difference for the remaining period immediately.
- **Downgrade**: credit the unused portion of the old plan; apply to future invoices.

Default behavior: prorations are automatic. You can disable or customize.

## The technical version

### Upgrading a subscription

```js
const subscription = await stripe.subscriptions.retrieve(subId);

await stripe.subscriptions.update(subId, {
  items: [{
    id: subscription.items.data[0].id,
    price: newPrice.id
  }],
  proration_behavior: "create_prorations"
});
```

What happens:

1. Stripe calculates remaining time in current period.
2. Issues credits for unused time on old Price.
3. Issues charges for that time at new Price.
4. Difference is added to the next invoice OR billed immediately, depending on `proration_behavior`.

Default `create_prorations`: prorations appear on next invoice.

### Immediate proration

To bill the difference now:

```js
await stripe.subscriptions.update(subId, {
  items: [{ id: itemId, price: newPrice.id }],
  proration_behavior: "always_invoice"
});
```

Stripe creates and pays an Invoice immediately for the proration amount. Customer is charged the prorated upgrade fee right away.

### Disabling proration

For simpler billing (or when you don't want prorations):

```js
proration_behavior: "none"
```

No proration calculated. New Price applies starting next billing period. Customer gets a "free" remainder of the current period.

### Downgrades

Same API; usually you use `none` or `create_prorations`:

```js
await stripe.subscriptions.update(subId, {
  items: [{ id: itemId, price: cheaperPrice.id }],
  proration_behavior: "create_prorations"
});
```

This credits the unused portion of the more expensive plan and applies it to future invoices.

For most SaaS UX, downgrade at period end:

```js
await stripe.subscriptions.update(subId, {
  cancel_at_period_end: true
  // user re-signs up on cheaper plan after current period
});
```

Or schedule the downgrade for period end (Stripe supports phased subscriptions; complex; usually overkill).

### Trial extensions and ends

Extend a trial:

```js
await stripe.subscriptions.update(subId, {
  trial_end: futureTimestamp
});
```

End a trial immediately (charge now):

```js
await stripe.subscriptions.update(subId, {
  trial_end: "now"
});
```

Useful for "skip trial and pay now" flows.

### Trial conversion patterns

When a trial ends, Stripe attempts payment. If you collected a card during trial (recommended), the conversion is automatic. If you didn't:

- Subscription becomes `incomplete` waiting for payment method.
- User must come back, attach payment method, and complete subscription.
- Conversion rate is much lower without the card on file.

Always collect cards at trial start unless your product specifically can't.

### Quantity changes

For per-seat pricing:

```js
await stripe.subscriptionItems.update(itemId, {
  quantity: 10,
  proration_behavior: "create_prorations"
});
```

Same proration mechanics. Adding seats mid-cycle charges for the new seats' remaining time.

### Multi-item subscriptions

For subscriptions with multiple items (base plan + add-ons), update individual items:

```js
await stripe.subscriptionItems.update(itemId, {
  price: newAddOnPrice.id
});
```

Each item can have its own price/quantity changes. Stripe consolidates into one invoice per billing period.

### Schedule-based changes

For complex changes (downgrade to apply at period end, multiple changes in sequence), use Subscription Schedules:

```js
const schedule = await stripe.subscriptionSchedules.create({
  customer: customer.id,
  start_date: "now",
  phases: [
    { items: [{ price: proPriceId }], iterations: 3 },     // 3 months on Pro
    { items: [{ price: premiumPriceId }] }                  // then on Premium
  ]
});
```

Complex; useful for promotional flows and complex billing. Most SaaS doesn't need this.

### Preview before applying

Before changing a Price, preview the impact:

```js
const upcoming = await stripe.invoices.retrieveUpcoming({
  customer: customerId,
  subscription: subId,
  subscription_items: [{
    id: itemId,
    price: newPrice.id
  }]
});

console.log("Customer will be charged:", upcoming.amount_due);
console.log("Lines:", upcoming.lines.data);
```

Useful for showing "Your next bill will be $X" to the user before they confirm an upgrade. Critical for trust.

### Coupons and promotion codes

Discounts apply to subscriptions:

```js
await stripe.subscriptions.update(subId, {
  coupon: "couponId"
});

// Or via PromotionCode (customer-facing code like "WELCOME20"):
await stripe.subscriptions.update(subId, {
  promotion_code: "promo_xxx"
});
```

Stripe handles the discount math; surfaces on invoices.

### Cycle anchor changes

For changing billing dates (rare but useful for aligning all customers):

```js
await stripe.subscriptions.update(subId, {
  billing_cycle_anchor: "now",
  proration_behavior: "create_prorations"
});
```

Resets the cycle anchor; prorates accordingly.

### Webhooks for plan changes

Listen for:

- **`customer.subscription.updated`** — fires when subscription changes (price, quantity, status).
- **`invoice.created`** — new invoice for the prorated charge.
- **`invoice.paid`** — proration successfully charged.

Sync your DB on these so feature gating reflects the new plan.

## Three real-world scenarios

**Scenario 1: The instant-charge upgrade.**
A team's upgrades waited until next invoice. Customer upgraded to Premium but didn't see Premium features until next month. They switched to `proration_behavior: "always_invoice"` — instant charge, instant feature access. UX matched expectation.

**Scenario 2: The trial without card.**
A team offered 30-day trials without cards. Conversion was 12%. They moved to collecting card at trial start (with clear "we'll charge X at end of trial" messaging). Conversion jumped to 38%. Same product; different friction profile.

**Scenario 3: The downgrade-at-period-end UX.**
A team had immediate downgrades — customers downgraded to a cheaper plan and immediately lost features. Several complained "I paid for the month; let me use what I paid for." They switched to `cancel_at_period_end` + re-sub flow for downgrades. Customer experience improved.

## Common mistakes to avoid

- **Surprising customers with prorations** — preview before confirming.
- **Trials without cards** — kills conversion.
- **Immediate downgrades** that strip paid features mid-cycle.
- **No webhook sync** on subscription updates — DB lags Stripe state.
- **Forgetting to handle `incomplete`** after subscription updates that need new auth.

## Read more

- [Subscription updates](https://docs.stripe.com/billing/subscriptions/upgrade-downgrade)
- [Proration](https://docs.stripe.com/billing/subscriptions/prorations)
- [Subscription Schedules](https://docs.stripe.com/billing/subscriptions/subscription-schedules)

## Summary

- **Prorations** handle mid-cycle plan changes; default `create_prorations` adds to next invoice.
- **`always_invoice`** for immediate charges; **`none`** to disable proration.
- **Trials** are built-in; collect cards at trial start for clean conversion.
- **Preview upcoming invoice** before confirming changes; show user the impact.
- **Downgrade at period end** is usually better UX than immediate.
- **Webhooks**: `customer.subscription.updated` and `invoice.*` to sync DB.

Next: dunning — handling failed payments.
