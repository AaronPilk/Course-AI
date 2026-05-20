---
module: 3
position: 3
title: "IAM in depth"
objective: "Write good policies and avoid bad ones."
estimated_minutes: 8
---

# IAM in depth

## The puzzle

Most AWS-related security incidents are IAM-related. Either too-broad permissions let someone do more than they should, or leaked credentials get used by an attacker, or a policy was misunderstood and the real effect didn't match the intent. IAM is the single most important AWS security topic. The mechanics are simple in principle; the practice is harder than it looks.

## The simple version

IAM has four primitives:

1. **Users**: identities for humans or legacy apps. Long-term credentials. Increasingly avoided in favor of SSO.
2. **Groups**: collections of users sharing policies. Manage many users at once.
3. **Roles**: identities that can be assumed temporarily. Used by services, cross-account access, federated users.
4. **Policies**: JSON documents granting or denying actions.

Policies are the work. They define what actions on what resources under what conditions are allowed. Writing good policies (least privilege, scoped resources, conditions) is the daily skill.

## The technical version

### Policy structure

An IAM policy is JSON with a fixed schema:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowReadObjects",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ],
      "Condition": {
        "IpAddress": { "aws:SourceIp": "203.0.113.0/24" }
      }
    }
  ]
}
```

Each statement has:

- **Effect**: Allow or Deny.
- **Action**: which API actions (s3:GetObject, ec2:RunInstances, etc.).
- **Resource**: which ARNs (specific buckets, all of them with `*`, etc.).
- **Condition**: optional restrictions (IP, time, MFA, tag values).
- **Principal**: who (in resource-based policies — for identity-based, this is implied).

### Evaluation logic

How IAM decides whether to allow a request:

1. Start with implicit deny.
2. Evaluate all applicable policies (identity-based + resource-based + permission boundaries + SCPs + session policies).
3. If ANY explicit Deny matches: deny.
4. Else if ANY Allow matches: allow.
5. Else (no match): implicit deny.

Implications:

- **Deny always wins**. A deny in any policy blocks the action.
- **Multiple sources combined**. Identity policy + resource policy + SCPs + permission boundaries all matter.
- **Default is no**. Without an explicit Allow, you can't do anything.

This makes IAM safer (default deny) but also harder to debug (why doesn't this work?).

### Least privilege

The principle: grant only the permissions actually needed. In practice:

- Use specific actions (`s3:GetObject`), not wildcards (`s3:*`).
- Scope resources tightly (specific bucket, not `*`).
- Use conditions (specific IPs, with MFA, specific time windows).
- Use temporary credentials (roles) rather than permanent (access keys).
- Review and tighten regularly — initial grants are usually too broad.

This is harder than it sounds. Developers want their code to "just work" and broad grants make that easier. The discipline of tightening over time is what separates secure accounts from sprawling permission disasters.

### IAM Access Analyzer

AWS tool that helps with least privilege:

- **Access Analyzer for unused permissions**: identifies actions granted but never used.
- **Policy validation**: catches errors and suggests improvements during policy creation.
- **Policy generation**: generates least-privilege policies from CloudTrail activity.
- **External access findings**: identifies resources shared with external accounts.

Run Access Analyzer regularly. Use it to tighten policies based on actual usage patterns.

### Identity vs resource policies

Two flavors:

**Identity-based policies** (attached to users/groups/roles): "this principal can do X on resource Y."

**Resource-based policies** (attached to S3 buckets, SQS queues, KMS keys, Lambda functions, etc.): "this resource can be acted on by principal Z."

Common case: an EC2 IAM role's identity policy allows it to read an S3 bucket. The bucket's resource policy ALSO allows that role. Both must permit for the action to succeed.

Resource policies enable cross-account access elegantly: the bucket in account A can grant a role in account B without account A's IAM doing anything.

### IAM roles in detail

A role has:

- **Trust policy**: who can assume the role.
- **Permissions policies**: what the role can do once assumed.

Trust policy example (this role can be assumed by EC2 instances):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ec2.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
```

