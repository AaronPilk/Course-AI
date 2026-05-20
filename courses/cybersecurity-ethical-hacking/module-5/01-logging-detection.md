---
module: 5
position: 1
title: "Logging and detection: what to capture"
objective: "Make the breach visible — to you, before it's too late."
estimated_minutes: 6
---

# Logging and detection: what to capture

## Why detection matters

The 2024 Verizon Data Breach Investigations Report found median dwell time (attacker in network before being noticed) measured in months for many breach types. The longer the dwell, the more damage.

You don't prevent every attack. You detect it fast. Good logging is the foundation.

## What to log

For each app:

**Authentication events.**
- Login success / failure (with username, IP, user-agent, MFA result).
- Password reset triggered / completed.
- MFA enrolled / disabled / used.
- Token issuance / revocation.

**Authorization events.**
- Access to sensitive resources (PII, admin functions).
- Role / permission changes.
- Denied requests (403/401).

**Data access.**
- Sensitive table queries.
- Export / download events.
- Bulk reads.

**Configuration changes.**
- Settings updates (especially security-relevant).
- Account creation / deletion.

**System events.**
- Service starts / stops / restarts / crashes.
- Resource exhaustion.
- Outbound connections to unusual destinations.

Don't log: passwords, tokens, full credit card numbers, full social security numbers. Sensitive data in logs is itself a liability.

## Structured logging

JSON > plain text:

```json
{
  "timestamp": "2026-05-15T14:32:15Z",
  "level": "info",
  "event": "user.login.success",
  "user_id": "abc123",
  "ip": "203.0.113.50",
  "user_agent": "Mozilla/...",
  "mfa": true
}
```

vs

```
[2026-05-15 14:32:15] User abc123 logged in from 203.0.113.50
```

JSON is queryable. "How many logins failed from IP X in the last hour?" is one query against structured data; pattern-matching against text is fragile.

Tools: log to stdout/stderr; collect via fluentd / Vector / Loki; query in a SIEM (Splunk, Elastic, Datadog, Sumo Logic).

## Centralized log storage

Logs on the host are vulnerable — an attacker who compromises the host can clean local logs. Ship to a separate system:

- **Cloud:** CloudWatch (AWS), Cloud Logging (GCP), Azure Monitor.
- **Self-hosted:** Loki + Grafana, Elastic Stack (ELK), Graylog.
- **SaaS:** Datadog, Splunk Cloud, Sumo Logic.

Real-time forwarding to a separate trust domain. Even an attacker with root on a box can't unsay what was already shipped.

For sensitive logs: write-once / append-only storage (S3 with object-lock, immutable buckets).

## SIEM and alerting

SIEM (Security Information and Event Management) systems aggregate logs across sources and alert on patterns.

Common alerting rules:

- Many failed logins from one IP → brute force.
- Login from new country / unusual location → account takeover.
- Privilege escalation event → audit immediately.
- Sensitive data accessed by unusual user/role.
- Outbound traffic to known-bad IPs (threat intel feeds).
- Disabled MFA or audit logging.

Rules need tuning. Start narrow (high-confidence alerts); broaden as false positive rates settle.

## Anomaly detection

Beyond hard rules, statistical anomalies:

- User logged in from country they've never logged in from before.
- Spike in API calls vs baseline.
- Unusual time of day for this user.
- Geographic impossibility ("logged in from US, then 5 min later from Russia").

Modern tools (AWS GuardDuty, Azure Defender, MS Sentinel) include built-in anomaly detection. Coverage is broad without custom rules; tune false positives over time.

## ATT&CK framework

MITRE ATT&CK is a knowledge base of real-world adversary techniques. Mapped by tactic:

- Initial Access → Execution → Persistence → Privilege Escalation → Defense Evasion → Credential Access → Discovery → Lateral Movement → Collection → Exfiltration → Command and Control → Impact.

Each has dozens of specific techniques. Detection engineering: "what attacker techniques are we positioned to detect, and what are we blind to?"

Useful for: prioritizing detection coverage, post-incident analysis ("we missed lateral movement; add detection for that"), red team / blue team alignment.

## Logging best practices

**Don't log secrets.** Audit your log lines; tokens / passwords / PII shouldn't be there.

**Include context.** Correlation IDs, user IDs, IP addresses — let logs be joined.

**Sample wisely.** High-volume normal events (200 OK) can be sampled. Errors and security events: always log.

**Retain appropriately.** Compliance and forensics need 1-7 years for some industries. Hot storage for recent; cold storage for archive.

**Test your detections.** Fire test events. Confirm alerts arrive at the right people. A detection that never fires might be broken.

## Detection vs prevention

Prevention controls (firewalls, auth, encryption) try to stop attacks. Detection controls assume attacks happen and try to catch them in flight.

You need both. Modern security splits roughly evenly between prevention and detection-and-response (D&R). Mature programs have:

- A SOC (Security Operations Center) or equivalent — humans monitoring alerts.
- A playbook for responding to common alerts.
- Regular tabletop exercises ("what if X happens?").

For small teams: outsource (MDR services), use cloud-native detection (GuardDuty, etc.), and have one person who owns it.

## Common mistakes

- **No central logs.** Attacker clears local logs; you have nothing.
- **Logs but no alerts.** Detection in theory; nobody knows.
- **Alerts but no responders.** Alerts pile up; ignored.
- **Logging secrets accidentally.** Logs become target.
- **Retention too short.** Forensics goes back days, breach was months ago.

## Summary

- Log auth, authz, data access, config changes, system events.
- Structured JSON; centralized storage; immutable for sensitive.
- SIEM aggregates; alerting on patterns (brute force, anomalies, privilege changes).
- MITRE ATT&CK informs what to detect.
- Detection complements prevention; you need both.
- Test alerts; tune false positives; document response runbooks.

Next: incident response — SANS phases.
