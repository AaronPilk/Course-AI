---
module: 5
position: 4
title: "When to add SOC 2, ISO, GDPR readiness"
objective: "Compliance done at the right time."
estimated_minutes: 5
---

# When to add SOC 2, ISO, GDPR readiness

## The compliance landscape

SaaS compliance is a function of:
- Where your customers are (jurisdiction).
- What data you handle (PII, PHI, financial).
- Who your customers are (enterprise > SMB on scrutiny).

Common frameworks:

- **SOC 2.** US-centric; security/availability/confidentiality audit. Enterprise customers require it.
- **ISO 27001.** International equivalent; broader scope.
- **GDPR.** EU regulation on personal data. Applies if any EU users.
- **CCPA.** California's GDPR-like law.
- **HIPAA.** US healthcare data.
- **PCI DSS.** Payment card data.

Each has costs (audit fees, engineering effort, ongoing maintenance). Don't get them all on day one; sequence based on customer demand.

## When to start

**SOC 2:** when enterprise customers ask. Usually at $1-5M ARR.

**GDPR:** if you have EU users (any!). Day one if international from start.

**HIPAA:** if you handle health data. Required before serving healthcare customers.

**ISO 27001:** large enterprise / international markets. Usually after SOC 2.

**PCI DSS:** if you store / process card data (most don't — use Stripe / similar to keep PCI out of scope).

The rule: customer asks → start the process. Don't gold-plate before customers care.

## SOC 2 — what it is

A SOC 2 report is an attestation from an auditor that your company meets specific criteria around:

- **Security.** Mandatory; foundational.
- **Availability.** Up when promised.
- **Confidentiality.** Sensitive data protected.
- **Processing integrity.** Transactions correct.
- **Privacy.** PII handled per stated practices.

Most SaaS pursues "SOC 2 Type II" (covers 6-12 months of operations, not just point-in-time).

Cost: $20-100K for first audit; $20-50K annual reaudit; engineering time to implement controls.

## SOC 2 controls — what you actually do

Examples of controls auditor checks:
- **Access management.** Onboarding / offboarding processes; least-privilege.
- **Change management.** All production changes reviewed.
- **Encryption.** At rest + in transit.
- **Logging / monitoring.** Security events captured.
- **Incident response.** Plan documented + tested.
- **Vendor management.** Sub-processors tracked + audited.
- **Backup / recovery.** Tested regularly.
- **Background checks.** New hires.
- **Security awareness training.** Quarterly.

Tools like Vanta, Drata, Sprinto automate evidence collection. They integrate with your stack (GitHub, AWS, Okta) and continuously monitor compliance state.

For startups: Vanta-style tool + 3-6 months prep + audit = SOC 2 Type II achievable. Without tools, much harder.

## GDPR — data subject rights

If you have EU users:

- **Right to access.** User can request all their data.
- **Right to deletion.** User can demand removal.
- **Right to portability.** Data export in machine-readable format.
- **Consent.** Explicit; granular for non-essential cookies / processing.
- **Data minimization.** Don't collect more than needed.
- **Breach notification.** 72 hours to authority.

Implementation:
- Privacy policy + cookie consent.
- User self-serve export + deletion in app.
- Data processing agreement (DPA) for B2B customers.
- Track sub-processors; notify customers of changes.
- Internal training.

GDPR penalties: up to 4% of global revenue or €20M (whichever higher). Real risk; don't ignore.

## DPA — Data Processing Agreement

For B2B SaaS: customers sign a DPA with you outlining how their users' data is handled. Enterprise customers require this in procurement.

Template online (many). Have legal review yours.

## Sub-processors

Vendors that touch customer data (AWS, Stripe, SendGrid, Datadog, etc.) are sub-processors. List publicly:
- Name.
- What they do.
- Where they're located.
- Their compliance certifications.

When you add / remove sub-processors, notify customers (some require approval).

## Data residency

EU customers may require EU-only data storage. Implementation: regional infrastructure (EU AWS regions); routing tenants to their declared region; never replicating to non-EU regions for EU customers.

Some industries (healthcare, finance) have similar regional requirements for non-EU data.

## Incident response

When something goes wrong (security incident, breach):

- **Detect.** Logs / monitoring tells you.
- **Contain.** Stop further damage.
- **Investigate.** What was accessed?
- **Notify.** Regulators (GDPR: 72h); affected customers; sometimes public.
- **Postmortem.** What changed; what learned.

Document the process; practice via tabletop exercises (war games). When real incident happens, you've rehearsed.

## Security questionnaires

Enterprise customers send you questionnaires (CAIQ, SIG, custom 200-question lists). Your job:
- Answer accurately.
- Provide your SOC 2 report.
- Provide DPA.
- Sometimes calls with their security team.

Tools like Conveyor, Whistic streamline; pre-fill answers; track customer-specific responses.

Without this: every enterprise deal requires 5-20 hours of questionnaire response. With tools / automation: hours per deal.

## Costs to budget

- **SOC 2 audit:** $20-100K first time; $20-50K/year.
- **Vanta / Drata:** $10-30K/year.
- **Legal (DPA, privacy policy):** $5-20K one-time + occasional refresh.
- **Cyber insurance:** $5K-50K/year depending on coverage.
- **Engineering time:** weeks per certification cycle.

For early SaaS: $50-100K/year in compliance costs is typical once you have enterprise customers. Bake into pricing.

## ISO 27001

Similar to SOC 2 but international:
- More prescriptive controls.
- Two-stage audit (Stage 1 review, Stage 2 certification).
- Annual surveillance audits.

Often pursued after SOC 2 for international markets. Some EU enterprises prefer ISO over SOC 2.

## HIPAA — special handling

If you handle PHI (Protected Health Information):

- BAA (Business Associate Agreement) with customers.
- AWS / GCP have HIPAA-eligible services (subset of total services).
- Specific encryption + access control requirements.
- Breach notification within 60 days.

Don't store PHI unless you intend to be HIPAA-compliant. Many SaaS exclude healthcare customers entirely to avoid the burden.

## Engineering practices that help

Compliance is easier if you've built well:

- **Audit logs** on sensitive actions (logged events).
- **Encryption at rest and in transit** by default.
- **MFA** on admin accounts.
- **Background-check policies** for new hires.
- **Vulnerability scanning** in CI.
- **Backup + restore** tested.
- **Change management** via PR review.

Most of these are good practice anyway. Compliance formalizes.

## Mistakes to avoid

- **Promise SOC 2 you don't have.** Customer disqualification on audit.
- **No DPA ready.** Procurement blocks.
- **Ignore GDPR with EU customers.** Existential risk.
- **Pursue all certifications simultaneously.** Bandwidth crushed.
- **Compliance theater.** Pass audits but actually weak controls.

## Summary

- Pursue compliance when customers demand it, not before.
- SOC 2 Type II is the common enterprise gate.
- GDPR applies to any EU users; data subject rights matter.
- Vanta / Drata automate evidence; pay back vs DIY.
- Privacy policy + DPA + sub-processor list mandatory for B2B.
- Engineering practices (audit logs, encryption, MFA) ease compliance.
- Budget $50-100K/year once at scale.

## Course complete

You've covered the architecture decisions that shape a SaaS — multi-tenancy, billing, auth, feature flags, scaling, compliance. Each is a multi-month workstream; together they're the SaaS playbook.

Next steps: for whatever SaaS you build, run through these modules as a checklist. Identify where you've made conscious choices vs where you've defaulted. The conscious choices compound into a defensible, scalable, predictable business; the defaults sometimes lock you in to architectures that hurt at growth. Choose deliberately.
