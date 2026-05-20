---
module: 2
position: 4
title: "DNSSEC and DNS over HTTPS"
objective: "Authenticated, encrypted DNS."
estimated_minutes: 5
---

# DNSSEC and DNS over HTTPS

## Why DNS needs hardening

Plain DNS has two big problems:

1. **No authentication.** Resolvers trust whatever response comes back. Cache poisoning attacks exploit this.
2. **No encryption.** ISPs, governments, and Wi-Fi networks can see and modify queries.

DNSSEC addresses authentication. DoH and DoT address encryption. They're complementary, not the same.

## DNSSEC — signing DNS records

DNSSEC adds cryptographic signatures to DNS responses. The chain of trust:

1. Root zone signs the TLD's key.
2. TLD signs your domain's key.
3. Your domain signs its records.

A DNSSEC-aware resolver verifies the chain. Tampering or forged responses fail verification.

Adoption is patchy — major TLDs and many domains have it; not all. Enabling for a domain is usually a single click at the registrar / DNS provider, but you must keep keys rotated.

```
$ dig +dnssec example.com
```

Look for the `RRSIG` records and `ad` flag in the response (Authenticated Data).

## DNSSEC adoption challenges

- **Operationally complex.** Key rotation, signature lifetime.
- **Doesn't encrypt.** Eavesdroppers still see queries.
- **Cache size impacts.** Signed responses are larger.
- **Algorithm choices.** Older algorithms deprecated; need migration.

For most domains: enable it if your DNS provider makes it easy. Don't lose sleep if you don't.

## DNS over HTTPS (DoH)

Encrypts DNS over HTTPS (port 443). Browser → resolver tunneled in TLS.

```
$ curl -H "accept: application/dns-json" \
       "https://cloudflare-dns.com/dns-query?name=example.com&type=A"
```

Effects:
- ISP can't see what you're looking up.
- ISP can't modify responses.
- Looks like normal HTTPS traffic — hard to block.

Used by: Firefox (default in some regions), Chrome (opt-in or auto), Android Private DNS.

Trade-offs:
- Centralizes queries to whichever provider you choose (Cloudflare, Google, etc.).
- Slight latency overhead vs plain UDP.
- Network admins lose visibility (can be a feature or problem).

## DNS over TLS (DoT)

Same idea but TLS on port 853, not HTTPS. More easily blocked at firewalls; browsers don't natively support it (OS-level resolvers do).

For server-side / system-level encrypted DNS, DoT is common. For browsers, DoH is more common.

## Encrypted DNS without provider lock-in

Concerns about centralization (everyone using 1.1.1.1) led to "Encrypted Client Hello" (ECH) and "Oblivious DNS over HTTPS" (ODoH) — protocols that hide both the query content AND who's asking.

Still emerging; not widely deployed in 2026 but growing.

## Configuring encrypted DNS

**System-wide (Linux):**

```
# /etc/systemd/resolved.conf
[Resolve]
DNS=1.1.1.1#cloudflare-dns.com
DNSOverTLS=yes
```

**Firefox:**

Preferences → Network Settings → Enable DNS over HTTPS → pick provider.

**Cloudflare's WARP, Tailscale.** Tunnel DNS (and other traffic) through encrypted paths.

## DNS hijacking — what attacks look like

Even without DNSSEC, real attacks:

- **Captive portals.** Coffee shop Wi-Fi intercepts DNS, redirects to login page.
- **ISP injection.** Some ISPs replace NXDOMAIN with their own search page.
- **Malicious resolvers.** Compromised DHCP gives you a malicious resolver address.
- **Cache poisoning.** Stuffing a recursive resolver with forged responses (Kaminsky attack; mitigated by randomization since 2008).
- **Government censorship.** Returning fake answers for blocked sites.

DoH+DNSSEC defends against most of these — DoH hides the query, DNSSEC verifies the answer.

## Negative caching of DNSSEC failures

If DNSSEC validation fails (bad signature, expired key), a strict resolver returns no answer. Misconfiguration of your own DNSSEC keys → site appears down to validating resolvers.

This is why DNSSEC operational discipline matters. Test thoroughly; monitor for validation failures.

## Practical recommendations

For your domains:

- **DNSSEC.** Enable if provider supports easily. Verify periodically.
- **CAA.** Restrict cert issuance to specific CAs.
- **Reasonable TTLs.** 300-3600 for most.
- **Monitor.** Use tools like DNSCheck, Hardenize for periodic audits.

For your devices / browsers:

- **Use DoH or DoT.** Firefox, Chrome, OS settings.
- **Trusted resolver.** 1.1.1.1 with DoH, 9.9.9.9 (Quad9), or self-hosted.
- **Avoid trusting unknown Wi-Fi DNS.** Coffee shop network = coffee shop DNS = potentially modified.

## Summary

- DNSSEC = signed DNS records, authenticated answers. Doesn't encrypt.
- DoH / DoT = encrypted DNS queries. Doesn't authenticate (combine with DNSSEC).
- Together they cover authenticity + confidentiality.
- DoH adoption growing fast in browsers and OSs.
- For your own domains: enable DNSSEC if easy; otherwise good ops > broken DNSSEC.

Module 2 complete. Next module: routing — BGP, OSPF, the global network.
