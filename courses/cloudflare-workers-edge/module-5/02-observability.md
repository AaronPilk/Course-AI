---
module: 5
position: 2
title: "Observability: logs, metrics, tracing"
objective: "Workers Analytics Engine and beyond."
estimated_minutes: 6
---

# Observability: logs, metrics, tracing

## The observability stack

Production Workers need three pillars:

- **Logs.** What happened (events, errors, requests).
- **Metrics.** How much / how fast (counts, percentiles).
- **Traces.** Where time went (request flow across services).

Cloudflare provides tooling at the platform level; integrations exist for external systems (Datadog, Honeycomb, Sentry).

## Built-in dashboard

Workers Dashboard → your Worker → Metrics:

- Requests / second over time.
- Errors / second.
- CPU time distribution.
- Top routes by traffic.

Free; covers most operational visibility. Good for "is something broken?" and "what's our baseline?"

For granular diagnosis, push to richer observability tools.

## wrangler tail — live logs

```bash
wrangler tail
```

Streams console output and request metadata from your deployed Worker in real-time. First stop for diagnosing live issues.

Filter:

```bash
wrangler tail --status error          # only failures
wrangler tail --search "user 123"     # text match
wrangler tail --method POST           # filter HTTP method
```

For longer-term retention, ship logs externally.

## Structured logging

Plain `console.log` works but unstructured. Production logs should be JSON for parseability:

```ts
function log(level: string, message: string, fields: object = {}) {
  console.log(JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  }));
}

log('info', 'user signup', { userId: '123', plan: 'pro' });
log('error', 'payment failed', { userId, error: err.message, stack: err.stack });
```

Or use a library (pino-edge, or roll your own thin wrapper). Now logs are queryable:

```bash
wrangler tail --search '"level":"error"'
```

For external sinks (Logflare, Axiom, Datadog), JSON is required.

## Logpush

For shipping logs to external systems:

Dashboard → Workers → Logpush.

Configure:
- Destination: S3, R2, GCS, BigQuery, Datadog, Logflare, Splunk, etc.
- Filters: what to ship (errors only, all requests, etc.).
- Format: NDJSON.

Logs stream continuously to the destination. Useful for:

- **Long-term retention.** Workers don't store logs.
- **Searchable logs at scale.** Logflare, Axiom, Datadog provide UIs.
- **Compliance.** Audit trails, retention policies.

For most production Workers, Logpush to Axiom or Logflare is the standard pattern.

## Workers Analytics Engine

Workers Analytics Engine is Cloudflare's time-series storage for custom metrics:

```toml
[[analytics_engine_datasets]]
binding = "ANALYTICS"
```

```ts
async fetch(request: Request, env: Env) {
  const start = Date.now();
  
  // ... do work
  
  env.ANALYTICS.writeDataPoint({
    indexes: ['users'],
    blobs: [request.method, new URL(request.url).pathname],
    doubles: [Date.now() - start, 1],  // duration, count
  });
  
  return new Response('OK');
}
```

Queries via SQL through Cloudflare API or dashboard:

```sql
SELECT
  blob1 AS method,
  blob2 AS path,
  AVG(double1) AS avg_duration,
  SUM(double2) AS request_count
FROM analytics_dataset
WHERE timestamp >= NOW() - INTERVAL '1' HOUR
GROUP BY method, path
ORDER BY request_count DESC
```

Custom metrics that the built-in dashboard doesn't show. Cheap; designed for high-volume writes.

## Sentry for errors

```ts
import { Toucan } from 'toucan-js';

async fetch(request: Request, env: Env, ctx: ExecutionContext) {
  const sentry = new Toucan({
    dsn: env.SENTRY_DSN,
    context: ctx,
    request,
  });
  
  try {
    return await handleRequest(request, env);
  } catch (err) {
    sentry.captureException(err);
    return new Response('Internal error', { status: 500 });
  }
}
```

Captures unhandled errors with stack traces, request context, breadcrumbs. Source maps for original line numbers.

For Workers, Toucan-js is the popular Sentry SDK.

## Tracing

For multi-service requests (Worker → Service Binding → another Worker → external API):

- Generate a request ID at the edge entrypoint.
- Pass through bindings via headers.
- Log it at each layer.

```ts
const traceId = request.headers.get('X-Trace-Id') || crypto.randomUUID();

const response = await env.AUTH_SERVICE.fetch(new Request(url, {
  headers: { ...Object.fromEntries(request.headers), 'X-Trace-Id': traceId },
}));

log('info', 'request handled', { traceId, route: '/api/...', duration: ms });
```

Search by traceId across services to follow a single request through the stack.

For OpenTelemetry, libraries exist (workers-otel) — proper tracing with spans, parent-child relationships.

## Health checks

Combined synthetic monitoring + dashboard alerting:

- **UptimeRobot / BetterUptime / Pingdom** ping /health endpoint every minute.
- **Sentry alerts** on error rate spikes.
- **Slack notifications** on deploy failures or alarm conditions.

For larger teams, PagerDuty / OpsGenie integrate with all of these for proper on-call rotation.

## Real User Monitoring (RUM)

For client-side performance:

- Cloudflare Web Analytics — free; tracks Core Web Vitals.
- Custom: send beacons to Worker, store in Analytics Engine, query later.

Workers complement RUM well — both can feed into the same Analytics Engine dataset for unified queries.

## Cost-aware observability

Logs and metrics aren't free:

- Logpush has destination costs.
- Sentry has request quotas.
- Analytics Engine is cheap but not free.

Strategies:

- **Sample.** Log 1% of successful requests; 100% of errors. Most diagnostic value comes from errors anyway.
- **Filter.** Don't ship 200 OKs to Sentry; only errors.
- **Retain selectively.** Logflare/Axiom let you set retention per pipeline.

For high-traffic Workers, an observability bill of $50-200/month is reasonable. Above that, audit what you're shipping.

## Common gotchas

- **`console.log` of large objects.** Workers truncate long lines; lose context.
- **Logging secrets.** Even briefly visible in logs is a risk.
- **No request ID.** Hard to correlate across logs.
- **Sentry sample 100%.** Cost balloons quickly under attack.
- **No alerts on error rate spike.** Issues drag on undetected.

## Production observability checklist

For each Worker:

1. Structured JSON logging.
2. Sentry (or equivalent) capturing unhandled errors.
3. Logpush to Logflare/Axiom/Datadog for queryable logs.
4. Custom metrics via Analytics Engine for app-specific signals.
5. Health endpoint with synthetic monitoring.
6. Alert on error rate / latency / specific signals.
7. Request ID propagated through service boundaries.

Hit these and most production issues become diagnosable in minutes instead of hours.

## Mistakes to avoid

- **`console.log` without structure.** Hard to query at scale.
- **No external retention.** Issues 24 hours old vanish.
- **Errors logged but not alerted.** Silent failures.
- **Sentry without source maps.** Stack traces unreadable.
- **No request correlation.** Multi-service debugging is nightmare.

## Summary

- Built-in: dashboard metrics, `wrangler tail` for live logs.
- Structured JSON logging for queryability.
- Logpush to external sinks (Logflare, Axiom, Datadog) for retention.
- Workers Analytics Engine for custom time-series metrics.
- Sentry (via Toucan-js) for error tracking.
- Request ID propagation for tracing across service boundaries.
- Sample and filter to manage cost.

Next: limits and how to live within them.
