---
module: 3
position: 4
title: "Secrets, caching, and matrix builds"
objective: "Make Actions fast and safe."
estimated_minutes: 6
---

# Secrets, caching, and matrix builds

## Three production primitives

This lesson covers three things that turn a basic CI into a fast, safe production system: secret management, build caching, and matrix builds. Each saves time, money, or risk.

## Secret management

GitHub stores secrets at three scopes:

- **Repo secrets:** available to all workflows in the repo.
- **Environment secrets:** scoped to a specific environment (staging, production).
- **Organization secrets:** shared across multiple repos.

Reference in workflows:

```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
```

Secrets are encrypted at rest, auto-masked in logs (any string matching a secret value in output gets replaced with `***`), and scoped per workflow run.

## Environment-scoped secrets

For different secrets per deploy target:

Settings → Environments → New environment.

```
staging:
  - DATABASE_URL=staging-db-url
  - API_KEY=staging-api-key

production:
  - DATABASE_URL=prod-db-url
  - API_KEY=prod-api-key
```

In the workflow:

```yaml
jobs:
  deploy-staging:
    environment: staging
    steps:
      - run: deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}  # picks up staging value
          
  deploy-prod:
    environment: production
    steps:
      - run: deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}  # picks up prod value
```

Same secret name, different value per environment. Prevents accidental cross-environment access.

## Organization secrets

For values used across many repos (e.g., NPM token to publish packages):

Organization Settings → Secrets → New organization secret.

Scope to specific repos or all. Update once; all repos use the new value. Saves the "copy this token into 50 repos" tedium.

## Action permissions and GITHUB_TOKEN

GitHub auto-creates `GITHUB_TOKEN` for every workflow — scoped to the repo with configurable permissions:

```yaml
permissions:
  contents: read         # default
  pull-requests: write   # for posting PR comments
  id-token: write        # for OIDC
```

Set to minimum needed; principle of least privilege. Default is read for most things; explicit grants for what the workflow does.

For organization-wide policy, set default permissions at the org level (Settings → Actions → General).

## Caching strategy

The single biggest CI speedup. Cache anything that takes >10 seconds to recompute:

**Package managers** (most common):

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'         # auto-detects package-lock.json
```

```yaml
- uses: actions/setup-python@v5
  with:
    cache: 'pip'
```

```yaml
- uses: actions/setup-go@v5
  with:
    cache: true
```

Built into each language's setup action. Use it.

**Custom caches:**

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.cache/turbo
      node_modules/.cache
    key: ${{ runner.os }}-turbo-${{ hashFiles('**/package-lock.json') }}
    restore-keys: ${{ runner.os }}-turbo-
```

- `path`: directories to cache.
- `key`: unique identifier. When key changes, new cache; otherwise restore.
- `restore-keys`: fallback patterns if exact key not found.

Cache hits are dramatically faster than uncached. A 3-minute build → 30-second build is common.

## Cache invalidation

Caches need to invalidate when their inputs change:

- **package-lock.json** changes → reinstall deps.
- **tsconfig.json** changes → re-type-check.
- **Source code** changes → rebuild.

The `key` field controls this. `hashFiles('**/package-lock.json')` produces a hash that changes when the file changes. New hash → new cache.

For build caches:

```yaml
key: ${{ runner.os }}-build-${{ hashFiles('src/**/*.ts', 'package-lock.json') }}
```

Hashing source files makes the key change on any code modification. Caching only helps when nothing relevant changed.

## Cache scope

Caches are scoped per:
- Branch (caches from `main` available to PRs branched from `main`).
- Workflow.
- Key.

Cross-workflow cache sharing: use the same key in different workflows.

GitHub keeps caches up to 10GB per repo; old caches evicted when full. Cache hits also expire after 7 days of no access.

## Matrix builds

Run the same job in many configurations:

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
        node: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci
      - run: npm test
```

6 combinations (2 OS × 3 Node) run in parallel. Useful for:

- **Cross-platform libraries.**
- **Multi-version support testing** (Node 18 LTS + Node 20 + Node 22).
- **Multi-DB testing** (Postgres + MySQL + SQLite).

## Excluding matrix combinations

For partial matrix coverage:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
    node: [18, 20, 22]
    exclude:
      - os: windows-latest
        node: 18      # skip Windows + Node 18
    include:
      - os: ubuntu-latest
        node: 22
        experimental: true  # extra config for specific combo
```

`exclude` removes; `include` adds. Useful for limiting combos to relevant ones.

## fail-fast behavior

By default, if one matrix combo fails, others get canceled:

```yaml
strategy:
  fail-fast: false        # let all combos finish
  matrix: [...]
```

`fail-fast: false` runs everything regardless of failures. Useful when you want to see all failures, not just the first.

For library testing (find all environment-specific bugs), set false. For app CI (where any failure blocks merge), default true saves CI minutes.

## Job dependencies

For sequential workflows:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]
    outputs:
      version: ${{ steps.version.outputs.value }}
  
  test:
    needs: build
    runs-on: ubuntu-latest
    steps: [...]
  
  deploy:
    needs: [build, test]
    runs-on: ubuntu-latest
    steps: [...]
```

`needs` defines order. Multiple `needs` waits for all listed jobs.

Outputs from one job available in dependent jobs via `${{ needs.<job>.outputs.<key> }}`.

## Reusable workflows

For sharing CI across repos:

```yaml
# .github/workflows/_test.yml in shared repo
on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci
      - run: npm test
```

Use from another repo:

```yaml
jobs:
  test:
    uses: my-org/shared-workflows/.github/workflows/_test.yml@main
    with:
      node-version: '22'
```

DRY across multiple repos. Centralized updates.

## Self-hosted runner caching

For self-hosted runners, caches can persist directly on the runner:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/large-thing
    key: ${{ runner.os }}-${{ hashFiles('lockfile') }}
```

Works the same way but cache lives on the runner — sometimes faster than fetching from GitHub-hosted cache.

For GPUs / specialized hardware, self-hosted is often required anyway.

## Resource limits

GitHub-hosted runners have limits:
- 7GB RAM.
- 14GB SSD.
- 6 hours max per job.
- 2,000 monthly minutes free (Linux); more for higher tiers.

For heavier needs:
- Larger runners (paid, available in some plans).
- Self-hosted runners.

Most projects fit comfortably within standard limits.

## Cost optimization

Free tier: 2,000 minutes/month for private repos. Public repos are unlimited.

To reduce minute usage:

- Cache aggressively (less rerun time).
- Skip workflows on doc-only changes:
  ```yaml
  paths-ignore: ['docs/**', '*.md']
  ```
- Use matrix wisely (3 OS × 5 Node = 15 jobs; do you need all?).
- Concurrency control (cancel outdated runs).

Saves money for paid plans; saves quota for free tier.

## Mistakes to avoid

- **Hardcoding secrets in workflow.** Use `${{ secrets.NAME }}`.
- **No caching.** Slow CI; high cost.
- **Default permissions too broad.** Principle of least privilege.
- **Massive matrices for unimportant combos.** Costs add up.
- **Long-lived deploy keys instead of OIDC.** Security risk.

## Summary

- Secrets: repo, environment, or organization scoped.
- Environment secrets for staging vs prod values.
- Cache deps via setup-node / setup-python's built-in cache.
- Custom caches via `actions/cache@v4` with content-hashed keys.
- Matrix builds for cross-version/cross-OS testing.
- `needs:` for sequential job dependencies.
- Reusable workflows for cross-repo sharing.

Next module: release management.
