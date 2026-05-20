---
module: 5
position: 2
title: "Backups, point-in-time recovery, and disaster planning"
objective: "Don't lose your data."
estimated_minutes: 7
---

# Backups, point-in-time recovery, and disaster planning

## The unglamorous discipline

Backups are the dullest part of running a database — until you need one. Then they're the only thing that matters. Almost every team eventually has a "we lost data" incident: a buggy migration, a dropped table, a hostile actor, a corruption event, an accidental DELETE.

The right time to set up backups is when you launch. Not after the incident.

## What Supabase provides

Supabase managed plans include automated backups:

- **Free plan**: no automated backups. Manual exports only. Don't run production on free.
- **Pro plan**: daily backups, 7-day retention, point-in-time recovery (PITR) at +$50/month.
- **Team / Enterprise**: longer retention, PITR included, more frequent backups.

Backup mechanics:

- **Full backups** happen daily.
- **Continuous WAL archiving** lets you restore to any point within retention.
- **Backups stored offsite** in a separate region for disaster resilience.

You don't manage the backup infrastructure; you do need to verify it's working and know how to restore.

## Point-in-time recovery

PITR lets you restore the database to any moment within retention — not just nightly snapshots. Useful for:

- "We dropped the wrong table at 2:34 PM. Restore to 2:33 PM."
- "A bad migration corrupted data over 3 hours. Restore to before it ran."
- "An attacker did something at a specific time. Restore to before the attack."

How it works: continuous WAL (Write-Ahead Log) archiving captures every change. To restore to point T, Supabase replays the WAL up to T.

PITR is a paid feature ($50/mo on Pro as of 2026). For any business-critical app, it's not optional.

## Restoring from backup

Restore process in dashboard:

1. Dashboard → Database → Backups.
2. Choose a backup (full daily) or specify a timestamp (PITR).
3. Confirm — typically restores into a new project or branch (preserves the original for comparison).
4. Verify data; switch app connection if needed.

The restore can take from minutes (small DB) to hours (large DB). Plan accordingly.

You can't restore in-place easily without service disruption. Best practice: restore to a separate project, verify, then make the cut-over.

## Practice your restore

**Most important practice: actually do a restore.** Don't trust that backups work until you've restored from one.

Regular drill:

1. Pick a backup from yesterday.
2. Restore it to a new project.
3. Verify a few key tables look right.
4. Compare row counts to production.
5. Delete the test project.

15-minute exercise. Run quarterly. The day you really need it, you'll know exactly how it works.

Teams that skip this almost always discover bugs the day they need a real restore.

## Self-managed backups

In addition to Supabase's automated backups, consider:

- **Logical exports** (`pg_dump`) for application-controlled backups.
- **Replication to another Postgres** for hot-standby readiness.
- **CSV exports** of critical tables to S3 / GCS daily.

For high-stakes data (financial records, regulatory data), having backups outside Supabase's infrastructure is wise. If Supabase has an outage, you can still get your data.

```bash
# Daily logical export.
pg_dump "postgresql://..." -F c -f backup-$(date +%Y%m%d).dump
```

Run via GitHub Actions, AWS Lambda, or any scheduled job; store in your own S3 bucket.

## Data export for compliance

GDPR, CCPA, and similar regulations require giving users their data on request. Build an export endpoint:

```ts
// Edge Function: user requests their data.
serve(async (req) => {
  const { user } = await verifyUser(req);
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: posts } = await supabase.from('posts').select('*').eq('author_id', user.id);
  const { data: comments } = await supabase.from('comments').select('*').eq('author_id', user.id);
  
  return new Response(JSON.stringify({ profile, posts, comments }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

Most regulations require this within 30 days of request. Building it before you need it saves a fire drill.

## Data deletion for compliance

Same regulations require deletion on request. Cascade deletes from `auth.users` handle the data graph:

```sql
-- profiles cascades from auth.users via FK with on delete cascade.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  ...
);

