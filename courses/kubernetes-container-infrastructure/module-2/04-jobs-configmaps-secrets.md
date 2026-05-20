---
module: 2
position: 4
title: "Jobs, CronJobs, ConfigMaps, Secrets"
objective: "Run batch work and inject configuration."
estimated_minutes: 8
---

# Jobs, CronJobs, ConfigMaps, Secrets

## The puzzle

Not every workload is a long-running service. Some run to completion (a migration, a report generation, an ETL job). Some run on a schedule (nightly backups, hourly aggregations). And every workload needs configuration and secrets that shouldn't be baked into container images. Kubernetes has clean primitives for each.

## The simple version

Four more core objects:

1. **Job**: run a task to completion. Retries on failure. Tracks success.
2. **CronJob**: schedule Jobs on a recurring basis (cron syntax).
3. **ConfigMap**: store non-sensitive config (key-value pairs, files); mount into Pods.
4. **Secret**: store sensitive data (passwords, tokens); similar API to ConfigMap but treated specially.

For most apps you'll mount ConfigMaps and Secrets as environment variables or files. Jobs and CronJobs cover the batch-processing patterns.

## The technical version

### Jobs

A Job runs Pods until a specified number complete successfully:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
      - name: migrate
        image: migrator:v1.0
        command: ["./migrate", "--up"]
  backoffLimit: 4
```

Key fields:

- **restartPolicy**: `OnFailure` retries failed containers; `Never` creates new Pods for retries.
- **backoffLimit**: how many times to retry before giving up (default 6).
- **completions**: how many Pods must complete successfully (default 1).
- **parallelism**: how many Pods can run concurrently (default 1).

For a one-shot task: defaults are fine. For parallel processing: set `completions` and `parallelism`.

### Job patterns

**One-shot**: single Pod runs once. Schema migration, one-time data backfill.

**Parallel with fixed count**: process N items in parallel. `completions: 100, parallelism: 10` runs up to 10 Pods at a time, until 100 have succeeded.

**Work queue**: each Pod pulls from a shared queue. `parallelism: 10, completions: 1` runs 10 Pods; once any finishes successfully, the rest can exit.

**Indexed Job**: each Pod gets an index (0, 1, 2, ...). Useful for partitioned work.

### CronJobs

Schedule Jobs on a cron-like schedule:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-report
spec:
  schedule: "0 2 * * *"             # 2 AM daily
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: report
            image: report-generator:v1.0
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
```

The CronJob controller creates a Job at each scheduled time. Each Job creates Pods.

Important fields:

- **schedule**: cron syntax (minute, hour, day-of-month, month, day-of-week).
- **concurrencyPolicy**: `Allow` (default), `Forbid` (skip if previous still running), `Replace` (cancel previous).
- **startingDeadlineSeconds**: how late after scheduled time it can still start.
- **History limits**: how many old Job records to keep.

### CronJob pitfalls

A few common issues:

- **Time zones**: cron runs in the cluster's time zone (usually UTC). Can be confusing.
- **Concurrency**: long-running Jobs may overlap if `concurrencyPolicy` isn't `Forbid`.
- **Missed schedules**: if the controller is down or the cluster is overloaded, Jobs may not fire on time.
- **History accumulation**: failed Job records can pile up; set `failedJobsHistoryLimit` appropriately.
- **No retry semantics for the schedule itself**: CronJob doesn't retry a missed window beyond `startingDeadlineSeconds`.

For mission-critical scheduled work, also have monitoring on Job success/failure.

### ConfigMaps

Store non-sensitive configuration:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: "info"
  FEATURE_FLAGS: "billing,new-ui"
  config.yaml: |
    server:
      port: 8080
      timeout: 30s
```

You can store key-value pairs (`LOG_LEVEL: info`) or whole file contents (`config.yaml: ...`).

Consume from a Pod:

**As environment variables**:

```yaml
spec:
  containers:
  - name: app
    image: myapp
    envFrom:
    - configMapRef:
        name: app-config
