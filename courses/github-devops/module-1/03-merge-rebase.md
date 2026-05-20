---
module: 1
position: 3
title: "Merge vs rebase — when to use which"
objective: "Two ways to integrate changes."
estimated_minutes: 7
---

# Merge vs rebase — when to use which

## Two strategies for integrating

You've made commits on `feature`; meanwhile `main` advanced with other people's changes. To combine, two strategies:

- **Merge:** create a merge commit that joins the two histories.
- **Rebase:** replay your commits on top of the new main.

Both end with feature's changes integrated into main's history. The shapes differ; the implications differ; the right choice depends on context.

## Merge

```bash
git switch feature
git merge main
```

Or the more common direction (merging feature into main):

```bash
git switch main
git merge feature
```

The result depends on whether feature can fast-forward.

**Fast-forward (no merge commit):**
If main hasn't moved since feature branched, Git just moves main's pointer forward to feature's tip. No new commit; history is linear.

```
Before:
A → B → C (main)
        ↓
        D → E (feature)

After git merge feature (FF):
A → B → C → D → E (main, feature)
```

**Three-way merge (creates merge commit):**
If main has moved since feature branched, Git creates a new commit with two parents.

```
Before:
A → B → C → F → G (main)
        ↓
        D → E (feature)

After git merge feature:
A → B → C → F → G ──┐
        ↓            ↓
        D → E ────── M (main)
```

M is the merge commit. Both histories are preserved; the graph forks and rejoins.

## Rebase

```bash
git switch feature
git rebase main
```

Rebase replays feature's commits onto main:

```
Before:
A → B → C → F → G (main)
        ↓
        D → E (feature)

After git rebase main:
A → B → C → F → G (main)
                ↓
                D' → E' (feature)
```

D and E are replaced by D' and E' — new commits with the same content but new parent hashes. Feature now appears as if it branched from G instead of C.

To finish, fast-forward main:

```bash
git switch main
git merge feature           # fast-forward; no merge commit
```

Result:

```
A → B → C → F → G → D' → E' (main, feature)
```

Linear history. No merge commits. Looks like the work happened sequentially.

## When merge wins

**1. Preserving real history.** Merge keeps the actual development timeline. You can see what was developed in parallel and when it converged.

