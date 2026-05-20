---
module: 1
position: 2
title: "The control loop and controllers"
objective: "Understand how Kubernetes maintains desired state."
estimated_minutes: 7
---

# The control loop and controllers

## The puzzle

In Lesson 1 we said "controllers reconcile observed state toward desired state." That sounds like marketing. What actually happens? When you `kubectl apply -f deployment.yaml`, what code runs, in what order, on what machine? Understanding the mechanics demystifies a lot of Kubernetes behavior — including the surprising parts.

## The simple version

The control loop pattern, repeated everywhere in Kubernetes:

1. **Watch** the API for objects of a certain kind.
2. **Observe** the actual state in the cluster.
3. **Compare** desired (in the API) vs. actual.
4. **Act** to close the gap (create, update, delete other objects).
5. **Repeat forever**.

Different controllers watch different object types. The Deployment controller watches Deployments; it creates/updates ReplicaSets. The ReplicaSet controller watches ReplicaSets; it creates/deletes Pods. The Scheduler watches unscheduled Pods; it assigns them to Nodes. The kubelet watches Pods assigned to its Node; it starts containers.

Each controller is simple. Composed together, they implement Kubernetes.

## The technical version

### The reconciliation loop

A canonical controller in pseudocode:

```
for each object of my Kind in the API:
    desired = object.spec
    actual = observe_real_state()
    if desired != actual:
        take_action_to_close_gap()
```

This loop runs continuously. Controllers don't react to commands; they react to differences between spec and status.

When you `kubectl apply` a Deployment:

1. kubectl sends the YAML to the API server.
2. API server validates and stores it in etcd.
3. Deployment controller (watching Deployments) notices a new one.
4. Deployment controller creates a ReplicaSet object via the API.
5. ReplicaSet controller (watching ReplicaSets) notices the new one.
6. ReplicaSet controller creates Pod objects (still in the API; not running yet).
7. Scheduler (watching unscheduled Pods) picks a Node for each Pod.
8. kubelet on that Node notices a Pod assigned to it.
9. kubelet pulls the image and starts the container via the runtime.

That's the full path from `kubectl apply` to a running container. Each step is one controller doing reconciliation.

### Why this design

The control-loop pattern has nice properties:

- **Self-healing**: if a Pod dies, the ReplicaSet controller notices observed count < desired count and creates a replacement. No human required.
- **Composable**: new controllers can watch existing objects; the cluster gains capabilities without changes to core code.
- **Robust**: controllers don't need to know about each other; they all converge against the API as source of truth.
- **Extensible**: you write a custom controller for a custom resource; the same patterns apply.

The cost: things happen asynchronously. `kubectl apply` returning doesn't mean the Pod is running. It means the desired state is stored. Reconciliation happens after.

### Why `kubectl apply` is idempotent

Because the API is declarative. Applying the same YAML twice is a no-op — the second apply sets desired state to what it already is. No state machine to navigate.

This is dramatically different from imperative scripts. Apply works the same whether you've applied it before, whether the resources exist, whether you're in any particular state. The cluster converges toward the YAML.

### Status vs Spec

Every Kubernetes object has two parts:

- **spec**: desired state. Written by users / controllers.
- **status**: observed state. Written by controllers / the system.

For a Deployment:

```yaml
spec:
  replicas: 3
  template: { ... }

status:
  observedGeneration: 5
  replicas: 3
  readyReplicas: 3
  availableReplicas: 3
```

You set `spec.replicas = 3`. The system updates `status` to reflect what's actually happening. When debugging, look at status to see what the system observed.

### The scheduler

A specialized controller that watches Pods with no Node assigned and picks a Node. The decision factors include:

- Node has enough CPU/memory (requests vs allocatable).
- Node matches Pod's nodeSelector / affinity / tolerations.
- Pod's anti-affinity rules.
- Taints on Nodes that Pod doesn't tolerate.
- Pod priority.

It scores Nodes and picks the best fit. After assignment, the Pod's `spec.nodeName` is set; the kubelet on that Node takes over.

For most workloads, the default scheduler is fine. You can write custom schedulers for special needs.

### The kubelet

The agent on every Node. Its job:

- Watch the API for Pods assigned to this Node.
- For each Pod, pull images, start containers, monitor health.
- Report Pod status back to the API.
- Handle the container runtime via CRI (Container Runtime Interface).

The kubelet is the bridge between "Kubernetes API state" and "containers actually running on this machine." It enforces the API's instructions on the local Node.

### Custom controllers and the operator pattern

You can write your own controller for your own resources. Common pattern:

1. Define a Custom Resource (CRD): "PostgresCluster" with fields like `replicas`, `version`, `storage`.
2. Write a controller that watches PostgresCluster objects.
3. When one is created/updated, the controller creates/updates StatefulSets, Services, Secrets, PVCs to make it real.

This is the "operator pattern" — using K8s primitives to encode domain-specific automation. Examples:

- **Postgres operators** (Zalando, CrunchyData) for Postgres clusters.
- **Strimzi** for Kafka.
- **cert-manager** for TLS certificate management.
- **Argo CD** for GitOps.

