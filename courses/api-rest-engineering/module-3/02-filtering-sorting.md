---
module: 3
position: 2
title: "Filtering and sorting"
objective: "Let clients query without giving them SQL."
estimated_minutes: 5
---

# Filtering and sorting

## The trade-off

Clients want to filter "active users created last month, sorted by name." You could:
- Build a one-off endpoint for every filter combo.
- Expose generic filtering.

Generic filtering is usually right, but careful — don't accidentally let clients run arbitrary queries on your database.

## Filter syntax options

**Simple key=value.**

```
GET /users?status=active&team=engineering
```

Clean for equality. Server translates to SQL conditions. Limited expressivity.

**Operator syntax.**

```
GET /users?created_at[gte]=2026-01-01&age[lt]=30
GET /users?created_at__gte=2026-01-01
```

More expressive. Bracket / underscore syntax varies. Define a small vocabulary: `gte`, `lte`, `eq`, `ne`, `in`, `like`.

**JSON-API filter syntax.**

```
GET /users?filter[status]=active&filter[team]=engineering
```

Standardized; verbose.

**GraphQL-style.**

```graphql
query { users(where: { status: { eq: "active" } }) }
```

Powerful; not REST.

For most REST APIs: simple key=value or operator syntax is enough. Document supported filters; reject unknown ones.

## Sort syntax

Standard:

```
GET /users?sort=name           # ascending
GET /users?sort=-name          # descending (- prefix)
GET /users?sort=name,-age      # multi-field
```

Or explicit:

```
GET /users?sort=name&order=asc
```

Either works; pick one. The `-` prefix style is concise and standard.

## Validation — allowlist filters and sorts

Don't allow arbitrary fields. Define an explicit list:

```python
ALLOWED_FILTERS = {'status', 'team', 'created_at'}
ALLOWED_SORTS = {'name', 'created_at', 'age'}

for field in request.args:
    if field not in ALLOWED_FILTERS:
        abort(400, f'unknown filter: {field}')
```

Why:
- Performance — only filter on indexed columns.
- Security — don't let clients filter on internal fields (`internal_score`, `admin_notes`).
- Predictability — supported queries documented.

## Search vs filter

**Filter.** Exact match on a field. `?status=active`.

**Search.** Free-text. `?q=aaron`.

Often a separate endpoint:

```
GET /users?status=active           # filter
GET /users/search?q=aaron          # search
```

Or a dedicated parameter:

```
GET /users?q=aaron&status=active
```

Search usually requires a search engine (Elasticsearch, OpenSearch, Algolia, Meilisearch) for relevance and performance. Don't try to do "search" with SQL LIKE on large tables.

## Faceted search

For UIs that show "filter by category" sidebars with counts:

```
GET /products?category=electronics&price_lt=100&facets=brand,color
```

Response:
```json
{
  "data": [...],
  "facets": {
    "brand": {"sony": 23, "apple": 12, "lg": 8},
    "color": {"black": 30, "white": 15}
  }
}
```

Computing facets is expensive — search engines handle it well; databases struggle. Pre-aggregate or use ES / OpenSearch.

## Negation and existence

```
?status[ne]=draft        # not draft
?team[isnull]=false      # team is set
?tags[has]=urgent        # tags array contains "urgent"
```

Operators expand expressivity at cost of complexity. Pick a small set; document.

## Date filtering

Standardize on ISO 8601:

```
?created_at[gte]=2026-01-01T00:00:00Z
?created_at[gte]=2026-01-01            # date-only fine
```

Timezone — always UTC in the API. Display in user's timezone client-side.

## Sparse fieldsets

Let clients request only the fields they need:

```
GET /users?fields=id,name,email
```

Reduces payload size. Backend can also skip joining tables for unrequested fields.

GraphQL bakes this in; for REST, it's an optional optimization. Stripe API supports `expand` for the opposite (request nested resources).

## Embedded resources

```
GET /users?include=team,manager
```

Embeds related resources in the response. Reduces N+1 round trips. Trade-off: bigger response.

```json
{
  "id": "user_123",
  "name": "Aaron",
  "team": { "id": "team_xyz", "name": "Eng" },
  "manager": { "id": "user_456", "name": "Linda" }
}
```

Decide per endpoint which related resources are commonly fetched together. Document.

## Query injection — guard against it

Filters become SQL queries. Don't concat user input:

```python
# ❌ Vulnerable
query = f"SELECT * FROM users WHERE {field} = '{value}'"

# ✅ Safe — parameterize values, validate field names
field = validate_field(request.args['field'])  # allowlist check
value = request.args['value']
query = f"SELECT * FROM users WHERE {field} = %s"
cursor.execute(query, (value,))
```

Field names need validation (can't parameterize identifiers); values use parameter binding.

## Performance — indexed columns only

Allow filtering only on indexed columns. Filtering on unindexed columns means full table scans:

```sql
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created ON users(created_at);
```

When you add a new allowed filter, add the corresponding index. Catch unindexed filters in code review.

For complex filters with multiple fields: composite indexes or specialized search engines.

## Mistakes to avoid

- **Allow filtering on any field.** Performance disaster.
- **Build SQL via string concat.** Injection.
- **No allowlist.** Internal fields exposed.
- **Different filter syntax per endpoint.** Confusing.
- **Filter values as JSON.** `?filter={...}` is ugly and harder to debug.

## Summary

- Filter by simple key=value or operator syntax; pick one and document.
- Allowlist of filter and sort fields; reject unknown.
- Sort with `-prefix` for descending; multi-field via comma.
- Search ≠ filter; separate endpoint with a search engine for free-text.
- Sparse fieldsets (`?fields=`) and includes (`?include=`) optimize payloads.
- Only filter on indexed columns; add indexes when adding filters.

Next: error responses worth debugging.
