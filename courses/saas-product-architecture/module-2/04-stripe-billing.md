---
module: 2
position: 4
title: "Integrating Stripe Billing (or alternatives)"
objective: "Wire payments into your SaaS without rebuilding everything."
estimated_minutes: 5
---

# Integrating Stripe Billing (or alternatives)

## What Stripe Billing handles

Stripe Billing is the most-used SaaS billing platform. Out of the box:

- Subscription management (plans, items, periods).
- Recurring charges (cards, ACH, SEPA, etc.).
- Invoicing.
- Dunning / smart retries.
- Tax (with Stripe Tax).
- Customer portal (hosted UI for self-service).
- Reporting (MRR, churn, basic SaaS metrics).

Alternative: Recurly, Chargebee, Paddle. Paddle does "merchant of record" (they handle tax/compliance worldwide; you don't register anywhere). For early-stage / small SaaS, Stripe wins on ecosystem; Paddle wins on tax simplicity for international.

## Core Stripe objects

```
Customer → Subscription → SubscriptionItem → Price → Product
```

- **Product.** What you sell ("Team Plan").
- **Price.** Pricing for it ($20/user/month, recurring monthly).
- **Customer.** Who's buying. Has payment method.
- **Subscription.** Active recurring relationship.
- **SubscriptionItem.** A line on the subscription (a Price + quantity).

A customer can have multiple subscriptions; a subscription can have multiple items (different products); each item has a quantity.

## Setting up

```python
import stripe
stripe.api_key = "sk_test_..."

# Create a product
product = stripe.Product.create(name="Team Plan")

# Create a price for it
price = stripe.Price.create(
  product=product.id,
  unit_amount=2000,  # $20.00 in cents
  currency="usd",
  recurring={"interval": "month"}
)
```

Most teams manage products / prices via Stripe Dashboard (UI) for non-developer access.

## Subscribing a customer

The flow:

1. Frontend collects payment method (Stripe Elements, Checkout, Payment Element).
2. Frontend calls your backend with the payment method.
3. Backend creates a customer + subscription via Stripe API.
4. Stripe charges the first invoice immediately or after trial.

```python
customer = stripe.Customer.create(
    email="aaron@example.com",
    payment_method=pm.id,
    invoice_settings={"default_payment_method": pm.id}
)

subscription = stripe.Subscription.create(
    customer=customer.id,
    items=[{"price": price.id, "quantity": 5}],
    expand=["latest_invoice.payment_intent"]
)
```

After this, Stripe handles renewals automatically. Webhooks notify you of events.

## Stripe Checkout — the easy path

For "just take their money," Stripe Checkout is a hosted page:

```python
session = stripe.checkout.Session.create(
    payment_method_types=['card'],
    line_items=[{'price': price.id, 'quantity': 5}],
    mode='subscription',
    success_url='https://yoursite.com/success',
    cancel_url='https://yoursite.com/cancel'
)
return redirect(session.url, code=303)
```

Stripe hosts the payment page; handles cards, tax, currencies, fraud. Free implementation; redirects back to your app on success.

For higher conversion / custom branding: embed Stripe Elements / Payment Element in your own checkout. More work; more control.

## Webhooks — the source of truth

Stripe events arrive via webhooks. Configure endpoint; verify signature; handle events.

Key events:
- `customer.subscription.created` — new subscription.
- `customer.subscription.updated` — plan change.
- `customer.subscription.deleted` — canceled.
- `invoice.paid` — payment succeeded.
- `invoice.payment_failed` — initiate dunning UI changes.
- `customer.subscription.trial_will_end` — trial about to end.

Your app updates state based on webhooks (don't poll Stripe API for status; it's expensive and racy).

```python
@app.route('/webhooks/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig = request.headers['Stripe-Signature']
    event = stripe.Webhook.construct_event(payload, sig, WEBHOOK_SECRET)
    
    if event.type == 'invoice.paid':
        # mark subscription as paid
        ...
    elif event.type == 'invoice.payment_failed':
        # initiate dunning UI
        ...
    
    return '', 200
```

Signature verification prevents fakes. Always verify.

## Subscription state on your side

Mirror key Stripe data into your DB for fast access:

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT, -- active, past_due, canceled, etc.
  current_period_end TIMESTAMPTZ,
  plan_id TEXT,
  -- additional fields you need at request time
);
```

Update on webhooks. App reads from your DB (not Stripe) for "is this customer subscribed?"

## Metered usage with Stripe

For usage-based pricing:

```python
stripe.SubscriptionItem.create_usage_record(
    subscription_item=sub_item_id,
    quantity=100,
    timestamp=int(time.time()),
    action='increment'
)
```

You report usage; Stripe aggregates; appears on invoice as a line.

For high-volume usage (millions of events/day), Stripe's reporting cost adds up. Aggregate locally, report daily totals to Stripe instead of per-event.

## Customer portal

```python
session = stripe.billing_portal.Session.create(
    customer=customer.id,
    return_url='https://yoursite.com/account'
)
return redirect(session.url)
```

Stripe-hosted page where customers update card, view invoices, change plan, cancel. Saves you building all that UI.

## Plan changes / upgrades / downgrades

```python
stripe.Subscription.modify(
    subscription_id,
    items=[{'id': item_id, 'price': new_price_id}],
    proration_behavior='create_prorations'
)
```

Stripe handles proration: customer pays for the partial period at the new price.

For "switch plan now": immediate.  
For "switch plan at next renewal": `proration_behavior='none', billing_cycle_anchor='unchanged'`.

## Cancellation flow

```python
stripe.Subscription.modify(
    subscription_id,
    cancel_at_period_end=True
)
```

Cancellation takes effect at end of current period (customer keeps service until then). vs immediate:

```python
stripe.Subscription.delete(subscription_id)
```

For customer experience: most apps use cancel_at_period_end. Customer paid for the month; let them use it.

## Trial periods

```python
stripe.Subscription.create(
    customer=customer.id,
    items=[{...}],
    trial_period_days=14
)
```

No charge during trial; auto-charge after. Pair with `trial_will_end` webhook to remind customer.

## Coupons and discounts

```python
coupon = stripe.Coupon.create(
    percent_off=20,
    duration='repeating',
    duration_in_months=3
)

stripe.Subscription.create(
    customer=customer.id,
    items=[...],
    coupon=coupon.id
)
```

For promotional pricing, referral discounts, launch deals. Track which coupon a customer used for revenue attribution.

## Testing — Stripe test mode

Stripe test mode runs alongside live; same APIs, fake cards. Test cards like `4242 4242 4242 4242` succeed; others simulate failures.

Don't run integration tests against live Stripe (charges real money / triggers compliance). Use test mode exclusively in dev/CI.

For local webhook testing: Stripe CLI forwards live webhooks to localhost. Indispensable.

## Common mistakes

- **Polling Stripe instead of webhooks.** Slow, costly.
- **Not verifying webhook signatures.** Attackers can fake events.
- **Mirroring state too lazily.** UI shows wrong status.
- **Charging without proper tax setup.** Compliance issues later.
- **Live keys in test environment.** Real charges; bad.

## Summary

- Stripe Billing handles subscriptions, charges, dunning, tax, portal.
- Core objects: Product → Price → Subscription → SubscriptionItem.
- Stripe Checkout (hosted) or Elements (embedded).
- Webhooks for state changes; verify signatures.
- Mirror state to your DB for fast reads.
- Test mode for development; CLI for local webhooks.
- Customer Portal saves building self-service UI.

Module 2 complete. Next module: authentication for SaaS.
