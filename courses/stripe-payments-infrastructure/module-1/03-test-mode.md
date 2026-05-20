---
module: 1
position: 3
title: "Test mode and the Stripe sandbox"
objective: "Set up test mode, use test cards, and never accidentally charge real cards in development."
estimated_minutes: 8
---

# Test mode and the Stripe sandbox

## The puzzle

Stripe has two universes: test mode and live mode. They have separate API keys, separate customers, separate dashboards, separate everything. Mixing them up is one of the most painful and recurring developer mistakes — usually surfacing as "wait, did I just charge real cards from my localhost?"

## The simple version

- **Test mode**: free, separate API keys (`sk_test_...`, `pk_test_...`), test cards work, no real money moves.
- **Live mode**: real API keys (`sk_live_...`, `pk_live_...`), real money, real consequences.

Always develop and test in test mode. Promote to live only after thorough testing. Use environment variables; never hardcode keys.

## The technical version

### Switching between modes

In the Stripe dashboard, a "Test mode" toggle in the top-right swaps between test and live data. Always check which mode you're in before viewing/changing data.

API keys are mode-specific:

- **Test publishable key**: `pk_test_51...`
- **Test secret key**: `sk_test_51...`
- **Live publishable key**: `pk_live_51...`
- **Live secret key**: `sk_live_51...`

Find them under Developers → API keys.

### Environment-based keys

The canonical pattern: keys from env vars, never hardcoded:

```js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
```

`.env.local` (development):

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Production env (production hosting platform):

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

Same code, different env, different mode.

### Test cards

Stripe publishes a list of test card numbers that trigger specific behaviors:

- **`4242 4242 4242 4242`** — succeeds normally.
- **`4000 0000 0000 0002`** — generic decline.
- **`4000 0000 0000 9995`** — insufficient funds.
- **`4000 0025 0000 3155`** — requires 3DS authentication.
- **`4000 0000 0000 0341`** — succeeds, then dispute.
- And many more for specific scenarios.

Use any future expiration date, any 3-digit CVC. These cards never charge real money even if used in live mode (they're flagged as test cards).

### Testing webhooks locally

Webhooks come from Stripe's servers; they can't hit `localhost` directly. Use Stripe CLI to forward:

```bash
# Install
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI gives you a webhook signing secret to use locally:

```bash
> Your webhook signing secret is whsec_abc123...
```

Set this in your local env and you can test webhook flows end-to-end.

### Triggering test events

Force specific event types:

```bash
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.deleted
```

Useful for testing webhook handlers without manually creating each scenario.

### Test data isolation

Test mode and live mode have completely separate:

- Customers.
- PaymentIntents.
- Subscriptions.
- Webhooks.
- Logs.
- Everything.

A Customer ID created in test mode doesn't exist in live mode. This is intentional — you can rebuild and reset test data freely.

You can clear test data: Settings → Account → Data → Clear test data. Useful when test state gets messy.

### Common mode mistakes

- **Loading live keys in development by accident.** Real customer cards processed; reconciliation nightmare.
- **Test keys in production.** No real charges happen; users think they paid but didn't.
- **Mixing prefixes** (`sk_test_` paired with `pk_live_`). Cryptic errors.
- **Hardcoded keys** in source committed to git. Even test keys leak surface area; live keys are catastrophic.

### Best practices

- **Use environment variables** for all keys. Never hardcode.
- **`.env.local` for dev**, never committed.
- **Production env vars set via your hosting platform** (Vercel, Cloudflare, Fly, AWS Parameter Store, etc.).
- **CI/CD**: use separate test keys; not production live keys.
- **Pre-commit hooks** that scan for `sk_live_` patterns and reject commits.
- **Regular key rotation** every quarter or so.

### Restricted keys

Beyond `sk_test_` and `sk_live_`, Stripe lets you create **restricted keys** with limited scope:

- Read-only access.
- Permission per resource (read Customers but not write).
- Per-feature (Disputes only, Invoices only).

Use restricted keys for:

- CI/CD that only needs read access.
- Specific integrations (e.g. an analytics tool).
- Anything other than your main app.

Minimizes blast radius if a key leaks.

### Mode switching in the dashboard

The "Test mode" toggle in the dashboard is per-user, per-session. Just because you're in test mode in your browser doesn't mean other team members are.

Always verify before:

- Issuing refunds.
- Disputing chargebacks.
- Reading customer data.

The two modes look almost identical. The colored banner (test mode is orange-tinted) is the only obvious cue.

## Three real-world scenarios

**Scenario 1: The live-key dev disaster.**
A new developer copied production env vars into their `.env.local` for "easy testing." They ran the test suite — which created real customers and charged real cards. Refunds went out; embarrassed apologies followed. Lesson: live keys never in development.

**Scenario 2: The webhook CLI life-saver.**
A team had been deploying to a staging server every time they wanted to test webhook handlers. Slow loop. They started using `stripe listen --forward-to localhost` — local iteration jumped from hours to minutes per cycle.

**Scenario 3: The leaked test key.**
A test key was accidentally committed to a public GitHub repo. Lower-stakes than live but still: rotated immediately, audited usage, added pre-commit hooks to scan for key patterns going forward.

## Common mistakes to avoid

- **Live keys in development.** Recipe for charging real cards by accident.
- **Test keys in production.** Users think they paid but didn't.
- **Hardcoded keys in source.** Even test keys are sensitive.
- **Mixing test/live prefixes.** Cryptic errors.
- **Single full-scope key for everything.** Restricted keys minimize blast radius.

## Read more

- [Stripe test cards](https://docs.stripe.com/testing)
- [Stripe CLI](https://docs.stripe.com/stripe-cli)
- [API keys](https://docs.stripe.com/keys)
- [Restricted keys](https://docs.stripe.com/keys#limit-access)

## Summary

- **Test mode and live mode** are completely separate; mode-specific keys.
- **Test cards** (e.g. 4242...4242) trigger specific behaviors safely.
- **Stripe CLI** (`stripe listen`) forwards webhooks to localhost for local testing.
- **Environment variables** for keys; never hardcoded; `.env.local` not committed.
- **Restricted keys** for anything other than your main app.
- **Verify mode** before issuing refunds or reading data.

Next: idempotency — Stripe's superpower.
