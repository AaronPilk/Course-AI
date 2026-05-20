---
module: 3
position: 2
title: "Recurring tasks — patterns for daily briefings, weekly digests"
objective: "Build cron-like scheduling with sane defaults and user controls."
estimated_minutes: 9
---

# Recurring tasks — patterns for daily briefings, weekly digests

## The puzzle

You want your assistant to do something on a schedule: every morning, every Monday, every quarter-end. The cron-job part is mechanical. The hard parts are: timezone handling, user-defined schedules, delivery channels, and what to do when the user is asleep, on vacation, or in a different country than yesterday.

## The simple version

A recurring task has:

1. **A schedule** — cron-like spec.
2. **A timezone** — user's, in their current location.
3. **A delivery channel** — email, push, in-app inbox.
4. **A pause/disable state**.
5. **An idempotency key** so duplicate runs don't double-deliver.

Stack these as a service. Build the right defaults; let users customize.

## The technical version

### Schedule expression

A common spec: cron syntax with timezone:

```js
{
  schedule: "0 8 * * MON-FRI",  // 8am weekdays
  timezone: "America/Los_Angeles",
  task: "morning_brief",
  enabled: true
}
```

For most assistant features, you don't need full cron complexity. Common patterns:

- Daily at user-chosen time.
- Weekdays only.
- Weekly on a specific day.
- Monthly on day N.

Build a simple UI; let advanced users edit cron strings.

### Timezone is everything

A 9am brief in Pacific time vs. Eastern time vs. London is three different times. Mistakes:

- **Storing UTC and rendering UTC**: user gets confusing-looking times.
- **Storing user timezone at signup**: doesn't update when user travels.
- **Inferring timezone from IP every run**: works but adds dependency on geo-IP.

Right pattern: store the user's preferred timezone explicitly; let them update it; respect it on every run. Add a "use my current location" option if you want auto-update.

### Daylight saving and the edge cases

A 9am brief on March 14, 2026 (DST start) is one hour different from March 13. Your scheduling library should handle this — Quartz, Temporal (newish), or cron-aware libs like `croner`.

If you write your own scheduler, test the daylight-saving transitions and the "2:30am on the spring-forward day doesn't exist" case.

### Delivery channels

Users want different channels:

- **Email**: still the default for digest-style content.
- **Push notifications**: for time-sensitive alerts.
- **In-app inbox**: a feed inside your assistant.
- **Slack**: for work assistants.
- **SMS**: rarely used, but a fallback option.

Build a preferences UI; let the user pick per task. Some users want all the assistant's output in email; others want push for urgents only.

### Idempotency keys

Schedulers can fire twice (system restart, retry-on-failure). Without idempotency, the user gets the morning brief twice.

Pattern:

```js
const idempotencyKey = `${userId}:${taskName}:${today}`;
if (await db.hasRun(idempotencyKey)) {
  return;  // already ran today
}
await runTask(task);
await db.markRun(idempotencyKey);
```

Idempotency keys are per-occurrence — date-stamped or time-window-stamped. Same key twice = skip.

### What runs the scheduler

Several options:

- **Cron in your app** (Node's `node-cron`, Python's `schedule`, Ruby's `whenever`). Works for small scale; gets fragile at high concurrency.
- **Hosted cron-as-a-service** (AWS EventBridge, Vercel Cron, Inngest, Trigger.dev). Scales; less work.
- **Workflow engines** (Temporal, Airflow). For complex multi-step recurring work.

For a v1 assistant, hosted cron is the right starting point. Move to workflow engines when complexity demands.

### Pause and vacation modes

User controls:

- **Pause individual schedule**: skip until re-enabled or a specific date.
- **Pause all schedules**: vacation mode. Pauses everything for a window; auto-resumes.
- **Quiet hours**: don't deliver between 10pm and 7am even if scheduled.
- **Day-of-week overrides**: "skip weekends."

Build these as first-class controls. Vacation/pause is one of the most-used assistant features once it exists.

### Skipping when nothing's notable

For threshold-aware tasks (Lesson 3.1), check first:

```python
def run_morning_brief(user):
    items = collect_notable_items(user)
    if len(items) < MIN_NOTABLE_THRESHOLD:
        log_skip(user, reason="no notable items")
        return
    deliver_brief(user, items)
```

Track skips for analytics. If a user is being skipped every day for two weeks, the threshold may be wrong — or the task isn't actually needed.

### Per-user schedule storage

Each user has their own schedules. Storage:

```js
{
  id: "sched_abc",
  user_id: "u_123",
  task_type: "morning_brief",
  schedule: { cron: "0 8 * * MON-FRI", timezone: "America/Los_Angeles" },
  delivery: { channel: "email", address: "alex@x.com" },
  enabled: true,
  paused_until: null,
  preferences: { include_calendar: true, include_email: true, ... },
  created_at: "...",
  last_run_at: "...",
  last_skip_reason: null
}
```

Auditable, queryable, easy to debug. The structured record is what powers the user-facing schedule UI.

### Cost and rate awareness

Scheduled tasks are background spend. Track:

- Cost per task type per day.
- Cost per user.
- Skip rate (high skips = task isn't earning its run cost).
- Failure rate.

A scheduled task that costs $0.50/run × 1,000 users × 30 days = $15,000/month. Worth tracking; worth optimizing.

## Three real-world scenarios

**Scenario 1: The timezone drift bug.**
A team stored timezone at signup. Users who moved (especially digital nomads) got briefs at random local times. They added auto-update from IP + manual override. Drift complaints dropped.

**Scenario 2: The double-delivery incident.**
A scheduler retried on a transient failure and re-ran a successful task. User got two morning briefs. They added idempotency keys (`{user_id}:{task}:{date}`). Double-deliveries stopped.

**Scenario 3: The vacation feature that drove retention.**
Vacation pause was a "v2 maybe" feature. A user said "I'd cancel because I get this on weekends." Team built it in a sprint. Cancellations dropped; retention rose. Pause is non-negotiable.

## Common mistakes to avoid

- **UTC-only schedules.** Confusing for users.
- **No idempotency.** Double-deliveries on retries.
- **No pause.** Users churn during busy or vacation weeks.
- **No daylight-saving handling.** Off-by-one-hour for half the year.
- **Single delivery channel.** Users have preferences.
- **No skip threshold.** Schedule runs even when nothing's notable.

## Read more

- [croner library](https://github.com/Hexagon/croner) (cron + timezones in JS)
- [Temporal scheduling docs](https://docs.temporal.io/workflows#schedules)
- [AWS EventBridge cron](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-scheduled-rule-pattern.html)

## Summary

- Recurring tasks need: schedule, timezone, delivery channel, pause/disable state, idempotency.
- **Build hosted cron** for v1; move to workflow engines if complexity demands.
- **Timezone correctly** (user-set + optional auto-update); handle daylight saving.
- **Idempotency keys** prevent double-deliveries on retries.
- **Pause and vacation modes** are non-negotiable.
- **Skip when nothing's notable** — silence is information.
- **Track cost, skip rate, failure rate** per task type.

Next: event-triggered tasks.
