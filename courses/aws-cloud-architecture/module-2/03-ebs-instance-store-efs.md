---
module: 2
position: 3
title: "EBS, instance store, and EFS — block and file storage"
objective: "Pick the right storage service for the workload."
estimated_minutes: 8
---

# EBS, instance store, and EFS — block and file storage

## The puzzle

S3 is for objects. But many workloads need traditional block storage (like a hard drive attached to a server) or file storage (like a network share). AWS has different services for each, with different durability, performance, and cost profiles. Picking the wrong one wastes money or causes data loss.

## The simple version

Three storage services for different needs:

1. **EBS (Elastic Block Store)**: persistent block storage attached to one EC2 instance at a time. Like a virtual hard drive. AZ-scoped. The default for EC2 root volumes and most application disks.

2. **Instance store**: physical disks on the host machine, attached to specific EC2 instance types. Very fast, free with the instance — but data is lost when the instance stops or fails. Ephemeral by design.

3. **EFS (Elastic File System)**: network file system (NFS), shared across many EC2 instances simultaneously. Scales automatically. Pricier per GB than EBS but supports concurrent access.

There's also **FSx** for specialized file systems (Windows file shares via FSx for Windows, high-performance Lustre, OpenZFS, NetApp ONTAP).

The pattern: EBS for single-instance persistent storage; instance store for fast ephemeral; EFS/FSx for shared file systems.

## The technical version

### EBS in detail

EBS provides block storage that looks like a local disk to EC2:

- **Persistent**: survives instance stops and starts. Data persists until you delete the volume.
- **AZ-scoped**: tied to one AZ. To use in another AZ, snapshot and restore.
- **Attached to one instance**: with limited exceptions (Multi-Attach for io1/io2 in specific patterns).
- **Sizeable**: from 1 GB to 64 TB per volume.
- **Snapshottable**: point-in-time backups to S3 (managed by AWS, not visible in your S3 buckets).

Volume types:

- **gp3** (general purpose SSD): default. 3,000 baseline IOPS, scalable to 16,000. Throughput configurable up to 1,000 MB/s. ~$0.08/GB/month. Right for most workloads.
- **gp2** (older general purpose SSD): IOPS scales with size. Mostly superseded by gp3.
- **io2 / io2 Block Express** (provisioned IOPS SSD): for I/O-intensive databases. Up to 256,000 IOPS, 4 GB/s. Expensive.
- **st1** (throughput-optimized HDD): big sequential reads (data warehouses, log processing). Cheap per GB.
- **sc1** (cold HDD): infrequent access. Cheapest, slowest.

Don't over-provision. EBS bills you for provisioned size regardless of actual data. A 100 GB gp3 volume with 10 GB used costs the same as one fully utilized.

### EBS snapshots

Snapshots are incremental backups of EBS volumes to S3:

- **First snapshot**: full copy.
- **Subsequent snapshots**: only changed blocks.
- **Stored in S3 internally** (AWS-managed; not visible in your bucket list).
- **Cross-region copy possible** for DR.
- **Restore** creates a new volume from snapshot, in any AZ in the region.

Snapshots are how you back up EBS volumes, migrate them between AZs, or clone them. AWS Data Lifecycle Manager automates snapshot creation and retention.

Common mistake: snapshots accumulate. A daily snapshot for years adds up to significant storage cost. Set retention policies.

### EBS encryption

Always enable EBS encryption. AWS recommends enabling it by default at the account level:

```
EC2 → Settings → EBS encryption → Enable encryption by default
```

Encrypted volumes use KMS keys. Performance impact is negligible. Snapshots of encrypted volumes are also encrypted. Restored volumes inherit encryption.

For data subject to compliance, encryption is usually mandatory anyway.

### Instance store

Some EC2 instance types include local NVMe SSD storage directly attached to the host:

- **i3, i4i**: storage-optimized, lots of instance store.
- **m5d, r5d, c5d**: general families with instance store option.
- **p3, p4, p5**: GPU instances often have instance store.

Properties:

- **Very fast**: directly attached, no network. Multi-GB/s sequential, hundreds of thousands of IOPS.
- **Free**: included with instance price (you're paying for the instance type anyway).
- **Ephemeral**: data is lost when the instance stops, terminates, or fails.

Use cases:

- Database temporary tables / scratch space.
- Distributed databases with built-in replication (Cassandra, MongoDB, ScyllaDB) — replication handles durability across instances.
- Local caches.
- Buffer storage in stream processing.
- Build / CI scratch space.

Don't use for: anything that needs to survive instance failure. The data is gone the moment that one host fails.

### EFS

EFS provides NFS-compatible network file storage:

- **Concurrent access**: many EC2 instances can mount and read/write the same file system.
- **Scales automatically**: no provisioning; grows and shrinks as you write data.
- **Pay-per-GB used**: ~$0.30/GB/month for Standard, ~$0.016/GB/month for IA.
- **Available in all AZs**: regional service, not AZ-bound (configurable).
- **POSIX semantics**: standard file system behavior — works with most software expecting NFS.

Use cases:

- Shared content for fleets of web servers (asset directories).
- Container persistent volumes that need to survive pod restarts.
- Lift-and-shift of legacy apps expecting a shared file system.
- Data science workflows where many machines analyze the same dataset.

Don't use for: high-IOPS databases (use EBS or a managed DB). Tiny files at extreme rate (NFS has per-operation overhead).

### EFS storage classes

EFS has tiers:

- **Standard**: ~$0.30/GB/month, multi-AZ.
- **Infrequent Access (IA)**: ~$0.016/GB/month + per-access cost. For files not touched in 30+ days.
- **One Zone**: cheaper, single AZ.
- **Throughput / Provisioned modes**: choose burst (auto-scaling) or provisioned throughput.

Lifecycle policies auto-transition cold files to IA.

### FSx

FSx is "everything else" for file storage:

- **FSx for Windows File Server**: SMB-based file shares for Windows.
- **FSx for Lustre**: high-performance computing file system; very fast.
- **FSx for OpenZFS**: ZFS file system.
- **FSx for NetApp ONTAP**: enterprise NetApp features.

For specific use cases. Most workloads don't need these — EFS, EBS, or S3 fit better.

### Choosing the right service

Decision flow:

1. **Object storage** (key-value, immutable, web-accessible)? → S3.
2. **Block storage** for a single VM (database, app data)? → EBS.
3. **Ephemeral high-performance** scratch? → Instance store.
4. **Shared file system** across multiple instances? → EFS (or FSx if you need specific features).
5. **Backup / archive**? → S3 with lifecycle to Glacier.

For most workloads, S3 + EBS handles 90% of needs. EFS comes in when you genuinely need shared file system semantics.

### Performance characteristics

Rough comparison (varies by configuration):

| Storage | Latency | Throughput | IOPS | Cost/GB |
|---------|---------|------------|------|---------|
| Instance store | <1 ms | GB/s | 100,000s | Free with instance |
| EBS gp3 | 1-2 ms | up to 1 GB/s | up to 16,000 | $0.08/mo |
| EBS io2 Block Express | <1 ms | 4 GB/s | 256,000 | $0.125/mo + IOPS |
| EFS | 1-3 ms | up to 10 GB/s | shared | $0.30/mo |
| S3 | 100ms+ | massive parallel | per-request | $0.023/mo |

S3 latency is much higher per request than block storage but throughput scales massively. EBS is the sweet spot for app-data block storage.

### Multi-attach EBS (specialized)

EBS io1/io2 volumes can be attached to multiple EC2 instances simultaneously (Multi-Attach). Limited use case:

- Cluster file systems that handle shared block storage (GFS2, Oracle RAC).
- Specific HA database patterns.

For most workloads, multi-attach isn't the right pattern. Use EFS for shared file access, or design the application to use S3 for shared object data.

### EBS for databases

When using EBS for database storage (RDS uses it under the hood):

- **gp3**: good for most databases. Tune IOPS and throughput separately.
- **io2 / io2 Block Express**: for high-IOPS workloads.
- **Provision more than you think**: extra IOPS headroom prevents performance cliffs.
- **Snapshots for backup**: integrate with database-specific backup tools (mysqldump, pg_dump) where consistency matters.

For most managed databases (RDS, Aurora), AWS handles the storage layer. For self-managed databases on EC2, you choose the EBS volume type.

### Common storage mistakes

1. **Using EBS when S3 fits**: storing static assets on EBS is wasteful.
2. **Using EFS when EBS fits**: paying for EFS overhead when one instance accesses the data.
3. **Over-provisioning EBS volumes**: 500 GB allocated for 50 GB used.
4. **No snapshot retention**: snapshots accumulate indefinitely.
5. **Instance store for persistent data**: data loss on instance failure.
6. **Wrong volume type**: io2 for everything when gp3 would do.
7. **No encryption**: avoidable risk.

### Backing up persistent storage

Backup options per service:

- **EBS**: snapshots (manual or automated via Data Lifecycle Manager).
- **Instance store**: snapshot-and-copy to EBS, or app-level backup to S3. Underlying ephemeral storage has no native backup.
- **EFS**: AWS Backup integration, or EFS-to-EFS replication.
- **S3**: versioning + cross-region replication.

AWS Backup centralizes backup management across EBS, EFS, RDS, DynamoDB, and more. Worth setting up if you have multiple things to back up.

### Migration patterns

Common migrations:

- **EBS → S3** for data that doesn't need block semantics. Cheaper, more accessible.
- **Local files → EFS** to enable multi-instance access.
- **EBS → EBS** across AZs via snapshot.
- **On-prem NAS → EFS** for migrated workloads.
- **EBS upgrades**: change volume type without downtime (gp2 → gp3, for example).

EBS volume modifications (size, IOPS, type) happen online without taking the volume offline. Plan for the change to take hours for large volumes.

## Three real-world scenarios

**Scenario 1: A web app cluster needing shared assets.**
Ten EC2 instances serving a website. Static assets (uploaded images, user files) need to be accessible from all instances. Options: each instance has its own copy (sync nightmares), put files on EFS (shared NFS mount), or put files on S3 (URL access). S3 is usually best — cheaper, scalable, integrates with CloudFront. EFS works for legacy apps that expect a file system. Don't try to sync across EBS volumes.

**Scenario 2: A high-performance database.**
PostgreSQL on EC2 needing 50K IOPS. gp3 maxes at 16K, so io2 Block Express is the right choice. Provision 50K IOPS, expect to pay ~$1500/month for IOPS alone. Cheaper alternative: managed RDS or Aurora (AWS handles the IOPS provisioning). For most use cases, managed beats self-managed; reserve self-managed databases for specific tuning needs.

**Scenario 3: A Spark cluster with ephemeral data.**
Spark cluster for data processing — needs lots of fast disk for shuffle / intermediate data. EBS would be expensive at the required IOPS. Solution: instance store on i3/i4i instances. Free, very fast, and Spark replicates data across nodes anyway so the ephemerality doesn't matter. After processing, final results go to S3.

## Common mistakes to avoid

- **EBS for static content** that belongs in S3.
- **EFS for single-instance workloads** that don't need sharing.
- **Instance store for persistent data**.
- **Over-provisioned EBS** without right-sizing.
- **No snapshot retention** policy.
- **Unencrypted volumes** without business reason.
- **Wrong volume type** (io2 when gp3 suffices).

## Read more

- AWS EBS User Guide.
- AWS EFS User Guide.
- AWS Whitepaper: "Storage Options in the AWS Cloud."
- AWS Well-Architected Framework — Reliability Pillar.

## Summary

- **EBS**: persistent block storage, AZ-scoped, one instance at a time, default for app data.
- **Instance store**: ephemeral local SSD, very fast, lost on instance stop.
- **EFS**: NFS file system, shared across instances, scales automatically.
- **FSx**: specialized file systems (Windows, Lustre, OpenZFS, NetApp).
- **S3**: object storage for shared, immutable, web-accessible data.
- **Volume types** (gp3, io2, st1, sc1) trade cost for performance.
- **Snapshots**: incremental backups for EBS; lifecycle for management.
- **Encryption**: enable by default at account level.
- **Pick by access pattern**: single vs shared, persistent vs ephemeral, block vs file vs object.

Next: Lambda and serverless compute.
