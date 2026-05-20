---
module: 4
position: 1
title: "DDoS protection — what's automatic and what you tune"
objective: "Understand the layers of DDoS protection and when to intervene."
estimated_minutes: 9
---

# DDoS protection — what's automatic and what you tune

## The puzzle

Cloudflare advertises "unmetered DDoS protection." That's mostly true — and quietly the most valuable thing Cloudflare provides for anyone running internet-facing services. But "protection" is layered, and knowing what's automatic vs. what you configure determines whether you survive a real attack.

## The simple version

Three layers of DDoS protection:

1. **Network-layer (L3/L4) protection** — automatic, always on, free. Cloudflare absorbs volumetric attacks at the edge.
2. **HTTP-layer (L7) protection** — automatic for most attacks; some tuning for custom rules.
3. **Application-specific defenses** — your configuration: WAF rules, rate limits, bot management.

The first two work invisibly. The third is what you actively manage.

## The technical version

### Volumetric attacks (L3/L4)

These are floods of packets aimed at saturating bandwidth or overwhelming servers — SYN floods, UDP amplification, etc. Measured in packets per second or bits per second.

Cloudflare's network:

- **Total capacity exceeds 250 Tbps** (and growing).
- **Anycast distribution** means attacks scatter across hundreds of PoPs.
- **No "scrubbing" delay** — protection is the default state.
- **Free tier included**.

Result: most volumetric attacks never reach your origin. Cloudflare absorbs them at the edge.

You don't configure this. It's automatic.

### Application-layer attacks (L7)

These are HTTP-level floods — many requests, looking legitimate but designed to exhaust application resources. Examples:

- 100,000 RPS of POST requests to a login endpoint (auth flood).
- Many GETs to a search endpoint, each triggering expensive DB queries.
- Slow-Loris-style attacks (hold connections open).

Cloudflare's L7 protection:

- **Pattern detection** — known L7 attack signatures blocked automatically.
- **Anomaly detection** — sudden traffic spikes flagged or challenged.
- **JS challenges** — suspect clients get a challenge that real browsers solve but bots can't.

Some of this is automatic. Some requires your config (next sections).

### What you tune

For threats specific to your app:

- **WAF rules** — block requests matching attack patterns specific to your stack (Lesson 4.2).
- **Rate limiting** — limit requests per IP or user (Lesson 4.3).
- **Bot management** — separate humans from bots (Lesson 4.3).
- **Firewall rules** — block geos, ASNs, specific IPs.

These are the levers you pull when an attack passes through automatic protection.

### DDoS dashboard

When an attack happens, Cloudflare shows it in the dashboard:

- Live traffic graph.
- Attack source breakdown (countries, ASNs).
- Mitigation actions taken.
- Recommendations.

For Pro+ plans, you get more granular analytics and configurable rules.

### The "Under Attack" mode

A one-click toggle in the dashboard. Enables aggressive challenges (JS challenge or interactive challenge) on every visitor. Stops most attacks immediately but adds friction for real users.

Use during active attacks. Disable when calm.

### Layered with WAF and rate limits

DDoS protection works with the other security layers:

- DDoS absorbs the flood.
- WAF rules catch attack patterns mixed in.
- Rate limits cap per-IP behavior.
- Bot management filters automated traffic.

Each layer catches what the previous didn't. Defense in depth.

### Bandwidth concerns

Free DDoS protection doesn't cap your legitimate bandwidth — both legitimate and attack traffic are absorbed by Cloudflare. Your origin only sees what gets past the defenses.

This is a real advantage over self-hosted protection: a few Tbps DDoS would melt most setups; Cloudflare absorbs it as routine.

### What Cloudflare doesn't catch automatically

- **Application logic abuse** — patterns specific to your app (e.g. password resets to enumerate users). WAF + rate limits needed.
- **Account takeover attempts** — credential stuffing. Bot management + rate limits.
- **API abuse** — high request rates from authenticated users. Per-account rate limits in your app or via Cloudflare's account-aware rate limiting.

These are your design problems; Cloudflare provides the tools but you wire them up.

### When to call Cloudflare

For very large attacks (state-level, distributed, persistent), reach out to Cloudflare's emergency response:

- Enterprise customers get 24/7 support.
- Free / Pro plans can still get help during active incidents via the dashboard.

For most attacks, the automatic systems handle everything.

### Observability during an attack

When something looks weird:

- **Traffic Analytics** in dashboard — RPS, country breakdown, bot scores.
- **Security Analytics** — what's being blocked.
- **Audit logs** — what rules fired.
- **Logpush** (paid) — stream logs to your log aggregator for real-time analysis.

Visibility is what lets you respond. Without it, you're guessing.

### Origin sizing

Even with Cloudflare in front:

- Cache misses still hit origin.
- Authenticated requests usually hit origin.
- Slow attack traffic can leak through.

Size your origin for normal load + some buffer. Don't assume Cloudflare eliminates all load — it eliminates *attack* load on volumetric attacks but real-traffic load is still your responsibility.

## Three real-world scenarios

**Scenario 1: The 2 Tbps absorbed silently.**
A small startup got hit by a 2 Tbps DDoS. They didn't notice until the next day's Cloudflare dashboard email. Origin was unaffected. Cloudflare absorbed across hundreds of PoPs. Bill: $0 incremental.

**Scenario 2: The L7 attack that bypassed.**
A team's L7 attack used legitimate-looking requests at low per-IP volume across thousands of IPs. Cloudflare's automatic detection didn't catch it; it looked like a traffic spike. They enabled "Under Attack" mode + custom WAF rule (block POSTs to /login from anonymous IPs). Attack mitigated within minutes.

**Scenario 3: The application-logic abuse.**
A team's password-reset endpoint was being used to enumerate accounts. Not a flood; just steady probing. They added a rate limit (5 requests per IP per minute on that endpoint) and an Email-Routing CAPTCHA. Enumeration stopped.

## Common mistakes to avoid

- **Assuming Cloudflare blocks every threat.** L7 and app-specific need tuning.
- **Leaving "Under Attack" mode on forever.** Friction for real users.
- **No origin firewall lockdown.** Attackers bypass Cloudflare via origin IP leak.
- **Ignoring the dashboard.** Most attacks are visible there before they become incidents.
- **No log streaming during incidents.** Hard to respond in real time without it.

## Read more

- [Cloudflare DDoS protection](https://www.cloudflare.com/ddos/)
- [Under Attack mode](https://developers.cloudflare.com/waf/tools/security-level/under-attack-mode/)
- [DDoS protection docs](https://developers.cloudflare.com/ddos-protection/)

## Summary

- **Three layers**: L3/L4 (network), L7 (HTTP), application-specific.
- **L3/L4 protection is automatic and unmetered.**
- **L7 protection** is mostly automatic; app-specific patterns need WAF + rate limits.
- **"Under Attack" mode** is the emergency toggle.
- **Origin firewall lockdown** is essential — protection doesn't matter if attackers bypass to origin.
- **Monitor traffic and security analytics** during incidents.
- **Layered defense**: DDoS + WAF + rate limits + bot management.

Next: WAF in practice.
