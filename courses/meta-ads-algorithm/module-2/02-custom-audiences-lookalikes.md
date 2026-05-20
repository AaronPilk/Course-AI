---
module: 2
position: 2
title: "Custom audiences and lookalikes done right"
objective: "Seed the algorithm with real buyer signal."
estimated_minutes: 7
---

# Custom audiences and lookalikes done right

## What they are

A **custom audience** is a list of people Meta can match — uploaded from your CRM, captured via pixel events (site visitors, video viewers), or pulled from engagement (Instagram followers, lead form openers). It's a set of known users, not a prediction.

A **lookalike audience** is Meta's prediction: "given this seed of known good users, find 1% (or 5%, or 10%) of the population most similar to them." Meta does the similarity math across hundreds of behavioral signals.

Both are tools for telling the algorithm what good looks like. They don't replace broad targeting — they complement it for retargeting (custom) or for seeding cold acquisition (lookalike).

## Custom audience sources

In rough order of signal quality:

1. **Purchasers from CRM** with email + phone + name uploaded — highest quality, Meta can match ~60-80% of the list. This is your retargeting and lookalike-seed gold.
2. **Pixel purchasers** (last 180 days) — high quality, but pixel-side signal can be lost to iOS opt-out.
3. **Pixel high-intent** (add to cart, initiate checkout, last 30 days) — useful for cart-abandon retargeting.
4. **Site visitors** (last 30 days) — fine for top-of-funnel retargeting but contains a lot of non-buyers.
5. **Video viewers** (75%+ of a video) — engagement signal, weaker than purchase signal.
6. **Lead form openers / Instagram engagers** — broad behavioral signal.

The CRM upload is the most powerful because it carries clean buyer signal directly from your business — uncorrupted by tracking loss.

## How to use custom audiences

Two main jobs:

### Retargeting

Show ads to people who already engaged. Common segmentation:

- Cart abandoners (initiated checkout in last 7-14 days, didn't purchase) → checkout-completion ad.
- Site visitors (last 14-30 days) → reminder ad with social proof.
- Video viewers (75% of a hero video) → product-detail ad.
- Past purchasers (last 60 days) → upsell or cross-sell, not the same product.

Keep retargeting budget small relative to acquisition — usually 10-20% of total spend. Big retargeting budgets mean you're paying to reach people who would have come back anyway.

### Exclusion

Use custom audiences as exclusions on your acquisition campaigns to keep prospecting from being wasted on existing customers or recent visitors. Example: exclude "purchasers last 90 days" from a cold prospecting set so you're not paying to find them again.

## Lookalike audiences

Lookalikes take a custom audience as a seed and predict who else looks similar. The percentage controls audience size and similarity tradeoff:

- **1% lookalike**: ~2.5M users in a country the size of the US. Closest to seed; highest similarity.
- **2-5%**: looser, larger, more reach.
- **10%**: very loose — basically broad with a tilt.

### Seed quality is everything

A lookalike of 100 random site visitors is worse than broad targeting. A lookalike of 5,000 verified purchasers from your CRM is gold.

Rule of thumb: seed should be ≥1,000 high-quality events, ideally 5,000-10,000. Below 1,000, the similarity math gets noisy; above 10,000 you're not gaining much.

### Recency matters

A lookalike of "purchasers ever" includes people from 5 years ago who don't shop like today's customer. Use rolling-window seeds:

- "Purchasers last 180 days" → freshest commercial signal.
- "Top 25% LTV last 365 days" → high-value lookalike for premium offers.

Refresh the seed regularly (auto-updating audiences refresh daily by default for pixel-based, weekly for CRM uploads).

### Value-based lookalikes

Upload a CRM list with a value column (LTV, AOV, or revenue per customer). Meta will weight the lookalike toward your higher-value customers. Useful when you have a wide LTV spread — finding the 20% of customers who drive 80% of revenue.

## Lookalike vs broad — which to use

Historically: 1% lookalikes were the default acquisition audience. Now: broad targeting often performs as well or better because the algorithm's behavioral inference has caught up.

Test it: same creative, same budget, same optimization event.

- Ad set A: 1% lookalike of last-180-day purchasers.
- Ad set B: broad (country + age only).

Usually broad wins on volume and CPA in mature accounts. Lookalike wins for newer accounts (weaker pixel signal) or very specific niches.

## Audience overlap

If you run multiple ad sets in the same campaign with overlapping audiences (broad + 1% lookalike + interest stack), they bid against each other in the auction. Meta's auction picks one ad per user but the overlap creates inefficiency.

Use the audience overlap tool (in Ads Manager) to check before launching. >20% overlap between ad sets is a sign to consolidate.

Modern practice: run one acquisition audience (broad, or a single lookalike) plus separated retargeting. Don't stack three "prospecting" ad sets.

## Custom audience size matters

A 500-person custom audience is too small to retarget meaningfully — Meta will mark it "audience too small" or deliver inefficiently. Aim for retargeting audiences of 10k+ unique users for stable delivery.

If your audience is too small, widen the window (30 days → 90 days), add more event types (visitors + cart adders), or accept the smaller delivery.

## Privacy and matching rates

Meta can only match users it can identify. The matching rate from a CRM upload depends on:

- Email/phone presence and accuracy.
- Whether users have Meta accounts with those identifiers.
- Hashing (Meta hashes on upload; you can pre-hash if you have privacy requirements).

Typical match rates: 40-80% for B2C consumer email lists, 20-50% for B2B work-email lists. The unmatched portion is just lost — it's not used.

## Mistakes to avoid

- **Tiny seed lookalikes** — under 1,000 high-quality events produces a noisy lookalike.
- **Old seed** — purchasers from 3 years ago aren't your current buyer.
- **No exclusion of customers from prospecting** — wasted spend reaching existing buyers.
- **Stacking three lookalikes** in one campaign — auction overlap, no extra reach.
- **Treating site-visitors-90d as a lookalike seed** — too many non-buyers; the lookalike points at window shoppers.

## Summary

- Custom audiences = known users (CRM, pixel, engagement). Use for retargeting and exclusion.
- Lookalikes = ML predictions based on a seed. Seed quality is everything.
- Seed should be 1k-10k high-quality events, ideally CRM purchasers from last 180 days.
- 1% is closest; 5-10% is loose. Smaller % isn't always better — test.
- Broad often beats lookalikes now; test head-to-head.
- Exclude existing customers from prospecting.

Next: Advantage+ campaigns — Meta's full automation tier.
