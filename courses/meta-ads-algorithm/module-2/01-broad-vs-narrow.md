---
module: 2
position: 1
title: "Why broad targeting often beats narrow"
objective: "Trust the ML where it earns it."
estimated_minutes: 7
---

# Why broad targeting often beats narrow

## The shift

The 2015 playbook was narrow interest stacks: "men, 25-44, interested in CrossFit AND protein powder AND lives in Austin." That worked when Meta's optimization layer was weaker and targeting did most of the work. In 2026 the optimization layer is the work. Narrow targeting now usually hurts.

The ML's job is to find the people most likely to take your optimization event. The bigger the eligible pool, the more signal the algorithm has to learn from. Constrain the pool to 50k people and you're betting your judgment beats the algorithm's. Open the pool to 50M and the algorithm finds the right slice — usually a slice you wouldn't have guessed.

## Why broad works now

Three things changed:

**The signal got better.** With Conversions API + pixel + offline conversions, Meta sees event quality from your CRM and your site. The ML knows what a real buyer looks like — title, behavior, recency, value. It doesn't need you to pre-filter.

**The auction got smarter.** Estimated action rate is now precise enough at scale that the algorithm prefers a wide cast with strong predictions over a narrow cast with weak ones.

**The audiences got smaller after iOS 14.5.** Custom audiences and lookalikes shrunk; attribution windows tightened. Narrow targeting on top of already-reduced audiences strangles delivery.

## The pool math

Meta's docs hint at this: audience size of 2-10M is the sweet spot for most accounts. Below 1M, delivery gets erratic; the system can't find enough lookalike events to stabilize EAR predictions. Above 50M, broad becomes too broad only if your creative isn't pre-qualifying — the creative has to do the targeting work.

For e-commerce in a country the size of the US/UK/AU: start with no interest layer at all, just country + age + gender if relevant. Let the pixel and creative do the targeting.

## Where narrow still beats broad

Some categories genuinely need narrow:

**B2B with a specific job title.** "Marketing directors at SaaS companies" isn't a creative problem; it's a filter problem. Use job title + industry targeting or upload a CRM list.

**Regulated verticals.** Crypto, supplements, certain financial products: narrow keeps you compliant and out of automated review issues.

**Hyper-local services.** Plumbers serving one zip code don't benefit from broad — they benefit from radius targeting.

**High-AOV niche.** Selling $50k watches: the broad audience wastes spend on tire-kickers; lookalikes of buyers convert better.

For everything else — DTC, app installs, lead gen for mass-market services — broad usually wins.

## The diagnostic

Test it directly. Run two ad sets identical except for targeting:

- Set A: broad (just country + age).
- Set B: narrow (your usual interest stack).

Same budget, same creative, same optimization event, 7-day window. Compare CPA and ROAS at the ad set level. In most accounts, broad wins by 10-30% on CPA after the learning phase.

If narrow wins decisively, your creative isn't pre-qualifying — broad delivery is finding the wrong people because your hook speaks to everyone. Fix the creative, retest.

## Why the creative has to pre-qualify

When you remove the targeting filter, the creative becomes the filter. A vague hook that says "great products, free shipping" attracts everyone, and you waste budget on non-buyers. A specific hook that says "for endurance athletes training over 10 hours a week" attracts the slice you want and repels the rest — even when shown to a broad audience.

This is why creative-first thinking pairs with broad targeting: the creative does what targeting used to do. Module 3 covers this in depth.

## The mistake of stacked interests

A common pattern: "people interested in (running OR triathlon OR marathon) AND (Garmin OR Strava OR Polar)." This feels precise but actually fragments the audience and kills delivery. Each AND cuts the pool. Three ANDs and the audience is 200k — too small for stable EAR predictions.

The cleaner version: pick the broadest single interest (running) or skip interests entirely. Let the algorithm find the running-shoe buyer; it has better signals than your interest guess.

## Detailed targeting expansion

Meta's "detailed targeting expansion" toggle (on by default for many objectives now) tells the algorithm: "you can ignore my interest filter if you find better users outside it." When on, your interest stack becomes a suggestion, not a constraint. The algorithm uses it as a starting point and then drifts to wherever the conversions are.

This makes narrow targeting even weaker — you set up an interest filter, the system ignores it. Either go fully broad (no filter, faster start) or turn off expansion if you really need the filter held.

## What "broad" actually means

Broad ≠ no targeting. Broad means: country, age range, gender if relevant, language. Sometimes platforms (mobile only). No interest stack, no behavior stack, no detailed demographic.

Custom audiences are not broad targeting — they're retargeting or seeded audiences (covered next lesson). Lookalikes are seeded audiences too.

When people say "go broad," they mean: remove the interest layer, keep the basic geo/demo, trust the optimization event and pixel signal.

## Mistakes to avoid

- Mixing broad and narrow in the same campaign without separation — your broad ad set steals the narrow ad set's good users via auction overlap.
- Going broad with weak pixel signal — if you haven't sent 50+ purchases in the last 28 days, the ML hasn't learned your buyer yet; broad will explore aimlessly.
- Going broad with creative that doesn't pre-qualify — pure waste.
- Going broad in a market too small (sub-1M total) — the algorithm needs room to explore.

## Summary

- Broad targeting works in 2026 because Meta's optimization layer earns its keep.
- Pool of 2-10M is the comfortable range for most accounts.
- Creative becomes the filter when targeting is removed.
- Narrow still wins for B2B, regulated, hyper-local, high-AOV niche.
- Test broad vs narrow ad-set-to-ad-set; usually broad wins after learning phase.

Next: Custom audiences and lookalikes — how to seed the algorithm properly.
