---
module: 5
position: 2
title: "Incident response: the SANS phases"
objective: "What to do when you've been hit."
estimated_minutes: 6
---

# Incident response: the SANS phases

## The SANS phases

SANS Institute's six-phase IR framework:

1. **Preparation.** Before incidents — playbooks, contacts, tooling.
2. **Identification.** Detect that something's wrong.
3. **Containment.** Limit the damage in progress.
4. **Eradication.** Remove the attacker; close the entry point.
5. **Recovery.** Restore service.
6. **Lessons Learned.** Post-mortem; improve.

Each phase has its own decisions and pitfalls.

## Preparation

Before any incident:

- **IR playbook.** Written, kept current.
- **Contact list.** Who to call, in what order. 24/7 reachable.
- **Tooling.** Forensic images, logging access, communication channels.
- **Communication plan.** Stakeholder, legal, customer comms.
- **Decision authority.** Who can take systems offline? Who talks to regulators?
- **Insurance.** Many cyber insurance policies require notification within 72 hours.

For small teams: even a 1-page playbook ("if X happens, do Y; call Z") is better than nothing. Update yearly.

## Identification

Detection happens (logs, SIEM, user reports). The IR team needs to confirm:

- Is this real or a false positive?
- What's the scope? One user, one system, the whole environment?
- What's the suspected attacker capability?

Common false-positive sources: a misbehaving cron, an admin not understanding alerts, scanner traffic. Verify before escalating.

For real incidents: assign a single incident commander. Their job is coordination, not investigation. Investigators report to them.

## Containment

Stop the bleeding. Trade-offs:

- **Aggressive containment.** Shut everything down. Stops attacker; takes service down.
- **Surgical containment.** Isolate suspected systems. Hopes attacker isn't elsewhere.

For ransomware: aggressive — disconnect to prevent further encryption.

For credential compromise: revoke the tokens; rotate the credentials; force MFA re-enrollment; review where else they accessed.

For data exfiltration in progress: cut network egress.

The cost of false positives matters — taking down production for a non-incident is expensive. But under-reacting to a real incident is worse. Decision authority pre-defined helps make this fast.

## Eradication

Remove the attacker's footholds. Common steps:

- **Rotate credentials.** All credentials potentially exposed. AWS keys, app secrets, user passwords if creds were dumped.
- **Patch the entry point.** Whatever got them in (CVE, misconfig, phished account) must be fixed.
- **Rebuild compromised hosts.** Don't trust a "cleaned" machine. Wipe and reinstall.
- **Search for persistence.** Backdoors, cron jobs, scheduled tasks, modified binaries. Compare against known-good state.
- **Hunt for similar.** "If they got in here, where else?" Run the same playbook against similar systems.

The temptation is to declare done too early. Real eradication takes time and verification.

## Recovery

Bring services back up. Steps:

- **Verify eradication.** Watch for re-entry attempts.
- **Restore from clean backups.** Confirmed clean — not the encrypted ones.
- **Monitor closely.** First days post-incident, heightened detection on the affected systems.
- **Phased rollout.** Not everything back at once if you can avoid it.

Recovery isn't "back to normal." Watch for re-emergence and second waves.

## Lessons Learned (post-mortem)

Within 1-2 weeks of incident close, write up:

- **Timeline.** What happened, when, who responded.
- **Root cause.** Technical and process. Why was it possible? Why wasn't it caught sooner?
- **Damage assessment.** What was accessed / lost / encrypted.
- **What went well.** Detection, response.
- **What didn't.** Slow detection, missing runbook, communication gaps.
- **Actions.** Concrete improvements with owners and dates.

Blameless culture matters — punishing the discoverer / responder makes the next incident slower to surface. Focus on system improvements, not individuals.

## Tabletop exercises

Practice IR before you need it:

- Run a scenario ("we discovered ransomware in our DB cluster").
- Walk through decisions: who does what, in what order.
- Identify gaps: missing contacts, unclear ownership, tooling not in place.
- Fix gaps; run another tabletop in 6 months.

Tabletops are cheap relative to learning IR during a real crisis.

## Forensics basics

When investigating:

- **Preserve evidence.** Snapshot disks, capture memory, save logs. Before "fixing."
- **Chain of custody.** Document who handled what, when. Critical if it goes to law enforcement.
- **Don't poke around.** Random investigation can destroy evidence.
- **Bring in experts.** Many breaches involve calling a specialized firm (Mandiant, CrowdStrike, etc.). Not optional for serious incidents.

For small teams: have an IR firm on retainer. Their initial response can be the difference between hours and days.

## Legal and regulatory

Many jurisdictions require breach notification:

- **GDPR (EU).** 72 hours to supervisory authority; users "without undue delay."
- **CCPA (California).** Within 30 days of breach discovery.
- **HIPAA (US healthcare).** 60 days.
- **State breach laws (US).** Vary widely.

Coordinate with legal counsel early in serious incidents. Premature or wrong communications can compound the problem.

## Communications

Internal:
- Tell the team that's responding; restrict broader detail.
- Tell leadership (CEO, CISO, GC) early.
- Coordinate with comms team on external messaging.

External:
- Customers: factual, helpful, honest. "We discovered an issue affecting X. We've done Y. Customers should Z."
- Regulators: as required by jurisdiction.
- Public: coordinated with comms / PR; don't speculate.

Bad communications can compound an incident. Equifax 2017 is a case study in everything to not do.

## Common mistakes

- **No playbook.** Each incident is figured out from scratch.
- **Wrong decision authority.** Who can pull the cord isn't clear.
- **Under-containment.** Hoping it's not as bad as it is.
- **Premature recovery.** Service back up; attacker still inside.
- **No post-mortem.** Same incident repeats.
- **Premature comms.** Telling customers before you know the scope.

## Summary

- SANS phases: Preparation, Identification, Containment, Eradication, Recovery, Lessons.
- Have playbooks and contact lists before incidents.
- Containment trades scope of damage vs availability.
- Eradicate fully — rotate credentials, rebuild hosts, hunt for persistence.
- Post-mortem within 1-2 weeks; blameless; actionable.
- Tabletop exercises practice IR cheaply.
- Legal and regulatory requirements apply quickly (72h GDPR, etc.).

Next: bug bounty and responsible disclosure.
