---
module: 2
position: 3
title: "SSL/TLS — Universal SSL, modes, and origin certificates"
objective: "Configure SSL correctly end-to-end."
estimated_minutes: 9
---

# SSL/TLS — Universal SSL, modes, and origin certificates

## The puzzle

Cloudflare offers free TLS in seconds. That's true — but there are several SSL "modes" with very different security properties, and picking the wrong one can leave your origin traffic unencrypted even when the lock icon shows green to the user.

This lesson is what each mode actually does, which to pick, and how to set up end-to-end TLS that's both convenient and secure.

## The simple version

Cloudflare has SSL modes:

1. **Off** — no TLS. Don't use.
2. **Flexible** — TLS user↔Cloudflare; plain HTTP Cloudflare↔origin. INSECURE — don't use.
3. **Full** — TLS both legs; origin cert not validated. OK for testing.
4. **Full (strict)** — TLS both legs; origin cert validated. **Use this.**

The right answer is **Full (strict)** with a Cloudflare-issued origin certificate (or a real public cert) at origin. Don't ship anything else to production.

## The technical version

### What each mode actually does

**Off**: Cloudflare serves HTTP only. No TLS anywhere. Don't.

**Flexible**: Client→Cloudflare is HTTPS. Cloudflare→origin is plain HTTP. The user sees a lock icon, but the connection from Cloudflare to your origin is in the clear. Anyone between Cloudflare and origin can read or modify traffic. This is a security anti-pattern; it exists for legacy reasons. Never use it.

**Full**: Client→Cloudflare is HTTPS. Cloudflare→origin is HTTPS but the origin cert isn't validated. Cloudflare accepts self-signed certs. Better than Flexible but doesn't prevent MITM between Cloudflare and origin.

**Full (strict)**: Client→Cloudflare is HTTPS. Cloudflare→origin is HTTPS with full cert validation. The origin must present a valid cert from a trusted CA *or* a Cloudflare-issued Origin Certificate. This is the correct production setting.

### Universal SSL

For the **user↔Cloudflare** leg, Cloudflare provides Universal SSL automatically. Every domain on Cloudflare gets a free cert covering the apex and one level of subdomain (e.g. `example.com` + `*.example.com`).

Auto-renews. No setup beyond enabling Cloudflare. This is the famous "free SSL in 5 minutes" feature.

For wildcards beyond first-level (`*.api.example.com`), you need Advanced Certificate Manager (paid) or upload your own.

### Cloudflare Origin Certificates

For the **Cloudflare↔origin** leg, you have two options:

