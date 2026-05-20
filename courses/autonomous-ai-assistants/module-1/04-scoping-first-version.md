---
module: 1
position: 4
title: "Scoping the first version"
objective: "Cut the assistant's scope to something users will actually adopt."
estimated_minutes: 9
---

# Scoping the first version

## The puzzle

Imagined assistants are infinite: "manage my whole life." Shippable assistants are bounded: "this thing, well, for this kind of user."

The biggest mistake new assistant teams make is shipping too wide — a generalist assistant that's slightly worse at everything than the specialized tools it's trying to replace. Scope hard at v1. Earn permission to expand.

## The simple version

For v1, pick:

1. **One user persona** (not everyone).
2. **One job-to-be-done** (not everything).
3. **One trust level** (typically level 3).
4. **2–5 connected tools** (not 20).
5. **One scheduled task type** (if any).

Better to ship a great narrow assistant than a mediocre wide one. Expand only when v1 is loved.

## The technical version

### Pick the persona

Not "everyone." A specific user type:

- "Engineering managers running weekly 1:1s."
- "Solo founders managing inbound deal flow."
- "Customer success ICs on accounts with >50 seats."
- "Researchers managing literature for a paper."

Specificity helps every decision: which tools to connect, which schedule fits, what voice to use, what failure modes hurt most.

If you're scoping "knowledge workers," you're not scoped enough.

### Pick the job-to-be-done

What specific thing does the assistant do for this persona? Ideally:

- **Recurring** (so the assistant runs many times for one user, building trust).
- **Concretely valuable** (the user can articulate "this saved me X time").
- **Lower stakes** (recoverable mistakes; trust grows).
- **Multi-tool** (justifies an assistant vs. a feature in any single tool).

Examples:

- Weekly 1:1 prep — pulls from calendar, doc history, project tracker, code commits. Concrete value: 30-60 min saved.
- Deal-flow inbox triage — categorizes inbound investor emails. Concrete value: prioritization clarity, time saved.
- Daily standup draft — pulls from yesterday's commits, calendar, chat. Concrete value: 5-10 min saved + better quality.

Cut scope until your JTBD fits on one line.

### Pick the autonomy level

For v1, default level 3 (initiative + approval). Reasons:

- Lower trust required.
- Easier to debug — every action goes through user review.
- Smaller eval surface.
- Faster iteration loop with real users.

Level 4 (scheduled) is the next step once level 3 works. Level 5 is a later phase, after months of trust and evals.

### Pick the tool integrations

Each connected tool adds:

- OAuth integration work.
- New error surface.
- Eval cases.
- Permission/privacy considerations.

Minimize. For v1, 2–5 tools max. Choose the ones genuinely needed for the JTBD:

- Calendar for time-aware tasks.
- Email or chat for communication context.
- One project tracker for work context.
- One doc store for content context.

If you find yourself adding "we should also connect to X" — ask: does the JTBD truly need it? If not, defer to v2.

### Pick the schedule (if applicable)

Scheduled tasks add a big trust dimension. For v1:

- **One scheduled task type**, opt-in only.
- Sensible default (daily at 8am, weekly Monday 9am).
- User can disable or change schedule.
- Each run surfaces clearly ("here's your morning brief").

If you're starting with reactive interactions only (no schedule), that's fine. Add schedule when v1 is solid.

### Define the failure modes you can tolerate

For your scoped v1, list:

- **Bad miss**: assistant misses something important. Tolerable? How often?
- **Wrong action**: assistant does the wrong thing. Tolerable? How recoverable?
- **Noise**: assistant surfaces too much / too often. Tolerable?
- **Silence**: assistant doesn't run when it should. Tolerable?

Each implies eval cases. Build them before shipping.

### Eval before shipping

Build a 30–50 case eval for your scoped v1:

- Happy paths (typical JTBD inputs).
- Edge cases (weird inputs, missing data).
- Adversarial (prompt injection in inputs).
- Approval respect (level-3 boundary not crossed).
- Format and tone (matches expected voice).

Run before every prompt change. Without evals, you ship blind.

### Onboarding for an assistant

Assistants need careful onboarding:

- **Permission walkthrough**: explicit tool connection with clear ask.
- **First successful action** within minutes: demo value early.
- **Trust ladder**: level 3 by default; level 4 features highlighted with explicit opt-in.
- **Settings surface**: user can see and adjust everything.
- **Easy uninstall**: revoking permissions should be one click.

A bad onboarding kills assistants before they have a chance.

### What to skip in v1

Tempting v1 features that should usually be v2 or later:

- **Multi-user / shared assistants.** Solo first.
- **Voice or computer-use interfaces.** Text first.
- **Cross-organization integrations.** Single-org first.
- **Premium pricing tiers.** Free + waitlist first.
- **Mobile-first.** Desktop-first for most knowledge-work assistants.
- **AI memory across all conversations.** Persistent for the specific JTBD; broader memory later.

Each is real work. Defer until v1 has product-market fit.

### The 30-day v1 plan

A rough cadence:

- **Week 1**: pick persona + JTBD. Sketch UX. Define eval set (10-15 cases).
- **Week 2**: build connectors (2-3). Build basic agent loop. Run eval; iterate prompts.
- **Week 3**: add approval UI, audit log, settings surface. Expand eval to 30+ cases.
- **Week 4**: closed beta with 5-10 users in the target persona. Watch metrics, listen for failure modes, iterate.

After 30 days, you'll know if the v1 scope worked. Expand scope based on what users actually used vs. what they ignored.

## Three real-world scenarios

**Scenario 1: The narrow v1 that won.**
A team built an assistant for "executive coaches managing client notes." Just one persona. Tools: Notion + Calendar. JTBD: pre-session prep doc. v1 took 4 weeks. 20-coach beta. Strong activation. Expanded later to other use cases — but the v1 carried the trust.

**Scenario 2: The "everyone's AI assistant."**
A team launched a general-purpose AI assistant for knowledge workers. Connected 12 tools, supported any task. Users tried it once, didn't know what it was for, didn't return. Eight months later they pivoted to "AI for sales engineers" with 4 tools and a specific JTBD. Found traction.

**Scenario 3: The right scope, wrong autonomy.**
A team scoped well (specific persona, specific JTBD) but launched at level 5 — assistant taking actions autonomously. Mistakes happened. Users churned. They reverted to level 3 with the same scope. Adoption stabilized. Lesson: scope and autonomy are independent decisions; both must be right.

## Common mistakes to avoid

- **Scoping to "knowledge workers."** Too broad.
- **Multi-persona v1.** Each persona has different needs.
- **Too many tools.** Each is integration work + risk.
- **Skipping evals.** Ship blind, debug forever.
- **Skipping onboarding.** Users don't know what the assistant is for.
- **Launching at the wrong autonomy.** Match level to user trust.

## Read more

- [Anthropic — building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- Geoffrey Moore — *Crossing the Chasm* (on early-adopter scoping)

## Summary

- v1 = one persona, one JTBD, one trust level (usually 3), 2–5 tools, optional one scheduled task.
- **Specificity helps every decision** in the assistant's design.
- **30-day v1 plan**: pick scope, build, eval, closed beta. Expand based on real usage.
- **Skip in v1**: voice, multi-user, cross-org, multi-persona, all-tools.
- **Onboarding matters more for assistants** than for chatbots — permission walkthroughs, first-value moments, settings clarity.
- **Scope + autonomy are independent**. Both must be right.

That wraps Module 1. Next: connecting the assistant to real tools.
