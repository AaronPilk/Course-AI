---
module: 4
position: 2
title: "RBAC and ServiceAccounts"
objective: "Control who can do what in the cluster."
estimated_minutes: 7
---

# RBAC and ServiceAccounts

## The puzzle

Kubernetes' API lets you do a lot — create Pods, read Secrets, drain Nodes, delete Deployments. Without access control, anyone with cluster access can do anything. RBAC (Role-Based Access Control) is how you constrain who can do what. ServiceAccounts give Pods their own identity for talking to the K8s API. Used together, they implement least privilege.

## The simple version

Four RBAC primitives:

1. **Role / ClusterRole**: a set of permissions. Role is namespace-scoped; ClusterRole is cluster-wide.
2. **RoleBinding / ClusterRoleBinding**: grants a Role to specific users, groups, or ServiceAccounts.

Plus:

3. **ServiceAccount**: identity for Pods (and other automation).

Pattern: define what permissions are needed (Role); bind them to who needs them (RoleBinding); Pods authenticate as ServiceAccounts; humans authenticate via the cluster's identity provider (Identity Center, Okta, IAM).

## The technical version

### A simple Role

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
```

This Role allows reading Pods in the `production` namespace. Nothing else.

A RoleBinding grants it:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: production
subjects:
- kind: User
  name: alice@example.com
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

Now `alice@example.com` can read Pods in `production`. Nothing more.

### ClusterRole vs Role

- **Role + RoleBinding**: namespace-scoped permission.
- **ClusterRole + ClusterRoleBinding**: cluster-wide permission.
- **ClusterRole + RoleBinding**: ClusterRole's permissions, scoped to a single namespace (useful for built-in roles like `view` or `edit`).

Built-in ClusterRoles: `cluster-admin`, `admin`, `edit`, `view`. Use these where they fit before writing custom roles.

### ServiceAccounts

A ServiceAccount is the identity Pods use to call the K8s API:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app
  namespace: production
```

Reference it in a Pod (or Deployment):

```yaml
spec:
  serviceAccountName: my-app
  containers:
  - name: app
    image: myapp
```

The Pod gets a token mounted at `/var/run/secrets/kubernetes.io/serviceaccount/token`. K8s client libraries automatically use this token for API calls.

Bind the ServiceAccount to a Role for actual permissions:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: my-app-can-read-configmaps
  namespace: production
subjects:
- kind: ServiceAccount
  name: my-app
  namespace: production
roleRef:
  kind: Role
  name: configmap-reader
  apiGroup: rbac.authorization.k8s.io
```

### Default ServiceAccounts

Every namespace has a `default` ServiceAccount. Pods that don't specify one get this. By default, it has no permissions (in modern K8s — older versions gave it too much).

For production: always specify ServiceAccount explicitly. Disable token mounting if the Pod doesn't talk to the K8s API.

```yaml
spec:
  serviceAccountName: my-app
  automountServiceAccountToken: false  # if Pod doesn't need API access
```

### IRSA — IAM Roles for Service Accounts (AWS)

On EKS, ServiceAccounts can map to AWS IAM roles via IRSA:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/my-app-role
```

Pods using this ServiceAccount get temporary AWS credentials via the SDK's automatic chain. No long-lived AWS keys; permissions controlled via the IAM role.

This is the recommended pattern for any AWS API access from K8s Pods on EKS. GKE has Workload Identity; AKS has its equivalent.

### Common RBAC patterns

**Read-only auditor**: `view` ClusterRole bound to security team. Can see everything; modify nothing.

**Team scoped to namespace**: custom Role binding granting their team `edit` ClusterRole in their namespace only.

**CI/CD service account**: ServiceAccount with Role allowing deployment-related verbs (create/update Deployments, Services, ConfigMaps, etc.) in specific namespaces.

**Pod-to-API access**: ServiceAccount with minimal Role for the specific API operations the Pod needs (often just read its own ConfigMaps and Secrets).

### Principle of least privilege

The same discipline as IAM (Module 3 of the AWS course):

- Grant only the permissions actually needed.
- Use specific verbs (`get`, `list`, not `*`).
- Use specific resources (`pods`, not `*`).
- Scope to namespaces where possible.
- Review and tighten regularly.

Initial Roles tend to be too broad because broad permissions make code work without thinking. The discipline of tightening is what separates secure clusters from sprawling permission disasters.

### Aggregated ClusterRoles

