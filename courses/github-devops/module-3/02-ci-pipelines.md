---
module: 3
position: 2
title: "Common CI pipelines"
objective: "Test, lint, type-check on every PR."
estimated_minutes: 6
---

# Common CI pipelines

## The minimum viable CI

Every PR should pass at least:

- **Tests** — unit + integration.
- **Lint** — code style and basic bugs.
- **Type check** — TypeScript / mypy / etc.
- **Build** — does the production build succeed.

These four jobs catch most regressions before merge.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

Each job runs in parallel; all must pass for branch protection to allow merge.

## Optimizing with composite actions

The repeated setup is ugly. Extract to a composite action:

```yaml
# .github/actions/setup/action.yml
name: Setup
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
# Now jobs are clean:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: npm test

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: npm run lint
```

DRY; easier to update setup in one place.

## Single-job vs split

Should all checks run in one job (sequential) or split into multiple (parallel)?

**Split (multiple jobs):**
- Faster total wall time (parallel).
- Each failure clearly identified.
- More runner minutes used.
- Each job re-runs `npm ci` (mitigated by cache).

**Single job (sequential):**
- One `npm ci` for everything.
- Slower wall time.
- Mixed failures harder to diagnose.

For most teams: split into ~3-5 parallel jobs. Faster feedback dominates over CI minute concerns.

## Running tests in matrix

For library projects testing across Node versions:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci
      - run: npm test
```

3 parallel runs; all must pass.

For OS coverage (Windows + macOS + Linux):

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
runs-on: ${{ matrix.os }}
```

For apps (not libraries), usually one OS is enough. Libraries need broader coverage.

## Testing pull requests from forks

For open-source projects: PRs from forks can't access secrets by default (security — untrusted code shouldn't see your prod tokens).

Workflows can run tests on fork PRs but can't deploy or use sensitive secrets. Use `pull_request_target` carefully if you need fork PRs to access secrets — high security risk if done wrong.

For most internal teams, PRs come from branches in the same repo; no fork complications.

## Conditional jobs

Run jobs only under specific conditions:

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'  # only on main pushes
    runs-on: ubuntu-latest
    steps: [...]
```

Or based on changed files (using `paths-filter` or `dorny/paths-filter`):

```yaml
- uses: dorny/paths-filter@v3
  id: changes
  with:
    filters: |
      docs:
        - 'docs/**'
      code:
        - 'src/**'

- run: npm run build-docs
  if: steps.changes.outputs.docs == 'true'
```

Useful for monorepos where docs changes shouldn't trigger app builds.

## Coverage reporting

After running tests, report coverage:

```yaml
- run: npm test -- --coverage

- uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage/

- uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
```

Codecov posts coverage diff to PRs — see what new code added/removed coverage. Or use Coveralls, or self-hosted alternatives.

For visibility, also show coverage % as a PR comment.

## E2E tests

Slower; usually separated from unit tests:

```yaml
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: npm run build
      - run: npm run start &
      - run: npx playwright install
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

E2E tests on every PR is good. If they're too slow, run them only on main pushes or on a nightly schedule.

`if: always()` uploads the report even if tests failed — helpful for debugging.

## Visual regression

For UI projects, visual regression catches unintended changes:

- **Chromatic** (Storybook).
- **Percy** (BrowserStack).
- **Playwright snapshots**.

Each provides a UI to review visual diffs in PRs. Catches "I changed a button and it broke a different page" bugs.

For consumer-facing UI projects, visual regression has high ROI.

## Notification patterns

CI failures should notify:

- **PR status check.** Default behavior; visible in PR UI.
- **Slack notification on main failure.** When a CI run fails on main (post-merge), alert the team.
- **Email digests.** For nightly or scheduled jobs.

Avoid notification spam. Reserve channels for actionable signals.

## Concurrency control

Cancel in-progress runs when a new commit lands:

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

If you push a new commit while CI is running on the previous one, the previous run is canceled. Saves runner minutes; reflects current state.

For main pushes (not PRs), usually disable cancellation — each commit's CI completes for audit trail.

## Workflow files organization

A typical `.github/workflows/`:

- `ci.yml` — PR/push tests, lint, type check, build.
- `deploy-staging.yml` — auto-deploy to staging on main pushes.
- `deploy-production.yml` — manual or tagged deploy to prod.
- `release.yml` — create release artifacts on tag push.
- `nightly.yml` — scheduled jobs (cleanup, integration tests).
- `dependency-update.yml` — Dependabot or Renovate.

Multiple files better than one giant file. Each has clear purpose.

## CI for monorepos

For monorepos with multiple packages, run tests only for affected packages:

```yaml
- uses: dorny/paths-filter@v3
  id: changes
  with:
    filters: |
      api: 'apps/api/**'
      web: 'apps/web/**'

- run: npm test --workspace=api
  if: steps.changes.outputs.api == 'true'

- run: npm test --workspace=web
  if: steps.changes.outputs.web == 'true'
```

Or use Nx / Turborepo, which have native task-affected-by-changes detection.

For large monorepos, smart task selection is essential — running everything on every change is too slow.

## Common mistakes

- **No caching.** Every CI run reinstalls deps.
- **Required checks not in branch protection.** CI runs but doesn't block.
- **Massive single job.** Mixed failures; slower feedback.
- **Slow E2E on every PR.** Frustrates everyone; rarely needed.
- **No artifacts on failure.** Hard to debug.

## Summary

- Minimum CI: test + lint + type-check + build, in parallel.
- Cache deps via setup-node's built-in cache.
- Composite action for repeated setup.
- Matrix for cross-version / cross-OS testing.
- E2E on every PR if fast; nightly if slow.
- Concurrency control prevents wasted runs.
- Branch protection requires CI checks; enforces process.

Next: deploys via Actions.
