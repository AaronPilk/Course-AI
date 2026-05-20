---
module: 4
position: 3
title: "Error handling: set -euo pipefail and traps"
objective: "Write scripts that fail loudly and clean up after themselves."
estimated_minutes: 6
---

# Error handling: set -euo pipefail and traps

## The bash strict mode

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
```

Four lines that turn fragile bash into something resembling a sane language. Make them habit.

### set -e: exit on error

Default bash continues even when commands fail:

```bash
cd /nonexistent          # fails
rm -rf *                 # runs anyway — possibly catastrophic
```

With `set -e`, the script aborts at the first non-zero exit code. Sane default.

Exceptions where `-e` doesn't apply:

- Commands in conditions: `if cmd; then ...` — `-e` ignored here intentionally.
- Commands followed by `||`: `cmd1 || cmd2` — runs cmd2 if cmd1 fails, doesn't abort.
- Pipelines without pipefail — only last command's exit code matters.

To explicitly allow a command to fail:

```bash
some_command || true     # always succeed
```

### set -u: error on unset variables

```bash
echo "$undefined_var"    # without -u: prints empty string
# with -u: error and abort
```

Catches typos. With `-u`, `rm -rf $TMP/` becomes an immediate error if TMP is unset — instead of silently becoming `rm -rf /`.

To allow optional variables, provide a default:

```bash
echo "${MAYBE_VAR:-default}"
```

### set -o pipefail

```bash
false | true             # without pipefail: success (last cmd 'true' succeeded)
                         # with pipefail: failure (first cmd 'false' failed)
```

Without pipefail, failures in the middle of a pipeline are silently swallowed. With it, the pipeline returns the exit code of the rightmost command to fail.

### IFS=$'\n\t'

Default IFS (input field separator) is space + tab + newline. Setting it to newline+tab (no space) means filenames with spaces won't split during word splitting.

For most scripts, this is safer. For scripts that intentionally process whitespace-separated lists, restore IFS as needed.

## traps for cleanup

```bash
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# ... work using $TMP ...
```

The `EXIT` pseudo-signal fires whenever the script exits, regardless of cause — success, error, Ctrl-C. Perfect for cleanup.

Multiple traps:

```bash
cleanup() {
    rm -rf "$TMP"
    echo "Bot shut down"
}

trap cleanup EXIT
trap 'echo "Caught SIGINT"; exit 130' SIGINT
trap 'echo "Caught SIGTERM"; exit 143' SIGTERM
```

Trap before doing work — once your script aborts mid-function from set -e, the cleanup needs to be registered.

## Error checking with ||

```bash
# Run cmd or die with a message
cmd || { echo "cmd failed"; exit 1; }

# Run cmd or set a default
result=$(cmd 2>/dev/null) || result="default"

# Skip if missing
[[ -f config.yml ]] || { echo "config.yml missing"; exit 1; }
```

The `||` pattern lets you handle specific failures without disabling set -e.

## Validating inputs

```bash
if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <input> <output>"
    exit 1
fi

input="$1"
output="$2"

[[ -f "$input" ]] || { echo "Input file not found: $input"; exit 1; }
[[ -w "$(dirname "$output")" ]] || { echo "Output dir not writable"; exit 1; }
```

Fail fast and helpfully — describe what went wrong, the script's name, expected arguments.

## Logging

For non-trivial scripts:

```bash
log() {
    echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')] $*" >&2
}

err() {
    echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')] ERROR: $*" >&2
}

log "Starting backup"
some_command || { err "Backup failed"; exit 1; }
log "Backup complete"
```

`>&2` redirects to stderr — keeps log output separate from data output for pipelines.

## stdout vs stderr

```bash
echo "data" >&1          # to stdout
echo "log" >&2           # to stderr

cmd > out.log 2> err.log # split
cmd > all.log 2>&1       # merge stderr into stdout
cmd &> all.log           # bash shorthand for both
cmd > /dev/null 2>&1     # discard everything
```

Output data on stdout (so it composes in pipelines); diagnostics on stderr.

## Debugging — set -x

```bash
set -x        # print each command before executing
# code...
set +x        # turn off
```

Or per-line:

```bash
( set -x; cmd; cmd; ) 2> debug.log
```

Or whole script:

```bash
bash -x script.sh
```

`-x` makes the script verbose — you see exactly what's being executed, including variable expansions. The fastest way to debug "why is this not working?" — the answer is usually obvious in the trace.

## Strict mode caveats

`set -e` has subtle behavior:

- Doesn't apply inside `if cond`, `while cond`, `cond1 || cond2`, `! cond`.
- May not apply in functions when the failure is in a context that's tested.
- Doesn't apply to commands whose exit code is captured: `result=$(cmd)` with cmd failing doesn't trigger -e by default.

These rules occasionally surprise. When debugging "why didn't set -e catch this?", check whether the failed command was in a tested context.

## Common pattern: file lock

```bash
LOCK=/var/run/myapp.lock

acquire_lock() {
    exec 200>"$LOCK"
    flock -n 200 || { echo "Already running"; exit 1; }
}

acquire_lock
trap 'rm -f "$LOCK"' EXIT

# ... actual work ...
```

`flock` is a kernel-level lock — robust against partial failures.

## Mistakes to avoid

- **No strict mode.** Errors silently continue.
- **Cleanup in main flow rather than trap.** Skipped on errors.
- **Logging to stdout.** Breaks pipelines that consume the script's data output.
- **No usage message.** User runs script wrong; no clue why.

## Summary

- `set -euo pipefail` + `IFS=$'\n\t'` makes bash strict.
- `trap cleanup EXIT` for guaranteed cleanup on any exit.
- `||` to handle specific failures without disabling set -e.
- Log to stderr (`>&2`); data to stdout.
- `set -x` (or `bash -x script.sh`) for debugging.
- Validate inputs at the top; fail fast with usage messages.

Next: practical scripts — parsing args, reading files, exit codes.
