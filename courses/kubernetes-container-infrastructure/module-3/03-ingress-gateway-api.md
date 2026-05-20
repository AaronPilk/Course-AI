---
module: 3
position: 3
title: "Ingress and gateway API"
objective: "Route external HTTP traffic into the cluster."
estimated_minutes: 7
---

# Ingress and gateway API

## The puzzle

You have many internal Services. You want external users to reach some of them. Creating a LoadBalancer Service per microservice is expensive and operationally noisy. Ingress provides layer-7 HTTP routing — one cloud load balancer fronts many services with path-based and host-based routing.

## The simple version

An Ingress resource declares:

- **Host names** (e.g., `api.example.com`).
- **Paths** that route to specific Services.
- **TLS configuration** (which certificate covers which host).

An **Ingress controller** (NGINX, AWS Load Balancer Controller, Traefik) reads Ingress resources and configures itself or a cloud load balancer to do the actual routing.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
  annotations:
    kubernetes.io/ingress.class: alb
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: api-v1
            port:
              number: 80
      - path: /v2
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 80
  tls:
  - hosts:
    - api.example.com
    secretName: api-tls
```

One Ingress, multiple Services behind one load balancer. The dominant external-traffic pattern on K8s.

## The technical version

### How Ingress works

Ingress is just a resource — declarative configuration. The actual routing is done by:

1. **Ingress controller**: a Pod (or set of Pods) running an HTTP server.
2. The controller watches Ingress resources.
3. It configures its routing engine (NGINX config, or programmatic ALB rules via AWS LB Controller, etc.).
4. External traffic enters the controller and is routed to backend Services.

Different controllers, different implementations:

- **NGINX Ingress Controller**: NGINX Pods in the cluster; LoadBalancer Service in front.
- **AWS Load Balancer Controller**: provisions ALBs that route directly to Pods (no per-Node hop).
- **Traefik**: lightweight; popular for small clusters and edge.
- **Contour** (Envoy-based): supports modern features.
- **Cilium Gateway**: eBPF-based.

For EKS, AWS Load Balancer Controller is the default choice for production.

### Path types

Ingress supports:

- **Exact**: matches exactly that path.
- **Prefix**: matches path and any sub-path.
- **ImplementationSpecific**: controller-specific (mostly regex).

For most cases, Prefix matching with `/api/`, `/admin/`, etc. is what you want.

### Host-based routing

One Ingress can route multiple hosts:

```yaml
spec:
  rules:
  - host: api.example.com
    http:
      paths: [...]
  - host: admin.example.com
    http:
      paths: [...]
```

`api.example.com` and `admin.example.com` both point to the same load balancer; the controller routes by Host header.

### TLS termination

Ingress typically terminates TLS at the load balancer or controller:

```yaml
tls:
- hosts:
  - api.example.com
  secretName: api-tls
```

The Secret contains the cert and key. Backend traffic to Services is usually HTTP (in-cluster, trusted network). For service mesh setups, mTLS may add encryption between Pods.

### cert-manager

Almost universal pattern: cert-manager automates TLS cert issuance from Let's Encrypt (or other ACME providers):

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: api-tls
spec:
  secretName: api-tls
  dnsNames:
  - api.example.com
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
```

cert-manager handles ACME challenge, issues cert, writes Secret. The Ingress references that Secret. Renewal is automatic.

For internal CAs (corporate or self-signed), cert-manager works there too via Issuer configuration.

### Ingress vs LoadBalancer Service

- **LoadBalancer Service**: one cloud LB per Service. Layer 4. No path-based routing. Best for non-HTTP services or where each service needs its own LB.

- **Ingress + ClusterIP Services**: one cloud LB for many Services. Layer 7. Path and host routing. Better for typical HTTP microservices.

For HTTP/HTTPS workloads with many services, Ingress.

### Annotations

Different controllers support different annotations for configuration:

```yaml
annotations:
  alb.ingress.kubernetes.io/scheme: internet-facing
  alb.ingress.kubernetes.io/target-type: ip
  alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
  alb.ingress.kubernetes.io/ssl-redirect: '443'
  alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:...
```

These are AWS LB Controller specific. NGINX has its own set. Annotations make Ingress feel less portable than the spec suggests — moving from NGINX to AWS LB Controller means rewriting annotations.

### The Gateway API

