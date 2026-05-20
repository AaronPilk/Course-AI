---
module: 3
position: 4
title: "systemd basics — services that survive reboot"
objective: "Manage services on modern Linux."
estimated_minutes: 6
---

# systemd basics — services that survive reboot

## What systemd is

systemd is the init system on virtually every modern Linux distro since ~2015 (Ubuntu, Debian, Fedora, RHEL, Arch). It's PID 1; it starts and supervises everything else.

You interact with it through `systemctl`. Key tasks: start/stop services, enable them at boot, check status, view logs.

## Service status

```
$ systemctl status nginx
● nginx.service - A high performance web server and reverse proxy
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-05-15 09:30:21 UTC; 2h ago
       PID: 1234 (nginx)
     Tasks: 5 (limit: 4915)
    Memory: 12.4M
```

Reads:
- **active (running)** — currently up.
- **enabled** — starts at boot.
- **Loaded** — where the unit file is.

## Start, stop, restart, reload

```
$ sudo systemctl start nginx
$ sudo systemctl stop nginx
$ sudo systemctl restart nginx
$ sudo systemctl reload nginx        # config reload without full restart
```

`reload` works only if the service supports it (most do for config changes; not for code changes).

## Enable / disable — boot behavior

```
$ sudo systemctl enable nginx        # start at boot
$ sudo systemctl disable nginx       # don't
$ sudo systemctl is-enabled nginx
```

`enable --now` does both enable + start in one command:

```
$ sudo systemctl enable --now nginx
```

## Listing services

```
$ systemctl list-units --type=service              # all loaded
$ systemctl list-units --type=service --state=running
$ systemctl list-unit-files --type=service         # all defined (loaded or not)
$ systemctl list-units --failed                    # failed services
```

## Writing a service

Create `/etc/systemd/system/myapp.service`:

```ini
[Unit]
Description=My App
After=network.target

[Service]
Type=simple
User=myapp
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/bin/start
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Then:

```
$ sudo systemctl daemon-reload                     # tell systemd to read new file
$ sudo systemctl enable --now myapp
$ systemctl status myapp
```

Key fields:

- **Type=simple** — process runs in foreground; systemd considers it started immediately.
- **Type=forking** — process forks and parent exits; systemd waits for PID file.
- **Type=notify** — process sends `READY=1` via sd_notify when ready.
- **User=** — run as a specific user.
- **WorkingDirectory=** — cwd.
- **ExecStart=** — the command (absolute path).
- **Restart=** — `no`, `on-failure`, `always`. Almost always `on-failure`.
- **RestartSec=** — wait before restart.

## Logs via journalctl

systemd captures stdout/stderr of services:

```
$ journalctl -u myapp                          # all logs for myapp service
$ journalctl -u myapp -f                       # follow (live tail)
$ journalctl -u myapp --since "10 min ago"
$ journalctl -u myapp --since "2026-05-15"
$ journalctl -u myapp -p err                   # priority error and above
$ journalctl -u myapp -n 100                   # last 100 lines
$ journalctl -u myapp --no-pager
```

journalctl is structured. Each entry has metadata (timestamp, service, priority, host). Queryable in ways plain log files aren't.

## When journalctl fills the disk

journal can grow. Limit it:

```
$ sudo journalctl --vacuum-size=500M           # keep only 500MB
$ sudo journalctl --vacuum-time=30d            # keep only 30 days
```

Or configure in `/etc/systemd/journald.conf`:

```ini
SystemMaxUse=500M
MaxRetentionSec=30d
```

## Failed services

```
$ systemctl list-units --failed
```

For each, `systemctl status` and `journalctl -u` tell you why.

```
$ sudo systemctl reset-failed myapp            # clear the "failed" state
$ sudo systemctl restart myapp
```

## Service files for your own apps

Production deployment pattern:

1. Build a binary or arrange your code in `/opt/myapp/`.
2. Write `/etc/systemd/system/myapp.service` with appropriate User, ExecStart, Restart.
3. `daemon-reload`, `enable --now`.
4. `journalctl -u myapp -f` to watch logs.

Far better than `nohup + screen + manual restart` for anything that needs to outlive a reboot or recover from crash.

## Timer units (cron alternative)

systemd timers replace cron with more power:

`/etc/systemd/system/backup.service`:

```ini
[Unit]
Description=Daily Backup

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
```

`/etc/systemd/system/backup.timer`:

```ini
[Unit]
Description=Daily Backup Timer

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```
$ sudo systemctl enable --now backup.timer
$ systemctl list-timers
```

`Persistent=true` — if the system was off when the scheduled time passed, run on next boot. Cron can't do this cleanly.

`OnCalendar=` supports rich expressions: `weekly`, `hourly`, `Mon..Fri 09:00`, `*-*-1 02:00:00` (every 1st at 2 AM).

## User services (no sudo needed)

For things in your own home:

```
$ systemctl --user start syncthing
$ systemctl --user enable syncthing
```

Unit files go in `~/.config/systemd/user/`. Useful for personal services without root.

## Mistakes to avoid

- **Editing unit file without `daemon-reload`.** systemd doesn't pick up changes automatically.
- **No `Restart=on-failure`.** Service dies, doesn't come back. Always set restart for production.
- **Reading `/var/log/`.** Many distros now use journald primarily; check `journalctl -u service` first.
- **Stopping without disabling.** Service comes back at boot.
- **Not handling SIGTERM.** systemd sends SIGTERM before SIGKILL; apps that don't handle it get killed mid-request.

## Summary

- systemd is PID 1 on modern Linux. `systemctl` is your interface.
- start, stop, restart, reload + status + enable/disable for managing services.
- Write `.service` files in `/etc/systemd/system/`; `daemon-reload` to register.
- `journalctl -u service -f` for live logs.
- Timer units replace cron with `Persistent=true` and rich scheduling.
- For production, systemd service + `Restart=on-failure` beats nohup + manual restart.

Module 3 complete. Next: shell scripting fundamentals.
