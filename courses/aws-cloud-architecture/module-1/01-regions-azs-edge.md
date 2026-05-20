---
module: 1
position: 1
title: "Regions, AZs, and edge locations"
objective: "Understand AWS's global topology and why it matters."
estimated_minutes: 8
---

# Regions, AZs, and edge locations

## The puzzle

"The cloud" sounds like one giant computer somewhere. AWS is not one computer. It's hundreds of data centers organized into a deliberate geographic structure that you, the architect, must understand to make good decisions. Get the geography wrong and you'll pay for latency, lose data during outages, and run afoul of regulations.

## The simple version

AWS organizes infrastructure in a hierarchy:

1. **Regions**: large geographic areas (us-east-1 in Virginia, eu-west-1 in Ireland, ap-northeast-1 in Tokyo, etc.). Each region is isolated from the others — separate billing zones, separate failure domains, separate data residency.

2. **Availability Zones (AZs)**: clusters of data centers within a region. Each region has 3-6 AZs. AZs are physically separate (miles apart) but connected by fast low-latency networking. Designed so that one AZ failing doesn't take down another.

3. **Edge locations**: small points of presence around the world, used by CloudFront (CDN), Route 53 (DNS), and a few other edge services. Hundreds of these globally.

When you deploy something on AWS, you choose a region (mandatory) and often an AZ (for some services). Picking right is the foundation of everything else.

## The technical version

### Why regions exist

Regions are the unit of geographic isolation:

- **Data residency**: regulations (GDPR, HIPAA, financial rules) require some data to stay in specific jurisdictions. Pick a region in the right country.
- **Latency**: a user in Tokyo hitting a service in Virginia has 150ms+ round-trip latency. Use a Tokyo region for Tokyo users.
- **Failure isolation**: a major regional outage (rare but real) only affects that region.
- **Pricing**: prices vary by region. us-east-1 (Virginia) is typically cheapest; sa-east-1 (São Paulo) and ap-south-1 (Mumbai) are pricier.

Regions are not interchangeable. Each operates independently.

### Naming conventions

Region IDs follow a pattern: `{geo}-{direction}-{number}`.

- `us-east-1`: US East (Virginia). The original, most services launch here first.
- `us-east-2`: US East (Ohio).
- `us-west-1`: US West (Northern California).
- `us-west-2`: US West (Oregon). The most-used West Coast region.
- `eu-west-1`: Europe West (Ireland).
- `eu-central-1`: Europe Central (Frankfurt).
- `ap-northeast-1`: Asia Pacific Northeast (Tokyo).
- `ap-southeast-1`: Asia Pacific Southeast (Singapore).
- `ap-south-1`: Asia Pacific South (Mumbai).

There are 30+ regions and growing. New regions get added regularly (Spain, Israel, UAE, etc.).

### What's in a region

A region contains:

- 3-6 Availability Zones.
- Regional services that span all AZs (like S3, DynamoDB, Lambda).
- Local zones in some regions (smaller deployments closer to specific cities).
- Outposts for some on-prem extensions.

Some services are global (IAM, Route 53, CloudFront). They don't live in a region per se but have regional endpoints. Most services are regional.

### Availability Zones in detail

An AZ is a logical grouping of data centers (typically 1-6 physical buildings). Key properties:

- **Physical separation**: AZs are miles apart, on different power grids, different flood plains.
- **Low-latency connection**: <2 ms between AZs in the same region, redundant fiber.
- **Independent failure domain**: an AZ losing power doesn't affect other AZs.
- **Hidden mapping**: your "us-east-1a" might be different from another account's "us-east-1a" — AWS randomizes the labels per account to spread load across actual data centers.

When you build for high availability, you deploy across AZs. A common pattern: web servers in two AZs, database with a replica in a second AZ, load balancer routing across both.

### What "deployed in an AZ" means per service

Different services interact with AZs differently:

- **EC2 instances**: tied to one specific AZ when launched.
- **EBS volumes**: tied to one AZ; can't be attached cross-AZ.
- **RDS**: primary in one AZ, optional standby in another (Multi-AZ).
- **S3**: stores data redundantly across multiple AZs within a region automatically.
- **DynamoDB**: data replicated across AZs automatically.
- **Lambda**: AWS runs it in multiple AZs; you don't pick.

The pattern: stateful services (EC2, EBS, RDS) require AZ awareness; stateless or managed services hide the AZs from you.

### High availability via Multi-AZ

A standard durable architecture deploys across multiple AZs:

- Load balancer (ALB or NLB) spans AZs.
- App servers (EC2 Auto Scaling Group) in 2+ AZs.
- Database (RDS Multi-AZ) with primary and standby in different AZs.
- Static assets in S3 (already multi-AZ by default).

If one AZ fails (rare but it happens), the system continues serving traffic from healthy AZs. This is the baseline for production workloads. Single-AZ deployments are for dev/test or cost-sensitive non-critical workloads only.

### Edge locations and CloudFront

Edge locations are AWS's CDN points of presence. ~600+ locations globally, way more than regions. Used by:

- **CloudFront**: caches content close to users.
- **Route 53**: DNS resolution at edge.
- **Global Accelerator**: routing optimizations.
- **Lambda@Edge / CloudFront Functions**: run code at edge locations.

Edge locations are smaller than full regions — they don't run EC2, S3, or general-purpose services. They're optimized for fast content delivery and DNS resolution.

### Local Zones and Outposts

