---
module: 5
position: 4
title: "The AWS mistakes that bite you"
objective: "Avoid the failure modes everyone hits once."
estimated_minutes: 8
---

# The AWS mistakes that bite you

## The puzzle

Every team running on AWS at scale has war stories: the surprise bill, the open S3 bucket, the missing backup, the runaway recursion. Most of these aren't unique — they're the same handful of mistakes hit by team after team. Knowing them in advance lets you avoid the painful learning experience.

## The simple version

Top AWS production mistakes (roughly in order of frequency and pain):

1. **Open S3 bucket** exposes data.
2. **Leaked access keys** in code → bot mining instances.
3. **No multi-AZ** → outage from one AZ failure.
4. **No backups (or untested backups)** → data loss.
5. **Surprise bill** from runaway resource or transfer.
6. **Production in default VPC** with weak security.
7. **Hardcoded credentials** anywhere.
8. **No monitoring** until users complain.
9. **One huge IAM policy** with `*:*` that someone "needs temporarily."
10. **Recursive Lambda** triggering itself.
11. **Forgotten dev resources** running 24/7.
12. **Untagged everything** → cost mystery.

Most of these are preventable with defaults that AWS has progressively improved (S3 Block Public Access, default encryption) plus team discipline (code review for IAM, automated audits, tagged resources).

## The technical version

### The open S3 bucket

The canonical AWS mistake. A bucket made public for one task, forgotten about, indexed by bots, customer data leaked.

Prevention:

- **S3 Block Public Access at account level** (SCP-enforced).
- **AWS Config rule** detecting public buckets, auto-remediating.
- **No public buckets** for customer data — use CloudFront with signed URLs instead.
- **Two-person review** for any change that exposes data publicly.

Even with safeguards, do periodic audits. AWS publishes scan tools and third parties (e.g., trufflehog) check for exposed data.

### Leaked access keys

Pattern: developer commits AWS access keys to a public repo. Bots find within hours. Mining instances spin up. Bill grows.

Prevention:

- **Use IAM roles** wherever possible (no long-term keys).
- **Identity Center** for human access (no IAM users).
- **git-secrets pre-commit hook** to catch keys before push.
- **GitHub secret scanning** (automatic).
- **CI/CD with assumed roles** via OpenID Connect (no long-term keys needed in pipelines).
- **Budget alerts** to catch runaway spending fast.

If keys leak: deactivate immediately, rotate, investigate access patterns, audit account for unauthorized changes. AWS often credits fraud charges as a courtesy.

### Single-AZ production

Production workload runs in one AZ. That AZ has issues (power, network). App goes down. Customers angry. Engineers learn about multi-AZ.

Prevention:

- **Multi-AZ from day one** for production.
- **Auto Scaling Groups across AZs**.
- **RDS Multi-AZ** or Aurora (which is automatically multi-AZ).
- **Load balancers spanning AZs**.
- **No "we'll add HA later"** — production single-AZ is just betting against statistics.

Cost difference is small (cross-AZ data transfer is cheap, RDS Multi-AZ doubles DB cost). Worth it.

### No backups, or untested backups

"We have backups." But have they been tested? Many teams don't know if backups are restorable until they try to restore — usually mid-incident.

Prevention:

- **AWS Backup** centralizes backup management with automated schedules.
- **Test restoration** quarterly. If you can't restore, you don't have backups.
- **Cross-region backups** for true DR.
- **Point-in-time recovery** for databases (RDS, Aurora, DynamoDB support this).
- **S3 versioning** for accidental deletion.

Treat backup testing as a regular operational activity, not a hopeful assumption.

### Surprise bill

Already covered in the cost lesson. Top sources:

- Data transfer out.
- NAT Gateway charges.
- Forgotten dev resources.
- Unattached EBS volumes.
- Verbose logs without retention.
- Cross-region replication misconfigured.
- Recursive triggers.

Prevention: Cost Anomaly Detection, budget alerts, regular cost reviews, tagging.

### Production in default VPC

Default VPC has permissive defaults. Production should use a purpose-built VPC with controlled CIDRs and explicit subnet design.

Prevention:

- **Create new VPCs** for production.
- **Delete default VPCs** in regions you don't use.
- **SCPs** preventing resource creation in default VPC.

The default VPC is a learning convenience; production needs intentional networking.

