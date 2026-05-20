---
module: 3
position: 1
title: "Subscriptions 101 — Products, Prices, and the billing cycle"
objective: "Set up a subscription product with multiple price options."
estimated_minutes: 9
---

# Subscriptions 101 — Products, Prices, and the billing cycle

## The puzzle

You want recurring revenue. Stripe Billing handles it — Products you sell, Prices you charge, Subscriptions that bill on a schedule. The pieces compose cleanly once you know the model. Without it, you build features that fight Stripe's data shape.

## The simple version

For a SaaS subscription:

1. Create a **Product** ("Pro Plan").
2. Create one or more **Prices** for it ($20/mo, $200/year, etc.).
3. Create a **Subscription** linking a Customer to a Price.
4. Stripe handles **Invoices** and **PaymentIntents** for each billing cycle.
5. Webhooks fire at each lifecycle event.

That's the data model. The rest is policies (trials, upgrades, dunning) built on top.

## The technical version

### Products and Prices, again

From Module 1: Products are the abstract thing; Prices are how they're priced.

```js
// Create Product
const product = await stripe.products.create({
  name: "Pro Plan",
  description: "All Pro features, billed monthly or yearly"
});

// Create Prices
const monthlyPrice = await stripe.prices.create({
  product: product.id,
  currency: "usd",
  unit_amount: 2000,
  recurring: { interval: "month" }
});

const yearlyPrice = await stripe.prices.create({
  product: product.id,
  currency: "usd",
  unit_amount: 20000,
  recurring: { interval: "year" }
});
```

For most SaaS: 1-3 Products, each with 2-4 Prices (monthly/yearly, currencies, tiers).

You can also create Products and Prices in the dashboard; sync to your DB via webhook or by listing periodically.

### Subscription creation

The simplest path:

```js
const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: monthlyPrice.id }],
  metadata: { user_id: user.id }
});
```

Outcomes:

- **`active`**: payment succeeded; subscription live.
- **`incomplete`**: payment needs action (3DS); user must complete on-session.
- **`past_due`**: payment failed; Stripe will retry per your dunning settings.

Listen for `customer.subscription.created` webhook to mark the user's plan in your DB.

### Subscription items

A Subscription has one or more items. Most SaaS uses one item (the plan):

```js
items: [{ price: planPrice.id, quantity: 1 }]
```

For multi-item subscriptions (e.g. base plan + add-ons):

```js
items: [
  { price: basePlanPrice.id, quantity: 1 },
  { price: extraSeatsPrice.id, quantity: 5 }
]
```

Each item bills independently within the same Invoice.

### Billing cycle anchor

By default, the billing cycle starts when the subscription is created. Each cycle, Stripe issues an Invoice and attempts payment.

You can anchor differently:

```js
billing_cycle_anchor: 1735689600  // Unix timestamp; subscription bills on this date
```

Useful for aligning all customers to a specific date (e.g. always charge on the 1st).

### Tiered pricing

For usage-based or volume pricing, use Tiers:

```js
await stripe.prices.create({
  product: product.id,
  currency: "usd",
  recurring: { interval: "month" },
  billing_scheme: "tiered",
  tiers_mode: "graduated",
  tiers: [
    { up_to: 1000, unit_amount: 100 },     // first 1000 units at $1 each
    { up_to: 10000, unit_amount: 80 },    // next 9000 at $0.80
    { up_to: "inf", unit_amount: 50 }     // beyond at $0.50
  ]
});
```

Use `tiers_mode: "volume"` for tier-based (everything in the same tier price) vs. `"graduated"` (each tier priced separately).

### Usage-based billing

For metered subscriptions, report usage:

```js
// Set up a metered Price (recurring + usage_type: metered)
const meteredPrice = await stripe.prices.create({
  product: product.id,
  currency: "usd",
  recurring: { interval: "month", usage_type: "metered" },
  unit_amount: 1
});

// Report usage during the billing period
await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
  quantity: 100,
  timestamp: Math.floor(Date.now() / 1000),
  action: "increment"
});
```

At billing time, Stripe sums usage and bills accordingly.

### Trials

Built-in:

```js
await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: planPrice.id }],
  trial_period_days: 14
});
```

During trial:

- Status is `trialing`.
- No charges.
- At trial end: Stripe attempts the first payment.
- If payment fails, dunning kicks in.

