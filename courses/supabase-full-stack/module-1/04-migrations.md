---
module: 1
position: 4
title: "Migrations and database branching"
objective: "Manage schema changes without fear."
estimated_minutes: 7
---

# Migrations and database branching

## The schema-change problem

Every production database eventually faces this: a code change requires a schema change. Adding a column, renaming a table, adding an index. Get the migration wrong and you can take the site down, corrupt data, or block a deploy. Get the workflow wrong and merge conflicts proliferate, environments drift, and prod becomes a mystery snapshot.

Supabase provides a migration system built on standard Postgres migration tooling plus a database branching feature that lets you preview schema changes in isolated environments. Together they give you the discipline of "schema as code" without the friction.

## The migration model

Supabase migrations are SQL files in your repo:

```
supabase/
  migrations/
    20260101120000_create_posts.sql
    20260102143000_add_published_at.sql
    20260103090000_add_post_status_enum.sql
```

Filenames are `<timestamp>_<description>.sql`. The timestamp determines apply order. Each file contains one logical change.

Example:

```sql
-- 20260102143000_add_published_at.sql
alter table posts
  add column published_at timestamptz;

create index posts_published_at_idx on posts(published_at);
```

Apply with the Supabase CLI:

```bash
supabase db push  # Apply local migrations to remote
supabase db pull  # Pull remote schema into a new local migration
```

## Local-first development

The standard workflow:

1. **Develop against a local Postgres instance** (`supabase start` runs Docker-based local stack).
2. **Make schema changes via SQL or the Studio UI.**
3. **Generate a migration:** `supabase db diff -f my_change_name` writes the diff as a migration file.
4. **Review the SQL.** Don't blindly commit auto-generated diffs.
5. **Commit the migration file to git.**
6. **Apply to staging via `supabase db push` against your staging project.**
7. **Test, then push to production** via the same command against your prod project.

The discipline is treating the local Supabase environment as the source of truth for schema changes, and the migration files as the audit log.

## Database branching

Supabase database branching creates isolated database environments tied to git branches. You push a branch with schema changes; Supabase spins up a preview database; you test there; merge to main applies it to production.

Workflow:

1. Create a branch in git.
2. Make schema changes via migration files.
3. Push the branch; Supabase creates a preview database with those migrations applied.
4. Connect your preview app to the preview database; verify everything works.
5. Open a PR; review the migrations.
6. Merge; the migrations apply to production.

This eliminates "it worked locally but broke in prod" for schema changes. The preview is a real database with real migrations applied — if it works there, it works in prod.

Branching is enabled in your Supabase project settings; integrates with GitHub via the Supabase GitHub app.

## Safe migration patterns

Some patterns minimize the risk of breaking production:

**Always-additive first.** Add new columns/tables before removing old ones. Deploy app code that uses the new schema. Then remove old.

**Backfill in batches.** A `UPDATE` over a million rows can lock the table. Use batched updates:

```sql
do $$
declare
  batch_size int := 1000;
  done int := 0;
begin
  loop
    update posts
      set new_column = compute_new_value(old_column)
      where id in (
        select id from posts
          where new_column is null
          limit batch_size
      );
    get diagnostics done = row_count;
    exit when done = 0;
  end loop;
end $$;
```

For very large tables, run via `pg_cron` or an Edge Function over hours.

**Add columns nullable, fill, then add NOT NULL.** A new `NOT NULL` column on a populated table requires a default or pre-filling. Pattern:

1. Add column nullable.
2. Backfill values.
3. Alter to `NOT NULL`.

**Add index CONCURRENTLY.** Default `CREATE INDEX` takes an exclusive lock — bad on busy tables:

```sql
create index concurrently posts_status_idx on posts(status);
```

`CONCURRENTLY` builds the index without blocking writes. Slower; safer.

**Avoid renaming columns/tables in heavy-traffic deploys.** Old code references the old name; new code references the new name; a window where one or both is broken. Use add-new-column → write to both → migrate reads → drop old.

## Versioning the schema

Postgres has a `schema_migrations` table (or similar) tracking applied migrations. Supabase manages this for you.

When teammates pull your branch:

```bash
supabase db pull  # Sync local schema to match the new migrations
```

If your local diverged (someone made manual changes), reset and re-apply:

```bash
supabase db reset
```

This wipes local and reapplies all migrations. Fine for dev; never run on prod.

## Down migrations and rollback

Supabase migrations are forward-only by default. To "roll back," you write a new migration that undoes the change.

This is intentional. Down-migrations are tricky:

- Dropping a column loses data permanently.
- Renaming back can break code that's already deployed.
- Forward-only forces you to think about safe schema changes.

If you accidentally pushed a bad migration: write the corrective migration immediately. Don't try to undo by deleting the file from history.

## Seed data

Beyond migrations, you often need seed data (reference rows, sample data for dev). Supabase supports a `seed.sql` file that runs after migrations on local resets:

```sql
-- supabase/seed.sql
insert into post_statuses (code, label, sort_order) values
  ('draft', 'Draft', 1),
  ('published', 'Published', 2),
  ('archived', 'Archived', 3)
on conflict (code) do nothing;
```

Keep production seed data separate; never commit production user data to seeds.

## Type generation

Supabase generates TypeScript types from your schema:

```bash
supabase gen types typescript --local > types/database.ts
```

Use in supabase-js:

```ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database';

const supabase = createClient<Database>(url, key);

const { data } = await supabase.from('posts').select('*');
// data is typed; column types match the schema
```

Regenerate after every schema change. The generated types prevent half the bugs that ORM-driven workflows produce.

## CI/CD integration

A clean CI/CD setup for Supabase:

1. **Lint migrations** in CI (`supabase db lint`).
2. **Apply migrations to a temporary database** in CI; run integration tests against it.
3. **On merge to main**, apply migrations to staging.
4. **On manual approval**, apply to production.

Most teams use GitHub Actions; Supabase has official actions for this.

## Mistakes to avoid

- **Schema changes via Studio UI without migrations.** Drift between environments.
- **Editing migrations after they're applied.** Out of sync with applied state.
- **Big-bang migrations on live tables.** Blocking locks, downtime.
- **No type regeneration.** Code gets out of sync with schema.
- **No staging environment.** Skipping the test step is how prod breaks.

## Summary

- Migrations are SQL files in `supabase/migrations/`.
- Develop locally; generate migrations from diffs; commit; apply to remote.
- Database branching: per-branch preview databases tied to git.
- Use safe patterns: additive-first, backfill in batches, CONCURRENTLY for indexes.
- Forward-only; corrective migrations for "rollback."
- Regenerate TS types after every schema change.
- CI/CD pipeline lints, tests, applies progressively.

Next module: Row Level Security — the right way to do authorization.
