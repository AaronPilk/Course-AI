---
module: 2
position: 1
title: "Stripe Checkout — the fastest path to accepting payments"
objective: "Implement Stripe Checkout end-to-end in under an hour."
estimated_minutes: 9
---

# Stripe Checkout — the fastest path to accepting payments

## The puzzle

You need to accept payments. Building a checkout UI from scratch — input validation, error handling, 3D Secure, multiple payment methods, mobile responsiveness, accessibility — is weeks of work. Stripe Checkout is a hosted alternative that does all of it in under an hour.

When you don't need a custom-branded checkout, Checkout is the right answer. This lesson is the implementation.

## The simple version

Stripe Checkout is a hosted checkout page:

1. Create a Checkout Session on your server.
2. Redirect the user to the session URL.
3. User completes payment on Stripe's hosted page.
4. Stripe redirects back to your success URL.
5. Webhook confirms the payment.

Less than 50 lines of code. Mobile-friendly. PCI compliant by default. Multiple payment methods supported.

## The technical version

### Creating a Checkout Session

```js
const session = await stripe.checkout.sessions.create({
  mode: "payment",  // one-time payment
  line_items: [
    {
      price: "price_abc123",  // a Stripe Price ID
      quantity: 1
    }
  ],
  success_url: "https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
  cancel_url: "https://yourapp.com/cancel",
  customer_email: user.email,  // optional, pre-fills email
  metadata: {
    user_id: user.id,
    order_id: order.id
  }
});

return res.json({ checkout_url: session.url });
```

The frontend redirects:

```js
const response = await fetch("/api/checkout", { method: "POST", body: JSON.stringify(...) });
const { checkout_url } = await response.json();
window.location.href = checkout_url;
```

User lands on Stripe-hosted checkout, enters card, pays, returns to your `success_url`.

### Modes

Checkout supports three modes:

- **`payment`**: one-time charge.
- **`subscription`**: recurring subscription using a recurring Price.
- **`setup`**: collect a payment method without charging.

Each handles its lifecycle automatically.

### Line items

Line items can be:

- **`price`**: a pre-created Stripe Price ID (recommended).
- **`price_data`**: inline price data (for dynamic prices).

```js
// Pre-created Price (recommended for standard items)
line_items: [{ price: "price_abc123", quantity: 1 }]

// Dynamic inline pricing
line_items: [{
  price_data: {
    currency: "usd",
    product_data: { name: "Custom Item" },
    unit_amount: 4999
  },
  quantity: 1
}]
```

Pre-created Prices are cleaner and let you change pricing in the dashboard without code changes.

### Success URL templating

The `{CHECKOUT_SESSION_ID}` token in the success URL gets replaced by Stripe. You can read the session on your success page:

```js
// Server-side, on success page render
const session = await stripe.checkout.sessions.retrieve(sessionId);
console.log(session.payment_status);  // "paid"
console.log(session.metadata.order_id);  // your custom metadata
```

But — don't rely on the success URL for fulfillment. The user might close the tab before redirect; webhooks are the source of truth.

### Webhooks — the source of truth

When Checkout completes, Stripe emits `checkout.session.completed`. Handle it:

```js
case "checkout.session.completed":
  const session = event.data.object;
  await fulfillOrder(session.metadata.order_id);
  break;
```

The webhook fires regardless of whether the user successfully returned to your site. Fulfill orders based on webhooks, not on URL redirects.

### Payment methods

By default, Checkout shows cards. To enable more methods:

```js
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [...],
  payment_method_types: ["card", "apple_pay", "google_pay", "klarna", "afterpay_clearpay"],
  ...
});
```

Or use Stripe's automatic optimization:

```js
automatic_payment_methods: { enabled: true }
```

Stripe picks the best methods for the user's location and currency.

### Subscriptions in Checkout

For recurring subscriptions:

```js
const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [
    {
      price: "price_recurring_abc",  // a recurring Price
      quantity: 1
    }
  ],
  success_url: "...",
  cancel_url: "...",
  subscription_data: {
    trial_period_days: 14
  },
  metadata: { user_id: user.id }
});
```

The session creates a Customer (or uses existing), a PaymentMethod, and a Subscription in one flow. Webhook: `checkout.session.completed` + `customer.subscription.created`.

### Customer creation

By default, Checkout creates a new Customer for each session. To use an existing Customer:

```js
const session = await stripe.checkout.sessions.create({
  customer: existing_customer_id,
  mode: "subscription",
  ...
});
```

Always link Checkout to a Customer so the payment method is reusable for that user.

### Branding and customization

Limited but real customization:

- Logo and brand color in Settings → Branding.
- Custom support email.
- Limited custom domain (Enterprise / Stripe Connect).
- Locale (auto-detects or specify).
- Tax collection on/off (with Stripe Tax).
- Allow promotion codes.

For full custom UI, use Elements (next lesson). Checkout's customization caps mean the brand experience is partly "Stripe-styled."

### Server-side validation

Don't trust the client. Before creating a Checkout Session, validate on the server:

- User is authenticated.
- The Price and quantity match what they actually want.
- Coupons / promotions are valid.
- The amount makes sense.

The Checkout Session captures what you set; if you set the wrong amount, that's what gets charged.

### Cost

Stripe Checkout itself is free. You pay normal Stripe processing fees (2.9% + 30¢ for US cards, etc.).

### When to use Checkout vs. Elements

| Use Checkout when | Use Elements when |
|---|---|
| Standard checkout works | You need full custom UX |
| You want minimum code | You can absorb the dev cost |
| Brand match isn't critical | Brand-perfect UI required |
| Multi-payment methods needed | You want to render directly in your flow |

Most products start with Checkout; some graduate to Elements when the UX matters enough.

### Limits

- Sessions expire after 24 hours.
- Line items max ~50.
- Some customizations require paid Stripe tiers.

For most use cases, well within limits.

## Three real-world scenarios

**Scenario 1: The hour to accept payments.**
A small SaaS team needed payments live for a launch. Used Stripe Checkout: subscription mode, 2 plans, 14-day trial. Live in 90 minutes including testing. They later moved to Elements when they had time; Checkout got them to launch.

**Scenario 2: The webhook-vs-redirect confusion.**
A team fulfilled orders on success page render. Users sometimes closed the tab before redirect; orders went unfulfilled. They switched to webhook-driven fulfillment. Even if the user never returned, the webhook fired and fulfillment ran.

**Scenario 3: The amount-trust mistake.**
A frontend sent the amount to charge to the backend, which passed it directly to Checkout. A malicious user modified the amount client-side and paid less. Fix: server validates the price from the database, ignores any client-sent amount.

## Common mistakes to avoid

- **Fulfilling on success URL render** instead of webhook.
- **Trusting client-sent amounts** — server should look up Prices.
- **Not setting metadata** with internal IDs.
- **Skipping webhook handlers** because "success URL works."
- **No Customer link** — payment methods aren't reusable for future charges.

## Read more

- [Stripe Checkout docs](https://docs.stripe.com/payments/checkout)
- [Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions)
- [Checkout customization](https://docs.stripe.com/payments/checkout/customization)

## Summary

- **Stripe Checkout** = hosted checkout page; minimal code; PCI compliant by default.
- **Three modes**: payment, subscription, setup.
- **Line items** reference Prices (recommended) or inline `price_data`.
- **Fulfill via webhooks** (`checkout.session.completed`), not success URL redirects.
- **Server-side validation** of amount, plan, coupons — never trust client.
- **Customer link** so payment methods are reusable.
- **Checkout for fastest launch; Elements for custom UX.**

Next: Stripe Elements for custom checkout UI.