-- Posts likewise.
create table public.posts (
  ...
  author_id uuid not null references auth.users(id) on delete cascade,
  ...
);
```

Then deletion is one call:

```ts
await supabaseAdmin.auth.admin.deleteUser(userId);
```

Test this. Discover orphan tables that weren't set up with cascade BEFORE GDPR enforcement, not after.

## Soft delete vs hard delete

Some businesses prefer soft deletes (mark `deleted_at`, hide from queries) for restoration safety:

```sql
alter table posts add column deleted_at timestamptz;

-- Hide deleted rows via RLS or default view.
create view active_posts as
  select * from posts where deleted_at is null;
```

Soft delete trade-offs:

- **Pros**: easy undelete; preserves history.
- **Cons**: doesn't satisfy "right to be forgotten" regulations; tables grow unboundedly; risk of accidentally showing deleted rows.

A common pattern: soft delete with a periodic hard-delete job that runs after a retention period (e.g., 30 days).

## Disaster scenarios

Plan for each:

**1. Database corruption.** Restore from latest backup or PITR.

**2. Accidental data deletion.** PITR to just before the deletion.

**3. Ransomware / malicious deletion.** Self-managed offline backups become essential; attacker can't touch what isn't connected.

**4. Region-wide outage.** Multi-region replication; recovery time depends on architecture.

**5. Provider outage / acquisition / shutdown.** Logical backups in your control; portable Postgres schema; self-hosting option.

The cost of preparing scales with the stakes. Free apps maybe accept 24-hour recovery; B2B SaaS needs <1 hour RTO; financial services often need <15 minutes.

## RTO and RPO

Two metrics define your disaster posture:

- **Recovery Time Objective (RTO)** — how long can you tolerate being down? (1 minute? 1 hour? 1 day?)
- **Recovery Point Objective (RPO)** — how much data can you afford to lose? (1 minute? 5 minutes? 24 hours?)

Default Supabase PITR is roughly RTO = hours, RPO = minutes. For tighter RTO/RPO, build additional infrastructure (hot standby, multi-region, custom replication).

Document your RTO/RPO commitments. Test against them quarterly.

## Backup verification

Backups that haven't been verified might not work. Set up monitoring:

- Backup completion notifications (Supabase sends these).
- Periodic restore tests (quarterly is reasonable).
- Validation queries on restored data (row counts match expected ranges).

A backup that fails silently is worse than no backup — you find out only when you need it.

## Cross-region replication

For high-availability, consider a read replica in another region:

- Read traffic can go to either region (lower latency for distant users).
- If primary region fails, promote replica to primary.
- Adds cost; requires the application to handle failover.

Supabase Enterprise supports cross-region replication. For most teams, standard backups + PITR is enough.

## Logical replication for portability

If you want to migrate off Supabase someday (or just have a parallel Postgres), set up logical replication to a self-hosted Postgres:

```sql
create publication my_pub for all tables;
```

Replication from Supabase to your Postgres mirrors all data continuously. You can flip apps to point at the replica at any time.

This is the ultimate escape hatch — you're never trapped on any provider.

## Mistakes to avoid

- **Free plan in production.** No automated backups.
- **No PITR.** Daily backups only means up to 24h data loss.
- **Never testing restore.** Backups that don't restore aren't backups.
- **No data export endpoint.** GDPR/CCPA fire drill.
- **No cascade deletes.** Orphan rows after user deletion.
- **Soft delete everything.** Doesn't satisfy regulations; tables bloat.

## Summary

- Pro plan + PITR is the minimum for production.
- Practice restores quarterly; don't trust untested backups.
- Self-managed backups (pg_dump to S3) for ransomware resilience.
- Cascade deletes from auth.users for compliance-safe deletion.
- Soft delete with periodic hard-delete for businesses that need both.
- RTO/RPO commitments documented and tested.
- Logical replication as the ultimate escape hatch.

Next: self-hosting vs managed.
