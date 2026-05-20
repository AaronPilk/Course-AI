---
module: 1
position: 3
title: "Accounts, IAM, and organizations"
objective: "Map how access and isolation work."
estimated_minutes: 8
---

# Accounts, IAM, and organizations

## The puzzle

An AWS "account" sounds like a user account. It isn't — it's a unit of billing and isolation that can contain dozens of users, hundreds of services, and millions of resources. Bigger companies have dozens of AWS accounts. Why? And how do they manage who can do what across all of them?

## The simple version

Three layers:

1. **AWS account**: a billing and isolation boundary. Each account has its own root credentials, its own billing, its own resource limits. Resources in one account are isolated from resources in another by default.

2. **IAM users, roles, and policies**: within an account, IAM controls who (or what service) can do what. Users for humans, roles for services and cross-account access, policies that define allowed actions.

3. **AWS Organizations**: a way to manage many accounts as one group, with consolidated billing, organization-wide policies, and account-creation automation.

Best practice: many accounts (one per environment or team), tightly managed by Organizations, with humans accessing via SSO/Identity Center rather than per-account IAM users.

## The technical version

### Why multiple accounts

A common pattern for any non-trivial AWS deployment: separate accounts for separate things. Common splits:

- **By environment**: dev, staging, prod in separate accounts.
- **By team or product**: each team gets its own account or set of accounts.
- **By workload**: production app in one account, data warehouse in another, security/audit in another.

Reasons:

- **Blast radius**: an IAM mistake in dev doesn't touch prod.
- **Billing clarity**: per-account cost breakdown.
- **Service limits**: AWS has account-level limits; multiple accounts give more headroom.
- **Compliance**: certain workloads need isolation (PCI scope reduction).
- **Permissions simplicity**: easier to grant broad access in one account than fine-grained access in a shared one.

For a small startup, one or two accounts is fine. For a serious company, dozens or hundreds.

### IAM users, roles, and policies

**Users**: identities for humans or for legacy applications. Each has long-term credentials (passwords, access keys). Modern practice: avoid IAM users for humans entirely; use SSO/Identity Center instead. IAM users are still common for CI/CD systems or third-party integrations.

**Roles**: identities that can be assumed. No long-term credentials — instead, an entity (user, service, EC2 instance, Lambda function) assumes the role and gets temporary credentials. Roles are how most service-to-service authorization works on AWS.

**Policies**: JSON documents that define what actions are allowed on what resources under what conditions. Attached to users, groups, or roles.

