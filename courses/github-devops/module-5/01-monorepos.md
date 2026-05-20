---
module: 5
position: 1
title: "Monorepo strategies"
objective: "Multiple packages, one repo, sane builds."
estimated_minutes: 6
---

# Monorepo strategies

## Monorepo or polyrepo

Monorepos store multiple related packages in one repo. Polyrepos give each package its own repo. Each has trade-offs.

**Monorepo wins:**

- One source of truth for related code.
- Easy cross-package refactors.
- Shared tooling and configs.
- One CI; one deploy pipeline.
- No version-sync headaches.

**Polyrepo wins:**

- Cleaner separation; harder to accidentally couple.
- Smaller per-repo concerns.
- Different teams can have different policies.
- Easier for open source (separate repos per published package).

For teams shipping multiple coordinated apps/packages, monorepos usually win. For independent products, polyrepos.

This lesson focuses on monorepo patterns.

## Tools

The dominant monorepo tools in 2026:

- **pnpm + workspaces.** Lightweight; fast install.
- **Turborepo.** Build caching, task orchestration, designed for Vercel-style monorepos.
- **Nx.** Powerful build graph; affected-by-changes detection; opinionated workflow.
- **Bazel.** Hyperscale (Google-built); steep learning curve.

For most React/Node teams: pnpm + Turborepo is the modern default. Nx for teams wanting deeper structure.

## Structure

A typical TS monorepo:

```
my-monorepo/
├── apps/
│   ├── web/             (Next.js app)
│   ├── api/             (Node API)
│   └── mobile/          (React Native)
├── packages/
│   ├── ui/              (shared React components)
│   ├── config/          (shared ESLint, TS configs)
│   ├── types/           (shared TypeScript types)
│   └── utils/           (shared helpers)
├── package.json         (root)
├── pnpm-workspace.yaml
└── turbo.json
```

`apps/` for deployable things. `packages/` for shared internal libraries.

## pnpm workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```bash
pnpm install     # installs everything in workspaces
```

Now apps/web can import from packages/ui:

```json
// apps/web/package.json
{
  "dependencies": {
    "@my-org/ui": "workspace:*"
  }
}
```

`workspace:*` means "use the local workspace version of @my-org/ui." Direct symlinks; changes in ui are immediately visible to web.

## Turborepo for builds

Turborepo orchestrates tasks across packages with caching:

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": { "cache": false, "persistent": true }
  }
}
```

`dependsOn: ["^build"]` means "build my deps before I build."

```bash
turbo run build      # build everything in dependency order
turbo run test       # run all tests
turbo run dev        # run all dev servers
```

Turborepo caches task outputs. Unchanged packages skip rebuild. CI gets dramatically faster as the repo grows.

## Remote caching

Turborepo can share build caches across team members and CI:

```bash
turbo login                   # authenticate to Vercel for hosting
turbo link                    # link this repo's cache
```

Now CI builds populate the cache; subsequent local runs use it. Local dev can use CI's cache — no need to rebuild dependencies someone else already built.

## Affected-by-changes

For monorepos with many packages, you don't want to test everything on every PR. Run only affected packages:

```bash
# Turbo:
turbo run test --filter=...[main]

# Nx:
nx affected -t test
```

CI determines what changed; runs tasks only for affected packages. Massive time savings for large monorepos.

## Versioning

Two common patterns:

**Independent versions:** each package has its own version, bumped independently.

Tools: Changesets.

**Synchronized versions:** all packages share one version, bumped together.

Tools: Lerna's fixed mode (now lerna-lite).

For teams with mixed publish patterns (some packages on npm, some internal), Changesets is dominant. Each PR includes `.changeset/*.md` files describing what changed. Release workflow bumps versions and publishes.

```markdown
# .changeset/cool-feature.md
---
'@my-org/ui': minor
'@my-org/web': patch
---

Add new Button variant
```

## Path aliases

In TS monorepos, set up path aliases for clean imports:

```json
// tsconfig.json (root)
{
  "compilerOptions": {
    "paths": {
      "@my-org/ui": ["./packages/ui/src"],
      "@my-org/utils": ["./packages/utils/src"]
    }
  }
}
```

Apps can import without traversing folders:

```tsx
import { Button } from '@my-org/ui';
```

Cleaner than `../../../packages/ui/src/Button`.

## CI in monorepos

Smart CI runs only relevant work:

```yaml
on:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0    # full history for affected detection
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm turbo run lint test build --filter=...[main]
```

Turbo's `--filter=...[main]` runs tasks only for packages affected by changes since main. Combined with caching, CI scales with changes, not with repo size.

## Per-app deploys

For apps that deploy separately:

```yaml
jobs:
  deploy-web:
    if: contains(github.event.head_commit.modified, 'apps/web/')
    # ... deploy web

  deploy-api:
    if: contains(github.event.head_commit.modified, 'apps/api/')
    # ... deploy api
```

Or use `dorny/paths-filter` for cleaner change detection. Only deploy what changed.

## When monorepos hurt

Monorepos accumulate weight. Friction:

- **Slow installs.** Many deps even for small changes.
- **Slow CI.** Without proper caching/affected detection.
- **Coupling.** Easy to accidentally couple unrelated packages.
- **Tooling complexity.** More config to maintain.
- **Permission challenges.** All-or-nothing repo access.

For teams that hit these, consider:
- Splitting genuinely independent products into separate repos.
- Investing in tooling (Turborepo, Nx) to manage the complexity.
- Stronger boundaries between packages (ESLint rules limiting imports).

## Open source in monorepos

For open-source projects publishing multiple packages:

- React, TypeScript, Babel, ESLint all use monorepos.
- Each package publishes independently to npm.
- Shared CI, tests, docs.
- Contributors PR once for cross-package changes.

Monorepos for OSS are popular because they reduce friction for contributors and maintainers.

## Tools for migration

Migrating from polyrepo to monorepo:

```bash
# Use git subtree to combine repos preserving history:
git subtree add --prefix=apps/web https://github.com/org/web main

# Or merge directly:
git remote add web ../web
git fetch web
git merge --allow-unrelated-histories web/main
```

Migrations are doable but involve PR redirection, CI rewiring, and convincing the team. Plan a sprint; do it once.

## Mistakes to avoid

- **Monorepo without Turborepo/Nx.** CI becomes slow; team frustration builds.
- **No affected detection.** Every PR tests everything.
- **No boundaries between packages.** Becomes a tangled ball.
- **Mixing apps and infrastructure.** Hard to set deploy scopes.
- **Massive root package.json.** Should be minimal; dependencies live in workspace packages.

## Summary

- Monorepos: one repo, multiple packages.
- pnpm + Turborepo is the modern default for TS/JS.
- Apps in `apps/`, libraries in `packages/`.
- Turborepo for task orchestration, caching, affected detection.
- Changesets for versioning when packages publish independently.
- CI runs only affected packages — saves time at scale.
- Set per-app deploy triggers; deploy only what changed.

Next: CODEOWNERS and review routing.
