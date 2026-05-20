---
module: 1
position: 3
title: "The trust budget — what users will let an assistant do"
objective: "Map the actions you propose against user trust levels."
estimated_minutes: 9
---

# The trust budget — what users will let an assistant do

## The puzzle

You can build an assistant with 30 capabilities. Should you ship all 30? Probably not — even if technically possible. Users will reject the assistant entirely if its capability range outpaces the trust they've built.

This lesson is about the **trust budget**: the implicit ledger users keep of "what this assistant has earned." Spend wisely.

## The simple version

Every user gives an assistant a starting trust budget, usually small. Each interaction:

- **Successful action**: adds to the budget.
- **Failed action**: subtracts heavily.
- **Surprising action** (user didn't expect): subtracts disproportionately.

Capabilities can only be deployed against the trust budget. A new user only lets you do small things; a longtime user lets you do bigger ones — *if* you've earned it.

## The technical version

### Trust starts small

A new user trying your assistant:

- Will let it read public data: medium trust.
- Will let it read their data on request: lower trust.
- Will let it draft content: low trust (review needed).
- Will let it act on their accounts: very low trust.

You don't get to start at "full delegation." You start at "show me what you can do."

### Trust scales with successful, transparent actions

Each visible, successful action raises the budget:

- Bot fetches a calendar event correctly: small bump.
- Bot drafts an email the user actually sends: bigger bump.
- Bot proactively flags a scheduling conflict before the user notices: significant bump.

Failures and surprises spend trust faster than success builds it. A bot that gets 10 things right but does 1 surprising thing nets close to zero or negative trust.

### Categories of trust required

Roughly in order of trust needed:

1. **Reading public info** (web, generic answers): minimum trust.
2. **Reading user data via simple requests** ("show me my calendar"): small trust.
3. **Reading user data across systems** ("summarize my week"): medium trust.
4. **Drafting content for user review** ("draft a reply"): medium trust.
5. **Scheduled or background tasks** (daily briefing): higher trust.
6. **Acting on user accounts with approval** ("send this email after I approve"): high trust.
7. **Acting on user accounts unilaterally** ("respond to non-critical pings as me"): very high trust.
8. **Spending money** ("book this flight under $500"): very high trust.
9. **Communicating on user's behalf to important people**: peak trust.

Match your features to the trust your typical user has at the time they encounter that feature.

### Trust is per-user, per-context

Some users will let you do level-7 things on day one. Others will not even accept level 4 after months. Don't assume a single trust curve.

Patterns:

- **Per-user opt-in** for higher-trust features.
- **Per-task trust**: user trusts the assistant with calendar, not with email. Respect the boundary.
- **Graduated capability rollout**: capabilities surface gradually as the user uses simpler ones successfully.

### Trust-eroding behaviors

What burns trust fast:

- **Acting before asking** when the action affects external state.
- **Hidden capability**: user surprised by what the bot did.
- **Wrong but confident**: the bot makes a mistake and acts certain about it.
- **Inconsistency**: same input, different action.
- **Stale context**: bot remembers something inaccurate from before.
- **Privacy violation**: bot reveals info user thought was private.

Each of these spends multiple "credits" of trust.

### Trust-building behaviors

What builds trust:

- **Showing work**: bot explains what it did and why.
- **Asking before risky actions**: even when technically allowed.
- **Admitting uncertainty**: "I think X, but you should verify" beats false confidence.
- **Honoring boundaries**: user said "don't email my boss"; bot doesn't.
- **Consistency**: same behavior in similar situations.
- **Quick undo**: any action has a one-click rollback.
- **Audit trail**: user can see exactly what happened.

Each builds trust quietly over time.

### The trust UX

Some design patterns make the trust budget visible:

- **A "permissions" surface**: user can see and adjust what the assistant is allowed to do.
- **A "review" surface**: user can see recent actions and undo.
- **Confidence indicators**: bot signals when it's unsure.
- **Onboarding ramps**: assistant explicitly asks for new permissions only after demonstrating value.

These patterns let users grow trust deliberately instead of waiting for it to accumulate by accident.

### The "demo to early-adopter to mainstream" ramp

Trust-shape across users typically goes:

- **Internal demo**: team is enthusiastic, accepts mistakes, gives generous trust.
- **Early adopters**: tolerant, curious, willing to opt in to higher autonomy.
- **Mainstream**: cautious, low tolerance for surprise.

The features that delight early adopters scare mainstream users. Build for both — same product, different defaults.

### Trust collapse

Once trust collapses (a major incident, a privacy breach, a surprising email sent on user's behalf to the wrong person), recovery is slow or impossible. Users tend to "uninstall mentally" even if they don't actually delete.

The asymmetry: you can spend years building trust and lose it in one bad day. Operate accordingly.

### How to budget for new features

Before shipping a new capability:

1. **What trust level does it require?** Match against your typical user.
2. **Is it gated?** Approval, opt-in, undo path.
3. **Is it transparent?** User sees what happens.
4. **What's the failure mode?** What does a mistake look like — and how bad is it?

If the failure mode is bad and the trust required outpaces typical users, gate behind opt-in for early adopters, build evals, watch carefully before expanding.

## Three real-world scenarios

**Scenario 1: The slow-trust win.**
A productivity assistant launched at level 3 (proposals only). For 6 months, the assistant drafted; users approved. Trust built. At month 7, the team offered opt-in level-4 (scheduled morning briefings) to users with high engagement. Opt-in rate was 40% — much higher than if offered on day 1.

**Scenario 2: The capability that burned the budget.**
A team added a "smart inbox cleanup" feature that auto-archived emails the bot thought were unimportant. Bot was right 95% of the time. The 5% miss rate generated outsized angry feedback — important emails archived without notice. They reverted to "suggest archives, user clicks confirm." Same value, no trust burn.

**Scenario 3: The unrecoverable incident.**
An assistant had calendar access. A bug made it accept a meeting on the user's behalf with someone they were specifically avoiding. User churned and posted about it. The product had operated correctly for months — one mistake erased that. Lesson: features touching social/professional optics carry asymmetric risk.

## Common mistakes to avoid

- **Shipping high-trust features to new users.** Trust hasn't been earned.
- **Hidden capability.** Users surprised by what the bot did.
- **No undo on high-stakes actions.** Trust collapses on first error.
- **Treating mainstream like early adopters.** Same defaults, different tolerance.
- **Burning trust for marginal gains.** Saving the user a click isn't worth a privacy concern.

## Read more

- [Anthropic — building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- Don Norman — *The Design of Everyday Things* (trust and feedback)

## Summary

- Every user has a **trust budget** for the assistant. New users start with little.
- Capabilities can only be deployed against the trust budget — outpace it and the user rejects the assistant.
- **Build trust** with transparency, asking before risky actions, consistency, undo paths, audit trails.
- **Burn trust** with surprises, hidden actions, false confidence, privacy violations, inconsistency.
- **Opt-in higher autonomy** for users who've built trust — don't default everyone to level 5.
- **Trust collapse is hard to recover from.** Operate with that asymmetry in mind.

Next: scoping the first version.
