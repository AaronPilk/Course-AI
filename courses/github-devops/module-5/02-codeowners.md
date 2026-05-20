---
module: 5
position: 2
title: "CODEOWNERS and review routing"
objective: "Auto-assign experts to changes."
estimated_minutes: 6
---

# CODEOWNERS and review routing

## The routing problem

In larger teams, you don't want every PR to require any reviewer — you want the RIGHT reviewer. A change to `/payments/` should be reviewed by the payments team. A frontend change should reach a frontend engineer.

Manual assignment works for small teams but breaks down: PR authors don't know who to assign; assignments get forgotten; reviewers get overwhelmed by irrelevant requests.

GitHub's CODEOWNERS solves this — auto-assign reviewers based on file paths.

## Setting up CODEOWNERS

Create `.github/CODEOWNERS` (or `CODEOWNERS` at root):

```
# Default owners for everything
*                            @aaron @backup-reviewer

# Frontend
*.tsx                        @frontend-team
*.css                        @frontend-team
/app/                        @frontend-team
/components/                 @frontend-team

# Backend
/api/                        @backend-team
*.sql                        @backend-team @aaron

# Specific areas
/payments/                   @payments-team @finance-team
/security/                   @security-team
/.github/                    @devops-team
package.json                 @devops-team @aaron

# Documentation
/docs/                       @docs-team

# Last-match wins; more specific patterns at the bottom
/payments/billing.ts          @aaron @payments-team
```

Format: `path-pattern user1 user2 @team` (one per line). Patterns work like .gitignore.

The LAST matching pattern wins — so put more general patterns at the top, more specific at the bottom.

## Auto-request reviews

In repo settings: Settings → Branches → Branch protection → "Require review from CODEOWNERS."

Now when a PR is opened, GitHub:
1. Parses the diff.
2. Finds CODEOWNERS for changed files.
3. Auto-requests reviews from those owners.
4. Blocks merge until at least one CODEOWNER approves (if branch protection requires it).

The PR author doesn't have to know who to assign. The platform routes correctly.

## Teams vs individuals

You can mention:

- `@username` — individual user.
- `@org/team-name` — GitHub team.

Teams are usually better:

- **People come and go.** A team membership updates centrally.
- **Vacation handling.** Team has multiple members; one's absence doesn't block reviews.
- **Clear ownership.** Team boundaries are explicit.

For specific high-trust paths, individual mentions are fine. Default to teams.

## CODEOWNERS doesn't grant access

Just because someone is a CODEOWNER doesn't grant them special access. They:

- Get auto-requested as reviewers.
- Their approval counts toward "Require review from CODEOWNERS."

They still need normal repo access (read, write) via team membership or direct collaborator status.

## Multiple owners

A path can have multiple owners:

```
/payments/   @payments-team @aaron @finance-team
```

Any owner can approve. For paths where multiple approvals are needed, use branch protection's "Require N reviewers" alongside CODEOWNERS.

## CODEOWNERS limitations

The format is simple; some things it can't do:

- **Conditional ownership** (different owners based on the type of change).
- **Approval thresholds per path.**
- **Owners based on file content** (not just path).

For complex routing, GitHub Apps or custom workflows fill the gaps. For most teams, simple CODEOWNERS is enough.

## Bot accounts and CODEOWNERS

Bots that auto-update files (Dependabot, Renovate) trigger reviews from CODEOWNERS. This can flood DevOps:

- Dependabot opens 20 PRs per week.
- DevOps team is CODEOWNER for package.json.
- 20 PRs auto-routed to DevOps.

Mitigations:

- Auto-merge bot PRs that pass CI (covered next lesson).
- Bot-specific labels exempt from CODEOWNERS routing.
- A "dependabot" sub-team to spread the load.

## Required CODEOWNER review

In branch protection: enable "Require review from CODEOWNERS." This makes the auto-routed review BLOCKING.

Without it: CODEOWNERS just suggests reviewers; not enforced. Authors could merge without CODEOWNER approval if other approvals exist.

For sensitive paths (security, billing, infrastructure), the blocking version is essential. For general code review, less critical.

## Code freeze with CODEOWNERS

Some teams use CODEOWNERS for temporary freezes:

During a release week, point all CODEOWNERS to a "release-managers" team. Any PR requires release-manager approval. Easy to roll back when the freeze lifts.

Cleaner than disabling auto-merge globally.

## CODEOWNERS for documentation

Often-overlooked: documentation often has its own owner.

```
/docs/                       @docs-team
/CONTRIBUTING.md             @docs-team
README.md                    @docs-team
```

Docs people review docs. Engineers don't need to (and often don't have the writing skills to give useful feedback).

## Path patterns

Globs in CODEOWNERS:

```
*.tsx              # all .tsx anywhere
/docs/             # docs at the root
/docs/             # everything inside docs/
/docs/*            # files directly in docs/ (not nested)
/apps/*/api/       # api/ inside any apps/ subfolder
**/*.test.ts       # test files anywhere
!*.lock            # negation (rare; not directly supported in CODEOWNERS as of 2026)
```

Test with `gh api /repos/owner/repo/codeowners/errors` to validate. GitHub also surfaces CODEOWNERS errors in the file editor view.

## Tracking changes to CODEOWNERS

CODEOWNERS is sensitive — modifying it changes who reviews what. Protect it:

```
/.github/CODEOWNERS    @leads-team @owners-bot-trusted
```

Self-reference: only the leads team can modify CODEOWNERS itself. Prevents accidental routing changes.

## Discovering CODEOWNERS

For new team members:

- `cat .github/CODEOWNERS` to see who owns what.
- Visit any file on GitHub; the "Owners" indicator shows reviewers for that path.
- `gh codeowners` (CLI) or various GitHub Apps surface ownership maps.

Good ownership transparency reduces "who do I ask about X?" friction.

## Mistakes to avoid

- **No CODEOWNERS in active repos.** Manual review assignment is brittle.
- **Catch-all owners.** `* @aaron` makes one person review everything. Burnout.
- **Individuals over teams.** Vacation = blocked PRs.
- **No team mapping.** New folks don't have access.
- **CODEOWNERS not protected.** Anyone can rewrite review routing.

## Summary

- CODEOWNERS auto-assigns reviewers based on file paths.
- Patterns work like .gitignore; last match wins.
- Use teams (`@org/team-name`) over individuals when possible.
- Pair with branch protection's "Require review from CODEOWNERS" for enforcement.
- Self-protect CODEOWNERS so only leads can modify routing.
- Bot PRs may need auto-merge to avoid flooding owners.

Next: Dependabot and security.
