---
module: 5
position: 1
title: "Account structure — fewer campaigns, cleaner signal"
objective: "Build an account the algorithm can read."
estimated_minutes: 7
---

# Account structure — fewer campaigns, cleaner signal

## The old vs new playbook

The 2018 playbook was complex account structures: many campaigns, many ad sets per campaign, deep audience segmentation, granular budget allocation. It worked when you had to do the targeting work the algorithm now does.

The 2026 playbook is the opposite: few campaigns, few ad sets, broad audiences, creative variety inside. Fewer moving parts, more consolidated signal, less manual labor.

The structural shift mirrors the algorithmic shift. Meta's ML is strong enough that consolidation usually beats fragmentation.

## The minimum viable account

For a single-product DTC brand:

- **1 Advantage+ Shopping Campaign** as the primary acquisition vehicle. CBO budget. 8-15 ads. Existing-customer cap set.
- **1 retargeting campaign** with 1-2 ad sets (cart abandoners, site visitors). 3-5 ads.
- **1 brand campaign** for new launches or seasonal pushes, often paused outside campaigns.

That's it. Three campaigns total for an account spending $10k-$100k/month. Anything more is usually structural complexity without performance benefit.

For multi-product brands, scale this structure per product or per category — same shape, replicated.

## Why fewer campaigns wins

Consolidation helps in three ways:

**Better learning.** Concentrating budget into fewer ad sets means each ad set hits the 50-event learning threshold. Fragmenting across 8 ad sets at $30/day means none does.

**Less audience overlap.** Multiple prospecting ad sets in the same campaign or account often overlap 30-70%. They bid against each other, fragment delivery, and confuse the algorithm.

**Clearer signal.** Reading 3 campaigns is faster than reading 30. You see what's actually happening at a glance.

**Less drift.** Fewer campaigns means fewer places to forget to update — exclusions, creative refreshes, budget changes.

## When to add structure

Some legitimate reasons to split into separate campaigns:

**Different products with different margins.** A $20 product and a $200 product need different target CPAs; running them in one campaign forces a compromise CPA target.

**Different geos with different performance.** US vs UK in one campaign averages performance; splitting lets you allocate per-market.

**Different offer types.** Lead-gen and direct-purchase shouldn't share a campaign — different optimization events, different funnel logic.

**Different audiences that genuinely don't overlap.** B2B-by-job-title and broad-consumer are different vehicles.

**Different budgets you need to enforce.** When CFO mandates "spend exactly $X/mo on Brand Y," CBO across products doesn't enforce that — separate campaigns do.

None of these reasons is "I want more granularity for reporting." That's not a structural justification; you can break down a single campaign's performance via ad-level reporting.

## ABO vs CBO

Two budget allocation models:

**ABO (Ad Set Budget Optimization):** you set a budget per ad set; Meta optimizes within each ad set. Useful when you must enforce minimum spend per ad set.

**CBO (Campaign Budget Optimization):** you set a campaign-level budget; Meta moves spend across ad sets dynamically toward whichever is performing best.

CBO has been the default direction since 2019 and is now the standard for most cases. Reasons:

- Auto-reallocation toward winners without manual intervention.
- Less manual budget micromanagement.
- Better total-campaign efficiency.

ABO is still useful for:

- Testing specific audiences at controlled spend (so testing budget doesn't get starved by winners).
- Enforcing minimum spend per market or per audience.
- When you don't trust CBO's allocation pattern (rare; usually CBO wins).

For most accounts: CBO by default; ABO only with a specific reason.

## Naming conventions

A consistent naming convention makes reporting and audits dramatically easier. A common pattern:

`<Channel>_<Objective>_<Audience>_<Creative-batch>_<Date>`

Example: `Meta_Purchase_Broad-US_Aug-Hooks-Test_2026-08-01`

What matters:

- Objective in the name (so you can filter by campaign goal).
- Audience shorthand (so you can scan for who's being targeted).
- Date or batch (so you can identify when something launched).

Don't worry about perfectionism — pick a convention and use it consistently. The compounding benefit is being able to read a column of 30 campaign names and know what each is.

## Folder organization

For accounts with many campaigns:

- Group campaigns by **product line** or **brand** in your mental model.
- Use **labels** in Ads Manager (where available).
- Build **saved filters** in Ads Manager for common views ("active prospecting only," "retargeting only").

The goal: 30 seconds to find any campaign and know its status.

## Lifecycle management

A campaign's life:

1. **Launch** — first 7-14 days, expect learning phase, don't over-tweak.
2. **Optimize** — weeks 2-12, creative iteration at ad level, audience hygiene.
3. **Scale** — proven campaign hits production rhythm.
4. **Decay** — frequency rises, creative library exhausts, CPA drifts up.
5. **Retire or refresh** — either kill the campaign and consolidate, or refresh creative library and reset.

Stage 5 is where most accounts hesitate. A long-running campaign with sunk effort feels valuable; the data may say it's dead. Be willing to kill campaigns that have decayed.

## When to kill a campaign

Clear signals:

- CPA persistently 30%+ above target for 14+ days despite new creative.
- Frequency consistently >7-8 across the library.
- Best ads degraded; new ads underperform older ones.
- ROAS below break-even for 14+ days.

Killing isn't failure — it's letting budget flow somewhere with more headroom. Lose the sunk-cost attachment.

## Account hierarchy basics

- **Business Manager** (top): one per business; holds all assets.
- **Ad Account(s)**: where you run ads; usually one per market/business unit.
- **Campaigns**: objective-level container.
- **Ad Sets**: audience + budget + schedule + placement container.
- **Ads**: creative + copy + link container.

Keep this hierarchy clean. One Business Manager, ideally one ad account per market, campaigns per objective, ad sets per audience-distinction-that-matters, ads per creative variation.

## Domain verification and pixel ownership

For AEM and CAPI to work cleanly:

- Verify each conversion domain in Business Manager (DNS or HTML tag).
- Pixel should be created in Business Manager (not personal account) and shared with the ad account.
- Pixel ID matches the events you're firing.
- Custom conversions are owned by the right account.

These are unglamorous but skipping them means measurement breaks.

## Mistakes to avoid

- **Too many campaigns** ("one campaign per audience segment") — fragmentation, learning starved.
- **Inconsistent naming** — can't read your own account at scale.
- **ABO when CBO would work** — manual budget micromanagement.
- **Never killing decayed campaigns** — sunk-cost.
- **Pixel and domain hygiene neglected** — measurement degrades silently.
- **Splitting by reporting need** instead of structural need — use breakdowns, not campaigns.

## Summary

- Few campaigns, broad audiences, creative variety inside.
- Minimum viable: 1 ASC prospecting + 1 retargeting + 1 brand/seasonal.
- CBO is the default budget model; ABO has specific use cases.
- Naming convention pays off in audit speed.
- Kill decayed campaigns; don't accumulate them.
- Domain verification and pixel hygiene are foundations.

Next: the daily/weekly/monthly operating rhythm.
