---
module: 4
position: 1
title: "Cron triggers and scheduled work"
objective: "Scheduled tasks at edge cost."
estimated_minutes: 5
---

# Cron triggers and scheduled work

## Cron triggers

Workers can run on a schedule via Cron Triggers — no infrastructure, no scheduler to manage, no Lambda + EventBridge setup. Just declare a cron expression in wrangler.toml and add a `scheduled` handler.

```toml
# wrangler.toml
[triggers]
crons = ["0 0 * * *"]      # daily at midnight UTC
```

```ts
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Runs daily.
    await cleanupOldSessions(env);
  },
  async fetch(request: Request, env: Env) {
    // HTTP handler also still works
    return new Response('Hello');
  },
};
```

Same Worker handles HTTP and cron events. Different handlers; both have access to env.

## Cron expressions

Standard cron format:

```
┌─ minute (0-59)
│ ┌─ hour (0-23)
│ │ ┌─ day of month (1-31)
│ │ │ ┌─ month (1-12)
│ │ │ │ ┌─ day of week (0-7)
│ │ │ │ │
* * * * *
```

Examples:

- `0 * * * *` — every hour on the hour.
- `*/5 * * * *` — every 5 minutes.
- `0 0 * * *` — daily at midnight UTC.
- `0 9 * * 1-5` — weekdays at 9 AM UTC.
- `0 0 1 * *` — first of each month at midnight.

All times in UTC. Convert for your timezone.

## Multiple cron schedules

```toml
[triggers]
crons = [
  "0 0 * * *",          # daily cleanup
  "*/15 * * * *",       # every 15 min health check
  "0 9 * * 1-5",        # weekday morning report
]
```

The `scheduled` handler is called for each; distinguish via `event.cron`:

```ts
async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
  switch (event.cron) {
    case '0 0 * * *':
      await dailyCleanup(env);
      break;
    case '*/15 * * * *':
      await healthCheck(env);
      break;
    case '0 9 * * 1-5':
      await sendWeekdayReport(env);
      break;
  }
}
```

## Use cases

**Cleanup jobs.** Delete old logs, expired sessions, orphaned files.

**Aggregation / batching.** Compile daily reports; aggregate metrics.

**Health checks.** Ping external services; alert if down.

**Email digests.** Send weekly newsletter; trigger marketing campaigns.

**Cache warming.** Pre-compute expensive data before peak hours.

**Sync jobs.** Pull data from external APIs into D1/KV.

**Reminders.** Cron + DOs alarms for per-user reminders.

## Execution model

Cron triggers run once per scheduled time. If your Worker takes 30 minutes to execute a cleanup, that's fine (up to limits) — only one instance for that cron event.

Time limits:

- Free tier: 10ms CPU.
- Paid tier: 30s CPU.
- Wallclock: longer for background work.

For long-running tasks, use Workers Queues (next lesson) — break work into chunks; dispatch via queue.

## Testing cron locally

```bash
wrangler dev --test-scheduled
```

Then trigger manually:

```bash
curl http://localhost:8787/__scheduled
```

The Worker's scheduled handler runs once. Useful for testing cron logic without waiting for the schedule.

## Error handling

If your scheduled handler throws, Cloudflare logs it but the schedule continues (next run still happens). For critical jobs:

```ts
async scheduled(event, env, ctx) {
  try {
    await doImportantWork(env);
  } catch (err) {
    console.error('Cron failed:', err);
    ctx.waitUntil(notifyOnFailure(err, env));
    throw err;  // Make it visible in logs/metrics
  }
}
```

Pair with monitoring (Workers Analytics, external alerting) so failed crons trigger alerts.

## Cron vs Queues

**Cron triggers** are time-based: "run at midnight."

**Queues** are work-driven: "process when this item arrives."

For periodic work: cron.
For event-driven work that may happen anytime: queues.

Many systems use both:
- Cron fires daily; enqueues N items for processing.
- Queue worker processes one item at a time.
- Concurrency naturally bounded.

## Limits

- **CPU per cron run:** same as Workers limits (10ms free, 30s paid).
- **Schedules per Worker:** up to 3 crons.
- **Frequency:** as fast as every minute; not sub-minute.

For sub-minute or massive-scale event processing, use Queues or external scheduling (DigitalOcean Apps, Kubernetes CronJobs) feeding into your Workers.

## Cost

Cron triggers are billed as standard Worker invocations:

- Free tier covers light cron usage.
- Paid tier: $5/month + $0.30 per million invocations.

For daily cron: 30 invocations/month. Negligible cost.

For every-minute cron: 43,200 invocations/month — still well within free or paid tier.

## Pattern: cron + DO alarms

For per-entity scheduled work, Durable Object alarms (Module 2) are more granular:

- Cron: "do this for everyone at midnight."
- DO alarm: "do this for user X at their specific time."

DO alarms scale per-user without one giant Worker iterating millions of records.

## Idempotency

Crons may run multiple times in rare cases (Cloudflare retry semantics). Make scheduled work idempotent:

```ts
async function dailyCleanup(env: Env) {
  const today = new Date().toISOString().slice(0, 10);
  const flag = await env.STATE.get(`cleanup:${today}`);
  if (flag === 'done') return;  // already ran today
  
  await deleteOldSessions(env);
  await env.STATE.put(`cleanup:${today}`, 'done', { expirationTtl: 86400 * 2 });
}
```

Or: structure work to be naturally idempotent (delete-where conditions, upserts).

## Combining with external schedulers

For complex scheduling (custom timezones, business hours, conditional firing):

- Cron Workers fire every N minutes.
- Worker checks: "should I run the real job right now?"
- If yes: run; if no: skip.

```ts
async scheduled(event, env, ctx) {
  const now = new Date();
  const localTime = toUserTimezone(now, env.TIMEZONE);
  if (isBusinessHours(localTime) && shouldRunNow(localTime)) {
    await processBatch(env);
  }
}
```

More complex; sometimes worth it. For pure UTC scheduling, just use the cron expression.

## Mistakes to avoid

- **Cron jobs that aren't idempotent.** Double-runs cause issues.
- **No error monitoring.** Failed crons silently disappear.
- **Long-running cron logic.** Hits CPU limits; use queues for chunked work.
- **Forgetting timezone.** UTC vs user time.
- **Cron Workers with state in memory.** Not preserved between runs.

## Summary

- Cron triggers via wrangler.toml `[triggers] crons = [...]`.
- `scheduled` handler in the Worker.
- Standard cron expressions; UTC only.
- Multiple crons per Worker; distinguish via `event.cron`.
- Use for cleanup, aggregation, health checks, digests.
- Pair with Queues for chunked / long-running work.
- DO alarms for per-entity scheduling.
- Make scheduled work idempotent.

Next: Queues for async processing.
