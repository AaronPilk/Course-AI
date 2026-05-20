---
module: 2
position: 4
title: "Per-endpoint authorization and scopes"
objective: "Who can do what — the layer most APIs underbuild."
estimated_minutes: 5
---

# Per-endpoint authorization and scopes

## Authn vs authz, again

Authentication: who you are. Authorization: what you can do.

Authentication is usually a single middleware layer (validate JWT, check API key, etc.). Authorization is per-endpoint, per-resource — much more granular, harder to get right.

The OWASP Top 10's #1 vulnerability for years has been "Broken Access Control" — almost always an authorization bug, not authentication.

## RBAC — role-based access control

The simplest model: users have roles; roles have permissions.

```
User Aaron → role: "admin"
User Linus → role: "viewer"

Roles:
  admin:    can read/write/delete everything
  editor:   can read/write
  viewer:   can read
```

Implementation:

```python
def can(user, action, resource):
    return action in ROLE_PERMISSIONS[user.role]

@app.route('/users/<id>', methods=['DELETE'])
def delete_user(id):
    if not can(g.user, 'delete', 'user'):
        abort(403)
    ...
```

RBAC is enough for many apps. Falls short when permissions need to depend on the specific resource (Aaron can delete his own orders, not Linus's).

## ABAC — attribute-based

Permissions evaluated dynamically based on attributes:

```python
def can(user, action, resource):
    if action == 'delete' and resource.type == 'order':
        return resource.user_id == user.id or user.role == 'admin'
    ...
```

More expressive than RBAC; harder to reason about. Tools like Open Policy Agent (OPA) externalize policies as code.

## ReBAC — relationship-based

Google's Zanzibar paper popularized this:

```
viewer(document:123, user:aaron)        # explicit
editor(folder:abc) → editor(document:123)   # via folder
```

Permissions traverse relationships. Suitable for collaborative apps (Docs, Notion). Open-source implementations: SpiceDB, OpenFGA, Permify, Cerbos.

For most APIs: start with RBAC or simple ABAC. Move to ReBAC when relationships are central (sharing, collaboration).

## OAuth scopes — authorization for external clients

For OAuth-protected APIs, scopes restrict what a token can do:

```
GET /api/files                    # token needs scope: read.files
POST /api/files                   # token needs scope: write.files
DELETE /api/files/{id}            # token needs scope: write.files
GET /api/admin/users              # token needs scope: admin.users
```

User grants scopes when authorizing the app. Server checks the token's scopes per request.

Scope design matters:
- **Too granular.** "read.files.public", "read.files.private", "read.files.shared" — users overwhelmed.
- **Too coarse.** "read.everything" — bad for least-privilege.
- **Just right.** Maps to natural permission groups: "read.files", "write.files", "admin".

GitHub's scopes (`repo`, `repo:status`, `public_repo`, `read:user`) are a good study. Stripe's scopes are simpler (just read vs read/write).

## Multi-tenant authorization

For B2B SaaS, the central question: this request from User X, operating in Tenant Y, can do action Z on Resource R — yes or no?

Patterns:

**Tenant scope on every query.**

```sql
SELECT * FROM orders WHERE id = $1 AND tenant_id = $2
```

Even if access control fails, queries can't return data from other tenants.

**Row-Level Security (RLS).** Postgres / Supabase support this — policies in the DB enforce tenant isolation. App can't bug-cause cross-tenant leaks.

**Separate databases per tenant.** Strongest isolation; more operational overhead.

For most B2B SaaS: tenant_id on every table + scoped queries + maybe RLS. Bugs at the app layer can't easily leak data.

## IDOR — the bug everyone has

Insecure Direct Object References:

```
GET /api/orders/12345
```

Server checks: is the user authenticated? Yes. Returns the order. Doesn't check: does this order belong to this user?

User Aaron iterates IDs: 12340, 12341, 12342, ... reads everyone's orders.

Fix: every query scoped to the authenticated user/tenant.

```sql
SELECT * FROM orders WHERE id = $1 AND user_id = $2
```

Test every endpoint: as User A, can I access User B's data? If yes, IDOR.

OWASP Top 10 #1 in 2021. Universal pattern; everyone has it somewhere; testing matters.

## Authorization in middleware vs handlers

**Middleware.** Centralized checks. Good for "is the user authenticated?" Not enough for resource-level checks.

**Handlers.** Per-endpoint logic. Slow to evolve consistent rules.

**Policy engine.** External (OPA, Cerbos) defines policies; app calls "can(user, action, resource)?". Centralizes complex logic.

For new APIs: define authorization as code (policy files), call from handlers. Avoid scattered conditionals.

## Defaults: default deny

Always deny unless explicitly allowed. Bug → request rejected. Better than "allow unless explicitly denied" (bug → request allowed = security incident).

```python
def can(user, action, resource):
    if not user.is_authenticated:
        return False
    # explicit allows only
    ...
    return False  # default deny
```

Routes you forgot to handle in policy = blocked. Better failure mode.

## Per-endpoint enforcement

For every authenticated endpoint, ask:

- Who can call this?
- What resource scope applies (user-level, tenant-level, public)?
- Is authentication checked?
- Is the right resource ownership checked?
- Is the user in the right role / has the right scope?

Tests: automated authorization tests per endpoint (different user roles, different resource owners). Catches IDOR before deploys.

## Mistakes to avoid

- **Authentication without authorization.** Logged in = full access. IDOR everywhere.
- **Inconsistent rules.** Endpoint A enforces tenant; endpoint B doesn't.
- **Permissions in client code.** Server doesn't enforce; trust client. Easily bypassed.
- **No tests.** Authorization bugs invisible until reported.
- **Default allow.** Bug → security incident.

## Summary

- Authentication ≠ authorization. Authorization is per-endpoint, per-resource.
- RBAC (roles) for simple needs; ABAC (attributes) for dynamic; ReBAC for collaborative.
- OAuth scopes for external clients; design to fit natural permission groups.
- Multi-tenant: tenant_id on queries + RLS.
- IDOR is the #1 OWASP vulnerability; test every endpoint.
- Default deny; policy as code; automated authorization tests.

Module 2 complete. Next module: collections and errors.
