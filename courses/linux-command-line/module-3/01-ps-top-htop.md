---
module: 3
position: 1
title: "ps, top, htop — knowing your processes"
objective: "See what's running and how it's behaving."
estimated_minutes: 6
---

# ps, top, htop — knowing your processes

## ps — snapshot of processes

```
$ ps                                 # your processes in this terminal
$ ps aux                             # all processes, system-wide
$ ps -ef                             # alternative format (more verbose)
$ ps aux | grep python               # find python processes
$ ps -u aaron                        # processes by user
$ ps -o pid,user,%cpu,%mem,cmd       # custom columns
```

Most common: `ps aux` for "show me everything."

Output columns (`aux`):

- **USER** — owner of the process.
- **PID** — process ID.
- **%CPU** — CPU usage.
- **%MEM** — memory usage.
- **VSZ** — virtual memory size.
- **RSS** — resident set size (real memory).
- **TTY** — controlling terminal.
- **STAT** — state (R=running, S=sleeping, Z=zombie, etc.).
- **START** — when started.
- **TIME** — total CPU time used.
- **COMMAND** — the command line.

## top — live process view

```
$ top
```

Updates every couple seconds. Shows top resource consumers. Interactive: press `q` to quit, `k` to kill a PID, `M` to sort by memory, `P` by CPU, `1` to see per-core CPU.

## htop — modern top

```
$ htop
```

Colored, sortable by column header, scrollable, supports mouse. The standard upgrade. Install:

```
$ apt install htop
$ brew install htop
```

Use F-keys: F6 sort, F9 kill, F10 quit. Once you use htop, you don't go back.

## pgrep and pkill

Cleaner than `ps aux | grep`:

```
$ pgrep python                       # PIDs of python processes
$ pgrep -f myscript.py               # match against full command line
$ pkill python                       # kill all python processes
$ pkill -9 python                    # SIGKILL (force kill)
$ pkill -u aaron python              # only aaron's python processes
```

`-f` matches against the full command, not just the program name — useful when you want to target by argument.

## What's eating CPU?

```
$ top -o %CPU            # macOS sort by CPU
$ htop                   # then sort by CPU column
```

Hot processes appear at the top. Use this when the system feels slow.

## What's eating memory?

```
$ top -o %MEM            # macOS sort by mem
$ ps aux --sort -%mem | head -20
```

`-` in `--sort` reverses (highest first).

## free — memory overview

```
$ free -h
              total   used   free   shared  buff/cache  available
Mem:           16Gi   8.0Gi  2.0Gi  100Mi   6.0Gi       7.8Gi
Swap:          4.0Gi  0Bi    4.0Gi
```

- **total** — total physical memory.
- **used** — actually used by processes (not buffers).
- **free** — completely unused.
- **buff/cache** — OS disk cache; reusable if needed.
- **available** — what's actually available for new processes (used + cache that can be reclaimed).

Look at **available**, not **free**. Linux uses spare RAM for disk cache aggressively; "free" being low doesn't mean you're out of memory.

## uptime and loadavg

```
$ uptime
 14:32:15 up 7 days, 3:21, 2 users, load average: 0.45, 0.32, 0.28
```

The three load average numbers are 1, 5, and 15-minute averages of "tasks waiting to run." On an N-core machine, 1.0 per core is the "full but not saturated" point.

- < N: idle to busy.
- ≈ N: saturated.
- > N: overloaded, tasks queueing.

For a 4-core machine, load 2.0 is moderate; load 8.0 is dangerously overloaded.

## File descriptors and process tree

```
$ pstree                              # tree view of processes
$ pstree -p                           # with PIDs
$ pstree aaron                        # just aaron's processes
$ lsof -p $PID                        # files opened by process
$ lsof -i :8080                       # what's using port 8080
```

`lsof` is invaluable for "what's using this port" / "what files does this process have open."

## /proc — the kernel's interface

Every process has a directory in `/proc`:

```
$ ls /proc/1234/
cmdline    cwd    environ    fd/    limits    maps    status    ...
$ cat /proc/1234/status              # process info
$ cat /proc/1234/cmdline             # raw command (NUL-separated)
$ ls -l /proc/1234/fd/               # open files
```

Useful when you can't kill a process and need to know exactly what it's doing.

## CPU info, memory info

```
$ cat /proc/cpuinfo                  # CPU details
$ cat /proc/meminfo                  # memory details
$ nproc                              # number of cores
$ lscpu                              # CPU summary
```

## Realtime monitoring

For more sophisticated needs:

- **`glances`** — combined system overview.
- **`btop`** — modern fancy htop.
- **`iostat`** — per-disk I/O stats.
- **`vmstat`** — virtual memory stats.
- **`iftop` / `nethogs`** — network usage per process.

For most daily use, htop covers everything.

## Common diagnostic flows

**System feels slow:**

```
$ htop                  # what's hot? CPU or memory?
$ free -h               # is memory exhausted?
$ uptime                # how's load average?
$ iostat -xm 5          # disk i/o issues?
```

**Find a runaway process:**

```
$ ps aux --sort -%cpu | head -10
$ ps aux --sort -%mem | head -10
```

**What's using my port?**

```
$ lsof -i :8080
$ ss -tlnp                # all listening TCP ports
```

## Mistakes to avoid

- **Killing PID 1.** It's `init` / `systemd` — you can't, but trying produces drama. Don't.
- **`kill -9` first.** Use SIGTERM (15) first; -9 is last resort.
- **Reading 'free' instead of 'available' in `free -h`.** Linux uses spare RAM for disk cache; available is the real number.
- **Forgetting `-f` for pgrep when matching argument-based.** `pgrep python` matches only the process name 'python', not 'python myscript.py' for non-direct matches.

## Summary

- `ps aux` for snapshot; `htop` for interactive.
- `pgrep` / `pkill` cleaner than ps+grep.
- `free -h` for memory; `uptime` for load.
- `lsof` to see what files / ports a process uses.
- `/proc/$PID/*` is the kernel's window into each process.

Next: jobs, background, and nohup.
