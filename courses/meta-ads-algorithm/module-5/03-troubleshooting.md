---
module: 5
position: 3
title: "Troubleshooting — diagnosing the most common failures"
objective: "Walk through real failure modes systematically."
estimated_minutes: 7
---

# Troubleshooting — diagnosing the most common failures

## The diagnostic approach

When something breaks, the temptation is to start changing things. Resist. Run a structured diagnosis first. The order matters because some causes mask others — if your tracking is broken, no creative test will give honest results.

Diagnostic order:

1. **Tracking layer first.** Is the pixel + CAPI firing? Is EMQ healthy? Are conversions counted correctly?
2. **Structural layer next.** Account/campaign/ad set structure. Audience overlap. Learning-phase status.
3. **Targeting layer.** Audience appropriate for offer? Exclusions wired? Audience size right?
4. **Creative layer.** Library size, hook performance, creative freshness, frequency.
5. **Bidding/budget layer.** Bid strategy, budget level, budget pace.
6. **Macro layer.** Seasonality, competition, broader market shifts.

Most issues live in layers 1-4. Only after exhausting those should you consider 5-6.

## Failure: CPA suddenly doubled

Symptoms: yesterday CPA was $20, today it's $45.

Diagnostic flow:

- **Check tracking first.** Did pixel or CAPI break? Test Events tool. If events stopped firing, conversions aren't being attributed; CPA looks bad because Meta thinks fewer happened.
- **Check the date.** Is "today" complete? Yesterday's data has 24+ hours of conversions still to arrive. Wait 3 days before judging.
- **Check spend pattern.** Did budget spike? A doubled budget overnight triggers learning reset; CPA looks bad during the reset.
- **Check creative.** Did a winning ad get paused or run out (frequency-related fatigue)?
- **Check audience.** Did an exclusion list expand and starve the pool?
- **Check competition / season.** Is it Black Friday week, a competitor launch, a news cycle?

Often the cause is "yesterday wasn't complete data." Wait 72 hours; problem usually self-corrects partially. If it persists, work through the list.

## Failure: ROAS dropped, but conversions look the same

Symptoms: same number of purchases, lower revenue per purchase.

Likely causes:

- **Wrong AOV** in tracking — `value` parameter is misconfigured for some products.
- **Currency mismatch** — sending USD on EUR sales (or vice versa).
- **Promotional discount** — running a 30% off sale; same conversions but each is worth less.
- **Buyer mix shifted** — new acquisition is finding lower-AOV buyers (broad targeting expansion catching less-qualified users).
- **Cart composition** — buyers buying single SKU instead of bundles.

Audit the pixel `value` parameter first. The other causes need business-side data review.

## Failure: hook rate fine, CTR weak

Symptoms: 40% hook rate, 0.5% CTR.

The hook is stopping scrolls; the body isn't converting attention. Causes:

- **Hook is bait** — promises something the body doesn't deliver; users disengage at second 4.
- **Value prop unclear** — body doesn't quickly state "what / who-for / why-now."
- **CTA buried** — link click depends on knowing what happens when they click; if the CTA isn't visible or compelling, no click.
- **Wrong placement type** — vertical-only video performing well on Reels but terribly on Feed where it's letterboxed and looks low-effort.

Fix: tighten body messaging, surface CTA earlier, check placement breakdown.

## Failure: high CTR, low CVR

Symptoms: 2% CTR (great), 0.3% CVR (bad).

The ad is overpromising or the landing experience underdelivers:

- **Promise/page mismatch** — ad says "free trial" but page asks for credit card.
- **Slow page load** — users bounce before page renders.
- **Mobile UX broken** — ad clicks come 90% mobile; if the page isn't mobile-optimized, conversion craters.
- **Wrong audience** — ad pulled curious clickers, not buyers (creative attracted wrong intent).
- **Friction in checkout** — too many fields, no Apple Pay/Google Pay, no guest checkout.

Open the page on mobile, time the load, do the conversion yourself. Almost always reveals the issue.

## Failure: best ads degraded

Symptoms: an ad that was a $15 CPA hero is now $35 and rising.

Most likely: **ad fatigue**. The audience has seen it 6+ times. The cure isn't to pause the winner — it's to add new ads to the rotation so frequency on the winner drops.

