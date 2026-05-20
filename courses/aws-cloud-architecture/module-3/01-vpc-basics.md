---
module: 3
position: 1
title: "VPC — your private network in the cloud"
objective: "Design a working VPC layout."
estimated_minutes: 8
---

# VPC — your private network in the cloud

## The puzzle

When you launch an EC2 instance, it lives in a Virtual Private Cloud (VPC). What is that, exactly? It's a software-defined network — your own private IP space inside AWS, with subnets, routing, gateways, and firewalls. Get the VPC design right early and everything else slots in cleanly. Get it wrong and you're refactoring networks while production runs.

## The simple version

A VPC is a private network in a single AWS region. Within it you create:

1. **Subnets**: IP ranges within the VPC, each in one AZ. Either "public" (can reach internet) or "private" (no direct internet).
2. **Internet Gateway**: lets public subnets reach the internet.
3. **NAT Gateway**: lets private subnets initiate outbound to the internet.
4. **Route tables**: control how traffic flows between subnets and out.
5. **Security groups**: stateful firewalls on EC2/RDS/etc.
6. **NACLs**: stateless firewalls at subnet level (rarely customized).

The standard layout: 3 public subnets (one per AZ) for load balancers, 3 private subnets (one per AZ) for app servers, 3 private subnets for databases. Application traffic flows from internet → LB in public subnets → app servers in private → databases deeper still.

## The technical version

### CIDR ranges

A VPC is defined by an IP address range using CIDR notation:

- `10.0.0.0/16` = 65,536 addresses (`10.0.0.0` through `10.0.255.255`).
- `10.1.0.0/16` = another 65,536 (different range).
- `172.16.0.0/12` = ~1 million addresses.

Best practice: use RFC 1918 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`). Plan CIDRs across all VPCs to avoid overlap if you ever need VPC peering or transit gateways.

Common pattern: `10.<env>.0.0/16` where env is unique per VPC (10.0/16 for prod, 10.1/16 for staging, 10.2/16 for dev). Easy mental model, avoids overlap.

### Subnets and AZs

Subnets divide a VPC's CIDR into smaller blocks. Each subnet:

- Lives in exactly one AZ.
- Has its own CIDR block (must fit within the VPC's range).
- Is either "public" (has a route to internet gateway) or "private" (no IGW route).

For high availability across 3 AZs:

```
VPC: 10.0.0.0/16

Public subnets (for load balancers):
  10.0.0.0/24  — us-east-1a
  10.0.1.0/24  — us-east-1b
  10.0.2.0/24  — us-east-1c

Private app subnets:
  10.0.10.0/24 — us-east-1a
  10.0.11.0/24 — us-east-1b
  10.0.12.0/24 — us-east-1c

Private DB subnets:
  10.0.20.0/24 — us-east-1a
  10.0.21.0/24 — us-east-1b
  10.0.22.0/24 — us-east-1c
