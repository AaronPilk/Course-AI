---
module: 5
position: 4
title: "REST vs gRPC vs GraphQL — picking right"
objective: "Match the API style to the consumer."
estimated_minutes: 5
---

# REST vs gRPC vs GraphQL — picking right

## The three modern options

For a new API, the candidates:

- **REST.** HTTP + JSON, resource-oriented. Conventional, broadly supported.
- **gRPC.** HTTP/2 + Protobuf, RPC-style. Fast, strongly typed.
- **GraphQL.** Single endpoint; client specifies query shape. Flexible.

Each has different strengths. Pick by consumer + use case.

## REST — the default

**Strengths:**
- Universal client support (every language, browser-native).
- Plays well with HTTP infrastructure (caching, CDNs, proxies, gateways, browsers).
- Easy to debug (curl, browser dev tools).
- Conventional patterns reduce cognitive load.

**Weaknesses:**
- Verbose (HTTP overhead per request).
- Over- or under-fetching (return more or less than needed).
- No standard for nested resource composition.
- JSON parsing overhead at high throughput.

**Use when:**
- Public APIs (anyone might consume; broad reach matters).
- Browser is a primary client.
- CDN/edge caching benefits the workload.
- Conventional shape suffices.

Most APIs should start REST. Default for a reason.

## gRPC — high-performance RPC

**Strengths:**
- Binary protocol (Protobuf); much smaller than JSON.
- HTTP/2 multiplexing + streaming.
- Strongly typed; .proto generates clients in many languages.
- Built-in deadlines, retries, cancellation.
- Bidirectional streaming.

**Weaknesses:**
- Limited browser support (gRPC-Web bridges but awkward).
- Binary = harder to debug (no curl-friendly).
- Less universal tooling than REST.
- Proxies / WAFs / observability may not understand gRPC.

**Use when:**
- Service-to-service inside a company (microservices).
- High throughput / low latency requirements.
- Strongly-typed contracts important.
- Bidirectional streaming needed.

Common pattern: gRPC internally, REST gateway externally. AWS / Google Cloud do this.

## GraphQL — client-driven queries

```graphql
query {
  user(id: 123) {
    name
    email
    orders {
      id
      total
      items { name price }
    }
  }
}
```

Client specifies exactly the shape it wants; server returns just that. Reduces over-fetching; eliminates round trips.

**Strengths:**
- Client controls payload shape; ideal for varied UIs.
- Strongly typed schema.
- Single endpoint; introspection enables tooling.
- Aggregates across backend services (BFF pattern).

**Weaknesses:**
- Complexity at the server (resolvers, N+1 query risks).
- Caching is harder (POST + body = cache key tricky).
- Authorization granularity (each field separately).
- Tooling required (Apollo, GraphQL Yoga, etc.).

**Use when:**
- Rich, varied client UIs (mobile + web with different needs).
- Many backend services to aggregate.
- Frontend teams want flexibility.

Common pattern: GraphQL as a BFF (Backend For Frontend) over REST/gRPC microservices.

## The choice in practice

| Scenario | Pick |
|----------|------|
| Public API for developers | REST |
| Service-to-service, high throughput | gRPC |
| Mobile + web with varied needs | GraphQL (or REST + careful design) |
| AI / ML API (token-by-token) | REST with SSE, or gRPC streaming |
| Real-time data | WebSocket / gRPC streaming / SSE |
| CRUD app | REST |
| File upload / large transfer | REST (HTTP semantics) |

The choice isn't religious. Pick by who consumes and what they need.

## Hybrid approaches

Common in production:

- **REST + gRPC.** REST for external, gRPC internal.
- **REST + WebSocket.** REST for normal API, WebSocket for live updates.
- **GraphQL + REST.** GraphQL BFF for frontend, REST internal.
- **REST + SSE.** REST + Server-Sent Events for one-way streaming.

Hybrid is fine; just be intentional about which protocol where.

## Migration thoughts

If you have REST and want gRPC for service-to-service: keep REST for external; expose gRPC internally; teams pick. Don't force migration.

If you have REST and want GraphQL: layer GraphQL as a BFF without removing REST endpoints. Frontend gradually migrates queries; backend keeps existing surface.

## What I'd actually do (2026)

For new projects:

- **Public API + developer ecosystem.** REST + OpenAPI + generated SDKs.
- **Internal microservices.** gRPC for high-traffic; REST for low-traffic.
- **Mobile + web app frontend.** REST works; consider GraphQL if frontend teams want flexibility AND have GraphQL expertise.
- **Real-time features.** WebSocket or SSE on top of REST.

Avoid:
- gRPC for browser-first apps without strong reason.
- GraphQL because it's trendy.
- REST for service-to-service when gRPC's speed matters.
- Inventing your own protocol.

The right tool depends on consumer; consumer determines tool more than developer preference.

## Cost / complexity profile

- REST: lowest setup; conventional patterns; mature tooling.
- GraphQL: moderate setup; specialized libraries; flexible.
- gRPC: highest tooling setup; performance payoff at high throughput.

Match to your team's experience and the actual problem. Premature complexity is the most common mistake.

## Common mistakes

- **gRPC for browser apps without gRPC-Web.** Doesn't work.
- **GraphQL N+1 queries.** Resolver explodes; needs DataLoader.
- **REST when gRPC would be 10x faster internally.** Performance wasted.
- **Three protocols simultaneously for one app.** Maintenance burden.

## Summary

- REST: universal, conventional, defaults. Most cases.
- gRPC: fast service-to-service, binary, strong types. Internal microservices.
- GraphQL: client-driven shape, BFF for varied UIs. Specific cases.
- Hybrid is normal in production.
- Pick by consumer; not by trend.

## Course complete

You've covered the API engineering surface from design through evolution to operations. The patterns transfer across protocols and consumer types — what matters is the discipline: stable resources, predictable error responses, versioning with care, authentication done right, observability built in.

Next steps: pick one API you've built or want to build, run through these modules as a checklist. Identify gaps; fix the highest-impact ones (probably authorization tests, error format, OpenAPI spec). Iterate quarterly. APIs that age well are the result of consistent application of these basics over years.
