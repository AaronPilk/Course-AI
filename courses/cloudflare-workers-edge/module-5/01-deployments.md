---
module: 5
position: 1
title: "Deployments and environments"
objective: "Staging, production, gradual rollouts."
estimated_minutes: 6
---

# Deployments and environments

## The deploy story

`wrangler deploy` pushes your code to Cloudflare's edge globally — about 30 seconds. Atomic per deploy; new requests get the new version; in-flight requests finish on the old.

For production teams, you want more than `wrangler deploy`: environments, gradual rollouts, observability, rollback.

## Environments

Configure in wrangler.toml:

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2026-05-19"

[env.staging]
name = "my-worker-staging"

[[env.staging.kv_namespaces]]
binding = "DATA"
id = "staging-kv-id"

[env.production]
name = "my-worker-production"

[[env.production.kv_namespaces]]
binding = "DATA"
id = "production-kv-id"
```

Deploy to each:

```bash
wrangler deploy --env staging
wrangler deploy --env production
```

Same code; different bindings; different names. Workers themselves are separate (so staging breaking won't take down production).

## CI deployment

Standard GitHub Actions setup:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npx wrangler deploy --env staging
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production  # required reviewer gate
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx wrangler deploy --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

Main push → staging deploys automatically. Production gated behind GitHub's `environment: production` (configured with required reviewers in repo settings).

## API tokens

Create CF API tokens with minimum scope:

Dashboard → My Profile → API Tokens → Create Token.

Use the "Edit Workers" template (or custom for stricter):

- Permissions: Workers Scripts:Edit, Workers KV Storage:Edit, Workers R2 Storage:Edit (only what you need).
- Account Resources: specific account.
- Zone Resources: specific zone if using routes.

Add to GitHub Secrets as `CLOUDFLARE_API_TOKEN`. Rotate periodically.

## Gradual rollout (Versions)

For risky deploys, Cloudflare Versions lets you ship to a percentage of traffic:

```bash
wrangler versions upload         # uploads new version; not active
wrangler versions deploy         # interactive: shift traffic
```

The interactive flow lets you:
- Send 1% to new version.
- Monitor metrics.
- Increase to 5%, 25%, 50%, 100%.
- Rollback by shifting back.

For deploys that could break things (refactors, new dependencies, big logic changes), gradual rollout catches issues before they hit everyone.

## Rollback

Workers history tracks recent deploys. To rollback:

Dashboard → Workers → your Worker → Deployments → click previous → Promote.

Or via CLI:

```bash
wrangler rollback
```

Reverts to the previous deployment. Within ~30 seconds globally.

For tag-based deploys (if you deploy on git tags), redeploy the prior tag:

```bash
git checkout v1.2.3
wrangler deploy --env production
```

## Health checks

Add a `/health` endpoint:

```ts
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    version: c.env.VERSION,
    deployedAt: c.env.DEPLOYED_AT,
  });
});
```

Hit it from monitoring (UptimeRobot, Pingdom, BetterUptime) every minute. Alerts if it stops responding or returns errors.

Inject version info at build:

```yaml
- run: |
    echo "VERSION=$(git rev-parse --short HEAD)" >> wrangler.toml
    echo "DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> wrangler.toml
    npx wrangler deploy
```

Useful for confirming "is the new version live yet?"

## Migrations during deploy

For DOs schema changes (adding new DO classes, renaming):

```toml
[[migrations]]
tag = "v1"
new_classes = ["ChatRoom"]

[[migrations]]
tag = "v2"
renamed_classes = [{ from = "ChatRoom", to = "Room" }]

[[migrations]]
tag = "v3"
deleted_classes = ["OldClass"]
```

Each migration runs once per environment. Add a new migration block for each schema change; don't modify existing ones.

For D1 schema migrations:

```bash
wrangler d1 migrations apply my-db --env production
```

In CI:

```yaml
- run: npx wrangler d1 migrations apply my-db --env production --remote
- run: npx wrangler deploy --env production
```

Migrations before code deploy ensures schema is ready when new code runs.

## Routes and domains

To route a custom domain through your Worker:

```toml
[env.production]
routes = [
  { pattern = "api.example.com/*", custom_domain = true },
]
```

Or in dashboard. The Worker handles all requests to that domain.

For path-specific:

```toml
routes = [
  { pattern = "example.com/api/*", custom_domain = true },
]
```

Path matching available; Cloudflare routes only matching requests to the Worker. The rest hit your origin (if configured).

## Multi-region setup

Workers run globally automatically. For things that need region awareness:

- Use `request.cf.country` to detect user location.
- Route to region-specific origin services.
- Use Hyperdrive with regional DB endpoints.

For most apps, the "Workers run everywhere; origins run somewhere specific" model works. Multi-region origins are an optimization, not a requirement.

## Deployment dashboard

Cloudflare Dashboard → Workers shows:

- Deployments history.
- Active version.
- Metrics (requests, errors, CPU time).
- Tail logs.

Useful for spot-checking; for richer observability use Workers Analytics Engine (next lesson) or external tools.

## Pre-deploy testing

Before `wrangler deploy`:

```bash
npm test                # unit tests
npx wrangler dev       # smoke test locally
npx wrangler deploy --dry-run   # validate config without deploying
```

`--dry-run` is great in CI to catch config errors before they hit real envs.

## Common mistakes

- **Same Worker name for staging and prod.** Risk of accidental cross-env deploy.
- **No `--env` flag.** Deploys to default; overwrites production.
- **Migrations after code deploy.** Code runs against old schema.
- **No rollback practice.** First time using rollback shouldn't be a fire.
- **Hardcoded staging URLs in prod code.** Use env vars.

## Summary

- Environments in wrangler.toml separate staging from production.
- CI deploys via API token; gate production with GitHub environment + required reviewers.
- Versions for gradual rollouts (percentage of traffic to new version).
- Rollback via dashboard, CLI, or redeploying prior tag.
- Health check endpoints + external monitoring for liveness.
- Migrations (DO and D1) run before code deploys.
- Custom domains via routes config.

Next: observability — logs, metrics, tracing.
