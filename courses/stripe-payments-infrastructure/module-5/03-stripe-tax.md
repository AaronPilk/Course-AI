---
module: 5
position: 3
title: "Stripe Tax and compliance basics"
objective: "Enable tax collection in the regions you operate."
estimated_minutes: 8
---

# Stripe Tax and compliance basics

## The puzzle

Sales tax. VAT. GST. Each jurisdiction has its own rates, rules, thresholds, and registrations. The US alone has thousands of taxing jurisdictions; the EU has 27 countries with VAT; the UK / Canada / Australia / India / Japan all have their own systems. Doing this manually is hopeless for an internet business.

Stripe Tax automates the collection part. This lesson is how it works and what you still need to do yourself.

## The simple version

Stripe Tax:

1. Auto-detects customer's tax location based on address.
2. Calculates the correct rate for that location + your product type.
3. Adds tax to the invoice / Checkout total.
4. Tracks your tax liability over time.
5. Helps with filing reports for each jurisdiction.

What Stripe Tax DOESN'T do:

- File your taxes (you still file).
- Register you in jurisdictions (you do that).
- Determine your nexus / obligation (your accountant does).

## The technical version

### Enabling Stripe Tax

1. **Dashboard → Tax → Settings**: enable Stripe Tax.
2. **Configure your origin**: business address, where you're registered to collect tax.
3. **Add jurisdictions where you have nexus**: places you must collect tax.
4. **Configure product tax codes**: digital service, SaaS, physical good, etc.

Once enabled, Stripe automatically calculates tax on every charge.

### How tax calculation works

Stripe Tax considers:

- **Customer's location** (billing address, IP, payment method origin).
- **Product type** (tax code).
- **Your nexus** (where you've registered).
- **Jurisdiction rules** (rates, exemptions, thresholds).

Result: the right tax amount added to the charge.

### On Checkout

```js
await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [...],
  automatic_tax: { enabled: true },
  customer: customer.id,
  // OR collect tax address on the page:
  billing_address_collection: "required",
  ...
});
```

`automatic_tax: { enabled: true }` flips on the tax calculation. Checkout collects the billing address (required for tax) and calculates.

### On PaymentIntents

```js
await stripe.paymentIntents.create({
  amount: 2000,
  currency: "usd",
  customer: customer.id,
  automatic_tax: { enabled: true }
});
```

Customer must have an address on file. Tax is calculated and the total amount adjusted.

### On Subscriptions

```js
await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: planPrice.id }],
  automatic_tax: { enabled: true }
});
```

Each recurring invoice auto-calculates tax based on current customer location + jurisdiction rates.

### Tax codes

Each Product gets a tax code:

```js
await stripe.products.create({
  name: "Pro Plan",
  tax_code: "txcd_10103000"  // SaaS — Business Use
});
```

The tax code tells Stripe what kind of product this is. Different codes have different rates and rules per jurisdiction. Stripe provides hundreds of codes for common product types.

If you don't set a code, Stripe defaults to a general tax code.

### Tax in invoices

Invoices show tax separately:

```
Pro Plan ............ $20.00
Tax (8.25%) ......... $1.65
Total ............... $21.65
```

Customers see what's tax vs. product. Required in many jurisdictions.

### Customer tax exemptions

Some customers are tax-exempt (non-profits, government, etc.):

```js
await stripe.customers.update("cus_abc", {
  tax_exempt: "exempt",  // "none" | "exempt" | "reverse"
  tax_id_data: [
    { type: "us_ein", value: "12-3456789" }
  ]
});
```

Stripe applies the exemption automatically.

### Reverse charge (EU B2B)

In EU B2B, customers with valid VAT IDs get "reverse charge" — they handle the VAT, you don't collect:

- Customer adds their VAT ID.
- Stripe validates via VIES (free).
- If valid: no VAT charged; invoice says "reverse charge."
- If invalid: VAT charged normally.

For SaaS selling B2B in EU: enable this. Reduces compliance burden.

### Nexus and registration

Stripe doesn't know where you have nexus. You do:

- **US**: nexus rules vary by state (some have economic thresholds; physical presence triggers it).
- **EU**: registered businesses charge VAT in their jurisdictions; OSS (One Stop Shop) consolidates EU filings.
- **UK / Canada / Australia**: each have their own thresholds.

Talk to your accountant. Register in jurisdictions where you have nexus. Tell Stripe Tax which jurisdictions you're registered in.

Stripe will warn you about jurisdictions where you might owe but haven't registered.

### Thresholds

Many jurisdictions have economic nexus thresholds:

- **US states**: typically $100K or 200 transactions/year (varies by state).
- **EU**: €10K/year cross-border threshold for OSS.

Below threshold: usually no obligation. Above: you must register.

Stripe Tax tracks your transactions per jurisdiction, alerts you when approaching a threshold.

### Filing taxes

Stripe Tax helps with reporting:

- **Tax reports** in dashboard show what you collected per jurisdiction.
- **Export to CSV / accounting tools** (QuickBooks, Xero).
- **TaxJar / Avalara integration** for automated filing.
- **Stripe Tax filing service** (in some regions) handles filings for you.

You're still responsible for filing on schedule. Stripe makes the data accessible.

### Cost

Stripe Tax costs a small percentage of transactions where tax is calculated (~0.5% in 2026, check current).

For most businesses, far cheaper than Avalara / TaxJar / staffing a tax compliance team.

### Configuration mistakes

Common errors:

- **No tax code on products**: Stripe applies default; might be wrong tax rate.
- **No customer address**: Stripe can't calculate; charge fails or uses fallback.
- **Wrong origin**: tax calculated as if you're somewhere else.
- **Missing nexus configuration**: Stripe charges tax but you can't legally collect (you didn't register).

