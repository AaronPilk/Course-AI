---
module: 2
position: 3
title: "JWTs: when they help, when they hurt"
objective: "Self-contained tokens and the trade-offs."
estimated_minutes: 5
---

# JWTs: when they help, when they hurt

## What a JWT is

JSON Web Token: a string with three parts:

```
header.payload.signature
```

Each part is base64-encoded JSON (or, for the signature, a binary signature in base64). Decoded:

```json
// header
{ "alg": "HS256", "typ": "JWT" }

// payload (claims)
{
  "sub": "user_123",
  "iat": 1716200000,
  "exp": 1716203600,
  "role": "admin"
}

// signature
HMACSHA256(base64url(header) + "." + base64url(payload), secret)
```

The signature proves the token was issued by someone with the secret. Anyone can decode the payload (it's not encrypted by default); only the signer can produce a valid signature.

## What JWTs are good for

**Stateless verification.** Service can verify a token without database lookup — just check the signature. Useful for:
- Distributed systems where central session storage adds latency.
- Stateless APIs that scale horizontally.
- Microservices passing identity between hops.

**Short-lived tokens.** Access tokens in OAuth flows are usually JWTs — issued, expires in an hour, no need to revoke (just wait it out).

**Context-rich claims.** Embed user_id, roles, permissions in the token; consumers extract without an extra DB call.

## What JWTs are bad for

**Long-lived sessions.** Hard to revoke. Stolen JWT works until it expires; you have no way to invalidate it instantly without a denylist (which loses the "stateless" benefit).

**Large payloads.** Every request sends the JWT. Big JWTs (lots of claims) inflate every HTTP header.

**Sensitive claims.** Payload isn't encrypted; anyone with the JWT can read it. Don't put PII you wouldn't email.

For session management in web apps: server-side sessions (Redis-backed cookie sessions) are simpler than JWTs and easier to revoke. JWTs make sense for distributed systems and short-lived API tokens.

## Algorithms — pick HS256 or RS256

- **HS256 (symmetric).** Both signer and verifier share a secret. Simple. Used when the same service signs + verifies, or close-trusted services.
- **RS256 (asymmetric).** Signer has private key; verifiers have public key. Used when many parties verify but only one issues (auth server signs; resource servers verify with public key).
- **ES256.** Like RS256 but elliptic curve. Faster, smaller signatures.
- **none.** Deprecated; should never be accepted. Buggy verifiers used to accept `alg: none` as valid.

For multi-service architectures (auth server issues; resource servers verify): RS256 / ES256. For monolith with shared secret: HS256.

## Verification — what NOT to do

```javascript
// ❌ Dangerous — trusts alg from token
jwt.verify(token, key);
```

Some libraries default to trusting the `alg` field in the header. Attackers can:
- Switch `alg: HS256` to `alg: none` and remove signature.
- Switch `alg: RS256` to `alg: HS256` and use the public key as the HMAC secret.

```javascript
// ✅ Safe — enforce the expected algorithm
jwt.verify(token, key, { algorithms: ['RS256'] });
```

Always hardcode the expected algorithm. Library defaults have caused real CVEs.

## Claims — standard fields

Defined by RFC 7519:

- `iss` — issuer (who issued).
- `sub` — subject (who the token is about).
- `aud` — audience (who should accept it).
- `exp` — expiration time (Unix timestamp).
- `iat` — issued at.
- `nbf` — not before.
- `jti` — JWT ID (for revocation tracking).

Application-specific claims (`role`, `tenant_id`) go alongside. Don't conflict with reserved names.

Always check `exp`. Some libraries verify it; others don't unless you ask.

## Token lifecycle

**Issuance.**
```
POST /token
→ JWT signed with private key
```

**Use.**
```
GET /api/users
Authorization: Bearer eyJhbGc...
```

**Verification (on each request).**
Verify signature; check exp; check aud; check iss.

**Expiry.**
Token stops working after exp.

**Refresh.**
Client uses refresh token to get a new access JWT.

**Revocation.**
Hard without a denylist (defeats stateless). Most JWT systems live with short expirations rather than instant revocation.

## Revocation patterns

If revocation matters:

1. **Short expiry + refresh.** Token lasts 5-15 min; refresh requires DB hit; revocation = delete refresh token. Compromise window bounded.
2. **Denylist.** On logout, add `jti` to a Redis denylist; verifier checks. Loses stateless benefit but allows instant revoke.
3. **Allowlist.** Track active sessions in a database; verifier checks. Essentially "JWT with session check."
4. **Re-key the secret.** Invalidates all tokens. Heavy-handed but works.

For most apps: short expiry (5-15 min access tokens) + refresh tokens is the right pattern. Revocation = refuse refresh.

## JWT in cookies vs Authorization header

**Cookies (HttpOnly).** Best for browser apps. XSS can't steal. Requires CSRF protection (SameSite + tokens).

**Authorization header.** Standard for APIs. SPA / mobile clients use this. JS-accessible if stored in JS — XSS risk.

For web apps: HttpOnly cookies. For APIs / mobile: Bearer header.

## Common JWT antipatterns

- **JWTs as the only session store.** No instant logout possible.
- **Putting huge claims in JWTs.** Every request sends the bloat.
- **Sensitive data in claims.** Not encrypted.
- **Long expiry without refresh.** Permanent risk if compromised.
- **Not enforcing alg.** Algorithm confusion attacks.
- **Same secret across environments.** Mix-ups disastrous.

## When NOT to use JWTs

For most web apps with normal session needs: traditional server-side sessions (cookie ID + Redis backend) are simpler.

- Easier to revoke (delete the session row).
- Smaller cookies (just session ID).
- No claim bloat.
- No alg-confusion attacks.

JWT is a tool; not always the right one. For monolithic web apps with login forms: server sessions. For APIs serving multiple clients / distributed services / microservices: JWTs make more sense.

## Summary

- JWT = header.payload.signature (base64). Self-contained.
- Pros: stateless verification, scales horizontally, claim-rich.
- Cons: hard to revoke, payload visible, large headers.
- Use RS256 for multi-service; HS256 for shared-secret.
- ALWAYS enforce the algorithm in verification.
- Short-lived JWTs + refresh tokens is the standard pattern.
- For simple web apps: server-side sessions are simpler.

Next: per-endpoint authorization and scopes.
