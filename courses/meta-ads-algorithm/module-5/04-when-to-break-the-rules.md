---
module: 5
position: 4
title: "When to break the rules"
objective: "Recognize the edge cases where defaults fail."
estimated_minutes: 7
---

# When to break the rules

## Rules vs heuristics

Almost every "rule" in this course is a heuristic that's true most of the time. The 80/20 ones — broad targeting beats narrow, CBO beats ABO, ASC beats manual, lowest cost beats caps — work for most accounts most of the time. They're correct defaults.

But every account has its 20%: situations where the default fails. Recognizing those moments is the difference between an operator who learned the playbook and one who understands the algorithm.

## When narrow targeting beats broad

The default is broad. The exception:

- **B2B by job title.** Decision-makers at specific industries; broad targeting wastes 90% of impressions on irrelevant people. CRM lists or title targeting wins.
- **Hyper-local services.** Plumber serving one zip code, restaurant in one neighborhood. Radius targeting wins.
- **Compliance-required segmentation.** Crypto / supplements / certain financial categories. Regulatory definition of audience requires explicit segmentation.
- **High-AOV niche with weak pixel signal.** $50k watches with 5 buyers/quarter. Pixel can't learn what to find; lookalike of buyers is your only real signal.
- **Multi-language markets.** Don't show English ads to Spanish-speakers; split.

The test: would broad targeting include large slices of users who are structurally not your buyer? If yes, narrow is justified.

## When ABO beats CBO

The default is CBO. The exception:

- **Audience-testing isolation.** When you specifically want each tested audience to receive equal spend regardless of performance — CBO would starve the worse one immediately, preventing read.
- **Enforced minimums.** "Spend at least $X/day in Australia" can't be enforced via CBO; ABO at the ad set level enforces.
- **Different bid strategies per audience.** CBO requires same bid strategy campaign-wide; different audiences with different goals = ABO.
- **Adversarial mix.** Several specific audiences, each needs guaranteed spend irrespective of others; CBO would heavily favor one.

The test: do you have a reason to override Meta's allocation? If yes, ABO. If "I want to micromanage," CBO is better.

## When manual beats ASC

The default for e-commerce is ASC. The exception:

- **Thin pixel signal.** Under 50 conversions/week, ASC explores too broadly and burns budget.
- **Tiny creative library.** ASC needs 5+ ads; with 2-3, manual is identical or better.
- **Specific audience requirements ASC can't honor.** B2B title targeting, regulated audience definitions.
- **Specific exclusion needs.** ASC has limited exclusion options; manual gives full control.
- **Multi-region account with separate ad budgets per region** that need enforcement.

The test: does ASC's automation help or hurt for this specific case? If the offer's natural audience is broad and creative is plentiful, ASC. If structural constraints apply, manual.

## When cost cap beats lowest cost

The default is lowest cost. The exception:

- **Profitability constraint.** Strict business rule: "we won't pay more than $X CPA, period." Cost cap enforces it.
- **Mature campaign with proven CPA data.** When you know the average CPA and want predictability over volume, a cap holds.
- **Scaling against a competing channel.** "Cost-per-lead must be sub-$Y to beat my Google number" — cap enforces.
- **Bidding against a target ROAS** — Meta's ROAS bid is essentially a cost cap on revenue.

The test: would you rather slower scale at predictable cost, or faster scale at variable cost? Mature accounts often prefer the former.

## When more ad sets beat fewer

The default is consolidation. The exception:

- **Genuinely different audiences.** US broad and UK broad don't share users; running one ad set for both averages performance. Two ad sets, two budgets.
- **Different optimization events.** Lead-gen and purchase shouldn't share an ad set even if audience is identical — different downstream events.
- **Different placements with different creative fit.** Sometimes a Reels-only ad set with vertical creative + a Feed-and-Stories ad set with mixed creative outperforms one consolidated ad set.

The test: would consolidating these into one ad set force a compromise (single budget, single audience, single event) you'd rather not make? If yes, split.

## When pausing winners makes sense

The default is don't pause winners; let them ride. The exception:

