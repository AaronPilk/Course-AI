---
module: 3
position: 3
title: "Deploys via Actions"
objective: "From build to production."
estimated_minutes: 6
---

# Deploys via Actions

## The deploy trigger

Common patterns for when deploys run:

```yaml
on:
  push:
    branches: [main]                # auto-deploy main to staging
  push:
    tags: ['v*']                    # deploy when version tag created
  workflow_dispatch:                # manual trigger
  release:
    types: [published]              # deploy on GitHub Release publish
```

Most teams use a mix:

- **Staging:** auto-deploy on every main push.
- **Production:** tag-triggered or manual approval.

## Continuous deployment to staging

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy Staging

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: npm run build
      - run: deploy-to-staging
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.STAGING_AWS_KEY }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.STAGING_AWS_SECRET }}
```

Every merge to main → staging environment updates. Catches integration issues before prod.

## Production deploys with approval

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production         # require approval (configured in env settings)
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: npm run build
      - run: deploy-to-production
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.PROD_AWS_KEY }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.PROD_AWS_SECRET }}
```

The `production` environment in repo settings has required reviewers. The workflow pauses; the reviewer gets notified; clicking "Approve" lets it proceed.

Useful for production: human in the loop without slowing down staging deploys.

## Common deploy targets

**Vercel:**
```yaml
- uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: '--prod'
```

Or just `npx vercel --prod --token $VERCEL_TOKEN`.

**AWS (S3 + CloudFront):**
```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/github-deploy
    aws-region: us-east-1
- run: aws s3 sync dist/ s3://my-bucket
- run: aws cloudfront create-invalidation --distribution-id ABC --paths "/*"
```

Modern AWS auth uses OIDC (role-to-assume) — no long-lived secrets.

**Docker to registry:**
```yaml
- uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_TOKEN }}
- uses: docker/build-push-action@v5
  with:
    push: true
    tags: my-org/my-app:${{ github.sha }}
```

**Kubernetes:**
```yaml
- uses: azure/k8s-deploy@v5
  with:
    namespace: production
    manifests: kubernetes/deployment.yml
    images: my-org/my-app:${{ github.sha }}
```

Each cloud has official actions; most are well-supported.

## OIDC for cloud auth

Modern AWS/GCP/Azure deploys use OIDC (OpenID Connect) instead of long-lived credentials:

1. Cloud provider trusts GitHub as an identity provider.
2. Workflow gets a short-lived token from GitHub.
3. Token authenticates to the cloud as a specific role.
4. No long-lived AWS keys stored in GitHub secrets.

Set up once; works for all future workflows. Hugely improves security posture.

```yaml
permissions:
  id-token: write       # needed for OIDC
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123:role/github-deploy
      aws-region: us-east-1
```

Standard pattern in 2026.

## Deployment strategies

**1. Recreate:** stop old version, start new. Simplest; brief downtime.

**2. Rolling:** replace instances gradually. No downtime; brief mixed-version state.

**3. Blue-green:** spin up new (green) alongside old (blue); switch traffic; decommission old. Instant rollback by switching back. Doubles infra briefly.

**4. Canary:** route a small % of traffic to new version; gradually increase. Catches issues at small scale.

For Kubernetes / Vercel / Render, rolling is the default and usually sufficient. For high-stakes deploys, canary or blue-green.

## Pre-deploy checks

Before the actual deploy step:

```yaml
- run: npm test                       # one more time
- run: npm run lint
- run: npm run type-check
- run: npx playwright test e2e/critical-paths.spec.ts  # smoke E2E
```

Belt-and-suspenders. CI already passed on the PR; running again before prod is cheap insurance against "stale CI" scenarios.

## Post-deploy checks

After deploy, verify it worked:

```yaml
- run: curl -f https://myapp.com/health || exit 1
- run: npx playwright test smoke.spec.ts --base-url https://myapp.com
```

Smoke tests against the deployed version. If they fail, you may want auto-rollback (see next lesson).

For more sophisticated monitoring, post-deploy can also trigger:
- Synthetic monitoring (Datadog, Pingdom).
- Slack notification of successful deploy.
- Update deployment dashboard.

## Deployment notifications

Notify the team:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployed ${{ github.sha }} to production'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

`if: always()` includes failure notifications, not just success. Useful for visibility.

For high-volume deploys: only notify on failure or significant events to avoid spam.

## Rollback strategies

Things break in production. Plan for rollback:

**Vercel:** one-click rollback to previous deployment in dashboard.

**Kubernetes:** `kubectl rollout undo deployment/myapp`.

**Manual:** redeploy the previous tag.

```yaml
# .github/workflows/rollback.yml
name: Rollback
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Tag to rollback to (e.g., v1.2.3)'
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

Manually trigger; specify the version. Runs the deploy with old code. Standard pattern; tested before you need it.

## Preview environments

For PRs, deploy to ephemeral preview environments:

**Vercel:** auto-creates preview URLs for every PR. No setup needed.

**Other platforms:** can build similar systems with branch-based subdomains:

```yaml
- run: deploy-preview --branch ${{ github.head_ref }} --url ${{ github.head_ref }}.preview.example.com
```

Reviewers can interact with the actual PR's build, not just read the diff. Hugely valuable for UI-heavy work.

## Database migrations

Schema changes need separate handling:

```yaml
- run: npm run migrate:up        # apply migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
- run: deploy-app
```

Migrations run BEFORE the app deploys. If migration fails, deploy aborts.

For zero-downtime: ensure migrations are backward-compatible (add columns nullable; remove columns later after code stops referencing them). Covered in detail in Supabase course Module 1.

## Multi-region deploys

For globally-distributed apps:

```yaml
strategy:
  matrix:
    region: [us-east-1, eu-west-1, ap-southeast-1]
runs-on: ubuntu-latest
steps:
  - run: deploy-to-region ${{ matrix.region }}
```

Each region deploys in parallel. Failure in one region doesn't block others (use `fail-fast: false` in matrix).

## Mistakes to avoid

- **Long-lived deploy credentials.** Use OIDC.
- **No environment-level approval for prod.** Accidents happen.
- **Deploys without rollback plan.** When things break, you'll need it.
- **No post-deploy verification.** Silent failures.
- **Same secrets for staging and prod.** Bleed-over risk.

## Summary

- Auto-deploy main to staging; gated deploy for production.
- Environments support required reviewers for prod approval.
- OIDC for cloud auth (no long-lived credentials).
- Common targets: Vercel, AWS, Docker registries, Kubernetes.
- Pre-deploy smoke checks; post-deploy verification.
- Rollback workflow tested before you need it.
- Preview environments for PRs (Vercel does it automatically).

Next: secrets, caching, and matrix builds.
