---
module: 2
position: 1
title: "The pull request workflow"
objective: "Branch, push, PR, merge — done right."
estimated_minutes: 6
---

# The pull request workflow

## The cycle

The modern PR workflow on GitHub:

1. `git switch -c feature/add-login` — create a branch off main.
2. Make changes; commit locally.
3. `git push -u origin feature/add-login` — push the branch.
4. Open a PR on GitHub.
5. CI runs automatically (tests, lint, type-check).
6. Reviewer leaves comments; you respond / push more commits.
7. Reviewer approves.
8. Merge via GitHub's UI ("Squash and merge" usually).
9. Delete the branch.
10. `git switch main && git pull` to update local main.

This loop happens hundreds of times per feature team per week. Optimizing it pays back daily.

## Naming the branch

Conventions vary; common patterns:

- `feature/add-login` or `feat/add-login`.
- `fix/payment-bug` or `bugfix/payment-bug`.
- `chore/upgrade-react`.
- `feature/PROJ-1234-add-login` (with ticket number).

Pick a convention; document it; enforce via PR template or hook. Consistency beats elegance.

## Writing the PR

A good PR description has:

**Summary.** One or two sentences. What does this change?

**Why.** The reason — issue link, bug report, design doc.

**What changed.** Bullet list of major changes. Helps reviewers focus.

**Testing.** How you verified it works. Screenshots for UI; test output for logic.

**Risks.** What could go wrong; mitigation.

GitHub PR templates auto-populate this for every PR. Set up `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Summary
<!-- One-sentence description -->

## Why
<!-- Link to ticket / issue / design doc -->

## What changed
- 
- 

## Testing
<!-- How you verified -->

## Risks
<!-- What could break; what to watch -->
```

Every PR loads this template; authors fill it in. Reviewers know what to expect.

## Linking issues

Use GitHub keywords in PR descriptions:

```
Closes #1234
Fixes #5678
Resolves #9012
```

Merging the PR auto-closes the linked issue. Saves a step; keeps issue tracker tidy.

## Draft PRs

For work-in-progress that needs early feedback but isn't ready to merge:

GitHub → "Create draft pull request." Or convert later via "Convert to draft."

Draft PRs:
- Can't be merged (blocked).
- Don't notify reviewers (usually).
- Still run CI.

Useful for sharing direction early or asking for feedback before finishing.

## CI on PRs

Set up CI to run on every PR:

```yaml
# .github/workflows/ci.yml
on:
  pull_request:
    branches: [main]
```

Standard jobs:
- Run tests.
- Lint.
- Type-check.
- Build the app.
- Deploy a preview environment.

Each surfaces issues before review. Reviewers don't waste time on broken code.

Branch protection (Module 2 Lesson 3) can require CI to pass before merging.

## Code review etiquette

Author:
- Keep PRs small (under 400 lines when possible).
- Self-review before requesting review.
- Respond to all comments (with code change or explanation).
- Resolve comments after addressing.

Reviewer:
- Respond within 24 hours (or set expectations).
- Be specific. "Use a constant here" not "code smell."
- Suggest alternatives, don't just criticize.
- Distinguish "must fix" from "consider."
- Approve when ready; don't block on nits.

Bad code review is the #1 source of team friction. Mature teams set clear norms.

## The merge step

GitHub offers three merge strategies:

1. **Create a merge commit.** Preserves PR history as a merge commit on main.
2. **Squash and merge.** Combines all PR commits into one on main.
3. **Rebase and merge.** Replays PR commits onto main individually.

Pick one as the team default. Most modern teams use squash-and-merge for clean main history.

In repo settings: Settings → General → Pull Requests → enable only the strategies you allow. Removes the choice from individual PRs; enforces consistency.

## After merge

Auto-delete the branch:

Settings → General → Pull Requests → "Automatically delete head branches."

Branches accumulate over time; cleanup avoids decision fatigue. The branch's commits stay in history; only the branch pointer is deleted.

Pull main locally:

```bash
git switch main
git pull
git branch -d feature/add-login  # delete the local branch
```

Now ready for the next branch.

## PR size matters

Massive PRs (1000+ lines) get bad reviews because reviewers skim instead of read carefully. Split into smaller PRs:

- Separate refactor from feature.
- Separate test additions from logic changes.
- Land feature flag + dark code; then activate later.

Smaller PRs review faster, merge faster, conflict less. The discipline of small PRs pays back continuously.

## Stacked PRs

For changes that build on each other:

- PR1: refactor X.
- PR2 (based on PR1): add feature Y using refactored X.
- PR3 (based on PR2): polish Y.

GitHub doesn't natively support stacked PRs well. Tools (graphite.dev, sapling) make it cleaner. Without them: open each PR; mark them depending on each other in description; merge in order.

## Common mistakes

- **No PR template.** Inconsistent reviews.
- **Massive PRs.** Bad reviews; long cycles.
- **No CI required.** Breaking changes merge.
- **Hostile review comments.** Burns out the team.
- **Lingering draft PRs.** Get forgotten.

## Summary

- Branch → push → PR → review → merge → delete.
- PR template ensures consistent context.
- Link issues via keywords (Closes #1234).
- Draft PRs for work-in-progress feedback.
- Require CI to pass before merging.
- Pick one merge strategy (squash-and-merge is the modern default).
- Small PRs review faster.

Next: code review patterns.
