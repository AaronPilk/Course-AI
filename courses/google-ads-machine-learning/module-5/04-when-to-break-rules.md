---
module: 5
position: 4
title: "When to break the rules"
objective: "Manual CPC, narrow match, and other deliberate exceptions."
estimated_minutes: 7
---

# When to break the rules

## The defaults vs the exceptions

This course has built up a set of defaults: broad match, Smart Bidding, Performance Max, DDA attribution, broad audiences, fewer campaigns, fewer ad groups. They're correct for most accounts most of the time.

But every account has its 20%: situations where the default fails. Recognizing those moments is the difference between a practitioner who memorized the playbook and one who understands the algorithm.

## When manual CPC still wins

The default is Smart Bidding. The exception:

- **Tiny accounts with no conversion volume.** A B2B account with 2 leads/month can't run Smart Bidding because the algorithm has nothing to learn from. Manual + tight match + heavy negatives + every search query reviewed by hand is the operating model.

- **Regulated audits.** Some industries require documented per-keyword bids for compliance/audit. Manual CPC provides the paper trail.

- **One-off diagnostic tests.** "Does this keyword convert at $X CPC?" Manual lets you specifically pin the bid.

For >95% of accounts at $5k+/month with reasonable conversion volume, manual loses. Don't fight Smart Bidding because of habit.

## When narrow match still beats broad

The default is broad match. The exception:

- **B2B with specific job titles + industries.** Decision-makers at SaaS companies — Google can't reliably target them via broad match keywords. Use audience targeting (Customer Match + custom audiences + in-market) with narrower match-type keywords.

- **Compliance-restricted verticals.** Crypto, supplements, regulated financial — broad match trips Google's automated review more. Tighter match types reduce review friction.

- **Hyper-local services.** "Plumber Brooklyn 11215" — exact match keeps targeting tight.

- **Very high-AOV niche with weak pixel signal.** $50k industrial equipment — broad match wastes spend on tire-kickers; tight match + manual review is defensible.

- **Brand defense.** Always exact match on brand keywords; never broad.

The test: would broad match include large slices of users who are structurally not your buyer? If yes, narrow is justified.

## When dedicated Search beats PMax

The default for e-commerce is PMax. The exception:

- **Thin pixel signal.** PMax needs same 30+/30 days threshold; below that, it explores aggressively and burns budget.

- **Tiny creative library.** PMax can't rotate well with <5 ads.

- **B2B with narrow audience.** PMax goes broad-by-design; B2B-by-title fights it.

- **Strict reporting needs.** PMax's reduced visibility doesn't work for accounts that require per-keyword reporting.

- **Specific compliance requiring placement controls.** PMax can't honor surface-specific exclusions.

For these cases: Search + Display + YouTube as separate campaigns gives you the granular control PMax abandons.

## When last-click attribution still beats DDA

Default is DDA. The exception:

- **Direct-response only, with no multi-touch journey worth modeling.** If your entire funnel is one-click-buy, DDA's contribution-redistribution doesn't help much.

- **Tiny accounts below DDA's volume threshold.** Below ~300 conversions/30 days, DDA may fall back to position-based behavior; explicit last-click is sometimes preferred for predictability.

- **Specific business-rule requirements.** "We pay our agency on last-click attributed revenue" — contracts may force last-click for audit, even if not optimal.

For most modern accounts: DDA is the right default. The exceptions are narrow.

## When you should override Smart Bidding decisions

Default: trust Smart Bidding's per-impression allocation. Exception:

- **Strategic must-bid moments.** If your CEO is presenting tomorrow and you need to be #1 on a specific keyword during a specific hour, override with manual or impression-share bidding for that window.

- **Brand crisis defense.** If a competitor is bidding hard on your brand and Smart Bidding isn't fully defending, manual brand campaign with high bid cap forces defense.

- **Product launch peak.** First 48 hours of a launch, you might over-spend deliberately to claim share, accepting CPA above normal.

These are tactical exceptions for short windows, not ongoing strategy.

## When tight audience targeting beats observation mode

Default: layer audiences in observation mode (signal but not constraint). Exception:

- **Compliance requirement.** Some industries require demonstrable restriction to certain audiences.

- **Privacy-sensitive targeting.** Government or sensitive segments require explicit gates.

- **Testing.** When you want clean data on whether audience X performs, targeting mode excludes contamination.

Otherwise observation mode is correct because it preserves Smart Bidding's ability to find users outside the audience.

## When fragmenting account structure makes sense

Default: consolidate. Exception:

- **Genuinely different markets** with different currencies, languages, and business logic.

- **Different products with different unit economics.** A $20 SKU and a $2,000 SKU shouldn't share a campaign because they need different ROAS targets.

- **Different objectives.** Lead-gen and direct-purchase shouldn't share a campaign even with the same audience.

- **Enforced budget minimums.** When the CFO mandates "spend $X/month on Brand Y exactly," separate campaigns are the only way to enforce.

None of these is "I want more granular reporting." Use breakdowns within campaigns for that.

## When to ignore your own data

Sometimes the data is wrong. Examples:

- **Tracking known-broken.** Don't make strategy decisions on data you know is bad.

- **Outlier promotional periods.** Black Friday CPA is not Q1 CPA; don't extrapolate.

- **Pre-launch market test data.** Tiny-sample results often mislead.

- **Attribution-vs-incrementality mismatch.** When lift tests contradict attributed numbers, trust the lift.

Operate on imperfect data; recognize when the data is too imperfect to act on.

## The three checks before deviating

Before breaking a rule, ask:

1. **Have you tried the default cleanly?** Many "I need to do something different" claims come from not honestly running the default long enough.

2. **Do you have data showing the default fails?** Hypothesis isn't data. Run the test.

3. **Can you articulate why?** "Because my audience is 200k decision-makers at SaaS companies and broad match would waste 99% of impressions on consumer users" is a why. "Because broad match feels risky" is not.

If all three check out, deviating is right. Otherwise the default is your safest bet.

## Common mistakes when breaking rules

- **Deviating from defaults out of habit.** Old-school PPC managers default to manual + exact match because that's what they know.

- **Stacking multiple deviations.** Manual + narrow + tROAS + restricted audience all at once = compounding constraints.

- **Not retesting periodically.** A deviation that made sense 2 years ago may not anymore as Google's system evolves.

- **Mixing deviation with experimentation.** Don't test "is manual better" by also changing creative and targeting simultaneously. Isolate the variable.

## The deeper principle

This whole course has been about understanding what Google's ML is optimizing and how to operate cleanly inside it. The rules aren't religious — they're heuristics for the median account. Yours might not be median. Learn the defaults, run them, then deviate where evidence justifies.

The advertisers who win in 2026 aren't the ones who memorized this playbook. They're the ones who understood the system well enough to know which rule applies, when, and why.

## Summary

- Defaults work for most accounts; every account has its exceptions.
- Manual CPC: tiny accounts, regulated audits, diagnostic tests.
- Narrow match: B2B by title, regulated, hyper-local, very high-AOV niche.
- Dedicated Search beats PMax: thin signal, tiny library, B2B narrow.
- Last-click over DDA: rare; mostly tiny accounts or specific business rules.
- Override Smart Bidding: tactical short-window strategic must-bid moments.
- Three checks: tried default? have data? articulate why?
- The system is the territory; the rules are a map.

Course complete.
