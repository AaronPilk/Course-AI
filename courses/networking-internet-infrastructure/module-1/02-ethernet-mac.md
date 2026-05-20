---
module: 1
position: 2
title: "Ethernet, MAC, and the physical layer"
objective: "What happens at the cable level."
estimated_minutes: 5
---

# Ethernet, MAC, and the physical layer

## The physical layer

Bits travel as:

- **Electrical signals over copper.** Twisted pair (Cat 5e/6/6a/7/8 for Ethernet).
- **Light pulses over fiber.** Single-mode (long distance) or multi-mode (short).
- **Radio waves.** Wi-Fi, cellular, satellite.

Each medium has bandwidth, latency, distance limits. A 10Gbps fiber can run kilometers; a Cat 5e copper run tops out around 100m.

Engineers don't usually think about this layer until something breaks — bad cable, dirty fiber connector, RF interference.

## Ethernet — the L2 standard

Ethernet (IEEE 802.3) is the dominant wired LAN protocol. Wireless variant is Wi-Fi (802.11). Both share the same framing model.

An Ethernet frame:

```
| Preamble | Dest MAC (6B) | Src MAC (6B) | Type (2B) | Payload (46-1500B) | CRC (4B) |
```

- **Preamble.** Sync bits.
- **MAC addresses.** Source and destination at the physical network level.
- **Type.** What's inside (IPv4 = 0x0800, IPv6 = 0x86DD, ARP = 0x0806).
- **Payload.** Higher-layer data (IP packet, typically).
- **CRC.** Checksum; receiver verifies.

The 1500-byte max payload is the **MTU** (Maximum Transmission Unit). Jumbo frames extend to 9000 in some networks.

## MAC addresses

Each network interface has a MAC (Media Access Control) address — 48 bits, usually shown as 6 hex pairs:

```
e8:50:8b:a3:42:7f
```

First 3 bytes = manufacturer prefix (OUI). Last 3 = unique within manufacturer.

MACs are local-network identifiers. They don't route across the internet — they only matter on the local segment (your home LAN, your office switch).

## ARP — finding MAC from IP

To send to `192.168.1.10` on your LAN, you need its MAC. ARP (Address Resolution Protocol) asks:

```
"Who has 192.168.1.10? Tell 192.168.1.5"  → broadcast to LAN
"192.168.1.10 is at e8:50:8b:a3:42:7f"  → reply from owner
```

The reply is cached. View your ARP table:

```
$ ip neigh                    # Linux
$ arp -a                       # macOS / BSD
```

ARP only works within a single L2 segment. For other networks, you send to your gateway.

## Switches and hubs

- **Hub** (obsolete). Repeats all signal to all ports. Collisions.
- **Switch.** Learns which MACs are on which ports; forwards only to the right one.

Modern Ethernet is switched — full duplex, no collisions, individual port speeds.

## VLANs

Virtual LANs split one physical switch into multiple logical networks. Tag traffic with a VLAN ID (802.1Q); switch keeps tagged traffic separate.

Used to segment office networks (engineering, finance, guest WiFi) on one physical switch without separate cabling.

## Wi-Fi essentials

802.11 is the wireless equivalent of Ethernet. Key differences:

- **Shared medium.** All devices on the same channel hear all traffic.
- **Encrypted.** WPA2 (deprecated), WPA3 (modern). Older WEP is broken.
- **Collision avoidance, not detection.** Different MAC protocol (CSMA/CA vs CSMA/CD).
- **Roaming.** Mobile devices switch APs without losing connection.

Wi-Fi 6/6E (802.11ax) and Wi-Fi 7 (802.11be) are the modern standards. Multi-Gbps speeds in optimal conditions.

## Power over Ethernet (PoE)

Some Ethernet cables also deliver power — APs, IP cameras, VoIP phones run without separate power. Useful for ceiling-mounted hardware.

## Speed and duplex negotiations

Two devices on Ethernet auto-negotiate:

- **Speed.** 10/100/1000 Mbps / 2.5/5/10 Gbps.
- **Duplex.** Full (simultaneous send/receive) or half (turn-taking).

Mismatches cause weird intermittent failures. `ethtool` on Linux shows current state:

```
$ sudo ethtool eth0
```

Modern hardware mostly gets this right; legacy gear can fight.

## Fiber

Optical fiber for long runs and high bandwidth:

- **Single-mode.** Thin core; lasers; kilometers; backbone use.
- **Multi-mode.** Thicker core; LEDs; short distance; data centers.

Connectors: LC, SC, MTP, etc. Each has its physical conventions. Bend, dust, or scratch the fiber and signal degrades.

For most engineers: fiber is "the link beyond my office;" details rarely matter until you're a network engineer.

## Network interfaces

Linux shows interfaces:

```
$ ip addr
$ ip link
$ ifconfig                      # older, BSD-style
```

Each interface has:

- A name (`eth0`, `wlan0`, `enp0s3`, `lo`).
- A MAC (for Ethernet/Wi-Fi).
- One or more IPs.
- A state (UP/DOWN).

`lo` is the loopback (127.0.0.1) — virtual interface for local-only traffic.

## Common issues

- **Mismatched duplex.** Slow or unreliable connection.
- **Bad cable.** Intermittent drops. Replace.
- **MAC table overflow.** Switch can't learn all MACs; broadcasts everything.
- **Cable too long.** Cat 5e/6 tops out around 100m.
- **Interference.** Wi-Fi near microwave / dense channel; rearrange channels.

## Summary

- Physical layer: copper, fiber, radio. Carries bits.
- Ethernet (802.3) is the wired LAN standard. Wi-Fi (802.11) is wireless.
- Frames have MAC source/dest + type + payload + CRC. MTU usually 1500.
- MAC addresses are local; ARP maps IP to MAC on a LAN.
- VLANs segment one switch logically. PoE delivers power over Ethernet.
- Issues: duplex mismatch, bad cables, RF interference for Wi-Fi.

Next: IP addressing.
