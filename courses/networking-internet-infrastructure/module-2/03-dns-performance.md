---
module: 2
position: 3
title: "DNS performance: caching and TTL"
objective: "Make name resolution fast and predictable."
estimated_minutes: 5
---

# DNS performance: caching and TTL

## DNS is on the critical path

Every connection to a named host starts with DNS. Slow DNS = slow page loads, slow API calls. A 200ms DNS lookup added to a 50ms HTTP response is most of the wall time.

Fast DNS = aggressive caching + good resolver choice + appropriate TTLs.

## Where caching happens

DNS responses are cached at multiple layers:

1. **App-level.** Some apps (browsers especially) cache DNS independently.
2. **OS-level stub resolver.** systemd-resolved on Linux, mDNSResponder on macOS.
3. **Recursive resolver.** ISP's resolver, 1.1.1.1, etc.
4. **Auth-side negative cache.** "This doesn't exist" — cached too.

Cache hits avoid the full recursion. A first-time lookup might be 100ms; cached lookups are sub-millisecond.

## TTL strategy

Trade-off: long TTL = better cache hits, slower propagation when you change records.

- **60-300s.** Active development, canary, frequent changes.
- **3600 (1h).** Normal production.
- **86400+ (1 day+).** Stable infrastructure.

For changes: pre-stage with low TTL 24-48h before; revert after.

## Resolver choice

Public resolvers vary in:

- **Latency to you.** Often correlates with geographic proximity (anycast helps).
- **Cache size + freshness.** Bigger resolvers = more popular names cached.
- **Privacy.** Some resolvers log queries; some don't (1.1.1.1 advertises no-log).
- **Filtering.** Some block malicious domains (Quad9), parental controls (CleanBrowsing).

For most users: 1.1.1.1 or 8.8.8.8 is fast and reliable. ISP resolvers can be slow or modified.

## DNS prefetching

Browsers prefetch DNS for links on the page — when you hover, the DNS lookup may already be done. HTML hint:

```html
<link rel="dns-prefetch" href="//api.example.com">
<link rel="preconnect" href="//api.example.com">
```

`preconnect` goes further — TCP + TLS handshake done early. Both reduce perceived latency.

## Connection pooling and reuse

DNS-resolved connections can be reused — HTTP/2 multiplexes many requests on one connection; HTTP/3 / QUIC similar. Keep-alive on HTTP/1.1.

When connections are reused, DNS only happens at the start. App perf measurements often show DNS as a small fraction of total time *because* of reuse — but the initial lookup matters.

## Negative caching

When a name doesn't exist, the negative answer is also cached:

```
example.com.    300    IN    NXDOMAIN
```

If you mis-spelled a hostname and it didn't resolve, your resolver caches "doesn't exist" too. Misconfiguration that returns NXDOMAIN can stick for the negative TTL.

For zones you control, set a sensible SOA minimum TTL (often 300-3600s) — too long and broken records linger.

## DNS over HTTPS (DoH) / DNS over TLS (DoT)

Plain DNS is unauthenticated and unencrypted. Anyone on the network path (your ISP, café Wi-Fi) can see what you're looking up and modify responses.

DoH (HTTPS port 443) and DoT (TLS port 853) encrypt DNS:

```
$ curl -H "accept: application/dns-json" \
       "https://cloudflare-dns.com/dns-query?name=example.com&type=A"
```

Browsers (Chrome, Firefox, Safari) can enable DoH directly, often defaulting to it. Trade-offs: encryption + integrity at the cost of slight latency overhead.

Some networks block DoH (corporate filtering); some networks REQUIRE it.

## DNS-based load balancing

You can return different IPs to different clients:

- **GeoDNS.** Closer datacenter for the requester.
- **Latency-based.** Lowest-RTT endpoint.
- **Weighted.** Send X% to each cluster.
- **Health-aware.** Only return IPs that are healthy.

Route 53, Cloudflare Load Balancing, NS1 offer these. Useful for global apps with multiple regions.

Caveat: TTLs matter. If a region dies, clients with cached entries keep trying it until TTL expires. Short TTLs (30-60s) for HA-critical DNS.

## Anycast DNS

Multiple servers worldwide announce the same IP. The internet's routing sends clients to the nearest one.

All major public resolvers use anycast. Latency-to-resolver is typically <10ms anywhere. Authoritative zones (Cloudflare DNS, Route 53) also use anycast for their published nameservers — your DNS works even if some regions fail.

## Monitoring DNS

Things to watch:

- **Query latency.** P99 should be <50ms for popular names.
- **NXDOMAIN rate.** Spikes mean misconfig or attack.
- **QPS to your nameservers.** Trends over time.
- **Geographic distribution.** Where queries come from.

DNS providers expose these. For self-hosted, BIND / PowerDNS have built-in stats.

## Common performance pitfalls

- **Long TTL during deploy.** Old answers persist.
- **Stale cache after change.** Flush local + browser caches when testing.
- **Slow ISP resolver.** Switch to 1.1.1.1.
- **CNAME chains.** Each hop adds latency. Keep them shallow (1-2 hops max).
- **Many DNS lookups per page.** Consolidate to fewer hostnames; preconnect.

## Summary

- DNS caches at app, OS, recursive resolver levels. Cache hits are sub-ms.
- TTL controls cache duration. Pre-stage low before changes; revert after.
- 1.1.1.1 / 8.8.8.8 typically beat ISP resolvers.
- DoH / DoT encrypt + authenticate DNS.
- GeoDNS / anycast for global low-latency.
- Watch: query latency, NXDOMAIN rate, QPS.

Next: DNSSEC and DoH.
