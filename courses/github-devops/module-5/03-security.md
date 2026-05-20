---
module: 5
position: 3
title: "Dependabot and security"
objective: "Stay patched without drowning."
estimated_minutes: 6
---

# Dependabot and security

## The dependency security problem

Modern apps depend on hundreds of npm packages, each transitively pulling more. A vulnerability in any of them can affect your app. Manually monitoring and patching is impractical.

GitHub provides built-in tools:

- **Dependabot:** auto-detects vulnerable deps; opens PRs to update.
- **Code scanning (CodeQL):** static analysis for code-level vulnerabilities.
- **Secret scanning:** detects committed secrets.

Together they catch most common security issues automatically.

## Dependabot alerts

Settings → Code security → enable Dependabot alerts.

When a new vulnerability is published affecting your deps, GitHub posts an alert. Severity tagged (low / medium / high / critical).

The alert tells you:
- Which dep.
- Which version is vulnerable.
- Recommended patch version.
- Affected paths in your code (sometimes).

Without alerts, you'd find out via news cycle (or compromised production). With alerts, GitHub notifies within hours of public disclosure.

## Dependabot version updates

Beyond alerts, Dependabot can open PRs to update deps regularly:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

Weekly: Dependabot scans for outdated deps; opens PRs to update them. Up to 10 PRs at a time.

For each PR:
- Updates package.json + lockfile.
- Includes changelog from the upstream package.
- Runs your CI.

You review and merge (or auto-merge if CI passes — see below).

## Auto-merging Dependabot

For minor/patch updates that pass CI, auto-merge:

```yaml
# .github/workflows/dependabot-auto-merge.yml
name: Dependabot Auto-Merge

on:
  pull_request_target:
    types: [opened, synchronize]

jobs:
  auto-merge:
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - uses: dependabot/fetch-metadata@v2
        id: meta
      - if: steps.meta.outputs.update-type == 'version-update:semver-patch' || steps.meta.outputs.update-type == 'version-update:semver-minor'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Patch and minor updates auto-merge when CI passes. Major updates wait for human review (they may have breaking changes).

Combine with strong CI; the test suite is the gate. If tests pass, the update is safe.

## Renovate as alternative

Renovate (renovatebot.com) is a more configurable alternative to Dependabot:

- More granular control over which deps update when.
- Group related updates (e.g., all `@types/*` in one PR).
- Auto-merge config built in.
- Better monorepo support.

Same goal; deeper configuration. Some teams switch from Dependabot to Renovate as scaling needs grow.

## Code scanning (CodeQL)

GitHub's CodeQL analyzes source code for vulnerabilities:

- SQL injection.
- Cross-site scripting (XSS).
- Path traversal.
- Insecure deserialization.
- Hardcoded credentials in some cases.

Enable: Settings → Code security → Code scanning → Set up CodeQL.

Adds a workflow that runs on every PR. Findings appear as PR comments and in the Security tab.

Free for public repos; paid (GitHub Advanced Security) for private.

For mature security posture: enable. Catches issues humans miss in review.

## Secret scanning

GitHub auto-scans for known credential patterns:

- AWS access keys.
- Stripe API keys.
- Google API keys.
- Database connection strings.
- Personal access tokens.

If you commit one, GitHub:
1. Alerts you.
2. Alerts the provider (who often auto-revokes the key).
3. Logs the leak.

Don't rely on this — never commit secrets. But as a safety net it's invaluable. Public repos get it for free; private repos with Advanced Security.

## Pre-commit secret scanning

Catch secrets BEFORE they reach the remote:

```bash
# Use git-secrets, gitleaks, or similar
brew install gitleaks

# Pre-commit hook:
echo 'gitleaks protect --staged' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Now `git commit` runs gitleaks; secrets in staged files block the commit.

For team-wide: include in Husky / pre-commit framework.

## .env files

Always:

```
# .gitignore
.env
.env.local
.env.*.local
```

Provide `.env.example` (committed) with placeholder values for documentation:

```bash
# .env.example
DATABASE_URL=postgresql://user:pass@host:5432/db
STRIPE_SECRET_KEY=sk_test_...
```

New developers copy .env.example → .env.local; fill in real values.

Never commit real `.env` files. Pre-commit hook catches accidents.

## Branch protection for security

For high-stakes paths, branch protection + CODEOWNERS:

```
# CODEOWNERS
/auth/         @security-team
/payments/     @security-team @finance-team
/.github/      @security-team @devops-team
```

Plus branch protection "Require review from CODEOWNERS." Security-affecting changes get expert review automatically.

## Vulnerability disclosure

For projects accepting reports from external researchers:

`.github/SECURITY.md`:

```markdown
# Security Policy

## Reporting a Vulnerability

Please report security issues to security@example.com.

We aim to acknowledge within 48 hours and resolve within 14 days.

Do NOT open public issues for security concerns.
```

GitHub also supports private security advisories — researchers can disclose privately through a structured workflow.

For open-source: standard. For private projects: optional but useful if you have external users.

## Audit logs

For team/org repos, GitHub provides audit logs:

Organization Settings → Audit log.

Shows: who pushed what, who changed settings, who added/removed members. Useful for:
- Compliance.
- Investigating incidents.
- Tracking unusual activity.

For Enterprise plans, audit logs flow into SIEM tools (Splunk, Datadog).

## Permissions discipline

Principle of least privilege:

- **Org roles:** Owner, Member, Outside collaborator. Owner sparingly.
- **Repo roles:** Admin, Maintain, Write, Triage, Read. Default to least.
- **Team-based access** instead of individual collaborators where possible.
- **Periodic audit:** Settings → People → remove anyone no longer needed.

Stolen credentials of an admin = total compromise. Limit who has admin.

## SAML SSO

For organizations:

Settings → Authentication → SAML single sign-on.

Members must auth via SSO; access controlled centrally. Off-boarding becomes one action (disable SSO account).

For B2B contexts, SAML is a checkbox enterprises require.

## Mistakes to avoid

- **Ignoring Dependabot alerts.** Vulnerabilities pile up.
- **Manually updating everything.** Tedious; falls behind.
- **No auto-merge for patches.** Drowns the team in trivial PRs.
- **Committing secrets.** Even if you remove them, history retains them.
- **No CODEOWNERS for security paths.** Security changes review without expert eyes.

## Summary

- Dependabot alerts for new vulnerabilities; auto-PRs for version updates.
- Auto-merge patch/minor Dependabot PRs that pass CI; reserve major for human review.
- Renovate as more-configurable alternative.
- CodeQL for code-level vulnerability scanning.
- Secret scanning catches committed credentials.
- .env in .gitignore; .env.example for documentation.
- Branch protection + CODEOWNERS for sensitive paths.
- Audit logs for compliance and investigation.

Next: common Git disasters and recovery.
