---
module: 1
position: 3
title: "The auto-generated API"
objective: "PostgREST and what it gives you for free."
estimated_minutes: 7
---

# The auto-generated API

## What you get without writing endpoints

Supabase exposes a fully-functional REST API derived from your database schema, via PostgREST. Every table becomes an endpoint. Every column becomes a queryable field. Inserts, updates, deletes, complex filters, ordering, pagination, embedded relationships — all available without writing a single backend route.

This is the single biggest productivity unlock of Supabase. For 80% of CRUD operations, you don't write API code.

## How PostgREST works

PostgREST reads your Postgres schema and generates REST endpoints automatically:

- `GET /rest/v1/posts` → SELECT from `posts`.
- `GET /rest/v1/posts?id=eq.abc-123` → SELECT with WHERE id = 'abc-123'.
- `POST /rest/v1/posts` → INSERT into `posts`.
- `PATCH /rest/v1/posts?id=eq.abc-123` → UPDATE WHERE id = 'abc-123'.
- `DELETE /rest/v1/posts?id=eq.abc-123` → DELETE WHERE id = 'abc-123'.

Authorization is enforced by Row Level Security policies (covered Module 2). Authentication via JWT in the Authorization header.

The supabase-js client wraps this nicely:

```js
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(10);
```

That call translates to `GET /rest/v1/posts?status=eq.published&order=created_at.desc&limit=10` under the hood.

## Filter operators

PostgREST supports a rich set of filter operators:

- `eq` — equals.
- `neq` — not equals.
- `gt`, `gte`, `lt`, `lte` — comparison.
- `like`, `ilike` — pattern match (case-sensitive / insensitive).
- `is` — IS NULL / IS TRUE / IS FALSE.
- `in` — IN list.
- `cs`, `cd` — contains / contained-by (for arrays and JSONB).
- `sl`, `sr`, `nxr`, `nxl`, `adj`, `ov` — range operators.

In supabase-js:

```js
const { data } = await supabase
  .from('events')
  .select('*')
  .gte('occurred_at', '2026-01-01')
  .in('event_type', ['signup', 'purchase'])
  .contains('properties', { campaign: 'launch-2026' });
```

## Embedded resources (joins)

PostgREST follows foreign keys to embed related data in a single query:

```js
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    body,
    author:author_id (
      id,
      username,
      avatar_url
    ),
    comments (
      id,
      body,
      created_at,
      author:author_id (username)
    )
  `)
  .eq('status', 'published');
```

That returns posts with their author and comments (with comment authors) — one HTTP request, one SQL query under the hood. The N+1 problem is solved by the auto-API.

Aliases like `author:author_id` let you rename the embedded field. Nested embedding works recursively.

## Inserts and upserts

Insert one or many:

```js
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'Hello', body: 'World', author_id: user.id })
  .select()
  .single();
```

`.select()` returns the inserted rows; `.single()` returns one object instead of an array.

Upsert (insert or update on conflict):

```js
await supabase
  .from('user_settings')
  .upsert({ user_id: user.id, preferences: { theme: 'dark' } });
```

Define what counts as a conflict via primary key or unique constraint.

## Updates

Update with filters:

```js
await supabase
  .from('posts')
  .update({ status: 'archived' })
  .eq('author_id', user.id)
  .eq('status', 'draft');
```

The update applies to all rows matching the filters. Use carefully.

## Deletes

```js
await supabase
  .from('posts')
  .delete()
  .eq('id', postId);
```

Same filter rules. RLS policies determine whether the delete is allowed.

## Counts

```js
const { data, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .eq('status', 'published');
```

`count: 'exact'` returns the precise total count (slower for large tables); `'estimated'` uses Postgres's pg_class estimate (faster, less accurate); `'planned'` uses the query planner's estimate.

## RPC — calling database functions

For logic too complex for CRUD, define a Postgres function and call it via RPC:

```sql
create function transfer_funds(
  from_user uuid,
  to_user uuid,
  amount numeric
) returns void as $$
begin
  update accounts set balance = balance - amount where user_id = from_user;
  update accounts set balance = balance + amount where user_id = to_user;
  insert into transfers (from_user, to_user, amount) values (from_user, to_user, amount);
end;
$$ language plpgsql security invoker;
```

Call from the client:

```js
await supabase.rpc('transfer_funds', {
  from_user: senderId,
  to_user: recipientId,
  amount: 100
});
```

RPC lets you keep transactional logic in the database where it's safe and fast, while still calling it from the frontend.

`security invoker` runs as the calling user (respects RLS). `security definer` runs as the function owner (bypasses RLS) — use with extreme care; the owner is typically a privileged role.

## GraphQL alongside REST

Supabase also exposes a GraphQL API via `pg_graphql`. Same schema; different query shape. For teams that prefer GraphQL:

```graphql
query {
  postsCollection(filter: { status: { eq: "published" } }) {
    edges {
      node {
        id
        title
        author { username }
      }
    }
  }
}
```

Both APIs share the same Postgres schema and RLS — pick whichever fits your team.

## Authentication and the API

Each request to PostgREST carries a JWT in the `Authorization: Bearer ...` header. Supabase's auth system issues JWTs that contain the user's ID and role.

- **anon** key — for unauthenticated requests; only sees rows allowed by anon RLS policies.
- **authenticated** key — for logged-in users; the JWT carries their user ID.
- **service_role** key — bypasses RLS; for trusted server-side use only. Never ship it to clients.

The supabase-js client handles JWT attachment automatically once you've logged the user in.

## Pagination

Two patterns:

**Range-based** (PostgREST native):

```js
await supabase
  .from('posts')
  .select('*')
  .range(0, 9); // first 10 rows
```

**Cursor-based** (recommended for large datasets):

```js
await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
  .lt('created_at', lastSeenCreatedAt)
  .limit(10);
```

Range-based is convenient but O(N) for late pages. Cursor-based is O(log N) and consistent under concurrent writes.

## What the auto-API doesn't do

The auto-API is excellent for CRUD but not for:

- **Complex business logic spanning many tables.** Use RPC functions or Edge Functions.
- **External API integrations.** Use Edge Functions.
- **Heavy server-side processing.** Use Edge Functions or a dedicated backend.
- **Webhook handlers.** Use Edge Functions.

The auto-API is a generated CRUD layer. The non-CRUD pieces still need backend code, but Supabase gives you Edge Functions for that (covered Module 4).

## Mistakes to avoid

- **Writing custom CRUD endpoints.** You don't need to.
- **Exposing service_role key to clients.** Catastrophic security issue.
- **Skipping RLS** because "the API is auto-generated." RLS is what makes the auto-API safe.
- **Range-based pagination on huge tables.** O(N) cost; use cursor pagination.
- **Calling many small queries** when one embedded query would do.

## Summary

- PostgREST generates a REST API from your Postgres schema automatically.
- supabase-js wraps it in idiomatic JS.
- Rich filter operators; foreign-key-based embedding for joins.
- Upserts, updates, deletes, RPC for custom functions.
- GraphQL available via pg_graphql.
- Authentication via JWT; RLS enforces authorization.
- Use Edge Functions for non-CRUD logic.

Next: migrations and database branching.
