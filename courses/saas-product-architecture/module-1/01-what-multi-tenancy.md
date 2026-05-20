---
module: 1
position: 1
title: "What multi-tenancy means"
objective: "The core architectural decision behind every SaaS."
estimated_minutes: 5
---

# What multi-tenancy means

## The single SaaS question

A SaaS serves many customers from one codebase + infrastructure. The core question: how do you separate one customer's data, settings, and behavior from another's?

Answer: multi-tenancy. The strategy chosen here ripples through every system — auth, billing, deployments, observability, support. Get it right early; retrofitting is expensive.

## What "tenant" means

A tenant = an organization or account that's a separate customer.

- For B2C: each user is often a tenant of size 1.
- For B2B: a company is a tenant; many users belong to it.

Examples:
- **Notion.** Each workspace = tenant.
- **Slack.** Each workspace = tenant; users belong to one or many.
- **Stripe.** Each account = tenant.
- **Linear.** Each workspace = tenant.

The tenant ID becomes the central identifier in your data model. Every query asks: "for this tenant, give me this data."

## The three classic models

**Pooled (shared everything).** One database, one schema; tenant_id column on every table. Cheapest; needs careful query discipline.

**Bridge (shared DB, separate schemas).** One database; one Postgres schema per tenant. Middle ground.

**Silo (DB-per-tenant).** Each tenant has its own database. Most isolation; most operational cost.

Each has trade-offs:

| Axis | Pooled | Bridge | Silo |
|------|--------|--------|------|
| Cost per tenant | Lowest | Medium | Highest |
| Isolation | Logical (app-enforced) | Schema | Physical |
| Operational complexity | Lowest | Medium | High |
| Onboarding speed | Fast (write a row) | Medium (create schema) | Slow (provision DB) |
| Performance isolation | Poor (noisy neighbor) | Medium | Best |
| Compliance / data residency | Hard | Medium | Easy |
| Backup / restore per tenant | Hard | Medium | Easy |

For most SaaS starting out: pooled. For enterprise / regulated industries: silo or hybrid (silo for big customers; pooled for smaller).

## Hybrid models

Real-world SaaS often combines:

- **Pooled for SMB; silo for enterprise.** Lower-end customers share DB; enterprise pays for dedicated.
- **Pooled with read replicas.** Reads shared; writes serialized through main.
- **Pooled with sharding.** Many pooled DBs; tenants assigned to shards.

Salesforce, Slack, Notion all run hybrid architectures. The choice depends on tier and customer requirements.

## Identifying tenant on every request

Multi-tenancy demands that every request know which tenant is asking.

Common patterns:

- **Subdomain.** `acme.example.com` → tenant "acme."
- **URL path.** `/acme/dashboard`.
- **Header.** `X-Tenant: acme`.
- **JWT claim.** `tenant_id: "acme"` in the token.

Server middleware extracts the tenant ID; every subsequent operation scopes to it.

```python
@app.before_request
def set_tenant():
    g.tenant_id = extract_tenant_from_token(request.headers['Authorization'])

@app.route('/orders')
def list_orders():
    return Order.query.filter_by(tenant_id=g.tenant_id).all()
```

The tenant context lives for the lifetime of the request; every query uses it.

## Why getting this wrong is expensive

**Cross-tenant data leaks.** Customer A's data shown to customer B = catastrophic incident. Has happened to large companies; SoC 2 audits will dig into this.

**Operations don't scale.** One-DB-per-tenant with 10K tenants = 10K databases to back up, patch, monitor. Cost explodes.

**Migration is painful.** Switching from pooled to silo (or vice versa) when you're large is a 6-12 month project.

Start with the right model. Talk to a SaaS architect; talk to customers about their requirements; don't blindly pick.

## What customers care about

When evaluating your SaaS, customers (especially enterprise) often ask:

- "Are my data stored separately from other customers'?" (Want silo).
- "What's your data residency?" (May need silo in specific regions).
- "Can you back up just my data?" (Easier with silo).
- "What happens if another tenant has a security incident?" (Less concerning with silo).
- "Can I get a dedicated instance?" (Selling point of silo).

For SMB: nobody asks. For enterprise: every customer asks. Determines your model.

## Modern tools that help

- **PostgreSQL Row-Level Security (RLS).** Database-enforced tenant isolation. Big win for pooled models.
- **Supabase.** RLS-first model; built for multi-tenancy.
- **Multitenant ORMs.** Some frameworks (Django with django-tenants, Rails with apartment) have tenant abstractions.

For new projects on Postgres: RLS is the way to make pooled multi-tenancy safe. Eliminates entire class of "we forgot to filter" bugs.

## Compliance and multi-tenancy

- **SOC 2.** Requires data isolation between customers (pooled with RLS = OK; silo = better).
- **GDPR.** Data residency, right to delete. Silo makes delete easy ("drop the database"); pooled requires careful cascade.
- **HIPAA / regulated industries.** Often requires silo + explicit BAAs.

Your customer base determines compliance pressure. SMB SaaS rarely needs more than SOC 2; enterprise gets the full alphabet soup.

## Mistakes to avoid

- **No tenant model.** Single-tenant code "we'll add multi-tenancy later" — later is much harder.
- **Forgotten tenant filter.** `SELECT * FROM orders` without `WHERE tenant_id = X` = cross-tenant leak. Use RLS.
- **One DB per tenant for SMB.** Operational complexity dwarfs revenue per tenant.
- **Pooled for regulated enterprise.** Customers won't sign; deals lost.
- **Mixing models without abstraction.** Some tables tenant-scoped; others not; confusion.

## Summary

- Multi-tenancy = how you separate customers in shared infrastructure.
- Three models: pooled (shared DB), bridge (schemas), silo (DB per tenant).
- Most SaaS starts pooled; enterprise tier may add silo.
- Every request must establish tenant context; every query must scope.
- Postgres RLS makes pooled safe.
- Customer compliance requirements drive model choice.

Next: pooled / shared-schema in detail.
