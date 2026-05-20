---
module: 5
position: 1
title: "Observability — logs, metrics, events"
objective: "See what's actually happening."
estimated_minutes: 7
---

# Observability — logs, metrics, events

## The puzzle

A K8s cluster is a distributed system with many moving parts. When something breaks, the question "what's happening?" is harder than on one server. Three signals matter: logs (what each container said), metrics (numbers over time), events (what controllers did). Knowing which to reach for, and having the infrastructure to query them, is the difference between fast debugging and forensic archaeology.

## The simple version

The three pillars in K8s:

1. **Logs**: container stdout/stderr → captured by container runtime → shipped to a log aggregator.
2. **Metrics**: numerical time series (CPU, memory, request rate, custom). Prometheus is the cluster standard.
3. **Events**: K8s API objects describing what happened (Pod created, image pull failed, scheduling decision).

Plus traces (distributed tracing across services) for microservices.

The typical production stack: Fluentd/Vector for logs → Loki or Elasticsearch; Prometheus + Grafana for metrics; X-Ray / Jaeger / Tempo for traces; CloudWatch / Datadog / New Relic as commercial alternatives.

## The technical version

### Logs

Container processes write to stdout/stderr. The container runtime (containerd) captures them. The kubelet exposes them via the K8s API. `kubectl logs pod-name` shows them.

For aggregation, a log forwarder runs as a DaemonSet on every Node:

- **Fluentd / Fluent Bit**: long-standing, configurable.
- **Vector**: newer, performant.
- **Promtail**: ships logs to Loki specifically.

The forwarder tails container log files on the Node, optionally enriches with K8s metadata (Pod name, namespace, labels), and ships to a backend (Loki, Elasticsearch, CloudWatch, Datadog).

For production:

- Structured logging (JSON) from apps so fields are queryable.
- Forward to a queryable store, not just files.
- Retention policies (logs are expensive to store forever).
- PII and secret scrubbing in the pipeline.

### Metrics — Prometheus

Prometheus is the de facto K8s metrics standard. Architecture:

- Pods expose metrics endpoints (`/metrics`) in Prometheus format.
- Prometheus scrapes them on a schedule.
- Stores time-series data locally (or in Cortex, Mimir, Thanos for long-term).
- Grafana visualizes.

ServiceMonitor or PodMonitor CRDs (via Prometheus Operator) declare what to scrape:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-app
spec:
  selector:
    matchLabels:
      app: my-app
  endpoints:
  - port: metrics
    path: /metrics
