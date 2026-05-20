---
module: 2
position: 1
title: "Negative keywords as the steering wheel"
objective: "Filter waste in a broad-match world."
estimated_minutes: 7
---

# Negative keywords as the steering wheel

## Why negatives matter more now

In an exact-match world, negatives were a polish. In a broad-match-default world, negatives are essential infrastructure. They're the constraint that lets broad match be safe.

Broad match expands; negatives trim. Together they form a working pair: expansion brings volume, negatives keep quality. Without negatives, broad match floods the account with irrelevant queries and wastes spend. Without broad, you have less of a problem but also less reach.

Most accounts that complain "broad match doesn't work for us" have inadequate negative lists. The match type isn't the issue; the missing filter is.

## What negatives are and how they work

A negative keyword tells Google: "do not show my ads for queries containing this term." They have their own match types:

- **Negative exact** — `[free shoes]` blocks only the exact query "free shoes."
- **Negative phrase** — `"free shoes"` blocks queries containing "free shoes" in that order.
- **Negative broad** — `free shoes` blocks queries containing both "free" and "shoes" in any combination.

The default and usually best choice is negative phrase. Negative broad can over-filter (blocking valid queries that happen to contain the negative words). Negative exact under-filters (only blocks the literal query).

## Building the initial negative list

Before launching a broad match campaign, build categories of negatives:

**Job and employment terms** (unless you're hiring):
- jobs, careers, salary, hiring, recruiter, glassdoor, resume

**Free/cheap/DIY** (unless that's your product):
- free, cheap, discount, coupon, diy, how to make

**Information-only intent**:
- what is, how to, definition, meaning, examples (often)

**Competitor brand names** — if you don't want broad to drift into bidding on them.

**Out-of-scope categories** — for a B2B SaaS, words like "personal," "individual," "consumer."

**Wrong-context homonyms** — Apple (the software company) negating apple-the-fruit terms (pie, juice, recipe).

**Geographic exclusions** — if you serve US only, "UK," "Australia," "Canada" as negatives.

**Government, education, etc.** — if your offer doesn't apply to those sectors, exclude.

For an account starting from scratch, expect to launch with 100-200 negatives in your initial list. After 30 days of broad match running, expect to add another 50-100.

## Where to put negatives

Three levels:

**Account-level negative keyword lists.** Apply to many or all campaigns. Use for terms you never want to match anywhere (jobs, careers, "free," competitor brands).

**Campaign-level negatives.** Apply within one campaign. Use for campaign-specific exclusions (e.g., excluding "training" from a campaign that's not about training but the keyword expansion might drift there).

**Ad group-level negatives.** Apply within one ad group. Use for very specific intent isolation (rare).

A clean structure: one or two account-level negative lists (general account exclusions, competitor exclusions) plus targeted campaign-level lists. Avoid duplicating across levels.

## Common account-level negative list structures

Most well-run accounts have at least:

1. **"Universal Negatives"** — never want these queries: jobs, careers, free, cheap, coupon, DIY, how to make, etc.
2. **"Competitor Brands"** — if you don't want to bid on competitor names via broad match expansion.
3. **"Out of Geography"** — country/region negatives if you serve a single region.
4. **"Sensitive / Compliance"** — terms you've been told by legal to avoid (e.g., medical claim terms).

Some accounts add:

5. **"Information-only Queries"** — when you're optimizing for purchase intent, not content.
6. **"Brand Self-Exclusions"** — if you don't want to bid on certain branded queries (login, support, etc., where you don't want to pay for existing customers).

## The Search Terms report workflow

The Search Terms report is your primary tool for managing negatives ongoingly:

1. Open the Search Terms report weekly (per campaign or account-wide).
2. Sort by impressions descending.
3. Scan for queries that aren't your target intent.
4. Click "Add as negative" — choose the appropriate level (campaign, ad group, list).
5. Choose negative phrase match by default; negative broad if confident; negative exact rarely.
6. Repeat for any other low-quality queries.

A 15-minute weekly session catches 90% of waste. Skipping this is how broad-match accounts bleed money.

## Search Terms report has gaps

Since 2020 privacy changes, Google aggregates low-volume queries in the Search Terms report. You won't see every query that triggered your ad. Specifically:

- Queries from very few users are aggregated as "Other."
- High-impression, high-spend queries are usually visible.
- Long-tail one-off queries are hidden.

What you can see is the spend-relevant subset. That's enough for managing the bulk of waste. You can't audit every penny but you can audit the relevant majority.

## Negative match type pitfalls

**Over-broad negative.** Negating `cheap` as broad match blocks "cheap running shoes" but also "cheapest insurance" — sometimes good, sometimes not. Default to negative phrase unless you're sure.

**Conflicting negatives.** Adding "running" as a campaign negative when your keyword is "running shoes" — blocks your own campaign. Audit before saving.

**Stale negatives that block valid queries.** A negative added 3 years ago for a discontinued product line might now block queries you'd want to match. Periodically review and prune.

**Forgetting to negate symbols/punctuation issues.** Sometimes specific symbols cause weird matches; check the Search Terms data.

## Negative for query intent shifts

Sometimes the same words mean different things to different users. "Mortgage" might mean:

- Looking for a mortgage (buyer intent).
- Studying mortgages (informational).
- Looking for help with an existing mortgage (servicing).
- Mortgage industry news.

If you only serve one segment, negatives separate the intents. "Mortgage news," "what is a mortgage," "mortgage definition" might all be negatives for a buyer-focused account.

## Negative keyword lists best practices

- Name negative lists clearly: "Universal Negatives - Account," not "List 1."
- Document why a term is on the list — saves future you from re-adding or removing without context.
- Quarterly review of negative lists; remove obsolete terms.
- Test removing negatives if you suspect they're over-filtering — pause for 14 days, observe.

## When NOT to add a negative

Counter-intuitively, sometimes a query you don't immediately recognize as valuable is actually performing. Before negating, check:

- Is the query converting? Sometimes weird-looking queries convert well.
- Is the click cost so low that the wasted impression isn't material?
- Could this represent a new audience segment worth understanding?

Don't reflexively negate everything that doesn't match your mental model. Sometimes the algorithm found something you didn't expect.

## Bulk negative management

For accounts with hundreds of negatives, manage at scale:

- Use Google Ads Editor (desktop tool) for bulk negative management.
- Export negative lists as CSV; review/edit/re-upload.
- Use the API for programmatic management (very high-volume accounts).

A 5-account agency with 500 negatives each needs the bulk tools. A single-account advertiser can manage in the UI.

## Mistakes to avoid

- **Broad match with no negatives.** Recipe for waste.
- **Skipping the weekly Search Terms review.** Negatives are continuous work.
- **Negative broad without thinking.** Over-filters easily.
- **Duplicating negatives across levels.** Maintenance nightmare.
- **Reflexively negating new queries.** Some are signals worth understanding.

## Summary

- Negatives are infrastructure in a broad-match world.
- Build a baseline negative list before launch (jobs, free, info-intent, out-of-scope, etc.).
- Default to negative phrase match.
- Use account-level negative lists for universal terms; campaign-level for specific.
- Search Terms report weekly is the ongoing discipline.
- Audit and prune lists quarterly.

Next: search themes vs keywords (Performance Max).
