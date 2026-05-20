---
module: 5
position: 3
title: "Rolling updates and rollback"
objective: "Deploy safely."
estimated_minutes: 7
---

# Rolling updates and rollback

## The puzzle

The deploy is where things break. Half-formed releases, broken probes, schema mismatches, dependency surprises — all surface mid-deploy. Kubernetes has built-in rolling updates and rollback that make safe deploys the default, but only if you configure them and understand the failure modes.

## The simple version

Standard pattern for a stateless web service:

1. Update the Deployment's image tag.
2. Kubernetes performs a rolling update: scale new ReplicaSet up; scale old down; respecting maxSurge/maxUnavailable.
3. Readiness probes prevent traffic to not-ready Pods.
4. If something breaks, `kubectl rollout undo deployment/web` reverses it.
5. Monitor metrics during and after the deploy.

For more advanced patterns: canary deploys (small slice of traffic to new version), blue/green (parallel environments), feature flags (deploy decoupled from release).

## The technical version

### Rolling update mechanics

When you update a Deployment's spec.template (typically just the image tag), the Deployment controller:

1. Creates a new ReplicaSet with the new template.
2. Scales the new RS up while scaling the old RS down.
3. Respects `maxSurge` (extra Pods allowed) and `maxUnavailable` (Pods that can be down).
4. Waits for new Pods to be Ready before scaling down old ones.
5. Continues until new RS = desired replicas and old RS = 0.

Configure aggression:

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
```

With `maxUnavailable: 0`, no Pods go down before replacements are Ready — zero-downtime if your readiness probes work. Slower than `maxUnavailable: 25%` but safer.

### Readiness probes — critical

Readiness probes determine whether Service endpoints include a Pod. Misconfigured probes break rolling updates:

- **Probe too lenient**: traffic sent to not-ready Pods → errors during deploy.
- **Probe too strict**: Pods never marked Ready → rollout stuck.
- **No probe**: traffic sent immediately → errors during slow startup.

Configure probes carefully. Test in staging. The probe should reflect "is this Pod actually ready to serve traffic?" — connect to dependencies, warm caches, etc.

### Graceful shutdown

Old Pods get SIGTERM during rolling update. The app must:

1. Stop accepting new requests.
2. Finish in-flight requests.
3. Close resources cleanly.
4. Exit.

`terminationGracePeriodSeconds` (default 30) is how long K8s waits before SIGKILL. Set it longer than your slowest reasonable request.

Pre-stop hook for additional cleanup:

```yaml
lifecycle:
  preStop:
    exec:
      command: ["/bin/sh", "-c", "sleep 15"]
