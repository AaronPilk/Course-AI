---
module: 3
position: 1
title: "Routing tables and gateways"
objective: "How a packet finds its next hop."
estimated_minutes: 5
---

# Routing tables and gateways

## What routing is

When a host has a packet to send, it asks: "Is the destination on my local subnet?"

- **Yes.** ARP for the MAC; send directly.
- **No.** Send to the default gateway.

The default gateway (your router) then asks the same question on its end. Each router along the path makes a hop-by-hop decision based on its routing table.

Routing is independent of any single device knowing the full path. Each just knows where to send next.

## The routing table

```
$ ip route
default via 192.168.1.1 dev eth0
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.50
10.0.0.0/8 via 192.168.1.1 dev eth0
```

Read:
- "default via 192.168.1.1" → anything not matched elsewhere goes there.
- "192.168.1.0/24 dev eth0" → local subnet; on-link.
- "10.0.0.0/8 via 192.168.1.1" → that block reached through the gateway.

When a packet needs routing, the most specific match wins. `/32` > `/16` > `/8` > default.

## Static vs dynamic routes

**Static routes.** Manually configured. Simple. Don't adapt to failures.

```
$ sudo ip route add 10.10.0.0/16 via 192.168.1.2
```

Useful for small networks and specific overrides.

**Dynamic routes.** Routers learn from each other via protocols (BGP, OSPF, RIP). Adapt to failures automatically.

For most enterprise / cloud networking: dynamic. For your laptop / home: just default route + local subnet, no routing protocols needed.

## Routers and their job

A router:
1. Receives a packet on one interface.
2. Looks at destination IP.
3. Consults its routing table.
4. Forwards out the appropriate next-hop interface.
5. Decrements TTL (preventing infinite loops).

Routers don't care about source IP for forwarding (NAT changes that). They care about destination and what they know.

## Hops and TTL

Every IP packet has a TTL (time to live, actually hop count). Each router decrements it. At 0, the router drops the packet and sends "ICMP time exceeded" back.

`traceroute` exploits this:
- Send packet with TTL=1. First router drops, sends ICMP. You learn router 1.
- Send packet with TTL=2. Second router drops. You learn router 2.
- Continue until TTL is large enough to reach destination.

```
$ traceroute example.com
1  192.168.1.1      0.5 ms
2  10.0.0.1         2.3 ms
3  isp.gateway.net  10.1 ms
4  ...
```

Routes change; each traceroute can differ. Routers may rate-limit ICMP, showing `*` instead of timing.

## Equal-cost multi-path (ECMP)

When multiple equal-cost paths exist, routers hash traffic across them — typically by 5-tuple (src IP, dst IP, src port, dst port, protocol). Same flow stays on same path; different flows distribute.

Used heavily in data centers and large WANs for capacity and resilience.

## Internet routing in summary

Each ISP / cloud / large network is an **Autonomous System (AS)** with its own routing policies. ASes connect to each other and exchange routes via **BGP** (next lesson).

Inside an AS, routers use **interior** protocols (OSPF, IS-IS, EIGRP) to share routes among themselves.

The result: tens of thousands of ASes, billions of IPs, and the internet still routes packets in milliseconds across the globe.

## Looking at the path

```
$ traceroute -I example.com     # use ICMP instead of UDP
$ mtr example.com               # continuous traceroute with stats
$ ip route get 8.8.8.8          # which route would be used for this dest
```

For diagnosis: where does latency jump? Where does loss happen? mtr makes this visible.

## Common mistakes

- **Multiple default routes.** Confusion; non-deterministic forwarding.
- **Static route to dead next-hop.** Traffic blackholes.
- **Asymmetric routing.** Out via one path, in via another. Stateful firewalls hate this.
- **TTL too low.** Some old apps set TTL=64 and far destinations exceed it.

## Summary

- Each router makes a local hop-by-hop decision based on its routing table.
- Default route handles anything not specifically matched.
- More-specific routes (longer prefixes) take precedence.
- TTL prevents infinite loops; `traceroute` exploits it to discover the path.
- BGP between ASes; OSPF / IS-IS inside.
- mtr / traceroute reveal path; `ip route` shows local table.

Next: BGP — the protocol that runs the internet.