For extensibility, ClusterRoles can be aggregated:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: monitoring-edit
  labels:
    rbac.authorization.k8s.io/aggregate-to-edit: "true"
rules:
- apiGroups: ["monitoring.coreos.com"]
  resources: ["servicemonitors"]
  verbs: ["*"]
```

This aggregates into the built-in `edit` ClusterRole. Tools that install CRDs can extend default roles without modifying them directly.

### Auditing RBAC

Tools:

- **`kubectl auth can-i`**: check what a user/service account can do.
- **rbac-lookup**: open-source tool for understanding effective permissions.
- **Audit logs**: K8s API server can log every authorization decision.

`kubectl auth can-i list pods --as system:serviceaccount:production:my-app` — does this ServiceAccount have permission to list pods?

For production clusters, periodic RBAC audits catch permission drift. New tools and operators often request broader permissions than needed; review what they ask for.

### Common RBAC mistakes

A few patterns to avoid:

- **cluster-admin everywhere** — too broad; treat as emergency-only.
- **Default ServiceAccount used for everything** — no specific identity.
- **Wildcard verbs / resources** — over-permissive.
- **Permissions accumulating without review** — drift over time.
- **No IRSA on EKS** — long-lived AWS keys in containers.

### Real-world deployment pattern

For a production cluster:

1. **Identity provider integration**: humans authenticate via Identity Center / Okta / etc.
2. **Group-based RBAC**: groups in IdP mapped to ClusterRoles in K8s.
3. **Per-team namespaces**: each team has their own namespace; team's group has `edit` in their namespace.
4. **ServiceAccounts per workload**: every Deployment uses a specific ServiceAccount with minimal permissions.
5. **IRSA for AWS access**: ServiceAccounts mapped to IAM roles for cloud API access.
6. **Audit logs enabled**: every API call logged.

This setup takes time to build but produces a cluster where access is constrained, auditable, and consistent.

### When RBAC isn't enough

For some scenarios, RBAC is insufficient:

- **Cross-cluster permissions**: each cluster has its own RBAC.
- **Multi-tenant SaaS isolation**: namespaces alone aren't strong isolation; consider clusters or virtual clusters.
- **Data-level access control**: RBAC controls API operations, not row-level access in databases.

For these, additional tools (OPA/Gatekeeper for policies, service meshes for L7 auth, application-level controls) layer on top.

## Three real-world scenarios

**Scenario 1: An operator installs requesting cluster-admin.**
A new operator's installation YAML grants cluster-admin to its ServiceAccount. Concerning. Investigation: it needs specific permissions, not everything. Adjust to a custom ClusterRole with just what's needed. Trust-but-verify when installing operators.

**Scenario 2: A leaked ServiceAccount token.**
A token accidentally exposed in logs. Attacker uses it to query K8s API. Damage limited because the ServiceAccount had only `get pods` in one namespace — no Secret access, no privileged operations. Rotate the token, audit access logs, apply lesson. The principle of least privilege contained the blast radius.

**Scenario 3: Adopting IRSA on EKS.**
Old setup: AWS access keys stored as K8s Secrets, mounted into Pods. Migrated to IRSA: each ServiceAccount mapped to an IAM role; Pods get temporary credentials automatically. No long-lived keys in the cluster. Better security, less rotation overhead, cleaner audit (CloudTrail records the role each Pod assumed).

## Common mistakes to avoid

- **cluster-admin used routinely** — should be break-glass only.
- **Default SA for all workloads** — no per-workload identity.
- **Wildcard RBAC** — over-permissive.
- **No IRSA on EKS** — long-lived AWS keys.
- **No audit logs** — can't see who did what.
- **No periodic RBAC review** — permissions accumulate.

## Read more

- Kubernetes docs: "Using RBAC Authorization."
- AWS IRSA documentation.
- "Kubernetes Security" by Liz Rice and Michael Hausenblas.

## Summary

- **RBAC primitives**: Role, ClusterRole, RoleBinding, ClusterRoleBinding.
- **ServiceAccount** is Pod identity for API calls.
- **IRSA on EKS** maps ServiceAccount to IAM role for AWS access.
- **Built-in ClusterRoles**: cluster-admin, admin, edit, view.
- **Least privilege** is the discipline; specific verbs, specific resources.
- **`kubectl auth can-i`** for checking permissions.
- **Periodic audits** catch permission drift.

Next: security contexts and Pod Security Standards.
