---
module: 5
position: 2
title: "Refunds, credits, and customer service edge cases"
objective: "Handle the long tail of refund scenarios cleanly."
estimated_minutes: 8
---

# Refunds, credits, and customer service edge cases

## The puzzle

Refunds sound simple: customer asks, you give money back. Real life has edge cases: partial refunds, subscription credits, refunds on disputed charges, refunds across currency conversions, refunds after settlement. Each has its mechanics and gotchas.

## The simple version

Three refund tools:

1. **Full refund** of a PaymentIntent / Charge.
2. **Partial refund** for less than the full amount.
3. **Subscription credits** that apply to future invoices (instead of returning money).

Plus: refund timing varies by payment method; some refunds are immediate, some take days.

## The technical version

### Full refund

```js
const refund = await stripe.refunds.create({
  payment_intent: "pi_abc",
  reason: "requested_by_customer"  // optional: requested_by_customer | duplicate | fraudulent
});
```

Refunds the full amount of the most recent charge on the PaymentIntent. Funds return to the customer's card / bank.

Webhook fires: `charge.refunded`.

### Partial refund

```js
await stripe.refunds.create({
  payment_intent: "pi_abc",
  amount: 1500  // partial: $15.00 of a larger charge
});
```

You can issue multiple partial refunds up to the original charge amount. Each appears in the customer's statement separately.

### Reasons matter for reporting

`reason` field options:

- **`duplicate`**: customer was charged twice for the same thing.
- **`fraudulent`**: charge was fraud (use for cleanup, not as dispute response).
- **`requested_by_customer`**: customer asked.
- (Omit): no specific reason.

For analytics, classify your refund reasons. Helps identify product issues vs. customer service issues vs. fraud.

### Settlement and refund timing

Refunds appear on customer statements at different speeds:

- **Cards (Visa/MC)**: typically 5-10 business days to appear.
- **ACH / bank debits**: similar timing.
- **Apple Pay / Google Pay**: same as underlying card.
- **BNPL**: provider-specific; sometimes faster.

Tell customers refunds take 5-10 days. Don't promise "instant" — even successful refunds appear delayed on bank statements.

### Refunds against settled vs unsettled charges

A charge moves through:

```
charge.succeeded → (settlement) → funds settled in your Stripe balance
```

Refund timing:

- **Before settlement**: refund cancels the charge; no money has actually moved. Fast.
- **After settlement**: refund moves funds from your balance back to the customer. Standard timing.

For most refunds you don't see this distinction — Stripe abstracts it.

### Multiple refunds — total can't exceed original

```js
// Original charge: $100
await stripe.refunds.create({ payment_intent: pi.id, amount: 3000 }); // $30
await stripe.refunds.create({ payment_intent: pi.id, amount: 2000 }); // $20
// Total refunded: $50
// Can refund up to another $50

await stripe.refunds.create({ payment_intent: pi.id, amount: 6000 }); // Error: exceeds remaining
```

Stripe tracks remaining refundable amount.

### Refund on disputed charges

You can't refund a charge that's actively disputed — the money is already withdrawn by Stripe pending dispute resolution. Wait for the dispute to close.

If the dispute is closed in your favor and you want to refund anyway (customer service gesture), you can refund the now-returned funds.

### Subscription credits vs. refunds

For subscriptions, you have a choice:

- **Refund to original payment method**: actual money back.
- **Apply credit to next invoice**: future charges reduced.

```js
// Refund (actual money back)
await stripe.refunds.create({
  payment_intent: subscription.latest_invoice.payment_intent,
  amount: 2000
});

// Credit (applies to future invoices)
await stripe.customerBalanceTransactions.create("cus_abc", {
  amount: -2000,  // negative = credit
  currency: "usd",
  description: "Promotional credit"
});
```

Credits are useful for retention offers ("3 months free if you stay"). Refunds for customer-service cases ("we'd like to make it right").

### Proration credits on subscription changes

When a customer downgrades mid-cycle, Stripe creates a credit:

```
Was: $50/mo Pro plan
Now: $20/mo Basic plan (mid-cycle downgrade)
Unused $30 prorated → applied as credit to next invoice
```

That credit lives on the Customer balance. Next invoice subtracts it.

You don't manage this — Stripe handles proration automatically.

### Refunds and fees

Stripe charges processing fees on charges (~2.9% + 30¢). When you refund:

- **Refund amount**: full charge minus what's been refunded so far.
- **Processing fee**: NOT refunded by Stripe in most regions. Your loss.

