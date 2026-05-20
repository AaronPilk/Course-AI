---
module: 5
position: 2
title: "Transparency — making the assistant's work visible"
objective: "Surface what the assistant is doing so users keep trust."
estimated_minutes: 8
---

# Transparency — making the assistant's work visible

## The puzzle

Your assistant ran 12 scheduled tasks last week. Sent 4 auto-responses. Filtered 87 emails. Updated 2 calendar invites. The user knows about almost none of it.

That's a problem. Hidden work is the fastest path to "what did this thing just do?" — and once that question is asked angrily, the trust budget is already burning.

Transparency is making the assistant's work visible, not as an avalanche but as something the user can check anytime.

## The simple version

Three transparency surfaces:

1. **In-the-moment narration** — "I'm checking your calendar... looking up Sarah's email..."
2. **Activity log / receipts** — every action the assistant took, with timestamps and details.
3. **Periodic recap** — weekly summary of what the assistant did on your behalf.

Each serves a different purpose. Together they turn a black-box assistant into a glass-box one.

## The technical version

### In-the-moment narration

When the assistant is actively running:

```
✓ Checked your calendar — 3 meetings today
✓ Found 2 unread emails from VIP contacts
🤔 Drafting reply to Sarah...
✓ Draft ready (preview below)
```

Each step visible, in order, with status. The user watches the work unfold. Anti-pattern: spinner only, no narration.

### Activity log

A persistent surface listing every action the assistant took:

```
This week:
Mon Nov 13
  - 8:00 AM — Generated morning brief (3 items)
  - 9:14 AM — Auto-acknowledged email from mom (rule: family-ack)
  - 2:30 PM — Drafted reply to Sarah (waiting for approval)
  - 4:15 PM — Filtered 12 newsletter emails

Tue Nov 14
  ...
```

Filterable, searchable, exportable. Each entry links to details (full content, timestamps, approval status).

### Periodic recap

A weekly or monthly summary:

```
This week, your assistant:
- Sent 3 messages on your behalf (all approved by you)
- Drafted 12 replies (you sent 9, skipped 3)
- Generated 5 morning briefs
- Filtered 142 emails into low-priority bucket
- Spent 23 minutes of compute time

Notable:
- Sarah's escalating thread got 4 of your replies — should we mute?
- Skipped briefs for Sat/Sun per your weekend rule
```

The recap turns "what does this thing do all day" into something the user can read and feel oriented about.

### What to surface

- **All actions taken** with timestamps.
- **All decisions auto-approved** with the rule that allowed them.
- **All proposals pending approval**.
- **All skips** ("we skipped digest on Tuesday — nothing notable").
- **Recurring patterns** ("you've approved 8/10 drafts to Sarah this month").

Skipping anything from this list is hiding work. Don't hide.

### What NOT to surface (too much)

Some logs are too granular for users:

- Every tool call inside a single agent step.
- Every internal state change.
- Every retrieval query.

These belong in engineering observability (trace IDs, dashboards), not user-facing transparency. The user-facing version should be human-readable summaries, not API trace dumps.

### "Why did the assistant do that?"

A common user question after a surprise:

- Surface "why" alongside "what" in the activity log.
- "Auto-acknowledged because rule 'family-ack' matched."
- "Drafted reply because mention from VIP detected."
- "Sent immediately because rule 'urgent-confirmed-senders' applied."

Every action has a reason; surface it. Users learn to predict assistant behavior; they trust it more.

### Discoverability of the transparency UI

Transparency only works if users find it:

- **Always-accessible** from a header link or persistent button.
- **Linked from notifications**: "tap to see why."
- **Highlighted in onboarding**: "here's where to see everything the assistant does."
- **Surfaced after first major action**: "the assistant just sent an email — see receipt."

Bury the activity log in settings and nobody finds it. Trust dies in obscurity.

### Live status vs. historical

Two modes:

- **Live**: what's happening right now (running tasks, pending approvals).
- **Historical**: what happened.

Different UI. Live is small and prominent ("3 tasks running"). Historical is rich and searchable.

### Privacy considerations

The transparency log contains sensitive history. Treat it accordingly:

- **User-only access** — never share across users.
- **Filter sensitive content** the user marked private.
- **Allow per-entry hiding** if a user wants to suppress a specific item.
- **Honor deletion** — when the user deletes activity, actually delete.

### The "honest hand" pattern

A specific UX move: when the assistant makes a mistake, the activity log shows it clearly. "Auto-replied to Sarah; you marked this as 'wrong action.'" The log records both the action and the user's correction.

This builds long-term trust faster than hiding mistakes. The assistant is honest; users feel safer using it.

## Three real-world scenarios

**Scenario 1: The activity log that prevented churn.**
A user came back from vacation, opened their assistant, and saw the activity log: every auto-action handled, every brief skipped, every approval pending. Felt in control instead of catching up. Lower churn after vacations.

**Scenario 2: The hidden filter that exploded.**
A team's assistant filtered emails silently into a low-priority bucket. User found an important email in the filtered bucket weeks later. Lost trust completely. They added transparent filtering — every filtered item appears in the activity log with the rule that caused it; users can override. Trust slowly rebuilt.

**Scenario 3: The weekly recap that drove engagement.**
A team added a Sunday-evening "your assistant this week" email. Users read it; many adjusted their rules based on what they saw. Engagement with the assistant increased; rules got better; perceived value rose. The recap was its own product surface.

## Common mistakes to avoid

- **Hidden actions.** Best path to a trust crisis.
- **Buried transparency UI** that users can't find.
- **Activity log too granular** (raw API traces nobody reads).
- **No "why" alongside "what."** Mysterious actions feel wrong.
- **No recap** — users don't realize how much value the assistant provides.
- **Suppressing mistakes from the log.** Users discover later; trust collapses.

## Read more

- [Don Norman — visibility of system status](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Anthropic — building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)

## Summary

- **In-the-moment narration**, **activity log**, **periodic recap** — three transparency surfaces.
- **Surface every action** with what, when, and why.
- **Don't hide auto-approved actions** — show them in the log with the rule that allowed them.
- **Discoverability matters** — keep the transparency UI prominent.
- **Honest about mistakes** — log includes errors and user corrections.
- **Privacy and deletion** apply to the transparency log too.

Next: privacy, audit, and the user's right to know.
