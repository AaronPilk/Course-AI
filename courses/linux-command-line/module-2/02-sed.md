---
module: 2
position: 2
title: "sed: stream-edit lines"
objective: "Edit text in pipelines and in-place in files."
estimated_minutes: 6
---

# sed: stream-edit lines

## What sed does

`sed` (stream editor) reads input line by line and applies transformations. The most common use: find/replace.

```
$ sed 's/old/new/' input.txt
```

Replaces the first occurrence of "old" with "new" on each line, prints result.

## Substitution syntax

```
s/pattern/replacement/flags
```

- `s` = substitute.
- `pattern` = regex to match.
- `replacement` = what to replace with.
- `flags`:
  - (none) — first match per line.
  - `g` — global, all matches on each line.
  - `i` — case-insensitive (GNU sed only).
  - `2` — second match only.

```
$ echo "foo bar foo baz" | sed 's/foo/quux/'      # quux bar foo baz
$ echo "foo bar foo baz" | sed 's/foo/quux/g'     # quux bar quux baz
$ echo "Foo bar" | sed 's/foo/baz/i'              # baz bar (GNU)
```

## In-place editing

Edit a file directly:

```
$ sed -i 's/foo/bar/g' file.txt           # GNU sed (Linux)
$ sed -i '' 's/foo/bar/g' file.txt        # BSD sed (macOS) — requires backup arg
```

**The macOS gotcha.** On macOS, `sed -i` requires a backup extension argument. To not write a backup, use `-i ''`. On Linux GNU sed, `-i` alone works.

Cross-platform safety:

```
$ sed -i.bak 's/foo/bar/g' file.txt       # creates file.txt.bak
```

Always test substitutions without `-i` first to verify.

## Choosing delimiters

The default delimiter is `/`. If your pattern or replacement contains `/`, escape it or use a different delimiter:

```
$ sed 's/\/old\/path/\/new\/path/' file.txt        # ugly
$ sed 's|/old/path|/new/path|' file.txt            # clean
$ sed 's#https://example.com#https://other.com#' file.txt
```

Any character can be the delimiter. Pick one that doesn't appear in the pattern.

## Capture groups and backreferences

Like regex elsewhere — group with `()` (in ERE) or `\(\)` (in BRE), reference with `\1`, `\2`, etc.

```
$ echo "John Smith" | sed -E 's/(\w+) (\w+)/\2 \1/'     # Smith John
$ echo "log: ERROR" | sed -E 's/log: (.*)/[\1]/'        # [ERROR]
```

`-E` enables extended regex. Without it, you'd need `\(\)` and `\1`. Most newer sed support `-E`; some only support `-r` (same thing in GNU sed).

## Deleting lines

```
$ sed '5d' file.txt                       # delete line 5
$ sed '5,10d' file.txt                    # delete lines 5-10
$ sed '/pattern/d' file.txt               # delete lines matching pattern
$ sed '/^$/d' file.txt                    # delete empty lines
$ sed '/^#/d' file.txt                    # delete lines starting with #
```

`/^$/d` to remove blank lines and `/^#/d` for comments are common.

## Printing specific lines

```
$ sed -n '5p' file.txt                    # print only line 5
$ sed -n '5,10p' file.txt                 # lines 5-10
$ sed -n '/pattern/p' file.txt            # only matching lines (like grep)
```

`-n` suppresses default printing; `p` flag prints explicit selections.

## Multiple commands

Chain commands with `-e` or semicolons:

```
$ sed -e 's/foo/bar/g' -e 's/baz/quux/g' file.txt
$ sed 's/foo/bar/g; s/baz/quux/g' file.txt
```

## Common transformations

**Strip trailing whitespace:**

```
$ sed -i 's/[[:space:]]*$//' file.txt
```

**Replace tabs with spaces:**

```
$ sed -i 's/\t/    /g' file.txt
```

**Convert Windows line endings (CRLF → LF):**

```
$ sed -i 's/\r$//' file.txt
```

**Add a prefix to each line:**

```
$ sed 's/^/  /' file.txt                  # indent everything 2 spaces
```

**Comment out lines containing 'debug':**

```
$ sed -i '/debug/s/^/# /' file.txt
```

**Uppercase / lowercase (GNU sed only):**

```
$ sed 's/.*/\U&/' file.txt                 # uppercase whole line
$ sed 's/.*/\L&/' file.txt                 # lowercase
```

## When sed gets hard

sed handles single-line transformations well. Multi-line is awkward (uses hold space; advanced). For complex cases, switch to:

- **`awk`** — for column-based or multi-field logic.
- **Python script.** For complex multi-line transformations, a 10-line script is clearer.
- **`perl -pe`.** Drop-in sed replacement with PCRE.

```
$ perl -pe 's/(\w+)/[$1]/g' file.txt       # PCRE-power substitution
```

## sed in pipelines

The natural fit:

```
$ cat config.yaml | sed 's/env: dev/env: prod/' > prod-config.yaml
$ curl -s api.example.com/data | sed 's/"/'\''/g'  # swap quote types
$ kubectl get pods | sed '1d' | awk '{print $1}'   # skip header, get names
```

Stream → filter → stream → next tool.

## Mistakes to avoid

- **Default replaces only first occurrence per line.** Use `/g` for all.
- **macOS `-i` without backup arg.** Errors. Use `-i ''` or `-i.bak`.
- **Regex specials unescaped.** `.`, `*`, `[`, `]`, `(`, `)` are special. Escape with `\` or use `-F`-equivalent (sed doesn't have one; use `\Q`/`\E` in Perl).
- **No preview before -i.** Test without `-i` first. Always.

## Summary

- `sed s/pattern/replacement/flags` is the workhorse substitution.
- Add `/g` for all occurrences per line, `/i` for case-insensitive.
- `-i` edits in place (with macOS gotcha).
- Choose a delimiter that doesn't conflict (`|`, `#`).
- Capture groups with `()` and `\1` references (need `-E` for unescaped).
- Multi-line / complex logic → use awk or Python instead.

Next: awk for structured text.
