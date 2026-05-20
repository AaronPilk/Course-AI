---
module: 3
position: 3
title: "Audience signals and feed quality"
objective: "First-party data and product feeds drive PMax."
estimated_minutes: 7
---

# Audience signals and feed quality

## The two biggest underused PMax levers

Most PMax campaigns underperform their potential for two specific reasons: weak audience signals and bad product feeds. Both are unglamorous setup work that pays back enormously. Both get skipped because they're not exciting.

This lesson is about getting them right.

## What audience signals do

Audience signals tell PMax: "here are people who are likely to be customers — use them as a starting point." The system uses these signals to build its own predictions about who else looks similar.

Note: audience signals are not hard targets. PMax will serve outside the signal if it finds users with better conversion probability. The signal is a hint, not a constraint.

Sources of audience signal (in rough order of strength):

1. **Customer Match** — uploaded list of your customers (email, phone, address).
2. **Custom segments** — built from search terms users type, URLs they visit, apps they use.
3. **In-market segments** — Google's pre-built audiences of users actively shopping in a category.
4. **Affinity segments** — broader lifestyle/interest audiences.
5. **Detailed demographics** — life events, parental status, etc.
6. **Website visitor remarketing** — users who've visited your site.

## Customer Match is the load-bearing signal

A Customer Match list of your existing customers (uploaded with proper formatting and hashing) is far and away the most powerful PMax audience signal. Reasons:

- It's first-party data — Google's privacy environment increasingly favors first-party signals.
- It carries verified buyer information.
- Match rates for B2C consumer lists are typically 60-80% — most users get found.
- It feeds lookalike modeling implicitly.

Implementation:

- Export customer list from your CRM / Shopify / database.
- Required columns: email (recommended hashed), phone, first name, last name, country, ZIP code.
- Upload to Google Ads → Audience Manager → Customer Lists.
- Refresh quarterly minimum; ideally monthly for active accounts.

Without a Customer Match audience signal, you're operating with one hand tied behind your back.

## Custom segments

Custom segments let you tell Google "build me an audience of people who do X." Three flavors:

**Search-term-based.** "People who recently searched terms like X, Y, Z." Useful for intent capture — list 10-30 high-intent search queries; Google builds an audience of recent searchers.

**URL-based.** "People who visited URLs like X, Y, Z." Useful for competitor intent — list competitor product pages; Google builds an audience of recent visitors.

**App-based.** "People who use apps like X, Y, Z." Useful for behavior-based segmentation.

Custom segments are powerful when you have specific intent hypotheses. They work best alongside Customer Match, not as a replacement.

## In-market segments

In-market audiences are Google's pre-built "actively shopping" segments. Examples:

- In-market for athletic shoes.
- In-market for home appliances.
- In-market for B2B SaaS / accounting software.

Add 2-4 relevant in-market segments to your audience signals. They're broader than Customer Match but still meaningful.

## Affinity and detailed demographics

Affinity audiences (lifestyle/interest) and detailed demographics (e.g., new parents, recent movers) are weaker signals but useful as supplementary. Don't rely on them as primary.

For most PMax campaigns: Customer Match primary + 1-2 custom segments + 2-4 in-market segments. That's a strong signal stack.

## The product feed

For e-commerce PMax, your Merchant Center product feed is half the campaign. PMax uses feed data to:

- Match products to user intent.
- Generate dynamic creative.
- Decide which products to surface in Shopping placements.
- Inform asset relevance scoring.

A clean feed dramatically outperforms a messy one. Things that matter:

**Product titles.** Treat as ad copy, not just product names. Include brand, product type, key attributes, color, size where relevant. "Brand Name Wireless Headphones - Noise Cancelling Over-Ear, Black" beats "Headphones."

**Descriptions.** 2-3 sentences with key features and benefits. Indexed for relevance.

**Images.** High-quality, white-background main image + lifestyle alternates. Google requires specific resolution/format minimums.

**Custom labels.** Up to 5 custom labels per product (label_0 through label_4). Use these to segment products by margin, season, hero/long-tail, etc. Custom labels enable bid strategy differentiation by product subset.

**Prices and availability.** Must match the landing page exactly. Mismatches cause disapprovals.

**Categories.** Use Google's product taxonomy correctly. Wrong category = bad match.

## Feed disapproval issues

Common feed problems that cause PMax underperformance:

- **Missing required attributes** for the category.
- **Image quality issues** (low resolution, watermarks, promotional overlays).
- **Price mismatches** between feed and landing page.
- **Out-of-stock products** still in feed and being served.
- **Generic titles** ("Product 1," "Item ABC").
- **Wrong currency** declared.

Audit the Merchant Center diagnostics tab weekly. Resolving disapprovals is direct lift.

## Feed optimization is content marketing

Approach feed titles and descriptions like SEO content. Each product page is competing for query matches. Better titles = better matches = better performance.

For accounts with 100s of SKUs, this is a major project. Tools like Feedonomics, DataFeedWatch, or in-house ETL scripts can transform raw catalog data into ad-optimized feed.

The ROI on a feed optimization project for a mature PMax account is often 20-40% performance lift over baseline. Bigger than most creative tests.

## Custom labels for bid segmentation

Custom labels enable a key PMax pattern: **segment products into asset groups by performance characteristics.**

Example labels:

- `custom_label_0`: margin tier (high, medium, low).
- `custom_label_1`: seasonality (year-round, summer, winter).
- `custom_label_2`: hero status (hero, mid, long-tail).
- `custom_label_3`: new launch flag (yes / no).
- `custom_label_4`: clearance flag (yes / no).

Then in PMax you can build asset groups by label — e.g., one asset group for high-margin year-round heroes with aggressive tROAS target, another for low-margin clearance items with looser target.

This is one of the most powerful and underused PMax techniques. Without custom labels, you can't differentiate strategy across your catalog.

## Feed updates

Merchant Center supports several feed update mechanisms:

- **Scheduled fetch** — Google pulls from your URL daily.
- **Direct upload** — manual file upload.
- **API push** — push updates when product data changes.
- **Content API** — programmatic updates per-product.

For high-velocity catalogs (inventory changes hourly), API push is essential. For stable catalogs, scheduled fetch is fine. Whatever the mechanism, stale feed = stale PMax.

## Audience exclusions in PMax

PMax allows some audience exclusions:

- **Existing customers** — via Customer Match list set as "exclusion" for Customer Acquisition mode.
- **Specific user lists** — if you want to exclude certain segments.

Exclusion lists shrink the eligible pool. Use sparingly — over-exclusion is a common PMax issue.

## Mistakes to avoid

- **No Customer Match audience signal.** The biggest miss.
- **Generic feed titles.** Wastes search-term matching opportunity.
- **No custom labels.** Forces undifferentiated strategy across catalog.
- **Stale feed.** Out-of-stock items still serving.
- **Reliance on in-market alone.** Without first-party signals, performance plateaus.
- **Heavy exclusion stacks.** Shrinks the pool unnecessarily.

## Summary

- Audience signals = hints to PMax's ML; Customer Match is the strongest.
- Stack signals: Customer Match + custom segments + in-market.
- Refresh Customer Match quarterly minimum.
- Product feed is half the campaign for e-commerce.
- Feed titles, descriptions, custom labels matter as much as creative.
- Custom labels enable per-segment strategy differentiation.
- Audit Merchant Center weekly for disapprovals.

Next: PMax vs Search vs Demand Gen — when to run each.
