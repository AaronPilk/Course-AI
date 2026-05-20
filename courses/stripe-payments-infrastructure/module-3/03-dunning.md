---
module: 3
position: 3
title: "Dunning — when payments fail and what to do"
objective: "Configure retries and recovery flows to minimize involuntary churn."
estimated_minutes: 9
---

# Dunning — when payments fail and what to do

## The puzzle

Cards expire. Funds run out. Banks decline. Even healthy subscriptions see ~2-5% payment failures per cycle. Left unhandled, those become *involuntary churn* — users who wanted to keep paying but didn't because their card failed.

**Dunning** is the practice of recovering failed payments. Stripe handles much of it; your job is configuring the retries and pairing them with user-facing recovery UX.

## The simple version

When a subscription payment fails:

1. Stripe retries on a schedule (configurable).
2. Subscription status moves to `past_due`.
3. After retries exhaust, status becomes `unpaid` or `canceled`.
4. Throughout, Stripe emits webhooks you act on (notify user, restrict access).

Configure smart retries + email customers proactively = save 50-80% of failed payments.

## The technical version

### Configuring retries

In Stripe Dashboard → Billing → Subscriptions → Retry settings:

- **Smart retries** (default): Stripe ML picks optimal retry times.
- **Custom schedule**: define exact intervals (e.g. retry at day 3, 5, 7).
- **No retries**: subscription immediately moves to `unpaid` after first failure.

Smart retries are usually best — Stripe has data on when retries succeed across millions of payments. Custom schedules are for specific compliance / UX needs.

### Status transitions on payment failure

```
active → (payment fails) → past_due → (retries exhaust) → unpaid or canceled
```

- **`past_due`**: subscription still tries to charge; product usually keeps working with grace period.
- **`unpaid`**: stops trying; subscription effectively dead, but Stripe doesn't cancel it. You can re-attempt manually or let it linger.
- **`canceled`**: subscription is over.

In dashboard, configure what happens after retries exhaust:

- **Cancel subscription**.
- **Mark as unpaid** (keep around for recovery).
- **None** (leave at past_due).

### Webhook events

Listen for:

- **`invoice.payment_failed`**: a charge attempt failed. May be retried.
- **`invoice.payment_action_required`**: 3DS authentication needed (covered in 2.4).
- **`customer.subscription.updated`**: state change (active → past_due, etc.).
- **`customer.subscription.deleted`**: subscription ended.

React appropriately in your DB and UX.

### User-facing recovery flow

When `invoice.payment_failed` fires:

1. **Email the user** immediately. "Your payment didn't go through; please update your card."
2. **Show an in-app banner**: "Action required: update your billing."
3. **Provide a one-click flow** to update card or retry.
4. **On retry success**, send confirmation: "Your subscription is back on track."

The faster and clearer your recovery UX, the higher your recovery rate.

### Grace periods

Most products keep features active during `past_due`:

```js
const features = (subscription.status === "active" || subscription.status === "past_due") 
  ? PREMIUM_FEATURES 
  : FREE_FEATURES;
```

Grace gives the user time to fix things without losing features. A 7-14 day grace is typical.

After grace + Stripe retries exhausted → restrict features.

### Email vs. in-app vs. SMS

For dunning, multiple channels matter:

- **Email**: primary; everyone has it.
- **In-app banner**: catches users who don't read email.
- **SMS**: for highest-value subscriptions; opt-in.

The product-level reality: a single email rarely recovers — 2-3 touches across channels typically does much better.

### Customer Portal

Stripe's hosted Customer Portal lets users:

- See their subscription.
- Update payment methods.
- View invoices.
- Cancel.

Embed a link to the Portal from your dunning email and banner:

```js
const session = await stripe.billingPortal.sessions.create({
  customer: customer.id,
  return_url: "https://yourapp.com/account"
});

// Redirect user to session.url
```

The Portal handles the "update card" UX for you. Less code; standard UX.

### Updating cards before they fail

Better than recovering after failure: prevent the failure.

**Card Account Updater** (free Stripe feature): for many issuers, when a card's number, expiration, or CVV changes, Stripe automatically updates the saved PaymentMethod. Customer doesn't need to do anything.

This happens silently in the background and prevents many failures.

**Proactive expiration reminders**: send "Your card expires next month; update now" 30 days before expiration:

