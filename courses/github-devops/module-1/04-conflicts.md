---
module: 1
position: 4
title: "Resolving conflicts confidently"
objective: "From panic to procedure."
estimated_minutes: 7
---

# Resolving conflicts confidently

## Why conflicts happen

A conflict happens when Git can't automatically combine changes. Most commonly:

- Two people edited the same lines of the same file in different ways.
- One person deleted a file that another modified.
- Renames colliding.

Git is conservative — it doesn't guess. When it can't auto-merge, it pauses and asks you to decide.

Conflicts feel scary the first time. They're actually procedural: identify the conflict, decide what's right, mark resolved, continue.

## What a conflict looks like

A conflicted file gets conflict markers inserted:

```text
function login(email, password) {
<<<<<<< HEAD
  return api.post('/auth/login', { email, password });
=======
  return api.post('/v2/auth/signin', { email, pwd: password });
>>>>>>> feature/api-v2
}
```

- Between `<<<<<<< HEAD` and `=======` is YOUR version (what was on the current branch).
- Between `=======` and `>>>>>>> feature/...` is THEIR version (what's being merged in).
- The names after `<<<<<<<` and `>>>>>>>` indicate which side is which.

Your job: replace the entire conflict block (markers and all) with the correct combined code.

## Resolving a conflict

Step by step:

1. **Run `git status`.** Shows which files have conflicts.

```
both modified:   src/auth.ts
both modified:   src/api.ts
```

2. **Open each conflicted file.** Find the markers.

3. **Decide the right resolution.**
   - Keep your version?
   - Keep their version?
   - Combine both?
   - Write something new entirely?

4. **Edit the file.** Remove the markers; leave the correct code.

```text
function login(email, password) {
  return api.post('/v2/auth/signin', { email, pwd: password });
}
```

5. **`git add` the resolved file.** Tells Git: "this conflict is resolved."

6. **Repeat for every conflicted file.**

7. **Complete the merge/rebase.**

For merge: `git commit` (the message defaults to the merge message).

For rebase: `git rebase --continue`.

## Using a merge tool

Editing markers manually works but is error-prone for complex conflicts. Merge tools (visual three-pane diffs) help:

```bash
git mergetool                # opens your configured tool
```

Configured via:

```bash
git config --global merge.tool vscode    # or vimdiff, meld, kdiff3, etc.
```

VSCode has built-in conflict resolution UI: click "Accept Current" / "Accept Incoming" / "Accept Both" buttons. Useful for visual learners.

For complex three-way conflicts, dedicated tools (Beyond Compare, Sublime Merge, Kaleidoscope) shine.

## Common patterns

**Both branches added the same feature:**
Often one implementation is better; pick that, delete the other. Sometimes you keep both (different names).

**Both branches refactored the same function:**
The hardest case. Look at git history (`git log -p path/to/file`) for both branches to understand intent. Sometimes the right answer is a NEW refactor combining ideas from both.

**Whitespace-only conflicts:**
One side reformatted; the other made real changes. Use `git diff -w` to see non-whitespace diff, decide based on logic.

**Lock file conflicts (`package-lock.json`, `yarn.lock`):**
Almost always: delete the conflicted lockfile, re-run `npm install` / `yarn install`, commit the regenerated file. Don't try to merge lockfiles by hand.

## Aborting

If a merge or rebase is going badly:

```bash
git merge --abort        # undo the merge attempt
git rebase --abort       # undo the rebase attempt
```

Returns to the state before you started. Safe escape hatch.

## When to keep going

Rebases can have conflicts in EVERY replayed commit. If you've already resolved 3 conflicts and have 5 more, abort and reconsider:

- Maybe a merge would have been simpler (one big conflict resolution).
- Maybe the rebase has fundamental issues (the branches diverged too much).
- Maybe you need to rethink the structure (refactor on main, then continue feature).

Sometimes the right answer is `git rebase --abort` and a different approach.

## Avoiding conflicts

You can't eliminate conflicts but you can reduce them:

**1. Pull/merge main frequently.** Long-lived feature branches accumulate conflict pressure. Update against main every day or two.

**2. Keep changes small.** Small PRs have less surface area for conflicts.

**3. Don't reformat unrelated code.** Whitespace-only changes alongside real changes create false conflicts.

**4. Communicate.** "I'm refactoring auth this week — anyone else touching it?" prevents collisions.

**5. Move files together.** If you're moving `Button.tsx` and someone else is editing it, coordinate.

## The merge-conflict workflow

When you encounter a conflict mid-merge:

```bash
$ git merge feature
Auto-merging src/auth.ts
CONFLICT (content): Merge conflict in src/auth.ts
Automatic merge failed; fix conflicts and then commit the result.

$ git status                                      # see conflicted files
$ # edit src/auth.ts, resolve conflicts
$ git add src/auth.ts                             # mark as resolved
$ git status                                      # verify nothing else conflicted
$ git commit                                      # complete the merge (default message)
```

The merge commit message defaults to "Merge branch 'feature'..." Customize if needed.

## The rebase-conflict workflow

```bash
$ git rebase main
First, rewinding head to replay your work on top of it...
Applying: Add login form
Applying: Validate email
error: could not apply 9e8f7d6... Validate email
CONFLICT (content): Merge conflict in src/validation.ts

$ # edit src/validation.ts, resolve
$ git add src/validation.ts
$ git rebase --continue                           # apply next commit

Applying: Add password reset
# (more conflicts possible per commit)
$ # resolve each
$ git rebase --continue                           # eventually finishes
```

Each replayed commit can conflict. After all are resolved, the rebase completes.

## Three-way merge mechanics

Git uses a three-way merge:

- **Our** version (current branch's content).
- **Their** version (incoming branch's content).
- **Common ancestor** (the commit both branches share).

The ancestor helps Git understand "this line came from there originally" — so it can detect what each side genuinely changed vs what was inherited. Manual conflict resolution can take the ancestor into account too:

```bash
git checkout --conflict=diff3 -- file.ts
```

Now markers also show the original ancestor version. Useful for complex conflicts where you need to know what was there before either side changed it.

## Resolution strategies

Sometimes you want a default — keep one side automatically:

```bash
git checkout --ours path/to/file       # keep our version (current branch)
git checkout --theirs path/to/file     # keep their version (incoming)
```

Useful for files you know you should ignore one side of (generated files, lockfiles).

For full file overrides during merge:

```bash
git merge -X ours feature              # prefer current branch on conflicts
git merge -X theirs feature            # prefer incoming branch on conflicts
```

`-X ours` resolves conflicts by keeping the current branch's version. `-X theirs` keeps the incoming. Note: it only affects conflicting hunks, not removing/adding files entirely.

## When all else fails

Some conflicts are too tangled to resolve confidently:

- **Talk to the other author.** They wrote one side; their intent matters.
- **Abort and reconsider.** Maybe restructure how the changes happen.
- **Combine in a fresh PR.** Both authors review the resolution before merging.

A bad conflict resolution can introduce subtle bugs. When the stakes are high, slow down and verify.

## After resolution

Once merged:

- Test thoroughly. Conflicts can mask runtime bugs that compile but fail.
- Run the full test suite, not just the affected files.
- Run integration tests if available.
- Have someone else review the conflict resolution.

The resolution itself is a code change. Treat it like one.

## Mistakes to avoid

- **Leaving conflict markers in code.** Embarrassing; breaks the build.
- **Resolving without understanding both sides.** Subtle bugs.
- **Manually merging lockfiles.** Regenerate them.
- **Force-pushing after a conflicting rebase.** Verify others' work first.
- **Ignoring "Abort" as an option.** Some conflicts are best avoided by restructuring.

## Summary

- Conflicts happen when Git can't auto-merge changes.
- Markers (`<<<<<<<`, `=======`, `>>>>>>>`) show the two sides.
- Resolve by editing the file to the correct state, then `git add`.
- Merge: `git commit` to complete. Rebase: `git rebase --continue`.
- Abort with `--abort` if going badly.
- Reduce conflicts by pulling often, keeping changes small, communicating.
- Lockfile conflicts: regenerate, don't merge by hand.
- Test thoroughly after resolution.

Next module: working with GitHub.
