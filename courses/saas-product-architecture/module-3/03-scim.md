---
module: 3
position: 3
title: "SCIM and user provisioning"
objective: "Auto-create and deprovision users from the customer's IdP."
estimated_minutes: 5
---

# SCIM and user provisioning

## What SCIM solves

Without automation: tenant admin manually invites every new employee; when employees leave, admin must remember to remove them.

In big orgs (10K+ employees), manual is impossible. Solution: SCIM (System for Cross-domain Identity Management) — IdP pushes user changes to your SaaS automatically.

## The flow

```
Company hires Aaron → HR system updates Okta → 
  Okta pushes via SCIM to your SaaS → 
  Your SaaS auto-creates Aaron's account in the tenant

Aaron quits → HR offboards in Okta → 
  Okta sends SCIM delete → 
  Your SaaS deprovisions Aaron (deactivate / delete)
```

The customer's IdP becomes the source of truth for user lifecycle; your SaaS reflects it.

## SCIM endpoints

SCIM is a REST-ish standard. Your SaaS exposes:

```
POST   /scim/v2/Users         # create user
GET    /scim/v2/Users/{id}    # get user
PATCH  /scim/v2/Users/{id}    # update (e.g., mark inactive)
DELETE /scim/v2/Users/{id}    # delete
GET    /scim/v2/Users         # list users
POST   /scim/v2/Groups        # create group
... etc
```

IdP makes these calls when events happen. You implement the endpoints; IdP configured with your URL + auth token.

## Standard schema

```json
{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "id": "user_123",
  "userName": "aaron@example.com",
  "name": {
    "givenName": "Aaron",
    "familyName": "Bell"
  },
  "emails": [{"value": "aaron@example.com", "primary": true}],
  "active": true,
  "groups": [...]
}
```

Standardized fields; extensions for app-specific. Your SaaS maps to your internal user model.

## Provisioning patterns

**Create.** New user appears via SCIM → create your user row + membership in the SSO-bound tenant.

**Update.** Field changes → update your user row.

**Deactivate.** `active: false` from SCIM → mark user inactive; deny new sessions. Existing sessions terminated.

**Delete.** `DELETE /scim/v2/Users/123` → soft-delete the user (keep for audit / billing reconciliation) or hard-delete depending on policy.

Groups → map to your roles or teams. SCIM groups push membership changes; you reflect in your tenant's roles.

## SCIM authentication

The IdP authenticates to your SCIM endpoints via:
- **Bearer token.** Customer's admin generates a token in your app; pastes into IdP config.
- **OAuth.** Rarer; full OAuth flow between IdP and your app.

Token per tenant; if compromised, regenerate. Audit token use; rotate periodically.

## Implementing SCIM is non-trivial

Implementing SCIM endpoints from scratch: weeks of work, plenty of edge cases (group hierarchies, attribute mappings, IdP-specific quirks).

Most teams use:
- **WorkOS.** Drop-in SCIM API; abstracts IdP differences.
- **SCIM playground / open-source libraries.** Quick start; many edge cases.

For enterprise SaaS: SCIM is expected; budget the engineering or pay for the platform.

## Per-tenant SCIM config

Each tenant that uses SCIM has its own config:

```sql
CREATE TABLE scim_configs (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  enabled BOOLEAN,
  bearer_token_hash TEXT,  -- hashed; rotate-able
  base_url TEXT,           -- your endpoint URL (often per-tenant subdomain)
  default_role TEXT
);
```

Tenant admin enables SCIM in your app; gets URL + token; configures Okta with these.

## Group sync — the hard part

Mapping IdP groups → your roles is messy:
- Okta group "Engineering" → your role "admin"?
- Okta group "Marketing" → your role "member"?

Per-tenant config: map IdP group name → SaaS role. Tenant admin sets this up.

Some apps support more granular: groups → access to specific features / projects. The complexity grows quickly.

## Edge cases

- **User in multiple groups.** Highest-privilege role wins.
- **User removed from group but not deleted.** Update role; don't deactivate.
- **Group deleted.** Users in that group lose their role; may default to lowest.
- **User has multiple emails / aliases.** Match by primary email; handle changes.

Each IdP (Okta, Azure AD, Google) sends slightly different payloads. Test against the major ones.

## Deactivation vs deletion

**Deactivate.** User flagged inactive; can't log in. Data retained.

**Delete.** User and personal data removed (with GDPR considerations).

Typical pattern: SCIM `active: false` → deactivate (keep data; possibly reactivate later if mistake). Hard delete only on explicit cleanup or after long retention.

Audit logs reference user IDs; deleted users still show in history as "deleted_user_123" or similar.

## SCIM ≠ SSO

SSO is authentication (logging in). SCIM is provisioning (creating accounts). They're complementary:

- SSO without SCIM: users log in via IdP; you have to manually invite each to the tenant.
- SCIM without SSO: users auto-created but still use password to log in.
- Both: full automation. Enterprise expects.

Roll them out together for enterprise customers.

## Cost / packaging

SCIM is enterprise-tier almost universally. Costs:
- Engineering / WorkOS-style platform fees.
- Per-IdP testing / support.
- Ongoing customer onboarding (similar to SSO setup).

Charge accordingly. Enterprise pricing absorbs.

## Mistakes to avoid

- **No SCIM for big enterprise customers.** They'll have manual offboarding bugs.
- **SCIM but no SSO.** Half-automation.
- **No audit logs.** Can't trace which IdP push did what.
- **Hard-delete on every SCIM delete.** Loses audit trail.
- **Build SCIM from scratch.** Significant ongoing cost.

## Summary

- SCIM = automated user provisioning from IdP to your SaaS.
- IdP pushes create/update/deactivate/delete events via REST endpoints.
- Per-tenant config (URL + bearer token).
- Groups map to your roles.
- WorkOS / dedicated platforms ease implementation.
- Roll out alongside SSO for enterprise customers.

Next: auth services overview.
