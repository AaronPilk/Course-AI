---
module: 1
position: 2
title: "Single DB, shared schema — the default"
objective: "The pooled model in detail."
estimated_minutes: 5
---

# Single DB, shared schema — the default

## The pattern

One database. All tenants' data in the same tables. Each row belongs to a tenant via a `tenant_id` column.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  email TEXT NOT NULL,
  ...
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
```

Every query filters by tenant_id:

```sql
SELECT * FROM users WHERE tenant_id = $1 AND id = $2
```

Simple to implement; efficient at scale; works for most SaaS.

## Discipline required

The catch: every query MUST filter by tenant_id. Missing one filter = cross-tenant data leak. This is THE risk of the pooled model.

Defenses:

1. **ORM scoping.** Application code wraps the ORM to inject tenant_id automatically:
```python
class TenantQuery(Query):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.filter_by(tenant_id=g.current_tenant_id)
```

2. **Code review discipline.** Catch missing filters before merge.

3. **Linting / static analysis.** Custom rules to flag tenant-scoped tables without tenant filter.

4. **PostgreSQL RLS.** The strongest defense — enforced at the database, can't be bypassed by buggy app code.

For new projects: use RLS (next lesson). Don't trust app code alone.

## Schema design

Add `tenant_id` to every table that holds tenant-owned data:

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL,
  total DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_tenant_user ON orders(tenant_id, user_id);
CREATE INDEX idx_orders_tenant_created ON orders(tenant_id, created_at);
```

Always index on `(tenant_id, ...)` because every query starts with tenant filter. Composite indexes make per-tenant queries fast.

Some tables aren't tenant-scoped:
- `tenants` itself.
- Global config / lookup tables.
- Cross-tenant analytics (carefully aggregated).

Distinguish; document which.

## Tenant table

The root:

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  plan TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settings JSONB
);
```

Users belong to one or more tenants (via membership table):

```sql
CREATE TABLE memberships (
  user_id UUID,
  tenant_id UUID,
  role TEXT,
  PRIMARY KEY (user_id, tenant_id)
);
```

User can be in many tenants (multi-workspace pattern in Slack-style apps). User logs in; sees tenants they belong to; picks one; that becomes the active context.

## Per-tenant customization in pooled

Customers want customizations: branding, settings, custom fields. Options:

- **Settings column (JSONB).** Flexible; semi-structured. Easy to query, easy to evolve.
- **Custom-fields table.** Schema for "this tenant has a custom field 'foo' of type X."
- **Feature flags.** Toggles per tenant.

```sql
-- JSONB settings
SELECT settings->>'theme_color' FROM tenants WHERE id = $1;
```

JSONB is the default approach. Schema flexible; you query into it as needed. Custom fields done as JSONB per row work for most cases.

## Resource isolation — the noisy neighbor problem

Shared DB = one tenant can degrade others:
- Huge query saturates DB CPU.
- Lock contention.
- Storage filled by one tenant.

Defenses:

- **Statement timeouts.** No query runs longer than X seconds.
- **Per-tenant quotas.** Soft limits on row counts / storage.
- **Read replicas.** Heavy reads to replica; writes to primary.
- **Connection pools per tenant tier.** Big customers get dedicated pool.
- **Database resource accounting.** Postgres `pg_stat_statements` shows per-query costs.

For most pooled SaaS: defaults are fine until one tenant gets unusually large. Then implement quotas / move to silo.

## Backup and restore

Backing up the whole DB: easy.
Backing up one tenant: hard (requires filtered dumps).

```sql
COPY (SELECT * FROM users WHERE tenant_id = $1) TO 'tenant_dump.csv';
```

For each table. Tedious; error-prone. Tools exist (pgcopydb, custom scripts).

Restoring one tenant into a fresh environment: also hard. If your customer asks for a "GDPR data export," you'll write this code eventually.

Plan for tenant-export early; even a basic implementation saves pain later.

## Deletion

GDPR: "Right to be forgotten" — delete user's data on request.

In pooled: cascade DELETE from tenant row. Foreign keys with `ON DELETE CASCADE` clean dependent tables. Test thoroughly; missing cascades leave orphans.

```sql
DELETE FROM tenants WHERE id = $1;
-- All FK-referencing rows also deleted via cascade.
```

Some teams soft-delete (mark deleted; keep for N days for recovery). Pair with hard delete after retention period.

## Cross-tenant queries

Sometimes you need data across tenants:
- Analytics dashboards.
- Admin / support tools.
- Aggregate insights ("average # users per tenant").

Build a separate admin code path that bypasses tenant context. Carefully audited; logged; limited to specific roles.

```python
def admin_list_all_users():
    # Bypass tenant filter; this is admin code.
    return db.session.query(User).filter(User.deleted == False)
```

Mark admin endpoints explicitly. RLS policies can have admin escape hatches via role checks.

## Common mistakes

- **Forgot tenant_id filter.** Catastrophic; cross-tenant leak.
- **No composite index.** Per-tenant queries scan instead of using index.
- **All tables tenant-scoped — except one.** Inconsistency confuses developers.
- **No quotas.** One tenant exhausts shared resources.
- **No tenant export strategy.** GDPR / large customer requests panic.

## Summary

- Pooled = one DB, tenant_id everywhere; cheap and efficient.
- Discipline required: every query must filter.
- RLS in Postgres enforces it at the DB level (covered next).
- Composite indexes on `(tenant_id, ...)`.
- Plan for noisy neighbors, exports, deletion early.
- Custom fields via JSONB; feature flags for per-tenant logic.

Next: schema-per-tenant.
