---
module: 3
position: 3
title: "Signals: kill, trap, the lifecycle"
objective: "Send the right signal to the right process."
estimated_minutes: 6
---

# Signals: kill, trap, the lifecycle

## What signals are

Signals are small messages the kernel delivers to processes. Each has a name and a number. Common ones:

| Signal   | Number | Default behavior   | Used for                      |
|----------|--------|--------------------|--------------------------------|
| SIGHUP   | 1      | Terminate          | Terminal hung up               |
| SIGINT   | 2      | Terminate          | User pressed Ctrl-C            |
| SIGQUIT  | 3      | Terminate + core   | User pressed Ctrl-\            |
| SIGKILL  | 9      | Terminate          | Force kill — can't be caught   |
| SIGTERM  | 15     | Terminate          | Polite ask to terminate        |
| SIGSTOP  | 19     | Suspend            | Can't be caught                |
| SIGCONT  | 18     | Continue           | Resume after stop              |
| SIGUSR1/2| 10/12  | (custom)           | Application-defined            |

A process can catch most signals (via `trap` in shell scripts or signal handlers in code) and do something specific. Two it can't catch: SIGKILL (9) and SIGSTOP (19).

## kill — send a signal

```
$ kill PID                          # default: SIGTERM (15)
$ kill -TERM PID                    # explicit SIGTERM
$ kill -KILL PID                    # SIGKILL
$ kill -9 PID                       # same; numeric
$ kill -HUP PID                     # SIGHUP, often reloads config
$ kill -USR1 PID                    # custom signal
```

`kill -l` lists all signal names.

## The polite escalation

The standard escalation for stopping a process:

1. `kill PID` — sends SIGTERM. Most processes catch this and clean up: close files, flush buffers, exit. Wait 5-10 seconds.
2. `kill -9 PID` — sends SIGKILL. Process dies instantly, no cleanup, no chance to save state.

Always try SIGTERM first. SIGKILL leaves orphaned locks, half-written files, broken state. Reserved for processes that ignore SIGTERM (hung, deadlocked).

## Ctrl-C, Ctrl-Z, Ctrl-\

Keyboard shortcuts in the terminal send signals to the foreground process:

- **Ctrl-C** → SIGINT (interrupt).
- **Ctrl-Z** → SIGTSTP (suspend; recoverable with `fg` or `bg`).
- **Ctrl-\** → SIGQUIT (terminate with core dump).

These are programmable in `stty`, but the defaults are universal.

## What "can't be caught" means

SIGKILL kills the process unconditionally. The application has no opportunity to:

- Save state.
- Close files cleanly.
- Notify dependent services.
- Release locks.

This is why `kill -9` is the last resort. Many bugs trace to "we used SIGKILL and the database lock file wasn't cleaned up; restart hangs."

## kill -0 — is the process alive?

```
$ kill -0 PID                       # exits 0 if PID exists; 1 if not
```

Useful in scripts to check whether a process is still alive without actually signaling it.

## pkill — pattern-based

```
$ pkill firefox                     # SIGTERM to all firefox processes
$ pkill -9 -f "python myscript.py"  # SIGKILL matching the full command line
$ pkill -u aaron node               # only aaron's node processes
```

## killall — by name

```
$ killall firefox                   # SIGTERM all "firefox" processes
$ killall -9 chrome
```

`killall` matches exact process name; `pkill` matches patterns. Both are convenient when you know what you want gone.

## trap — handling signals in scripts

Bash scripts can catch signals via `trap`:

```bash
#!/bin/bash

cleanup() {
    echo "Cleaning up..."
    rm -f /tmp/myapp.lock
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# main work
while true; do
    sleep 1
done
```

When the script gets SIGINT (Ctrl-C) or SIGTERM, `cleanup` runs before exiting. `EXIT` is a pseudo-signal that fires on any exit — perfect for cleanup.

Common pattern: ensure temp files are removed even if the script crashes.

## Graceful shutdown in real applications

Production services should:

1. Receive SIGTERM.
2. Stop accepting new connections / requests.
3. Finish processing in-flight requests.
4. Close DB connections, file handles.
5. Exit with code 0.

Kubernetes, Docker, systemd, and most modern runtimes send SIGTERM before SIGKILL. Apps that handle SIGTERM well roll out cleanly; apps that don't get killed mid-request when the orchestrator gives up waiting.

In Python:

```python
import signal

def graceful_shutdown(signum, frame):
    print("shutting down")
    server.stop()
    sys.exit(0)

signal.signal(signal.SIGTERM, graceful_shutdown)
signal.signal(signal.SIGINT, graceful_shutdown)
```

In Node.js:

```javascript
process.on('SIGTERM', async () => {
    console.log('shutting down');
    await server.close();
    process.exit(0);
});
```

## Zombie processes

When a child process exits but the parent hasn't called `wait()` on it, the kernel keeps an entry for it — that's a zombie (Z status in ps).

Zombies hold a PID but no resources. Most worrying when many accumulate (parent has a bug not waiting on children). Fix: fix the parent. Killing the zombie doesn't help; only the parent reaping it works.

`ps aux | grep ' Z '` to find zombies.

## Orphans

If a parent dies before its children, the children become orphans and get adopted by `init` (PID 1, or systemd). Init reaps them when they exit. Orphans are normal; zombies whose parent is init are immediately cleaned.

## Mistakes to avoid

- **`kill -9` as the default.** Use SIGTERM first. SIGKILL leaves messes.
- **No signal handler in long-running services.** Container orchestrators send SIGTERM; you should handle it.
- **Killing PID 1.** Can't, but trying generates weird states.
- **Forgetting `trap` for cleanup in scripts.** Crashes leave temp files behind.

## Summary

- Signals are kernel messages to processes; names and numbers (SIGTERM=15, SIGKILL=9).
- `kill PID` defaults to SIGTERM; escalate to `-9` only if necessary.
- SIGKILL and SIGSTOP can't be caught; everything else can.
- `pkill`/`killall` for pattern/name matching.
- `trap cleanup SIGINT SIGTERM EXIT` in scripts for graceful cleanup.
- Production services should handle SIGTERM for graceful shutdown.

Next: systemd basics.
