---
module: 4
position: 4
title: "Deploy strategies: canary, blue/green, dark launches"
objective: "Ship safely without taking down the SaaS."
estimated_minutes: 5
---

# Deploy strategies: canary, blue/green, dark launches

## Why deploy strategy matters

A bad deploy = SaaS down = customers angry + revenue lost + team panic. SaaS deploys multiple times a day for fast iteration; the strategy must support frequent + safe.

The classic approaches: blue/green, canary, rolling, dark launches. Each handles different risks; mature SaaS combines them.

## Rolling deploys

The default in most orchestrators (Kubernetes, ECS, etc.):
- Spin up new version pods one by one.
- Remove old version pods one by one.
- Eventually all on new.

```
Step 1: [v1][v1][v1][v1] → spin up v2
Step 2: [v1][v1][v1][v1][v2]
Step 3: [v1][v1][v1][v2] (remove one v1)
...
Step N: [v2][v2][v2][v2]
```

Capacity preserved throughout; if v2 starts failing, the existing v1 pods keep serving.

Caveat: during rollout, both versions serve traffic. State changes from v2 may confuse v1 (e.g., new field in DB). Backwards-compatible code required.

## Blue/Green deploys

Two complete environments:
- **Blue.** Current production. Serves all traffic.
- **Green.** New version. Idle.

Deploy steps:
1. Deploy new version to Green.
2. Test Green internally.
3. Flip load balancer: Green now serves; Blue idle.
4. If problems: flip back to Blue.

Pros: instant rollback (just flip the LB); test full environment before exposure.
Cons: 2× infrastructure cost; database is shared (usually); migrations need backwards compat.

## Canary deploys

Deploy new version to a small subset of servers / traffic; watch metrics; expand if healthy.

```
Step 1: 99% v1, 1% v2 → monitor 30 min
Step 2: 95% v1, 5% v2 → monitor 1 hour
Step 3: 75% v1, 25% v2 → monitor 2 hours
Step 4: 50% v1, 50% v2 → monitor longer
Step 5: 0% v1, 100% v2
```

If error rate / latency spikes during any step: roll back to 100% v1. The 1% catches most issues without affecting all users.

Most mature SaaS deploys via canary. Kubernetes (Argo Rollouts, Flagger), ECS, AWS App Runner all support.

## Dark launches

Deploy code that runs but doesn't surface to users:

```python
# New algorithm running, but ignored
old_result = old_algorithm(input)
new_result = new_algorithm(input)
log_comparison(old_result, new_result)
return old_result  # always return old
```

Lets you test new code at full load without user impact. Compare outputs; find bugs; tune. Then flip feature flag to use new code.

Useful for ML / algorithm changes where correctness on real data matters more than latency.

## Feature flags + deploy combos

Modern pattern: deploy + flag.

1. Deploy code with new feature flagged off.
2. Verify deploy via canary.
3. Once stable in prod, flip flag on for 1% of customers.
4. Gradually expand to 100%.
5. Remove flag after 2 weeks of stability.

Separates "code is in production" from "feature is active." Allows hotfixes to ship without enabling unfinished features.

## Database migrations

The trickiest part of SaaS deploys. Two scenarios:

**Additive migrations.** Adding column, table, index. Compatible with old code (it just ignores).
- Run migration first (during low-traffic window).
- Then deploy new code.

**Breaking migrations.** Renaming column, changing type. Old code breaks if migration runs first.
- Deploy code that handles BOTH old and new (read both column names, write to both).
- Run migration.
- Deploy code that uses only new (cleanup).

This "expand and contract" or "parallel change" pattern is unavoidable for zero-downtime SaaS. Painful but works.

Tools: Flyway, Liquibase, Alembic, Drizzle migrations for schema management.

## Database compatibility windows

During a deploy, both v1 and v2 of the code may be running. The database must work for both. Plan accordingly:

- New columns: add with default; both versions tolerate.
- Renamed columns: support both names temporarily.
- New tables: only new code uses; old ignores.
- Removed tables: don't! Old code may still query.

For destructive changes: multi-deploy plan that takes weeks. Patient.

## Rollback strategies

Plan for failure:

- **Code rollback.** Roll deploys back to previous version.
- **Feature flag.** Disable problematic feature without rollback.
- **Database rollback.** Rarely possible (data changes); plan migrations to be reversible if possible.

The fastest "undo" is feature flags; rollback of code; rollback of DB rare.

For each deploy: estimate rollback time. If >5 min, that's the duration of a real incident. Plan reductions (faster deploys, smaller changes, better flagging).

## CI/CD pipelines

The build automation:

```
Pull request → CI runs tests → 
  Merge → CI builds artifact → 
    Deploy to staging → automated tests → 
      Deploy to canary (1%) → metrics check (30 min) → 
        Deploy to 100% production.
```

Each step automated; fewest manual steps to production.

Tools: GitHub Actions, GitLab CI, CircleCI, Buildkite. For deploys: Argo CD, Spinnaker, AWS CodeDeploy, GCP Cloud Deploy.

## SaaS deploy frequency

- **Multiple per day.** Aggressive; small batches; fast iteration. Stripe-style.
- **Daily.** Common at mid-stage.
- **Weekly.** Slower; bigger changes; bigger risks.
- **Monthly.** Big-bang releases; often painful.

Smaller / more frequent deploys = lower risk per deploy + faster feedback. The "deploy a thousand times a day" companies have iron-clad confidence in their deploy pipeline.

Mature SaaS gets here. Earlier-stage: weekly or daily fine while you build the pipeline.

## Deploy windows

- **Anytime.** Deploy 24/7. Required for high-velocity teams.
- **Business hours only.** Deploy when humans available to respond. Common at smaller teams.
- **Avoid Fridays / late nights.** "Don't deploy then go home."
- **Pre-announced maintenance windows.** Customer notice; long deploys.

Stripe deploys all the time; smaller SaaS may deploy only Mon-Thu, business hours. Match velocity / risk tolerance.

## Observability during deploys

While deploying:
- **Error rate.** Should be flat. Spike → rollback.
- **Latency.** P99 stable.
- **Saturation.** New pods healthy.
- **Custom metrics.** Per-endpoint success.

Dashboards aimed at "is this deploy healthy." Watch during canary expansion.

## Mistakes to avoid

- **Big-bang deploys.** Many changes at once = hard to identify breakages.
- **No canary.** Bad deploy hits everyone.
- **Breaking DB changes without compat code.** Downtime.
- **Deploys on Friday afternoons.** When things break, nobody's around.
- **No metrics-based abort.** Bad deploys complete because no one notices in time.

## Summary

- Rolling: default in orchestrators; gradual replacement.
- Blue/Green: parallel environments; instant cutover; 2× cost.
- Canary: incremental traffic shift; catches issues with minimal impact.
- Dark launches: run code without exposure; test on real load.
- Feature flags + deploy: separate "shipped" from "released."
- DB migrations need backwards-compat code.
- Smaller / more frequent deploys = lower risk per deploy.

Module 4 complete. Next module: scaling and operations.
