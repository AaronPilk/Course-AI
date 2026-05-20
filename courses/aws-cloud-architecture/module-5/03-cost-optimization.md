---
module: 5
position: 3
title: "Cost optimization that actually works"
objective: "Reduce AWS bills without breaking things."
estimated_minutes: 8
---

# Cost optimization that actually works

## The puzzle

"Our AWS bill is too high" is a complaint heard everywhere. Some of it is unavoidable cost of operation; much of it is waste. The art of cost optimization is finding the waste systematically and trimming it without breaking what's running. Done right, 30-60% savings are typical without compromising performance or reliability.

## The simple version

Cost optimization in the right order:

1. **See where the money goes**: tagging, Cost Explorer, breakdowns by service/team/environment.
2. **Clean up**: delete unused resources, snapshots, old logs. Quick wins.
3. **Right-size**: many resources are bigger than they need to be. Measure actual usage and scale down.
4. **Commit for steady workloads**: Savings Plans and Reserved Instances save up to 72%.
5. **Use spot for interruption-tolerant**: 60-90% savings.
6. **Architectural changes**: managed services, serverless, caching — bigger wins but more engineering.
7. **Continuous monitoring**: prevent regression.

Most teams have 20-30% in cleanup wins available immediately, another 20-30% in commitment savings, and smaller incremental wins from architectural changes.

## The technical version

### Visibility first

You can't optimize what you can't see. First step: tagging and cost breakdowns.

**Tagging**:

- Required tags: `Environment`, `Team`, `Project`, `CostCenter`, `Owner`.
- Enforce via SCPs or AWS Config rules.
- Activate tags as cost allocation tags in Billing.

**Cost Explorer**:

- Filter and group costs by service, region, tag, account.
- See historical trends.
- Forecast future costs.
- Drill into specific services.

**AWS Budgets**:

- Set thresholds, alert when approaching or exceeding.
- Per-account, per-service, per-tag.
- Daily or monthly budgets.

**AWS Cost Anomaly Detection**:

- ML-based detection of unusual spending.
- Email alerts when anomalies appear.

**Third-party tools**:

- Vantage, CloudHealth, Yotascale, Anodot for more sophisticated FinOps.
- Useful at higher scale.

For starting: get tagging right, enable Cost Explorer, set up budget alerts. Three things, done in a day.

### Quick-win cleanup

Things that accumulate without anyone noticing:

**Unattached EBS volumes**: when EC2 is terminated, EBS volumes can be left orphaned. Find via Cost Explorer or AWS Trusted Advisor. Delete after verifying not needed.

**Old EBS snapshots**: snapshots taken daily/weekly accumulate indefinitely. Implement a retention policy via Data Lifecycle Manager.

**Old AMIs**: custom AMIs older than retention period. Find via EC2 → AMIs.

**Unused load balancers**: ALBs/NLBs without targets still charge hourly base cost. Audit and delete.

**Idle RDS instances**: dev/test RDS that's not actively used. Stop them; only running RDS costs.

**Unused Elastic IPs**: charged when not attached to a running instance. Release unused.

**Unused NAT Gateways**: $32/month + traffic. If a VPC has private subnets that don't actually need outbound, NAT GW is waste.

**CloudWatch log groups without retention**: accumulate forever. Set retention.

**Old CloudFormation stacks**: occasional drift cleanup.

**S3 incomplete multipart uploads**: failed uploads leave partial data. Lifecycle rule to clean up after a few days.

**Aurora clusters left running**: especially in dev. Aurora has minimum costs even idle.

Run through this list quarterly. Each item is a quick win.

### Right-sizing

Many resources are bigger than they need. Steps:

1. Check actual utilization via CloudWatch (last 2-4 weeks).
2. Identify resources at <40% utilization most of the time.
3. Resize down or change instance type.

**EC2**: AWS Compute Optimizer makes specific recommendations based on CloudWatch metrics. Use it.

**EBS**: storage that's 80%+ allocated unused is a candidate for shrinking (requires data migration in some cases).

**RDS**: many DB instances run at 20% CPU. Drop down a size.

**Lambda**: not size — but memory allocation. Lambda Power Tuning tool tests different memory configurations.

**Elasticache**: cluster sizing usually conservative; measure actual usage.

Aggressive right-sizing saves significant money — 30-50% on compute is common. The risk is right-sizing too small and hitting performance issues during traffic spikes; tune with monitoring.

