---
module: 3
position: 2
title: "Firewalls, VPNs, and segmentation"
objective: "Control what can talk to what."
estimated_minutes: 6
---

# Firewalls, VPNs, and segmentation

## The principle: deny by default

Networks should default-deny: nothing can talk to anything except where explicitly allowed. Less attack surface → fewer paths for attackers.

Firewalls enforce this. VPNs let trusted users tunnel into otherwise-deny networks. Segmentation divides the network so a breach in one zone doesn't reach others.

## Firewall basics

A firewall sits between networks (or on a host) and applies rules:

```
ALLOW  src=10.0.0.0/8         dst=any          port=any
ALLOW  src=0.0.0.0/0          dst=10.0.1.5     port=443
ALLOW  src=10.0.1.5           dst=10.0.2.10    port=5432
DENY   src=any                dst=any          (default rule)
```

Rules typically: source IP/range, destination IP/range, port, action (allow/deny/log). Stateful firewalls track connections so return traffic is implicitly allowed.

Types:

- **Network firewalls.** Appliance or cloud security group; sits at network boundaries.
- **Host firewalls.** On each machine (iptables, nftables, ufw on Linux; Windows Defender Firewall; macOS pf).
- **Application firewalls (WAF).** HTTP-aware; inspects request content for attacks.

A defensive setup uses all three: WAF in front, network firewall around segments, host firewall on each instance.

## Cloud security groups

In AWS / GCP / Azure, "security group" is the cloud-native firewall. Default-deny in/out (mostly), explicit allow rules.

```
# AWS security group example
Inbound:
  Allow TCP 443 from 0.0.0.0/0     # HTTPS from internet
  Allow TCP 22 from 10.0.0.0/16    # SSH from VPC only

Outbound:
  Allow TCP 443 to 0.0.0.0/0       # outbound HTTPS (for updates, APIs)
  Allow TCP 5432 to db-sg          # to Postgres in db security group
```

Reference security groups by name in rules → DB only accepts connections from app-sg, regardless of IP changes.

Tools: Terraform / Pulumi for codifying; periodic audits to catch drift (manual ad-hoc rules).

## VPNs — secure remote access

When users / admins / services need to reach private resources, options:

1. **VPN.** OpenVPN, WireGuard. Tunnel to the private network; appear "inside."
2. **Bastion host.** SSH to a public host; then SSH inward.
3. **Zero-trust proxies.** Cloudflare Access, Tailscale, AWS SSM Session Manager. Per-app authentication; no broad network access.

Modern preference: zero-trust proxies. Granular per-app access; revocable; per-user logging. Old-school VPNs grant access to entire subnets, which is more attack surface than necessary.

## WireGuard — the modern VPN

WireGuard is small, fast, and dramatically simpler than OpenVPN:

```ini
# server config
[Interface]
PrivateKey = ...
Address = 10.8.0.1/24
ListenPort = 51820

[Peer]
PublicKey = ...
AllowedIPs = 10.8.0.2/32
```

Public/private keypair per device. ~4000 lines of code (OpenVPN: ~400,000). Default on modern Linux distros via the kernel module.

For self-hosted VPN, WireGuard is the right choice in 2026.

## Network segmentation

Divide the network into zones:

- **Public / DMZ.** Web servers, load balancers. Internet-facing.
- **Application tier.** App servers. Talks to DB, not internet directly.
- **Database tier.** Databases. Only app tier can talk to it.
- **Admin / corp.** Office IPs, management.
- **Untrusted (guest WiFi, IoT).** Isolated from production.

Rules: only allowed flows. App tier → DB. Web tier → app tier. Internet → web tier. Nothing else.

Why: if a web server is compromised, the attacker reaches only the app tier — not the database, admin tools, etc. They've got a foothold but limited blast radius.

Cloud equivalents: VPCs with multiple subnets, NACLs (network ACLs at subnet level) + security groups. Kubernetes equivalents: network policies between namespaces.

## Microsegmentation

Take it further — each service has its own zone:

- DB only accepts from app-A (not other apps).
- Logging service only accepts from production VMs.
- Internal API gateway only from authenticated clients.

In Kubernetes: NetworkPolicy resources enforce pod-to-pod allow/deny. Modern service meshes (Istio, Linkerd) extend this with mTLS between services.

The principle: even an attacker with internal access can move laterally only along approved paths.

## NAT and ingress/egress

**NAT (Network Address Translation).** Maps internal IPs to a public IP. Common for outbound: many instances share one egress IP. Inbound: load balancers map a public IP to internal services.

NAT doesn't replace firewalls — it just changes IPs. A common confusion: "I'm behind NAT so I'm safe." Wrong; if your port 22 is forwarded through, attackers can still SSH attempts at scale.

**Egress filtering.** Restrict outbound too. A compromised host can't exfiltrate data if its egress is limited.

```
# Allow outbound to known endpoints only
ALLOW out to s3.amazonaws.com:443    # backups
ALLOW out to api.stripe.com:443      # payments
DENY  out (anything else)
```

Egress filtering catches data exfiltration in flight. Often skipped because it's harder to set up than ingress; pays back in incident response.

## DDoS mitigation

For internet-facing services, attacker can flood with traffic to overwhelm. Defenses:

- **Cloudflare, AWS Shield, Akamai.** Cloud-scale DDoS absorption.
- **Rate limiting.** Per-IP request caps at the edge.
- **Anycast.** Distribute traffic globally so no single endpoint is overwhelmed.

For a small site: Cloudflare's free tier provides meaningful protection. For larger: paid plans, dedicated DDoS providers.

## Mistakes to avoid

- **"Internal traffic is trusted."** Compromised hosts move laterally; trust nothing.
- **Open SSH on 0.0.0.0/0.** Constant brute-force attempts. Restrict to known IPs or use bastion.
- **No egress filtering.** Exfiltration looks like normal HTTP outbound.
- **Security group sprawl.** Manual rules pile up; audit periodically.
- **VPN granting full network access.** Replace with per-app zero-trust proxies.

## Summary

- Firewalls deny by default; explicit allow only.
- Layer them: WAF + network firewall (security groups) + host firewall.
- Segment networks into tiers; restrict cross-tier flows.
- Use zero-trust proxies (Cloudflare Access, Tailscale) over broad VPN access.
- Apply egress filtering to catch exfiltration.
- WireGuard for self-hosted VPN.

Next: OS hardening.
