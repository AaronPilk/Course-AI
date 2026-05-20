---
module: 5
position: 2
title: "Autoscaling — HPA, VPA, Cluster Autoscaler"
objective: "Scale pods and nodes without intervention."
estimated_minutes: 7
---

# Autoscaling — HPA, VPA, Cluster Autoscaler

## The puzzle

Static replica counts waste money during low traffic and break under high traffic. Kubernetes has three different autoscaling mechanisms — horizontal (more Pods), vertical (bigger Pods), and cluster (more Nodes) — that work together to match capacity to demand. Knowing which to reach for matters.

## The simple version

Three autoscalers, each handling a different dimension:

1. **Horizontal Pod Autoscaler (HPA)**: scales Pod count based on metrics (CPU, memory, custom).
2. **Vertical Pod Autoscaler (VPA)**: adjusts Pod resource requests/limits based on actual usage.
3. **Cluster Autoscaler / Karpenter**: adds/removes Nodes when Pods can't be scheduled.

Typical stack: HPA for application Pods, Karpenter for Node provisioning, VPA optionally for right-sizing recommendations. Together they make a cluster scale up under load and down when idle without manual intervention.

## The technical version

### HPA basics

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 3
  maxReplicas: 30
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

This says: keep Pods at ~70% CPU utilization. If current average is higher, scale up; lower, scale down. Min 3, max 30 replicas.

HPA polls the metrics-server every 15 seconds (default), computes desired replicas, updates the Deployment's spec.replicas. The Deployment controller does the rest.

### HPA metric sources

- **Resource metrics**: CPU, memory (from metrics-server, which queries cAdvisor).
- **Custom metrics**: from Prometheus via prometheus-adapter (`pods_per_second`, `queue_depth`, etc.).
- **External metrics**: from outside the cluster (SQS queue depth, Kafka lag, business metrics).

For custom/external metrics, you need the Custom Metrics API set up — typically via prometheus-adapter or KEDA.

### KEDA

Kubernetes Event-Driven Autoscaler. Extends HPA with many built-in scalers:

- AWS SQS queue depth.
- Kafka lag.
- Redis list length.
- HTTP request rate.
- Database connection count.
- Custom Prometheus queries.
- Cron schedules.

KEDA is popular for event-driven workloads. Scale to zero when no work; scale up rapidly on demand.

### VPA — vertical scaling

VPA observes actual Pod resource usage and adjusts requests/limits:

- **Off mode**: just recommends; doesn't change Pods.
- **Auto mode**: restarts Pods with new requests when adjustments are needed.

Use cases:

- **Recommendations**: run VPA in off mode for visibility into right-sizing.
- **Stateful workloads** where horizontal scaling isn't easy.
- **Off-peak right-sizing**: shrink during low traffic.

VPA + HPA on the same Pod with CPU is tricky (they fight). Use VPA for memory + HPA for CPU, or apply them to different workloads.

### Cluster Autoscaler

Adds Nodes when Pods can't be scheduled (Pending due to resource constraints); removes Nodes when underutilized.

Configuration:

