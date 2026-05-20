---
module: 1
position: 2
title: "Resource modeling: nouns, not verbs"
objective: "What to expose as resources and how to name them."
estimated_minutes: 6
---

# Resource modeling: nouns, not verbs

## Resources, not actions

Think of your API as a tree of resources — things that exist — rather than a list of actions to perform.

Bad (action-oriented):
```
POST /createUser
POST /updateUserProfile
GET /listUserOrders
POST /sendOrderConfirmation
```

Good (resource-oriented):
```
POST /users
PATCH /users/{id}
GET /users/{id}/orders
POST /orders/{id}/confirmations
```

The shape becomes consistent; consumers can guess the rest of the API from a few examples.

## Naming conventions

- **Plural nouns.** `/users`, `/orders`, `/products` — even when fetching one. `GET /users/123` not `GET /user/123`.
- **Lowercase, hyphenated (kebab).** `/payment-methods`, not `/PaymentMethods` or `/payment_methods`. (Underscore vs hyphen is debated; pick one.)
- **No file extensions.** `/users/123` not `/users/123.json`. Use Accept header for content type.
- **No trailing slashes** (or be consistent; either works, but pick one).

These are conventions, not laws. Stripe uses underscore_case in URLs (`/payment_methods`); GitHub uses kebab-case (`/pull-requests`). Either works if applied consistently.

## Hierarchy and nesting

Express relationships through URL hierarchy:

```
GET /users/123/orders          → orders belonging to user 123
GET /orders/456                → order 456 (direct)
GET /orders/456/items          → items in order 456
```

Avoid deep nesting (>3 levels). It looks elegant but:
- Long URLs.
- Multiple routes to the same resource (`/users/123/orders/456` vs `/orders/456`).
- Bracket complexity in client code.

Two levels deep is typical; three is occasional; deeper usually means restructure.

## Sub-resources vs query parameters

Two ways to express "orders for user 123":

```
GET /users/123/orders                  # sub-resource
GET /orders?user_id=123                # query param
```

Both work. Choose:
- **Sub-resource** when the parent is in the URL hierarchy (you're "drilling down").
- **Query param** for filtering when the resource is top-level.

Consistent within an API matters more than which choice.

## Identifying resources

Each resource should have a stable, unique URL. Two approaches:

- **Database IDs.** `/users/abc123-def`. Simple; can leak info (sequential IDs reveal volume).
- **Slugs.** `/users/aaron-bell`. SEO-friendly but mutable (renames).
- **Composite.** `/orders/2026-05-001234`. Date-prefix for easy sorting.

For public APIs: UUIDs or random IDs prevent enumeration attacks ("guess order #124, then #125, ..."). Sequential auto-increment IDs in URLs are a security anti-pattern.

## Representations

A resource exists conceptually; the API returns *representations* of it. Same user, different views:

```
GET /users/123                         → full user object
GET /users/123?fields=id,name          → sparse fieldset
GET /users/123?expand=team             → embedded team
```

Sparse fieldsets and expansions are common patterns for letting clients control payload size without separate endpoints.

For different consumers (mobile vs desktop), some APIs maintain different versions or use BFFs (Backend For Frontend) on top of a base API.

## Singleton resources

Sometimes there's only one of something:

```
GET /me                                → the authenticated user
GET /me/settings
PATCH /me/settings
```

Singleton resources don't have IDs; they're implicit (the authenticated context). Useful for current-user endpoints, system-wide settings, etc.

## Compound and action resources

For things that don't fit pure CRUD:

**Search.** `GET /search?q=foo` — collection-like; returns matches.

**Aggregation.** `GET /reports/sales?start=2026-01-01` — derived data.

**Bulk operations.** `POST /users/bulk-import` with array; or treat the bulk operation as a resource: `POST /import-jobs` returns job ID; check status async.

**Non-CRUD actions.** `POST /payments/{id}/captures` (capture a payment); `POST /messages/{id}/resends`.

These deviate from pure CRUD but stay in the resource paradigm.

## Polymorphic resources

Sometimes one URL returns different shapes:

```
GET /events/123                        → could be {"type": "login"} or {"type": "purchase"}
```

Patterns:
- **Tagged unions.** Include `"type"` field; clients dispatch.
- **Different endpoints per type.** `/events/logins/123`, `/events/purchases/123`.
- **GraphQL-style fragments.** Different fields per type.

For REST: tagged unions are common. Document the variants.

## URI design pitfalls

- **Verbs in URLs.** Stick to nouns.
- **Mixing conventions.** Some endpoints kebab-case, others camelCase. Pick one.
- **Querying via path.** `/users/by-email/aaron@example.com` — should be `/users?email=aaron@example.com`.
- **Encoded characters everywhere.** If users have IDs with spaces, generate cleaner IDs.

## Versioning hints

Don't version per-endpoint. Version at the URL prefix or API gateway level:

```
/v1/users
/v2/users
```

Or via header:

```
GET /users
API-Version: 2026-01-15
```

Stripe famously uses dated versions per request — covered in detail in Module 4.

## Documentation upfront

Designing resources is also designing the docs. For each resource, document:

- What it represents.
- Its fields (with types, optionality, examples).
- Endpoints that operate on it.
- Lifecycle / state diagram.
- Relationships to other resources.

OpenAPI / Swagger specs encode all this — they generate docs and client SDKs.

## Mistakes to avoid

- **Sequential integer IDs in public URLs.** Enumeration risk.
- **Inconsistent pluralization.** `/user` here, `/users` there.
- **Deep nesting.** Three levels max.
- **Verb-in-URL for "the action that doesn't fit."** Use sub-resource pattern.
- **No spec.** Docs drift from implementation; consumers suffer.

## Summary

- Resources = nouns (plural, lowercase, consistent style).
- Hierarchy expresses relationships (2-3 levels max).
- Sub-resources for "drilling down"; query params for filtering.
- UUIDs / opaque IDs for public APIs (no enumeration).
- Non-CRUD actions: model as sub-resource or use Google's `:action` style.
- OpenAPI / Swagger from day one.

Next: HTTP methods.
