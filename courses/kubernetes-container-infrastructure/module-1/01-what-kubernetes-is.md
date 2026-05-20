---
module: 1
position: 1
title: "What Kubernetes actually is"
objective: "Build the right mental model."
estimated_minutes: 8
---

# What Kubernetes actually is

## The puzzle

People say things like "we'll just put it on Kubernetes" as if Kubernetes were a place. It isn't. Kubernetes is a system — specifically, a system for running containers across many machines while making it look like one machine to your application. The mental model matters because most Kubernetes mistakes come from misunderstanding what it actually does.

## The simple version

Kubernetes is:

1. **A cluster of machines** running a container runtime (containerd, CRI-O).
2. **A control plane** that decides what should run where.
3. **An API** where you declare what you want (in YAML) and the cluster reconciles toward that state.
4. **A set of controllers** that watch declared state vs. actual state and take action to converge.

You don't tell Kubernetes "run this container on that machine." You declare "I want 3 replicas of this app." The control plane figures out where they go, restarts them if they crash, replaces them if a machine dies, and gives them stable network identities. That's the value.

Everything else — Pods, Deployments, Services, Ingress — is a layer on top of this core declarative + controller-loop model.

## The technical version

### The control loop in one paragraph

The fundamental Kubernetes pattern: you write desired state in YAML, send it to the API server, which stores it in etcd. Controllers watch the API for changes, compare desired state to observed state, and take actions to close the gap. If you say "I want 3 replicas" and there are 2, a controller starts another Pod. If a node dies and Pods on it disappear, a controller schedules replacements on other nodes. This is "reconciliation" — the heart of how Kubernetes works.

Once you internalize this, most behavior makes sense. Why did Kubernetes restart my Pod? Because it didn't match desired state. Why didn't my change take effect? Because no controller is watching that field. Why does kubectl apply seem idempotent? Because you're declaring, not commanding.

### What's in a cluster

A Kubernetes cluster has two halves:

**Control plane** (the brain):

- **API server (kube-apiserver)**: the front door. All operations go through it.
- **etcd**: the database. Stores cluster state.
- **Scheduler (kube-scheduler)**: decides which node a new Pod should run on.
- **Controller manager (kube-controller-manager)**: runs the built-in controllers (Deployment, ReplicaSet, Node, Service, etc.).
- **Cloud controller manager**: cloud-specific integrations (load balancers, volumes).

**Nodes** (the workers):

- **Kubelet**: the agent on each node; talks to the API server; runs containers via the container runtime.
- **Container runtime** (containerd or CRI-O): pulls images, runs containers, manages their lifecycle.
- **Kube-proxy**: handles Service-related network routing on the node.

You interact with the cluster via `kubectl` (or the API directly). `kubectl apply -f file.yaml` sends the YAML to the API server, which stores it; controllers do the rest.

### Declarative vs imperative

Most operations on Kubernetes are declarative — you describe end state, not steps:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: app
        image: myapp:v1.0