Other possibilities:

- **Macro shift** — seasonal demand changed.
- **Competitor activity** — your category got more crowded, CPMs rising.
- **Tracking degraded** — pixel breakage masquerading as performance drop.

Add 3-5 new ads, refresh creative variety, watch frequency drop. If CPA recovers, fatigue was the cause.

## Failure: Advantage+ underperforming vs manual

Symptoms: ASC CPA worse than your manual prospecting campaigns.

Diagnostic:

- **How long has ASC been running?** Under 7 days = too early.
- **How many ads in ASC?** Under 5 = thin library limits rotation.
- **What's the Existing Customer Budget Cap?** Too high (50%+) and ASC is repainting customers.
- **What's the pixel signal volume?** Under 50 events/week site-wide = ASC can't find users.
- **What's the audience eligibility?** ASC is broad-by-design; if your offer needs narrow (B2B title, regulated), ASC fights its strength.

Most underperforming ASCs are fixable with creative volume + time. Some genuinely don't fit the offer; back to manual.

## Failure: account-wide CPA drift

Symptoms: every campaign slowly worse over weeks.

- **Audience saturation across the account.** You've hit the broad pool and now reaching marginal users in every campaign.
- **Creative library age** — most ads >90 days old, fatigued across the board.
- **Tracking decay** — CAPI integration slowly degrading, EMQ falling.
- **Seasonal** — January after Q4 is universally worse for many categories.

Strategic responses: expand to new geos, refresh full creative library, audit and rebuild CAPI, accept seasonal cycle.

## Failure: learning phase never exits

Symptoms: ad sets stuck in "Learning" indefinitely.

Always traceable to under-conversion: the ad set isn't getting 50+ optimization events per week. Causes:

- **Budget too low** — $20/day on a $20 CPA product = 1 event/day = 7/week. Won't exit.
- **Optimization event too narrow** — optimizing for "complete registration" when you only get 20/week.
- **Audience too small** — restricted targeting starves volume.
- **Bid cap too tight** — Meta can't find users at your cap.

Either consolidate budget into fewer ad sets, or switch optimization to an event with more volume (still meaningful upstream — InitiateCheckout instead of Purchase if Purchase volume is too low), or open targeting.

## Failure: Meta numbers diverge wildly from Shopify

Symptoms: Meta reports $80k, Shopify shows $40k for the period.

- **Deduplication broken** (event_id missing) — Meta double-counts. Most common cause of ROAS inflation.
- **Attribution window too generous** — viewing 28-click + 7-view shows numbers Shopify doesn't credit.
- **View-through inflation** — Meta crediting view-only conversions Shopify attributes elsewhere.
- **Currency mismatch** — sending USD on EUR.

Fix dedup first; usually closes 50%+ of the gap.

## Failure: rejected ads keep getting flagged

- **Review the policy citation.** Meta's rejection notice names a category; usually fixable.
- **Common triggers**: before/after photos in health/beauty, claims of guaranteed outcomes, sensitive personal attributes, copyright issues.
- **Soften claim language**, remove guaranteed-outcome framing, use lifestyle photos instead of before/afters.
- **Appeal if confident** — Meta's automated review has high false-positive rates; human review often reverses.
- **Repeat rejections** — your account may have a flag; consider talking to a Meta rep.

## Mistakes during troubleshooting

- **Multiple changes at once** — can't tell which fixed it.
- **No baseline measurement** — making changes without recording before-state.
- **Reacting to noisy data** — wait for 72 hours of post-change data before judging.
- **Skipping the tracking layer** — measurement bugs masquerade as performance issues constantly.

## Summary

- Diagnostic order: tracking → structure → targeting → creative → bidding → macro.
- CPA spikes often = incomplete data + budget shifts + tracking issues.
- High hook + low CTR = body problem. High CTR + low CVR = landing or audience mismatch.
- Fatigue cures with new creative, not pausing winners.
- Learning-phase stuck = under-50 events/week; consolidate budget or shift event.
- Meta vs platform revenue mismatch usually = deduplication failure.
- Change one thing at a time.

Final lesson: when to break the rules.
