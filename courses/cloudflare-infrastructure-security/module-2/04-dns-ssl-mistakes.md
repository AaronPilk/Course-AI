---
module: 2
position: 4
title: "Common DNS and SSL mistakes — and how to avoid them"
objective: "Recognize and fix the patterns that break in production."
estimated_minutes: 7
---

# Common DNS and SSL mistakes — and how to avoid them

## The puzzle

The previous lessons covered the right way to configure DNS and SSL. This one inverts: the actual mistakes teams make, what they look like in production, and how to fix them fast.

## The simple version

The top mistakes:

1. **Orange-clouded mail records** → email breaks.
2. **Flexible SSL mode** → users think encrypted; back leg in clear.
3. **No CAA records** → any CA can issue a cert for your domain.
4. **Origin firewall not locked to Cloudflare IPs** → attackers find origin via leaks.
5. **`request.remoteAddress` instead of `cf-connecting-ip`** → wrong client IP everywhere.
6. **HSTS preload toggled too early** → can't revert.
7. **DNSSEC half-configured** → domain unreachable from strict resolvers.

Each is preventable. Below is the playbook.

## The technical version

### The mail-orange-cloud incident

**Symptom**: email stops working immediately after a DNS change.

**Cause**: someone orange-clouded the mail subdomain or MX record. Cloudflare doesn't proxy SMTP; mail can't reach Cloudflare's edge.

**Fix**: gray-cloud all mail-related records. Make sure MX entries are DNS-only.

**Prevention**: organizational habit — anyone touching DNS knows mail stays gray. UI can sometimes flag this; rely on humans too.

### Flexible-mode SSL

**Symptom**: lock icon shows in browser; users seem safe; periodic mysterious content modifications, or you have a security audit fail.

**Cause**: SSL mode set to Flexible. User↔Cloudflare encrypted; Cloudflare↔origin in clear HTTP. Anyone with network access between Cloudflare and origin can read or modify traffic.

**Fix**: switch to Full (strict). Issue Cloudflare Origin Cert; install at origin. Validate end-to-end.

**Prevention**: default new domains to Full (strict). Audit periodically.

### No CAA records

**Symptom**: a CA you don't use issues a cert for your domain. Could be misconfiguration; could be malicious.

**Cause**: no CAA records limiting which CAs can issue for your domain.

**Fix**: add CAA records:

```
example.com CAA 0 issue "letsencrypt.org"
example.com CAA 0 issue "digicert.com"
example.com CAA 0 issue "cloudflare.com"
```

**Prevention**: CAA on every domain you control. Cert-issuing CAs check CAA before issuing.

### Unlocked origin firewall

**Symptom**: DDoS bypasses Cloudflare; attacks hit origin directly.

**Cause**: origin firewall accepts traffic from anywhere. Attackers found the IP via mail records, CT logs, or old DNS data, and connect direct.

**Fix**: configure origin firewall (cloud provider security group, server iptables, etc.) to allow only Cloudflare's IP ranges. Cloudflare publishes the list at `cloudflare.com/ips/`.

**Prevention**: lock origin firewall on day 1 when putting Cloudflare in front. Audit periodically; refresh allowlist when Cloudflare updates IP ranges.

### Wrong client IP in app logic

**Symptom**: rate limiter blocks everyone or no one. Analytics shows all traffic from one IP. User-specific blocks don't work.

**Cause**: app reads connection's remote IP, sees Cloudflare's edge.

**Fix**: read `cf-connecting-ip` header (or properly parse `X-Forwarded-For`). Configure your framework's trust-proxy settings to handle Cloudflare correctly.

**Prevention**: middleware that normalizes client IP for the app. Eval in CI by simulating Cloudflare headers.

### HSTS preload regret

**Symptom**: you need to run a subdomain over HTTP (testing, legacy, migration); browsers refuse because of HSTS preload.

**Cause**: HSTS header included `preload` directive AND domain got submitted to browsers' HSTS preload list.

**Fix**: removal is slow (months/years across browser releases). In the meantime, run on a different domain that's not preloaded.

