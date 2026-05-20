---
module: 2
position: 2
title: "WebSockets, gRPC, and real-time"
objective: "When HTTP request/response isn't enough."
estimated_minutes: 5
---

# WebSockets, gRPC, and real-time

## When HTTP isn't enough

Standard HTTP is request/response. Client asks, server answers, done. For:
- Chat / messaging.
- Live updates.
- Multiplayer games.
- Collaborative editing.

You need persistent bidirectional communication. Various solutions evolved:

- **Long polling** (over HTTP).
- **Server-Sent Events (SSE)** (HTTP-based, server → client only).
- **WebSockets** (full-duplex on TCP).
- **WebRTC** (peer-to-peer media).
- **gRPC streaming** (HTTP/2-based).

## WebSockets

Starts as HTTP, upgrades to a persistent bidirectional TCP connection:

```
GET /chat HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: ...

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: ...
```

After the handshake: bidirectional frames flow until either side closes. Low overhead per message after setup.

```javascript
const ws = new WebSocket('wss://example.com/chat');
ws.onmessage = (evt) => console.log(evt.data);
ws.send('hello');
```

Used by: chat apps, collaborative editors, live dashboards, multiplayer games.

WebSocket over TLS = `wss://` (port 443 typically). Plain WebSocket = `ws://` (port 80).

## Server-Sent Events (SSE)

Server → client only. Simpler than WebSockets if you don't need client → server beyond the initial subscription:

```javascript
const sse = new EventSource('/events');
sse.onmessage = (evt) => console.log(evt.data);
```

```
GET /events HTTP/1.1
Accept: text/event-stream

HTTP/1.1 200 OK
Content-Type: text/event-stream

data: {"event": "update"}

data: {"event": "another"}
```

Works through more proxies (it's just HTTP), auto-reconnects, simpler than WebSockets. Good for news feeds, status updates, alerts.

## Long polling

Old workaround:

```
Client: GET /poll?since=12345
Server: holds connection until something happens, then responds
Client: GET /poll?since=12346
```

Higher latency than WebSockets, more connections, but works through any HTTP infrastructure. Mostly obsolete; SSE or WebSockets replace it.

## gRPC

Modern RPC framework from Google:

- Uses HTTP/2 as transport.
- Protocol Buffers (binary, schema-validated) for messages.
- Supports unary, server streaming, client streaming, bidirectional streaming.
- Code generation for many languages.

```protobuf
service UserService {
  rpc GetUser (UserRequest) returns (User);
  rpc StreamUsers (Filter) returns (stream User);
}
```

Strong for service-to-service inside a company. Browser support is limited (gRPC-Web bridges this) but improving.

Trade-offs vs REST:
- **Pros:** Strongly typed (no field-name typos), fast (binary), streaming built-in.
- **Cons:** Harder to debug (binary; less curl-friendly), browser support is awkward, proxies and tools don't all speak gRPC.

For internal microservices: gRPC is often a great choice. For public APIs: REST + JSON usually wins on developer ergonomics.

## WebRTC

Peer-to-peer for real-time audio/video/data. Browser-native API.

- **STUN.** Helps peers discover their public IP through NAT.
- **TURN.** Relays when direct P2P fails (symmetric NAT scenarios).
- **ICE.** Coordinates the above to find best path.
- **DTLS / SRTP.** Encrypts the data.

Used by: video calling (Google Meet, Discord, Whereby), real-time games, browser-to-browser file transfer.

Complex setup; libraries (mediasoup, LiveKit, Twilio Video) abstract most of it.

## Real-time at scale

Building a chat service for millions of concurrent users:

1. **Connection brokers.** WebSocket servers handle long-lived connections (different scaling profile than stateless HTTP).
2. **Pub/sub backend.** Redis Pub/Sub, NATS, Kafka — decouple "incoming message" from "deliver to subscribers."
3. **State storage.** Where messages persist (PostgreSQL, Cassandra, etc.).
4. **Presence service.** Who's online now.
5. **Fan-out strategy.** Push to many subscribers efficiently.

Tools like Pusher, Ably, PubNub, Soketi handle this as a service. Self-hosted alternatives: Centrifugo, Mercure.

## Heartbeats and reconnection

Persistent connections need heartbeats — pings every N seconds. NAT timeouts (typically 30-120s) drop idle UDP and sometimes TCP connections.

Clients should reconnect with exponential backoff on disconnect. Libraries (Socket.IO, reconnecting-websocket) handle this.

For state: have a strategy for messages sent while disconnected. Either:
- Server queues; client receives backlog on reconnect.
- Client tracks "last seen" and re-fetches missed events.

## Choosing — flowchart

- One-direction, real-time updates from server? → **SSE.**
- Bidirectional, low-latency? → **WebSockets.**
- Strongly-typed service-to-service? → **gRPC.**
- Audio/video between peers? → **WebRTC.**
- Public API, many languages? → **REST (HTTP/1.1 or HTTP/2).**

Most apps use multiple — REST API + WebSocket for live updates is a common combination.

## Summary

- WebSockets: bidirectional, full-duplex, on persistent TCP. Browser-native.
- SSE: server → client only; HTTP-based; simpler.
- gRPC: HTTP/2 + Protobuf; great for internal services.
- WebRTC: peer-to-peer media; complex but standard for video.
- At scale: connection brokers + pub/sub backbone.
- Real-time clients need heartbeats + reconnection logic.

Next: email and SMTP.
