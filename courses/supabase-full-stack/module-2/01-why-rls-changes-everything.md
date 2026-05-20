---
module: 2
position: 1
title: "Why RLS changes everything"
objective: "Database-enforced authorization beats middleware."
estimated_minutes: 7
---

# Why RLS changes everything

## The authorization problem

Every multi-user app needs authorization: "who can see what, who can edit what." The traditional way is to put that logic in middleware — Express routes, Rails controllers, FastAPI dependencies — that check the user's identity and decide whether to allow the request.

Middleware-based authorization has structural weaknesses:

- **It's easy to forget.** A new endpoint that skips the check leaks data.
- **It's duplicated across endpoints.** Different views of the same data each need their own check.
- **It runs above the database.** A bug, SQL injection, or direct query bypass leaks everything.
- **It's hard to audit.** Authz logic spread across hundreds of routes is hard to reason about.
- **It diverges from the data model.** The "users can only see their own posts" rule lives in 12 places.

Row Level Security (RLS) moves authorization into the database. Postgres itself enforces "this row is visible to this user." Any query — whether from the auto-API, RPC, or direct SQL — is filtered by RLS policies. Middleware becomes optional, not the trust boundary.

## What RLS actually does

When RLS is enabled on a table:

- Every `SELECT` is filtered by the table's `USING` policy.
- Every `INSERT` is checked against the `WITH CHECK` policy.
- Every `UPDATE` is filtered by `USING` (for which rows can be touched) and checked against `WITH CHECK` (for what the result rows can look like).
- Every `DELETE` is filtered by `USING`.

If no policy allows the operation, it's denied. Rows the user can't see appear to not exist (not an error — just absent from results). This is a security property, not a UX one: it prevents enumeration attacks where unauthorized rows would otherwise return "permission denied" and reveal their existence.

## A simple example

```sql
-- Enable RLS on the table
alter table posts enable row level security;

-- Policy: users can see their own drafts; anyone can see published posts.
create policy "Read published or own"
  on posts for select
  using (
    status = 'published'
    or author_id = auth.uid()
  );

-- Policy: users can insert their own posts.
create policy "Insert own posts"
  on posts for insert
  with check (author_id = auth.uid());

-- Policy: users can update their own posts.
create policy "Update own posts"
  on posts for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- Policy: users can delete their own posts.
create policy "Delete own posts"
  on posts for delete
  using (author_id = auth.uid());
```

`auth.uid()` is a Supabase function that returns the JWT's `sub` claim — the authenticated user's UUID. With these policies, the auto-API exposes the table safely:

- A logged-out user (anon role) sees only `published` posts.
- A logged-in user sees all `published` posts plus their own drafts.
- Each user can only modify their own posts.

Same table; different visibility per user; enforced by the database.

## Why this is more secure than middleware

Three structural advantages:

**Defense in depth.** Even if a developer writes a query that forgot to filter by user_id, RLS still filters. The query that would have returned all rows now returns only the rows allowed.

**Single source of truth.** The authorization rule for posts lives in one place — the policy on the table. Every consumer (auto-API, RPC functions, direct SQL via service role, Edge Functions) respects it.

**Auditable.** All policies are queryable from `pg_policies`. You can review them in one place, audit changes via migration history.

The combination of these is why teams that adopt RLS rarely go back.

## How RLS interacts with the auto-API

PostgREST connects to Postgres using a special role for each request:

- Unauthenticated requests → `anon` role.
- Authenticated requests (valid JWT) → `authenticated` role.
- Service role requests → `service_role` role (bypasses RLS).

The JWT's `sub` claim (user UUID) is available to RLS policies via `auth.uid()`. Other claims are accessible via `auth.jwt()`.

When a request comes in:
1. PostgREST validates the JWT.
2. Sets the connection's role and JWT context.
3. Runs the SQL query.
4. Postgres applies RLS policies based on the role and JWT.
5. Returns only the rows the policies allow.

You don't write any authorization code in your app. The database does it.

## The service_role bypass

The `service_role` key bypasses RLS entirely. It's intended for trusted server-side code that needs full access.

Common uses:
- Admin operations (deleting accounts, system-wide reports).
- Cron jobs or background workers.
- Migrations and seed scripts.
- Edge Functions that need elevated access.

Critical rule: **never ship service_role to clients.** The whole RLS security model depends on this key staying on trusted servers. If it leaks, an attacker can bypass all RLS and read/write everything.

In Edge Functions, use service_role carefully — preferably wrapped in functions that re-impose checks before doing privileged operations.

## Policy types

RLS supports four policy actions: `select`, `insert`, `update`, `delete`. You can have multiple policies per table; if any policy allows the operation, the operation is allowed (policies are OR'd together for each action).

`USING` clauses filter which rows are visible/modifiable.
`WITH CHECK` clauses validate what the resulting row can look like (for INSERT/UPDATE).

```sql
-- A policy that uses both: users can update their own posts but can't change the author_id.
create policy "Update own posts"
  on posts for update
  using (author_id = auth.uid())  -- which rows you can touch
  with check (author_id = auth.uid());  -- what they can look like after
```

`WITH CHECK` prevents privilege escalation via UPDATE — you can't update a post to be owned by someone else.

## What RLS doesn't do

- **It doesn't replace authentication.** You still need to log users in and issue JWTs. RLS only kicks in after a user is authenticated.
- **It doesn't enforce business rules.** RLS is authorization; "users can edit their own posts" is authz. "Users can't post more than 10 times per day" is a business rule — use a function or trigger.
- **It doesn't help with denial-of-service.** RLS filters; it doesn't throttle. Rate limiting belongs elsewhere.
- **It doesn't protect against the service_role.** That key is the master key. Guard it.

## Performance considerations

RLS policies are essentially WHERE clauses appended to every query. Performance matters:

- **Index the columns policies reference.** If a policy uses `author_id = auth.uid()`, index `author_id`.
- **Use simple expressions.** Complex subqueries in policies run for every row.
- **Avoid recursive joins in policies.** Postgres can plan around simple policies; complex ones force row-by-row execution.

We'll cover RLS performance in Module 2 Lesson 4.

## Common reactions

People new to RLS often have one of three reactions:

1. **"This is the missing piece I never knew I needed."** Common for backend engineers who've maintained authz middleware for years.

2. **"How do I test this?"** RLS policies are SQL; you can test them by querying as different users. Tools exist (covered Module 2 Lesson 4).

3. **"What if my logic doesn't fit policies?"** Most authz logic does fit. The rare cases that don't are handled by Edge Functions with service_role — keeping RLS as the default and exceptions as deliberate.

## Mistakes to avoid

- **Not enabling RLS on a table.** New tables on Supabase don't have RLS enabled by default; you must run `alter table X enable row level security;`. Without it, the table is wide open.
- **Forgetting to write any policies after enabling RLS.** With RLS enabled and no policies, the table is locked (nothing visible). You need policies to allow specific operations.
- **Exposing service_role to clients.** Catastrophic security failure.
- **Skipping `WITH CHECK` on INSERT/UPDATE.** Lets users update rows to belong to others.
- **Believing RLS replaces input validation.** Still validate user input; RLS is authorization, not sanitization.

## Summary

- RLS moves authorization into the database; any query is filtered by policies.
- Same authz rule lives in one place; every consumer respects it.
- Defense in depth: a query that forgot to filter is still safe.
- `USING` filters visible rows; `WITH CHECK` validates result rows.
- `auth.uid()` returns the JWT's user UUID.
- service_role bypasses RLS; never expose it client-side.
- Enable RLS on every table; write policies for every action you want to allow.

Next: writing RLS policies in detail.
