---
module: 2
position: 2
title: "S3 — object storage and how it really works"
objective: "Understand S3's model and storage classes."
estimated_minutes: 8
---

# S3 — object storage and how it really works

## The puzzle

S3 looks like "a place to put files." It's not — it's an object store with subtle semantics that differ from filesystems in ways that bite people. It's also the foundational AWS service: a huge portion of the AWS ecosystem reads from or writes to S3 somehow, directly or indirectly.

Understanding S3's actual model — buckets, objects, keys, regions, versioning, consistency — is foundational.

## The simple version

S3 stores **objects** in **buckets**. An object has:

- A **key** (the path-like string identifier).
- **Data** (the actual bytes).
- **Metadata** (content type, custom headers, etc.).

A bucket is a flat namespace within a region. There are no real directories — but slashes in keys (`folder/subfolder/file.txt`) let tools pretend there are.

You upload via API (PUT), retrieve via API (GET), list keys (LIST), delete (DELETE). That's it. Plus a lot of features layered on top: versioning, lifecycle, encryption, replication, access policies.

S3 is durable (11 nines of durability — extraordinary), highly available, scales to exabytes per bucket, and prices ~$0.023/GB/month in Standard storage class.

## The technical version

### Buckets

Properties:

- **Globally unique name**: across all of AWS, no two buckets share a name.
- **Region-scoped**: bucket lives in one region; data doesn't move unless you configure replication.
- **No nesting**: buckets can't contain buckets.
- **Soft limits**: 100 buckets per account by default (raisable).

Naming: 3-63 characters, lowercase, no underscores, must not look like an IP address. The global uniqueness means good names get taken; namespace tricks like `<company>-<purpose>-<env>` help.

### Objects and keys

An object's key is just a string. S3 treats `folder/file.txt` as one key, not a folder containing a file. But:

- Most tools (AWS Console, CLI, libraries) interpret slashes as folder boundaries.
- LIST operations support prefix and delimiter filtering ("list all objects with prefix `folder/` and delimiter `/`") which produces a folder-like view.
- This convention makes S3 *look* hierarchical even though it isn't.

Object size: 5 bytes to 5 TB per object. Larger objects must use multipart upload.

### Storage classes

S3 has multiple storage classes, each with different cost/access tradeoffs:

- **S3 Standard**: default. $0.023/GB/month, millisecond access, multi-AZ.
- **S3 Standard-IA** (Infrequent Access): $0.0125/GB/month + per-retrieval cost. For data accessed monthly or less.
- **S3 One Zone-IA**: $0.01/GB/month + retrieval. Cheaper but only one AZ (less durable).
- **S3 Intelligent-Tiering**: AWS auto-moves objects between tiers based on access patterns. Good default for unpredictable access.
- **S3 Glacier Instant Retrieval**: $0.004/GB/month, milliseconds. For archive accessed quarterly.
- **S3 Glacier Flexible Retrieval** (formerly Glacier): $0.0036/GB/month, minutes-hours retrieval. For archive.
- **S3 Glacier Deep Archive**: $0.00099/GB/month, 12+ hour retrieval. For long-term archive.

For 1 TB of data: Standard = $23/month; Deep Archive = $1/month. The price difference matters at scale.

### Lifecycle policies

Rules that automatically transition objects between storage classes or delete them:

```json
{
  "Rules": [{
    "Status": "Enabled",
    "Filter": { "Prefix": "logs/" },
    "Transitions": [
      { "Days": 30, "StorageClass": "STANDARD_IA" },
      { "Days": 90, "StorageClass": "GLACIER" }
    ],
    "Expiration": { "Days": 365 }
  }]
}
```

This rule: objects in `logs/` go to IA after 30 days, Glacier after 90, delete after 365. Lifecycle saves significant money for data with predictable access patterns.

### Versioning

By default, PUT to an existing key overwrites. With versioning enabled:

- Each PUT creates a new version.
- Old versions retained.
- DELETE adds a delete marker but keeps history.

Versioning protects against accidental deletion or overwrite. Cost: pay for all versions stored. Lifecycle rules for "expire non-current versions" prevent unbounded growth.

