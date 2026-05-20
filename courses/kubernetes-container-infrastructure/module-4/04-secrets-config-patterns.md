---
module: 4
position: 4
title: "Secrets and configuration patterns"
objective: "Inject credentials and config safely."
estimated_minutes: 7
---

# Secrets and configuration patterns

## The puzzle

Every workload needs configuration. Some of it is sensitive (passwords, API keys, certs); some isn't (feature flags, endpoints, log levels). Where to store it, how to inject it into Pods, how to rotate it — these decisions accumulate into security posture or technical debt depending on choices.

## The simple version

A baseline pattern:

1. **External secret store** holds the real secrets (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager).
2. **External Secrets Operator (ESO)** syncs them into Kubernetes Secrets.
3. **Pods consume K8s Secrets** as env vars or mounted files.
4. **ConfigMaps** for non-sensitive config (same delivery patterns).
5. **Rotation** in the external system; ESO picks up changes; Pods restart on change (or hot reload if the app supports it).

Don't commit secrets to git. Don't bake them into images. Don't pass them on the command line. Use the external-store + ESO pattern.

## The technical version

### Why external secret stores

Pure K8s Secrets work but have limitations:

- Base64 is encoding, not encryption (anyone with cluster Secret read access decodes them).
- Etcd encryption-at-rest is optional and only protects against disk theft.
- No native rotation.
- No native audit (beyond CloudTrail-style at the API level).
- Hard to centralize across multiple clusters / accounts.

External stores (AWS Secrets Manager, Vault) provide:

- **Real encryption** with KMS or HSM.
- **Native rotation** (especially for RDS credentials).
- **Audit logs** of every read.
- **Cross-environment access** with proper IAM.
- **Versioning** with point-in-time access.

The pattern: secrets live in the external store as source of truth; K8s Secrets are the runtime delivery mechanism.

### External Secrets Operator (ESO)

ESO is a popular open-source tool. Setup:

1. Install ESO via Helm.
2. Configure a `SecretStore` or `ClusterSecretStore` pointing at your external store (with credentials via IRSA on EKS).
3. Create `ExternalSecret` resources declaring what to pull.

Example:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: db-credentials
  data:
  - secretKey: username
    remoteRef:
      key: prod/db
      property: username
  - secretKey: password
    remoteRef:
      key: prod/db
      property: password
```

ESO fetches from AWS Secrets Manager, writes a K8s Secret `db-credentials` with the values. Pods consume that K8s Secret normally. ESO refreshes every hour (configurable); rotation in the external store propagates automatically.

### Consuming Secrets

Two patterns:

**Environment variables**:

```yaml
spec:
  containers:
  - name: app
    envFrom:
    - secretRef:
        name: db-credentials
```

Pod's env vars include `username` and `password` from the Secret. Simple. Won't update without Pod restart.

**Mounted files**:

```yaml
spec:
  containers:
  - name: app
    volumeMounts:
    - name: secrets
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: secrets
    secret:
      secretName: db-credentials
