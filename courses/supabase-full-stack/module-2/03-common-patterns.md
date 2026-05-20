---
module: 2
position: 3
title: "Common patterns: owner, team, public-read"
objective: "Recipes for typical authorization needs."
estimated_minutes: 7
---

# Common patterns: owner, team, public-read

## A few patterns cover most apps

Almost every multi-user app's authorization can be expressed with a small set of patterns:

- **Owner** — a row belongs to one user; only that user can do things with it.
- **Team / organization** — a row belongs to a group; members can access it.
- **Public-read, private-write** — anyone can read; only the owner can modify.
- **Role-based** — different roles within a team get different permissions.
- **Time-based** — access changes after a deadline or window.
- **Audit** — users can read but never modify (history rows).

This lesson covers each pattern with copy-paste-ready SQL.

## Pattern 1: Owner

Single user owns the row. Classic example: user profiles, personal notes, drafts.

```sql
create table notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table notes enable row level security;

create policy "Owner can read"
  on notes for select
  using (author_id = auth.uid());

create policy "Owner can insert"
  on notes for insert
  with check (author_id = auth.uid());

create policy "Owner can update"
  on notes for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "Owner can delete"
  on notes for delete
  using (author_id = auth.uid());
```

The `author_id = auth.uid()` check appears in every policy. Could be wrapped in a helper but it's so common many teams just write it inline.

Index `author_id` to keep policy checks fast.

## Pattern 2: Team / organization

Rows belong to a team; all team members can access. Most B2B apps.

```sql
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table memberships (
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  title text not null,
  body text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table documents enable row level security;

-- Helper function
create function public.is_team_member(team uuid) returns boolean as $$
  select exists (
    select 1 from memberships
    where team_id = team and user_id = auth.uid()
  );
$$ language sql security invoker stable;

create function public.team_role(team uuid) returns text as $$
  select role from memberships
  where team_id = team and user_id = auth.uid();
$$ language sql security invoker stable;

-- Read: any team member.
create policy "Members read documents"
  on documents for select
  using (is_team_member(team_id));

-- Insert: any team member can create.
create policy "Members create documents"
  on documents for insert
  with check (is_team_member(team_id));

-- Update: admins and owners only.
create policy "Admins update documents"
  on documents for update
  using (team_role(team_id) in ('owner', 'admin'))
  with check (team_role(team_id) in ('owner', 'admin'));

-- Delete: owners only.
create policy "Owners delete documents"
  on documents for delete
  using (team_role(team_id) = 'owner');
```

Now you have a multi-tenant SaaS authorization model. Members read and write, admins update, owners can delete.

Index `memberships(user_id, team_id)` and `documents(team_id)`.

## Pattern 3: Public-read, private-write

Blog posts, public profiles, shared content. Anyone can read; only the author modifies.

```sql
create table public_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

alter table public_posts enable row level security;

-- Anyone can read published posts.
create policy "Anyone reads published"
  on public_posts for select
  using (status = 'published');

-- Authors can read their own drafts.
create policy "Author reads own"
  on public_posts for select
  using (author_id = auth.uid());

-- Author creates, updates, deletes.
create policy "Author manages own"
  on public_posts for all
  using (author_id = auth.uid())
  with check (author_id = auth.uid());
```

The `for all` shortcut applies to SELECT, INSERT, UPDATE, and DELETE in one go. Use it when the rule is symmetric across actions.

