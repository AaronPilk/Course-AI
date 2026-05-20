---
module: 4
position: 4
title: "Long-term memory — vectors, episodic stores, and the lessons learned"
objective: "Build memory that survives sessions without poisoning future runs."
estimated_minutes: 10
---

# Long-term memory — vectors, episodic stores, and the lessons learned

## The puzzle

A user comes back. The agent has no idea who they are. Greets them like a stranger; asks for context they already provided last week.

The fix is long-term memory: state that persists across sessions. Done well, agents feel personal and improve over time. Done badly, agents drag forward stale context, contradict themselves, and inherit yesterday's mistakes.

## The simple version

Long-term memory has three flavors:

1. **Profile / preferences** — structured facts about the user (name, preferences, settings).
2. **Episodic memory** — summaries of past sessions, retrievable by topic.
3. **Lessons learned** — explicit notes the agent (or user) wrote for future sessions.

Each lives in a database, gets retrieved at session start (or on demand), and gets pruned over time.

## The technical version

### Profile / preferences

The simplest long-term memory: a structured user record:

```js
{
  user_id: "u_abc",
  name: "Alex",
  preferences: {
    timezone: "America/Los_Angeles",
    pronouns: "they/them",
    communication_style: "concise"
  },
  saved_context: {
    company: "ACME Inc.",
    role: "Engineering Manager"
  }
}
```

Load this at session start. Inject into the system prompt:

```
User profile:
- Name: Alex (use they/them pronouns)
- Timezone: America/Los_Angeles
- Style: concise
- Context: Engineering Manager at ACME Inc.
```

Cheap, deterministic, easy to manage. Use for stable facts the user has explicitly shared.

### Episodic memory

Past conversations stored as searchable summaries:

```
{
  user_id: "u_abc",
  session_id: "s_123",
  summary: "Discussed Q4 OKRs. User asked about prioritizing customer growth vs. retention. Concluded retention work for first 6 weeks. Agent suggested 3 metrics to track.",
  topics: ["okrs", "Q4 planning", "retention", "customer growth"],
  embedding: [...],
  created_at: "2026-04-12T14:30:00Z"
}
```

At session start (or when the user mentions a topic), search past summaries:

- By embedding similarity to the current message.
- By topic tag.
- By date range.

Pull the relevant ones into context. Now the agent "remembers" prior conversations.

### Lessons learned

A small table where the agent writes durable notes:

```
{
  user_id: "u_abc",
  note: "User prefers tables over bullet points for comparison summaries.",
  created_at: "2026-04-10",
  source_session: "s_120"
}
```

These get injected into the system prompt on future sessions:

```
Notes from past sessions:
- User prefers tables over bullet points for comparison summaries.
- User's preferred currency: USD.
- Avoid recommending tool X — user said they tried it and it failed.
```

The agent (or you) writes these via a `save_note` tool. Pruning happens periodically — old notes get rolled up or dropped.

### What to store: a hierarchy

In rough order of trust:

1. **Explicit user statements** ("I work at ACME"). Highly trustworthy.
2. **User-confirmed agent inferences** ("Should I save that you prefer X?" "Yes.") Trustworthy.
3. **Agent-inferred facts** (from conversation patterns). Lower trust; verify before acting on them.
4. **Automatic interaction patterns** (user clicks A more than B). Lowest trust; useful for nudging, dangerous for hard rules.

Higher trust = longer retention, more direct injection. Lower trust = use as gentle context, expire faster.

### The poisoning problem

Long-term memory can poison future sessions. Examples:

- Agent decided last week the user was an Android dev. They're not — but it was an inference from one ambiguous message. Now every session starts with "I'm helping with your Android dev work."
- A past resolution was wrong but recorded as canonical. New sessions inherit the error.

Mitigations:

- **Tag memories with confidence and source.** Recent + user-confirmed = high. Old + inferred = low.
- **Let users review and correct memories.** A "what I remember about you" UI surfaces stored facts.
- **Expire stale facts.** A 6-month-old preference may not still apply.
- **Don't merge memories silently.** If old and new contradict, surface the conflict to the user.

### Retrieval at session start

Two patterns:

**Eager**: load profile + recent episodic summaries every session. Always present in context. Cost: tokens on every call; usually small but adds up.

**Lazy**: load profile only at start; retrieve episodic memory on demand when the model decides it needs context. Cost: one extra retrieval tool call per session typically.

