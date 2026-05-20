---
module: 5
position: 3
title: "SaaS metrics: MRR, churn, NRR, CAC"
objective: "The numbers that decide whether the business works."
estimated_minutes: 6
---

# SaaS metrics: MRR, churn, NRR, CAC

## The four big numbers

For any SaaS, four metrics tell most of the story:

- **MRR.** Monthly Recurring Revenue.
- **Churn.** Rate of customer / revenue loss.
- **NRR.** Net Revenue Retention.
- **CAC.** Customer Acquisition Cost.

Combined: the business's growth trajectory + unit economics.

## MRR — Monthly Recurring Revenue

Sum of all active monthly subscription revenue:

```
100 customers × $50/month = $5,000 MRR
ARR = MRR × 12 = $60K
```

For annual subscriptions: divide annual revenue by 12 for MRR.

**Breakdowns:**

- **New MRR.** From new customers this month.
- **Expansion MRR.** Existing customers upgrading / adding seats.
- **Contraction MRR.** Existing customers downgrading.
- **Churned MRR.** Cancellations.
- **Net New MRR.** New + Expansion - Contraction - Churn.

The "MRR movement" chart shows growth dynamics:

```
Net New MRR = New MRR + Expansion MRR - Contraction MRR - Churned MRR
```

For healthy SaaS: positive net new MRR every month. Expansion alone should ideally cover churn.

## Churn — losing customers

Two flavors:

**Logo churn.** % of customers who cancel.
```
50 customers Jan 1; 2 canceled in Jan → 4% monthly logo churn
```

**Revenue churn (gross).** % of MRR lost from cancellations + downgrades.
```
$5,000 MRR Jan 1; $250 lost (cancellations + downgrades) → 5% monthly revenue churn
```

Different perspectives. A SaaS losing many small customers but keeping big ones has high logo churn, low revenue churn.

**Annual churn = ~12× monthly** (rough; depends on contract structure).

Benchmarks:
- SMB: 3-7% monthly logo churn (high; SMBs are volatile).
- Mid-market: 1-2%.
- Enterprise: <1%.

## NRR — Net Revenue Retention

The most important SaaS metric.

```
NRR = (Starting MRR + Expansion - Contraction - Churn) / Starting MRR × 100%
```

Track the SAME cohort over a year. NRR > 100% = revenue from existing customers grows year over year. Best SaaS achieves 130-150% NRR.

NRR < 100% = you're losing existing revenue; growth requires constant new customer acquisition (treadmill).

Example:
- Cohort: $1M ARR at start of year.
- End of year: $1.2M from same cohort (expansion of $300K; churn of $100K).
- NRR = 120%.

Means: even with zero new customers, this cohort would grow revenue 20% YoY. Compounding effect makes NRR > 100% extremely valuable.

Top SaaS companies (Snowflake, Datadog) regularly report 120-140% NRR.

## CAC — Customer Acquisition Cost

How much you spend to acquire one customer:

```
CAC = (Sales + Marketing spend) / (New customers acquired)
```

For Q3:
- Sales+marketing spend: $500K
- New customers: 250
- CAC: $2,000

CAC varies by tier:
- Self-serve SMB: $50-500.
- Mid-market: $1K-10K.
- Enterprise: $10K-100K+.

## CAC payback period

How many months for the customer to pay back acquisition cost:

```
CAC payback (months) = CAC / Average MRR per new customer
```

If CAC = $2,000 and average new customer pays $100/month: payback = 20 months.

Benchmark: < 12 months is great; 12-24 is OK; > 24 is bad.

Investors look at this for SaaS valuation. Payback influences how fast you can grow at scale.

## LTV — Lifetime Value

How much a customer pays over their entire relationship:

```
LTV = ARPU × Average lifetime
```

If customer pays $1,200/year and stays 5 years: LTV = $6,000.

Or as a formula:
```
LTV = ARPU / Monthly churn rate
```

