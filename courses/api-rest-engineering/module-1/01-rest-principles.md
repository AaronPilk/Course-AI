---
module: 1
position: 1
title: "REST principles — what they really mean"
objective: "What REST is and what it isn't."
estimated_minutes: 6
---

# REST principles — what they really mean

## REST in one sentence

REST (Representational State Transfer) is an architectural style for HTTP APIs that treats interactions as operations on **resources** identified by URLs, using HTTP's own methods and status codes to convey intent.

In practice, "REST" today usually means "JSON over HTTP with conventional URL patterns and verb usage." That's fine. The strict academic definition (HATEOAS, etc.) is rarely implemented; the conventional pattern is widely understood and works.

## The six constraints

Roy Fielding's 2000 PhD thesis defined REST via six constraints:

1. **Client-server.** Separation of concerns.
2. **Stateless.** Each request contains all info needed.
3. **Cacheable.** Responses declare cacheability.
4. **Uniform interface.** Consistent URLs, methods, semantics.
5. **Layered system.** Intermediaries (caches, gateways) work transparently.
6. **Code on demand** (optional). Server can send executable code.

Constraints 1-5 inform good API design. #6 is rarely relevant.

## Why conventions matter

When everyone follows similar patterns, consumers can use your API without reading 100 pages of docs:

- "GET /users → lists users."
- "GET /users/123 → fetches user 123."
- "POST /users → creates a user."
- "PATCH /users/123 → updates."
- "DELETE /users/123 → removes."

Predictable patterns reduce cognitive load. New APIs that follow them are "obvious to use."

Custom RPC-style endpoints (`POST /createUser`, `POST /updateUser`) work but require docs for every endpoint. REST's conventional patterns reduce that overhead.

## URL patterns

Conventions for resources:

- `GET /resources` — list (typically paginated).
- `GET /resources/{id}` — fetch one.
- `POST /resources` — create.
- `PUT /resources/{id}` — replace entirely.
- `PATCH /resources/{id}` — update partially.
- `DELETE /resources/{id}` — remove.

For collections within resources:

- `GET /users/{id}/orders` — that user's orders.
- `POST /users/{id}/orders` — create an order for that user.

For non-CRUD actions, conventional REST struggles. Patterns:

- Treat the action as a resource: `POST /orders/{id}/refunds` (not `POST /orders/{id}/refund`).
- Sub-resource verbs (rare): `POST /orders/{id}:refund` (Google's API style).

Both are pragmatic; pick a style and stick with it.

## Statelessness

Each request must contain enough info to process it. Server doesn't keep session state between requests.

Why:
- **Scalability.** Any server can handle any request.
- **Resilience.** Server crashes don't break other requests.
- **Caching.** Stateless = cacheable.

In practice: authentication is via tokens included on each request, not server-side sessions. Users / clients have state; the API doesn't.

For things that ARE stateful (multi-step wizards, long jobs), model the state as a resource: `POST /jobs` creates one with `status=pending`; subsequent `GET /jobs/{id}` checks status.

## Idempotency

A request is idempotent if making it N times has the same effect as making it once.

- GET — idempotent (reading doesn't change state).
- PUT — idempotent (replace with same data → same result).
- DELETE — idempotent (deleted is deleted).
- POST — NOT idempotent by default (each creates a new resource).
- PATCH — sometimes (depends on semantics).

Why this matters: retries. Network glitches happen; clients retry. Idempotent operations are safe to retry. Non-idempotent ones might create duplicates.

For non-idempotent operations, idempotency keys let clients safely retry — covered in Module 3.

## The Richardson Maturity Model

Leonard Richardson's model classifies APIs by REST maturity:

- **Level 0.** Single URL, one method (XML-RPC, SOAP). Not REST.
- **Level 1.** Multiple URLs (resources), still one method. Tolerable.
- **Level 2.** Multiple URLs + correct HTTP methods + status codes. Most production APIs.
- **Level 3.** Hypermedia — responses include links to related actions (HATEOAS).

Level 2 is the practical target. Level 3 is academically pure but rarely implemented; consumers ignore the hypermedia.

## REST vs RPC

REST: think in resources. "Get this user." Verbs are HTTP methods.

RPC (Remote Procedure Call): think in actions. "GetUser(id=123)." Verbs are part of the endpoint or message.

Both work. REST plays well with HTTP infrastructure (caching, intermediaries, browsers); RPC (especially gRPC) is more efficient and strongly typed.

For public APIs: REST is conventional and easier to consume. For internal services: gRPC often wins.

## Common myths

- **"REST requires JSON."** No. XML, MessagePack, Protobuf — any media type works.
- **"REST = nice URLs."** Helps but not required.
- **"REST is slow."** Modern HTTP/2/3 + JSON is fast enough for most cases.
- **"REST requires HATEOAS."** Academically yes; in practice almost no API does this.

## Best practices summary

For a new API:

- Resources as plural nouns: `/users`, `/orders`, `/products`.
- Standard HTTP methods for CRUD.
- Conventional status codes (200, 201, 204, 400, 401, 403, 404, 409, 422, 500).
- JSON body, JSON error responses, consistent field naming.
- Versioning strategy upfront (covered in Module 4).
- OpenAPI spec from day one.

## Mistakes to avoid

- **Verbs in URLs.** `/getUser` instead of `GET /users/{id}`.
- **Status code 200 for everything.** Use the spectrum.
- **Different field names for same thing across endpoints.** `user_id` here, `userId` there.
- **No pagination on list endpoints.** Eventually a 10MB response and timeout.
- **Putting auth in URLs.** Use headers (`Authorization`).

## Summary

- REST = resources + HTTP methods + status codes. JSON typical.
- Statelessness enables scale and resilience.
- Idempotency matters for retries; GET/PUT/DELETE are; POST isn't.
- Richardson Level 2 is the practical target.
- Conventions reduce cognitive load for consumers.

Next: resource modeling.
