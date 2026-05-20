---
module: 5
position: 3
title: "Monitoring, logging, and error tracking"
objective: "Production observability."
estimated_minutes: 7
---

# Monitoring, logging, and error tracking

## The observability triad

Production apps need three kinds of observability:

- **Logs** — what happened (events, requests, errors).
- **Metrics** — how it happened (counts, percentiles, rates).
- **Traces** — why it happened (request flow across services).

Most Next.js apps need at minimum:

- Error tracking (Sentry, Rollbar, Honeybadger).
- Application logs (Vercel built-in, Datadog, Axiom).
- Web Vitals (Vercel Analytics, Google Search Console).

Add more as the app's complexity grows.

## Error tracking with Sentry

Sentry is the most common error tracker. Setup:

```bash
npx @sentry/wizard@latest -i nextjs
```

Wizard configures:
- Client-side error tracking.
- Server-side error tracking (Server Components, Server Actions, API routes).
- Edge runtime tracking (middleware).
- Source map upload (so production stack traces map back to your code).
- Release tagging.

Errors automatically reach Sentry. You see stack traces, frequency, affected users, and a timeline.

Minimal manual config:

```tsx
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,        // 10% of traces
  replaysSessionSampleRate: 0.1, // 10% of session replays
  replaysOnErrorSampleRate: 1.0, // 100% when errors occur
});
```

Session replays are powerful for UX debugging — see exactly what the user did before hitting the error.

## Custom error logging

For specific errors you want to capture programmatically:

```tsx
import * as Sentry from '@sentry/nextjs';

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: 'risky' },
    extra: { context: 'whatever' },
  });
  throw error;  // Re-throw so the error boundary still catches it
}
```

