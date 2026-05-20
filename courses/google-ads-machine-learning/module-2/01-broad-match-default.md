---
module: 2
position: 1
title: "Broad match is the new default — really"
objective: "Why Google's NLP changed the calculus."
estimated_minutes: 7
---

# Broad match is the new default — really

## The reversal

For 15 years the conventional wisdom was: broad match is dangerous; exact match is safe. Generations of PPC managers learned to default to exact match, use phrase match sparingly, and avoid broad match altogether unless you were running a brand-defense campaign or had Google's account team aggressively pushing it.

That reversed around 2021-2022. Google now publicly recommends broad match as the default for Smart Bidding campaigns. Many high-performing accounts run 70-90% broad match keywords. The reason isn't marketing — it's that Google's NLP and Smart Bidding got good enough that broad match plus AI bidding now usually outperforms tight match types.

This is one of the hardest things for experienced practitioners to accept. It contradicts a decade of training. But the data supports it for most accounts most of the time.

## What changed

Three things:

**Google's NLP got much better.** BERT and subsequent transformer-based models understand query meaning, not just words. "Affordable running shoes for flat feet" and "cheap sneakers for people with low arches" are now understood as roughly the same intent — even though they share almost no exact words. Old broad match would treat them as wildly different; modern broad match treats them as related.

**Smart Bidding got much better at filtering bad matches.** Even when broad match triggers a borderline-irrelevant query, Smart Bidding's per-auction logic predicts low conversion probability and bids near zero. The system effectively self-filters the queries that aren't going to convert; the bad matches show but cost nothing.

**Signal richness rewards openness.** Broad match feeds more variety into the Smart Bidding engine, which lets it learn faster about which query types convert. Tight match types restrict the learning surface; broad match opens it.

The combination flipped the cost-benefit. Modern broad match = wider net + Smart Bidding's filter = better outcomes than narrow keywords trying to do the targeting themselves.

## When broad match still loses

This isn't universal. Cases where tighter match types still win:

**Tiny conversion volume.** Below 30 conversions/month, Smart Bidding's filter doesn't have enough signal to filter cleanly. Broad match exposes you to noise without enough signal to learn from. Use phrase or exact match until volume is built up.

**Brand defense campaigns.** When you specifically want to bid only on your brand name, exact match is the right tool. Broad match on a brand keyword would expand to competitors' brands, which is rarely what you want.

**Highly specific niche where context matters.** "California labor law attorney" needs to stay in lawyers, not expand to general labor news. Exact or phrase match with strong negatives.

**Compliance-restricted verticals.** Crypto, supplements, gambling — Google's automated review hits broad match more aggressively. Tighter match types reduce review friction.

**Manual CPC accounts.** Without Smart Bidding to filter, broad match becomes the dangerous beast it was in 2010. Manual + broad = burn money fast.

For everything else — DTC, lead gen, B2B with reasonable volume, mass-market SaaS — broad match is now the right default.

## How modern broad match works

The mechanics:

- You provide a keyword without quotes or brackets: `running shoes`.
- Google's NLP analyzes the query and decides whether it shares enough meaning with your keyword to trigger your ad.
- Smart Bidding bids per auction based on predicted conversion probability for that query.
- Search Terms report shows you what queries actually triggered your ads.

Compared to old broad match (which would expand wildly to nearly anything tangentially related), modern broad match is much more conservative. The expansion still happens but the relevance threshold is higher.

## Phrase match changed too

Phrase match (with `"quotes"`) used to mean "must include this exact phrase." In 2021 Google merged phrase and broad match modifier (BMM was deprecated) and redefined phrase match as "include this phrase or close variants with the same meaning."

So phrase match now also uses NLP. The difference vs broad match is that phrase match requires the meaning to align more closely with your keyword phrase, where broad match allows looser semantic relationships.

Practically: phrase match is more conservative than broad but still uses meaning, not just words.

## Exact match changed too

Even exact match isn't literal anymore. Exact match (with `[brackets]`) means "this query or a close variant with the same meaning." `[running shoes]` will match "shoes for running" and "sneakers for jogging" because Google considers those to have the same intent.

If you really want literal: there's no way to enforce it. Even exact match has some semantic flexibility. The closest thing is exact match + tight negatives.

## The match type hierarchy in 2026

In order of expansion (most → least):

1. **Broad match** — semantic relatives, contextual matches, audience-signal-driven expansion. Widest net.
2. **Phrase match** — meaning aligned with the keyword phrase. Moderate net.
3. **Exact match** — query or close variant with same meaning. Tight net (but not literal).

For Smart Bidding campaigns with adequate conversion volume: default to broad match. Add phrase match for specific high-intent keywords. Use exact match for brand defense or very narrow concepts.

For thin-volume or manual CPC: invert the priority. Start exact/phrase, layer broad cautiously.

## Negative keywords as the steering wheel

Broad match without negative keywords is dangerous. With strong negatives, broad match becomes safe and powerful. The key tradeoff:

Broad match expansion casts wide; negative keywords trim the bad matches. Together they're a working pair. Without negatives, broad expands too far. Without broad, negatives don't have much to filter.

Common negative keyword categories:

- **Job/employment terms** ("jobs," "careers," "hiring") — unless you're hiring.
- **Free/cheap/DIY terms** — unless you're selling free or cheap.
- **Competitor brand names** — bidding on them is sometimes valid; expanding into them via broad match isn't.
- **Information-only queries** ("what is," "how to," "definition") — unless you're optimizing for content/informational intent.
- **Out-of-scope categories** — for a B2B SaaS, words like "personal," "individual," "consumer."
- **Wrong-product terms** — for a software company called Apple, you'd negate fruit terms.

Build a robust negative list before launching broad match. Then monitor the Search Terms report weekly and keep adding.

## Negative match types

Negatives have their own match types:

- **Negative broad** — blocks queries containing any of the words.
- **Negative phrase** — blocks queries containing the phrase.
- **Negative exact** — blocks only the exact query.

Use negative phrase for most cases; negative broad can over-filter; negative exact under-filters.

## Account-level vs campaign-level negatives

You can apply negatives at:

- **Account level** (negative keyword lists) — applies everywhere.
- **Campaign level** — applies within one campaign.
- **Ad group level** — applies within one ad group.

For "never want to match this" terms (jobs, careers), use account-level. For campaign-specific exclusions, use campaign-level. Avoid duplicating negatives across levels.

## Search Terms report

The Search Terms report shows actual queries that triggered your ads. With broad match, this is your audit tool. Review weekly:

1. Filter by ad group or campaign.
2. Sort by impressions or clicks.
3. Scan for queries you didn't intend to trigger.
4. Add them as negatives at the appropriate level.

Post-2020 privacy changes, some queries are hidden in the Search Terms report (low-volume queries are aggregated). You can't see every query. But you can see most of the spend-relevant ones.

## Mistakes to avoid

- **Broad match without negatives.** Dangerous duo (high spend, low quality).
- **Broad match on thin conversion volume.** Smart Bidding can't filter without signal.
- **Exact-match purism in 2026.** Misses 70% of available volume.
- **Ignoring the Search Terms report.** Negatives are continuous work.
- **Bidding on broad-match competitor brand names by accident.** Negate carefully.

## Summary

- Broad match is now the default for Smart Bidding accounts with adequate conversion volume.
- Google's NLP and Smart Bidding's per-auction filtering changed the calculus.
- Phrase and exact match also use NLP now — not literal.
- Pair broad match with robust negative keyword lists.
- Monitor Search Terms report weekly.
- Tight match types still win for thin-volume, brand defense, niche compliance.

Next: phrase and exact match — when they still help.
