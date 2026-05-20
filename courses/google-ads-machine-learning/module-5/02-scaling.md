---
module: 5
position: 2
title: "Scaling cleanly — budget and bid behavior"
objective: "How Smart Bidding responds to changes."
estimated_minutes: 7
---

# Scaling cleanly — budget and bid behavior

## The scaling problem on Google

Every account hits the same wall: spend doubles, CPA doubles. The naive interpretation is "Google penalized me for scaling" or "the algorithm broke." The reality: scaling triggered learning-phase resets, audience saturation, or creative ceiling — all predictable, all manageable if you understand the mechanics.

This lesson covers the rules of clean scaling on Google.

## What triggers Smart Bidding learning

Like Meta, Smart Bidding has a learning phase that resets on significant changes:

- **Budget change >20% in a short window**.
- **Bid strategy change** (tCPA → tROAS or strategy → strategy).
- **Bid target change >15-20%**.
- **Conversion goal change**.
- **Major audience or signal addition/removal**.
- **Significant creative refresh** (sometimes).
- **Campaign objective change**.

Learning typically lasts 7-14 days. During learning, performance volatility is higher; CPA may spike before settling. Don't react to short-term swings — wait for learning to complete.

## The 20% rule

Vertical scaling (raising budget within an existing campaign) follows a soft 20% rule:

- Raise budget +20% (or less) every 5-7 days while CPA holds.
- Bigger jumps re-enter learning phase, costing efficiency.
- If CPA degrades after a raise, hold or roll back; don't push further.

A $200/day campaign → $240 → $290 → $350 → $420 over 4-5 weeks is the textbook pattern. Spread the scaling over time. A $200 → $1000 overnight crash-lands the algorithm and produces predictable bad results.

For tROAS campaigns specifically, the 20% rule applies to target changes too. Tightening from 4x ROAS to 5x is fine; tightening from 4x to 8x will starve volume.

## Vertical vs horizontal scaling

Vertical: raising budget on an existing campaign.

Horizontal: launching new campaigns or expanding to new geos/audiences/products.

Vertical has limits — eventually the same audience and same creative saturate. CPA breaks when the algorithm runs out of high-converting users in the existing pool.

Horizontal has more headroom. New geos, new product lines, new offer angles each add new audience pool.

Most accounts scale primarily through horizontal expansion once they hit vertical ceilings. The combined budget grows; CPA stays sane because each new campaign accesses fresh audience.

## Signs the ceiling is approaching

You're nearing the vertical scaling ceiling when:

- Impression share is high (>80%) and Lost IS (rank) is rising.
- New keywords aren't finding new pool.
- Frequency on PMax/Display rising.
- CPC rising with no other explanation.
- ROAS slowly declining despite same creative.

When these appear, shift focus from vertical (more budget into existing campaign) to horizontal (new vehicles).

## Budget pacing modes

Google Ads has two pacing modes:

- **Standard delivery** — spreads budget evenly through the day.
- **Accelerated delivery** — spends as quickly as possible (deprecated for most Smart Bidding strategies in 2022).

Standard is the default and almost always correct. Accelerated only made sense in some manual-bidding contexts.

If your campaign hits its daily budget by noon, the budget is too low for the demand — raise it (within 20% rule) or expect under-utilization.

## Lost Impression Share — your scaling diagnostic

**Search Lost IS (budget)** = how much impression share you lost because budget ran out.
**Search Lost IS (rank)** = how much you lost because Ad Rank wasn't high enough.

These are critical scaling diagnostics:

- High Lost IS (budget) = your campaign is budget-constrained; raise budget to capture more impressions.
- High Lost IS (rank) = your campaign is auction-constrained; raise bid target (tCPA up or tROAS down) to outbid more competitors.

If both are low, you're capturing most of the available audience and further scaling needs horizontal expansion.

## Scaling PMax campaigns

PMax scales slightly differently than Search:

- 30% increments often work cleanly (vs 20% for Search) because PMax's audience is already broad.
- Wait 5-7 days between raises.
- Add more creative when scaling — PMax needs creative inventory at higher spend.
- Monitor the Existing Customer Budget Cap (if enabled) — at higher spend, the cap percentage may need adjustment.

Don't add more PMax campaigns on the same products to scale. That creates self-cannibalization. Scale the single PMax campaign or add an asset group within it.

## Scaling without breaking learning

The clean scaling pattern:

1. **Establish baseline.** 30 days of consistent budget and target. Note CPA, ROAS, conversion volume.
2. **Plan the scale path.** Start with +20% per period. Map 4-8 weeks ahead.
3. **Execute one change at a time.** Don't simultaneously raise budget AND change tROAS AND add new ad groups.
4. **Observe for 5-7 days post-change.** Don't make another change inside the learning period.
5. **If CPA holds within 10-15% of baseline, continue.** If it breaks, hold.
6. **If you stall, switch to horizontal expansion.**

This rhythm respects the learning phase and scales without breaking it.

## When scaling triggers cannibalization

Adding more spend to PMax can cannibalize Search; adding more PMax on the same products cannibalizes itself; adding more brand Search budget cannibalizes organic clicks.

Watch for:
- Search impression share dropping when PMax scales.
- Branded organic clicks dropping when brand Search scales.
- Total revenue plateau despite total spend growth.

The diagnostic: incrementality tests. If total revenue isn't growing with total spend, the new spend is replacing, not adding.

## Scaling B2B and lead-gen differently

B2B has longer conversion cycles. Scaling rules:

- Use longer conversion windows (30-90 days) in Smart Bidding.
- Don't react to first-week data — leads take time to mature into deals.
- Scale based on closed-deal metrics from offline imports, not lead count.
- Horizontal expansion (new ICP segments, new geos) usually outperforms vertical past a point.

A common B2B mistake: scaling on lead volume that includes many non-fit leads. Eventually CAC payback worsens. Always close the loop with offline imports and bid on closed-deal value.

## Q4 / seasonal scaling

Seasonal demand peaks (Black Friday, holiday season) create temporary scaling windows. Rules:

- Smart Bidding adapts to seasonal demand automatically — you don't need to override.
- Raise budgets before peak periods (start of November, not on Black Friday itself) so the system can ramp.
- Use seasonality adjustments in Smart Bidding to flag known periods.
- Don't bake Q4 efficiency into Q1 baseline expectations.

January CPA will be worse than December CPA in most markets. Account for it; don't panic.

## Mistakes to avoid

- **Doubling budget overnight.** Triggers learning; crashes CPA.
- **Changing budget and target simultaneously.** Confuses the learning.
- **Ignoring Lost IS diagnostics.** Tells you whether you're budget- or rank-constrained.
- **Forcing vertical when horizontal is needed.** Saturation isn't fixable by more budget.
- **Reacting to single-day CPA spikes.** Variance dominates short windows.

## Summary

- 20% budget increments every 5-7 days for Search; 30% for PMax.
- Bid target changes >15-20% also trigger learning.
- Vertical has ceilings; horizontal (new geos, products) has headroom.
- Lost IS (budget vs rank) tells you what's constraining you.
- One change at a time; wait 5-7 days; observe.
- Q4 is a window, not a permanent baseline.

Next: troubleshooting Smart Bidding.
