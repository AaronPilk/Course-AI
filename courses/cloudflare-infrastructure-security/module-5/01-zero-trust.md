---
module: 5
position: 1
title: "Zero Trust — what it means and what Cloudflare provides"
objective: "Apply Zero Trust principles to internal apps."
estimated_minutes: 9
---

# Zero Trust — what it means and what Cloudflare provides

## The puzzle

"Zero Trust" gets thrown around as a marketing term. The actual concept is simple — and Cloudflare's Zero Trust products are a concrete way to apply it, replacing VPNs for many use cases.

## The simple version

**Zero Trust** = no implicit trust based on network location. Don't assume "inside the corporate network = safe." Every request, internal or external, is authenticated and authorized.

Cloudflare's Zero Trust includes:

- **Access** — gate web apps behind identity (Google SSO, Okta, etc.).
- **Tunnel** — connect internal services to Cloudflare without public IPs.
- **WARP / Gateway** — client-side device protection (DNS filtering, etc.).
- **Browser Isolation** — render risky web content in a remote browser.

The Access + Tunnel combination replaces traditional VPNs for most teams.

## The technical version

### What "Zero Trust" actually means

Old model: corporate network is a moat. Outside is dangerous; inside is safe. VPN to get inside.

Problems:

- VPN is binary: in or out. Compromised employee laptop = full network access.
- Network location ≠ identity.
- Cloud services and remote work make "inside" meaningless.

Zero Trust:

- Identify every user and device.
- Apply policy per-request (not per-session).
- Authorize based on identity + context (device posture, location, time) — not network.
- Assume hostile network always.

### Cloudflare Access

Access is Cloudflare's identity-aware proxy. You point internal apps at Cloudflare; users authenticate via SSO; only authorized users reach the app.

Setup:

1. Add the app to Cloudflare Access (route on your domain).
2. Configure identity provider (Google, Okta, Azure AD, etc.).
3. Set policies ("allow users in `engineering@company.com` group").
4. Done. Users hitting the app get the SSO flow; only authorized ones pass through.

The app itself doesn't need auth — Access handles it. Or it can layer with the app's own auth for defense in depth.

### Cloudflare Tunnel

Tunnel lets your internal services connect to Cloudflare without exposing public IPs. A `cloudflared` daemon runs on your origin; it dials out to Cloudflare; Cloudflare routes traffic to it.

Benefits:

- **No inbound ports** on origin.
- **No public IP** required.
- **Survives behind NAT** and most firewalls.
- **Origin firewall lockdown is automatic** — origin only accepts the tunnel connection.

Setup:

```bash
# Install
cloudflared tunnel create my-tunnel
cloudflared tunnel route dns my-tunnel internal.example.com

# Run
cloudflared tunnel run my-tunnel
```

The tunnel persists; Cloudflare routes `internal.example.com` traffic to your local service. Combine with Access for identity gating.

### Tunnel + Access pattern

The canonical Cloudflare Zero Trust pattern:

```
User → SSO via Cloudflare Access → tunnel → internal service
```

Walks through:

1. User hits `internal.example.com`.
2. Cloudflare Access checks identity (redirects to SSO if not authenticated).
3. If authorized, request flows through the tunnel.
4. Internal service responds.
5. Response back through tunnel to Cloudflare to user.

No VPN. No public IP on origin. Identity-aware access from anywhere.

### WARP and Gateway

WARP is Cloudflare's client (desktop / mobile app). Functions:

- **DNS filtering**: block malicious / inappropriate domains.
- **VPN-like tunnel** to Cloudflare's network.
- **Device-aware policy** when combined with Gateway.

Gateway is the policy / filtering engine. Together they enable:

- Block phishing domains.
- Enforce SaaS access policies.
- Log device traffic for analysis.

For most small teams: optional. For larger orgs / regulated environments: standard.

### Browser Isolation

Renders risky web content (suspicious links, unknown attachments) in a remote browser; only safe rendering pixels reach the user. Useful for high-risk roles (executives, finance).

Specialized; nice to have; not core.

