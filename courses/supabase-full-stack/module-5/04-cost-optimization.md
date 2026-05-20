---
module: 5
position: 4
title: "Cost optimization at scale"
objective: "Where money leaks and how to plug it."
estimated_minutes: 7
---

# Cost optimization at scale

## The cost surface

Supabase pricing is straightforward but has several axes that can spike independently:

- **Database compute** — CPU + RAM size of your project.
- **Database storage** — disk usage and growth rate.
- **Egress / bandwidth** — data leaving Supabase.
- **Auth users** — monthly active users (MAU) above the included tier.
- **Storage egress** — data served from Storage.
- **Edge Function invocations** — compute time per request.
- **Realtime messages** — sometimes a separate meter.
- **Branches** — preview databases.

Each can grow independently. Total bill is the sum. Cost-optimization means watching each axis and plugging leaks where they appear.

## Right-sizing compute

The database compute tier (Pro $25/mo small, Team $599+ large) sets your CPU and RAM. Right-sizing matters:

- Under-sized = slow queries, connection pool exhaustion, frequent timeouts.
- Over-sized = paying for unused capacity.

Monitor in dashboard:
- CPU utilization (target sustained <70%).
- Memory usage (target 60-80% sustained).
- Connection counts vs pool size.

Upgrade when CPU consistently >70% or memory >85%. Downgrade if both are <40% sustained.

For predictable workloads, right-size once and revisit quarterly. For unpredictable, add compute headroom.

## Storage growth

Database size grows from:

- Application data (rows accumulating over time).
- Bloated tables from MVCC (dead tuples not vacuumed).
- Unused indexes.
- Large JSONB columns or BLOBs in tables (move to Storage instead).
- pgvector embeddings (significant at scale — 6KB per 1536-dim row).

Audit periodically:

```sql
-- Largest tables.
select
  schemaname || '.' || tablename as table,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename) - pg_relation_size(schemaname || '.' || tablename)) as index_size
from pg_tables
where schemaname not in ('pg_catalog', 'information_schema', 'pg_toast')
order by pg_total_relation_size(schemaname || '.' || tablename) desc
limit 20;
```

Find the giants. Decide: archive, compress, or move out.

## Archiving old data

For accumulating history (events, logs, audit), archive instead of keeping live:

**Option 1: Archive table.** Move rows older than N days to an archive table; queryable but on cheaper storage.

**Option 2: External archive.** Export old rows to S3 / GCS in Parquet; delete from Postgres.

**Option 3: Partitioning.** Use Postgres native partitioning by month/quarter; detach old partitions to archive.

```sql
-- Partitioned table.
create table events (
  id uuid not null,
  occurred_at timestamptz not null,
  event_type text,
  data jsonb
) partition by range (occurred_at);

-- Create monthly partitions.
create table events_2026_01 partition of events
  for values from ('2026-01-01') to ('2026-02-01');

-- Eventually detach old partitions.
alter table events detach partition events_2024_01;
-- Now events_2024_01 is a normal table; archive or drop.
```

Partitioning makes archiving cheap. Set up monthly via pg_cron.

## Index audit

Unused indexes cost storage and slow writes. Find them:

```sql
select
  schemaname || '.' || relname as table,
  indexrelname as index,
  pg_size_pretty(pg_relation_size(indexrelid)) as size,
  idx_scan as times_used
from pg_stat_user_indexes
order by idx_scan asc, pg_relation_size(indexrelid) desc
limit 20;
```

