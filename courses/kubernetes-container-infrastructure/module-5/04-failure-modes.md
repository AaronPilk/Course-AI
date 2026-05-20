---
module: 5
position: 4
title: "Failure modes — the K8s mistakes that bite you"
objective: "Recognize and fix the common breakages."
estimated_minutes: 8
---

# Failure modes — the K8s mistakes that bite you

## The puzzle

Every Kubernetes operator has war stories. The same mistakes show up across teams: Pods crashing in loops, images that won't pull, OOM kills, mysterious networking failures. Knowing the common failure patterns turns "what just happened?" into "I've seen this; here's the fix."

## The simple version

The top K8s failure modes:

1. **CrashLoopBackOff**: container keeps crashing.
2. **ImagePullBackOff**: image won't pull.
3. **OOMKilled**: container hit memory limit.
4. **Pending**: Pod can't be scheduled (no capacity, wrong selectors).
5. **Readiness probe failures**: Pod never becomes Ready.
6. **Liveness probe restart loops**: liveness too aggressive, healthy Pods get killed.
7. **PVC stuck**: storage provisioning failures.
8. **Service has no endpoints**: selector/label mismatch.
9. **Cluster Autoscaler not scaling**: misconfiguration; PDB blocking.
10. **Cost surprise**: untagged resources, runaway logs, accidental high-priority Pods.

For each: `kubectl describe pod`, `kubectl logs`, `kubectl get events` are the diagnostic starting points.

## The technical version

### CrashLoopBackOff

Container starts, crashes, restarts. K8s adds exponential backoff between restarts.

Diagnostic flow:

```bash
kubectl describe pod <name>          # see container state + last termination reason
kubectl logs <name> --previous       # logs from the crashed container
```

Common causes:

- **Application error at startup**: bad config, missing env var, can't connect to dependency.
- **Image entrypoint wrong**: container exits immediately.
- **Missing files**: ConfigMap or Secret not mounted.
- **OOMKilled** (covered below).

Fix at the application or config level. Don't just keep restarting hoping it'll work.

### ImagePullBackOff

kubelet can't pull the image.

```bash
kubectl describe pod <name>  # see "Failed to pull image" with reason
```

Causes:

- **Wrong image name or tag**: typo.
- **Image doesn't exist** in the registry.
- **Auth missing**: private registry needs imagePullSecrets.
- **Registry rate limiting**: Docker Hub free tier hits limits.
- **Network**: cluster can't reach the registry.

Fix the image reference, add imagePullSecrets, or use a pull-through cache.

### OOMKilled

Container exceeded memory limit; kernel killed it.

Diagnostic:

```bash
kubectl describe pod <name>      # shows OOMKilled status
kubectl top pod <name>           # current usage
```

Metrics over time (Prometheus) show whether memory grew steadily (leak) or spiked (legitimate burst). Fixes:

- **Memory leak**: fix the application.
- **Under-sized limit**: raise it; remember to raise request too.
- **JVM heap configuration**: -Xmx should be ~70% of limit.
- **Sidecar memory not accounted**: count all containers in the Pod.

### Pending Pods

Pod created but not scheduled.

```bash
kubectl describe pod <name>  # Events section shows why
```

Common reasons:

- **Insufficient cpu/memory** on Nodes (capacity issue).
- **No Nodes match nodeSelector or affinity**.
- **Tolerations don't match Node taints**.
- **Storage waiting** (PVC pending).
- **Too many Pods per Node** (limit hit).

Fix by adding capacity (Cluster Autoscaler), adjusting selectors, or reducing requests.

### Readiness probe failures

Pod is Running but never Ready; Service doesn't include it.

```bash
kubectl describe pod <name>  # see probe failures in Events
```

Causes:

- **App takes longer than expected to start**: tune `initialDelaySeconds` or use `startupProbe`.
- **Probe endpoint wrong**: 404 or 500 from the app.
- **Dependencies not available**: probe checks DB connection that's not up.
- **App listening on different port**: probe `port` doesn't match.

Test the probe endpoint from inside the Pod (`kubectl exec`) to confirm what's happening.

### Liveness probe restart loops

Liveness probe fails → kubelet restarts container → new container fails the same probe → restart again. Pod stuck in restart loop.

Causes:

- **Probe too aggressive** (timeout too short, threshold too low).
- **App health depends on dependencies** that come back faster than probe allows.
- **Probe checks the wrong thing** (deep health checks fail under load; should be shallow).

Tune probes carefully. Liveness should only fail when the container genuinely needs a restart — not for every transient hiccup.

### PVC stuck

PVC pending or stuck in deletion.

Causes:

- **No matching PV or StorageClass**: no provisioner found.
- **Wrong access mode**: requesting RWX from RWO storage.
- **Storage class WaitForFirstConsumer + no Pod yet**: expected; will provision once Pod scheduled.
- **Finalizers blocking deletion**: PVC has a finalizer preventing cleanup.

For stuck deletion, sometimes manual finalizer removal is needed. Carefully.

### Service has no endpoints

```bash
kubectl get endpoints <service>
```

Empty? Cause is usually selector/label mismatch:

```bash
kubectl get svc <service> -o yaml             # see selector
kubectl get pods -l <selector>                # see if anything matches
kubectl describe pod <pod> | grep -i ready    # is the Pod Ready?
```

