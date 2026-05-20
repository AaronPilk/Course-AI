---
module: 5
position: 3
title: "Privacy, audit, and the user's right to know"
objective: "Apply the privacy and audit controls specific to assistant products."
estimated_minutes: 8
---

# Privacy, audit, and the user's right to know

## The puzzle

Assistants accumulate sensitive data: emails, calendars, contacts, conversations. Memory, tokens, retrievals, logs. Each is a privacy surface. One leak collapses the product.

This lesson is the privacy and audit baseline for assistant products — what to build into the architecture so that "we don't leak user data" is a property of the system, not just a promise.

## The simple version

Five non-negotiables:

1. **Per-user data scoping** at every storage and retrieval layer.
2. **Encrypted at rest** for all user content and tokens.
3. **User access logs** — show users who/what accessed their data.
4. **Real deletion** — including derived data (embeddings, summaries).
5. **Regional residency** if you serve regulated geographies.

Build these as architecture, not as compliance theater.

## The technical version

### Per-user scoping at storage

Every read and write tagged with user_id, enforced at the storage layer:

```sql
-- Wrong: trusting the application to filter
SELECT * FROM episodic_memory WHERE topic = 'X'

-- Right: required filter
SELECT * FROM episodic_memory 
WHERE user_id = $current_user AND topic = 'X'
```

Stronger: row-level security in the database, so the wrong query is impossible:

```sql
CREATE POLICY user_isolation ON episodic_memory
  USING (user_id = current_setting('app.current_user_id'));
```

Cross-user leaks should be physically impossible, not just procedurally avoided.

### Encryption at rest

What to encrypt:

- **OAuth tokens** (always, with KMS-managed keys).
- **User content** (emails, doc snippets, conversation history) — encrypted with per-user or per-tenant keys.
- **Memory artifacts** (summaries, embeddings) — encrypted.
- **Activity logs** if they contain content.

What's typically OK in plaintext:

- IDs and metadata (timestamps, source names).
- Aggregated metrics.

Modern Postgres + pgcrypto + KMS gives you most of this. Cloud-managed encryption is fine; the discipline is *using* it consistently.

### Access logs for users

Users can see who/what touched their data:

```
Recent access:
- Yesterday 8:00 AM — Morning brief task (automated)
- Yesterday 2:13 PM — User-initiated chat session
- Today 8:00 AM — Morning brief task (automated)
```

Plus internal access:

- Engineering accessed user data: when, by whom, why (with a ticket reference).
- Support viewed conversation: when, support agent ID, reason.

Internal access should be rare, logged, and surfaceable to the user on request. Many enterprise products require this.

### Real deletion

When a user deletes:

- Their account → wipe all data including: profile, episodic memory, lessons learned, activity logs, OAuth tokens (revoked at provider), embeddings, derived summaries, audit log entries about them.
- A specific memory → remove the memory + any derived data (e.g. embeddings pointing to it).
- A connector → revoke + delete tokens + halt schedules + remove indexed content.

Deletion must be propagated through the architecture. Soft-delete only adds debt.

### Regional residency

If you serve EU users:

- GDPR requires data to stay in EU or have a legal mechanism for transfer.
- Need EU-region storage, EU-region LLM endpoints (or contractual mechanisms).
- Consider EU-specific deployments.

Similar for healthcare (HIPAA), finance (varying), government (FedRAMP, etc.).

For B2C consumer products, regional residency is often optional; for B2B and regulated industries, it's table stakes.

### Audit logs for compliance

For SOC 2, ISO 27001, HIPAA, etc., maintain an internal audit log:

- Every action that changes user data: who, what, when, why.
- Every internal access: same.
- Every system event of compliance interest (auth changes, permission grants, deletion requests).

Retain per compliance requirement (often 90 days minimum; sometimes years).

### Privacy in retrievals

A subtle issue: even if you scope storage per user, retrieved content can leak across contexts. Two patterns:

- **Filter retrievals strictly** by user_id at query time.
- **Test for leaks** with explicit eval cases (user A's session retrieves only user A's content).

The leak is usually a query bug — wrong filter, scope variable not propagated. Catch in test.

### Third-party data flow

Your assistant likely sends user data to LLM providers (OpenAI, Anthropic, etc.). Implications:

- **Provider data policies** — opt out of training where supported. Most providers offer this for API use.
- **Zero-data-retention agreements** with enterprise customers if needed.
- **Contractual flows** — DPAs (Data Processing Agreements) with providers if applicable.
- **Sensitive content handling** — some content (regulated data) needs special routing.

Document and surface to users.

### User-facing privacy controls

A good privacy surface:

- **What we store**: explained in plain language.
- **What we share**: with whom, why, when.
- **What you can delete**: every category accessible.
- **Pause data collection**: opt-out controls.
- **Export your data**: full export on request.

Privacy as a feature, not just a policy page.

### Incident response

When privacy goes wrong:

- **Fast detection**: alerts on cross-user access, unusual patterns.
- **Contain quickly**: kill switches for affected features.
- **Communicate**: tell affected users; tell regulators if required.
- **Root-cause and remediate**: with eval coverage to prevent repeat.

Have an incident-response plan written before you need it.

## Three real-world scenarios

**Scenario 1: The row-level-security save.**
A team enabled Postgres row-level security on every user-data table. A subsequent bug in the query layer would have returned wrong-user data — but RLS blocked it. The bug was caught in test; the architecture was the safety net.

**Scenario 2: The export request.**
A user requested full data export under GDPR. The team had built export from day 1; turned around in 48 hours. User satisfied; compliance straightforward. Teams without export plumbing often scramble for weeks.

**Scenario 3: The internal-access incident.**
A support agent accessed user data outside a customer-approved ticket. Audit log flagged the access; investigation followed; the agent was retrained. Without internal-access logging, the violation would have been invisible. With it, the violation became a learning event.

## Common mistakes to avoid

- **Application-only access control** without storage enforcement (RLS, etc).
- **Tokens in plaintext.** Security incident waiting.
- **No internal-access logging.** Bad actors invisible.
- **Soft delete on user-requested deletion.** Doesn't satisfy regulations or trust.
- **No regional residency for regulated geographies.** Legal exposure.
- **Privacy as policy page only.** Users need controls, not just promises.

## Read more

- [Postgres row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [GDPR data subject rights](https://gdpr.eu/data-subject-rights/)
- [Anthropic data usage](https://www.anthropic.com/legal/aup)
- [SOC 2 overview](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services)

## Summary

- **Per-user data scoping** enforced at storage (RLS or equivalent) — not just at the app.
- **Encrypt at rest** for tokens, user content, memory artifacts.
- **User-visible access logs** including internal access on request.
- **Real deletion** propagated through indexes, embeddings, audit logs.
- **Regional residency** for EU and regulated geographies.
- **Audit logs** for compliance retention.
- **Privacy as architecture**, surfaced through user controls.

Next: launching an autonomous assistant.