For mutable data (config, codebases), versioning is usually the right call.

### Encryption

S3 encryption options:

- **SSE-S3**: AWS manages keys. Default for new buckets in many cases. Easy.
- **SSE-KMS**: AWS KMS manages keys. You control policies, rotation, audit logs of key use.
- **SSE-C**: customer-provided keys per request. AWS doesn't store keys.
- **Client-side encryption**: encrypt before sending; AWS never sees plaintext.

For most workloads, SSE-S3 or SSE-KMS. SSE-KMS adds slight cost (per KMS request) but better audit visibility.

Best practice: enforce encryption via bucket policy that denies unencrypted PUTs.

### Access control

S3 has multiple overlapping access control mechanisms:

1. **IAM policies**: identity-based, on users/roles.
2. **Bucket policies**: resource-based, on the bucket.
3. **Object ACLs**: per-object grants (legacy, mostly deprecated).
4. **Block Public Access**: account-level switch that overrides everything.

Best practice: Block Public Access on at account level. Use IAM policies for in-AWS access. Use bucket policies for cross-account or specific deny rules. Avoid ACLs unless you have a specific reason.

The default settings for new buckets in 2024+ disable ACLs and enable Block Public Access — sensible defaults.

### Public buckets — almost always a mistake

Some buckets need to be public (CDN origin, public docs). But:

- Most "public" use cases are better served by CloudFront with signed URLs.
- Public buckets are scanned by attackers constantly.
- Public buckets are the #1 source of S3-related data exposures.

If you genuinely need public read, use CloudFront in front (better performance, can revoke access). If you need authenticated access, use pre-signed URLs.

### Multipart upload

For objects larger than ~100 MB, use multipart upload:

1. Initiate multipart upload (returns upload ID).
2. Upload parts in parallel (each 5 MB-5 GB).
3. Complete multipart upload (S3 assembles parts).

Benefits: parallelism (faster), resumability (failed parts can retry), better network utilization.

The AWS SDKs do this automatically when you use high-level upload methods. Watch out for failed multipart uploads accumulating (cost!) — set a lifecycle rule to clean them up after a few days.

### Pre-signed URLs

A way to grant temporary access to a specific object without giving permanent S3 permissions:

```python
url = s3.generate_presigned_url('get_object',
    Params={'Bucket': 'my-bucket', 'Key': 'file.pdf'},
    ExpiresIn=3600)
```

The URL is valid for 1 hour. Anyone with the URL can GET the object during that window.

Used for: user uploads (presigned PUT), download links in apps, secure file sharing.

### S3 Transfer Acceleration and CloudFront

For large uploads from distant locations:

- **Transfer Acceleration**: traffic enters at the nearest AWS edge location, traverses AWS backbone to the bucket. Can be 50-500% faster for distant uploads. Extra cost per GB.
- **Multi-region replication + CloudFront**: serve reads from edge for low latency.

For most uploads, multipart from a same-region client is fine. Transfer Acceleration is for global apps with users far from the bucket region.

### Replication

S3 can replicate objects across buckets:

- **Same-Region Replication (SRR)**: for compliance/separation.
- **Cross-Region Replication (CRR)**: for DR or distributing data globally.

Both: source bucket → destination bucket; objects copied asynchronously.

CRR costs include cross-region data transfer plus storage in both regions. For DR, this is usually worth it for critical data.

### S3 events and notifications

S3 can publish events on object creation/deletion to:

- SNS topics.
- SQS queues.
- Lambda functions.
- EventBridge.

Use case: process new images uploaded to a bucket. Image upload triggers Lambda → resize → save thumbnails. Event-driven and serverless.

This is one of the most common AWS architecture patterns and a frequent reason S3 is "the foundational service."

### Consistency model

S3 now has strong read-after-write consistency for all operations:

- PUT new object: subsequent GETs see it.
- PUT overwriting an existing object: subsequent GETs see the new version.
- DELETE: subsequent GETs return 404 (or older version if versioning).

Older S3 (pre-2020) had eventual consistency for overwrites and lists. Code from that era might have workarounds you no longer need.

### Performance