A newer, more flexible alternative to Ingress. Splits the API into:

- **GatewayClass**: defines a type of gateway (managed by which controller).
- **Gateway**: instance of a GatewayClass; the actual external entrypoint.
- **HTTPRoute** (and others): the routing rules attached to a Gateway.

Benefits over Ingress:

- More expressive routing (header-based, weight-based for canary, etc.).
- Better separation of concerns (cluster admins manage Gateways; app teams manage Routes).
- Less reliance on annotations (typed fields instead).
- Cross-namespace references.

The Gateway API is being adopted by major controllers (Istio, Cilium, NGINX, AWS) but Ingress is still the more common production pattern as of 2026. For new clusters, evaluate Gateway API for new use cases; Ingress is fine for existing patterns.

### Common Ingress patterns

**Public API gateway**:
```
api.example.com/v1/* → api-v1 Service
api.example.com/v2/* → api-v2 Service
api.example.com/auth/* → auth Service
```

One LB, three services, path-based routing.

**Multi-app routing**:
```
www.example.com → frontend Service
api.example.com → api Service
admin.example.com → admin Service
```

One LB, host-based routing.

**Default backend**:
```
* → catch-all Service (404, redirect, etc.)
```

### Common Ingress issues

**No DNS pointed at the LB**: Ingress exists but no one can reach it because DNS isn't configured.

**TLS certificate not issued**: cert-manager hasn't finished ACME challenge; check Certificate status.

**Wrong path matching**: Prefix vs Exact confusion; controllers sometimes interpret differently.

**Ingress class not specified**: multiple controllers in the cluster; Ingress doesn't know which one to use.

**Health check failures from LB**: backend Service not Ready or path doesn't return 200.

### Real-world: AWS LB Controller specifics

On EKS, AWS Load Balancer Controller is the typical Ingress controller:

- Reads Ingress resources, provisions ALBs.
- ALBs route directly to Pod IPs (target type IP) — no NodePort hop.
- Integrates with ACM for certificates.
- Supports WAF integration, access logs, sticky sessions.

Setup involves: deploy the controller, ensure it has IAM permissions to manage ALBs (via IRSA), tag VPC subnets so the controller knows where to put LBs.

Once running, you write standard Ingress YAML with `alb` ingress class annotations, and ALBs appear.

## Three real-world scenarios

**Scenario 1: Migrating from many LoadBalancer Services to Ingress.**
Team had 30 Services each as LoadBalancer = 30 ALBs = ~$750/month. Migrated to one Ingress with path-based routing. Now one ALB, 30 ClusterIP Services. Costs $25/month + per-LCU. Saved $725/month. One week of work; permanent savings.

**Scenario 2: Auto-renewing TLS via cert-manager.**
Old setup: manually renewing certs every 90 days, occasionally missing renewal and serving expired certs. Installed cert-manager + Let's Encrypt ClusterIssuer. Created Certificate resources for all hosts. cert-manager renews automatically. No more cert-related incidents.

**Scenario 3: Canary deployment via Ingress weights.**
Want to send 5% of traffic to a new version. NGINX Ingress supports canary annotations:
```
nginx.ingress.kubernetes.io/canary: "true"
nginx.ingress.kubernetes.io/canary-weight: "5"
```
Two Ingresses for same host: production (default) and canary. Test new version with real traffic without full rollout. Increase weight as confidence grows.

## Common mistakes to avoid

- **LoadBalancer per Service** when Ingress would work — cost.
- **Missing TLS automation** (manual certs go stale).
- **No ingress class** in multi-controller clusters.
- **Annotations not portable** — moving between controllers is non-trivial.
- **One Ingress for everything** — split per concern for clarity.

## Read more

- Kubernetes docs: "Ingress" concept.
- AWS Load Balancer Controller documentation.
- cert-manager documentation.
- Gateway API documentation.

## Summary

- **Ingress** declares HTTP routing rules; controllers implement them.
- **One LB, many Services**, routed by path and host.
- **TLS termination** at the LB / Ingress.
- **cert-manager** automates TLS issuance and renewal.
- **AWS LB Controller** provisions ALBs for EKS.
- **Gateway API** is the newer, more expressive successor; adoption ongoing.
- **Ingress is the standard pattern** for external HTTP traffic on K8s.

Next: NetworkPolicies and DNS.
