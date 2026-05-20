---
module: 2
position: 2
title: "OAuth 2.1 and the authorization code flow"
objective: "User-delegated access without passing passwords around."
estimated_minutes: 6
---

# OAuth 2.1 and the authorization code flow

## What problem OAuth solves

You want your app to access a user's Google Drive. Bad approach: ask user for their Google password, log in as them. Problems: you have their password forever, can do anything, breaks if they change it, terrible security model.

OAuth solves this: user authorizes your app to access specific scopes (read files, no delete) without sharing their password. Your app gets a token. Token is scoped, revocable, expiring.

OAuth 2.1 consolidates OAuth 2.0 + several security additions (PKCE, no implicit flow). Use 2.1 patterns for new work.

## Roles

- **Resource Owner.** The user.
- **Client.** Your app.
- **Authorization Server.** The OAuth provider (Google, GitHub, etc.).
- **Resource Server.** The API holding the user's data (often same as auth server).

## The authorization code flow with PKCE

The standard flow for web apps and native apps:

```
1. Client generates code_verifier (random string).
2. Client computes code_challenge = SHA256(code_verifier).
3. Client redirects user to auth server:
   GET /authorize?response_type=code
                  &client_id=abc
                  &redirect_uri=https://app.example.com/cb
                  &scope=read.files
                  &state=random123
                  &code_challenge=xyz...
                  &code_challenge_method=S256
4. User logs in at auth server; approves the scopes.
5. Auth server redirects back:
   GET https://app.example.com/cb?code=auth_abc123&state=random123
6. Client (server side) exchanges code for token:
   POST /token
   grant_type=authorization_code
   code=auth_abc123
   redirect_uri=https://app.example.com/cb
   client_id=abc
   code_verifier=<the original verifier>
7. Auth server returns:
   {
     "access_token": "...",
     "refresh_token": "...",
     "expires_in": 3600
   }
8. Client uses access_token in API requests:
   Authorization: Bearer <access_token>
```

PKCE (code_verifier + code_challenge) protects against authorization code interception — even if an attacker grabs the code, they can't exchange it without the verifier.

The `state` parameter is a CSRF token — client generates it, validates it on return.

## Scopes

Scopes limit what the token can do:

```
scope=read.files write.files calendar.read
```

Apps should request the minimum needed. Users approve specific scopes; revoke via the provider's app management page.

Examples:
- Google: `https://www.googleapis.com/auth/drive.file` (only files the app created/opens).
- GitHub: `repo` (full repo access), `read:user` (just profile).
- Slack: `chat:write`, `users:read`.

Granular scopes = better security + better user trust.

## Access tokens vs refresh tokens

**Access token.** Short-lived (typically 1 hour). Used to call the API. If leaked, damage is bounded.

**Refresh token.** Long-lived (days to never-expiring). Used to get new access tokens when they expire. Stored more carefully than access tokens.

The pattern: short-lived access tokens for actual use; refresh tokens to get more when needed.

When the access token expires:
```
POST /token
grant_type=refresh_token
refresh_token=<the refresh token>
```

Returns a new access token (and often a new refresh token — rotating refresh tokens).

## Client types

- **Confidential clients.** Server-side apps with a secret. Stores `client_secret`.
- **Public clients.** Browser SPAs, native mobile apps. Can't keep secrets (anyone can decompile).

For public clients: PKCE is mandatory in OAuth 2.1. The `client_secret` doesn't exist (or is treated as public); PKCE provides the security.

## Other flows (briefly)

- **Implicit flow.** Deprecated in OAuth 2.1. Don't use.
- **Resource Owner Password Credentials.** User gives password to client. Defeats OAuth's purpose. Use only for legacy.
- **Client Credentials.** Machine-to-machine; no user. Your service authenticates to another service.

```
POST /token
grant_type=client_credentials
client_id=abc
client_secret=def
scope=service.read
```

For service-to-service: this is the right flow.

- **Device Authorization.** TVs, IoT — display a code; user enters it on phone. Specialized.

## OpenID Connect (OIDC)

OAuth 2.0 is for authorization (what can you do). OIDC adds authentication (who you are) on top of OAuth.

OIDC returns an `id_token` (a JWT) alongside the access token. The id_token contains user identity claims: `sub` (user ID), `email`, `name`, etc. Used for "Sign in with Google."

Difference:
- **OAuth 2.0.** "Give my app permission to access your Google Drive."
- **OIDC.** "Use Google to log into my app."

Many providers offer both at the same endpoint. For login: implement OIDC. For data access: OAuth 2.0/2.1.

## Implementing OAuth on the consuming side

Libraries exist for every language: `authlib` (Python), `next-auth` (Next.js), `passport` (Node), `omniauth` (Ruby). They handle the dance correctly.

For new projects, hosted auth (Auth0, Clerk, Stytch, Supabase Auth, AWS Cognito) handles OIDC + OAuth + MFA + password reset + social login. Don't build auth yourself unless your business requires it.

## Implementing OAuth as a provider

You're providing an OAuth API for your users. Complex; needs:
- Authorization endpoint (user consent UI).
- Token endpoint.
- Token storage and revocation.
- Scope management.
- Client registration.
- Discovery endpoint (`/.well-known/oauth-authorization-server`).

Most companies use Auth0 or Cognito or build on top of Ory Hydra (open source) rather than building from scratch.

## Common mistakes

- **No PKCE.** Required in OAuth 2.1; protects against code interception.
- **No state parameter.** Vulnerable to CSRF.
- **Long-lived access tokens.** Increases damage of compromise. Use refresh tokens.
- **Wide scopes.** Apps requesting everything. Users distrust.
- **Implicit flow.** Deprecated; don't use.
- **Tokens in localStorage on SPAs.** XSS = full token theft. Use HttpOnly cookies via your backend.

## Summary

- OAuth 2.1 = user-delegated authorization. App acts on behalf of user.
- Auth code flow with PKCE is the standard for web + native.
- Scopes limit access; users approve per-scope.
- Access tokens short-lived; refresh tokens long-lived.
- OIDC = OAuth + identity (sign-in).
- Use hosted auth (Auth0, Clerk, etc.) unless you must build it.

Next: JWTs.
