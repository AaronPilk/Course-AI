---
module: 1
position: 4
title: "How you actually pay for AWS"
objective: "Understand pricing dimensions and surprise-bill risks."
estimated_minutes: 8
---

# How you actually pay for AWS

## The puzzle

AWS pricing has a reputation for being confusing and producing surprise bills. Both reputations are earned. Hundreds of services, each priced along multiple dimensions, with discounts, tiers, and free-tier exceptions. Yet under the complexity is a relatively small set of patterns. Understand those and you can reason about costs.

## The simple version

Most AWS bills are dominated by a few cost categories:

1. **Compute**: EC2, Lambda, ECS, EKS — paying for processing capacity.
2. **Storage**: S3, EBS, EFS — paying for stored bytes.
3. **Data transfer**: especially data transferred OUT of AWS to the internet. The notorious surprise.
4. **Database**: RDS, DynamoDB, Aurora — managed databases.
5. **Networking**: NAT gateways, load balancers, VPN, Direct Connect.

Within each, multiple pricing dimensions: per-hour, per-request, per-GB stored, per-GB transferred. Add region differences, on-demand vs reserved/savings plans, and various tiers — and you get the complexity reputation.

The fix isn't memorization. It's understanding what drives each cost and setting up monitoring to catch surprises early.

## The technical version

### Compute pricing

**EC2 (on-demand)**: pay per second a VM runs. Hourly billing rounded up to the second (mostly). A `t3.medium` instance in us-east-1 is around $0.04/hour = $30/month if left on continuously.

Pricing varies by:
- Instance type (general, compute-optimized, memory-optimized, GPU, etc.).
- Region.
- OS license (Windows is more than Linux).
- Whether on-demand, reserved, savings plan, or spot.

**Lambda**: pay per request + per duration (GB-seconds of memory × execution time). 1 million requests per month free; beyond that, ~$0.20 per million requests + ~$0.0000166667 per GB-second.

**ECS Fargate / EKS**: pay for the underlying compute used by containers.

The big optimization: don't leave EC2 running idle. Shut down dev environments after hours. Use Lambda for sporadic workloads. Use Savings Plans or Reserved Instances for known steady workloads (up to 70% savings).

### Storage pricing

**S3**: pay per GB stored per month, plus per-request fees.

- Standard tier: ~$0.023/GB/month in us-east-1. 1 TB = $23/month.
- Lifecycle to cheaper tiers (Infrequent Access, Glacier) reduces cost for older data.
- Glacier Deep Archive: ~$0.00099/GB/month — 1 TB = $1/month, but retrieval takes hours and costs more.

**EBS**: pay per provisioned GB per month, regardless of how full.

- gp3 SSD: ~$0.08/GB/month + IOPS/throughput configuration.
- io2 SSD (high performance): more.
- A 100 GB gp3 volume is $8/month.

**EFS / FSx**: pay per GB used per month, more expensive than S3 or EBS for the same storage but offer file-system semantics.

