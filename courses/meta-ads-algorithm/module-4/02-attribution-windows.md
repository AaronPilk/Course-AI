---
module: 4
position: 2
title: "Attribution windows and what they mean"
objective: "Read Meta's numbers honestly."
estimated_minutes: 7
---

# Attribution windows and what they mean

## What attribution means

When a user converts after seeing or clicking an ad, attribution decides which ad gets credit. Meta's attribution window is the time period within which a conversion is credited to an ad interaction. Default: 7 days after click, 1 day after view.

Pre-iOS 14.5, the default was 28-day click + 1-day view. After Apple's privacy changes, Meta shortened to 7-day click as the default — partly because iOS users' attribution signal degrades after 24 hours in many cases.

Understanding the window you're reporting on is critical because Meta's "conversions" number is window-dependent, not absolute.

## Click vs view attribution

**7-day click**: user clicked the ad within 7 days before the conversion. The most defensible attribution — there's a verified action linking the ad to the user.

**1-day view**: user saw the ad (impression with no click) within 1 day before the conversion. Weaker signal — user was exposed but didn't click; their decision may have nothing to do with the ad.

Most accounts read primarily off 7-day click. View-through is real for high-volume brands but tends to inflate reported conversions, especially for users who would have converted anyway.

## How Meta resolves multi-touch

A user might:

- See your ad on Monday (view).
- See it again Tuesday and click (click).
- Convert Friday.

Within the 7-day-click + 1-day-view window:

- Tuesday's click is within 7 days of Friday's conversion → click attribution wins.
- Monday's view-only is older than Tuesday's click; ignored.

Meta picks the most recent qualifying interaction within the window. If the user has both a click and a view, click wins. If only a view, view counts (if within 1 day).

## Comparing attribution settings

The "Compare attribution settings" view in Ads Manager lets you see the same conversions under different windows:

- 1-day click.
- 7-day click.
- 7-day click + 1-day view.
- 28-day click + 1-day view (where supported).

Useful diagnostic: if 28-click numbers are 50% higher than 7-click, your sales cycle is longer than 7 days and you're under-counting in the default report. For high-AOV or considered-purchase products, 28-day click better reflects reality.

You can't change the auction-optimization window (Meta uses 7-day click + 1-day view internally), but you can change the reporting window to see longer-tail conversions.

## Modeled conversions

Meta uses statistical modeling to estimate iOS conversions it can't directly observe. After AEM and ATT, a portion of conversions are "modeled" — Meta infers them from patterns rather than receiving them directly.

In Ads Manager you'll see these mixed with reported conversions. They're estimates; treat them with skepticism for tight-margin decisions but use them for direction-finding.

Modeled conversions can be:

- 5-15% of total reported conversions in a typical account.
- Higher in iOS-heavy verticals (consumer apps).
- Lower in B2B or desktop-heavy accounts.

## The conversion lag

Conversions take time. A user clicks an ad Monday and converts Wednesday; the click was attributed Monday but the conversion lands in Wednesday's data — sometimes lagged further if your CAPI sends events delayed.

Practical impact:

- **Yesterday's CPA** in Ads Manager is incomplete — conversions are still arriving for it.
- **3-day-old CPA** is mostly stable.
- **7-day-old CPA** is fully stable for the 7-click window.

Don't make spend decisions on yesterday's data. Wait 3 days minimum for early-cycle stability; 7 days for finalized numbers.

## Comparing Meta's numbers to ground truth

Most accounts have three places revenue is counted:

- **Meta Ads Manager** (Meta's view based on pixel + CAPI + modeling).
- **Shopify / your e-commerce platform** (actual orders).
- **Google Analytics 4** (third-party view with cross-channel attribution).

These three rarely agree. Differences come from:

- Different attribution windows (Meta 7-click + 1-view vs GA4 last-non-direct).
- Tracking loss in one but not the other (CAPI might catch what GA4 misses).
- Double-counting (Meta claiming sales that came from another channel).
- Cross-device journeys handled differently.

Meta usually claims more sales than Shopify directly attributes. Reasonable accounts pick one as their source of truth (usually e-commerce platform total revenue) and use the others as diagnostics.

## Incrementality vs attribution

Attribution = "this ad got credit for this sale." Incrementality = "this ad caused this sale that wouldn't have happened otherwise."

These differ when:

- A user would have bought anyway and the ad just got credit because they happened to see it (last-touch).
- A user was driven by another channel and Meta claimed it via view-through.

True measurement uses **incrementality tests** (covered next lesson) to separate causal lift from claimed attribution. Most accounts run on attribution alone, which usually overstates Meta's true contribution by 10-30%.

## Practical attribution rules

When reading Meta numbers:

1. **Stick to 7-day click** for daily/weekly decisions on most accounts.
2. **Check 28-day click** monthly if your sales cycle is long.
3. **Treat view-through with skepticism.** Helpful for high-volume brand campaigns, less so for direct response.
4. **Wait 3 days** before evaluating yesterday's performance.
5. **Pick one source of truth.** Reconcile differences but don't average them.
6. **Test incrementality periodically** (every 6-12 months) to ground your attribution numbers.

## Reporting cadence

A clean rhythm:

- **Daily**: spend, CPA, ROAS, hook rate at the 7-day-click report. Look at 3+ day-old data for stability.
- **Weekly**: same metrics with prior-week deltas. Read 7-day finalized data.
- **Monthly**: include 28-day click view, modeled vs reported split, and reconciliation with platform revenue.

This rhythm avoids the trap of reacting to noisy intraday data while keeping you tight enough to catch issues.

## When attribution misleads worst

- **Brand search campaigns crediting brand search clicks** that would have happened anyway (organic search demand). Use brand-name campaign suppression tests.
- **Retargeting taking credit for already-decided buyers.** Cart abandoners often convert anyway; retargeting claims much of it.
- **View-through during big sales.** When everyone's buying anyway (Black Friday), view-through massively inflates.

Be skeptical of attribution when the user was already on a buying path.

## Mistakes to avoid

- **Comparing today's CPA to last week's.** Today's is incomplete; comparison is unfair.
- **Reading 1-day click on a long-cycle product.** Will look terrible when actual sales arrive later.
- **Trusting view-through as causal.** View-through is correlation; click attribution is closer to causation.
- **Switching windows mid-analysis.** Pick one window for the report.
- **Ignoring platform revenue mismatches.** If Meta says $100k and Shopify says $50k, something needs explaining.

## Summary

- Default window: 7-day click + 1-day view. Most decisions live there.
- View-through is real but easily inflated; treat skeptically.
- Modeled conversions estimate iOS-missing data; use for direction.
- Wait 3+ days for stable read; 7 days for final.
- Meta's numbers usually claim more than platform revenue shows; reconcile.
- Attribution ≠ incrementality; periodically test.

Next: incrementality testing — proving causal lift.
