---
module: 5
position: 1
title: "Disputes and chargebacks — what to do when they arrive"
objective: "Build a dispute response workflow that minimizes losses."
estimated_minutes: 9
---

# Disputes and chargebacks — what to do when they arrive

## The puzzle

A customer calls their bank and disputes a charge. The bank temporarily withdraws the funds from you. You have a limited window to respond with evidence. If you win, the funds come back. If you lose, the money's gone — plus a $15-25 dispute fee.

Disputes are a normal part of running a payments business. The question is whether you have a workflow for them or scramble each time.

## The simple version

When a dispute arrives:

1. Stripe fires `charge.dispute.created` webhook.
2. Funds are withdrawn from your Stripe balance.
3. You have ~7-21 days to submit evidence (depends on card network and reason).
4. Stripe forwards your evidence to the issuing bank.
5. Bank decides: won, lost, or warning.
6. If won, funds return.

Most teams lose ~60-80% of disputes. With a good workflow you can win 30-50%.

## The technical version

### Dispute reasons

Banks classify disputes by reason code:

- **`fraudulent`**: customer claims they didn't authorize the charge.
- **`product_not_received`**: customer claims didn't receive what they paid for.
- **`product_unacceptable`**: customer claims product was defective / not as described.
- **`credit_not_processed`**: customer claims a refund was promised but not issued.
- **`subscription_canceled`**: customer claims they canceled but were charged.
- **`general`**: catch-all.
- **`duplicate`**: customer claims charged twice.

Each requires different evidence to win.

### What Stripe does automatically

When a dispute opens:

- Funds withdrawn from your balance.
- Dispute fee ($15-25 depending on region) charged.
- Email + dashboard notification.
- Webhook fires.
- You have a deadline to respond (visible in dashboard).

If you do nothing: you forfeit. Bank rules in customer's favor; you lose the money and the fee.

### Submitting evidence

Via Stripe Dashboard or API:

```js
await stripe.disputes.update("dp_abc123", {
  evidence: {
    customer_email_address: "alex@example.com",
    customer_name: "Alex Chen",
    customer_purchase_ip: "192.0.2.1",
    customer_signature: "fileId_sig",
    product_description: "Premium subscription, 1 month, $20",
    receipt: "fileId_receipt",
    service_documentation: "fileId_service",
    shipping_address: "...",
    shipping_carrier: "USPS",
    shipping_tracking_number: "...",
    uncategorized_text: "Customer used the service for 3 weeks before disputing..."
  }
});
```

Field requirements vary by reason. Stripe's docs detail which fields to fill for each reason code.

### What strong evidence looks like

For **`fraudulent`** disputes:

- IP address at time of purchase.
- Device fingerprint.
- Customer's billing address matches the card's billing address.
- Customer used the product after the purchase (login records, file access).
- AVS / CVC results were positive at the time.

For **`product_not_received`**:

- Shipping proof (tracking, delivery confirmation).
- Customer signature on delivery if available.
- Communication trail showing the product was provided.

For **`subscription_canceled`**:

- Terms of service the customer agreed to.
- Cancellation policy.
- Records of when customer signed up vs. claimed to cancel.
- Evidence of recent product usage.

Weak evidence ("the customer should have read the terms") loses. Specific, dated, traceable evidence wins.

### Workflow: building a dispute response system

Most teams need:

1. **Alert on `charge.dispute.created`**: support team notified immediately.
2. **Auto-collect evidence**: pull customer email, IP, usage logs, payment metadata, terms agreed to.
3. **Submit via API or dashboard**: structured evidence.
4. **Track outcomes**: won/lost/warning per reason; identify patterns.

For high-volume products, automate as much as possible. Stripe's Smart Disputes (Radar add-on, paid) auto-submits evidence based on rules; useful but not magic.

### Disputes are slow

Process:

- Day 0: dispute opens; funds withdrawn.
- Days 1-7: gather evidence.
- Day ~7-21: submit (depending on reason / network).
- Days 30-75: bank reviews.
- Day ~75: outcome.

You won't know for ~2-3 months. Plan cash flow accordingly.

### Reducing disputes upfront

Prevention > response. Patterns that reduce dispute rate:

- **Clear billing descriptors**: your "Acme Inc" descriptor matches your "Acme" brand so customers recognize the charge.
- **Email confirmations**: send receipts immediately so customers don't see a "mystery" charge later.
- **Easy cancellation**: customers who can cancel easily don't dispute.
- **Stripe Radar**: free fraud detection; blocks high-risk attempts.
- **3D Secure for high-risk transactions**: shifts chargeback liability to issuer.
- **Friendly support**: customer service > chargebacks. Refund proactively if user reaches out.

