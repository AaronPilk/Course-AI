---
module: 2
position: 3
title: "Payment methods — cards, wallets, bank transfers, and BNPL"
objective: "Enable the payment methods relevant to your customers."
estimated_minutes: 8
---

# Payment methods — cards, wallets, bank transfers, and BNPL

## The puzzle

"Just cards" used to be enough. Now customers expect Apple Pay, Google Pay, PayPal, Klarna, Afterpay, ACH, SEPA — each with different flows, settlement times, and economics. Picking the right set increases conversion; getting it wrong loses sales.

## The simple version

Stripe supports many payment methods. You enable them in dashboard and let Stripe surface them based on customer's location and currency. Most apps enable a small set:

- **Cards** (Visa, MC, Amex) — universal.
- **Wallets** (Apple Pay, Google Pay, Link) — one-tap; high mobile conversion.
- **ACH / Bank debit** — low fee, slow settlement, US.
- **SEPA** — Europe equivalent.
- **BNPL** (Klarna, Afterpay) — increases conversion on certain price points.

Use `automatic_payment_methods: { enabled: true }` and Stripe picks the right ones per customer.

## The technical version

### Automatic payment methods

Easiest path:

```js
await stripe.paymentIntents.create({
  amount: 5000,
  currency: "usd",
  customer: customer.id,
  automatic_payment_methods: { enabled: true }
});
```

Stripe shows the methods appropriate to the customer (location, currency, amount). Enable methods in dashboard once; Stripe handles the rest per transaction.

### Manual selection

For control:

```js
await stripe.paymentIntents.create({
  amount: 5000,
  currency: "usd",
  payment_method_types: ["card", "us_bank_account", "apple_pay", "google_pay"]
});
```

Use when you want to explicitly include or exclude specific methods.

### Cards

Universal. 2.9% + 30¢ for US cards is typical. International / Amex usually higher.

Cards support:

- **3D Secure (3DS)** for SCA compliance.
- **Save for future use** via `setup_future_usage`.
- **Recurring charges** with saved methods.

### Apple Pay / Google Pay / Link

One-tap mobile payment via the device's saved cards. Higher conversion on mobile especially.

- **Apple Pay** requires domain verification (one-time setup in Stripe dashboard).
- **Google Pay** generally works once enabled.
- **Link** is Stripe's own one-click checkout (saves payment methods across Stripe-powered sites).

Fees: same as the underlying card.

### Bank debits — ACH, SEPA, BACS

Direct bank account → bank account transfers.

- **Cost**: much cheaper than cards (~$0.80 cap for ACH).
- **Settlement**: slow (3-5 business days for ACH).
- **Risk**: chargebacks possible up to 60 days for ACH (vs ~120 days for cards).

For subscriptions and one-time large charges, bank debits can save a lot vs. cards. Settlement delay rules out fast-fulfillment products.

```js
await stripe.paymentIntents.create({
  amount: 50000,
  currency: "usd",
  payment_method_types: ["us_bank_account"]
});
```

Customer authorizes via Stripe-hosted bank login (Plaid-style) or micro-deposits.

### BNPL — Klarna, Afterpay, Affirm, etc.

Buy Now Pay Later. Customer pays in installments; you get paid up front by the provider.

- **Higher conversion** on certain price points ($50-$500 typical).
- **Higher fees** (~3-6%).
- **No chargeback risk** to you — BNPL provider takes it on.
- **Geographic limits** — Klarna stronger in EU, Afterpay in AU/UK/US.

Enable per provider per geo:

```js
payment_method_types: ["card", "klarna", "afterpay_clearpay", "affirm"]
```

Pick BNPL providers that match your customer demographic.

### International methods

- **iDEAL** — Netherlands.
- **Bancontact** — Belgium.
- **EPS** — Austria.
- **Giropay** — Germany.
- **WeChat Pay, Alipay** — China.
- **Multibanco** — Portugal.
- **OXXO** — Mexico.
- **Boleto** — Brazil.

Each has specific use cases per geo. Stripe documents them all; enable based on your customer base.