**Prevention**: enable HSTS without preload first. After 6-12 months of stable HTTPS-only operation, add preload only if you're certain.

### Half-configured DNSSEC

**Symptom**: domain unreachable from some resolvers (Google 8.8.8.8 with DNSSEC validation; Quad9; corporate resolvers).

**Cause**: DNSSEC enabled at Cloudflare but the DS record wasn't added at the registrar (or has the wrong digest).

**Fix**: either disable DNSSEC in Cloudflare (revert), or add the matching DS record at the registrar. Both ends or neither.

**Prevention**: complete DNSSEC end-to-end in one session. Test resolution from a DNSSEC-validating resolver before considering it done.

### TXT-record DKIM/SPF errors

**Symptom**: outbound mail goes to spam; recipients reject due to SPF or DKIM fails.

**Cause**: TXT records for SPF/DKIM are missing, malformed, or have escaped characters wrong.

**Fix**: review SPF and DKIM TXT records. Use tools like MXToolbox to validate. Common gotchas: long TXT records need proper quoting; multiple SPF records aren't allowed (must merge into one).

**Prevention**: mail delivery tests after any DNS change touching TXT records.

### CNAME chain at apex

**Symptom**: latency spikes, occasional resolution failures.

**Cause**: CNAME chain going CNAME → CNAME → CNAME → ... → A. Each hop adds latency and a failure point.

**Fix**: Cloudflare's CNAME flattening resolves to A at the apex automatically. For non-Cloudflare CNAMEs, minimize chain depth.

**Prevention**: monitor DNS resolution; flatten chains where you control them.

### Email Routing misconfig

**Symptom**: emails to your domain go nowhere; bounces.

**Cause**: Cloudflare Email Routing enabled but no destination address verified, or rules missing.

**Fix**: verify destination email; add routing rules; test by sending mail.

**Prevention**: end-to-end test after Email Routing setup.

### Origin reachability under firewall lockdown

**Symptom**: you locked origin firewall to Cloudflare IPs; now your own deploy / monitoring / health check can't reach origin.

**Cause**: firewall blocks legitimate internal traffic too.

**Fix**: add allowlist entries for internal sources (your CI/CD IP, your monitoring service, etc.). Use a private network if possible.

**Prevention**: list all sources that need to reach origin BEFORE applying firewall lockdown.

## Three real-world scenarios

**Scenario 1: The hidden Flexible mode.**
A team inherited a Cloudflare setup from a former engineer. SSL was set to Flexible. The lock icon misled everyone. A security audit caught it; switching to Full (strict) took 20 minutes. Lesson: audit SSL mode on every domain you inherit.

**Scenario 2: The orange-cloud mail incident.**
A new hire was given Cloudflare DNS access. They cleaned up "old gray records" by orange-clouding them. Mail stopped working immediately. Reverted; documented mail-stays-gray rule. New-hire onboarding now includes this.

**Scenario 3: The DDoS that bypassed.**
A team's origin firewall allowed all sources. An attacker found origin IP via the mail server (same IP). DDoS hit origin directly. They split mail to a different IP, locked origin firewall to Cloudflare ranges. DDoS failures going forward.

## Common mistakes to avoid

- All the above. Each is in production right now somewhere.
- **No diff-tracking on DNS changes** — small typos slip through.
- **No staging domain to test changes** — production is the testbed.
- **Manual changes without IaC** — drift between intended and actual config.

## Read more

- [Cloudflare best practices](https://developers.cloudflare.com/learning-paths/)
- [Cloudflare IP ranges](https://www.cloudflare.com/ips/)
- [SSL/TLS modes detailed](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)

## Summary

- **Mail records stay gray.** Always.
- **Full (strict) SSL** with Cloudflare Origin Cert in production. No exceptions.
- **CAA records** lock down which CAs can issue for your domain.
- **Origin firewall locked to Cloudflare IPs** is required for IP hiding to work.
- **`cf-connecting-ip`** for client IP in app logic.
- **DNSSEC**: both ends or neither. Test before declaring done.
- **HSTS preload** is permanent — enable cautiously.

That wraps Module 2. Next: Workers, Pages, and Edge Compute.
