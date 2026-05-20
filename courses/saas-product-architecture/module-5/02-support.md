---
module: 5
position: 2
title: "Support and customer success at scale"
objective: "Help customers without burning out the team."
estimated_minutes: 5
---

# Support and customer success at scale

## The two functions

**Support.** Reactive — customer has a problem; you help. Email, chat, phone.

**Customer success (CS).** Proactive — ensure customers get value; reduce churn; identify expansion.

Smaller SaaS combines them; larger separates. The mindset: support solves problems; CS prevents them.

## Support tiers and SLAs

By plan tier:

```
Free: community forum, docs, no direct support.
Pro: email support, 24h response SLA.
Business: priority email, 4h response, Slack channel.
Enterprise: dedicated CSM, 1h response, phone support, SLA guarantees.
```

Each tier is a real customer expectation; back it with staffing. Don't promise enterprise SLAs without on-call.

## Channels

- **Email / ticketing.** Asynchronous; threadable; auditable. Default.
- **Chat (Intercom, Drift).** Real-time; high engagement; staffing-heavy.
- **Community forum.** User-to-user help; reduces volume.
- **Slack channel.** Enterprise-only typically; high-touch.
- **Phone.** Enterprise; high cost; expected for top tier.
- **Docs / KB.** Self-serve; deflects volume.

Mix depends on tier + customer expectations. Most SaaS: docs + email + maybe chat.

## Documentation first

Good docs deflect support volume:

- **Help center / KB.** Searchable; indexed by Google.
- **Status page.** Real-time incident communication.
- **Changelog.** Recent changes.
- **API reference.** For dev tools.
- **Video tutorials.** Especially for visual products.

Tools: Intercom Articles, HelpScout Docs, ReadMe, Mintlify, custom Next.js docs site.

Customers Google their question; finding a doc article answers it; one less ticket. Investment in docs pays back in support savings.

## In-app self-serve

- **Help widget.** Search KB from within app.
- **Inline tooltips.** Explain UI elements.
- **Empty states with guidance.** Already covered.
- **Error messages with help links.** "This failed; here's why and how to fix."

The closer help is to the moment of confusion, the less likely the customer writes a ticket.

## Support tools

- **Zendesk.** Enterprise; full-featured.
- **Intercom.** Combined chat + ticket + product tours.
- **HelpScout.** Email-focused; small-team-friendly.
- **Front.** Shared email inbox.
- **Plain.** Modern; B2B-focused.
- **Linear.** For dev tools; engineering integration.

For early SaaS: a shared inbox (or HelpScout, Plain) is enough. Scale into more sophisticated tooling as volume grows.

## Customer success focus areas

**Onboarding new accounts.** Walk through setup; ensure successful adoption.

**Health monitoring.** Track usage; flag at-risk accounts; intervene before churn.

**QBRs (Quarterly Business Reviews).** Show value; understand strategy; identify expansion.

**Renewals.** Coordinate annual renewal conversations.

**Expansion.** Upsell to higher tier; add seats; cross-sell.

For SMB / mid-market: 1 CSM per 50-100 accounts. Enterprise: 1 per 5-20 accounts.

## Health scores

Quantify customer state:

```
Health = engagement (DAU/MAU) 
       + adoption (% of features used)
       + sentiment (NPS, CSAT)
       + commercial (renewal coming up?)
       - support tickets (high volume = pain)
```

Each weighted; computed nightly. Red / yellow / green categorization. CS prioritizes intervention by health.

Tools: Gainsight, Vitally, ChurnZero — CS-specific. Often pulled into Salesforce / HubSpot.

## Triage and tier-1 vs tier-2

Volume management:

- **Tier 1.** Front-line; handles 80% of common questions; escalates the rest.
- **Tier 2.** Specialists; complex cases.
- **Engineering.** Bug reports; escalated from tier 2.

For small team: everyone wears all hats. For larger: explicit tiers reduce engineering interruption.

## Bug intake from support

Support is the firehose of bug reports. Process:

1. Reproduce / triage in support tool.
2. Mark as bug; create issue in engineering tracker (Linear, Jira, GitHub).
3. Link customer's ticket to the engineering issue.
4. When fixed, notify customer.

Without this loop, customer reports bugs that no one acts on; trust erodes.

## Automation and AI

Modern SaaS support increasingly uses AI:

- **Initial triage.** LLM classifies tickets, suggests resolution from KB.
- **Drafting responses.** Support agent edits AI draft instead of writing from scratch.
- **Auto-resolution.** Simple questions get answered automatically.
- **Sentiment / urgency detection.** Route angry customers to senior agents.

Tools: Intercom AI, Zendesk AI, Forethought, Front AI. Or custom on top of LLMs.

Reduces volume significantly; risk: bad AI responses can frustrate. Keep human in loop for non-trivial.

## On-call and incident response

For technical incidents:

- Pager rotation (PagerDuty, OpsGenie).
- Defined severity levels (Sev1 = production down; Sev4 = minor).
- Customer comms (status page, mass email for Sev1).
- Postmortems for major incidents.

Customers expect transparency. Hiding incidents erodes trust faster than admitting them.

## NPS, CSAT, CES

Customer feedback metrics:

- **NPS (Net Promoter Score).** "Would you recommend?" -100 to +100. Tracks overall sentiment.
- **CSAT.** Per-ticket "how satisfied were you?" 1-5.
- **CES (Customer Effort Score).** "How easy was X?" Lower effort → higher loyalty.

Run quarterly NPS surveys. Tag tickets with CSAT. Investigate patterns in low scores.

## Retention and churn

Why customers leave:
- **Product not solving their problem.** Sales mismatch.
- **Cheaper alternative.** Competitor differentiation.
- **Champion left.** Internal turnover.
- **Bad support experience.** Compounded over time.
- **Strategic.** Acquired; consolidated tools.

Track churn reasons. Build product / process / sales improvements to address top causes.

## Common mistakes

- **No KB.** Same questions repeatedly tied up support.
- **Same SLA for all customers.** Enterprise sees same response time as free; angry.
- **Ignore CSAT trends.** Quiet dissatisfaction.
- **No bug → eng pipeline.** Reports vanish.
- **No on-call.** Customers report incidents you don't know about.

## Summary

- Support (reactive) vs CS (proactive). Combined at small SaaS; separate at scale.
- Tiered SLAs + channels by plan.
- Docs deflect volume; invest early.
- In-app help reduces friction.
- Tools: Intercom, HelpScout, Plain, Zendesk.
- Health scores for CS; intervene on red accounts.
- AI augments support but humans still loop in for complex.
- Track NPS, CSAT, CES; investigate trends.

Next: SaaS metrics.
