---
module: 2
position: 2
title: "Record types: A, AAAA, MX, CNAME, TXT"
objective: "What each DNS record does."
estimated_minutes: 5
---

# Record types: A, AAAA, MX, CNAME, TXT

## A and AAAA — the basics

`A` records map a name to an IPv4 address:

```
example.com.    300    IN    A    93.184.216.34
```

`AAAA` ("quad-A") for IPv6:

```
example.com.    300    IN    AAAA    2606:2800:220:1:248:1893:25c8:1946
```

Most hosts have both. Browsers prefer IPv6 when available, fall back to IPv4.

You can have multiple A/AAAA records for one name — DNS returns the list, client picks (usually first, sometimes randomized for load distribution). This is "DNS round-robin," the simplest load balancing.

## CNAME — aliases

`CNAME` (Canonical Name) points one name at another:

```
www.example.com.    300    IN    CNAME    example.com.
```

Looking up `www.example.com` returns the alias; resolver then looks up `example.com` and returns its A/AAAA.

Useful for: pointing many subdomains at one canonical name, vendor-provided endpoints (`mysite.myshopify.com`), CDNs.

**Restriction:** CNAMEs can't coexist with other records at the same name. So you can't have CNAME and MX on the same name. This is why "you can't CNAME the apex" (the root, like `example.com`) is a common gotcha — the apex usually needs SOA, NS, sometimes MX, so it can't be a CNAME.

Cloud DNS providers (Route 53, Cloudflare) offer "ALIAS" or "ANAME" records to work around this for apex domains.

## MX — mail servers

`MX` records say where email for a domain should go:

```
example.com.    300    IN    MX    10 mail1.example.com.
example.com.    300    IN    MX    20 mail2.example.com.
```

The number is priority (lower = higher priority). Mail servers try MX 10 first; fall back to MX 20.

For Gmail / Google Workspace:

```
example.com.    IN    MX    1  aspmx.l.google.com.
example.com.    IN    MX    5  alt1.aspmx.l.google.com.
example.com.    IN    MX    5  alt2.aspmx.l.google.com.
example.com.    IN    MX    10 alt3.aspmx.l.google.com.
example.com.    IN    MX    10 alt4.aspmx.l.google.com.
```

Misconfigured MX = lost mail. Verify after any DNS change involving email.

## TXT — free-form text

`TXT` records hold arbitrary strings. Used for:

**SPF (Sender Policy Framework).** Authorized mail senders.

```
v=spf1 include:_spf.google.com ~all
```

**DKIM (DomainKeys Identified Mail).** Public key for email signing.

```
v=DKIM1; k=rsa; p=MIGfMA0...
```

**DMARC.** Mail authentication policy.

```
v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com
```

**Domain verification.** Many SaaS services (Google, GitHub, Stripe, etc.) ask you to add a TXT record to prove ownership before activating.

```
google-site-verification=abc123...
```

TXT is the catch-all. If you don't see what you need fitting another type, TXT works.

## NS — nameservers

Authoritative servers for a zone:

```
example.com.    300    IN    NS    ns1.example.com.
example.com.    300    IN    NS    ns2.example.com.
```

Usually set at the registrar level for the apex. Resolvers ask these for any record in the zone.

For subdomains, you can delegate: `subzone.example.com NS ns1.subprovider.com` — now queries for `*.subzone.example.com` go to the sub-provider's servers.

## SOA — start of authority

One per zone; metadata about the zone:

```
example.com.    300    IN    SOA    ns1.example.com. hostmaster.example.com. 2026051501 7200 3600 1209600 300
```

Fields: primary NS, admin email (dots replace @), serial number, refresh interval, retry, expire, minimum TTL. Rarely edited manually; DNS provider tools handle it.

## SRV — service records

Used for protocols that need to know "where is this service?" — XMPP, SIP, LDAP, Minecraft:

```
_minecraft._tcp.example.com.    IN    SRV    0 5 25565 minecraft.example.com.
                                         ↑   ↑   ↑     ↑
                                       prio weight port target
```

For most web apps, A + CNAME is enough. SRV matters for specific protocols.

## CAA — Certificate Authority Authorization

Restricts which CAs can issue certificates for your domain:

```
example.com.    IN    CAA    0 issue "letsencrypt.org"
```

Now only Let's Encrypt can issue certs for example.com. Defense against CA compromise / misissuance. Most production domains should have CAA.

## PTR — reverse lookups

Stored in `.in-addr.arpa` zone for IPv4, `.ip6.arpa` for IPv6:

```
$ dig -x 8.8.8.8
8.8.8.8.in-addr.arpa.    PTR    dns.google.
```

Useful for: mail server reputation (no reverse DNS = often spam-flagged), logging tools showing names instead of IPs, traceroute showing readable hops.

You request reverse DNS through your IP provider (they own the IP block).

## Practical tips

- **TTLs.** 300-3600s for most; shorter when planning changes.
- **Apex CNAME workaround.** Use ALIAS/ANAME records or anycast IPs.
- **SPF/DKIM/DMARC.** Set up all three for any domain sending email. Otherwise mail gets spam-foldered.
- **CAA.** Add for production domains to limit cert misissuance.
- **Audit periodically.** Stale records, orphaned subdomains, expired SPF includes for services you no longer use.

## Common mistakes

- **CNAME at apex.** Doesn't work in standard DNS; use ALIAS.
- **Long TTLs before a change.** Stuck with old answers.
- **Missing or wrong SPF / DKIM / DMARC.** Email deliverability tanks.
- **Forgetting AAAA for IPv6.** IPv6-only users get unreachable.
- **No CAA.** Any CA can issue for your domain.

## Summary

- A / AAAA: IPv4 / IPv6 addresses.
- CNAME: alias one name to another. Can't be at apex.
- MX: mail server priority.
- TXT: free-form — SPF, DKIM, DMARC, domain verification.
- NS / SOA: zone metadata.
- SRV: service discovery for specific protocols.
- CAA: restrict which CAs can issue certs.

Next: DNS performance — caching and TTL.
