---
module: 3
position: 2
title: "Asset groups and creative ingestion"
objective: "Feed PMax the variety it needs."
estimated_minutes: 7
---

# Asset groups and creative ingestion

## What asset groups are

In Performance Max, an asset group is the bundle of creative + audience signals + search themes that work together as a coherent ad unit. It's PMax's equivalent of an ad group, but bigger in scope.

A PMax campaign has 1-5 asset groups (usually 1-3). Each asset group has its own creative, its own audience signal, its own search themes. Within an asset group Google's ML mixes and matches the assets to generate ads for each user.

Asset groups are how you tell PMax "this is one theme/audience/offer; treat it as a coherent unit."

## What goes in an asset group

For each asset group you provide:

**Text:**
- 5+ headlines (30 chars each).
- 5+ long headlines (90 chars each).
- 4+ descriptions (90 chars each).
- 1 business name.

**Images:**
- 4+ landscape images (1.91:1, recommended 1200×628).
- 4+ square images (1:1, recommended 1200×1200).
- 1+ portrait images (4:5, recommended 960×1200).
- 1+ logos (1:1, 4:1).

**Videos:**
- 1+ videos (PMax generates one from your assets if you don't provide; provided videos perform much better).

**Audience signals:**
- Customer Match lists.
- Custom audiences (intent-based).
- In-market segments.
- Demographic signals.

**Search themes:**
- 5-25 short phrases hinting at desired query meaning.

**Other:**
- Sitelinks, callouts, structured snippets, calls, lead forms (assets at the campaign level).

The minimums are required. Beyond minimums, more variety helps performance — within reason.

## How to structure asset groups

The most common pattern: **one asset group per major audience or theme.** Examples:

**By audience segment:**
- Asset Group 1: "Athletes" (customer-match audience of past buyers in athletic categories, athletic-themed creative).
- Asset Group 2: "Wellness Beginners" (in-market audience for wellness, beginner-friendly creative).

**By product line:**
- Asset Group 1: "Cookware" (cookware images, cookware search themes).
- Asset Group 2: "Cutlery" (cutlery images, cutlery search themes).

**By offer:**
- Asset Group 1: "Free Trial" (trial-focused headlines).
- Asset Group 2: "Premium Tier" (premium-focused headlines).

Asset groups separate intents the algorithm shouldn't blend. A "free trial" customer is a different optimization target than a "premium tier" customer.

Don't over-segment. 3-5 asset groups per campaign is usually plenty. More fragments learning.

## Asset performance labels

PMax labels each individual asset:

- **Best** — top-performing in this asset group.
- **Good** — solid performance.
- **Low** — bottom-performing.
- **Pending** — not enough data yet.

These are relative within the asset group, not absolute. A "Low" asset in a strong asset group might still outperform a "Best" in a weaker one.

Operational habit: weekly review of asset performance, replace 1-2 Low assets per group with new variants.

## Don't kill winners; replace losers

A common mistake: pausing the "Best" asset and adding more. Bad move.

The Best assets are doing the work. Replace Low assets to keep variety fresh while Best assets continue dominating delivery. Over time, new variants may surface as winners and old Bests rotate to Good or Low — that's healthy evolution.

## Creative variety dimensions

Within an asset group, vary on:

- **Angle.** What problem you're solving for that audience.
- **Tone.** Polished, friendly, expert, urgent.
- **Format.** Studio product shots, lifestyle, UGC-style, testimonial.
- **Headline focus.** Feature-led, benefit-led, social-proof-led, urgency-led.
- **Image composition.** Product-front, lifestyle context, before/after, comparison.

A library of 5 headlines that all say "Save 20%" gives PMax nothing to test. 5 headlines varying on dimension (save 20% / new arrival / award-winning / customer favorite / try-it-risk-free) gives the system options.

## Image specs and ratios

Multi-ratio images matter because PMax shows across surfaces with different aspect needs:

- **Landscape 1.91:1** — Display banners, Discover, YouTube.
- **Square 1:1** — Discover feed, Gmail, some Display.
- **Portrait 4:5** — Mobile feed, vertical Display.

Provide all three minimums. PMax can crop in some cases but native ratios always perform better.

**Logo 1:1** is required for some placements; logo 4:1 for header placements.

## Videos — provide or be replaced

PMax allows you to skip videos; if you do, Google auto-generates one from your images and text. Auto-generated videos work but reliably underperform real videos.

Recommended minimum: one 6-15 second video per asset group. Vertical 9:16 if you have it; 16:9 landscape if not. Caption it. First 1-2 seconds should be visually engaging.

For higher-performing PMax campaigns, 2-3 videos per asset group. Performance lift over auto-generated is typically 20-40%.

## Adding sitelinks, callouts, structured snippets

These go at the campaign level, not the asset group level:

- **Sitelinks:** 4+ additional click destinations (e.g., specific product categories, popular pages, contact, support).
- **Callouts:** Short phrases highlighting features ("Free Shipping," "30-Day Returns," "24/7 Support").
- **Structured snippets:** Lists of features by category ("Styles: Modern, Classic, Industrial").
- **Calls:** Phone number for click-to-call.
- **Lead forms:** Inline lead capture forms.

Provide all that apply. PMax uses them in Search-surface impressions and they meaningfully boost CTR.

## Audience signals in asset groups

Asset groups can have their own audience signals — typically the customer segment that asset group is built for:

- Asset group "Athletes" might have audience signal: customer match list of athletic gear buyers + in-market audience for athletic apparel.
- Asset group "Wellness Beginners" might have audience signal: in-market for wellness + custom audience built from searches like "wellness for beginners."

The audience signal isn't a hard constraint (PMax will serve outside the signal if it finds good users) — it's a strong hint to the algorithm about who's likely to be a target.

First-party Customer Match data is the most powerful audience signal. Always upload your customer list.

## Search themes in asset groups

Add 5-25 search themes per asset group — short phrases that suggest desired query meaning. Examples for an asset group targeting "Wellness Beginners":

- starter wellness routines
- yoga for beginners
- introduction to meditation
- easy at-home fitness
- wellness app for new users

The themes guide PMax's NLP toward relevant queries. They don't constrain (PMax can match other queries too) but they steer.

## Multi-asset-group campaigns and budget

PMax allocates campaign budget across asset groups automatically based on performance. The system shifts spend toward winning asset groups.

This is similar to CBO in Meta. You don't allocate per-asset-group budgets; you set one campaign budget and PMax distributes.

If you have a strategic need to enforce per-asset-group spend (e.g., "ensure we always spend at least $X on the Premium asset group"), consider separate PMax campaigns instead of separate asset groups.

## Don't run dueling PMax campaigns

Running two PMax campaigns on the same products, same audience, same offer = self-competition. They'll bid against each other in the auction, fragment learning, and waste budget.

If you need segmentation, use asset groups within one campaign. Multiple PMax campaigns are for genuinely different objectives (different product lines with different ROAS targets, different markets, different funnel stages).

## Mistakes to avoid

- **Asset minimums and stopping.** Minimums are minimums, not optimums.
- **Pausing Best assets.** Replace Low; let Best continue.
- **Single asset group covering everything.** Loses the audience/intent separation benefit.
- **Skipping videos.** Auto-generated underperforms real videos by a lot.
- **No first-party Customer Match audience signal.** Missed lift.
- **Two PMax campaigns on the same products.** Self-cannibalization.

## Summary

- Asset group = bundle of creative + audience signals + search themes; PMax's coherent unit.
- 1-3 asset groups per campaign usually; separate by audience, product line, or offer.
- Asset minimums are the floor; aim for more variety.
- Replace Low assets weekly; don't pause winners.
- Multi-ratio images required for cross-surface delivery.
- Provide videos — auto-generated underperforms.
- First-party Customer Match is the strongest audience signal.

Next: audience signals and feed quality.
