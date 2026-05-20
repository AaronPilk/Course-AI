---
module: 1
position: 1
title: "Ad Rank reimagined — the four signals"
objective: "What the auction actually ranks on."
estimated_minutes: 7
---

# Ad Rank reimagined — the four signals

## The auction in 2026

Every time someone types a query into Google, an auction runs. Hundreds of advertisers may have triggered on that query. Google's job is to pick which ads to show and in what order — within milliseconds, while predicting how relevant each ad will be to the user and how much each advertiser values the click.

The system that does this is called **Ad Rank**. It hasn't been "highest bid wins" since 2002. In the modern auction, Ad Rank is composed of four signals working together. Understanding those signals is the foundation for understanding why Smart Bidding works, why broad match keywords no longer crater accounts, and why creative quality has become the lever it never used to be.

## The four signals

Google's documentation lists Ad Rank components officially as:

1. **Bid** — how much the advertiser is willing to pay for a click.
2. **Ad quality** — Google's prediction of how good the ad and landing page are for this user.
3. **Ad Rank thresholds** — minimum quality bars (set per query context).
4. **Context** — the user's device, location, time, query intent, and signal mix at that moment.
5. **Expected impact of assets and ad formats** — how much the additional ad components (sitelinks, callouts, structured snippets, images, etc.) lift expected performance.

A modern auction takes the user's query, evaluates each eligible ad on these signals, combines them into an Ad Rank score, and uses the score to decide position and pricing.

## Bid is no longer the dominant signal

In the 2010 auction, a higher bid could buy position even with weaker ads. In 2026, ad quality and context can outweigh bid significantly. An ad with strong expected CTR and a good landing page can outrank a higher-bidding competitor with weaker quality signals.

Practically: a $5 bid with quality score 9 often beats a $15 bid with quality score 4. Google's ML predicts that the higher-quality ad will generate more clicks and a better user experience, so it wins position even at lower bid.

This is why most advertisers stopped fixating on bid level around 2020 and started fixating on ad quality and signal richness.

## Ad quality is multi-component

"Ad quality" in the modern auction isn't a single number. It's a prediction Google's ML makes from many inputs:

- **Expected click-through rate** — given the query and the ad, how likely is the user to click?
- **Ad relevance** — does the ad copy match the user's intent?
- **Landing page experience** — does the landing page deliver what the ad promised? Loads fast? Mobile-optimized? Conversion-friendly?
- **Historical performance** of the ad and account.
- **User signals** specific to this query (recent searches, device behavior).

The system computes these per impression. A query like "running shoes for marathon training" might score an ad differently than the same ad against "running shoes near me" — the user intent is different, so the relevance prediction differs.

## The Quality Score visible to you

In the Ads Manager interface, Google exposes a simplified **Quality Score** per keyword: 1-10, plus diagnostic columns for expected CTR, ad relevance, and landing page experience.

Important caveats:

- Quality Score is a diagnostic, not the auction's actual signal. The real-time auction uses the multi-component prediction directly.
- Quality Score updates infrequently (every few days).
- Improving Quality Score from 6 to 8 is a positive directional signal, but Quality Score isn't what literally wins auctions — the underlying signal richness is.

Use Quality Score as a hint, not a religion.

## Context is the modern lever

"Context" in Ad Rank means the system adjusts for who's searching, from where, on what device, at what time, with what behavioral history. Two users typing the same query get different ad mixes because the auction's prediction for each user differs.

Implications:

- Time-of-day, day-of-week, and device performance matter — but Smart Bidding adjusts automatically; you don't set them manually anymore.
- Audience signals (covered Module 3) feed context — uploaded customer lists, in-market audiences, custom audiences, remarketing audiences all flow into context.
- Location and language context are handled by campaign settings + Smart Bidding adjustments.

Manual bid adjustments by device/location/time used to be a major lever; they've largely been deprecated in favor of letting Smart Bidding handle context.

## Expected impact of assets

The fifth signal — expected impact of assets and formats — rewards ads that use more ad components. A search ad with 4 sitelinks, 4 callouts, 2 structured snippets, and a price extension shows more real estate than one without, and (Google predicts) drives more clicks.

The ML weighs each asset's expected lift; you don't have to manually pick which assets show. Provide many; Google rotates and tests.

This is why "asset richness" became a 2020s account discipline: provide 6+ headlines, 4+ descriptions, 4+ sitelinks, 4+ callouts, 4+ structured snippets, 4+ images for assets that support them. Google picks combinations that win in each auction.

## How the price is set

After Ad Rank decides who shows, Google's **generalized second-price auction** decides what each advertiser pays. The simplification: you pay the minimum amount needed to outrank the ad below you. Not your full bid.

In modern Smart Bidding, you usually don't see your literal bid — you set a target (CPA or ROAS) and the system bids dynamically per query. The auction's pricing logic still applies under the hood; you just don't operate at that level anymore.

## What you actually control

The levers an advertiser controls in 2026:

- **Smart Bidding strategy and targets.** Target CPA, Target ROAS, Maximize Conversions, Maximize Conversion Value.
- **Conversion tracking quality.** What you tell the system counts as a conversion, with what value, and how cleanly the data arrives.
- **Audience signals.** First-party customer lists, in-market segments, custom audiences feeding the context layer.
- **Creative variety.** Headlines, descriptions, assets, landing pages.
- **Match types and negative keywords.** Defining what queries you're eligible for.
- **Account structure.** Campaigns, ad groups, asset groups (PMax).

What you no longer control directly:

- Per-keyword bids (under Smart Bidding).
- Per-device, per-location, per-time bid adjustments in most cases.
- Which audience signal wins which auction.
- Which combination of headlines/descriptions shows.

The shift is from operational control to strategic control. You set goals and feed signal; the system bids.

## The signal-richness principle

Across all of this, one principle dominates: **more signal beats more control.** The ML works better when it has rich, accurate conversion data, broad audience signals, and varied creative — and is allowed to act on them. Constraining the system (narrow match, manual bids, single-creative ads, sparse conversion data) almost always underperforms feeding it well.

This isn't because Google says so. It's because the auction is an ML system, and ML systems perform better with signal richness. Your job is to be the best signal provider possible.

## Mistakes to avoid

- **Treating bid as the primary lever.** Bid adjustment days are mostly over.
- **Optimizing for Quality Score number instead of underlying quality drivers.**
- **Single-asset ads.** Wastes the asset-impact signal.
- **Manual bid adjustments by device/location.** Smart Bidding handles them; manual fights the system.
- **Ignoring landing page speed and quality.** Major component of ad quality prediction.

## Summary

- Ad Rank = bid × quality + context + asset impact + thresholds.
- Quality is multi-component (CTR prediction, relevance, landing page, history).
- Context personalizes per user; let Smart Bidding handle it.
- Asset richness rewards accounts that provide many variants.
- Signal richness > operational control. Your job is to be a good signal provider.

Next: Smart Bidding strategies — what each one optimizes for.