For most products, eager loading of profile + lazy retrieval of episodic memory is the right mix. Profile is cheap; episodic is on-demand.

### Vector stores for episodic memory

Episodic memory typically lives in a vector store (Pinecone, pgvector, Weaviate, etc.):

- Embed each session summary.
- Store with user_id metadata.
- At query time, embed current context, retrieve top-K nearest summaries scoped to user_id.

Same patterns as RAG (covered in Anthropic course Module 4) — just scoped per user.

### Permissions and privacy

Long-term memory is personal data. Take care:

- **Scope by user_id** so users can't see each other's memory.
- **Encrypt at rest** for sensitive content.
- **Delete on user request** — meaningful, not just soft-delete.
- **Audit access** — who's reading memory, when.
- **Region compliance** if you serve regulated jurisdictions.

A memory feature that leaks across users is a major incident. Build the boundaries before the feature ships.

### Memory + multi-agent

In multi-agent systems, decide who can read/write what:

- **Shared**: all agents see the user profile.
- **Per-agent**: each agent has its own scratch space.
- **Read-only**: specialists read memory but don't write — only a designated "memory agent" or your code writes.

The simplest pattern: only write to memory via explicit tool calls; restrict the tool to specific agents. Avoid every agent freely scribbling — debugging memory poisoning becomes impossible.

### Frequency of writes

Memory shouldn't be written every turn. Patterns:

- **End of session**: summarize and persist what happened.
- **On explicit "remember this"**: user-confirmed write.
- **On milestone events**: completed onboarding, completed task, made important decision.

Continuous memory writes lead to bloat and noise. Discrete events are easier to manage.

### Evaluating memory

Build evals for memory:

- **Recall**: did the agent remember a fact stated last session?
- **Boundedness**: did the agent NOT pull in irrelevant past context?
- **Update**: when a fact changed, did the agent use the new value?
- **Cross-user isolation**: did agent A's memory leak into user B's session?

Without these, memory bugs (poisoning, leaks, staleness) hide until they hit users.

## Three real-world scenarios

**Scenario 1: The agent that felt personal.**
A team added profile + episodic memory to their assistant. Sessions started with "Welcome back, Alex. Last time we worked on Q4 OKRs — want to continue?" Engagement metrics jumped. Lesson: memory done right makes AI feel like a partner, not a vending machine.

**Scenario 2: The poisoned profile.**
A user mentioned in passing they were considering Python. Agent stored "user prefers Python." Two months later, every session opened with Python-flavored examples. User actually preferred Go and was confused why the agent kept pivoting. They tagged stored facts with confidence + source; auto-expire unverified inferences after 30 days.

**Scenario 3: The cross-user leak.**
A bug in the retrieval scope meant agent A's session pulled in memory from user B. Major incident. They added user_id as a mandatory filter on every retrieval, plus an eval that explicitly tested for cross-user leaks. Never recurred.

## Common mistakes to avoid

- **No long-term memory at all.** Agent feels impersonal across sessions.
- **Memory written every turn.** Bloat; hard to manage.
- **No confidence/source tagging.** Poisoning is invisible.
- **Eager retrieval of everything.** Cost balloons; irrelevant context confuses agent.
- **No user-facing review.** Users can't correct bad memories.
- **Cross-user retrieval bugs.** Privacy incident waiting.
- **Memory ≠ training.** Don't think of memory as model improvement; it's per-user context.

## Read more

- [OpenAI memory in ChatGPT](https://platform.openai.com/docs/guides/memory)
- [LangChain memory documentation](https://python.langchain.com/docs/concepts/memory)
- [Generative agents (Stanford / Google)](https://arxiv.org/abs/2304.03442) — research perspective on long-term memory

## Summary

- **Long-term memory** persists across sessions: profile, episodic memory, lessons.
- **Profile** is structured and small; load eagerly.
- **Episodic memory** lives in a vector store, scoped per user; retrieve lazily.
- **Lessons learned** are explicit notes for future sessions.
- **Tag with confidence/source**; expire stale facts; let users review and correct.
- **Privacy and scoping** are non-negotiable — cross-user leaks are major incidents.
- **Eval memory recall, boundedness, updates, and cross-user isolation**.

That wraps Module 4. Next: evals, safety, and the agent launch checklist.
