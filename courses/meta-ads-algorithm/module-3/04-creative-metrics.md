---
module: 3
position: 4
title: "Creative metrics that matter"
objective: "Read the signal correctly."
estimated_minutes: 7
---

# Creative metrics that matter

## The trap of vanity metrics

Meta Ads Manager surfaces 60+ metrics. Most are noise. A few drive decisions. The mistake is staring at every column instead of the four or five that actually predict outcomes.

The metrics that matter cluster into three layers:

1. **Stop the scroll** — hook layer.
2. **Hold the attention** — body layer.
3. **Convert the action** — outcome layer.

Strong creatives win at all three. Weak creatives fail at one and the whole funnel breaks.

## Layer 1: stop the scroll

**Hook rate** (covered Module 3 Lesson 1): 3-second video plays / impressions. Industry baseline 25-35%, strong 40-50%. Below 20% the hook is broken.

**Thumb-stop rate** is the deduplicated version (3-second plays / unique reach). Use whichever your reporting supports.

**Click-through rate (CTR)** is a fast proxy. Above 1% on broad placements is healthy; above 2% is strong. CTR below 0.5% usually correlates with weak hook.

Read these together. High hook rate, low CTR means the hook stops people but the body doesn't earn the click — a body problem. Low hook rate, low CTR is a hook problem.

## Layer 2: hold the attention

**Video average watch time** in seconds. For 15s videos, average over 4-5s is decent. For 30s videos, 7-10s. Absolute values mean less than relative comparison across creatives in the same ad set.

**Video plays to 50%, 75%, 100%.** Drop-off curve tells you where the body loses people. A sharp drop at 50% means the middle is weak; smooth fall-off means the body is uniformly fine.

**Engagement rate** — likes, comments, saves, shares per impression. Strong organic engagement signals the algorithm "this is content people want," which often improves delivery quality (lower CPM).

These aren't direct revenue metrics but they correlate. Weak engagement + weak hook = creative that won't scale.

## Layer 3: convert the action

The metrics you actually pay for:

**CPA / cost per result.** Cost to acquire the optimization event. For a $50 product, $20 CPA might be acceptable; for a $5 lead, $1.50 might be. Context-dependent.

**ROAS (return on ad spend).** Revenue / spend. E-commerce target is usually 2-5x depending on margin. Below your break-even ROAS = losing money; above = scale.

**CVR (conversion rate).** Of the people who clicked, how many converted. CVR isolates landing-page + offer + creative-promise alignment. If CTR is strong but CVR is weak, the ad over-promises or the landing page underdelivers.

**CPC (cost per click).** Useful as a diagnostic. Rising CPC = audience fatigue or competitive crowding. Falling CPC = healthier creative or seasonal opportunity.

## Composite reads

The diagnostic power comes from reading metrics together:

- **High hook rate + low CTR**: hook is bait; body doesn't deliver. Fix the body.
- **High CTR + low CVR**: ad over-promises or landing page is off. Tighten promise or fix the page.
- **High CTR + high CVR + high CPA**: scaling problem — frequency is up, audience saturating. Add creative variety.
- **Low hook + low CTR**: kill or rebuild the creative.
- **High ROAS + high CPM**: a small audience converting well. Test scaling carefully — CPM may rise faster than CVR.

A single metric in isolation rarely tells you what to do; the pattern across metrics does.

## Frequency and creative fatigue

**Frequency** = total impressions / unique reach over a time window. Watch it per creative and per ad set.

Per creative:

- 1-3: fresh phase.
- 3-6: optimal performance window.
- 6-10: fatigue starts; CPA usually rises.
- >10: clear fatigue; rotate.

Per ad set (broader denominator): healthy is 2-5 over 30 days.

When frequency rises, the algorithm has run through the most-likely-to-convert users and is re-showing to the rest. Adding new creative resets the per-creative count and pushes ad-set frequency back down because the algorithm has new options to rotate.

## CPM and what it tells you

**CPM (cost per 1,000 impressions)** is the auction's price tag. Rising CPM means the auction got more expensive — usually because:

- Your relevance is lower (low quality/engagement rate).
- Competition increased (others bidding more aggressively).
- Audience saturated (you're crowding fewer remaining users).
- Seasonality (Q4 always rises).

CPM isn't directly your problem if conversion rate scales with it. CPM rising by 30% while CVR rises by 50% is a net win. CPM rising 30% while CVR flat is a problem.

## Quality / engagement / conversion ranking

The three relevance diagnostics (covered Module 1) are creative metrics too:

- **Quality ranking**: ad-vs-competing-ads same audience, on creative quality + post-click experience.
- **Engagement rate ranking**: hook + format strength.
- **Conversion rate ranking**: landing-page + pixel-event accuracy.

Use them to diagnose which layer is weak. Below-average engagement → fix hook + format. Below-average conversion → fix landing page + tracking.

## Attribution windows and what you're measuring

By default, Meta reports conversions using a 7-day-click + 1-day-view window. The "7-day click" is the dominant signal — conversions where the user clicked within 7 days before purchase.

For longer sales cycles, switch to 7-click + 1-view (default) or use "Compare attribution settings" to see how the numbers change at different windows.

The 1-day-view counts users who saw but didn't click then converted. View-through is real for high-volume brands but easily inflates reported numbers — use with care.

## What to ignore most of the time

- **Reactions / comments count** in isolation — engagement is fine but not predictive of conversion.
- **Reach without frequency** — meaningless without context.
- **Estimated audience size** — Meta's estimate has known accuracy issues.
- **CPM in isolation** — only meaningful relative to CVR change.

## Operating dashboards

A clean daily view shows: spend, CPA, ROAS, CTR, hook rate, frequency. 6 columns. Anything more is noise.

A creative-level view shows: spend per ad, CPA per ad, hook rate per ad, frequency per ad, conversions per ad. Sortable by spend or by CPA.

A weekly review adds: trend lines vs prior week on the same metrics. The deltas tell you what changed.

## Mistakes to avoid

- **Optimizing for engagement rate** when the campaign is for conversions — engagement is a diagnostic, not the goal.
- **Killing on CPA alone** without checking volume — high CPA at low volume is noise.
- **Praising ROAS without margin context** — 2x ROAS on a 20% margin product is a loss.
- **Ignoring frequency until performance drops** — by then you're 2 weeks behind.

## Summary

- Three layers: hook (stop), body (hold), outcome (convert).
- Per layer: hook rate, watch time/engagement, CPA/ROAS/CVR.
- Read metrics together; single metrics mislead.
- Frequency 3-6 per creative is the sweet spot; >10 is fatigue.
- CPM matters relative to CVR change, not absolutely.
- Daily dashboard: 6 metrics. Weekly: same plus trend deltas.

Next module: Measurement and attribution in the post-iOS 14.5 world.
