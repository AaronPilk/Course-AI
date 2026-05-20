---
module: 4
position: 3
title: "Context retrieval for assistants"
objective: "Pull the right context at the right moment without flooding the prompt."
estimated_minutes: 8
---

# Context retrieval for assistants

## The puzzle

The user says: "What did we decide about the launch timing?"

The assistant has access to: this session, working memory, last 50 episodic summaries, user profile, calendar, Slack history, recent docs. *Where's the answer?*

Loading everything would explode tokens and pollute context. Loading nothing means the assistant can't answer. The art is retrieving *just the right context, just in time*.

## The simple version

Assistant context retrieval is RAG, but with multiple sources and a smarter routing layer. For each user message:

1. **Decide which sources** might be relevant (working memory? episodic memory? Slack? docs?).
2. **Retrieve from each** with embedding similarity + simple filters.
3. **Rerank** or combine into a tight context block.
4. **Inject** into the prompt for this turn.

Tight, fast, focused. The right context arrives without flooding.

## The technical version

### Multi-source retrieval

Assistants pull from many sources. Each is its own RAG-ish index:

- **Episodic memory** (past sessions).
- **Connector sources** (Slack, email, docs, code).
- **User profile / lessons learned** (eager-loaded usually).
- **External knowledge bases** (company wiki, product docs).

For each, you have an index (vectors + metadata) and a retrieval API.

### Source routing — which to check?

For a given query, not all sources are relevant. A "what's on my calendar?" doesn't need Slack history. A "what did Sarah say about X?" doesn't need user profile.

Two routing patterns:

**LLM-based**: a small fast model classifies which sources to check.

```
Given the user message, list which of these sources might contain relevant context:
- episodic memory
- slack
- calendar
- email
- docs

Output: JSON array of source names.
```

**Rule-based**: keyword/intent triggers route to specific sources.

```js
if (mentions(message, ["meeting", "calendar", "schedule"])) include("calendar");
if (mentions(message, ["@sarah", "told me", "said"])) include("slack", "email");
```

For v1, rule-based works fine. LLM-based scales better as sources grow.

### Retrieval per source

For each routed source, retrieve top-K relevant chunks:

```js
const slackResults = await slackIndex.query(message, { topK: 5, filter: { user_id } });
const emailResults = await emailIndex.query(message, { topK: 3, filter: { user_id } });
const episodicResults = await episodicIndex.query(message, { topK: 3, filter: { user_id } });
```

Always scope by user_id. Tight K (3-5 per source) keeps the prompt focused.

### Reranking and synthesis

Top-K from multiple sources can total 20+ chunks. Too many for the prompt. Patterns:

- **Combined rerank**: pool all results, rerank with a single rerank model, take top-N.
- **Per-source dedup**: drop duplicates (same content from multiple indexes).
- **Recency boost**: prefer recent items for time-sensitive queries.
- **Confidence threshold**: drop items below a similarity score.

Final injection: 5-10 high-quality chunks across all sources.

### Time-sensitive retrieval

For queries about "today," "yesterday," "this week" — bias retrieval by recency:

```js
const calendarResults = await calendarIndex.query(message, {
  topK: 10,
  filter: { user_id, date: { gte: today_start, lte: today_end + 1d } }
});
```

Date filters are usually cheap; apply them early to reduce retrieval cost and improve relevance.

### Surfacing what was retrieved

Make retrieval visible in the response:

```
[Based on your calendar today and last 3 Slack threads with Sarah]

Yes, you decided to push the launch to Nov 15 — Sarah confirmed this in #launch yesterday.
```

Citations or context tags tell the user where the answer came from. Builds trust + auditable.

### Cost control

Retrieval has cost:

- Embedding the query: cheap.
- Index lookups: cheap per call but adds up with many sources.
- Reranking: a small LLM call per query.
- Prompt cost: retrieved chunks live in input tokens.

For high-volume products:

- Cache retrievals for repeated queries.
- Skip sources unlikely to be relevant (rule-based routing).
- Trim retrieved chunks to the smallest useful size.

A typical assistant query retrieves and injects 2-3K tokens of context. If yours is much bigger, audit.

### Stale context

Connector content changes. The Slack message from last month may have been edited or deleted. Patterns:

- **Re-fetch metadata** on retrieval: pull current title, timestamp, URL.
- **Mark stale**: items older than X days flagged so the model knows.
- **Refresh index** periodically: re-embed changed content.

Stale context that's silently wrong is worse than no context. Build refresh and validation into your retrieval layer.

### Privacy in retrieval

Each retrieval honors user permissions:

- **User-scoped** by user_id (always).
- **Org-scoped** if you have multi-tenant data.
- **Permission-aware** within a user's content (e.g. don't pull from a Drive folder they no longer have access to).

Test cross-user and cross-permission leaks. Same pattern as long-term memory — privacy as architecture, not as policy.

### Hybrid: cached vs. live

For some queries, live API calls beat indexed retrieval:

- "What meetings do I have today?" — query Calendar API live.
- "What were we discussing last quarter?" — query the episodic index.

Decide per query type. Live is fresher but slower; indexed is faster but can be stale. Mix.

## Three real-world scenarios

**Scenario 1: The routing win.**
A team had every query retrieve from all 8 sources. Per-query latency was 4-6 seconds; cost was high. They added rule-based routing — most queries hit 2-3 sources. Latency dropped to 1-2s; cost dropped 60%. Same quality.

**Scenario 2: The stale Slack bug.**
A team's Slack RAG returned a 2-week-old conversation as the answer to a current question. The user had clarified in newer messages. They added recency boost + a 30-day refresh on the Slack index. Better answers.

**Scenario 3: The cross-permission leak.**
A user moved off a Slack channel. The Slack index still contained their old context; assistant surfaced it months later. They added permission-aware filtering at query time (cross-reference current Slack access). Fixed; subsequently caught in eval.

## Common mistakes to avoid

- **Retrieve from all sources for every query** — costly and noisy.
- **No reranking** — too many chunks; prompt pollution.
- **No recency awareness** — stale context dominates.
- **No permission filtering** — users see content they shouldn't.
- **Retrieved content not surfaced** — opaque answers feel like guesses.
- **No refresh strategy** — indexes drift from source of truth.

## Read more

- [Contextual Retrieval (Anthropic)](https://www.anthropic.com/news/contextual-retrieval)
- [Multi-vector retrieval patterns](https://docs.llamaindex.ai/en/stable/use_cases/multi-vector_retrieval/)

## Summary

- Assistant retrieval is **multi-source RAG with routing**.
- **Route queries to relevant sources** (LLM-based or rule-based).
- **Top-K per source**, then rerank/combine to 5-10 final chunks.
- **Recency boost** for time-sensitive queries; **date filters** to cut retrieval cost.
- **Surface what was retrieved** so users see where answers came from.
- **Permission-aware retrieval**: cross-user, cross-org, cross-permission all bake into the storage/query layer.
- **Refresh and validate**: stale silent wrong is worse than absent.

Next: when the assistant should forget.
