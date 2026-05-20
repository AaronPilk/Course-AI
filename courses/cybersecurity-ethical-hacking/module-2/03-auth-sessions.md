---
module: 2
position: 3
title: "Auth & sessions: how they break"
objective: "The patterns that make authentication go wrong."
estimated_minutes: 7
---

# Auth & sessions: how they break

## Authentication vs authorization

- **Authentication (authn).** Who are you?
- **Authorization (authz).** What are you allowed to do?

Common phrase: "auth bug" → could mean either. Be specific.

Most breaches involve one or both. Get them right and most app security is downstream.

## Password authentication — what attackers do

**Credential stuffing.** Attackers try leaked password lists (billions of leaked credentials available on the dark web) against your login. Most users reuse passwords.

**Brute force.** Try common passwords or generated ones against a target account.

**Password spray.** A few common passwords tried against many usernames (avoids account lockouts).

**Phishing.** Fake login page; user types real password.

Defenses against each:

| Attack | Defense |
|--------|---------|
| Credential stuffing | MFA. Detection (impossible travel, new device). |
| Brute force | Rate limiting per IP, per account. Account lockouts. |
| Password spray | Rate limit at the username level too. Anomaly detection. |
| Phishing | WebAuthn / hardware keys. Security training. URL warnings. |

The pattern: MFA, rate limiting, and anomaly detection. Combined, they make 99% of credential-based attacks unprofitable.

## Multi-factor authentication

MFA = require additional factor beyond password:

- **Something you have.** Phone (SMS, push, TOTP); hardware key (YubiKey).
- **Something you are.** Biometric.
- **Something you know.** Backup codes; security questions.

Order of strength (high to low):
1. **Hardware key (WebAuthn / FIDO2).** Phishing-resistant; no shared secret to steal.
2. **TOTP (Google Authenticator, etc.).** Time-based codes from an app.
3. **Push notification (Duo, Auth0).** Click to approve.
4. **SMS.** Vulnerable to SIM swap; better than nothing.

SMS MFA is what most consumer services use; better than no MFA but the weakest. WebAuthn is the modern best practice for high-value accounts (admins, sensitive data).

## Password storage

Passwords should never be stored as plaintext or basic hashes (SHA-256 alone). Use a slow, memory-hard hash:

- **bcrypt.** Standard since 1999. Cost factor configurable.
- **argon2.** Modern alternative; winner of password hashing competition.
- **scrypt.** Memory-hard; harder to attack with GPUs.

Each computes a salted hash that's slow to compute (intentionally). Brute-force attacks become orders of magnitude harder.

```python
# bcrypt example
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))
# verify
bcrypt.checkpw(password.encode(), hashed)
```

Cost factor (rounds=12) means ~250ms per hash. Calibrate so login takes ~100-500ms.

Never: MD5, SHA-1, plain SHA-256, "encrypt" the password, encode in base64. All are decades-broken.

## Session management

After login, the app issues a session token (cookie or JWT). Each subsequent request includes it. Server checks: is this token valid?

**Sessions stored server-side (Redis, DB):**
- Token = random opaque string.
- Server looks up: token → user_id, expiry.
- Easy to revoke (delete the row).

**Sessions in JWTs (stateless):**
- Token is signed JWT containing claims.
- Server verifies signature; no DB lookup.
- Hard to revoke until expiry — need a denylist or short expiries with refresh tokens.

Most apps use server-side sessions. JWTs are fine for APIs that need stateless auth but require careful design (short access tokens, refresh tokens, denylist for revocation).

## Session fixation

```
1. Attacker visits your site, gets a session ID.
2. Tricks victim into using that session ID (via URL parameter, etc.).
3. Victim logs in; the session is now authenticated as victim.
4. Attacker uses the same session ID — authenticated as victim.
```

Fix: regenerate session ID on login. Modern frameworks do this; rolling your own auth misses it.

## Insecure direct object references (IDOR)

The authorization side:

```
GET /api/invoices/12345
```

