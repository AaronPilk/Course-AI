---
module: 4
position: 1
title: "Variables, conditionals, loops"
objective: "The basic building blocks of shell scripts."
estimated_minutes: 6
---

# Variables, conditionals, loops

## A script is just commands in a file

```bash
#!/bin/bash
echo "Hello"
ls /tmp
date
```

Save as `script.sh`, `chmod +x script.sh`, run with `./script.sh`. The `#!/bin/bash` line (the **shebang**) tells the OS which interpreter to use.

For zsh: `#!/bin/zsh`. For POSIX-compliant: `#!/bin/sh`. For maximum portability: `#!/usr/bin/env bash` (finds bash via PATH; works on systems where bash isn't in /bin).

## Variables

```bash
name="Aaron"
greeting="Hello"
echo "$greeting, $name"               # Hello, Aaron
```

Rules:
- **No spaces around `=`.** `x=5`, not `x = 5`.
- **Quote when used.** `"$name"` not `$name` — prevents word splitting.
- **Curly braces for clarity.** `${name}_file` to delimit the variable name.

```bash
$ count=10
$ echo "$count things"                # 10 things
$ echo "${count}x more"               # 10x more (without braces, parses as $countx)
```

## Command substitution

```bash
files=$(ls *.txt)                     # captures output
date_str=$(date +%Y-%m-%d)
host=$(hostname)
```

`$(...)` runs the command; the result becomes the variable's value. Older syntax uses backticks (`` `cmd` ``); prefer `$()` — nestable, cleaner.

## Arithmetic

```bash
$ x=5
$ y=$((x + 3))                        # 8
$ z=$((x * y))                        # 40
$ echo $((y / 2))                     # 4 (integer division)
```

`$((...))` evaluates arithmetic. For floats, use `bc`:

```bash
$ result=$(echo "scale=2; 22 / 7" | bc)    # 3.14
```

## If statements

```bash
if [ "$name" = "Aaron" ]; then
    echo "Hi Aaron"
elif [ "$name" = "Linus" ]; then
    echo "Hi Linus"
else
    echo "Who are you?"
fi
```

Spaces around `[` and `]` are mandatory. Quote variables. Comparison operators:

| Test | Meaning |
|------|---------|
| `[ -f path ]` | File exists |
| `[ -d path ]` | Directory exists |
| `[ -e path ]` | Path exists (any type) |
| `[ -z str ]` | String is empty |
| `[ -n str ]` | String non-empty |
| `[ str1 = str2 ]` | Strings equal |
| `[ str1 != str2 ]` | Strings unequal |
| `[ num1 -eq num2 ]` | Numbers equal |
| `[ num1 -lt num2 ]` | Less than |
| `[ num1 -gt num2 ]` | Greater than |
| `[ num1 -le num2 ]` | <= |
| `[ num1 -ge num2 ]` | >= |

`[[ ... ]]` (double brackets, bash-specific) is more lenient:

```bash
if [[ "$name" == "Aaron" ]]; then     # == also works
if [[ "$file" =~ \.txt$ ]]; then      # regex match
if [[ -f "$path" && -r "$path" ]]; then  # logical AND inside
```

For new scripts, use `[[ ]]` over `[ ]`. Better readability, fewer gotchas, regex support.

## For loops

```bash
for fruit in apple banana cherry; do
    echo "$fruit"
done

for file in *.txt; do
    echo "Processing $file"
done

for i in {1..10}; do
    echo "Iteration $i"
done

for i in $(seq 1 100); do
    echo "$i"
done
```

C-style for:

```bash
for ((i = 0; i < 10; i++)); do
    echo "$i"
done
```

## While loops

```bash
count=0
while [ $count -lt 5 ]; do
    echo "$count"
    count=$((count + 1))
done

# Read a file line by line
while IFS= read -r line; do
    echo "got: $line"
done < input.txt
```

The file-reading idiom is the standard way; `IFS=` prevents trimming whitespace, `-r` prevents backslash interpretation.

## Until loops

```bash
until [ -f /tmp/ready ]; do
    echo "Waiting..."
    sleep 1
done
```

Same as while, but condition is inverted (loop while NOT true).

## Case statements

```bash
case "$1" in
    start)
        echo "starting"
        ;;
    stop)
        echo "stopping"
        ;;
    restart|reload)
        echo "restarting"
        ;;
    *)
        echo "unknown command"
        exit 1
        ;;
esac
```

Each pattern can be a glob (`*`, `?`, `[…]`). The `|` separates alternatives. `*)` is the default case.

## Exit codes

Every command returns an exit code: 0 = success, non-zero = failure.

```bash
ls /nonexistent
echo $?                              # 2 (typical for "not found")

if some_command; then
    echo "succeeded"
else
    echo "failed with code $?"
fi
```

`$?` holds the last exit code. Scripts should exit 0 on success, non-zero on failure — let the caller distinguish.

## Common bash quirks

- **No spaces in assignment.** `x=5`, not `x = 5`.
- **Quote variables.** `"$x"` not `$x`. Especially in paths and tests.
- **`==` only works inside `[[ ]]`.** In `[ ]`, use `=`.
- **`[` is actually a command** (the `test` command). That's why spaces matter.
- **Arrays are bash-specific.** sh / dash don't have them.

## Hello world with realistic safety

```bash
#!/usr/bin/env bash
set -euo pipefail

NAME="${1:-World}"
echo "Hello, $NAME"
```

- `#!/usr/bin/env bash` — portable shebang.
- `set -e` — exit on any error.
- `set -u` — error on unset variables.
- `set -o pipefail` — fail if any pipe component fails.
- `"${1:-World}"` — first arg, default "World".

These four lines make your scripts dramatically more reliable. Make them habit.

## Mistakes to avoid

- **Unquoted variables.** Word splitting and glob expansion break things. Always quote.
- **`set -e` not used.** Scripts barrel through errors.
- **Comparing strings with `-eq`.** That's for numbers.
- **Spaces around `=` in assignment.** Causes "command not found" errors.

## Summary

- Shebang line picks the interpreter.
- Quote variables; no spaces around `=`.
- `$(cmd)` for command substitution; `$((expr))` for arithmetic.
- `if [[ cond ]]; then ... fi`; `for x in list; do ... done`; `while cond; do ... done`.
- `case` for branching on patterns.
- `$?` for exit code; scripts should set theirs consciously.
- `set -euo pipefail` at the top of every script.

Next: functions, arrays, command substitution.
