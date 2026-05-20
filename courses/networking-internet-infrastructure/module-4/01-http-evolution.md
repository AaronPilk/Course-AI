---
module: 4
position: 1
title: "HTTP/1.1 to HTTP/2 to HTTP/3"
objective: "Why HTTP keeps evolving and what each version solves."
estimated_minutes: 6
---

# HTTP/1.1 to HTTP/2 to HTTP/3

## HTTP/1.1 — the baseline

Published in 1997, dominant for ~20 years. Plain text protocol over TCP:

```
GET /index.html HTTP/1.1
Host: example.com
User-Agent: curl/8.0

HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1234

<html>...
```

Strengths:
- Simple. Anyone can read.
- Universal browser/server support.

Weaknesses:
- One request per connection at a time (head-of-line blocking).
- Workarounds (parallel connections, pipelining) all imperfect.
- Verbose headers; no compression.
- Slow for many small resources (typical modern page = 80+ requests).

## HTTP/2 — multiplexed

Published 2015. Goals: reduce latency on existing TCP.

Key changes:
- **Binary protocol.** Wire format is binary; easier to parse.
- **Multiplexing.** Many requests/responses interleaved on one TCP connection.
- **Header compression.** HPACK; repeated headers compressed.
- **Server push.** Server can preemptively send resources (rarely used; mostly deprecated).
- **Prioritization.** Some streams more important than others.

Result: one TCP connection serves many requests in parallel without head-of-line blocking at the HTTP layer.

But TCP itself still has head-of-line blocking — a lost packet stalls ALL streams on the connection until retransmitted. The HTTP-layer multiplexing only goes so far.

## HTTP/2 in practice

Most modern browsers + servers speak HTTP/2 by default for TLS-encrypted connections. nginx, Apache, Caddy, cloud load balancers all support it.

For backend services: gRPC uses HTTP/2 as its transport. So service-to-service communication often is already HTTP/2.

Performance impact: bigger for many-small-resource pages (typical web), smaller for big-file downloads.

## HTTP/3 — over QUIC

Published 2022. Solves TCP head-of-line blocking by abandoning TCP. Built on QUIC (Quick UDP Internet Connections):

- **Runs on UDP.** Avoids TCP's congestion control and head-of-line blocking.
- **Integrated TLS 1.3.** Handshake is 1-RTT (sometimes 0-RTT for resumption).
- **Stream-level reliability.** Each stream is its own; loss in stream A doesn't block stream B.
- **Connection migration.** Switching networks (Wi-Fi to cell) doesn't drop the connection — QUIC connections are identified by an ID, not the IP+port tuple.

Adoption: Cloudflare, Google, Facebook, Akamai, Fastly all support. Browser support: Chrome, Firefox, Safari, Edge. Most major sites support HTTP/3 by 2025-2026.

Real-world impact:
- Faster initial connection (fewer RTTs).
- Smoother on lossy networks (mobile, public Wi-Fi).
- Better latency tail (no head-of-line blocking).

## Looking at HTTP versions

```
$ curl -v --http2 https://example.com
$ curl -v --http3 https://example.com
$ nghttpd / nghttp2                          # tools for HTTP/2
```

In Chrome: DevTools → Network → Protocol column shows h1 / h2 / h3.

## Headers — what they do

```
Cache-Control: max-age=86400, public        # cache for a day
Content-Type: application/json
Content-Encoding: gzip                       # compressed
Set-Cookie: session=abc; HttpOnly; Secure
Authorization: Bearer eyJhbGc...
X-Frame-Options: DENY                        # don't be framed
Strict-Transport-Security: max-age=31536000 # HSTS
ETag: "abc123"                               # for conditional gets
```

Modern HTTP has dozens of standard headers + endless custom ones. Each is opt-in functionality.

## Conditional requests — caching done right

```
Client: GET /resource
Server: 200 OK + ETag: "abc123"

Client: GET /resource
        If-None-Match: "abc123"
Server: 304 Not Modified              ← saves bandwidth
```

Both `ETag` and `Last-Modified` enable this. Browsers and CDNs use it for cache validation.

For your API: return ETags on GET responses; respect If-None-Match in clients. Cheap performance win.

## Compression

```
Accept-Encoding: gzip, br
Content-Encoding: br
```

`gzip` (universal, ~70-90% size reduction for text). `br` (Brotli, modern, slightly better compression).

For an API returning JSON, gzip easily 10x'es throughput by reducing payload size. Most servers / CDNs / frameworks do this automatically.

For images: use modern formats (WebP, AVIF) which compress better than JPEG/PNG.

## REST vs RPC vs GraphQL — application-layer choices

On top of HTTP, you can model API interactions as:

- **REST.** Resources + HTTP verbs. GET /users/:id, POST /orders. Stateless. Cacheable. Widely supported.
- **RPC (gRPC).** Function calls. Strongly typed (Protobuf). HTTP/2-based. Fast for service-to-service.
- **GraphQL.** Single endpoint; clients query for exactly what they need. Reduces over-fetching for complex UIs.

Choice depends on consumer + complexity. REST for public APIs; gRPC for internal microservices; GraphQL when many clients consume different fields from rich data.

## Common HTTP mistakes

- **Caching public data without Cache-Control.** Browser caches naively or never.
- **Setting cookies on every response.** Bloats headers; redundant.
- **Long URLs with state.** Use POST bodies for >2KB data.
- **Returning 200 for errors.** Use 4xx/5xx status codes properly.

## Summary

- HTTP/1.1: text protocol, one-at-a-time per connection.
- HTTP/2: binary, multiplexed, header-compressed. Reduces latency.
- HTTP/3: over QUIC/UDP, no TCP head-of-line blocking, connection migration. Modern best.
- Use HTTP/3 where supported; fall back gracefully.
- Conditional requests + compression are cheap wins.

Next: WebSockets, gRPC, real-time.
