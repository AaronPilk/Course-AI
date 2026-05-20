---
module: 2
position: 1
title: "Pods — the unit of work"
objective: "Understand what a Pod actually is."
estimated_minutes: 8
---

# Pods — the unit of work

## The puzzle

People say "Kubernetes runs containers." Mostly true, but the unit Kubernetes actually schedules is the Pod — a small wrapper around one or more containers that share resources. Understanding Pods correctly explains a lot of K8s behavior: why containers in the same Pod can talk via localhost, why Pods are usually treated as ephemeral, why "restart the Pod" usually means "create a new one."

## The simple version

A Pod is:

- **One or more containers** that share network, storage, and lifecycle.
- **The smallest scheduling unit** in Kubernetes.
- **Ephemeral by design**: replaced rather than mutated.
- **Has its own IP address** (within the cluster).

Most Pods have one container — your application. Multi-container Pods are for tightly-coupled helpers (logging sidecars, service mesh proxies, init containers).

You rarely create Pods directly; you create Deployments, StatefulSets, or Jobs that create Pods for you. But understanding the Pod is foundational.

## The technical version

### Pod composition

A Pod packages:

- **Containers**: the actual processes.
- **Shared network namespace**: containers see localhost together and share one Pod IP.
- **Shared storage**: volumes mounted into multiple containers if needed.
- **Shared lifecycle**: containers start and stop together (mostly).
- **Init containers**: run before main containers; sequential.

A minimal Pod manifest:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    app: web
spec:
  containers:
  - name: app
    image: myapp:v1.0
    ports:
    - containerPort: 8080
```

Apply this and one Pod runs with one container. Most production workloads use Deployments instead of bare Pods.

### Why Pods exist (instead of just containers)

Kubernetes could have made containers the scheduling unit. Instead, it added the Pod wrapper. Reasons:

- **Tightly-coupled containers**: sometimes you want a sidecar (log shipper, service mesh proxy) running alongside your app, sharing localhost and storage. Pod packages this.
- **Atomic deployment**: containers in a Pod are scheduled together, fail together, succeed together.
- **Shared resources**: network and storage shared among containers.

Most Pods have one container. The flexibility for multi-container Pods is occasionally useful.

### Sidecar pattern

Multi-container Pods often use the sidecar pattern:

- **Main container**: your app.
- **Sidecar container(s)**: support functions — log forwarding, service mesh proxy, secret injection, monitoring agent.

Sidecars run alongside the main container; they share network and storage. They can be more cleanly isolated than putting the same functionality into the main container.

Example: a web app + Fluentd sidecar that tails app logs from a shared volume and ships to a log aggregator.

Modern K8s has a more formal `sidecarContainers` field (in beta as of recent versions) for proper sidecar lifecycle.

### Init containers

Run before the main containers. Sequential — each completes successfully before the next starts. Main containers only start after all init containers succeed.

Use cases:

- Wait for a database to be ready.
- Run schema migrations.
- Pre-populate a shared volume.
- Set up configuration.

```yaml
spec:
  initContainers:
  - name: wait-for-db
    image: busybox
    command: ['sh', '-c', 'until nc -z db 5432; do sleep 1; done']
  containers:
  - name: app
    image: myapp
```

App container starts only after `wait-for-db` succeeds.

### Pod lifecycle

A Pod moves through phases:

- **Pending**: created but not yet scheduled (waiting for capacity) or images pulling.
- **Running**: at least one container is running.
- **Succeeded**: all containers terminated successfully and won't restart.
- **Failed**: at least one container terminated in failure.
- **Unknown**: state can't be determined (Node communication issue).

Containers within a Pod have their own states (Waiting, Running, Terminated). The Pod's phase summarizes them.

`kubectl get pods` shows the phase. `kubectl describe pod` shows per-container detail.

### Restart policy

Pod spec has a `restartPolicy` field:

- **Always** (default for Deployments): restart container when it exits.
- **OnFailure**: restart only on non-zero exit (good for batch Jobs).
- **Never**: don't restart.

Note: this is per-container restart, within the Pod. If the entire Pod fails, it's the Deployment/ReplicaSet/Job controller that decides whether to create a new Pod, not the Pod itself.

### Liveness and readiness probes

Containers can declare two probes:

**Liveness probe**: is the container alive? If it fails, kubelet restarts the container.

**Readiness probe**: is the container ready to serve traffic? If it fails, the Pod is removed from Service endpoints (no traffic sent).

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 5
```