```

Apply this and the cluster makes it so: 3 Pods running `myapp:v1.0`, labeled `app=web`. Change `replicas` to 5; reapply; the Deployment controller starts 2 more.

There are imperative commands too (`kubectl run`, `kubectl scale`), but production work is declarative. YAML in git; PR review; apply via CI/CD.

### What problem Kubernetes actually solves

The pre-Kubernetes problem:

- "Container X needs to run on machine Y."
- "If machine Y dies, restart container X on machine Z."
- "When traffic grows, run more copies of container X."
- "Containers X and W need to find each other on the network."
- "Container X needs persistent storage that follows it when restarted."

Solving these individually is a lot of bespoke automation. Kubernetes provides one consistent way to express all of it. The investment is real, but for the right workloads it pays back.

### When Kubernetes is overkill

Kubernetes is not always the right tool. It's overkill for:

- **Single-container apps**: just run the container on a VM, or use App Runner / Cloud Run / Fargate.
- **Truly small teams without operational appetite**: K8s adds a meaningful operational burden.
- **Hobby projects**: PaaS (Render, Fly, Vercel) is faster.
- **Single-region simple deployments**: managed services often suffice.

Reach for Kubernetes when:

- Multiple services that need to interact.
- Variable scale that benefits from orchestration.
- Multi-environment portability (cloud-to-cloud, cloud-to-on-prem).
- Existing Kubernetes expertise on the team.
- Specific patterns that need K8s primitives (operators, CRDs, complex scheduling).

For greenfield AWS-only with no existing K8s investment, ECS Fargate is often a better default. The "Kubernetes is the right answer" reflex from conferences isn't always right for your specific situation.

### Why Kubernetes is hard

The complexity isn't accidental:

- **Distributed system**: many moving parts, all asynchronous.
- **Many abstractions**: Pods, ReplicaSets, Deployments, Services, Endpoints, Ingress, NetworkPolicy, ServiceAccount, Role, RoleBinding... dozens of concepts.
- **Pluggable everywhere**: CNI for networking, CSI for storage, CRI for runtime, scheduler extensions, admission controllers.
- **Ecosystem churn**: Kubernetes itself moves fast; the surrounding ecosystem moves faster.

The learning curve is real. Plan for months of team investment if adopting Kubernetes from scratch.

### Managed vs self-managed

Most teams should use a managed Kubernetes service:

- **AWS EKS, Google GKE, Azure AKS**: managed control plane; you manage workloads.
- **Self-managed (kubeadm, kops)**: manage everything; higher operational burden, more control.

The control plane is the operationally painful part — running etcd reliably, upgrading the API server, handling certificates. Managed services do this for $0.10-0.15/hour per cluster. Worth it for the vast majority of teams.

Self-managed makes sense for: on-prem, air-gapped environments, very specific configurations, or teams that genuinely have the expertise and resources.

### The Kubernetes API

The API is the contract. Everything in Kubernetes is a Kubernetes object — represented as JSON/YAML, accessible via REST API, watchable for changes. You can extend the API with Custom Resource Definitions (CRDs) to define your own object types.

This API-first design is what enables the ecosystem: Helm, kustomize, ArgoCD, operators, service meshes, CI/CD integrations — they all talk to the same API.

### What you actually run on it

The workloads people run on Kubernetes:

- **Web apps / APIs**: stateless backends behind load balancers.
- **Microservices**: many small services, often event-driven.
- **Background workers**: queue consumers, batch processors.
- **Stateful services**: databases (sometimes), caches, message brokers (with caution).
- **Data pipelines**: Spark, Airflow on Kubernetes.
- **ML workloads**: training and inference, often with operators (Kubeflow).
- **Internal platforms**: companies building their own PaaS on K8s.

For each, K8s provides primitives. The art is composing them correctly for your specific workload.

### What you don't typically run

Things that fit poorly on Kubernetes:

- **Single-instance critical databases**: K8s' replacement model conflicts with database durability assumptions. Many teams keep databases on managed services (RDS, Cloud SQL) and connect from K8s.
- **Latency-critical kernel-level work**: K8s adds overhead.
- **Workloads that need very specific OS configuration**: containers limit some kernel-level flexibility.

For data-plane-heavy workloads (high-traffic load balancers, network appliances), specialized solutions often beat K8s.

### The Kubernetes "platform"

K8s by itself is a starting point. Real production deployments add:

- **Service mesh** (Istio, Linkerd) for advanced networking.
- **GitOps** (ArgoCD, Flux) for deployment.
- **Observability** stack (Prometheus, Grafana, Loki, Tempo).
- **Security** scanners (Trivy, Falco).
- **Cost management** (Kubecost).
- **Custom operators** for domain-specific automation.

These additions are what makes K8s genuinely productive — and what makes it heavy. A bare K8s cluster is foundation; the platform on top is where the value lives.

### kubectl basics

The CLI:

```bash
kubectl get pods                  # list pods
kubectl describe pod web-abc      # details
kubectl logs web-abc              # logs
kubectl apply -f deployment.yaml  # apply YAML
kubectl delete -f deployment.yaml # remove
kubectl exec -it web-abc -- bash  # shell into pod
kubectl port-forward web-abc 8080:80  # tunnel
```

Most day-to-day Kubernetes work happens through kubectl + YAML in git. Once you're past learning, it becomes routine.

### Versioning

Kubernetes releases new versions ~3 times per year. Each version is supported for ~1 year. Clusters need regular upgrades.

API versions evolve: alpha → beta → stable. Breaking changes happen at version boundaries. Managed services handle most of this, but YAML you wrote for v1.20 may need updating for v1.32.

Plan for upgrades as routine operational work, not surprise projects.

### Common misconceptions

A few patterns to disabuse yourself of early:

- **"K8s manages our infrastructure"**: K8s manages workloads on infrastructure you (or your cloud) provide. Not the same.
- **"K8s makes things scalable"**: K8s gives you scaling primitives. Whether your app scales depends on your app's design.
- **"K8s is cloud-agnostic"**: K8s is portable in theory, but storage classes, load balancers, IAM integration are cloud-specific. Real portability requires deliberate effort.
- **"K8s reduces operational work"**: it shifts work. The cluster itself needs operations. The total ops burden may not decrease for small teams.

### The honest take

Kubernetes is powerful when you need its capabilities and have the team to operate it. It's overkill for many simpler workloads. Choosing it because it's industry-default without honestly evaluating your needs is a common mistake.

For teams that have decided K8s is right: invest in fundamentals. Understand the control loop, the objects, kubectl, YAML. The rest of the ecosystem builds on these basics.

## Three real-world scenarios

**Scenario 1: A microservices startup chooses K8s.**
Team has K8s experience. Many services need to interact. Variable traffic. They use EKS, deploy services via Helm charts. Operational burden is real but manageable given the team's experience. K8s pays back in consistency across services.

**Scenario 2: A solo developer puts a side project on K8s.**
Spent two weekends getting a basic cluster running. Realized the side project would have been deployed in 20 minutes on a VPS or Fly.io. K8s was overkill. Migrated. Now spends weekends on the actual project.

**Scenario 3: A bank migrates from VMs to K8s.**
Large enterprise, many teams, heterogeneous workloads. K8s provides consistent platform; multi-year migration. Operational burden is significant but justified by team size and workload diversity. Built an internal platform team to operate the cluster fleet.

## Common mistakes to avoid

- **Choosing K8s because of conference talks** without evaluating fit.
- **Self-managing the control plane** to "save money" — usually worse total cost.
- **No team investment** in K8s fundamentals.
- **Treating K8s as cloud-agnostic** without testing portability.
- **Putting critical databases on K8s** without strong reasons.
- **Ignoring the platform** (observability, security, GitOps) — K8s alone isn't enough.

## Read more

- Kubernetes official docs (kubernetes.io).
- *Kubernetes Up & Running* by Brendan Burns et al.
- *Kubernetes Patterns* by Bilgin Ibryam and Roland Huss.
- CNCF Cloud Native Landscape (landscape.cncf.io).

## Summary

- **Kubernetes** = declarative API + controllers + container orchestration.
- **You declare desired state; controllers reconcile toward it.**
- **Control plane + nodes**: API server, scheduler, controllers, etcd; kubelet + runtime + proxy.
- **kubectl + YAML** is the daily interface.
- **Use managed K8s** (EKS, GKE, AKS) unless you have specific reasons not to.
- **Right tool for the right job**: K8s for multi-service / variable-scale; simpler PaaS for simpler workloads.
- **Real K8s deployments** include service mesh, GitOps, observability, security — the platform around K8s.

Next: the control loop and controllers.
