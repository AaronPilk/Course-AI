---
module: 2
position: 3
title: "StatefulSets and DaemonSets"
objective: "Handle stateful workloads and per-node services."
estimated_minutes: 8
---

# StatefulSets and DaemonSets

## The puzzle

Deployments work great for stateless workloads — each Pod is interchangeable. But databases need stable identities, persistent storage tied to specific replicas, and ordered startup. And some workloads (log shippers, monitoring agents) need to run exactly one Pod per Node. Kubernetes has dedicated controllers for these cases.

## The simple version

**StatefulSet**: like a Deployment but each Pod has:

- A stable name (`db-0`, `db-1`, `db-2`).
- Stable network identity (DNS name).
- Its own persistent volume that follows the Pod across restarts.
- Ordered creation, scaling, and deletion.

Use for: databases, message brokers, anything where Pods aren't interchangeable.

**DaemonSet**: ensures one Pod runs on every (or selected) Node.

- Log shippers (Fluentd, Vector).
- Monitoring agents (node-exporter, Datadog agent).
- CNI components, kube-proxy.
- Storage drivers.

Use for: per-Node infrastructure.

For most application teams, you mostly write Deployments + Services. StatefulSets and DaemonSets show up for specific use cases.

## The technical version

### StatefulSet basics

A StatefulSet spec looks similar to a Deployment but adds:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: db                # headless Service for DNS
  replicas: 3
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
      - name: postgres
        image: postgres:16
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: gp3
      resources:
        requests:
          storage: 50Gi
```

Three replicas produces three Pods: `db-0`, `db-1`, `db-2`. Each gets its own PVC: `data-db-0`, `data-db-1`, `data-db-2`. The PVCs persist independently of the Pods — if `db-1` is deleted and recreated, it gets `data-db-1` back.

### Stable network identity

A StatefulSet pairs with a headless Service (`clusterIP: None`):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: db
spec:
  clusterIP: None
  selector:
    app: db
  ports:
  - port: 5432
```

This gives each Pod a stable DNS name:

- `db-0.db.namespace.svc.cluster.local`
- `db-1.db.namespace.svc.cluster.local`
- `db-2.db.namespace.svc.cluster.local`

Applications connecting to a specific replica (e.g., always to primary) can use stable DNS. Without StatefulSet + headless Service, you can't address individual replicas reliably.

### Ordered operations

StatefulSet operations are ordinal:

- **Scale up**: create Pods 0, 1, 2 in order; each must be Ready before the next.
- **Scale down**: terminate Pods N-1, N-2, ... in reverse.
- **Rolling update**: update Pods in reverse order (highest ordinal first).

This ordering matters for systems with leader election or peer discovery — the cluster forms incrementally and predictably.

### When to use StatefulSet

Good fits:

- **Self-managed databases** on K8s: Postgres, MySQL with replication, MongoDB.
- **Distributed systems with peers**: Kafka brokers, Elasticsearch nodes, Cassandra rings.
- **Anything where each replica has identity** (sharding key, role).

Honest take: many teams run databases outside Kubernetes (RDS, Cloud SQL) and use K8s only for stateless services. Running databases on K8s requires sophisticated operators or careful manual operation. For simple databases at moderate scale, managed services are usually better. For complex distributed systems (Kafka, Elasticsearch, cockroachdb) where you want self-management, StatefulSets + operators are the right tool.

### DaemonSet basics

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      containers:
      - name: fluentd
        image: fluentd:v1.16
        volumeMounts:
        - name: varlog
          mountPath: /var/log
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
```

This DaemonSet runs one Fluentd Pod per Node. When new Nodes join, a Pod is automatically created on them. When Nodes leave, their Pods are removed.

### Where DaemonSets fit

Common DaemonSet workloads:

- **Log forwarders**: Fluentd, Vector, Promtail collect logs from each Node.
- **Metrics agents**: Prometheus node-exporter, Datadog agent, CloudWatch agent.
- **CNI and networking**: Calico, Cilium, Weave run as DaemonSets.
- **Storage**: CSI drivers, Rook agents.
- **Security**: Falco, runtime security scanners.

For each, "one per Node" is correct. They're infrastructure layers most application teams don't directly manage — but you'll see them in any production cluster.

### Selecting which Nodes

By default, DaemonSets run on every Node. Use `nodeSelector` or `affinity` to restrict:

```yaml
spec:
  template:
    spec:
      nodeSelector:
        node-role: gpu-worker     # only on GPU nodes
