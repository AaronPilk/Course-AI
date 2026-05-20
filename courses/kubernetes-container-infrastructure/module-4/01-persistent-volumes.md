---
module: 4
position: 1
title: "Persistent volumes and storage classes"
objective: "Run stateful workloads correctly."
estimated_minutes: 7
---

# Persistent volumes and storage classes

## The puzzle

Pods are ephemeral. When they restart or move to another Node, their local disk goes with them. Stateful workloads (databases, caches with on-disk state, file servers) need storage that survives Pod lifecycle. Kubernetes' PV/PVC system handles this via dynamic provisioning that talks to underlying cloud or storage systems.

## The simple version

Three primary objects:

1. **PersistentVolume (PV)**: a piece of storage in the cluster (an EBS volume, an NFS share, etc.). Has capacity, access mode, reclaim policy.
2. **PersistentVolumeClaim (PVC)**: a request for storage from a Pod. References a StorageClass.
3. **StorageClass**: defines a "type" of storage; cloud providers preinstall ones for their services (gp3, io2, etc.).

You write a PVC; the StorageClass provisioner creates a PV automatically; the PV binds to your PVC; Pods mount the PVC as a volume.

For StatefulSets, `volumeClaimTemplates` creates one PVC per replica — each Pod gets its own persistent disk that follows it across restarts.

## The technical version

### Storage classes

A StorageClass defines the storage type and how to provision it:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  fsType: ext4
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
reclaimPolicy: Delete
```

Key fields:

- **provisioner**: the CSI driver (`ebs.csi.aws.com` for AWS EBS).
- **parameters**: provisioner-specific options (volume type, IOPS, etc.).
- **volumeBindingMode**: `Immediate` (provision when PVC created) or `WaitForFirstConsumer` (provision when Pod scheduled — better for AZ-awareness).
- **allowVolumeExpansion**: whether you can grow the volume.
- **reclaimPolicy**: `Delete` (PV deleted when PVC deleted) or `Retain` (keep around).

Cloud-managed clusters come with default StorageClasses. For EKS, the `gp2` (legacy) and `gp3` are common. You can create additional StorageClasses for different tiers.

### PVC and Pod

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data
spec:
  accessModes: ["ReadWriteOnce"]
  storageClassName: gp3
  resources:
    requests:
      storage: 100Gi
```

```yaml
spec:
  containers:
  - name: app
    image: myapp
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data
```

When the Pod is created, the StorageClass provisioner creates an EBS volume, formats it, attaches it to the Node, and mounts it into the Pod at `/data`.

### Access modes

- **ReadWriteOnce (RWO)**: one Node can mount read-write. Most common; EBS is RWO.
- **ReadOnlyMany (ROX)**: multiple Nodes can mount read-only.
- **ReadWriteMany (RWX)**: multiple Nodes can mount read-write. Requires shared filesystem (EFS, FSx).
- **ReadWriteOncePod (RWOP)**: only one Pod can mount.

Most workloads use RWO. RWX for shared file access (rare; usually a sign of needing a different architecture).

### Volume binding modes

**Immediate**: PV is provisioned as soon as PVC is created. Risk: provisioned in one AZ, Pod scheduled in another, attachment fails.

**WaitForFirstConsumer** (recommended): PVC stays pending until a Pod requests it; provisioner sees Pod's target AZ and creates volume there.

Always use `WaitForFirstConsumer` for cloud volumes that are AZ-scoped.

### StatefulSet + volumeClaimTemplates

```yaml
spec:
  serviceName: db
  replicas: 3
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: gp3
      resources:
        requests:
          storage: 100Gi
```

This creates three PVCs: `data-db-0`, `data-db-1`, `data-db-2`. Each Pod gets its own persistent volume that follows it across restarts. If `db-1` is deleted and recreated, it gets `data-db-1` back with whatever data was on it.

### CSI drivers

The Container Storage Interface (CSI) is the contract between Kubernetes and storage systems:

- AWS EBS CSI driver (`ebs.csi.aws.com`).
- AWS EFS CSI driver (for shared file storage).
- Azure Disk / File CSI drivers.
- GCP Persistent Disk CSI driver.
- On-prem CSI drivers (Ceph, NetApp, Pure).

