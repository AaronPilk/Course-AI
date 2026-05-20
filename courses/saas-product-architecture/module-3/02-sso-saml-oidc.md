---
module: 3
position: 2
title: "SSO, SAML, OIDC — enterprise readiness"
objective: "Let enterprise customers sign in through their identity provider."
estimated_minutes: 5
---

# SSO, SAML, OIDC — enterprise readiness

## What SSO is

Single Sign-On lets users authenticate to your SaaS through their company's identity provider (IdP) — Okta, Azure AD, Google Workspace, OneLogin, etc.

User experience: "Sign in with Okta" → redirect to company IdP → sign in there → redirected back to your app, authenticated.

For enterprises: SSO is non-negotiable. IT departments enforce it; without SSO support, you can't sell enterprise.

## The two protocols

- **SAML 2.0.** Older, XML-based. Standard for enterprise SSO.
- **OIDC (OpenID Connect).** Newer, JSON-based, on top of OAuth 2.0.

Most enterprises support both. SAML for legacy customers; OIDC increasingly common (especially for newer IdPs).

You implement support for both to cover the most customers.

## SAML — XML on a difficult day

The dance:

1. User clicks "Sign in with SSO" on your app.
2. You redirect to the IdP's SSO URL with a SAML AuthnRequest (signed XML).
3. IdP authenticates the user (their existing login).
4. IdP POSTs back to your callback URL with a SAML Response (signed XML) containing user attributes.
5. You verify the signature; extract email / name / role; create session.

SAML is XML-heavy, signature-complex, and historically full of footguns (XML signature wrapping attacks, etc.). Use a battle-tested library.

## OIDC — modern and simpler

Same idea, JSON-based:

1. Redirect to IdP's authorize endpoint with client_id, redirect_uri, etc.
2. IdP authenticates.
3. IdP redirects back with authorization code.
4. Exchange code for ID token + access token.
5. Verify ID token; extract claims.

OIDC builds on OAuth 2.0; libraries are mature; less XML pain. Same pattern as "Sign in with Google."

For new implementations: prefer OIDC. Add SAML when customers require it.

## The IdP configuration dance

Setting up SSO is per-customer:

1. Customer's IT admin generates SAML metadata (or OIDC config) on their IdP.
2. Customer uploads it / pastes URLs to your SaaS.
3. You generate corresponding config in your IdP-side (SP metadata, client_id/secret, etc.).
4. Customer's IT admin completes the IdP side with your details.
5. Test connection; flip to production.

For each enterprise customer: 30-60 minutes of dance. Sometimes longer with conservative IT. Document the process; provide a setup wizard in your admin UI.

## Per-tenant SSO config

Each tenant has its own SSO setup:

```sql
CREATE TABLE sso_configs (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  protocol TEXT,  -- saml | oidc
  idp_metadata XML,  -- for SAML
  client_id TEXT,  -- for OIDC
  client_secret TEXT_ENCRYPTED,
  enabled BOOLEAN
);
```

Login flow: user enters email; if domain matches a tenant with SSO, redirect to that tenant's SSO; else password login.

## SP-initiated vs IdP-initiated

**SP-initiated.** User starts at your app; chooses "Sign in with SSO"; you redirect to IdP. Most common.

**IdP-initiated.** User starts in their IdP's app catalog; clicks your app; redirected to your app with credentials. Common in enterprise; supports the "app dashboard" experience.

Support both; conditional on tenant configuration.

## Just-in-time provisioning

When a user logs in via SSO for the first time, you may need to:
- Create the user account.
- Auto-assign to tenant (based on the SSO config's tenant).
- Set role (admin / member based on IdP attributes).

Implementation: on SSO callback, lookup user by IdP-provided identifier (email or stable ID); create if missing; ensure membership in the tenant.

Some IdPs send group memberships in the SAML response; map IdP groups to your roles.

## Mandatory SSO

For enterprise: "all users from acme.com must authenticate via SSO; no password login."

Implementation: tenant config says "SSO required for email domain X"; password login rejected for those emails.

Carefully: leave a break-glass admin (super-admin password account for emergencies if SSO breaks).

## SSO and multi-org users

Aaron uses your tool for both Acme (SSO required) and personal (no SSO). When signing in:
- Email Aaron@acme.com → SSO via Acme's IdP.
- Email Aaron@personal.com → password login.

The email determines the auth path. Multi-tenant users may have different auth methods per tenant.

## Cost of SSO

Building / maintaining SAML + OIDC support yourself: significant engineering. Tools:

- **WorkOS.** Specifically focused on B2B SSO. Drop-in API; supports all major IdPs.
- **Auth0.** SSO is core feature; broad IdP support.
- **Clerk.** Modern B2B auth with SSO included.
- **Okta Workforce Identity.** Many tools integrate.

Most early-stage SaaS use WorkOS or Auth0 rather than build SSO themselves. Cost is real ($X00-X000/mo at modest scale) but less than engineering DIY.

## Pricing SSO

Common pattern: SSO is enterprise-tier only.

Pro plan: password + Google login.  
Enterprise plan: + SSO via SAML / OIDC.

Reason: SSO is a hard requirement for enterprise; bundling it with enterprise tier is logical pricing. Some critics argue "SSO tax" is unfair (security shouldn't be premium); some companies (Tailscale) include SSO at all paid tiers. Your call.

## SCIM — the related-but-different protocol

SCIM (System for Cross-domain Identity Management) provisions / deprovisions users:

- New employee at Acme → Okta creates user → SCIM pushes to your SaaS.
- Employee leaves → Okta deletes → SCIM removes from your SaaS.

Without SCIM: tenant admins manually invite each user; deprovisioning forgotten.

Cover SCIM separately. Often paired with SSO.

## Common mistakes

- **Build SAML yourself.** Library bugs; signature wrap attacks; tested-libraries-only.
- **Skip SSO for early enterprise.** Lose deals.
- **No SP-initiated AND IdP-initiated.** Some flows break.
- **SSO without SCIM.** Deprovisioning forgotten.
- **No break-glass admin.** SSO breaks; can't recover.

## Summary

- SSO = enterprise sign-in via IdP (Okta, Azure AD, etc.).
- SAML 2.0 (XML, older) + OIDC (JSON, modern).
- Per-tenant SSO config; users from domain X go to tenant X's IdP.
- Just-in-time provisioning creates accounts on first login.
- WorkOS / Auth0 / Clerk handle the complexity for you.
- SSO usually enterprise-tier; SCIM provisions users.

Next: SCIM.
