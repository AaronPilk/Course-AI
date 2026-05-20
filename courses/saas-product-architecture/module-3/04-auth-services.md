---
module: 3
position: 4
title: "Auth services (Auth0, Clerk, WorkOS, Supabase Auth)"
objective: "Pick a hosted auth platform or build."
estimated_minutes: 5
---

# Auth services (Auth0, Clerk, WorkOS, Supabase Auth)

## The build-vs-buy question

Auth is large in scope:
- Password sign-up + login.
- Email verification.
- Password reset.
- MFA.
- Social login (Google, GitHub, Apple).
- SSO (SAML, OIDC).
- SCIM provisioning.
- Sessions / JWT management.
- Audit logs.
- Multi-tenant org management.

Building all of this: months. Maintaining: continuous (new attack vectors, new IdPs, library updates).

Most modern SaaS uses an auth service. Cost is real ($X00-X000/mo at modest scale) but less than engineering.

## The major options

**Auth0.** Mature, broad features, supports B2B + B2C. Expensive at scale. Owned by Okta.

**Clerk.** Modern, B2B-focused, great DX (React components, hooks). Multi-tenant org management built-in. Growing fast.

**WorkOS.** B2B-only; emphasizes SSO + SCIM + audit logs (enterprise features). Pay-per-tenant; SaaS-friendly pricing.

**Supabase Auth.** Open-source-friendly; built on Postgres + RLS. Free tier; great for indie / startup. B2C strong; B2B improving.

**Stytch.** Modern B2B-focused; passwordless emphasis.

**Firebase Auth.** Google's offering; B2C-strong; less B2B-focused.

**AWS Cognito.** Enterprise but DX is rough. Mostly used by AWS-heavy shops.

**NextAuth.js (Auth.js).** Open-source library; self-host; no SaaS lock-in. Less feature-rich than hosted.

## How they fit

For a typical B2B SaaS:

- **Early stage / MVP.** Supabase Auth (free + good enough) or Clerk (great DX, multi-org built-in).
- **Mid-stage / pre-enterprise.** Clerk or Auth0 — adds MFA, OAuth, more options.
- **Enterprise-ready.** Add WorkOS for SSO+SCIM, or Auth0 enterprise tier, or Clerk + WorkOS.

You can switch later but data migration is painful (passwords are hashed; can't easily move). Pick with growth in mind.

## What you get from a hosted service

- Pre-built UI components (sign-in widgets) or APIs.
- Session management (cookies / JWTs).
- Social login pre-configured.
- MFA support.
- Audit logs.
- Pre-built or easy-to-add SSO.
- Compliance certifications (SOC 2, etc.) that you inherit.

You manage: integration code, user-facing UX choices, organization/tenant logic on top of the auth's user model.

## When to build auth

- **Strict regulatory environment** that forbids 3rd-party identity provider.
- **Specific custom flows** the hosted service doesn't support.
- **Cost.** At very large scale, auth services get expensive; some companies build their own.

For most SaaS: don't build. The cost / risk ratio is bad.

## Migration strategies

If you have existing auth and want to migrate:

- **Big-bang.** Cut over on a single day; force password reset for everyone. High risk.
- **Lazy.** New users sign up via new auth; existing users continue old until they log in; on login, migrate to new. Common pattern.
- **Bulk import.** Some services accept hashed passwords (bcrypt) for import; users continue using their existing passwords. Best UX.

Auth0, Clerk, Supabase support bcrypt import for password migration. Plan the migration carefully; test extensively in staging.

## Pricing models

Different per-service:

- **Per MAU.** Per monthly-active-user. Common.
- **Per tenant.** B2B-focused (WorkOS). Cleaner economics for SaaS.
- **Tiered features.** SSO costs extra; MFA costs extra; etc.

For early-stage: free tiers cover most. As you grow, costs rise. Budget early.

## Common concerns

**"What if the service goes down?"**

Auth being down = no logins. Service availability matters. Tier-1 services (Auth0, AWS Cognito) have strong SLAs. Smaller services: monitor; consider fallback.

**"What if they change pricing?"**

Has happened (Auth0 increased prices significantly). Plan migration if costs escalate.

**"What if they get acquired?"**

Auth0 by Okta; Stytch independent; etc. Acquisitions sometimes good, sometimes bad. Roadmaps change.

Mitigations: standard protocols (OIDC, SAML) make migration possible; abstract your auth integration; don't tightly couple to one vendor's quirks.

## Multi-tenant org management

Some services have multi-tenant org features built-in:
- **Clerk Organizations.** Memberships, invitations, roles per org.
- **WorkOS Organizations.** B2B-focused; designed for SaaS multi-tenancy.
- **Auth0 Organizations.** Multi-org support.

Without org management, you build it on top of users (with memberships table, invites, etc.). Doable, but adds engineering. Services that include this save weeks.

For B2B SaaS: prefer services with first-class org/tenant features.

## Audit logs

Enterprise customers want auditable history: who logged in, when, from where; who changed role; who invited whom.

Hosted auth services usually include this. Roll your own = more engineering. Audit log is also useful internally for support / debugging.

## Recommendations

For new B2B SaaS in 2026:

- **Founder MVP.** Supabase Auth or Clerk free tier.
- **Series A.** Clerk or Auth0 + add WorkOS for enterprise SSO.
- **Enterprise sales.** Clerk + WorkOS, or Auth0 enterprise.

Avoid building auth from scratch unless you have specific reason.

## Common mistakes

- **Build auth yourself for fun.** Months of work; security risks.
- **Choose by lowest price.** Migration cost > savings.
- **Tightly couple to vendor quirks.** Painful to switch.
- **No fallback for downtime.** Auth outage = full app outage.
- **Skip audit logs.** Customers ask for them later.

## Summary

- Auth has many features; building is expensive; hosting services exist.
- Major options: Auth0 (mature), Clerk (modern B2B), WorkOS (enterprise SSO), Supabase Auth (open-friendly), Stytch.
- Most SaaS use a service; build only with strong reason.
- Multi-tenant org features built into Clerk, WorkOS, Auth0 saves engineering.
- Plan migration if you ever switch; use standard protocols.
- Audit logs matter; favor services that include them.

Module 3 complete. Next module: feature flags and rollouts.
