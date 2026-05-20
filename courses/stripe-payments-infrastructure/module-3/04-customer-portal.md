---
module: 3
position: 4
title: "Customer Portal — letting customers manage their own subscriptions"
objective: "Add Stripe's hosted portal so customers handle their own billing."
estimated_minutes: 7
---

# Customer Portal — letting customers manage their own subscriptions

## The puzzle

Customers want to:

- Update their card.
- Change plans.
- Cancel.
- See past invoices.
- Update billing address for taxes.

You could build all of this. Or you could use Stripe's **Customer Portal** — a hosted page that handles every common billing UX, branded to your product, in about 30 minutes of setup.

## The simple version

Customer Portal is a Stripe-hosted page where users self-serve their subscription:

1. Configure what's available in the portal (in Stripe Dashboard).
2. From your app, create a portal session for the customer.
3. Redirect them to the session URL.
4. They do what they need; Stripe handles the changes.
5. Webhooks fire for any changes; you sync to your DB.

Best self-serve billing UX you'll have without building one yourself.

## The technical version

### Setup

In Stripe Dashboard → Customer Portal:

- **Functionality**: which features users can use (update card, change plan, cancel, view invoices).
- **Branding**: logo, color, fonts.
- **Available plans**: which Prices users can switch between.
- **Cancellation policy**: end-of-period vs. immediate; reason capture.
- **Trial reminders**: built-in.

Configure once; the same Portal serves all your customers.

### Creating a portal session

```js
const session = await stripe.billingPortal.sessions.create({
  customer: customer.id,
  return_url: "https://yourapp.com/account"  // where to send them after
});

return Response.json({ url: session.url });
```

Frontend redirects:

```js
const { url } = await fetch("/api/billing-portal", { method: "POST" }).then(r => r.json());
window.location.href = url;
```

Sessions are short-lived (typically minutes). User clicks → goes to Portal → returns to your `return_url` when done.

### What users can do

Configured in dashboard:

- **Update payment methods**: add card, set default, remove old.
- **Update billing info**: name, address, tax ID.
- **View / download invoices**: history of past payments.
- **Update subscription**: change plan, quantity, add seats.
- **Cancel subscription**: with optional reason capture.
- **View upcoming invoice**: preview of what's coming.

Each capability can be turned on/off per your needs. For most B2C: enable update payment, cancel, view invoices. For B2B: add plan changes and address.

### Plan switching in Portal

To enable plan changes:

1. In dashboard: configure which Products / Prices customers can switch to.
2. Set proration behavior (immediate or end-of-period).
3. Done — Portal shows options to the customer.

User picks a new plan; Stripe handles proration; webhooks fire; your DB syncs.

### Cancellation flow

In dashboard: cancellation behavior options:

- **End of period**: customer keeps access until paid period ends.
- **Immediate**: instant cancellation.
- **Cancellation reasons**: optional dropdown ("too expensive", "missing features", etc.) captured for analytics.

Cancellation reason data lives on the subscription's metadata. Use it to identify churn drivers.

### Webhooks

The Portal triggers normal Stripe webhooks:

- **`customer.subscription.updated`**: plan changes, cancellations queued.
- **`customer.subscription.deleted`**: cancellation effective.
- **`customer.updated`**: profile changes.
- **`payment_method.attached`**: new card added.

Sync your DB on these — same as any other Stripe webhook.

### Branding

Customize the Portal's appearance:

- **Logo**: upload via Settings → Branding.
- **Brand color**: primary color.
- **Custom domain**: Enterprise feature.

Most of the Portal will look like "Stripe-styled with your logo." Acceptable for most use cases; for brand-perfect needs, you'd build your own UI (much more work).

### Embedding vs. redirecting

The Portal is a hosted page; you redirect to it. There's no native embed. If you need it embedded in your app, you can:

- iframe the URL (not supported; CSP blocks it).
- Build your own UI calling Stripe APIs directly (full custom).

For most products, redirect is fine. Users come back via `return_url`.

### Authentication

Portal sessions auto-authenticate via the session ID — the URL itself grants access for that customer. No login required on the Portal side.

This means:

- The session URL is sensitive — don't log it; don't share publicly.
- Sessions expire quickly to limit blast radius.
- You generate sessions only after authenticating the user in your app.

### Reactivation

If a subscription was canceled at period end, the Portal can offer reactivation. Configure in dashboard.

For canceled/lapsed customers reaching out via support: you can also reactivate from your support tool by calling the API directly.

### Subscription items in Portal

For multi-item subscriptions (base plan + add-ons), the Portal can show each item with options. Configure which items are user-changeable vs. locked.

### Limits and trade-offs

What Portal doesn't do (well):

- **Highly custom upsell flows** — the Portal is mostly transactional.
- **Discount / coupon application** — limited; better in your own UX.
- **Complex multi-product purchases** — Portal is for managing existing subscriptions, not buying new things.
- **Custom analytics tracking** — Stripe collects basic; for your own deep funnels you'd need custom UI.

For 90% of subscription management needs, Portal is sufficient. For new sales / upsells, use your own UI + Checkout / Elements.

### Cost

Customer Portal is free with Stripe Billing. No additional cost.

### Customer Portal vs. Stripe Checkout

Different purposes:

- **Checkout**: for new sales / first subscription.
- **Customer Portal**: for managing existing subscriptions.

Both are hosted; use both in different parts of the flow.

## Three real-world scenarios

**Scenario 1: The 30-minute self-service rollout.**
A team was building a custom billing UI. Realized it would take weeks. Switched to Customer Portal: 30 minutes to configure; redirected users from account page; done. Months later, still using it — no complaints. Saved weeks of dev time.

**Scenario 2: The cancellation insights.**
A team enabled cancellation reasons in the Portal. After 3 months: "too expensive" was the top reason. They added a price-reduction retention offer in the Portal's cancellation flow. Cancellation rate dropped 12%.

**Scenario 3: The branding compromise.**
A premium-brand team wanted brand-perfect billing UX. Portal didn't match. They tried for a sprint, gave up — too much work. Used Portal with logo + brand color; users didn't care. The "brand drop-off" on the Portal page didn't hurt retention measurably. Sometimes good enough is right.

## Common mistakes to avoid

- **Building from scratch when Portal works.** Months of dev for marginal brand improvement.
- **Not enabling plan changes** — forces users to email support for upgrades.
- **No cancellation reason capture** — losing valuable churn signal.
- **No webhook sync on Portal changes** — DB drifts from Stripe.
- **Forgetting `return_url`** — users land at Stripe with no obvious way back.

## Read more

- [Customer Portal docs](https://docs.stripe.com/customer-management)
- [Customizing the Portal](https://docs.stripe.com/customer-management/portal-configuration)
- [Portal Sessions API](https://docs.stripe.com/api/customer_portal/sessions)

## Summary

- **Customer Portal** is Stripe's hosted self-service billing UX.
- Customers can **update payment, change plans, cancel, view invoices** — configurable per your needs.
- **30-minute setup**; saves weeks of building your own.
- **Branded** with logo + brand color; not pixel-perfect, but acceptable for most.
- **Cancellation reason capture** for churn analytics.
- **Free** with Stripe Billing.
- Use **Checkout** for new sales; **Portal** for managing existing.

That wraps Module 3. Next module: webhooks done right.
