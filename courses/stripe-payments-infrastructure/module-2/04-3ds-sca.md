---
module: 2
position: 4
title: "3D Secure (3DS) and SCA — the auth flow that catches you off-guard"
objective: "Handle 3DS authentication challenges correctly."
estimated_minutes: 8
---

# 3D Secure (3DS) and SCA — the auth flow that catches you off-guard

## The puzzle

A team builds a payment flow that works perfectly in the US. They launch in Europe. Payments start failing for half their customers. Reason: **Strong Customer Authentication (SCA)** is mandatory in Europe, triggering **3D Secure (3DS)** challenges. Their flow didn't handle the auth step; transactions failed at the `requires_action` state.

This lesson is what 3DS / SCA is, when it triggers, and how to handle it cleanly.

## The simple version

**3DS** adds a second-factor authentication step after the user enters card details (push notification from bank, SMS code, biometric). Bank confirms the user is who they say.

**SCA** (Strong Customer Authentication) is the EU regulation requiring 3DS for most payments. In the US, 3DS is optional but increasingly recommended.

When a PaymentIntent requires auth: state goes to `requires_action`. Stripe.js handles the challenge UI on-session. Off-session payments can't complete 3DS until user is back on-session.

## The technical version

### When 3DS triggers

Stripe's `automatic_payment_methods` automatically triggers 3DS when:

- Required by regulation (SCA in EU).
- Required by issuer (bank's policy).
- Flagged as high-risk by Stripe Radar.
- Manual `request_three_d_secure: "any"` set on the PaymentIntent.

For most EU cards: nearly always. For US cards: occasionally (especially high amount, suspicious context, or specific issuer rules).

### The on-session flow

When user is actively present:

```js
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: "https://yourapp.com/complete"
  }
});
```

If 3DS is required:

1. Stripe.js detects `requires_action`.
2. Renders the 3DS challenge UI (often a popup or full-page redirect to the bank).
3. User completes the challenge.
4. Stripe.js completes the PaymentIntent.
5. Browser redirects to `return_url`.

No code from you to handle the challenge — Stripe.js does it. Just call `confirmPayment` and handle the final outcome.

### The off-session flow

When user isn't present (subscription renewal):

```js
await stripe.paymentIntents.create({
  amount: 2000,
  currency: "usd",
  customer: customer.id,
  payment_method: pm_id,
  off_session: true,
  confirm: true
});
```

Outcomes:

- **Succeeds** if no auth required.
- **Fails with `requires_action`** if 3DS needed. Card not charged.

When `requires_action` happens off-session, you can't complete it programmatically. The pattern:

1. Save the PaymentIntent ID.
2. Notify user: "Action required on your card."
3. Next time user is on-session, redirect them to confirm the existing PaymentIntent.
4. They complete 3DS; subscription resumes.

```js
// Frontend, user signed in:
const { error } = await stripe.confirmPayment({
  clientSecret: pendingPaymentIntent.client_secret,
  confirmParams: { return_url: "..." }
});
```

### Setup-for-future-use pattern

For subscriptions, set up the PaymentMethod with auth upfront:

```js
// First time: collect card + run 3DS while user is present
const setupIntent = await stripe.setupIntents.create({
  customer: customer.id,
  payment_method_types: ["card"],
  usage: "off_session"
});

// Frontend confirms SetupIntent (handles 3DS if required)
// Then off-session subscription charges work without re-auth (mostly)
```

The SetupIntent flow gets the user's bank approval for future off-session charges. Subscription renewals later don't need 3DS unless the issuer specifically requires it again.

This isn't bulletproof — banks can still demand 3DS for specific charges — but it dramatically reduces off-session friction.

### Recovery flow for failed off-session

For subscription renewals that fail with `requires_action`:

```js
// Subscription invoice payment failed with requires_action
// Stripe emits: invoice.payment_action_required webhook

case "invoice.payment_action_required":
  const invoice = event.data.object;
  await db.users.update(invoice.customer, {
    needs_payment_action: true,
    payment_action_intent: invoice.payment_intent
  });
  await sendEmail(user, "Your subscription needs payment authentication. Click to authenticate.");
  break;
```

Then in your app:

```jsx
{user.needs_payment_action && (
  <Banner>
    Your card needs authentication. <Button onClick={completePayment}>Complete now</Button>
  </Banner>
)}
```

Click → frontend confirms the saved PaymentIntent via Stripe.js → 3DS challenge → subscription resumes.

### Bypassing 3DS — usually a bad idea

You can try to disable 3DS:

```js
payment_method_options: {
  card: { request_three_d_secure: "automatic" }  // let Stripe decide; recommended
  // request_three_d_secure: "any"  // force 3DS; not common
}
```

For markets where 3DS is mandatory (EU SCA), you can't bypass — it's regulatory. For optional markets, skipping 3DS slightly improves conversion but increases fraud risk and chargeback liability.

**3DS-authenticated transactions shift chargeback liability to the issuer.** If you skip 3DS, you eat fraudulent chargebacks. Often not worth saving the friction.

### Testing 3DS in test mode

Stripe provides test cards that trigger specific 3DS flows:

- **`4000 0025 0000 3155`**: 3DS required, success.
- **`4000 0027 6000 3184`**: 3DS required, authentication fails.
- **`4000 0082 6000 3178`**: 3DS supported but not required.

Test the on-session flow with these. For off-session: use the test card for setup, then attempt off-session charge.

### Common pitfalls

1. **Building only the success path.** When 3DS triggers, your flow breaks because you never handled `requires_action`. Use Stripe.js for confirm; it handles 3DS automatically.

2. **Treating off-session failures as final.** They're often recoverable — surface "action required" UI for the user.

3. **Forgetting SetupIntent for subscriptions.** First subscription charge isn't enough; subsequent off-session charges need authenticated saved methods.

4. **Mixing on-session and off-session code paths.** Different state machines; different recovery flows. Document clearly.

### Liability shift

A subtle but important point: 3DS-authenticated transactions shift chargeback liability from merchant to issuer. If the customer disputes a 3DS-auth'd transaction, the issuer eats the cost, not you.

This is a real economic benefit. For high-fraud product categories (digital goods, gift cards), aggressive 3DS use reduces chargeback losses meaningfully.

### SCA exemptions

EU SCA allows exemptions for low-risk transactions:

- **Small amounts** (under ~€30).
- **Subscriptions** (after the first authenticated one).
- **Merchant-initiated transactions** (off-session).
- **Trusted beneficiaries** (user whitelisted you).

Stripe handles exemption logic automatically. You generally don't configure this; Stripe optimizes.

## Three real-world scenarios

**Scenario 1: The EU launch failure.**
A US team launched in EU without thinking about SCA. Half of EU payments failed. They added Stripe.js confirmPayment (which handles 3DS automatically). Within a day, EU conversion matched US. Lesson: Stripe.js confirms handle this; don't roll your own.

**Scenario 2: The subscription recovery UX.**
A team's subscription renewals were failing with `requires_action`. They added a banner + email flow: when failure detected via webhook, surface "Action required; click to authenticate" to the user. Most users completed the auth and subscription resumed. Without the recovery flow, those customers churned.

**Scenario 3: The chargeback liability shift.**
A digital-goods merchant was eating fraudulent chargebacks. They enabled aggressive 3DS via `request_three_d_secure: "any"`. Fraud disputes dropped because liability shifted to issuers. Slight conversion drop from added friction was more than offset by reduced chargeback costs.

## Common mistakes to avoid

- **Not handling `requires_action`** in your flow.
- **Off-session retries without recovery UX.** Users churn instead of authenticating.
- **No SetupIntent for subscriptions** — first auth doesn't always cover renewals.
- **Skipping 3DS to "improve conversion"** — fraud chargebacks usually cost more than the friction.
- **Hand-rolling 3DS UI** — Stripe.js does it for you.

## Read more

- [3D Secure docs](https://docs.stripe.com/payments/3d-secure)
- [SCA overview](https://docs.stripe.com/strong-customer-authentication)
- [SetupIntents](https://docs.stripe.com/payments/setup-intents)

## Summary

- **3DS** = second-factor auth on payment; **SCA** = EU regulation requiring it.
- **Stripe.js `confirmPayment` handles 3DS automatically** for on-session flows.
- **Off-session failures** with `requires_action` need recovery UX — banner + on-session retry.
- **SetupIntent** authenticates payment methods upfront for smoother subscription renewals.
- **3DS shifts chargeback liability** to issuer — real economic benefit for high-fraud categories.
- **Don't skip 3DS to chase conversion** — fraud usually costs more.

That wraps Module 2. Next: subscriptions and recurring billing.