```

Creates `/etc/secrets/username` and `/etc/secrets/password` files. The kubelet updates these (with a delay) when the Secret changes — the application can re-read them.

For most apps, env vars are simpler. For rotation without restarts, mounted files + app-level reload.

### ConfigMaps for non-sensitive config

Same delivery patterns (env vars or mounted files), no sensitivity concerns:

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

Commit ConfigMaps to git freely. Treat them as code: PR review, version control, environment-specific values via overlays or templates.

### Helm and Kustomize for environment overlays

Most teams use templating to manage environment-specific config:

- **Helm**: templated YAML with values files per environment.
- **Kustomize**: base + overlays, no templating language.

Example: same Deployment template; different `values.yaml` for dev/staging/prod with different image tags, replica counts, env vars.

Combined with external secrets, you get: code in git for everything reproducible, secrets in external store for everything sensitive, environment overlays for variation.

### IRSA (recap)

On EKS, ServiceAccounts can map to IAM roles via IRSA. Pods using that SA get temporary AWS credentials. No long-lived AWS keys; permissions via IAM role.

Use IRSA for any K8s workload calling AWS APIs — including ESO (so it can read from Secrets Manager). The pattern: ESO's ServiceAccount has IAM role with `secretsmanager:GetSecretValue` for specific secrets.

### Reloading on change

A common issue: ConfigMap or Secret updates, but the Pod doesn't pick up new values.

Patterns:

- **Restart Pods** (manually `kubectl rollout restart` or change a Deployment annotation to force rolling update).
- **Versioned ConfigMap names** (`config-v3`) so any update requires updating Deployment, which triggers rolling update automatically.
- **App-level file watching**: code that watches `/etc/secrets` and reloads on change. Many configs frameworks support this.
- **Reloader controller**: open-source tool that watches Secrets/ConfigMaps and restarts referencing Deployments.

For most workloads, restart on config change is acceptable. For rotation-critical secrets (database passwords with short rotation), app-level reload matters.

### Common config patterns

**12-factor app**:
- Config via environment variables.
- Secrets via env vars or mounted files.
- No config in source code.
- Same image for all environments; behavior varies by config.

**Sidecar injectors**:
- Vault Agent Injector: sidecar fetches secrets from Vault, writes to shared volume, app reads.
- AWS Secrets Manager CSI driver: similar pattern.

**Init container preload**:
- Init container fetches secrets, writes to shared volume.
- Main container reads at startup.

For most teams, ESO + env vars or mounted files is the simplest production-ready pattern.

### Secrets in git via SOPS

For some teams that want git-tracked secrets (with care), Mozilla SOPS encrypts YAML with KMS:

- Commit encrypted YAML to git.
- ArgoCD / Flux decrypts at apply time via KMS.
- Audit trail via git + KMS access logs.

Better than plaintext-in-git; less mature than external secret stores. Useful for some hybrid workflows.

### What to avoid

- **Secrets in git** (plain or base64 — both leak in repo history).
- **Secrets in container images** (visible in image layers).
- **Secrets in env vars set at build time** (visible in CI logs).
- **Hardcoded credentials anywhere**.
- **Sharing secrets across environments** (dev shares prod creds).
- **No rotation policy**.

### Real-world setup

For a mature production cluster:

1. **AWS Secrets Manager / HashiCorp Vault** holds all secrets.
2. **ESO with IRSA** syncs to K8s Secrets per namespace.
3. **ConfigMaps in git** via Helm or Kustomize for non-sensitive config.
4. **Apps consume K8s resources** via env vars or mounted files.
5. **Rotation** in external store (automated for RDS via Secrets Manager; manual or scheduled for others).
6. **Audit logs** in external store for access tracking.
7. **RBAC restricts** who can read K8s Secrets (cluster-admin and the specific app's SA only).

Setup is one-time investment; benefits are permanent.

## Three real-world scenarios

**Scenario 1: A leaked secret rotation.**
A developer's laptop was compromised. K8s kubeconfig was on it; attacker could list Secrets. Investigation: only specific Secrets were exposed (RBAC scoped). Rotate the exposed Secrets in the external store; ESO syncs new values; restart affected Pods. Damage limited because access was scoped and rotation is automated.

**Scenario 2: A Secret in git.**
Audit revealed: someone committed a database password to a private repo a year ago, then removed it. Git history still has it. Anyone with repo access (current and former) has the credential. Rotate immediately. Migrate to ESO. Use git-secrets / GitHub secret scanning. Train the team. The "remove from git" doesn't actually remove from history; rotation is the only fix.

**Scenario 3: Config not reloading.**
Updated a ConfigMap; expected behavior to change. It didn't. Investigation: ConfigMap was mounted as env vars (set at Pod start; doesn't update). Fix options: mount as file + app reload, or use Reloader to restart Deployments on ConfigMap change, or rename ConfigMap to force Deployment update. Each works; pick based on app reload capability and operational preference.

## Common mistakes to avoid

- **Secrets in git** (always wrong, even encoded).
- **Hardcoded credentials** anywhere.
- **No external secret store** for production.
- **No rotation policy** for long-lived secrets.
- **Permissive RBAC** on K8s Secrets.
- **ConfigMap as env var** expected to update.

## Read more

- External Secrets Operator documentation.
- HashiCorp Vault Agent Injector.
- AWS Secrets Manager CSI driver.
- Mozilla SOPS for encrypted-in-git workflow.

## Summary

- **External secret store as source of truth** (AWS Secrets Manager, Vault).
- **ESO syncs to K8s Secrets** automatically.
- **Pods consume K8s Secrets** via env vars or mounted files.
- **ConfigMaps in git** for non-sensitive config; Helm/Kustomize for overlays.
- **No secrets in git, images, or command lines**.
- **IRSA on EKS** for AWS access from Pods.
- **Rotation in external store** propagates via ESO.
- **Apps need restart or reload** for env-var config changes.

That wraps Module 4. Next: operations — running Kubernetes for real.
