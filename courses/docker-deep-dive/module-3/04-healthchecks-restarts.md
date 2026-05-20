---
module: 3
position: 4
title: "Healthchecks and restart policies"
objective: "Make containers self-healing."
estimated_minutes: 6
---

# Healthchecks and restart policies

## The simple version

Two operational features that make containers behave correctly under failure:

- **HEALTHCHECK**: a command Docker runs periodically to verify the container is actually healthy (not just alive).
- **Restart policy**: what Docker does when the container exits or fails healthchecks.

Combined: a service that genuinely runs, recovers from transient failures, and reports its real status.

## The technical version

### HEALTHCHECK

In the Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
```

Docker runs the command periodically inside the container. Exit 0 = healthy; non-zero = unhealthy. After N consecutive failures, container status becomes `unhealthy`.

Options:
- `--interval`: how often (default 30s).
- `--timeout`: max time per check (default 30s).
- `--start-period`: grace period for startup (default 0).
- `--retries`: failures before marking unhealthy (default 3).

Healthcheck status appears in `docker ps`, `docker inspect`, and (with appropriate restart policy) triggers recovery actions.

### What "healthy" means

The healthcheck command defines health. Good practice:
- Hit a `/health` endpoint that verifies key dependencies (DB connection, downstream service reachable).
- Keep it fast (<1s).
- Don't make it heavy (don't query the DB on every healthcheck).
- Return 200 only when actually ready to serve.

Distinction from Kubernetes' separation (readiness vs liveness): Docker has one healthcheck; if it fails, the container is unhealthy. Kubernetes uses Dockerfile HEALTHCHECK as a fallback but defines its own probes per Pod.

### Restart policies (recap)

`--restart` on `docker run`:

- **no** (default): no auto-restart.
- **on-failure[:N]**: restart on non-zero exit; optional retry count.
- **always**: restart no matter what.
- **unless-stopped**: restart unless manually stopped.

Restart policies handle process exits. Combined with healthchecks, you get a self-healing service: unhealthy container exits (or you script a restart on unhealthy status) and is restarted.

### When restart isn't enough

Restart loops happen when the app crashes immediately and the restart policy keeps relaunching. Docker has exponential backoff (10s, 20s, 40s, capped). After several failures, container is dead.

Inspect logs of the crashed container to find root cause; don't just keep restarting.

### Healthcheck in compose

In docker-compose.yml:

```yaml
services:
  api:
    image: myapp:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
```

Compose can wait for dependencies to be healthy before starting dependent services with `depends_on: condition: service_healthy`.

### Healthcheck pitfalls

- Heavy healthchecks load the DB → cascading failures.
- Healthcheck endpoint doesn't reflect real readiness (returns 200 before DB is connected).
- Start period too short → container marked unhealthy during slow startup.
- No healthcheck → can't tell if app is actually working.

## Summary

- HEALTHCHECK runs periodically; status visible in inspect/ps.
- Restart policy + healthcheck = self-healing.
- Hit a /health endpoint that verifies dependencies; keep it fast.
- Restart loops indicate root-cause issues, not infrastructure bugs.