Other trust scenarios:

- **Cross-account role**: trust another account's principals.
- **Federated role**: trust an external IdP (SAML, OIDC).
- **Service role**: trust an AWS service like Lambda or ECS Tasks.

The right pattern: roles for everything, IAM users only for legacy/special cases.

### Permission boundaries

Permission boundaries set a maximum for what permissions can apply to a user or role. Useful for delegated administration:

- "Allow this team's admin to create IAM users, but only within these permission boundaries."
- "These IAM principals can have at most these permissions, even if other policies grant more."

The user's effective permissions = (their policies) ∩ (their permission boundary). Both must allow for an action to succeed.

Used in: SaaS platforms granting customers limited AWS access, large orgs with delegated IAM admin.

### Service Control Policies (SCPs)

Organization-level constraints (covered in Module 1). SCPs are evaluated before all other policies — they're the outermost ring.

Effective permissions = (SCP allows) ∩ (Identity policy allows) ∩ (Resource policy allows) ∩ (Permission boundary allows) − (any explicit deny anywhere).

If an SCP denies an action, no IAM policy in the member account can allow it. SCPs are how organizations enforce baselines that account administrators can't bypass.

### Conditions

Conditions in IAM policies let you constrain when allows take effect:

- **`aws:SourceIp`**: only from specific IPs.
- **`aws:CurrentTime`**: time-based access.
- **`aws:MultiFactorAuthPresent`**: require MFA.
- **`aws:userid`**: specific user.
- **`s3:prefix`**: only objects with specific prefix.
- **Many resource-specific conditions**.

Example: require MFA for sensitive actions:

```json
{
  "Effect": "Deny",
  "Action": "iam:*",
  "Resource": "*",
  "Condition": {
    "BoolIfExists": { "aws:MultiFactorAuthPresent": "false" }
  }
}
```

This denies IAM actions unless the user authenticated with MFA. Layered with normal allow policies, MFA becomes mandatory for those operations.

### IAM Identity Center (formerly AWS SSO)

The modern way to give humans AWS access:

- Connect to your IdP (Okta, Azure AD, Google Workspace).
- Define permission sets (templates of policies).
- Users access AWS Console and CLI via SSO.
- Sessions are temporary (typically 1-12 hours).
- Permissions managed centrally across all accounts in your Organization.

Don't create IAM users for humans in 2026 unless there's no other choice. SSO + Identity Center is dramatically more manageable and secure.

### Common policy mistakes

A few patterns to avoid:

**`"Action": "*", "Resource": "*"`**: full admin. Only for emergencies; never as a default.

**Broad services**: `"s3:*"` when you only need read.

**Wildcards in resources**: `"Resource": "*"` when specific ARNs would work.

**Missing conditions**: no MFA requirement on dangerous actions, no IP restrictions on sensitive roles.

**Untested deny statements**: deny rules can block legitimate access in surprising ways.

**Inline policies**: harder to audit than managed policies; prefer managed.

**Permission accumulation**: roles that grow over time without anyone reviewing.

### IAM and credential rotation

For unavoidable IAM users with access keys:

- **Rotate regularly** (every 90 days or so).
- **Use Secrets Manager** to manage rotation.
- **Monitor unused keys** via Access Analyzer; delete what's not used.
- **Limit to specific use cases** that can't use roles.

For roles, AWS rotates credentials automatically (every hour or less). One reason roles are dramatically better.

### Common IAM patterns

A few that show up everywhere:

**Cross-account read access**: account A's role can list S3 buckets in account B.

**CI/CD pipeline role**: scoped permissions for deployments.

**Developer role**: broad dev-environment access, scoped prod read access.

**Service-linked roles**: AWS creates these for managed services. Don't modify.

**Read-only auditor role**: for security reviews.

