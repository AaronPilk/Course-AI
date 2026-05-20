---
module: 3
position: 2
title: "Jobs, background, nohup, &"
objective: "Run things in the background and keep them alive."
estimated_minutes: 6
---

# Jobs, background, nohup, &

## Foreground vs background

A foreground process owns your terminal — you wait for it to finish before you can type more commands. A background process runs while you keep working.

```
$ sleep 10                          # foreground — terminal blocked 10 sec
$ sleep 10 &                        # background — terminal free
[1] 12345                           # job number and PID
```

`&` at the end pushes the command to background.

## Job control

```
$ jobs                              # list background jobs in this shell
[1]+ Running    sleep 100 &
[2]-  Stopped   vim file.txt

$ fg                                # bring most recent back to foreground
$ fg %1                             # bring job 1 to foreground
$ bg %2                             # resume stopped job in background
$ kill %1                           # kill job 1
```

`Ctrl-Z` suspends the foreground process (Stopped). `fg` resumes in foreground; `bg` resumes in background.

## nohup — survive logout

```
$ nohup command &
nohup: ignoring input and appending output to 'nohup.out'
```

`nohup` (no hang-up) ignores the HUP signal sent when your terminal closes. The process keeps running after you log out.

By default, output goes to `nohup.out`. Redirect explicitly:

```
$ nohup my-script.sh > my-script.log 2>&1 &
```

## disown — detach a job

If you forgot `nohup` and need to log out:

```
$ long_running_command &
$ disown
$ exit                              # process keeps running
```

`disown` removes the job from the shell's job table so the shell doesn't try to kill it on exit.

## screen and tmux — the right tool for the job

For real long-running work, use a terminal multiplexer:

**tmux:**

```
$ tmux                              # start a session
# ... work ...
# Ctrl-b then d                     # detach

$ tmux ls                           # list sessions
$ tmux attach                       # reattach
$ tmux attach -t session_name       # specific session
```

Inside tmux: Ctrl-b is the prefix. Ctrl-b % splits vertically; Ctrl-b " splits horizontally; Ctrl-b arrow keys to navigate panes; Ctrl-b c creates a new window; Ctrl-b 0-9 switches windows.

**screen:**

```
$ screen
# Ctrl-a then d                     # detach
$ screen -r                         # reattach
```

Same idea, slightly different keys. Most modern setups prefer tmux.

When SSHing to a server, `tmux` or `screen` is mandatory — your shell will outlast the network connection.

## Redirection — keeping output sane

By default, a background process still writes to your terminal:

```
$ command &
output mixed with your typing — annoying
```

Redirect output to a file:

```
$ command > out.log 2>&1 &
$ command >> out.log 2>&1 &           # append
$ command 2> err.log > out.log &       # separate files
$ command > /dev/null 2>&1 &           # discard
```

`>` for stdout, `2>` for stderr, `&>` for both (bash), `2>&1` to merge stderr into stdout.

## Time and timeout

```
$ time command                       # show how long a command takes
$ timeout 10 command                 # kill after 10 seconds
```

`time` prints real, user, and sys times after the command finishes:

```
$ time make
real    1m23.456s
user    0m45.123s
sys     0m5.678s
```

- **real** — wall clock.
- **user** — CPU time in user mode.
- **sys** — CPU time in kernel mode.

For multi-core, user+sys can exceed real (parallelism).

## Cron — scheduled jobs

For things that run repeatedly:

```
$ crontab -e                         # edit your cron table
```

Lines are:

```
* * * * * command
| | | | |
| | | | day of week (0-7, 0/7=Sunday)
| | | month (1-12)
| | day of month (1-31)
| hour (0-23)
minute (0-59)
```

Examples:

```
0 6 * * *       /usr/local/bin/backup.sh      # daily at 6 AM
*/15 * * * *    /opt/script.sh                # every 15 minutes
0 0 1 * *       /usr/bin/rotate-logs.sh       # monthly on 1st at midnight
```

Cron sends mail on output by default; pipe to log to avoid:

```
0 6 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
```

## systemd timers — cron alternative

For modern distros:

```
$ systemctl list-timers
$ systemctl status backup.timer
```

systemd timers are more powerful than cron (precise schedules, dependencies, calendaring) but more complex to configure. Cron is fine for simple needs.

## at — one-shot scheduling

For "run this once at a specific time":

```
$ echo "/usr/bin/backup.sh" | at 23:00
$ atq                                # list pending
$ atrm 5                             # remove job 5
```

Less common than cron; useful for ad-hoc.

## Mistakes to avoid

- **Forgetting redirection on background processes.** Output garbles your terminal.
- **Running long jobs without tmux on SSH.** Connection drops → job dies.
- **`&` without `nohup`/`disown` then logging out.** Job dies.
- **Cron job assumes interactive shell.** Cron runs with a minimal environment; export variables explicitly.

## Summary

- `&` to background; `fg`/`bg`/`jobs` for control; `Ctrl-Z` to suspend.
- `nohup` or `disown` to outlive the shell.
- `tmux` for real long-running / SSH work — practically mandatory.
- Always redirect output for background processes.
- `cron` for scheduled jobs; `systemd timers` as the modern alternative.

Next: signals — kill, trap, the process lifecycle.
