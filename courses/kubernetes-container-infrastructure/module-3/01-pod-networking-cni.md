---
module: 3
position: 1
title: "Pod networking and the CNI"
objective: "Understand the network plumbing."
estimated_minutes: 7
---

# Pod networking and the CNI

## The puzzle

Every Pod in a Kubernetes cluster gets its own IP address. Pods talk to each other directly across the cluster, even across Nodes. There's no NAT, no port mapping, no manual routing. How does this work? The answer is the CNI (Container Network Interface) plugin — pluggable software that gives Kubernetes its networking superpowers.

## The simple version

The Kubernetes network model says:

1. Every Pod gets a unique IP address.
2. All Pods can communicate with all other Pods without NAT.
3. All Nodes can communicate with all Pods.
4. The IP a Pod sees itself as is the same IP others see.

How this happens is the CNI's job. Different CNI plugins implement the model differently:

- **AWS VPC CNI**: Pod IPs are real AWS VPC IPs.
- **Calico**: BGP-based routing.
- **Cilium**: eBPF-based, fast and secure.
- **Flannel**: simple overlay network.

You usually pick a CNI at cluster creation and forget about it. But understanding what it does explains a lot.

## The technical version

### The Kubernetes network model

The CNI must satisfy four requirements:

1. Pod IPs are unique within the cluster.
2. Pods can talk to each other directly (no NAT).
3. Pods can talk to all Nodes; Nodes to all Pods.
4. The Pod's perceived IP matches what others see.

The model is intentionally simple from the application's perspective: "every Pod has a network identity; just connect by IP." Behind the scenes, the CNI handles routing, address assignment, and overlay encapsulation if needed.

### Common CNI plugins

A few major options:

**AWS VPC CNI** (EKS default): assigns AWS VPC IPs directly to Pods via secondary ENIs. Pods are first-class VPC citizens — can be reached by anything in the VPC; security groups apply. Counts against VPC IP space; needs careful planning at scale.

**Cilium**: uses eBPF for in-kernel networking and policy enforcement. Fast, supports advanced features (service mesh, observability), increasingly the modern default for serious clusters.

**Calico**: BGP-based routing. Long-standing project. Works well for large clusters. Good NetworkPolicy support.

**Flannel**: simple overlay (VXLAN). Easy to set up, less performant. Common in learning / small environments.

**Azure CNI** and **GKE Calico/Cilium**: cloud-specific defaults.

For EKS, AWS VPC CNI is the default and usually right. For multi-cloud or specific needs, alternatives may be better.

### How Pod IPs are assigned

When a Pod is scheduled to a Node:

1. The kubelet calls the CNI plugin.
2. The CNI assigns an IP from its pool (subnet, IPAM).
3. The CNI configures network interfaces in the Pod's namespace.
4. The CNI sets up routing on the Node so the Pod IP is reachable.

This happens for every Pod, every time. The CNI manages the IP pool, recycles addresses when Pods are deleted, and handles cross-Node routing.

### Overlay vs underlay networks

Two general approaches:

**Overlay networks**: encapsulate Pod traffic inside another network protocol (VXLAN, IPIP). Easy to set up but adds packet overhead. Examples: Flannel default, Calico in IPIP mode.

**Underlay networks**: Pod IPs are routed at the network layer with no encapsulation. Faster, but requires network configuration. Examples: AWS VPC CNI, Calico BGP.

Cilium can do both. AWS VPC CNI is pure underlay. For high-performance workloads, underlay typically wins.

### Pod-to-Pod within a Node

Same Node, different Pods: traffic stays on the Node. The CNI configures network interfaces (typically `veth` pairs) so Pods reach each other through the Node's kernel. No encapsulation needed.

### Pod-to-Pod across Nodes

Cross-Node: traffic leaves Node A, traverses the underlying network, arrives at Node B. The CNI determines how. With AWS VPC CNI, it's just regular VPC routing. With overlay-based CNIs, the packet is encapsulated and decapsulated at the Node boundaries.

### Pod-to-Service traffic

