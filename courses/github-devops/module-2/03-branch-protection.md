---
module: 2
position: 3
title: "Branch protection and required checks"
objective: "Process enforced by the platform."
estimated_minutes: 6
---

# Branch protection and required checks

## Why protect branches

Without protection, anyone with write access can push directly to `main`, force-push to overwrite history, merge unreviewed PRs, or break CI without consequence. Bad changes ship; good changes get clobbered.

Branch protection rules turn process into platform-enforced policy. The team's norms become the literal rules GitHub enforces — no exceptions for "I was in a hurry."

## What you can protect

GitHub branch protection options:

- **Require pull request before merging.** No direct pushes to protected branch.
- **Require approving reviews.** Need N reviewers' approval before merge.
- **Dismiss stale approvals on new commits.** New code after approval re-requires review.
- **Require review from CODEOWNERS.** Specific people for specific paths (Module 5).
- **Require status checks to pass.** CI green before merge.
- **Require branches up to date.** Merge from main before merging (avoids "merged broken main").
- **Require conversation resolution.** All review comments resolved.
- **Require signed commits.** Cryptographic verification of authorship.
- **Require linear history.** Block merge commits; squash or rebase only.
- **Include administrators.** Even admins follow the rules.
- **Restrict pushes that create matching branches.** Only specific users/teams.
- **Allow force pushes.** Usually off.
- **Allow deletions.** Usually off.

Settings → Branches → Branch protection rules → Add rule.

## Minimum sensible config for `main`

For most teams:

- ✅ Require pull request before merging.
- ✅ Require approving reviews (1, usually).
- ✅ Dismiss stale approvals when new commits pushed.
- ✅ Require status checks: tests, lint, type-check.
- ✅ Require branches to be up to date before merging.
- ✅ Require conversation resolution.
- ❌ Force pushes.
- ❌ Deletions.
- ✅ Include administrators (no carve-outs).

These prevent the most common accidents: direct pushes, broken merges, unreviewed code.

## Required status checks

After enabling "Require status checks":

1. Push a PR with the relevant CI workflow.
2. Wait for it to run at least once.
3. Return to branch protection settings.
4. Search for the check name (e.g., "test", "lint").
5. Add to required checks.

Now that check must pass on future PRs before merge is allowed. If the CI workflow doesn't run for some reason, the PR is blocked.

The check NAMES must match what your CI produces. If you rename a job, the protection rule references the old name and silently stops working. Audit when renaming.

## Code owners

For path-specific approvers, use a CODEOWNERS file (covered Module 5):

```
# .github/CODEOWNERS
/app/billing/   @finance-team @aaron
/app/auth/      @security-team
*.tsx           @frontend-team
```

Plus enable "Require review from CODEOWNERS" in branch protection. PRs touching `/app/billing/` automatically need approval from `@finance-team` or `@aaron`.

Routes review to the right experts without manual assignment.

## Required reviewers count

Most teams: 1 required reviewer.
Larger teams or sensitive areas: 2.

More than 2 is rare and slows things down disproportionately. If a change needs that much oversight, schedule a synchronous review session instead.

## "Dismiss stale approvals"

Without this: approval on commit A persists even after author pushes commit B. Reviewer may not see the new code.

With it: any new commit dismisses prior approvals. Re-review required.

Trade-off: slower iteration vs higher safety. For protected branches, the safety usually wins.

## Branches up to date

"Require branches to be up to date before merging" forces the PR branch to be rebased/merged with main before it can merge.

Why: a PR can pass CI on its own commits but fail when combined with main. Requiring up-to-date catches this before main breaks.

GitHub's "Update branch" button merges main into the PR (or rebases, configurable). After update, CI re-runs; merge unlocks if green.

Trade-off: more rebases/merges. For teams with frequent main updates, can become churny. Use selectively.

## Linear history

"Require linear history" blocks merge commits on main. Only squash-and-merge or rebase-and-merge allowed.

Result: `git log --oneline main` shows a clean chronological line — one commit per merged PR.

Trade-off: loses some PR-internal commit history. Most teams find this worth it.

## Bypass list

You can let specific users/teams bypass protection ("Allow specified actors to bypass required pull requests"). Use sparingly:

- Maybe the deployment automation user.
- Maybe a security-emergency role.
- Probably not individual humans.

The whole point of protection is no carve-outs. Generous bypass lists defeat the purpose.

## Including administrators

"Include administrators" makes protection apply to admins too. Without it, admins can bypass everything — defeats the rule.

Almost always enable this. If admins need to occasionally bypass (true emergency hotfix), do it through a documented process, not as a default.

## Required signatures

"Require signed commits" forces every commit on the branch to be cryptographically signed (GPG or Sigstore).

Benefits: prevents commit author forgery.

Costs: setup friction (developers must configure signing keys).

For most projects, optional. For high-security or open-source projects, valuable.

## Rulesets (newer)

GitHub introduced Rulesets in 2023 as a more flexible alternative to branch protection rules. They support:

- Multiple rules per branch pattern.
- Bypass lists per ruleset.
- Targeting branches and tags.
- Less brittle than the older rules.

For new repos, prefer rulesets. Existing branch protection rules still work.

## Branch protection for tags

Protect release tags from being moved or deleted:

Settings → Tag rulesets → Add rule.

Tags like `v1.2.3` should be immutable after creation. If someone deletes and recreates a tag pointing elsewhere, deploys could pick up the wrong code.

## The unprotected branch problem

If your default branch isn't protected, GitHub shows a warning. Address it:

- For real repos with multiple contributors: protect main.
- For personal experiments: maybe leave open; up to you.

Protected branches force the team into the PR workflow. Without protection, "just push to main real quick" becomes the norm; quality declines.

## Mistakes to avoid

- **No branch protection.** Defeats team norms.
- **Generous bypass lists.** Whoever bypasses sets the actual rule.
- **Required check names that drift.** Renaming breaks silently.
- **Not including admins.** Admins become the leak.
- **Too many required reviewers.** Slow without much added safety.

## Summary

- Branch protection enforces team norms in the platform.
- Standard config: required PR, required review, required CI, required up-to-date.
- Required status checks: name them carefully; audit on rename.
- CODEOWNERS routes review to the right people.
- Include administrators; no carve-outs.
- Rulesets are the newer, more flexible alternative.
- Tags also worth protecting from deletion/movement.

Next: GitHub Issues and Projects.