### Hardcoded credentials

Credentials anywhere they shouldn't be:

- In code repositories.
- In container images.
- In configuration files committed to source control.
- In CloudFormation/CDK/Terraform code.
- In CloudWatch Logs (printed by mistake).
- In environment variables in build artifacts.

Prevention:

- **Secrets Manager** for application secrets.
- **Pre-commit hooks** (git-secrets) catching common patterns.
- **GitHub secret scanning** (automatic).
- **No environment-variable secrets** in production deployments.
- **Sanitize logs** of any potential secret values.
- **IAM roles** instead of credentials where possible.

### Inadequate monitoring

No alarms, no dashboards. Issues are discovered when users complain — often hours into an incident.

Prevention:

- **CloudWatch alarms** on key metrics from day one.
- **Dashboard for each production workload**.
- **Synthetic monitoring** for critical user paths.
- **PagerDuty / OpsGenie** integration for after-hours.
- **Runbooks** for common incidents.

You're not done shipping until you can detect issues quickly.

### The "temporary" wildcard IAM policy

Pattern: "I'll add `*:*` to debug this, then tighten later." Later never comes.

Prevention:

- **No wildcard policies** in production.
- **IAM Access Analyzer** identifies unused permissions.
- **Quarterly policy reviews**.
- **Permission boundaries** to cap what can be granted.
- **Code review** for all IAM changes.

If wildcards are required temporarily, ticket them with a deadline. Auto-revert via Lambda if the deadline passes.

### Recursive triggers

A Lambda writes to S3. S3 triggers the same Lambda (because the trigger is on the prefix the Lambda writes to). Infinite loop. Infinite bill.

Prevention:

- **Different prefixes** for input and output.
- **Different buckets** for input and output.
- **Concurrency limits** on Lambda functions.
- **Budget alerts** catching the bill spike fast.

Common pattern; easy to miss in design review. Once you've been bitten, the prevention discipline sticks.

### Forgotten dev resources

Dev / experimental resources running 24/7 long after they're needed:

- A GPU instance someone spun up for testing.
- An RDS cluster for a project that died.
- A bunch of test buckets nobody owns.
- ECS clusters from POCs.

Prevention:

- **Tags identifying owner and purpose**.
- **Auto-shutdown** for dev environments via Lambda + EventBridge schedule.
- **Quarterly cleanup** of resources older than X days without recent activity.
- **Auto-expiry** for sandbox accounts (e.g., resources auto-deleted after 30 days).

### Untagged everything

Without tags, cost breakdowns are useless and ownership is unclear.

Prevention:

- **Tag policies in Organizations** enforcing required tags.
- **AWS Config rule** detecting untagged resources.
- **IaC enforcing tags** on all resources created.
- **Cost allocation tags activated** in Billing.

Tag at creation; retroactive tagging is much harder. Make it part of your IaC standards.

### Other mistakes worth knowing

**No retention policies on logs**: covered in cost lesson, but separately devastating because logs without retention also slow down queries.

**Disabled CloudTrail**: no audit trail of API activity. If something happened, you can't tell what.

**No GuardDuty**: AWS's threat detection service. Cheap; catches common attack patterns.

**Region restrictions not enforced**: someone deploys in eu-west-1 by accident when you're a US-only company. SCPs prevent this.

**Stuck deletion**: deleting an IAM role that something depends on; or deleting a VPC with resources still in it. Order of operations matters.

**Cross-account "trust everyone" policies**: roles trusted by `arn:aws:iam::*:root` (any account) — a security hole.

**No MFA on root account**: root has god mode. MFA mandatory.

**KMS key without proper policy**: encrypt data, lose key access via bad policy, data is unrecoverable. Test key policies before deploying.

**Production behind a single API key with no rotation**: one leak, total compromise.

**Aurora cluster minimum charges**: idle Aurora can still cost; if not used, stop or delete.

**No DR plan**: untested = nonexistent.

### Defensive patterns

Composite defenses that catch many issues:

- **Account-level safe defaults**: encryption on, public access off, MFA required.
- **SCPs as guardrails**: region restrictions, service restrictions, compliance.
- **Continuous compliance**: AWS Config + Security Hub.
- **Centralized logging**: every account's CloudTrail to a central S3 bucket.
- **GuardDuty + Security Hub**: aggregated threat detection.
- **Regular reviews**: cost, security, IAM, backups.