For specialized needs:

- **Local Zones**: smaller AWS deployments in specific cities (LA, Chicago, Atlanta, etc.) for low-latency to local users. Subset of services available.
- **Wavelength Zones**: even closer to 5G mobile networks for ultra-low-latency mobile apps.
- **Outposts**: AWS hardware in your own data center, managed by AWS, for hybrid cloud or strict data-residency.

These are edge cases (literal pun). Most workloads run in standard regions.

### Choosing a region

Decision factors:

1. **Where are users?** Pick closest region for latency.
2. **Data residency requirements?** EU users may require eu-west-1 or similar; HIPAA workloads need specific regions.
3. **Service availability**: not all services in all regions. Check before committing.
4. **Pricing**: significant differences across regions.
5. **Existing footprint**: if your team already uses us-east-1, expanding there is operationally easier.

For most US-based teams without specific requirements, us-east-1 (Virginia) or us-west-2 (Oregon) are common defaults.

### Region pairs and cross-region patterns

For disaster recovery, you sometimes need cross-region replication:

- **S3 Cross-Region Replication**: automatic copying.
- **RDS Cross-Region Read Replicas**: read replicas in another region for DR.
- **CloudFormation StackSets**: deploy infrastructure to multiple regions.
- **Route 53 health checks** with failover routing.

Cross-region is expensive (data transfer costs) and complex. Most apps don't need it; multi-AZ within a region is sufficient for HA.

If you do need cross-region (regulatory DR, true multi-region active-active), plan carefully. It's a major engineering investment.

### When AZs aren't actually independent

Theoretically, AZs are independent. In practice, they share:

- AWS control plane services (some failures can cascade).
- Network paths between AZs.
- DNS resolution.

Past outages have shown that "Multi-AZ" doesn't guarantee zero impact during major AWS incidents. For true high availability, multi-region or multi-cloud may be needed. For 99.99% workloads, multi-AZ is usually enough.

### Outage history and learning

Major AWS outages (rare but instructive):

- **us-east-1 December 2021**: large multi-service outage affecting many AWS services and customer applications worldwide that depend on us-east-1.
- **us-east-1 June 2023**: smaller scope but still significant.
- Earlier outages in 2017, 2015, 2011 (S3 down).

Lessons: us-east-1 is the most-used region but also the most-impacted by outages because so much depends on it. For mission-critical workloads, consider regions other than us-east-1 or multi-region patterns.

### Cost implications of geography

Regional pricing variations:

- Compute: 10-30% cheaper in us-east-1 vs more expensive regions.
- Data transfer: into AWS is free; out is expensive; cross-region is intermediate; same-AZ cheaper than cross-AZ.
- Specific services have their own pricing tables per region.

For cost-sensitive workloads in flexible locations, us-east-1 wins. For latency-sensitive workloads near specific user populations, the right region wins despite higher prices.

### Naming and tagging discipline

For multi-region deployments, naming conventions matter:

```
prod-us-east-1-web-asg
prod-eu-west-1-web-asg
```

Without consistent naming and tags, multi-region operations become chaos. Establish conventions early.

### Practical first steps

If you're just starting on AWS:

1. **Pick a region** based on user location and any compliance needs.
2. **Use 2-3 AZs** in that region for production workloads.
3. **Stay in one region** until you have a specific reason to go multi-region.
4. **Tag resources** with environment, project, region.
5. **Don't deploy production in us-east-1 unless you have to** — high-volume region with more outage history.

## Three real-world scenarios

**Scenario 1: A SaaS startup serving US customers.**
Pick us-west-2 (Oregon) or us-east-2 (Ohio) — avoiding us-east-1's outage history. Deploy across 3 AZs in the region. All resources in this one region. Simple, durable, cost-effective. Add multi-region only if compliance or scale requires it.

**Scenario 2: A European company storing personal data.**
GDPR requires data residency in EU. Pick eu-west-1 (Ireland) or eu-central-1 (Frankfurt) based on which has the services you need. Stay in that region for primary workloads. Use European edge locations for CloudFront.

**Scenario 3: A global product launching in Japan.**
Multi-region: us-east-1 for US users, ap-northeast-1 for Japan users. Database might be us-east-1 primary with read replicas in Tokyo. CloudFront serves cached content from edge locations globally. Complex, expensive, but necessary for the use case.

## Common mistakes to avoid

- **Defaulting to us-east-1** without thinking about outage exposure.
- **Single-AZ production deployments** — one AZ failure takes you down.
- **Cross-region by default** — expensive when not needed.
- **Forgetting AZ randomization** — your `us-east-1a` is not your colleague's.
- **Ignoring data transfer pricing** between regions and AZs.

## Read more

- AWS Global Infrastructure overview (aws.amazon.com/about-aws/global-infrastructure).
- AWS Well-Architected Framework — Reliability Pillar.
- AWS Whitepaper on disaster recovery.

## Summary

- **Regions** are geographic areas; each is isolated.
- **AZs** are physically-separate clusters within a region.
- **Edge locations** are CDN/DNS points of presence (600+ globally).
- **High availability** = deploy across multiple AZs.
- **Service-region** varies: some services everywhere, some not.
- **us-east-1** is busiest and most-outage-affected; consider alternatives for critical workloads.
- **Cross-region** is expensive and complex; use when there's a real reason.
- **Pricing varies** by region; 10-30% typical spread.

Next: the shared-responsibility model.
