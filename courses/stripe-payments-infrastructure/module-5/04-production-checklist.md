---
module: 5
position: 4
title: "The Stripe production checklist — going from sandbox to live"
objective: "Walk the full pre-launch checklist for a payments integration."
estimated_minutes: 10
---

# The Stripe production checklist — going from sandbox to live

## The puzzle

You've built it. It works in test mode. Going live with real money has a different set of requirements: compliance, configuration, error handling, observability, support readiness. Missing items means real customer money has real consequences.

This is the launch playbook.

## The simple version

Before going live, verify every item below:

1. **Compliance**: PCI scope, tax registration, terms / refund policy live.
2. **Configuration**: Stripe account complete, billing descriptor, branding, payout schedule.
3. **Integration**: full Stripe.js patterns (no card data on server), idempotency, webhooks signed.
4. **Resilience**: handlers idempotent, errors monitored, retries safe.
5. **Operations**: support tooling, dispute response process, refund workflow.

Each tightens a specific failure mode. Skip any and that's where you'll hit problems.

## The technical version

### 1. Stripe account ready

- [ ] **Business activation complete**: tax ID, bank account, business details all submitted.
- [ ] **Identity verified**: passport / driver's license + business docs as required.
- [ ] **Payouts enabled**: bank account verified; payout schedule set (default 2-day rolling).
- [ ] **Stripe Risk Review** passed: for some businesses Stripe does an initial review.

Without account fully activated, Stripe holds funds. Launch with verified account.

### 2. Branding and customer-facing config

- [ ] **Business logo** uploaded in dashboard (appears on Checkout, Customer Portal, receipts).
- [ ] **Brand colors** set.
- [ ] **Public business name** matches your actual brand.
- [ ] **Support email** visible on receipts.
- [ ] **Support phone** if you offer it.
- [ ] **Statement descriptor** clearly identifies your brand on bank statements.
- [ ] **Receipts**: enable email receipts in Settings → Customer emails.

These reduce "what's this charge?" disputes and confused customers.

### 3. Compliance and legal

- [ ] **Privacy policy** linked and current.
- [ ] **Terms of service** linked and current.
- [ ] **Refund policy** clearly stated on your site.
- [ ] **Tax registration** in all jurisdictions where you have nexus.
- [ ] **Stripe Tax** enabled (if applicable).
- [ ] **PCI compliance**: use Stripe Elements / Checkout so you stay in SAQ A scope.
- [ ] **GDPR / CCPA** considerations for customer data.

If you process > certain volumes, additional compliance: SOC 2, PCI DSS upgrades, etc. Talk to compliance counsel.

### 4. Integration patterns

- [ ] **Test mode parity**: all flows tested in test mode with realistic data.
- [ ] **Elements / Checkout / Stripe.js**: card data never touches your server.
- [ ] **Idempotency keys** on every mutating API call.
- [ ] **Webhook signature verification** on every endpoint.
- [ ] **Webhook idempotency** by event ID.
- [ ] **`metadata.user_id` (or equivalent)** on all customer-facing objects.
- [ ] **3DS / SCA handling** for European customers (or wherever applicable).
- [ ] **Off-session retry recovery** for failed subscription renewals.
- [ ] **`automatic_payment_methods`** enabled for broad payment method support.

### 5. Error handling and observability

- [ ] **Per-call logging**: input, output, latency, error status.
- [ ] **Webhook event log**: every event received, processed status, errors.
- [ ] **Dashboard for daily payments**: revenue, refunds, disputes, failed charges.
- [ ] **Alerts** on: payment failure rate spike, webhook failures, dispute rate, settlement issues.
- [ ] **PCI-safe logging**: no card numbers; no full tokens; mask sensitive data.
- [ ] **Trace IDs** across services so debugging crosses boundaries.

### 6. Customer support tooling

- [ ] **Internal admin tool**: lookup customer + recent charges by email or ID.
- [ ] **One-click refund** with reason capture.
- [ ] **Issue credit / cancel subscription** flows.
- [ ] **Dispute response workflow** (or playbook).
- [ ] **Common customer questions** documented for support team.

### 7. Operational readiness

- [ ] **Cash flow modeling**: Stripe payouts take 2 days; dispute holds last 60+ days.
- [ ] **Reconciliation job**: daily compare local DB to Stripe state; alert on drift.
- [ ] **Backup payment method on file** for own subscriptions / Stripe fees.
- [ ] **On-call rotation** for payment failures.
- [ ] **Incident response plan**: who pages, how to disable charges if needed.

### 8. Production launch process

