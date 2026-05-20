---
module: 4
position: 2
title: "WAF — Web Application Firewall in practice"
objective: "Configure WAF rules for real apps without breaking legitimate traffic."
estimated_minutes: 9
---

# WAF — Web Application Firewall in practice

## The puzzle

A WAF (Web Application Firewall) sits between users and your app, inspecting HTTP requests and blocking attack patterns — SQL injection, XSS, path traversal, etc. Sounds simple. In practice, badly-configured WAFs block legitimate users while letting attacks through.

Cloudflare's WAF is solid out of the box. Tuning it for your app is the difference between protection and self-DoS.

## The simple version

Cloudflare WAF has three layers:

1. **Managed Rules** — Cloudflare-maintained rules covering common attacks (OWASP Top 10, known CVEs). Default-on for paid plans.
2. **Custom Rules** — your own conditional logic ("block requests with no User-Agent").
3. **Rate Limits** — covered next lesson.

For most apps: enable managed rules, add a small set of custom rules, monitor logs, iterate.

## The technical version

### Managed Rules

Cloudflare maintains rule sets:

- **OWASP ModSecurity Core Rule Set**: industry-standard injection / XSS / RCE patterns.
- **Cloudflare Managed Ruleset**: Cloudflare's curated rules.
- **Specific exploits**: rules for known vulnerabilities in WordPress, Drupal, etc.

These are default-on for Pro+ plans. Free plan gets a subset.

### Rule actions

Each rule can:

- **Block**: 403 the request.
- **Challenge**: serve a JS challenge or interactive challenge.
- **Log**: don't block; just record.
- **Bypass**: skip subsequent rules.

For tuning, start in **Log** mode. Watch what gets matched. If you see legitimate traffic flagged, refine before switching to Block.

### Custom Rules

The dashboard lets you build conditional rules in plain English:

```
If (URI Path contains "/admin") and (IP source country != US) → Block
If (User-Agent is empty) → Challenge
If (Request method = POST) and (Path = /api/login) and (Bot Score < 30) → Block
```

Or in expression form:

```
(http.request.uri.path contains "/admin" and ip.geoip.country ne "US")
```

Cloudflare's expression language exposes most request properties — paths, headers, query strings, IP info, bot scores, referer, etc.

### Bot Score

For paid plans, every request gets a Bot Score (1-99). Low scores = likely bot; high = likely human.

```
If (Bot Score < 30) and (Path = /api/login) → Challenge
```

Pairs well with rate limits and Managed Rules for layered protection.

### False-positive tuning

The hard part: rules that block legitimate traffic.

Patterns:

- **Start in Log mode.** Watch for a week. Identify false positives.
- **Refine the rule** to exclude the legitimate pattern.
- **Switch to Block** once confident.

Don't ship Block rules blindly. The "WAF accidentally blocked our biggest customer's checkout" story is real and common.

### Rule conflicts

Rules execute in order. A Bypass rule earlier in the chain skips later rules. An over-broad allow rule can let attacks through.

Maintain a clear policy:

- **Top of order**: critical allow rules (your own monitoring, internal IPs).
- **Middle**: specific blocks (per-endpoint, per-pattern).
- **Bottom**: managed rules and broad catches.

### Geo and ASN rules

Sometimes you want to block by country or ASN:

```
If (ip.geoip.country in {"CN" "RU"}) and (Path contains "/admin") → Block
```

Use carefully. Geo-blocking has political and business implications; over-broad rules block legitimate global users.

ASN blocking is more targeted — block specific networks known for abuse without blocking entire countries.

### WordPress / Drupal / Joomla rules

If you run a CMS, enable the CMS-specific managed ruleset. Catches known plugin vulnerabilities and common exploit patterns.

### Cloudflare Page Rules vs. Rules Engine

Cloudflare has migrated configurations to a Rules Engine. Older Page Rules and Firewall Rules still work but new functionality lives in the engine. For new setups, use the Rules Engine.

### WAF logs

For paid plans:

- **Firewall Events** in dashboard show every block / challenge / log action.
- **Logpush** streams to your log aggregator (Datadog, BigQuery, S3, etc.).

Without log analysis, false positives go invisible until customer complaints arrive. Set up log retention and review.

### Common WAF rules to add

Most production deployments add:

- **Block requests with empty User-Agent**: real browsers send one.
- **Block specific exploit attempts** — `/wp-admin` if you don't use WordPress; `/.git/` always.
- **Rate-limit POSTs to auth endpoints**: covered next lesson.
- **Challenge anonymous traffic to admin paths**: extra friction for admin URLs.
- **Block known bad ASNs** based on your abuse logs.

### Don't over-engineer

For most apps:

- Managed rules: on.
- 5-10 custom rules covering your specific risks.
- Rate limits on auth and expensive endpoints.
- Logs reviewed weekly.

That's usually enough. Hundreds of custom rules become unmaintainable and create false positives.

## Three real-world scenarios

**Scenario 1: The blocked checkout.**
A team enabled an over-broad WAF rule. Several percent of legitimate checkouts blocked due to a User-Agent pattern. Revenue dipped 3% for a week before they noticed. Lesson: monitor false positives religiously; start in Log mode.

**Scenario 2: The credential-stuffing block.**
A team noticed credential stuffing on their login endpoint. They added a custom rule: POST to /api/login + Bot Score < 30 → Challenge. Login flood stopped; real users unaffected. Bot scores + WAF + rate limits all stacked.

**Scenario 3: The geo-block backfire.**
A team blocked all traffic from a country to stop attacks. Legitimate users in that country (some of their customers) churned. They narrowed to "block traffic from that country to /admin paths only" — targeted protection without losing customers.

## Common mistakes to avoid

- **Ship-and-pray Block rules.** Start in Log mode.
- **No false-positive monitoring.** Real users blocked silently.
- **Over-broad geo blocks.** Hurt legitimate users.
- **Rule order chaos.** Bypass rules at the top can defeat everything below.
- **Disabling managed rules** because of one false positive — refine the rule instead.

## Read more

- [Cloudflare WAF](https://developers.cloudflare.com/waf/)
- [OWASP Top 10](https://owasp.org/Top10/)
- [Cloudflare expressions](https://developers.cloudflare.com/ruleset-engine/rules-language/)

## Summary

- **Managed Rules**: industry-standard attack patterns; on by default for paid plans.
- **Custom Rules**: app-specific logic via expressions.
- **Bot Score** pairs with rules for targeted defense.
- **Start in Log mode**; refine; promote to Block once confident.
- **Maintain rule order**: critical allow → specific block → broad managed.
- **Review logs weekly**; false positives are invisible without observability.
- **Don't over-engineer**: managed + 5-10 custom + rate limits is enough for most apps.

Next: rate limiting and bot management.
