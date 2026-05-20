---
module: 3
position: 3
title: "Event-triggered tasks — react to inbox, calendar, signals"
objective: "Wire assistants to real-world events without spamming users."
estimated_minutes: 8
---

# Event-triggered tasks — react to inbox, calendar, signals

## The puzzle

Scheduled tasks run on time. Event-triggered tasks run when something happens — a VIP email arrives, a meeting gets rescheduled, a metric crosses a threshold, a deal moves stage.

Powerful, but also the easiest path to notification fatigue. The line between "helpful" and "annoying" is whether the event was actually worth surfacing.

## The simple version

Event triggers come in three flavors:

1. **Webhooks** — external system pushes to you (Slack new-message, Stripe events, calendar updated).
2. **Polling** — you check the source on a timer (every 5 min: any new emails matching rule X?).
3. **User-defined rules** — "If a calendar meeting changes within 24 hours, alert me."

Always combine event triggers with **filters** (which events are worth acting on) and **rate limiting** (don't fire 50 alerts in a minute).

## The technical version

### Webhooks

When a provider supports them, prefer webhooks:

- **Lower latency** than polling.
- **No rate-limit costs** from polling.
- **Server-side delivery guarantees** (retries, ordering).

Setup pattern:

1. Register webhook with the provider (Google Workspace, GitHub, Stripe, Slack, etc.).
2. Receive HTTP POSTs at your endpoint.
3. Validate signature (HMAC) so you know the call is real.
4. Queue the event for processing.
5. Acknowledge fast (200 OK within seconds); process async.

Most providers expect a fast ACK; slow handlers get retried or stop receiving.

### Polling

When webhooks aren't available:

```js
async function pollGmailForVIPs(user) {
  const lastChecked = user.last_email_poll || Date.now() - 5 * 60 * 1000;
  const newMessages = await gmail.list({
    q: `from:(${user.vip_senders.join(" OR ")}) after:${lastChecked}`
  });
  for (const msg of newMessages) {
    await fireEvent("vip_email_received", { user, msg });
  }
  user.last_email_poll = Date.now();
}
```

Tradeoffs:

- **Cost**: every poll is an API call. Tune frequency.
- **Latency**: polling interval is your minimum reaction time.
- **Rate limits**: aggressive polling can throttle your app account-wide.

Default to 5–15 minute polls. Tighter if latency matters; looser if not.

### User-defined rules

The most powerful pattern lets users define triggers in plain language or simple UI:

- "Alert me if any email comes from my CEO after 7pm."
- "Tell me when any of my 5 priority deals changes status."
- "Notify me 30 min before any external meeting if I don't have prep notes."

Translate to runtime filters; evaluate on each candidate event; fire if matched.

### Filters: the "is this notable?" pass

Every event flows through a filter:

```
event arrives
    ↓
[filter: matches user rules?]
    ↓ yes
[filter: passes rate limit?]
    ↓ yes
[filter: not already notified about similar?]
    ↓ yes
deliver notification
```

Filters prevent the assistant from being a firehose. Common filter dimensions:

- **Match user's rules** (priority sender, keyword, account).
- **Rate limit** (max N notifications per hour).
- **Dedupe** (don't notify twice for the same underlying event).
- **Quiet hours** (don't notify between 10pm and 7am).

### Notification levels

Not all events are equal:

- **Immediate** (push / SMS): true urgents.
- **Soon** (in-app inbox): worth seeing within the day.
- **Digest** (added to the daily brief): worth knowing but not interrupting.

Map each event to a level by user preference and event characteristics. "VIP email" might be Immediate; "PR review request" might be Soon; "GitHub star milestone" might be Digest.

### Rate limiting

Per-user notification rate limits:

- Max 3 push notifications per hour.
- Max 1 SMS per day unless escalated by rules.
- Quiet hours apply unless rule explicitly overrides.

Without rate limits, a busy day can dump 50 notifications on a user; they mute the app forever.

### Idempotency for events

Webhooks retry on failure; polling can re-discover the same event. Idempotency keys per event source:

```js
const eventId = `${source}:${externalId}`;
if (await db.hasProcessed(eventId)) return;
await processEvent(event);
await db.markProcessed(eventId, { ttl: 7 * 24 * 3600 });
```

Same event ID twice = skip. No double-notifications.

### Surface what triggered

When an event fires a notification, tell the user:

- "Triggered by: new email from Sarah (VIP rule)."
- "Triggered by: calendar conflict detected at 2pm."
- "Triggered by: deal Acme moved to closed-lost (priority deal rule)."

User understands why the assistant interrupted them. Builds trust over time.

### Failure modes

What goes wrong:

- **Missed events**: webhook didn't fire / poll missed it. Solution: heartbeat checks + backfill on detection.
- **Duplicate notifications**: idempotency missed. Solution: tighter dedup.
- **Spam during incident**: webhook storm on provider's side. Solution: per-event circuit breakers + alerting.
- **Stale rules**: user changed preference; rule not updated. Solution: rule version tracking; invalidate on change.

Build observability so you can spot each.

### Cost of being event-driven

Webhooks are nearly free. Polling has real cost — both money (API calls) and ops (rate limits, queue sizes).

For each rule, estimate:

- How often will the event fire?
- Across users, how much polling does this require?
- Is the value worth that cost?

Some rules end up not pulling their weight; surface that in analytics and prune.

## Three real-world scenarios

**Scenario 1: The VIP email rule.**
A user set "alert me for emails from my CEO." Webhook fired in under 30 seconds; assistant push-notified. User loved it. Rate-limit caught a bug where the CEO's auto-reply was triggering 6 notifications during a vacation. Tightened dedup; problem solved.

**Scenario 2: The notification storm.**
Slack's status changed and dozens of unrelated webhook events fired. Without a circuit breaker, the assistant would have pushed dozens of notifications. The breaker kicked in after the 5th in a minute; flagged for human review. False positive caught.

**Scenario 3: The polling cost surprise.**
A team built a "watch every customer's GitHub" feature. Polling every 5 minutes × thousands of users × multiple repos hit GitHub rate limits and ballooned API cost. Switched to webhooks where supported; lengthened polling interval to 30 minutes where not. Costs normalized.

## Common mistakes to avoid

- **Polling when webhooks exist.** Always prefer webhooks.
- **No filters.** Firehose of notifications.
- **No rate limits.** Mute spiral.
- **No idempotency.** Duplicate notifications.
- **No "why" surfaced.** Users distrust unexplained interruptions.
- **Stale rules.** User updated preference; old rule still firing.

## Read more

- [Webhook best practices](https://webhooks.fyi/)
- [Stripe's webhook design](https://stripe.com/docs/webhooks)
- [GitHub webhooks](https://docs.github.com/en/webhooks)

## Summary

- **Event triggers** come from webhooks, polling, or user-defined rules.
- **Prefer webhooks** when available; poll when not, on sensible intervals.
- **Filter every event** through match rules, rate limits, dedup, quiet hours.
- **Map to notification levels** (immediate / soon / digest).
- **Idempotency keys** prevent duplicate notifications on retries.
- **Surface the trigger** so users know why the assistant interrupted them.
- **Track cost and prune rules** that don't earn their poll budget.

Next: notifications and digests.
