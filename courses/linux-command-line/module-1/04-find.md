---
module: 1
position: 4
title: "Finding things: find, locate, which"
objective: "Locate files, commands, and content fast."
estimated_minutes: 6
---

# Finding things: find, locate, which

## Three tools for three problems

- **`find`** — search the filesystem live, by attributes.
- **`locate`** — query a pre-built index of file paths (fast, possibly stale).
- **`which`** — find where an executable lives in your PATH.

Different problems; pick the right tool.

## find — the comprehensive search

```
$ find . -name "*.py"                # all .py files under current dir
$ find /etc -name "*.conf"           # config files in /etc
$ find . -type f                     # only files (not directories)
$ find . -type d                     # only directories
$ find . -size +10M                  # files larger than 10 MB
$ find . -mtime -7                   # modified in last 7 days
$ find . -newer reference.txt        # newer than that file
$ find . -name "*.log" -delete       # find and delete (careful!)
```

`find` is slow on large filesystems (it walks them) but live and precise.

Chain conditions:

```
$ find . -name "*.js" -size +100k -mtime -30
```

= JavaScript files over 100KB modified in the last 30 days.

Logical operators:

```
$ find . -name "*.py" -or -name "*.js"
$ find . -not -name "*.test.*"
$ find . \( -name "*.tmp" -or -name "*.bak" \) -delete
```

## find -exec — run a command per result

```
$ find . -name "*.log" -exec cat {} \;        # cat each .log file
$ find . -name "*.pyc" -delete                # built-in delete (faster)
$ find . -name "*.tmp" -exec rm {} +          # exec with batch (efficient)
```

`{}` is the placeholder for each found file. `\;` or `+` ends the exec command.

`+` batches files into one command invocation; `\;` runs one per file. `+` is faster for trivial commands.

## locate — fast but stale

`locate` queries a pre-built database (usually updated nightly by cron via `updatedb`):

```
$ locate sshd_config
/etc/ssh/sshd_config
/usr/share/man/man5/sshd_config.5.gz
```

Microseconds — much faster than `find`. Caveat: if you created a file today, `locate` may not see it until tomorrow.

To force-update the index:

```
$ sudo updatedb
```

Install on Debian/Ubuntu: `apt install plocate` or `mlocate`. macOS: `locate` doesn't auto-index by default; needs setup.

## which — find a command

```
$ which python3
/usr/bin/python3

$ which node
/home/aaron/.nvm/versions/node/v20.10.0/bin/node
```

Tells you which version of an executable runs when you type the command. Useful when `python` is doing something different than expected (system Python vs venv vs Conda).

`which -a` shows all matches in PATH order:

```
$ which -a python3
/home/aaron/.venv/bin/python3
/usr/bin/python3
```

The first wins; subsequent are shadowed by the first.

## type — better than which for shell built-ins

```
$ type cd
cd is a shell builtin

$ type ls
ls is aliased to `ls --color=auto`

$ type python3
python3 is /usr/bin/python3
```

`type` tells you whether the command is a builtin, alias, function, or executable. Sometimes the answer to "why isn't this command behaving like I expected" is "you have an alias for it."

## Finding inside files

`find` finds *file paths*. To search file *contents*, use `grep`:

```
$ grep -r "TODO" .                       # recursive grep for TODO
$ grep -rl "pattern" .                   # list files containing pattern
$ grep -rn "error" src/                  # show line numbers
$ grep -ri "case" .                      # case-insensitive
```

Combined power — find files, then grep them:

```
$ find . -name "*.py" -exec grep -l "pandas" {} \;
```

= all Python files that import pandas. (Or use `ag` / `rg` for faster modern alternatives.)

## ripgrep (rg) — modern grep

Much faster than `grep -r`, respects `.gitignore`, sensible defaults:

```
$ rg pattern                             # ripgrep through current dir
$ rg pattern src/                        # specific subdir
$ rg -i pattern                          # case-insensitive
$ rg -t py pattern                       # only .py files
$ rg -A 3 -B 3 pattern                   # 3 lines context around match
```

Install: `apt install ripgrep`, `brew install ripgrep`, or via Cargo. Once you try it, you won't go back to plain grep for codebases.

## fd — modern find

Same trend, for `find`:

```
$ fd "\.py$"                             # like find . -name "*.py"
$ fd config /etc                         # search in /etc
$ fd -t d node_modules                   # type=directory
$ fd -x echo {}                          # exec like find -exec
```

Faster, friendlier syntax, respects `.gitignore`.

## Practical search scenarios

**Find all large files:**

```
$ find / -type f -size +100M 2>/dev/null
```

(`2>/dev/null` hides permission-denied errors for things you can't read.)

**Find files modified today:**

```
$ find . -type f -mtime 0
```

**Find empty files:**

```
$ find . -type f -empty
$ find . -type d -empty       # empty directories
```

**Find files owned by a specific user:**

```
$ find / -user aaron
```

**Find recently changed configs:**

```
$ find /etc -name "*.conf" -mtime -30
```

## Where common things live

Knowing where to look saves search time:

- `/etc/` — system configuration.
- `/var/log/` — logs.
- `/usr/bin/`, `/usr/local/bin/` — installed programs.
- `/home/yourname/` — your files.
- `/tmp/` — temporary files (often cleared on reboot).
- `/opt/` — third-party software installations.
- `/proc/` — virtual filesystem with kernel/process info.

Common config locations:

- `~/.bashrc`, `~/.zshrc` — shell config.
- `~/.config/` — modern app configs.
- `~/.ssh/` — SSH keys and config.
- `/etc/hosts` — hostname → IP mapping.
- `/etc/passwd` — user accounts.

## Mistakes to avoid

- **`find` on `/` without filters.** Slow; floods with permission errors.
- **`locate` for very recent files.** Index may be stale.
- **`which` for shell functions and aliases.** Use `type` instead.
- **`grep -r` without `--include`.** Picks up node_modules, .git, binary files. Use `rg`.

## Summary

- `find` for live filesystem search by attributes.
- `locate` for fast indexed search (slightly stale).
- `which` / `type` for finding commands.
- `grep` (or `rg`) for content inside files.
- `fd` for a friendlier find.
- Modern alternatives (rg, fd) respect .gitignore and are much faster.

Module 1 complete. Next module: text manipulation with grep, sed, awk, jq.
