---
module: 4
position: 3
title: "Security contexts and Pod Security Standards"
objective: "Limit what containers can do."
estimated_minutes: 7
---

# Security contexts and Pod Security Standards

## The puzzle

Containers isolate processes from the host kernel, but the isolation is thinner than VMs. A container running as root can do a lot more damage if compromised than one running as an unprivileged user. Pod Security Standards (PSS) plus security contexts let you constrain what containers can do — and Kubernetes can enforce these constraints cluster-wide.

## The simple version

Two layers of defense:

1. **Security Context**: per-container settings — run as non-root, drop capabilities, read-only filesystem, no privilege escalation. Set in the Pod spec.
2. **Pod Security Standards (PSS)**: cluster-level policies that enforce baseline security. Three levels: Privileged (no restrictions), Baseline (basic safety), Restricted (most secure).

Best practice: enforce Restricted at the namespace level for production workloads. Containers must run as non-root, drop most capabilities, no host networking, no privileged mode, etc.

## The technical version

### Security context example

```yaml
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 10000
    runAsGroup: 10000
    fsGroup: 10000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: myapp
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]
      runAsNonRoot: true
```

Key settings:

- **runAsNonRoot**: container must not run as UID 0.
- **runAsUser/Group**: explicit non-root UID/GID.
- **allowPrivilegeEscalation: false**: no `sudo`-like operations.
- **readOnlyRootFilesystem: true**: write only to mounted volumes.
- **capabilities.drop: ["ALL"]**: drop all Linux capabilities (add back specific ones if needed).
- **seccompProfile**: restrict syscalls.

Containers running with these restrictions are dramatically harder to break out of.

### Pod Security Standards

Three levels:

**Privileged**: no restrictions. For specific system workloads (CNI plugins, storage drivers) that legitimately need privileged access.

**Baseline**: prevents known privilege escalations. Allows most reasonable container configurations.

**Restricted**: most strict. Requires non-root, dropped capabilities, read-only root filesystem, etc.

Apply at the namespace level:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

`enforce`: blocks non-compliant Pods.
`audit`: logs violations.
`warn`: warns at create time.

For new clusters, start with `restricted` in production namespaces. Make exceptions only for system namespaces with documented justification.

### Common image security practices

Beyond Pod-level controls:

**Use minimal base images**: distroless, Alpine, scratch. Less to attack.

**Run as non-root in the Dockerfile**:
```dockerfile
RUN adduser -D appuser
USER appuser
```

**Scan images for vulnerabilities**: Trivy, Snyk, ECR scanning, Docker Scout. Block deployment of images with high-severity vulns.

**Sign images**: Cosign, Notary. Verify signatures before deployment via admission controller.

**Pin image versions**: never `:latest`. Use immutable tags (`v1.2.3` or digest).

These complement Pod Security Standards — defense in depth.

### Admission controllers

Beyond PSS, admission controllers enforce custom policies:

- **OPA Gatekeeper**: write policies in Rego. Block resources that violate.
- **Kyverno**: K8s-native policy engine; YAML policies.
- **Validating webhooks**: custom code that validates resources at creation.

Common policies:

- "All Pods must have resource limits."
- "All Deployments must have a specific label."
- "Container images must come from approved registries."
- "No `hostPath` volumes allowed."

For production clusters with security and compliance needs, an admission controller is standard infrastructure.

### Runtime security

Static policies prevent bad configurations; runtime security catches what gets through:

- **Falco**: open-source runtime security; detects anomalous behavior (unexpected syscalls, file access, network connections).
- **Cilium Tetragon**: eBPF-based runtime visibility.
- **Commercial tools**: Aqua, Sysdig, Twistlock.

For production: a runtime security tool catches issues that admission controllers miss (zero-day exploits, post-compromise behavior).

### Network security recap

From Module 3 — defense in depth includes:

- NetworkPolicies for Pod-to-Pod restrictions.
- Egress filtering to prevent data exfiltration.
- Service mesh for mTLS between services.
- WAF / DDoS protection at the edge.

Combined with Pod Security + RBAC + image security, you get a defensible cluster.

### Common security mistakes

- **Running as root**: container escape = host compromise.
- **Privileged containers**: full host access; very dangerous.
- **hostPath volumes**: container reads/writes host filesystem.
- **No image scanning**: deploy known-vulnerable code.
- **`:latest` image tags**: unpredictable behavior.
- **No PSS enforcement**: anyone can deploy anything.
- **No admission controller**: no policy gates.

### Real-world security baseline

For a production cluster:

1. **Pod Security Standards: restricted** at namespace level.
2. **Security contexts** in all Deployments (non-root, drop capabilities, read-only FS).
3. **Image scanning** integrated into CI/CD.
4. **Signed images** with admission controller verification.
5. **NetworkPolicies** with default-deny.
6. **Runtime security tool** (Falco or commercial).
7. **Audit logs** of K8s API.
8. **Regular security audits** of RBAC and policies.

This is real work, but it's the modern security posture for K8s.

## Three real-world scenarios

**Scenario 1: A compromised container running as root.**
A vulnerability lets an attacker execute code inside a container. The container runs as root with default capabilities. The attacker can write to the container filesystem, install tools, attempt container escape. With non-root + dropped capabilities + read-only FS, the attacker can do far less. The same vulnerability has dramatically smaller blast radius.

**Scenario 2: A Pod fails to start under restricted PSS.**
Migration to restricted PSS reveals: an old application image runs as root. Without changes, Pod creation is blocked. Fix options: update the image to run as non-root, or grant an exception via a label for that specific namespace, or use a separate namespace with baseline (not restricted) PSS. The forced reckoning surfaces images that were silently doing risky things.

**Scenario 3: A vulnerability scan finding.**
Trivy in CI flags a critical CVE in a base image. The pipeline blocks deployment. Team updates the base image, rebuilds, redeploys. Found before reaching production. Without scanning, the vulnerability would have shipped silently.

## Common mistakes to avoid

- **No PSS enforcement** — relying on developer discipline.
- **Containers as root** — large blast radius on compromise.
- **No image scanning** in CI/CD.
- **`:latest` tags** in production.
- **No admission controller** for custom policies.
- **No runtime security** — only static controls.

## Read more

- Kubernetes docs: "Pod Security Standards."
- OPA Gatekeeper, Kyverno documentation.
- Falco documentation.
- *Kubernetes Security* by Liz Rice and Michael Hausenblas.

## Summary

- **Security contexts** restrict per-container what's allowed.
- **Pod Security Standards (PSS)**: cluster-level enforcement at namespace level.
- **Restricted PSS** is the target for production.
- **Run as non-root** in container images.
- **Drop capabilities, read-only FS, no privilege escalation**.
- **Image scanning** integrated into CI/CD.
- **Admission controllers** (Gatekeeper, Kyverno) for custom policies.
- **Runtime security** (Falco) catches what static policies miss.

Next: secrets and configuration patterns.
