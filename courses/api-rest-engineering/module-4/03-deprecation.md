---
module: 4
position: 3
title: "Deprecation: announcing the future"
objective: "Phase out old behavior without surprising consumers."
estimated_minutes: 5
---

# Deprecation: announcing the future

## What deprecation means

A deprecated feature still works but is marked for removal. Consumers are warned to migrate. After a deprecation period, the feature is removed (sunset).

The deprecation period gives consumers time to migrate. Skipping it (just remove on shutoff date) causes breakage.

## The lifecycle

```
1. Decide to deprecate.
2. Announce: blog post, email, docs update.
3. Add Deprecation headers to responses.
4. Wait (months to years).
5. Final warnings (email, dashboard banner).
6. Sunset date: remove or 410 Gone.
```

The wait is the important part. Typical: 6-12 months for B2B APIs; longer for high-value (Stripe deprecates over years).

## RFC 8594 — Deprecation header

Standardized way to signal deprecation in responses:

```
HTTP/1.1 200 OK
Deprecation: true
Deprecation: Wed, 21 Oct 2026 07:28:00 GMT
Sunset: Wed, 21 Apr 2027 07:28:00 GMT
Link: <https://docs.example.com/migrate-to-v2>; rel="deprecation"
```

- `Deprecation: true` — endpoint is deprecated (no specific date).
- `Deprecation: <HTTP-date>` — date deprecation became effective.
- `Sunset: <HTTP-date>` — date it will be removed (RFC 8594).
- `Link: rel="deprecation"` — pointer to migration docs.

Clients monitoring response headers (or alerting on them) catch deprecation early. Some SDKs surface deprecation warnings to developers.

## Beyond headers

Headers alone aren't enough. Most consumers don't watch them. Add:

- **Documentation updates.** Big banner: "This endpoint is deprecated; migrate to X."
- **Email notifications.** To affected customers (you know who's hitting deprecated endpoints from logs).
- **Dashboard warnings.** Visible when devs visit your platform UI.
- **Changelog posts.** Searchable; archived; permanent.
- **Direct outreach.** For high-value customers using deprecated features heavily.

The communication is more work than the code change. Mature companies have entire processes around it.

## Identifying who's still using deprecated features

Tag deprecated endpoints in metrics:

```
api_requests_total{endpoint="/v1/old", deprecated="true"} 12345
```

Track over time. Reach out to top users; help them migrate. Don't shut off until traffic drops to near zero.

For larger APIs, the long tail of low-volume consumers takes longest to migrate. Some never do; they get caught in the sunset.

## Sunset patterns

**Hard sunset.** On the date, the endpoint returns 410 Gone for everyone. Simple; abrupt.

**Soft sunset.** Returns 410 for some percent of requests, escalating. Catches consumers who ignored warnings; gives them one last chance to notice.

**Phased read-only.** Endpoint goes read-only first (POSTs return 410, GETs still work). Then later, GETs sunset too.

For high-stakes APIs, soft sunsets are kinder.

## After sunset

```
HTTP/1.1 410 Gone
Content-Type: application/json

{
  "error": {
    "code": "endpoint_removed",
    "message": "This endpoint was removed on 2027-04-21.",
    "doc_url": "https://docs.example.com/migrate-to-v2"
  }
}
```

Helpful error pointing consumers at the migration guide. Don't just return 404 (looks like a bug); 410 communicates "yes this existed, it's gone."

## When to deprecate

- Field/endpoint had a bug fundamental to its design.
- Better alternative exists.
- Maintenance burden exceeds value.
- Security concerns require changes.

Don't deprecate just to keep things tidy. Each deprecation costs consumers migration effort and you communication overhead.

## Avoiding deprecation when possible

Deprecation is expensive. Cheaper alternatives:

- **Add new, leave old.** Both work. Old keeps getting maintenance.
- **Internal redirect.** Old endpoint forwards to new server-side; same response.
- **Wrap old.** Old returns same shape, served by new infrastructure underneath.

Sometimes old features stick around forever because deprecating costs more than maintaining. Stripe's APIs have layers of legacy that never went away.

## Major version bumps and deprecation

In major version bumps, the new version doesn't have the old features. The old version is what's deprecated.

```
v1: has /users, /legacy/users
v2: only /users
```

Customers on v1 still see /legacy/users; customers on v2 don't.

Date version (Stripe-style): older versions keep old features; newer don't. Each customer migrates at their own pace.

## Mistakes to avoid

- **No deprecation period.** Removed without warning = broken consumers.
- **Deprecate but never sunset.** Tech debt accumulates.
- **Hard sunset without communication.** Consumers blindsided.
- **No migration guide.** Consumers don't know what to do.
- **404 instead of 410.** Looks like a bug, not a planned removal.

## Summary

- Deprecation = "still works, but will be removed." Sunset = "actually removed."
- Use `Deprecation` and `Sunset` headers (RFC 8594).
- Headers + docs + email + dashboard + direct outreach for important consumers.
- Track usage of deprecated features; don't sunset until traffic is near zero (or you've reached out to remaining users).
- 410 Gone with helpful error pointing to migration docs.
- Cheap alternatives to deprecation: internal redirects, dual-shape responses.

Next: OpenAPI and contract-first design.
