---
module: 1
position: 3
title: "Schema-per-tenant and DB-per-tenant"
objective: "The more-isolated end of multi-tenancy."
estimated_minutes: 5
---

# Schema-per-tenant and DB-per-tenant

## Schema-per-tenant

One database, but one PostgreSQL schema per tenant:

```sql
CREATE SCHEMA tenant_acme;
CREATE TABLE tenant_acme.users (...);
CREATE TABLE tenant_acme.orders (...);

CREATE SCHEMA tenant_beta;
CREATE TABLE tenant_beta.users (...);
```

Application connects with `SET search_path TO tenant_acme;` per request; queries look unscoped (`SELECT * FROM users`) but actually hit the right schema.

**Pros:**
- No tenant_id in WHERE clauses; cleaner queries.
- Strong logical isolation (one tenant can't accidentally query another's tables).
- Per-tenant backups easier (one schema dump).
- Per-tenant migrations possible.

**Cons:**
- Migrations now run N times (once per schema). At thousands of tenants, this is slow.
- Schema explosion: 10K tenants = 10K schemas, hard to manage in tools.
- Connection pool complexity (which schema is each connection set to?).
- Postgres has some limits (catalog size grows with schemas).

For small-to-medium tenant counts (10s to low 1000s): schema-per-tenant works. Beyond that, it becomes operationally heavy.

Frameworks: `django-tenants` (Django), `apartment` (Rails) implement this. Have escape hatches when needed.

## DB-per-tenant (silo)

One database per tenant. Either:
- Different DBs in the same PostgreSQL cluster.
- Different RDS / cloud DB instances.
- Different clusters entirely.

```python
def get_db_for_tenant(tenant_id):
    config = lookup_tenant_config(tenant_id)
    return connect(config['connection_string'])

@app.before_request
def set_db():
    g.db = get_db_for_tenant(extract_tenant_id(request))
```

**Pros:**
- Strongest isolation.
- Backup / restore per tenant is trivial (it's a database).
- Compliance friendly (data residency obvious; can be in specific region).
- Performance isolation (one tenant can't hog).
- Custom features per tenant possible (different versions, schemas).

**Cons:**
- Most expensive operationally.
- Onboarding requires provisioning a DB (seconds to minutes).
- Migrations run N times across N databases (orchestrate carefully).
- Aggregate analytics requires cross-DB queries (data warehouse).
- Connection pool management non-trivial (potentially thousands of pools).

Used by: companies with enterprise tier, regulated industries (healthcare, finance), companies promising data residency.

## Connection management at scale

With many DBs, connection pooling becomes critical. Patterns:

- **Connection per request.** Open, query, close. Simple; doesn't scale (TCP overhead).
- **Per-DB pool.** Each tenant has its own pool. Memory per tenant; possibly limited.
- **Shared pool with rebinding.** One large pool; tenant context set per query via `SET app.tenant_id = ...`. Postgres-specific.
- **External connection pooler.** PgBouncer per database; routing layer above.

For 100s of tenants: per-DB pools work. For 1000s+: connection-multiplexing tools (PgBouncer + custom logic, Supabase's pooler, AWS RDS Proxy).

## Hybrid: pooled with silo tier

The pragmatic enterprise pattern:

```
Free / Pro / Team tier → pooled DB (shared)
Enterprise tier → dedicated DB per customer
```

Application code abstracts the connection lookup. Pooled customers hit the shared DB; enterprise customers hit theirs. Same codebase serves both.

Pricing reflects the cost: free is free; enterprise is $X0,000+/year because the operational cost is real.

Implementation: a `tenants` table records `connection_type` (pooled/dedicated) and `connection_id` (which pool / DB). Auth middleware looks up; sets context.

```python
def get_db_for_tenant(tenant):
    if tenant.tier == 'enterprise':
        return connect_to_dedicated(tenant.connection_id)
    else:
        return connect_to_pool()
```

## Multi-region SaaS

For global SaaS, customers in different regions may need:
- **Data residency.** GDPR (EU data in EU), regional compliance.
- **Low latency.** Reads near users.

Patterns:
- **DB per region.** US tenants in US DB; EU tenants in EU DB. Tenant table records region.
- **Read replicas per region.** Writes go to home region; reads served locally.
- **Active-active.** Multi-master across regions. Complex; conflict resolution.

For most SaaS starting global: one region (often US-East). When EU customers ask, add EU DB and route. When that becomes onerous, generalize.

CockroachDB, YugabyteDB, Spanner are global SQL options that handle multi-region natively. Trade-off: more complex; higher cost. Use when global multi-region is core to the product.

## Migrations across many tenants

For schema or DB per tenant, migrations have to run N times. Strategies:

- **Sequential.** Run migration on each tenant in order. Slow at 1000s of tenants.
- **Parallel.** Multiple workers run migrations on different tenants concurrently. Faster; risk of capacity saturation.
- **Lazy.** Run migration on tenant only when they next access; defers cost. Complexity around "is this tenant migrated yet?"

Tools: Atlas, Liquibase, Flyway can manage multi-DB migration. Custom orchestration scripts common.

Coordinate with deployment: deploy app code that supports BOTH old and new schema; run migrations gradually; remove old-schema support after all tenants migrated.

## Choosing between schema and DB

| Need | Pick |
|------|------|
| Stronger isolation than pooled | Schema or DB |
| Data residency / region-specific | DB |
| Per-tenant customization | DB |
| 100s of tenants, moderate compliance | Schema |
| 1000s+ tenants, basic isolation | Schema or pooled+RLS |
| Enterprise tier of pooled SaaS | DB |

For most SaaS: pooled with RLS for SMB + DB for enterprise. Schema-per-tenant is rarer but has its niche.

## Common mistakes

- **Schema-per-tenant at 10K tenants.** Slow migrations; tool issues.
- **DB-per-tenant for free tier.** Operational cost > revenue.
- **No automation for provisioning.** Manual = slow + error-prone.
- **Forgot to add new tables to migration list.** New tenant's missing tables.
- **No aggregate analytics strategy.** Hard to answer "how many users across all tenants?"

## Summary

- Schema-per-tenant: one DB, one schema per tenant. Cleaner queries; complex migrations.
- DB-per-tenant (silo): strongest isolation; most operational cost.
- Hybrid pooled + silo for enterprise is the pragmatic pattern.
- Connection management gets complex at scale; pooling matters.
- Migrations across many tenants need automation.

Next: RLS in Postgres.
