---
module: 1
position: 2
title: "PaymentIntents — the modern payment primitive"
objective: "Understand what a PaymentIntent is, why it replaced Charges, and how to use it."
estimated_minutes: 9
---

# PaymentIntents — the modern payment primitive

## The puzzle

Stripe's old payment object was the Charge. Simple: amount + card → charge. Worked for years. Then came 3D Secure, Strong Customer Authentication (SCA) in Europe, asynchronous payment methods (bank transfers, BNPL), and complex authentication flows.

The Charge object couldn't represent these multi-step payment lifecycles cleanly. So Stripe built the **PaymentIntent** — a state machine that handles every modern payment flow.

PaymentIntents are the right primitive for new code. This lesson is what they are and how to use them.

## The simple version

A PaymentIntent represents one payment attempt from start to finish:

1. **Create** it on the server (amount, currency, customer).
2. **Confirm** it (often client-side via Stripe.js).
3. **Handle auth challenges** (3DS, etc.) if required.
4. **Listen for webhook** confirming success or failure.
5. **Update your database** based on the outcome.

The state machine handles the lifecycle. You just react to states.

## The technical version

### Creating a PaymentIntent

```js
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,           // in smallest currency unit (cents for USD)
  currency: "usd",
  customer: customer.id,
  metadata: { order_id: "ord_789" },
  automatic_payment_methods: { enabled: true } // accepts cards, wallets, etc.
});
```

This creates an intent in state `requires_payment_method`. It's not charged yet.

The `client_secret` (`pi_..._secret_...`) is returned to the frontend. Frontend uses it with Stripe.js to attach a payment method and confirm.

### States

A PaymentIntent moves through:

```
requires_payment_method
  ↓ (attach payment method)
requires_confirmation
  ↓ (confirm)
requires_action       ← (only if 3DS / SCA required)
  ↓ (user completes challenge)
processing            ← (only for async methods like ACH)
  ↓
succeeded             ← terminal: payment complete
```

Or:

```
... → canceled  (user abandoned or you canceled)
... → requires_payment_method  (failed; user can retry)
```

You react to states via webhooks (Module 4).

### Client-side confirmation

The frontend collects card details and confirms:

```js
import { loadStripe } from "@stripe/stripe-js";

const stripe = await loadStripe("pk_test_...");
const elements = stripe.elements({ clientSecret });
const paymentElement = elements.create("payment");
paymentElement.mount("#payment-element");

// On form submit:
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: "https://yourapp.com/checkout/complete"
  }
});
```

Stripe.js handles:

- Collecting card details (PCI-compliant — your server never sees card numbers).
- Tokenizing into a PaymentMethod.
- Confirming the PaymentIntent.
- Handling 3DS challenges.
- Redirecting to `return_url` on success.

### Server-side confirmation

For card-on-file scenarios (subscription renewals, agentic charges), confirm from server:

```js
await stripe.paymentIntents.confirm(paymentIntent.id, {
  payment_method: customer.default_payment_method
});
```

If 3DS is needed, the state goes to `requires_action`. You can't complete server-side; user must authenticate.

### Idempotency

Always pass an idempotency key when creating PaymentIntents:

```js
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: "usd",
  customer: customer.id
}, {
  idempotencyKey: `order-${orderId}`
});
```

If your code crashes mid-create and retries, the same key returns the existing PaymentIntent rather than creating a duplicate. Same logic for confirmation.

Lesson 1.4 goes deep on idempotency.

### Why not Charges anymore

Old way:

```js
const charge = await stripe.charges.create({
  amount: 2000,
  currency: "usd",
  source: "tok_visa"
});
```

Problems:

- No native 3DS support.
- No async payment methods.
- Single-shot — no state machine for multi-step flows.

PaymentIntents handle all of this natively. Use them for new code.

### Off-session and on-session

Two contexts:

**On-session**: user is actively present (web checkout). Use Stripe.js to confirm with user interaction available for 3DS.

