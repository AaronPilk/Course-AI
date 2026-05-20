---
module: 2
position: 1
title: "Cloudflare DNS — fast, free, and how it works"
objective: "Set up Cloudflare DNS for a domain and understand the record types."
estimated_minutes: 9
---

# Cloudflare DNS — fast, free, and how it works

## The puzzle

DNS is invisible until it breaks. When it breaks, everything breaks — your site, your email, your APIs, your monitoring. Most "the site is down" calls are actually DNS misconfigurations.

Cloudflare DNS is fast, free, and the on-ramp to everything else Cloudflare does. This lesson is the practical setup plus the common ways DNS goes wrong.

## The simple version

To use Cloudflare:

1. **Sign up for Cloudflare**, add your domain.
2. **Update nameservers** at your registrar to Cloudflare's nameservers.
3. **Configure DNS records** in Cloudflare's dashboard.
4. **Set proxy mode** (orange or gray) per record.

That's the foundation. Every other feature builds on it.

## The technical version

### The DNS record types you need

For most domains:

- **A**: maps domain to IPv4 (`192.0.2.1`).
- **AAAA**: maps to IPv6 (`2001:db8::1`).
- **CNAME**: alias one name to another (`www.example.com → example.com`).
- **MX**: mail server (`mail.example.com`).
- **TXT**: arbitrary text (DKIM, SPF, domain verification).
- **NS**: nameserver (managed by Cloudflare for your zone).

Less common:

- **CAA**: which CAs can issue certs for your domain.
- **SRV**: service location records.
- **DKIM**: email auth (a TXT record, technically).

### Adding a domain to Cloudflare

1. In Cloudflare dashboard: "Add Site" → enter `example.com`.
2. Cloudflare imports existing DNS records (it does a best-effort scan). Review them.
3. Cloudflare gives you nameservers like `clay.ns.cloudflare.com` and `kim.ns.cloudflare.com`.
4. Go to your domain registrar. Replace existing nameservers with Cloudflare's.
5. Wait for propagation (minutes to hours).

Once propagation completes, Cloudflare is authoritative for your domain.

### Common record patterns

For a typical web app:

```
A     example.com       192.0.2.1      (orange/proxied)
A     www.example.com   192.0.2.1      (orange/proxied)
CNAME api.example.com   origin.example.com  (orange/proxied)
MX    example.com       mail.example.com (gray/DNS-only — Cloudflare doesn't proxy mail)
TXT   _dmarc.example.com "v=DMARC1;..."
```

Apex (`example.com`) and `www` should orange-cloud. Mail and other non-HTTP services stay gray.

### Proxied vs DNS-only — the rule

- **Orange cloud (proxied)**: traffic flows through Cloudflare. HTTP/HTTPS only; Cloudflare hides your origin IP.
- **Gray cloud (DNS-only)**: traffic goes direct to origin. No Cloudflare features.

What to orange-cloud:

- Web (HTTP/HTTPS) services.
- WebSocket services.
- Anything where you want Cloudflare's CDN, security, or Workers.

What to gray-cloud:

- Mail servers (MX, mail subdomain).
- Direct TCP/UDP services Cloudflare doesn't support.
- Anything that needs the real IP for some technical reason (rare).

### The CNAME flattening trick

Standard DNS prohibits CNAME on the apex (`example.com`). Cloudflare lets you put a CNAME there and "flattens" it (resolves it to A/AAAA at query time):

```
example.com CNAME some-app.vercel.app  (Cloudflare flattens)
```

Useful when your origin is a hosted service (Vercel, Heroku) without a stable IP. Without this, you'd need to manage A records pointing at IPs that change.

### Propagation timing

- **At your registrar**: nameserver change can take 24-48h to fully propagate.
- **Within Cloudflare**: record changes propagate globally in seconds.

Once on Cloudflare, you no longer worry about registrar-level propagation for individual records. That's a real ergonomic win.