Indexes with `idx_scan = 0` are unused. Drop them (after verifying — sometimes they support occasional queries that haven't run recently).

## VACUUM and bloat

Tables with heavy UPDATE/DELETE accumulate dead tuples. Autovacuum reclaims, but for high-churn tables, manual VACUUM ANALYZE plus index rebuilds (REINDEX) keep storage tight.

```sql
-- Aggressive vacuum + analyze on a hot table.
vacuum (analyze, verbose) heavy_table;

-- Rebuild indexes if they've bloated.
reindex table concurrently heavy_table;
```

Schedule monthly via pg_cron or maintenance window.

## Storage optimization

Supabase Storage costs come from:

- Storage size (per GB).
- Bandwidth egress (per GB served).

Optimizations:

**1. Image transformations.** Serve resized variants instead of full-resolution; saves bandwidth.

**2. Aggressive caching.** Set long Cache-Control on immutable assets; CDN serves repeat requests free.

**3. Compress before upload.** Client-side resize / compress before uploading reduces both storage and bandwidth.

**4. Move infrequently-accessed files to cheaper external storage.** S3 Glacier, Cloudflare R2.

**5. Lifecycle policies.** Delete unused / orphaned files automatically.

A common leak: orphan files when a row is deleted but the linked file isn't. Add cascade triggers or periodic cleanup jobs.

## Edge Function optimization

Edge Functions cost per invocation and per compute time.

Optimizations:

**1. Cache responses where possible.** Don't call expensive APIs on every request.

**2. Batch operations.** One function call processing 100 items > 100 calls processing 1 item each.

**3. Use Postgres for computation.** SQL is faster than equivalent JavaScript for data operations.

**4. Optimize cold starts.** Smaller bundles start faster; keep functions small.

**5. Don't call functions from functions.** Each call costs. Inline logic where reasonable.

## Realtime cost

Realtime costs scale with concurrent subscribers and message volume. Optimizations:

**1. Filter aggressively.** Subscribe to `room_id=eq.X` not all rooms.

**2. Use Broadcast instead of DB Changes for ephemeral data.** Broadcast doesn't write to DB; cheaper.

**3. Unsubscribe when not needed.** Component unmounts should always remove channels.

**4. Throttle high-frequency broadcasts.** Cursor positions at 60Hz are excessive; 10-20Hz feels the same.

## Auth user counts

Above the included MAU tier, you pay per user. Some hygiene:

**1. Soft-delete inactive accounts.** Reduces MAU count if your billing definition is "logged in within month."

**2. Distinguish session users vs API consumers.** Don't pay for service accounts as MAU.

**3. Don't auto-create users without intent.** Some flows create users for unverified emails; check if they're necessary.

## Egress optimization

Data leaving Supabase costs (bandwidth). Optimizations:

**1. Compress responses.** gzip / brotli over HTTP; reduces sizes 5-10x.

**2. Select only needed columns.** SELECT * costs bandwidth even when client uses one column.

**3. Cache at the CDN.** For Storage egress especially, long cache times reduce origin hits.

**4. Aggregate before sending.** SUM/COUNT in Postgres beats sending raw rows.

## Branching cost

Database branches cost per branch (preview databases). Optimizations:

**1. Delete branches when PRs merge.** GitHub action can automate this.

**2. Limit branches per developer.** Set policies.

**3. Use smaller compute on branches.** Don't need prod-scale compute for preview.

## Monitoring spend

Dashboard → Settings → Billing shows usage by axis. Set up:

- **Spend alerts.** Email when daily cost spikes vs baseline.
- **Monthly review.** Walk through usage by axis; identify outliers.
- **Per-feature attribution.** If you can't tell where spend comes from, you can't optimize.

For larger orgs, integrate Supabase usage into your cloud cost management tools (CloudHealth, CloudCheckr, etc.).

## The 80/20 of cost

In most accounts, 80% of cost reduction comes from:

1. Right-sizing compute (overpaying for headroom).
2. Index audits (removing unused indexes).
3. Egress reduction (caching, compression).
4. Storage cleanup (orphan files, old data archival).

Get these four right and most cost optimization is done. The rest is incremental.

## Mistakes to avoid

- **Over-provisioning compute "just in case."** Pay for what you use; upgrade when needed.
- **Never auditing storage growth.** Tables bloat silently.
- **No spend monitoring.** Bills surprise.
- **Long-running branches.** Costs accumulate.
- **Premature optimization.** First make it work; then make it cheap.

## Summary

- Cost surface: compute, storage, egress, MAU, functions, realtime, branches.
- Right-size compute to actual load.
- Archive old data via partitioning or external storage.
- Drop unused indexes.
- Image transformations + CDN caching for storage egress.
- Filter Realtime subscriptions; use Broadcast for ephemeral.
- Compress responses and cache aggressively.
- Audit monthly; spike alerts on daily anomalies.
- 80/20: compute sizing + index audit + egress + storage cleanup.

Course complete.
