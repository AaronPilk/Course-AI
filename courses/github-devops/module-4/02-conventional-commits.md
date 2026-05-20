---
module: 4
position: 2
title: "Conventional commits and release notes"
objective: "Generated changelogs that don't lie."
estimated_minutes: 6
---

# Conventional commits and release notes

## The commit message problem

Most commit history is useless. "Update", "Fix", "WIP" tells no one anything. When you're trying to understand what changed between v1.5.0 and v1.6.0, you need real information.

Conventional Commits (conventionalcommits.org) is a structured commit message format that makes commit history machine-readable and human-useful.

## The format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:

```
feat(auth): add Google OAuth login
fix(payment): handle expired card error correctly
docs: update README with deployment instructions
chore: bump dependencies
refactor(api): extract user validation
test: add integration tests for checkout
perf(images): use webp by default
```

Types:

- `feat` — new feature.
- `fix` — bug fix.
- `docs` — documentation only.
- `style` — formatting; no code change.
- `refactor` — restructure without behavior change.
- `perf` — performance improvement.
- `test` — adding/fixing tests.
- `chore` — maintenance (deps, build config).
- `ci` — CI/CD changes.
- `build` — build system changes.
- `revert` — reverts a previous commit.

Scope is optional; useful for monorepos or to indicate area.

## Breaking changes

For backward-incompatible changes:

```
feat(api)!: rename getUserProfile to getProfile

The previous getUserProfile name was ambiguous. All callers must
update to use getProfile.

BREAKING CHANGE: Removed getUserProfile method.
```

The `!` after type/scope marks it as breaking. The `BREAKING CHANGE:` footer is the canonical signal. Auto-versioning tools use this to trigger major bumps.

## Why it matters

Beyond cosmetics, Conventional Commits enable:

**1. Auto-generated changelogs.** Tools parse commit history; group by type; produce release notes.

**2. Auto-versioning.** `feat` → minor bump; `fix` → patch bump; `BREAKING CHANGE` → major bump. No manual semver decisions.

**3. Searchable history.** Filter commits by type to find "all features added since v2.0."

**4. Forced thinking.** Picking the type forces you to consider what kind of change you're making.

## In squash-and-merge workflows

For teams using squash-and-merge, the squash commit message becomes the visible history. Use Conventional Commits in PR titles:

PR title: `feat(auth): add Google OAuth login`

GitHub's squash-merge uses the PR title as the squash commit message by default. Now main's history is all Conventional Commits, even though individual PR commits might be messy.

In your PR template, hint at the format:

```markdown
## Title format
Use Conventional Commits: type(scope): description
e.g., `feat(auth): add Google OAuth`
```

## Generated changelogs

With a tool like `release-please` or `conventional-changelog`:

```yaml
# release-please-action workflow
- uses: googleapis/release-please-action@v4
  with:
    release-type: node
```

Runs on every push to main:
1. Looks at commits since last release.
2. Determines next version (based on types).
3. Generates changelog grouped by type.
4. Opens a PR with the version bump and changelog.
5. Merge that PR → release happens.

Output looks like:

```markdown
# Changelog

## [2.5.0] - 2026-05-19

### Features
- **auth**: add Google OAuth login (#123)
- **payment**: support Apple Pay (#125)

### Bug Fixes
- **auth**: handle expired tokens correctly (#127)

### Breaking Changes
- **api**: renamed getUserProfile to getProfile (#130)
```

Auto-generated; consistent format; trustworthy because it's tied to actual commits.

## Configuring the tool

Most tools accept config for:

- Excluding certain types from changelogs (chore, ci, test usually don't make user-facing notes).
- Custom type groupings.
- Custom changelog template.
- Pre-release support.

```json
// release-please-config.json
{
  "packages": {
    ".": {
      "release-type": "node",
      "changelog-sections": [
        { "type": "feat", "section": "Features" },
        { "type": "fix", "section": "Bug Fixes" },
        { "type": "perf", "section": "Performance" },
        { "type": "refactor", "section": "Refactoring", "hidden": false }
      ]
    }
  }
}
```

Tune to match your project's needs.

## When teams skip Conventional Commits

Some teams find the format overhead too much. Alternatives:

**1. PR labels.** Label PRs with `feat`, `fix`, `breaking`; changelog generator reads labels not commits.

**2. Manual changelog.** Write release notes by hand at each release.

**3. PR-based changelog.** Just use PR titles as changelog entries.

The benefit of any structured approach is consistency. The downside is the discipline cost. For small teams shipping fast, the ROI is real. For solo projects, maybe not.

## Commitlint and pre-commit hooks

Enforce the format via tooling:

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

```js
// commitlint.config.js
module.exports = { extends: ['@commitlint/config-conventional'] };
```

Plus a hook (Husky):

```bash
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'
```

Now every commit must follow Conventional Commits format. Catches mistakes before they enter history.

GitHub Actions can also enforce on PR titles:

```yaml
- uses: amannn/action-semantic-pull-request@v5
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Fails CI if the PR title isn't Conventional. Good for squash-and-merge teams.

## Releases that ship

The end-to-end flow with Conventional Commits + release-please:

1. PRs use Conventional Commits in titles (or commit messages if not squashing).
2. Merge to main → release-please action runs.
3. release-please opens a "Release v2.5.0" PR with version bumps + changelog.
4. Maintainer reviews the proposed release; merges.
5. Tag created automatically; GitHub Release created with changelog.
6. Optional: npm publish via another workflow on tag push.

Zero manual version decisions; zero manual changelog writing. Tag-driven publication.

## Manual release notes

Even with auto-generation, sometimes you want human touch:

- Highlight notable features at the top.
- Add "Upgrade guide" sections for major bumps.
- Thank contributors.
- Link to blog posts.

Tools like release-please support manual edits to the changelog after auto-generation; or you can edit the GitHub Release notes directly.

Balance: auto-generation for completeness; manual touches for emphasis.

## Conventional Commits and security

Some teams use additional types for visibility:

```
security(auth): patch token validation bypass (CVE-2026-XXXX)
```

Auto-changelog tools can give security a dedicated section. Combined with `BREAKING CHANGE` for compatibility info, gives consumers everything they need to decide whether to upgrade urgently.

## Mistakes to avoid

- **Half-adopting Conventional Commits.** Some PRs follow, some don't; changelog is inconsistent.
- **Treating chore: bumps as features.** Misuses the format; pollutes changelogs.
- **No commitlint.** People forget; format slips.
- **Auto-changelog without review.** Sometimes the generated version is wrong; review before publishing.

## Summary

- Conventional Commits = structured format (`type(scope): subject`).
- Types: feat, fix, docs, refactor, perf, test, chore, ci, build, etc.
- Breaking changes marked with `!` and `BREAKING CHANGE:` footer.
- Enables auto-changelogs and auto-versioning.
- Use in PR titles for squash-and-merge workflows.
- Tools: release-please, semantic-release, Changesets, conventional-changelog.
- Enforce via commitlint pre-commit hook + PR-title check.

Next: trunk-based vs git-flow.
