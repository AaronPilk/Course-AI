---
module: 2
position: 2
title: "Deployments and ReplicaSets — stateless workloads"
objective: "Run and update stateless apps cleanly."
estimated_minutes: 8
---

# Deployments and ReplicaSets — stateless workloads

## The puzzle

You almost never create Pods directly in production. You create Deployments, which create ReplicaSets, which create Pods. The chain seems like over-engineering until you realize what each layer adds. Deployments give you rolling updates and rollback; ReplicaSets give you replica count management; Pods are the actual work. Understanding the chain is essential for operating stateless workloads on Kubernetes.

## The simple version

For stateless workloads (web servers, APIs, workers):

- **Deployment** is what you write. It describes desired state at the workload level.
- **ReplicaSet** is what the Deployment controller creates to manage replicas at a specific version.
- **Pod** is what the ReplicaSet creates to actually run the container.

When you deploy a new version, the Deployment creates a new ReplicaSet (with the new spec), scales it up while scaling the old one down. Rolling update happens automatically.

You apply Deployments; the rest happens.

## The technical version

### Anatomy of a Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: app
        image: myapp:v1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            memory: "256Mi"
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
```

Key fields:

- **replicas**: how many Pods to run.
- **selector**: which Pods belong to this Deployment (must match template labels).
- **strategy**: how to handle updates (RollingUpdate or Recreate).
- **template**: the Pod spec that gets created.

### The Deployment / ReplicaSet relationship

When you create a Deployment:

1. Deployment controller creates a ReplicaSet matching the current pod template.
2. ReplicaSet controller creates Pods according to the ReplicaSet's spec.

When you update the Deployment (change the image, env, etc.):

1. Deployment controller creates a **new** ReplicaSet with the new template.
2. Scales the new ReplicaSet up while scaling the old one down (within maxSurge/maxUnavailable constraints).
3. Once new RS is at full replicas and old RS is at 0, the rollout is complete.
4. Old ReplicaSet is kept (for rollback) but has 0 replicas.

`kubectl rollout history deployment/web` shows the history. `kubectl rollout undo deployment/web` rolls back to the previous version (scales up the old ReplicaSet, scales down the current one).

### Rolling updates

Default strategy. Pods are replaced incrementally:

- **maxSurge**: how many extra Pods can run above desired count during update.
- **maxUnavailable**: how many Pods can be unavailable during update.

With `replicas: 10`, `maxSurge: 25%`, `maxUnavailable: 25%`:

- Up to 13 Pods can exist at once (10 + 25%).
- At least 8 Pods must be available (10 - 25%).

Rollout progresses in batches respecting these constraints.

For zero-downtime, ensure:

- Pods have working readiness probes (so traffic isn't routed to not-ready Pods).
- Graceful shutdown handles SIGTERM correctly.
- Application supports running old + new versions side-by-side briefly.

### Recreate strategy

Alternative strategy: terminate all Pods, then create new ones. Causes downtime but is simpler.

Use when:

- App can't run multiple versions side-by-side (e.g., uses a database schema only one version understands).
- Brief downtime is acceptable.
- Single-replica deployments where rolling doesn't apply.

For most stateless services, RollingUpdate is correct.

### Labels and selectors

Labels are key-value tags on objects. Selectors find objects by label match.

A Deployment's selector says "this Deployment manages Pods with these labels." The Pod template must produce Pods with matching labels.

Mismatch is a common bug:

```yaml
spec:
  selector:
    matchLabels:
      app: web        # Looking for app=web
  template:
    metadata:
      labels:
        app: api      # But creating app=api
```

Deployment creates Pods with `app=api` but its selector doesn't match them → ReplicaSet thinks count is 0, creates more, infinite loop. Kubernetes prevents this at validation.

Best practice: keep labels consistent and meaningful. Common labels:

- `app`: the application name.
- `version`: app version.
- `tier`: e.g., frontend, backend, db.
- `environment`: dev, staging, prod.

### Scaling

To change replicas:

```bash
kubectl scale deployment web --replicas=5
```

Or edit the YAML and `kubectl apply`. Or use Horizontal Pod Autoscaler (HPA) for automatic scaling based on metrics (covered in Module 5).

Scaling up: ReplicaSet creates new Pods; Scheduler places them; kubelets start them. Within seconds, new Pods are serving traffic (assuming readiness probes pass quickly).

Scaling down: ReplicaSet picks Pods to delete (usually newest-first or least-loaded). Pods receive SIGTERM and grace period to shut down.

### Pod disruption budget (PDB)

A PDB constrains how many Pods can be unavailable at once for voluntary disruptions (Node drain, rolling update):

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: web
```

This says "always keep at least 2 Pods of `app=web` available." When draining a Node, Kubernetes respects this — won't evict a Pod if doing so violates the PDB.

For HA workloads, set PDBs to prevent overly-aggressive disruptions.

### Common Deployment patterns

**Stateless web app**: Deployment + Service. The standard pattern.

**API server with HPA**: Deployment + Service + HPA scales based on CPU/memory/custom metrics.

**Worker pulling from queue**: Deployment of workers; replicas based on queue depth (KEDA autoscaler can do this).

**Side-by-side versions**: deploy v1 and v2 as separate Deployments with separate Services; route traffic between them (canary, A/B).

### Common Deployment issues

**Stuck rollout**: new ReplicaSet not progressing. Causes: new Pods can't pull image, readiness probes failing, resource constraints, PDB blocking eviction. `kubectl rollout status deployment/web` shows progress. `kubectl describe deployment` shows events. `kubectl get pods -l app=web` shows what's happening at the Pod level.

