---
module: 3
position: 1
title: "Pagination patterns: offset vs cursor"
objective: "Return collections that scale."
estimated_minutes: 5
---

# Pagination patterns: offset vs cursor

## Why paginate

Returning 1M rows from `GET /users` is a bad idea:
- Slow (database scan + serialize).
- Heavy on network and client memory.
- Often times out.

Pagination splits responses into manageable chunks. Standard for any list endpoint.

## Offset pagination

The simplest pattern:

```
GET /users?page=1&limit=20
GET /users?page=2&limit=20
GET /users?offset=40&limit=20
```

SQL:
```sql
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 40
```

Pros:
- Easy to implement.
- Client can jump to any page.
- "Total pages" / page-number UI is easy.

Cons:
- **Inconsistent on inserts/deletes.** New row added between page 1 fetch and page 2 fetch → row appears on both pages or skipped.
- **Slow on deep offsets.** `OFFSET 1000000` makes the DB scan and discard 1M rows. Performance degrades dramatically deep into results.
- **Not stable.** Same page query returns different results over time.

Good for: small data sets, admin UIs with page numbers, infrequently-changing data.

## Cursor pagination

Pass a cursor (opaque token) referring to a specific row:

```
GET /users?limit=20
→ { "data": [...], "next_cursor": "abc123..." }

GET /users?cursor=abc123...&limit=20
→ { "data": [...], "next_cursor": "def456..." }
```

SQL (cursor is the `id` of the last row from previous page):
```sql
SELECT * FROM users WHERE id > $cursor ORDER BY id LIMIT 20
```

Pros:
- **Consistent.** Inserts/deletes mid-pagination don't shift other pages.
- **Fast at any depth.** Index lookup; no offset scan.
- **Scales to billions of rows.**

Cons:
- **No "jump to page N."** Must paginate sequentially.
- **Cursor opacity.** Clients can't construct cursors; only follow them.
- **Slightly more complex implementation.**

Good for: large datasets, time-ordered feeds, infinite scroll, API consumers who page sequentially.

## Cursor design

The cursor encodes the position. Options:

**Just the ID.** Simple if rows are sorted by ID.

**Compound (id + timestamp).** For "ordered by created_at, ties broken by id."

```python
cursor = base64({"created_at": "2026-05-15T10:00:00Z", "id": "abc"})

# Next page query:
WHERE (created_at, id) > ($cursor_time, $cursor_id)
ORDER BY created_at, id
```

**Opaque, encrypted.** Server signs/encrypts the cursor; client can't tamper. Prevents enumeration / parameter abuse.

Stripe / GitHub use base64-encoded JSON. Opaque enough for consumers; debuggable for you.

## Bidirectional pagination

Some APIs let you paginate forward AND backward:

```
GET /users?after=cursor_abc&limit=20
GET /users?before=cursor_xyz&limit=20
```

Returns `has_next_page`, `has_prev_page` in response. GraphQL Connections spec encodes this.

For infinite-scroll feeds: usually only forward.

## Total count — often the wrong question

Many APIs include a total count: `{"data": [...], "total": 5234}`. Calculating total = COUNT(*) — expensive on large tables.

Three patterns:

1. **No total.** Just "is there more?" via `has_next_page` / next cursor. Cheap. UX shows "Load more" rather than "Page X of Y."
2. **Approximate total.** "About 5,000 users." Use stats-based estimates.
3. **Exact total.** Pay the COUNT cost. Cache it if possible.

For modern APIs, omitting total is increasingly common. The user doesn't actually need "1 of 263 pages"; "more available" is enough.

## Limit caps

Don't let clients set `limit=1000000`. Cap server-side:

```python
limit = min(int(request.args.get('limit', 20)), 100)
```

Reasonable defaults: 20 per page. Maximums: 100-500 depending on row size. Document the cap.

## Pagination response shape

Consistent across endpoints:

```json
{
  "data": [
    { "id": "1", ... },
    { "id": "2", ... }
  ],
  "pagination": {
    "next_cursor": "abc123",
    "has_more": true
  }
}
```

Or per-page:

```json
{
  "data": [...],
  "page": 2,
  "per_page": 20,
  "total": 5234
}
```

Pick one shape; use it everywhere in the API. Stripe puts everything at the top level with `has_more` + `data`; GitHub uses Link header with `rel="next"`, `rel="prev"` URLs. Either is fine; consistent matters.

## Link header pattern

GitHub's approach:

```
Link: <https://api.github.com/repositories?page=2>; rel="next",
      <https://api.github.com/repositories?page=10>; rel="last"
```

Clients follow the Link header. URLs are absolute and fully formed; clients don't construct them.

Standardized by RFC 8288. Used by GitHub, AWS S3, others. Slightly less common than JSON-body pagination in new APIs but works well for HATEOAS-leaning designs.

## Combining with filters and sorts

```
GET /users?status=active&sort=created_at&limit=20&cursor=abc
```

Cursor pagination must respect the sort order. If sorting by created_at, the cursor encodes the created_at value, not just ID.

Standardize: `?sort=created_at` or `?sort=-created_at` for descending. Document allowed sort fields.

## Mistakes to avoid

- **Deep offset pagination.** Slow on large datasets. Use cursors.
- **Unbounded limit.** Client can request a million; server tries.
- **Total count on hot path.** COUNT(*) on a 100M-row table is slow. Skip or cache.
- **Inconsistent shapes.** Some endpoints `page`, some `cursor`, some `nextPageUrl`. Settle on one.
- **No cap on limit.** Or worse — `limit=0` returns all.

## Summary

- Offset pagination: simple, page-number UI, slow at depth, inconsistent.
- Cursor pagination: scalable, consistent, no page jumps. Modern default.
- Cursor encodes position; opaque to client; debuggable server-side.
- Cap `limit` to reasonable max.
- Total count is expensive; often skip.
- Consistent response shape across all collection endpoints.

Next: filtering and sorting.
