---
module: 4
position: 2
title: "Data-driven attribution explained"
objective: "Why last-click attribution is over."
estimated_minutes: 7
---

# Data-driven attribution explained

## The end of last-click

For most of digital advertising's history, last-click attribution was the default. Whichever ad got the last click before conversion got 100% of the credit. Earlier clicks got zero.

Last-click made sense when ads were simpler and customer journeys were shorter. It doesn't make sense in 2026, where:

- A typical conversion involves 3-8 touchpoints across channels and devices.
- Some users see ads days or weeks before clicking.
- The "last click" might be a brand-search click that the user took because of earlier ad exposure.
- Crediting only the last click systematically over-rewards bottom-funnel campaigns and starves top-of-funnel.

Google began deprecating non-DDA attribution models for most accounts in 2023-2024. By 2026 DDA is the default; last-click and other rules-based models are mostly unavailable in new campaigns.

## What data-driven attribution does

DDA uses machine learning to look at your actual conversion paths and assign credit fractionally to each touchpoint based on its observed contribution.

The model considers:

- **Path length.** How many touchpoints occurred.
- **Touchpoint order.** Which came first, last, in between.
- **Touchpoint types.** Different ad surfaces (Search vs Display vs YouTube).
- **Time between touches.** Recency effect.
- **Conversion vs non-conversion paths.** What separates paths that converted from paths that didn't.

The output: each touchpoint gets a fractional credit (0.0 to 1.0) summing to 1.0 per conversion. A path with 4 touchpoints might allocate credits like 0.3, 0.2, 0.15, 0.35 — the model learned that pattern of touchpoints with that timing tends to drive conversions.

## Why DDA usually beats last-click for advertisers

Three reasons:

**More credit to top-of-funnel.** Display and YouTube campaigns that contribute to consideration but rarely close get credit they earned. This stops the chronic under-budgeting of top-of-funnel.

**More accurate Smart Bidding signal.** Smart Bidding uses attribution data to predict per-auction value. DDA's richer credit distribution lets the system bid more accurately on touchpoints whose role is consideration rather than conversion.

**Better aligned with customer reality.** Last-click is a fiction we used because the math was easy. DDA models actual user behavior.

The general finding: when accounts switch to DDA, top-of-funnel campaigns show 20-40% more attributed conversions, bottom-of-funnel show 10-20% less. Total conversions reconcile correctly (no double-counting; credit is redistributed, not added). This usually leads to budget reallocation toward upper funnel.

## What DDA isn't

DDA isn't:

- A measure of incremental contribution. (DDA is still attribution — credit allocation among observed touchpoints, not causal lift.)
- A black box. Google explains the model's logic; you can see path lengths and touchpoint patterns.
- The same as cross-channel attribution. DDA is Google-only — it doesn't credit non-Google ad channels.
- Permanent. The model retrains regularly as your conversion patterns change.

For true causal contribution, you still need incrementality testing (covered next lesson). DDA is a better attribution model, not a measure of causation.

## Volume requirements for DDA

DDA needs sufficient conversion volume to learn from. Google's documentation suggests 300+ conversions across 30 days for the model to operate. Below that, DDA may fall back to rule-based logic.

For tiny accounts, DDA still gets selected but may behave more like a position-based model under the hood. Performance lift from DDA scales with volume.

## How DDA appears in reporting

When you switch to DDA, reporting changes:

- **Conversions** column shows fractional credit per click/campaign.
- A click that contributed 0.3 to a conversion shows as 0.3 in conversions.
- A campaign's total conversions = sum of all fractional credits attributed to its clicks.
- Total conversions across all campaigns equals actual conversion count (no double-counting).

In ad-set-level reporting:

- Top-of-funnel ad sets typically show higher conversion counts under DDA than under last-click.
- Bottom-of-funnel (brand, retargeting) typically show lower.
- Mid-funnel often roughly equal.

This is expected and correct. It's the data finally reflecting the actual customer journey.

## Smart Bidding with DDA

Smart Bidding uses the attribution model to predict per-impression value. With DDA:

- Bids on prospecting / awareness queries increase because their contribution is now visible.
- Bids on brand / retargeting queries decrease because their attribution is now fairly distributed.
- Total spend efficiency typically improves 5-15% post-DDA adoption.

The improvement comes from the algorithm seeing the same data you do — that upper-funnel touchpoints actually contribute — and bidding accordingly.

## Cross-device and cross-session

DDA handles cross-device journeys via Google's logged-in user data. If a user clicks a Display ad on mobile (signed into Chrome / Google), then a Search ad on desktop later, DDA credits both touchpoints toward the eventual conversion.

This is one of DDA's strengths — last-click couldn't see cross-device paths because it relied on cookie/click-ID matching that broke across devices.

## When DDA might mislead

DDA isn't perfect. Cases where it can give misleading reads:

- **Brand search bias.** Users typing your brand are usually going to buy anyway; DDA may still over-credit brand search touchpoints. Incrementality testing helps here.
- **View-through inflation.** DDA can credit view-only touchpoints; if your view-through tracking is generous, DDA may overstate.
- **Short paths.** Single-touch conversions still credit 100% to that touch — DDA can't redistribute what doesn't exist.
- **Recency bias for fast-converting users.** Users who convert within minutes of clicking get last-click-like credit; DDA helps less here.

For these reasons, DDA is the right default for in-channel decisions but not the final word on channel ROI.

## Migration from older models

If your account is on an older attribution model (last-click especially) and you migrate to DDA:

- Plan for a reporting shift: bottom-funnel will look smaller, top-funnel bigger.
- Stakeholder communication: explain to anyone reading reports that the same conversions are being attributed differently.
- Smart Bidding may rebalance toward upper funnel — let it for 14-30 days before judging.
- Don't switch back if early data looks "worse." DDA is a more honest read; older models were giving you inflated bottom-funnel numbers.

Most accounts that migrated to DDA in 2023-2024 reported steady-state efficiency improvements within 30-60 days.

## Mistakes to avoid

- **Overriding DDA back to last-click without reason.** Default is best for most.
- **Reading DDA reports against last-click expectations.** Different framework; different numbers.
- **Treating DDA as causal.** Still attribution, not lift.
- **Ignoring the path-length and pattern reports.** They show what's actually happening in your funnel.

## Summary

- DDA = ML-based attribution model that credits touchpoints fractionally.
- Default for most accounts in 2026.
- Better top-of-funnel credit; reflects actual customer journey.
- Volume requirement: ~300+ conversions/30 days for full DDA operation.
- Total conversions = same as before; credit just redistributed.
- Smart Bidding benefits from DDA's richer signal.
- Still not causal — use incrementality tests for that.

Next: conversion value beyond binary conversions.
