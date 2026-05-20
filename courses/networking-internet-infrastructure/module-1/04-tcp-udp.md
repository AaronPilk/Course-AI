---
module: 1
position: 4
title: "TCP vs UDP: connection-oriented and not"
objective: "The two main transport protocols and what each is for."
estimated_minutes: 6
---

# TCP vs UDP: connection-oriented and not

## The transport layer's job

IP delivers packets to a host. But how does the data get to the right *application* on that host? And what if packets arrive out of order, get lost, or duplicated?

That's the transport layer's job. The two big protocols: **TCP** (reliable, ordered) and **UDP** (unreliable, fast).

## Ports

Every TCP / UDP connection includes:

- Source IP + Source port
- Destination IP + Destination port

Port numbers are 16-bit (0-65535). They identify which app on the host:

- 80 = HTTP
- 443 = HTTPS
- 22 = SSH
- 53 = DNS
- 5432 = Postgres
- 6379 = Redis
- 3306 = MySQL
- 25 = SMTP

Ports < 1024 are "well-known" (require root to bind on Unix). 1024-49151 = registered. 49152-65535 = ephemeral (used as client-side temporary).

## TCP — connection-oriented

TCP creates a connection between two endpoints, then sends data reliably:

```
Client                 Server
  |                       |
  |---- SYN ------------->|     "I want to talk"
  |<--- SYN-ACK ----------|     "OK, let's"
  |---- ACK ------------->|     "Confirmed"
  |                       |
  |---- data ------------>|     reliable stream
  |<--- ACK --------------|
  |---- data ------------>|
  |<--- ACK --------------|
  |                       |
  |---- FIN ------------->|     "I'm done"
  |<--- FIN-ACK ----------|
```

The 3-way handshake (SYN, SYN-ACK, ACK) establishes the connection. Then data flows; each byte is acknowledged; lost packets are retransmitted; out-of-order packets reassembled.

The "FIN" closes cleanly. Crashed connections eventually time out.

## TCP guarantees

- **Reliability.** Lost data is retransmitted.
- **Ordering.** Data arrives in the order sent.
- **Flow control.** Sender doesn't overwhelm receiver.
- **Congestion control.** Sender slows down when network is congested.

Cost: more bytes overhead, more round trips, head-of-line blocking.

## UDP — connectionless

UDP just sends packets. No handshake, no acks, no retransmits, no ordering:

```
Sender                 Receiver
  |---- packet --------->|
  |---- packet --------->|     might arrive out of order
  |---- packet --------->|     might be lost
  |---- packet --------->|     might be duplicated
```

If you need any of TCP's guarantees, the application has to provide them. UDP is "best effort."

Used for:

- **DNS queries.** Small, single-packet; retry on timeout.
- **Real-time media.** Voice / video; losing a frame is better than waiting for retransmission.
- **Gaming.** Latency over reliability.
- **QUIC.** Modern protocol that builds reliability on UDP (used by HTTP/3).

## When to use each

| Need | Protocol |
|------|----------|
| Web pages, APIs, file transfer, email | TCP |
| Video calls, gaming | UDP |
| DNS | UDP (TCP fallback) |
| Streaming media | UDP (or HTTP/TCP if buffered) |
| Real-time sensor data | UDP |

For most application development: TCP via HTTP, or UDP via a higher-level abstraction (gRPC over QUIC, WebRTC for media).

## TCP states

```
$ ss -t                  # show all TCP connections
```

States you'll see:

- **LISTEN.** Server waiting for connections.
- **ESTABLISHED.** Active connection.
- **TIME_WAIT.** Closing; waiting for stragglers.
- **CLOSE_WAIT.** Remote closed; we should close.
- **SYN_SENT, SYN_RECV.** Mid-handshake.

Too many TIME_WAIT can exhaust ports on busy servers (tune `net.ipv4.tcp_tw_reuse`). Too many CLOSE_WAIT often means app bugs (not calling `close()`).

## TCP performance

Slow connections hurt because of:

- **Round-trip time (RTT).** Each handshake takes 1 RTT; first data takes 1.5 RTT.
- **Slow start.** TCP starts cautiously and ramps up.
- **Head-of-line blocking.** Lost packet stalls everything after.

For multiple parallel things, traditional HTTP/1.1 opens multiple TCP connections. HTTP/2 multiplexes on one connection but still suffers head-of-line blocking. HTTP/3 (QUIC over UDP) fixes this.

## UDP performance

UDP has none of TCP's overhead. Fast on the wire. But:

- App must handle loss, ordering, duplication.
- No congestion control means UDP traffic can crowd out TCP (UDP "flood" attacks).

Networks sometimes rate-limit or drop UDP more aggressively to prevent abuse. QUIC adds careful congestion control.

## NAT and TCP/UDP

NAT (Network Address Translation) maps internal IP:port → public IP:port. For TCP: easy — connections are bidirectional, NAT tracks state.

For UDP: harder. No "connection" to track. NAT keeps short-lived mappings (often ~30s). Apps that need long UDP flows (VoIP, gaming) use keepalive packets or STUN/TURN protocols to maintain the mapping.

## Inspecting traffic

```
$ sudo tcpdump -i any port 443     # all HTTPS traffic
$ sudo tcpdump -i any host 1.2.3.4
$ sudo tcpdump -i any -w cap.pcap   # capture for Wireshark
```

Filter expressions are powerful. For app-level analysis, Wireshark on the captured pcap shows protocols, timing, errors.

## Common confusions

- **HTTP is on top of TCP** (or QUIC for HTTP/3). Different layers.
- **`netstat` is deprecated**, use `ss`.
- **Port 80 vs port 443.** Port 80 = HTTP plaintext; 443 = HTTPS (HTTP over TLS).
- **"Open port" depends on context.** Could mean a service listening; could mean a firewall allowing through.

## Summary

- Transport layer multiplexes packets to apps via ports.
- TCP: connection-oriented, reliable, ordered. Use for almost everything.
- UDP: connectionless, unreliable, fast. Use for real-time / latency-sensitive.
- QUIC: modern protocol over UDP, adds TCP-like reliability. Used by HTTP/3.
- Ports < 1024 are well-known; > 49151 are ephemeral.
- `ss -t` shows TCP state; `tcpdump` / Wireshark for deep inspection.

Next module: DNS.
