---
module: 3
position: 3
title: "OSPF and interior routing"
objective: "Routing inside a single network."
estimated_minutes: 5
---

# OSPF and interior routing

## Interior vs exterior

BGP runs between Autonomous Systems. Inside one AS — your company's network, a data center, a campus — different protocols share routes among internal routers. Called **IGPs** (Interior Gateway Protocols).

The three main IGPs:

- **OSPF** (Open Shortest Path First). Most common in enterprise.
- **IS-IS** (Intermediate System to Intermediate System). Common in ISP cores; similar to OSPF.
- **EIGRP** (Enhanced Interior Gateway Routing Protocol). Cisco-only; less common.

For most engineers: OSPF is the one you'll meet. It powers many large enterprise networks and is implemented in cloud routers.

## How OSPF works

OSPF is a **link-state** protocol:

1. Each router learns about its directly-connected neighbors.
2. Each router floods its neighbor info to all other routers in the area.
3. Every router now has the complete topology (link-state database).
4. Each router runs Dijkstra's shortest-path algorithm to compute routes.
5. Result: every router has the best path to every destination in the network.

Convergence is fast — link goes down, the news propagates, recomputation happens. Failover in seconds.

## Areas

For scale, OSPF networks divide into areas:

- **Backbone area (0).** Central.
- **Other areas.** Connect through backbone.

Each area maintains its own link-state database; routes between areas are summarized. Limits how much each router has to know.

For small networks: one area is fine. For larger: multiple areas reduce churn.

## OSPF metrics

OSPF uses link cost. Lower = preferred. Default cost is inversely proportional to bandwidth (faster link = lower cost).

```
Cisco default:    cost = 10^8 / bandwidth(bps)
```

So 1 Gbps link has cost 1; 100 Mbps has cost 10. Routers compute shortest-cost path, not shortest-hop.

You can manually set costs to engineer routing — make the WAN link expensive so traffic prefers LAN.

## OSPF in practice

For most engineers using cloud: OSPF runs inside the cloud provider's network but is invisible. Your VPCs use cloud-managed routing.

For private data centers: enterprise routers (Cisco, Juniper, Arista) configure OSPF for inter-router routing. Linux can run OSPF too via FRR / Quagga / BIRD.

```
$ sudo apt install frr
$ sudo vtysh
config terminal
router ospf
 network 10.0.0.0/8 area 0
```

That's a starter. Production OSPF involves areas, authentication, route summarization.

## Comparing to BGP

- **OSPF.** Inside an AS. Trust all routers in the area. Link-state, fast convergence.
- **BGP.** Between ASes. Trust nothing. Path vector, policy-rich.

They cooperate: BGP brings external routes; OSPF distributes them inside the AS.

## IS-IS

Similar to OSPF — also link-state. Used heavily in ISP cores (Level 3, Sprint, etc.) and large internet backbones.

Differences:
- Runs directly on L2 (not IP). More extensible.
- Originally designed for OSI, adapted to IP.
- Considered more scalable for very large networks.

For enterprises: OSPF is more common. For ISPs: IS-IS often.

## Distance vector — the older approach

RIP (Routing Information Protocol) is the simplest IGP:

- Each router tells neighbors what it can reach and at what distance.
- Neighbors update their tables.
- Slowly converges; doesn't scale.

RIP is essentially obsolete. Mentioned for history.

## What can go wrong

- **Route flapping.** Bad link goes up and down rapidly; routing recomputes constantly.
- **Asymmetric routing.** Out via one path, in via another. Stateful firewalls break.
- **MTU mismatches.** Packets get fragmented or dropped.
- **OSPF authentication failures.** Neighbors don't form adjacency.
- **Area design errors.** Multi-area OSPF requires backbone connectivity; misconfigure and partitions form.

For operations: monitor OSPF adjacencies, route counts, convergence events.

## SDN — software-defined networking

Modern alternative: centralized control plane decides routes; switches just forward as told. Examples: OpenFlow, P4, cloud-native networking (Cilium, Calico for Kubernetes).

For Kubernetes: networking inside the cluster is often handled by CNI plugins (Calico, Cilium, Weave) that have their own protocols, often borrowing from BGP for cluster-to-external routing.

## VRF — virtual routing tables

Some routers support multiple routing tables (VRFs — Virtual Routing and Forwarding). One physical router serves multiple logical networks with separate routing.

Used in carrier networks (MPLS L3VPN), enterprises with isolated tenants, sometimes in multi-tenant data centers.

## Summary

- OSPF is the most common interior gateway protocol; link-state.
- Each router knows the whole topology; computes shortest paths.
- Cost typically tied to bandwidth.
- Areas divide large networks for scale.
- IS-IS similar; used more in ISP backbones.
- BGP (external) + OSPF (internal) cooperate.
- SDN and CNI plugins handle modern cloud-native networking.

Next: anycast, IXPs, peering.