**Emergency break-glass role**: heavily-monitored, used only for incidents.

### Policy size and complexity

IAM has limits:

- 6,144 characters per managed policy.
- 2,048 characters per inline policy.
- 10 managed policies per role.

For large permission sets, you have to break into multiple policies. Use logical grouping (one policy per service, or per function).

### Auditing IAM

Tools and practices:

- **CloudTrail**: logs every IAM API call.
- **Access Analyzer**: finds unused permissions, external access, validates policies.
- **AWS Config**: tracks IAM configuration changes over time.
- **AWS Security Hub**: aggregates security findings including IAM.
- **Third-party tools**: PrincipalMapper, Cloudsplaining, etc., for deeper analysis.

Regular IAM audits should be a scheduled activity. Permissions drift, principals proliferate, old credentials linger. Without explicit cleanup, accounts accumulate IAM debt.

### Testing IAM policies

Before deploying a policy, test it:

- **IAM Policy Simulator**: AWS tool that simulates requests against policies.
- **Access Analyzer policy validation**: catches errors and suggests improvements.
- **Dry-run flag** on some API calls.

For production policies, test with the actual workload (in a dev environment) before pushing to prod. Permission failures in production are operationally painful.

### Real-world IAM debt

Mature AWS accounts always have IAM debt:

- Old IAM users that should be SSO.
- Policies that grew without review.
- Roles with unused permissions.
- Hardcoded ARNs that should reference current resources.

Periodic cleanup (quarterly or so) catches this. Treat IAM like code: version controlled, reviewed, tested, refactored.

## Three real-world scenarios

**Scenario 1: A developer needs S3 read access for one project.**
Initial grant: "AmazonS3ReadOnlyAccess" managed policy — reads ALL buckets in the account. Too broad. Better: custom policy granting `s3:GetObject` and `s3:ListBucket` on `arn:aws:s3:::project-x-data` and `arn:aws:s3:::project-x-data/*`. Specific, auditable, scoped.

**Scenario 2: Cross-account access for a vendor.**
A SaaS vendor needs to read logs from your S3 bucket. Bad: create an IAM user in your account, share access keys. Good: create a role in your account with trust policy allowing the vendor's role to assume it; vendor uses STS to assume and gets temporary credentials. Audit via CloudTrail.

**Scenario 3: An ex-employee's access keys are still active.**
Audit reveals IAM user with access keys belonging to an employee who left 6 months ago. Bad implications: this person could still potentially access AWS, depending on whether they retained the keys. Fix: deactivate the user and keys immediately, then investigate access patterns. Prevention: SSO via Identity Center (deactivating the employee's IdP account immediately revokes AWS access), automatic key rotation, IAM user inventory reviews.

## Common mistakes to avoid

- **Wildcards** (`*`) in actions and resources without justification.
- **IAM users for humans** instead of SSO.
- **Long-term access keys** that don't rotate.
- **Inline policies** when managed policies would do.
- **No conditions** on sensitive permissions.
- **Permissions that accumulate** without review.
- **No MFA requirement** on dangerous operations.

## Read more

- AWS IAM User Guide.
- AWS Whitepaper: "AWS Security Best Practices."
- AWS Identity Center documentation.
- IAM Access Analyzer guide.

## Summary

- **IAM primitives**: users, groups, roles, policies.
- **Policies are JSON**: Effect, Action, Resource, Condition.
- **Evaluation**: explicit deny wins; allow needed; default deny.
- **Multiple policy types combine**: identity, resource, SCP, permission boundary.
- **Least privilege** is the goal; achieve via specific actions, scoped resources, conditions.
- **Roles + temporary credentials** beat long-term keys.
- **SSO/Identity Center** for humans.
- **Access Analyzer** to find unused permissions.
- **Audit regularly**: IAM debt accumulates without active cleanup.

Next: encryption, secrets, and security baseline.
