---
module: 5
position: 1
title: "Modern account structure"
objective: "Fewer campaigns, broader ad groups, layered audiences."
estimated_minutes: 7
---

# Modern account structure

## The structural shift

Account structure in Google Ads underwent the same shift as targeting and bidding: from fragmented manual control toward consolidated automation. The 2015 playbook was many tightly-themed ad groups with narrow keyword lists, granular bid adjustments, and manual budget allocation. The 2026 playbook is fewer campaigns, broader ad groups, and Smart Bidding doing the per-impression allocation work.

Consolidation isn't just preference — it's required to give Smart Bidding the conversion volume it needs at the campaign and ad-group level. Fragmented accounts starve learning everywhere.

## The minimum viable structure

For a single-product DTC e-commerce brand:

1. **Brand Search (exact match)** — 1 campaign, 1 ad group, branded exact keywords + close variants, aggressive tROAS or high willingness to bid, separate budget.
2. **Non-brand Search (high-intent)** — 1-2 campaigns covering specific commercial keywords you want explicit control on, tROAS or tCPA, broad/phrase match types with negatives.
3. **Performance Max** — 1-2 campaigns for cross-surface acquisition, asset groups segmented by audience or product line.
4. **Demand Gen** — 1 campaign for top-of-funnel discovery, vertical video creative.
5. **Retargeting** — usually folded into PMax via audience signals; standalone retargeting only for specific use cases.

Total: 4-6 campaigns. That's it for a $50k/mo e-commerce account.

For B2B lead-gen:
1. Brand Search exact.
2. Non-brand Search broad/phrase with strong negatives.
3. PMax (less essential for narrow-audience B2B).
4. Demand Gen video for awareness.

Total: 3-5 campaigns.

## Ad group structure

Within each campaign, ad groups should be themed by intent or product category, not by match type:

- **By intent**: "commercial purchase intent" / "comparison intent" / "informational intent" — each ad group gets keywords matching that intent.
- **By product category**: "athletic shoes" / "running shorts" / "workout tops" for an apparel campaign.
- **By offer**: "free trial" / "premium subscription" for a SaaS campaign.

Avoid:
- One ad group per keyword (over-fragmentation, learning starved).
- Single ad group per campaign (loses creative-relevance pairing).
- Ad groups organized by match type (outdated; mix is fine now).

Typical: 3-8 ad groups per campaign in non-brand Search. Brand Search often has just 1-2 ad groups.

## Keyword count per ad group

Modern guidance: fewer, more powerful keywords per ad group, with broad match doing most of the work.

- 5-15 keywords per ad group is comfortable.
- All broad match for most ad groups; phrase or exact reserved for specific cases.
- Negative keyword lists at account or campaign level.

A 200-keyword ad group from 2015 is now usually wrong. Smart Bidding learns better with fewer, broader keywords.

## Responsive Search Ads (RSAs)

The default ad format is Responsive Search Ads:

- 15 headlines (30 chars each).
- 4 descriptions (90 chars each).
- Google mixes and matches per impression.

RSAs replaced Expanded Text Ads (ETAs) entirely in 2022; ETAs no longer exist.

Best practices:
- Fill all 15 headline slots and all 4 description slots.
- Vary across multiple angles (benefit-led, feature-led, social-proof, urgency, brand).
- Use ad strength rating ("Poor / Average / Good / Excellent") as a directional signal — Excellent ads outperform Poor by significant margins.
- Pin headlines/descriptions sparingly; pinning constrains the algorithm.

Aim for 3+ ads per ad group (3 RSAs with different angles), giving Google variety to test.

## Pinning carefully

Pinning lets you force a specific headline or description to always appear (or always appear in a specific position). Use sparingly:

- **Pin position 1**: a headline you legally must show (compliance) or strongly want as the primary message.
- **Pin position 2 or 3**: secondary messages with placement requirements.

Pinning reduces ad variant combinations Google can test, which hurts ad strength and limits learning. Pin only when necessary.

## Audience layering

In modern Search and PMax campaigns, audiences layer onto the keyword/signal mix:

- **Observation mode**: audience layered but doesn't restrict targeting. Useful for reporting and Smart Bidding signal.
- **Targeting mode**: only users matching the audience can see ads. Restricts reach significantly.