```

Or use taints + tolerations: by default Pods don't schedule on tainted Nodes; a DaemonSet with the right toleration runs on them. Often used for control plane Nodes vs worker Nodes.

### DaemonSet updates

Like Deployments, DaemonSets support rolling updates:

```yaml
spec:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
```

Pods are updated one Node at a time by default. Set `maxUnavailable` higher for faster rollouts at the cost of more concurrent disruption.

For DaemonSets running critical components (CNI, kube-proxy), be conservative with rollouts. A broken CNI Pod can take down all Pod-to-Pod networking on that Node.

### StatefulSet vs Deployment for "stateful-ish" workloads

A common confusion: workloads with persistent data but not strict identity requirements. Examples: a cache server with a local disk that doesn't need to be the same instance after restart.

You can:

- **Use Deployment with a PersistentVolumeClaim**: simpler. But the PVC needs to be ReadWriteMany (shared) — and if you have multiple replicas, they all share the same storage.
- **Use StatefulSet with volumeClaimTemplates**: each replica gets its own storage; identity is preserved.

For genuinely stateful per-replica storage, StatefulSet. For shared storage or stateless-with-storage, Deployment.

### StatefulSet pitfalls

A few common issues:

**Can't easily change PVC size**: increasing storageClassName allows volume expansion, but it's a manual flow.

**Slow rolling updates**: ordered updates one Pod at a time can be slow for large StatefulSets. Consider partitioned updates if appropriate.

**Resurrection of bad Pods**: if a Pod's PVC is corrupt, the StatefulSet keeps recreating it with the same corrupt data. Manual intervention to delete the PVC.

**Headless Service required**: without it, no stable DNS. Easy to forget.

**Operators for production**: most production-grade StatefulSet usage is via operators (Strimzi for Kafka, Elastic operator for Elasticsearch). Don't hand-roll StatefulSets for complex systems if a good operator exists.

### Database operators

For self-managed databases on K8s, use a battle-tested operator:

- **Postgres**: Zalando, CrunchyData, CloudNativePG.
- **MySQL**: Oracle's MySQL Operator, Percona's.
- **MongoDB**: MongoDB Community Operator.
- **Redis**: Redis Operator, Spotahome.
- **Kafka**: Strimzi.
- **Elasticsearch**: Elastic's official operator.

Operators encode operational knowledge: failover, backups, upgrades, scaling. Don't hand-roll database deployment unless you have unique requirements.

The bigger question is whether to run databases on K8s at all. For most teams, managed databases (RDS, Cloud SQL, Aurora) are still the right answer. K8s databases are for: multi-cloud portability, very specific configurations, or teams with strong K8s + database operational expertise.

### DaemonSet alternatives

For some per-Node needs, alternatives exist:

- **Node-level systemd services**: pre-K8s pattern for log forwarders. Less integrated; more reliable.
- **Cloud-native agents**: AWS managed log/metric agents that integrate with cloud services without DaemonSets.
- **Sidecar containers**: per-Pod (not per-Node) helpers; useful when you only care about specific Pods.

DaemonSet is the K8s-native way; cloud-native alternatives sometimes simpler depending on situation.

### Combining patterns

A typical production cluster has all four:

- **Many Deployments**: stateless app services.
- **A few StatefulSets**: data stores, queues, brokers.
- **Several DaemonSets**: log forwarding, metrics, security, CNI.
- **Some Jobs / CronJobs**: batch work (next lesson).

Each pattern fits its workload type. Knowing which to reach for is the skill.

### Real-world: should you put databases on Kubernetes?

A frequent debate. Considerations:

**Pro K8s databases**:

- Unified platform for everything.
- Consistent observability and security.
- Operators automate operations.
- Portable across clouds and on-prem.

**Against**:

- Managed databases (RDS, etc.) are highly engineered.
- K8s database operations require K8s + database expertise.
- StatefulSet failover, backup, restore are non-trivial.
- Performance: containers add small overhead; storage is more complex.
- Maturity gap: managed services have decades of operational refinement.

For most teams in 2026: managed databases. K8s databases for specific reasons (portability, custom configurations, internal platforms). The "everything on K8s including databases" position is more popular at conferences than appropriate in practice.

## Three real-world scenarios

**Scenario 1: Self-managing Postgres.**
Team standardized on K8s and decided to run Postgres there using CloudNativePG operator. The operator handles failover, backups, point-in-time recovery, replica management. Setup took weeks; ongoing operations are smoother than they would have been hand-rolled. Worth it given their multi-cloud requirements. For an AWS-only team, RDS would have been simpler.

**Scenario 2: Per-Node log shipping.**
A DaemonSet runs Fluentd on every Node. Fluentd tails container logs and ships to Elasticsearch. New Nodes automatically get Fluentd. No manual configuration per Node. When migrating clusters, the DaemonSet config moves with the cluster spec.

**Scenario 3: StatefulSet update breaks order.**
A StatefulSet update partially completed when one of the Pods got stuck (resource issues). Subsequent Pods couldn't update because the rolling update is ordered. Fixed by addressing the root cause for the stuck Pod; rolling update resumed. The ordered behavior catches issues early — better than silently updating broken instances — but adds operational friction.

## Common mistakes to avoid

- **Running stateful workloads with Deployment** when you need per-replica identity.
- **Hand-rolling StatefulSets** for complex databases instead of using operators.
- **No headless Service** for StatefulSets — no stable DNS.
- **DaemonSet without tolerations** for tainted Nodes — gaps in coverage.
- **Putting databases on K8s** without strong reasons — managed services usually win.

## Read more

- Kubernetes docs: "StatefulSet" and "DaemonSet" concepts.
- CloudNativePG documentation.
- Strimzi documentation (Kafka on K8s).
- *Kubernetes Patterns* — workload patterns.

## Summary

- **StatefulSet** for workloads needing stable identity, ordered operations, per-replica storage.
- **DaemonSet** for one-Pod-per-Node infrastructure.
- **StatefulSet needs headless Service** for stable DNS.
- **DaemonSets handle Node lifecycle** — auto-add/remove with cluster changes.
- **Operators encode operational knowledge** for complex StatefulSet workloads.
- **Most production K8s clusters** have all four (Deployment, StatefulSet, DaemonSet, Job).
- **Databases on K8s**: real choice; managed services often still better.

Next: Jobs, CronJobs, ConfigMaps, Secrets.
