---
module: 3
position: 3
title: "Logs, signals, and shutdown"
objective: "Handle container output and termination cleanly."
estimated_minutes: 6
---

# Logs, signals, and shutdown

## The simple version

Two operational essentials:

- **Logs**: containers should write to stdout/stderr. A log driver captures and ships them. Don't write to files inside the container (ephemeral; hard to aggregate).
- **Signals**: containers must handle SIGTERM. Without it, every restart drops in-flight requests.

PID 1 has special signal semantics in Linux. If your app isn't PID-1-aware, use `--init` to add a tiny init process that handles the kernel's expectations.

## The technical version

### Logging

12-factor: write to stdout/stderr. Docker's log driver captures the streams; you don't manage log files inside the container.

Drivers:

- **json-file** (default): writes JSON to disk on the host.
- **journald**: systemd journal.
- **fluentd, awslogs, gcplogs, syslog**: ship to external.
- **none**: discard (rarely correct).

Configure per-container with `--log-driver` and `--log-opt`, or set defaults in the daemon config.

`docker logs container` works for json-file and journald. For external drivers, query the destination.

**Always set rotation** for json-file:

```
docker run --log-opt max-size=10m --log-opt max-file=3 ...
```

Without rotation, busy containers fill disks.

### Signals

A graceful shutdown sequence:

1. Orchestrator (Docker, K8s) sends SIGTERM to PID 1.
2. App stops accepting new requests.
3. App finishes in-flight requests.
4. App closes connections, flushes buffers, exits.
5. Orchestrator records clean exit.

If the app doesn't exit within grace period (default 10s for `docker stop`), SIGKILL.

Apps must implement step 2-4. In most languages: signal handler that triggers shutdown logic.

### PID 1 problems

Linux kernel treats PID 1 specially:

- PID 1 reaps zombie children (or they leak).
- PID 1 receives signals only if explicit handlers are installed (no default actions).

Apps not written as init programs may:

- Leak zombies (eventually fork failures).
- Ignore signals because default handlers don't fire on PID 1.

Fix: `docker run --init` adds tini as PID 1; tini reaps zombies and forwards signals to your app. Or use a language-specific init wrapper. In Kubernetes, the pause container handles PID 1; your app is a normal child.

For node, python, java: `--init` is recommended.

### STOPSIGNAL

By default, Docker sends SIGTERM. Some apps prefer different signals (e.g., NGINX wants SIGQUIT for graceful):

```dockerfile
STOPSIGNAL SIGQUIT
```

Match the signal your app expects for clean shutdown.

### Pre-stop hooks

Docker doesn't have native pre-stop hooks; Kubernetes does. For Docker-only deploys, handle pre-shutdown in the app itself (trap SIGTERM, deregister from LB, sleep briefly, then exit).

### Real-world checklist

For production containers:

- Write logs to stdout/stderr.
- Configure log rotation.
- Handle SIGTERM in the app.
- Set `--stop-timeout` longer than slowest reasonable request.
- Use `--init` if PID-1-unaware.
- Use STOPSIGNAL if app expects non-SIGTERM.

## Common mistakes

- Writing logs to files inside the container.
- Ignoring SIGTERM in app code.
- No log rotation → disk fills.
- Forgetting `--init` for non-init apps → zombies, ignored signals.

## Summary

- Stdout/stderr + log driver = standard logging.
- SIGTERM handling + grace period = graceful shutdown.
- `--init` for apps not designed for PID 1.
- STOPSIGNAL for apps wanting non-SIGTERM.
