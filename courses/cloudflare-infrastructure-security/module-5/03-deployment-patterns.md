---
module: 5
position: 3
title: "Deployment patterns — what to put behind Cloudflare"
objective: "Decide which traffic should flow through Cloudflare vs. direct."
estimated_minutes: 8
---

# Deployment patterns — what to put behind Cloudflare

## The puzzle

You have a list of services: web app, API, admin dashboard, marketing site, internal tools, mail server, customer files, SaaS partner webhooks. Which go through Cloudflare? Which don't? In what configuration?

This lesson is the patterns that work in practice.

## The simple version

Default: **put HTTP-facing services behind Cloudflare** (proxy mode on). Keep non-HTTP services gray-cloud. Use Tunnel for internal stuff. Use Pages / Workers for greenfield projects.

The specific patterns below cover the decisions you'll actually face.

## The technical version

### Pattern 1: Public web app

```
users → Cloudflare (proxied) → origin on cloud
```

- DNS in Cloudflare, orange-cloud.
- Origin behind firewall locked to Cloudflare IPs.
- WAF + rate limits + bot management active.
- Full (strict) SSL with Origin Cert.

Most production web apps. The canonical pattern.

### Pattern 2: Public API

Same as web, with API-specific tuning:

- Rate limits per API key (advanced rate limiting on paid).
- Per-endpoint rules (different limits for /search vs /heavy).
- CORS headers configured at Cloudflare or origin.
- Bot management tuned for legitimate API clients (which look bot-like).

### Pattern 3: Marketing / static site

```
users → Cloudflare (proxied) → Cloudflare Pages
```

- Built from git on every push.
- Edge caching automatic.
- Free egress.
- Preview deploys per branch.

For static + Jamstack work, Pages is usually cleaner than running your own server.

### Pattern 4: Internal admin

```
users (auth required) → Cloudflare Access → Tunnel → internal service
```

- Cloudflare Access with SSO + policies.
- Cloudflare Tunnel from origin to Cloudflare.
- No public IP on origin.
- Per-app policies.

VPN replacement; far better UX and security than network-level access.

### Pattern 5: Webhook receiver

```
external systems → Cloudflare (proxied) → origin
```

Considerations:

- **Whitelist sender IPs** if known (Stripe, GitHub, Slack publish theirs).
- **Signature verification** at origin (HMAC of payload).
- **Rate limit** to prevent abuse.
- **Don't gate behind Cloudflare Access** — webhooks aren't user traffic.

### Pattern 6: SaaS serving custom domains

You're a SaaS; customers point their domains at you. Cloudflare's **SSL for SaaS** handles cert provisioning automatically.

```
customer.com → CNAME → mysaas.com → Cloudflare → your origin
```

- Customers add a CNAME or NS record.
- Cloudflare provisions certs via SSL for SaaS.
- Your origin serves their content based on Host header.

Used by Shopify, Discord, etc.

### Pattern 7: Multi-region origin

For global apps where origin latency matters:

```
users (region A) → Cloudflare PoP → origin region A
users (region B) → Cloudflare PoP → origin region B
```

- Load Balancing (paid) routes by geo / latency / health.
- Cache the cacheable; let origin handle the dynamic.
- Pair with database replication strategy.

For most apps, single-region origin + global Cloudflare cache is enough. Multi-region matters when most traffic is uncacheable.

### Pattern 8: Hybrid Cloudflare + cloud provider

Common in real production:

```
DNS + edge + security: Cloudflare
Compute: AWS / GCP / Vercel / Fly
Database: managed Postgres / MongoDB
Storage: R2 or S3
```

Each provider for what it's best at. Cloudflare handles the edge; cloud handles the heavy compute/data.

### Pattern 9: Workers in front of origin

```
users → Worker → origin
```

The Worker:

- Handles auth checks.
- Routes /a/* to one origin, /b/* to another.
- A/B tests features.
- Caches dynamic responses.
- Modifies responses.

Origin only sees authenticated, properly-routed traffic. Worker can be 50 lines of code; saves significant origin work.

### Pattern 10: Full Cloudflare-native

```
users → Cloudflare → Worker + D1 + R2 + KV
```

No external origin. Everything on Cloudflare.

Best for: greenfield projects, smaller scale, simpler data models.
Not for: complex relational, high-write, heavy compute.

### Choosing the right pattern

For a typical SaaS:

- **Marketing site**: Pages + Cloudflare CDN.
- **Web app**: Cloudflare in front of cloud origin (AWS/Vercel/Fly).
- **Public API**: same as web app, with API-specific rate limiting.
- **Admin dashboard**: Cloudflare Access + Tunnel.
- **Webhooks**: Cloudflare in front of origin with signature verification.
- **File uploads / media**: R2 (free egress).
- **Internal tools**: Access + Tunnel.

For a static / Jamstack product:

- **Site**: Pages.
- **Light APIs**: Pages Functions or Workers.
- **Database**: D1 (small) or external Postgres (larger).
- **Files**: R2.

For an MVP / hobby project:

- **Everything on Cloudflare**: Pages + Workers + KV + R2. Often free.

### Things that should NOT go behind Cloudflare

- **Mail (SMTP/IMAP/POP)** — Cloudflare doesn't proxy mail.
- **Raw TCP services** Cloudflare doesn't support (without Spectrum).
- **Services where the client must see the real IP** for some technical reason (rare; usually solvable other ways).

Gray-cloud or skip Cloudflare entirely for these.

### Migrations to Cloudflare

A common pattern when adding Cloudflare to an existing setup:

1. Add Cloudflare DNS, NS-flipped at registrar. Keep records gray-cloud.
2. Test record-by-record: orange-cloud one record at a time; verify; move on.
3. Set up SSL mode to Full (strict).
4. Install Cloudflare Origin Cert.
5. Lock origin firewall to Cloudflare IPs.
6. Enable WAF managed rules in Log mode.
7. Monitor; tune; promote to Block over weeks.

Gradual rollout limits blast radius.

## Three real-world scenarios

**Scenario 1: The SaaS that scaled affordably.**
A team built on Cloudflare from day 1: Pages frontend, Workers backend, D1 for read-heavy data, R2 for media, free egress. First $5K MRR cost them under $20/mo in infra. Cleaner ops than running cloud servers.

**Scenario 2: The hybrid that worked.**
A team built complex backend on AWS (because their app needed it). Frontend, edge, security, and media on Cloudflare. Each ecosystem for what it's best at. Total cost: lower than all-AWS by a notable margin (egress savings on Cloudflare side).

**Scenario 3: The bad migration.**
A team flipped all records to Cloudflare with SSL mode "Off" by accident (default in some old setups). Site stopped working over HTTPS until they fixed mode to Full (strict). Lesson: verify settings, don't assume defaults. Gradual migration limits surprise.

## Common mistakes to avoid

- **Putting non-HTTP services behind Cloudflare proxy.** They break.
- **All-in on Cloudflare for workloads that don't fit.** Complex Postgres apps belong elsewhere.
- **Skipping origin firewall lockdown.** Defeats Cloudflare's protection.
- **Treating Pages as universal Vercel replacement.** Test framework features first.
- **No gradual migration plan.** Big-bang flips cause outages.

## Read more

- [Cloudflare reference architectures](https://developers.cloudflare.com/reference-architecture/)
- [SSL for SaaS](https://developers.cloudflare.com/ssl/ssl-for-saas/)
- [Cloudflare Load Balancing](https://developers.cloudflare.com/load-balancing/)

## Summary

- **Default**: HTTP services behind Cloudflare (proxied); non-HTTP gray-cloud.
- **Patterns**: web, API, static, internal (Access+Tunnel), webhooks, SaaS, multi-region, hybrid, Workers-in-front, Cloudflare-native.
- **Choose by workload shape**, not by ideology.
- **Hybrid is canonical for most production**: Cloudflare edge + cloud compute/data.
- **Gradual migration** when adding Cloudflare to existing setup.

Next: observability, logs, and the cost model.
