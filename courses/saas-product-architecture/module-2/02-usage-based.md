---
module: 2
position: 2
title: "Usage-based billing — metering and aggregation"
objective: "Bill accurately when usage drives price."
estimated_minutes: 5
---

# Usage-based billing — metering and aggregation

## When usage-based makes sense

Pay-per-use aligns price with cost-of-serving. Works when:

- **Resource consumption varies wildly per customer.** API requests, storage, compute, AI tokens.
- **Cost-to-serve scales with usage.** Each unit has real cost.
- **Customers are infrastructure-buyers.** Comfortable with metered billing.

Examples: AWS, OpenAI, Twilio, Datadog (logs/metrics), Stripe (transaction fees).

For traditional SaaS (CRM, project management): per-seat usually better — usage doesn't reflect value as cleanly.

## The metering problem

To bill by usage, you need to count usage accurately. Sounds simple; isn't.

Challenges:

- **High-volume events.** OpenAI gets 100K+ requests/sec; each must be metered.
- **Aggregation.** Sum requests per customer per period.
- **Reliability.** Lost events = revenue lost; double-counted = customer disputes.
- **Latency.** Real-time vs hourly vs daily aggregation.
- **Granularity.** Per-second, per-minute, per-hour rollups.

Building meterworks: significant engineering. Companies like Orb, Metronome, Lago, OpenMeter exist specifically for this.

## Event-based architecture

The standard pattern:

1. **App emits events** for billable units:
```json
{ "tenant_id": "t1", "event_type": "api_call", "quantity": 1, "timestamp": "2026-05-15T14:00:00Z" }
```

2. **Event store** captures (Kafka, Kinesis, etc.).

3. **Aggregator** sums per customer per period.

4. **Billing system** generates invoices from aggregates.

Events must be deduplicated (clients retry; same event might arrive twice). Use event IDs.

## Idempotent metering

Each event has a unique ID (UUID):

```json
{
  "event_id": "uuid-abc-123",
  "tenant_id": "t1",
  "type": "api_call",
  "quantity": 1
}
```

The aggregator deduplicates by event_id. Replaying events (after a bug, lost write) is safe.

## Real-time vs batch

**Real-time.** Aggregate continuously; current usage visible in customer dashboard.

**Batch (daily).** Sum once a day; invoice monthly.

For customer trust (and to enforce quotas), real-time aggregation matters. Customers want to see "you've used 80% of your monthly budget" — that requires current data.

For accounting / invoicing, end-of-period batches are fine. The two can be different paths over the same data.

## Free tiers and tiered usage

Common patterns:

- **Free tier.** First N units free; pay beyond.
- **Tiered.** $0.01/unit for first 1M; $0.005/unit beyond. Volume discounts.
- **Commit + overage.** Prepay 1M units at discount; pay full price for usage beyond.

Billing system must handle the math:

```
Total cost = free tier (0)
           + tier 1: min(usage, 1M) × $0.01
           + tier 2: max(usage - 1M, 0) × $0.005
```

Complex enough that hand-rolling is error-prone. Billing tools (Stripe Billing, Orb, Lago) handle pricing models.

## Metered Stripe Billing

Stripe supports metered pricing:

```javascript
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  {
    quantity: 100,
    timestamp: 'now',
    action: 'increment'
  }
);
```

You report usage; Stripe aggregates; invoices include the metered line. Works for moderate-volume products.

For high-volume (millions of events/day), Stripe's reporting cost adds up; use a dedicated metering service that aggregates and reports daily totals.

## Customer dashboard

Customers want to see:
- Current usage in this billing period.
- Trend (last 30 days).
- Breakdown by feature / endpoint.
- Estimated cost.
- Budget alerts.

Display from your aggregated usage data. Stripe Billing customer portal has basic; rich dashboards are custom.

## Spend caps and quotas

```
"Stop service when monthly bill reaches $500."
"Alert me at 80% of $500."
```

Implementation:
- Aggregate usage; estimate cost.
- Compare to cap.
- Alert / suspend at thresholds.

Suspending service is a contentious choice — customers angry to be cut off; vs surprise $50K bills. Some products offer both options.

## Disputes and accuracy

Customer says "we didn't use that much." Investigation:
1. Audit event logs for the period.
2. Provide breakdown by day / endpoint.
3. Compare to customer's own logs if they tracked.

For high-value disputes: maintain raw event log (not just aggregates) for 90+ days. Reaggregate if needed. Apologize and credit if you can't justify the bill.

Reliability of metering is a customer-trust issue. Errors are remembered.

## Combining models

Hybrid: subscription + usage:

```
Pro plan: $50/mo base + $0.001/API call beyond 100K
```

Common in modern infra SaaS. Base covers core access; usage on top. Customer pays for predictability + variability.

Linear has flat-per-seat. OpenAI is pure usage. Twilio is mostly usage with seat-like elements. Match to your cost structure.

## Mistakes to avoid

- **No event_id.** Replays cause double-counting.
- **Aggregation lag.** Customer dashboard shows wrong info; complaints.
- **Hard-to-explain pricing.** Customers can't predict bills; bounce.
- **No spend caps.** $50K surprise bill drives churn.
- **Manual metering.** Doesn't scale; error-prone.

## Summary

- Usage-based aligns price with cost; great for infra-like products.
- Event-based metering: emit events with IDs; aggregate; invoice.
- Idempotency (event_id dedupe) prevents double-counting.
- Real-time for dashboards; batch for invoices.
- Free tier + tiered pricing common.
- Stripe Billing metered or dedicated services (Orb, Metronome, Lago).
- Spend caps protect customers from surprises.

Next: invoicing, dunning, revenue ops.
