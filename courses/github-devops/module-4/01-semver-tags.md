---
module: 4
position: 1
title: "Semantic versioning and tags"
objective: "Communicate change via version numbers."
estimated_minutes: 6
---

# Semantic versioning and tags

## What semver communicates

Semantic Versioning (semver, semver.org) defines version numbers that communicate the nature of changes:

`MAJOR.MINOR.PATCH` (e.g., `2.5.3`):

- **MAJOR (2):** breaking changes; consumers must update their code.
- **MINOR (5):** new features; backward-compatible.
- **PATCH (3):** bug fixes; backward-compatible.

A user seeing `2.5.3 → 2.5.4` knows it's safe (patch). `2.5.3 → 3.0.0` warns of breaking changes; read the changelog before upgrading.

For libraries, this contract is essential. For applications (where you don't have external consumers), semver is still useful but less load-bearing.

## When to bump each

**PATCH:** bug fixes, security patches, documentation. Internal refactors that don't change behavior.

**MINOR:** new API surface, additional features, new optional config. Existing users see no change in behavior.

**MAJOR:** removed APIs, changed signatures, behavior changes that break existing usage. Anything requiring users to modify their code.

When in doubt, bump up — overcautious major bumps annoy but protect; missed major bumps break consumers silently.

## Pre-release versions

For betas, alphas, release candidates:

```
2.5.0-alpha.1
2.5.0-beta.2
2.5.0-rc.1
```

The hyphenated suffix marks it as pre-release. npm and most package managers won't install pre-releases by default — users must opt in.

Useful for:
- Wide testing before stable release.
- Major versions where you want feedback.
- Beta programs.

## Git tags

Tags mark specific commits as releases:

```bash
git tag v2.5.3                # lightweight tag
git tag -a v2.5.3 -m "Release v2.5.3"  # annotated tag (preferred)
git push origin v2.5.3
```

Annotated tags include metadata (tagger, date, message). They're proper Git objects; lightweight tags are just pointers. Use annotated for releases.

To tag from CI / scripts:

```yaml
- run: |
    git tag -a v${{ steps.version.outputs.tag }} -m "Release"
    git push origin v${{ steps.version.outputs.tag }}
```

## Tags trigger workflows

A common pattern: tag a release; CI publishes:

```yaml
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm publish    # for libraries
      - uses: softprops/action-gh-release@v2  # GitHub Release
        with:
          generate_release_notes: true
```

Tag → CI builds and publishes → GitHub Release created with auto-generated notes from PRs.

Standard pattern; clean separation between "merge to main" (continuous integration) and "tag" (release event).

## GitHub Releases

GitHub Releases are tags + extra metadata: release notes, attached binaries, pre-release flag.

Create via UI (Releases → Draft new release), CLI (`gh release create v2.5.3`), or workflow (action-gh-release).

Useful for:
- Distributing compiled binaries (Go, Rust executables).
- Communicating release notes outside changelog.
- Tracking which version is "latest."

For pure npm libraries, GitHub Releases are nice but optional; the npm registry is the source of truth.

## Tag protection

Settings → Tag rulesets → protect tags matching `v*` from being:
- Deleted.
- Moved (force-pushed to different commits).

Tags like `v1.2.3` should be immutable. If someone deletes and recreates `v1.2.3` pointing elsewhere, deploys could pick up wrong code.

Standard practice for production projects.

## Versioning multi-package monorepos

For repos with multiple packages:

**Independent versions:** each package has its own semver, bumps independently.

```
my-monorepo/
├── packages/utils/         (v2.1.0)
├── packages/api/           (v1.5.3)
└── packages/cli/           (v0.8.1)
```

**Synchronized versions:** all packages bump together.

```
my-monorepo/
├── packages/utils/         (v2.0.0)
├── packages/api/           (v2.0.0)
└── packages/cli/           (v2.0.0)
```

Independent is more granular but more complex; synchronized is simpler but bumps even untouched packages.

Changesets (npm-friendly tool) handles the multi-package release workflow elegantly.

## Auto-versioning

Tools that auto-bump versions based on commits:

- **standard-version, release-please:** auto-bump based on Conventional Commits.
- **semantic-release:** automated NPM publish from commits.
- **Changesets:** manual version intent files (`.changeset/*.md`) bumped together.

Each automates "what version is next?" The right choice depends on team workflow.

For monorepos, Changesets is the modern leader. For single-package repos, semantic-release is mature.

## What semver doesn't tell you

Semver communicates compatibility intent. It doesn't tell you:

- **What was added/changed.** Read the changelog.
- **Whether the release is good.** Check tests and pre-release feedback.
- **What internal refactors happened.** May still affect performance / behavior.
- **Security fix priority.** A patch could be critical; check release notes.

Semver is a contract, not a substitute for reading.

## Caret and tilde ranges

In package.json:

```json
"dependencies": {
  "library-a": "^2.5.3",   // ^ allows minor + patch updates (>=2.5.3 <3.0.0)
  "library-b": "~2.5.3"    // ~ allows patch updates only (>=2.5.3 <2.6.0)
}
```

Caret (`^`) is the default; assumes minor versions are safe.

Pin exactly:

```json
"library-c": "2.5.3"
```

For production stability, pin exact + use lockfile. For libraries, caret allows users to get fixes.

## Mistakes to avoid

- **Skipping major bumps for breaking changes.** Silent breakage for consumers.
- **Lightweight tags for releases.** Use annotated.
- **Moving release tags.** Should be immutable.
- **Not protecting tags in repo settings.** Accidents happen.
- **Pre-1.0 forever.** Move to 1.0 when API is stable; signals to consumers.

## Summary

- MAJOR.MINOR.PATCH: breaking / new feature / bug fix.
- Pre-release suffixes: `-alpha.1`, `-rc.1` for unstable.
- Annotated Git tags for releases; protect them from moves.
- Tag pushes trigger release workflows.
- GitHub Releases add notes + binaries to tags.
- Auto-versioning tools (Changesets, semantic-release) automate bumps.
- Semver is a contract, not a substitute for reading the changelog.

Next: conventional commits and release notes.
