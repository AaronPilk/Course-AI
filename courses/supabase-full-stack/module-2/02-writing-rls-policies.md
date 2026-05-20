---
module: 2
position: 2
title: "Writing RLS policies"
objective: "USING, WITH CHECK, and auth.uid()."
estimated_minutes: 7
---

# Writing RLS policies

## The anatomy of a policy

A policy in Postgres RLS has the form:

```sql
create policy "<descriptive name>"
  on <table>
  for <action>
  to <role>
  using (<filter expression>)
  with check (<validation expression>);
```

Components:

- **Name** — describe the rule in human language. Names help debugging.
- **Table** — which table the policy applies to.
- **Action** — `select`, `insert`, `update`, `delete`, or `all`.
- **Role** — which Postgres role this applies to (default: all roles).
- **USING** — the expression that filters rows. Returns true for rows the user can access.
- **WITH CHECK** — the expression that validates the resulting row state (for INSERT/UPDATE).

`USING` and `WITH CHECK` are SQL expressions that can reference any column of the row. They run for every row touched by the operation.

## USING and WITH CHECK in detail

**USING** decides which existing rows are visible/operable. Used by SELECT, UPDATE (for which rows can be targeted), and DELETE.

**WITH CHECK** decides what the row can look like after INSERT or UPDATE. Used by INSERT (for the new row) and UPDATE (for the row's state post-change).

For UPDATE: you can target a row (USING passes) but the update is rejected if the resulting row would fail WITH CHECK. This prevents privilege escalation:

```sql
create policy "Update own posts but don't change author"
  on posts for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());
```

A user can update their own post (USING) but can't change `author_id` to someone else's (WITH CHECK rejects the result).

For INSERT, only WITH CHECK applies (there's no existing row to test against).

## The auth.uid() function

Supabase exposes `auth.uid()` returning the authenticated user's UUID from the JWT's `sub` claim. Returns NULL for unauthenticated requests.

Common usage:

```sql
using (author_id = auth.uid())
using (auth.uid() = ANY(team_member_ids))
using (exists (
  select 1 from memberships
  where team_id = posts.team_id
    and user_id = auth.uid()
))
```

If you need other JWT claims, use `auth.jwt()`:

```sql
using (auth.jwt() ->> 'role' = 'admin')
using ((auth.jwt() -> 'app_metadata' ->> 'subscription_tier')::text = 'premium')
```

`auth.jwt()` returns the JWT payload as JSONB.

## Multiple policies per action

You can write multiple policies on the same table for the same action. They're OR'd together — if any policy allows the row, the row is allowed.

```sql
-- Anyone can read published posts.
create policy "Read published"
  on posts for select
  using (status = 'published');

-- Authors can read their own posts regardless of status.
create policy "Read own"
  on posts for select
  using (author_id = auth.uid());

-- Moderators can read anything.
create policy "Read all (moderators)"
  on posts for select
  using (
    exists (
      select 1 from moderators where user_id = auth.uid()
    )
  );
```

When a query runs, any of these granting access is enough. The OR-combination makes policies composable.

## Policies and roles

By default, policies apply to all roles (anonymous and authenticated). You can scope to specific roles:

```sql
create policy "Authenticated users only"
  on posts for select
  to authenticated
  using (true);

create policy "Anonymous read of published"
  on posts for select
  to anon
  using (status = 'published');
```

`to authenticated` makes the policy apply only when the request has a valid JWT. `to anon` only when unauthenticated. Useful for separating logged-in vs logged-out behaviors.

## Service role and policy bypass

The `service_role` role bypasses RLS entirely. Policies don't apply.

If you want a policy that even service_role respects (rare; usually you want full access for service_role), you can write the policy `to authenticated` so it only applies to authenticated users, and service_role's lack of a JWT means it falls through to the default deny-all.

In practice, most teams accept that service_role is the "trusted backend" key and don't try to constrain it via policies.

## The five-policy pattern

For most tables, you'll have five-ish policies:

```sql
-- 1. SELECT — what can you read?
create policy "Read own + published"
  on posts for select
  using (
    status = 'published'
    or author_id = auth.uid()
  );

-- 2. INSERT — what can you create?
create policy "Insert own"
  on posts for insert
  with check (author_id = auth.uid());

-- 3. UPDATE — what can you change?
create policy "Update own"
  on posts for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- 4. DELETE — what can you remove?
create policy "Delete own"
  on posts for delete
  using (author_id = auth.uid());

-- 5. (Optional) Admin override — moderators see everything.
create policy "Mods do anything"
  on posts for all
  using (
    exists (select 1 from moderators where user_id = auth.uid())
  )
  with check (
    exists (select 1 from moderators where user_id = auth.uid())
  );
```

Once you've internalized this pattern, RLS becomes routine. Each new table gets its five policies.

## Helpers via functions

If the same expression appears in many policies, extract it:

```sql
create function public.is_moderator() returns boolean as $$
  select exists (
    select 1 from moderators where user_id = auth.uid()
  );
$$ language sql security invoker stable;

-- Then in policies:
create policy "Mods read all"
  on posts for select
  using (is_moderator() or author_id = auth.uid());
```

`stable` tells Postgres the function returns the same result for the same arguments within a query — important for the planner. `security invoker` keeps the function running as the caller.

Helper functions also let you write tests for the underlying logic separately from each policy.

## Team-based authz example

Multi-tenancy: users belong to teams; resources belong to teams; access is team-scoped.

```sql
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table memberships (
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  primary key (team_id, user_id)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

create function public.is_team_member(team uuid) returns boolean as $$
  select exists (
    select 1 from memberships
    where team_id = team
      and user_id = auth.uid()
  );
$$ language sql security invoker stable;

create policy "Team members read team projects"
  on projects for select
  using (is_team_member(team_id));

create policy "Team members insert team projects"
  on projects for insert
  with check (is_team_member(team_id));

create policy "Team admins update team projects"
  on projects for update
  using (
    exists (
      select 1 from memberships
      where team_id = projects.team_id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from memberships
      where team_id = projects.team_id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );
```

The `is_team_member` helper encapsulates the common check. Different roles within a team get different permissions via role checks in policies.

## Combining policies with constraints

RLS policies handle "who can do what." Database constraints (CHECK, foreign keys, NOT NULL) handle "what data is valid." Use both:

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id),  -- FK = data integrity
  title text not null check (length(title) between 1 and 200),  -- CHECK = validity
  ...
);

alter table posts enable row level security;

create policy "Insert own"  -- RLS = authorization
  on posts for insert
  with check (author_id = auth.uid());
```

Each layer covers different concerns.

## Mistakes to avoid

- **Forgetting WITH CHECK on UPDATE.** Allows users to update rows to belong to others.
- **Reading policies as AND when they're OR.** Multiple policies grant access if any allows.
- **Policy logic that always returns true.** Defeats the purpose.
- **Querying inside policies without indexes.** Slow at scale.
- **Mixing authentication and authorization.** RLS is authz; identify users via auth first.

## Summary

- Policy = name + table + action + role + USING + WITH CHECK.
- USING filters visible rows; WITH CHECK validates result state.
- Multiple policies per action are OR'd together.
- Scope to roles (`to authenticated`, `to anon`) for different audiences.
- Five-policy pattern (SELECT, INSERT, UPDATE, DELETE, admin) covers most tables.
- Extract repeated logic into stable security-invoker functions.
- Combine RLS with constraints for full coverage.

Next: common patterns — owner, team, public-read.