Probe types: HTTP GET, TCP connect, exec a command, gRPC.

Tune carefully. A liveness probe that's too aggressive can cause restart loops. A readiness probe that lags can cause traffic to be sent to not-ready Pods.

### Startup probes

For slow-starting apps, a startup probe runs first, with longer timeouts. While startup probe is running, liveness/readiness are paused. Once startup succeeds, the regular probes take over.

Useful for: legacy Java apps with 60+ second startup; ML model loading; complex initialization.

### Pod resources

You declare resource requests and limits per container:

```yaml
resources:
  requests:
    cpu: "500m"        # 0.5 CPU
    memory: "256Mi"
  limits:
    cpu: "1"
    memory: "512Mi"
```

**Requests**: what the scheduler considers when placing Pods. Sum of requests can't exceed Node allocatable.

**Limits**: hard ceiling. CPU is throttled at limit; memory is killed (OOMKilled) if exceeded.

Best practice:

- **Always set requests** for predictable scheduling.
- **Set memory limits**; let CPU be uncapped (requests-based scheduling, no throttling under normal load).
- **Measure actual usage** before setting; many teams over-provision.

### QoS classes

Based on requests/limits, K8s assigns a QoS class:

- **Guaranteed**: requests = limits for all resources. Highest priority; won't be evicted under memory pressure.
- **Burstable**: requests set but less than limits (or limits not set).
- **BestEffort**: no requests or limits. Lowest priority; evicted first.

Production workloads should be Guaranteed or Burstable, not BestEffort.

### Volumes

Containers in a Pod can share volumes:

```yaml
spec:
  volumes:
  - name: shared-data
    emptyDir: {}
  containers:
  - name: app
    image: myapp
    volumeMounts:
    - name: shared-data
      mountPath: /data
  - name: sidecar
    image: log-shipper
    volumeMounts:
    - name: shared-data
      mountPath: /var/log/app
```

Both containers see `/data` (in app) and `/var/log/app` (in sidecar) as the same emptyDir volume.

Volume types include:

- **emptyDir**: ephemeral; created with Pod, destroyed with Pod. Lives on Node.
- **ConfigMap / Secret**: mount config or secret data as files.
- **PersistentVolumeClaim (PVC)**: persistent storage (covered in Module 4).
- **hostPath**: a path on the Node. Use sparingly; couples Pod to a specific Node setup.
- **Projected**: combine multiple sources (ConfigMaps, Secrets) into one mount.

### Pod networking basics

Each Pod has its own IP address (within the cluster network). Containers in the same Pod share that IP and the network namespace — they reach each other via localhost.

Pods can communicate Pod-to-Pod by IP, but Pod IPs are ephemeral. For stable addressing, use Services (Module 3).

### Pod placement

You can influence where Pods run:

- **nodeSelector**: simple key-value match (e.g., `disk=ssd`).
- **Affinity / anti-affinity**: more sophisticated (prefer running with / avoid running near certain Pods or Nodes).
- **Tolerations**: allow Pod to land on Nodes with specific taints.
- **Topology spread**: spread Pods across AZs, racks, etc.

For most workloads, defaults are fine. Use placement controls when you have specific HA or hardware requirements.

### Pod identity and DNS

Each Pod has:

- **DNS name**: `pod-name.namespace.svc.cluster.local` (rarely used directly).
- **IP address**: assigned by the CNI plugin.
- **Service Account**: identity for accessing the K8s API.

Pods are usually addressed indirectly via Services (Module 3) rather than directly.

### Termination

When a Pod is deleted:

1. Pod marked for termination; removed from Service endpoints.
2. **PreStop hook** runs (if defined): give the app time to shut down gracefully.
3. SIGTERM sent to containers.
4. **Grace period** elapses (30 seconds default).
5. SIGKILL sent if containers haven't exited.

For graceful shutdown:

- **Handle SIGTERM** in your app: stop accepting new requests; finish in-flight requests; exit.
- **Set `terminationGracePeriodSeconds`** appropriately for your app.
- **PreStop hook** can do additional cleanup (deregister from external systems).

Bad shutdown produces in-flight request failures during deploys.

### Common Pod issues

**Pending**: scheduler can't place. Check resource requests vs Node capacity, taints/tolerations, affinity rules.

**ImagePullBackOff**: image doesn't exist or auth fails. Check image name; check imagePullSecrets.

**CrashLoopBackOff**: container keeps crashing. `kubectl logs` shows why; common: bad config, dependency unavailable, app bug, OOM.

**OOMKilled**: hit memory limit. Increase limit or fix memory leak.

**Init container failure**: blocks main containers. Check init container logs.

`kubectl describe pod <name>` is the first debugging step. It shows recent events, container states, and details.

### When to use bare Pods vs controllers

You almost never want bare Pods in production:

- If a bare Pod dies, no one creates a replacement.
- No rolling updates.
- No scaling.

Use:

- **Deployment** for stateless replicas.
- **StatefulSet** for stateful workloads.
- **DaemonSet** for one-per-Node.
- **Job** for run-to-completion.

Bare Pods are useful for: debugging (`kubectl run -it`), one-off testing, learning examples.

### Pod security contexts (preview)

Pods can declare security restrictions:

- Run as specific user/group.
- Don't run as root.
- Drop Linux capabilities.
- Read-only root filesystem.

Production Pods should usually drop privileges. Covered in detail in Module 4.

## Three real-world scenarios

**Scenario 1: A Pod stuck in CrashLoopBackOff.**
Container keeps starting and immediately dying. `kubectl logs <pod>` shows "Cannot connect to database." Init container should have waited for the DB; was missing. Add an init container that polls until DB is reachable. Container now starts cleanly because the DB is ready by the time it begins.

**Scenario 2: An app being killed unexpectedly.**
Pods restart periodically. `kubectl describe` shows "OOMKilled" — exceeded memory limit. Logs show memory growing over time. Could be a leak (fix the app) or genuine under-provisioning (increase the limit). Memory metrics in Prometheus / CloudWatch help distinguish.

**Scenario 3: Graceful deploys breaking active requests.**
During rolling deploys, some requests fail. The app receives SIGTERM and exits immediately, terminating in-flight requests. Fix: handle SIGTERM properly — stop accepting new connections, finish active requests, then exit. Set `terminationGracePeriodSeconds` large enough for the slowest request. Configure preStop hook if the app needs explicit deregistration time. Result: zero-downtime deploys.

## Common mistakes to avoid

- **Creating bare Pods in production** — use a controller.
- **No resource requests** — scheduling is unpredictable.
- **No liveness/readiness probes** — failures unnoticed.
- **Aggressive liveness probes** — restart loops.
- **No graceful shutdown handling** — failed requests during deploys.
- **hostPath volumes** — couples Pods to Node setup.
- **Multi-container Pods for unrelated services** — defeats the abstraction.

## Read more

- Kubernetes official docs: "Pods" concept.
- *Kubernetes in Action* by Marko Lukša — solid Pods chapter.
- KEP-753 (sidecar containers).

## Summary

- **Pod** = one or more containers sharing network, storage, lifecycle.
- **Smallest scheduling unit**: K8s schedules Pods, not containers.
- **Usually one container per Pod**; sidecars for tight coupling.
- **Init containers** run sequentially before main containers.
- **Liveness/readiness probes** for health.
- **Resource requests/limits** for scheduling and isolation.
- **Restart policy** controls per-container restart; controllers create new Pods on failure.
- **Graceful shutdown** via SIGTERM handling + termination grace period.
- **Use controllers** (Deployment, StatefulSet, Job), not bare Pods.

Next: Deployments and ReplicaSets.
