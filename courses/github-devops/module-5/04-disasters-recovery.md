---
module: 5
position: 4
title: "Common Git disasters and recovery"
objective: "Reflog, reset, and other lifelines."
estimated_minutes: 7
---

# Common Git disasters and recovery

## When things go wrong

Git is forgiving once you know where things hide. Most "I lost my work" cases are recoverable via the reflog or other tools. This lesson catalogs common disasters and the recovery paths.

## The reflog

`git reflog` is your most important safety net. It logs every movement of HEAD over the last ~90 days:

```bash
$ git reflog
a3f5b6c HEAD@{0}: commit: latest work
8d1e2f4 HEAD@{1}: reset --hard HEAD~3    # uh oh
1a2b3c4 HEAD@{2}: commit: my important work
...
```

Even if a branch is deleted and commits become "lost," the reflog has them. To recover:

```bash
git checkout HEAD@{2}        # go to "my important work"
git switch -c recovered      # create a branch here
```

Saved. The reflog is the first thing to check when "I lost a commit."

## "I committed to the wrong branch"

```bash
# You wanted these commits on `feature/x`, not `main`.

# Make a branch from current main (where the commits are):
git switch -c feature/x

# Go back to main:
git switch main

# Reset main to before the wrong commits:
git reset --hard origin/main   # back to the remote's state
```

Now main is restored; feature/x has your work. Push feature/x; PR as normal.

If you've already pushed to main, you can't just reset — you'd need to revert each commit (creates new commits undoing them). Better: open a PR from feature/x; force-push main only if no one else has pulled (and you have permission).

## "I deleted a branch I needed"