**Off-session**: user isn't present (subscription renewal, retry after failure). Save the payment method with `setup_future_usage` first; charge later off-session.

```js
// On-session: save for future use
await stripe.paymentIntents.create({
  amount: 2000,
  currency: "usd",
  customer: customer.id,
  setup_future_usage: "off_session"
});

// Off-session later:
await stripe.paymentIntents.create({
  amount: 2000,
  currency: "usd",
  customer: customer.id,
  payment_method: savedPaymentMethod.id,
  off_session: true,
  confirm: true
});
```

If off-session payment requires 3DS, it fails with `requires_action`. You then need to surface a "verify your card" UX on the user's next visit.

### Capture later (auth + capture)

Some flows authorize first, capture later (hotel deposits, deferred billing):

```js
await stripe.paymentIntents.create({
  amount: 5000,
  currency: "usd",
  customer: customer.id,
  capture_method: "manual"  // authorize, don't capture
});

// Later:
await stripe.paymentIntents.capture(paymentIntent.id);
```

The authorization holds the funds; capture takes them. If you don't capture within ~7 days, the auth expires.

### Listing and querying

```js
const intents = await stripe.paymentIntents.list({
  customer: customer.id,
  limit: 10
});
```

For most apps, you don't need to list PaymentIntents — you store the ID and query specific ones. Listing is for admin / support tools.

### Errors

PaymentIntent creation can fail for many reasons:

- **Card declined**: `card_declined`. Surface to user; offer retry.
- **Insufficient funds**: same handling as card declined.
- **3DS required**: not an error; state is `requires_action`. User completes flow.
- **Invalid card**: `invalid_request_error`. Often programming error.
- **API key issues**: `authentication_error`. Configuration problem.

Handle each in your UX. Generic "payment failed" is bad UX; specific messages help users fix it.

## Three real-world scenarios

**Scenario 1: The 3DS surprise.**
A team built on Charges. Worked fine in the US. Launched in Europe; payments started failing because of SCA / 3DS requirements. Migrated to PaymentIntents in two weeks of work. Lesson: PaymentIntents from day 1 prevents this.

**Scenario 2: The off-session retry that failed.**
A team's subscription auto-renewal failed because the card needed 3DS authentication. They charged off-session; got `requires_action`. They added a banner on the user's next login: "Action required on your card; click to authenticate." User clicked; 3DS completed; subscription resumed.

**Scenario 3: The idempotency save.**
A team's checkout endpoint crashed after creating a PaymentIntent but before saving the ID. On retry, they would have created a second PaymentIntent and double-charged. Idempotency keys made the retry a no-op; existing PaymentIntent returned. No duplicate charges.

## Common mistakes to avoid

- **Charges instead of PaymentIntents.** Legacy; doesn't support 3DS cleanly.
- **No idempotency keys.** Retries cause duplicate intents.
- **Generic error messages.** Hurts conversion; users don't know how to fix.
- **Server-side confirm when user isn't present.** Off-session needs setup_future_usage first.
- **Capture-method manual without capture.** Auth expires; funds released; no charge.

## Read more

- [PaymentIntents guide](https://docs.stripe.com/payments/payment-intents)
- [Migrating from Charges](https://docs.stripe.com/payments/payment-intents/migration)
- [SCA / 3DS overview](https://docs.stripe.com/strong-customer-authentication)

## Summary

- **PaymentIntents** = state machine handling modern payment lifecycle (3DS, async methods, etc.).
- States: `requires_payment_method → requires_confirmation → [requires_action] → [processing] → succeeded`.
- **On-session** confirms via Stripe.js with user present; **off-session** charges saved payment methods.
- **Idempotency keys** prevent duplicate intents on retries.
- **Don't use Charges** for new code.
- **Handle errors specifically**; generic "payment failed" hurts conversion.

Next: test mode and the Stripe sandbox.
