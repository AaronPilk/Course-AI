---
module: 4
position: 3
title: "Rate limiting and bot management"
objective: "Apply rate limits and bot defenses without false positives."
estimated_minutes: 8
---

# Rate limiting and bot management

## The puzzle

Most attacks aren't volumetric. They're targeted — credential stuffing on login, scraping on product pages, API abuse on rate-sensitive endpoints. Rate limiting and bot management are the two tools that handle these.

Get them right and abuse stops while real users sail through. Get them wrong and you DoS your own customers.

## The simple version

Two layers:

1. **Rate limiting**: cap requests per IP / per user / per session on specific endpoints.
2. **Bot management**: detect automated traffic and challenge or block.

Apply rate limits on:

- Authentication endpoints (login, password reset, signup).
- Search and expensive query endpoints.
- API endpoints that hit databases.
- Anything users could abuse.

Apply bot management when:

- Scraping is a real concern.
- Credential stuffing happens.
- You want to filter automated traffic from analytics.

## The technical version

### Rate limit basics

A rate limit defines:

- **Match criteria**: which requests count toward the limit.
- **Limit**: requests per period.
- **Action**: block, challenge, log.
- **Period**: timeframe (10s, 1min, 1hour).

Example:

```
Match: Path = /api/login AND Method = POST
Limit: 10 requests
Period: 1 minute
Action: Challenge
```

Per-IP by default. You can also rate-limit by other dimensions (header values, cookies, etc.) on paid plans.

### Choosing limits

Too tight: real users hit limits.
Too loose: attackers get through.

Heuristics:

- **Login**: 5-10 attempts per IP per minute.
- **Password reset**: 3-5 per IP per minute.
- **Sign up**: 3-5 per IP per minute.
- **Search**: 30-100 per IP per minute (depends on UX).
- **API endpoints**: per use case; common is 100-1000 per minute per user.

Always measure first. Look at legitimate-user traffic patterns. Set limits well above the 99th percentile of legitimate use.

### Rate limit dimensions

Per-IP is the default. For better targeting:

- **Per session** (cookie-based): catches users behind shared IPs (corporate networks).
- **Per user ID**: from auth headers or cookies.
- **Per API key**: for partner / developer APIs.
- **Per JWT claim**: per-account limiting via signed tokens.

Cloudflare's advanced rate limiting supports custom dimensions. Use them for fine-grained control.

### Account-based rate limiting

A subtle pitfall: per-IP rate limits don't catch one account spread across many IPs (credential stuffers using residential proxies).

Mitigation:

- Rate-limit by username in addition to per-IP.
- Lock accounts on N failed attempts.
- Use bot management for the request-level filtering.

### Bot management

Cloudflare assigns a **Bot Score** (1-99) to every request:

- **1-29**: very likely automated bot.
- **30-69**: ambiguous.
- **70-99**: very likely human.

Use in rules:

```
If (Bot Score < 30) and (Path = /api/login) → Challenge
If (Bot Score < 50) and (Path starts with /scrape-target) → Block
```

For Pro plans, basic bot detection is available. For Business / Enterprise, **Bot Management** is a full product with advanced scoring and detailed analytics.

### Challenges

Two types:

- **JS Challenge**: a JavaScript challenge that real browsers solve transparently; basic bots can't.
- **Interactive Challenge** (Turnstile / Captcha): user solves a visual challenge.

JS challenges add ~1-2 seconds for legitimate users; interactive challenges add real friction. Use:

- JS Challenge for moderate suspicion.
- Interactive only for high suspicion or critical paths.

### Turnstile — Cloudflare's CAPTCHA

Cloudflare Turnstile is a non-tracking, privacy-respecting CAPTCHA alternative. Free, easy to integrate into your forms. Often invisible to users (just sees a "verifying" tick).

For login / signup forms, embedding Turnstile is a one-line script tag. Adds bot resistance without burning trust.

### Combining rate limits and bot management

The full stack on auth endpoints:

```
1. Block obvious bad ASNs (custom rule).
2. Bot Score < 30 → Challenge (custom rule).
3. > 10 POSTs/min from same IP → Block (rate limit).
4. Turnstile required on the form itself.
5. Backend: lock account on 5 failed attempts.
```

Each layer catches what the previous didn't.

### False positives

Bot management false positives:

- **Real users behind VPNs** can get low Bot Scores.
- **Older browsers** sometimes flagged.
- **Privacy tools** (uBlock, etc.) can affect scoring.

Monitor for legitimate users being blocked. Tune thresholds.

### Per-app considerations

Different apps have different tolerance:

- **High-trust enterprise SaaS**: tight rate limits, low tolerance for friction (challenges hurt).
- **Consumer products**: looser limits, more tolerance for occasional friction.
- **Public APIs**: per-key limits, no challenges (programmatic clients can't solve them).
- **Public scraping targets**: aggressive bot management.

Match the policy to the audience.

### Logging and observability

Cloudflare's Security Analytics shows:

- Top blocked IPs.
- Block reasons (which rule fired).
- Bot Score distribution.

Watch for:

- **Sudden drop in block rate** = attacker found a workaround.
- **Spike in challenges** = active attack.
- **Customer complaints about being blocked** = false positives.

### Rate limits ≠ infinite scaling

Even with Cloudflare rate limits, your origin needs to handle the allowed rate. If you allow 1000 req/min per IP across 100,000 IPs, your origin still gets 100M req/min if every IP maxes out. Rate limits prevent abuse; they don't size your infrastructure.

## Three real-world scenarios

**Scenario 1: The credential-stuffing block.**
A team's login endpoint was hammered with credential stuffing. They added: rate limit (10 POSTs/IP/min), bot score < 30 challenge, Turnstile on the form, account lock on 5 fails. The attack stopped within an hour. Real users barely noticed.

**Scenario 2: The shared-IP false positive.**
A team's rate limit blocked a major corporate customer behind a single egress IP. Per-IP limit was too tight. They added per-session rate limiting via cookies; raised per-IP limit; corporate customer unblocked.

**Scenario 3: The Turnstile rescue.**
A team's signup form was bot-spammed daily. They added Turnstile to the form. Bot signups dropped 99%. Real users saw a "verifying" tick and moved on. No friction.

## Common mistakes to avoid

- **Tight limits without measuring legitimate traffic.** Blocks real users.
- **Per-IP only** when accounts are abused across many IPs.
- **Hard captchas** when JS challenges would suffice.
- **No account locking** alongside rate limits.
- **Rate limits as infrastructure sizing.** They're an anti-abuse tool, not a capacity plan.

## Read more

- [Cloudflare Rate Limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [Cloudflare Bot Management](https://developers.cloudflare.com/bots/)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)

## Summary

- **Rate limits** on auth, expensive queries, abuse-prone endpoints.
- **Per-IP** is the default; **per-session / per-user / per-API-key** for better targeting.
- **Bot Score** integrates with rules for bot-aware defense.
- **JS Challenge** for moderate suspicion; **Turnstile / Interactive** for high.
- **Layered**: ASN block + bot challenge + rate limit + form CAPTCHA + backend account lock.
- **Monitor false positives** religiously; tune over time.
- **Rate limits are anti-abuse, not capacity planning.**

Next: common Cloudflare security mistakes.
