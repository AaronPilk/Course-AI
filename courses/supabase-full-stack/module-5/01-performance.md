---
module: 5
position: 1
title: "Performance: indexes, EXPLAIN, connection pooling"
objective: "Where Postgres apps fail at scale."
estimated_minutes: 7
---

# Performance: indexes, EXPLAIN, connection pooling

## Where apps slow down

Postgres apps fail at scale in predictable ways: missing indexes, N+1 queries, slow RLS policies, connection exhaustion, and unbounded query results. Each has a standard fix; each costs you weeks of pain if you don't diagnose it correctly.

This lesson covers the recurring performance issues and the tools to diagnose them.

## EXPLAIN — your most important tool

`EXPLAIN ANALYZE` shows how Postgres executes a query: which indexes it uses (or doesn't), how many rows it scans, how long each step takes.

```sql
explain analyze
select * from posts
where author_id = 'abc-123'
order by created_at desc
limit 20;
```

Output shows the query plan: sequential scans (bad on large tables), index scans (good), join methods, sorting steps. Look for:

- **Seq Scan on large tables.** Missing index on the WHERE column.
- **Sort with high cost.** Missing index that could enable ordered scan.
- **Nested loop with high row count.** Bad join plan; consider indexes or stats.
- **Filter rejecting many rows after scan.** Should be pushed into index.

Always run EXPLAIN on slow queries before optimizing. Guessing wastes time.

## Index basics

Index columns referenced in WHERE, JOIN, and ORDER BY clauses. Default candidate indexes:

```sql
-- WHERE column.
create index posts_author_id_idx on posts(author_id);

-- Composite for combined WHERE + ORDER BY.
create index posts_author_created_idx on posts(author_id, created_at desc);

-- Foreign key (Postgres doesn't auto-index FKs).
create index comments_post_id_idx on comments(post_id);
```

For composite indexes, the leftmost-prefix rule applies: `(author_id, created_at)` serves queries on `author_id` alone or `author_id + created_at`, but not on `created_at` alone.

## When NOT to index

Indexes cost write performance. Every INSERT/UPDATE/DELETE maintains every index on the table. Over-indexing slows writes meaningfully.

Avoid indexing:

- Low-cardinality columns (boolean flags); seq scan is often faster.
- Columns rarely used in queries.
- Volatile columns where indexes constantly bloat.

A 10-column-index table where you only ever query on 2 columns has 8 unnecessary indexes. Audit periodically.

## Partial indexes

For queries that always include a specific filter, a partial index covers just those rows:

```sql
-- Only published posts in this index.
create index posts_published_created_idx
  on posts(created_at desc)
  where status = 'published';
```

Smaller index; faster builds; faster queries on the matching subset. Great for "filter by status" common patterns.

## GIN indexes for JSONB and arrays

JSONB and array columns need GIN indexes for containment queries:

```sql
create index posts_tags_gin on posts using gin(tags);
create index events_props_gin on events using gin(properties);
```

Without GIN, `WHERE tags @> ARRAY['featured']` or `WHERE properties->>'plan' = 'pro'` does seq scan. With GIN, it's fast.

## Connection pooling

Postgres connections are expensive. Each connection eats ~10MB of memory plus a backend process. A database with 100 connection cap can be overwhelmed by a Node.js server spawning new connections per request.

Supabase provides **PgBouncer**-based connection pooling:

- **Transaction mode** (default for Supabase) — connections are leased per transaction, returned to pool after commit.
- **Session mode** — connections leased per session.
- **Statement mode** — leased per statement.

Use transaction mode for typical app workloads. Session mode for cases requiring connection-level state (prepared statements, advisory locks).

The pooler exposes two connection strings:

- **Direct connection** (port 5432) — for migrations and tools that need full session features.
- **Pooled connection** (port 6543) — for application traffic; uses PgBouncer.

Always use the pooled connection from your app. Direct connections will exhaust the cap under load.

## Pool sizing

Supabase Pro and above expose pool size configuration. Rule of thumb:

- For serverless / edge functions: `default_pool_size = 15` per region.
- For long-running app servers: pool size = (CPU cores × 2) + 1 per server, multiplied by server count.
- Monitor `pg_stat_activity` for connection usage.

Too few pool connections → requests queue. Too many → DB CPU thrashes. Tune based on observed load.

## Query optimization patterns

**1. Select only needed columns.**

```sql
-- Bad: returns everything.
select * from posts where id = 'abc';

-- Better: only what you need.
select id, title, body from posts where id = 'abc';
```

Less data over the wire, less work for Postgres.

**2. Paginate properly.**

```sql
-- Bad: O(N) at late pages.
select * from posts order by created_at desc offset 10000 limit 20;

-- Better: cursor-based.
select * from posts
where created_at < '2026-01-01'
order by created_at desc
limit 20;
```

Cursor pagination is O(log N); offset is O(N).

**3. Avoid SELECT inside WHERE.**

```sql
-- Slow: subquery per row.
select * from posts
where author_id in (select id from users where banned = false);

-- Better: join.
select p.* from posts p
join users u on u.id = p.author_id
where u.banned = false;
```

**4. Batch INSERTs.**

```sql
-- Bad: N round-trips.
for row in rows:
  insert into posts (...) values (...);

-- Good: single query.
insert into posts (col1, col2) values
  ($1, $2), ($3, $4), ($5, $6);
```

Postgres handles bulk inserts much faster than many individual ones.

## RLS performance

Common gotcha: RLS policies are essentially WHERE clauses on every query. Bad policies tank performance.

Optimization:

- **Index columns referenced by policies.**
- **Mark helper functions `STABLE`** so Postgres can call them once per query instead of per row.
- **Avoid complex subqueries in policies.** Move to materialized data when possible.
- **EXPLAIN with the policy in effect.** Run as the user (via `set local`) to see real execution plan.

A common 10x improvement: switch helper function from `VOLATILE` (default) to `STABLE`. Postgres caches the call within a query.

## Maintenance — VACUUM and ANALYZE

Postgres uses MVCC, which creates "dead tuples" on UPDATE/DELETE. Regular maintenance:

- **VACUUM** reclaims dead tuple space.
- **ANALYZE** updates query planner statistics.
- **VACUUM ANALYZE** does both.

Supabase runs autovacuum by default. Verify it's running:

```sql
select schemaname, relname, n_dead_tup, last_autovacuum
from pg_stat_user_tables
order by n_dead_tup desc;
```

High `n_dead_tup` and old `last_autovacuum` = autovacuum is behind. Tune autovacuum settings for high-write tables.

## Monitoring

Supabase dashboard exposes:

- Database size growth.
- Slow query log.
- Connection counts.
- CPU and memory usage.
- Cache hit ratio (target >99%).

For deeper monitoring, enable `pg_stat_statements` and query it:

```sql
select query, calls, total_exec_time, mean_exec_time
from pg_stat_statements
order by total_exec_time desc
limit 20;
```

Top queries by total time are your performance hot spots. Optimize them first.

## Pre-launch checklist

Before going to production:

1. EXPLAIN ANALYZE every common query.
2. Add indexes for every WHERE/JOIN/ORDER BY pattern.
3. Use pooled connection from app.
4. Test load with realistic concurrency.
5. Monitor cache hit ratio; should be >99%.
6. Verify autovacuum is running.
7. Test backup restore (don't trust it works until you've done it).

Pre-launch saves you days of post-launch firefighting.

## Mistakes to avoid

- **Direct connection in production code.** Will exhaust pool.
- **No indexes on FK columns.** Slow joins and cascades.
- **SELECT * everywhere.** Bandwidth and memory bloat.
- **Offset pagination on large tables.** Slow at deep pages.
- **Skipping EXPLAIN.** Optimizing without data wastes time.
- **Indexing columns with very low cardinality.** Wasted index space.

## Summary

- EXPLAIN ANALYZE is the diagnostic tool; use before optimizing.
- Index WHERE/JOIN/ORDER BY columns; partial indexes for filtered subsets.
- GIN for JSONB and arrays.
- Pooled connections (port 6543) for app traffic; direct (5432) for migrations.
- RLS policies are WHERE clauses; index policy columns and mark helpers STABLE.
- Cursor pagination beats offset on large tables.
- Pre-launch: explain every query, load test, verify backups.

Next: backups, point-in-time recovery, and disaster planning.
