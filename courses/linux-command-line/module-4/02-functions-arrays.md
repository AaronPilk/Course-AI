---
module: 4
position: 2
title: "Functions, arrays, command substitution"
objective: "Structure scripts with reusable pieces."
estimated_minutes: 6
---

# Functions, arrays, command substitution

## Functions

```bash
greet() {
    echo "Hello, $1"
}

greet Aaron        # Hello, Aaron
greet Linus        # Hello, Linus
```

Functions have no formal parameters — you reference arguments with `$1`, `$2`, etc. just like script arguments.

`$#` is the number of args; `$@` is all args.

```bash
sum() {
    local total=0
    for n in "$@"; do
        total=$((total + n))
    done
    echo "$total"
}

result=$(sum 1 2 3 4 5)
echo "$result"     # 15
```

`local` keeps variables function-scoped — otherwise they leak into the caller. Always use `local` for function variables.

## Returning values

Functions return via:

1. **Exit code** (`return N`). 0-255 only; for status, not data.
2. **Stdout** (`echo "value"` then capture with `$(...)`). For data.

```bash
is_even() {
    local n=$1
    if [ $((n % 2)) -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

if is_even 4; then echo "yes"; fi
```

Don't confuse `return` (function exit code) with `exit` (whole script). `exit` in a function kills the script.

## Arrays

```bash
fruits=("apple" "banana" "cherry")
echo "${fruits[0]}"             # apple
echo "${fruits[@]}"             # all items
echo "${#fruits[@]}"            # length

# Iterate
for f in "${fruits[@]}"; do
    echo "$f"
done

# Append
fruits+=("date")

# Splice
unset 'fruits[1]'               # remove banana
```

Always quote `"${array[@]}"` to preserve spaces in items.

Associative arrays (bash 4+):

```bash
declare -A user
user[name]="Aaron"
user[age]=37
echo "${user[name]}"

for key in "${!user[@]}"; do
    echo "$key: ${user[$key]}"
done
```

## Command substitution patterns

```bash
files=$(ls *.txt)                  # captures stdout
count=$(grep -c "ERROR" log.txt)
today=$(date +%Y-%m-%d)
pid=$(pgrep -f myapp)
```

Multi-line capture works but newlines collapse to spaces in unquoted context. Quote and use arrays for line-oriented data:

```bash
mapfile -t lines < file.txt        # read into array, one line per element
for line in "${lines[@]}"; do
    process "$line"
done
```

`mapfile` (also `readarray`) is the right way to read a file into an array.

## Parameter expansion

Bash has rich expansion syntax:

```bash
name="Linus Torvalds"

echo "${name:-Default}"         # value, or "Default" if unset
echo "${name:=Default}"         # value, or assign and use "Default"
echo "${name:?must be set}"     # value, or error if unset
echo "${name:+set}"             # "set" if name set, else nothing

# Length
echo "${#name}"                 # 14

# Substring
echo "${name:0:5}"              # "Linus"
echo "${name:6}"                # "Torvalds"

# Replace
echo "${name/Linus/Lina}"       # "Lina Torvalds" (first match)
echo "${name//s/S}"             # all matches

# Strip prefix/suffix
file="/path/to/file.txt"
echo "${file##*/}"              # "file.txt" (basename via strip longest match)
echo "${file%/*}"               # "/path/to" (dirname)
echo "${file%.*}"               # "/path/to/file" (strip extension)
```

These are pure bash — no subshell, no fork. Use them when you can.

## Numeric arithmetic with let or (())

```bash
let "x = 5 * 3"
echo "$x"                       # 15

((y = 10 + 2 * 3))
echo "$y"                       # 16

((count++))
echo "$count"
```

`((...))` is the modern way; supports `++`, `+=`, comparisons.

## Heredocs

For multi-line strings:

```bash
cat <<EOF
Hello, world.
This is a multi-line string.
Variables like $USER work.
EOF
```

`<<'EOF'` (quoted delimiter) disables variable expansion:

```bash
cat <<'EOF'
$USER stays literal.
EOF
```

Useful for embedded scripts, config templates.

## Read input

```bash
read -p "What's your name? " name
echo "Hello, $name"

# Hidden (passwords)
read -s -p "Password: " password
echo
```

```bash
# Read with default
read -p "Confirm? [y/N] " ans
ans=${ans:-N}
```

## Putting it together: a small script

```bash
#!/usr/bin/env bash
set -euo pipefail

# Backup files modified in the last N days
backup_recent() {
    local days="${1:-7}"
    local src="${2:-$HOME}"
    local dst="${3:-/backup}"
    
    if [[ ! -d "$dst" ]]; then
        mkdir -p "$dst"
    fi
    
    local files
    mapfile -t files < <(find "$src" -type f -mtime -"$days")
    
    echo "Found ${#files[@]} files. Backing up..."
    for file in "${files[@]}"; do
        local relative="${file#$src/}"
        local target="$dst/$relative"
        mkdir -p "$(dirname "$target")"
        cp "$file" "$target"
    done
    
    echo "Done."
}

backup_recent "$@"
```

`mapfile` + `find` + parameter expansion + `mkdir -p` for safety. Idiomatic bash.

## Mistakes to avoid

- **Forgetting `local`.** Function variables leak into the caller's scope.
- **Confusing `return` and `exit`.** `return` is for functions; `exit` kills the script.
- **Reading files with `cat | while`.** Subshell trap; use `while read; do done < file` instead.
- **No quoting around arrays.** `${array[@]}` without quotes splits on whitespace.

## Summary

- Functions take args as `$1`, `$2`; return via exit code or stdout.
- Use `local` inside functions.
- Arrays: `arr=(a b c)`, `${arr[@]}`, `${#arr[@]}`, `mapfile -t arr < file`.
- Parameter expansion: defaults, slicing, substitution, prefix/suffix strip.
- Heredocs for multi-line strings.
- `(( ))` for arithmetic.

Next: error handling with set -euo pipefail and traps.
