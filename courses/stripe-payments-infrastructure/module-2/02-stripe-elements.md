---
module: 2
position: 2
title: "Stripe Elements — custom checkout UI"
objective: "Build a branded checkout with Elements when Checkout's defaults don't fit."
estimated_minutes: 10
---

# Stripe Elements — custom checkout UI

## The puzzle

Stripe Checkout works, but the checkout lives on a Stripe-styled page. For products where brand match is critical or you want checkout inline with your flow, you need Stripe Elements — composable UI components that render inside your own page while keeping card details out of your servers (PCI compliance).

## The simple version

Elements are Stripe-provided UI components (card input, payment method selector, etc.) you embed in your site. The user types their card; Stripe.js handles the sensitive data; you get back a confirmed payment.

Flow:

1. Backend: create a PaymentIntent, return its `client_secret` to frontend.
2. Frontend: load Stripe.js, mount the PaymentElement, collect details.
3. Frontend: confirm the PaymentIntent (handles 3DS automatically).
4. Backend: webhook fires `payment_intent.succeeded`; fulfill.

## The technical version

### The Payment Element

The recommended modern Element is the **Payment Element** — a unified UI showing cards, wallets, BNPL, bank methods based on what you've enabled and what the user can use:

```js
import { loadStripe } from "@stripe/stripe-js";

const stripe = await loadStripe("pk_test_...");

// 1. Get client_secret from your server
const { clientSecret } = await fetch("/api/create-payment-intent", {
  method: "POST",
  body: JSON.stringify({ amount: 2000 })
}).then(r => r.json());

// 2. Create Elements instance with the secret
const elements = stripe.elements({
  clientSecret,
  appearance: {
    theme: "stripe",
    variables: { colorPrimary: "#7c3aed" }
  }
});

// 3. Mount the PaymentElement
const paymentElement = elements.create("payment");
paymentElement.mount("#payment-element");
```

The user enters card details in your page. Stripe.js handles the sensitive bits; your server never sees raw card numbers.

### Confirming the payment

On form submit:

```js
const form = document.getElementById("payment-form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: "https://yourapp.com/checkout/complete"
    }
  });
  
  if (error) {
    // Show error to user
    document.getElementById("error").textContent = error.message;
  }
  // If successful, browser is redirected to return_url
});
```

Stripe.js:

- Tokenizes the card.
- Confirms the PaymentIntent.
- Handles 3DS challenges if needed.
- Redirects to `return_url` on success.

If 3DS is needed, Stripe.js renders the challenge UI; user authenticates; back to your flow.

### Creating the PaymentIntent

On your server:

```js
export async function POST(req) {
  const { amount } = await req.json();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    customer: currentUser.stripe_customer_id,
    automatic_payment_methods: { enabled: true },
    metadata: { user_id: currentUser.id }
  });
  
  return Response.json({ clientSecret: paymentIntent.client_secret });
}
```

The `client_secret` is safe to send to the frontend — it lets the frontend confirm the specific PaymentIntent but doesn't grant other access.

### Frontend-only ≠ secure

A common misconception: "card details never touch my server, so I'm safe." True for PCI compliance, but:

- The frontend can still call your API with the wrong amount; validate server-side.
- A man-in-the-middle on your page can capture or modify form values.
- XSS in your site can steal sensitive data.

Standard web security still applies. CSP, HTTPS, no untrusted scripts — all required.

### Multiple Elements

For more control, use individual Elements:

```js
const elements = stripe.elements({ clientSecret });

const cardNumber = elements.create("cardNumber");
const cardExpiry = elements.create("cardExpiry");
const cardCvc = elements.create("cardCvc");

cardNumber.mount("#card-number");
cardExpiry.mount("#card-expiry");
cardCvc.mount("#card-cvc");
```

Useful for matching specific design layouts. PaymentElement is simpler; individual elements give you maximum custom layout.

### Saving payment methods

For subscriptions or future charges, save the method:

```js
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: "usd",
  customer: customer.id,
  setup_future_usage: "off_session",  // save for future off-session charges
  automatic_payment_methods: { enabled: true }
});
```

After confirmation, the PaymentMethod is attached to the Customer and reusable.

### Appearance API

Customize Element appearance to match your brand:

```js
const elements = stripe.elements({
  clientSecret,
  appearance: {
    theme: "stripe",  // 'stripe', 'night', 'flat', 'none'
    variables: {
      colorPrimary: "#7c3aed",
      colorBackground: "#ffffff",
      colorText: "#1a1a1a",
      fontFamily: "Inter, sans-serif",
      borderRadius: "8px"
    },
    rules: {
      ".Input": {
        boxShadow: "none",
        border: "1px solid #e5e7eb"
      }
    }
  }
});
```

Real CSS-in-JSON. Powerful; can match most brand designs.

### Express Checkout Element

For one-click checkout via Apple Pay / Google Pay / Link / etc.:

```js
const expressCheckoutElement = elements.create("expressCheckout");
expressCheckoutElement.mount("#express-checkout");

expressCheckoutElement.on("confirm", async (event) => {
  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: "..."
    }
  });
});
```

Renders wallet buttons; one tap to pay. Higher conversion than typed card details.

### Subscription flow with Elements

For subscriptions, create a SetupIntent or PaymentIntent with subscription:

```js
// Option 1: PaymentIntent with subscription (immediate payment)
const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: "price_..." }],
  payment_behavior: "default_incomplete",
  expand: ["latest_invoice.payment_intent"]
});

const clientSecret = subscription.latest_invoice.payment_intent.client_secret;
return Response.json({ clientSecret, subscriptionId: subscription.id });
```

Frontend uses the client_secret to confirm; on success, the subscription becomes active.

### Real-time validation

Elements emit events:

```js
paymentElement.on("change", (event) => {
  if (event.complete) {
    // Form is filled correctly
    submitButton.disabled = false;
  } else if (event.error) {
    showError(event.error.message);
  }
});
```

Useful for enabling/disabling submit buttons based on form state.

### Performance

Stripe.js is async-loaded and ~150KB. For e-commerce/checkout pages where time-to-checkout matters:

- Load Stripe.js only on payment pages, not site-wide.
- Use `loadStripe` (lazy) not `Stripe()` directly.
- Preconnect to `js.stripe.com` and `api.stripe.com` for faster TLS.

### Error handling

Common errors:

- **`card_declined`**: card issuer declined; show user "Your card was declined."
- **`incorrect_cvc`**: surface field error.
- **`expired_card`**: tell user the card is expired.
- **`processing_error`**: temporary; suggest retry.
- **`authentication_required`**: 3DS required; Stripe.js handles UI automatically.

Stripe error codes are documented; map them to user-friendly messages.

## Three real-world scenarios

**Scenario 1: The custom-checkout win.**
A team migrated from Checkout to Elements because their conversion analytics showed users dropped off when redirected. Inline Elements kept them in flow; conversion improved 15%. Investment paid off in revenue.

**Scenario 2: The Appearance API rescue.**
A team initially built a custom card form (re-implementing what Elements provides). PCI compliance audit flagged them. Migrated to Elements with Appearance API for design match. Same visual brand; PCI compliance restored.

**Scenario 3: The Express Checkout boost.**
A mobile-heavy team added Express Checkout Element (Apple Pay, Google Pay, Link). Mobile conversion jumped 30%. One-tap purchase beats typed card details on mobile.

## Common mistakes to avoid

- **Storing card details on your server** — PCI compliance failure.
- **Building card input from scratch** — re-implementing what Elements provides; usually a security mistake.
- **Trusting client-side amount** — server validates pricing.
- **No real-time validation** — users hit submit and only then see errors.
- **Generic error messages** — bad UX; users don't know what to fix.

## Read more

- [Stripe Elements docs](https://docs.stripe.com/payments/payment-element)
- [Appearance API](https://docs.stripe.com/elements/appearance-api)
- [Express Checkout Element](https://docs.stripe.com/elements/express-checkout-element)

## Summary

- **Stripe Elements** = embeddable UI components for custom checkout while keeping PCI compliance.
- **Payment Element** is the modern unified component; supports cards, wallets, BNPL, etc.
- Flow: PaymentIntent on server → client_secret to frontend → mount + confirm in Elements.
- **Appearance API** for design customization to match your brand.
- **Express Checkout Element** for one-tap wallet payments.
- **3DS handled automatically** by Stripe.js confirmPayment.

Next: payment methods — cards, wallets, bank transfers, BNPL.
