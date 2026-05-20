---
module: 1
position: 2
title: "Files: cp, mv, rm, ln, touch"
objective: "The fundamental file operations and their gotchas."
estimated_minutes: 6
---

# Files: cp, mv, rm, ln, touch

## cp — copy

```
$ cp source.txt destination.txt          # copy file
$ cp source.txt /tmp/                    # copy into directory
$ cp -r src_dir/ dst_dir/                # recursive (directories)
$ cp -p src dst                          # preserve permissions/timestamps
$ cp -i src dst                          # interactive (asks before overwrite)
$ cp -u src dst                          # update only if source newer
$ cp -v src dst                          # verbose (show each file copied)
```

The trailing slash matters. `cp dir1/ dir2/` copies the contents; `cp dir1 dir2` (no slash) copies dir1 *into* dir2 if dir2 exists.

Always `-r` for directories. Without it, `cp` errors out.

## mv — move or rename

```
$ mv old_name.txt new_name.txt          # rename
$ mv file.txt /tmp/                     # move into directory
$ mv file.txt /tmp/renamed.txt          # move and rename in one step
$ mv -i src dst                         # interactive (warn on overwrite)
$ mv -n src dst                         # never overwrite
```

`mv` doesn't have `-r` because directories move atomically (it's just a name change in the parent).

Within the same filesystem, mv is instant — it's a metadata change. Across filesystems (different disks/mounts), it becomes a cp+rm. That can be slow for large directories.

## rm — remove

```
$ rm file.txt                          # delete file
$ rm -r dir/                           # delete directory (recursive)
$ rm -f file                           # force (skip confirmation)
$ rm -rf dir                           # recursive + force
$ rm -i file                           # interactive
$ rm -v file                           # verbose
```

**There is no trash.** `rm` is permanent. Once gone, gone (without `extundelete` heroics).

**The most dangerous command:**

```
$ rm -rf /            # NEVER. Wipes the entire system if run as root.
$ rm -rf $VAR/        # NEVER without checking $VAR isn't empty.
                     # If VAR is empty, this is rm -rf /.
```

Defensive habits:

- Check what you're deleting first with `ls` against the same path.
- Avoid `-rf` when `-i` or `-r` suffices.
- Set up a trash alias for daily use:

```bash
# In .bashrc
alias rm='rm -i'
```

Or use `trash-cli`:

```
$ trash-put file        # moves to ~/.local/share/Trash
```

For destructive operations, slow is fast.

## touch — create empty file or update timestamp

```
$ touch newfile.txt                    # create empty file
$ touch existing.txt                   # updates mtime to now
$ touch -d '2026-01-01' file           # set specific time
```

Common use: create placeholder files, or trigger something that watches file timestamps.

## ln — links

Two kinds:

**Hard links.** Two filesystem entries pointing to the same inode (same actual data). Both must be on the same filesystem.

```
$ ln source.txt hardlink.txt           # hardlink.txt is same data
```

Modifying one modifies the other (they're literally the same data). Deleting one doesn't delete the data; the other still points to it.

**Symbolic (soft) links.** A pointer file that says "look at this other path."

```
$ ln -s /path/to/target name           # creates 'name' pointing at target
```

If you delete the target, the symlink becomes broken (points to nothing). Symlinks can cross filesystems.

Most uses are symlinks. The classic: pinning a "current" version:

```
$ ln -s /opt/myapp-2.3.1 /opt/myapp/current
# Update by changing the symlink, not the path consumers reference
```

## Wildcards and globbing

The shell expands `*`, `?`, `[abc]` before passing to commands:

```
$ ls *.txt                            # all files ending in .txt
$ ls report-2026-??-??.pdf            # any matching pattern
$ ls [Mm]ake*                         # Make* or make*
$ ls **/file.txt                      # recursive (bash needs shopt -s globstar)
```

Globs vs regex are different — globs are simpler. `*` matches anything; `?` matches one character; `[…]` matches one of the listed.

`cp *.txt /tmp/` actually runs `cp file1.txt file2.txt file3.txt /tmp/` — the shell expanded the glob before cp saw it.

## File types

```
$ file mystery
mystery: PNG image data, 800 x 600
$ file script.sh
script.sh: Bourne-Again shell script, ASCII text executable
```

`file` inspects content to determine type — doesn't trust the extension. Useful for unknown files.

## Sizes and disk usage

```
$ du -h file.txt              # size of one file
$ du -sh dir/                 # total size of directory
$ du -sh */                   # size of each subdirectory
$ df -h                       # filesystem usage (mounted disks)
```

`du` walks the filesystem; can be slow on huge directories. `df` reads filesystem metadata; fast.

## Common file commands together

A typical "clean up the downloads folder" session:

```
$ cd ~/Downloads
$ ls -lt | head -20                  # see what's recent
$ du -sh */                          # which subdirs are big
$ rm -rf old-build-2024*             # delete patterns
$ mv installer*.dmg ../Archive/      # move keepers
$ touch .gitkeep                     # placeholder
```

## Mistakes to avoid

- **`rm -rf` without checking.** Permanent. Triple-check before pressing enter.
- **Variables in destructive commands without quotes.** `rm -rf $DIR/` becomes `rm -rf /` if `$DIR` is empty. Quote and check first.
- **Confusing `mv` rename with overwrite.** `mv a b` silently overwrites b if b exists. Use `-i` or `-n`.
- **Forgetting `-r` for directories.** Plain `cp dir/ dst/` errors out.

## Summary

- `cp` copies (use -r for directories); `mv` moves/renames; `rm` deletes permanently.
- `touch` creates empty or updates timestamps.
- `ln -s` creates symlinks (most common); hard links rarely.
- Globs (`*`, `?`, `[…]`) expand before command runs.
- `du -sh` for sizes; `df -h` for filesystems.
- Defensive habits: check paths, avoid bare `-rf`, prefer `-i` interactively.

Next: permissions and ownership.