### Commitment savings

For steady predictable workloads, commitments save big.

**Savings Plans**:

- **Compute Savings Plans**: commit $X/hour of compute spend; AWS picks the best discount across EC2, Lambda, Fargate. Most flexible.
- **EC2 Instance Savings Plans**: more specific (instance family + region) but slightly higher discount.
- **SageMaker Savings Plans**: for ML workloads.

Up to 72% off on-demand for 3-year, all-upfront. 30-40% typical for 1-year, no-upfront.

**Reserved Instances** (older but still useful):

- RDS Reserved Instances: 1 or 3 year, up to 60% off.
- ElastiCache Reserved Nodes.
- OpenSearch Reserved Instances.
- DynamoDB Reserved Capacity.

The math: identify your steady-state usage from CloudWatch over 30+ days. Commit to that level. Variable peaks remain on-demand.

Don't over-commit. If usage drops, you still pay for the commitment. Better to slightly under-commit and run some on-demand.

### Spot Instances

Spare EC2 capacity at up to 90% off — can be reclaimed with 2 minutes notice.

Use spot for:

- Batch processing.
- Stateless web servers (in ASG, will replace evicted instances).
- CI/CD build farms.
- Big data processing (Spark, EMR).
- Dev/test environments.

Don't use spot for:

- Stateful workloads.
- Workloads with strict SLA.
- Anything that can't tolerate interruption.

Spot Fleet and ECS Fargate Spot can compose Spot capacity automatically with regular on-demand for resilience.

### Storage optimization

S3 cost optimization:

- **Lifecycle policies**: transition to IA, then Glacier, then expire.
- **Intelligent-Tiering**: AWS auto-tiers based on access patterns.
- **Cleanup**: delete objects past retention, abort old multipart uploads.

EBS cost optimization:

- **Right-size volumes**: don't provision 500 GB for 50 GB use.
- **gp3 instead of gp2**: typically cheaper for similar performance.
- **Delete unused snapshots**.

For 10s of TB+ data, savings here are substantial.

### Networking optimization

Data transfer is sneaky cost:

- **VPC endpoints for AWS service traffic**: bypass NAT (free for S3/DynamoDB, small cost for others).
- **CloudFront for internet egress**: typically cheaper per GB than direct from origin.
- **Same-AZ traffic**: free (vs cross-AZ at $0.01/GB).
- **NAT Gateway alternatives**: VPC endpoints for the heavily-used services.

For multi-AZ deployments, some cross-AZ traffic is unavoidable (HA). Minimize it where possible.

### Architectural cost wins

Bigger changes with bigger wins:

**Switch to managed services**: RDS instead of self-managed Postgres on EC2. DynamoDB instead of self-managed NoSQL. Often the right cost too because of operational savings.

**Use serverless where it fits**: Lambda + API Gateway can be dramatically cheaper than always-on EC2 for sporadic workloads.

**Adopt Aurora Serverless v2** for variable database load: auto-scales, no over-provisioning.

**Use CloudFront for static assets**: reduces origin load and egress cost.

**Add ElastiCache** to reduce DB load: cheaper than scaling up DB.

**Multi-tenant where possible**: one big database serving many tenants is cheaper than one DB per tenant for small tenants.

Each architectural change is engineering work. Prioritize based on cost impact and effort.

### Sustainability + cost

Sustainability and cost optimization overlap significantly:

- **Right-sizing**: less wasted capacity = less power = less cost.
- **Graviton instances**: ARM-based, 20-40% better efficiency. Less power, less cost.
- **Shut down off-hours**: dev environments not running 24/7 = less power, less cost.
- **Use newer hardware**: better efficiency, often cheaper.

For most decisions, the sustainability win and cost win are the same direction.

### FinOps practice

For organizations at scale, FinOps is the discipline of managing cloud cost:

- **Visibility**: dashboards everyone can see.
- **Accountability**: teams own their costs.
- **Optimization**: continuous, embedded in engineering.
- **Forecasting**: predict future costs.

Roles: dedicated FinOps engineers or finance partners; many tools (Vantage, CloudHealth, custom dashboards) support this.

For small teams: monthly cost review, set budgets, prune. For large companies: dedicated FinOps team.

### Cost-aware development

Embed cost awareness in engineering:

