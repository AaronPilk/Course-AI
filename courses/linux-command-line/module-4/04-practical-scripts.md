---
module: 4
position: 4
title: "Practical scripts: parse args, read files, exit codes"
objective: "Real-world bash patterns you'll reuse."
estimated_minutes: 6
---

# Practical scripts: parse args, read files, exit codes

## Argument parsing — the simple version

For 1-3 positional args, just check them:

```bash
#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<EOF
Usage: $0 <input-file> <output-dir>

Process input file and write results to output directory.
EOF
    exit 1
}

[[ $# -lt 2 ]] && usage

input="$1"
output_dir="$2"
```

## Argument parsing — with flags using getopts

```bash
#!/usr/bin/env bash
set -euo pipefail

verbose=false
output=""

usage() {
    echo "Usage: $0 [-v] [-o file] <input>"
    exit 1
}

while getopts ":vo:h" opt; do
    case "$opt" in
        v) verbose=true ;;
        o) output="$OPTARG" ;;
        h) usage ;;
        \?) echo "Invalid option: -$OPTARG"; usage ;;
        :) echo "Missing argument for -$OPTARG"; usage ;;
    esac
done

shift $((OPTIND - 1))

[[ $# -eq 0 ]] && usage
input="$1"
```

`getopts` is built into bash; handles short flags well. For long flags (`--output`), use `getopt` (GNU) or roll your own:

```bash
while [[ $# -gt 0 ]]; do
    case "$1" in
        -v|--verbose) verbose=true; shift ;;
        -o|--output) output="$2"; shift 2 ;;
        -h|--help) usage ;;
        --) shift; break ;;
        -*) echo "Unknown option: $1"; usage ;;
        *) break ;;
    esac
done

# Remaining args are positional
input="${1:-}"
```

The case-based loop handles both short and long flags. Standard pattern.

## Reading files line by line

The right way:

```bash
while IFS= read -r line; do
    echo "got: $line"
done < input.txt
```

- `IFS=` prevents trimming leading/trailing whitespace.
- `-r` prevents backslash interpretation.
- `< input.txt` provides input to the loop (NOT `cat input.txt | while`, which spawns subshell).

For CSV:

```bash
while IFS=',' read -r name age city; do
    echo "$name is $age and lives in $city"
done < data.csv
```

For an array of lines:

```bash
mapfile -t lines < input.txt
echo "Read ${#lines[@]} lines"
```

## Reading stdin

A script can be used in a pipe:

```bash
#!/usr/bin/env bash
while IFS= read -r line; do
    echo "PROCESSING: $line"
done
```

```bash
$ ls | ./script.sh
```

For both file and stdin (read from file if given, else stdin):

```bash
input="${1:-/dev/stdin}"
while IFS= read -r line; do
    process "$line"
done < "$input"
```

## Exit codes — conventions

Conventional exit codes:

- **0** — Success.
- **1** — General error.
- **2** — Misuse (bad args, missing file).
- **126** — Cannot execute (permission denied).
- **127** — Command not found.
- **128 + N** — Killed by signal N (so 130 = killed by SIGINT/Ctrl-C, 143 = SIGTERM).
- **64-78** — sysexits.h reserves these for specific conditions.

Set your script's exit code on the way out:

```bash
exit 0     # success
exit 1     # general error
exit 64    # usage error
```

If your script is run from CI or another script, the exit code is how the caller knows what happened.

## Logging template

```bash
#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_NAME=$(basename "$0")

log() {
    local level="$1"
    shift
    echo "$(date -Iseconds) [$level] $SCRIPT_NAME: $*" >&2
}

info() { log INFO "$@"; }
warn() { log WARN "$@"; }
error() { log ERROR "$@"; }
fatal() { log FATAL "$@"; exit 1; }

info "Starting"
[[ -f input.txt ]] || fatal "Missing input.txt"
info "Processing"
# ...
info "Done"
```

## Dry-run flag

For scripts that do destructive things, support a dry-run mode:

```bash
DRY_RUN=false

run() {
    if [[ "$DRY_RUN" == true ]]; then
        echo "DRY-RUN: $*"
    else
        "$@"
    fi
}

while getopts ":n" opt; do
    case "$opt" in
        n) DRY_RUN=true ;;
    esac
done

run rm -rf /tmp/old
run mv /var/log/app.log /var/log/app.log.1
```

Pass any command through `run` — destructive only in non-dry-run mode.

## Idempotent scripts

A good script can be re-run without breaking. Example:

```bash
# Bad — fails if directory exists
mkdir /opt/myapp

# Good — works either way
mkdir -p /opt/myapp

# Bad — fails if user exists
useradd myapp

# Good — check first
if ! id myapp &>/dev/null; then
    useradd myapp
fi
```

Idempotent scripts can be safely retried, scheduled, and run in CI without surprise.

## Worked example — backup script

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

readonly SCRIPT_NAME=$(basename "$0")
readonly SOURCE="$HOME/important"
readonly DEST="${BACKUP_DEST:-/backup}"
readonly TIMESTAMP=$(date +%Y%m%d_%H%M%S)
readonly ARCHIVE="$DEST/backup-$TIMESTAMP.tar.gz"

log() { echo "$(date -Iseconds) $SCRIPT_NAME: $*" >&2; }

main() {
    [[ -d "$SOURCE" ]] || { log "Source missing: $SOURCE"; exit 1; }
    mkdir -p "$DEST"
    
    log "Creating $ARCHIVE"
    tar -czf "$ARCHIVE" -C "$(dirname "$SOURCE")" "$(basename "$SOURCE")"
    
    log "Pruning backups older than 7 days"
    find "$DEST" -name "backup-*.tar.gz" -mtime +7 -delete
    
    log "Done. Created $(du -h "$ARCHIVE" | cut -f1)"
}

main "$@"
```

What it has: strict mode, named constants, log function, validation, idempotent (mkdir -p), cleanup of old backups, helpful output.

## When bash isn't the right tool

Switch to Python (or similar) when:

- The script grows past ~200 lines.
- You need real data structures (dicts, classes).
- You need cross-platform behavior.
- You need to call APIs.
- Multi-process orchestration with logic gets complex.

Bash is great for "glue between commands and config." For anything more, a real language is clearer.

## Mistakes to avoid

- **No usage message.** Users get cryptic errors instead of help.
- **Reading file via `cat | while`.** Subshell traps variables.
- **Magic numbers for exit codes.** Use the conventions; document yours.
- **Non-idempotent scripts.** Can't safely retry.
- **No dry-run for destructive ops.** "Oh I shouldn't have run that."

## Summary

- `getopts` for short flags; case-loop for short + long.
- Read files with `while IFS= read -r line; do; done < file`, not `cat | while`.
- Use stderr for logs, stdout for data.
- Exit code conventions: 0 success, 1 general error, 2 misuse.
- Idempotent + dry-run for production scripts.
- For complex logic > 200 lines, switch to Python.

Module 4 complete. Next: SSH, networking, package managers.
