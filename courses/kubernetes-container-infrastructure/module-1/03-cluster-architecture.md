---
module: 1
position: 3
title: "Cluster architecture — control plane and nodes"
objective: "Know which component does what."
estimated_minutes: 7
---

# Cluster architecture — control plane and nodes

## The puzzle

A Kubernetes cluster has many running components. When something breaks, you need to know which one is responsible. The API server, etcd, scheduler, controller manager, kubelet, kube-proxy, container runtime — each does a specific job. Knowing the responsibilities makes debugging tractable instead of mysterious.

## The simple version

A cluster has two parts:

**Control plane** (the brain):
- **API server**: receives all requests; the front door.
- **etcd**: the database; stores cluster state.
- **Scheduler**: decides where new Pods run.
- **Controller manager**: runs the built-in controllers.
- **Cloud controller manager**: cloud-specific integrations.

**Nodes** (the workers):
- **Kubelet**: agent that runs on every node; manages containers.
- **Container runtime** (containerd, CRI-O): the thing that actually runs containers.
- **Kube-proxy**: handles Service networking on the node.

You interact with the cluster via kubectl, which talks to the API server. Everything flows through there.

## The technical version

### API server (kube-apiserver)

The front door of the cluster. All operations — from kubectl, controllers, kubelets, other clients — go through the API server. It:

- Authenticates and authorizes every request.
- Validates payloads.
- Persists state to etcd.
- Serves watch streams to clients.
- Coordinates admission controllers and webhooks that mutate/validate objects before persistence.

The API server is stateless — multiple replicas can run behind a load balancer for HA. State lives in etcd.

If the API server is down, you can't make changes to the cluster. Existing workloads keep running because the kubelet and controllers have cached state, but you can't intervene.

### etcd

A distributed key-value store. Stores all cluster state — every object, every status update, every config change.

Properties:

- **Strongly consistent** via Raft consensus.
- **Highly available** with 3, 5, or 7 nodes (odd numbers for quorum).
- **Fast for reads, slower for writes** as the cluster grows.
- **Backed up regularly** in production (it's the source of truth).

etcd is the single most critical component. Lose it and you lose the cluster's state. Managed Kubernetes services run etcd HA and back it up. Self-managed clusters need to engineer this carefully.

### Scheduler (kube-scheduler)

Watches for Pods with no Node assigned. For each, finds a suitable Node based on:

**Filtering** (which Nodes are eligible?):

- Enough CPU/memory requested.
- Node has the required labels/selectors.
- Tolerations match Node taints.
- Required volumes are accessible.

**Scoring** (which eligible Node is best?):

- Resource utilization (prefer least-utilized).
- Affinity/anti-affinity rules.
- Topology spread.
- Image already on the Node (faster start).

Picks the highest-scoring Node and writes `spec.nodeName` back. The kubelet on that Node takes over.

The default scheduler handles most workloads. You can write custom schedulers or extend the default for special needs (machine-learning placement, custom hardware affinity).

### Controller manager (kube-controller-manager)

A single binary running many controllers as goroutines:

- **Deployment controller**: manages ReplicaSets.
- **ReplicaSet controller**: manages Pods.
- **Node controller**: monitors Nodes, marks unreachable ones.
- **Endpoints controller**: builds Service endpoint lists.
- **Service Account controller**: creates default service accounts.
- **TTL controller**: deletes objects past their TTL.
- ...many more.

Each controller is small. The controller manager runs them together for operational simplicity.

### Cloud controller manager

The bridge to cloud-specific features:

- **Node controller**: integrates with cloud APIs to verify Node existence.
- **Service controller**: provisions cloud load balancers for Service type=LoadBalancer.
- **Route controller**: configures cloud network routes.
- **Volume controller**: works with cloud-specific volume plugins.

In AWS EKS, the cloud controller manager creates ALBs for Services, provisions EBS volumes, etc. On-prem K8s typically doesn't have a cloud controller manager (or has a minimal one).

### Kubelet

The agent on every Node. Responsibilities:

- Watch the API for Pods scheduled to this Node.
- Pull container images.
- Tell the container runtime to start/stop containers.
- Run readiness and liveness probes.
- Mount volumes.
- Report Pod status back to the API.
- Manage Node lease (heartbeat).

Kubelet is the bridge between "what the API says should run here" and "what's actually running here."

If kubelet dies on a Node, the Node is marked NotReady after a few minutes. Pods on it are eventually evicted by the Node controller (after grace period) and rescheduled elsewhere.

### Container runtime

The thing that actually runs containers. Modern options:

- **containerd**: most common; lightweight; what Docker uses internally.
- **CRI-O**: alternative; Red Hat's choice; minimal.
- **Docker**: deprecated as a K8s runtime; replaced by containerd.

The Container Runtime Interface (CRI) is the contract. Kubelet speaks CRI; the runtime implements it.

For most clusters, the runtime is invisible — you don't interact with it directly. It just runs containers when the kubelet says to.

### Kube-proxy

Runs on every Node. Handles Service networking — specifically, the virtual IP magic that makes Services work:

- Watches Services and Endpoints.
- Sets up iptables (or IPVS) rules on the Node.
- Routes traffic from `ClusterIP:port` to backing Pod IPs.

You usually don't think about kube-proxy directly. It just makes Services route to Pods. Some modern setups (Cilium, kube-router) replace kube-proxy with eBPF-based alternatives for performance.

### How a Pod becomes a running container

Putting it all together:

1. You `kubectl apply` a Deployment.
2. **API server** validates and stores in **etcd**.
3. **Deployment controller** notices the new Deployment; creates a ReplicaSet.
4. **ReplicaSet controller** notices the new ReplicaSet; creates Pod objects (still virtual — just records in etcd).
5. **Scheduler** notices Pods with no nodeName; assigns each to a Node based on filter/score.
6. **Kubelet** on that Node notices the assigned Pod; pulls the image via the runtime.
7. **Container runtime** pulls the image; creates the container; starts it.
8. **Kubelet** runs health checks; updates Pod status in the API.
9. **Endpoints controller** updates Service endpoints to include the new Pod.
10. **Kube-proxy** updates iptables to route Service traffic to the new Pod.

Each step is one component doing reconciliation. Eleven moving parts to get one container running.

### Networking layers

The networking story is layered:

- **Container Network Interface (CNI) plugin** (Calico, Cilium, Flannel, AWS VPC CNI) assigns IPs to Pods and routes traffic between them.
- **kube-proxy** handles Service routing.
- **CoreDNS** (or kube-dns) provides DNS for Services and Pods.

CNI is plugged in at cluster setup. You usually pick a CNI when creating the cluster and never change it. Cloud-managed clusters use cloud-specific CNIs (AWS VPC CNI in EKS, Azure CNI in AKS).

### Add-ons

A bare K8s cluster usually has add-ons installed:

- **CoreDNS**: cluster DNS.
- **kube-proxy** or replacement.
- **CNI plugin** for networking.
- **Metrics server**: provides resource metrics for HPA.
- **Cluster Autoscaler or Karpenter**: auto-add Nodes.
- **Ingress controller** (NGINX, Traefik, etc.) for HTTP routing.
- **Cert manager** for TLS.
- **CSI drivers** for storage.

Managed services install some of these by default. Others you add explicitly. This is part of what makes a "real" cluster non-trivial.

### Multi-AZ clusters

For HA, control plane nodes span multiple AZs (managed services do this automatically). Worker nodes also distribute across AZs. CNI handles inter-AZ pod networking.

If an AZ goes down:

- Worker Pods on that AZ become unreachable; controllers reschedule them elsewhere.
- API server replicas in other AZs continue serving requests.
- etcd quorum survives if you have 3+ nodes spread across AZs.

Multi-AZ adds some cross-AZ data transfer cost and slight latency. For production, mandatory.

### Cluster sizing

A cluster has limits:

- **Nodes per cluster**: thousands (5000+ for stretched configurations).
- **Pods per node**: 110 default; configurable up to a few hundred on big nodes.
- **Total pods per cluster**: 150,000+ on large clusters.
- **etcd object size limit**: 1 MB per object.

For most workloads, no problem. At scale, you hit specific limits (often etcd size, often Service / Endpoint update rates) and need to architect accordingly.

### Backup and disaster recovery

What to back up:

- **etcd**: state of everything. Critical. Managed services handle this; self-managed clusters need explicit backup.
- **Persistent volumes**: data on PVCs. Backed up at the storage layer (cloud snapshots, Velero, etc.).
- **Cluster configuration**: ideally in git (GitOps).

If etcd is lost without backup: you can rebuild the cluster (apply the git-stored manifests to a new cluster), but state (counters, status, etc.) is lost. Backup is much faster.

### Node lifecycle

Nodes come and go:

- **Cluster Autoscaler**: adds Nodes when Pending Pods need capacity; removes underutilized Nodes.
- **Karpenter** (AWS-specific, newer): smarter Node provisioning based on Pod requirements.
- **Manual scaling**: you add/remove Nodes via ASG or instance management.

When a Node is removed, kubelet drains it (gracefully evicting Pods, which reschedule elsewhere). If the Node dies abruptly (hardware failure, network partition), the Node controller marks it NotReady and evicts after grace period.

### Common operational tasks

For people running clusters:

- **Upgrades**: managed services help; rolling upgrades of control plane and Nodes.
- **Monitoring**: control plane health, etcd metrics, Node resources.
- **Backup**: etcd, persistent volumes.
- **Capacity planning**: predict and provision.
- **Security**: RBAC reviews, image scanning, network policies.

For application teams using a managed cluster, much of this is abstracted away. For platform teams operating the cluster, this is the daily work.

## Three real-world scenarios

**Scenario 1: A Pod's image pull fails.**
`kubectl describe pod` shows "Failed to pull image" — the kubelet's reconciliation step failed. Could be: image doesn't exist (push it), credentials missing (configure imagePullSecrets), network policy blocking registry (fix the network), registry rate-limiting (use a pull-through cache). The Deployment controller already did its job (created the Pod); the kubelet can't make it real. Fix at the kubelet level.

**Scenario 2: Pods stuck Pending across the cluster.**
`kubectl describe` shows "Insufficient cpu" — the scheduler can't find capacity. Either add Nodes (Cluster Autoscaler does this if enabled), reduce Pod requests (over-provisioned), or scale down other workloads. The control plane is doing its job; capacity is the bottleneck.

**Scenario 3: API server overload.**
A custom controller has a bug, polling the API server thousands of times per second. API server latency spikes. Other operations slow down. Fix: identify and stop the bad controller; eventually the API server recovers. Long-term: rate-limit custom controllers, use informers (with caching) instead of raw API calls.

## Common mistakes to avoid

- **Treating etcd as optional**: it's the source of truth.
- **No HA control plane** for production.
- **Manual control plane operation** in self-managed (huge burden).
- **Confusion about which component is responsible** during incidents.
- **Pinning everything to one AZ** in multi-AZ regions.
- **No Cluster Autoscaler** for variable workloads.

## Read more

- Kubernetes official docs: "Cluster Architecture."
- *Kubernetes The Hard Way* (by Kelsey Hightower) — hand-build a cluster to understand.
- CNCF Cloud Native Landscape for the ecosystem.

## Summary

- **Control plane**: API server, etcd, scheduler, controller manager, cloud controller manager.
- **Nodes**: kubelet + runtime + kube-proxy.
- **API server is the front door** for all operations.
- **etcd holds cluster state** — critical, backed up, HA.
- **Scheduler picks Nodes** for Pods.
- **Kubelet manages containers** on each Node.
- **CNI for Pod networking, CoreDNS for DNS, kube-proxy for Services.**
- **Add-ons** make a real cluster (Ingress, cert-manager, monitoring, autoscaler).
- **Use managed K8s** unless you have a specific reason to run the control plane yourself.

Next: when Kubernetes is the right tool.
