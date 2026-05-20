---
module: 4
position: 3
title: "Experimentation and A/B testing"
objective: "Learn what changes actually move metrics."
estimated_minutes: 5
---

# Experimentation and A/B testing

## What A/B testing does

Show users different variants of a feature; measure which performs better.

```
Variant A (control): green button, current copy
Variant B (treatment): orange button, new copy

Track: click-through rate per variant.
```

After enough samples, statistically determine: B converts 8% better than A → ship B.

Tells you ground truth about your product changes. Without it, decisions are based on opinion and HiPPO ("highest paid person's opinion").

## When to A/B test

- **Major UI changes.** Could go either way; want data.
- **Pricing changes.** Massive revenue impact; testing is essential.
- **Onboarding flow.** Conversion-critical.
- **Email subject lines.** Easy to test; quick wins.
- **Algorithm changes.** Search ranking, recommendations.

When NOT to A/B test:
- Tiny cosmetic changes (waste of effort; do many at once).
- Foundational changes (testing your billion-dollar pricing decision is awkward).
- Things customers have already requested (just ship).
- Bug fixes.

## The setup

```python
def show_button(user):
    variant = experiment.get_variant('button_color', user)
    if variant == 'orange':
        return orange_button()
    else:  # 'green' is control
        return green_button()
```

Each user randomly assigned to a variant (stable bucketing). Track which variant + outcome:

```python
analytics.track(user, 'button_clicked', properties={
    'variant': variant
})
```

Conversion calculated per variant; statistical test determines which is better.

## Statistical significance

Two variants converting at 5% vs 5.2% — could be real (better) or could be noise. Significance tests (typically a two-proportion z-test or Bayesian methods) say "P-value < 0.05" or "97% probability B is better."

You need enough samples. Rules of thumb:
- For ~5% baseline conversion: need a few thousand users per variant.
- For ~1% baseline: tens of thousands.

Stop too early → false positive (ship something that doesn't actually work). Run too long → wasted time. Power calculations tell you sample size needed for a given expected effect size.

Tools (Statsig, GrowthBook, Optimizely) compute these automatically.

## Multi-armed bandits

Alternative to traditional A/B: bandits dynamically shift more traffic to the better-performing variant as evidence accumulates:

```
Hour 1: 50% A / 50% B → A is winning
Hour 2: 40% A / 60% B → A still winning
Hour 3: 30% A / 70% B → A clearly better
```

Pros: less "wasted" traffic on the losing variant.
Cons: harder to interpret; might converge to local optimum.

For most use: traditional A/B is fine; bandits for high-stakes / time-sensitive optimization (homepage of major site).

## Common pitfalls

**Peeking.** Looking at results before sample size reached; stopping when "significant." This inflates false positives. Pre-declare your sample size; wait for it.

**Multiple comparisons.** Running 10 experiments; one shows "significant" by chance. Adjust significance threshold (Bonferroni) or use Bayesian.

**Selection bias.** Variants applied non-randomly (e.g., only EU users see B). Variant becomes a proxy for region; conclusions wrong.

**Novelty effect.** New variant performs better just because it's new; effect fades in weeks. Run experiments for at least 1-2 weeks.

**Survivorship bias.** Measuring conversion of users who completed signup; ignoring those who quit. Track full funnel.

## A/A testing

Run an experiment where both variants are identical. Should show no significant difference. If it does → something's wrong with your experiment infrastructure (bias in bucketing, instrumentation bug).

Periodically: A/A as a sanity check on your platform.

## Per-tenant vs per-user

For B2B: experiments per-tenant make sense (whole team sees same variant; consistent UX). Per-user can confuse — Aaron sees variant A; Linus on same team sees variant B; they collaborate confusedly.

For B2C: per-user typical.

Stable bucketing key matters: hash(tenant_id) vs hash(user_id) depends on your case.

## Metrics that matter

- **Conversion.** % users completing target action.
- **Engagement.** Time spent, features used.
- **Retention.** % returning after N days.
- **Revenue.** $ per user.

Pick a primary metric; track secondary metrics for "didn't break anything else." A signup-flow experiment that improves conversion 5% but reduces 30-day retention 10% is bad — net.

## Customer impact and ethics

A/B testing real users on real money matters. Some ethical considerations:
- **Don't experiment on safety / compliance-critical paths.** Login, payment, security.
- **Tell users about experimentation in terms.** "We sometimes test variations."
- **Don't show price discrimination based on attributes** (illegal in some jurisdictions).
- **Stop experiments showing harm.** Don't continue B if it's clearly worse.

Facebook's emotional contagion experiment (2014) is the textbook case of "don't do this." Be thoughtful.

## Tools

**LaunchDarkly.** Feature flags + experimentation; enterprise.
**Statsig.** Modern; free tier; combines flags + experiments.
**GrowthBook.** Open-source; self-host or hosted.
**PostHog.** Combines product analytics + experiments.
**Optimizely.** Marketing-focused; A/B testing pioneer.
**Amplitude Experiment.** If you're already on Amplitude analytics.

For early SaaS: Statsig, PostHog, GrowthBook all have generous free tiers. Pick by what aligns with your analytics stack.

## Hold-out groups

Some experiments need a "hold-out" group permanently in control: long-term effects of major changes can only be measured against people who never saw the new version.

Example: "Did the new pricing actually help retention over a year?" Compare retention of users on new pricing vs users still on old (kept as hold-out).

Tools support this; takes discipline to maintain.

## Mistakes to avoid

- **Skip statistical significance.** Make decisions on noise.
- **Test too many things at once.** Confounded results.
- **Peek and stop early.** False positives.
- **No A/A sanity checks.** Bugs in your experiment infra.
- **Ship the variant without removing the experiment flag.** Tech debt.

## Summary

- A/B test major changes; measure ground truth.
- Significance tests prevent shipping noise.
- Stable bucketing; primary metric pre-declared.
- Watch for peeking, selection bias, novelty effects.
- Run A/A occasionally to validate infra.
- Tools (Statsig, GrowthBook, PostHog) integrate flags + experiments.

Next: deploy strategies.
