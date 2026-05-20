---
module: 5
position: 2
title: "Environment variables and secrets"
objective: "Build-time vs runtime; client vs server."
estimated_minutes: 7
---

# Environment variables and secrets

## The four kinds of env vars

Next.js env vars come in four flavors, each with different visibility and lifecycle:

1. **Server-only, runtime.** Default for env vars. Available only on server; read at runtime.
2. **Server-only, build-time.** Embedded into the build; static after deploy.
3. **Client-exposed.** Prefixed with `NEXT_PUBLIC_`; shipped to the browser.
4. **Secret.** Should never be exposed; usually server-only runtime.

Getting these right is critical for security. Get wrong and you leak secrets to the browser.

## Server-only env vars

Default behavior: env vars in `.env` files are server-only.

```bash
# .env.local
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...
```

```tsx
// Server Component or Server Action
const dbUrl = process.env.DATABASE_URL;  // Works
```

These are available to:
- Server Components
- Server Actions
- API Routes
- Middleware (if accessible from edge)
- next.config.js

NOT available to:
- Client Components
- Browser code

Trying to access in a Client Component returns `undefined`.

## NEXT_PUBLIC_ vars

To expose an env var to the browser, prefix with `NEXT_PUBLIC_`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```

```tsx
'use client';
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
```

These vars:
- Are inlined into the JavaScript bundle at build time.
- Visible to anyone who views your site's source.
- NOT for secrets.

Common legitimate uses: publishable API keys (Stripe, Mapbox), analytics IDs, public configuration.

Common mistakes: putting secrets in NEXT_PUBLIC_ because "the build will inline it." Yes, it will, and you've published your secret.

## Build-time vs runtime

By default, env vars are read at runtime — the value the server has when it runs.

For build-time values (e.g., deployment timestamp, git commit), set them at build:

```bash
NEXT_PUBLIC_BUILD_VERSION=$(git rev-parse HEAD) npm run build
```

The value is captured at build and inlined. Restarting the server doesn't re-read; you have to rebuild.

Most env vars should be runtime — secrets, database URLs, feature flags. You want to update them without rebuilding.

## .env file hierarchy

Next.js loads env files in order:

1. `.env.local` (gitignored; local secrets)
2. `.env.development` (development mode)
3. `.env.production` (production mode)
4. `.env` (defaults)

Files later in the list don't override earlier ones; .env.local has priority.

In production deployments (Vercel, Render, etc.), env vars are set in the hosting platform's dashboard, not in .env files.

## .env.local — your friend

`.env.local` is loaded in all environments but should NEVER be committed:

```bash
# .gitignore
.env.local
.env*.local
```

Put your local secrets here. Each developer maintains their own.

Provide `.env.example` (committed) with placeholder values for documentation:

```bash
# .env.example
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
STRIPE_SECRET_KEY=sk_test_...
```

New developers copy .env.example → .env.local and fill in real values.

## Validating env at startup

Catch missing env vars early:

```tsx
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

Import `env` instead of `process.env` everywhere. Type-safe; throws clear errors at startup if anything's missing.

Libraries like `@t3-oss/env-nextjs` automate this with client/server split:

```tsx
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    STRIPE_SECRET_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
});
```

Build fails if a server var is accessed in a client context. Catches mistakes at compile time.

## Production secrets

For production:

- **Vercel:** Set in Settings → Environment Variables. Separate dev/preview/production scopes.
- **Self-hosted:** Set in your hosting platform's dashboard or via systemd, Docker env, Kubernetes secrets.

Best practices:

- Different values for dev/preview/production.
- Rotate secrets periodically.
- Use secret-management tools (Vault, AWS Secrets Manager) for sensitive deployments.
- Audit who has access to production env.

## Avoiding leaks

Common ways secrets leak:

**1. Accidental NEXT_PUBLIC_ on secrets.**
```bash
NEXT_PUBLIC_DB_PASSWORD=...  # Catastrophic; in client bundle
```
Solution: schema validation that rejects this.

**2. Console.log of process.env in client components.**
```tsx
'use client';
console.log(process.env);  // Logs NEXT_PUBLIC_ vars
```
Don't log env.

**3. Returning secrets from Server Actions to the client.**
```tsx
'use server';
export async function getApiKey() {
  return process.env.STRIPE_SECRET_KEY;  // Sent to client!
}
```
Don't return secrets; perform the action server-side.

**4. Secrets in error messages.**
```tsx
throw new Error(`Failed to connect to ${process.env.DATABASE_URL}`);
// DATABASE_URL might appear in client-visible error.
```
Sanitize errors.

## Inspecting what shipped

To verify no secrets leaked to the client:

```bash
# Build the app.
npm run build

# Search the .next directory for known secret prefixes.
grep -r "sk_live_" .next/
grep -r "sk_test_" .next/  # Should only be in NEXT_PUBLIC_ vars.
```

If your secrets appear, you have a leak.

## Local development for multi-developer teams

For shared dev secrets:

- **Vercel/Doppler:** Dev secrets sync to local via CLI; rotate centrally.
- **1Password:** Use 1Password Secrets Automation to inject env from a shared vault.
- **Encrypted .env files:** SOPS, age, git-crypt for committing encrypted env.

Sharing .env.local via Slack/email is a security smell. Use one of the proper tools.

## Env in middleware (Edge runtime)

Middleware on Edge has constraints. Some env vars work; not all behaviors are identical.

```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const apiKey = process.env.SOME_KEY;  // Works for runtime env on Vercel
  // ...
}
```

Edge env access has limits on what kinds of vars are available. Verify in deployment if a middleware env access surprises you.

## Mistakes to avoid

- **NEXT_PUBLIC_ on secrets.** Catastrophic; in client bundle.
- **No env validation.** Missing var = production crash.
- **Hardcoded secrets in code.** Use env, not literals.
- **Committing .env.local.** Use .gitignore.
- **Returning secrets from Server Actions.** Server-side only.
- **Logging full process.env.** Even in dev.

## Summary

- Server-only by default; NEXT_PUBLIC_ exposes to browser.
- .env.local is gitignored; .env.example documents the schema.
- Validate env at startup with Zod or t3-env.
- Different scopes for dev/preview/production.
- Never return secrets from Server Actions.
- Audit .next/ build output to verify no secret leaks.
- Use secret management tools for production sensitivity.

Next: monitoring, logging, and error tracking.
