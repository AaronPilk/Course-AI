---
module: 4
position: 4
title: "Docker Compose — multi-container apps"
objective: "Define and run app stacks."
estimated_minutes: 6
---

# Docker Compose — multi-container apps

## The simple version

Docker Compose defines a multi-container application in a YAML file:

```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
    depends_on:
      - db
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: dev
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

`docker compose up` starts everything; `docker compose down` stops it. Each service gets a container; they share a custom bridge network with DNS, so `web` reaches `db` by name.

Compose is the standard for development environments and small single-host production deployments.

## The technical version

### Core concepts

A Compose file declares:

- **services**: containers to run.
- **networks**: custom networks (one is created by default).
- **volumes**: named volumes.
- **secrets**, **configs**: external config (less common).

Compose creates resources prefixed with the project name (directory name by default). `myapp_web_1`, `myapp_db_1`.

### Service definition

```yaml
services:
  api:
    image: myapp:latest         # or `build: ./api` to build locally
    build:
      context: ./api
      dockerfile: Dockerfile
      target: production         # multi-stage target
    container_name: my-api       # explicit name (rarely needed)
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db/myapp
    env_file:
      - .env
    ports:
      - "8080:80"
    volumes:
      - ./logs:/app/logs
    networks:
      - backend
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

### depends_on with condition

Just `depends_on: [db]` starts in order but doesn't wait for the dependency to be ready. With `condition: service_healthy`, Compose waits for the dependency's healthcheck to pass before starting this service.

For real readiness, define healthchecks on dependencies and depend on them with `service_healthy`.

### Networks

By default, Compose creates one bridge network for all services in the file; they reach each other by service name (`db`, `redis`, `api`).

For more isolation, define multiple networks:

```yaml
services:
  api:
    networks: [backend, frontend]
  db:
    networks: [backend]      # only backend
  nginx:
    networks: [frontend]     # only frontend
networks:
  backend:
  frontend:
```

API can talk to both DB (via backend) and NGINX (via frontend). DB and NGINX can't reach each other.

### Volumes

Named volumes survive `docker compose down`; ephemeral if anonymous. To remove volumes: `docker compose down -v`.

For development bind mounts:

```yaml
volumes:
  - ./src:/app/src         # source code for hot reload
  - ./node_modules:/app/node_modules  # if needed for some setups
```

### Environment-specific configs

Common pattern: base `docker-compose.yml` + overrides.

```
docker-compose.yml          # production-style base
docker-compose.override.yml # dev overrides (auto-loaded)
docker-compose.prod.yml     # production overrides
```

Compose merges them. `docker compose -f docker-compose.yml -f docker-compose.prod.yml up` for production.

### Build vs image

- `build: ./api`: builds image locally on `compose up --build`. Used in development.
- `image: myapp:v1.0`: pulls from registry. Used in production.

Some setups use both: `build` for local dev, `image` from CI for production.

### Compose for production?

Compose works for small single-host production deployments. Limitations: no auto-scaling, single host, no rolling updates (sort of — docker compose up replaces containers but isn't a true rolling deploy).

For real production scale, Kubernetes or Nomad. For development environments, small services, demos, and pet-project hosting: Compose is fine.

### Useful commands

```
docker compose up -d         # start in background
docker compose logs -f api   # follow logs of one service
docker compose ps            # status
docker compose exec api bash # shell in running api
docker compose run api npm test  # one-off command
docker compose down          # stop and remove
docker compose down -v       # also remove volumes
docker compose build         # rebuild images
docker compose pull          # update images
```

### Profiles

Optional services that only start with a profile:

```yaml
services:
  mailhog:
    image: mailhog/mailhog
    profiles: [dev]
```

`docker compose --profile dev up` includes mailhog; without the profile, mailhog is skipped. Useful for dev-only services (mock email, debugger UIs).

### Common compose gotchas

- **depends_on without condition**: containers start in order but app may crash because dependency isn't ready.
- **No healthcheck**: can't use service_healthy condition.
- **Hardcoded passwords**: use env files; don't commit.
- **Production volumes outside Compose project**: easier ops to manage them externally (or use external volume references).

## Summary

- Compose YAML defines services, networks, volumes.
- Services find each other by name on the default network.
- `depends_on: condition: service_healthy` for real readiness.
- Bind mounts for dev source; named volumes for data.
- Compose works for dev + small single-host production; K8s for scale.