```

Each /24 gives 251 usable addresses (AWS reserves 5 per subnet). Plenty for most workloads. Use bigger CIDRs (/22, /20) if you'll have many instances per subnet.

### Public vs private subnets

The distinction is route table-based:

- **Public subnet**: has a route to an Internet Gateway. Resources can have public IPs and reach/be reached by the internet.
- **Private subnet**: no route to IGW. Resources have only private IPs. To reach the internet, traffic must go through a NAT Gateway in a public subnet.

The public/private label is purely about routes. A subnet with a route to IGW is "public"; one without is "private."

Best practice: put as little as possible in public subnets. Load balancers and bastion hosts only. Everything else (app servers, databases) in private subnets.

### Internet Gateway

A VPC-level component that allows traffic between the VPC and the internet:

- One IGW per VPC.
- Attached to the VPC, then referenced in route tables.
- Free to create and use.

Public subnets have a route like `0.0.0.0/0 → IGW`. Private subnets do not have this route.

### NAT Gateway

For private subnets that need outbound internet access (e.g., to download package updates, call external APIs):

- NAT Gateway in a public subnet.
- Private subnets have a route `0.0.0.0/0 → NAT Gateway`.
- Traffic flows: private subnet → NAT GW → IGW → internet.

NAT Gateway has cost: $0.045/hour ($32/month) + $0.045/GB processed. For high-traffic workloads, this adds up.

For high availability, deploy a NAT Gateway in each AZ and route each AZ's private subnets through its own NAT GW (so an AZ failure doesn't take down all private outbound).

Alternative: VPC endpoints for AWS services (free for S3, DynamoDB; small per-hour cost for others) bypass NAT entirely. Use these whenever possible — major cost saver.

### VPC endpoints

VPC endpoints let resources in a VPC reach AWS services without going through the public internet (and without paying NAT charges):

- **Gateway endpoints**: for S3 and DynamoDB. Free. Add a route in your route tables.
- **Interface endpoints (AWS PrivateLink)**: for most other AWS services. Costs $0.01/hour + per-GB.

A VPC with private subnets needing to call S3, DynamoDB, KMS, Secrets Manager, etc., should use VPC endpoints for those services. Reduces NAT traffic and improves security (traffic stays on AWS network).

### Route tables

Route tables control where traffic goes. Each subnet is associated with exactly one route table.

A route table contains routes like:

- `10.0.0.0/16 → local` (traffic within VPC; automatic).
- `0.0.0.0/0 → IGW` (internet traffic for public subnets).
- `0.0.0.0/0 → NAT-GW-id` (internet traffic for private subnets).
- `10.1.0.0/16 → vpc-peering-connection` (to a peered VPC).

The most specific match wins (longest-prefix match). Default is "no route" = no traffic.

### Security groups

Stateful firewalls applied at the network interface level (each EC2 instance, RDS instance, Lambda in a VPC, etc.):

- **Default deny**: only allow rules; no deny rules.
- **Stateful**: response traffic is automatically allowed.
- **Reference other security groups**: "allow from `web-tier-sg`" instead of IP ranges.
- **Multiple SGs per ENI**: rules are union'd.
- **Default outbound = allow all**: change for stricter security.

Good security groups:

- Web tier SG: allow 443 from `0.0.0.0/0` (public).
- App tier SG: allow port from web tier SG only.
- DB tier SG: allow port from app tier SG only.

This layered model (only the layer above can reach the layer below) is the standard pattern. Avoid SGs that allow `0.0.0.0/0` on non-public-facing ports.

### NACLs (Network ACLs)

Subnet-level stateless firewalls:

- **Stateless**: response traffic isn't automatically allowed; you must configure both directions.
- **Allow and deny rules**: ordered by rule number.
- **Default = allow all**: starts permissive.
- **Apply to all traffic in/out of subnet**.

NACLs are usually left at default (allow all) because security groups are simpler and stateful. Customize NACLs only when you need:

- Explicit deny rules (e.g., block specific IP ranges).
- Defense-in-depth where SG misconfiguration shouldn't be the only barrier.
- Subnet-level rules (e.g., entire database subnet can never reach internet, period).

For most workloads, default NACLs + carefully-designed security groups is the right pattern. Customizing NACLs adds complexity without much benefit unless you need their specific features.

### VPC peering

Connect two VPCs so resources can talk privately:

- Same region or cross-region.
- Same account or cross-account.
- Must have non-overlapping CIDRs.
- Add routes on both sides.

Used for: connecting environments (shared services VPC to many app VPCs), cross-account collaboration.

Doesn't transit: VPC A peered with B, B peered with C, doesn't mean A can reach C. For multi-VPC connectivity, use Transit Gateway.

### Transit Gateway

A regional hub for connecting many VPCs and on-premises networks:

- One TGW connects up to thousands of VPCs.
- Routes between attached networks centrally.
- Replaces complex VPC peering meshes.

For organizations with many VPCs (large companies with multi-account, multi-VPC setups), Transit Gateway is the right backbone. Has per-hour and per-GB pricing.

### Direct Connect and VPN

For hybrid cloud:

- **Direct Connect**: dedicated fiber link between your data center and AWS. Low latency, predictable bandwidth.
- **VPN**: encrypted tunnel over the internet. Cheaper, higher latency, less reliable.

Most workloads don't need either. For organizations migrating from on-prem or running hybrid, both are common.

### Common VPC mistakes

A few patterns to avoid:

- **One big subnet**: lose AZ resilience.
- **CIDR overlaps** with other VPCs you'll later peer.
- **Production resources in public subnets**: should be private.
- **Security groups allowing `0.0.0.0/0`** on internal ports.
- **No VPC endpoints**: pay NAT for AWS service traffic.
- **No flow logs**: can't audit network traffic.
- **One NAT Gateway** across multiple AZs: SPOF.

### VPC Flow Logs

Logs network traffic metadata at the VPC, subnet, or ENI level:

- Source/destination IP, port, protocol.
- Bytes transferred.
- Accept or reject.

Useful for: security audits, debugging connectivity issues, traffic analysis.

Enable VPC Flow Logs for any non-trivial production VPC. Send to CloudWatch Logs or S3.

### Default VPC

Every AWS account in every region has a "default VPC" — pre-configured with public subnets in each AZ, IGW, sane defaults. Easy for quick experiments.

For production, create your own VPCs with controlled CIDRs and explicit subnet design. Default VPC is fine for sandbox; don't put production in it.

### IPv6

VPCs can support IPv6 in addition to IPv4. Each subnet gets a /64 IPv6 block. Useful for:

- Public-facing services that should support IPv6.
- High-density deployments (more addresses).
- Future-proofing.

Adds some complexity (dual-stack routing, separate security group rules). For most workloads, IPv4-only is still fine.

### Practical VPC starting layout

For a new production workload, this layout works well:

```
VPC: 10.0.0.0/16
  AZ1 (us-east-1a):
    Public:  10.0.0.0/24  (LB, NAT-GW)
    App:     10.0.10.0/24 (app servers)
    DB:      10.0.20.0/24 (databases)
  AZ2 (us-east-1b):
    Public:  10.0.1.0/24
    App:     10.0.11.0/24
    DB:      10.0.21.0/24
  AZ3 (us-east-1c):
    Public:  10.0.2.0/24
    App:     10.0.12.0/24
    DB:      10.0.22.0/24

  IGW
  NAT-GW in each public subnet (1 per AZ)
  VPC endpoints for S3, DynamoDB
  Security groups: LB→App→DB tier model
  VPC flow logs enabled
