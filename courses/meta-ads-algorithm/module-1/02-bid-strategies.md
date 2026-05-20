---
module: 1
position: 2
title: "Bid strategies and what they mean"
objective: "Pick the right bid strategy."
estimated_minutes: 6
---

# Bid strategies and what they mean

## The simple version

Meta offers a handful of bid strategies — the dial that decides how Meta decides your bid in the auction:

- **Lowest cost** (default): Meta bids whatever it needs to get the most results within your budget. No bid cap.
- **Cost cap**: aim for average cost per result at or below a target.
- **Bid cap**: never bid above a fixed amount.
- **ROAS goal** (for purchase optimization): target a minimum return on ad spend.
- **Value optimization**: maximize total purchase value, not just count.

For most accounts: lowest cost + a daily budget. Add caps only when you have data showing them necessary.

## The technical version

### Lowest cost (the workhorse)

Meta bids dynamically to maximize results within budget. The cost per result floats with auction conditions. Best for:

- New campaigns with no historical data.
- Scaling up — the system bids whatever wins enough volume.
- Most direct response cases.

Risk: in a hot market, cost per result can spike. Watch CPMs.

### Cost cap

Set a target average cost per result. Meta tries to keep average at-or-below that cost; individual results may be higher or lower.

Best for: accounts with strong target unit economics, willing to trade volume for predictable cost. Worse than lowest cost in delivery (you'll lose impressions where Meta's predicted cost exceeds your cap).

Use when: scaling is constrained by margin and you'd rather underspend than pay more per conversion.

### Bid cap

Hard ceiling per bid. Meta never bids above this. Most restrictive.

Best for: very experienced advertisers with strict cost discipline and willing to accept dramatic underspend. Often too tight; lowest cost or cost cap usually beat bid cap in practice.

### ROAS goal / value optimization

For purchase-optimized campaigns where revenue varies per customer:

- **Value optimization**: Meta tries to maximize purchase value, weighting users by predicted spend.
- **ROAS goal**: minimum ratio of revenue / spend.

Requires accurate purchase value data via pixel/CAPI. Best for: e-commerce with significant variance in basket size.

### When caps help

Caps make sense when:

- Lowest cost is consistently above your unit economics.
- You have stable historical CPA data.
- Volume isn't your primary constraint.

Caps hurt when:

- Set too low — campaigns underspend or stop delivering.
- Used on new campaigns — not enough data for the system to optimize within the cap.

### Practical defaults

For most accounts:

1. **Start with lowest cost + daily budget.**
2. **Optimize for the bottom-funnel event you actually want.**
3. **Measure CPA over 7-14 days** (not 1 day; learning phase distorts).
4. **If CPA is above target consistently**, try cost cap at ~10-20% above current average.
5. **Don't switch caps frequently** — each switch restarts learning.

### Budget vs bid

Daily budget caps spend; bid strategy controls how Meta bids within that budget. Both matter:

- Budget too low → can't escape learning phase (need ~50 events/week per ad set).
- Bid cap too low → underspend even when budget allows.

Right combination: enough budget to learn + bid strategy that fits your unit economics.

### Campaign budget vs ad set budget

- **Ad set budget**: you control allocation per ad set.
- **Campaign budget (CBO / Advantage budget)**: Meta allocates across ad sets in the campaign.

Modern recommendation: CBO with broad audiences. Meta moves budget to better-performing ad sets automatically. Manual allocation usually loses to ML at scale.

## Summary

- **Lowest cost** is the default; works for most cases.
- **Cost cap** for predictable unit economics at the cost of volume.
- **Bid cap** is the most restrictive; use sparingly.
- **Value/ROAS goal** for purchase optimization with varying basket sizes.
- **Don't change strategies frequently** — learning phase restarts.
- **Campaign budget (CBO)** beats manual allocation at scale.
