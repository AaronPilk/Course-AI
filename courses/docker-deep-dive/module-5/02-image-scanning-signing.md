---
module: 5
position: 2
title: "Image scanning and signing"
objective: "Verify images are clean and authentic."
estimated_minutes: 6
---

# Image scanning and signing

## The simple version

Two complementary production practices:

- **Scanning**: check images for known vulnerabilities (CVEs) in OS packages and dependencies. Block bad images before deploy.
- **Signing**: cryptographically sign images so consumers can verify they came from a trusted source and weren't tampered with.

Tools: Trivy / Grype / Snyk / Docker Scout for scanning; Cosign / Notary for signing. Most registries integrate scanning natively (ECR, GHCR, Docker Hub).

## The technical version

### Vulnerability scanning

Scanners read the image's package manifest (Alpine apk, Debian dpkg, language manifests like package.json) and cross-reference against CVE databases.

Output: list of vulnerabilities with severity (Critical/High/Medium/Low), affected packages, fixed versions.

Common tools:

- **Trivy** (open source, fast): `trivy image myapp:latest`
- **Grype**: similar, slightly different DB.
- **Snyk**: commercial, broader (includes IaC, code).
- **Docker Scout**: Docker's built-in.
- **ECR / GCR / GHCR**: cloud registry scanners.

### Where to scan

Multiple points:

- **During build / CI**: fail the build on Critical CVEs. Catch before push.
- **In the registry**: continuous scanning of pushed images.
- **At deploy time**: admission control checks (e.g., Kubernetes admission policies).
- **At runtime**: continuous monitoring; alert on new CVEs against deployed images.

CI scanning is the highest-leverage point. The build pipeline fails fast; nothing reaches production.

### Policies

Tune severity thresholds:

- Fail on Critical only (lenient) or Critical+High (stricter).
- Ignore vulnerabilities without fixes available (`--ignore-unfixed`).
- Allowlist specific CVEs you've assessed and accepted.

Over-strict policies become alert fatigue; over-lenient ones miss real issues. Calibrate per team.

### Image signing

Cosign (from Sigstore) is the modern standard:

```
cosign sign --key cosign.key registry.example.com/myapp:v1.0
cosign verify --key cosign.pub registry.example.com/myapp:v1.0
```

Image manifests are signed; the signature is stored as a separate OCI artifact in the registry.

Kubernetes admission controllers (cosigned, Kyverno, OPA Gatekeeper) verify signatures before allowing Pods. Only signed images from approved keys can deploy.

### SBOM (Software Bill of Materials)

Generate a manifest of everything in an image:

```
trivy image --format cyclonedx myapp:v1.0
syft myapp:v1.0
```

CycloneDX / SPDX formats. Useful for:

- Tracking dependencies for compliance (e.g., OSS license audits).
- Responding to new CVEs ("are we affected?").
- Supply chain transparency.

Many CI pipelines now generate and attach SBOMs to images as OCI artifacts.

### Supply chain attacks

Real risks:

- **Malicious packages**: typosquatting in package managers (npm, PyPI).
- **Compromised base images**: a hacked official image affects everyone using it.
- **Compromised registry credentials**: attacker pushes a malicious image with a legitimate tag.
- **Build pipeline compromise**: malicious code injected during build.

Defenses:

- Scan in CI.
- Sign images; verify on deploy.
- Pin base images by digest.
- Use trusted base images (official, distroless, internally vetted).
- SBOMs for traceability.
- Restrict who can push to production registries.

SLSA (Supply-chain Levels for Software Artifacts) defines compliance levels. Many organizations aim for SLSA 3+ for production code.

### Vulnerability management workflow

When a new CVE appears in a base image:

1. Scanners flag deployed images.
2. Triage: is this exploitable in our context? Severity vs. application impact.
3. Update base image, rebuild affected images.
4. Redeploy.

Tools like Dependabot/Renovate auto-PR base image updates. Periodic rebuilds (weekly cron) refresh against the latest patches.

### Vulnerability vs exploitability

Not every CVE is exploitable in your context. A vulnerability in libfoo only matters if your app actually calls the affected code path. Many CVEs are theoretical without your specific configuration.

Tools that consider reachability (Snyk Reachability, others) reduce noise. But for high-severity CVEs, treat as critical until proven otherwise.

### Limits of scanning

Scanners only catch known vulnerabilities. Zero-day exploits, misconfigurations, business-logic bugs — none are surfaced by image scanning. Runtime security (Falco, etc.) complements scanning.

Pre-deploy scanning is necessary but not sufficient for production security.

## Summary

- Scan images for CVEs in CI; fail builds on critical findings.
- Sign with Cosign; verify at deploy via admission controller.
- Generate SBOMs for traceability.
- Update base images regularly; rebuild on CVE notification.
- Scanning catches known issues only — pair with runtime security.