```

This is a sound baseline. Adjust as needed for specific requirements.

## Three real-world scenarios

**Scenario 1: Production app servers exposed to the internet.**
Someone put EC2 instances in a public subnet with public IPs and 0.0.0.0/0 in the security group on SSH and HTTP. Bots scanned, found, attempted SSH brute-forcing. One instance was compromised. Fix: move app servers to private subnets behind a load balancer; SSH access only via SSM Session Manager or a tight bastion; restrict security groups to known sources. The compromised instance should be replaced via ASG, not patched in place.

**Scenario 2: Surprise NAT Gateway bill.**
Microservices in private subnets called S3, DynamoDB, and several other AWS services. All traffic went through NAT Gateway at $0.045/GB. Monthly NAT bill: $5K. Fix: VPC endpoints for S3 and DynamoDB (free) + interface endpoints for other heavily-used services. NAT bill drops to $500/month. One-day engineering effort.

**Scenario 3: Cross-AZ outage.**
Single NAT Gateway in AZ1. When AZ1 had issues, app servers in AZ2 and AZ3 lost outbound internet — because their default route pointed at NAT-AZ1. The fix: one NAT GW per AZ, each AZ's private subnets routed through their own NAT GW. Higher cost (~3x NAT charges) but eliminates the SPOF.

## Common mistakes to avoid

- **Public IPs and open security groups** on production resources.
- **Single NAT Gateway** for multi-AZ private subnets.
- **No VPC endpoints** for AWS service traffic.
- **Overlapping CIDRs** that block future peering.
- **Production in default VPC**.
- **No flow logs** for production VPCs.
- **NACLs configured before SGs** without need.

## Read more

- AWS VPC User Guide.
- AWS Whitepaper: "AWS Security Best Practices."
- AWS Whitepaper: "Building Scalable and Resilient Architectures."

## Summary

- **VPC** = your private network in a region.
- **Subnets** are AZ-bound IP ranges; public (with IGW route) or private (without).
- **Internet Gateway** for incoming/outgoing public internet.
- **NAT Gateway** for private subnets to reach outbound internet.
- **VPC endpoints** bypass NAT for AWS services (free for S3/DynamoDB).
- **Route tables** control traffic flow.
- **Security groups**: stateful, instance-level firewalls; default deny.
- **NACLs**: stateless subnet-level firewalls; usually default.
- **VPC peering / Transit Gateway** connect multiple VPCs.
- **VPC Flow Logs** for auditability.

Next: security groups, NACLs, and routing in detail.
