---
module: 3
position: 4
title: "Encryption, secrets, and the security baseline"
objective: "Know what to encrypt and how."
estimated_minutes: 8
---

# Encryption, secrets, and the security baseline

## The puzzle

"Encrypt everything" is good advice but vague. What goes where? Which keys? Whose responsibility? AWS provides multiple encryption services and storage options for secrets, each with different operational characteristics. Knowing the right tool for the job saves headaches and audits.

## The simple version

The encryption baseline:

1. **Encryption at rest**: turn it on for everything that supports it (EBS, S3, RDS, DynamoDB). Default to AWS-managed keys; use customer-managed KMS keys when you need policy control.
2. **Encryption in transit**: HTTPS everywhere, including service-to-service inside your VPC. Use ACM for free certificates.
3. **Secrets**: Secrets Manager for rotation-capable secrets (DB passwords, API keys). Parameter Store for configuration that's secret-ish.
4. **KMS**: the key-management service underneath most encryption features.

Combined: data is encrypted at rest, in transit, and any secrets in your application come from Secrets Manager (not env vars, not config files committed to git).

## The technical version

### KMS — the foundation

AWS Key Management Service manages encryption keys. Most other AWS encryption features use KMS under the hood.

KMS concepts:

- **Customer Master Key (CMK)** — actually called "KMS key" now. The encryption key.
- **AWS-managed keys**: AWS creates and manages, one per service per region. Free to use; you don't control policy.
- **Customer-managed keys**: you create and manage. Full policy control, cost ($1/month per key + per-request).
- **AWS-owned keys**: AWS uses internally; not visible to you.

For most workloads, AWS-managed keys are fine. Move to customer-managed when you need:

- Audit log of every key use (CloudTrail records each).
- Per-key access policies.
- Cross-account key sharing.
- Key rotation policies under your control.
- Compliance requirements (some regs require customer-managed).

### Envelope encryption

KMS doesn't directly encrypt your data. Instead:

1. You ask KMS for a "data key" — a symmetric key for encrypting your data.
2. KMS returns: the plaintext data key (for immediate use) + the encrypted data key (to store alongside your data).
3. You encrypt your data with the plaintext data key.
4. You store the encrypted data + the encrypted data key.
5. To decrypt later: send the encrypted data key to KMS, get plaintext data key, decrypt data.

This pattern (envelope encryption) lets KMS scale — KMS handles small key operations, not gigabytes of data encryption. The data key encrypts the data; the KMS key encrypts the data key.

You don't usually do this by hand. Services like S3 SSE-KMS, EBS encryption, and the AWS Encryption SDK handle envelope encryption transparently.

### Encryption at rest

Enable encryption at rest on every service that supports it:

- **EBS**: enable at account level (`EC2 → Settings → EBS encryption → Enable by default`).
- **S3**: bucket default encryption (SSE-S3 or SSE-KMS).
- **RDS / Aurora**: encryption setting at instance creation (can't change later).
- **DynamoDB**: encrypted by default.
- **EFS**: enable at file system creation.
- **Snapshots**: inherit encryption from source.

Most newer services are encrypted by default. Older ones require explicit configuration. Audit periodically (AWS Config has rules for this).

For the same data:

- **AWS-managed encryption**: simple, free. AWS rotates keys behind the scenes. Default for most cases.
- **SSE-KMS with AWS-managed key**: KMS-backed, free, audit via CloudTrail.
- **SSE-KMS with customer-managed key**: $1/month + per-request, full control.
- **Client-side encryption**: you encrypt before sending; AWS never sees plaintext.

For client-side, use the AWS Encryption SDK or libraries like AWS S3 Encryption Client. Most workloads don't need this.

### Encryption in transit

HTTPS everywhere. Specifically:

- **External traffic**: load balancers terminate TLS; certs from AWS Certificate Manager (ACM) — free, auto-renewing.
- **Service-to-service**: also TLS where possible. Most AWS services support TLS internally.
- **Database connections**: enable TLS to RDS/Aurora.
- **Internal application traffic**: use TLS even within the VPC.

ACM is the easy path:

- Request a public cert through ACM (free).
- Validate via DNS (Route 53 integration is automatic).
- Attach to ALB, CloudFront, API Gateway, etc.
- Auto-renews; no operational work.

For internal certs (between microservices in your VPC), use ACM Private CA or a self-managed PKI.

### Secrets Manager

For application secrets (database passwords, API keys, OAuth secrets):

- **Encrypted at rest** via KMS.
- **IAM-controlled access** (only specific roles can retrieve).
- **Automatic rotation** for supported secret types (RDS, DocumentDB, custom via Lambda).
- **Versioning**: keep old versions for rollback.

Pricing: $0.40/secret/month + per-API-call. Not free, but cheap insurance.

Pattern in code:

```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='prod/db/password')['SecretString']
```

No hardcoded credentials, no env vars at deploy time, automatic rotation possible.

### Systems Manager Parameter Store

A cheaper alternative for some use cases:

- **Standard parameters**: free, up to 4 KB.
- **Advanced parameters**: $0.05/parameter/month, up to 8 KB, policies.
- **SecureString**: encrypted via KMS.

Parameter Store vs Secrets Manager:

- Parameter Store: cheaper, simpler. Good for config + small secrets.
- Secrets Manager: rotation, full versioning, secret types.

For database passwords with rotation, Secrets Manager. For application config, Parameter Store. For really sensitive secrets where you want every read audited, Secrets Manager with customer-managed KMS key.

### KMS key policies

A KMS key has a key policy controlling who can use it:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowAppRoleToUseKey",
    "Effect": "Allow",
    "Principal": { "AWS": "arn:aws:iam::123456789:role/app-role" },
    "Action": ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"],
    "Resource": "*"
  }]
}
```

Plus a section allowing the AWS account root to manage the key (otherwise nobody can manage it).

KMS key policies + IAM policies + grants combine to determine who can use a key. For cross-account encryption, the key policy in account A grants account B's role; account B's IAM policy also grants the key actions.

### Encrypting data in databases

RDS / Aurora encryption is at the storage layer — transparent to the database. Application doesn't change.

For column-level encryption (encrypt only PII columns, not entire database):

- Encrypt in the application before storing.
- Use database extensions (PostgreSQL pgcrypto).
- Use AWS Encryption SDK.

For tokenization (replace sensitive values with tokens that map back to real values via a separate service), there are specialized AWS partners or build it yourself.

For most workloads, storage-layer encryption is sufficient. Column-level encryption is for high-sensitivity data with specific compliance requirements.

### Secrets in application deployment

Patterns for getting secrets into running applications:

1. **Environment variables from Secrets Manager / Parameter Store at startup**: Lambda integrates natively; ECS task definitions can reference; EC2 user data can fetch.
2. **In-app SDK calls**: application retrieves at runtime.
3. **Init container / sidecar**: container pattern where a sidecar fetches secrets and writes to shared volume.

Don't:

- Commit secrets to source control (use git-secrets to prevent).
- Put secrets in container images.
- Pass secrets via command line (visible in process list).
- Log secrets (sanitize logs).

### Rotation

For secrets that support rotation:

- **RDS database passwords**: Secrets Manager rotates by updating the password in RDS and the secret atomically.
- **Custom secrets**: Lambda function performs the rotation logic.

Rotation cadence: depends on sensitivity. Quarterly is common for database passwords. Monthly for API keys to external services. Immediate for compromised credentials.

### Encryption for compliance

If you have compliance requirements (HIPAA, PCI-DSS, SOC 2, etc.):

- **AWS handles physical security and infrastructure compliance**.
- **You handle data classification, access controls, encryption configuration, audit logging**.
- **Customer-managed KMS keys** often required for sensitive data.
- **CloudTrail + Config + Security Hub** for ongoing audit evidence.

AWS publishes which services support which compliance frameworks. Encryption is necessary but not sufficient for compliance — you also need access controls, logging, incident response procedures, and policies.

### Auditing encryption

Check your encryption posture regularly:

- AWS Config rule: `encrypted-volumes` (EBS).
- AWS Config rule: `s3-bucket-server-side-encryption-enabled`.
- AWS Config rule: `rds-storage-encrypted`.
- AWS Security Hub: aggregates findings.
- Custom queries via CloudTrail / Config.

Set up automatic remediation where possible (Config rules can trigger Lambda to enable encryption on newly-created resources).

### Common encryption mistakes

A few patterns to avoid:

- **Default encryption not enabled** at account level → some new resources unencrypted.
- **No rotation** of long-lived secrets.
- **Hardcoded secrets** in code, config files, environment variables.
- **Customer-managed keys without proper policy** → can't decrypt your own data.
- **Snapshot leakage** → encrypted volume snapshotted to unencrypted volume.
- **Logs not sanitized** → secrets in CloudWatch Logs.
- **KMS keys without rotation** schedule.

### A baseline encryption checklist

For a new AWS workload:

- [ ] EBS encryption enabled by default at account level.
- [ ] S3 buckets have default encryption configured.
- [ ] RDS instances created with encryption.
- [ ] DynamoDB tables encrypted (default).
- [ ] HTTPS on all external endpoints (ACM cert on ALB/CloudFront).
- [ ] Database passwords in Secrets Manager with rotation.
- [ ] API keys to third parties in Secrets Manager.
- [ ] No secrets in env vars at deploy time.
- [ ] No secrets in code repos (git-secrets, GitHub secret scanning).
- [ ] CloudTrail enabled, logs encrypted.
- [ ] VPC Flow Logs enabled for production VPCs.
- [ ] KMS key policies reviewed.
- [ ] Automatic key rotation enabled where supported.

Run through this list when launching anything new. Many items are one-time setup with permanent benefit.

## Three real-world scenarios

**Scenario 1: A database password committed to a git repo.**
Developer accidentally pushed application config with the production database password. Code went to a public repo briefly before someone caught it. Required: rotate the password immediately, investigate access logs, scan repo for other secrets. Prevention: store secrets in Secrets Manager (code only references the secret name, never the value); git-secrets / GitHub secret scanning catches accidental commits; mandatory pre-commit hooks.

**Scenario 2: An audit asks for evidence of encryption.**
Need to show every database and storage volume is encrypted. AWS Config Conformance Pack for encryption gives a compliance report. CloudTrail confirms no decryption events outside expected access patterns. Security Hub provides an aggregated view. Auditors get evidence; no manual collection required.

**Scenario 3: A cross-account encryption challenge.**
Account A's data needs to be readable by account B's processing role. The data is in S3 encrypted with KMS. The fix: customer-managed KMS key with policy allowing both accounts' roles; S3 bucket policy allowing account B; both IAM identities have the necessary permissions. Cross-account encryption requires alignment of bucket policy, IAM policy, and KMS key policy.

## Common mistakes to avoid

- **Disabled encryption** to "save complexity" — habit, not a real saving.
- **Hardcoded secrets** in code or configuration.
- **No rotation** of credentials.
- **Customer-managed key without policy review** — can lock yourself out.
- **Plaintext logs** containing sensitive data.
- **Mixed encrypted/unencrypted** storage in the same workload.

## Read more

- AWS KMS Developer Guide.
- AWS Whitepaper: "Encrypting Data at Rest."
- AWS Whitepaper: "Logical Separation on AWS."
- AWS Secrets Manager User Guide.

## Summary

- **Encrypt everything at rest**: EBS, S3, RDS, DynamoDB, snapshots.
- **HTTPS in transit**: ACM for free certs; TLS even internally.
- **KMS** is the foundation; AWS-managed keys for most, customer-managed for control.
- **Envelope encryption**: KMS encrypts data keys; data keys encrypt data.
- **Secrets Manager** for application secrets with rotation.
- **Parameter Store** for config and lighter secrets.
- **No hardcoded secrets** in code, config files, or env vars.
- **Audit via Config / Security Hub** regularly.
- **Compliance** is more than encryption; it's the full security baseline.

That wraps Module 3. Next: architecture patterns.