### Chargeback rate consequences

Card networks have thresholds:

- **Visa**: 0.9% dispute rate triggers monitoring.
- **MC**: 1% threshold.

Exceed thresholds: enrolled in dispute monitoring programs, higher fees, eventually loss of merchant account.

Keep dispute rate well below 1%. Most products operate at 0.1-0.3%.

### Won, lost, warning outcomes

When dispute closes:

- **`won`**: bank rules in your favor; funds returned.
- **`lost`**: bank rules against you; funds gone; dispute fee retained.
- **`warning_closed`**: for "warning" disputes (Visa Order Confidence), informational only; no money movement.

Track outcomes:

```sql
SELECT 
  reason, 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as wins,
  ROUND(100.0 * SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) / COUNT(*), 1) as win_rate
FROM disputes
GROUP BY reason;
```

Look for patterns. If "product_unacceptable" has 90% loss rate, you have a product quality issue, not a dispute response issue.

### Refund-vs-dispute economics

When a customer asks for a refund: just refund. Almost always.

Why: a refund costs you the amount + maybe a small fee. A dispute costs you the amount + $15-25 fee + admin time + reputation. Even if you'd "win" the dispute, the math says refund.

Set support team policy: when in doubt, refund. Saves money and goodwill.

### Stripe Radar

Stripe's free fraud-detection system. Scores every charge for risk; blocks high-risk ones automatically. Reduces fraud-driven disputes.

For paid plans:

- Radar for Fraud Teams: manual review queue for borderline cases.
- Smart Disputes: auto-submits dispute evidence.
- Custom rules: block based on your specific patterns.

For most products: free Radar covers it. Move to paid only when dispute volume justifies.

### High-fraud product categories

Some products attract disputes more than others:

- Digital goods (gift cards, in-game items).
- Subscriptions (especially free trials).
- High-ticket items.
- International / cross-border.

For these: aggressive 3DS use, careful KYC, prompt customer service all matter more.

### Mass disputes

If you see a sudden spike in disputes:

- Possible card-testing attack.
- Possible compromised customer data.
- Possible product issue.

Investigate root cause. Stripe support can help if pattern suggests fraud campaign.

## Three real-world scenarios

**Scenario 1: The win rate jump.**
A team's dispute response was ad-hoc. Win rate ~15%. They built an automated evidence-collection workflow: on `charge.dispute.created`, pull customer IP, usage logs, terms version, payment metadata, prepare evidence, alert support. Win rate jumped to ~45%. Saved meaningful revenue.

**Scenario 2: The refund-vs-dispute lesson.**
A customer asked for a refund; team refused (policy was strict). Customer disputed; team won on evidence but spent 4 weeks and $25 fee on what would have been a $30 refund. Updated policy: when customer requests refund in good faith, just refund.

**Scenario 3: The descriptor fix.**
A team's billing descriptor was "PAY*OURCORP-22Q" — looked like random scam to customers. Disputes for "fraudulent" were high. Changed descriptor to their actual brand name + support URL. Disputes from confused customers dropped 70%. Simple fix; outsized impact.

## Common mistakes to avoid

- **Ignoring disputes**: forfeit by inaction.
- **Generic evidence**: doesn't address the specific reason; loses.
- **Refusing refunds before disputes**: more expensive than just refunding.
- **No descriptor matching brand**: customers don't recognize charges; dispute.
- **No dispute tracking**: don't see patterns; can't improve.
- **Letting dispute rate climb**: card networks penalize.

## Read more

- [Disputes overview](https://docs.stripe.com/disputes)
- [Dispute evidence](https://docs.stripe.com/disputes/responding)
- [Stripe Radar](https://stripe.com/radar)
- [Reducing disputes](https://docs.stripe.com/disputes/best-practices)

## Summary

- **Disputes** are inevitable; build a workflow, not panic.
- **Reason codes** determine what evidence wins.
- **Strong evidence**: dated, traceable, specific (IPs, logs, usage records).
- **Refund proactively** for in-good-faith requests; cheaper than disputing.
- **Clear billing descriptor** + email confirmations + easy cancellation prevent disputes.
- **Track win rates by reason** to spot product issues vs. fraud patterns.
- **Stripe Radar** is free baseline fraud detection.

Next: refunds and customer service edge cases.