Note: anon users hit the "Anyone reads published" policy; authenticated authors hit both that and "Author reads own" (OR'd, so they see both their drafts and any published posts).

## Pattern 4: Role-based with hierarchy

Sometimes roles are hierarchical: owner > admin > member, where higher roles inherit lower's permissions.

```sql
-- Helper that returns ordered role level.
create function public.team_role_level(team uuid) returns int as $$
  select case
    when role = 'owner' then 3
    when role = 'admin' then 2
    when role = 'member' then 1
    else 0
  end
  from memberships
  where team_id = team and user_id = auth.uid();
$$ language sql security invoker stable;

create policy "Min role required to update"
  on documents for update
  using (team_role_level(team_id) >= 2)  -- admin or owner
  with check (team_role_level(team_id) >= 2);

create policy "Owner only delete"
  on documents for delete
  using (team_role_level(team_id) >= 3);
```

The numeric ordering makes policy logic cleaner than checking explicit role names everywhere.

## Pattern 5: Time-based access

Access expires at a deadline; or starts at a date.

```sql
create table assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id),
  body text not null,
  due_at timestamptz not null,
  submitted_at timestamptz
);

alter table assignments enable row level security;

-- Students can read their own assignment.
create policy "Student reads own"
  on assignments for select
  using (student_id = auth.uid());

-- Students can submit (set submitted_at) only before due_at.
create policy "Student submits before due"
  on assignments for update
  using (student_id = auth.uid() and now() <= due_at)
  with check (student_id = auth.uid() and now() <= due_at);
```

`now()` is the request time. The window-based check is enforced at the database level.

## Pattern 6: Audit / append-only

Rows are insertable but not modifiable — useful for logs, transaction history, audit trails.

```sql
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  occurred_at timestamptz not null default now(),
  payload jsonb
);

alter table audit_log enable row level security;

-- Anyone authenticated can insert their own audit entries.
create policy "Insert own audit"
  on audit_log for insert
  with check (actor_id = auth.uid());

-- Admins can read all.
create policy "Admins read audit"
  on audit_log for select
  using (
    exists (select 1 from admins where user_id = auth.uid())
  );

-- No update or delete policies = no one can modify or remove.
```

The absence of UPDATE and DELETE policies means those operations are denied. Audit immutability enforced by the database.

## Pattern 7: Shared with someone

A row is private but the owner can grant access to specific other users.

```sql
create table shared_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  title text not null,
  body text
);

create table document_shares (
  document_id uuid not null references shared_documents(id) on delete cascade,
  shared_with_user_id uuid not null references auth.users(id) on delete cascade,
  permission text not null check (permission in ('view', 'edit')),
  primary key (document_id, shared_with_user_id)
);

alter table shared_documents enable row level security;

create policy "Owner full access"
  on shared_documents for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Shared users can view"
  on shared_documents for select
  using (
    exists (
      select 1 from document_shares
      where document_id = shared_documents.id
        and shared_with_user_id = auth.uid()
    )
  );

create policy "Shared editors can update"
  on shared_documents for update
  using (
    exists (
      select 1 from document_shares
      where document_id = shared_documents.id
        and shared_with_user_id = auth.uid()
        and permission = 'edit'
    )
  )
  with check (
    exists (
      select 1 from document_shares
      where document_id = shared_documents.id
        and shared_with_user_id = auth.uid()
        and permission = 'edit'
    )
  );
```

A Google Docs-style sharing model in 30 lines of SQL.

Index `document_shares(shared_with_user_id, document_id)` for fast policy checks.

## Combining patterns

Real apps mix patterns. A B2B SaaS might have:

- Public marketing pages (no auth).
- User-private settings (owner pattern).
- Team-scoped data (team pattern).
- Shared documents with external collaborators (shared pattern).
- Audit logs (append-only pattern).

Each table picks the pattern that fits. RLS keeps them all consistent.

## Mistakes to avoid

- **Reinventing patterns inconsistently.** Pick the standard pattern for each common case.
- **Skipping indexes on policy-checked columns.** Slow at scale.
- **Cross-table policy logic that becomes recursive.** Postgres can struggle to plan; performance suffers.
- **Forgetting indexes on join tables (memberships, shares).** Multi-row policy checks scan otherwise.

## Summary

- Owner pattern: `author_id = auth.uid()`.
- Team pattern: helper function `is_team_member(team)` plus role-based variants.
- Public-read, private-write: combine `status = 'published'` and ownership.
- Role hierarchy: numeric levels for cleaner comparisons.
- Time-based: include `now()` checks in USING / WITH CHECK.
- Append-only: omit UPDATE/DELETE policies.
- Shared access: share-table + EXISTS check in policy.

Next: testing and debugging RLS.
