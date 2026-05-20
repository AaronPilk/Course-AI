---
module: 1
position: 2
title: "Branches and HEAD"
objective: "Pointers, not folders."
estimated_minutes: 7
---

# Branches and HEAD

## Branches are pointers

A branch in Git is a movable pointer to a commit. Not a folder. Not a copy of the codebase. Not a stream. A pointer.

`.git/refs/heads/main` contains exactly one thing: a 40-character commit hash.

```
$ cat .git/refs/heads/main
a3f5b6c8d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5
```

That's the entire branch. Whatever commit that hash points to is the tip of `main`. The branch's "history" is whatever commits you can reach by walking parent pointers backward from that tip.

Creating a branch creates a new pointer:

```bash
git branch feature           # new pointer at current commit
```

This is fast — it's just creating a file with a hash. No copying, no checkout.

## HEAD

HEAD is a special pointer. It says "where am I now."

Usually HEAD points to a branch:

```
$ cat .git/HEAD
ref: refs/heads/main
```

This means "I'm on main." When you commit, the `main` branch pointer moves forward to the new commit, and HEAD follows.

Sometimes HEAD points directly to a commit (no branch in between):

```
$ cat .git/HEAD
a3f5b6c8d9e1f2a3...
```

This is "detached HEAD" state — you've checked out a commit that isn't a branch tip. Useful for browsing history; risky for making new commits (they're not on any branch, easy to lose).

## Switching branches

`git checkout feature` (or modern `git switch feature`) does three things:

1. Updates HEAD to point at `feature`.
2. Updates the working directory to match `feature`'s commit.
3. Updates the index to match.

Your files change to reflect the destination branch. Uncommitted changes either come along (if compatible) or block the switch.

```bash
git switch feature           # modern command for switching branches
git switch -c new-branch     # create and switch in one step
git switch -                 # switch to the previously-checked-out branch
```

## Creating branches

```bash
git switch -c feature                    # from current commit
git switch -c feature origin/main        # from a specific commit
git branch hotfix v1.2.3                 # create without switching
```

Branches are cheap. Create them freely. Common pattern: one branch per change, even small ones.

## Moving branches

A branch pointer moves automatically when you commit on it. But you can also manually move it:

```bash
git branch -f feature HEAD~3          # force-move feature to 3 commits back
git reset --hard a3f5b6c              # move current branch to that commit
```

`git reset --hard` is dangerous: it moves the branch pointer AND updates files AND staging. Commits between old and new positions become "lost" (still recoverable via reflog for ~30 days, but harder to find).

Use `--hard` only when you're sure. `--soft` (move pointer only) and `--mixed` (default — move pointer + unstage) are safer.

## Local vs remote branches

Local branches: in your `.git/refs/heads/`.

Remote-tracking branches: in `.git/refs/remotes/origin/`. These represent the state of branches on the remote at last fetch.

`origin/main` is the local copy of `main` on the remote. It updates when you fetch:

```bash
git fetch                # update remote-tracking branches
git fetch origin         # same; explicit remote
```

Fetch does NOT modify your local branches. It updates `origin/*` to match the server.

`git pull` is `git fetch` + `git merge origin/branch` (or `git rebase` depending on config). Often easier; obscures what's happening.

## Pushing branches

```bash
git push origin feature              # push local feature to origin
git push -u origin feature           # set upstream tracking
git push                             # push current branch to its upstream
```

The first push of a new local branch usually needs `-u origin feature` to set the upstream. After that, just `git push`.

`-u` sets `feature` to track `origin/feature`. Now `git pull` and `git push` know which remote branch to use.

## Default branch naming

Modern convention: `main` is the default branch name (replacing `master`). Most new repos in GitHub default to `main`.

If you're working with older repos, you may see `master`. Just a name; same behavior.

## Branch naming conventions

Common patterns:

- `feature/add-login`
- `fix/payment-bug`
- `chore/upgrade-deps`
- `release/v2.0`

Slashes are allowed (and create directory-like structures in `.git/refs/heads/`).

For team consistency:

- Lowercase.
- Hyphens (not underscores or spaces).
- Prefix by type (`feature/`, `fix/`).
- Include ticket number (`feature/PROJ-123-add-login`).

Pick a convention; document it; enforce in PR templates.

## Long-lived vs short-lived branches

**Long-lived:** main, sometimes develop, release branches.
**Short-lived:** feature branches, fix branches, experiments.

Best practice: short-lived branches live days, not weeks. Merge soon; delete after merge. Long branches accumulate conflict pressure with main.

When a feature is big, break it into smaller PRs that merge incrementally — each behind a feature flag if needed. Feature branches that live for months are a smell.

## Stashing

Sometimes you have uncommitted changes but need to switch branches:

```bash
git stash                    # save uncommitted changes
git switch other-branch
# ... do something
git switch original-branch
git stash pop                # restore changes
```

`stash` is a quick "save my changes elsewhere" mechanism. Stashes accumulate; manage with:

```bash
git stash list               # see all stashes
git stash apply stash@{2}    # apply a specific one
git stash drop stash@{0}     # delete one
git stash clear              # delete all
```

For longer-lived work, commit to a feature branch instead. Stashes get forgotten.

## Detached HEAD

When HEAD points directly to a commit (not a branch):

```bash
git checkout a3f5b6c         # detached HEAD
```

You can look around, build, run — but commits made here aren't on any branch. They become "dangling" if you switch away without saving.

To save commits made in detached HEAD:

```bash
git switch -c new-branch     # creates a branch at the current commit
```

If you've already switched away and want them back, the reflog has them:

```bash
git reflog                   # list HEAD movements
git checkout HEAD@{N}        # go back to a previous HEAD position
```

The reflog keeps history of HEAD movements for ~90 days. Lifeline when things go wrong.

## Branches as work tracking

A useful pattern: one branch per logical change. Even small fixes get their own branch.

Benefits:
- Each branch maps to a PR; PR maps to a ticket.
- Easy to abandon work that doesn't pan out (delete the branch).
- Parallel work without conflicts.
- Code review focused on one change at a time.

```bash
# Day starts:
git switch main && git pull
git switch -c feature/PROJ-123-add-login

# Work on the feature...

git push -u origin feature/PROJ-123-add-login
# Open PR

# After merge:
git switch main && git pull
git branch -d feature/PROJ-123-add-login   # delete local branch
```

Becomes muscle memory. Branches are cheap; treat them as the unit of work.

## Mistakes to avoid

- **Thinking of branches as long-running threads.** Most branches die in days.
- **Working in detached HEAD without realizing.** Lost commits.
- **Force-pushing shared branches.** Rewrites history; conflicts for others.
- **Letting feature branches live for months.** Conflict pain on merge.
- **`git reset --hard` without understanding.** Loses work.

## Summary

- A branch is a movable pointer to a commit (a hash in a file).
- HEAD points to "where I am now" (usually a branch).
- Detached HEAD = HEAD points at a commit, not a branch.
- Switching branches updates HEAD, working dir, index.
- Push/pull use upstream tracking; `-u` to set it the first time.
- Short-lived branches; merge soon; delete after merge.
- Reflog is your safety net for lost commits.

Next: merge vs rebase.
