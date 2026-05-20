---
module: 4
position: 2
title: "Long-term memory and personalization"
objective: "Build a user profile + episodic memory that gets richer over time."
estimated_minutes: 9
---

# Long-term memory and personalization

## The puzzle

A user who's been with the assistant for a year should have a wildly better experience than a user who joined last week. Not because the model got smarter — because the assistant *knows* them. Knows their preferences, their projects, their recurring patterns, the things they care about.

Long-term memory is what makes that compound. Done right, the assistant gets better the longer you use it. Done badly, the assistant gets weirder, more confused, or more invasive.

## The simple version

Long-term memory has three layers:

1. **User profile**: durable facts (name, role, company, preferences, settings).
2. **Episodic memory**: summaries of past sessions, retrievable by topic or time.
3. **Lessons learned**: explicit notes the assistant (or user) wrote for future reference.

Layer 1 is small and structured. Layer 2 is bigger and searchable. Layer 3 is curated. Each gets richer with use.

## The technical version

### Layer 1: user profile

Structured, schema-defined, eager-loaded every session:

```js
{
  user_id: "u_abc",
  name: "Alex Chen",
  pronouns: "they/them",
  timezone: "America/Los_Angeles",
  role: "engineering manager",
  company: "ACME Inc.",
  preferences: {
    communication_style: "concise, no jargon",
    digest_time: "08:00",
    confidence_threshold: "medium"
  },
  active_projects: ["Q4 OKRs", "platform migration"],
  vip_contacts: ["sarah@x.com", "ceo@x.com"]
}
```

Small, deterministic, easy to manage. The user can review and edit. Promotes to system prompt every session.

### Layer 2: episodic memory

Each session ends with a 1-3 sentence summary; stored with metadata, embedded:

```js
{
  user_id: "u_abc",
  session_id: "s_123",
  summary: "Discussed Q4 OKRs. Decided on retention focus over growth for first 6 weeks. Identified 3 metrics to track.",
  topics: ["okrs", "Q4 planning", "retention"],
  embedding: [...],
  created_at: "2026-04-12T14:30:00Z"
}
```

At any new session: retrieve relevant episodic memories by embedding similarity to current message OR by topic tag OR by date range. Pull a handful into context.

### Layer 3: lessons learned

Small, curated, durable notes:

```js
{
  user_id: "u_abc",
  note: "User prefers tables over bullet points for comparison summaries.",
  source_session: "s_120",
  confidence: "high",  // user-confirmed
  created_at: "2026-04-10"
}
```

Two creation paths:

- **Assistant proposes**: "Should I remember that you prefer tables for comparisons?" User confirms or rejects.
- **User states**: "Always use tables for comparisons going forward." Assistant captures.

The user-confirmed flag is critical. Unconfirmed inferences should not go into lessons learned — they belong to lower-confidence working memory.

### Confidence tagging

Tag every long-term fact with confidence and source:

- **User-stated**: highest confidence. Survives long.
- **User-confirmed inference**: high. Survives.
- **Agent inference**: medium-low. Expires faster; needs re-confirmation.
- **Behavioral pattern**: lowest. Used as nudge, not rule.

When acting on a fact, weight by confidence. Low-confidence facts should not drive irreversible action.

### Personalization patterns

Long-term memory powers personalization across:

- **Tone and voice**: assistant adapts to user style.
- **Defaults**: assistant skips re-asking known preferences.
- **Anticipation**: assistant raises relevant context proactively ("you mentioned this project last week — want to continue?").
- **Filtering**: assistant filters out things the user doesn't care about.
- **Routing**: assistant uses preferred channels and timing.

Each is a small improvement; compounded, they're the difference between a generic AI and a coworker who knows you.

### Avoiding memory poisoning

Inferences become "facts" if you let them. Mitigations:

- **Tag inferences clearly** so they can be revisited.
- **Expire low-confidence inferences** after a window (30-90 days).
- **User review surface** ("here's what I remember about you").
- **Confirmation prompts** for important inferences ("you mentioned preferring X — should I remember that?").
- **Don't merge contradictions silently**: if new conflicts with old, ask.

Without these, the assistant becomes increasingly wrong about the user over time — and confidently so.

### Memory write strategy

Don't write to long-term memory every turn:

- **End of session**: summarize and persist.
- **Explicit user statement**: capture immediately ("remember that I prefer X").
- **Milestone events**: completed onboarding, finished project, made important decision.
- **Confirmed inferences**: when the user says "yes, remember that."

Continuous writes lead to bloat. Discrete writes are clean.

### Retrieval at session start

Default pattern:

- **User profile**: eager-load every session (small, always relevant).
- **Episodic memory**: lazy-retrieve when current context suggests relevance.
- **Lessons learned**: eager-load all (small, always relevant).

Eager-loading episodic memory is expensive (many tokens, often irrelevant). Use embedding-based retrieval to pull only what matters.

### Cross-user isolation

Every retrieval scoped strictly by user_id. Test for cross-user leaks explicitly:

- Eval case: "session for user A; does the agent ever surface user B's memory?"
- Should always be no. Bake this test into CI.

Cross-user leaks are major privacy incidents. Build the boundary into the storage layer, not just the application layer.

### User memory review

A "what I remember about you" UI:

- Lists user profile.
- Lists recent episodic memories.
- Lists lessons learned.
- Lets user edit, delete, or correct each.

Without review, users can't curate memory. Trust degrades. With review, users feel in control.

## Three real-world scenarios

**Scenario 1: The compound learning win.**
A team's assistant gathered episodic memory + lessons learned over 6 months. Long-time users had vastly better experience than new users — personalization was real. Onboarding shifted to emphasize "give it a week; it gets to know you." Retention compounded.

**Scenario 2: The inference that became a fact.**
The user said "I'm exploring Python" once. The assistant stored it as a high-confidence preference. Months later, every code example was in Python — but the user had moved to Go. They added inference confidence tagging and 30-day expiration on un-confirmed facts. Fixed.

**Scenario 3: The cross-user leak.**
A bug let user A's episodic memory surface in user B's session. Major incident. They added user_id as a mandatory filter at the storage layer + explicit eval cases for cross-user leak + bug bounty for similar issues. Never repeated.

## Common mistakes to avoid

- **No long-term memory** — assistant doesn't compound value.
- **All inferences treated as facts** — memory poisoning.
- **No confidence/source tagging** — can't distinguish reliable from unreliable.
- **No user review surface** — users can't correct.
- **Eager episodic memory** — costs balloon; irrelevant context confuses.
- **Cross-user retrieval bugs** — major privacy incident.

## Read more

- [OpenAI memory in ChatGPT](https://help.openai.com/en/articles/8590148-memory-faq)
- [Generative agents (Park et al.)](https://arxiv.org/abs/2304.03442)
- [Anthropic — long context](https://docs.anthropic.com/en/docs/about-claude/use-cases/long-context)

## Summary

- Three memory layers: **profile** (structured, eager), **episodic** (searchable, lazy), **lessons learned** (curated, eager).
- **Tag every long-term fact** with confidence and source.
- **Don't write to memory every turn** — discrete events only.
- **Eager-load profile + lessons; lazy-retrieve episodic** by relevance.
- **Cross-user scoping** at the storage layer, with eval coverage.
- **User review surface** is non-negotiable in trust-sensitive products.

Next: context retrieval for assistants.
