---
module: 2
position: 1
title: "EC2 — virtual machines on AWS"
objective: "Use EC2 effectively."
estimated_minutes: 8
---

# EC2 — virtual machines on AWS

## The puzzle

EC2 is the oldest, most flexible AWS service. It's also the one you reach for too often if you're new to AWS. Many workloads people put on EC2 belong on Lambda, ECS, or RDS instead. But sometimes you really do need a VM, and knowing how EC2 actually works is foundational even when you're using higher-level services that run on it underneath.

## The simple version

EC2 (Elastic Compute Cloud) gives you virtual machines. You pick:

1. **AMI** (Amazon Machine Image): the OS + pre-installed software template.
2. **Instance type**: how much CPU, memory, network, storage.
3. **Region and AZ**: where it runs.
4. **Storage**: EBS volumes attached.
5. **Network**: which VPC, which subnet, security groups.
6. **IAM role**: what AWS APIs it can call.

Launch it; SSH in (or RDP for Windows); install whatever you want; pay per hour (or per second).

The mental model: EC2 is "rent a Linux/Windows server in someone else's data center, with an API."

## The technical version

### Instance types

EC2 instance types follow a naming pattern: `{family}.{size}`, e.g., `t3.medium` or `m5.4xlarge`.

Families (a few of dozens):

- **t** series: burstable performance. Cheap baseline, can burst with credits. Good for variable low-utilization workloads. t3, t4g.
- **m** series: general-purpose balanced CPU/memory. The default for most workloads. m5, m6i, m7i, m7g.
- **c** series: compute-optimized. High CPU-to-memory ratio. c5, c6i, c7i.
- **r** series: memory-optimized. Lots of RAM. r5, r6i, r7i.
- **x** series: extreme memory (TBs of RAM). x1, x2.
- **i** series: storage-optimized with local NVMe. i3, i4i.
- **g/p** series: GPU instances. g4, g5, p4, p5.

Suffixes: `g` for ARM (Graviton), `i` for Intel, `a` for AMD, `n` for high network. Newer = better — try latest generation first.

Sizes: `nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`, ..., up to `metal` (bare metal, no hypervisor overhead).

For most workloads, start with `t3.medium` or `m6i.large` and adjust based on actual usage.

### AMIs (Amazon Machine Images)

An AMI is a template containing an OS + pre-installed software. Options:

- **AWS-provided AMIs**: Amazon Linux, Ubuntu LTS, Windows Server, etc.
- **AWS Marketplace AMIs**: third-party software (Bitnami stacks, security tools).
- **Custom AMIs**: built from your own configuration.

Best practice for production: build custom AMIs with your application baked in. Then launching instances is fast, predictable, and reproducible. Tools like Packer build AMIs from configuration.

Amazon Linux 2023 or Ubuntu 22.04 LTS are common starting points.

### Storage: EBS

By default, an EC2 instance's storage is an EBS (Elastic Block Store) volume. Properties:

- **Persistent**: survives instance stops and starts.
- **AZ-specific**: tied to one AZ; can't be attached to instances in another AZ.
- **Sizeable**: from 1 GB to 64 TB depending on type.
- **Encryptable**: KMS-based encryption optional but recommended.
- **Snapshottable**: point-in-time backups to S3.

Volume types:

- **gp3** (general purpose SSD): default choice. Cheap, fast enough for most workloads.
- **io2** (provisioned IOPS SSD): for I/O-heavy databases.
- **st1** (throughput-optimized HDD): for large sequential reads (data warehouses).
- **sc1** (cold HDD): cheap, infrequent access.

Right-size volumes. A 100 GB gp3 with only 10 GB used wastes 90 GB of paid-for storage.

### Instance store (ephemeral)

Some instance types have local NVMe storage built in. Properties:

- **Very fast**: direct attached, no network.
- **Ephemeral**: lost when instance stops or fails.
- **Free**: included in instance cost.

Use for: scratch space, caches, distributed databases with their own replication (Cassandra, Aerospike).

Don't use for: anything that can't be lost when the instance dies.

### Security groups

EC2's firewall. A security group is a set of inbound and outbound rules. Properties:

- **Stateful**: response traffic is automatically allowed.
- **Default deny**: only explicit allow rules permit traffic.
- **Reference other security groups**: "allow traffic from web-tier-sg" instead of IP ranges.
- **Multiple SGs per instance**: rules are union'd.

Best practice: tight ingress rules, broad egress. Allow specific ports from specific sources, not "0.0.0.0/0 all ports" (a classic mistake).

### IAM roles for EC2

Instead of putting AWS credentials on the instance, attach an IAM role. The instance gets temporary credentials via the metadata service:

```
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/<role-name>
```

AWS SDKs automatically use these. Your code calls AWS APIs without ever seeing keys.

Always use roles for EC2. Never put long-term access keys on instances.

### User data and bootstrapping

When an instance launches, you can pass "user data" — a script that runs once on first boot:

```bash
#!/bin/bash
yum update -y
yum install -y nginx
systemctl start nginx
```

For more complex bootstrapping: configuration management (Ansible, Chef, Puppet), container orchestration (ECS, EKS), or just bake everything into the AMI.

### Auto Scaling Groups

Don't run individual EC2 instances for production workloads. Use an Auto Scaling Group (ASG):