Audit periodically: are tax codes right, are addresses being collected, are jurisdictions configured?

### Audit trail

Stripe Tax maintains:

- Tax calculation per charge.
- Customer location used.
- Product tax code applied.
- Rate breakdown by jurisdiction (state + county + city).

Auditable. For tax audit, this is your evidence.

### Reconciliation with accounting

Reconcile monthly:

- Stripe Tax report total per jurisdiction.
- Your accounting system's record.
- Filed amounts.

Discrepancies should be investigated immediately.

### When not to use Stripe Tax

- **Single jurisdiction with simple rates**: maybe overkill; manual rate is fine.
- **Very specific industry exemptions**: Stripe Tax handles common cases; super niche industries (alcohol, tobacco, specific medical) might need specialized tools.
- **Already integrated with TaxJar / Avalara**: stay there unless migrating intentionally.

For SaaS / e-commerce / digital goods serving multiple jurisdictions: Stripe Tax is the right answer.

### Beyond Stripe Tax

Stripe Tax covers sales tax / VAT / GST. Doesn't cover:

- **Income tax**: your business's profit tax (separate system).
- **Payroll tax**: employee-related (separate system).
- **Specialty taxes** (alcohol, tobacco, fuel): often need separate tools.

For most internet businesses, sales tax is the immediate compliance burden — Stripe Tax handles it.

## Three real-world scenarios

**Scenario 1: The pre-Stripe-Tax mess.**
A team had customers in 30 states. They manually calculated tax based on customer's state, hard-coded rates, updated quarterly. Errors accumulated. Stripe Tax replaced the whole system in two weeks of integration. Tax compliance became automatic.

**Scenario 2: The EU OSS rescue.**
A team selling to EU consumers crossed the €10K cross-border threshold. Realized they owed VAT in many countries. Enabled Stripe Tax + registered for OSS in their home country. Stripe collected the right VAT per country; OSS lets them file once instead of per-country.

**Scenario 3: The missing nexus warning.**
A team's Stripe Tax was charging California sales tax. Their accountant flagged: they weren't registered in California. Either they shouldn't have been collecting, or they should register. Stripe Tax surfaces this; team registered properly to be compliant.

## Common mistakes to avoid

- **No tax setup at all** — illegal in many jurisdictions once you have nexus.
- **Manual tax tables** — out of date in weeks; errors compound.
- **Charging tax without registration** — illegal in some jurisdictions.
- **No tax code on products** — wrong rates applied.
- **Ignoring threshold alerts** — surprise registrations and back-filings.
- **Not reconciling with accounting** — surprises at tax filing time.

## Read more

- [Stripe Tax](https://docs.stripe.com/tax)
- [Tax codes reference](https://docs.stripe.com/tax/tax-codes)
- [EU OSS](https://docs.stripe.com/tax/registering/eu-oss)
- Talk to your accountant.

## Summary

- **Stripe Tax** automates calculation per jurisdiction + product type.
- **Enable on Checkout / PaymentIntents / Subscriptions** with `automatic_tax: { enabled: true }`.
- **You configure** your origin + jurisdictions where you have nexus.
- **Tax codes** classify products; pick the right one per Product.
- **Reverse charge** for EU B2B with valid VAT IDs.
- **You still file** taxes; Stripe makes the data and reports easy.
- **Threshold alerts** when you cross jurisdiction registration thresholds.
- **Talk to your accountant** — Stripe Tax is the tool; compliance strategy is yours.

Next: the Stripe production checklist.
