---
module: 4
position: 1
title: "Versioning strategies — URL, header, none"
objective: "How to evolve an API without breaking consumers."
estimated_minutes: 5
---

# Versioning strategies — URL, header, none

## Why version at all

APIs evolve. New fields appear; deprecated fields disappear; behaviors shift. Consumers depend on stable contracts.

Versioning is how you ship changes without breaking consumers in flight. Strategies vary; the choice constrains everything else.

## URL versioning

The most common:

```
GET /v1/users
GET /v2/users
```

Pros:
- **Obvious.** Anyone seeing the URL knows the version.
- **Easy routing.** Different versions can be entirely different services.
- **Easy testing.** Hit a specific version explicitly.

Cons:
- **URLs change between versions.** Consumers must update bookmarks, configs.
- **Resources have multiple URLs.** `GET /v1/users/123` vs `GET /v2/users/123` are technically different resources by URL.

Most major APIs use this (Stripe in v3 form via headers, but the URL stays at `/v1/...`; AWS uses URL versioning; GitHub uses URL versioning).

## Header versioning

```
GET /users
API-Version: 2
```

Or via Accept header:

```
GET /users
Accept: application/vnd.example.v2+json
```

Pros:
- **URLs are stable across versions.**
- **Default version possible.** No header = latest, with caveats.

Cons:
- **Hidden.** New developers might not realize multiple versions exist.
- **Browser awkwardness.** Hard to share a versioned URL via link.
- **Caching considerations.** Caches need to vary on the header.

Used by GitHub (also supports URL versioning), some smaller APIs. Better for internal-ish APIs where consumers are sophisticated.

## Date versioning (Stripe)

Stripe uses dated versions:

```
GET /v1/users
Stripe-Version: 2023-08-16
```

Each customer is "pinned" to a version when they sign up; can manually upgrade. New breaking changes ship with new date versions; old versions keep working.

Pros:
- **Granular evolution.** Many small versions instead of huge major-version jumps.
- **Per-account version.** Migrations on each customer's timeline.

Cons:
- **Operational burden.** Server must maintain many versions in parallel.
- **Documentation complexity.** Per-version differences.

Suitable for: high-value APIs with sophisticated consumers (Stripe, Plaid). Not for casual APIs.

## No versioning (continuous evolution)

Just keep evolving the API. Add new fields; never break existing ones.

```
v1: { "name": "Aaron", "email": "..." }
later: { "name": "Aaron", "email": "...", "team": "eng" }
```

Pros:
- **Simple.** One version to maintain.
- **No migration pain.**

Cons:
- **Locked into compatibility forever.** Can't fix bad design.
- **Old fields linger.** Cruft accumulates.

Works for: internal APIs where consumers are easily updated. Stripe-style date versioning solves this with structure.

## Major vs minor versioning

Semantic versioning concepts:

- **Major (v1, v2).** Breaking changes. Consumers must update.
- **Minor.** Additive only. New fields, new endpoints. No break.
- **Patch.** Bug fixes. No client-visible change.

For URL versioning: only majors get URL bumps. Minor changes (new fields, new endpoints) added to current version.

For date versioning: every change gets a date version, breaking or not.

## When to bump major

Bump major when:
- Removing a field that consumers might use.
- Changing a field's type or meaning.
- Changing required fields.
- Renaming endpoints.
- Changing authentication requirements.
- Changing default behaviors.

Don't bump for:
- Adding optional fields.
- Adding new endpoints.
- Internal performance improvements.
- Adding new optional headers.

Be conservative — major version bumps are expensive for consumers and you. Most "should we bump?" decisions can be solved by additive changes.

## Lifecycle of a version

```
1. Released as current.
2. Stable for years.
3. Newer version released; old continues to work.
4. Deprecation announced (often years before sunset).
5. Sunset date.
6. Old version returns 410 Gone (or just shut down).
```

Realistic timelines: 1-5 years between major versions. Sunsets announced at least 6-12 months in advance. Some APIs (Twilio, Stripe) keep old versions alive for many years.

## Indicating version in responses

Help consumers debug:

```
HTTP/1.1 200 OK
API-Version: 2
Deprecation: Wed, 21 Oct 2026 07:28:00 GMT
Sunset: Wed, 21 Oct 2027 07:28:00 GMT
```

The `Deprecation` and `Sunset` headers (RFC 8594 + draft) signal upcoming changes. Consumers monitoring for these get advance warning.

## Versioning per-resource vs per-API

Some APIs version each endpoint independently:

```
GET /users (v1)
GET /orders (v2 — newer; breaking change here)
```

Confusing for consumers. Most APIs version the whole API; if any endpoint has a breaking change, it's a major bump for everything.

## API gateways and versioning

For larger APIs, gateways route `/v1/*` to legacy backends and `/v2/*` to current. Allows old versions to keep running on older code branches while new development goes into the current version.

Cost: maintaining multiple deployments. Often the practical limit is 2-3 active versions; older ones get shut down.

## Common mistakes

- **Breaking changes without version bump.** Consumers' apps break overnight.
- **Bumping for every change.** Confusing version sprawl.
- **No deprecation timeline.** Consumers caught off-guard.
- **Multiple versioning strategies in one API.** Pick one.
- **Inconsistent default version.** Old clients hitting newest version accidentally = breaks.

## Summary

- URL versioning: obvious, common, simple. Major versions only.
- Header versioning: stable URLs, hidden complexity.
- Date versioning (Stripe-style): granular, per-account, operationally complex.
- No versioning: add fields freely, never remove. Works for small/internal.
- Bump majors conservatively; favor additive changes.
- Deprecation + Sunset headers signal upcoming changes.

Next: backward-compatible changes.
