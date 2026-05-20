---
module: 3
position: 4
title: "Supply chain risks: dependencies and CI/CD"
objective: "Trust your dependencies — but verify."
estimated_minutes: 6
---

# Supply chain risks: dependencies and CI/CD

## The new front

Modern apps depend on hundreds of libraries from strangers. Each is code you run as your own. If any is compromised — by a malicious package, a typosquat, a hijacked maintainer account, an upstream attack — so is your app.

Major events: SolarWinds (2020), Codecov (2021), Log4Shell (2021), the xz-utils backdoor (2024). Supply chain is now one of the most active threat categories.

## Common attack patterns

**Typosquatting.** Attacker publishes `reqests` (typo of `requests`); developers occasionally typo and install the malicious one.

**Dependency confusion.** If your private package name accidentally matches a public one, the package manager may install the public (attacker's) version.

**Compromised maintainer.** Attacker takes over a maintainer's account (phishing, stolen credentials) and publishes a malicious version.

**Malicious updates.** A maintainer (or attacker who became one) intentionally publishes a backdoored version.

**Build system compromise.** Attacker injects into the CI build, infecting all builds without changing source code.

**Hardware / firmware.** Compromise at the chip / firmware level (rare but profound).

## Defenses — at install time

**Lock files.** `package-lock.json`, `Pipfile.lock`, `Cargo.lock`. Pin exact versions and hashes. Re-running install gets the same bits; can't be silently swapped.

**npm / pip with hashes:**

```
# requirements.txt
requests==2.31.0 \
    --hash=sha256:abc123...
```

If the published version is replaced, the hash mismatch errors.

**Allow only known-good registries.** Configure npm/pip to use a private registry that mirrors approved packages.

**Scan for known vulnerabilities:**

```
$ npm audit
$ pip-audit
$ cargo audit
$ snyk test
$ trivy fs .
```

Reports CVEs in your dependency tree. Snyk, Dependabot, Renovate automate the patches.

## Defenses — at build time

**Reproducible builds.** Building from source X always produces binary Y. Lets you verify a release against your own build.

**Signed packages / commits.** Verify the publisher cryptographically:

```
$ npm verify-signatures
$ git verify-commit HEAD
```

**Sigstore / Cosign.** Modern open standard for signing software artifacts. Many major projects use it.

**SBOM (Software Bill of Materials).** Inventory of every dependency in your build. CycloneDX, SPDX formats. Tools like Syft generate them automatically. Lets you check "are we using the affected version?" when a CVE drops.

## Defenses — at runtime

**Detection.** Network egress filtering catches a compromised library calling home. Logs of unusual outbound connections.

**Read-only filesystem.** A compromised library can't drop persistent backdoors if root is read-only.

**Capabilities and seccomp.** Limit what the process can do at the kernel level, regardless of which code is running.

## CI/CD security

The build pipeline itself is high-value:

- It has credentials to deploy to production.
- It runs untrusted code (your own + dependencies + tests).
- One compromise = ability to inject malicious code into every build.

Hardening:

**Restrict who can change pipeline configs.** `.github/workflows/`, `.gitlab-ci.yml`. Require code review.

**Scope secrets narrowly.** Each job gets only the secrets it needs. Use OIDC federation (AWS Roles, GCP Workload Identity) over long-lived keys.

**Pin actions/images by SHA, not tag.**

```yaml
# ❌ Vulnerable — uses moving tag
uses: actions/checkout@v4

# ✅ Pinned to a specific SHA
uses: actions/checkout@b4ffde65f463c2d4ec84e6745fbe7d65f4f9e7e8
```

If the action's maintainer is compromised, your pinned version stays safe.

**Don't run untrusted PRs with secrets.** Forked PRs shouldn't get production secrets. GitHub Actions defaults are appropriate; verify.

**Isolated runners.** Don't share runners across customers / projects.

## Notable supply-chain incidents

**SolarWinds (2020).** Attackers injected malicious code into the Orion software build process. ~18,000 organizations installed the trojaned update. Detection took months.

**Log4Shell (2021).** A feature in log4j (JNDI lookups via log strings) became a remote code execution when log4j logged user-controlled data. Critical CVE; many orgs running affected versions globally.

**xz-utils backdoor (2024).** A multi-year social engineering campaign against the xz maintainer culminated in malicious code being committed to a widely-used compression library. Caught at the last minute before mass distribution by an alert engineer.

Common thread: trust extends transitively. Your direct dependencies' dependencies' dependencies all run as your code.

## SCA and SBOM tools

**SCA (Software Composition Analysis):**

- **Snyk** — commercial; broad ecosystem support.
- **Dependabot / Renovate** — automated PRs for outdated/vulnerable deps.
- **OWASP Dependency-Check** — open source.
- **Trivy** — fast scanner for containers + dependencies.

**SBOM generators:**

- **Syft** — generates CycloneDX / SPDX SBOMs.
- **CycloneDX CLI** — official.
- **GitHub native** — `Dependency graph` feature.

For new projects: pick one SCA tool, run on every commit. SBOM auto-generated on every release. Critical CVE in a dep? You can answer "are we affected?" in seconds.

## The maintainer's perspective

If you're maintaining an open-source package consumed by others:

- 2FA on your registry / GitHub accounts.
- Hardware tokens (YubiKey) for high-impact accounts.
- Signed commits.
- Limited number of co-maintainers; vet them.
- Be skeptical of "drive-by" contributions to obscure projects (xz pattern).
- Disclose vulnerabilities responsibly via private channels.

Your reputation rests on the security of your release pipeline.

## Mistakes to avoid

- **`npm install` ungated by review.** Adds whatever the lockfile says.
- **Auto-merge of all Dependabot PRs.** Sometimes Dependabot PRs introduce regressions; review.
- **Pinning by tag.** Tags can be moved; pin by SHA.
- **Long-lived service-account credentials.** Use OIDC for CI deploys.
- **No SBOM.** When the next Log4Shell drops, you'll be triaging blind.

## Summary

- Supply chain = the libraries, build systems, and pipelines you depend on.
- Lock files + hashes + signed packages = install-time integrity.
- Reproducible builds + SBOM = visibility into what's in your binaries.
- CI/CD: pin actions by SHA; OIDC over long-lived keys; restrict secrets per job.
- SCA tools (Snyk, Dependabot, Trivy) automate vulnerability scanning.
- Notable incidents: SolarWinds, Log4Shell, xz — trust extends transitively.

Module 3 complete. Next module: cryptography in practice.
