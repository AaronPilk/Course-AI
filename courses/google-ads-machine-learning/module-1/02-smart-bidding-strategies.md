---
module: 1
position: 2
title: "Smart Bidding — what each strategy optimizes for"
objective: "Pick the right strategy for the goal."
estimated_minutes: 7
---

# Smart Bidding — what each strategy optimizes for

## The shift to automated bidding

Smart Bidding is Google's umbrella term for ML-driven bid strategies that set the bid for each individual auction based on predicted conversion probability and value. Where manual CPC bidding sets a fixed bid per keyword that applies to every impression, Smart Bidding bids different amounts on the same keyword for different users at different moments.

Smart Bidding became the default for new campaigns in most account types around 2020. As of 2026, manual bidding still exists but is rare in well-run accounts.

The strategies live in a small set, each with a specific objective. Choosing the right one is one of the bigger account-level decisions.

## The five strategies that matter

### Target CPA (tCPA)

Tells Google: "spend whatever it takes to keep average cost-per-acquisition at $X." The system bids up on high-converting auctions and down on low-converting ones, with the goal of averaging to your target CPA.

Best for:
- Lead generation, sign-ups, app installs — anything with a flat "cost per conversion" goal.
- Mature campaigns with 30+ conversions in the last 30 days (signal threshold).
- Steady-volume businesses where you can afford some volume variance.

Watch outs:
- Set target too low and the system can't find users at that price; impressions and conversions drop.
- Drastic target changes (>20%) trigger learning re-stabilization.
- Doesn't account for conversion value — a $5 lead and a $5,000 lead count equally.

### Target ROAS (tROAS)

Tells Google: "spend such that revenue / spend stays at X%." You bid for conversion value, not conversion count. The system bids up on auctions predicted to drive high-value conversions and down on low-value ones.

Best for:
- E-commerce with varied AOV — buying a $50 product and a $500 product are different signals; tROAS values them differently.
- Lead gen with value scoring (different lead types worth different amounts).
- Mature accounts with conversion value data and 30+ value-attributed conversions in 30 days.

Watch outs:
- Requires accurate conversion value tracking (not just a binary "converted" event).
- Set ROAS too high and the system can only find the rare ultra-high-value users; volume craters.
- Volatile in markets where AOV varies widely.

### Maximize Conversions

Tells Google: "spend the daily budget to get the most conversions, no specific CPA target." Useful when you have a fixed budget and don't care exactly what CPA emerges, as long as conversion count is maximized.

Best for:
- Campaigns with a hard daily budget and an open CPA tolerance.
- Newer campaigns gathering conversion data before setting a CPA target.
- Brand or top-of-funnel campaigns where volume matters more than cost per.

Watch outs:
- No CPA control means costs can drift unpredictably.
- Can spend the full budget on expensive late-day auctions if early-day demand was low.
- Use tCPA once you know the CPA you can afford.

### Maximize Conversion Value

Tells Google: "spend the daily budget to maximize total revenue, no specific ROAS target." The value version of Maximize Conversions.

Best for:
- E-commerce campaigns where total revenue matters more than ratio.
- Promotional periods (sale events) where you want to maximize sales volume.

Watch outs:
- Same as tROAS — requires value tracking.
- Same as Maximize Conversions — no ratio control.

### Maximize Clicks

Tells Google: "spend to get the most clicks." Not Smart Bidding in the conversion sense — it's volume-of-clicks bidding. Useful when you want traffic for awareness or as a stop-gap when conversion data is too thin for conversion-based bidding.

Best for:
- New accounts with zero conversion history.
- Awareness campaigns.
- Diagnostic tests when you want raw click data fast.

Watch outs:
- Not optimized for conversions. CPA can be terrible.
- Treat as a transitional strategy, not a long-term one.

## Strategies you can ignore

Older strategies that exist but rarely make sense in 2026:

- **Manual CPC** — full manual bidding. Replaced by Smart Bidding for almost all use cases.
- **Enhanced CPC (eCPC)** — half-manual, half-automated. Has largely been phased out for Search/Display; only legacy campaigns still use it.
- **Target Impression Share** — bids to achieve a share of impressions; useful only for very specific brand-defense scenarios.

If a strategy isn't on the five-that-matter list, you usually shouldn't be using it.

## The conversion-volume threshold

Smart Bidding strategies — especially tCPA and tROAS — perform best when they have signal. Google's documentation suggests 30+ conversions in the last 30 days for tCPA, 50+ for tROAS. Below those thresholds, the algorithm hasn't seen enough to predict reliably.

If you're below threshold:

- Start with Maximize Conversions or Maximize Clicks to accumulate data.
- Move to tCPA once you have 30+ conversions and a defensible CPA target.
- Move to tROAS once you have 50+ value-attributed conversions and consistent AOV data.

Forcing tCPA on a thin-signal campaign produces erratic results.

## Setting the target

Two anchors:

**Historical CPA.** Your campaign's CPA over the last 14-30 days, slightly stretched. If you've been averaging $40 CPA and want to scale, set tCPA at $42-45 — gives the system room to find more users without breaking efficiency.

**Profitability ceiling.** The max CPA your unit economics support. Set tCPA at the lower of "historical + 10%" and "max profitable CPA."

For tROAS: target should be your current achieved ROAS or slightly higher, not your aspirational ROAS. Setting tROAS at 8x when you've been hitting 3x will starve volume — the system will find only the rare auctions that predict 8x return.

## Learning phase and changes

Like Meta's algorithm, Google's Smart Bidding has a learning period after major changes. Triggers for re-entering learning:

- Bid strategy change.
- Major target change (>15-20%).
- Significant budget change.
- Campaign objective change.
- Major audience or creative changes.

During learning (typically 7-14 days), performance fluctuates more than usual. The system is exploring. Don't react to short-term swings — wait for the learning period to complete before judging.

This is why drastic, frequent changes hurt performance. Each change costs you 1-2 weeks of stable bidding.

## tCPA vs tROAS — which to pick

A simplified decision tree:

- **Have conversion value tracking and varied AOV?** Use tROAS.
- **Flat conversion value (every conversion ≈ same dollar)?** Use tCPA.
- **No clear CPA or ROAS target yet?** Use Maximize Conversions to learn the natural CPA, then switch.

E-commerce usually wants tROAS. Lead gen with variable lead value (B2B) wants tROAS with offline conversion imports. Lead gen with flat lead value wants tCPA. App installs usually tCPA. SaaS trial sign-ups usually tCPA, then tROAS once you have LTV data.

## Portfolio bid strategies

For accounts running similar campaigns with the same goal, **portfolio bid strategies** let multiple campaigns share a single bid strategy and conversion pool. This:

- Pools conversion signal across campaigns (helpful below threshold).
- Centralizes target management (change once, apply to all).
- Helps the algorithm allocate spend across campaigns more cleanly.

Common pattern: portfolio tROAS across all e-commerce campaigns; portfolio tCPA across all lead-gen campaigns.

## Mistakes to avoid

- **Smart Bidding without enough conversion data.** Below 30/month for tCPA, results are noise.
- **Setting unrealistic targets.** A 10x ROAS target on a market currently at 3x = no volume.
- **Frequent target changes.** Each significant change resets learning.
- **Mixing strategies in one campaign.** Pick one and let it operate.
- **Manual CPC for legacy reasons.** Almost always underperforms Smart Bidding now.

## Summary

- Five strategies that matter: tCPA, tROAS, Maximize Conversions, Maximize Conversion Value, Maximize Clicks.
- tCPA = cost per conversion target; tROAS = revenue ratio target.
- Need 30+ conversions/30 days for tCPA, 50+ for tROAS.
- Set targets near historical achievement, not aspirational.
- Major changes trigger 7-14 day learning periods.
- Portfolio bid strategies pool signal across similar campaigns.

Next: the end of manual bidding — when it still wins, why most accounts should leave it.
