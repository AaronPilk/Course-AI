---
module: 2
position: 1
title: "API keys, basic auth, bearer tokens"
objective: "Simple auth schemes and when each fits."
estimated_minutes: 5
---

# API keys, basic auth, bearer tokens

## The simplest auth options

Before OAuth and JWTs, there's a spectrum of simpler schemes:

- **API keys.** Long random string identifies the caller. Server-to-server.
- **Basic auth.** Username + password in Authorization header. HTTP standard.
- **Bearer tokens.** Opaque token (could be JWT, could be a random string).

For most internal APIs and server-to-server integrations, the simplest scheme that fits is the right choice. Skip OAuth's complexity when a static API key works.

## API keys

```
GET /api/users
Authorization: Bearer sk_live_abc123def...
```

Or as a header (less standard but common):

```
X-API-Key: sk_live_abc123def...
```

Or query parameter (discouraged — leaks in logs / referrers):

```
GET /api/users?api_key=sk_live_abc123def
```

Stick to the `Authorization: Bearer` header form. It's standard, supported by tools (curl, Postman), and gets handled by middleware correctly.

## Key formats

Stripe-style: prefixed + random.

```
sk_live_abc123def456...     # secret key, live environment
pk_live_xyz789...           # publishable key, live
sk_test_abc123...           # secret key, test environment
```

Benefits:
- **Prefix indicates purpose.** Easy to recognize in logs / configs.
- **Length signals strength.** 32+ random chars = unguessable.
- **Environment-tagged.** No mixing test and prod keys.

Generate with cryptographic random: `secrets.token_urlsafe(32)` in Python, `crypto.randomBytes(32).toString('base64url')` in Node.

## Key lifecycle

Important capabilities:
- **Create.** User generates a new key via dashboard.
- **List active keys.** With creation date and last-used time.
- **Revoke.** Immediately invalidate; downstream services reject.
- **Rotate.** New key + grace period during which both work.
- **Scope (optional).** Restrict what the key can do (read-only, specific resources).

Many APIs let users have multiple keys (different environments, different services). Each key is auditable independently.

## Storage — never in code, never in git

```bash
# .env (gitignored)
API_KEY=sk_live_abc123def...
```

Or pull from a secret manager (Vault, AWS Secrets Manager, Doppler) at runtime. Hardcoded keys in code or committed to git are a major leak source.

GitHub secret scanning automatically detects common key formats; many providers (Stripe, AWS) auto-revoke detected leaked keys within minutes. Don't rely on that as your safety net.

## Basic auth

```
Authorization: Basic YXJvbjpwYXNzd29yZDEyMw==
```

The base64 part decodes to `aaron:password123`. Note: this is encoding, not encryption — anyone seeing the header sees the password. ALWAYS over TLS.

Use cases:
- Internal admin tools.
- Simple integrations where API key is overkill (rare).
- Legacy systems.

For new APIs: prefer bearer tokens or API keys over basic auth. Username+password sent on every request is risky if logged or accidentally exposed.

## Bearer tokens

```
Authorization: Bearer eyJhbGc...
```

Bearer = "anyone holding the token has access." No additional proof of identity required.

Token formats:
- **Opaque random string.** Server looks it up in a database.
- **JWT.** Self-contained signed token; covered later.

Both forms are "bearer tokens" — what matters is the credential model, not the token format. Opaque tokens are easier to revoke (delete from DB); JWTs are stateless but harder to revoke.

## Header naming

The standard:

```
Authorization: <scheme> <credentials>
```

Common schemes:
- `Basic` — base64(user:pass).
- `Bearer` — opaque token or JWT.
- `Digest` — older challenge/response, rare.

Custom headers like `X-Api-Key: abc123` work but break tools that expect Authorization. Prefer the standard form unless integrating with a system that demands custom headers.

## When API keys vs OAuth

- **API key.** Server-to-server. Single owner of the key. No user context.
- **OAuth.** User-delegated access. App acts on behalf of user A; another instance acts on behalf of user B.

For "my service integrates with Stripe to charge customers" — API key (the API call is from your service to Stripe, not on behalf of any end user).

For "my app lets users connect their Google Drive" — OAuth (the access is on behalf of the user; user must consent).

Sometimes you need both. Stripe Connect is an example: API keys for platform-level operations + OAuth for connecting individual merchants.

## Rate limiting per key

API keys make rate limiting easy — each key is a unit:

```
ratelimit:sk_live_abc123:hour → counter
```

Different tiers (free / pro / enterprise) can have different limits per key. Heavy users hitting limits don't affect others.

Cover this in detail in Module 5.

## Webhook validation — the other direction

When your service sends webhooks TO consumers, they need to verify the webhook is from you (not an attacker). Common patterns:

- **HMAC signature.** Hash the body + secret; consumer verifies.
- **Bearer token.** Send a token in the webhook; consumer checks against their stored value.
- **mTLS.** Mutual TLS — both sides authenticate via cert.

Stripe's webhook signing pattern is widely copied: `Stripe-Signature: t=timestamp,v1=hmac_signature`. Consumer verifies the HMAC matches.

## Mistakes to avoid

- **Keys in URLs.** Show up in logs, referrers, browser history.
- **Keys in client-side code.** Anyone with the source has them. Use OAuth or a backend proxy.
- **Same key for all environments.** Mix test and prod = disaster.
- **No revocation.** Old keys live forever; lost laptops = compromised access.
- **No rate limiting per key.** One bad consumer breaks everyone.

## Summary

- API keys: server-to-server, no user context. Stripe-style prefixed + random.
- Send via `Authorization: Bearer <token>`. Avoid URL params.
- Basic auth: username + password base64. Use only over TLS; legacy only.
- Bearer tokens: opaque or JWT. Bearer = "anyone holding has access."
- API key vs OAuth: server-to-server vs user-delegated.
- Lifecycle matters: rotate, revoke, audit.

Next: OAuth 2.1.