```

This sets `LOG_LEVEL` and `FEATURE_FLAGS` as env vars. (The `config.yaml` value would also become an env var, which is rarely what you want for file contents.)

**As mounted files**:

```yaml
spec:
  containers:
  - name: app
    volumeMounts:
    - name: config-volume
      mountPath: /etc/app
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

This creates `/etc/app/LOG_LEVEL`, `/etc/app/FEATURE_FLAGS`, and `/etc/app/config.yaml` as files inside the container. The app reads them like normal files.

### ConfigMap considerations

- **Size limit**: 1 MB. For larger config, use volumes or external systems.
- **Updates don't reload automatically**: a Pod reading from a mounted ConfigMap sees the updated content (after a delay), but the application has to re-read it. ConfigMaps as env vars don't update at all without restart.
- **Immutability**: set `immutable: true` to prevent updates and improve performance for unchanging configs.
- **Versioning**: best practice is to roll new ConfigMaps with new names (`config-v2`) and update Deployments to reference them; triggers a rolling restart.

### Secrets

Same structure as ConfigMap but for sensitive data:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  username: cG9zdGdyZXM=               # base64-encoded
  password: c3VwZXJzZWNyZXQ=
```

Or `stringData` for non-base64-encoded values (Kubernetes encodes when storing):

```yaml
stringData:
  username: postgres
  password: supersecret
```

Consume the same ways as ConfigMaps — env vars or files.

### Secret realities

A few things to be honest about:

**Base64 is encoding, not encryption**: anyone with cluster read access can decode it. Secrets are not magic.

**Encrypted at rest in etcd**: but only if you've enabled etcd encryption-at-rest (often done by managed services).

**Visible to anyone with API access**: RBAC controls who can read Secrets — be careful with cluster-admin grants.

**Mounted as tmpfs by default**: not written to disk on the Node.

For true secret management, use external systems and only reference them from K8s:

- **External Secrets Operator**: syncs from AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, etc., into K8s Secrets.
- **AWS IRSA + Secrets Manager**: pods assume IAM roles and fetch secrets directly.
- **Vault Injector**: HashiCorp Vault sidecar injects secrets at startup.

K8s Secrets work as the runtime delivery mechanism, but the source of truth is external. This makes rotation, audit, and access control much better.

### Secret types

Beyond `Opaque` (generic), Kubernetes has typed Secrets:

- **`kubernetes.io/dockerconfigjson`**: for pulling images from private registries.
- **`kubernetes.io/tls`**: for TLS certificates (pair of cert + key).
- **`kubernetes.io/service-account-token`**: auto-created for ServiceAccounts.
- **`kubernetes.io/basic-auth`**, **`kubernetes.io/ssh-auth`**: less common.

The type is mostly informational; clients can interpret typed Secrets specially (cert-manager creates `kubernetes.io/tls` Secrets, etc.).

### Common config/secret patterns

A few patterns that show up repeatedly:

**Static config + secret env vars**:

```yaml
spec:
  containers:
  - name: app
    envFrom:
    - configMapRef:
        name: app-config
    - secretRef:
        name: app-secrets
```

App reads everything from env vars. Simple and common.

**Mounted config + secret files**:

```yaml
spec:
  containers:
  - name: app
    volumeMounts:
    - name: config
      mountPath: /etc/config
    - name: secrets
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: config
    configMap:
      name: app-config
  - name: secrets
    secret:
      secretName: app-secrets
```

App reads files. Good for complex config (YAML, JSON) and for secrets that benefit from file-system access patterns.

**External Secrets Operator**:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
  target:
    name: db-credentials
  data:
  - secretKey: password
    remoteRef:
      key: prod/db
      property: password
```

This declares "create a Secret called db-credentials, sourced from AWS Secrets Manager." The operator handles refresh. Application code just reads from the K8s Secret as usual.

### IRSA (AWS-specific)

On EKS, IAM Roles for Service Accounts (IRSA) lets Pods assume IAM roles directly:

1. Create an IAM role with desired permissions.
2. Annotate a Kubernetes ServiceAccount with the role ARN.
3. Pods using that ServiceAccount get temporary credentials via the IMDS mock.