- **Brand integrity issue.** A creative that's converting but generating angry comments or PR risk — pause.
- **Frequency-fatigue + tightening audience.** When a winner has frequency 8+ and the rest of the library can't relieve it, sometimes a forced pause for 2-3 weeks then re-launch can work.
- **Cannibalization across campaigns.** If campaign A is paying $20 CPA for users who would have bought via campaign B at $5 CPA anyway, pause A.

The test: is the winner causing measurable harm beyond direct campaign metrics? If yes, pause.

## When you should NOT use Advantage+ Audience expansion

The default is leave Advantage+ Audience (formerly Detailed Targeting Expansion) on. The exception:

- **You specifically need targeting honored.** Compliance, brand-safety, legal requirements that demand the audience filter stay tight. Turn off expansion.
- **Testing audience hypothesis.** When you want clean data on whether audience X performs, expansion contaminates the test by pulling in users outside it.

The test: do you have a reason to enforce the filter? If yes, off. Otherwise leave on.

## When iOS-vs-Android segmentation matters

Default: don't segment by OS. Exception:

- **App campaigns with very different conversion economics by OS.** iOS users often convert better at higher CPMs; Android worse at lower. Splitting allows different bid logic.
- **Compliance reasons** — some attribution issues are OS-specific.

Most non-app accounts don't need OS segmentation. App accounts often do.

## When to ignore your own attribution

The default is to optimize toward attributed conversions. The exception:

- **Lift test shows wild divergence.** Your attribution claims 4x ROAS but lift shows true incremental is 1.5x. Trust the lift.
- **Multi-channel mix shifted.** If you cut Google brand search and Meta's "attributed conversions" stayed the same, those were never Meta's to begin with.
- **External data contradicts.** Shopify total revenue holding while Meta scaling spend = Meta isn't actually adding revenue.

The test: does external data agree with Meta's claims? If no, externally-anchored truth wins.

## When to over-write the standard playbook

Sometimes the right move is the unconventional one. Examples from real accounts:

- An e-commerce brand running 90% retargeting because their entire model is selling to existing email subscribers, not prospecting. Defies "prospecting beats retargeting" — works because their funnel is fundamentally different.
- A B2B account running narrow + manual + cost cap, with 5 active ads. Defies "creative variety wins" — works because their audience is small and creative refresh isn't the lever.
- A nonprofit running brand campaigns with awareness optimization rather than conversion. Defies "always optimize for the event you want" — works because their goal genuinely is awareness, not transactions.

The principle: understand what the default is optimizing for, then judge whether your actual goal matches.

## How to know when to break the rule

Three checks:

1. **Have you tried the default first?** Most "I need to do something different" claims come from people who didn't honestly try the default. Get a clean default-pattern baseline.
2. **Do you have data showing the default fails?** Hypothesis isn't data. Run the test, look at numbers, then deviate.
3. **Can you articulate why?** "Because broad doesn't work for my audience" isn't a why — it's a restatement. "Because my audience is 200k decision-makers at SaaS companies and broad would waste 99% of impressions" is a why.

If all three check out, breaking the rule is the right move. Otherwise, the default is your safest bet.

## The final principle

This whole course has been about understanding what the algorithm is optimizing and how to operate cleanly inside its rules. The rules aren't religious — they're heuristics for the median account. Yours might not be median. Learn the defaults, run them, then deviate where evidence justifies.

The advertisers who win in 2026 aren't the ones who memorized the playbook. They're the ones who understood the system well enough to know which rule applies, when, and why.

## Summary

- Defaults work for most accounts; every account has its exceptions.
- Narrow > broad: B2B title, hyper-local, regulated, high-AOV niche.
- ABO > CBO: testing isolation, enforced minimums, different objectives.
- Manual > ASC: thin signal, tiny library, structural audience constraints.
- Cost cap > lowest cost: profitability constraints, mature campaigns.
- Split ad sets: genuinely different audiences or events.
- Pause winners: brand risk, cannibalization, fatigue-without-relief.
- Three checks before deviating: tried default? Have data? Articulate why?
- The algorithm is the territory; the rules are a map.

Course complete.
