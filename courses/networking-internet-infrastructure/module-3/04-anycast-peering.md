---
module: 3
position: 4
title: "Anycast, IXPs, and peering"
objective: "How networks connect to each other physically and logically."
estimated_minutes: 5
---

# Anycast, IXPs, and peering

## How traffic actually moves

You're a user in Tokyo asking for example.com hosted in Virginia. The packet's path:

1. Your ISP's network.
2. Out via a peering point with another ISP.
3. Through internet exchanges and transit providers.
4. Into the destination's hosting provider.
5. To the server.

Each transition is a physical handoff at some place where networks meet. The economics and topology of those handoffs determine internet performance.

## Internet Exchange Points (IXPs)

IXPs are physical facilities where many ISPs and networks connect to a shared switch fabric. Instead of N×N peering connections, each network connects once to the IXP and can exchange traffic with everyone.

Big IXPs:
- **DE-CIX (Frankfurt).** Largest by volume.
- **AMS-IX (Amsterdam).**
- **LINX (London).**
- **Equinix exchanges (worldwide).**
- **HKIX (Hong Kong).**

A network connected to a major IXP can reach hundreds of other networks at very low cost — single fiber drop into the facility serves connectivity to many peers.

## Peering vs transit

Two relationships between networks:

**Peering.** Two networks exchange traffic for their own customers, mutually. Settlement-free (no money). Implies similar size / mutual benefit.

**Transit.** You pay an upstream provider to deliver your traffic to the rest of the internet. Tiered: Tier 1 networks have no transit (they peer with all other Tier 1s). Most others pay transit to Tier 1s.

Tier 1 networks (rough list, 2026): AT&T, Cogent, GTT, Liberty Global / Telecom Italia Sparkle, Lumen, Tata, Telxius, Verizon, Zayo, NTT.

For a small org: pay transit to one or two ISPs. For a major service: peer at IXPs with many partners + transit for fallback.

## Settlement-free peering

The economics:
- I'll deliver traffic to your customers; you deliver to mine.
- No money changes hands.
- Each party benefits — better latency, lower cost.

Disputes happen when traffic is asymmetric (one side sends much more than the other). Famously, Netflix vs ISPs had long-running peering disputes.

## Anycast — same IP, many places

Multiple servers announce the same prefix via BGP from different locations. Internet routing sends each client to the closest one.

```
1.1.1.1 — Cloudflare DNS, anycasted from hundreds of POPs
Tokyo user → Tokyo POP
London user → London POP
New York user → New York POP
```

For a service to use anycast:
1. Own a routable prefix (typically a /24 for IPv4 or /48 for IPv6 minimum).
2. Have an AS number.
3. Announce the prefix from multiple locations.

Or — much more common — use a service that does this for you: Cloudflare, Fastly, Google Cloud Global Load Balancing, AWS Global Accelerator. They handle BGP; you just point DNS at their anycast IPs.

## CDN economics

CDNs put servers near users (POPs in dozens or hundreds of cities). When a user requests content:
- DNS or routing directs them to the nearest POP.
- POP serves cached content directly (latency ~10-50ms).
- For cache misses, POP fetches from origin and caches.

CDN value: latency + offloading origin + DDoS absorption + edge compute.

Major CDNs: Cloudflare, Akamai, Fastly, Amazon CloudFront, Google Cloud CDN. Bunny.net and BunnyShield for cost-conscious. Many specialize in specific verticals (video, gaming, software updates).

## Submarine cables

The physical layer of the internet between continents:

- ~500 active submarine cable systems globally.
- Each cable can carry tens of Tbps.
- Owned by consortiums (telecoms + big tech).
- Repaired by specialized ships when broken (anchor damage, earthquakes, sometimes intentional).

Single cable failures don't break the internet (redundancy), but several at once can cause regional outages or slowdowns. Google, Meta, Microsoft increasingly own their own cables.

## Latency limits

Light travels ~200,000 km/s in fiber. The theoretical minimum round-trip from NYC to London (~5,500 km each way) is ~55ms. Real-world: 70-90ms due to routing, queues, processing.

For physical limits:
- Same continent: 5-50ms.
- Cross-Atlantic (US ↔ Europe): 70-100ms.
- US ↔ Asia: 100-200ms.
- US ↔ South America / Africa: 100-200ms.

You can't beat these without changing physics. CDNs and edge compute reduce by getting closer.

## Looking at the internet's topology

- **PeeringDB.** Database of who peers with whom, where.
- **CAIDA's AS Rank.** Sizes ASes by customers.
- **RIPEstat.** EU's RIR public stats on prefixes.
- **bgp.tools / bgp.he.net.** Looking glasses.

For ops: understand your provider's peering relationships. Better peering = better customer latency.

## Common confusions

- **"The cloud."** Lives in physical data centers connected via fiber/cables.
- **CDN doesn't replace origin.** First request still goes to origin; CDN caches.
- **Peering = free.** Yes, in immediate cash; but participants invest in infrastructure (cross-connects, ports, network engineering).
- **Anycast for HTTP-stateful services.** Tricky — TCP connection might hit different POP if routing flips. Most CDNs handle this; rolling your own is hard.

## Summary

- IXPs = physical facilities where many networks meet via shared switch.
- Peering = mutual exchange, no money. Transit = paying upstream provider.
- Tier 1 = networks that peer with all other Tier 1s; never pay transit.
- Anycast = same IP from many places; nearest wins via BGP.
- Major CDNs (Cloudflare, Akamai, Fastly) use anycast + global POPs.
- Light's speed limits transcontinental latency.

Module 3 complete. Next module: application layer.
