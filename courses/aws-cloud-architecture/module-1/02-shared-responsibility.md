---
module: 1
position: 2
title: "The shared-responsibility model"
objective: "Know what AWS handles vs what you handle."
estimated_minutes: 7
---

# The shared-responsibility model

## The puzzle

A common misconception: "We're on AWS, so AWS handles security." A complementary misconception: "AWS doesn't do anything except sell us VMs; we handle everything." Both are wrong. AWS handles specific things; you handle specific things; the line between them shifts depending on the service.

Getting the line right is the difference between secure architectures and breached ones.

## The simple version

AWS calls this the "shared-responsibility model":

- **AWS is responsible for security OF the cloud** — the physical data centers, the hypervisor, the network fabric, the storage hardware. The stuff you can't touch.
- **You are responsible for security IN the cloud** — your data, your access controls, your operating system patches (for EC2), your application code, your network rules.

The line moves with each service. For raw EC2, you handle a lot. For Lambda, AWS handles more. Knowing which side of the line you're on for each service is the start of every secure design.

## The technical version

### The line for each service

A useful frame: services exist on a spectrum from "you do everything" to "AWS does everything."

- **EC2 (most "you"):** AWS handles physical hardware, hypervisor, network. You handle OS patches, runtime, application code, data, network rules, IAM, encryption at rest and in transit, OS firewall.
- **RDS (managed database):** AWS handles physical hardware, hypervisor, OS patches, database engine patches, backups (if enabled), replication. You handle schema, data, user/role management, IAM access, encryption configuration, parameter group tuning.
- **Lambda (highly managed):** AWS handles physical hardware, hypervisor, OS, runtime, scaling. You handle function code, IAM permissions, environment variables, data, dependencies.
- **S3 (managed storage):** AWS handles physical durability, redundancy, hardware. You handle bucket policies, object ACLs, encryption choice, IAM, data classification, lifecycle policies.

The pattern: the more "managed" a service, the more AWS handles operationally — but data, access control, and configuration are always yours.

### Where the line gets fuzzy

Things that look like AWS's job but are actually yours:

- **EC2 OS patching:** AWS gives you an AMI; the running OS is yours to patch.
- **RDS major version upgrades:** AWS won't do these automatically.
- **Open S3 buckets:** AWS gave you sane defaults, but you can override them, and the consequences are yours.
- **IAM policy correctness:** AWS provides the system; your policies are yours.
- **Application vulnerabilities:** code you deploy is always yours.

Things that look like your job but are actually AWS's:

- **Hypervisor isolation:** between your VMs and another customer's, AWS guarantees the boundary.
- **Physical access to data centers:** AWS controls this completely.
- **Disk wiping when an EBS volume is released:** AWS handles secure deprovisioning.
- **DDoS protection at the edge:** AWS Shield Standard is automatic.

### Why this matters for breaches

Almost every major AWS-related breach involves a customer-side misconfiguration, not an AWS-side failure:

- Open S3 buckets exposing customer data.
- IAM credentials leaked in GitHub repositories.
- Security groups left wide open to the internet.
- Outdated EC2 OS with known vulnerabilities.
- Lambda functions with excessive IAM permissions.

None of these are AWS's fault. They're all customer-side. AWS provides safe defaults and clear tools; the customer makes the choices.

The flip side: when an actual AWS infrastructure issue causes a problem (rare), AWS handles remediation, restoration, and communication.

### Compliance and the model

Compliance frameworks (SOC 2, HIPAA, PCI-DSS, ISO 27001) all interact with shared responsibility:

- **AWS is compliant for its parts:** data center physical security, infrastructure controls.
- **You are responsible for your parts:** how you handle data, access, encryption, logging.

A "HIPAA-compliant AWS service" doesn't mean using that service makes your application HIPAA-compliant. You still need to configure it correctly, sign a BAA with AWS, encrypt PHI, control access, and audit.

AWS publishes which services support which compliance frameworks and what they do for you. Reading these is part of compliance work.

### Customer-managed encryption

Encryption is a great example of the line shifting:

- **AWS-managed encryption** (S3 SSE-S3, RDS storage encryption with AWS keys): AWS handles keys and rotation.
- **Customer-managed CMK in KMS**: AWS holds the keys but you control policy, rotation, access.
- **Customer-provided keys**: you give AWS the key per request; AWS doesn't store it.
- **Client-side encryption**: you encrypt before sending to AWS; AWS never sees plaintext.

Each level shifts responsibility (and operational burden) toward you. Most workloads use AWS-managed encryption — simple, secure enough, the right tradeoff.

### Operational vs security responsibility

Shared responsibility covers both:

- **Security:** who keeps things safe.
- **Operations:** who keeps things running.

For Lambda, AWS handles uptime of the Lambda service; you handle correctness of your function code. For EC2, AWS handles the underlying host; you handle the running instance (restarts, scaling, monitoring).

Misalignment between expectation and reality is a common source of incidents. "Why didn't AWS tell us about this issue?" — often because the issue was on the customer's side of the line.

### The "tenancy" axis

A related concept: shared tenancy means multiple customers share the same physical hardware (with hypervisor isolation). Dedicated tenancy means your VMs are alone on physical hosts.

- **Default (shared):** cheaper, sufficient for almost all workloads.
- **Dedicated instances:** isolated at hardware level, more expensive.
- **Dedicated hosts:** entire physical server reserved for you.
- **Outposts:** AWS hardware in your data center.

For sensitive workloads with strict isolation requirements (some financial, defense, healthcare), dedicated tenancy may be required. Most workloads stick with default shared tenancy because AWS's isolation is strong.

### Practical implications

When you adopt AWS, you take on:

- **OS-level operations** for EC2 (or use managed services to avoid this).
- **IAM design and review** — never optional.
- **Data classification and handling** — your data, your call.
- **Application security** — your code, your bugs.
- **Network design** — VPCs, security groups, NACLs are yours.
- **Logging and monitoring** — AWS provides tools; you configure what to capture.
- **Incident response** — AWS supports but you lead.

You give up:

- **Physical data center concerns.**
- **Hardware procurement and replacement.**
- **Hypervisor and base infrastructure security.**
- **Network fabric maintenance.**

The trade is generally worth it — you get to focus on your application instead of infrastructure plumbing.

## Three real-world scenarios

**Scenario 1: An S3 bucket with customer data is open to the public.**
Investigation: bucket was created with default settings (which include some safeguards) but a developer added a public-read policy intentionally for a one-off task and never reverted it. AWS provided the safe defaults; the customer overrode them. Customer's fault. Mitigation: AWS Config rules, S3 Block Public Access at account level, automated audits.

**Scenario 2: EC2 instance compromised via unpatched OS vulnerability.**
Investigation: instance was running Ubuntu without automated patching for 6 months. AWS launched the instance with patched AMI initially; ongoing patches are customer responsibility. Customer's fault. Mitigation: AWS Systems Manager Patch Manager, scheduled maintenance windows, or use a managed service that doesn't expose OS (Lambda, Fargate).

**Scenario 3: A multi-day AWS service outage affects production.**
Investigation: AWS infrastructure issue. AWS's fault. Customer's job: have multi-AZ deployment, ideally multi-region for the most critical pieces, an incident response plan, and communication to affected users. Trade-off: full multi-region is expensive; pure multi-AZ is the right baseline for most.

## Common mistakes to avoid

- **Assuming AWS handles all security** — they handle the data center, not your app.
- **Assuming AWS handles all operations** — your code, your patches, your bugs.
- **Underestimating IAM complexity** — bad policies are the source of many incidents.
- **Trusting safe defaults forever** — defaults change, your overrides persist.
- **Confusing "compliant service" with "compliant deployment"** — using the right service isn't enough.

## Read more

- AWS Shared Responsibility Model overview page.
- AWS Whitepaper: "AWS Security Best Practices."
- AWS Well-Architected Framework — Security Pillar.

## Summary

- **AWS handles security of the cloud** (data centers, hypervisor, network).
- **You handle security in the cloud** (data, IAM, code, configuration).
- **The line moves per service** — more managed = more AWS, less you.
- **Most breaches are customer-side** misconfigurations.
- **Compliance is shared** — compliant service ≠ compliant deployment.
- **Encryption options** trade convenience for control.
- **You trade infrastructure work for application focus** — usually a good trade.

Next: accounts, IAM, and organizations.
