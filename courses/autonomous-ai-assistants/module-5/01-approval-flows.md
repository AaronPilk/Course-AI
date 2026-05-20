---
module: 5
position: 1
title: "Approval flows — how to ask, when to act unilaterally"
objective: "Design approval UX that respects user agency without becoming friction."
estimated_minutes: 9
---

# Approval flows — how to ask, when to act unilaterally

## The puzzle

Approval gates protect users from bad actions. They also slow everything down and make the assistant feel hesitant.

The art is asking for approval only where it matters, in a way that's fast to accept or reject, with sensible defaults. Get it right and users feel safe AND productive. Get it wrong and they either disable the assistant ("too much friction") or stop trusting it ("it did what without asking?").

## The simple version

Three approval patterns:

1. **Inline confirmation** — quick yes/no/edit in the current surface.
2. **Notification approval** — async; user approves when convenient.
3. **Rule-based auto-approval** — within bounds the user pre-authorized.

Pick per action and per autonomy level. Most production assistants stack all three.

## The technical version

### When to ask

Always ask before:

- Sending external messages (email, SMS, Slack).
- Moving money.
- Deleting or canceling.
- Booking on someone else's behalf.
- Posting publicly.
- Anything irreversible the user didn't directly request this turn.

Don't ask before:

- Read-only operations.
- Internal note-taking.
- Drafting (the draft itself is reversible).
- Searches and lookups.

The line: would a wrong action create lasting impact? If yes, ask. If no, act.

### Inline confirmation pattern

For interactive sessions, ask in the conversation:

```
Assistant: I'd like to send this email to sarah@x.com:

  Subject: Quick question on Q4 planning
  Body: Hi Sarah — wanted to check if you're free Thursday for...

  [ Send ] [ Edit ] [ Cancel ]
```

User clicks. Action proceeds or doesn't. No new surface; no context switch.

Critical: show the user *exactly* what will happen. Not "send the email" — show the actual content. Surprises burn trust.

### Notification approval pattern

For background/scheduled actions where the user isn't watching:

```
Push: "Auto-respond to Sarah's email is ready"
Tap → opens approval surface:

  Proposed reply:
  [content]

  [ Approve & Send ] [ Edit ] [ Skip ]
```

User approves async. The action waits. If user doesn't act in a reasonable time (24h?), default to skip and notify.

### Rule-based auto-approval

Users can authorize actions within bounds:

```
User opts in: "Auto-respond to emails from family members with a brief acknowledgment."

Rule:
  - Sender in family contacts.
  - Response length under 50 words.
  - No financial / health / legal terms detected.

If rule matches, action runs without prompting.
```

The rule is the standing consent. Users see results after; can revoke the rule anytime.

### Mixed strategy

Real assistants combine all three:

- Auto-approved (rules): low-stakes, narrow-scope.
- Notification-approved: medium-stakes, async-acceptable.
- Inline-confirmed: high-stakes or in-session.
- Hard-asked (no skip): destructive, financial, irreversible.

The user's experience: most things just work; some prompt at the right moment; the few that matter most always get full attention.

### Approval UX details

What makes approval feel good:

- **One-click approve / reject** — no nested menus.
- **Inline edit** — let the user tweak before approving.
- **Smart defaults** — if the user usually approves these, the button reads "Approve" prominently.
- **Visible preview** of the actual content/action.
- **Why this needs approval** — short reason if non-obvious.
- **Skip option** — for low-stakes, let users skip without penalty.

What makes approval feel bad:

- Pre-approval loading delays.
- Generic "do thing? yes/no" without preview.
- Modal pop-ups that interrupt other work.
- Hidden "send anyway" buttons or unclear cancel paths.

### Approval fatigue

If users approve 30 things a day, they stop reading the prompts. They become rubber stamps. Each approval should feel meaningful.

Mitigations:

- **Batch approvals** ("approve all 5 drafts? individual review?").
- **Confidence-based auto-approval** for high-confidence actions.
- **Reduce action frequency** if too many things need approval.
- **Audit weekly**: do all these need approval?

The goal is meaningful gates, not gates everywhere.

### Approval audit logs

Every approval interaction logged:

- What was proposed.
- What the user decided (approve / reject / edit).
- Who decided (user, auto-rule, etc).
- When.
- For edited actions: the diff.

This trail is what lets you investigate "the assistant did X" complaints. Without it, you're guessing.

### Approval timeouts

Notification approvals can sit indefinitely if the user doesn't act. Default behavior:

- **Short timeout for time-sensitive**: skip after 4-24h.
- **Long timeout for low-urgency**: 7 days.
- **Never auto-execute** on timeout. Always default to skip + notify.

The user controls their assistant; silence isn't consent.

### Two-person approval

For high-stakes actions in B2B contexts (large refunds, deletions, financial transactions), require two distinct humans to approve. Common in regulated industries.

If your product touches these surfaces, build two-person approval as an option.

## Three real-world scenarios

**Scenario 1: The drag-down approval.**
A team asked for approval on every action including drafts. Users complained: "too many prompts." Audit revealed 80% of approvals were on actions the user always approved. Switched to: drafts auto-allowed; sends always prompted; financial always two-person. Friction dropped; trust held.

**Scenario 2: The auto-approval rule that paid off.**
A user opted in to "auto-respond to family with short acknowledgments." Bot caught 4 family pings during a focused workweek and auto-responded. User loved it; nothing went wrong. Sometimes the right answer is letting the bot act within sharp bounds.

**Scenario 3: The rubber-stamp problem.**
A team's approval UX showed only a summary, not the action's content. Users approved quickly, missed the time the bot proposed something wrong. They redesigned to show the full proposed content prominently. Mistakes caught early; users felt in control.

## Common mistakes to avoid

- **Approval on everything** — fatigue, rubber-stamping.
- **No approval on irreversible.** Inevitable incidents.
- **No preview of the action.** Users approve blind.
- **Generic "yes/no" prompts.** Should be specific to the action.
- **Approval timeouts that auto-execute.** Silence isn't consent.
- **No edit-and-approve path** — forces redo from scratch.

## Read more

- [Anthropic — building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- [Stripe two-person approval](https://stripe.com/docs/security/two-person-approval)

## Summary

- Three approval patterns: **inline confirmation, notification approval, rule-based auto-approval**.
- **Ask before** sends, money, deletes, posts, irreversible actions. **Don't ask before** reads, drafts, lookups.
- **Show the actual action**, not a summary, in approval prompts.
- **One-click approve/reject/edit**; smart defaults; skip option for low-stakes.
- **Audit log** every approval decision.
- **Never auto-execute on timeout** — silence isn't consent.
- **Two-person approval** for high-stakes B2B/regulated actions.

Next: transparency — making the assistant's work visible.
