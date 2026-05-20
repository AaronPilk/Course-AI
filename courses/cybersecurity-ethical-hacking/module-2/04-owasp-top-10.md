---
module: 2
position: 4
title: "OWASP Top 10 — what to memorize and what to look up"
objective: "The most prevalent application security risks."
estimated_minutes: 7
---

# OWASP Top 10 — what to memorize and what to look up

## The list

The OWASP Top 10 is the most-referenced security list. Updated every 3-4 years. As of the 2021 edition (the current at this writing in 2026):

1. **Broken Access Control.**
2. **Cryptographic Failures.**
3. **Injection.**
4. **Insecure Design.**
5. **Security Misconfiguration.**
6. **Vulnerable and Outdated Components.**
7. **Identification and Authentication Failures.**
8. **Software and Data Integrity Failures.**
9. **Security Logging and Monitoring Failures.**
10. **Server-Side Request Forgery (SSRF).**

Memorize the categories. Know each by example. Don't memorize CWE numbers.

## A1: Broken Access Control

Covered last lesson — IDOR, missing function checks, forced browsing, privilege escalation. #1 because it's the most common and the most damaging.

Defense: explicit authorization checks on every request, scoped queries, RLS for multi-tenant data.

## A2: Cryptographic Failures

Previously called "Sensitive Data Exposure." Examples:

- Storing passwords in plain text (or weak hashing).
- Using deprecated algorithms (DES, MD5, SHA-1).
- Hard-coded keys in source code.
- Weak random number generators (`Math.random()` for security).
- HTTPS not enforced; mixed content.

Defense: use established libraries, never roll your own crypto, never commit secrets, use a CSPRNG (`crypto.randomBytes` in Node, `secrets` in Python).

Detailed in Module 4.

## A3: Injection

Covered earlier. SQL, command, template, LDAP — same pattern.

Defense: parameterized queries; argument-list subprocess; never input-as-template.

## A4: Insecure Design

New category in 2021. Captures architectural / design flaws beyond just coding bugs:

- Missing rate limiting on auth endpoints.
- Sensitive operations without re-authentication.
- Business-logic flaws (e.g., negative discount = free money).
- Missing threat model.

Defense: threat modeling (Module 1), security in design phase, secure design patterns.

## A5: Security Misconfiguration

The boring-but-common category:

- Default credentials still active.
- Verbose error messages exposing stack traces.
- Cloud storage buckets public.
- Dev / debug endpoints exposed in production.
- Software with default settings (insecure defaults).

Defense:
- Automate secure baseline configuration.
- Strip stack traces from prod error responses.
- IAM policies + tools like ScoutSuite to scan cloud configs.
- Regular audit.

The largest data breaches of the 2010s-2020s often traced to misconfigured S3 buckets. Cheap mistakes; expensive consequences.

## A6: Vulnerable and Outdated Components

Using libraries / frameworks / OS packages with known vulnerabilities.

Examples: Log4Shell (Log4j 2.x in 2021), Heartbleed (OpenSSL 2014), Equifax breach (Struts 2017).

Defense:
- **SCA (software composition analysis).** Tools like Snyk, Dependabot, Renovate scan dependencies for known CVEs.
- **SBOM (Software Bill of Materials).** Inventory of every dependency.
- **Automated update PRs.** Test and merge.
- **Patch SLAs.** Critical CVEs fixed within X hours; high within X days.

You can't avoid using dependencies; you can avoid using outdated vulnerable ones.

## A7: Identification and Authentication Failures

Last lesson — weak auth, credential stuffing, missing MFA, session management bugs.

Defense: rate limits, MFA, secure password storage, well-tested libraries (Auth0 / Clerk / Supabase Auth / NextAuth).

## A8: Software and Data Integrity Failures

The supply-chain category:

- Unsigned packages / containers.
- CI/CD pipeline compromise.
- Auto-update from untrusted sources.
- Deserialization vulnerabilities (Java, Python pickle, Ruby YAML).

Defense:
- Signed packages (npm package signatures, sigstore).
- Reproducible builds.
- Subresource Integrity for CDN scripts.
- Don't deserialize untrusted input.
- Lock down CI/CD; require code review.

SolarWinds, Codecov, and the xz-utils backdoor are recent examples. The supply chain is increasingly contested.

## A9: Security Logging and Monitoring Failures

If a breach happens and you can't detect it, the breach is worse.

Examples:
- No logs at all.
- Logs that don't include attribution (which user, which IP).
- Logs not stored centrally or persistently.
- No alerting on suspicious events.
- Alerts that nobody answers.

Defense:
- Log auth events, access to sensitive data, admin actions.
- Centralize logs (SIEM: Splunk, Elastic, Datadog, etc.).
- Alert on patterns (many failures, privilege escalation, anomalous geographic access).
- Test that alerts work — fire test events.

Detection-and-response is at least half of effective security.

## A10: Server-Side Request Forgery (SSRF)

App makes an HTTP request to a URL provided by the user. Attacker provides an internal URL → app fetches it on the attacker's behalf.

```python
# Vulnerable
url = request.args['url']
response = requests.get(url)  # could be http://169.254.169.254/latest/meta-data/
```

That AWS metadata URL returns the instance's IAM credentials. SSRF + AWS metadata = stolen cloud credentials. The 2019 Capital One breach hinged on exactly this.

Defense:
- Allowlist hosts the app is allowed to fetch.
- Block requests to private IP ranges (10/8, 172.16/12, 192.168/16, 169.254/16, 127/8).
- Use IMDSv2 (token-based metadata service) on AWS.
- Network egress rules — apps in private subnets can't initiate to metadata service except via approved IAM roles.

## What's not on the Top 10 (but matters)

- **DDoS / availability attacks.** Major operational concern; not strictly app security.
- **Social engineering / phishing.** Human factors; addressed elsewhere.
- **Insider threats.** Real but hard to test programmatically.
- **Cryptographic key management.** Subset of A2 but its own discipline.

Don't treat the Top 10 as exhaustive. It's the most common; not the only.

## How to use it

For your apps:

1. For each item, ask: "Could this happen to us?" Be honest.
2. For each high-risk yes, build a mitigation roadmap.
3. Re-assess quarterly.

For pen testing / bug bounty:

1. Start with A1 (access control) — usually most fruitful.
2. Inject everything (A3).
3. Check for misconfigurations (A5).
4. Hunt for SSRF (A10) — often high payout.

The list is a checklist, but checklists are starting points.

## Mistakes to avoid

- **Treating the Top 10 as a complete list.** It's the highest-prevalence, not the only.
- **Box-ticking compliance.** "We address A3" but never tested any code.
- **Stale knowledge.** The list updates; what's #1 changes.
- **No process around emerging CVEs.** Log4Shell required patches within hours.

## Summary

- OWASP Top 10 is the de facto application security baseline.
- #1: Broken Access Control. Most prevalent.
- Categories: access control, crypto, injection, design, config, components, auth, integrity, logging, SSRF.
- Each maps to defenses you can implement.
- Use it as starting checklist; don't treat as exhaustive.

Module 2 complete. Next module: network and system security.
