---
module: 4
position: 3
title: "Conversion value and bidding signals"
objective: "Beyond binary conversions — value, margin, LTV."
estimated_minutes: 7
---

# Conversion value and bidding signals

## Why values matter

A conversion isn't a conversion. A $20 sale and a $2,000 sale both count as "1 conversion" in a count-based system, but they're not equal to your business. Smart Bidding can only optimize for the difference if you tell it.

Sending a conversion value with every conversion enables tROAS (Target Return on Ad Spend) bidding — the system bids more aggressively on auctions predicted to drive higher-value conversions and less on low-value ones.

For e-commerce: this is the difference between optimizing for "buyers" and optimizing for "high-value buyers." Massive performance impact.

## Static vs dynamic values

Two ways to send values:

**Static value per conversion type.** "Every Purchase is worth $100." Simple to set up; misses real-world variation. Useful as a starting point.

**Dynamic value per conversion.** Send the actual order subtotal or actual deal size per conversion event. Real value reflects actual revenue. Required for tROAS to work properly.

E-commerce should always send dynamic values. The order subtotal is right there in the checkout — capture it and pass to the conversion fire.

Lead-gen has more flexibility: send average deal value × close rate, send tier-based values (small lead = $50, medium = $200, enterprise = $1,000), or use offline conversion adjustments to update values as leads progress through the funnel.

## Conversion value in tROAS

tROAS bids to achieve a target ratio of revenue to spend. If you set tROAS = 400%, the system aims for $4 in revenue per $1 spent.

How the math works per auction:

- System predicts conversion probability × predicted conversion value for this auction.
- Multiplies by your tROAS target to get the max bid.
- Bids that amount (or below if competition is light).

For this math to work, conversion values need to be accurate. Wrong values produce wrong bids. Send $1 when it's really $100 = system under-bids; send $100 when it's really $1 = system over-bids.

## Margin-based values

Revenue isn't margin. A $200 sale on a high-margin product vs a $200 sale on a low-margin product are different to your business. tROAS with raw revenue treats them equally.

Two ways to optimize for margin:

**1. Send margin as the value.** Instead of revenue, send the gross margin per conversion. tROAS now optimizes for margin-per-dollar-spent. Cleanest if your margin data is accessible at conversion time.

**2. Adjust values by margin tier.** Use custom labels in your product feed or conversion data to tag products by margin tier; send adjusted values reflecting margin contribution.

Most e-commerce accounts start with revenue values and move to margin-based once basic setup is in place. The maturity progression: count → revenue → margin → margin × LTV.

## LTV-based values

For subscription, repeat-purchase, and high-LTV businesses, the first purchase doesn't represent the customer's true value. A $50 first order from a customer who'll buy 10 times over 2 years is worth ~$500, not $50.

Implementations:

- **Predicted LTV per acquisition.** Send the predicted lifetime value at first conversion instead of the immediate revenue.
- **Customer cohort segmentation.** Tag customers by predicted LTV tier; pass tier-based values.
- **Subscription-specific.** For SaaS, send the predicted contract value × renewal probability rather than first-month payment.

LTV-based bidding requires data science work — building the LTV model, integrating it with the conversion pipeline. ROI is high for businesses with significant LTV variance and repeat-purchase patterns.

## New customer vs existing customer values

For e-commerce specifically, a new customer is more valuable than a repeat purchase (new customers grow your customer base; repeats don't). You can signal this to Smart Bidding:

- **New Customer Acquisition mode** (covered Module 3 for PMax) prioritizes net-new.
- **Customer-tier conversion values.** Send higher values for first-time buyers than for repeats — e.g., new customer = revenue + acquisition bonus.

This shifts Smart Bidding toward acquisition over retention. For brands focused on growth, this is correct. For brands in stable maintenance mode, less critical.

## Conversion adjustment

You can update conversion values after the fact. The **Conversion Adjustment API** lets you:

- **Restate** a conversion's value (lead worth $50 → became deal worth $5,000).
- **Retract** a conversion (refunded, returned, fraudulent).
- **Update timing** for offline conversions arriving late.

For B2B with long sales cycles: conversion at lead submission with placeholder value, then adjustment when the lead progresses through stages. Smart Bidding gets increasingly accurate signal as the journey unfolds.

For e-commerce: retract refunded conversions so the system doesn't optimize toward orders that get returned.

## Sending values via different methods

Methods to attach values to conversions:

- **gtag.js** — `gtag('event', 'conversion', { value: 199.99, currency: 'USD', transaction_id: 'ORDER123' })`.
- **GTM** — capture order value from dataLayer in the conversion tag.
- **Server-side** — push the conversion event from your backend with value.
- **Offline import** — CSV or API upload with value column.
- **Adjustment API** — update existing conversions' values.

Pick the method that fits your stack. Server-side and offline tend to have the cleanest value data because you're pulling from order records, not relying on client-side JS.

## Currency hygiene

Every conversion needs the correct currency code (ISO 4217 — USD, EUR, GBP, JPY, etc.). Wrong currency = wrong value interpretation.

Multi-currency accounts:

- Send each conversion with its actual transaction currency.
- Google converts to your account currency for reporting.
- Smart Bidding uses the actual values for bidding.

Common bug: sending all conversions in USD when actual transactions are in mixed currencies. Inflates USD-equivalent revenue if the account default is a weaker currency, deflates if stronger.

## Transaction IDs and deduplication

Always send a unique transaction ID per conversion. Google uses it for:

- Deduplicating between pixel and offline imports.
- Identifying refunds for adjustment.
- Cross-system reconciliation.

Use your e-commerce platform's order ID (Shopify order number, Stripe charge ID, etc.). Don't generate ad-hoc IDs.

## Quality checks

Periodically verify:

- Conversion values look reasonable (median value matches typical AOV).
- Currency is correct.
- Transaction IDs unique (no duplicates).
- Refunds/cancellations getting retracted.
- Long-tail high-value conversions captured (not truncated by some pipeline error).
- Values fired aren't inflated or zero.

A 5-minute spot check monthly catches most issues. Run it.

## Mistakes to avoid

- **Sending count without value** when value tracking is possible.
- **Static value when dynamic available.** Loses per-impression value-bidding signal.
- **No refund handling.** System optimizes toward orders that get returned.
- **Wrong currency code.** Misvaluation across markets.
- **Including tax/shipping in value where not appropriate.** Inflates revenue; affects margin.

## Summary

- Send dynamic conversion values per event for tROAS to work.
- Revenue → margin → LTV is the maturity progression.
- New-customer values can prioritize acquisition over retention.
- Use Conversion Adjustment API for value updates after the fact.
- Always send transaction ID and correct currency.
- Quality-check value data monthly.

Next: incrementality on Google.