When a Pod talks to a Service (we'll cover Services next), the traffic doesn't go directly to a Pod. Instead:

1. Pod sends to Service's ClusterIP (a virtual IP).
2. kube-proxy (or its eBPF replacement) intercepts via iptables/IPVS rules.
3. Translates to one of the Pod IPs backing the Service.
4. Routes through the CNI to the target Pod.

The Service abstraction sits on top of the CNI. CNI handles Pod-to-Pod; kube-proxy / Cilium / etc. handle Service routing.

### DNS

Pods get cluster DNS via CoreDNS (a Pod running in the cluster). The kubelet configures each Pod's `/etc/resolv.conf` to point at CoreDNS.

Lookups:

- `service-name.namespace.svc.cluster.local` → Service ClusterIP.
- `pod-ip-with-dashes.namespace.pod.cluster.local` → Pod IP (rarely used directly).
- External domains forwarded to upstream DNS.

CoreDNS is configurable for custom domains, forwarders, etc. Performance matters — DNS lookups happen often. Tuning or replacing CoreDNS is a real ops concern at scale.

### IP space considerations

Each cluster needs IP space for Pods, Nodes, Services. Plan early to avoid running out:

- **Pod CIDR**: range for Pod IPs. AWS VPC CNI uses the VPC subnets.
- **Service CIDR**: range for Service ClusterIPs (virtual; not on any interface).
- **Node CIDR**: subnet for Node IPs (cloud-managed).

For EKS, careful subnet planning matters: AWS VPC CNI assigns Pod IPs from VPC subnets, and each Node holds multiple Pod IPs. A misplanned VPC runs out of IPs.

### CNI extensibility

The CNI is plug-in. Some clusters install multiple CNI plugins for layered functionality:

- Main CNI for Pod networking.
- Meta plugin (Multus) for additional interfaces (e.g., SR-IOV for high-performance).
- Other plugins for traffic shaping, packet filtering.

For most clusters, one CNI is enough. Multi-CNI setups are for specialized needs (telecom, edge).

### eBPF and the modern CNI

eBPF lets programs run safely in the Linux kernel, attached to network events. Modern CNIs (Cilium especially) use eBPF to:

- Replace iptables with faster, more programmable rules.
- Enforce NetworkPolicies in kernel.
- Provide observability without overhead.
- Implement service routing without kube-proxy.

For high-scale or high-performance workloads, eBPF-based CNIs are increasingly the choice. The performance and observability advantages are real.

### Common networking issues

A few patterns:

**Pod can't reach external services**: NAT gateway issues, NACLs blocking, security groups restrictive. Outside K8s; usually a VPC config issue.

**Pod can't reach another Pod**: NetworkPolicy denying, DNS issue, Pod not Ready, Service selector mismatch.

**Slow DNS lookups**: CoreDNS overloaded, ndots configuration (default 5 causes searching unnecessary domains), Node DNS caching missing.

**IP exhaustion**: especially with AWS VPC CNI. Subnet planning matters.

**Cross-AZ traffic costs**: Pod-to-Pod across AZs costs data transfer ($0.01/GB on AWS). Anti-affinity can spread Pods across AZs intentionally; aware sometimes wants to keep traffic local.

### Performance characteristics

Approximate latencies:

- **Pod-to-Pod, same Node**: <100 microseconds.
- **Pod-to-Pod, cross-Node, same AZ**: ~0.5 ms.
- **Pod-to-Pod, cross-AZ**: 1-2 ms.
- **DNS lookup**: 1-10 ms depending on caching.

For most workloads, fine. For ultra-low-latency, consider Node affinity to colocate communicating Pods, eBPF-based CNI, and avoid Service routing if you can use Pod IPs directly.

### Hands-on troubleshooting

Useful commands:

```bash
kubectl get pods -o wide                  # see Pod IPs and Nodes
kubectl exec -it pod -- nslookup service  # test DNS
kubectl exec -it pod -- curl pod-ip:port  # test connectivity
kubectl describe networkpolicy            # see policies
```

From a Node:

```bash
ip route                                  # routing table
iptables -L                               # iptables rules (kube-proxy)
```

For deep debugging, tools like `kubectl debug` and CNI-specific debug tools help.

### Multi-cluster networking

For workloads spanning multiple K8s clusters, dedicated solutions exist:

- **Service mesh** (Istio, Linkerd) with multi-cluster mode.
- **Submariner**: open-source multi-cluster CNI federation.
- **AWS Cloud Map** / Consul for service discovery across clusters.

This is advanced. Most teams should master single-cluster networking first.

### What this means for your code

Application code doesn't usually care about CNI specifics:

- Use Services for stable addressing.
- Trust DNS for service discovery.
- Don't hardcode Pod IPs.
- Use NetworkPolicies for security (Module 3 next lesson).
- Profile if performance matters; consider eBPF-based CNI.

The CNI just works for most workloads. When it doesn't, debugging requires understanding what's underneath.

## Three real-world scenarios

**Scenario 1: An EKS cluster running out of IPs.**
EKS uses AWS VPC CNI, which assigns Pod IPs from the VPC subnets. The VPC was sized for legacy use; running 200 Pods per Node times 50 Nodes exhausted available IPs. Fix: expand VPC CIDR (if possible), add more secondary CIDRs, or migrate to prefix delegation (one ENI handles many Pod IPs). Subnet planning matters at scale.

**Scenario 2: DNS lookups slowing down a microservice.**
Service-to-service calls show DNS latency spikes. Investigation: CoreDNS Pods overloaded; default `ndots: 5` causing many redundant lookups (every short name searched through multiple suffixes). Fix: scale up CoreDNS, configure ndots to 2 in Pods, add NodeLocal DNS Cache for local caching. Latency drops 80%.

**Scenario 3: Cross-AZ traffic costs surprise.**
Microservices have anti-affinity rules spreading replicas across AZs (good for HA). But cross-AZ communication is $0.01/GB. Inter-service traffic at high volume produces $$$ in data transfer. Fix: topology-aware service routing (a relatively new K8s feature) keeps service calls AZ-local when possible. Significant cost reduction with no application changes.

## Common mistakes to avoid

- **Ignoring CNI choice** at cluster creation.
- **Underplanning IP space** for VPC-based CNIs (AWS).
- **DNS lookups uncached** at scale.
- **Hardcoding Pod IPs** in application code.
- **Cross-AZ traffic** without measuring cost.
- **NetworkPolicies that break service-to-service** unintentionally (covered next lesson).

## Read more

- Kubernetes docs: "Cluster Networking" concept.
- Cilium documentation for eBPF networking.
- AWS VPC CNI documentation for EKS specifics.
- Calico documentation for BGP-based networking.

## Summary

- **CNI provides Pod networking**: IP per Pod, no NAT, all Pods reachable.
- **AWS VPC CNI**: native VPC IPs; default for EKS.
- **Cilium**: eBPF-based; modern, fast, observable.
- **Calico, Flannel**: alternative options.
- **Service abstraction** sits on top of CNI.
- **CoreDNS** provides cluster DNS.
- **IP space planning** matters at scale (especially AWS).
- **eBPF** is the modern direction for performance and observability.

Next: Services.