- Launches instances from a launch template.
- Maintains a desired count across AZs.
- Replaces failed instances automatically.
- Scales based on metrics (CPU utilization, request count, etc.).
- Integrates with load balancers.

This is what makes EC2 "elastic" — you specify "I want 4-10 instances, scale on CPU > 70%" and AWS handles the rest.

### Launch Templates vs Launch Configurations

Launch Templates (newer, preferred) define how instances are launched: AMI, instance type, security groups, IAM role, user data. ASGs use them to launch instances.

Launch Configurations are the older equivalent. New ASGs should use Launch Templates.

### Pricing nuances

- **On-demand**: pay-as-you-go, ~$0.04-1+/hour depending on size.
- **Reserved Instances**: commit 1 or 3 years, save up to 72%.
- **Savings Plans**: commit to spend, flexible across instance types/families.
- **Spot Instances**: spare capacity at up to 90% discount, can be reclaimed with 2 min notice.
- **Dedicated Hosts / Instances**: isolated physical hardware, more expensive.

For most steady workloads, Savings Plans. For batch/stateless, mix on-demand with spot. For dev/test, on-demand with off-hours shutdown.

### EC2 lifecycle states

Instances move through states:

- **Pending**: launching.
- **Running**: active and billed.
- **Stopping** / **Stopped**: shut down, not billed for compute but EBS still costs.
- **Terminated**: deleted, gone.

Stop vs terminate: stop preserves the instance + EBS for restart; terminate deletes it (and detached EBS volumes per setting).

For ASGs, instances are terminated and replaced. For long-lived workloads, stop/start may be appropriate.

### When NOT to use EC2

Many workloads should use higher-level services instead:

- **Stateless web app**: ECS Fargate, App Runner, or Lambda.
- **Database**: RDS, Aurora, DynamoDB.
- **Static assets**: S3 + CloudFront.
- **Scheduled tasks**: EventBridge + Lambda.
- **Batch processing**: AWS Batch.
- **CI/CD**: CodeBuild or GitHub Actions.

EC2 is the most flexible service but also the one with the most operational burden (OS patching, scaling, monitoring). Use a managed service when one fits.

### When EC2 is right

EC2 is the right choice when:

- You need a specific OS or configuration not available in managed services.
- Legacy software requires a VM.
- You need maximum control over the runtime.
- You're running custom databases or distributed systems.
- Network-intensive workloads requiring specific instance types.
- GPU workloads (though SageMaker may be better for ML).

### Common EC2 mistakes

A few to avoid:

- **Running instances 24/7 for sporadic workloads** — use Lambda or schedules.
- **Over-provisioning** — start small, scale up if metrics demand.
- **Public IP for everything** — most instances should be in private subnets.
- **SSH key reuse across environments** — different keys per env.
- **No tagging** — billing becomes opaque.
- **Single AZ** — no resilience to AZ failure.

### Bootstrapping patterns

For production, three common patterns:

1. **Golden AMI**: bake everything into the AMI at build time. Launch is fast, deterministic. Updates require new AMI.

2. **AMI + user data**: minimal AMI, user data installs and configures. Slower launch, more flexible.

3. **AMI + config management**: minimal AMI, Ansible/Chef/Puppet pulls config and software. Slowest, most flexible.

Pattern 1 is most common for modern AWS workloads. Combined with ASGs and immutable infrastructure, you get predictable, reliable scaling.

## Three real-world scenarios

**Scenario 1: A startup runs everything on one EC2 instance.**
WordPress on a t3.medium, MySQL on the same instance, files on EBS. Works at small scale. When traffic doubles, instance struggles. Migration path: move database to RDS, files to S3, replicate web tier in ASG. Each piece becomes managed and scalable.

**Scenario 2: An over-provisioned production fleet.**
ASG of 10 c5.4xlarge instances at 15% CPU. Cost: ~$3K/month. After right-sizing to 6 c5.large + better caching, costs drop to ~$300/month with no performance impact. Just measured what was actually needed.

**Scenario 3: A spot fleet for batch processing.**
Nightly data processing job. Used to run on 4 m5.2xlarge on-demand, ~$300/run. Switched to spot fleet with same total capacity: ~$30/run. The job tolerates interruptions (chunks are restartable). 10x cost reduction with one architecture change.

## Common mistakes to avoid

- **EC2 for everything** when managed services would fit.
- **Long-term access keys** on instances instead of IAM roles.
- **No Auto Scaling Group** for production workloads.
- **Single AZ** deployments.
- **Over-provisioned instances** that nobody right-sized.
- **Open security groups** (0.0.0.0/0 for everything).
- **No automated patching**.

## Read more

- AWS EC2 User Guide.
- AWS Whitepaper: "Migrating Applications to AWS."
- AWS Whitepaper: "EC2 Reserved Instances and Savings Plans."

## Summary

- **EC2** = virtual machines as a service.
- **Instance types** vary by CPU/memory/GPU/network profile.
- **AMIs** are OS+software templates.
- **EBS** for persistent block storage; instance store for ephemeral.
- **Security groups** are stateful firewalls; default deny.
- **IAM roles** instead of long-term keys.
- **Auto Scaling Groups** for production workloads.
- **Savings Plans / Spot** for cost optimization.
- **Use managed services first**; EC2 when nothing else fits.

Next: S3 and object storage.
