---
module: 1
position: 3
title: "IP addressing: IPv4, IPv6, subnets"
objective: "How addresses identify hosts globally."
estimated_minutes: 6
---

# IP addressing: IPv4, IPv6, subnets

## IPv4 — 32 bits, finite

An IPv4 address is 32 bits, shown as four 8-bit numbers:

```
192.168.1.42
```

Range: 0.0.0.0 to 255.255.255.255. About 4.3 billion total addresses. The internet ran out of fresh IPv4 allocations around 2011-2019 (different regions different times).

## Subnets and CIDR

A subnet groups IPs that share a common prefix. CIDR notation specifies how many bits are the network portion:

```
192.168.1.0/24
```

The `/24` means the first 24 bits identify the network; the last 8 are host bits. So:

- Network: 192.168.1.0
- Hosts: 192.168.1.1 through 192.168.1.254
- Broadcast: 192.168.1.255

That's 256 total addresses, 254 usable (network and broadcast reserved).

Common sizes:

| CIDR | Hosts | Example use |
|------|-------|-------------|
| /32 | 1 | single IP |
| /30 | 2 (point-to-point) | router links |
| /24 | 254 | typical office subnet |
| /16 | 65,534 | larger network |
| /8 | 16M | very large (10.0.0.0/8) |

## Private IP ranges

Reserved for use behind NAT, not routable on internet:

- **10.0.0.0/8** — 16M addresses
- **172.16.0.0/12** — 1M addresses
- **192.168.0.0/16** — 65K addresses

Home routers use 192.168.0.0/24 or 192.168.1.0/24 by default. Cloud VPCs typically use 10.0.0.0/16.

## Special addresses

- **127.0.0.0/8** — loopback (localhost). 127.0.0.1 is "this machine."
- **0.0.0.0** — "any address" (listen on all interfaces).
- **169.254.0.0/16** — link-local (auto-config when no DHCP).
- **224.0.0.0/4** — multicast.

## IPv6 — 128 bits, basically infinite

IPv6 expands to 128 bits. Notation uses 8 groups of 4 hex digits:

```
2001:0db8:85a3:0000:0000:8a2e:0370:7334
```

Shortened by collapsing consecutive zeros:

```
2001:db8:85a3::8a2e:370:7334
```

`::` represents "one or more groups of zero" (used once per address).

Address space: 2^128 ≈ 3.4 × 10^38. Enough for every grain of sand to have multiple internet addresses. Solves the IPv4 exhaustion problem.

## IPv6 special addresses

- `::1` — loopback (like 127.0.0.1).
- `::` — unspecified.
- `fe80::/10` — link-local.
- `fc00::/7` — unique local (private-ish equivalent).

Every modern OS dual-stacks IPv4 and IPv6. When both are available, IPv6 usually preferred.

## DHCP — automatic address assignment

Devices joining a network typically get an IP via DHCP (Dynamic Host Configuration Protocol):

1. New device broadcasts "DHCP discover."
2. DHCP server replies with offered IP + subnet + gateway + DNS.
3. Device confirms; server records.
4. Lease expires after a period (often hours); device renews.

Static IPs (manually set) are used for servers, routers, anything that needs a stable address.

```
$ sudo dhclient -v eth0          # request DHCP lease (Linux)
$ ipconfig /renew                # Windows
```

## Default gateway

For traffic destined outside your subnet, you send to the gateway:

```
$ ip route
default via 192.168.1.1 dev eth0
```

Means: "to reach anything not in the local subnet, send to 192.168.1.1 via interface eth0."

The gateway is usually your router. Multiple gateways possible (default + specific routes).

## Looking at your own setup

```
$ ip addr                        # all interfaces and IPs
$ ip route                       # routing table
$ ip neigh                       # ARP table
$ cat /etc/resolv.conf           # DNS servers
```

For Wi-Fi info:

```
$ iwconfig                       # older
$ iw dev wlan0 link              # newer
```

## NAT — sharing a public IP

Private IPs (10.x, 172.16-31.x, 192.168.x) aren't internet-routable. NAT (Network Address Translation) lets many private hosts share one public IP.

Outbound: router rewrites source IP+port from private to public+random-port; remembers the mapping. Inbound: router uses the mapping to deliver back to the right private host.

This is what every home router does. Covered in detail in Module 5.

## Subnet calculator example

You're given `10.0.0.0/16` for a VPC. Want 4 subnets:

- 10.0.0.0/18 = 16K hosts (4 of these total)
  - Actually `/16` split into 4 = `/18` each.
- Subnet 1: 10.0.0.0/18
- Subnet 2: 10.0.64.0/18
- Subnet 3: 10.0.128.0/18
- Subnet 4: 10.0.192.0/18

Tools like `ipcalc` make this easier:

```
$ ipcalc 10.0.0.0/16
```

In AWS / GCP / Azure, VPC subnet design follows the same math.

## Common confusions

- **/24 isn't a netmask; it's CIDR.** The equivalent netmask is 255.255.255.0.
- **Class A/B/C is obsolete.** CIDR replaced classful addressing in 1993.
- **127.0.0.1 isn't your "internet" IP.** It's local-only.
- **Your "IP address" depends on context.** Local LAN IP (192.168.x) vs public IP (whatever your ISP assigned).

## Summary

- IPv4: 32 bits, ~4.3B addresses, exhausted.
- IPv6: 128 bits, enough for any imaginable scale.
- CIDR notation: 192.168.1.0/24 = network + prefix length.
- Private ranges: 10/8, 172.16/12, 192.168/16. Not internet-routable.
- DHCP for automatic; static IPs for servers.
- Default gateway routes non-local traffic.

Next: TCP vs UDP.
