---
module: 3
position: 2
title: "Services — ClusterIP, NodePort, LoadBalancer"
objective: "Expose workloads correctly."
estimated_minutes: 8
---

# Services — ClusterIP, NodePort, LoadBalancer

## The puzzle

Pods come and go. Their IPs change. So how does anything reliably reach them? The answer is the Service — a stable network abstraction in front of a set of Pods. Services are how every microservice on Kubernetes is addressed, and how external traffic eventually finds your workloads.

## The simple version

A Service:

- Has a **stable IP** (or DNS name) that doesn't change.
- Routes traffic to **Pods matching a selector**.
- **Load balances** across all matching healthy Pods.
- Updates automatically as Pods come and go.

Four common Service types:

1. **ClusterIP** (default): internal-only. Reachable from within the cluster. Most service-to-service.
2. **NodePort**: exposes on each Node's IP at a high port. Less common in production.
3. **LoadBalancer**: provisions a cloud load balancer (ALB/NLB on AWS, etc.). For external access.
4. **ExternalName**: DNS alias for an external service.

Plus headless Services (clusterIP: None) for stateful sets.

## The technical version

### ClusterIP — the default

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 8080
```

Creates a virtual IP (the ClusterIP) accessible only within the cluster. Traffic to `web.namespace.svc.cluster.local:80` (DNS) or the ClusterIP routes to one of the matching Pods on port 8080.

For service-to-service communication within the cluster, ClusterIP is what you use 95% of the time.

### How Service routing actually works

When a Pod sends to a Service's ClusterIP:

1. **kube-proxy** has watched the Service and Endpoints objects.
2. kube-proxy has installed **iptables rules** (or IPVS) on every Node.
3. The packet to ClusterIP hits these rules; gets DNAT'd to one of the backing Pod IPs.
4. Reverse path uses connection tracking.

This is virtual — there's no actual server at the ClusterIP. It's all iptables magic.

Modern alternatives: Cilium replaces kube-proxy with eBPF-based service routing. Faster, more programmable, observable. Default on many new clusters.

### Endpoints and EndpointSlices

The Service has a corresponding **Endpoints** (or newer **EndpointSlice**) object listing the actual Pod IPs and ports backing the Service. The Endpoints controller updates this as Pods become Ready or Not Ready.

```bash
kubectl get endpoints web
kubectl get endpointslice
```

If a Pod's readiness probe fails, it's removed from Endpoints — no more traffic sent to it.

EndpointSlices are newer and scale better than Endpoints for large Services.

### NodePort

Exposes a Service on every Node at a specific port (default range 30000-32767):

```yaml
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080
```

Now `any-node-ip:30080` reaches the Service. Useful for:

- Quick demos / dev clusters.
- When a cloud LB isn't an option.
- Specific routing scenarios.

For production: rarely. LoadBalancer or Ingress is usually better.

### LoadBalancer

Provisions a cloud load balancer pointing at the Service:

```yaml
spec:
  type: LoadBalancer
  ports:
  - port: 443
    targetPort: 8080
```

On EKS: creates an NLB (or ALB with the AWS Load Balancer Controller). On GKE: creates a GCP load balancer. On AKS: Azure load balancer.

The cloud LB has a public IP/DNS. External traffic to that IP routes through the LB to Service Pods.

Limitations:

- One LB per Service can be expensive ($16+/month each).
- Layer 4 routing (NLB) — no path-based routing.
- For HTTP layer 7 features (path routing, host routing, TLS termination at LB), Ingress is better.

### Ingress (preview)

Layer 7 HTTP routing. Multiple paths/hosts → one or more Services → Pods. Backed by an Ingress controller (NGINX, Traefik, AWS LB Controller). Covered in detail in the next lesson.

Use Ingress (one load balancer for many Services) instead of one LoadBalancer Service per microservice.

### Service selector and labels

The Service's `selector` finds Pods by label. Critical to get right:

```yaml
spec:
  selector:
    app: web              # matches Pods with this label
    tier: backend
```

The Endpoints controller looks at all Pods, filters by selector match + Pod is Ready, and updates Endpoints.

Common bug: Deployment's Pod template has different labels than the Service expects. Service has no Endpoints; nothing works.

### Service DNS

CoreDNS creates DNS records for Services:

- `service.namespace.svc.cluster.local` → Service ClusterIP.
- `service.namespace.svc` (short, with cluster's search domain).
- `service` (within same namespace).

For headless Services, individual Pod DNS:

- `pod-0.service.namespace.svc.cluster.local` → Pod IP.

The DNS pattern is consistent and reliable. Application code uses these names, not IPs.

### Cross-namespace Services

Services in one namespace can be reached from another by FQDN:

```
api.production.svc.cluster.local
```

By default, Services in different namespaces can talk to each other. NetworkPolicies (covered later) can restrict this.

### externalTrafficPolicy

When external traffic enters a Service:

- **Cluster** (default): traffic may be forwarded between Nodes; source IP might be lost.
- **Local**: traffic only goes to Pods on the same Node where it arrived; source IP preserved.

For services needing source IP: set `externalTrafficPolicy: Local`. Trade: if no local Pod, the request is dropped — be careful about scheduling.

### Service mesh interplay

Service meshes (Istio, Linkerd) typically interact with Services:

- Service mesh proxies (Envoy sidecars or eBPF agents) intercept traffic.
- Provide advanced routing (canary, retry, mTLS) on top of K8s Services.
- Use Service definitions for discovery.

Service mesh isn't required for K8s. Plain Services + Ingress handles most workloads. Add a service mesh when you need its specific features.

### Common Service patterns

**Web app**: ClusterIP Service in front of app Deployment; Ingress routes external traffic to the Service.

**Database connection**: app's ClusterIP service connects to a database Service (or external endpoint via ExternalName).

**Internal API**: ClusterIP, accessed only by other Pods.

**Public API**: NodePort or LoadBalancer + Ingress.

**Headless for stateful**: clusterIP: None for direct Pod addressing.

### ExternalName

Maps a Service to an external DNS name:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: legacy-db
spec:
  type: ExternalName
  externalName: db.example.com
```

