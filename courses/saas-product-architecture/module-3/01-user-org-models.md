---
module: 3
position: 1
title: "User vs organization models"
objective: "Get the foundational identity model right."
estimated_minutes: 5
---

# User vs organization models

## The two identity layers

SaaS identity has two layers:

- **User.** A person (or service account). One human, one identity.
- **Organization (tenant, workspace, team, account).** A group the user belongs to.

The relationship between them shapes the entire SaaS:

```
User Aaron → belongs to → Tenant "Acme"
                       → belongs to → Tenant "Beta"
```

A user can belong to multiple organizations (Slack model). Or each user belongs to exactly one (most B2C SaaS).

## Single-org per user

```
User → Tenant (1:1)
```

Simplest. Email maps to user maps to tenant.

- **Notion (legacy).** One email = one workspace originally; now multi-workspace.
- **Most B2C SaaS.** Stripe accounts, Twitter, single-tenant tools.

Pros: simpler data model. Cons: people often need multi-tenant (work + personal; multiple clients).

## Multi-org per user

```
User → (M:N) → Tenants
```

The user logs in; sees their organizations; picks one; that's the active context.

- **Slack.** One Slack account; many workspaces.
- **Linear.** One identity; many workspaces.
- **GitHub.** Personal user + many orgs (companies / clubs).

This is the modern default for B2B SaaS. People often use one tool across multiple companies / clients.

## Memberships

The M:N relationship lives in a memberships table:

```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  role TEXT NOT NULL,  -- 'admin', 'member', 'guest'
  joined_at TIMESTAMPTZ,
  invited_by UUID,
  UNIQUE(user_id, tenant_id)
);
```

Roles per-tenant: Aaron is admin in Acme, member in Beta.

## Switching context

The UI must let users switch between tenants. Common patterns:

- **Subdomain.** `acme.app.com` vs `beta.app.com`. Switching tenants = redirect.
- **Workspace switcher.** Dropdown in header; pick a workspace; URL changes.
- **Separate sessions.** Each tab can be a different tenant.

Slack uses workspace switcher; Stripe uses account switcher; GitHub uses URL prefix.

The active tenant is part of every request's context (header, JWT, session). Server validates membership before authorizing.

## Invitations

For a tenant admin to add users:

1. Admin enters email of invitee.
2. App sends invitation email with signed link.
3. Invitee clicks; lands on accept-invitation page.
4. If invitee has account: sign in, join tenant.
5. If not: sign up + automatically join.

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invited_by UUID,
  token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ
);
```

Token is a long random string; passed via email link. On accept, create membership; mark invitation accepted.

## Auto-join by email domain

Common for B2B: if Aaron@acme.com signs up, auto-join the "acme" tenant.

```python
if user.email.endswith('@acme.com'):
    auto_join(tenant_id=acme.id, user_id=user.id, role='member')
```

Useful for company-wide tools. Risk: someone with @acme.com getting auto-admin access. Limit to non-admin roles; require approval for admin.

Some tools (Slack) make this configurable per tenant ("allow @acme.com to join automatically").

## Personal accounts vs organizations

```
GitHub: user "aaron" can own repos; org "acme" can own repos.
```

Both are "accounts" in some sense; users own personal namespaces; orgs are shared namespaces with multiple members.

For most SaaS: just orgs (workspaces, tenants). Personal namespaces add complexity; only worth it for some patterns (publishing, public profiles).

## Federation and identity providers

Enterprise customers want SSO:
- Single sign-on through their identity provider (Okta, Azure AD, Google Workspace).
- User accounts provisioned automatically (SCIM, covered later).
- Deprovisioning when employee leaves.

Covered in the SSO lesson; the data model accommodates: a user has an `external_id` from the IdP; identity provider takes over auth; your app still manages app-level state.

## Service accounts

For programmatic access: a "user" that's actually an API key:

```sql
CREATE TABLE service_accounts (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  name TEXT,
  api_key_hash TEXT,
  created_by UUID,
  scopes TEXT[]
);
```

Service accounts belong to a tenant; they're auditable like users. API keys map to a service account; requests inherit its permissions.

For internal automation, integrations, CI/CD pulling from your API.

## User deletion

When a user leaves:
- Memberships removed.
- Personal data deleted (GDPR).
- Owned resources transferred / archived.
- Audit logs preserve historical (sometimes with anonymization).

Plan the deletion flow. Customers (especially enterprise) expect it.

## Multi-tenancy intersect identity

The right active tenant determines:
- What data the user can see (covered in multi-tenancy module).
- What features (entitlements per tenant).
- Billing (which subscription the request counts against).

Auth → tenant context → tenant-scoped queries. All connected.

## Common confusions

- **Mixing user-owned and tenant-owned data.** Some data is user-level (preferences, avatar); some is tenant-level (orders, settings). Distinguish.
- **No multi-tenancy support from day one.** Single-tenant code; adding multi-tenancy later is expensive.
- **User can't be in multiple tenants.** Most B2B users need this.
- **No service accounts.** Then API users use real user accounts; confusion.

## Summary

- User = person; Org/Tenant = group.
- Memberships (M:N) for multi-tenant users.
- Per-tenant roles (admin / member / guest).
- Workspace switcher / subdomain / separate sessions for switching.
- Invitations via signed-token email links.
- Auto-join by email domain (carefully — non-admin only).
- Service accounts for programmatic access.

Next: SSO and SAML.
