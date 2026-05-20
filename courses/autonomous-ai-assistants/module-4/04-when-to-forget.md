---
module: 4
position: 4
title: "When the assistant should forget"
objective: "Decide what to expire, what to confirm, what to delete."
estimated_minutes: 7
---

# When the assistant should forget

## The puzzle

Memory builds up. Some of it stays accurate; some goes stale. Some helps the assistant; some hurts. The assistant that never forgets becomes increasingly wrong over time.

This lesson is the discipline of forgetting — what to expire automatically, what to confirm with the user, what to delete on request.

## The simple version

Three forgetting patterns:

1. **Auto-expire**: temporal facts (vacations, project deadlines, this-week contexts) age out.
2. **Confirm**: facts approaching the boundary of "still true" prompt the user.
3. **Delete on request**: user can wipe any memory category instantly.

Stack them. The assistant gets more accurate over time, not less.

## The technical version

### Auto-expire patterns

For facts with implicit lifespans, set TTL:

- **Out-of-office / vacation**: 2 weeks.
- **"This quarter's goal"**: 90 days from creation.
- **"Working on project X"**: until project closes or 6 months idle.
- **Behavioral patterns** (low-confidence inferences): 30-90 days.

When a TTL expires, the fact either drops or downgrades to "previously stated." The assistant stops acting on it as current.

### Confirmation patterns

Some facts deserve a check-in:

- "I noticed you haven't mentioned project X in 60 days. Still active?"
- "Three months ago you said you prefer Slack DMs. Still true?"
- "We last marked Sarah as a VIP contact. Keep that?"

These prompts should be lightweight — one tap to confirm, one to remove. Don't overdo or every session becomes a maintenance flow.

### User-initiated deletion

The user can always:

- **Delete a specific memory** (a fact, an episode, a session summary).
- **Delete a category** (all VIP contacts, all preferences).
- **Wipe everything** ("forget everything about me").
- **Pause memory** ("don't remember anything from this session").

These need to actually work — meaningful delete, not soft-delete with shadow data hanging around.

### Right-to-be-forgotten (legal)

In some jurisdictions (EU GDPR, California CCPA), users have legal right to deletion:

- Deletion requests must be honored within stated time (often 30 days).
- Deletion includes derived data (embeddings, summaries, logs that mention the user).
- Backups and audit logs may be exempt with documented retention policy.
- The user gets confirmation of deletion.

If you operate in regulated regions, build the plumbing early. Retrofitting deletion is painful.

### The "session ephemeral" mode

A common feature: "don't remember this session." Treats the conversation as ephemeral — no episodic memory written, no profile updates, no lessons learned. Like incognito mode.

Useful for:

- Sensitive conversations (medical, personal, exploratory).
- Test / one-off interactions.
- Privacy-conscious users.

Build it. Users care more than you think.

### Soft delete vs. hard delete

Distinction matters:

- **Soft delete**: marks deleted; data still in storage. Useful for accidental-delete undo but creates ambiguity.
- **Hard delete**: actually removed from storage including indexes.

For privacy-sensitive products: hard delete after a short soft-delete window. For productivity products: soft delete with explicit "purge" option.

### Audit your own forgetting

Track:

- How often facts expire automatically.
- How often users confirm vs. remove on prompted check-ins.
- How often users delete (and what categories).

If facts expire and users immediately re-state them, your TTL is too aggressive. If users delete most categories, you're tracking the wrong things.

### The "shadow profile" problem

A subtle one: the assistant can infer facts even after you've deleted them. User deletes "VIP contact: Sarah." Next week, assistant sees user emailing Sarah frequently and re-infers Sarah as important.

Mitigations:

- **Block list**: explicitly tracked "do not re-add" entries.
- **Inference dampening**: facts the user has previously removed get re-inferred only after strong signal.
- **Transparent recurrence**: if the assistant wants to re-add something the user deleted, ask first.

Otherwise the assistant feels "stuck" on a fact the user clearly didn't want.

### Forgetting during incidents

A user emails: "There's an email in the assistant's memory I need removed urgently."

- Have a fast-track removal flow (24h max ideally).
- Document the process internally.
- Don't require legal escalation for individual memory items.

Speed matters; trust matters more.

## Three real-world scenarios

**Scenario 1: The expiration that helped.**
A team auto-expired "out of office" preferences after 2 weeks. Users no longer received "enjoy your vacation!" sign-offs months after their trip. Small change; outsized perceived assistant quality.

**Scenario 2: The shadow profile complaint.**
A user deleted a "VIP contact" entry; the assistant re-inferred and re-added it within days. User felt their request was ignored. They added a block list — deleted entries stay deleted unless the user explicitly re-adds. Trust restored.

**Scenario 3: The GDPR scramble.**
A team didn't build deletion plumbing early. A GDPR request came in; took 6 weeks of engineering to actually purge all derived data. They documented it; built proper deletion infrastructure for future cases. Lesson: build deletion before you need it.

## Common mistakes to avoid

- **No expiration** — stale facts pile up.
- **No user delete** — privacy incidents waiting.
- **Soft delete with shadow data** — looks deleted, isn't.
- **Re-inferring deleted facts** — user feels ignored.
- **Slow deletion process** — fails on urgent requests.
- **No incognito mode** — users can't have one private conversation.

## Read more

- [GDPR right to erasure](https://gdpr.eu/right-to-be-forgotten/)
- [Anthropic data usage policies](https://www.anthropic.com/legal/aup)
- [OpenAI data deletion](https://help.openai.com/en/articles/8809935-how-to-make-data-deletion-requests)

## Summary

- Three forgetting patterns: **auto-expire, confirm, delete on request**.
- **Temporal facts** have short TTLs; **durable facts** ride longer.
- **User-initiated deletion** must be meaningful (real removal, not shadow data).
- **Incognito / ephemeral session mode** for privacy-sensitive interactions.
- **Block lists** prevent re-inferring deleted facts.
- **Fast-track removal flow** for urgent user requests.
- **Build deletion plumbing early** — retrofitting under regulatory pressure is painful.

That wraps Module 4. Next: safety, approval, and shipping.
