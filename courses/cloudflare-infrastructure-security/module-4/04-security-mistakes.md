---
module: 4
position: 4
title: "Common security mistakes on Cloudflare"
objective: "Avoid the misconfigurations that leave gaps in your defenses."
estimated_minutes: 7
---

# Common security mistakes on Cloudflare

## The puzzle

Cloudflare provides strong defaults. Most security failures aren't because of Cloudflare's failure — they're misconfigurations that defeat the protections.

This lesson is the security-specific version of "things teams keep getting wrong" with concrete fixes.

## The simple version

Top security mistakes:

1. **Origin firewall not locked to Cloudflare IPs** — attackers bypass via origin IP.
2. **Flexible SSL mode** — encryption gap on back leg.
3. **No rate limits on auth endpoints** — credential stuffing easy.
4. **WAF rules in Block mode without false-positive monitoring** — self-DoS.
5. **No CAA records** — any CA can issue certs.
6. **No log review** — incidents invisible.
7. **Over-permissive Page Rules / Workers** — bypass intended protections.

Each is preventable. Below is the playbook.

## The technical version

### Origin firewall lockdown

**Mistake**: origin accepts traffic from any IP. Attackers find origin via leaks; bypass Cloudflare.

**Fix**: configure origin firewall (cloud security group, server iptables, hosting platform's firewall) to allow only Cloudflare's IP ranges (published at `cloudflare.com/ips/`).

For better protection: use Cloudflare Tunnel (Lesson 5.2) so origin doesn't need a public IP at all.

### SSL mode mistakes

**Mistake**: Flexible mode (encrypted user↔Cloudflare; plaintext Cloudflare↔origin).

**Fix**: Full (strict) with Cloudflare Origin Cert or real public cert at origin. End-to-end TLS.

Already covered in Module 2; worth reiterating because the impact is high.

### Missing rate limits on auth

**Mistake**: no rate limits on /login, /signup, /password-reset.

**Fix**: tight rate limits (5-10 per IP per min) on each auth endpoint. Combined with bot management challenges.

### WAF false positives

**Mistake**: WAF rules in Block mode block legitimate users; problem only surfaces via customer complaints weeks later.

**Fix**: deploy in Log mode; monitor Firewall Events; refine; promote to Block once confident. Set up weekly log review.

### No CAA records

**Mistake**: no CAA records; any CA worldwide can issue a cert for your domain.

**Fix**: CAA records limiting issuance to your specific CAs:

```
example.com CAA 0 issue "letsencrypt.org"
example.com CAA 0 issue "digicert.com"
example.com CAA 0 issue "cloudflare.com"
example.com CAA 0 issuewild ";"  # disallow wildcards from other CAs
```

### No log review

**Mistake**: WAF logs accumulate; nobody looks at them.

**Fix**: weekly review of:

- Top blocked IPs (any patterns?).
- Top fired rules (any noisy ones?).
- False-positive reports from customers.

For paid plans: Logpush to your log aggregator with alerts on anomalies.

### Over-permissive Workers

**Mistake**: a Worker bypasses Cloudflare's WAF/rate-limit/security rules unintentionally.

A common pattern:

```js
// This Worker passes through every request to origin
// — including ones that should have been blocked.
export default {
  async fetch(request) {
    return fetch(request);
  }
};
```

**Fix**: ensure Workers check WAF/security context before passing through. For most use cases, Workers should *add* security checks, not replace them.

### Page Rules / Rules Engine overrides

**Mistake**: a Page Rule sets "Security Level: Off" or "Disable Security" for a path. Forgotten; security regression.

**Fix**: audit Page Rules / Rules Engine entries. Treat them like firewall rules — review changes; document reasons.

### Origin lockdown gone wrong

**Mistake**: locked origin firewall to Cloudflare IPs; broke your own monitoring/CI/health checks.

**Fix**: explicitly allowlist your internal sources before locking down. Document the full list of "who needs direct origin access."

### DNS records pointing direct

**Mistake**: `direct.example.com` or `origin.example.com` records still in DNS, pointing at origin IP. Leaks the IP via `dig`.

**Fix**: remove direct records unless absolutely needed. If needed, restrict via origin firewall + minimal exposure.

### Email and origin same IP

**Mistake**: mail server on same IP as web origin; `dig mail.example.com` reveals web origin IP.

**Fix**: separate IPs for mail vs. web. Or use Cloudflare Email Routing so mail doesn't expose a public IP for your origin.

### Forgotten Workers / dev domains

**Mistake**: `dev.example.com` or `staging.example.com` on Cloudflare with no security. Attackers find them; exploit weak versions of your app.

**Fix**: Zero Trust Access (Lesson 5.1) on internal / dev domains. Or at minimum, IP allowlist or basic auth.

### Cloudflare API token over-privileged

**Mistake**: a Cloudflare API token has account-wide access; gets leaked; used to alter DNS or disable security.

**Fix**: scope API tokens narrowly. Use the least-privilege option for each automation. Rotate periodically; audit usage.

### Backup before changes

**Mistake**: a DNS or security config change breaks production; rollback is manual and slow.

**Fix**:

- Use Terraform / IaC for Cloudflare config where possible (Cloudflare provider for Terraform is solid).
- Snapshot configs before major changes.
- Have an "emergency revert" plan.

## Three real-world scenarios

**Scenario 1: The leaked origin IP.**
A team's origin was DDoS'd despite being behind Cloudflare. Investigation: their mail subdomain pointed to the same IP as web. Attackers `dig`ged the mail subdomain; bypassed Cloudflare. They split mail to a different IP + locked origin firewall to Cloudflare ranges. Subsequent attacks failed.

**Scenario 2: The disabled security page rule.**
A team had a Page Rule "Disable Security" for `/api/*` set by a previous engineer for debugging. Forgotten. WAF didn't apply to /api routes. An attacker found and exploited. They audited Page Rules; removed the override; documented the rule that all changes must have stated reasons.

**Scenario 3: The over-privileged token.**
A team's CI used a Cloudflare API token with "all access." The token leaked in a build log. Attacker rewrote DNS, broke production. Rotated all tokens; restricted to specific permissions per CI job. Lesson: least-privilege tokens.

## Common mistakes to avoid

- All the above. Each is in someone's production right now.
- **No security policy documentation.** Decisions are tribal knowledge.
- **No quarterly security review.** Drift accumulates.
- **No staging environment with matching security.** Test in prod.

## Read more

- [Cloudflare security best practices](https://developers.cloudflare.com/fundamentals/best-practices/)
- [Cloudflare IP ranges](https://www.cloudflare.com/ips/)
- [Cloudflare Terraform provider](https://registry.terraform.io/providers/cloudflare/cloudflare/latest)

## Summary

- **Lock origin firewall to Cloudflare IPs** — non-negotiable.
- **Full (strict) SSL.** Always.
- **Rate-limit auth endpoints.** Always.
- **WAF rules**: Log → refine → Block. Weekly review.
- **CAA records** on every domain.
- **Audit Page Rules / Rules Engine** entries; document reasons.
- **Least-privilege API tokens**; rotate periodically.
- **IaC for security config** where possible.

That wraps Module 4. Next: Zero Trust and production patterns.
