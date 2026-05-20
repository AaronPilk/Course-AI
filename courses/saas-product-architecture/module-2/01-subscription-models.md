---
module: 2
position: 1
title: "Subscription models: per-seat, per-feature, freemium"
objective: "How modern SaaS prices itself."
estimated_minutes: 5
---

# Subscription models: per-seat, per-feature, freemium

## The pricing dimensions

SaaS pricing is rarely "one price." It's a combination of dimensions:

- **Per seat** (per user).
- **Per feature** (tiers unlock features).
- **Per usage** (volume).
- **Per outcome** (revenue share, conversions).
- **Flat** (one price, all-you-can-eat).

Real-world products combine these. Slack: per-active-user + per-tier. Notion: per-seat + free tier. Stripe: per-transaction (volume).

The pricing model shapes the architecture (billing data model, metering systems) and the customer experience.

## Per-seat (per-user)

The classic SaaS pricing:

```
Team plan: $10/user/month
```

Customer pays based on user count. Encourages spreading the tool through the organization; aligns price with value (more users = more value).

**Pros:**
- Predictable revenue.
- Scales with customer growth.
- Easy to explain.

**Cons:**
- Customers limit users to save money (suboptimal — they're underutilizing).
- Active-vs-inactive ambiguity (do dormant users count?).
- "Read-only" users feel unfair to bill.

Mitigations:
- "Active user" = logged in within N days.
- Free read-only tier for viewers; paid for editors.
- Group-rate at scale (100+ users: $5/user).

## Per-feature (tiered)

Bundle features into tiers:

```
Starter: $20/mo — basic features
Pro: $99/mo — + advanced features
Enterprise: contact us — + SSO, audit logs, SLAs
```

Customer picks the tier; upgrades for more features.

**Pros:**
- Captures customer willingness to pay (price discrimination).
- Simple to communicate.
- Aligns with maturity of customer.

**Cons:**
- Some features inappropriate at lower tier (lock-in / upsell pressure).
- "Pro" name inflation (every plan calls itself pro).

Common pattern: feature flags gate access; tier defines flag set.

## Per-usage (consumption)

Pay for what you use:

```
$0.01 per API request
$0.05 per video minute processed
$1 per 1M tokens (LLMs)
```

**Pros:**
- Aligns price with cost of serving.
- Easy starter — pay $0 if you don't use.
- Customers comfortable with infrastructure pricing.

**Cons:**
- Unpredictable bills scare some buyers.
- Requires robust metering.
- Hard to compete on "transparent flat pricing."

Mitigations:
- Free tier (first N units free).
- Prepaid credits / commits (buy 1M tokens at discount).
- Spend caps (alert / cut off at $X/month).

OpenAI, AWS, Twilio, Stripe — all use heavy usage pricing for infrastructure-like products.

## Freemium

Free tier alongside paid:

```
Free: 3 projects, 5 collaborators
Pro: $20/mo unlimited
```

**Pros:**
- Lower friction to start.
- Word-of-mouth growth.
- Conversion to paid over time.

**Cons:**
- Free users cost money (infra, support).
- "Free forever" customers stay free.
- Pricing balance is hard (too generous → never pay; too stingy → no signups).

Conversion rate typical: 1-5% of free users convert to paid (industry benchmark). Determines unit economics: free user lifetime cost vs paid user revenue.

Notion, Figma, Linear all use freemium effectively. Free tier is generous enough to be useful; pay tier obviously better for power users.

## Trial vs freemium

Different patterns:

- **Free trial.** "14 days then pay." Pressure to convert; harder onboarding.
- **Freemium.** "Always free at this level." Lower friction; slower conversion.
- **Reverse trial.** "Premium for 14 days; then drops to free." Showcases full product; conversion when value seen.

Trial works for high-value B2B (Salesforce, HubSpot). Freemium works for products with viral / collaborative aspects. Reverse trial is rare but growing (Notion uses).

## Enterprise pricing

Enterprise customers (10K+ employees) get custom contracts:
- Negotiated price.
- Annual commitment.
- Higher SLA.
- Dedicated support.
- Often dedicated infra (silo from earlier).
- SSO, audit logs, compliance features.

Pricing isn't on a page; it's "contact sales." Sales-led motion.

For early-stage SaaS: don't price enterprise yet. Focus on product-market fit at self-serve tiers. Enterprise enters once you have logos that vouch and process to handle long sales cycles.

## Pricing changes and grandfathering

When you change prices, existing customers usually keep their old rate (grandfathered). New customers see new prices.

Implementation: customer record has a `plan_id` pointing to a frozen plan definition. New plans are new rows; old customers untouched.

Some plans removed entirely from public pricing page but kept available for legacy customers (the "Pro v1" hidden plan).

Be careful: pricing fluidity scares enterprise customers (afraid of surprises). Annual contracts lock the price for the year.

## Multi-currency

International customers often want to pay in their currency. Stripe / similar handle conversion. Options:

- **Show USD only; charge in USD.** Simplest; customers handle FX.
- **Show local; charge local.** Better UX; harder ops (each currency a different bank account if not using Stripe).
- **Show local; charge USD.** Misleading; don't.

Stripe pricing has full local-currency support; price tables map each plan to each currency.

## Billing frequency

Standard: monthly or annual. Often:
- Monthly: list price.
- Annual: discount (10-20%) for upfront commit.
- Annual prepaid: extra discount.

Why annual: better cash flow (cash upfront), less churn (committed).

Some apps offer quarterly; rare. Lifetime deals (LTDs) on AppSumo — controversial; commits forever for upfront cash.

## Mistakes to avoid

- **Too many tiers.** Decision paralysis. 3-4 max.
- **Hidden costs.** Surprises drive churn.
- **No grandfathering.** Existing customers price-shocked.
- **Confusing per-X dimensions.** Bill for one thing, not five.
- **Free tier too generous.** Bad unit economics.

## Summary

- Per-seat: predictable, scales, classic SaaS.
- Per-feature (tiers): price discrimination, clear upsell path.
- Per-usage: aligns with cost; needs metering; harder for buyers.
- Freemium: low friction; conversion economics matter.
- Trial: pressure to convert; works in high-value B2B.
- Enterprise: custom contracts; sales-led; not for early stage.
- Grandfather price changes; annual discounts; multi-currency where useful.

Next: usage-based billing in detail.