S3 scales massively but with patterns:

- **Request rates**: up to 5500 GET/s and 3500 PUT/s per prefix. With distributed prefixes, much higher.
- **Throughput**: can scale to many GB/s per bucket.
- **Latency**: ~100ms-1s for first byte; throughput from there limited by network and parallelism.

For high-throughput workloads, use random or hashed prefixes to spread load across S3's partitions. The "use unique prefixes" advice from years ago is mostly automatic now but still relevant for the highest-throughput cases.

### S3 access logging

Two logging mechanisms:

- **S3 Server Access Logging**: logs to another bucket. Free, raw format.
- **CloudTrail Data Events**: more structured, integrates with CloudTrail. Costs per event.

Enable some form of logging for production buckets — useful for security audits and debugging.

### Common patterns

A few canonical S3 use cases:

- **Static website hosting**: HTML/CSS/JS in S3, CloudFront in front.
- **Data lake**: raw data dumps in S3, queried via Athena, Glue, Spark.
- **Backups**: application backups uploaded to S3, lifecycled to Glacier.
- **Event sources**: uploads trigger Lambda processing.
- **Software distribution**: binaries downloadable via CloudFront-fronted S3.
- **ML training data**: datasets in S3, read by SageMaker / training jobs.

S3 is everywhere in AWS architectures because it's cheap, durable, and integrates with everything.

### Costs to watch

S3 cost drivers:

- **Storage**: $/GB/month per storage class.
- **Requests**: $/1000 PUT, $/10000 GET (varies by class).
- **Transfer out**: significant for internet egress.
- **Glacier retrieval**: separate cost; expedited retrieval is much more expensive.
- **Replication**: doubles storage + cross-region transfer.

For mostly-stored, rarely-accessed data, storage dominates. For high-access workloads, request costs and egress dominate.

## Three real-world scenarios

**Scenario 1: Image upload pipeline.**
Users upload images via pre-signed URLs (browser PUTs directly to S3, no app server traffic). S3 event triggers Lambda. Lambda generates thumbnails, stores them in another S3 prefix. Original and thumbnails served via CloudFront. Clean, scalable, cheap.

**Scenario 2: Logs accumulating without lifecycle.**
Application logs being shipped to S3, no lifecycle rules. After 2 years, 50 TB stored at $1100/month. Add lifecycle: 30 days Standard → 90 days IA → 1 year Glacier → expire after 5 years. Bill drops to ~$60/month. Same data accessibility (when needed) at 5% of cost.

**Scenario 3: Public bucket breach.**
Developer enabled public read on a bucket "temporarily." Forgot. Bots indexed it. Customer data exposed. Cost: incident response, customer notifications, regulatory action. Prevention: Block Public Access at account level (forces explicit override for genuinely-public buckets), AWS Config rules detecting public buckets, mandatory review for ACL/policy changes.

## Common mistakes to avoid

- **Public buckets** for "convenience" — use CloudFront + IAM instead.
- **No lifecycle** on data with predictable access patterns.
- **Object ACLs** for access control (deprecated approach).
- **Standard storage** for data accessed rarely — use IA or Glacier.
- **Forgotten multipart uploads** accumulating in incomplete state.
- **No versioning** on mutable data.
- **Long-term unencrypted objects** if compliance matters.

## Read more

- AWS S3 Developer Guide.
- AWS Whitepaper: "Best Practices for Amazon S3."
- AWS Well-Architected Framework — Security and Cost Optimization pillars.

## Summary

- **S3** = object store with buckets and keys.
- **No real folders** — slashes in keys are a convention.
- **Storage classes**: Standard, IA, Glacier, Deep Archive trade cost for retrieval speed.
- **Lifecycle policies** automate transitions and deletion.
- **Versioning** protects against accidental change.
- **Encryption**: SSE-S3 or SSE-KMS for most cases.
- **Block Public Access** at account level; avoid public buckets.
- **Pre-signed URLs** for time-limited access without permanent grants.
- **S3 events** trigger Lambda for event-driven architectures.
- **Strong read-after-write consistency** as of 2020.

Next: block and file storage (EBS, instance store, EFS).