For non-error events (alerts that aren't exceptions):

```tsx
Sentry.captureMessage('Suspicious request pattern detected', 'warning');
```

## Vercel logs

Vercel auto-captures:
- `console.log`, `console.error`, etc. from server functions.
- Build logs.
- Edge function logs.
- Request/response metadata.

Access via dashboard → Logs tab or Vercel CLI:

```bash
vercel logs <deployment-url>
```

Useful for ad-hoc debugging. For long-term log analysis, ship to a real log platform.

## Structured logging

Random `console.log` calls are hard to search at scale. Use structured logging:

```tsx
// lib/logger.ts
const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error: Error, meta?: object) => {
    console.error(JSON.stringify({ level: 'error', message, error: error.message, stack: error.stack, ...meta, timestamp: new Date().toISOString() }));
  },
};

// Usage:
logger.info('User signed up', { userId: user.id });
logger.error('Payment failed', error, { orderId: order.id });
```

Structured logs are easily searched and filtered in log platforms.

For production-grade logging, use a library like `pino`:

```tsx
import pino from 'pino';
const logger = pino();
logger.info({ userId }, 'User signed up');
```

Pino is fast (designed for high-throughput), produces JSON output, integrates with most log aggregators.

## Log aggregation

Centralize logs from multiple deployments:

- **Vercel Log Drains** — stream logs to Datadog, Logtail, Better Stack, etc.
- **Axiom** — log + event platform; deep Next.js integration.
- **Datadog** — full-stack observability; pricey but powerful.
- **Logtail (Better Stack)** — modern, friendly UX.
- **Self-hosted ELK / Loki + Grafana** — if you like running infrastructure.

For most teams, a managed log platform (Axiom, Logtail) is cheaper and faster to set up than self-hosting.

## Metrics

Beyond logs, track quantitative metrics:

- **Request counts and latencies.**
- **Database query times.**
- **External API call rates.**
- **Cache hit rates.**
- **Background job durations.**
- **Business metrics** (signups, conversions, etc.).

Tools:

- **Vercel Analytics** — built-in Web Vitals tracking.
- **Datadog APM** — application performance monitoring; full traces.
- **OpenTelemetry** — standard for traces/metrics; multiple backends.
- **Prometheus + Grafana** — self-hosted.

For most apps: Vercel Analytics for Web Vitals + Sentry for errors + structured logs for events.

## Distributed tracing

For apps with multiple services (Next.js + database + external APIs + workers), tracing shows the full request flow:

```
Request → Next.js Server Component → DB query → External API → Render
   100ms       150ms                 50ms       200ms      30ms
```

Tools:

- **Vercel Speed Insights** — RUM, Web Vitals, some tracing.
- **Sentry Performance** — combined error + performance tracing.
- **Datadog APM, New Relic** — full distributed tracing.
- **OpenTelemetry SDK** — vendor-neutral; backend of your choice.

For multi-service apps, tracing dramatically speeds up debugging.

## Web Vitals tracking

Production performance differs from synthetic Lighthouse:

- **Vercel Analytics** — built-in, simple, free tier.
- **Sentry RUM** — combined with errors.
- **Google Search Console** — Core Web Vitals report based on Chrome User Experience data.

Track per-page CWV; identify slow pages; prioritize fixes by traffic.

## Alerting

Errors that go unnoticed waste the observability investment. Set up alerts:

- **Sentry alerts** — Slack/email on new error types, regression of resolved errors, error rate spikes.
- **Vercel alerts** — deployment failures, error rate increases.
- **Custom (PagerDuty, OpsGenie)** — for serious on-call rotations.

Common alert rules:

- New unhandled error in production.
- Error rate above baseline by N%.
- API endpoint p95 latency above threshold.
- Deployment fails.

Tune to avoid alert fatigue. Better to have fewer, meaningful alerts than 100 noisy ones.

## Audit logs

For sensitive operations (auth, payments, admin), log every action with actor + target + timestamp:

```tsx
'use server';
import { logger } from '@/lib/logger';

export async function deleteUser(targetUserId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  
  logger.info('User deletion attempt', {
    actor: session.user.id,
    target: targetUserId,
    timestamp: new Date().toISOString(),
  });
  
  await db.users.delete({ where: { id: targetUserId } });
  
  logger.info('User deletion completed', {
    actor: session.user.id,
    target: targetUserId,
  });
}
```

Audit logs answer "who did this and when" — essential for compliance, incident response, support.

Store audit logs in their own append-only table (covered Supabase course Module 2).

## PII and logging

Don't log:

- Passwords.
- API keys / secrets.
- Credit card numbers.
- Social security numbers / equivalent.
- Health information.
- Anything you'd be sued for storing.

Sanitize sensitive fields before logging:

```tsx
logger.info('User logged in', {
  userId: user.id,  // OK
  email: user.email.replace(/(.).+(@.+)/, '$1***$2'),  // Masked
  // password: NEVER LOG
});
```

GDPR and similar regulations have specific requirements; consult legal for compliance specifics.

## Production debugging workflow

When a production issue is reported:

1. **Check Sentry** for the error; look at frequency, affected users, recent regression.
2. **Check Vercel/log aggregator** for surrounding context — what other requests happened?
3. **Look at traces** if you have them — where did time go?
4. **Reproduce locally** if possible.
5. **Fix, deploy, verify** via Sentry that errors stop.

A well-instrumented app turns hours of debugging into minutes.

## Mistakes to avoid

- **No error tracking.** Errors silently break user experiences.
- **Just `console.log` in production.** Unstructured; hard to search.
- **No log retention.** Issues older than the retention window are lost.
- **Logging secrets.** PII or credentials in logs.
- **Too many alerts.** Alert fatigue.
- **Tracking errors but not fixing them.** Errors should decrease over time, not pile up.

## Summary

- Error tracking via Sentry; auto-configured for Next.js.
- Structured logging (pino or similar) for searchable production logs.
- Log aggregation (Axiom, Logtail, Datadog) for multi-deployment.
- Vercel Analytics for Web Vitals; RUM in addition to synthetic.
- Distributed tracing for multi-service apps.
- Audit logs for sensitive operations.
- Alerting with care; avoid noise; investigate signal.

Next: common production pitfalls.
