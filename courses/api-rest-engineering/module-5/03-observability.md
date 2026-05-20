---
module: 5
position: 3
title: "Observability: logs, traces, SLOs"
objective: "Know what your API is doing without guessing."
estimated_minutes: 5
---

# Observability: logs, traces, SLOs

## The three pillars

- **Logs.** Discrete events. "User 123 logged in at 14:32."
- **Metrics.** Aggregated numbers over time. "P99 latency = 250ms."
- **Traces.** End-to-end request flow. "This request hit service A → B → C."

Together: you can answer "what happened, how often, why was it slow." Modern observability tools (Datadog, Honeycomb, New Relic, Grafana stack) integrate all three.

## Structured logs

```python
log.info("user logged in",
  user_id=123,
  request_id="req_abc",
  ip="1.2.3.4",
  duration_ms=45)
```

Output (JSON):

```json
{
  "timestamp": "2026-05-15T14:32:15Z",
  "level": "info",
  "message": "user logged in",
  "user_id": 123,
  "request_id": "req_abc",
  "ip": "1.2.3.4",
  "duration_ms": 45
}
```

Queryable. "Show me logs where duration_ms > 1000 for user_id = 123" is one query against structured logs; pattern-matching against text is fragile.

Centralized log storage (Datadog, Splunk, Elastic, Loki) ingests JSON; supports rich queries; alerts on patterns.

## What to log per request

At a minimum, for each request:

- **Timestamp.**
- **Request ID.**
- **HTTP method + path + status.**
- **User / tenant ID** (if authenticated).
- **Duration.**
- **Error details if any.**

Optional but useful:
- **User agent.**
- **Geo (from IP).**
- **API version.**
- **Authorization scopes.**

Don't log: passwords, tokens, full credit cards, PII. Sanitize.

## Metrics

Key API metrics:

- **Request rate** (RPS, per endpoint).
- **Error rate** (% 5xx, % 4xx).
- **Latency** (p50, p95, p99, p99.9 per endpoint).
- **Saturation** (CPU, memory, connection pool).

The "RED" method: Rate, Errors, Duration. Three numbers per endpoint.

Prometheus + Grafana is the standard self-hosted stack; Datadog, New Relic, Honeycomb for hosted.

```python
from prometheus_client import Histogram

request_latency = Histogram(
    'api_request_duration_seconds',
    'API request duration',
    ['endpoint', 'method', 'status']
)

@request_latency.labels(endpoint='/users', method='GET').time()
def handler():
    ...
```

## Distributed tracing

Single request crosses many services:

```
User → Gateway → Auth → API → DB
                      → Cache
                      → External API
```

Each service contributes a span; combined into a trace. You see end-to-end: where time was spent, what failed.

OpenTelemetry is the modern standard. Instrument your app with the OTEL SDK; ship to a backend (Jaeger, Tempo, Honeycomb, Datadog).

```python
from opentelemetry import trace
tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("create_user"):
    with tracer.start_as_current_span("validate"):
        ...
    with tracer.start_as_current_span("db_insert"):
        ...
```

Spans nest; parent-child relationships build a tree. Latency at each span makes bottlenecks obvious.

## Trace ID propagation

Across services, pass the trace ID via headers:

```
GET /api/users
traceparent: 00-abc123def456-789012345-01
```

OpenTelemetry handles this in most frameworks. Every service that handles the request adds spans under the same trace ID.

Pair with request_id in logs (same value): you can pivot from a log entry to the full trace in one click.

## SLOs (Service Level Objectives)

Quantified commitments:

```
99.9% of requests complete in < 500ms over 30 days.
99.95% availability over 30 days.
```

Built from SLIs (Service Level Indicators — the metrics):
- SLI: % requests completing in <500ms.
- SLO: 99.9% (the target).
- Error budget: 0.1% × 30 days = 43 minutes of breach.

When the error budget is exhausted: stop launching features; focus on reliability. Self-regulating mechanism.

Google's SRE book is the canonical source. SLO-based operations beats "things should be fast" as a goal because it's measurable.

## Alerting

Alert on:
- **SLO breach.** Error budget shrinking faster than expected.
- **High error rate.** 5xx spike (above baseline).
- **Latency spike.** P99 jumping.
- **Saturation.** Resources near capacity.
- **Specific known failure modes.** Database connection pool exhausted.

Don't alert on:
- Every error (noise).
- Predictable transient blips.
- Things that don't require immediate response.

Alert fatigue is real. Aim for: 5-15 page-worthy alerts per day max. If more, tune; if less, you're fine.

## Logs vs metrics vs traces — when to use each

**Logs.** Investigating a specific event ("what did this user do?"). High cardinality OK.

**Metrics.** Aggregates over time, alerting. Low cardinality (don't tag per-user — explodes cardinality).

**Traces.** Understanding request flow / latency breakdown.

A typical investigation:
1. Alert fires on latency spike (metric).
2. Look at request samples (traces) to see where time goes.
3. Look at specific request logs for error details.

Each tool plays a role; combined they give complete visibility.

## Sampling — when not everything fits

At very high throughput:
- **Metrics aggregate.** Fine even at billions of requests.
- **Logs.** Sample (1% of successful; 100% of errors). Centralized log storage costs scale with volume.
- **Traces.** Sample (1-10% typically). Head-based or tail-based.

OpenTelemetry has built-in sampling strategies. Pay for what gives signal.

## Observability budget

Logs / metrics / traces have cost. Plan:
- Centralized log storage: GBs/day at $X/GB.
- Metrics: dimensions × cardinality × retention.
- Traces: span count × sampling rate.

For a typical API: $50-500/month at small scale; scales with traffic. Cheap relative to engineering value.

## Mistakes to avoid

- **Unstructured text logs.** Hard to query.
- **PII in logs.** Compliance / leak risk.
- **No alerts on SLO breaches.** Issues drag on.
- **Alert fatigue.** Engineers ignore.
- **Aggregating per-user metrics.** Cardinality explosion.
- **Not propagating trace IDs.** Distributed traces broken.

## Summary

- Logs (events) + metrics (aggregates) + traces (request flow).
- Structured JSON logs; centralized storage; query-friendly.
- RED metrics per endpoint: Rate, Errors, Duration.
- OpenTelemetry for traces; propagate via headers.
- SLOs quantify reliability; error budget regulates change pace.
- Alert on SLO breach, error rate, latency, saturation. Not noise.

Next: REST vs gRPC vs GraphQL.
