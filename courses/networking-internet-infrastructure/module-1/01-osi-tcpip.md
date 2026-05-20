---
module: 1
position: 1
title: "OSI and TCP/IP — two models, one network"
objective: "The conceptual layers that organize everything."
estimated_minutes: 6
---

# OSI and TCP/IP — two models, one network

## Why models exist

The internet works because we agreed on layers. Each layer does one job and trusts the layer below. New protocols slot into a layer without rewriting others.

Two models describe these layers: OSI (7 layers, academic) and TCP/IP (4 layers, practical). They overlap; people use both depending on context.

## The OSI 7-layer model

From bottom to top:

| Layer | Name | What it does | Example |
|-------|------|--------------|---------|
| 7 | Application | The thing the user sees | HTTP, FTP, DNS |
| 6 | Presentation | Encoding / encryption | TLS, JPEG |
| 5 | Session | Open/close sessions | (rarely distinct) |
| 4 | Transport | End-to-end delivery | TCP, UDP |
| 3 | Network | Addressing & routing | IP |
| 2 | Data Link | Local frame delivery | Ethernet, Wi-Fi |
| 1 | Physical | Bits over wire/air | Copper, fiber, radio |

OSI is taught in CS classes; in practice nobody talks about layer 5/6 separately.

## TCP/IP — the practical model

Simpler:

| Layer | OSI equivalent | Examples |
|-------|----------------|----------|
| Application | 5-7 | HTTP, DNS, SSH |
| Transport | 4 | TCP, UDP |
| Internet | 3 | IP |
| Link | 1-2 | Ethernet, Wi-Fi |

Most engineers think in TCP/IP. "Layer 7" still means HTTP-aware (think L7 load balancer); "Layer 4" still means TCP/UDP-aware.

## Encapsulation

Each layer wraps the data from above:

```
[ HTTP request ]
[ TCP header | HTTP request ]
[ IP header | TCP header | HTTP request ]
[ Ethernet header | IP header | TCP header | HTTP request | Ethernet trailer ]
```

The receiver peels layers off in reverse order. Each layer's header tells the next layer how to interpret what's inside.

This is why hardware can route IP packets without understanding TCP, and why TCP can deliver data without understanding HTTP. Clean abstraction.

## What flows where

When you type `https://example.com`:

1. **Application layer.** Browser builds an HTTP request.
2. **TLS** (layer 6 in OSI, often considered part of application in TCP/IP) wraps it.
3. **Transport layer (TCP).** Splits into segments; adds reliability.
4. **Network layer (IP).** Each segment gets IP source/dest; routed to destination.
5. **Data link (Ethernet/Wi-Fi).** Frames sent to next hop (your router).
6. **Physical.** Bits over copper, fiber, or radio.

Then in reverse at the server. Every layer is doing real work.

## Why the model matters for debugging

When something doesn't work, narrow down which layer:

- **Can't reach the host?** Maybe DNS (app), routing (network), or interface (physical).
- **Slow connection?** Maybe TCP congestion, app-level pagination, or DNS lookup.
- **Connection drops?** Maybe Wi-Fi (link), NAT timeout (network), or app keepalive.

The model gives you a checklist. Each layer has tools (`ping` for L3/IP, `traceroute` for routing, `dig` for DNS, `tcpdump` for everything).

## "Just don't break the layers"

When designing protocols / services, respect the boundaries:

- **App layer shouldn't care about IP addresses.** Use hostnames. They survive IP changes.
- **Transport doesn't care about app semantics.** TCP doesn't know what HTTP is.
- **Don't reach down.** App embedding IP-level concerns (raw sockets, specific routing) → fragile.

When abstractions break (security incident, perf crisis), look at all layers — but normal design respects them.

## Protocols at each layer (cheat sheet)

**Application:** HTTP, HTTPS, FTP, SMTP, DNS, SSH, IMAP, gRPC, WebSocket.

**Transport:** TCP (reliable, ordered), UDP (fast, no guarantees), QUIC (UDP-based modern transport).

**Network:** IP (IPv4, IPv6), ICMP (ping), IPsec (encrypted IP).

**Link:** Ethernet, Wi-Fi (802.11), Bluetooth, cellular (4G/5G).

**Physical:** Copper twisted pair, optical fiber, coax, radio frequencies.

## Common confusions

- **HTTP and TCP.** HTTP runs on TCP (and now QUIC/UDP for HTTP/3). They're not the same.
- **IP and TCP.** IP delivers packets to a host; TCP delivers data to a process on that host.
- **Layer 4 vs Layer 7 load balancer.** L4 forwards TCP/UDP packets; L7 understands HTTP and can route by path / headers.

## Summary

- OSI = 7 layers (academic). TCP/IP = 4 layers (practical). Both describe the same network.
- Encapsulation: each layer wraps the previous. Receiver unwraps.
- L7 = app (HTTP). L4 = transport (TCP/UDP). L3 = network (IP). L2 = link (Ethernet). L1 = physical.
- Debug by narrowing down which layer is failing.
- Respect layer boundaries when designing.

Next: the physical layer and Ethernet.