For most Smart Bidding accounts: use observation mode. Layer multiple audiences (customer match, in-market, custom segments) and let the algorithm use them as signals. Don't restrict via targeting mode unless you have a specific reason.

## Geographic structure

Geo settings sit at the campaign level:

- **One campaign per market.** US, UK, AU separate. Don't blend currencies and behaviors.
- **Location options**: "People in or regularly in your targeted location" (default; tighter) vs "people in, regularly in, or showing interest" (wider).
- **Excluded locations**: regions you can't serve.

Within a market, sub-geo targeting (state, city) is usually unnecessary — Smart Bidding adjusts per-impression based on conversion probability, including geo signals.

## Language structure

Language settings:

- **Targeted language** should match your ad copy and landing pages.
- For multi-language markets, separate campaigns per language (US English + US Spanish as two campaigns).

Don't run English ads to Spanish-speakers; the relevance signal will be poor.

## Budget allocation

CBO (Campaign Budget Optimization) at the campaign level means you allocate budgets per campaign:

- **Brand Search**: enough to capture branded queries — usually small (~5-10% of total budget) but ROAS-rich.
- **Non-brand Search**: 15-25% of budget. Specific keyword control.
- **PMax**: 40-60%. The acquisition engine.
- **Demand Gen**: 10-20%. Top-of-funnel.
- **Retargeting standalone**: 5-10% if used.

These are starting points. Mature accounts refine based on incrementality data (Module 4).

## Naming conventions

Consistent naming makes account audits dramatically faster:

`<Channel> | <Type> | <Audience/Topic> | <Match> | <Region> | <Date>`

Examples:
- `Search | Brand | Exact | US | 2026-05`
- `Search | NonBrand | High-Intent | Broad+Phrase | UK | 2026-Q2`
- `PMax | Athletic Apparel | Audience-Athletes | US | 2026-Q2`
- `DemandGen | Awareness | YouTube Shorts | US | 2026-Q2`

Pick a convention; use it consistently. The compounding benefit when reading 30+ campaign names is significant.

## Account hierarchy basics

- **Manager Account (MCC)** — for agencies and multi-account businesses; central management of multiple Google Ads accounts.
- **Ad Account** — where campaigns live; usually one per major market or business unit.
- **Campaign** — top-level container; defines type (Search, PMax, etc.), budget, geo, language, bid strategy.
- **Ad Group** — under campaigns (for Search/Display); contains keywords + ads.
- **Asset Group** — under PMax campaigns; contains creative + audience signals + search themes.

Keep this hierarchy clean and predictable. One MCC, one ad account per market, campaigns by type/objective, etc.

## Lifecycle management

A campaign goes through stages:

1. **Launch** — days 1-14, learning phase, expect volatility.
2. **Stabilize** — weeks 2-8, learning settles, performance trends emerge.
3. **Scale** — weeks 8+, push budget +20-30% per period if CPA/ROAS holds.
4. **Steady-state** — proven campaign in production rhythm.
5. **Decay** — frequency rises, creative library exhausts, performance drifts.
6. **Refresh or retire** — major creative overhaul or campaign retirement.

Recognize decay early. A campaign that's been "performing well" for 12 months without refresh is usually performing on inertia, not optimization.

## Conversion tracking ties everything together

Across all of this, conversion tracking quality is the determinant. The right structure with bad tracking still underperforms a basic structure with great tracking.

Re-read Module 1 Lesson 4 and Module 4 if you're not sure about tracking. It's the most underestimated lever.

## Mistakes to avoid

- **One campaign per audience/keyword.** Over-fragmentation; learning starved.
- **No brand Search separate campaign.** Brand defense lost to PMax.
- **One huge campaign for everything.** Loses the structure benefits.
- **Inconsistent naming.** Can't audit at scale.
- **Match-type-based ad groups.** Outdated structural pattern.
- **No Demand Gen for accounts past plateau.** Missing top-of-funnel.

## Summary

- Few campaigns, broader ad groups, Smart Bidding allocates.
- E-commerce: brand Search + non-brand Search + PMax + Demand Gen (4-6 campaigns).
- Ad groups by intent or product category, not match type.
- 5-15 keywords per ad group; mostly broad match.
- Audience layering in observation mode for Smart Bidding signal.
- One campaign per market and language.
- Naming convention pays compound dividends.

Next: scaling cleanly.