### Currency considerations

Different methods support different currencies:

- Cards: most currencies (with FX fees for non-presentment).
- Bank debits: typically local currency only (USD for ACH; EUR for SEPA).
- BNPL: provider-specific; Klarna supports many; Afterpay supports AU/NZ/UK/US.

For multi-currency products: enable Stripe's automatic currency conversion or charge in customer's local currency.

### When to enable what

Quick guidelines:

- **B2C with cards**: always cards + wallets (Apple/Google/Link).
- **B2B with annual contracts**: cards + ACH (save fees on large bills).
- **High-AOV consumer products ($100+)**: add BNPL options.
- **Global products**: add region-specific methods where you have meaningful traffic.

Don't enable methods you can't handle — each adds settlement complexity, refund flows, and dispute mechanics.

### Settlement and disputes per method

Different methods have different timing and risk:

- **Cards**: 2-day settlement; ~120-day chargeback window.
- **ACH**: 3-5 day settlement; ~60-day return window.
- **Apple/Google Pay**: same as underlying card.
- **BNPL**: instant settlement; minimal direct chargeback risk to you.

For high-value transactions, slow-settling methods (ACH, bank debits) can match the lower fees with acceptable risk.

### Stripe Link

Stripe's own one-click checkout — saves payment methods across Stripe-powered sites. Customer signs in to Link; one-tap pays on any site.

Enable with `automatic_payment_methods: { enabled: true }` and Stripe shows Link to eligible users. Higher conversion than typed card entry.

### Refunds and partial refunds

All methods support refunds via the same API. Settlement of the refund varies (cards: instant decrement; bank debits: takes days; BNPL: provider-specific).

```js
await stripe.refunds.create({
  payment_intent: pi_id,
  amount: 1500  // partial; omit for full
});
```

### Currency display

In Checkout/Elements, prices display in the currency you set. Use Stripe's automatic localization or explicitly set per region:

```js
const session = await stripe.checkout.sessions.create({
  currency: "eur",  // for EU customer
  ...
});
```

Don't force-convert; charge in the customer's local currency when possible. Reduces cart abandonment.

## Three real-world scenarios

**Scenario 1: The ACH savings.**
A B2B SaaS charging $5K-$50K per invoice was paying ~$150 in card fees per charge. They added ACH for invoices over $1K. Customers opted in; fees dropped to ~$5 per ACH charge. Saved tens of thousands per year.

**Scenario 2: The BNPL win.**
A DTC product company added Klarna and Afterpay for purchases $100+. Cart abandonment dropped; AOV grew because customers who couldn't afford lump-sum bought when offered installments. 6% fee was easily offset by added revenue.

**Scenario 3: The wallet conversion.**
A team was cards-only. Added Apple Pay, Google Pay, Link via `automatic_payment_methods`. Mobile conversion jumped notably. One config change; meaningful revenue impact.

## Common mistakes to avoid

- **Cards-only by default**, missing high-conversion wallets.
- **Enabling methods you can't operationally handle** — settlement and refund timing differ.
- **Not understanding chargeback windows** — ACH has shorter chargeback risk than cards.
- **Forcing single-currency display** — customers don't trust FX rates they can't see.
- **Enabling BNPL on low-AOV** — fees outweigh benefit on small purchases.

## Read more

- [Payment methods overview](https://docs.stripe.com/payments/payment-methods)
- [Apple Pay setup](https://docs.stripe.com/apple-pay)
- [BNPL options](https://docs.stripe.com/payments/buy-now-pay-later)

## Summary

- **`automatic_payment_methods: { enabled: true }`** lets Stripe pick the right methods per customer.
- **Cards + wallets** as baseline; add others per use case.
- **ACH / bank debits** save fees on large recurring charges.
- **BNPL** boosts conversion at $100-$500 price points.
- **International methods** enable specific geos.
- **Settlement and chargeback timing** vary per method.
- **Charge in customer's currency** to reduce abandonment.

Next: 3D Secure and SCA.