**Selector mismatch**: validation catches most; mismatches between Deployment selector and template labels cause issues.

**Image pull failures**: ImagePullBackOff. Wrong image name, wrong tag, missing imagePullSecrets.

**Crashes immediately after launch**: CrashLoopBackOff. Logs show why — bad config, missing dependency, app bug.

**Slow rollout because readiness probes lag**: app takes time to be ready. Tune startupProbe + readinessProbe.

### Annotations vs labels

Both are key-value metadata. Difference:

- **Labels** are for selection. Used by selectors in Deployments, Services, etc.
- **Annotations** are for metadata. Not used by selectors. Hold things like deployment history, git commit, build timestamp.

```yaml
metadata:
  labels:
    app: web
    version: v1.2.3
  annotations:
    git.commit: "abc123"
    last-deployed-by: "user@example.com"
    description: "Production web tier"
```

Common annotations: `kubernetes.io/change-cause` (set automatically when using `kubectl set --record`), Helm chart info, controller-specific fields.

### History and rollback

Deployments keep history (default 10 ReplicaSets):

```bash
kubectl rollout history deployment/web
kubectl rollout history deployment/web --revision=3
kubectl rollout undo deployment/web
kubectl rollout undo deployment/web --to-revision=3
```

Rollback is fast — the old ReplicaSet still exists at 0 replicas; rollback scales it up and scales the current one down. Same rolling-update mechanics in reverse.

`revisionHistoryLimit` in the Deployment spec controls how many revisions are kept.

### When Deployment isn't enough

Deployment is for stateless workloads. For:

- **Stateful workloads** (databases, brokers): use StatefulSet.
- **One Pod per Node** (log shippers, monitoring agents): use DaemonSet.
- **Run-to-completion** (batch jobs): use Job or CronJob.

Each has a similar controller pattern but optimized for its workload type.

### Deployment + Service together

Deployments need a Service to be reachable. Service routes traffic to Pods matching a selector:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web         # matches Pods with app=web
  ports:
  - port: 80
    targetPort: 8080
```

Now `web.namespace.svc.cluster.local:80` routes to the Pods. The Service abstracts over Pod IPs (which change as Pods come and go).

We cover Services in detail in Module 3.

### Real-world deployment

A common pattern:

1. Build container image, push to registry.
2. Update YAML to reference new image tag.
3. `kubectl apply -f deployment.yaml` (or GitOps does this from git).
4. Monitor rollout: `kubectl rollout status deployment/web`.
5. Verify health.
6. If problems, `kubectl rollout undo deployment/web` and investigate.

For production, this is automated via CI/CD with ArgoCD, Flux, or similar GitOps tools.

### Tips for safe deploys

- **Use specific image tags**, not `latest`. `latest` makes rollout behavior unpredictable.
- **Test readiness probes** thoroughly before relying on them in production.
- **Set graceful shutdown timeouts** appropriately.
- **Set up alerts** on rollout failures.
- **Practice rollbacks** so the process is familiar when needed.
- **Limit revision history** (`revisionHistoryLimit: 5` or so) for clean cluster state.

## Three real-world scenarios

**Scenario 1: A bad deploy caught quickly.**
Team deploys v2.0. Within 60 seconds, error rate spikes. The deploy is still in progress (rolling). They run `kubectl rollout undo deployment/web`. Within another minute, traffic shifts back to v1.9 Pods (still running). v2.0 Pods are scaled down. Brief error spike, full recovery. Lesson: keep deploys observable and rollback fast.

**Scenario 2: A stuck rollout.**
Deployment update sits at "5 of 10 updated" for 30 minutes. `kubectl describe deployment` shows no errors. `kubectl get pods` shows new Pods in `ContainerCreating`. Investigation: image pull is slow because of registry rate-limiting. Fix: pull-through cache for the registry. Future deploys are fast.

**Scenario 3: Pod disruption budget saving the day.**
Engineer runs `kubectl drain node-3` to perform maintenance. Without a PDB, all 3 Pods of a critical service on that Node would be evicted simultaneously, even though the Service has 4 total replicas (one elsewhere). With a PDB requiring `minAvailable: 3`, the drain waits — Pods evict one at a time, new ones spin up on other Nodes, the PDB constraint is maintained. Zero downtime during the maintenance window.

## Common mistakes to avoid

- **Image tag `latest`** in production — unpredictable.
- **No readiness probe** — traffic to not-ready Pods.
- **maxUnavailable too aggressive** — too many Pods down at once.
- **No graceful shutdown handling** — in-flight requests fail.
- **Selector / template label mismatch** — Deployments don't manage their Pods.
- **No PDB for HA workloads** — Node drain can take everything down.
- **History bloat** — too many old ReplicaSets cluttering the cluster.

## Read more

- Kubernetes docs: "Deployment" reference.
- *Kubernetes in Action* by Marko Lukša.
- Best practices around rollouts and PDBs.

## Summary

- **Deployment → ReplicaSet → Pod** is the chain for stateless workloads.
- **Rolling updates** are the default; configurable via maxSurge/maxUnavailable.
- **Rollback is fast** via `kubectl rollout undo` (scales up old ReplicaSet).
- **Labels and selectors** wire components together; mismatch is a common bug.
- **PodDisruptionBudget** protects against over-aggressive eviction.
- **Pair Deployment with Service** for reachability.
- **Use specific image tags**, not `latest`.
- **Readiness probes + graceful shutdown** enable zero-downtime deploys.

Next: StatefulSets and DaemonSets.