**1. Use a real public cert** (Let's Encrypt, etc.) at origin. Works for Full (strict). Requires renewal management.

**2. Use a Cloudflare Origin Certificate** — a free, long-lived cert (up to 15 years) issued by Cloudflare for use at your origin. Only valid for Cloudflare-to-origin traffic (Cloudflare's CA isn't in browsers). This is the easiest and most common pattern.

To use an Origin Cert:

1. Generate one in Cloudflare dashboard (SSL/TLS → Origin Server → Create Certificate).
2. Install it on your origin (NGINX, Apache, your hosting platform).
3. Set Cloudflare SSL mode to Full (strict).
4. Done. Cloudflare's validators trust the cert; browsers never see it.

### Why Full (strict) is non-negotiable

In modes other than Full (strict), an attacker who can intercept Cloudflare↔origin traffic (BGP hijack, network access at a transit ISP, etc.) can decrypt or modify traffic. The user sees the green lock and assumes safety; the actual security is much weaker.

For any real production deployment: Full (strict). It's the same effort as Full; the difference is whether your edge is actually secure.

### TLS versions

Cloudflare supports TLS 1.2 and TLS 1.3. Force minimum:

- TLS 1.2 → broader compatibility.
- TLS 1.3 → faster handshakes, modern crypto.

Set in dashboard. Defaults are sensible. For sensitive workloads, force 1.3.

### HSTS

HTTP Strict Transport Security tells browsers "always use HTTPS for this domain":

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

Cloudflare can set this header. Once set, browsers refuse to load over HTTP. Good for security; permanent in browser caches (be sure before enabling `preload`).

### Mixed content

If your HTTPS page loads HTTP subresources (images, scripts, styles), browsers block them or warn. Common after enabling HTTPS for the first time.

Cloudflare offers "Automatic HTTPS Rewrites" — rewrites `http://` to `https://` in your HTML. Helps with mixed content during migrations.

### Custom hostnames (SaaS)

If you're a SaaS that serves customer-owned domains (`customer.com → your.app`), Cloudflare's SSL for SaaS lets you provision certs for customer hostnames automatically. Used by Shopify, Discord, etc. Set up complex but powerful.

### Free vs. paid certs

Free tier (Universal SSL):

- One-level wildcard (`*.example.com`).
- Auto-renewed.
- ECDSA + RSA support.

Paid (Advanced Certificate Manager):

- Multi-level wildcards (`*.api.example.com`).
- Custom validity periods.
- Custom hostnames.
- Specific CA control.

For most domains, free is enough.

### Cert problems and debugging

When SSL is broken:

```bash
# Check cert at Cloudflare's edge
openssl s_client -connect example.com:443 -servername example.com

# Check cert at origin
openssl s_client -connect origin.example.com:443 -servername origin.example.com
```

Common issues:

- **Origin cert mismatched / expired**: Full (strict) fails.
- **Origin cert signed by Cloudflare's CA but visited directly**: browsers won't trust (this is correct; origin certs are for Cloudflare-only).
- **Mixed content**: HTTPS page loading HTTP subresources.
- **HSTS too aggressive**: browsers can't visit HTTP fallback during incidents.

Diagnose at each hop. Tools like Cloudflare's SSL/TLS overview help.

## Three real-world scenarios

**Scenario 1: The Flexible-mode disaster.**
A team's SSL was set to Flexible. Users saw a lock icon. An ISP-level MITM between Cloudflare and origin altered API responses. They couldn't figure out why for weeks. Switched to Full (strict) with an Origin Cert; problem solved.

**Scenario 2: The Origin Cert win.**
A team's Let's Encrypt cert at origin failed to renew during an outage. Cloudflare↔origin handshakes started failing. They issued a Cloudflare Origin Cert (15-year validity); installed it. No more renewal management; full security maintained.

**Scenario 3: The HSTS preload regret.**
A team enabled HSTS with preload. Three months later, a subdomain needed to run HTTP for a specific reason. Couldn't — browsers globally cached the HSTS preload. Lesson: don't enable HSTS preload until you're sure.

## Common mistakes to avoid

- **Flexible mode in production.** Looks secure; isn't. Always Full (strict).
- **Origin cert from Cloudflare visited directly in browser.** Won't trust (by design).
- **No SSL mode set explicitly.** Defaults may not be what you want.
- **HSTS preload before you're sure.** Hard to undo.
- **Mixed content** after enabling HTTPS — block resources, broken pages.

## Read more

- [Cloudflare SSL/TLS modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)
- [Origin Certificates](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)
- [Universal SSL](https://blog.cloudflare.com/introducing-universal-ssl/)
- [HSTS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/)

## Summary

- Cloudflare SSL modes: **Off, Flexible, Full, Full (strict)**. **Always use Full (strict)** in production.
- **Universal SSL** provides free TLS user↔Cloudflare automatically.
- **Cloudflare Origin Certificate** is the easiest origin-side cert: free, long-lived, no renewal hassle.
- **TLS 1.2 or 1.3** minimum; force 1.3 for sensitive workloads.
- **HSTS** is good practice; **HSTS preload** is permanent — be sure.
- **Custom Hostnames** for SaaS serving customer-owned domains.

Next: common DNS and SSL mistakes.