Most managed clusters install the cloud-native CSI driver. Self-managed clusters install whichever matches their storage.

### Snapshots

CSI supports volume snapshots:

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: db-snapshot
spec:
  source:
    persistentVolumeClaimName: data-db-0
  volumeSnapshotClassName: csi-aws-vsc
```

Creates a snapshot in the cloud (EBS snapshot for AWS). For backups, this is the K8s-native way; tools like Velero orchestrate snapshot+restore workflows.

### Volume expansion

Many storage classes support expansion:

1. Edit the PVC's `resources.requests.storage` to a larger value.
2. PVC update triggers the CSI driver to expand the underlying volume.
3. Filesystem expands online (some workloads need a Pod restart).

`allowVolumeExpansion: true` in StorageClass is required. Shrinking is not supported.

### When to use which storage type

**EBS-equivalent (RWO block)**: databases, single-Node persistent storage, default for most stateful workloads.

**EFS / FSx / shared file (RWX)**: shared content for many Pods (rare; usually a sign to reconsider architecture).

**Object storage (S3)**: not a K8s volume; mounted via specialized drivers or accessed via SDK. For unstructured data, configuration, large blobs.

**Local persistent volumes**: directly attached SSDs on specific Nodes. Very fast; can be lost with Node failure. For specific high-performance use cases.

### Operations realities

**Backups**: snapshots via CSI; Velero or cloud-native tools for orchestration. Test restoration regularly.

**Provisioning failures**: AZ mismatch (use WaitForFirstConsumer), quota limits (cloud account), permission issues (CSI driver IAM).

**Stuck terminating**: PVCs sometimes get stuck during deletion. Finalizers, dangling references. Manual cleanup occasionally needed.

**Cost**: per-GB charges per volume, plus IOPS charges for some types. Right-size; delete orphaned PVCs.

**Volume expansion**: works but requires care for stateful workloads — coordinate with the application.

### Stateful workloads and K8s

Honest take: running stateful workloads on K8s requires care. Most production setups use managed databases (RDS, etc.) for primary state and only use K8s for caches, queues, or self-managed databases via operators. For databases you do run on K8s, use operators (CloudNativePG, Strimzi, etc.) that encode operational knowledge.

## Three real-world scenarios

**Scenario 1: PVC provisioned in wrong AZ.**
StorageClass had `volumeBindingMode: Immediate`. PVC provisioned in us-east-1a. Pod got scheduled to us-east-1b. Attachment failed because EBS is AZ-scoped. Fix: change StorageClass to `WaitForFirstConsumer`. Now PVC waits until Pod scheduled; volume created in same AZ.

**Scenario 2: Out of disk space mid-operation.**
Postgres on K8s ran out of disk during a heavy write. With `allowVolumeExpansion: true`, edited the PVC to 500Gi (from 100Gi). EBS expanded online. Postgres needed brief restart to detect new size. Avoided downtime.

**Scenario 3: Snapshot restoration drill.**
Quarterly: take a snapshot of production DB PVC; restore to a test cluster; verify data integrity. Caught a misconfigured snapshot class (was creating snapshots in wrong region). Fixed before a real DR event needed it.

## Common mistakes to avoid

- **Immediate volume binding mode** for AZ-scoped storage.
- **No volume expansion** — can't grow PVCs when they're full.
- **No snapshots/backups** of stateful workloads.
- **No restoration testing** — backups untested are unproven.
- **Wrong access mode** (RWX where RWO suffices).
- **Forgotten orphaned PVCs** accumulating cost.

## Read more

- Kubernetes docs: "Persistent Volumes" concept.
- AWS EBS CSI driver documentation.
- Velero documentation for K8s-native backup.

## Summary

- **PV/PVC** abstract storage from Pods.
- **StorageClass** + CSI driver provisions dynamically.
- **ReadWriteOnce** for most workloads; RWX for shared file storage.
- **WaitForFirstConsumer** for AZ-scoped cloud volumes.
- **volumeClaimTemplates** in StatefulSet for per-replica storage.
- **Snapshots** via CSI for backups.
- **Allow volume expansion** in StorageClass.
- **Stateful workloads on K8s** are real work; managed databases often better.

Next: RBAC and ServiceAccounts.
