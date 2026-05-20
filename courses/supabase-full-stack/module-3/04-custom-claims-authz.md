---
module: 3
position: 4
title: "Custom claims and authorization patterns"
objective: "Roles, permissions, multi-tenancy."
estimated_minutes: 7
---

# Custom claims and authorization patterns

## The authz problem at scale

Simple "users own their data" RLS covers most cases. But real apps need richer authorization: roles (admin vs member), permissions (can edit vs can view), feature flags (is on the Pro plan), team-scoping (sees only their org's data).

This lesson covers patterns for richer authz in Supabase: custom JWT claims, role tables, hooks, and the trade-offs of where to put authz logic.

## Two approaches to roles

You can put roles in the JWT or in the database. Both work; trade-offs differ.

**Roles in the JWT (custom claims):**

- Available in policies as `auth.jwt() ->> 'role'`.
- No DB lookup per request — claim is already in the token.
- Changes require token refresh (delayed effect).
- Suitable for slowly-changing global roles (admin, user).

**Roles in a database table:**

- Available via joins in policies.
- DB lookup per query (but index makes fast).
- Changes take effect immediately.
- Suitable for granular permissions, team-scoped roles, dynamic permissions.

Many apps use both: global role in JWT for fast access; per-resource permissions in tables.

## Setting custom JWT claims

Supabase has two hooks for customizing JWT claims:

**Custom Access Token Hook** — runs when a JWT is issued. Lets you add or modify claims based on the user.

In dashboard → Auth → Hooks → Custom Access Token Hook, point at a Postgres function:

```sql
create function public.custom_access_token_hook(event jsonb) returns jsonb as $$
declare
  claims jsonb;
  user_role text;
begin
  claims := event->'claims';
  
  -- Look up the user's role.
  select role into user_role
  from public.user_roles
  where user_id = (event->>'user_id')::uuid;
  
  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  else
    claims := jsonb_set(claims, '{user_role}', '"user"');
  end if;
  
  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$ language plpgsql security definer;

-- Grant access to supabase_auth_admin.
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
```

Now JWTs include `user_role`. In RLS policies:

```sql
using (
  (auth.jwt() ->> 'user_role') = 'admin'
  or author_id = auth.uid()
)
```

The role check is now in the token, not a database lookup per query.

## Role tables — explicit and flexible

For richer permissions, use a table:

```sql
create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'moderator', 'admin', 'super_admin')),
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id)
);

alter table public.user_roles enable row level security;

create policy "Users read own role"
  on public.user_roles for select
  using (user_id = auth.uid());

create policy "Admins read all roles"
  on public.user_roles for select
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- Helper.
create function public.has_role(required_role text) returns boolean as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = required_role
  );
$$ language sql security invoker stable;
```

Then in any table's RLS policies:

```sql
create policy "Admins can do anything"
  on posts for all
  using (has_role('admin'))
  with check (has_role('admin'));
```

The table approach scales to per-resource permissions, audit logs, and dynamic role changes.

## Permission-based authz

For finer-grained control than roles:

```sql
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_type text not null,
  resource_id uuid,
  permission text not null check (permission in ('read', 'write', 'admin')),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id),
  unique (user_id, resource_type, resource_id, permission)
);

create function public.has_permission(
  rtype text,
  rid uuid,
  perm text
) returns boolean as $$
  select exists (
    select 1 from public.permissions
    where user_id = auth.uid()
      and resource_type = rtype
      and (resource_id = rid or resource_id is null)
      and permission = perm
  );
$$ language sql security invoker stable;

-- Usage:
create policy "Read documents with read permission"
  on documents for select
  using (has_permission('document', documents.id, 'read'));
```

`resource_id = null` means "applies to all resources of this type" — useful for org-wide permissions.

## Multi-tenancy patterns

Multi-tenant SaaS where each tenant (org/team) is isolated:

```sql
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free'
);

create table public.tenant_members (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  primary key (tenant_id, user_id)
);

-- Resources scoped by tenant.
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  ...
);

-- Custom claim with current tenant.
create function public.current_tenant_id() returns uuid as $$
  select (auth.jwt() ->> 'current_tenant_id')::uuid;
$$ language sql security invoker stable;

create policy "Members see tenant projects"
  on public.projects for select
  using (
    tenant_id = current_tenant_id()
    and exists (
      select 1 from public.tenant_members
      where tenant_id = projects.tenant_id and user_id = auth.uid()
    )
  );
```

When a user switches tenants (e.g., dropdown in UI), update the JWT claim via a server function and refresh the session.

## Storing the active tenant

Approach 1: in the JWT. User selects tenant; app calls an Edge Function that re-issues a JWT with `current_tenant_id` claim updated. Pro: fast (no DB lookup). Con: tenant switch requires token refresh.

Approach 2: in localStorage / cookie. App tracks current tenant client-side; sends in query params or headers. Policies use it via `current_setting`. Pro: instant switching. Con: more application logic.

Most teams pick approach 1 — JWT claim — for simplicity. Token refresh on tenant switch is fast.

## Plan / subscription gating

For feature flags tied to subscription tiers:

```sql
create function public.has_feature(feature text) returns boolean as $$
  select case (auth.jwt() -> 'app_metadata' ->> 'plan')
    when 'enterprise' then true
    when 'pro' then feature in ('analytics', 'api_access', 'priority_support')
    when 'free' then feature in ('basic_features')
    else false
  end;
$$ language sql security invoker stable;

create policy "Pro+ can use analytics"
  on analytics_data for select
  using (has_feature('analytics'));
```

The plan claim lives in `app_metadata` (server-controlled). When a user upgrades, your backend updates app_metadata; next JWT refresh picks it up.

## Audit logging

Audit logging is authz-adjacent — track who did what:

```sql
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  target_table text,
  target_id uuid,
  before jsonb,
  after jsonb,
  occurred_at timestamptz not null default now()
);

-- Trigger that logs changes to sensitive tables.
create function public.audit_trigger() returns trigger as $$
begin
  insert into public.audit_log (actor_id, action, target_table, target_id, before, after)
  values (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    coalesce(new.id, old.id),
    case when TG_OP != 'INSERT' then row_to_json(old)::jsonb end,
    case when TG_OP != 'DELETE' then row_to_json(new)::jsonb end
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger projects_audit
  after insert or update or delete on public.projects
  for each row execute function public.audit_trigger();
```

The audit log captures every change with the actor. Use append-only RLS policies (Module 2) to make the log immutable.

## Where to put authz logic — the decision

A rough hierarchy:

1. **RLS policies for row-level decisions.** "Can this user see this row?"
2. **Custom JWT claims for fast, slowly-changing role/permission lookups.** "Is this user an admin?"
3. **Database functions / triggers for cross-row rules.** "User can't post more than 10 times per day."
4. **Edge Functions for complex business logic.** "Verify payment status before granting access."
5. **Application code for UI-level state.** "Show or hide the admin button."

Each layer reinforces the others. The deeper layer (RLS) is the final word; UI checks are cosmetic.

## Mistakes to avoid

- **Roles in user_metadata.** User can edit it. Use app_metadata or a roles table.
- **Long-lived JWTs with stale role claims.** Users see old permissions after a role change. Refresh JWT after admin changes.
- **Authz logic only in middleware, none in RLS.** Defense-in-depth gone.
- **Storing audit logs in same tables as data.** Append-only logs need their own table.
- **Forgetting to revoke roles on user deletion.** Cascade deletes prevent orphans.

## Summary

- Custom JWT claims via Custom Access Token Hook for fast, slowly-changing fields.
- Role tables for richer / faster-changing permissions.
- Permission tables for resource-scoped fine-grained access.
- Multi-tenancy via tenant_members + current_tenant_id claim.
- Feature/plan gating via app_metadata + has_feature() function.
- Audit logging via trigger writing to append-only table.
- Authz lives in layers: RLS, claims, functions, Edge, UI. RLS is the final word.

Next module: realtime, storage, and edge.