- **Cost in design reviews**: estimate cost impact of new architectures.
- **Cost in CI**: tools like Infracost show cost impact of Terraform changes in PRs.
- **Per-team budgets and reports**: teams see their own costs.
- **Cost retrospectives**: post-incident or post-feature, look at cost impact.

Engineers who don't see cost can't optimize it. Visibility creates ownership.

### Cost optimization order

A practical order:

1. **Tagging + Cost Explorer**: see where the money goes.
2. **Quick cleanup**: unused resources, snapshots, NAT, logs. Days of work, significant savings.
3. **Right-size**: weeks of work, big savings.
4. **Commitments**: hours of analysis, lock in for 1-3 years.
5. **Spot for tolerant workloads**: more engineering effort but big % savings.
6. **Architectural**: months, biggest savings if you're willing.
7. **Continuous monitoring**: ongoing forever.

Don't skip steps. Buying Savings Plans on over-provisioned capacity locks in waste. Clean up first.

### Watch for these surprises

Common surprise sources:

- **Data transfer out**: especially after launching a public API.
- **Unattached EBS** after terminating EC2.
- **CloudWatch Logs** without retention.
- **NAT Gateway** processing charges at scale.
- **Cross-region replication** with no lifecycle policy.
- **GPU instances** left running.
- **DataSync / DMS** running longer than expected.
- **DynamoDB on-demand** at unexpected scale.
- **Backup retention** accumulating.
- **Forgotten dev/test resources**.

Cost Anomaly Detection catches these usually. Daily check of Cost Explorer dashboard catches them faster.

### When cost isn't the priority

Sometimes cost optimization isn't the right focus:

- **Early-stage startup**: focus on shipping, not pennies.
- **Pre-product-market-fit**: hardware cost is a fraction of engineering time.
- **Critical migration**: don't over-optimize during major moves.
- **Sustained-loss businesses**: cost cuts won't save you.

Cost optimization is a productive investment when there's enough cost to optimize. For a $500/month bill, the time investment isn't worth it. For a $50,000/month bill, it absolutely is.

## Three real-world scenarios

**Scenario 1: A 60% reduction in 3 months.**
Starting bill: $50K/month. Month 1: tagging + cleanup (removed 200+ unused resources, set log retention). Bill: $40K. Month 2: right-sizing EC2 (Compute Optimizer recommendations) and RDS. Bill: $30K. Month 3: bought 1-year Savings Plans for steady compute. Bill: $20K. 60% reduction, no architectural changes, no application changes.

**Scenario 2: Catching a runaway log group.**
Cost Anomaly Detection alerts: CloudWatch Logs jumped from $50/day to $400/day overnight. Investigation: a recent code deploy turned on DEBUG logging in production. Fix: revert log level, set retention policy. Caught within 24 hours instead of waiting for the monthly bill.

**Scenario 3: An expensive NAT Gateway.**
Microservices architecture with NAT Gateway charging $5K/month, mostly for traffic to S3 and DynamoDB. Fix: VPC endpoints for both services (free for these gateway endpoints). Bill drops to $500/month. One day of engineering work.

## Common mistakes to avoid

- **No visibility** — can't optimize what you can't measure.
- **Commitments before cleanup** — locks in waste.
- **Over-aggressive right-sizing** that causes performance issues.
- **No automation** — cost optimization once, drift creeps back.
- **Premature optimization** at very small scale.
- **Spot for stateful workloads** — interruptions cause failures.
- **No cost retrospectives** after launches.

## Read more

- AWS Well-Architected Framework — Cost Optimization Pillar.
- AWS Cost Management documentation.
- FinOps Foundation principles.
- *Cloud FinOps* by J.R. Storment and Mike Fuller.

## Summary

- **Visibility first**: tagging, Cost Explorer, budgets.
- **Quick cleanup**: unused resources, snapshots, log retention.
- **Right-size**: measure actual usage; Compute Optimizer recommendations.
- **Commit for steady**: Savings Plans up to 72% off.
- **Spot for tolerant**: 60-90% off but interruptions.
- **Storage lifecycle**: cheaper tiers for older data.
- **VPC endpoints**: bypass NAT for AWS service traffic.
- **Architectural changes**: managed services, serverless, caching.
- **Continuous monitoring**: catch regressions early.

Next: the AWS mistakes that bite you.
