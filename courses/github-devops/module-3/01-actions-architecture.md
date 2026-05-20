---
module: 3
position: 1
title: "Actions architecture"
objective: "Workflows, jobs, steps, runners."
estimated_minutes: 6
---

# Actions architecture

## The hierarchy

GitHub Actions has four layers:

- **Workflow** — a YAML file in `.github/workflows/`. Defines what runs and when.
- **Job** — a collection of steps that run together on one runner.
- **Step** — a single action or shell command.
- **Action** — a reusable unit (community or custom).

```yaml
# .github/workflows/ci.yml
name: CI                    # workflow

on:
  pull_request:
    branches: [main]

jobs:
  test:                     # job
    runs-on: ubuntu-latest  # runner
    steps:                  # steps
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci         # shell command
      - run: npm test
```

Push a PR; this workflow runs. The `test` job spins up an Ubuntu runner; checks out code; sets up Node; installs deps; runs tests.

## Triggers — `on`

When workflows run:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # daily at midnight UTC
  workflow_dispatch:     # manual trigger from GitHub UI
  release:
    types: [published]
```

Most common: `pull_request` (CI on PRs) and `push` to `main` (CD on merge).

## Jobs run in parallel by default

Multiple jobs:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint
  type-check:
    runs-on: ubuntu-latest
    steps:
      - run: npx tsc --noEmit
```

Three jobs run in parallel on three runners. Each is a separate clean environment.

For sequential dependencies:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]
  deploy:
    needs: build              # wait for build
    runs-on: ubuntu-latest
    steps: [...]
```

`needs` declares dependencies; jobs without it run in parallel.

## Runners

Where jobs run:

- **ubuntu-latest** — most common; Linux.
- **ubuntu-22.04**, **ubuntu-20.04** — pinned versions.
- **macos-latest** — for macOS-specific builds.
- **windows-latest** — Windows.
- **self-hosted** — your own runners (more on this below).

Each job gets a fresh runner — no state carries over. Per-step state lives only within the job.

For Linux Docker workloads, use container runners:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    container: node:20-alpine    # run steps inside this container
```

## Actions

Reusable building blocks. Import from the marketplace or your own repo:

```yaml
- uses: actions/checkout@v4               # official: clone the repo
- uses: actions/setup-node@v4             # official: install Node
- uses: docker/build-push-action@v5       # vendor: build/push Docker
- uses: ./.github/actions/my-action        # local: action in this repo
```

Common official actions:

- `actions/checkout@v4` — clone repo.
- `actions/setup-node@v4`, `setup-python@v5`, `setup-go@v5` — install language toolchains.
- `actions/cache@v4` — cache files between runs.
- `actions/upload-artifact@v4`, `download-artifact@v4` — pass files between jobs.

Pin versions explicitly (`@v4` or even `@v4.1.2`); using `@main` risks breaking changes.

## Secrets

Sensitive values (API keys, deploy tokens):

Settings → Secrets and variables → Actions → New repository secret.

Use in workflows:

```yaml
- run: aws s3 sync . s3://my-bucket
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

Secrets are encrypted; not visible in logs (auto-masked); scoped per repo, org, or environment.

GitHub auto-injects one: `GITHUB_TOKEN`. Lets workflows authenticate to GitHub itself (post comments, create PRs, etc.).

## Environment scoping

For different deploy targets:

```yaml
jobs:
  deploy-staging:
    environment: staging
    steps:
      - run: deploy --target staging
        env:
          API_KEY: ${{ secrets.STAGING_API_KEY }}

  deploy-prod:
    environment: production
    needs: deploy-staging
    steps:
      - run: deploy --target production
        env:
          API_KEY: ${{ secrets.PROD_API_KEY }}
```

Environments can have:
- Different secret values.
- Required reviewers (manual approval before run).
- Wait timers.
- Deployment branches restriction.

Useful for production: require a human to approve before the deploy step runs.

## Matrix builds

Run the same job across multiple configs:

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
        node: [18, 20, 22]
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm test
```

6 combinations (2 OS × 3 Node) run in parallel. Useful for libraries supporting multiple platforms/versions.

## Caching

Speed up builds by caching dependencies:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('package-lock.json') }}
    restore-keys: ${{ runner.os }}-npm-
```

- `key`: cache identifier; changes when package-lock.json changes.
- `restore-keys`: fallback patterns if exact key not found.

For `setup-node`, caching is built in:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'                  # auto-caches npm
```

Builds go from 2 minutes to 30 seconds with proper caching.

## Concurrency

Prevent multiple workflow runs from racing:

```yaml
concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true
```

Same group + new run → cancel old run. Useful for PR previews (cancel old build when new commit pushed) and deploys (only one deploy at a time).

## Self-hosted runners

For specific needs:

- **More resources** than GitHub-hosted offers.
- **Access to private networks** (deploy to internal infra).
- **Custom hardware** (GPUs for ML, specific OS).
- **Faster builds** (warm caches, no startup cost).

Setup: download a runner binary; register with GitHub; let it pull jobs.

Trade-offs: you own the infrastructure; security implications (untrusted PR code runs on your hardware); maintenance overhead.

Most teams stay on GitHub-hosted runners. Use self-hosted when there's a specific reason.

## Reusable workflows

For workflows used in many repos:

```yaml
# .github/workflows/reusable-deploy.yml
on:
  workflow_call:
    inputs:
      target:
        required: true
        type: string

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: deploy --target ${{ inputs.target }}
```

Use from another workflow:

```yaml
jobs:
  deploy:
    uses: my-org/reusable-workflows/.github/workflows/reusable-deploy.yml@main
    with:
      target: production
```

Reduces duplication across repos. Pair with a centralized workflows repo for an organization-wide standard.

## Logs and artifacts

Outputs from a job:

- Logs: visible in the Actions UI per step.
- Artifacts: uploaded files (test reports, coverage, builds).

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: coverage
    path: coverage/
```

Artifacts persist for ~30 days; downloadable from the workflow run page. Useful for sharing test reports, screenshots, intermediate builds.

## Composite actions

For reusable steps within a workflow:

```yaml
# .github/actions/install/action.yml
runs:
  using: composite
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'
    - run: npm ci
      shell: bash
```

```yaml
# Workflow uses it:
- uses: ./.github/actions/install
```

Group several steps as a reusable action. Stays inside your repo; no external dep.

## Mistakes to avoid

- **Using `@main` or `@latest`.** Pin versions; breaking changes are real.
- **Secrets in `env` blocks at workflow scope.** Visible in logs in some cases; use step-level env.
- **No caching.** Slow builds; team friction.
- **Long-running jobs without concurrency control.** Wasted CI minutes on outdated PRs.
- **Complex YAML logic.** If it's > 100 lines of bash in one step, extract to a script.

## Summary

- Workflow → Job → Step → Action hierarchy.
- Trigger via `on` (push, pull_request, schedule, etc.).
- Jobs run in parallel by default; `needs:` for sequential.
- Runners: GitHub-hosted (Ubuntu, macOS, Windows) or self-hosted.
- Secrets via Settings → Secrets, referenced as `${{ secrets.NAME }}`.
- Environments for deploy targets with required reviewers.
- Caching dramatically speeds up builds.
- Pin action versions; don't use `@main`.

Next: common CI pipelines.