```

Common metric sources:

- **kube-state-metrics**: cluster object metrics (Pods, Deployments, etc.).
- **node-exporter** (DaemonSet): Node-level OS metrics.
- **cAdvisor** (via kubelet): container resource metrics.
- **Application metrics**: instrumented via client libraries.

### Events

K8s events are time-stamped messages about objects:

```bash
kubectl get events -n production --sort-by='.lastTimestamp'
```

Examples: `Pulled image successfully`, `Failed to schedule`, `Liveness probe failed`, `OOMKilled`.

Events are stored in etcd with a retention (1 hour by default). For long-term, ship them to your logging stack via tools like `eventrouter` or Fluent Bit's events plugin.

`kubectl describe pod <name>` shows recent events for that Pod. First debugging stop.

### Traces

For microservices, distributed tracing reconstructs a request's path:

- **OpenTelemetry**: vendor-neutral standard for tracing instrumentation.
- **Jaeger / Tempo / X-Ray**: backends storing traces.
- **Service mesh**: Istio, Linkerd produce traces automatically.

Pods instrument with OpenTelemetry SDK; spans are exported to a collector; collector forwards to the trace backend. Traces correlate to logs via trace IDs.

For monoliths: not needed. For non-trivial microservices: increasingly essential.

### Commercial vs open source

Two paths:

**Open-source stack (Prometheus + Grafana + Loki + Tempo)**:

- Self-host or use managed versions (Grafana Cloud, Amazon Managed Prometheus).
- Lower direct cost; higher operational burden.
- Excellent K8s integration.

**Commercial (Datadog, New Relic, Dynatrace)**:

- Pay per host / per usage.
- Less operational work.
- Often better correlation across signals.

For early stage: managed open-source or affordable commercial. For mature large-scale: hybrid (Prometheus for cluster metrics + commercial APM for app traces) or full commercial.

### What to alert on

For production K8s:

- **Pod not ready** for extended periods.
- **High error rate** on services.
- **Latency p99** above SLO.
- **CPU/memory near limit** sustained.
- **Disk space** on Nodes.
- **Restart loops** (CrashLoopBackOff).
- **Failed deployments** (rollout stuck).
- **Cluster events**: control plane errors, etcd issues.

Tune to actionable alerts. Alarm fatigue kills observability — fewer well-tuned alerts beat hundreds of noisy ones.

### Dashboards

Standard production dashboards:

- **Cluster overview**: Node count, resource utilization, control plane health.
- **Workload dashboards**: per-Deployment metrics (replicas, restarts, latency).
- **Service mesh observability**: golden signals per service (rate, errors, duration, saturation).
- **Cost dashboards**: spend by workload/team (via Kubecost or similar).

For each production workload, a dashboard the on-call team actually uses. Dashboards nobody opens are theater.

### kubectl debugging

When something's wrong, the debugging path:

```bash
kubectl get pods -n namespace                       # broad view
kubectl describe pod <name>                          # events + container states
kubectl logs <name> [-c container]                   # container output
kubectl logs <name> --previous                       # crashed container's last logs
kubectl exec -it <name> -- bash                      # shell into running container
kubectl debug <name> -it --image=busybox             # debug container
kubectl top pods                                     # resource usage
kubectl get events --sort-by='.lastTimestamp'        # what happened
```

These cover most issues. Pair with cluster-wide dashboards for context.

### Cost of observability

Observability costs scale with cluster activity:

- Log ingestion: $0.50-1/GB depending on provider.
- Metrics storage: per series per day.
- Trace storage: per span.

For mature production, observability runs 5-15% of total infrastructure cost. Worth it; flying blind costs more in incidents.

Optimize: sampling for traces (don't store every span), log filtering (drop noisy levels), metric cardinality control (per-Pod metrics add up).

### SLOs and error budgets

Modern reliability practice:

- **SLO (Service Level Objective)**: target availability/latency (e.g., 99.9% uptime).
- **Error budget**: how much you can fail and still hit SLO.
- **Burn rate alerts**: notify when error budget is consumed faster than expected.

Tools like Sloth or Pyrra generate Prometheus rules for SLOs.

For mature platforms, SLOs structure on-call response and prioritization.

## Three real-world scenarios

**Scenario 1: Pod stuck CrashLoopBackOff.**
`kubectl describe pod` shows OOMKilled. `kubectl logs --previous` shows the app printing "out of memory" before exit. Memory dashboard shows the Pod's working set climbing over hours. Application memory leak. Increased limits temporarily; fixed the leak in code; restored normal limits. Two days to fix; observability surfaced it within minutes.

**Scenario 2: Slow service after deploy.**
Latency p99 doubles after a deploy. Distributed tracing shows the new version makes an extra synchronous DB call per request. Fix: cache or batch. Without tracing, would have required digging through code; with it, root cause was a click in the trace UI.

**Scenario 3: Alert fatigue.**
On-call team had 100+ alarms. Most fired multiple times daily. Important ones got lost. Pruned to 25 actionable alarms, tightened thresholds, used composite alarms to reduce noise. Real incidents now trigger alerts that actually get attention.

## Common mistakes to avoid

- **No metrics / logs / alerts** until you're in an incident.
- **Alarm fatigue** from over-alerting.
- **Log retention without limits** — cost surprise.
- **High-cardinality metrics** (per-Pod, per-request) blowing up Prometheus.
- **No structured logging** — can't query.
- **No traces** in microservices.
- **Dashboards nobody opens** — build for use, not theater.

## Read more

- Prometheus documentation.
- Grafana docs and dashboards library.
- OpenTelemetry specification.
- *Observability Engineering* by Charity Majors et al.

## Summary

- **Three pillars**: logs, metrics, events. Plus traces for microservices.
- **Prometheus + Grafana** = the K8s metrics standard.
- **Fluentd/Vector + Loki/Elasticsearch** for logs.
- **OpenTelemetry + Jaeger/Tempo/X-Ray** for traces.
- **kube-state-metrics, node-exporter, cAdvisor** are baseline sources.
- **Alert on actionable conditions**, not everything.
- **Structured logging** (JSON) makes logs queryable.
- **SLOs and error budgets** structure reliability.

Next: autoscaling.
