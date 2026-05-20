---
module: 2
position: 2
title: "Proxy mode vs. DNS-only — when traffic actually hits Cloudflare"
objective: "Decide which records to proxy and which to leave gray-cloud."
estimated_minutes: 8
---

# Proxy mode vs. DNS-only — when traffic actually hits Cloudflare

## The puzzle

The orange cloud / gray cloud toggle is the single most consequential setting in Cloudflare. Get it right and your edge works. Get it wrong and either your features don't apply (gray-cloud surprise) or services break (orange-cloud surprise on mail).

## The simple version

- **Orange cloud (proxied)**: traffic routes through Cloudflare. All features apply. Origin IP is hidden.
- **Gray cloud (DNS-only)**: Cloudflare serves DNS only. Traffic goes direct to origin. Origin IP is public.

Default to orange-cloud for HTTP services. Gray-cloud for mail, FTP, SSH, raw TCP/UDP services Cloudflare doesn't support.

## The technical version

### What orange-cloud actually does

When a record is proxied:

1. **DNS query**: returns Cloudflare's anycast IP (not your origin).
2. **TCP/TLS**: connection terminates at Cloudflare's edge.
3. **HTTP layer**: Cloudflare processes the request (cache, WAF, Workers, etc.).
4. **Origin connection**: if needed, Cloudflare opens its own connection to your origin.
5. **Response**: returned to client via Cloudflare.

The orange cloud is the "all features active" switch for HTTP/HTTPS/WebSocket.

### What gray-cloud actually does

When a record is DNS-only:

1. **DNS query**: returns your origin IP directly.
2. **TCP/TLS**: client connects directly to your origin.
3. Cloudflare is not in the path. No features apply.

Cloudflare still hosts the DNS authoritatively; users still benefit from Cloudflare's fast DNS resolution. But the *traffic* skips Cloudflare entirely.

### When orange-cloud is right

- **Web traffic** (HTTP/HTTPS).
- **WebSockets**.
- **API endpoints** running over HTTP.
- **Any service** you want behind DDoS / WAF / rate limiting / caching.
- **gRPC over HTTP/2** (supported on certain plans).

### When gray-cloud is right

- **Mail services** (MX, SMTP).
- **FTP, SFTP**.
- **SSH** (port 22).
- **Custom TCP/UDP protocols** not supported by Spectrum.
- **Direct database connections** from outside.
- **Anything where the client must see the real origin IP.**

### Spectrum: TCP/UDP proxy

Cloudflare's Spectrum product (enterprise tier) supports proxying arbitrary TCP/UDP. If you need DDoS protection for SSH, custom TCP services, etc., Spectrum is the answer. For most teams, gray-cloud is fine for these protocols.

### The orange-cloud trade-offs

What you give up by orange-clouding:

- **Direct origin connection**: clients always go through Cloudflare. Adds latency on cache misses (~10-30ms typical).
- **Real client IP at network layer**: you'll see Cloudflare's IP; must read `cf-connecting-ip` header.
- **Some protocols don't work**: non-HTTP traffic on the proxied record won't reach origin.

What you get:

- **DDoS, WAF, rate limiting**.
- **Caching**.
- **Workers / edge logic**.
- **TLS termination at edge** (faster handshake for distant users).
- **Origin IP hiding**.
- **Compression**.
- **HTTP/2 / HTTP/3 to client** (regardless of origin).

For nearly all HTTP services, the trade is overwhelmingly positive.

### Hidden origin pattern

Once orange-clouded, you can:

1. Set origin firewall to allow **only Cloudflare's IP range**.
2. Remove direct origin from DNS (no `direct.example.com → origin IP` records, no leak).
3. Anyone trying to attack must go through Cloudflare.

Without these steps, attackers can find your origin IP via:

- Old DNS history.
- Mail server records.
- Direct subdomain hints.
- Cert transparency logs.
- Misconfigured services pointing at origin IP.

If you can't lock the origin firewall, the hiding is partial.

### Direct-to-origin patterns that leak

- Mail subdomain on the same IP as web.
- `direct.example.com` or `origin.example.com` records pointing at the real IP.
- Same IP serving an SSL cert with the apex domain (CT logs).
- Outbound mail with origin's IP in headers.

Audit periodically. Tools like `dig`, `whois`, `crt.sh` reveal leaks.

### Switching from proxied to DNS-only

If you toggle from orange to gray:

- Features stop applying immediately for that record.
- Clients begin connecting directly to origin.
- Origin firewall (if locked to Cloudflare IPs) needs to be opened or you'll lock yourself out.

Plan the toggle. Watch traffic during the change.

### Subdomain mixing

Different records can have different proxy modes:

```
A   example.com        192.0.2.1  (orange)
A   api.example.com    192.0.2.1  (orange)
A   mail.example.com   192.0.2.2  (gray)
A   ssh.example.com    192.0.2.1  (gray)
```

Same origin IP can be both proxied (for HTTP) and direct (for SSH). Most production setups use this mixing pattern.

## Three real-world scenarios

**Scenario 1: The gray-cloud invisibility.**
A team enabled DDoS protection but their record was gray-cloud. Traffic skipped Cloudflare entirely; DDoS hit origin directly. They orange-clouded; protection took effect.

**Scenario 2: The orange-cloud on SSH.**
A team accidentally orange-clouded their SSH bastion's A record. SSH stopped working (port 22 isn't proxied on standard plans). Toggled to gray; SSH resumed.

**Scenario 3: The origin leak via mail.**
A team's `mail.example.com` resolved to the same IP as their origin. An attacker did `dig mail.example.com`, got the origin IP, attacked it directly bypassing Cloudflare. They split mail to a different host; locked origin firewall to Cloudflare IPs. Attacks dropped.

## Common mistakes to avoid

- **Gray-cloud expecting features.** Features apply only to proxied traffic.
- **Orange-cloud on non-HTTP.** Mail / SSH / FTP stop working.
- **Origin IP leaks** via mail, old records, CT logs.
- **Same IP for proxied web and gray-cloud mail.** Origin IP is discoverable.
- **No origin firewall lockdown.** Hiding origin IP only works with firewall restricting to Cloudflare's IPs.

## Read more

- [Proxy status](https://developers.cloudflare.com/dns/manage-dns-records/reference/proxied-dns-records/)
- [Cloudflare IP ranges](https://www.cloudflare.com/ips/)
- [Origin lockdown](https://developers.cloudflare.com/fundamentals/setup/manage-domains/orange-to-orange/)

## Summary

- **Orange cloud (proxied)** = features active, origin IP hidden, HTTP/HTTPS only.
- **Gray cloud (DNS-only)** = Cloudflare DNS but traffic skips edge.
- **Default orange for web; gray for mail/SSH/FTP/raw TCP.**
- **Origin firewall must allow only Cloudflare IP ranges** for hiding to work.
- **Audit for origin leaks**: mail, old records, CT logs.
- **Spectrum** proxies arbitrary TCP/UDP for enterprise needs.

Next: SSL/TLS — Universal SSL, modes, and origin certificates.
