---
module: 1
position: 1
title: "Why Postgres beats NoSQL for most apps"
objective: "Relational guarantees + JSONB flexibility."
estimated_minutes: 7
---

# Why Postgres beats NoSQL for most apps

## The argument

The NoSQL wave (MongoDB, DynamoDB, Firebase) sold a simple promise: schemaless flexibility, horizontal scale, fast iteration. For most apps that promise turned out to mislead. The flexibility was real but came with hidden taxes: ad-hoc queries became painful, relational reasoning got encoded in application logic, data consistency drifted, and migrations away from NoSQL became massive projects when products outgrew document stores.

Postgres in 2026 is what most apps actually need: relational guarantees, ACID transactions, mature indexing, a rich ecosystem of extensions, and JSONB columns that match document-DB flexibility where it actually matters. Supabase made this approachable by putting Postgres under a developer-friendly cloud with auth, realtime, storage, and an auto-generated API on top.

## What Postgres gives you that NoSQL doesn't

**Transactions across multiple rows and tables.** A bank-transfer-style operation (debit A, credit B, log the transfer) either all succeeds or all rolls back. In a document DB, multi-document atomicity is fragile or unavailable.

**Joins.** Querying related data across tables in a single query is normal Postgres; in document DBs you either denormalize aggressively (creating consistency problems) or do N+1 client-side fetches.

**Strong typing with flexibility.** Columns have types. Types catch bugs. JSONB lets you store semi-structured data when you need flexibility, without giving up typed columns elsewhere.

**Mature query planner.** Decades of optimization on EXPLAIN, indexing strategies, and query planning. Complex queries that crawl through ORMs in NoSQL are first-class citizens in SQL.

**Extensions.** PostGIS for geo, pgvector for embeddings, pg_trgm for fuzzy search, TimescaleDB for time series. The ecosystem lets one database serve many specialized workloads.

**Open source and portable.** You can run Postgres anywhere. Vendor lock-in is minimal compared to proprietary NoSQL services.

## What NoSQL still wins

NoSQL isn't always wrong. Three real wins:

**Massive horizontal write scale.** When you need to ingest 100k+ writes per second across globally-distributed regions, DynamoDB or Cassandra outperform Postgres without aggressive sharding.

**Pure key-value workloads.** A simple session store or feature-flag service where you only need GET by key — Redis or DynamoDB are simpler.

**Schemaless rapid prototyping.** When you genuinely don't know the data shape and want to iterate weekly, document DBs are friendlier in early phases.

For most B2C SaaS, B2B platforms, e-commerce, internal tools, and marketplaces — workloads measured in thousands of writes per second on a single primary — Postgres wins on every axis except the "no schema" feel that turns into a liability anyway.

## Supabase's bet

Supabase built around the thesis that Postgres should be the platform, not just the database. Once you commit to Postgres:

- The auto-generated REST API (PostgREST) means you don't need to write CRUD endpoints.
- Row Level Security lets the database enforce authorization without middleware.
- Realtime subscriptions ride on Postgres logical replication — already there.
- Storage policies use the same RLS engine.
- Edge Functions handle the rest.

The architecture compounds. Each piece reinforces the database-centric approach.

## When to choose Supabase vs alternatives

**Supabase wins when:** you want Postgres + a generated API + auth + realtime + storage in one platform, with the option to self-host later.

**Firebase wins when:** your team is mobile-first, comfortable with NoSQL document modeling, and not concerned about lock-in.

**Self-hosted Postgres + custom backend wins when:** you have specific performance needs, a strong backend team, and want full control.

**Hasura / Postgrest standalone wins when:** you want the GraphQL/REST auto-API but want to host the database yourself with your own stack around it.

For most teams building a new product in 2026, Supabase is the right default. The escape hatch — Postgres is portable, the auth schema is standard, the storage is S3-compatible — means you're not trapped if you outgrow it.

## JSONB — Postgres's document-DB feature

Postgres has had JSONB columns since 2014. They're indexable, queryable, and performant. The pattern: model the relational core in columns; use JSONB for semi-structured payloads where flexibility matters.

```sql
create table events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  event_type text not null,
  occurred_at timestamptz not null default now(),
  properties jsonb not null default '{}'::jsonb
);

create index events_properties_gin on events using gin(properties);
```

You can query JSONB with operators:

```sql
select * from events
where event_type = 'purchase'
  and properties->>'plan' = 'premium'
  and (properties->'metadata'->>'campaign_id')::int = 42;
```

Indexed via GIN; reasonably fast. For most cases where you'd reach for a document DB, JSONB inside Postgres gives you the same flexibility plus everything Postgres offers.

## Common Postgres-first arguments

The pattern of these debates is consistent. Counterarguments to common NoSQL claims:

- **"NoSQL scales horizontally; Postgres doesn't."** Modern Postgres on managed services (RDS, Supabase) handles tens of thousands of writes/sec on a primary. Read replicas handle reads. Sharding via Citus or partition tables handles further scale. The "Postgres can't scale" claim was true in 2010, not 2026.

- **"NoSQL is faster for development."** True for the first sprint. False by month 3 when you're maintaining ad-hoc consistency logic.

- **"NoSQL fits modern apps."** Modern apps are mostly relational (users, accounts, orders, posts, comments). They've always been relational. Storage choice doesn't change the underlying shape.

- **"SQL is too rigid."** Migrations let you evolve schemas. ORMs and query builders smooth the syntax. JSONB handles the genuinely-flexible parts.

## What this course assumes

This course assumes you're already convinced Postgres is the right choice or willing to be. We won't re-litigate the database wars in every lesson. The focus is on getting the most out of Supabase's Postgres-first platform.

Subsequent lessons cover schema design, RLS, auth, realtime, storage, edge functions, and production operations. By the end you can build a Supabase backend that scales from prototype to serious production.

## Mistakes to avoid

- **Treating Postgres like NoSQL.** Storing all data in one JSONB column instead of typed columns. Loses Postgres's strengths.
- **Never reaching for JSONB.** Forcing flexible data into rigid columns when JSONB would fit.
- **Avoiding joins.** Modeling for denormalization when relational queries are natural.
- **Assuming Postgres can't scale.** Modern Postgres handles serious load on a single primary.

## Summary

- Postgres beats NoSQL for most app workloads.
- ACID transactions, joins, types, and extensions are non-negotiable strengths.
- JSONB gives document-DB flexibility inside a relational core.
- Supabase puts Postgres + auth + realtime + storage + functions + API into one platform.
- NoSQL still wins for massive horizontal write scale or pure key-value workloads.
- Migrations evolve schemas safely; flexibility doesn't require schemalessness.

Next: schema design with extensions and types.
