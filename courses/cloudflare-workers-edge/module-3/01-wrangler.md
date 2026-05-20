---
module: 3
position: 1
title: "Wrangler and the dev loop"
objective: "Local development that mirrors production."
estimated_minutes: 5
---

# Wrangler and the dev loop

## What Wrangler is

Wrangler is the CLI for Cloudflare Workers. It scaffolds projects, runs local dev servers, manages bindings, deploys, manages secrets, and handles every aspect of the Workers lifecycle.

Install:

```bash
npm install -g wrangler
# or per-project:
npm install -D wrangler
```

Authenticate:

```bash
wrangler login
```

Opens a browser; OAuths against your Cloudflare account.

## Creating a project

```bash
npm create cloudflare@latest my-worker
```

Interactive scaffold; picks the template (Hello World, Hono API, Next.js, etc.); installs deps; initializes `wrangler.toml`.

For an empty Worker:

```bash
mkdir my-worker && cd my-worker
npm init -y
npm install -D wrangler @cloudflare/workers-types typescript
wrangler init
```

Generated `wrangler.toml`:

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2026-05-19"
```

## The dev loop

```bash
wrangler dev
```

Spins up a local Workers runtime — same V8 isolate model as production. Watches your code for changes; hot-reloads automatically.

Visit `http://localhost:8787` (default port) to test. Console logs print to your terminal.

Key flags:

- `wrangler dev --remote` — runs against actual production bindings (real KV, real R2, real D1 in CF).
- `wrangler dev --local-protocol https` — runs over HTTPS locally (useful for OAuth callbacks).
- `wrangler dev --port 3000` — different port.
- `wrangler dev --inspector-port 9229` — Node-style inspector for debugging.

## Hot reload behavior

Code changes auto-reload the Worker. Bindings (KV namespace, etc.) reset to default state (in-memory KV; fresh SQLite for D1). Storage doesn't persist across local restarts unless using `--remote`.

For testing data flows that need real persistence: use `--remote` or set up local persistence via configuration.

## .dev.vars for local secrets

For local secrets (don't commit):

```bash
# .dev.vars (gitignored)
OPENAI_API_KEY=sk-test-...
DATABASE_URL=postgresql://...
```

Wrangler dev reads these into `env.OPENAI_API_KEY` etc.

For production: `wrangler secret put OPENAI_API_KEY`.

## Deploying

```bash
wrangler deploy
```

Builds and uploads. Workers go live globally within ~30 seconds.

```bash
wrangler deploy --env staging      # to staging environment
wrangler deploy --env production   # to production
```

Environments defined in wrangler.toml with `[env.staging]` and `[env.production]` blocks, each with its own bindings.

## Workers.dev domains

Every Worker gets a free `*.workers.dev` URL:

```
https://my-worker.youraccount.workers.dev
```

Useful for development and quick tests. For production, point a custom domain.

## Custom domains

```toml
# wrangler.toml
routes = [
  { pattern = "api.example.com/*", custom_domain = true },
]
```

Or via dashboard. The Worker handles all requests to that domain (or path pattern).

Cloudflare handles DNS, TLS, certificate management automatically — much simpler than configuring custom domains on AWS Lambda.

## Tail — live logs

```bash
wrangler tail
```

Streams live logs from the deployed Worker. See console.log, errors, request metadata in real-time.

For specific events:

```bash
wrangler tail --status error          # only failed requests
wrangler tail --search "auth"          # filter by content
```

## CI deployment

For automated deploys:

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

CI token from Cloudflare dashboard → My Profile → API Tokens. Scoped to specific resources.

## TypeScript setup

```bash
npm install -D @cloudflare/workers-types typescript
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "strict": true,
    "types": ["@cloudflare/workers-types"]
  }
}
```

Types for Request, Response, KV, R2, D1, DOs — everything bindable. IntelliSense for all the Workers APIs.

## Workers Sites and Pages

Beyond raw Workers:

- **Cloudflare Pages:** static site hosting + functions (Workers under the hood for dynamic parts).
- **Workers Sites:** older static + Worker pattern; mostly superseded by Pages.

For static sites with API routes, Pages is the modern choice. Built-in CI, preview deployments per PR, integrated Workers for dynamic handlers.

For pure backend Workers, deploy as standalone with custom domain routes.

## Common workflow

A typical day:

```bash
# Pull latest:
git pull
npm install

# Develop locally:
wrangler dev

# Make changes; tests against local;
# When ready:
git commit && git push        # CI deploys to staging

# Manual prod deploy (if needed):
wrangler deploy --env production
```

For staging-first deploys, CI runs `wrangler deploy --env staging` on main pushes; production via tag or manual workflow.

## Mistakes to avoid

- **Hardcoded credentials in wrangler.toml.** Use secrets.
- **No staging environment.** Test in prod is rough.
- **Missing compatibility_date.** Default to latest; pin to a specific date for reproducibility.
- **Deploying without testing locally.** `wrangler dev` should catch most issues.
- **No `wrangler tail` for production debugging.** First place to look when things break.

## Summary

- Wrangler is the Workers CLI: init, dev, deploy, secret, tail.
- `wrangler dev` spins up local V8 isolate runtime with hot reload.
- `.dev.vars` for local secrets; `wrangler secret put` for production.
- Workers.dev subdomain free for every Worker; custom domains via routes.
- `wrangler tail` for live log streaming.
- CI deploys via API token; environments separate staging from prod.

Next: routing and the Hono framework.
