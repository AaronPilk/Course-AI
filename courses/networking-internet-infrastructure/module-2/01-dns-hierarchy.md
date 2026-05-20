---
module: 2
position: 1
title: "DNS hierarchy and recursive resolution"
objective: "How a name becomes an IP."
estimated_minutes: 6
---

# DNS hierarchy and recursive resolution

## What DNS does

The Domain Name System turns human names (example.com) into addresses (93.184.216.34). Without it, the web would be a directory of IP addresses; with it, names are stable and IPs can change underneath.

DNS is one of the most heavily used distributed systems in the world. Every other network operation that uses names depends on it.

## The hierarchy

DNS is a tree, read right to left:

```
example.com.
↑     ↑   ↑
host  TLD root
```

- **Root.** "." (often invisible). 13 logical root servers globally, replicated via anycast.
- **TLD (Top-Level Domain).** `.com`, `.org`, `.io`, `.uk`, etc.
- **Second-level domain.** `example`.
- **Subdomain.** `www`, `api`, `mail`, etc.

Each level is managed by different organizations. ICANN coordinates the root; Verisign runs `.com`; registrars sell `example.com`; you control `*.example.com`.

## Recursive resolution

When your browser asks "what's the IP of example.com?":

1. **Browser cache check.** Has the answer recently? Done.
2. **OS cache check.** Same.
3. **Stub resolver (OS) asks recursive resolver.** Usually your ISP's, or 1.1.1.1, 8.8.8.8, etc.
4. **Recursive resolver checks its cache.** If yes, returns.
5. **Else, recursive resolver asks the root.** "Where do I find .com info?"
6. **Root replies.** "Ask one of these .com TLD servers."
7. **Recursive resolver asks TLD.** "Where do I find example.com info?"
8. **TLD replies.** "Ask one of these authoritative servers."
9. **Recursive resolver asks authoritative.** "What's the A record for example.com?"
10. **Authoritative replies.** "93.184.216.34, TTL 300 seconds."
11. **Recursive resolver caches and returns to client.**

Each step is a separate query. Caching at every level prevents repeating the whole dance for every lookup.

## Public DNS resolvers

Common ones:

| Resolver | IP | Notes |
|----------|-----|-------|
| Cloudflare | 1.1.1.1 | Fast, privacy-focused |
| Google | 8.8.8.8 | Reliable, widely used |
| Quad9 | 9.9.9.9 | Blocks known malicious domains |
| OpenDNS | 208.67.222.222 | Family / business filters |

ISPs have their own; sometimes they're slow or modify responses. Configuring 1.1.1.1 / 8.8.8.8 is a common tweak.

## Authoritative servers

The servers that hold the actual zone data. For a domain you own:

- **Registrar's nameservers.** (Default — easy but limited.)
- **Cloud DNS.** Route 53 (AWS), Cloud DNS (GCP), Cloudflare DNS (Cloudflare).
- **Self-hosted.** PowerDNS, BIND, NSD — rare for most.

Whichever you pick, you set up at the registrar: "Use these nameservers for my domain."

## Looking at DNS

```
$ dig example.com                  # full answer with metadata
$ dig +short example.com           # just the IP
$ dig example.com @1.1.1.1         # ask a specific resolver
$ dig +trace example.com           # follow from root down
$ dig example.com MX               # mail records
$ dig example.com NS               # nameservers
```

`dig +trace` shows the recursive resolution step by step. Useful for debugging "why am I getting this answer?"

## Caching and TTL

Every DNS response includes a TTL (Time To Live) — how long it can be cached:

```
example.com.    300    IN    A    93.184.216.34
                ↑
                TTL in seconds
```

Common TTLs:

- 60-300s: changing often (canary, rapid deploys).
- 3600 (1h): typical.
- 86400 (1 day): stable.

When you change DNS, the cache propagates over the TTL. Set short TTLs before planned changes; revert to long after.

## DNS protocol details

- **Port 53.** UDP by default; TCP for large responses or zone transfers.
- **Single packet** for typical queries.
- **No authentication** (until DNSSEC).
- **Plain text** (until DoH / DoT).

These properties are why DNS hijacking, cache poisoning, and surveillance via DNS are all historical concerns. Modern variants (DNSSEC, DoH, DoT) address them.

## Common record types

Covered next lesson in detail. Quick preview:

- **A.** Hostname → IPv4 address.
- **AAAA.** Hostname → IPv6 address.
- **CNAME.** Alias (one hostname → another hostname).
- **MX.** Mail servers for a domain.
- **TXT.** Free-form text (SPF, DKIM, domain verification).
- **NS.** Authoritative nameservers.
- **SOA.** Zone metadata.

## Reverse DNS

Going the other way — IP to name:

```
$ dig -x 8.8.8.8
8.8.8.8.in-addr.arpa.    86400    IN    PTR    dns.google.
```

Special `.in-addr.arpa` zone for reverse records. Used by mail servers (anti-spam checks), logging tools, traceroute.

## Common confusions

- **DNS isn't a database query.** It's a recursive walk through a tree.
- **"Propagation" isn't magic.** It's just caches expiring at their TTL.
- **Browsers cache DNS independently** of the OS. Sometimes need to flush both.

## Flushing DNS caches

```
# Linux
$ sudo systemd-resolve --flush-caches      # newer
$ sudo /etc/init.d/dns-clean restart       # older

# macOS
$ sudo dscacheutil -flushcache
$ sudo killall -HUP mDNSResponder

# Browser
# Each browser has its own; usually clears with cache.
```

## Summary

- DNS is a hierarchical tree: root → TLD → second-level → subdomain.
- Recursive resolution walks the tree; caches at every level.
- Set up at registrar via nameservers (Route 53, Cloudflare, etc.).
- Public resolvers: 1.1.1.1, 8.8.8.8.
- TTLs control cache duration — shorten before planned changes.
- `dig` is the diagnostic tool of choice.

Next: record types.
