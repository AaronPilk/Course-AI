---
module: 3
position: 2
title: "BGP: the protocol that runs the internet"
objective: "How networks share reachability information."
estimated_minutes: 6
---

# BGP: the protocol that runs the internet

## What BGP is

Border Gateway Protocol (BGP) is how Autonomous Systems (ASes) tell each other "I can reach these IP ranges."

Every ISP, large enterprise, cloud provider has an AS number (ASN) and announces its IP prefixes to its neighbors. Neighbors propagate those announcements. After convergence, every router on the internet knows roughly: "to reach 8.8.8.8, I should send to my neighbor X."

There are ~100,000 ASes globally and ~1M routes in the full BGP table. It's the closest thing the internet has to a global routing brain — and it's mostly built on cooperation among independent operators.

## Path vector

Unlike interior routing (OSPF tells you cost), BGP carries the **path** — the sequence of ASes a route traverses.

```
8.8.8.0/24
  AS-PATH: 15169 13335 1234 5678
                ↑     ↑    ↑    ↑
              Google CF  ISP your-ISP
```

Routers prefer shorter AS-PATHs (fewer ASes = closer). Among equal-length, other tiebreakers apply (origin, MED, local preference).

This is why "Google traffic from Europe goes through Frankfurt" — that's where their announcements have shortest paths to local ISPs.

## How announcements happen

You're an ISP. You have customers. You also peer with other ISPs.

**To customers:** "Send your traffic to me; I'll send it to the internet."

**To peers:** "I'll reach my customer 10.x.x.0/24 via this path. You can reach it via me."

**To upstream (other ISPs you pay).** "Send me traffic for 10.x.x.0/24."

The web of these announcements is the internet's routing. When one prefix is announced from multiple places (anycast), shortest path wins.

## BGP attributes

Each route carries attributes that influence preference:

- **AS-PATH.** Sequence of ASes traversed.
- **NEXT-HOP.** Where to send the packet.
- **LOCAL-PREF.** How much we prefer this route internally.
- **MED.** Multi-Exit Discriminator — preference for one entry over another.
- **COMMUNITIES.** Tags used for policy (e.g., "don't propagate to peers, only customers").

The complete decision algorithm has ~13 steps; in practice, LOCAL-PREF and AS-PATH length dominate.

## Convergence and BGP storms

When a link fails, the affected AS withdraws its routes; neighbors propagate the withdrawal; alternative paths recompute. Convergence can take seconds to minutes for the global table.

Bad: BGP storms — flapping routes (going up and down repeatedly) cause cascading recomputation across the internet. Modern routers have dampening to suppress flapping prefixes.

## Anycast — the same IP everywhere

Multiple servers announce the same prefix from different locations. Routing picks the nearest one for each client based on BGP topology.

Used heavily by:
- **DNS root servers.** 13 logical, many physical, all anycast.
- **CDNs.** Cloudflare, Google, Akamai serve same IPs from hundreds of POPs.
- **DDoS scrubbing.** Spread attack traffic across many points.

For deployment: anycast IP requires owning the prefix and announcing it from multiple locations (or using a provider that does, like Cloudflare).

## BGP hijacks and security

BGP runs on trust. Any AS can announce any prefix; whether neighbors accept it depends on filtering. Bad actors (or misconfigurations) can:

- **Route hijacking.** Announce prefixes that aren't yours; traffic redirects through your network.
- **Route leak.** Re-announce upstream routes to other upstreams (you become a transit ISP); typically by accident.

Famous incidents: Pakistan accidentally blackholing YouTube globally (2008); Russia briefly attracting Mastercard / Visa traffic (2018); various smaller incidents annually.

Defenses:
- **RPKI (Resource Public Key Infrastructure).** Cryptographic signatures of who owns which prefixes. Routers can reject unauthorized announcements.
- **MANRS.** A set of operational best practices ISPs adopt.
- **BGP communities + filtering.** Manual policy.

RPKI adoption is growing — most major networks now validate. Hijacks still happen but are detected faster.

## Looking at BGP

Public looking glasses let you query BGP from various vantage points:

- https://bgp.he.net (Hurricane Electric).
- https://www.peeringdb.com (peering relationships).
- https://bgp.tools.

For your own announcements, your provider's portal usually shows what's announced and where it's accepted.

`whois` shows AS information:

```
$ whois 8.8.8.8
NetRange: 8.8.8.0 - 8.8.8.255
OrgName: Google LLC
ASN: AS15169
```

## BGP for normal engineers

Most software engineers never configure BGP. But knowing it exists explains a lot:

- Why some destinations are fast (close in BGP topology) and others slow.
- Why anycast services have surprisingly low latency.
- Why BGP outages (Facebook 2021, Rogers Canada 2022) take services down even though servers are running.
- Why route hijacks can redirect significant internet traffic.

For ops: AWS / GCP / Azure handle BGP for you. Your VPCs use BGP underneath for inter-region. Tailscale, Cloudflare WARP use BGP under the hood.

## Common pitfalls

- **Single upstream.** No path diversity = single-point-of-failure.
- **No RPKI.** Easier to be hijacked.
- **Misconfigured announcements.** Leaking customer routes to peers, blackholes.
- **Slow convergence.** Failover takes too long; tune timers carefully.

## Summary

- BGP is the protocol between Autonomous Systems on the internet.
- Path vector: routes carry the AS sequence; shorter usually wins.
- Anycast: same IP announced from many places; nearest wins.
- Hijacks and leaks happen; RPKI is the cryptographic defense.
- Most engineers don't configure BGP but should understand it exists.
- BGP outages take services down even when servers work fine.

Next: OSPF and interior routing.
