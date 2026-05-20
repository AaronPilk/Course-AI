---
module: 5
position: 3
title: "Self-hosting vs managed"
objective: "When to make the switch."
estimated_minutes: 7
---

# Self-hosting vs managed

## The escape-hatch promise

Supabase is open source. Every component — Postgres, GoTrue (auth), PostgREST (API), Realtime, Storage, Edge Functions — can be self-hosted on your own infrastructure. The schema is standard Postgres; data is portable; auth tokens are standard JWTs.

The escape-hatch is one of Supabase's strongest features. You're not locked in. If you outgrow managed or need specific infrastructure controls, you can run the same stack yourself.

That said, most teams should NOT self-host. Managed is dramatically simpler. Self-hosting trades engineering convenience for control and cost — usually the wrong trade except in specific situations.

## When managed wins

For nearly every team starting out and most teams at scale:

- **Automated backups and PITR** built-in.
- **Patches and upgrades** applied without your involvement.
- **Monitoring and alerting** set up.
- **Scaling** (compute, connections, storage) one-click.
- **Multi-region**, replicas, branching all available.
- **Support** when things break.
- **Security patches** applied quickly across the fleet.

Self-hosting means owning all of this yourself. For most teams, that's a full-time job. Managed lets you focus on building product.

## When self-hosting wins

Specific scenarios where self-hosting earns its complexity:

**1. Strict data-residency or compliance requirements.**
Some industries require data to stay in specific regions or specific clouds (government, defense, healthcare in some countries). Supabase managed runs in specific regions; if yours isn't one, self-host.

**2. Air-gapped or on-prem deployments.**
Enterprise customers sometimes require on-prem deployments behind their firewall. Self-host to meet that requirement.

**3. Extreme cost optimization at scale.**
At very high scale ($10k+/month on managed), running your own Postgres on dedicated hardware can be cheaper if you have the ops team to support it.

**4. Specific Postgres features not available on managed.**
Custom extensions, custom replication setups, custom PostgreSQL versions. Most teams don't need this.

**5. White-label / embed Supabase in your product.**
SaaS platforms providing "database-as-a-service" to their own customers may self-host Supabase to embed it.

If none of these apply, managed is the right answer.

## The self-host stack

Supabase is composed of:

- **Postgres** with extensions (pgcrypto, pgvector, etc.).
- **GoTrue** — auth service.
- **PostgREST** — auto-generated REST API.
- **Realtime** — WebSocket service.
- **Storage** — file storage and CDN.
- **Edge Functions** — Deno runtime.
- **Studio** — admin dashboard (optional).
- **Kong** — API gateway.

Each runs as a container. The recommended deployment is Docker Compose for small / single-server setups, Kubernetes for larger.

Official self-host repo: `github.com/supabase/supabase` (the `docker` directory has the compose setup).

## Docker Compose setup

For a single-server deployment:

```bash
git clone https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env

# Edit .env with your secrets:
# POSTGRES_PASSWORD, JWT_SECRET, etc.

docker compose up -d
```

Within a few minutes, all services are running on the host. Access:

- API: `http://localhost:8000`
- Studio: `http://localhost:3000`
- Postgres: port 5432.

Use a reverse proxy (Caddy, Traefik, Nginx) to add TLS and a public hostname.

## What you take on with self-hosting

The hidden operational work:

**1. Backups.** You need to set up pg_dump or pg_basebackup, store backups offsite, test restores. Without this, one disk failure = total data loss.

**2. Monitoring.** Postgres metrics, service health, disk usage, query performance. Tools like Prometheus + Grafana; PgHero for query insights.

**3. Updates.** Postgres patches, Supabase service updates, dependency updates. Coordinate across services.

**4. Scaling.** Vertical scaling = bigger server. Horizontal scaling = read replicas, connection pooling tuning, sharding.

**5. Security.** Hardening Postgres, TLS termination, secret management, audit logging, intrusion detection.

**6. Migrations.** Same supabase CLI works against self-hosted; coordinate deployment with app releases.

Each of these is a chunk of work that's free on managed.

## Hybrid approaches

Some teams do hybrid:

- **Managed Postgres + self-hosted services.** Use a managed Postgres (Supabase, RDS, Cloud SQL) but run your own GoTrue, PostgREST, etc. Get backups and high-availability for the core data; control the API layer.

- **Self-hosted Postgres + managed peripheral services.** Run Postgres on your own infrastructure; pay for Supabase's Edge Functions or Storage. Less common.

- **Multi-environment.** Production on managed Supabase; staging/dev self-hosted. Cheap iteration; safe prod.

Hybrid lets you reach for specific controls without taking on the full self-host burden.

## Migration paths

**Managed → self-hosted:**

1. Set up self-hosted Supabase stack.
2. Use logical replication or pg_dump to copy data.
3. Apply migrations.
4. Test thoroughly with a parallel deployment.
5. Cut over DNS / app config.

Plan for downtime during the final cut-over (or use logical replication to keep both in sync until cut).

**Self-hosted → managed:**

Same process in reverse. Often easier because Supabase has explicit migration tools for inbound projects.

## Kubernetes for self-hosting at scale

For teams with serious DevOps capability:

- Supabase has Helm charts for Kubernetes deployment.
- Each service runs as a deployment with autoscaling.
- Postgres via Crunchy Data, Patroni, or CloudNativePG for HA.
- Object storage via MinIO or your cloud's S3-compatible service.

K8s self-hosting is doable but is a significant project. Plan months, not days.

## Cost comparison

Rough numbers (varies wildly with workload):

- **Supabase managed Pro**: $25/month base + usage. For a typical small app, $50-200/month all-in.
- **Self-hosted on AWS EC2 t3.large + RDS**: $80-150/month at idle, more under load. Plus your engineering time.

At very small scale, managed often costs more in dollars but vastly less in engineering hours. At very large scale, self-hosted can be cheaper in dollars but requires dedicated platform engineers.

The break-even depends on your team. Most teams under 50 engineers should stay on managed indefinitely.

## When to plan the migration

Reasonable triggers for considering self-hosting:

- Spending >$5k/month on managed and growing.
- Specific compliance requirement that managed can't meet.
- Need for custom Postgres extensions Supabase doesn't support.
- Acquisition / enterprise contract requirements.

Even with these triggers, evaluate the alternative carefully — managed is a competitive market; switching managed providers is easier than self-hosting.

## Mistakes to avoid

- **Self-hosting "to save money" without ops capacity.** Engineering time costs more than the bill.
- **Skipping backups on self-hosted.** No safety net.
- **Self-host without TLS.** Public internet, plaintext auth.
- **Over-provisioning.** Buy what you need; scale up as load grows.
- **Underestimating ongoing maintenance.** Patches, monitoring, capacity planning are work.

## Summary

- Most teams should NOT self-host. Managed wins for engineering simplicity.
- Self-host when compliance, residency, on-prem, or extreme scale demand it.
- Stack runs via Docker Compose (small) or Kubernetes (large).
- Operational work: backups, monitoring, updates, scaling, security.
- Hybrid approaches let you take some controls without full self-hosting.
- Migration paths exist in both directions; logical replication keeps data in sync during cut-over.

Next: cost optimization at scale.