The big optimization: lifecycle policies on S3 (move old data to cheaper tiers), right-size EBS volumes (don't provision 500 GB when you use 50), delete unused snapshots and volumes.

### Data transfer pricing — the surprise

Data transfer rules:

- **Inbound (into AWS)**: free.
- **Within the same AZ**: free (mostly).
- **Cross-AZ in same region**: $0.01/GB.
- **Cross-region**: $0.02/GB.
- **Out to the internet**: $0.09/GB (us-east-1, first 10 TB).

These small numbers add up. A workload doing 100 TB/month of internet egress costs $9,000/month just in data transfer. CDN traffic served from CloudFront has different (lower) pricing.

Common surprise: a Kubernetes cluster doing lots of cross-AZ pod-to-pod traffic generates significant transfer charges. NAT Gateways charge per GB processed (~$0.045/GB) plus hourly cost.

CloudFront often saves money on internet egress — caching reduces origin pulls and CloudFront egress is cheaper per GB than direct-from-origin.

### Database pricing

**RDS**: pay for the underlying compute + storage. A `db.t3.medium` is around $50/month + storage + IOPS.

- Multi-AZ doubles cost (you're paying for two instances).
- Read replicas are additional cost.
- Reserved Instances offer significant discounts.

**Aurora**: similar structure but priced differently — pay for compute + storage + I/O operations. Can be cheaper or more expensive than RDS depending on usage.

**DynamoDB**: pay per request + per GB stored.

- On-demand: pay per read/write request. Good for unpredictable traffic.
- Provisioned: pay for reserved read/write capacity. Cheaper for steady predictable traffic.

DynamoDB has a generous free tier and can be very cheap at low scale.

### Networking pricing

**NAT Gateway**: $0.045/hour + $0.045/GB processed. Required for private subnets to reach the internet. Can be a significant cost driver.

**Load Balancers**: ALB ~$16/month base + per-LCU; NLB ~$16/month + per-LCU.

**VPC endpoints**: per-hour + per-GB for gateway endpoints; cheaper than NAT for AWS service traffic.

**Direct Connect / VPN**: hourly + data transfer charges.

The big optimization: VPC endpoints for AWS service traffic (S3, DynamoDB) bypass NAT charges. Right-size NAT gateways or use NAT instances for low-volume scenarios.

### Free tier

AWS offers a "free tier" for new accounts:

- 12-month free tier: 750 hours of t2.micro EC2/month, 5 GB S3, etc.
- Always-free: 1 million Lambda requests/month, 25 GB DynamoDB, etc.

Free tier helps learning and small experiments but doesn't cover production-scale workloads. Many "AWS got expensive" stories are accounts where free tier expired or was exceeded.

### Savings Plans and Reserved Instances

For predictable workloads, commitment-based pricing offers big discounts:

- **Reserved Instances**: commit 1 or 3 years to a specific instance type, region. Up to ~72% off on-demand.
- **Savings Plans (Compute)**: commit to $X/hour of compute spend; AWS picks the best discount across EC2, Lambda, Fargate. More flexible than RIs.
- **Savings Plans (EC2)**: like Savings Plans but EC2-specific. Slightly larger discounts.

For known steady workloads, commit to 1- or 3-year plans. For variable workloads, on-demand is cheaper than overcommitting and not using the capacity.

### Spot Instances

Spot Instances are spare EC2 capacity at up to 90% off — but can be reclaimed with 2 minutes notice. Useful for:

- Batch processing.
- Stateless web servers that can tolerate interruption.
- Big data jobs.
- Dev/test.

Not for stateful workloads or anything that can't restart cleanly. Used right, spot is one of the largest cost optimizations available.

### Tagging for cost visibility

Without tags, your AWS bill is a sea of "EC2 - $X" with no idea which workload is responsible. With consistent tags (environment, team, project, owner), you can break down costs.

Best practice:

1. Define required tags (e.g., `Environment`, `Team`, `Project`, `CostCenter`).
2. Enforce via SCPs or tag policies.
3. Activate tags in Cost Explorer for cost allocation.
4. Review costs by tag regularly.

### Cost Explorer and budgets

AWS provides:

- **Cost Explorer**: visualize costs by service, region, tag, etc. Historical and forecasted.
- **AWS Budgets**: alerts when forecasted or actual cost exceeds thresholds.
- **Cost Anomaly Detection**: ML-based detection of unusual spend.
- **Trusted Advisor**: built-in checks for cost optimization opportunities.

Setting up budgets is one of the first things you do in a new AWS account. A budget alert at, say, 80% of expected monthly spend catches surprises before they become disasters.

### Common surprise-bill scenarios

Real ones:

1. **Unattached EBS volumes**: terminated EC2 leaves volumes; they keep billing.
2. **Old snapshots**: snapshots accumulate; nobody deletes them.
3. **NAT Gateway in dev**: provisioned for dev environment, left running 24/7.
4. **Cross-region replication misconfigured**: data goes to wrong destination.
5. **S3 to internet egress from a public-facing app**: thousands of dollars in egress.
6. **Logs without retention**: CloudWatch Logs accumulating indefinitely.
7. **GPU instances left on**: forgot to terminate.
8. **DataSync, DMS, or other transfer services**: pay-per-byte ops left running.

Each is preventable. None are AWS's fault. Monitoring + tagging + automated cleanup is the answer.

### Pricing across regions

us-east-1 is typically cheapest. Other regions can be 10-30% more for compute, similar for storage. For cost-sensitive non-critical workloads, region choice matters. For latency-critical or compliance-bound workloads, you pay what you pay.

### Cost-aware architecture decisions

Some patterns are cheaper than others:

- **Spot instances** for batch/stateless workloads.
- **S3 + CloudFront** for static content vs EC2 serving directly.
- **Lambda** for sporadic workloads vs always-on EC2.
- **DynamoDB on-demand** for unpredictable traffic vs over-provisioned RDS.
- **Aurora Serverless** for variable database workloads.
- **VPC endpoints** for AWS service traffic vs NAT Gateway.
- **Lifecycle policies** for cold data.
- **Multi-AZ vs cross-region**: multi-AZ is usually enough, much cheaper.

Architecture decisions early in a project compound over years of operation. Picking cost-efficient patterns from day one pays off.

### The bigger picture

For most companies, the right cost optimization order is:

1. **Right-size and clean up**: terminate unused, delete old snapshots, downsize over-provisioned.
2. **Commit for steady workloads**: Savings Plans, Reserved Instances.
3. **Use spot where possible**: batch jobs, stateless tier.
4. **Architecture changes**: switch to managed services with auto-scaling, use serverless where appropriate.
5. **Bigger restructuring**: multi-region only if needed, region migrations, etc.

Each step has diminishing returns and increasing engineering cost. The first 30% of savings is usually easy (clean up); the last 30% requires real architecture work.

## Three real-world scenarios

**Scenario 1: A surprise $50K month.**
A team set up cross-region replication for a backup bucket but pointed it at a region with high egress pricing and didn't set lifecycle rules. Old backups accumulated. The fix: lifecycle policy to delete old replicas, restructured to keep replicas only for required retention. Going forward: budget alerts at $X above baseline.

**Scenario 2: Reducing EC2 spend by 60%.**
Audit revealed: 30% of instances were dev/test running 24/7 (no need); 40% were over-provisioned (memory utilization 20%); 30% were prod that should run on Savings Plans. Actions: schedule dev instances off after hours, right-size based on actual utilization, buy Savings Plans for the rest. Result: 60% reduction in EC2 spend with no application changes.

**Scenario 3: NAT Gateway charges dominating the bill.**
Microservices architecture in private subnets used NAT Gateway for outbound. Per-GB processing charges added up — $5K/month just for NAT. Fix: VPC endpoints for S3 and DynamoDB (free for those services); kept NAT only for traffic that genuinely needed it. Saved $4K/month with one-day engineering effort.

## Common mistakes to avoid

- **No budget alerts** — surprises don't trigger anyone.
- **Untagged resources** — no visibility into what costs what.
- **Forgetting unattached resources** — EBS volumes, snapshots, etc.
- **Over-provisioning** without monitoring actual usage.
- **Cross-region without need** — expensive for small benefit.
- **NAT Gateway without VPC endpoints** for AWS service traffic.
- **Free tier expiration surprises** — track when free tier ends.
- **Spot for stateful workloads** — interruptions cause failures.

## Read more

- AWS Pricing pages (per service).
- AWS Whitepaper: "How AWS Pricing Works."
- AWS Cost Optimization Pillar (Well-Architected).
- Tools like Vantage, CloudHealth, Yotascale (third-party cost management).

## Summary

- **Compute, storage, data transfer, database, networking** dominate most bills.
- **Data transfer out** is the notorious surprise; ~$0.09/GB to internet.
- **Free tier** helps learning but not production scale.
- **Savings Plans / Reserved Instances** save up to 72% for steady workloads.
- **Spot Instances** save up to 90% for interruption-tolerant workloads.
- **Tagging + Cost Explorer + Budgets** are foundational.
- **Common surprises**: unattached resources, NAT charges, egress, accumulated logs.
- **Cost optimization order**: clean up first, then commit, then architect.

That wraps Module 1. Next: core compute and storage services.