- [ ] **Beta with small subset**: 1-10% of traffic to live mode first.
- [ ] **Watch metrics tightly** first 48 hours.
- [ ] **Easy rollback**: feature flag to revert to "payment unavailable" message if needed.
- [ ] **Comms plan**: marketing knows when live; support knows what to expect.

### 9. Post-launch monitoring

- [ ] **Daily metrics review** first 2 weeks.
- [ ] **Weekly dispute review** ongoing.
- [ ] **Monthly reconciliation** Stripe vs. accounting.
- [ ] **Quarterly security review** API tokens, webhook secrets, permissions.

### 10. Cost monitoring

- [ ] **Per-day Stripe fees** tracked.
- [ ] **Refund / chargeback fees** tracked.
- [ ] **Stripe Tax fees** if used.
- [ ] **Dispute rate** below 1% (well below 0.9% triggers monitoring).

### Triage when something goes wrong

When payments break:

1. **Stripe dashboard** — check for outages, account warnings.
2. **API logs** — are calls succeeding?
3. **Webhook logs** — are events flowing?
4. **Recent code changes** — git log; what shipped?
5. **3DS / SCA spikes** — geographic shift in customers?
6. **Card decline patterns** — issuer-specific? card type?
7. **Support inbox** — what are customers reporting?

Most production payment incidents are one of these. Logs + Stripe dashboard tell you which.

### Common pre-launch slip-ups

- **Statement descriptor not configured** → high "fraudulent" disputes from confused customers.
- **No webhooks set up** → fulfillment doesn't happen.
- **Test API keys leaked into prod** → no real charges happen; revenue cliff.
- **Tax not enabled** → potential legal exposure.
- **No support tooling** → support team operates from Stripe dashboard manually; slow.

### The "stage zero" launch

If you can, start with a soft launch:

- Friends / paying beta users only.
- Limit to small charges initially.
- Personal customer support: every issue gets eyes on it.
- Iterate based on real friction before broad launch.

Catches the issues your test mode missed.

## Three real-world scenarios

**Scenario 1: The clean launch.**
A team walked the checklist over two weeks before going live. 100% of items checked. Launch day was uneventful: payments flowed, webhooks fired, support tooling worked. Three months in, dispute rate stayed at 0.2%. No surprises.

**Scenario 2: The descriptor-day catastrophe.**
A team launched without configuring the statement descriptor. Default Stripe placeholder appeared on customer cards. "Who is PAYMENT*STRIPE-NETWORK?" Dispute rate hit 4% in the first week before they fixed the descriptor. Took months for dispute rate to normalize after thresholds got triggered.

**Scenario 3: The tax oversight.**
A team launched without tax setup. 6 months later, accountant flagged that they should have been collecting in 12 states. Back-filed; paid penalties + interest. Lesson: tax compliance is on the pre-launch list, not "we'll deal with it later."

## Common mistakes to avoid

- **Skipping the checklist as "overkill"** — every item exists because someone got bit.
- **Launching with test keys** — revenue cliff.
- **No webhook handlers** — fulfillment broken.
- **No idempotency** — duplicate charges on retries.
- **No support tooling** — slow support; angry customers.
- **No cash flow modeling** — surprised by payout / dispute timing.
- **Quietly above dispute thresholds** — Stripe enrolls you in monitoring; fees rise.

## Read more

- [Stripe go-live checklist](https://docs.stripe.com/get-started/checklist/go-live)
- [Stripe security best practices](https://docs.stripe.com/security)
- [Stripe Atlas resources](https://stripe.com/atlas) (if launching a new company)

## Summary

- **Production readiness has 10 areas**: account, branding, compliance, integration, observability, support, operations, launch process, post-launch monitoring, cost.
- **Walk every item** — they exist because someone hit each one.
- **Soft launch with small cohort** catches real-world friction before broad launch.
- **Daily metrics review first 2 weeks**; weekly dispute review ongoing.
- **Reconciliation, alerts, support tooling** are non-negotiable.

## You finished the course

The five modules of Stripe Payments Infrastructure:

1. **The Stripe Mental Model** — data model, PaymentIntents, test mode, idempotency.
2. **Accepting a Payment** — Checkout, Elements, payment methods, 3DS / SCA.
3. **Subscriptions and Recurring Billing** — Subscriptions, trials, proration, dunning, Customer Portal.
4. **Webhooks and Event-Driven Integration** — webhooks, verification, idempotency, events to listen to.
5. **Production Stripe** — disputes, refunds, Stripe Tax, the launch checklist.

You now have the full Stripe stack: from mental model through accepting payments, recurring billing, event-driven sync, and the production patterns that keep payments healthy at scale.

Go build something. And when you launch, walk the checklist.
