---
module: 1
position: 1
title: "Commits, the object model, and what Git stores"
objective: "Git as a graph of immutable snapshots."
estimated_minutes: 7
---

# Commits, the object model, and what Git stores

## The mental model that fixes Git

Most Git confusion comes from a fuzzy mental model. People think of branches as folders, commits as deltas, merges as joining lines. None of that is quite right. Once you internalize what Git actually stores, every command stops being magic.

The truth: **Git is a directed acyclic graph (DAG) of immutable snapshots**. That's it. Every Git operation manipulates this graph.

## What a commit actually is

A commit is an object containing:

- A snapshot of every file at that point in time (well, technically a tree of files).
- Pointers to its parent commit(s).
- Metadata: author, committer, timestamp, message.

Commits are identified by a SHA-1 hash (40 hex characters) computed from their content. The hash IS the commit ID. Change anything in a commit and the hash changes — meaning commits are immutable. You can't edit a commit; you create a new commit with different content.

```
commit a3f5b6c... (HEAD -> main)
Author: Aaron <aaron@example.com>
Date:   Mon May 19 14:30:00 2026 -0700

    Add login form

    Implements the basic auth flow.

  ├─ snapshot of all files
  └─ parent: 8d1e2f4...
```

The parent pointer is what makes commits chain into history. Each commit knows its parent; following the chain backward = the full history.

## "Git stores snapshots, not deltas"

Many version control systems store changes (deltas) between versions. Git stores complete snapshots — each commit has the full state of the project at that moment.

Doesn't this waste space? No — Git is smart:

- Identical files across commits share storage (content-addressed: same content = same object).
- Pack files compress aggressively over similar content.
- The total repo size stays small even for large histories.

But conceptually, each commit is a complete snapshot. This simplifies everything: there's no "rebuild from history" step; checking out an old commit just points to that snapshot.

## The Git object types

Four object types in Git:

1. **Blob** — file contents.
2. **Tree** — directory structure (lists of blobs and other trees, with file names).
3. **Commit** — snapshot + metadata + parent pointers.
4. **Tag** — annotation on a specific commit (used for releases).

All four are content-addressed. Same content → same hash. Different content → different hash.

When you `git add` a file, it creates a blob. When you `git commit`, it creates a tree (capturing the directory layout) and a commit object (pointing to the tree).

## The .git directory

`.git/` contains the entire repository state:

- `.git/objects/` — all blobs, trees, commits, tags.
- `.git/refs/` — pointers to commits (branches, tags).
- `.git/HEAD` — pointer to the current branch (or commit, in detached HEAD).
- `.git/config` — local repo config.
- `.git/index` — the staging area.

Inspect with low-level commands:

```bash
git cat-file -t <hash>   # what type is this object?
git cat-file -p <hash>   # print its contents
```

You usually don't poke at internals directly, but knowing they exist helps debug strange situations.

## The DAG

Multiple commits form a directed acyclic graph:

```
A → B → C → D    (main branch)
        ↓
        E → F    (feature branch, branched from C)
```

A is the root commit (no parent). B's parent is A; C's parent is B; D's parent is C. E branched from C — E's parent is C. F's parent is E.

Two key properties:

- **Directed:** each edge has a direction (parent ← child).
- **Acyclic:** no commit is its own ancestor.

Merges are commits with multiple parents:

```
A → B → C → D ──┐
        ↓        ↓
        E → F → M   (M has two parents: D and F)
```

M is a merge commit. Its parents are D (from main) and F (from feature).

## Why immutability matters

Commits are immutable. You can't change a commit's content; "amending" a commit creates a new one with a new hash.

This makes Git deterministic and safe:

- The same commit always represents the same state.
- Rebasing creates new commits; the old ones still exist (briefly) until garbage collected.
- The graph is always consistent.

It also means **shared commits should not be rewritten**. If you've pushed commits to a shared branch, rewriting them (rebase, force-push) creates a divergent history that confuses teammates. Rewrite only commits that exist only in your local branch.

## Refs — branches and tags

A branch is a movable pointer to a commit. Literally — `main` is a 40-char hash stored in `.git/refs/heads/main`. When you commit on `main`, the pointer moves to the new commit.

A tag is also a pointer, but immovable. Once you tag a commit, the tag refers to that exact commit forever (unless you delete and recreate it).

`HEAD` is a special pointer that says "where am I right now." Usually points to a branch (`HEAD -> main`); occasionally points directly to a commit ("detached HEAD" state).

Understanding refs means understanding 90% of Git commands.

## Operations as graph manipulation

Every Git operation translates to graph manipulation:

- `git commit` — add a new node; move HEAD's branch pointer to it.
- `git branch feature` — create a new pointer at HEAD's commit.
- `git checkout feature` — change HEAD to point at `feature`.
- `git merge feature` — create a merge commit with two parents.
- `git rebase main` — replay commits onto `main` (creates new commits with new hashes).
- `git reset --hard` — move a pointer to a different commit; discard working changes.
- `git revert` — create a new commit that undoes another.
- `git cherry-pick` — copy a commit (its changes) onto the current branch.

The mental model: you're moving pointers and adding nodes. Once you see operations this way, everything makes sense.

## The staging area (index)

Between your working files and committed history sits the staging area (also called "index"). It's a snapshot of what the NEXT commit will contain.

```
Working directory → (git add) → Staging area → (git commit) → History
```

Why? You can:

- Stage some changes, leave others unstaged.
- Review what's about to be committed.
- Commit in logical chunks instead of "everything I changed."

```bash
git add path/to/file       # stage this file
git add -p                 # stage selected hunks interactively
git status                 # see what's staged vs unstaged
git diff                   # unstaged changes
git diff --staged          # staged changes
```

The index is sometimes confusing but enables clean commits.

## What this means for daily use

With the right mental model:

- "I need to undo my last commit" → move the branch pointer backward (`git reset HEAD~1`).
- "I want to merge but cleanly" → either merge (preserves history) or rebase (rewrites it).
- "I lost a commit" → reflog has it; it's still in the object store.
- "I accidentally committed to the wrong branch" → cherry-pick to the right branch; reset the wrong one.

Each is a graph operation. Understanding the graph means understanding Git.

## Mistakes to avoid

- **Thinking of branches as folders.** They're pointers.
- **Believing commits store deltas.** They store snapshots.
- **Trying to "edit" a commit.** Create a new one.
- **Force-pushing shared branches.** Rewrites others' history.
- **Ignoring the staging area.** Commit messy "everything I touched" blobs.

## Summary

- Git is a DAG of immutable snapshots.
- Commits are SHA-1 hashes of (snapshot + metadata + parent pointers).
- Same content always produces same hash → deterministic.
- Branches and HEAD are pointers, not folders.
- Operations are graph manipulations: add nodes, move pointers, copy/replay commits.
- Staging area (index) sits between working files and history.
- Shared commits should not be rewritten.

Next: branches and HEAD.