The discipline: assume someone will make each of the above mistakes eventually. Build systems that detect and recover before the mistake becomes expensive.

### Incident response baseline

When something goes wrong:

1. **Page the on-call**.
2. **Triage**: severity, scope, impact.
3. **Contain**: stop the bleeding (revoke keys, isolate compromised resources).
4. **Investigate**: what happened, when, how.
5. **Recover**: restore service, restore data.
6. **Post-mortem**: blameless, document, action items.
7. **Implement actions**: prevent recurrence.

Without this discipline, incidents recur. With it, each incident genuinely improves the system.

### Defaults that prevent mistakes

AWS has progressively shipped safer defaults:

- **S3 Block Public Access**: default for new buckets in many cases.
- **EBS encryption by default**: opt-in but easy to enable account-wide.
- **EC2 IMDSv2**: more secure metadata service, defaulting in newer AMIs.
- **CloudTrail enabled by default** at account creation.
- **Multi-Region Trail** option.

Use these defaults. Don't disable safety features without explicit reason.

### Account-bootstrap checklist

For every new AWS account:

- [ ] Root MFA enabled.
- [ ] Root has no access keys.
- [ ] IAM Identity Center configured.
- [ ] EBS encryption default-on.
- [ ] CloudTrail enabled, multi-region, centralized.
- [ ] GuardDuty enabled.
- [ ] AWS Config enabled with baseline rules.
- [ ] Budgets configured with alerts.
- [ ] Cost Anomaly Detection enabled.
- [ ] SCPs from Organization parent.
- [ ] Tag policy in place.
- [ ] Default VPC deleted in unused regions.
- [ ] Block Public Access enabled at S3 account level.

Most of this is one-time setup with permanent benefit. Use Control Tower or Landing Zone patterns to automate.

## Three real-world scenarios

**Scenario 1: The bot-mining incident.**
Developer commits AWS access keys to a public GitHub repo. Within 2 hours, bot scanners find them. Within 3 hours, EC2 instances launching in multiple regions, mining crypto. By morning, $8000 charged. AWS auto-detected and partially mitigated, but cost was real. Mitigation: AWS credit (sometimes given as courtesy), key rotation, repo cleanup, secret scanning installation, IAM-roles-everywhere migration. Lesson: long-term access keys belong in 2015; modern stack uses roles + SSO.

**Scenario 2: The recurring data exposure.**
A company has S3 buckets exposed to the public three times in 18 months. Each time, a developer overrides the default Block Public Access for a "temporary" task and forgets. Fix: account-level SCP preventing the override without a CAB-approved ticket. Plus AWS Config rule automatically remediating any public bucket. Hasn't happened since.

**Scenario 3: The untested backup.**
RDS database had backups enabled but no one had tested restoration. During an incident, attempt to restore reveals a misconfigured retention setting — backups were 7 days old when needed, but they were retaining only 1 day. Data lost. Fix: backup configuration audit, restoration drills quarterly, longer retention.

## Common mistakes to avoid

- **Public S3 buckets** for customer data.
- **Long-term IAM user access keys** when roles would work.
- **Single-AZ production**.
- **Untested backups**.
- **Hardcoded secrets anywhere**.
- **No monitoring** until users complain.
- **Wildcard IAM policies** as "temporary" fixes.
- **Untagged resources** making cost mysterious.
- **Production in default VPC**.
- **No incident-response runbook**.

## Read more

- AWS Whitepaper: "AWS Security Best Practices."
- AWS Well-Architected Framework.
- AWS Trusted Advisor recommendations.
- AWS Security Hub controls.

## Summary

- **Most AWS incidents are the same handful of mistakes** repeated across teams.
- **S3 buckets, leaked keys, single-AZ, missing backups** are the top categories.
- **Safe defaults** (Block Public Access, encryption, MFA) prevent most.
- **Automated detection** (Config, GuardDuty, Security Hub) catches what defaults miss.
- **Disciplined incident response** turns each incident into prevention.
- **Account bootstrap checklist** captures the one-time setup.
- **The mistakes are well-documented** — avoid them upfront, don't relearn them.

That wraps Module 5 and the course. AWS is the most-used cloud platform; the patterns and pitfalls in this course will keep working as the services evolve.