**2. Shared branches.** Rebasing rewrites commits (D becomes D'). If others have based work on the original D, your rebase orphans their work. Merge doesn't have this problem.

**3. Easier conflict resolution.** A merge resolves conflicts once. Rebase resolves them potentially per-commit (each replayed commit can conflict).

**4. Audit trail.** For regulated industries needing precise history, merges are evidence of who did what when. Rebased history is rewritten history.

## When rebase wins

**1. Clean, linear history.** No merge commits cluttering `git log`. Each commit appears in chronological order.

**2. Bisect-friendly.** `git bisect` (binary-search for the commit that introduced a bug) is much easier on linear history.

**3. Pre-merge cleanup.** Squashing 7 WIP commits into 1 clean commit before merging is a rebase operation.

**4. PR hygiene.** A clean rebased PR is easier to review than one with 12 "fix typo" commits.

## The common team rules

Most teams settle on one of these:

**Rule A: Rebase locally; merge to share.**

- On your feature branch: rebase against main to stay current.
- When ready to integrate: open a PR; merge it (usually with a merge commit or squash).

This keeps your local branch clean without rewriting shared history.

**Rule B: Always merge.**

- Never rebase shared branches.
- Local branches can rebase freely.

Simpler rule; some history clutter.

**Rule C: Squash-and-merge.**

- All PR commits get squashed into one commit on main.
- main's history is linear, one commit per feature.

Popular for projects that value clean main but don't care about feature-branch history.

## The golden rule of rebase

**Never rebase commits that have been pushed to a shared branch.**

If you rebase and force-push to a branch others are working on, their pulls now produce conflicts and confusion. Their local copies still have the original commits; the remote has the rewritten commits. The graph diverges.

Safe to rebase: your local feature branch you haven't pushed, or pushed only to your own fork.

Unsafe to rebase: shared `main`, `develop`, or any branch teammates have pulled.

## Interactive rebase

For cleaning up commits before pushing:

```bash
git rebase -i HEAD~5         # interactively rebase the last 5 commits
```

Opens an editor with:

```
pick a3f5b6c First commit
pick 8d1e2f4 Second commit
pick 1a2b3c4 Third commit
pick 9e8f7d6 Fourth commit
pick 5c4b3a2 Fifth commit
```

You can:

- **pick** — keep the commit.
- **reword** — keep but change the message.
- **edit** — pause to amend.
- **squash** — combine with previous commit (keeps both messages).
- **fixup** — combine with previous, discard this message.
- **drop** — remove the commit.

Reorder, squash, fix messages, drop bad commits — all in one operation. Powerful but requires the safe-to-rebase condition.

## Squash and merge (GitHub-side)

GitHub's "Squash and merge" button combines all PR commits into one before merging:

```
Before merge:
main: A → B → C
feature: A → B → C → D → E → F → G (lots of WIP commits)

After "Squash and merge":
main: A → B → C → S    (S contains the combined changes of D, E, F, G)
```

S is a single commit on main with all the feature's changes. The original D-G commits exist on the feature branch (which you can delete).

Result: linear main history; one commit per feature. Pure squash-and-merge teams have very clean main.

Trade-off: loses the granular commits that might help future debugging. For most teams, the cleanliness win is worth it.

## Merge commit messages

Merge commits get auto-generated messages: "Merge branch 'feature' into main." For PRs merged via GitHub UI, the merge commit message is customizable.

Many teams use a template:

```
Merge pull request #1234 from username/feature

Add new login form

- Implement email/password flow
- Validate input
- Add tests
```

The squash-and-merge option folds the PR's commits into one with a customizable message. Pair with Conventional Commits (Module 4) for changelog generation.

## When conflicts happen

Both merge and rebase can produce conflicts.

**Merge conflict:** Git can't combine changes; you resolve in the conflicting files; `git add` the resolutions; `git commit` to complete the merge.

**Rebase conflict:** Same, but on a per-commit basis. Each replayed commit can conflict. `git rebase --continue` after resolving each.

Conflict resolution is covered in detail in Lesson 4. The key point: both strategies can require it; the resolution process is similar.

## Hybrid: merge `main` into feature periodically

Some teams use a hybrid:

- Long-running feature branches periodically merge `main` into themselves to stay current.
- Final integration uses merge or squash-and-merge.

This preserves history (merges) while keeping the feature branch up-to-date.

Risk: merge commits in the feature branch make the PR diff confusing. Rebase against main works better for the "stay current" case.

## Picking for your team

If unsure:

- **Small teams, mature code:** rebase locally, squash-and-merge on PR.
- **Larger teams, formal change tracking:** always merge; preserve full history.
- **Open source:** depends on project; check existing convention.
- **Regulated industries (finance, healthcare):** merge for audit trail.

Pick one approach; document it; enforce in PR settings.

## Mistakes to avoid

- **Rebasing shared branches.** Force-push pain for everyone.
- **Squashing massive PRs.** Loses important context.
- **No team agreement.** Inconsistent history.
- **Long-running feature branches without periodic update.** Conflict pain at merge.
- **Force-pushing without `--force-with-lease`.** Can overwrite teammates' work.

## Summary

- Merge: creates a merge commit; preserves history; safe on shared branches.
- Rebase: replays commits with new hashes; creates linear history; safe only locally.
- Fast-forward merge: no merge commit when possible.
- Squash-and-merge: combines PR commits into one for clean main history.
- The golden rule: don't rebase pushed-shared commits.
- Pick a team strategy; document it; enforce via PR settings.
- Interactive rebase for cleanup before sharing.

Next: resolving conflicts confidently.