A simple policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::my-bucket/*"
  }]
}
```

This allows reading and writing objects in `my-bucket`. Real-world policies get more complex with conditions, deny statements, and resource-level granularity.

### Identity-based vs resource-based policies

Two kinds of policies:

- **Identity-based**: attached to a user/role. "This user can do X to resource Y."
- **Resource-based**: attached to a resource (S3 bucket, SQS queue, KMS key). "This resource can be acted on by user/role Z."

Common case: an EC2 instance has an IAM role with identity-based policy allowing it to read an S3 bucket. The bucket has a resource-based policy that also allows that role. Both must permit the action for it to succeed.

When troubleshooting access issues, check both policy types.

### The principle of least privilege

Grant only the permissions actually needed. In practice:

- Avoid `*` in actions (`s3:*`) — use specific actions (`s3:GetObject`).
- Scope resources tightly — specific bucket, not all buckets.
- Use conditions — only from specific IPs, only with MFA, etc.
- Use roles instead of users where possible — temporary credentials reduce exposure.
- Review and reduce permissions regularly — initial grants often broader than needed.

This is hard. Initial grants tend to be too broad because nobody wants to debug permission errors. The discipline of tightening over time is what separates secure accounts from sprawling permission disasters.

### IAM roles for services

When EC2, Lambda, ECS, or other services need to call AWS APIs, they assume an IAM role rather than using stored credentials:

```
EC2 instance ── instance profile ──> IAM role ── temporary credentials ──> AWS APIs
```

The role has a "trust policy" specifying who can assume it (e.g., the EC2 service) and "permission policies" specifying what it can do.

This is much better than embedding access keys in code or config — credentials are temporary, rotated, and scoped.

### Cross-account access

When code in account A needs to access resources in account B:

1. Account B creates a role with a trust policy allowing account A's role to assume it.
2. Account A's role assumes that role via STS.
3. Account A's code gets temporary credentials valid in account B's context.

This is how many enterprise architectures work — central security accounts, shared services accounts, and workload accounts trust each other carefully through assumed roles.

### AWS Organizations

For managing multiple accounts:

- **Organization root**: the central management account.
- **Organizational Units (OUs)**: groupings of accounts (e.g., "Production", "Non-Production", "Sandbox").
- **Service Control Policies (SCPs)**: organization-wide guardrails that restrict what accounts can do, regardless of IAM policies in those accounts.
- **Consolidated billing**: all accounts' bills roll up to the management account.

SCPs are powerful. An SCP that says "deny creating EC2 instances in regions other than us-east-1 and us-east-2" is enforced no matter what IAM policies say in member accounts. Used for compliance, cost control, and broad guardrails.

### AWS Control Tower and Landing Zones

Pre-built patterns for setting up Organizations correctly:

- **Control Tower**: AWS's managed service for setting up multi-account environments with sensible defaults — OU structure, baseline SCPs, logging consolidation, identity setup.
- **Landing Zone** (the concept): a multi-account AWS deployment with security, billing, and operations set up correctly.

For new AWS deployments at any scale beyond "one account," using Control Tower or a Landing Zone pattern saves enormous time and avoids mistakes.

### IAM Identity Center (formerly AWS SSO)

The modern way to give humans access to AWS:

- Connect to your identity provider (Okta, Azure AD, Google Workspace).
- Define permission sets centrally.
- Users access AWS console and CLI via single sign-on.
- Permissions managed in one place across all accounts.

Don't create IAM users for humans in 2026. Use Identity Center. The few exceptions (root account credentials, break-glass scenarios) are rare and shouldn't be the default.

### Root account

Every AWS account has a root account — the original credentials that created the account. The root account can do anything.

Best practices:

- **Never use the root account for daily work.**
- **Enable MFA on root** (hardware key ideally).
- **Don't create access keys for root** (or delete them if they exist).
- **Use root only for specific tasks** that require it (changing account settings, closing the account).

A compromised root account is catastrophic. Treat it like nuclear codes.

### Access keys and secrets

Long-term credentials (IAM user access keys, root account keys) are dangerous:

- They don't expire automatically.
- They can be leaked in code, logs, CI configurations.
- They have whatever permissions are attached.

Many AWS-related breaches involve leaked access keys (often found in GitHub repos). Modern practice:

- Use IAM roles instead of users for services.
- Use Identity Center for humans.
- For systems that need long-term creds (some CI), scope tightly and rotate frequently.
- Scan code for leaked credentials (GitHub does this automatically; integrated tools like git-secrets help).

### Service Control Policies in practice

SCPs let you enforce constraints at the organization level. Common ones:

- **Region restriction**: only deploy in approved regions.
- **Service restriction**: prevent use of expensive or unapproved services (no EC2 X-series, no certain regions for data residency).
- **Encryption enforcement**: deny unencrypted S3 puts.
- **Tag enforcement**: require certain tags on resources.

SCPs are "deny lists" — they restrict what IAM can grant. They don't grant anything; they only constrain.

### How this looks in practice

A mid-size company might have:

- **Management account**: Organizations root, billing.
- **Security account**: centralized logging, AWS Security Hub, audit trails.
- **Shared services account**: networking (transit gateway), DNS, common tools.
- **Production accounts**: one per critical workload (app1-prod, app2-prod, etc.).
- **Non-production accounts**: dev, staging.
- **Sandbox accounts**: per-developer experimentation.

Identity Center provides SSO across all. SCPs enforce baseline rules. Control Tower keeps things in shape.

### Common IAM patterns

A few patterns that show up everywhere:

- **Read-only auditor role** for security reviews.
- **Developer role** with broad dev-environment access, scoped prod read access.
- **CI/CD role** for deployment pipelines, scoped to specific resources.
- **Service-linked roles** that AWS creates for managed services (don't modify these).
- **Emergency / break-glass role** with elevated permissions, audited heavily.

Each role should have one clear purpose and minimum needed permissions.

## Three real-world scenarios

**Scenario 1: An AWS access key found in a public GitHub repo.**
A developer committed access keys to a public repo. Within hours, bot scanners found them and used them to spin up EC2 instances for cryptocurrency mining, generating thousands of dollars in unexpected charges. Mitigation: GitHub now scans automatically and notifies AWS to disable; AWS often credits the fraud charges. Prevention: don't use long-term keys; use roles + Identity Center; scan commits with git-secrets or similar.

**Scenario 2: A misconfigured S3 bucket exposes customer data.**
A developer made the bucket public for a one-off task and forgot to revert. Data was indexed by search engines before discovery. Mitigation: incident response, data exposure disclosure, customer notifications. Prevention: S3 Block Public Access at account level via SCP; AWS Config rules detecting public buckets; mandatory two-person review for changes that expose data.

**Scenario 3: A startup outgrows its single-account setup.**
Initially: everything in one AWS account. Now: dev/staging/prod all mixed, IAM policies are a tangle, blast radius of any mistake is huge. The migration: spin up Organizations, create dev/staging/prod accounts, migrate workloads progressively, set up Identity Center for human access. Six months of work. Should have started multi-account earlier.

## Common mistakes to avoid

- **One account for everything** as the company grows.
- **IAM users for humans** instead of SSO/Identity Center.
- **Long-term access keys** in code or CI.
- **Overly broad IAM policies** that grow without review.
- **Using the root account** for routine work.
- **No SCPs** to enforce organizational baselines.
- **Manual account creation** instead of automation (Control Tower).

## Read more

- AWS IAM User Guide.
- AWS Organizations User Guide.
- AWS Whitepaper: "AWS Multiple Account Security Strategy."
- AWS Identity Center documentation.

## Summary

- **AWS accounts** are isolation and billing boundaries.
- **IAM** controls access within an account.
- **Users, roles, and policies** are the primitives.
- **Roles + temporary credentials** beat long-term access keys.
- **Identity Center** is the modern way to give humans access.
- **Organizations** manages multiple accounts together.
- **SCPs** enforce organization-wide guardrails.
- **Multiple accounts** is the right pattern beyond trivial scale.
- **Root account** is for emergencies only.

Next: how you actually pay for AWS.