```js
const upcoming = await stripe.paymentMethods.list({ customer: customer.id });
for (const pm of upcoming.data) {
  if (pm.card.exp_month === nextMonth && pm.card.exp_year === thisYear) {
    sendExpirationReminder(customer);
  }
}
```

Run as a daily job.

### Different failure reasons, different responses

`invoice.payment_failed` events have a `reason`:

- **`card_declined`**: bank declined; user should try a different card.
- **`insufficient_funds`**: user knows; just inform.
- **`expired_card`**: prompt them to update.
- **`authentication_required`**: 3DS challenge needed (covered in 2.4).

Tailor your email/banner to the reason:

- For `expired_card`: "Your card expired. Update with one click."
- For `insufficient_funds`: "Charge failed due to insufficient funds. We'll retry in 3 days, or update your card now."
- For `card_declined`: "Your bank declined the charge. Try another card or contact them."

Specific messaging beats generic "your payment failed."

### When to give up

After Stripe's retries are exhausted, you have options:

- **Manual retry**: invoice.retry from your support tool when the customer reaches out.
- **Subscription cancellation**: clean break.
- **Win-back campaign**: email weeks later "we miss you; come back."

Some customers never recover; others come back after months. Track win-back rates per cohort.

### Recovery metrics

Track:

- **Initial failure rate**: % of subscription cycles where payment fails.
- **Recovery rate**: % of failures that eventually succeed (retries + user action).
- **Final churn rate**: % that never recover.

Industry benchmark: ~50-70% recovery rate with good dunning UX. Below 40% means there's leverage left in your flow.

### Edge cases

- **3DS during retries**: same recovery pattern as off-session 3DS (Lesson 2.4).
- **Multiple cards on file**: Stripe tries default; you can hint via `default_payment_method` on subscription.
- **Currency mismatches**: charges in customer's currency reduce failures vs. converted FX.

### Don't be a jerk

Dunning is collections — but tonally, it's about helping a customer who wants to keep using your product. Avoid:

- **Threatening language** ("We will terminate your account!").
- **Hidden info** (where's the bill, why did it fail).
- **Multiple emails per day** (annoying; hurts trust).

Be informative; be respectful; make the fix easy. Recovery rate goes up.

## Three real-world scenarios

**Scenario 1: The recovery UX win.**
A team had a 38% recovery rate. Email-only dunning. They added: in-app banner, friendly tone, one-click update via Customer Portal, reason-specific messaging. Recovery jumped to 67%. Reduced involuntary churn meaningfully on already-paying customers.

**Scenario 2: The Card Updater save.**
A team enabled Stripe's free Card Account Updater. Quietly, ~15% of card changes (renumber, expiry, etc.) updated automatically. Failures dropped without any user action. Free leverage.

**Scenario 3: The exhausted-retries customer.**
A customer's subscription was canceled after retries exhausted. They emailed support; team manually retried via dashboard; succeeded. Lesson: provide a "retry now" option in support tools; some recoveries happen weeks after initial failure.

## Common mistakes to avoid

- **No dunning flow** — automatic churn.
- **Email-only dunning** — half of users don't see it.
- **Generic messaging** — specific failure reasons + specific actions recover better.
- **No grace period** — instant feature loss feels punitive.
- **Threatening tone** — customers churn rather than fix.
- **No Card Account Updater** — leaving free recovery on the table.

## Read more

- [Smart retries](https://docs.stripe.com/billing/revenue-recovery/smart-retries)
- [Customer Portal](https://docs.stripe.com/customer-management)
- [Card Account Updater](https://docs.stripe.com/automatic-card-updates)
- [Revenue recovery playbook](https://docs.stripe.com/billing/revenue-recovery)

## Summary

- **Dunning** = recovering failed payments before they become involuntary churn.
- **Smart retries** (Stripe ML) usually beat custom schedules.
- **Grace periods** keep features during `past_due` — typical 7-14 days.
- **Multi-channel recovery UX**: email + in-app banner + (optional SMS).
- **Customer Portal** for one-click card updates.
- **Card Account Updater** prevents failures silently.
- **Specific messaging per failure reason** beats generic "payment failed."
- Track **initial failure rate, recovery rate, final churn rate** — aim for >50% recovery.

Next: the Customer Portal in depth.
