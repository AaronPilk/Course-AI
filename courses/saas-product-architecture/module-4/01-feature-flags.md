---
module: 4
position: 1
title: "Feature flags fundamentals"
objective: "Decouple deploy from release."
estimated_minutes: 5
---

# Feature flags fundamentals

## What feature flags do

Feature flags (toggles) are conditionals around feature code:

```python
if flag_enabled('new_checkout_v2', tenant=current_tenant):
    show_new_checkout()
else:
    show_old_checkout()
```

The flag is configured externally (dashboard, config file, service). You can flip behavior without redeploying.

Three superpowers:

1. **Deploy ≠ release.** Code can ship dark; flip the flag when ready.
2. **Gradual rollout.** 1% → 10% → 100% with telemetry between.
3. **Per-tenant control.** Enable for one customer; iterate; expand.

## Types of flags

**Release flags.** "Is this feature on?" Used during rollout; removed after stabilization.

**Experiment flags.** A/B test new variant; measure; pick winner. Removed after experiment.

**Permission / entitlement flags.** Tier gating. "Pro plan has feature X." Permanent.

**Operational flags.** Circuit breakers — "disable the expensive recommendation engine when load high." Long-lived.

**Kill switches.** Emergency shut-off if a new feature misbehaves. Short-lived.

Each has different lifecycle. Release flags should be removed once stable; entitlement flags live forever; experiment flags last weeks.

## Where flags live

**Hardcoded.** `if FLAG: ...`. Quickest; requires redeploy to change.

**Environment variable.** `if os.environ.get('FLAG') == 'true': ...`. Restart to change.

**Config file.** YAML / JSON in repo or fetched at startup. Some apps reload on file change.

**Database / Redis.** Store flag state; app reads on each request. Slow if not cached.

**Feature flag service.** LaunchDarkly, Statsig, PostHog, GrowthBook, Flagsmith, Unleash. Web UI; SDKs; analytics integration; advanced targeting. Production-grade.

For real SaaS: use a service. Cost is modest; capabilities (gradual rollout, targeting rules, kill switches) are real.

## Flag evaluation

```python
def is_enabled(flag_name, context):
    # Pull rules for flag
    rules = get_rules(flag_name)
    
    # Evaluate against context (user, tenant, plan, etc.)
    for rule in rules:
        if rule.matches(context):
            return rule.value
    
    return rules.default
```

Rules can target:
- Specific users / tenants.
- Plan tier (Pro+).
- Percentage (50% of traffic).
- Attributes (region = EU; user signed up after date X).
- Combinations.

Feature flag services have sophisticated targeting. Custom solutions usually start simple and grow.

## Per-tenant flags

For SaaS, per-tenant is the most common targeting:

```python
if is_enabled('new_billing_ui', tenant=current_tenant):
    return new_billing_ui()
return old_billing_ui()
```

Enable for one beta tenant; verify; expand to top 10; eventually all.

```sql
CREATE TABLE feature_flags (
  flag_name TEXT,
  tenant_id UUID NULL,  -- NULL = global default
  enabled BOOLEAN,
  rollout_percentage INT,
  PRIMARY KEY (flag_name, tenant_id)
);
```

Tenant-specific row overrides global default. Service handles this elegantly.

## Gradual rollout

Standard pattern:

1. Deploy with flag off. Verify nothing broken.
2. Enable for internal team (your tenant). Dogfood.
3. Enable for 1% of customers. Watch metrics + errors for 1-2 days.
4. 10% → metrics check → 50% → check → 100%.
5. After 1-2 weeks at 100%, remove the flag from code.

If error rate spikes at 1%: flip back to 0% (kill switch). Investigate. Re-deploy. Try again.

This pattern catches most bugs before they affect many users.

## Identifying buckets

For "10% of users," need deterministic bucketing — same user always in same bucket:

```python
def hash_to_bucket(user_id, flag_name):
    return int(hashlib.sha256(f"{user_id}:{flag_name}".encode()).hexdigest(), 16) % 100

if hash_to_bucket(user.id, 'new_checkout') < 10:  # 10% rollout
    use_new_checkout()
```

The hash makes bucket assignment stable: same user with same flag always gets same bucket. So a user in the 10% test always sees the new feature; not flickering.

Different per flag: same user may be in 10% of flag A and 50% of flag B.

## A/B testing

Two variants of a feature; measure which performs better.

```python
variant = get_variant('checkout_button_color', user)
if variant == 'green':
    render_green_button()
elif variant == 'orange':
    render_orange_button()
```

Track conversion / engagement per variant. After enough samples (statistical significance), pick winner.

Statsig, PostHog, GrowthBook are A/B-first feature flag tools. LaunchDarkly has experimentation features. Designed to work together.

## Flag lifecycle and tech debt

Every flag in code is conditional complexity. Each flag adds branches; testing matrix grows; codepaths harder to reason about.

Discipline: remove flags after they stabilize. Audit quarterly; delete flags > 90 days old that are 100% rolled out.

Some teams put expiry dates on flags; alerts when expired flags remain.

The "we'll remove it later" promise often breaks. Force the removal.

## Kill switches

Different from release flags — these protect against failure:

```python
if KILL_SWITCH_NEW_FEATURE:  # default false; flip to true to disable
    return old_behavior()
return new_behavior()
```

Default to new behavior; flag is the "abort." Easy to flip in incidents.

For risky deployments: ship with kill switch; if metrics spike, flip; investigate.

## Permission / entitlement flags

For pricing tiers:

```python
if has_feature('sso_login', tenant=current_tenant):
    show_sso_button()
else:
    show_upgrade_prompt()
```

The check is: is the tenant on a plan that includes the feature? Lookup tenant.plan; check plan's feature set.

```sql
-- Plan definitions
CREATE TABLE plan_features (
  plan_id TEXT,
  feature_name TEXT,
  PRIMARY KEY (plan_id, feature_name)
);
```

Customer Pro tier = features {sso_login, advanced_analytics, ...}. Code checks tenant.plan_id; looks up plan's feature set.

Or simpler: a feature flag service with rules like `IF tenant.plan IN ('pro', 'enterprise') THEN ENABLED`.

## Mistakes to avoid

- **Hardcoded flags.** No flexibility.
- **Flag soup.** Hundreds never removed; codepaths impossible.
- **Hot path flag service calls.** Add latency; failure cascades. Cache + fallback.
- **Same flag two places.** Diverges; bugs.
- **No targeting per tenant.** Can't beta with one customer.

## Summary

- Feature flags decouple deploy from release; gradual rollout; per-tenant control.
- Types: release, experiment, permission, operational, kill switch.
- Use a service (LaunchDarkly, Statsig, PostHog, GrowthBook).
- Per-tenant targeting + percentage rollouts for SaaS.
- Stable bucketing via hash for consistency.
- Remove release flags after stabilization (90 days max).

Next: per-tenant entitlements.