`legacy-db.namespace.svc.cluster.local` resolves to `db.example.com`. Useful for: external services, gradual migration, abstracting external endpoints.

### Session affinity

Services don't have session affinity by default — each request hits a random matching Pod. For "sticky sessions":

```yaml
spec:
  sessionAffinity: ClientIP
```

Routes from same client IP to same Pod (with timeout). Used for stateful protocols. Most modern apps don't need this — stateless plus external session store is preferred.

### Service vs DNS-based discovery

Two ways for services to find each other:

1. **Service**: stable virtual IP with kube-proxy routing.
2. **DNS only** (e.g., headless Service): client resolves DNS, picks a Pod IP, connects directly.

For most apps, Services work. For client-side load balancing (gRPC clients, Cassandra clients), DNS-based discovery with direct Pod IPs may be preferred.

### Common Service issues

**Service has no Endpoints**: selector doesn't match Pods or Pods aren't Ready. Check `kubectl get endpoints`.

**Service IP unreachable**: kube-proxy not running on Node, iptables not configured, NetworkPolicy blocking.

**LoadBalancer pending**: cloud provider can't provision LB. Check controller logs (AWS LB Controller, etc.).

**Wrong port**: `targetPort` doesn't match what the container listens on.

**Cross-namespace not working**: use FQDN; check NetworkPolicies.

### Cost considerations

- **ClusterIP**: free.
- **NodePort**: free, no LB cost.
- **LoadBalancer**: $16-30/month per LB on AWS (depending on type). At scale, this adds up.
- **Ingress with one LB for many services**: more economical for many small services.

### Real-world patterns

A typical web app:

```
Internet → ALB (via Ingress) → Service (ClusterIP) → Deployment Pods
                              → Service (ClusterIP) → Deployment Pods (other service)
                              → Service (ClusterIP) → Deployment Pods (other service)
```

One LB, multiple Services, routed by Ingress.

For a fully internal microservice:

```
Caller Pod → Service (ClusterIP) → Callee Pods
```

Just ClusterIP. No external exposure.

## Three real-world scenarios

**Scenario 1: A Service has no endpoints.**
Just created the Service; `kubectl get pods -l app=web` shows running Pods but `kubectl get endpoints web` shows nothing. Investigation: Deployment Pods have labels `app: web, tier: backend`, but Service selector is `app: web, tier: api`. Mismatch — no Pods match. Fix: align labels. Service now routes correctly.

**Scenario 2: One LB per microservice gets expensive.**
A team creates a LoadBalancer Service per microservice — 50 services, 50 ALBs at ~$25/month each = $1250/month for LBs. Fix: deploy one Ingress controller (NGINX, ALB) with one LB, route paths/hosts to different Services. Saves $1000+/month with minimal effort.

**Scenario 3: gRPC client load balancing not working.**
gRPC client sends repeated requests to a Service. They all go to the same Pod. Why: gRPC uses HTTP/2, which multiplexes requests over a single connection. The Service routes the connection to one Pod once; subsequent requests reuse that connection. Fix: client-side load balancing — gRPC client resolves headless Service DNS to all Pod IPs and load balances itself. Or use a service mesh that handles this at the proxy.

## Common mistakes to avoid

- **Selector/label mismatch**: no endpoints, Service useless.
- **Wrong targetPort**: traffic goes to nothing.
- **LoadBalancer per microservice**: expensive at scale; use Ingress.
- **NodePort in production**: rarely the right choice.
- **HTTP/2 (gRPC) without client-side LB**: poor distribution.
- **Cross-namespace without FQDN**: name resolution fails.

## Read more

- Kubernetes docs: "Service" concept.
- AWS Load Balancer Controller documentation.
- "Service vs Ingress" comparison guides.

## Summary

- **Service**: stable address for a set of Pods.
- **ClusterIP**: internal-only; the default; most service-to-service.
- **NodePort**: expose on Node IPs; rarely production.
- **LoadBalancer**: cloud load balancer per Service; $$$ at scale.
- **ExternalName**: DNS alias for external service.
- **kube-proxy** (or eBPF) implements Service routing.
- **CoreDNS** provides DNS for Services.
- **One LB + Ingress** beats one LB per Service for many services.

Next: Ingress and the gateway API.
