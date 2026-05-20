---
module: 4
position: 2
title: "Backward-compatible change patterns"
objective: "Evolve APIs without breaking consumers."
estimated_minutes: 5
---

# Backward-compatible change patterns

## The compatibility contract

A change is **backward compatible** if existing consumers continue to work without modification. The bar:

1. Old request shapes still accepted.
2. Old response shapes still parseable.
3. Old endpoints still respond.
4. Same auth still works.

If all four hold, you can ship without a major version bump.

## Adding new fields

**To responses:** Safe. Consumers that ignore unknown fields don't care.

```json
// Before
{ "id": 1, "name": "Aaron" }

// After (added "team")
{ "id": 1, "name": "Aaron", "team": "Eng" }
```

Consumers that don't expect "team" simply ignore it. Most JSON parsers do this by default.

**To requests:** Make new fields optional. Server still accepts old requests without them.

```json
// Old request, still works
POST /users { "name": "Aaron" }

// New request
POST /users { "name": "Aaron", "team": "Eng" }
```

## Adding new endpoints

Always safe. Old endpoints keep working.

```
Before: GET /users, POST /users
After: GET /users, POST /users, GET /users/{id}/team
```

Consumers using only old endpoints unaffected.

## Adding new query parameters

Safe if optional. Default behavior matches old behavior.

```
Before: GET /users?limit=20
After: GET /users?limit=20&sort=name
```

Old clients keep getting the default sort; new clients can specify.

## Adding new response status codes

Sometimes adding 422 where you previously returned 400 is "backward compatible" by HTTP family (still 4xx), but consumers checking `status === 400` break.

Rule: if you return a different status code for a previously-functional request, that's a breaking change. Make sure old behaviors still return old codes.

## Loosening validation

Accepting more inputs is safe:

```
Before: email must match [a-z]+@[a-z]+\.[a-z]+
After: email must match a more permissive regex
```

Old valid inputs still valid; new ones additionally accepted.

## Tightening validation — breaking

Going the other way breaks:

```
Before: email must be a string (no format check)
After: email must match regex (rejects malformed strings)
```

Consumers sending now-invalid emails see 422 they didn't before. Breaking change; bump major.

## Removing fields — breaking

```json
// Before
{ "id": 1, "name": "Aaron", "legacy_id": "abc" }

// After (removed)
{ "id": 1, "name": "Aaron" }
```

Any consumer reading `legacy_id` breaks. Breaking change.

Pattern: deprecate first, then remove later (across major version bumps).

```json
{ "id": 1, "name": "Aaron", "legacy_id": "abc", "_deprecated": ["legacy_id"] }
```

Or via response header:
```
Deprecation-Notice: legacy_id will be removed in v2.0
```

## Renaming fields — breaking

```json
// Before
{ "user_name": "Aaron" }

// After
{ "username": "Aaron" }
```

Breaking. Mitigation: ship both for a while.

```json
{ "user_name": "Aaron", "username": "Aaron" }
```

Then in next major: drop "user_name."

## Changing field types — breaking

```json
// Before — string
{ "user_id": "123" }

// After — integer
{ "user_id": 123 }
```

Breaking even if values look similar. Type coercion in consumer code may not work; statically-typed clients (Swift, Go) fail to parse.

Don't do this without a major version bump.

## Changing enum values — careful

```json
// Before
{ "status": "active" }

// After
{ "status": "ACTIVE" }
```

Breaking (case change is significant). Or:

```json
// Adding new enum value
// Before: "active" | "inactive"
// After: "active" | "inactive" | "pending"
```

Adding a new value is usually OK but: consumers with an exhaustive switch break on the new value. Documentation warns; ideally consumers handle unknown values gracefully ("unknown status" rather than crash).

## Endpoint behavior changes

Subtle changes in semantics can break consumers even if shapes don't change:

- Changing default sort order.
- Changing the timezone of returned timestamps.
- Changing pagination defaults.
- Changing what triggers webhooks.

These should be considered breaking unless you can prove no consumer relied on the old behavior.

## Webhooks — special care

Webhooks often have the worst back-compat constraints because:
- Consumers configure them once and forget.
- Old code in long-tail SaaS apps.
- Hard to communicate changes.

For webhook payload changes:
- Add new fields, never remove.
- Add new event types as separate (not modifying existing).
- Add version field to payload for clients to switch on.

Some APIs version webhooks separately from REST. Heavy compatibility discipline pays off.

## Feature flags / migration headers

For gradual migrations within a version:

```
GET /users
X-Feature-NewPagination: enabled
```

Opt-in to new behavior. Slowly enable for more consumers; once all migrated, make it default. Bumps major only when removing the flag and old behavior.

Used by Stripe (their date versioning is essentially per-account feature flags).

## The hardest case — bug fixes

```
Before: API returns wrong amount for some currencies.
After: Fixed to return correct amount.
```

Technically a "bug fix" but consumers might be relying on the wrong behavior (rebuilding it on their side). Is this breaking?

Pragmatically: announce, give notice, ship the fix. Sometimes consumers complain; that's the cost of bad API days getting paid back later.

## Documentation discipline

Maintain a changelog with:
- Date of change.
- What changed.
- Whether it's breaking.
- Migration steps if needed.

Tools (Stripe-style changelog pages, GitHub releases) help consumers understand evolution. Without it, surprises pile up.

## Mistakes to avoid

- **Removing fields silently.** Consumers depend on what they don't say they depend on.
- **Adding required fields to requests.** Old clients now fail.
- **Tightening validation without warning.** Consumer requests start 422-ing unexpectedly.
- **Changing endpoint URLs.** Subtle but breaking.
- **No changelog.** Consumers find changes by their app breaking.

## Summary

- Backward compatible: add fields, add endpoints, add optional params, loosen validation.
- Breaking: remove fields, rename, change types, tighten validation, change semantics.
- For removals: deprecate, warn for months, remove in next major.
- For renames: ship both for a while.
- Webhook changes deserve extra care.
- Maintain a changelog.

Next: deprecation.
