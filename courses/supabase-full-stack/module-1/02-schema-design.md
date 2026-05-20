---
module: 1
position: 2
title: "Schema design with extensions and types"
objective: "UUIDs, enums, JSONB, generated columns."
estimated_minutes: 7
---

# Schema design with extensions and types

## Schema as foundation

The schema is the contract between your database and everything that touches it — API, app code, migrations, future engineers, future you. Good schema decisions made early pay back for years. Bad ones become permanent technical debt.

Supabase gives you Postgres with a few extensions pre-enabled and many more available. The schema-design decisions worth getting right early: primary keys, enums vs lookup tables, timestamps, JSONB usage, and generated columns.

## Primary keys: UUID by default

Use UUIDs as primary keys for most user-facing tables. Reasons:

- Generated client-side; no server round-trip to know the ID.
- No information leakage (incrementing integers expose row counts).
- Distributed-friendly (UUIDs don't collide across regions or shards).
- Compatible with Supabase Auth's `auth.users.id` (UUID type).

Default pattern:

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  ...
);
```

`gen_random_uuid()` is part of `pgcrypto` (pre-enabled on Supabase). Don't roll your own ID generation.

Exception: high-volume internal tables (logs, events at massive scale) where bigint sequential IDs save storage and index size. For these, use `bigint generated always as identity`.

## Timestamps with timezone

Always store timestamps as `timestamptz` (timestamp with time zone), not plain `timestamp`. Postgres stores UTC internally but returns in the session timezone — which means clients across timezones see correct local times automatically.

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Standard convention: every table has `created_at` and (usually) `updated_at`. Pair `updated_at` with a trigger that auto-updates on row changes:

```sql
create function tg_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_set_updated_at
  before update on posts
  for each row execute function tg_set_updated_at();
```

## Enums vs lookup tables

For finite sets of values (status codes, post types, role names), you have two choices:

**Postgres enums:**

```sql
create type post_status as enum ('draft', 'published', 'archived');
create table posts (
  ...
  status post_status not null default 'draft'
);
```

Pros: type-safe, fast, indexable, integrated with Postgres.

Cons: adding new values is a schema migration; removing values requires data migration.

**Lookup tables:**

```sql
create table post_statuses (
  code text primary key,
  label text not null,
  sort_order int not null
);

create table posts (
  ...
  status text not null references post_statuses(code) default 'draft'
);
```

Pros: add/remove values without migrations; can add metadata to each value.

Cons: requires joins; slightly more complex queries.

Rule of thumb: enums for set-in-stone values (status, role); lookup tables for evolving sets (tag categories, plan tiers that may change).

## JSONB for flexible data

Where the data shape is genuinely variable, JSONB:

```sql
create table user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index user_settings_preferences_gin on user_settings using gin(preferences);
```

Query with operators:
- `->` returns JSON (e.g., `preferences->'theme'`).
- `->>` returns text (e.g., `preferences->>'theme'`).
- `@>` checks containment (e.g., `preferences @> '{"theme": "dark"}'`).

GIN indexes make `@>` containment queries fast. Use them.

## Generated columns

Postgres supports generated columns — columns computed from other columns automatically. Useful for derived data:

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  subtotal numeric(12, 2) not null,
  tax_rate numeric(5, 4) not null default 0,
  total numeric(12, 2) generated always as (subtotal * (1 + tax_rate)) stored
);
```

The `total` column is always derived; you can't insert/update it directly. Postgres maintains it on every change. Indexable; queryable like any column.

Useful for: computed totals, full-text search vectors, normalized lookup keys.

## Foreign keys

Define foreign keys. They prevent orphan rows, enforce relational integrity, and document relationships.

```sql
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
```

`on delete cascade` deletes comments when their parent post is deleted. Other options: `restrict` (prevent delete), `set null` (set the FK to null on parent delete), `no action` (deferred check).

Postgres makes foreign-key checks fast; don't skip them for "performance."

## Check constraints

Enforce data validity at the database level:

```sql
create table users_extra (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (length(username) between 3 and 30),
  email text not null check (email like '%@%'),
  age int check (age >= 13)
);
```

Application-level validation can be bypassed (direct DB access, bugs, future changes). Database constraints can't. Use both.

## Indexes — the right ones

Index columns you query on. Beware: indexes speed up reads but slow down writes (every insert/update maintains the index).

Default indexes you usually want:

- Foreign-key columns (Postgres doesn't index FKs automatically).
- Columns used in `WHERE` clauses heavily.
- Columns used in `ORDER BY` for paged queries.

```sql
create index posts_author_id_idx on posts(author_id);
create index posts_status_created_at_idx on posts(status, created_at desc);
```

Composite indexes work for queries that filter on the leading columns. Order matters.

For JSONB containment queries:
```sql
create index events_props_gin on events using gin(properties);
```

For full-text search:
```sql
create index posts_body_fts on posts using gin(to_tsvector('english', body));
```

EXPLAIN your slow queries (covered in Module 5) to know what to index.

## Naming conventions

Pick a convention; stick to it. Common Postgres conventions:

- **Snake_case for tables, columns, functions.** `user_settings`, `created_at`, `tg_set_updated_at`.
- **Singular or plural?** Both work; pick one. Many teams use plural for tables (`users`, `posts`).
- **Foreign keys end in `_id`.** `author_id`, `post_id`.
- **Boolean columns start with `is_` or `has_`.** `is_published`, `has_paid`.
- **Timestamps end in `_at`.** `created_at`, `published_at`.

Consistency makes the schema readable. Tools like `pg_dump` and migration generators respect the convention you set.

## Extensions worth knowing

Supabase has many extensions available; enable as needed:

- **pgcrypto** — `gen_random_uuid()`, crypto functions. Pre-enabled.
- **pgvector** — embeddings (covered Module 4).
- **postgis** — geospatial.
- **pg_trgm** — trigram similarity for fuzzy search.
- **pg_cron** — scheduled jobs inside the database.
- **citext** — case-insensitive text columns.
- **uuid-ossp** — additional UUID generation methods (older; gen_random_uuid usually enough).

Enable via Supabase Dashboard → Database → Extensions, or with SQL:

```sql
create extension if not exists pg_trgm;
```

## Mistakes to avoid

- **Integer primary keys for user-facing IDs.** Leaks counts; doesn't distribute well.
- **Plain `timestamp` instead of `timestamptz`.** Timezone bugs.
- **No foreign keys.** Orphan rows.
- **Indexing everything.** Slow writes.
- **Not indexing foreign keys.** Slow joins and cascading deletes.
- **JSONB for relational data.** Loses query power.
- **No `updated_at` triggers.** Manual maintenance fails eventually.

## Summary

- UUID primary keys via `gen_random_uuid()` for user-facing tables.
- `timestamptz` for all timestamps; auto-update `updated_at` via trigger.
- Enums for stable sets, lookup tables for evolving sets.
- JSONB with GIN indexes for flexible payloads.
- Generated columns for derived data.
- Foreign keys enforce integrity; index them.
- Check constraints enforce validity at DB level.
- Indexes match query patterns; don't over-index.

Next: the auto-generated REST API.