The branch pointer is gone, but the commits exist in the reflog (assuming you'd had it checked out at some point):

```bash
git reflog | grep "branch-name"     # find when the branch existed
git switch -c branch-name <hash>    # recreate it at the right commit
```

If the branch was only remote, fetch may still show it temporarily:

```bash
git fetch
git switch -c branch-name origin/branch-name
```

After ~30 days of garbage collection, truly-orphaned commits get cleaned up. Recover sooner rather than later.

## "I force-pushed and overwrote teammates' work"

`--force` overwrites the remote branch with your local; if teammates had pushed since, their commits are now "missing" from the remote (but still in their local repos).

Recovery:
1. Tell affected teammates immediately.
2. They `git fetch && git reflog --all` to find their commits.
3. They cherry-pick or rebase their commits onto the new remote state.
4. You apologize, learn, and use `--force-with-lease` next time.

`--force-with-lease` is safer: it refuses to force-push if the remote has commits you don't have locally. Catches "someone pushed since I fetched" cases.

```bash
git push --force-with-lease   # safer than --force
```

For protected branches, force pushes are blocked entirely — recovery becomes impossible because the protection prevents the overwrite. Strong reason to enable.

## "I made a commit with a secret in it"

The file is in your working tree; you `git add` it; commit. Now the secret is in history.

Even if you remove the file and commit again, the original commit still has it. Anyone with read access can find it.

Recovery:

1. **Immediately rotate the secret** (regenerate the API key, password, etc.). Treat it as compromised because history is permanent and public mirrors may exist.

2. **Don't commit it in the first place.** Pre-commit hooks (gitleaks) catch this.

3. **For local-only commits** (not pushed): `git reset HEAD~1` removes the commit; edit the file; commit again. If only locally, no harm done.

4. **For pushed commits:** rewriting history via `git filter-repo` or BFG Repo-Cleaner removes the file from all history. But anyone who already cloned has it; public repos are forever. Rotation is your only real defense.

GitHub also auto-scans for known secret patterns and notifies you (Module 5 Lesson 3).

## "I rebased but conflicts are confusing"

You're 3 commits into a 10-commit rebase, with conflicts in every replayed commit:

```bash
git rebase --abort         # gives up; back to pre-rebase state
```

Now you can:

- Try a merge instead (one big conflict resolution).
- Refactor on main first; rebase your branch onto the new main.
- Pair with the author of the conflicting changes.

Pushing through 10 confusing conflicts often produces subtle bugs. Aborting and reconsidering is sometimes the right call.

## "I committed a huge file by mistake"

A 500MB binary in history. Repos clone slow; remote rejects pushes over size limits.

For recent commits (not pushed):

```bash
git reset HEAD~1            # uncommit
echo "huge-file.bin" >> .gitignore
rm huge-file.bin
git add .gitignore
git commit
```

For pushed commits in history:

```bash
# Remove file from all of history (rewrites!)
git filter-repo --path huge-file.bin --invert-paths

# Or use BFG (often faster):
bfg --delete-files huge-file.bin
```

History rewrite — coordinate with team; force-push needed. Don't do this casually.

For Git LFS (large file storage), large binaries get stored separately. Use it pre-emptively for media assets.

## "I'm on detached HEAD with new commits"

You're not on any branch; you've made commits; HEAD points directly to them:

```bash
git switch -c new-branch-name
```

Creates a branch at the current commit; your work is saved.

If you've already switched away without saving:

```bash
git reflog                          # find the commits
git checkout HEAD@{N}                # go back
git switch -c new-branch-name        # save them
```

## "I want to undo a specific old commit"

To create a new commit that undoes an old one's changes:

```bash
git revert <hash>
```

Creates a new commit that's the inverse of `<hash>`. Original commit stays in history; the revert commit cancels it forward.

Safe in shared history (doesn't rewrite anything). Use this rather than removing commits from shared branches.

For removing from local history only:

```bash
git reset --hard <hash>     # local-only
```

Discards everything after `<hash>`. Don't use on shared branches.

## "I want to extract a commit to another branch"

Cherry-pick:

```bash
git cherry-pick <hash>
```

Copies that commit (its changes) onto the current branch. Creates a new commit with the same content but new hash.

Useful for backporting fixes from main to release branches.

## "Working tree has uncommitted changes I want to discard"

Be careful — uncommitted changes aren't tracked in history.

```bash
git restore <file>           # discard changes to one file
git restore .                # discard ALL changes
git clean -fd                # delete untracked files
```

Once discarded, they're gone. The reflog doesn't help here (it tracks commits, not working-tree state).

For "save in case I need it later":

```bash
git stash                    # save changes; clean working tree
git stash pop                # restore later
```

Stashes are kept for ~90 days unless explicitly dropped.

## "I want to find when a bug was introduced"

`git bisect`:

```bash
git bisect start
git bisect bad                   # current state is bad
git bisect good v2.5.0           # this older version was good
# Git checks out a commit halfway between; test it
git bisect good     # or `git bisect bad` based on the test
# Repeat; Git binary-searches
git bisect reset                 # done
```

Find the exact commit that introduced the regression. Powerful for tracking down "when did this break?"

Works best with `git log --oneline --no-merges` — linear history is easier to bisect than tangled merges.

## "I want to see what changed and when"

```bash
git log --oneline           # short overview
git log -p path/to/file     # file's full history with diffs
git blame path/to/file      # who last modified each line
git log --follow            # follow renames
git log --grep "regex"      # search commit messages
git log --author=name       # filter by author
```

Combined, these reconstruct most "why was this changed?" questions.

## "I want to find a specific commit"

```bash
git log --all --grep "feature x"           # search messages
git log --all -S "specific code"           # search code added/removed
git log --all --oneline | grep "pattern"   # combined
```

`-S` searches diff content — useful for finding when a specific line was added or removed.

## Working with stashes

For temporary saves:

```bash
git stash                            # save changes
git stash push -m "WIP: refactor"     # with message
git stash list                       # see all stashes
git stash show stash@{0}              # see stash contents
git stash pop                        # restore + remove most recent
git stash apply stash@{2}            # restore but keep in list
git stash drop stash@{0}              # delete one
git stash clear                      # delete all
```

Stashes get forgotten. Use them for "less than an hour" interruptions. For longer work, commit to a feature branch.

## Backup strategy

GitHub itself is backup for code, but consider:

- **Local backups** if you work offline frequently. `git bundle` creates a portable archive.
- **Forks/mirrors** for important repos in case GitHub becomes unavailable.
- **Critical secrets in a password manager**, not just GitHub Secrets.

For Enterprise: GitHub provides backup tools; for individuals, occasional `git clone --mirror` to local storage.

## Mistakes to avoid

- **`git reset --hard` without thought.** Discards uncommitted changes silently.
- **`git push --force` without `--force-with-lease`.** Overwrites teammates' work.
- **Committing secrets, even briefly.** Rotation required; history is permanent.
- **Working long stints in stash.** Get committed to a branch instead.
- **Manual history rewriting on shared branches.** Causes chaos.

## Summary

- The reflog is your safety net for ~90 days of HEAD movements.
- Most "lost commits" are recoverable via reflog.
- `--force-with-lease` over `--force` for safer pushes.
- Branch protection blocks force pushes — strong reason to enable.
- Rotate secrets immediately if committed; history is permanent.
- `git bisect` for finding regression-introducing commits.
- `git filter-repo` / BFG for removing files from history (coordinate with team).

Course complete.
