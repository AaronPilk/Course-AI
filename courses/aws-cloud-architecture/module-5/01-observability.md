---
module: 5
position: 1
title: "Observability — CloudWatch, X-Ray, logs"
objective: "Know what's happening in your stack."
estimated_minutes: 8
---

# Observability — CloudWatch, X-Ray, logs

## The puzzle

You can't operate what you can't see. Cloud systems have many moving parts — multiple services, replicated tiers, async workflows. When something breaks, the question "what's actually happening?" is harder than on a single server. Observability is the answer: making the system's behavior visible enough that you can debug and optimize confidently.

## The simple version

Observability has three pillars:

1. **Metrics**: numerical measurements over time (request rate, error rate, CPU usage). For dashboards and alarms.
2. **Logs**: timestamped text records of events. For debugging and audit.
3. **Traces**: end-to-end paths of requests through services. For distributed-system debugging.

On AWS:

- **CloudWatch Metrics**: numerical metrics for every AWS service + your custom ones.
- **CloudWatch Logs**: log aggregation across services.
- **X-Ray**: distributed tracing.
- **CloudWatch Alarms**: notify on metric thresholds.
- **CloudWatch Dashboards**: visualize metrics.
- **CloudWatch Logs Insights**: query logs.

For production workloads, observability isn't optional. Build it in from day one.

## The technical version

### CloudWatch Metrics

Every AWS service emits metrics automatically:

- **EC2**: CPU, network in/out, disk I/O, status checks.
- **RDS**: CPU, connections, replica lag, free storage, IOPS.
- **ALB**: request count, latency, 4xx/5xx error counts, healthy host count.
- **Lambda**: invocations, errors, duration, throttles, concurrent executions.
- **S3**: bucket size, object count, request counts by type.

These are visible in CloudWatch automatically — no setup required.

You can also publish custom metrics via the CloudWatch API:

```python
cloudwatch.put_metric_data(
    Namespace='MyApp',
    MetricData=[{
        'MetricName': 'OrdersProcessed',
        'Value': 1,
        'Unit': 'Count',
        'Dimensions': [{'Name': 'Service', 'Value': 'OrderAPI'}]
    }]
)
```

Custom metrics cost a small amount per metric per region per month. Use them for application-level signals (orders processed, queue depth, business KPIs).

### CloudWatch Logs

Centralized log aggregation. Most AWS services can write directly:

- **Lambda**: stdout/stderr automatically goes to CloudWatch Logs.
- **EC2**: install the CloudWatch agent.
- **ECS / EKS**: native integration via awslogs or FireLens driver.
- **RDS**: enable slow query logs, general logs, audit logs.
- **ALB**: access logs (to S3 or CloudWatch).
- **CloudTrail**: API events to CloudWatch Logs.

Once in CloudWatch Logs:

- Search via CloudWatch Logs Insights with a SQL-like query language.
- Set retention policies (don't keep logs forever; costs accumulate).
- Forward to S3 for archival.
- Trigger Lambda on log patterns.

### Log retention

A common surprise bill: CloudWatch Logs without retention policies. Logs default to never-expire.

Best practice:

- Application logs: 30-90 days in CloudWatch, then S3 archive.
- Audit logs: keep longer; per compliance requirements.
- Debug logs: short retention (7 days).

Set retention via `cloudwatch logs put-retention-policy` or CloudFormation. Audit existing log groups for "never expire" and fix.

### CloudWatch Logs Insights

A query language for log search. Example:

```
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100
```

Aggregate queries:

```
fields @timestamp, @message
| filter @message like /OrderProcessed/
| stats count() by bin(5m)
```

For debugging distributed issues, the ability to search across all your services' logs is essential. Insights is reasonably fast and integrated.

### X-Ray — distributed tracing

When a request flows through multiple services (browser → ALB → Lambda → DynamoDB → Lambda → SQS → Worker → S3), traditional logs don't show the full picture. Each service's log is separate.

X-Ray collects traces — end-to-end records of a request's path. You see:

- Each service the request touched.
- How long each took.
- Errors at each step.
- Sub-segments within services.

To use X-Ray:

- Add the AWS X-Ray SDK to your application.
- Wrap AWS SDK calls and external HTTP calls.
- For supported services (Lambda, ECS, etc.), enable X-Ray with a setting.
- X-Ray daemon runs on EC2/ECS to collect data.

In the X-Ray console, you see service maps and trace details for individual requests.

### Service maps and traces

X-Ray produces:

- **Service map**: visual graph of services and their relationships.
- **Traces**: individual requests' paths with timing.
- **Annotations**: searchable key-value pairs you add.
- **Metadata**: non-searchable extra info.

For distributed-system debugging, this is dramatically more useful than logs alone. "Where did this slow request spend time?" becomes a click instead of a forensic exercise.

### Alarms

CloudWatch alarms trigger actions when metrics cross thresholds:

- **Static threshold**: "if CPU > 80% for 5 minutes, alarm."
- **Anomaly detection**: ML-based threshold based on historical patterns.
- **Composite alarms**: combine multiple alarms (AND/OR).

Alarm actions:

- **SNS notification**: email/SMS/Slack/PagerDuty.
- **Auto Scaling action**: scale up/down.
- **Lambda invocation**: custom remediation.
- **Systems Manager Automation**: pre-defined runbook.

For production workloads, set alarms on:

- Error rates above normal.
- Latency p99 above SLO.
- Health check failures.
- Queue depth growing unbounded.
- Capacity utilization (CPU, memory, disk).
- Budget exceeded.
- Security events (root login, IAM changes).

Don't alarm on everything; alarm on what requires action.

### Dashboards

CloudWatch Dashboards visualize metrics:

- Multi-region, multi-service.
- Static or auto-refreshing.
- Public or private.
- Variable interpolation (e.g., environment).

For each production workload, a dashboard with the key metrics is invaluable. During incidents, the dashboard is the first place people look.

### Observability anti-patterns

A few patterns to avoid:

- **No alarms**: discovering problems via user complaints.
- **Alarm fatigue**: alerting on too much, important alarms get ignored.
- **Logs without retention**: surprise bill.
- **Logs nobody queries**: noise without value.
- **Custom metrics for everything**: cost without benefit.
- **No tracing in microservices**: debugging is forensic.
- **Dashboards nobody looks at**: build for actual use, not theater.

The discipline: instrument what matters; alert on what requires action; have dashboards people actually use.

### Third-party observability

CloudWatch is the AWS-native option but not always the best:

- **Datadog**: comprehensive APM, metrics, logs, traces. Popular for serious production.
- **New Relic**: similar.
- **Honeycomb**: high-cardinality observability, strong for distributed systems.
- **Grafana + Prometheus**: open-source stack, common with Kubernetes.
- **Lightstep / Splunk Observability**: enterprise options.

These often have better APIs, more flexibility, better correlation across signals — at a cost.

For early stage, CloudWatch alone is fine. As complexity grows, evaluate whether the third-party investment is worth it.

### Synthetic monitoring

CloudWatch Synthetics runs scripts (Node.js or Python) on a schedule that exercise your application:

- Hit a URL, verify response.
- Walk through a key user journey (login, action, logout).
- Test API endpoints with valid and invalid inputs.

Reports as metrics; alarms when synthetics fail. Useful for catching issues before real users do.

### Application logs vs system logs

Different signal sources:

- **System logs**: OS-level, container runtime, service status.
- **Application logs**: your code's output.
- **Audit logs**: who did what.
- **Access logs**: HTTP requests, S3 GETs.

Tag and label appropriately so you can filter. For application logs, use structured logging (JSON) so fields can be queried — not free-form strings.

### Log levels

Use log levels consistently:

- **DEBUG**: verbose, for local debugging only. Often off in prod.
- **INFO**: normal operations.
- **WARN**: unusual but not broken.
- **ERROR**: something went wrong but recovered.
- **FATAL**: something went wrong and didn't recover.

In production, INFO and above. DEBUG only when debugging actively (and remember to revert).

### Correlation IDs

For traceability across services:

- Generate a unique ID at the entry point (API Gateway, ALB).
- Pass it in all downstream calls (HTTP headers, message attributes).
- Log it in every service.

When you need to debug a request, the correlation ID lets you find all log lines from that request across all services. X-Ray does this automatically; for manual logs, you build it yourself.

### Cost of observability

Observability costs money:

- CloudWatch Metrics: $0.30/custom metric/month.
- CloudWatch Logs: $0.50/GB ingested, $0.03/GB stored.
- X-Ray: $5/M traces recorded.
- Third-party tools: variable.

For a moderate workload, observability can cost 5-20% of total infrastructure spend. Worth it; production without observability is operating blind.

Optimize: log retention policies, sampled tracing (X-Ray sampling rules), exclude noisy logs, only custom metrics that have a use.

### Building an observability practice

For a team:

1. **Pre-launch**: identify key metrics, set baseline alarms, create dashboards.
2. **Incident review**: each incident should produce a new alarm or signal.
3. **Periodic review**: prune unused alarms, dashboards, metrics; tighten.
4. **Train**: make sure everyone knows how to use the tools.

The discipline matters more than the tools. A team using CloudWatch well outperforms a team using fancy tools poorly.

### What to instrument first

For a new service, instrument at minimum:

- **Request rate and error rate** at the entry point.
- **Latency** distribution (p50, p90, p99).
- **External dependency calls** (DB, downstream services, third-party APIs).
- **Key business metrics** (orders, sign-ups, etc.).
- **Resource utilization** (CPU, memory, disk).

Add more granular instrumentation as needed during debugging or optimization. Resist the urge to instrument everything from the start — start with what gives you operational visibility and add as you learn.

## Three real-world scenarios

**Scenario 1: A latency regression after a deployment.**
Users report slowness. CloudWatch dashboard shows p99 latency doubled after the deploy. X-Ray reveals the new code is making an additional DB call per request. Fix: cache or batch the call. Without X-Ray, this would have required digging through logs across multiple services.

**Scenario 2: A surprise log cost.**
Monthly CloudWatch Logs bill jumped from $50 to $500. Investigation: a recent deploy increased log verbosity (someone left DEBUG on in prod). Fix: revert log level to INFO, set retention policies on log groups that didn't have them. Saved $450/month.

**Scenario 3: Alarm fatigue causing missed real incident.**
Team had 200+ alarms; most fired multiple times daily; engineers stopped checking. A real incident's alarm got lost in the noise. Fix: audit and prune alarms — keep only ones that require human action, set sensible thresholds, use composite alarms to reduce noise. Down to 25 alarms that mean something. The next real incident triggered an alarm that actually got attention.

## Common mistakes to avoid

- **No alarms** on production workloads.
- **Alarm fatigue** from over-instrumented or wrong-threshold alarms.
- **No log retention policy** (surprise bill).
- **Free-form log messages** that can't be queried structurally.
- **No tracing** in microservice architectures.
- **Dashboards nobody uses** for theater.
- **Custom metrics for everything** without ROI.

## Read more

- AWS CloudWatch User Guide.
- AWS X-Ray Developer Guide.
- AWS Well-Architected Framework — Operational Excellence Pillar.
- *Observability Engineering* by Charity Majors et al.

## Summary

- **Three pillars**: metrics, logs, traces.
- **CloudWatch Metrics**: per-service automatic + custom.
- **CloudWatch Logs**: centralized with Insights for querying.
- **X-Ray**: distributed tracing across services.
- **Alarms**: notify on metric thresholds, trigger remediation.
- **Dashboards**: visualize key metrics.
- **Log retention** is critical for cost control.
- **Correlation IDs** tie requests across services.
- **Third-party tools** (Datadog, etc.) for more sophisticated needs.
- **Discipline matters more than tools** — instrument what matters, alert on what requires action.

Next: deployment and infrastructure as code.
