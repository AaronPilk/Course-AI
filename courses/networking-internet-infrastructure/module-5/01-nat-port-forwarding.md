---
module: 5
position: 1
title: "NAT, port forwarding, and CGNAT"
objective: "How private IPs share public ones, and what breaks."
estimated_minutes: 5
---

# NAT, port forwarding, and CGNAT

## Why NAT exists

IPv4 has ~4.3 billion addresses; the internet has many more devices. Private IPs (10.x, 172.16-31.x, 192.168.x) let many devices live inside a network. NAT (Network Address Translation) maps them to one (or a few) public IPs at the edge.

Your home router does this. Cloud providers do this. Carriers do this on a larger scale (CGNAT).

## How NAT works

Outbound: a packet from 192.168.1.50:54321 to 8.8.8.8:443 goes through the router. The router rewrites the source to its public IP + a random port:

```
src 192.168.1.50:54321 dst 8.8.8.8:443
                    ↓ (router)
src 203.0.113.7:62543 dst 8.8.8.8:443
```

The router stores: "62543 → 192.168.1.50:54321."

When the response comes back to 203.0.113.7:62543, the router looks up the mapping and forwards to 192.168.1.50:54321. Internal device thinks it sent from its private IP and the response came directly; doesn't know NAT happened.

## Types of NAT

Roughly increasing in strictness:

- **Full cone NAT.** Once mapped, anyone can send to the public IP+port and reach the internal host. Permissive; works well for VoIP/games.
- **Restricted cone.** Only the destination the internal host first contacted can send back.
- **Port-restricted cone.** Same destination, same port.
- **Symmetric NAT.** Different mapping per destination. Hardest for P2P.

Most home routers do port-restricted or symmetric. Symmetric is what kills VoIP/games without help.

## Port forwarding — inbound flows

What if you want to host a service behind NAT? Server.IP isn't reachable from outside.

**Static port forwarding.** Router config: "port 8080 → 192.168.1.50:8080." Inbound traffic to public-IP:8080 routed to the internal server.

Used for: home servers (Minecraft, Plex, NAS), legacy on-prem.

**UPnP.** Apps automatically request port forwards from the router. Convenient; security risk if malicious apps can open ports.

**Manual config.** Reliable; tedious to maintain.

## STUN, TURN, ICE

For dynamic peer-to-peer (VoIP, WebRTC) through NAT:

- **STUN (Session Traversal Utilities for NAT).** Discovers your public IP/port from the perspective of an external server. Lets peers tell each other "this is my public address."
- **TURN (Traversal Using Relays around NAT).** When direct P2P fails (symmetric NAT both sides), relays through a public server.
- **ICE (Interactive Connectivity Establishment).** Coordinates STUN + TURN + direct attempts to find the best working path.

WebRTC implements all three under the hood. Twilio / Cloudflare / Google offer STUN/TURN services.

## CGNAT — carrier-grade NAT

ISPs ran out of IPv4 addresses. Solution: put multiple subscribers behind one public IP via CGNAT. Customers get a private IP (often in 100.64.0.0/10 — "Shared Address Space"); ISP NATs to its pool of public IPs.

Implications:
- **You don't have a public IP.** Inbound services impossible without ISP cooperation.
- **Port forwarding doesn't work.**
- **Geolocation flaky.** Many users on one IP = harder to determine location.
- **Some sites rate-limit by IP** and block "noisy" CGNAT IPs, hurting innocents.

For hosting from home behind CGNAT: use a tunneling service (Cloudflare Tunnel, ngrok, Tailscale Funnel) that establishes an outbound connection to a public endpoint.

## IPv6 — the long-term solution

IPv6 has 2^128 addresses. Every device gets a public IP; no NAT needed.

Adoption has been slow but steady. By 2026, ~45-50% of global internet traffic is IPv6. Some networks (Verizon mobile, T-Mobile, Comcast) are IPv6-first.

For services: dual-stack (IPv4 + IPv6). IPv6-only deployments exist but interoperability still requires IPv4 fallback for older clients/networks.

## NAT performance considerations

NAT table is limited. Each connection consumes a row. Heavy traffic can exhaust the table on small routers — symptoms: new connections fail randomly.

For high-throughput servers: ensure conntrack table is sized appropriately:

```bash
$ sudo sysctl net.netfilter.nf_conntrack_max
$ sudo sysctl net.netfilter.nf_conntrack_count
```

CGNAT scales further with stateful firewalls + huge conntrack tables (specialized appliances).

## NAT and security

NAT is often described as security ("nothing can reach my LAN"). True for inbound — but not a real firewall. Misconfigured port forwards expose internal services. Compromised internal devices punch out via NAT to attacker servers freely.

Defense in depth: firewall + segmentation + endpoint security. NAT alone isn't security.

## Looking at NAT

For your own router:

```
$ ip route                       # see default gateway
$ traceroute 8.8.8.8             # see hops
```

For seeing your public IP:

```
$ curl ifconfig.me
$ curl icanhazip.com
$ dig +short myip.opendns.com @resolver1.opendns.com
```

These return what the public internet sees as your IP.

## Common confusions

- **"I have a static IP."** Usually means your ISP gives you a fixed public IP. Doesn't change the fact you're behind NAT inside.
- **"My router has a firewall."** Most home routers' "firewall" is just NAT + a few rules. Not stateful inspection-grade.
- **"Port forwarding will fix latency."** No — NAT adds microseconds; latency comes from physical distance + routing.
- **"IPv6 doesn't need NAT."** Correct; IPv6 networks usually don't use NAT (sometimes use NAT66 for translation but it's controversial and rare).

## Summary

- NAT maps private IPs to one or few public IPs via port translation.
- Outbound is automatic; inbound needs port forwarding or STUN/TURN.
- CGNAT means subscribers share public IPs at the ISP level; inbound hosting needs tunneling services.
- IPv6 eliminates NAT in theory; adoption is gradual.
- NAT isn't real security; firewall + segmentation + endpoint hardening matter.

Next: load balancers — L4 vs L7.
