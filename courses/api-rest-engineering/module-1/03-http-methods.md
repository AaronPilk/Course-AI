---
module: 1
position: 3
title: "HTTP methods and what they mean"
objective: "Pick the right verb for each operation."
estimated_minutes: 5
---

# HTTP methods and what they mean

## The standard methods

For REST APIs, you mostly use:

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Read a resource | Yes | Yes |
| POST | Create / non-idempotent action | No | No |
| PUT | Replace a resource | Yes | No |
| PATCH | Partial update | Maybe* | No |
| DELETE | Remove a resource | Yes | No |
| HEAD | Like GET but no body | Yes | Yes |
| OPTIONS | Discover allowed methods | Yes | Yes |

*PATCH idempotency depends on the patch operation type.

**Safe** = doesn't modify state. **Idempotent** = repeating it has the same effect as doing it once.

## GET — reading

```
GET /users/123
```

- Used for fetching.
- Body should be ignored (some clients/proxies strip it).
- Should be cacheable (set Cache-Control).
- Repeated GETs always return same state (modulo concurrent changes).

Common mistakes:
- Using GET for actions ("GET /users/123/delete"). State-changing operations should not be GETs — browsers prefetch, caches cache them, search engines crawl them.
- Putting secrets in URLs (logged, history, referer). Use POST + body or Auth header.

## POST — creating or acting

```
POST /users
{
  "name": "Aaron",
  "email": "aaron@example.com"
}
```

Returns 201 Created with the new resource, or 202 Accepted for async operations.

Also used for:
- **Non-CRUD actions.** `POST /orders/123/refunds`.
- **Bulk operations.** `POST /users/bulk-import`.
- **Search with complex query.** When GET query string isn't enough.

Not idempotent by default — retries create duplicates. Use idempotency keys for safe retries.

## PUT — replacing

```
PUT /users/123
{
  "name": "Aaron",
  "email": "aaron@example.com"
}
```

Replaces the resource entirely. Fields not in the body are typically set to default / null.

Idempotent — sending the same PUT twice has the same result.

Use PUT when:
- Caller has the full desired state.
- "Replace, don't merge."

In practice, PATCH is more common because clients usually want partial updates.

## PATCH — partial update

```
PATCH /users/123
{
  "email": "newaaron@example.com"
}
```

Update only the specified fields. Other fields untouched.

Two body formats:

**Merge Patch (RFC 7396).** Send the fields you want to change. To delete a field, send null:
```json
PATCH /users/123
{"email": "new@example.com", "phone": null}
```

**JSON Patch (RFC 6902).** Explicit operations:
```json
PATCH /users/123
[
  {"op": "replace", "path": "/email", "value": "new@example.com"},
  {"op": "remove", "path": "/phone"}
]
```

Merge Patch is simpler and more common. JSON Patch is more expressive but verbose.

## DELETE

```
DELETE /users/123
```

Removes the resource. Returns 204 No Content (success, nothing to return) or 200 OK with the deleted entity.

Idempotent — deleting an already-deleted resource is fine (returns 404 or 204, depending on convention).

For "soft delete" (mark deleted but keep in DB), the URL still uses DELETE; the implementation differs. Some APIs add `DELETE /resources/{id}?hard=true` for permanent deletion.

## HEAD — metadata only

Like GET but no body. Used to check:
- Does this resource exist? (200 vs 404)
- What's its current ETag / Last-Modified?
- What's the Content-Length?

```
HEAD /users/123
```

Cheap way to validate cache freshness without downloading body.

## OPTIONS — method discovery

```
OPTIONS /users/123
```

Returns headers indicating which methods are allowed:

```
Allow: GET, PATCH, DELETE
```

Used by CORS preflight requests. For most APIs you don't implement OPTIONS manually; the framework handles it.

## Method choice in practice

For typical CRUD on resources:

- List: `GET /resources`
- Read one: `GET /resources/{id}`
- Create: `POST /resources`
- Update partial: `PATCH /resources/{id}`
- Replace: `PUT /resources/{id}` (less common than PATCH)
- Delete: `DELETE /resources/{id}`

For sub-actions: `POST /resources/{id}/action-name`.

## Method tunneling — old workaround

Some old clients / firewalls only support GET and POST. Workaround:

```
POST /users/123
X-HTTP-Method-Override: PATCH
```

Treated as PATCH. Modern HTTP infrastructure handles all methods; you should rarely need this.

## Safe vs unsafe operations

Safe (GET, HEAD, OPTIONS) shouldn't modify state. Browsers prefetch these; caches cache them. If a "safe" method modifies state, you have bugs you can't easily reproduce.

Pattern check: would you mind if a search engine crawled this URL? If yes → not a GET.

## Common mistakes

- **GET for actions.** "GET /users/123/delete" triggered by web crawler = mass deletion.
- **POST for reads.** Now uncacheable; can't bookmark; auth weirdness.
- **DELETE with body.** Some clients/proxies strip; spec ambiguous. Put params in URL.
- **PATCH for replace.** Confusing — PUT is for replace.
- **Custom methods.** "TASK /resources" doesn't work universally. Stick to the standard 7.

## Summary

- GET = read; POST = create/act; PUT = replace; PATCH = partial update; DELETE = remove.
- Safe methods (GET, HEAD, OPTIONS) don't modify state.
- Idempotent methods (GET, PUT, DELETE) are safe to retry.
- POST + idempotency keys for safely-retryable creation.
- Use PATCH for partial updates (merge patch most common).
- HEAD for cheap existence / metadata checks.

Next: status codes.
