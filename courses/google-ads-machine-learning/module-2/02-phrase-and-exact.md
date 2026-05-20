---
module: 2
position: 2
title: "Phrase and exact match — when they still help"
objective: "Branded, exact-intent, narrow vertical use cases."
estimated_minutes: 7
---

# Phrase and exact match — when they still help

## The role they keep

Broad match is the new default, but phrase and exact match haven't disappeared. They have specific jobs in a modern account. Knowing when to use them — and when not to — matters.

The mental model: broad match casts wide and trusts the algorithm. Phrase and exact match constrain to specific intents where you have reason to believe constraint is better than expansion.

## When exact match wins

**Brand defense.** Your brand name and close variants. If someone Googles your brand, you want to be the top result, not surrender position to a competitor bidding on your brand. Run brand keywords on exact match with a separate "brand" campaign at high bid willingness.

**Specific, durable, high-converting concepts.** "Term life insurance no medical exam" is a very specific intent that's been stable for years. Exact match on the proven concept guarantees you don't drift into broader, less-converting queries.

**Compliance-restricted categories.** Crypto, supplements, financial products — broader match types trip Google's automated review more often. Exact match (with strong negatives) is more compliance-friendly.

**Localized small-volume queries.** "Plumber Brooklyn 11215" — extremely specific, low volume, no need for expansion. Exact match.

**Specific competitor brand bidding.** When legally and strategically OK to bid on a competitor's brand, exact match keeps you on the exact competitor name without expanding to their broader content.

## When phrase match wins

**Specific intent with semantic flexibility.** "best running shoes for marathon" — you want this concept and close meaning variants but not wildly different intents. Phrase match captures "top running shoes for marathons," "best sneakers for marathon training," etc.

**Mid-tail keywords with consistent meaning.** "wedding photographer NYC" — you want the city + service combination but not its abstract relatives.

**Categories with known query patterns.** When you've reviewed Search Terms and know the patterns that convert, phrase match constrains delivery to those patterns.

## When NOT to use phrase or exact match

**Top-of-funnel discovery.** When you don't yet know what queries convert in your category, you need broad match's expansion to discover. Pinning to phrase/exact means you only ever match the queries you predicted.

**Smart Bidding accounts with conversion volume.** The algorithm wants signal; tight match types restrict signal. The broader-the-match the better for ML.

**Newer accounts in active discovery mode.** Use broad match to learn what queries convert, then refine to phrase/exact for the proven concepts.

## The 80/20 hybrid pattern

A common operating pattern in mature Smart Bidding accounts:

- **80% broad match** keywords doing the bulk of the work, paired with strong negatives.
- **15% phrase match** for proven mid-tail intents that you've validated convert well.
- **5% exact match** for brand defense and specific durable concepts.

The exact split varies by category but the pattern is consistent: broad does the heavy lifting, phrase and exact handle specific high-value cases.

## Brand campaigns specifically

Brand keywords deserve their own campaign with its own budget. Reasons:

- You usually want to bid aggressively on your brand even at high CPC because the conversion rate is high.
- Brand keyword performance is fundamentally different from non-brand; mixing them in one campaign distorts performance reporting.
- Separating brand lets you isolate brand spend for incrementality testing (sometimes brand spend is non-incremental — see Module 4).

Standard pattern: separate "Brand - Exact" campaign with high willingness to bid, exact match keywords on your brand name and direct variants, conservative tROAS or aggressive tCPA, plus negative keywords for things like "[brand] login" if you don't want to bid on existing-customer queries.

## Match type stacking within a campaign

For most modern accounts, mixing match types within the same ad group is fine. Smart Bidding doesn't care about match type as much as it cares about which queries convert.

The old rule "one match type per ad group for clean attribution" still has some merit for diagnostic purposes — you can see broad-match performance vs phrase-match performance separately — but it's no longer mandatory.

What matters more: the keyword's intent semantics. Group keywords by intent (commercial product purchase vs informational vs comparison) rather than match type.

## The Smart Bidding adaptation

In Smart Bidding campaigns, match type signals are weighted alongside other signals. The algorithm uses match type as one input but won't blindly favor exact match if broad match queries are converting better.

This means: even if you stack broad and exact match in the same campaign, Smart Bidding may serve more from broad if broad's queries are converting better at the auction-by-auction level. The match type tells the system what's allowed; performance tells it what to favor.

## Common mistakes with match types

- **Default to exact match because it feels safe.** It used to be. It's not anymore.
- **Mixing all three match types without intent grouping.** Hard to diagnose what's working.
- **Brand keywords in the same campaign as non-brand.** Pollutes performance data.
- **Not using exact match for hard-coded business priorities.** "Bid on this specific term at this specific CPC" needs exact match + manual or capped bid.
- **Forgetting that even exact match now uses semantic variation.** `[running shoes]` matches "shoes for running" — you can't enforce literal anymore.

## Match types and Performance Max

Performance Max doesn't use traditional match types. Instead, you provide "search themes" — short phrases that suggest what queries the PMax campaign should target. Google's NLP interprets the themes and matches queries based on meaning.

If you're running both Search campaigns and PMax in the same account, beware of overlap: PMax will match queries that overlap your Search keywords. Google's documentation says Search exact match takes priority over PMax for matching queries, but the rules can shift; monitor for cannibalization.

## Building a keyword expansion workflow

A common workflow for finding new keywords:

1. **Start with seed terms** — 10-30 proven keywords from your business.
2. **Add them on broad match** in a discovery campaign.
3. **Monitor the Search Terms report** weekly for new queries you didn't anticipate.
4. **Promote high-converting search terms** to dedicated phrase or exact match keywords in their own ad groups.
5. **Negative the low-converting terms** to prevent further waste.

After 4-12 weeks this expands your effective keyword list while keeping the discoverable surface broad. The match type structure becomes a refinement, not a starting point.

## Mistakes to avoid

- **Exact-match purism.** Old habit. Update the playbook.
- **Phrase match without negatives.** Phrase match still expands semantically; bad matches happen.
- **Brand keywords missing.** Always bid on your own brand or someone else will.
- **No separate brand campaign.** Mixing brand and non-brand hides incremental performance.
- **Pinning to match types before you know what converts.** Discovery requires broad.

## Summary

- Broad = default. Phrase + Exact = specific jobs.
- Exact match: brand defense, durable specific intents, compliance, narrow local.
- Phrase match: mid-tail intents with semantic flexibility, validated patterns.
- 80/20 hybrid in mature accounts.
- Brand keywords get their own campaign.
- Even exact match isn't literal in 2026 — semantic variation applies.

Next: negative keywords as the steering wheel.
