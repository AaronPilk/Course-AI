---
module: 3
position: 4
title: "Notifications and digests — surfacing background work"
objective: "Tell users what happened without overwhelming them."
estimated_minutes: 8
---

# Notifications and digests — surfacing background work

## The puzzle

Your assistant just spent 30 seconds doing work in the background. How does the user find out? Push notification? Email? In-app inbox? The choice — and the format — determines whether the user feels supported or pestered.

## The simple version

Three surfaces for surfacing background work:

1. **Immediate notification** (push, SMS) for truly urgent things.
2. **In-app inbox** for things worth seeing soon but not interrupting.
3. **Digest** (email, daily roll-up) for the medium-importance backlog.

Let users configure per-event. Default to less-urgent surfaces; let them upgrade specific rules.

## The technical version

### Notification levels — pick deliberately

| Level | Surface | When |
| --- | --- | --- |
| Urgent | Push / SMS | True interrupt-worthy (VIP email, security alert, time-sensitive meeting issue) |
| Soon | In-app inbox or one-time email | Worth seeing today (PR review request, low-stakes deal moved) |
| Digest | Daily / weekly summary | Worth knowing eventually (newsletter, FYI, low-priority context) |

The temptation is to push everything. Resist. Most things belong in soon or digest.

### Per-rule level config

Let users set the surface per rule:

```
Rule: VIP email from CEO
  → Level: Urgent (push)

Rule: New PR request
  → Level: Soon (in-app inbox)

Rule: Weekly community digest
  → Level: Digest (email)
```

Defaults should be conservative — start everything at "Soon"; users opt-up to "Urgent" only when they care.

### Quiet hours and "Do Not Disturb"

A user's "urgent" at 9am is annoying at 1am. Build:

- **Default quiet hours** (10pm-7am local time).
- **DND toggle** (mute everything temporarily).
- **Vacation mode** (pause all schedules and events).
- **Per-rule override** for things that should fire even during DND (security, on-call).

### Digest design

A good digest:

- **Scannable in 20 seconds**.
- **Action-oriented** (each item has a clear "now what?").
- **Categorized lightly** (not 8 sub-headers; 2-3 max).
- **No greeting noise** ("Good morning! I hope you're well..." gets cut).
- **Footer with controls** ("Reply with PAUSE to skip a day").

A great digest replaces a chunk of the user's first 30 minutes of the day. A bad one is one more email to ignore.

### Avoid noise patterns

- **The bullet wall**: 30 bullet points; user reads zero. Cap at 6-10.
- **The recap loop**: digest re-includes things the user already saw. Track what's been delivered.
- **The all-clear noise**: every day says "everything is fine." Quiet days don't need a digest. Skip.
- **The detail dump**: full email bodies, full meeting agendas. Show the summary; link to the source.

### Interactivity in notifications

Where the channel supports it, make notifications interactive:

- **Reply-to-act** in email ("Reply YES to approve the meeting reschedule").
- **Action buttons** in push ("Approve" / "Snooze").
- **In-app one-click** ("Approve all" for a batch).

The faster the user can act on a notification, the more value the assistant delivers per interruption.

### Delivery channels — per user

Each user has preferences. Don't assume email-by-default:

- Some users prefer Slack DMs for all assistant output.
- Some want push for everything.
- Some want one weekly summary and nothing else.

Build a preferences UI. Defaults: in-app inbox + daily email digest. Let users tune from there.

### Tracking delivery and engagement

For each notification, track:

- Delivered (yes/no).
- Opened / read.
- Acted on (clicked, replied).
- Snoozed / dismissed.

If a notification class has 80% snooze rate, it's wrong-shaped — either the trigger is too sensitive or the level is too urgent. Use the data to tune defaults.

### Notification fatigue prevention

Set a hard ceiling per user per day:

- Max 5 urgent push notifications.
- Max 20 in-app items.
- One daily digest.

Exceed = degrade. Move overflow to lower-urgency channels or coalesce. The user's attention budget is finite; respect it.

### Surfacing in the right channel

For high-stakes assistants:

- **In-app inbox is the source of truth** — user can always see the full history.
- **Email digest** is the daily catch-up.
- **Push** is for the few things that need real-time attention.

If you have to pick one, make the in-app inbox great. It's the user's home for the assistant.

## Three real-world scenarios

**Scenario 1: The push-everything mistake.**
A team defaulted all rules to push notifications. Users muted within a week. Refactored: only "Urgent" rules push; "Soon" go to in-app inbox; "Digest" go to email. Mute rate dropped 80%.

**Scenario 2: The bullet wall failure.**
Morning brief was 25 bullets. Open rate dropped after week 1. Trimmed to 6 most-important items, with a "see more" link. Open rate stayed high; users actually read it.

**Scenario 3: The interactive notification win.**
A team added "Approve / Snooze / Reject" buttons directly in push notifications and emails. Approval throughput tripled because users didn't have to open the app. Lesson: bring the action to the channel.

## Common mistakes to avoid

- **Push by default.** Mute spiral.
- **Bullet walls.** Nobody reads them.
- **No DND / quiet hours.** Late-night interrupts ruin trust.
- **No per-rule level config.** Users can't tune.
- **Digest even on quiet days.** Train users to ignore.
- **Notifications without action buttons.** Slower for users; less assistant value per ping.

## Read more

- [Don Norman — Design of Everyday Things](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Mailchimp on email frequency](https://mailchimp.com/resources/email-frequency-best-practices/)

## Summary

- Three surfaces: **urgent push, soon in-app, digest email**. Pick per rule.
- **Defaults conservative**: start at "soon"; users opt-up.
- **Digest design**: scannable in 20s, action-oriented, light categorization, no greeting noise.
- **Interactive notifications** (reply, action buttons) boost throughput.
- **Quiet hours, DND, vacation mode** are non-negotiable.
- **Track delivery and engagement**; tune defaults based on snooze/mute rates.
- **Hard ceiling per user per day** to prevent fatigue.

That wraps Module 3. Next: memory, context, and continuity.
