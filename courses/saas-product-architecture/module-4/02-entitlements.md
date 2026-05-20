---
module: 4
position: 2
title: "Per-tenant entitlements and gating"
objective: "Define what each plan can do — and let it change cleanly."
estimated_minutes: 5
---

# Per-tenant entitlements and gating

## What entitlements are

Entitlements = what a customer is allowed to do. They map to your pricing tiers:

```
Free tier: 3 projects, 5 collaborators, basic support
Pro tier:  unlimited projects, 50 collaborators, priority support, SSO
Enterprise: + SCIM, audit logs, dedicated support
```

When a user tries to create a 4th project on free tier, the entitlement system says "no" or "upgrade to continue."

Two kinds:
- **Quantitative limits.** "Max 5 collaborators." Hard cap.
- **Feature toggles.** "SSO included." Boolean.

## Entitlement data model

```sql
-- Plans
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT,
  monthly_price_cents INT,
  metadata JSONB  -- limits + features here
);

-- Tenants → plans
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  plan_id TEXT REFERENCES plans(id),
  custom_entitlements JSONB  -- override
);
```

Plans define the default entitlements. Tenants can override (enterprise contracts often have custom limits).

```json
// plans.metadata
{
  "max_projects": 3,
  "max_collaborators": 5,
  "features": ["basic_support"],
  "api_rate_limit": 100
}

// tenants.custom_entitlements (for an enterprise customer)
{
  "max_collaborators": 200,
  "features": ["basic_support", "sso", "audit_logs", "premium_support"]
}
```

Custom overrides merge over plan defaults.

## Checking entitlements

```python
def can_create_project(tenant):
    current = count_projects(tenant)
    limit = get_entitlement(tenant, 'max_projects')
    if current >= limit:
        raise EntitlementExceeded('project limit reached')
    return True

def has_feature(tenant, feature):
    entitlements = get_entitlements(tenant)
    return feature in entitlements['features']
```

Every action that could be gated checks; either allows or returns "upgrade prompt."

For UI: hide / disable / show locked icon based on entitlement. Don't just rely on server-side check; UX matters.

## When customers upgrade / downgrade

When plan changes:
- Webhook from Stripe → "plan_id changed."
- Your app updates the tenant's plan_id.
- Next request, entitlements reflect new plan.

For downgrades that violate limits ("downgraded from Pro to Free; have 10 collaborators but Free allows 5"):
- **Soft enforcement.** Grandfathered; show "you're over limit; reduce or upgrade." Don't break things.
- **Hard enforcement.** Block until under limit. Aggressive; sometimes appropriate.

Most SaaS goes soft for downgrades; hard for new additions ("can't add a 6th collaborator").

## Trial periods

During trial, customer has Pro-tier entitlements. At trial end:
- Downgrade to Free tier (entitlements drop).
- Block features they were using.
- Push them to subscribe.

Manage via `trial_ends_at` timestamp + scheduled job that converts.

## Upgrade prompts (in-app)

When user hits a limit:

```
You've reached your 3-project limit on the Free plan.
[Upgrade to Pro for unlimited projects]
```

The UI shows the cap; offers upgrade. Conversion rate from these prompts is high (customer demonstrated need).

## Custom enterprise entitlements

For enterprise customers with negotiated contracts:
- Custom collaborator count (200 specifically; not standard 50).
- Specific feature combinations.
- Custom rate limits.

Stored as overrides on the tenant row. Sales team / customer success can configure via admin tool.

## Feature flags vs entitlements

Both gate code. Different intent:

- **Feature flags.** Temporary; per-tenant for testing; eventually removed.
- **Entitlements.** Permanent; per-plan / per-tier; pricing-driven.

You can implement both with similar mechanisms (feature flag service supports plans + percentage). Many SaaS use the same service for both.

LaunchDarkly, Statsig support targeting by plan; you check "is feature X enabled for this tenant?" without caring whether the answer comes from flag config or plan definition.

## Cross-service entitlements

For larger SaaS, multiple services check the same entitlements:
- Web app: "show feature?"
- API: "allow this request?"
- Backend job: "process for this tenant?"

Need a shared entitlement service / cache. Common pattern: load tenant entitlements once per request from cache; all services check.

```python
@cache(ttl=300)
def get_entitlements(tenant_id):
    return db.query(...)

# Each service checks:
ents = get_entitlements(g.tenant_id)
if 'feature_x' not in ents['features']:
    raise NotEntitled()
```

Cache for 5 minutes; invalidate on plan changes (Stripe webhook → publish to invalidation channel).

## Quota tracking and metering

For quotas like "10K API requests / month":
- Increment counter on each request.
- Compare to limit.
- Block at limit (or alert at 80%).

The counter lives in a fast store (Redis); resets monthly. Tools (Stripe Billing, Orb) help track usage + entitlements together.

## Entitlements vs RBAC

Entitlements: what the TENANT can do (gated by plan).
RBAC (roles): what the USER can do within a tenant (gated by membership role).

Both check on every request:
```python
if not tenant_has_feature(tenant, 'audit_log'):
    abort(403, "Plan doesn't include this")
if not user_has_role(user, 'admin'):
    abort(403, "Only admins can do this")
```

Two layers; both enforced.

## Common mistakes

- **Hardcoded limits.** Change requires deploy.
- **Per-tenant overrides scattered.** Hard to audit.
- **Soft enforcement everywhere.** Limits become guidelines.
- **No upgrade prompts.** Users hit limits silently; don't convert.
- **Different checks per service.** Inconsistent; bugs.

## Summary

- Entitlements = what tenant's plan allows.
- Plans define defaults; tenants can override (enterprise).
- Check on every gateable action; show upgrade prompts in UI.
- Trial = temporary entitlement boost; downgrade at end.
- Cache entitlements; invalidate on plan changes.
- Distinguish from RBAC (user role within tenant).

Next: experimentation and A/B testing.
