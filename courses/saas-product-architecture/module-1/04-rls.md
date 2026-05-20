---
module: 1
position: 4
title: "Row-level security in Postgres"
objective: "Database-enforced tenant isolation."
estimated_minutes: 5
---

# Row-level security in Postgres

## What RLS does

Postgres Row-Level Security: define policies that restrict which rows a query can see, based on session variables.

```sql
-- Enable RLS on the table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: only see your own tenant's rows
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

Now `SELECT * FROM orders` (no WHERE clause) ONLY returns the current tenant's rows. Postgres enforces. Buggy app code can't accidentally leak.

## Setting the tenant context

App sets a session variable at the start of each request:

```python
@app.before_request
def set_tenant():
    tenant_id = extract_tenant_from_token()
    db.execute("SET LOCAL app.tenant_id = %s", (tenant_id,))
```

`SET LOCAL` scopes to the current transaction. RLS policies reference `current_setting('app.tenant_id')`. Combined: every query in this request operates only on this tenant's data.

If the app forgets the SET, queries return ZERO rows (no match for the policy) — safer failure than "all rows."

## Why RLS beats app-level filtering

App-level: developer remembers to add `WHERE tenant_id = ...` everywhere. One miss = cross-tenant leak.

RLS: the database enforces. Even raw SQL queries, ORMs with bugs, console access — all respect the policy. The leak surface drops dramatically.

Trade-off: slight per-query overhead (policy evaluation). Negligible for typical workloads.

Modern SaaS on Postgres should use RLS unless they have specific reasons not to.

## More complex policies

RLS supports any SQL expression:

```sql
-- Allow reading own orders OR orders shared with you
CREATE POLICY order_access ON orders
  USING (
    tenant_id = current_setting('app.tenant_id')::uuid
    AND (
      user_id = current_setting('app.user_id')::uuid
      OR shared_with @> ARRAY[current_setting('app.user_id')::uuid]
    )
  );

-- Different policy for SELECT vs UPDATE
CREATE POLICY order_select ON orders FOR SELECT USING (...);
CREATE POLICY order_update ON orders FOR UPDATE USING (user_id = current_user_id());
```

Per-action policies (FOR SELECT, INSERT, UPDATE, DELETE) for granular control.

## Supabase makes this idiomatic

Supabase (PostgreSQL + APIs) is built around RLS. Every table has policies; client SDKs send the user's JWT; policies reference the JWT claims:

```sql
CREATE POLICY user_orders ON orders
  FOR SELECT
  USING (auth.uid() = user_id);
```

Frontend calls `supabase.from('orders').select('*')` — Supabase passes the user's JWT to Postgres; RLS filters; only user's own orders return.

This is how you ship a frontend that talks directly to the database safely. Without RLS, you'd need a backend to enforce; with it, the DB enforces.

## Bypass for admin / cross-tenant

For admin code that needs cross-tenant access:

```sql
-- Create a "superuser" role that bypasses RLS
CREATE ROLE admin_role BYPASSRLS;

-- Or in queries:
SET role TO admin_role;
SELECT * FROM orders;  -- bypasses RLS
```

Use sparingly; audit logged; specific admin endpoints only.

Alternative: separate connection / role for admin paths. App uses tenant role; admin tools use admin role.

## Performance impact

RLS adds policy evaluation to every query touching the table. Postgres optimizes this — policies are typically inlined into the query plan.

For tenant_id-based policies on indexed columns: minimal overhead (the same index lookup happens).

For complex policies (joins, subqueries): can be slow. Profile.

Most real-world RLS deployments see <5% overhead. Worth it for the safety guarantee.

## Common patterns

**Tenant scoping.**

```sql
CREATE POLICY tenant ON orders
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

**User scoping within tenant.**

```sql
CREATE POLICY user_owned ON private_notes
  USING (
    tenant_id = current_setting('app.tenant_id')::uuid
    AND user_id = current_setting('app.user_id')::uuid
  );
```

**Role-based.**

```sql
CREATE POLICY admin_or_owner ON orders
  USING (
    tenant_id = current_setting('app.tenant_id')::uuid
    AND (
      current_setting('app.user_role') = 'admin'
      OR user_id = current_setting('app.user_id')::uuid
    )
  );
```

**Read-only public data.**

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY anyone_read ON products FOR SELECT USING (true);
CREATE POLICY admin_write ON products FOR ALL USING (
  current_setting('app.user_role') = 'admin'
);
```

## RLS with views and functions

Functions invoked from RLS-protected tables respect the calling context. Be careful with SECURITY DEFINER functions that bypass RLS — they run with the function-owner's privileges.

Views inherit the RLS of underlying tables (with caveats).

## Migration from non-RLS to RLS

For existing pooled SaaS without RLS:

1. Add policies (initially `USING (true)` so nothing breaks).
2. Audit app code: which queries miss tenant filter?
3. Tighten policies to enforce tenant_id.
4. Run integration tests against RLS-enabled DB.
5. Monitor for "zero rows returned" anomalies (likely missing SET).

Phased rollout reduces risk. Most teams take 1-3 months to fully retrofit.

## Common mistakes

- **RLS enabled but no policies.** Default DENY — everything queries return empty.
- **App doesn't SET the tenant variable.** Queries return empty.
- **Mixing admin and tenant paths in one connection.** Confusion.
- **Complex policies with joins.** Performance degrades.
- **Forgetting RLS on new tables.** Migration scripts must enable + add policies.

## Summary

- RLS = Postgres-enforced row filtering based on session variables.
- App sets tenant context per request; queries automatically scoped.
- Defends against app-code bugs (missed WHERE clauses).
- Supabase model: frontend → DB direct with RLS = safe.
- Use for tenant scoping; user scoping; role-based access.
- Modern Postgres SaaS uses RLS by default.

Module 1 complete. Next module: billing.
