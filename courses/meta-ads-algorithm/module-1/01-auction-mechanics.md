---
module: 1
position: 1
title: "The auction in one paragraph"
objective: "Understand who wins an impression."
estimated_minutes: 6
---

# The auction in one paragraph

## The simple version

For every impression Meta could show you an ad in, an auction runs in milliseconds among all eligible advertisers. The winner isn't who bids most — it's who has the highest **total value**:

```
total value ≈ bid × estimated action rate × ad quality
```

- **Bid**: how much you're willing to pay for the action you optimized for.
- **Estimated action rate**: ML-predicted probability this person takes that action if shown your ad.
- **Ad quality**: signals about creative quality and post-click experience.

A small advertiser with a great ad can outbid (in total value) a giant brand with a mediocre one. The system rewards predicted relevance, not just dollar bids.

## The technical version

### Who's eligible for the auction

For each impression opportunity Meta has (someone scrolling Feed, opening Reels, etc.), the eligible advertisers are those whose:

- Campaign objective matches the surface.
- Targeting criteria include this user.
- Budget hasn't been exhausted today (for daily-budgeted campaigns).
- Ad isn't disapproved.
- Placement matches.

Filtering happens fast; remaining candidates go to the auction.

### Computing total value

For each eligible ad:

1. **Bid**: from the advertiser's settings (or implicit from optimization). For "Lowest cost" bid strategy, Meta sets the bid; for bid cap or cost cap, the advertiser does.
2. **Estimated action rate**: ML model predicts P(user takes optimized action | sees this ad). The optimized action is what you set — purchase, link click, app install, etc.
3. **Ad quality**: composite signal about creative quality, post-click experience, user feedback, policy compliance.

Total value = product (or weighted combination — exact formula isn't public). Highest total value wins.

### What "estimated action rate" actually predicts

Critical to understand: the system predicts the **optimization event you chose**. If you optimize for purchases, EAR predicts purchase probability. If you optimize for link clicks, EAR predicts click probability — a completely different ML signal.

This is why optimizing for the right event matters more than fancy targeting. Optimizing for clicks gets you click-y users; for purchases gets you purchase-y users. The system finds whatever you said you wanted.

### Quality ranking

Meta's "Ad relevance diagnostics" gives three scores:

- **Quality ranking**: how engaging vs other ads competing for the same audience.
- **Engagement rate ranking**: predicted vs others.
- **Conversion rate ranking**: predicted vs others.

Below-average rankings hurt total value. Above-average help. The system explicitly tells you which dimension is weak; act on it.

### Pacing

Meta doesn't spend your daily budget in the first hour. The pacing system spreads delivery across the day, hitting the auctions where your total value is competitive.

If your bid is too low, you lose all auctions and underspend. If too high, you spend efficiently but at higher CPM. Cost cap and bid cap let you constrain; lowest cost lets Meta find the optimal point.

### Why the auction model matters

Three implications:

1. **You can't just outbid bad creative**. A 2x bid can't make up for a 5x worse EAR.
2. **Predicted relevance is the lever**. Better creative + better targeting + better post-click = higher EAR = lower effective cost.
3. **Optimization event matters more than targeting**. The ML finds users likely to take *the action you specified*. Pick the right action.

### Auction outcomes you'll observe

- **High CPM, low conversions**: bidding aggressively in expensive auctions but EAR is low. Improve creative and conversion event signal.
- **Low spend**: total value isn't competitive; either bid too low (lowest cost will fix) or audience is too small for the budget.
- **High frequency**: not enough new users matching audience; either expand audience or accept fatigue.

### Real-world: small budgets vs giants

A common founder concern: "Can I compete with brands spending $10M/month?" Yes — for the impressions where your total value beats theirs. A great creative for a niche audience can win auctions consistently even at modest budget, because the auction is per-impression and total-value-based, not pooled.

What you can't do at small budget: get out of the learning phase (which needs ~50 events/week per ad set) on too many ad sets simultaneously. Consolidate spend; let the system learn.

## Summary

- **Total value** = bid × estimated action rate × ad quality wins auctions.
- **EAR predicts the optimization event** — pick it carefully.
- **Quality ranking** explicitly tells you which dimension is weak.
- **Better creative** beats higher bids in the long run.
- **Small budgets** can win specific auctions; can't escape learning phase across too many ad sets.

Next: bid strategies in detail.