Common: Deployment template labels don't match Service selector. Or all Pods are Not Ready due to probe failures.

### Cluster Autoscaler stuck

Pods Pending; expected to trigger scale-up; doesn't happen.

Causes:

- **ASG/Karpenter at max**.
- **No suitable instance type** for Pod requirements.
- **IAM permissions** missing for autoscaler.
- **PDB blocking scale-down**, leading to scaling exhaustion elsewhere.

Check autoscaler logs (`kubectl logs -n kube-system cluster-autoscaler-xxx`).

### Cost surprises

Common sources:

- **Untagged resources** — cost is unattributed; teams can't optimize.
- **Verbose logs without retention** — CloudWatch Logs balloon.
- **Forgotten dev clusters** — running 24/7.
- **High-priority Pods preempting** — chasing resources around the cluster.
- **Cross-AZ traffic** — at scale, NAT and inter-AZ are real money.
- **Expensive instance types** chosen by Karpenter for some Pods.

Tag everything; set log retention; budget alerts; review monthly.

### Common operational patterns

For each of these, having a runbook helps:

- **Pod debugging**: `kubectl describe pod` → `logs` → `logs --previous` → `exec` into a debugging container.
- **Node draining**: `kubectl cordon` → `kubectl drain --ignore-daemonsets` → repair → `kubectl uncordon`.
- **Cluster upgrade**: drain Nodes one AZ at a time; verify workloads remain healthy.
- **Restoring from backup**: documented + tested.

### Honest take

Kubernetes' complexity creates many failure modes but most are well-understood and well-documented. The first few times a team hits each one, debugging is painful. After that, the same diagnostic flow (describe, logs, events) handles most cases.

Investment in observability + runbooks pays back. Fresh on-call engineers shouldn't be debugging novel issues every shift — they should be following runbooks for known failure modes most of the time.

### Defensive patterns

For mature production clusters:

- **Resource requests and limits** on every container.
- **Readiness and liveness probes** tuned per workload.
- **PDBs** for high-availability workloads.
- **Default-deny NetworkPolicies** with explicit allow.
- **PSS restricted** at namespace level.
- **GitOps** for deploys.
- **Backups + tested restoration**.
- **Observability stack** with actionable alarms.
- **Cost tagging and budget alerts**.
- **Documented runbooks** for common incidents.

Each is one-time setup; collectively they make the cluster operable rather than mysterious.

### When to escalate vs investigate yourself

Some issues are clear and runbook-solvable. Others require deeper investigation or vendor support:

- **Control plane issues** on managed K8s: contact cloud support.
- **Networking issues across AZs/regions**: cloud support; complex.
- **etcd corruption**: usually cloud support.
- **CSI driver bugs**: vendor support.
- **Application logic bugs**: your team.

Knowing the boundary saves time. Spending hours debugging a managed-control-plane issue is wasted effort.

## Three real-world scenarios

**Scenario 1: A CrashLoopBackOff with cryptic logs.**
Pod restarts repeatedly. `kubectl logs --previous` shows the app saying "permission denied: /etc/secret/password." Investigation: Secret was renamed in a recent change but Deployment still references the old name. Restored the Secret name; Pod runs cleanly. Five minutes from first alert to fix because the diagnostic flow was familiar.

**Scenario 2: A liveness probe killing healthy Pods.**
Pods restart every few minutes. Investigation: liveness probe hits an endpoint that's also used for heavy GC sweeps. During GC, the probe times out, liveness fails, container restarts. Fix: use a separate cheap endpoint for liveness; tune thresholds. Restarts stop; problem solved.

**Scenario 3: PVC stuck after Node failure.**
A Node died unexpectedly. Pod was reschedule but PVC won't attach to new Node because the volume is still "attached" to the dead Node from K8s' perspective. Fix: manual `volumeattachments` cleanup. Some CSI drivers handle this automatically; others need help. After the first time, on-call learns the pattern.

## Common mistakes to avoid

- **No resource requests** — unpredictable scheduling and OOM.
- **No probes** — broken Pods receive traffic.
- **Aggressive liveness probes** — healthy Pods get killed.
- **No graceful shutdown** — every deploy errors.
- **No backups tested** — disaster recovery is fiction.
- **No observability** — issues become user-reported.
- **No runbooks** — every incident is a research project.
- **Premature K8s adoption** — operating burden exceeds capability gain.

## Read more

- Kubernetes docs: "Troubleshooting Applications" guide.
- Common K8s patterns and anti-patterns.
- *Kubernetes in Action* — debugging chapters.
- CNCF Cloud Native Landscape for observability tools.

## Summary

- **Top failure modes**: CrashLoopBackOff, ImagePullBackOff, OOMKilled, Pending, probe failures, PVC stuck, no endpoints.
- **Diagnostic flow**: describe, logs (current + previous), events, exec for deep dives.
- **Most failures are configuration**: image, probe, resource, selector.
- **Investment in runbooks** pays back across incidents.
- **Defensive patterns** (requests, probes, PDBs, NetworkPolicies, PSS, GitOps) reduce failure surface.
- **Know when to escalate** to cloud/vendor support vs investigate yourself.
- **Treat K8s operations as engineering discipline**, not heroic firefighting.

That wraps Module 5 and the course. Kubernetes is powerful when used well; the failure modes are well-understood; the operational discipline determines how productive your team is on the platform.
