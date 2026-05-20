---
module: 1
position: 3
title: "The CIA triad: confidentiality, integrity, availability"
objective: "The three pillars every security decision serves."
estimated_minutes: 5
---

# The CIA triad: confidentiality, integrity, availability

## The three things you're protecting

Every security control protects one or more of:

- **Confidentiality.** Only authorized parties can read it.
- **Integrity.** Only authorized parties can change it; unauthorized changes are detected.
- **Availability.** The service is up and accessible when needed.

The CIA triad is the simplest useful mental model in security. Every threat reduces to one or more of these; every control protects one or more.

## Confidentiality

The classic "security" concern. Examples of breaches:

- Data leak. Customer database is exfiltrated.
- Eavesdropping. HTTP traffic intercepted on a coffee shop network.
- Privilege escalation. A regular user reads admin-only records.
- Insider threat. An employee copies customer data.

Defenses:

- **Encryption.** TLS in transit; AES-256 at rest.
- **Access control.** Authentication + authorization layers.
- **Data classification.** Know what's sensitive; treat differently.
- **Least privilege.** People and services get only what they need.

Confidentiality breaches make the news: 50M customer records leaked, source code stolen, internal Slack screenshots posted.

## Integrity

Often overlooked, sometimes worse than confidentiality breaches. Examples:

- Financial fraud. Attacker changes a bank balance.
- Code tampering. Malicious commits in a supply chain attack.
- Database corruption. Ransomware encrypts records.
- Log tampering. Attacker erases their own activity.

Defenses:

- **Cryptographic hashes.** Detect changes.
- **Digital signatures.** Verify authenticity.
- **Audit logs (immutable).** Track who changed what.
- **Backups + checksums.** Detect tampering against known-good state.
- **Code signing.** Verify software hasn't been modified.

A pure integrity breach can be worse than a leak. A leaked customer database is recoverable (notification, credit monitoring); a database where balances were silently shifted by 0.01% is a quiet, ongoing fraud.

## Availability

The service must be up. Examples of attacks:

- DDoS. Overwhelm with traffic.
- Ransomware. Encrypt data; demand payment.
- Resource exhaustion. App bug; OOM; database fills.
- Hardware failure or natural disaster.

Defenses:

- **Redundancy.** Multiple instances, regions, providers.
- **Backups.** Restore from known-good state.
- **DDoS mitigation.** Cloudflare, AWS Shield, etc.
- **Rate limiting.** Protect against abuse.
- **Capacity planning.** Don't run at 100%.

Availability is often the easiest of the three to think about — the service is up or it's down — but the hardest to fully solve. Some attacks (well-funded DDoS, zero-days) can take down even well-prepared infrastructure.

## Trade-offs

The three pull in different directions:

- **More confidentiality** → harder to access → less availability (auth checks slow things down).
- **More availability** → loosen restrictions → less confidentiality.
- **More integrity** → more checks → slower writes.

You can't max all three. Engineering decisions choose where to invest.

For a hospital's patient records: confidentiality matters but availability *during an emergency* matters more. The system might accept slightly weaker auth (override-with-audit) for emergency access.

For a bank: integrity is paramount. A wrong balance is unrecoverable trust loss. They optimize for integrity over speed.

For a media site: availability dominates. Better to stay up with stale content than go down. Caching tolerates slight integrity lag.

Identifying your dominant requirement informs the architecture.

## Non-CIA additions

Some frameworks extend CIA with:

- **Authenticity.** Is this really from who it claims?
- **Non-repudiation.** Can the actor deny having acted? (Signed logs.)
- **Accountability.** Who did what; trace back.
- **Privacy.** Distinct from confidentiality — about consent and purpose.

These overlap. CIA is the foundation; the extensions sharpen specific concerns.

## Mapping threats to CIA

For each threat, label which pillar(s) it violates:

| Threat | Violates |
|--------|----------|
| Stolen credentials → reading user data | C |
| SQL injection → modify balances | I |
| DDoS → site down | A |
| Insider exfiltrates source code | C |
| Ransomware (no exfil) | A, I |
| Tampered backup | I, A (when recovery needed) |
| Eavesdropped TLS | C |

Mapping clarifies which control category applies.

## CIA in practice — daily decisions

When designing a feature:

- **What confidentiality does this data require?** Public, internal, restricted, confidential — pick a label, design controls accordingly.
- **What integrity guarantees do we need?** Tampered, detected-and-rolled-back, signed, hash-verified.
- **What availability does this need?** Tolerates 1 hour downtime? 1 minute? Tier the architecture accordingly.

Decisions tracing back to "we chose X because confidentiality is critical here" produce coherent, defendable architecture. Random "we used encryption because everyone uses encryption" doesn't.

## Common mistakes

- **Over-focusing on confidentiality.** Integrity and availability matter too.
- **Trying to max all three.** Costs compound; choose dominant needs per system.
- **Pretending controls protect multiple pillars when they don't.** TLS protects C and (partly) I in transit; not A or I at rest.
- **Ignoring integrity until ransomware hits.** "We have backups" only works if you check that backups are integrity-verified.

## Summary

- Every security control protects one or more of Confidentiality, Integrity, Availability.
- C: encryption + access control. I: hashes + signatures + immutable logs. A: redundancy + backups.
- They trade off; identify your dominant requirement per system.
- Map every threat to the pillar(s) it violates.
- Integrity is the under-appreciated pillar; ransomware reminded everyone.

Next: legal and ethical lines.
