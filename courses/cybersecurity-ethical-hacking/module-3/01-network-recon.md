---
module: 3
position: 1
title: "Network reconnaissance: nmap, netcat, basics"
objective: "See a network the way an attacker does."
estimated_minutes: 6
---

# Network reconnaissance: nmap, netcat, basics

## What network recon looks like

Once an attacker has IP addresses (from passive recon), they probe to find:

- Live hosts.
- Open ports.
- Service versions on those ports.
- Known vulnerabilities in those versions.

Tools: `nmap` is the standard. `netcat` is the Swiss Army knife. Both are used legally on networks you own/authorized, illegally elsewhere.

## nmap basics

```
$ nmap 10.0.0.0/24                        # scan subnet for live hosts
$ nmap -p 22,80,443 example.com           # specific ports
$ nmap -p- example.com                    # all 65535 ports
$ nmap -sV example.com                    # version detection
$ nmap -A example.com                     # aggressive (version + OS + scripts)
$ nmap -Pn example.com                    # skip host discovery (assume up)
$ nmap -sS example.com                    # SYN scan (stealthier; needs root)
```

Output shows open ports + service guesses + sometimes OS:

```
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 8.9p1 Ubuntu
80/tcp   open  http     nginx 1.18.0
443/tcp  open  ssl/http nginx 1.18.0
3306/tcp open  mysql    MySQL 5.7.42
```

For a defender: know what's exposed. Run nmap against your public IPs monthly; verify it matches your intent.

## Service identification + CVE lookup

Once you know "OpenSSH 8.9p1", search:

- https://nvd.nist.gov for known CVEs.
- https://github.com/advisories for the same.
- vendor security pages.

Many vulnerable services have public exploits. `searchsploit` (from exploitdb) searches a local database:

```
$ searchsploit openssh 8.9
```

Defenders: same workflow in reverse. "What's the latest patch level for nginx? Are we on it?"

## Port categories

- **Well-known (0-1023).** SSH (22), HTTP (80), HTTPS (443), DNS (53), SMTP (25), SMB (445).
- **Registered (1024-49151).** MySQL (3306), Postgres (5432), Redis (6379), MongoDB (27017).
- **Ephemeral (49152-65535).** Client-side / temporary.

Common gotchas:
- Redis 6379 without auth = full takeover. Historically internet-exposed by accident.
- MongoDB 27017 without auth = data exfiltration. Same story.
- Elasticsearch 9200 without auth = same.

If any of these are on a public IP, that's an incident.

## nmap scripts (NSE)

Nmap has a scripting engine for common probes:

```
$ nmap --script vuln example.com           # check for common vulns
$ nmap --script http-enum example.com      # enumerate web paths
$ nmap --script ssl-enum-ciphers -p 443 example.com   # weak TLS ciphers
```

Hundreds of scripts. Useful for quick sweeps; not a substitute for proper vulnerability scanners (Nessus, OpenVAS) for production audits.

## netcat (nc) — the Swiss Army knife

```
$ nc -zv example.com 80                    # is port 80 open?
$ nc example.com 80                        # interactive TCP connection
$ nc -l 8080                               # listen on port 8080
$ echo "GET / HTTP/1.0" | nc example.com 80   # send HTTP request manually
$ nc -l 4444 > received.txt                # receive file
$ cat file.txt | nc target 4444            # send file
```

nc is small but versatile — ad-hoc TCP/UDP testing, file transfer, even (with `-e`) reverse shells (which is why it's banned on most security-hardened systems).

`ncat` (from nmap) is the modern equivalent with TLS support.

## SSH and SCP for legitimate work

Most network access is via SSH (covered in the Linux Command Line course). For audit / forensics:

```
$ ssh user@host "ss -tlnp"                 # what's listening on host
$ ssh user@host "ps aux"                   # what's running
$ rsync user@host:/var/log/ ./logs/        # pull logs for analysis
```

## Passive monitoring with tcpdump / Wireshark

For analyzing traffic on a network you control:

```
$ sudo tcpdump -i eth0 port 80 -nn
$ sudo tcpdump -i any -w capture.pcap host 1.2.3.4
```

Then open `capture.pcap` in Wireshark for graphical analysis. Useful for diagnosing protocol issues, spotting unencrypted credentials, etc.

For defense: detect anomalies. Sudden traffic to unknown destinations = possible exfiltration.

## Recon detection — the defender's side

Defenders should detect being scanned:

- **IDS/IPS.** Snort, Suricata — pattern-match scan signatures.
- **Cloud-native detection.** AWS GuardDuty, Azure Defender — alert on port scans.
- **Log analysis.** ssh login failures across many usernames in a short window = scan.

A few sweeps are normal background noise. Coordinated, targeted scans against your range warrant attention.

## Common mistakes

- **Scanning anyone without permission.** Some jurisdictions consider this a crime; nearly all networks consider it hostile.
- **Trusting service banners.** Banner says "Apache 2.2.21" → could be lying or could be a honeypot.
- **`nmap` with full options against production.** Aggressive scans can crash services. Use `-T2` (slower) on production; `-T4` only on test.
- **Forgetting to scan IPv6.** Some services are exposed on v6 only and missed by v4-only scans.

## Summary

- nmap = standard tool for port/version/host scanning.
- netcat = ad-hoc TCP/UDP swiss army knife.
- Always scan your own perimeter first — find what's exposed before attackers.
- Map service versions → known CVEs → patch.
- Detect being scanned via IDS / cloud-native alerting.

Next: firewalls, VPNs, segmentation.
