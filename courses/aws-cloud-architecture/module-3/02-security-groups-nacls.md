---
module: 3
position: 2
title: "Security groups, NACLs, and route tables"
objective: "Understand how traffic actually flows."
estimated_minutes: 8
---

# Security groups, NACLs, and route tables

## The puzzle

Three different mechanisms in AWS networking control whether traffic flows: route tables decide where, security groups decide what at the instance level, NACLs decide what at the subnet level. They overlap in confusing ways. Understanding the actual flow of a packet through these layers is the foundation for both troubleshooting and security.

## The simple version

When a packet tries to reach an EC2 instance in your VPC:

1. **Route table** says: is there a route for this destination? If not, dropped.
2. **NACL** at subnet boundary: does the inbound rule allow this? (Stateless — separate outbound rule for response.) If not, dropped.
3. **Security group** at instance: does the inbound rule allow this? (Stateful — response automatically allowed.) If not, dropped.

For a connection to succeed, all three must permit it. For most workloads: route tables direct traffic, security groups do the firewalling, NACLs stay at default.

## The technical version

### The packet's journey

A request from the internet to an EC2 instance behind an ALB:

1. User → DNS resolves to ALB IP → ALB in public subnet.
2. ALB security group: allow 443 from 0.0.0.0/0.
3. Public subnet NACL: allow (default).
4. Route table: ALB internal traffic stays in VPC.
5. ALB → EC2 in private subnet via VPC internal network.
6. Private subnet NACL: allow (default).
7. EC2 security group: allow 8080 from ALB security group only.
8. Request reaches the app.

Each layer is a checkpoint. Any one failing breaks the connection.

### Security groups — deeper

Security groups are AWS's primary firewall mechanism. Properties:

- **Stateful**: when an inbound packet is allowed, the response (outbound) is automatically allowed regardless of outbound rules. Same for outbound: an allowed outbound response gets its return packet allowed.
- **Default deny**: no rules = no traffic.
- **Allow-only**: no deny rules. You can't say "deny IP 1.2.3.4"; you have to not allow it in the first place.
- **Multiple per ENI**: an EC2 instance can have multiple security groups; their rules union.
- **Source can reference other SGs**: "allow port 5432 from `app-tier-sg`" instead of an IP range. This is powerful for tier-based architectures.

A common app stack:

```
alb-sg:    inbound 443 from 0.0.0.0/0
           outbound 8080 to app-sg

app-sg:    inbound 8080 from alb-sg
           outbound 5432 to db-sg
           outbound 443 to 0.0.0.0/0  (for AWS API calls etc.)

db-sg:     inbound 5432 from app-sg
           outbound default (or restrict)
```

Each tier only accepts traffic from the tier above. Lateral movement is hard.

### Outbound rules

Default outbound in a security group: allow all. For stricter security:

- Restrict outbound to known destinations.
- Allow port 443 to 0.0.0.0/0 for AWS API calls (or use VPC endpoints).
- Allow database ports to specific DB security groups.
- Deny everything else.

Restricting outbound prevents data exfiltration if an instance is compromised. Most teams skip this because it's tedious; for high-security workloads, it's worth the effort.

### NACLs — when to actually use them

NACLs are subnet-level, stateless firewalls. Default: allow everything.

Reasons to customize NACLs:

- **Explicit deny**: block specific IP ranges (security groups can't deny).
- **Defense in depth**: another layer beyond security groups.
- **Subnet-wide rules**: "no traffic from this subnet ever reaches the internet" enforced at NACL.

Costs of custom NACLs:

- Stateless means you need both inbound and outbound rules — easy to forget the return traffic.
- Order matters (lower rule numbers evaluated first).
- Adds complexity for security troubleshooting.

For most workloads, default NACLs are fine. Customize when you have a specific reason.

### Route tables in detail

Route tables direct traffic by destination. Each subnet is associated with one route table.

A typical setup:

```
Main route table (default for VPC):
  10.0.0.0/16 → local (automatic, can't change)

Public route table:
  10.0.0.0/16 → local
  0.0.0.0/0   → IGW

Private route table:
  10.0.0.0/16 → local
  0.0.0.0/0   → NAT-GW

DB route table:
  10.0.0.0/16 → local
  (no internet route at all — even more locked down)
```

Different subnets associated with different route tables for different access patterns.

### Specific route examples

Some useful routing patterns:

- **VPC peering route**: `10.1.0.0/16 → pcx-12345` (to peered VPC).
- **Transit Gateway**: `10.0.0.0/8 → tgw-12345` (to all VPCs via TGW).
- **VPN gateway**: `192.168.0.0/16 → vgw-12345` (to on-prem).
- **VPC endpoint**: route to specific service via endpoint.

Most specific match wins. `/24` route beats `/16` route for the address it covers.

### Stateful vs stateless gotchas

Stateful (security groups): inbound 80 allowed, response automatically allowed.
Stateless (NACLs): inbound 80 allowed, but if outbound rule doesn't allow ephemeral ports (1024-65535) back to the client, the response is dropped.

Common NACL bug: people add inbound allow rules but forget to add outbound rules for return traffic. Connections appear to hang.

If you do customize NACLs, remember: each connection requires both directions explicitly.

### Security group references vs CIDR

When you write a security group rule, the source can be:

- A CIDR range: `10.0.0.0/16`.
- A specific IP: `1.2.3.4/32`.
- Another security group: `sg-12345`.
- A prefix list (managed lists of CIDRs).

Referencing security groups is usually best:

- **Stable**: SG doesn't change as instances come and go.
- **Tier-based**: matches your application architecture.
- **Self-documenting**: clearer than IP ranges.

Use CIDR for fixed external sources (specific office IPs, partner networks). Use SG references for internal AWS-to-AWS traffic.

### The "0.0.0.0/0" trap

`0.0.0.0/0` means "all IPs". Allowing it on inbound:

- **Port 443 from 0.0.0.0/0**: fine for public web servers.
- **Port 22 from 0.0.0.0/0**: dangerous (open SSH to the world).
- **Port 3389 from 0.0.0.0/0**: dangerous (open RDP).
- **Port 5432 (Postgres) from 0.0.0.0/0**: catastrophic.

Always check what `0.0.0.0/0` rules exist. AWS provides Trusted Advisor and Security Hub checks for these.

For SSH/RDP access, use AWS Systems Manager Session Manager (no inbound SSH port needed at all) or restrict to specific IPs (a bastion host, your office IP, VPN range).

### Egress filtering and exfiltration prevention

Default security groups allow all outbound. If an instance is compromised, the attacker can send data anywhere on the internet.

Egress restrictions:

- Allow only specific outbound destinations (other AWS services via endpoints, known third-party APIs, etc.).
- Deny direct internet outbound except where required.
- Use AWS Network Firewall for sophisticated egress filtering.

For most workloads, default permissive egress is OK. For high-value targets (PII databases, financial systems), restrict egress.

### Connection tracking

Security groups track connections via the connection tracking table:

- TCP connection: SYN, SYN-ACK, ACK opens; tracked until FIN.
- UDP: tracked for some timeout.
- ICMP: tracked similarly.

For very high connection rates, you can hit per-ENI connection tracking limits. Symptoms: connections start failing after a while. Solutions: more/bigger instances, connection pooling, batching.

### Application Load Balancer security

For ALBs:

- **ALB security group**: open inbound 443 from internet; outbound to app tier.
- **App security group**: inbound from ALB SG only.

ALBs evaluate SG rules per request. Don't put thousands of CIDR rules — performance and management both suffer.

### Common scenarios — debugging

When traffic isn't reaching where you expect, check in order:

1. **Route table**: does the destination have a route?
2. **NACL**: is there a deny rule? (Both directions if customized.)
3. **Security group source**: do you allow this source?
4. **Security group port**: do you allow this port?
5. **Application listening?** Is the app actually bound to the port?
6. **OS firewall?** iptables/ufw running on the EC2?
7. **Network interface attached?** Is the ENI in the right subnet?

Most "can't connect" issues are #3 or #4. NACL and route table are rarely the issue unless customized.

VPC Reachability Analyzer: AWS service that traces a packet's path and tells you where it's blocked. Useful for non-obvious cases.

### Common security group mistakes

- **`0.0.0.0/0` for admin ports** (SSH, RDP, database ports).
- **Overly broad source ranges**: `10.0.0.0/16` when you only need `10.0.0.0/24`.
- **No outbound restrictions** when the app has a defined set of outbound destinations.
- **Sprawling SG count**: hundreds of SGs nobody owns.
- **Inline IP ranges** that change without updating the SG.
- **Disabled / reused default SG**: the VPC's default SG is broad; don't use it for production.

### Practical pattern

For most three-tier apps:

```
LB-SG:     inbound 80, 443 from 0.0.0.0/0
           outbound 8080 to app-SG

App-SG:    inbound 8080 from LB-SG
           outbound 5432 to DB-SG
           outbound 443 to 0.0.0.0/0  (for APIs / SDK)
           (or replace with VPC endpoints)

DB-SG:     inbound 5432 from App-SG only
           no outbound, or minimal

Admin-SG:  inbound 22 from specific IPs (office, bastion)
           used by admin/management instances only
```

Apply by tier. Maintain via IaC (CloudFormation/Terraform/CDK). Review periodically.

## Three real-world scenarios

**Scenario 1: Cross-account architecture.**
Team A in account 1 needs Team B's services in account 2. Solution: VPC peering between the two VPCs, route tables updated on both sides, security groups reference each other's SGs by ID. Cross-account SG references work but only with explicit grant.

**Scenario 2: Connection hangs through customized NACL.**
A team added an inbound allow rule for port 5432 but forgot the corresponding outbound rule on ephemeral ports (1024-65535) for response. Connections appear to hang and time out. Adding the outbound NACL rule fixes it. Stateless NACLs require explicit bidirectional rules.

**Scenario 3: SSH brute-force attempts.**
EC2 in public subnet with SG allowing 22 from 0.0.0.0/0. Logs show thousands of SSH attempts per day. Fix: remove the public SSH rule entirely; use AWS Systems Manager Session Manager for shell access (no open port, IAM-controlled, logged). Or, if SSH is needed, restrict to specific IPs or a bastion host.

## Common mistakes to avoid

- **`0.0.0.0/0`** on admin/database ports.
- **NACLs customized without thinking about return traffic**.
- **Security groups not referenced by other SGs** — using CIDRs when SG-to-SG would work.
- **Sprawling SG count** without ownership.
- **Default SG used for production** — too broad by default.
- **No regular SG review** — rules accumulate forever.

## Read more

- AWS VPC Security Best Practices.
- AWS Whitepaper: "AWS Security Best Practices."
- AWS Trusted Advisor security checks.

## Summary

- **Route tables** decide where traffic goes.
- **Security groups**: stateful, instance-level, default deny, allow-only.
- **NACLs**: stateless, subnet-level, default allow, can deny.
- **Stateful SG vs stateless NACL** — stateless requires bidirectional rules.
- **SG references** are preferred over CIDRs for internal traffic.
- **`0.0.0.0/0`** is fine for public HTTPS, dangerous for admin ports.
- **Egress restrictions** are an extra security layer worth applying to high-value workloads.
- **Use SSM Session Manager** instead of open SSH/RDP.

Next: IAM in depth.
