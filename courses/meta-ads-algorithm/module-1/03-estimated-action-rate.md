---
module: 1
position: 3
title: "Estimated action rate — the ML prediction"
objective: "See how Meta scores you."
estimated_minutes: 6
---

# Estimated action rate — the ML prediction

## The simple version

Estimated action rate (EAR) is Meta's prediction of how likely a specific user is to take your optimized action if shown your ad. It's the ML signal at the heart of the auction.

Inputs to EAR:

- This user's past behavior (engagement patterns, purchase history on platform, signals from your pixel/CAPI).
- Your ad's historical performance (CTR, conversion rate, dwell time).
- Creative features (visual content, copy, format).
- Context (placement, time, device).
- Similar advertisers / similar users.

Outputs: a probability per impression opportunity. The auction multiplies this by your bid; the system picks the highest total value.

You can't see EAR directly, but you see its effects: higher CPMs (Meta thinks you'll convert and others are competing for the same user), lower CPMs (Meta isn't confident), high frequency (audience too small for confident matching).

## The technical version

### What EAR depends on

The model uses many signals; the public-facing levers:

- **Conversion event volume**: more events → better model fit. The famous "50 events per ad set per week" is the rough threshold for exiting learning phase.
- **Conversion event quality**: deduplicated, server-side via CAPI, accurate event-match-quality. Bad data → bad EAR.
- **Creative engagement**: CTR, video watch time, comments. Tells Meta which creatives engage users like the ones you want.
- **Audience signal**: pixel data, custom audiences from CRM, lookalike modeling.

### Why volume matters

ML needs data. Below ~50 weekly events per ad set, the model can't learn; it stays in learning phase, delivery is exploratory, CPA fluctuates widely. Above that threshold, the model has stable EAR predictions; performance stabilizes.

Implication: don't fragment budget across many ad sets. Consolidate to fewer ad sets that each get enough events to learn.

### Event match quality (EMQ)

Meta scores how well it can match your conversion events back to users. Higher EMQ = better EAR.

Improve EMQ by:

- Sending events via Conversions API (server-side) in addition to pixel.
- Including hashed user data (email, phone, IP, user agent).
- Deduplicating pixel + CAPI events with the same event_id.
- Sending all relevant events (ViewContent, AddToCart, Purchase) — not just purchase.

Check EMQ in Events Manager. Below 6.0 is a problem.

### The role of creative

Creative isn't just artistic — it produces strong EAR signals. A high-CTR thumbnail tells Meta which users engage; the system finds more of them. A low-engagement creative gives Meta poor signal regardless of targeting.

This is why "creative is the new targeting" in 2026: the ML system's targeting depends on creative-driven signals.

### iOS 14.5 and signal loss

When Apple introduced App Tracking Transparency, most iOS users opted out of cross-app tracking. Meta lost a major signal source. EAR quality on iOS dropped; reported attribution dropped further (with Aggregated Event Measurement constraints).

Mitigations Meta and advertisers use:

- Conversions API (server-side, doesn't need IDFA).
- Aggregated Event Measurement (8 events ranked per domain).
- Modeling to fill in attribution gaps.

Result: EAR is less precise than pre-iOS-14.5 but still functional. Don't compare current performance to 2020 benchmarks; the system is genuinely different.

### Why narrow audiences often underperform

A narrow audience might seem more relevant — but EAR works at the impression level. The ML finds high-probability converters across whatever audience you specified. If the audience is small and uniform, the model has fewer ways to find pockets of high-EAR users.

Broad audiences + great creative + strong conversion signal often beat narrow audiences + mediocre creative. The system's targeting capability is more flexible than human-defined audience definitions.

### Common EAR-killers

- **Disabled pixel events** → no conversion signal.
- **Wrong event optimization** → EAR predicts the wrong thing.
- **Fragmented budget** → no ad set reaches 50 events.
- **Stale creative** → engagement degrades.
- **Poor post-click experience** → users bounce; system learns "this ad doesn't convert."

### What to watch in Ads Manager

- **CPM**: high CPMs against competitive audiences are normal; sustained spikes suggest competition or audience saturation.
- **Frequency**: above 3-4 per week often indicates audience too small.
- **CTR**: relative to your account history more useful than absolute; trend matters.
- **Conversion rate (LP→event)**: site/app performance feeds back into EAR.

## Summary

- **EAR** = ML probability of optimized action; the auction's main scoring input.
- **Volume + quality of conversion events** drives EAR quality.
- **Creative signals shape EAR** as much as targeting.
- **iOS 14.5 caused real signal loss**; Conversions API restores some.
- **Broad audiences + strong creative** typically outperform narrow targeting.
- **Don't fragment budget** — 50 events/week per ad set is the rough learning threshold.
