---
module: 2
position: 4
title: "Exclusions and audience hygiene"
objective: "Stop wasting spend on the wrong people."
estimated_minutes: 7
---

# Exclusions and audience hygiene

## The unglamorous work

Targeting setup gets all the attention; audience hygiene is what separates accounts that scale from accounts that plateau. Hygiene means three things: excluding people you shouldn't reach, keeping audiences sized for stable delivery, and refreshing seeds so the algorithm learns from current behavior, not historical.

Most underperforming accounts have audience hygiene issues. Most well-performing accounts run quiet, well-pruned audience setups.

## What to exclude from prospecting

Default exclusions for any acquisition campaign:

- **Past purchasers** (last 60-180 days, depending on repeat-purchase cycle). Don't pay to acquire someone you already have.
- **Active customers in your CRM** uploaded as a custom audience and excluded. Catches purchases that didn't fire the pixel.
- **High-intent recent visitors** (initiated checkout in last 7 days) — they're handled by retargeting, not prospecting.
- **Existing email subscribers** if the campaign goal is email capture.

For Advantage+ Shopping Campaigns, the existing-customer budget cap replaces explicit exclusion — set it to 20-30% rather than excluding.

## What NOT to exclude

Don't over-exclude. Common mistakes:

- Excluding all site visitors from the last 90 days — kills retargeting and prevents users from seeing the prospecting ad a second time after a brief visit.
- Excluding lookalikes from broad — your lookalike is a subset of broad; excluding it doesn't help and confuses the system.
- Excluding multiple narrow demographics in an attempt to "refine" — each exclusion shrinks the eligible pool and constrains ML exploration.

The principle: exclude people you don't want delivery to (customers, subscribers, recent buyers) — not people you think might not convert. Let the algorithm decide who won't convert.

## Cleaning up overlapping ad sets

If you run multiple ad sets per campaign (manual, not ASC), audit for overlap monthly:

1. Use the **Audience Overlap tool** in Ads Manager (Audiences → select two audiences → Show Overlap).
2. Anything above 20% overlap between prospecting ad sets is a problem.
3. Consolidate: merge into one ad set, or set explicit exclusions so each ad set has its own user pool.

A common pattern: a 1% lookalike of purchasers and a 1% lookalike of high-LTV purchasers often overlap 60-80%. Pick one. The "Top LTV" lookalike usually wins for premium offers.

## Refreshing seeds and audiences

Audiences decay. Schedule a monthly hygiene pass:

- **Custom audiences with rolling windows** (e.g., "purchasers last 180 days") refresh themselves daily — no action needed.
- **CRM uploaded audiences** need a fresh upload every 30-90 days. Old uploads still contain churned customers.
- **Lookalike seeds** that are CRM-based recalculate when you re-upload the seed; pixel-based ones refresh automatically.
- **Engagement audiences** (video viewers, lead form openers) decay as users disengage. Use last-30-day windows, not all-time.

If you set a "purchasers ever" audience and forget it, after 18 months you're targeting people whose buying behavior is no longer representative.

## Frequency caps

For prospecting campaigns Meta usually controls frequency well via auction logic. For retargeting, frequency capping matters more — you can burn a cart abandoner if you show them the same ad 12 times in a week.

For brand-awareness objectives only, you can set explicit frequency caps (e.g., 3 impressions per 7 days). For conversion objectives, Meta restricts manual frequency caps because they conflict with auction optimization — instead use rotation and creative refresh to keep frequency varied.

Watch the **frequency metric** in reporting:

- Prospecting: 1.5-3.0 over a 30-day window is healthy.
- Retargeting: 3-6 is normal; >10 starts to fatigue.

If retargeting frequency >10 and CPA is rising, expand the retargeting window (7 days → 14 days), add more retargeting creatives, or rotate to a different message.

## Geo and demographic hygiene

Sanity-check the basics:

- **Country selection**: only countries you can ship to / serve. Adding US + Canada for a US-only product wastes 10% of spend.
- **Age range**: don't include ages you don't sell to. Default 18-65+ wastes spend if your product is for 25-40.
- **Language**: if your creative is English only, set language to English. Spanish speakers in the US can be a separate ad set with translated creative — don't run English ads to them.
- **Placements**: trust automatic placements (Meta's default) unless data shows specific placements underperform consistently. Audience Network often does, but cutting it manually saves <5% spend with reach loss.

## Brand-safety exclusions

If brand safety matters (regulated industries, premium brands), add:

- **Inventory filter**: set to "limited" — excludes more sensitive placements.
- **Block lists**: upload domain block lists for Audience Network if it's running.
- **Topic exclusions**: available in some placements via Ads Manager.

These reduce reach 5-15% but eliminate adjacency risk.

## Negative keywords... don't exist on Meta

Unlike Google Ads, Meta has no negative-keyword equivalent — there's no search query to negate. The closest is interest exclusion ("not interested in X") but these rarely move the needle because Meta's targeting isn't keyword-based.

For unwanted traffic, your levers are:

- Custom audience exclusion.
- Creative tightening (the hook filters).
- Optimization event (conversion-event optimization filters non-buyers naturally).
- Placement adjustment.

## The monthly hygiene checklist

A 15-minute monthly audit prevents most performance decay:

1. Refresh CRM customer list upload.
2. Check audience overlap between active ad sets.
3. Confirm exclusions are still wired (post-purchase audience, subscribers).
4. Look at frequency on retargeting — anything >10 needs creative rotation.
5. Review age/gender/geo settings for waste.
6. Audit lookalike seeds — are they still fresh?
7. Spot-check placement performance — any consistent underperformer to cut?

Most "my account stopped working" stories trace to skipped hygiene, not algorithm changes.

## Mistakes to avoid

- **Over-excluding** — small exclusion lists are good; massive exclusion stacks shrink the pool and constrain ML.
- **Stale CRM uploads** — re-upload monthly minimum.
- **Forgetting to exclude customers from prospecting** — common reason CPA looks fine on paper but new-customer rate is flat.
- **Excluding the 1% lookalike from broad** — counterproductive and confusing.
- **Setting frequency caps on conversion campaigns** — they undermine auction optimization.

## Summary

- Exclude purchasers and current customers from prospecting; everything else is over-engineering.
- Use ASC's existing-customer budget cap instead of explicit exclusion when on ASC.
- Audit audience overlap monthly; consolidate ad sets with >20% overlap.
- Refresh CRM-based seeds every 30-90 days.
- Watch frequency on retargeting; >10 means fatigue.
- Geo, age, language sanity-checks save 5-15% waste.
- Hygiene is a 15-minute monthly habit that prevents performance decay.

Next module: Creative is the new targeting.