User Aaron is logged in. The server checks Aaron is authenticated, returns invoice 12345 — without checking whether 12345 BELONGS to Aaron. Aaron just iterates IDs and reads everyone's invoices.

Fix: every query scoped to the authenticated user:

```sql
SELECT * FROM invoices WHERE id = $1 AND user_id = $2
```

For multi-tenant: row-level security (RLS) enforces this at the DB level. Postgres / Supabase have RLS built in.

## Broken access control

The umbrella term. Examples:

- IDOR (above).
- Missing function-level access checks. Admin endpoints accessible without admin role.
- Forced browsing. `/admin` direct-accessible if not gated.
- Path manipulation. `/api/v1/users/me` returns the current user; `/api/v1/users/123` returns user 123 with no check.
- Privilege escalation. User edits their own role to admin via mass assignment.

#1 on the 2021 OWASP Top 10. Tests:

- For each endpoint: is auth required? Is the right authorization checked?
- For each parameter: can a different user use this and get someone else's data?

## Password reset flows

Often vulnerable:

- Token in URL not single-use → leak via referrer.
- Token has too low entropy → brute-forceable.
- "Forgot password" reveals whether an email exists in the system → user enumeration.
- Reset works without invalidating other sessions.

Standard defense:
- Random 128+ bit tokens.
- Single use; short expiry (1 hour).
- Generic success message (don't reveal account existence).
- On reset: invalidate all other sessions.

## Logout

Server-side: invalidate the session. JWT: add to denylist or wait for expiry. Cookie: clear it.

Many apps "logout" by just clearing the cookie client-side. If the server-side session is still valid, anyone with the token can keep using it. Always invalidate server-side too.

## Session token leakage

Tokens can leak via:

- **HTTP referer.** If a logged-in user clicks a link, the referer header may include the URL (and tokens if they're in URLs).
- **Browser history / cache.** URLs with tokens get stored.
- **Logs.** Server access logs may include tokens.
- **JavaScript console / errors.** Tokens in errors get reported.

Best practice: tokens in cookies (HttpOnly, Secure, SameSite), never in URLs.

## SSO and OAuth pitfalls

OAuth has its own attack surface:

- **Redirect URI validation.** If too lax, attacker registers `attacker.com` as a redirect → gets the auth code.
- **State parameter.** Used as CSRF token. Skipping it allows OAuth CSRF.
- **PKCE.** Mandatory for public clients in OAuth 2.1. Prevents code interception.
- **Token replay.** ID tokens / access tokens should be short-lived.

For your own OAuth integrations: read the provider's security docs; follow their checklists. The auth stack is dense; mistakes are costly.

## Logging and detection

For sensitive auth events, log:

- Login success / failure (with IP, device).
- Password reset triggered / completed.
- MFA enrollment / disablement.
- Role / permission changes.
- Token issuance / revocation.

Alert on anomalies:

- Login from unusual location.
- Many failures from one IP → blocked.
- Privilege escalation events.

These logs are how you detect a breach in progress.

## Mistakes to avoid

- **Rolling your own auth.** Use battle-tested libraries (Auth0, Supabase Auth, NextAuth, Clerk, etc.).
- **No MFA on admin accounts.** Highest-value targets need highest-strength MFA.
- **Plaintext or weak password hashing.** bcrypt/argon2/scrypt only.
- **JWT in localStorage.** XSS → token theft.
- **No rate limiting.** Brute force is automated.
- **IDOR everywhere.** Test every authenticated endpoint.

## Summary

- Authn = who; authz = what. Both must be right.
- Password storage: bcrypt / argon2 / scrypt — slow and memory-hard.
- MFA mandatory for sensitive accounts; WebAuthn > TOTP > push > SMS.
- Sessions: regenerate ID on login; HttpOnly + Secure + SameSite cookies.
- Test every endpoint for IDOR — does the right user own the data?
- Use battle-tested auth libraries; don't roll your own.

Next: OWASP Top 10.
