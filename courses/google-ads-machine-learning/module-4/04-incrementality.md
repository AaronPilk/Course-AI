---
module: 4
position: 4
title: "Incrementality on Google"
objective: "Geo lift, drafts & experiments, brand suppression."
estimated_minutes: 7
---

# Incrementality on Google

## Attribution vs incrementality, again

This was covered for Meta in Course #14. The same logic applies to Google: attribution credits an ad for sales within its window; incrementality measures whether those sales would have happened without the ad. The two diverge most for brand search and retargeting — common over-attributed channels.

For Google specifically, the over-attribution problem is acute on **branded search**. Users typing your brand name into Google were going to find you regardless. Yet brand Search ads claim much of that credit, and Google rewards itself in reporting for what was effectively your organic and brand equity working.

Most Google Ads accounts overstate true contribution by 10-30%. Knowing your true number changes how you allocate budget across channels and within Google.

## How to test incrementality on Google

Three main methods, in increasing rigor:

**1. Time-based pauses (cheapest, weakest).**
Pause a campaign for 2-4 weeks. Compare total revenue (including organic) week-over-week. Confounded by seasonality, competitive activity, and external factors but cheap.

**2. Geo holdouts (medium rigor).**
Pause campaigns in matched-pair geos for 2-4 weeks. Compare revenue between test geos (ads running) and holdout geos (ads paused). Better than time-based because seasonality affects both groups equally.

**3. Drafts & Experiments (formal A/B in Google Ads).**
Google's built-in experiment framework. Create a draft of a campaign with a single variation (e.g., paused), allocate a percentage of impressions to the experiment, run for 2-4 weeks, get statistically-tested results. Most rigorous within-platform option.

**4. Google's Brand Lift studies (most rigorous for brand awareness).**
For YouTube and Display campaigns, Google offers Brand Lift studies that survey exposed vs unexposed users to measure brand-metric lift. Useful for upper-funnel measurement.

**5. Marketing Mix Modeling (multi-channel).**
For accounts at scale, MMM uses statistical analysis across all marketing channels and revenue to estimate channel contribution. Beyond Google's tools — vendor or in-house. Best for the bigger question "what's Google worth in our mix?"

## The brand search suppression test

The single highest-value test most accounts skip. Set up:

1. Take your branded Search campaign (people Googling your brand name).
2. Pause it entirely for 2-3 weeks (or use Drafts & Experiments).
3. Track:
   - Branded organic clicks (should rise as paid clicks vanish).
   - Total revenue (compare to pre-pause baseline, controlled for seasonality if possible).
4. Compare paid-search revenue lost vs organic-search revenue gained.

The common finding: 60-90% of brand search revenue is non-incremental. Users typing your brand were going to find you regardless. Pausing brand Search saves significant spend while losing minimal revenue.

The other 10-40% is incremental — typically when:
- Competitors are bidding on your brand and you need to hold position.
- The branded search query has commercial intent and your organic listing isn't perfectly aligned.
- Your brand name shares meaning with other brands and you need to claim the SERP.

Don't kill brand search entirely after this test. Right-size it.

## Drafts & Experiments setup

For controlled within-campaign tests:

1. Open the campaign you want to test.
2. Settings → Experiments → Create draft.
3. Modify the draft (change bid strategy, pause, change targeting — whatever you're testing).
4. Promote the draft to an experiment.
5. Set the split (e.g., 50% original / 50% experiment).
6. Set duration (2-4 weeks minimum).
7. Run; observe results in the experiment report.

Experiments are properly randomized — Google randomly assigns users to the original or experiment arm. Results have statistical significance markers showing whether the difference is reliable.

Use for:
- Testing Smart Bidding strategy changes (tCPA vs tROAS).
- Testing structural changes (consolidate ad groups, merge campaigns).
- Testing match-type strategy.
- Measuring impact of pausing or scaling specific campaigns.

## Common findings from Google incrementality tests

Across hundreds of published tests:

**Branded Search is the most over-attributed channel.** Typical incremental contribution is 10-40%, not 100%.

**Retargeting (Display retargeting especially) is heavily over-attributed.** Users who visited your site were often coming back anyway.

**Top-of-funnel (Display, YouTube, Demand Gen) is often under-credited by attribution.** True incremental contribution is higher than reported.

**Non-brand Search is roughly on with attribution.** True incremental contribution is close to reported, slightly under.

The implication: most accounts could reallocate 10-25% of budget from brand and retargeting toward prospecting/awareness and see total revenue hold or grow.

## When to run incrementality tests

Not constantly — tests are expensive (in opportunity cost) and disrupt operations.

- **Annual baseline:** one full-account incrementality study to ground your attribution. Brand search suppression is the cheapest entry point.
- **Quarterly campaign-level:** lighter Drafts & Experiments on suspected over-attributed campaigns.
- **One-off:** before major strategy shifts ("should we cut brand spend by 50%?").

The first study is the highest-value because it reveals whether your reported numbers are roughly right or significantly off.

## Geo holdouts setup

Geo holdout tests work outside Google's experiment framework:

1. Match pairs of geos with similar revenue patterns (e.g., Chicago and Philadelphia; Sydney and Melbourne).
2. Pause campaigns in one of each pair; let ads run in the other.
3. Run for 2-4 weeks.
4. Compare total revenue (from your analytics or e-commerce platform) between test and holdout.
5. Account for seasonality with matched controls.

Geo testing is rougher than randomized experiments but tests effects Google's experiments can't (cross-channel, cross-platform).

## Marketing Mix Models (MMM)

For accounts with multi-channel spend ($500k+/month across Google + Meta + TikTok + email + other), MMM is the next-level tool:

- Uses 18-36 months of historical spend and revenue.
- Statistical modeling assigns contribution to each channel.
- Outputs: each channel's incremental contribution, saturation curves, optimal budget allocation.
- Vendors: Robyn (open-source from Meta), Recast, Mass, Mutiny, custom.

MMM doesn't require holdouts but requires:
- Clean historical data.
- A statistician or vendor.
- Periodic refresh as marketing mix evolves.

For accounts spending $100k+/month on Google alone, MMM-equivalent thinking applied within Google is the right framework: which campaigns truly grow revenue vs which claim credit.

## What to do with incrementality findings

Three common actions:

**Rebalance budget.** Move spend from over-attributed channels (brand, retargeting) to under-credited ones (prospecting, awareness). 10-25% rebalances are common.

**Update target ROAS / CPA.** If true incremental cost is 30% higher than reported, your real CPA is higher than the dashboard suggests. Reset targets accordingly.

**Adjust reporting frameworks.** Discount Meta's and Google's reported numbers by your measured over-attribution rate as a working approximation between rigorous tests.

The accounts that act on incrementality findings tend to outperform peers because they're scaling on causal money, not attributed credit.

## Mistakes to avoid

- **Never running an incrementality test.** Operating on attribution alone for years means strategy built on inflated numbers.
- **Single-day or single-week tests.** Too noisy.
- **Multiple changes during a test.** Confounds the result.
- **Geo testing without matched controls.** Differences may be seasonal, not ad-driven.
- **Treating attribution and incrementality as the same.** They're different questions.

## Summary

- Attribution = credit; incrementality = causation.
- Brand search is the most over-attributed channel; 60-90% non-incremental in typical accounts.
- Run brand search suppression test as the cheap entry point.
- Drafts & Experiments for rigorous within-platform tests.
- Geo holdouts for cross-platform / cross-channel effects.
- MMM for multi-channel attribution at scale.
- Rebalance budget toward incrementality-true winners.

Next module: operating the system.
