---
module: 3
position: 4
title: "NetworkPolicies and DNS"
objective: "Lock down traffic and resolve names."
estimated_minutes: 7
---

# NetworkPolicies and DNS

## The puzzle

By default, every Pod in a Kubernetes cluster can reach every other Pod. That's convenient for development and terrible for security — a compromised Pod has lateral movement to the entire cluster. NetworkPolicies let you restrict this. They're K8s' equivalent of security groups: declare what's allowed; deny everything else.

DNS is the other half of the networking story. CoreDNS resolves Service names to ClusterIPs. Knowing how it works and how to tune it matters more than people expect.

## The simple version

**NetworkPolicy**: declare which Pods can talk to which other Pods (and to/from external endpoints). Without a NetworkPolicy, all traffic is allowed. With one, only declared traffic is allowed.

**DNS in K8s**:

- CoreDNS runs as a Deployment in `kube-system`.
- Pods are configured to use CoreDNS for resolution.
- Service names resolve to ClusterIPs.
- External domains forward to upstream DNS.

Best practices: deny-by-default NetworkPolicies; cache DNS aggressively (NodeLocal DNS Cache); tune `ndots` and search domains.

## The technical version

### NetworkPolicy basics

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: web
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: db
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - port: 53
      protocol: UDP
```

This policy: "Pods labeled `app: api` accept incoming traffic only from `app: web` on port 8080, and can only initiate outgoing traffic to `app: db` on 5432 and DNS in kube-system."

Once any NetworkPolicy selects a Pod, all traffic not explicitly allowed is denied.

### Default deny

Best practice: start with deny-all, then explicitly allow needed traffic.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: production
spec:
  podSelector: {}        # matches all Pods in namespace
  policyTypes:
  - Ingress
  - Egress
```

No `ingress` or `egress` rules means no traffic allowed. Add specific Allow policies on top to permit what's needed.

This forces explicit declaration of every allowed flow — more secure and more documented.

### NetworkPolicy support

The Kubernetes API defines NetworkPolicy, but enforcement depends on the CNI:

- **Calico**: full support.
- **Cilium**: full support, plus L7 (HTTP-aware) policies via eBPF.
- **AWS VPC CNI**: NetworkPolicy support via separate add-on (Calico-based or VPC CNI's own implementation).
- **Flannel**: no support by default; pair with Calico.

If your CNI doesn't enforce NetworkPolicies, applying them does nothing. Verify before relying on them.

### Common policy patterns

**Allow same namespace only**:
```yaml
ingress:
- from:
  - namespaceSelector:
      matchLabels:
        kubernetes.io/metadata.name: production
```

**Allow specific service-to-service**:
```yaml
ingress:
- from:
  - podSelector:
      matchLabels:
        app: frontend
  ports:
  - port: 8080
```

**Allow DNS**:
```yaml
egress:
- to:
  - namespaceSelector:
      matchLabels:
        name: kube-system
  ports:
  - port: 53
    protocol: UDP
  - port: 53
    protocol: TCP
```

Forgetting to allow DNS is a common bug — Pods can't resolve any names with default-deny.

**Allow external HTTPS**:
```yaml
egress:
- to:
  - ipBlock:
      cidr: 0.0.0.0/0
      except:
      - 10.0.0.0/8
      - 169.254.169.254/32
  ports:
  - port: 443
```

External HTTPS allowed; internal cluster traffic and AWS metadata service blocked.

### L4 vs L7 policies

Standard NetworkPolicy is L4 (TCP/UDP ports and IPs). For L7 (HTTP method, path, headers), you need a service mesh (Istio, Linkerd) or Cilium's eBPF L7 policies.

L4 covers most needs. L7 for fine-grained service-to-service auth.

### Egress filtering and security

Restricting egress is one of the strongest defenses against data exfiltration:

- Allow only specific outbound destinations (AWS service endpoints, known third-party APIs).
- Block direct internet outbound except where required.
- Block AWS instance metadata endpoint from application Pods (use IRSA instead).

A compromised Pod with restrictive egress can't reach attacker-controlled endpoints. Significantly limits damage.

### DNS in Kubernetes

CoreDNS is the cluster DNS:

- Runs as a Deployment in `kube-system`.
- Pods' `/etc/resolv.conf` points at CoreDNS via `kube-dns` Service.
- Each Pod has search domains (`<namespace>.svc.cluster.local`, `svc.cluster.local`, `cluster.local`, plus host) and `ndots: 5`.

Lookups:

- `web` → tries `web.<namespace>.svc.cluster.local`, then other search domains.
- `web.api.svc.cluster.local` → direct lookup (5 or more dots).
- `example.com` → external lookup; forwarded to upstream DNS.

### ndots and search domains

`ndots: 5` means "if the name has fewer than 5 dots, try search domains first." This is why short names work within a namespace.

But it also means `example.com` (2 dots) is tried against all search domains before being recognized as external — extra round trips, extra latency.

Tuning:

```yaml
spec:
  dnsConfig:
    options:
    - name: ndots
      value: "2"
```

Set ndots to 2 or 1 for Pods that mostly call external services. Reduces unnecessary lookups.

### NodeLocal DNS Cache

CoreDNS at the cluster level can become a bottleneck. NodeLocal DNS Cache runs a CoreDNS Pod on every Node (DaemonSet) that caches lookups locally. Pods on that Node query the local cache; if it misses, the local cache queries cluster CoreDNS.

Benefits:

- Most lookups satisfied locally — sub-millisecond.
- Reduced load on cluster CoreDNS.
- Less inter-Node DNS traffic.

For any cluster with non-trivial DNS load (microservices doing service-to-service calls), NodeLocal DNS Cache is standard.

### DNS issues to watch

**High DNS latency**: CoreDNS overloaded; ndots search amplification; cluster-wide DNS resolution. Fixes: NodeLocal DNS Cache, ndots tuning, scaling CoreDNS replicas.

**External DNS slow**: upstream resolver slow; CoreDNS forward configuration not optimal. Tune forward block in CoreDNS config.

**Resolution failing**: NetworkPolicy blocking DNS (forgot to allow UDP/TCP 53 to kube-system); CoreDNS Pods down; misconfigured search domains.

**ndots-related round trips**: Pods making many short-name lookups for external services. Tune ndots per Pod.

### Custom DNS

CoreDNS configuration is itself a ConfigMap. You can:

- Add custom domains (route to internal DNS servers).
- Configure forwarders (different upstreams per domain).
- Enable plugins (caching, rewriting, etc.).

For most clusters, defaults are fine. Customization for specific multi-domain setups.

### Combining NetworkPolicy and DNS

A common gotcha: deny-all + forget to allow DNS = nothing works.

A minimum "default deny but DNS works" template:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
spec:
  podSelector: {}
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: kube-system
    ports:
    - port: 53
      protocol: UDP
    - port: 53
      protocol: TCP
```

Apply this in every namespace where you use deny-all policies. Otherwise: mysterious "service not found" errors.

### Auditing and observability

For NetworkPolicy:

- **Cilium Hubble**: real-time observability for Cilium-managed policies.
- **Calico Enterprise**: policy auditing for Calico.
- **Generic**: cluster logs of denied connections.

Test policies in staging before applying to production. A bad policy can cut off Pod-to-Pod communication unexpectedly.

### Real-world deployment pattern

For a production cluster:

1. **Default-deny NetworkPolicy** per namespace (deny ingress and egress).
2. **Allow-DNS policy** so DNS resolution works.
3. **Specific allow policies** for each service-to-service flow.
4. **External egress policy** for permitted internet destinations.
5. **Periodic review** to remove unused rules.

This is operationally heavier than open networking but dramatically more secure. Worth it for production workloads handling sensitive data.

## Three real-world scenarios

**Scenario 1: Implementing default-deny in production.**
Team rolls out default-deny NetworkPolicies. Half the services break — they were silently relying on cross-namespace traffic that's no longer allowed. Fix: roll out gradually per namespace, allow expected flows, monitor, iterate. After two weeks of tuning, all services work and lateral movement is blocked. The pain is real but one-time; the security benefit is permanent.

**Scenario 2: DNS latency hurting microservice performance.**
Microservices doing many internal calls show DNS lookup as a latency hotspot. Investigation: every external service call (`api.stripe.com`) was going through all search domains first due to ndots: 5. Fix: deploy NodeLocal DNS Cache + tune ndots to 2 in critical Pods. Sub-millisecond DNS lookups for cached entries; latency p99 drops 50ms.

**Scenario 3: Compromised Pod attempting lateral movement.**
A vulnerability in a public-facing service is exploited. Without NetworkPolicies, the attacker has access to all Pods in the cluster — quick path to data exfiltration. With deny-all + explicit allows, the compromised Pod can only reach its declared dependencies (specific other services on specific ports). Damage contained; faster containment; clear blast radius.

## Common mistakes to avoid

- **No NetworkPolicies at all** — wide lateral movement on compromise.
- **Forgetting to allow DNS** — services can't resolve names.
- **CNI doesn't support policies** — applying them does nothing.
- **No NodeLocal DNS Cache** — CoreDNS bottlenecks.
- **Default ndots: 5** for external-heavy workloads — extra DNS round trips.
- **NetworkPolicies in dev only** — production exposure remains.

## Read more

- Kubernetes docs: "Network Policies" concept.
- Calico documentation for advanced policy examples.
- Cilium documentation for L7 policies.
- NodeLocal DNS Cache documentation.

## Summary

- **NetworkPolicies** restrict Pod-to-Pod and Pod-to-external traffic.
- **Default-deny + explicit allow** is the secure pattern.
- **CNI must enforce policies** — verify yours does.
- **DNS via CoreDNS**; tune ndots and use NodeLocal DNS Cache.
- **Always allow DNS** in deny-all setups.
- **L7 policies** require service mesh or Cilium eBPF.
- **Egress restrictions** are strong defense against data exfiltration.

That wraps Module 3. Next: storage, security, and configuration.