### Policies

Access policies can use many factors:

- **Identity**: which user, which group.
- **Device posture**: managed device, OS version, anti-virus running.
- **Location**: IP geo, country.
- **Time**: only during business hours.
- **Service tokens**: machine-to-machine auth without SSO.

Combine:

```
Allow if:
  user.email in engineering@company.com
  AND device.managed = true
  AND ip.geoip.country in ["US", "CA", "UK"]
  AND time.hour in 6..22
```

### Zero Trust vs. VPN

| Aspect | VPN | Cloudflare Zero Trust |
|---|---|---|
| Trust model | Network-based | Identity-based |
| Granularity | Full network access | Per-app |
| Setup for new app | New firewall rules | Add to Access |
| Remote work | Slow VPN servers | Edge-fast |
| Compromised device | Full network exposed | Per-app policies still enforce |

For most use cases, Zero Trust is structurally better. VPN remains useful for legacy protocols / specific cases.

### Pricing

Free tier of Cloudflare Zero Trust:

- **50 users included.**
- Most features (Access, Tunnel, WARP, basic Gateway).
- Great for small teams to get started.

Paid tiers scale up to enterprise. For most small teams, free covers everything you need.

### What Cloudflare Zero Trust doesn't replace

- **Authentication inside your apps** — Access provides identity at the edge; your app might still need its own session management.
- **Authorization within apps** — Access decides who gets to the app; in-app permissions are still your responsibility.
- **All VPN cases** — some legacy protocols don't fit; non-HTTP services need different patterns.

### Setting up your first Zero Trust app

1. Pick an internal app (admin dashboard, internal docs).
2. In Cloudflare Zero Trust dashboard: Applications → Add Application → Self-Hosted.
3. Domain: `internal.example.com`.
4. Set identity provider (Google, Okta, etc.) — connect via OAuth.
5. Add policy: "Allow users in @company.com email."
6. Set up tunnel: `cloudflared tunnel create internal-tunnel`.
7. Route the tunnel to your internal service.
8. Test from outside your office — should redirect through SSO, then access the app.

Total time: an hour or two. Replaces VPN for that specific app.

## Three real-world scenarios

**Scenario 1: The VPN replacement.**
A team had 20 internal apps behind a VPN. Slow, hard to manage, painful for remote workers. Migrated to Cloudflare Tunnel + Access. Free tier covered everything. Apps now accessible from anywhere with SSO. VPN retired.

**Scenario 2: The compromised laptop.**
A laptop was compromised. With the old VPN model, the attacker would have had broad network access. With Zero Trust, they could only reach apps the user's identity was authorized for; granular access policies limited damage.

**Scenario 3: The contractor flow.**
A team needed to give a contractor access to one specific app for one week. With VPN: pain (provision account, network access). With Cloudflare Access: invite their email, set policy "expires in 7 days, access to app X only." Done in 5 minutes.

## Common mistakes to avoid

- **Confusing Access with replacing app auth entirely.** Access provides identity; your app may still need session management.
- **Forgetting Tunnel's automatic origin lockdown.** Don't also publicly expose origin — defeats the purpose.
- **Over-broad policies** ("allow @company.com" instead of specific teams). Limits damage potential.
- **No periodic policy review.** Old roles, departed employees, stale rules.
- **VPN running in parallel.** Pick one; consolidate.

## Read more

- [Cloudflare Zero Trust](https://developers.cloudflare.com/cloudflare-one/)
- [Access policies](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)

## Summary

- **Zero Trust** = no implicit trust by network location; identity + context for every request.
- **Cloudflare Access** = identity-aware proxy for internal apps (SSO + policies).
- **Cloudflare Tunnel** = secure connection from origin to Cloudflare without public IPs.
- **Tunnel + Access** = canonical pattern replacing VPNs for most teams.
- **Free tier** covers 50 users — great for small teams.
- **WARP / Gateway / Browser Isolation** are specialized add-ons.
- **Doesn't replace** in-app auth or in-app authorization; layers above them.

Next: Cloudflare Tunnel in detail.
