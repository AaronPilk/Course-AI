---
module: 4
position: 4
title: "Hotfixes and rollbacks"
objective: "When production breaks."
estimated_minutes: 6
---

# Hotfixes and rollbacks

## The 3 AM call

Production is broken. Errors spiking, users locked out, revenue dropping. You have minutes, not hours, to respond. The team's processes need to support fast, safe recovery.

Two main paths: roll back (revert to the previous version) or hotfix (forward-fix the issue). Pick based on what's faster and safer for the specific situation.

## Rollback first, fix later

The default response to production incidents:

1. Confirm the regression: was caused by the recent deploy?
2. Roll back to the previous version.
3. Verify rollback restored service.
4. Then diagnose calmly.

Rollback is usually faster than hotfix; gets users back to working state. Fix the underlying issue without time pressure.

## Vercel rollback

Vercel: Dashboard → Project → Deployments → previous deployment → "Promote to Production." One click; takes ~30 seconds.

The previous deployment is already built; just shifts the production routing. Near-instant recovery.

## Tag-based rollback workflow

For non-Vercel deploys:

```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to (e.g., v2.5.2)'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ inputs.version }}
      - run: deploy-to-production
```

Trigger manually; specify the prior tag; deploy runs against that code. Tested before you need it; same Path as forward deploys.

Practice rolling back monthly. The 3 AM rollback should not be the first time you've used the workflow.

## Database migration considerations

Rolling back code is easy. Rolling back schema is hard. If your bad deploy included a migration:

- Adding a nullable column: safe to roll back code; new column unused.
- Adding a NOT NULL column with default: safe to roll back; column unused.
- Dropping a column: code rollback may need that column.
- Renaming a column: code rollback expects old name.

The pattern: **migrations should be backward-compatible** so code can roll back without schema rollback.

For breaking schema changes, split into multiple deploys:

1. Deploy 1: add new column (old code still works).
2. Deploy 2: code uses new column (old code stops working).
3. Deploy 3: drop old column.

Between deploys, both code versions work. Rollback within any window is safe.

## When to hotfix instead

Hotfix instead of rollback when:

- The previous version had a worse bug.
- The bug is in third-party dependency the rollback wouldn't fix.
- Many changes since the bad commit; rolling back loses unrelated work.
- The fix is genuinely 2-line and obvious.

Hotfix flow:

1. Branch off the current production tag (e.g., `git checkout -b hotfix/issue v2.5.3`).
2. Make the minimal fix.
3. PR → fast review → merge.
4. Tag a new version (`v2.5.4`).
5. Deploy.
6. Cherry-pick the fix to main if main has moved.

Even hotfixes go through PR review (just expedited). Direct-push-to-main "for speed" is how subtle bugs ship.

## Hotfix branch protection

Some teams allow trusted reviewers to expedite hotfixes:

- Branch protection still requires PR + CI.
- A `hotfix/*` branch may need only 1 reviewer instead of 2.
- Expedited deploy approval.

Setting up the relaxed-but-still-controlled hotfix process is a known need; not a special case.

## Post-incident actions

After the immediate fire is out:

1. **Write an incident report.** What happened, when, who, what was done, what was the root cause.
2. **Add tests** that would have caught it.
3. **Add monitoring** that would have alerted earlier.
4. **Review the deploy process** that let it through.
5. **Schedule a blameless retro.**

The post-incident process is how teams get safer over time. Without it, the same incident repeats.

Don't punish the deployer. Reward speed of detection and recovery. The team that's afraid to deploy will deploy less, accumulate bigger changes, and have bigger incidents.

## Synthetic monitoring

To catch incidents fast, run synthetic checks against production:

- **Healthcheck endpoint** hit every minute from outside (Pingdom, Datadog, UptimeRobot).
- **E2E tests** running every 5-15 minutes against production critical paths.
- **Error rate alerts** (Sentry, Datadog) on traffic anomalies.

The faster you know, the faster you respond. Mean Time to Detect (MTTD) is the most leveraged metric.

## Canary deploys

For high-stakes deploys, ship to a fraction first:

1. Deploy new version, route 5% of traffic to it.
2. Monitor error rates, p95 latency.
3. If healthy, ramp to 25%, 50%, 100%.
4. If unhealthy, roll back the canary; no users-at-large affected.

Kubernetes, AWS App Runner, Vercel (limited), and feature flags all support canary patterns.

Catches issues at 5% scale, not 100%. High ROI for critical services.

## Blue-green deploys

Maintain two production environments (blue, green):

- Blue is currently serving.
- Deploy new version to green.
- Test green internally.
- Switch traffic to green (DNS or load balancer).
- Keep blue ready for instant rollback (switch back).

Costs double infrastructure (briefly). Instant rollback by toggle.

Common pattern for high-uptime services. Less common for SaaS with feature-flag-based rollouts.

## Incident commander pattern

For larger incidents:

- **Incident commander.** Coordinates the response; decides priorities; doesn't typically write code.
- **Operators.** Execute fixes; share status.
- **Communicator.** Updates customers, leadership, status pages.

Roles separate so no one is trying to debug while also updating Slack. For solo or small-team incidents, one person plays all roles; for serious incidents, separate them.

## On-call rotations

For 24/7 services:

- PagerDuty / Opsgenie / Splunk On-Call.
- Engineers take turns on-call.
- Clear escalation paths.
- Runbooks for common incidents.
- Post-incident reviews to update runbooks.

For small teams without 24/7 needs, less formal: a shared "alerts" channel; whoever's around responds.

## Status pages

Public communication during incidents:

- statuspage.io, status.io, Better Status, etc.
- Cron-style updates: "We're investigating slow responses on the API."
- Resolved status with brief root cause.

Reduces support tickets; builds trust through transparency.

## Mistakes to avoid

- **No rollback workflow.** First time you need it shouldn't be production fire.
- **Never practicing rollback.** Process degrades when unused.
- **Hotfix without review.** Bypass quality gates → repeat incidents.
- **Migrations that break rollback.** Forward-only changes need extra care.
- **Blame culture.** Slower deploys, bigger incidents.
- **No post-incident review.** Same mistake repeats.

## Summary

- Rollback first, fix later — usually safer.
- Vercel: one-click promotion of previous deploy.
- Tag-based rollback workflow: trigger manually with prior version.
- Migrations should be backward-compatible to enable code rollback.
- Hotfix when rollback isn't viable; still through PR with expedited review.
- Synthetic monitoring + canary deploys = catch issues at small scale.
- Post-incident reviews are where the team gets safer.

Next module: operating at scale.