So a $100 charge refunded fully: you eat $2.90 + 30¢ = $3.20 in fees.

For high-refund products, this fee leakage matters. Reducing refund rate is the only fix; Stripe doesn't refund their fees.

### Negative balance scenarios

If you refund more than your current Stripe balance:

- Your Stripe balance goes negative.
- Stripe debits your linked bank account to make it whole.
- Or future incoming charges fill the balance back to zero.

This happens occasionally. Plan for it; don't keep your Stripe balance at $0.

### Mass refunds (recall scenarios)

For product recalls or major issues:

- Refund affected customers en masse via API.
- Communicate clearly via email.
- Coordinate with customer support for inbound questions.
- Note: mass refunds can trigger Stripe Risk Review.

For high-volume mass refunds, alert Stripe support proactively.

### Refunds and tax

If you collected tax via Stripe Tax: refund includes the tax portion. Stripe handles the math.

If you collected tax outside Stripe: refund only the customer-facing amount; reconcile tax separately in your tax filing.

### Edge cases

- **Refund after subscription canceled**: works fine; references the original charge.
- **Refund on currency-converted charge**: customer gets back their original local currency amount; FX losses if rates changed.
- **Refund after card expired / closed**: Stripe handles via the issuing bank; customer usually receives a check or alternative.

### Tracking refund metrics

Care about:

- **Refund rate** (refunds / charges): typical SaaS 1-3%; ecommerce 5-15%.
- **Average refund amount**: trends with product price.
- **Reasons breakdown**: which categories drive refunds.
- **Time-to-refund**: how long after purchase customers request refunds. Days = product disappointment; months = retention issue.

Track in your DB; segment by product / cohort.

### Refund-vs-dispute revisited

Earlier we said: when in doubt, refund. The math:

- **Refund cost**: amount + processing fee (~3% leakage) + minimal admin.
- **Dispute cost (even if won)**: amount-equivalent admin + $15-25 fee + reputation + ~60-day cash hold.

For amounts under $500, refunding is almost always cheaper than even winning a dispute. For larger amounts, the calculus shifts but refunds still usually win.

### Customer support tooling

Most teams build internal tools that:

- Look up customer + recent charges by email or ID.
- One-click refund with reason.
- Add credit to customer balance.
- Send refund confirmation email.

Build this early; saves support team time forever.

## Three real-world scenarios

**Scenario 1: The credit-instead-of-refund retention.**
A team's churning subscribers were offered "3 months 50% off" credits instead of refunds. Many stayed. The credit was applied via customer balance; reduced future invoices automatically. No money out of pocket; retention improved.

**Scenario 2: The fee leakage.**
A team had 12% refund rate on a $50 product. Stripe fees: ~$1.75 per $50 charge. They were eating ~$21K/year in processing fees on refunded charges. Reducing refund rate (better product fit, clearer expectations at checkout) was the only path.

**Scenario 3: The settlement timing question.**
A customer complained their refund "didn't show up." Investigation: refund was processed instantly in Stripe but the customer's bank statement showed it 7 days later. Standard. Team updated their refund-confirmation email: "Refunds take 5-10 business days to appear on your statement. You'll see this charge: [date] · [amount] · [descriptor]." Complaints dropped.

## Common mistakes to avoid

- **No internal refund tool** — support team manually issuing via dashboard slows everything.
- **Promising "instant refund"** — customer statements lag.
- **Refunding processing fees** — Stripe doesn't refund their fees; you eat the ~3%.
- **No tracking by reason** — can't see product issues vs. fraud patterns.
- **Refunding actively disputed charges** — can't; wait for dispute close.
- **Mass refunds without notice** — triggers Stripe Risk Review.

## Read more

- [Refunds](https://docs.stripe.com/refunds)
- [Customer balance transactions](https://docs.stripe.com/api/customer_balance_transactions)
- [Proration credits](https://docs.stripe.com/billing/subscriptions/prorations)

## Summary

- **Full or partial refunds** via API or dashboard.
- **Credit to customer balance** as alternative to refund (retention tool).
- **Reason field** for analytics; classify reasons systematically.
- **Refunds take 5-10 days** to appear on customer statements; set expectation.
- **Stripe doesn't refund processing fees** — you eat the ~3%.
- **Subscription credits** for retention; refunds for service recovery.
- **Track refund rate + reasons** to spot product / cohort issues.

Next: Stripe Tax and compliance basics.
