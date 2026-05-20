---
module: 4
position: 4
title: "OpenAPI and contract-first design"
objective: "Spec as the single source of truth."
estimated_minutes: 5
---

# OpenAPI and contract-first design

## What OpenAPI is

OpenAPI (formerly Swagger) is a YAML or JSON spec describing an HTTP API: endpoints, parameters, request bodies, responses, schemas, auth.

Once you have it, tools generate:
- Interactive docs (Swagger UI, Redoc, Stoplight).
- Client SDKs (OpenAPI Generator) in many languages.
- Server stubs.
- Test fixtures.
- Mock servers (Prism, mockoon).

OpenAPI 3.x is the current spec; AsyncAPI is the parallel spec for event-driven / WebSocket APIs.

## Sample spec

```yaml
openapi: 3.1.0
info:
  title: Users API
  version: 1.0.0
paths:
  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: Not found
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
          format: email
      required: [id, name, email]
```

This snippet generates the docs page, the type definitions in client SDKs, and the validation in tools.

## Contract-first vs code-first

**Contract-first:** Write the spec first; generate stubs / clients from it. Code conforms to spec.

**Code-first:** Write the code with annotations; generate the spec from it.

Both work. Contract-first is cleaner for teams designing APIs deliberately; code-first is easier for incremental adoption.

For most teams: contract-first for new APIs (alignment before code); code-first to retroactively spec existing APIs (annotations next to handlers).

## Code-first tooling

- **Python:** FastAPI generates OpenAPI from type hints and Pydantic models. Excellent.
- **Node:** Hono, NestJS, Express with swagger-jsdoc. Annotations or schema definitions.
- **Go:** swag, oapi-codegen.
- **Rust:** utoipa.
- **TypeScript:** tRPC has its own RPC spec; tsoa for OpenAPI.

For new TypeScript APIs: tRPC's type-safe approach is compelling for internal APIs. For public APIs: OpenAPI is the universal standard.

## Schemas — types you define once

Define types in `components/schemas`; reference them anywhere:

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id: { type: string }
        name: { type: string }
    UserList:
      type: object
      properties:
        data:
          type: array
          items: { $ref: '#/components/schemas/User' }
        next_cursor: { type: string }
```

Reuse across endpoints. Refactoring renames in one place.

## Validating with the spec

Tools like:
- **Spectral.** Linter for OpenAPI specs.
- **swagger-codegen.** Generate clients/servers.
- **Stoplight Studio.** GUI for spec editing.
- **Postman.** Import specs as collections.

In CI: lint your spec on every PR. Catches mistakes (missing required fields, unused schemas, conflicting paths).

## Client SDK generation

The biggest payoff:

```bash
openapi-generator generate -i openapi.yaml -g typescript-axios -o ./sdk
openapi-generator generate -i openapi.yaml -g python -o ./sdk-python
openapi-generator generate -i openapi.yaml -g go -o ./sdk-go
```

Generates typed clients for every language. Consumers `npm install your-sdk`; have autocomplete, types, request/response handling.

For high-quality public APIs: generated SDKs in 3-5 popular languages. Reduces friction; enables type-safe consumption.

Stripe, Twilio, etc. publish official SDKs that are largely generated from specs + hand-polished.

## Mock servers

Generate a mock server from your spec:

```bash
prism mock openapi.yaml
```

Returns example responses. Useful for:
- **Frontend dev before backend ready.**
- **Testing client SDKs.**
- **Demo / sales environments.**

## Versioning the spec

The spec itself has a version field; should align with API version. Each major release of the API has a published spec file.

For schema additions: bump the patch / minor; spec changes minimally. For breaking changes: new major version, new spec file.

Some teams commit the spec to git alongside code; CI verifies spec ↔ code consistency on every PR.

## Beyond REST — AsyncAPI, GraphQL

OpenAPI is for HTTP REST. Adjacent specs:

- **AsyncAPI.** For event-driven (Kafka, WebSocket, MQTT). Same idea.
- **GraphQL.** Schema-first natively; the schema IS the spec.
- **gRPC.** Protocol Buffers define the schema; generate clients from proto files.

All achieve similar outcomes: contract-driven design, code generation, tooling ecosystem. Pick by your transport.

## Documentation deployment

Host docs via:
- **Swagger UI.** Free, simple.
- **Redoc.** Cleaner than Swagger UI for reading.
- **Stoplight.** Hosted; collaboration features.
- **Mintlify, ReadMe, Bump.sh.** Modern docs platforms.

For polished public-facing docs: Mintlify / Bump.sh / Stoplight. For internal: Redoc with a static deploy is enough.

## Common mistakes

- **No spec.** Docs drift from code; consumers fly blind.
- **Outdated spec.** Drifts from actual API; consumers hit unexpected behavior.
- **Manual client maintenance.** Generated clients reduce drift.
- **No examples in spec.** Examples bring schemas to life.
- **Inconsistent style across endpoints.** Spectral with custom rules enforces consistency.

## Summary

- OpenAPI: industry standard spec for HTTP APIs.
- Tools: docs (Swagger UI, Redoc), clients (openapi-generator), mocks (Prism), lint (Spectral).
- Contract-first or code-first; both produce a spec.
- Generated SDKs in multiple languages are the big payoff.
- Mock servers unblock frontend dev.
- Maintain the spec in CI; lint and validate.

Module 4 complete. Next module: operating APIs.