- Per-AZ ASGs (for AWS).
- Min/max Node count per group.
- Scale-down delay (don't thrash; let workloads stabilize).
- Pod disruption budgets respected (won't drain Nodes that violate PDBs).

Setup: deploy Cluster Autoscaler as a Deployment in kube-system; it watches Pending Pods and ASG metrics; scales the ASG accordingly.

### Karpenter (AWS-specific, more modern)

Karpenter replaces Cluster Autoscaler with a more flexible approach:

- Watches Pending Pods.
- Provisions Nodes directly via EC2 API (no ASG indirection).
- Picks instance types based on Pod requirements (right-sizes the Node).
- Faster scaling (seconds vs minutes for ASG-based).
- Cheaper (bin-packs better, uses spot effectively).

For EKS in 2026, Karpenter is increasingly the default for new clusters. Cluster Autoscaler still works fine for many cases.

### Scaling considerations

**Scale-up speed**: HPA reacts to metrics with ~30s-1min lag. Karpenter provisions Nodes in ~30-60s. Together, full scale-up takes 1-2 minutes typically.

**Scale-down delay**: aggressive scale-down causes thrashing; conservative delays waste money. Tune to workload pattern (3-10 min typical).

**Cold start**: new Pods need time to warm up before serving traffic. Set readiness probes appropriately; consider provisioned concurrency for spike-critical workloads (Knative offers this for serverless on K8s).

**Resource requests matter**: HPA uses requests as the baseline for utilization calculation. Wrong requests = wrong scaling decisions.

### Scaling traps

**Memory autoscaling**: memory is sticky (Go GC, JVM heap). Memory-based HPA can oscillate. Often better to size for peak memory and scale on CPU.

**Slow apps**: HPA scales up but Pods take 60+ seconds to be ready. Capacity arrives too late. Tune startup probe + Pod priority + over-provision.

**Spiky workloads**: HPA averages over time; sudden spikes overflow before scaling kicks in. Pre-scale via schedule (CronJob-based scaling), or use over-provisioning to absorb spikes.

**Pod Disruption Budgets blocking scale-down**: PDB prevents Nodes from draining; Cluster Autoscaler can't shrink. Tune PDBs.

### Cost optimization

Autoscaling enables cost reduction:

- **Scale down during off-hours**: dev clusters scale to near-zero overnight via scheduled scaling.
- **Spot instances**: Karpenter mixes spot and on-demand based on requirements. 60-90% savings for tolerant workloads.
- **Right-sized Nodes**: Karpenter picks instance types matching Pod needs; less waste than fixed ASG types.
- **VPA right-sizing**: shrink over-provisioned Pods.

For mature production: autoscaling + spot + reserved instances together can cut compute cost 50-70%.

### Pod priority and preemption

For competing workloads:

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000
```

Higher-priority Pods can preempt lower-priority ones when capacity is tight. Used for: critical services vs batch jobs, production vs dev sharing a cluster.

### Observability of scaling

Monitor:

- Replica count over time per Deployment.
- HPA decisions and metric values.
- Node count and instance types.
- Scale-up latency (time from need to ready).
- Spot interruptions (if using).

Dashboards for these surface scaling issues early.

## Three real-world scenarios

**Scenario 1: Holiday traffic spike.**
Black Friday brings 5x normal traffic. HPA scales from 5 to 25 replicas based on CPU. Karpenter provisions additional Nodes within 60s of Pods going Pending. Total response time from spike onset to full capacity: ~2 minutes. App handles it. Without autoscaling, static provisioning would either waste money baseline or fail during peak.

**Scenario 2: KEDA scaling for queue workers.**
Background job processor sized to handle peak queue depth. With KEDA + SQS scaler, replicas scale based on queue depth: zero when empty, hundreds when backed up. Burst processing without over-provisioning baseline.

**Scenario 3: VPA recommendations save cost.**
VPA in off mode for two months. Recommendations: most Pods over-provisioned 3-5x. Reviewed and applied recommendations gradually. Reduced cluster CPU/memory waste; Cluster Autoscaler removed redundant Nodes. ~30% compute cost reduction with no application changes.

## Common mistakes to avoid

- **No autoscaling** — static sizing for peak load.
- **Memory-only HPA** — oscillates.
- **VPA + HPA on same resource** — fight each other.
- **Aggressive scale-down** — thrashing.
- **Wrong resource requests** — wrong scaling decisions.
- **Slow Pod startup without compensation** — capacity arrives too late.
- **No PDBs** — disruption during scale-down.

## Read more

- Kubernetes docs: "Horizontal Pod Autoscaling."
- KEDA documentation.
- Karpenter documentation.
- VPA documentation.

## Summary

- **HPA**: horizontal scaling via metrics.
- **VPA**: right-size requests/limits based on usage.
- **Cluster Autoscaler / Karpenter**: scale Node count.
- **KEDA**: event-driven autoscaling (queues, external metrics).
- **Karpenter** is the modern AWS default; faster, cheaper than Cluster Autoscaler.
- **Memory autoscaling oscillates** — prefer CPU or custom metrics.
- **Scale-up latency** matters; account for it with over-provisioning or fast startup.
- **Combine with spot** for cost; combine with PDBs for safety.

Next: rolling updates and rollback.