```

The 15-second sleep gives load balancers time to stop sending traffic before the Pod refuses connections. Combined with SIGTERM handling in the app: clean shutdowns.

### Rollback

If something's wrong:

```bash
kubectl rollout undo deployment/web
kubectl rollout undo deployment/web --to-revision=3
```

The Deployment scales the old ReplicaSet (still at 0 replicas) back up. Fast because the Pods aren't being rebuilt — just scaled up.

`revisionHistoryLimit` (default 10) keeps that many old ReplicaSets around. Tune to balance rollback flexibility with cluster cleanup.

### Monitoring rollouts

```bash
kubectl rollout status deployment/web
kubectl rollout history deployment/web
```

For automation, your CI/CD waits on `rollout status` before declaring deploy successful. If status doesn't reach "successfully rolled out" within timeout, automatic rollback.

### Progressive delivery patterns

Beyond basic rolling updates:

**Canary deploy**: route a small percentage of traffic to the new version; gauge metrics; either expand (full rollout) or rollback.

- NGINX Ingress canary annotations.
- Argo Rollouts (CRD-based canary management).
- Service mesh-based (Istio VirtualService weights).
- Flagger (operator integrating with service meshes).

**Blue/green**: full new environment runs alongside old; cut traffic over at once.

- Two Deployments + Service selector toggle.
- Or two Ingress configurations.

**Feature flags**: deploy code dark; toggle features per user/percentage at runtime.

- LaunchDarkly, Unleash, Statsig.
- Decouple deploy from release; lower risk per deploy.

For most stateless workloads, rolling updates suffice. For higher-stakes services, canary + feature flags is the modern pattern.

### Database migrations

Deploys with schema changes are trickier:

- **Backwards compatible migrations**: deploy new schema first; old code still works; deploy new code. Two-step deploy.
- **Migration jobs**: a K8s Job runs `migrate up` before/during deploy.
- **Expand-contract pattern**: add new fields/tables (expand); deploy new code; remove old fields (contract). Multi-step but safe.

Schema changes that aren't backwards compatible are dangerous in K8s rolling updates — old and new code run side by side briefly.

### Argo CD and GitOps

The mature deploy pattern: GitOps via Argo CD or Flux.

1. Cluster state in git (YAML / Helm / Kustomize).
2. Argo CD continuously reconciles cluster to match git.
3. Deploy = git commit + merge.
4. Rollback = revert commit.

Benefits:

- Single source of truth.
- Audit log via git history.
- Automated drift detection.
- No `kubectl apply` from human hands.

For mature production K8s, GitOps is the standard.

### Common deploy issues

**ImagePullBackOff**: new image doesn't exist or auth fails.

**CrashLoopBackOff on new version**: bug in the new version; readiness probes fail; rollout doesn't progress. Old Pods still running.

**Readiness probe failing on new version only**: a config issue specific to the new version. Roll back; investigate.

**Stuck rollout**: PDB blocking eviction; resource pressure preventing new Pod creation; image pull slow.

**Successful deploy, broken behavior**: probes passed but app behaves wrong. Monitor application-level metrics, not just K8s health.

For each, `kubectl rollout status`, `kubectl describe pod`, and `kubectl logs` are the diagnostic tools.

### Deploy automation

Modern CI/CD:

1. Build container image.
2. Push to registry.
3. Update YAML / Helm values in git with new tag.
4. Argo CD detects git change; applies to cluster.
5. K8s performs rolling update.
6. CI waits for `rollout status`; reports success or failure.

Per environment: same Helm chart or Kustomize base, different overlay/values. Same image promoted from dev to staging to prod.

### Safe deploy checklist

For high-stakes deploys:

- [ ] Readiness probes tested and working.
- [ ] Graceful shutdown implemented.
- [ ] `terminationGracePeriodSeconds` adequate.
- [ ] PreStop hook with sleep (for LB drain).
- [ ] PDB defined for the workload.
- [ ] Monitoring/alerts in place to catch regressions.
- [ ] Rollback procedure documented and practiced.
- [ ] Database migrations backwards compatible.
- [ ] Specific image tag (not `latest`).

Combined: deploys become routine instead of stressful events.

## Three real-world scenarios

**Scenario 1: A deploy with broken readiness probe.**
New version has a misconfigured probe that always returns 503. Pods never become Ready. Rollout stuck. Old Pods still serving traffic. `kubectl rollout undo` to revert. Investigate readiness probe in dev. Re-deploy. Zero customer impact because new Pods never received traffic.

**Scenario 2: Database migration during deploy.**
New version requires schema changes. Strategy: run migration Job before the Deployment update (idempotent, additive). New code can use new fields; old code ignores them. After full rollout, separate change removes old fields (contract phase). Multi-step but safe.

**Scenario 3: Canary deploy catching a regression.**
Route 5% of traffic to new version via NGINX canary. Error rate spikes on canary; healthy on stable. Auto-revert via Flagger. Stable handles all traffic; canary version pulled. Investigate; fix; retry. 95% of users never see the bug.

## Common mistakes to avoid

- **No readiness probe** — traffic to not-ready Pods.
- **No graceful shutdown** — failed requests on every deploy.
- **`:latest` image tag** — non-deterministic.
- **`maxUnavailable: high%`** — too many Pods down at once.
- **No PDB** — Node drain disrupts everything.
- **No rollback drill** — first rollback during a real incident.
- **Schema changes mid-rolling update without compatibility planning**.

## Read more

- Kubernetes docs: "Deployments" reference.
- Argo Rollouts documentation.
- Flagger documentation.
- *Continuous Delivery* by Jez Humble and David Farley.

## Summary

- **Rolling update** is the default; configure `maxSurge` and `maxUnavailable` carefully.
- **Readiness probes** are critical for zero-downtime.
- **Graceful shutdown** prevents in-flight request loss.
- **Rollback is fast** via `kubectl rollout undo`.
- **Canary + feature flags** for higher-stakes services.
- **GitOps via Argo CD / Flux** is the mature deploy pattern.
- **Database migrations** need backwards compatibility planning.
- **Practice rollbacks** so the procedure is familiar.

Next: failure modes that bite you.