For Pods that need to call AWS APIs (read from S3, write to DynamoDB), IRSA is the right pattern. No long-lived AWS credentials in the cluster.

GKE and AKS have equivalents (Workload Identity).

### Realistic secret management

For production:

1. **Secrets live in an external system** (AWS Secrets Manager, Vault, etc.).
2. **External Secrets Operator** syncs to K8s Secrets.
3. **Pods consume K8s Secrets** via env vars or files.
4. **Rotation** happens in the external system; ESO picks up changes.
5. **Access logs** in the external system; cluster RBAC for K8s Secrets.

This is more complex than putting secrets in YAML files in git — but it's the right pattern for any production environment.

### Don't put secrets in YAML committed to git

A common bad pattern: secret values in committed YAML files. Even base64-encoded. Even in private repos. The risk:

- Repo gets cloned to laptops, leaked accidentally.
- History keeps secrets even after they're "removed."
- Anyone with repo access (often more people than intend) has all secrets.

Better: secrets in external systems; YAML files reference them.

For convenience during early development, tools like SOPS (Mozilla's encrypted YAML) can store encrypted secrets in git. For production, prefer external secret stores.

### When to use ConfigMap vs Secret

The difference is mostly intent:

- **ConfigMap**: non-sensitive. Visible in plain text. OK to commit to git (often).
- **Secret**: sensitive. Treated more carefully. Don't commit values to git.

In practice they have nearly identical APIs. Use Secret for anything that could harm if leaked; ConfigMap for everything else.

### Reloading configuration

Most apps don't auto-reload when ConfigMaps/Secrets change. Workarounds:

- **Restart Pods** (manually or by changing a Deployment annotation to trigger rolling update).
- **Versioned ConfigMap names** (`config-v3`) so updates require Deployment changes.
- **Watch in app**: code that watches files / K8s API and reloads on change. Some apps support this.
- **Reloader controller**: open-source tool that watches ConfigMaps/Secrets and restarts referencing Deployments.

For most workloads, restart on config change is acceptable. For latency-critical or stateful apps, hot reload is worth implementing.

## Three real-world scenarios

**Scenario 1: A nightly report CronJob.**
CronJob runs every night at 2 AM UTC. Generates reports, emails to stakeholders. Uses ConfigMap for report templates and Secret (via External Secrets Operator pulling from AWS Secrets Manager) for SMTP credentials. Failure alerts via monitoring on Job status. Clean separation of concerns.

**Scenario 2: A database migration as a Job.**
Before deploying a new version of the app, a Job runs `db-migrate up`. Deployment can wait for Job success before proceeding (via Helm hook or Argo CD sync wave). Idempotent migrations; backoffLimit covers transient failures.

**Scenario 3: Secret leak from misconfigured RBAC.**
A new role accidentally granted secret read across the namespace. A compromised dev account read all secrets including production credentials. Recovery: rotate every leaked secret, audit access logs, tighten RBAC. Lesson: K8s Secrets are accessible to whoever RBAC allows; treat the access list seriously.

## Common mistakes to avoid

- **Secrets in git** (even base64-encoded).
- **No external secret store** for production.
- **CronJobs without monitoring** for failed runs.
- **Long-running Jobs without timeout** that hang forever.
- **ConfigMap as env var** that won't reload on update.
- **Permissive RBAC** on Secrets.

## Read more

- Kubernetes docs: "Jobs," "CronJobs," "ConfigMaps," "Secrets."
- External Secrets Operator documentation.
- HashiCorp Vault Agent Injector.
- *Kubernetes Patterns* — config and secret patterns.

## Summary

- **Job**: run to completion; retries on failure.
- **CronJob**: scheduled Jobs.
- **ConfigMap**: non-sensitive config; as env vars or files.
- **Secret**: sensitive data; same API as ConfigMap; treat carefully.
- **K8s Secrets are not encrypted at rest by default** — base64 is encoding only.
- **Production**: external secret store + External Secrets Operator.
- **No secrets in git**.
- **IRSA** (EKS) for Pod-to-AWS auth without static credentials.
- **Apps usually don't reload on config change**; restart or use reloader pattern.

That wraps Module 2. Next: networking.