### DNSSEC

Cloudflare supports DNSSEC — cryptographically signed DNS records. Enables clients to verify they got the real records.

- Enable in Cloudflare dashboard.
- Cloudflare gives you a DS record to add at your registrar.
- Once both sides are configured, DNSSEC is active.

For most domains, DNSSEC is good practice but not urgent. For sensitive domains (financial, government), it's important.

### Email considerations

Cloudflare doesn't proxy email. MX and mail records stay gray-cloud. Cloudflare offers Email Routing (forward email at example.com to your real address) — useful for catch-all forwarding without running a mail server.

Common gotcha: people orange-cloud their mail subdomain by accident; mail stops working. Always gray-cloud mail records.

### CAA records and cert authority

CAA records specify which CAs can issue certs for your domain. Cloudflare manages the apex cert; you should still consider CAA records to lock down:

```
example.com CAA 0 issue "letsencrypt.org"
example.com CAA 0 issue "digicert.com"  
example.com CAA 0 issue "cloudflare.com"
```

This prevents random CAs from issuing a cert for your domain (a class of attack).

### Backup DNS

If Cloudflare goes down (rare but possible), your domain is unreachable. For very high-uptime needs, a backup secondary DNS provider can answer queries from a different network.

Cloudflare supports being part of a multi-DNS setup. For most use cases, single-DNS is fine; for high-stakes domains, multi-DNS is a reasonable pattern.

### Records to never break

The records that, if broken, take you down:

- **NS records** — managed by Cloudflare; don't touch.
- **Apex A/AAAA records** — wrong IP = site down.
- **MX records** — wrong = email broken.
- **CAA records** — wrong = cert renewals fail.

Treat changes to these like database migrations: review, plan, watch propagation. Most outages start as DNS edits made in haste.

## Three real-world scenarios

**Scenario 1: The orange-cloud surprise on mail.**
A user accidentally orange-clouded their mail subdomain. Email stopped working immediately because Cloudflare doesn't proxy mail. Toggled to gray-cloud; mail resumed. Lesson: keep mail records gray.

**Scenario 2: The CNAME flattening win.**
A team's frontend was hosted on Vercel; Vercel only supports CNAME, not A records. Without CNAME flattening, they'd have managed A records manually. Cloudflare flattens automatically; they pointed `example.com` CNAME at `cname.vercel-dns.com`; it just worked.

**Scenario 3: The DNSSEC misconfiguration.**
A team enabled DNSSEC on Cloudflare but didn't add the DS record at the registrar. Their domain went unreachable from resolvers that strictly validate. Reverted DNSSEC; site recovered. They later set it up correctly.

## Common mistakes to avoid

- **Orange-clouding mail records.** Mail stops working.
- **Hardcoded A records for hosted services.** Use CNAME with flattening.
- **Not updating nameservers at registrar.** Cloudflare config does nothing until NS changes propagate.
- **DNSSEC half-configured.** Either both ends (Cloudflare + registrar) or neither.
- **No CAA records** on sensitive domains. Lets random CAs issue certs.

## Read more

- [Cloudflare DNS](https://developers.cloudflare.com/dns/)
- [CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/)
- [DNSSEC](https://developers.cloudflare.com/dns/dnssec/)
- [Email Routing](https://developers.cloudflare.com/email-routing/)

## Summary

- DNS records: **A, AAAA, CNAME, MX, TXT, NS, CAA**.
- **Orange-cloud HTTP services**; **gray-cloud mail and direct-IP needs**.
- **CNAME flattening** lets you use CNAME on apex for hosted services.
- **DNSSEC** is good practice; configure both at Cloudflare and at the registrar.
- **CAA records** lock down which CAs can issue certs.
- **Mail stays gray** — Cloudflare doesn't proxy email.
- DNS edits to apex / MX / NS records are high-stakes — review carefully.

Next: proxy mode vs DNS-only in practice.
