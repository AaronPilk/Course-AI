---
module: 2
position: 3
title: "Advantage+ campaigns — full automation"
objective: "Use Meta's automated tier without losing the wheel."
estimated_minutes: 7
---

# Advantage+ campaigns — full automation

## What it is

Advantage+ Shopping Campaigns (ASC) are Meta's fully-automated campaign type for e-commerce. You skip the ad set targeting entirely — no interests, no lookalikes, no detailed demographics. You upload creatives and set a budget; Meta handles targeting, placement, creative rotation, and learning.

There are Advantage+ variants for other objectives too: Advantage+ App Campaigns, Advantage+ Catalog Ads, Advantage+ Lead Campaigns. The shopping version is the most mature.

The promise: better performance through more aggressive ML, less manual labor. The reality: Advantage+ works extremely well for some accounts and surprisingly poorly for others. Knowing which is which is the skill.

## When Advantage+ wins

Advantage+ tends to beat manual campaigns when:

- **Pixel + CAPI is clean and high-volume.** ML needs purchase signal; Advantage+ needs more of it than manual campaigns because it's casting wider.
- **You have a creative library.** Advantage+ rotates many ads aggressively; 1-2 ads underutilize it. Aim for 5-15 active ads per campaign.
- **Audience is broad-eligible.** DTC, app installs, mass-market services.
- **Account is mature** (90+ days, 1k+ conversions in last 90 days). New accounts don't have enough signal for Advantage+ to find good users quickly.

In these conditions Advantage+ commonly delivers 10-30% lower CPA than manual prospecting campaigns and often takes over as the primary acquisition vehicle.

## When manual still wins

Advantage+ tends to lose when:

- **Pixel signal is thin** (under 50 conversions per week). Advantage+ explores aggressively; thin signal makes it waste budget.
- **Creative library is small** (1-3 ads). Advantage+ can't rotate; it acts like a manual ad set with worse controls.
- **Audience needs to be narrow** (B2B by title, regulated vertical, hyper-local). Advantage+'s broad-by-design hurts you.
- **You have specific exclusion needs Advantage+ doesn't support cleanly.** ASC has limited exclusion controls; if you need to exclude many custom audiences, manual gives you the tools.

## The existing-customer budget cap

ASC has a setting called "Existing Customer Budget Cap" — you specify a CRM list of existing customers and a percentage (e.g., 30%). Meta caps spend on existing-customer reach to that percentage. The rest of the budget goes to net-new acquisition.

This is critical for understanding ASC's value: it lets Advantage+ go broad (including retargeting) but you control how much budget repaints existing customers. Set this carefully — too low and you lose easy revenue from past buyers; too high and you're paying to find people you already have.

Typical setting: 20-30% for established brands, 10-15% for accounts focused on new acquisition.

## Creative ingestion

Advantage+ accepts up to 150 creatives per campaign (in practice 5-15 is the sweet spot; more is rotation overhead with diminishing returns). Mix formats:

- 6-8 short-form videos (15-30s, vertical 9:16).
- 4-6 static images / carousels.
- 2-3 user-generated content style.

Meta's algorithm rotates aggressively across users and placements. Within a few days you'll see which creative dominates delivery — that's your winner. Replace bottom creatives weekly; don't pause winners.

## How to operate Advantage+

A common operating rhythm:

1. **Launch with $100-300/day** (CBO at campaign level, no ad set budgets — Advantage+ campaigns inherently use campaign-level budget).
2. **Wait 5-7 days** before judging. ASC's learning phase is longer than manual because it explores a wider audience.
3. **Watch CPA, ROAS, and the creative delivery split.** Most spend will concentrate on 1-3 winning creatives.
4. **Refresh weekly** — add 2-3 new creatives, remove the bottom 2-3. Don't pause the winner.
5. **Scale by raising budget 20-30% every 3-4 days** if CPA holds. Bigger jumps reset learning.

## ASC vs ABO/CBO manual — when to run both

The pragmatic answer: run both. ASC handles the bulk of prospecting (60-80% of acquisition spend) while a manual campaign holds the audiences ASC can't serve well — narrow B2B, specific exclusion logic, niche tests.

Don't run two ASCs in the same ad account targeting the same product — they'll overlap and self-compete. One ASC per product/offer; isolate.

## Reporting differences

Advantage+ campaigns show fewer breakdowns. You can see:

- Total campaign performance (spend, CPA, ROAS, conversions).
- Creative-level delivery and performance.
- Placement breakdown (where spend went: Feed, Reels, Stories, Audience Network).

You cannot see:

- Audience-level breakdown (no "this lookalike vs broad" inside ASC).
- Interest-level breakdown (no interests to break down).
- Age/gender placement separately by audience (single campaign, single audience).

This loss of granularity is the cost of automation. You're trading visibility for the algorithm's freedom to find conversions.

## Advantage+ Catalog Ads

Different from ASC. Catalog Ads pull from your product catalog and dynamically generate creative per user — usually a carousel of products Meta thinks the user is most likely to buy. Strong for:

- Retargeting site visitors with products they viewed.
- Cold prospecting where the catalog has 100+ SKUs and the algorithm picks which products to show whom.

Often runs alongside ASC: ASC handles creative-led acquisition; Catalog Ads handles SKU-led retargeting and broad catalog-prospecting.

## Mistakes to avoid

- **Running ASC with only 1-2 creatives** — the engine has nothing to rotate.
- **Setting existing-customer cap too high (80%+)** — most of your budget reaches past buyers.
- **Pausing ASC after 2 days of bad performance** — give it 5-7 days minimum.
- **Running 3 ASCs targeting the same product** — auction overlap and self-competition.
- **Treating ASC like a manual ad set** (frequent budget edits, audience tweaks) — every edit resets learning.

## Summary

- Advantage+ Shopping Campaigns automate targeting, placement, and rotation for e-commerce.
- Wins when pixel signal is strong, creative library is deep, and audience is broad-eligible.
- Loses when signal is thin, creatives are few, or audience must be narrow.
- Existing-customer budget cap controls retargeting-vs-new-acquisition split.
- Run 5-15 creatives; refresh weekly without pausing winners.
- One ASC per product; don't duplicate.
- Trades granularity for performance.

Next: Exclusions and audience hygiene — the unglamorous habits that keep performance clean.
