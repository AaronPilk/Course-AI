---
module: 2
position: 3
title: "Invoicing, dunning, and revenue ops"
objective: "Get paid reliably; recover failed charges."
estimated_minutes: 5
---

# Invoicing, dunning, and revenue ops

## The invoicing lifecycle

For each billing period:

1. **Calculate.** Aggregate usage; apply pricing model; compute total.
2. **Invoice.** Generate document; send to customer.
3. **Charge.** Auto-charge card / debit / wire.
4. **Receipt.** Confirm payment to customer.
5. **Failure path** (dunning) if charge fails.
6. **Revenue recognition.** Internal accounting.

Most SaaS use Stripe / Recurly / Chargebee to handle this end-to-end. DIY billing is a long road.

## The invoice itself

```
Acme Corp
Invoice #2026-05-001234
Period: May 1 - May 31, 2026

Pro Plan (5 seats × $20)        $100.00
API usage (1.2M @ $0.001/1K)      $1.20
Tax (8%)                          $8.10
─────────────────────────────────────
Total                           $109.30

Auto-charged: Visa ending 1234
Due: 2026-06-01
```

Standard fields: line items, subtotal, tax, total, payment method, due date. PDFs commonly attached. Email includes the invoice + link to customer portal.

## Auto-charge

For subscription customers, charge automatically on the billing date. Card on file; charge runs; succeed → receipt. Fail → dunning.

For invoiced customers (B2B, NET-30): generate invoice; email; wait for customer to ACH / wire / pay via portal. Manual workflow; longer cycles.

## Dunning — failed payment recovery

Card declines happen (expired card, insufficient funds, fraud detection). Industry: 5-15% of charges fail on first attempt.

Without dunning: customer's service stops; you lose revenue silently. With dunning: structured retry + communication recovers most failures.

Standard dunning sequence:
1. **Day 0.** Charge fails; email customer + retry in 3 days.
2. **Day 3.** Retry; if fails, retry in 5 days + escalate email.
3. **Day 8.** Retry; if fails, retry in 7 days + warning email.
4. **Day 15.** Final retry; if fails, suspend service.
5. **Day 30.** Cancel subscription; archive.

Tools (Stripe Smart Retries, Recurly, Churnly) handle this. Recovers 50-70% of failed payments.

## Card update flows

When a card is about to expire:
- Stripe / similar offer "account updater" services that auto-fetch new card numbers from card networks (Visa/Mastercard programs).
- Email customers reminders 30 days before expiry: "Your card on file expires soon."
- Make updating cards frictionless in the customer portal.

Reducing card failures saves more revenue than aggressive retry on already-broken cards.

## Tax compliance

Sales tax / VAT is complex; varies by jurisdiction:
- **US.** States, counties, cities. Each charge in a state may incur sales tax based on customer location, your nexus, product type.
- **EU.** VAT; 27 countries; rates 17-27%; reverse-charge for B2B in some cases.
- **Other countries.** GST in India/Canada/Australia; various.

Stripe Tax, Avalara, TaxJar automate this — calculate tax per transaction based on customer location and your registration status; remit to tax authorities.

For early SaaS: enable Stripe Tax (or equivalent) on day one. Reverse-engineering compliance later is painful.

## Revenue recognition

Accounting: when can you recognize revenue?

- **Cash basis.** Recognize when paid. Simple; not GAAP-compliant for many cases.
- **Accrual.** Recognize as earned. For annual contracts, recognize 1/12 per month.

For SaaS subscriptions: typically accrual. Customer prepays $1200 for annual; you defer $1200; recognize $100/month for 12 months. Deferred revenue on balance sheet decreases as you "earn" it.

Tools: Stripe Revenue Recognition, Pilot / Bench bookkeeping integrations. Required for any company past ~$1M revenue thinking about audits / fundraising.

## Refunds and credit

Customer disputes / cancels mid-period:
- **Refund.** Full or partial return of payment. Reverses revenue.
- **Credit.** Future-period reduction. No cash out.

Most SaaS prefer credits (no cash hit); customers prefer refunds.

Implementation: link refund/credit to original transaction; track in customer's account; apply automatically on next invoice if credit.

## Chargebacks

When customer disputes the charge with their bank (vs requesting refund from you):
- Bank reverses the charge.
- You're charged a chargeback fee ($15-$50).
- Your "chargeback ratio" affects card processing eligibility.

Defend with evidence (terms, usage logs, support tickets). High ratio (>1%) leads to account warnings / shutdown by Stripe.

Patterns to reduce:
- Clear cancellation flow (so customers don't dispute as the only escape).
- Easy refund policy (cheaper than chargeback fees).
- Receipts that customers recognize ("YourCompany" not generic descriptor).

## SaaS metrics from billing

Key numbers:
- **MRR (Monthly Recurring Revenue).** Predictable revenue per month.
- **ARR.** MRR × 12.
- **Churn.** % customers who cancel per month.
- **Net revenue retention.** Of last quarter's customers, what's their MRR this quarter (including expansions, minus churn).
- **CAC payback period.** How long to recoup customer acquisition cost.

Stripe dashboard shows many. ChartMogul, Baremetrics, ProfitWell are dedicated SaaS metrics platforms.

## Customer portal

Customers want self-service:
- Update card.
- See invoices / receipts.
- Change plan.
- Cancel.

Stripe Customer Portal handles all of this with a hosted UI; embed in your app via a button.

Self-service reduces support load + churn (no friction to update card = no involuntary churn from expired cards).

## Internal billing dashboards

For your team:
- Total MRR / ARR.
- New / expansion / churn / contraction MRR.
- Top accounts (revenue concentration).
- Failed payments awaiting recovery.
- Plan distribution.

For finance / leadership; usually pulled into Looker / Mode / spreadsheets.

## Mistakes to avoid

- **No dunning.** Failed payments = silent revenue loss.
- **No tax compliance.** Surprise audits + penalties later.
- **Manual revenue recognition.** Doesn't scale; error-prone.
- **Confusing invoices.** Customers can't understand the bill; dispute.
- **No customer portal.** Every change is a support ticket.

## Summary

- Invoicing lifecycle: calculate → invoice → charge → handle failures.
- Dunning recovers 50-70% of failed payments.
- Stripe / Recurly / Chargebee handle most plumbing.
- Tax compliance is real; use automation (Stripe Tax, Avalara).
- Revenue recognition for accrual: monthly recognition of prepayments.
- Customer portal for self-service (Stripe Customer Portal works).
- Track MRR, churn, net revenue retention.

Next: Stripe Billing integration.