Customer paying $100/month with 2% monthly churn:
LTV = $100 / 0.02 = $5,000.

## LTV:CAC ratio

The unit economics signal:

```
LTV:CAC = $5,000 / $2,000 = 2.5
```

Benchmark:
- > 3.0: healthy.
- 1.0-3.0: marginal; depends on growth strategy.
- < 1.0: you lose money on every customer.

Combined with CAC payback: > 3× LTV:CAC + <12mo payback = a great SaaS economically.

## Quick ratio

A simpler health check:

```
Quick ratio = (New + Expansion MRR) / (Churn + Contraction MRR)
```

- > 4: healthy (gaining $4 for every $1 lost).
- 2-4: OK.
- < 2: troubling.

Lets you see if growth is outpacing losses each month.

## DAU / MAU and engagement

Beyond revenue, engagement matters:

- **DAU.** Daily Active Users.
- **MAU.** Monthly Active Users.
- **DAU/MAU ratio.** "Stickiness." 50% = users come back half the days; very engaging product.

Some products (Slack, social apps) have high DAU/MAU; others (annual review tool) have low. Match expectations to product use case.

Low DAU/MAU = users forget the product = eventual churn. Track per-tenant for B2B.

## Cohort retention

Plot retention curves by signup cohort:

```
Cohort Jan 2026:
  Day 1: 100% active
  Day 7: 60%
  Day 30: 35%
  Day 90: 25%
  Day 180: 22%
```

The shape matters more than absolute numbers:
- **Going to zero.** Bad — no one's stuck around.
- **Flat at 30%.** Good — you've found a core audience.
- **Increasing over time** (after dip). Excellent — viral / network effects.

Compare cohorts over time: Q1 2026 cohort vs Q3 2026 — is retention improving as you iterate?

## NPS as a proxy for retention

```
NPS = % promoters - % detractors
```

Survey: "Would you recommend?" 0-10.
- 9-10: promoters.
- 7-8: passives.
- 0-6: detractors.

NPS scores: 0-30 typical; > 30 good; > 50 excellent.

NPS predicts churn somewhat — detractors more likely to churn. Not perfect; usage data is stronger.

## Tools

- **Stripe / Recurly billing.** Built-in MRR reporting.
- **ChartMogul, Baremetrics, ProfitWell.** Dedicated SaaS metrics platforms; pull from Stripe.
- **Amplitude / Mixpanel / PostHog.** Engagement metrics.
- **Internal dashboards.** Eventually you need custom; SQL queries against billing + product DBs.

For early SaaS: ChartMogul / Baremetrics free tiers work. Past $1M ARR, custom analytics typically pays off.

## What boards / investors look at

In order:
1. **MRR / ARR growth rate.** Month-over-month, year-over-year.
2. **NRR.** Compounding.
3. **CAC payback.** Capital efficiency.
4. **LTV:CAC.** Unit economics.
5. **Churn.** Stability.
6. **Gross margin.** Software typically 70-90%.
7. **Burn / runway.** Time until cash out.

Public SaaS metrics (Snowflake, Datadog, HubSpot quarterly reports) are reference benchmarks.

## Mistakes to avoid

- **No MRR tracking.** Decisions in the dark.
- **Optimizing for MRR over NRR.** Growth that doesn't compound.
- **Ignoring CAC.** Lose money on every customer.
- **Tracking metrics monthly only.** Cohort analysis matters.
- **NPS as the only metric.** It's a snapshot of feeling; usage shows reality.

## Summary

- MRR / ARR is the headline.
- Churn split into logo and revenue.
- NRR > 100% is the big win — existing customers grow revenue.
- CAC payback and LTV:CAC measure unit economics.
- Engagement (DAU/MAU) and cohort retention show product-market fit.
- Tools (ChartMogul, Baremetrics) handle calculation.
- Investors and boards focus on growth + efficiency + retention.

Next: compliance.
