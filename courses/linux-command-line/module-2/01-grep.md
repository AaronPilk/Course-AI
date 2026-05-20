---
module: 2
position: 1
title: "grep: search through text"
objective: "Find lines that match patterns in files or streams."
estimated_minutes: 6
---

# grep: search through text

## The job

`grep` reads lines from input (files or stdin), prints the ones matching a pattern. Everything else flows past.

It's the single most-used text tool. Once fluent, you'll use it dozens of times per day.

## Basic usage

```
$ grep "error" /var/log/syslog               # lines containing "error"
$ grep -i "error" /var/log/syslog            # case-insensitive
$ grep -v "INFO" log.txt                     # lines NOT containing INFO
$ grep -n "TODO" main.py                     # show line numbers
$ grep -c "ERROR" log.txt                    # count matching lines
$ grep -l "pattern" *.txt                    # list files that have a match
$ grep -L "pattern" *.txt                    # list files that don't
```

## Recursive search

```
$ grep -r "TODO" .                           # search current dir recursively
$ grep -rn "useState" src/                   # with line numbers
$ grep -rl "import pandas" .                 # only show file names with matches
$ grep -r --include="*.py" "def main" .      # restrict to Python files
$ grep -r --exclude-dir=node_modules "fetch" .  # skip node_modules
```

Most engineers eventually replace `grep -r` with `ripgrep` (`rg`) which is faster and respects `.gitignore`.

## Context around matches

```
$ grep -A 3 "error" log.txt                  # 3 lines After match
$ grep -B 3 "error" log.txt                  # 3 lines Before match
$ grep -C 3 "error" log.txt                  # 3 lines Context (both)
```

Often what you actually want — the matching line plus surrounding context to interpret it.

## Regex basics

By default, `grep` uses Basic Regular Expressions (BRE):

```
$ grep "^Error" log.txt                      # lines STARTING with "Error"
$ grep "200$" log.txt                        # lines ENDING with "200"
$ grep "user.*login" log.txt                 # "user" then anything then "login"
$ grep "[0-9][0-9][0-9]" log.txt             # exactly three digits
```

For Extended Regular Expressions (ERE) — more powerful, fewer escapes:

```
$ grep -E "error|warning|fatal" log.txt      # alternation
$ grep -E "[0-9]{3}" log.txt                 # repetition
$ grep -E "(success|done) request" log.txt   # grouping
```

`-E` is the modern default. Some people alias `grep` to `grep -E`.

For Perl-compatible regex (PCRE), use `-P`:

```
$ grep -P "\d+\s+\w+" log.txt                # \d, \s, \w shortcuts
$ grep -P "(?<=user=)\w+" log.txt            # lookbehind (PCRE only)
```

`-P` isn't on every grep build; usually present on Linux, not always macOS (use `pcregrep` or `rg` instead).

## Fixed strings (no regex)

When you want a literal string:

```
$ grep -F "func(x)" code.go
$ fgrep "func(x)" code.go                    # same; older syntax
```

Useful when the search string has regex meta-characters you don't want interpreted.

## Inverted and only-matching

```
$ grep -v "DEBUG" log.txt                    # lines NOT matching
$ grep -o "user=\w+" log.txt                 # print only matching part
$ grep -oE "[0-9]{4}" log.txt                # extract 4-digit numbers
```

`-o` is great for pulling out specific data — IP addresses, error codes, IDs.

## Pipes — the real power

`grep` shines in pipelines:

```
$ ps aux | grep python                       # find python processes
$ history | grep ssh                         # past ssh commands
$ cat error.log | grep -i critical | wc -l   # count critical errors
$ docker logs container | grep -A 5 panic    # find panics with context
$ curl -s api.example.com/data | grep -o '"id":"[^"]*"'  # extract IDs from JSON
```

Stream in, filter, stream out. Compose with other tools.

## The "grep -v grep" tradition

```
$ ps aux | grep python | grep -v grep        # find python procs, exclude the grep itself
```

`grep python` matches the grep process itself (with the word "python" in its command). Add `| grep -v grep` to exclude. Or:

```
$ pgrep python                               # purpose-built for finding processes
```

`pgrep` doesn't include itself.

## Common idioms

**Find IP addresses in a log:**

```
$ grep -oE "\b([0-9]{1,3}\.){3}[0-9]{1,3}\b" access.log | sort -u
```

**Count occurrences of each error type:**

```
$ grep "ERROR" log.txt | awk '{print $5}' | sort | uniq -c | sort -rn
```

**Show recent matches only:**

```
$ tail -1000 log.txt | grep -i timeout
```

**Search across many files efficiently:**

```
$ rg "TODO|FIXME" --type js
```

## grep vs ripgrep (rg)

For codebase search, `rg` is faster, respects `.gitignore`, prettier output:

```
$ rg "useState" src/                         # like grep -rn
$ rg -i pattern                              # case-insensitive
$ rg -t py "def"                             # only Python files
$ rg -A 3 -B 3 pattern                       # context
$ rg -F "func(x)"                            # fixed string (no regex)
$ rg --hidden pattern                        # search hidden files
```

If you spend time in codebases, `rg` will save you minutes daily. Install via `apt`, `brew`, or `cargo`.

## Mistakes to avoid

- **Forgetting -E for alternation.** Plain grep needs escaped `\|`; ERE just uses `|`.
- **Using grep when jq would work better.** For JSON, `jq` is purpose-built and correct.
- **Greedy regex.** `.*` matches as much as possible. Often want `.*?` (lazy) or more specific patterns.
- **grep -i unnecessarily.** Case-sensitive search is faster and more precise when you know the case.

## Summary

- `grep` filters lines matching a pattern.
- Flags: -i (ignore case), -v (invert), -n (line numbers), -r (recursive), -A/B/C (context), -o (only match).
- `-E` for extended regex; `-P` for PCRE (when available).
- Compose with pipes for power.
- `rg` (ripgrep) is the modern faster alternative for codebases.

Next: sed for stream editing.
