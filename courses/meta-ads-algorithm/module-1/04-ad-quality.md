---
module: 1
position: 4
title: "Ad quality and the quality ranking"
objective: "Improve the quality multiplier."
estimated_minutes: 6
---

# Ad quality and the quality ranking

## The simple version

Ad quality is the third leg of the auction (after bid and estimated action rate). Meta scores three dimensions and shows them in Ads Manager as "Ad relevance diagnostics":

- **Quality ranking**: how engaging your ad is relative to ads competing for the same audience.
- **Engagement rate ranking**: how engaged users are (clicks, reactions, comments, shares, video views).
- **Conversion rate ranking**: how often clicks turn into conversions.

Each is shown as Below Average (bottom 35%), Average, or Above Average. Multiple below-average rankings drag your total value down significantly.

## The technical version

### What Meta scores

**Quality ranking** combines:

- Signals about creative quality (visual, copy, format).
- User feedback (negative feedback / hide ad rates).
- Post-click experience (slow LP, broken links, deceptive content).
- Policy issues (low-quality attributes Meta flags).

**Engagement rate ranking**: predicted engagement vs others competing for the same audience.

**Conversion rate ranking**: predicted conversion vs others (only for ads optimizing for a conversion).

### Why this matters

A below-average dimension typically reduces effective bid significantly. Multiple below-averages compound; you end up paying much more per result for the same nominal bid.

Improving from Below Average to Average on one dimension can drop CPA meaningfully without changing anything else.

### How to improve quality

Read the diagnostic; address the specific dimension that's weak.

**Low quality ranking**:
- Look at negative feedback (hides, reports). Meta surfaces top reasons in some reports.
- Improve creative: less clickbait, better visual quality, clearer value proposition.
- Avoid disallowed phrases ("you" with personal attributes; before/after weight-loss; etc.).
- Match audience expectations — if you're targeting interest X, the ad should clearly relate.

**Low engagement ranking**:
- Stronger hook (first 3 seconds for video; first line of copy).
- More dynamic format (Reels-native video vs static).
- Better call-to-action wording.
- Test multiple creative variants.

**Low conversion rate ranking**:
- Post-click experience: page load speed, mobile-friendly, clear path to conversion.
- Promise-fulfillment: does the LP deliver what the ad promised?
- Conversion event tracking: bad pixel data shows as low conversion rate.

### Policy and quality

Some "low quality" issues are policy-adjacent:

- **Sensational/clickbait language**: Meta penalizes "you won't believe..." type copy.
- **Engagement bait**: "Like if you agree" etc.
- **Misleading claims**: weight loss before/after, miracle cures.
- **Personal attributes**: directly addressing protected characteristics.

Meta provides specific guidance in Ads Manager; review the policy section if quality is mysteriously low.

### Negative feedback signal

When users click "Hide ad" or "Report ad," that's strong negative signal. A few isolated hides are normal; a meaningful percentage is a quality crisis.

Reduce by: avoiding spammy/intrusive creative, respecting frequency caps, ensuring relevance.

### Quality and audience

Quality is contextual. The same ad can rank Above Average for one audience and Below Average for another — relevance varies.

This is one reason narrow audiences sometimes look bad: the creative doesn't resonate uniformly. Broader audiences let the system find the segments where the ad ranks well.

### Real-world impact

Two ads with the same bid, same audience:

- Ad A: Above Average quality, Above Average engagement.
- Ad B: Below Average quality, Average engagement.

Ad A typically wins more impressions and pays less per result. Same dollar bid, different effective cost. The quality multiplier is real.

### What to watch

In Ads Manager: enable the "Ad relevance diagnostics" columns. Check weekly:

- Any Below Average dimensions on top-spending ads.
- Trends — is quality dropping (fatigue) or rising (improving creative)?
- Per-creative breakdown to identify which variants are weak.

### Quality vs scale

Quality matters more when you're competitive at scale. A small budget can tolerate mediocre quality if you're not in heavily-contested auctions. As you scale, you're competing against more, better, established advertisers — quality differences compound.

## Summary

- **Ad quality** is the third leg of the auction (after bid and EAR).
- **Three diagnostics**: quality, engagement, conversion rate rankings.
- **Below Average dimensions** reduce effective bid substantially.
- **Address the specific dimension** Meta flags.
- **Quality is contextual** to audience and competition.
- **Watch trends weekly**; act on Below Average findings.
