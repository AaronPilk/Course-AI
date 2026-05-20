---
module: 2
position: 4
title: "Search themes vs keywords (Performance Max)"
objective: "How signal feeding works in PMax."
estimated_minutes: 7
---

# Search themes vs keywords (Performance Max)

## Why PMax doesn't use keywords

Performance Max is Google's full-automation campaign type that runs across Search, Display, YouTube, Discover, Gmail, and Maps in a single campaign. It doesn't use traditional keywords because:

- It serves on non-search surfaces where keyword matching doesn't apply.
- Google wanted a goal-and-signal-driven model where you don't manually target.
- Removing keywords reduced operator workload, fitting the broader automation strategy.

Instead, PMax uses **asset groups** (creative variations), **audience signals** (who you think your customer is), and — added later — **search themes** (textual hints about what queries you'd like to match).

Search themes were Google's response to advertisers asking "how do I tell PMax what kind of searches I want to win without explicit keywords."

## What search themes are

A search theme is a short phrase you provide to PMax suggesting queries it should consider matching. Examples:

- `vegan protein powder for athletes`
- `affordable family vacation packages`
- `B2B accounting software for small business`

You add 5-25 search themes per asset group. They function as soft hints, not hard filters. Google's NLP interprets the themes and uses them — alongside audience signals, product feed, and asset content — to decide which queries trigger the asset group.

Search themes are NOT keywords. You can't set match types. You can't bid them. They're suggestions to the ML, not constraints.

## How signal feeding works in PMax

PMax uses everything you provide to predict who to show ads to:

**Asset groups.** Headlines, descriptions, images, videos, logos, sitelinks, calls. The ad surface and content.

**Audience signals.** Custom audiences, customer lists, in-market segments, custom intent segments. "Here are people likely to be customers."

**Product feeds** (for e-commerce). Connected via Merchant Center; PMax uses product titles, descriptions, prices, categories, custom labels.

**Search themes.** Textual hints for which queries to match.

**Conversion signal.** Same as Search — Smart Bidding-equivalent logic with your conversion goals.

The ML weighs all of these and decides per impression where to show, what creative to use, and at what bid. You don't see these decisions per auction — you see aggregate performance.

## Audience signals — first-party data wins

Of all signals, first-party customer lists tend to drive the most lift. Uploading your existing customer list as an audience signal tells PMax "these are people who already bought; find lookalikes."

Other audience signals:

- **In-market audiences** — users showing in-market behavior for product categories.
- **Custom audiences** built from intent signals (searches, sites, apps).
- **Customer Match lists** — uploaded customer emails/phones.
- **Combined audiences** — combinations of the above.

Without strong audience signals, PMax has to rely on search themes + feed + asset content. The lift from audience signals is often the difference between a struggling PMax campaign and a top performer.

## Asset groups and creative

PMax requires significant creative variety:

- 5+ headlines (30 chars each).
- 5+ long headlines (90 chars each).
- 4+ descriptions (90 chars each).
- 4+ images (multiple ratios: 1.91:1, 1:1, 4:5).
- 1+ videos (recommended; Google generates one if you don't provide).
- Logos (1:1 and 4:1 ratios).
- Sitelinks, callouts, structured snippets.

PMax tests combinations and reports back which assets perform best. Without enough variety, the system has nothing to test and performance suffers.

## Asset group strategy

Most PMax campaigns have 1-3 asset groups per campaign. Asset groups are like ad groups in Search — they organize creative around a theme or audience.

Common patterns:

- **By audience segment** — one asset group for "athletes," one for "new parents," etc.
- **By product line** — one asset group per major category.
- **By offer** — one for "free trial," one for "discount," one for "premium tier."

Don't over-fragment. 3-5 asset groups per PMax campaign is usually plenty. More than that fragments the algorithm's learning.

## PMax vs Search overlap

When you run both Search and PMax in the same account, queries can overlap. Google's documented rule: an **exact-match Search keyword** takes priority over PMax for matching that query. Otherwise PMax can match.

Implications:

- If you have brand defense Search exact-match campaigns, they catch brand queries before PMax does.
- For non-brand searches, both Search and PMax can serve. Smart Bidding-equivalent logic in PMax decides which wins per auction.
- Cannibalization is possible — your two campaigns bid against each other.

Best practice: run a separate brand Search campaign on exact match (gets brand queries first), let PMax handle the broader spectrum, monitor for cannibalization in reporting.

## Where PMax shows ads

A single PMax campaign can serve across:

- **Google Search** (text ads on SERPs).
- **Display Network** (banner/visual ads on websites).
- **YouTube** (video ads).
- **Discover** (Google app feed).
- **Gmail** (Promotions tab).
- **Maps** (location ads).
- **Shopping** (product listings if a product feed is connected).

You don't choose placements; Google decides where each user is best reached. The placement distribution is reported but not directly controllable.

For accounts running only Search before, PMax dramatically expands surface area — sometimes good (incremental reach), sometimes bad (spend on lower-converting surfaces). Watch the channel distribution in PMax reporting.

## Reporting limits

PMax reporting is intentionally limited compared to Search/Display campaigns:

- You see asset-group-level performance.
- You see channel split (how much spent where).
- You see top-performing assets within each group.
- You can see "insights" that suggest improvements.

You do NOT see:

- Per-keyword or per-query performance (limited search-term data is now available but not comprehensive).
- Per-placement display performance.
- Per-asset combination performance.

This is the tradeoff: PMax automates a lot but obscures granularity. Adopt only when the automation lift is worth the visibility loss.

## When PMax wins vs loses

Wins:
- E-commerce with strong product feed and audience signals.
- DTC brands with multi-surface presence (Search + YouTube + Display).
- Accounts where you trust Google's ML to allocate across surfaces.
- Accounts with rich creative inventory.

Loses:
- Thin conversion volume (PMax needs same 30+/30 days threshold).
- Tiny creative library — PMax can't rotate well.
- B2B with narrow audience — PMax goes broad.
- Accounts that need fine-grained control or strict compliance.

## Cannibalization with Shopping

If you previously ran Shopping campaigns and switch to PMax, PMax takes over shopping placements automatically. Don't run both — PMax will outbid your traditional Shopping for the same products.

Migration path: pause old Shopping campaigns, launch PMax with the product feed, validate performance, retire old structure.

## Mistakes to avoid

- **Treating search themes as keywords.** They're hints, not constraints.
- **Skipping audience signals.** Major lift driver missed.
- **Single asset group with thin creative.** Underutilizes PMax's strengths.
- **Running Search + PMax + Shopping on same products without coordination.** Self-cannibalization.
- **Expecting Search-level reporting.** PMax intentionally obscures detail.

## Summary

- PMax doesn't use keywords; uses search themes + audience signals + asset groups + feed.
- Search themes are soft hints, not match-type filters.
- First-party audience signals (customer lists) are the biggest lift driver.
- Asset variety is required — thin libraries underperform.
- Reporting is limited by design; obscures granularity in exchange for automation.
- Exact-match Search beats PMax for the same query; otherwise PMax can serve.

Next module: Performance Max and the campaign mix.
