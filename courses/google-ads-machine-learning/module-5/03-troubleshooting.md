---
module: 5
position: 3
title: "Troubleshooting Smart Bidding"
objective: "Diagnose tracking, learning, and signal issues."
estimated_minutes: 7
---

# Troubleshooting Smart Bidding

## The diagnostic order

When Smart Bidding looks broken, run a structured diagnosis. Order matters because some causes mask others:

1. **Tracking layer.** Are conversions firing accurately? Is Enhanced Conversions configured? Are values right?
2. **Learning phase.** Is the campaign in learning? Did a recent change re-trigger it?
3. **Signal volume.** Is conversion volume above threshold (30/30 days for tCPA, 50 for tROAS)?
4. **Target.** Is the target realistic given historical performance?
5. **Audience and creative.** Are signals fresh? Is creative inventory adequate?
6. **Structural.** Is the campaign structure sane? Cannibalization with other campaigns?
7. **Macro.** Seasonality, competition, broader market shifts.

Most issues live in layers 1-4. Tracking is the most common culprit — fix it before anything else.

## Failure: CPA suddenly doubled

Possible causes:

- **Yesterday's data is incomplete.** Conversions still arriving. Wait 3+ days.
- **Tracking broke.** Pixel or Enhanced Conversions stopped firing; the system sees fewer conversions and bids more aggressively. Check Tag Assistant.
- **Budget change.** Did you (or a colleague) change budget recently?
- **Target change.** Did anyone tighten tCPA or tROAS?
- **Audience signal lost.** Customer Match list expired or got removed?
- **Creative refresh broke.** New ads with weak CTR can drag overall performance.
- **Competitor activity.** New competitor entering the auction at your price point.
- **Seasonal.** Some categories spike or crash in particular weeks.

Order of checking: tracking, recent changes, signals, then macro.

## Failure: tCPA target unachievable

Symptoms: setting tCPA at $30 but actual CPA is $50 and impressions are full.

Causes:

- **Target is below historical baseline.** If you've been hitting $50, you can't suddenly hit $30. The system can only do so much.
- **Audience pool isn't deep enough for the price.** Setting aggressive targets in narrow markets starves volume.
- **Quality signals are weak.** Without rich audience/creative, the system can't find users at the target price.
- **Auction got more competitive.** Competitors entered at higher bids; the market floor shifted.

Solution: raise the target to a defensible number (~10% above achieved CPA), let Smart Bidding find the efficient frontier, then tighten in 10-15% steps over weeks.

## Failure: learning phase never ends

Symptoms: campaign sits in "Learning" indefinitely.

Always traceable to under-conversion: not enough conversions for Smart Bidding to learn from. Causes:

- **Conversion volume below threshold.** <30/30 days = no learning.
- **Optimization event too narrow.** Optimizing for a rare event = too few signals.
- **Budget too low for the CPA.** $30/day with $30 CPA = 1 conversion/day = 30/month, right at threshold.
- **Audience too narrow.** Constrained targeting starves volume.
- **Frequent changes.** Each change resets the clock.

Solutions:

- Switch to a higher-volume conversion event (e.g., InitiateCheckout instead of Purchase).
- Consolidate ad groups/campaigns to concentrate signal.
- Use Maximize Conversions instead of tCPA until volume is built.
- Raise budget to accumulate more conversions per day.
- Stop making frequent changes.

## Failure: Smart Bidding wildly inaccurate predictions

Symptoms: Predicted vs actual CPA diverges 50%+.

Almost always tracking-related:

- **Conversion fires inconsistently.** Pixel issue.
- **Wrong conversion event marked primary.** System optimizes wrong event.
- **Values inaccurate.** tROAS bidding on wrong revenue numbers.
- **Wrong currency.** Inflated or deflated value interpretations.
- **Missing offline conversions** for slow-cycle businesses.

Run a tracking audit (Module 4 checklist). 80%+ of these cases are signal quality, not algorithm failure.

## Failure: PMax cannibalizes Search

Symptoms: Search impression share drops when PMax is added; Search conversions plateau; total revenue grows but Search-attributed revenue doesn't.

This is real and known. Solutions:

- **Tight brand Search exact-match** with high bid willingness — claims brand queries before PMax.
- **Non-brand Search exact match** on top-priority keywords — claims those queries before PMax.
- **Accept some overlap** for broader keywords; PMax often performs comparably.
- **Don't run multiple PMax campaigns** on the same products.

## Failure: ROAS plummeted but conversions same

Symptoms: same conversion count, lower revenue per conversion.

- **Wrong values being sent.** Currency mismatch, value parameter misconfigured, or sending discount-applied amounts instead of subtotals.
- **Sale or promo period.** Active discount reducing AOV.
- **Buyer mix shifted.** Smart Bidding finding cheaper buyers because target was tightened.
- **Cart composition shift.** Buyers buying single items vs bundles.

Audit value tracking first. If values are right, look at AOV trends and promotional activity.

## Failure: ad quality drops, CTR falls

Symptoms: Ad strength rating Poor/Average; CTR slowly declining.

- **Stale creative.** RSAs aging; ad fatigue.
- **Pinned headlines** constraining variant testing.
- **Bad RSA inputs.** Headlines/descriptions don't address user intent for the keywords.
- **Landing page experience degraded.** Slow load, mobile UX broken, ad-landing mismatch.

Refresh RSAs with new headlines and descriptions; unpin headlines unless legally required; audit landing pages.

## Failure: Search Partners eating budget

Search Partners is the optional network of search-like sites (sites that show Google search results) that Google can serve your ads on if you enable it. Performance is usually worse than Google Search proper.

If enabled by default and you didn't know: budget leaks to lower-quality traffic. Disable Search Partners in campaign settings; usually a small recovery on quality without much volume loss.

## Failure: Display Network bleed

Some campaign types include Display by default. If you didn't intend Display targeting, your Search campaign may be serving on Display Network at poor performance.

Check Campaign Settings → Networks. Search-only campaigns should have only "Google Search" enabled, no "Display Network" partner.

## When the algorithm appears broken

Common reactions that aren't actually Smart Bidding's fault:

- **Tracking broken** → algorithm reaches wrong conclusions.
- **Too-aggressive targets** → algorithm can't deliver volume.
- **Thin signal** → algorithm hasn't learned yet.
- **Multiple recent changes** → algorithm in perpetual learning.
- **Macro factors** → blamed on algorithm.

Before declaring Smart Bidding broken: check tracking, check recent changes, check signal volume, check competitive dynamics. The algorithm is almost always doing its job given the signal.

## Mistakes to avoid

- **Reacting to single-day CPA swings.** Variance dominates.
- **Multiple changes during a learning phase.** Confounds learning.
- **Skipping the tracking audit.** Most "algorithm" problems are signal problems.
- **No baseline before changes.** Can't measure impact.
- **Treating Smart Bidding as autopilot.** You still own tracking, signal, creative.

## Summary

- Diagnostic order: tracking → learning → signal volume → target → audience/creative → structure → macro.
- Most issues live in tracking and signal layers.
- Aggressive targets starve volume; defensible targets find the frontier.
- Search Partners and Display Network often eat budget silently.
- The algorithm is usually doing its job given the signal.

Next: when to break the rules.