For application-specific automation, custom operators are how Kubernetes extends beyond its built-in controllers.

### Watches and informers

Controllers don't poll the API in a tight loop. They use "watch" connections:

- Open a long-lived connection to the API server.
- API server pushes change events as they happen.
- Controller reacts.

This is efficient: thousands of controllers across a cluster, each watching specific resource types, getting events when relevant.

The `client-go` library (and its equivalents in other languages) provides "informers" — caches of objects synchronized via watches. Controllers use informers to read object state without hammering the API server.

### Eventual consistency

Because reconciliation is async, Kubernetes is eventually consistent. A few implications:

- **Don't expect immediate effect**. `kubectl apply` returns; reconciliation continues.
- **Status lags spec**. You may see `desired: 3, current: 2` briefly.
- **Race conditions in your own controllers**. If you write controllers, design for "observe, decide, act, requeue."
- **Failures retry**. Controllers re-attempt indefinitely until they succeed or you change the spec.

Most of the time this is fine. Occasionally you'll be surprised by latency. Modern controllers are fast (sub-second reconciliation in most cases).

### Observability of the control plane

To see what's happening:

- `kubectl describe <object>`: see events for that object.
- `kubectl get events`: cluster-wide events.
- API server audit logs: every request and response.
- Controller manager logs: what the controllers are doing.

For debugging "why isn't my Pod running?", `kubectl describe pod <name>` is the first stop. It shows scheduling decisions, image pulls, health checks, restart counts.

### The control plane as critical infrastructure

The API server and etcd are critical. If they're down:

- New objects can't be created or updated.
- Existing workloads keep running (controllers and kubelets cached the state).
- But you can't deploy changes, scale, or recover from failures.

Managed K8s services run the control plane highly available (multi-AZ etcd, replicated API servers). Self-managed clusters need to engineer this themselves.

For the control plane: it's the brain. Lose it temporarily and the body keeps moving; lose it for long and the body can't respond to anything.

### Operator pattern in practice

Why operators are popular:

- Encode operational knowledge (how to deploy and upgrade X) into code.
- Self-service for application teams (declare a database, get one).
- Consistent operations across many instances.
- Off-the-shelf operators for many systems.

The downside: operators add complexity. You're running their controller logic in your cluster. Bugs in operators can affect your workloads. Pick operators with care; some are mature (cert-manager), some are experimental.

### What this means in practice

Day-to-day Kubernetes work:

- Write YAML for what you want.
- Apply it.
- Watch the cluster converge.
- Debug via `kubectl describe` and logs when it doesn't.
- Trust the reconciliation; intervene rarely.

The mental shift: from "execute commands" to "declare state." This is the cultural part of Kubernetes adoption, often harder than the technical part.

## Three real-world scenarios

**Scenario 1: A Pod won't start.**
`kubectl describe pod web-abc` shows "Events: Failed to pull image my-app:v2.0 — manifest not found." The Deployment controller created the Pod (desired state); the kubelet failed to pull the image (actual state can't match). Fix: push the image to the registry; the kubelet retries automatically. Reconciliation resumes; no manual intervention needed beyond fixing the image.

**Scenario 2: Scaling up doesn't work.**
You bump `spec.replicas` from 3 to 10. New Pods stay in `Pending`. `kubectl describe pod` shows "Events: Insufficient cpu" — Nodes don't have enough capacity. The scheduler couldn't place the Pods. Fix: add Nodes (manually or via Cluster Autoscaler); the scheduler will then place the pending Pods. Again, no command needed — just enable the capacity, and the controllers do the rest.

**Scenario 3: A custom operator drift.**
A Postgres operator's controller has a bug; it keeps trying to modify the StatefulSet in a way that fails validation. Logs show repeated reconciliation attempts. The cluster is in a "controller-fights-itself" state. Fix: identify the bad spec field, correct it, the operator stabilizes. Custom controllers can produce this kind of issue; operator quality matters.

## Common mistakes to avoid

- **Expecting synchronous behavior**: apply returns; reconciliation is async.
- **Imperative thinking** about declarative resources.
- **Not reading status**: spec says what you want; status says what's happening.
- **Polluting the API** with high-frequency updates from custom controllers.
- **Misunderstanding operator lifecycle**: operators can lag, fail, or fight each other.

## Read more

- Kubernetes documentation: "Controllers" concept.
- *Programming Kubernetes* by Hausenblas and Schimanski.
- *Cloud Native Programming with Golang* (operator examples).
- Kubernetes Enhancement Proposals (KEPs) for design discussions.

## Summary

- **Control loop**: watch, observe, compare, act, repeat.
- **Spec is desired state; status is observed state.**
- **Controllers are simple individually, powerful when composed.**
- **Built-in controllers**: Deployment, ReplicaSet, StatefulSet, Job, Node, Service, etc.
- **Scheduler** places Pods on Nodes.
- **Kubelet** translates API state to running containers.
- **Custom operators** encode domain-specific automation.
- **Reconciliation is async** — design for eventual consistency.

Next: cluster architecture in detail.