For trials, you usually still want a payment method on file (so the trial-to-paid transition is automatic). Use SetupIntent during trial signup to collect the card.

### Subscription lifecycle states

- **`incomplete`**: created; first payment hasn't succeeded yet.
- **`incomplete_expired`**: first payment failed and time ran out.
- **`trialing`**: in trial period; no charges.
- **`active`**: paid; in good standing.
- **`past_due`**: payment failed; in retry sequence.
- **`canceled`**: ended; won't bill again.
- **`unpaid`**: dunning exhausted; subscription effectively dead.

Sync these to your DB; gate product features by status (typically grant access during `active` and `trialing`).

### Cancellation

Two flavors:

```js
// Cancel at end of current period (user keeps access until then)
await stripe.subscriptions.update(subId, {
  cancel_at_period_end: true
});

// Cancel immediately
await stripe.subscriptions.cancel(subId);
```

For most SaaS, `cancel_at_period_end` is the right pattern — customer paid for the period; let them use it.

To uncancel (before period ends):

```js
await stripe.subscriptions.update(subId, {
  cancel_at_period_end: false
});
```

### Invoice on creation

When you create a subscription, Stripe generates an Invoice for the first period and attempts payment. The PaymentIntent for that Invoice can require action (3DS):

```js
const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: planPrice.id }],
  payment_behavior: "default_incomplete",
  expand: ["latest_invoice.payment_intent"]
});

const clientSecret = subscription.latest_invoice.payment_intent.client_secret;
// Send to frontend for confirmation
```

With `default_incomplete`, the subscription starts in `incomplete` state until the frontend confirms the first payment. Clean pattern for handling 3DS on subscription signup.

### Multi-Customer multi-Subscription

One Customer can have multiple Subscriptions (different products, different teams within a company). Each is its own object.

For team-based products: usually one Customer per company, one Subscription per team/plan.

### Pricing changes mid-life

You can change a Subscription's Price (upgrade/downgrade). Stripe handles proration — refunding/charging the difference based on remaining period. Module 3.2 goes deep.

### Metadata everywhere

Always attach metadata:

```js
metadata: {
  internal_user_id: user.id,
  team_id: team.id,
  plan_tier: "pro"
}
```

Reconciles webhooks to your DB. Stripe also surfaces metadata in the dashboard for support.

## Three real-world scenarios

**Scenario 1: The Products/Prices model click.**
A team initially created a new Stripe Product every time they tweaked pricing. Ended up with hundreds of Products. Refactored: one Product per plan (Pro, Enterprise), many Prices per Product. Cleaner; easier to manage; subscription reporting actually worked.

**Scenario 2: The 3DS on signup.**
A team didn't use `default_incomplete` on subscription create. Stripe processed the signup; payment hit 3DS challenge; user was already redirected away. Subscription stayed `incomplete`; never converted. They switched to `default_incomplete` + expand + client_secret flow; signups completed cleanly.

**Scenario 3: The trial-without-card.**
A team offered 14-day free trials without collecting card details. Trial-to-paid conversion was painful — every user had to come back and enter card. They started collecting card at trial start via SetupIntent. Trial-to-paid jumped dramatically because the transition became automatic.

## Common mistakes to avoid

- **One Product per pricing variation.** Hundreds of Products; messy reporting.
- **No trials with cards.** Painful trial-to-paid conversion.
- **Not handling `incomplete` subscriptions.** First payment 3DS fails silently.
- **No status sync to your DB.** Product features gate on wrong state.
- **No metadata** — reconciliation pain.

## Read more

- [Subscriptions guide](https://docs.stripe.com/billing/subscriptions/overview)
- [Products and Prices](https://docs.stripe.com/products-prices/overview)
- [Subscription states](https://docs.stripe.com/billing/subscriptions/overview#subscription-statuses)

## Summary

- **Product** + **Prices** + **Subscription** = the data model for recurring revenue.
- **One Product per plan, multiple Prices per Product**.
- **Subscription Items** for multi-line subscriptions.
- **Trials** are built-in; collect cards during trial for clean conversion.
- **`default_incomplete` payment behavior** for 3DS handling on signup.
- **`cancel_at_period_end: true`** is the right default cancellation.
- **Sync subscription status to your DB** via webhooks for gating product access.

Next: trials, upgrades, downgrades, and proration.
