---
module: 5
position: 4
title: "Network diagnostics: ss, dig, traceroute"
objective: "Diagnose connectivity, DNS, and port issues from the shell."
estimated_minutes: 6
---

# Network diagnostics: ss, dig, traceroute

## ss — sockets and listening ports

`ss` (replacement for old `netstat`) shows network sockets:

```
$ ss -tlnp                          # TCP listening, numeric ports, processes
$ ss -tunlp                         # TCP+UDP listening, all info
$ ss -t                             # all TCP (established + listening)
$ ss -s                             # summary stats
$ ss -t state established           # only established connections
```

For "what's using port 8080":

```
$ ss -tlnp | grep :8080
LISTEN 0  128  0.0.0.0:8080  0.0.0.0:*  users:(("myapp",pid=1234,fd=3))
```

Modern equivalent of `netstat -tlnp` (still works on many systems).

## dig — DNS

```
$ dig example.com                   # A records (IPv4)
$ dig example.com AAAA              # AAAA records (IPv6)
$ dig example.com MX                # mail servers
$ dig example.com NS                # name servers
$ dig example.com TXT               # text records (SPF, DKIM)
$ dig +short example.com            # just the answer, no metadata
$ dig @1.1.1.1 example.com          # query a specific resolver
$ dig +trace example.com            # follow from root servers down
```

`dig` is the right tool over `nslookup` or `host`. More detail, more flags, better diagnostics.

For reverse lookup (IP → name):

```
$ dig -x 8.8.8.8
$ dig +short -x 8.8.8.8
```

## ping — basic reachability

```
$ ping example.com                  # ICMP echo, infinite
$ ping -c 4 example.com             # 4 packets
$ ping -i 0.5 example.com           # interval 0.5s
$ ping -W 2 example.com             # timeout 2s
```

ping confirms ICMP works between you and the target. Many cloud providers block ICMP by default — `ping` failing doesn't necessarily mean the host is down. Use `curl` against a known port as a more reliable reachability check.

## traceroute / mtr — the path

```
$ traceroute example.com            # hops to target
$ mtr example.com                   # live + statistics
```

`mtr` is `traceroute` + `ping` combined, with continuous updates and per-hop loss%. Far more useful for diagnosing intermittent issues.

```
                            Packets               Pings
 Host                       Loss%   Snt   Last   Avg  Best  Wrst
 1. 192.168.1.1               0.0%    10    0.5   0.6   0.5   1.0
 2. isp-router.example         0.0%    10   12.0  11.5  10.0  13.0
 3. backbone-1.com             0.0%    10   23.0  24.0  22.0  28.0
 4. backbone-2.com            10.0%    10   25.0  26.0  24.0  35.0   ← packet loss
 5. example.com                0.0%    10   35.0  35.0  34.0  37.0
```

Loss at a middle hop = problem at that link / router. Loss only at the destination = often firewalls rate-limiting ICMP, not a real problem.

## nslookup — older DNS tool

Still works:

```
$ nslookup example.com
```

For everyday DNS, `dig +short` is better. nslookup has interactive mode (`nslookup` with no args) that's useful for exploratory work.

## host — minimal DNS

```
$ host example.com                  # quick lookup
```

Even shorter than dig +short. Less flexible.

## getent — system lookup

```
$ getent hosts example.com          # uses system resolver (incl. /etc/hosts)
$ getent ahosts example.com         # all addresses with flags
```

Sometimes /etc/hosts overrides DNS for testing. `getent hosts` shows what the system actually resolves to, accounting for the local override.

## curl as a connectivity test

For HTTP/HTTPS reachability:

```
$ curl -I https://example.com
$ curl --max-time 5 -s -o /dev/null -w "%{http_code}\n" https://example.com
```

More useful than ping for "is the service up?" because it actually tests the service, not just the host.

## nc (netcat) — generic TCP/UDP

```
$ nc -zv example.com 443             # test if port is open
$ nc -l 8080                         # listen on port 8080
$ echo "hello" | nc example.com 80   # send raw text
```

For testing arbitrary TCP services, nc is the Swiss Army knife. `-z` is "scan-only" (no data sent); `-v` is verbose.

## tcpdump — packet capture

```
$ sudo tcpdump -i eth0 port 80                  # http packets on eth0
$ sudo tcpdump -i any -w capture.pcap port 443  # save to pcap
$ sudo tcpdump -nn -i any host 1.2.3.4          # numeric, all interfaces
```

For deep network debugging. Heavy hammer; usually you want simpler tools first.

## /etc/hosts — local overrides

```
# /etc/hosts
127.0.0.1   localhost
127.0.0.1   myapp.local
192.168.1.50   dev-server
```

Maps hostname → IP, bypassing DNS. Useful for local development ("point myapp.local to localhost") or testing how an application behaves with a different IP.

Add entries; programs will use them.

## /etc/resolv.conf — DNS servers

```
# /etc/resolv.conf
nameserver 1.1.1.1
nameserver 8.8.8.8
```

Which DNS resolvers your system uses. Often managed by NetworkManager / systemd-resolved; editing manually may not persist.

## Common diagnostic flows

**"Can I reach example.com?"**

```
$ ping -c 3 example.com              # ICMP reachability
$ dig +short example.com             # resolves to what?
$ curl -I https://example.com        # HTTPS works?
```

**"My app can't connect to db.internal."**

```
$ dig +short db.internal             # does DNS resolve?
$ nc -zv db.internal 5432            # is the port reachable?
$ curl http://db.internal:5432       # does the app see it?
```

**"Where's the latency coming from?"**

```
$ mtr example.com                    # which hop is slow / lossy?
$ ping example.com                   # baseline RTT
```

**"What's listening on this server?"**

```
$ ss -tlnp                           # listening TCP ports + processes
```

## Mistakes to avoid

- **Assuming ping failure = down.** Many networks block ICMP.
- **Using only `nslookup`.** Limited; `dig` is better for everything.
- **Not checking /etc/hosts when "DNS is acting weird."** Local overrides can confuse.
- **Trusting `traceroute` for "definitive" path.** Routes change; some routers don't respond.

## Summary

- `ss -tlnp` for listening ports + processes.
- `dig` for DNS (`+short` for quick answers, `+trace` for full path).
- `traceroute` / `mtr` for the path; mtr is more diagnostic.
- `curl -I` as the "is HTTP service up?" check (better than ping for HTTP).
- `nc -zv host port` for "is this TCP port open?"
- `/etc/hosts` overrides DNS locally.

## Course complete

You've covered the Linux command line from basic navigation through processes, text manipulation, scripting, and network diagnostics. The shell is the through-line of every Linux system, and fluency compounds — every script you write, every server you SSH into, every CI pipeline you debug benefits from the patterns here.

Next steps: install a Linux VM or use WSL if you don't have Linux, and use the shell for daily work for a week. The tools become muscle memory through use. Resources to keep on hand: `man` pages, `tldr` for quick examples, `explainshell.com` for unfamiliar commands, and the ArchWiki for distro-agnostic deep dives.
