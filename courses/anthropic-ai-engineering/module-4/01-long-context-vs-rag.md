---
module: 4
position: 1
title: "Long context with Claude — when to stuff vs. retrieve"
objective: "Decide between long-context stuffing and RAG for your data size and access pattern."
estimated_minutes: 11
---

# Long context with Claude — when to stuff vs. retrieve

## The puzzle

Claude supports 200K-token context windows on current models. That's roughly a 250-page book in a single prompt. The temptation is obvious: just stuff the whole knowledge base in and let Claude figure it out.

Sometimes that works. Often it doesn't — and even when it does, you pay 10–50× more per call than you needed to.

This lesson is the decision framework: when to stuff context, when to retrieve, and when to do both.

## The simple version

Three options for connecting Claude to your data:

1. **Stuff** — put everything in the prompt. Works for small data, single sessions, or when every part might matter.
2. **Retrieve (RAG)** — embed your data, pull the relevant 1–5% per query. Works for large corpora, high volume, narrow questions.
3. **Hybrid** — RAG to filter, then stuff a generous selection. Sweet spot for many production systems.

Heuristic: if your data fits in 10K tokens and you'll re-use it across many turns of one conversation, stuff. If it's 100K+ and most queries touch a small slice, RAG. In between, run an eval on both.

## The technical version

### What 200K tokens really means

200K tokens ≈ 150,000 English words ≈ 500 pages of a typical PDF (single-spaced). The model can read all of it. The questions are:

- Can it **find** the relevant information reliably?
- Can you **afford** to send that many tokens on every call?
- Will users tolerate the **latency**?

Long context is real and useful, but it doesn't make all your other problems disappear.

### Stuffing — when it's right

Stuff context (no retrieval step) when:

- Your data fits in 10–30K tokens *and* most queries touch most of the data.
- You're processing a single document end-to-end (one PDF, one transcript, one long email).
- You have a small reference set (your company's pricing page, refund policy, top 20 FAQs).
- The conversation is multi-turn over the same document.

For these cases, stuffing is simpler, cheaper to build, and yields perfectly grounded answers.

### Stuffing — when it's wrong

Stuff is the wrong choice when:

- The corpus is 100K+ tokens but most queries touch a small slice.
- Volume is high (thousands of calls/day on the same corpus).
- Different users have different access scopes (you can't ship one user's data to another).
- The data updates frequently and you'd be re-uploading constantly.

In these cases, RAG cuts cost and latency dramatically.

### RAG — when it's right

Retrieval-Augmented Generation works well when:

- You have a large knowledge base (docs, tickets, code, slack history).
- Queries are narrow (most touch <5% of the corpus).
- You want citation / source linking.
- You serve many users / many queries against the same data.
- You can pre-process the data into chunks once and reuse forever.

The pattern: embed the corpus → store vectors → at query time, embed the query, retrieve top-K relevant chunks, pass those as context.

### Basic RAG with Claude

The "Claude part" of RAG is the prompt structure:

```
You answer questions using ONLY the information in <context>. If the answer isn't there, say so — don't make things up.

<context>
[chunk 1]
[source: docs/refund-policy.md, line 42]

[chunk 2]
[source: docs/shipping.md, line 18]

[chunk 3]
[source: faqs/returns.md, line 5]
</context>

<question>${userQuestion}</question>
```

The retrieval step (which chunks to include) happens in your code — typically with embeddings and a vector index. Claude's job is to answer faithfully from what you give it.

Embeddings on Anthropic's stack: Anthropic doesn't currently ship its own embedding model; most production Claude RAG uses Voyage AI's embeddings (Anthropic's recommended partner) or OpenAI's text-embedding-3-large.

### Hybrid — long context + retrieval

For corpora in the 100K–500K token range, the sweet spot is often:

1. **Retrieve** — get the top 50–100 chunks (much more than a typical RAG top-5).
2. **Stuff** — pass all of them into Claude's long context.
3. **Let Claude pick** — it can handle 50K of relevant context easily; it's better at synthesizing across many chunks than a re-ranker is.

This is the pattern Anthropic uses in their docs assistant. It's more expensive than narrow RAG but produces synthesis that narrow RAG can't.

### Long context quality drift

Claude is good at long context, but quality isn't perfectly uniform:

- **Top of context** (right after the system prompt) is well-attended.
- **Bottom of context** (right before the user message) is well-attended.
- **Middle** of a 100K-token prompt gets less attention.

Practical implications:

- Put critical instructions and the user query at the bottom.
- Put the most relevant retrieved chunks at the top.
- Don't bury must-use information in the middle of a giant prompt.

### Cost reality check

A simple comparison. Assume Sonnet at $3/M input.

**Stuff 80K tokens × 10K calls/day** = 800M input tokens/day = **$2,400/day** ($72K/month) just on input.

**RAG with 3K chunks per call × 10K calls/day** = 30M input tokens/day = **$90/day** ($2.7K/month).

Same workload, ~27× cheaper. This is why nobody stuffs 80K-token corpora on every call in production. Stuff if small; RAG if not.

### Latency reality check

Time to first token scales with input length. A 100K-token input takes meaningfully longer than a 5K-token input. For interactive products (chat UIs especially), users notice.

For background pipelines, latency may not matter — stuff freely.

### Caching changes the math

Anthropic's prompt caching (Lesson 5.1) discounts cached prefixes ~90%. If your stuffed corpus is *stable* and repeated across calls, caching can make stuffing competitive again. The math:

- Stuff 80K cached + 200-token query + 500-token output.
- Cached input: 80K × $0.30/M = $0.024
- Fresh input: 200 × $3/M = $0.0006
- Output: 500 × $15/M = $0.0075
- **Per call: ~$0.032**

Versus RAG (no cache): $0.009 + $0.0075 = $0.017.

So even with caching, RAG is still cheaper for high-volume workloads on stable corpora. But the gap narrows enough that "stuff + cache" becomes a real option for medium-sized data where building real RAG isn't worth it.

### Decision flowchart

```
Is your corpus < 30K tokens?
  Yes → Stuff. Add cache_control if calls repeat.
  No  → Continue.

Are most queries narrow (touch <5% of the corpus)?
  Yes → Build RAG (embeddings + vector search + top-K retrieval).
  No  → Continue.

Is the synthesis quality of stuffed long context better than your re-ranker?
  Yes → Hybrid: retrieve generously (top 50–100), stuff into long context.
  No  → Tighter RAG (top 5–10 chunks).
```

Always validate with evals. The right answer for your data depends on the shape of your queries.

## Three real-world scenarios

**Scenario 1: The team that didn't need RAG.**
A team built a customer support bot for a product with a 12K-token doc set. They were about to build vector search and embeddings. Someone proposed: just stuff the docs in the prompt with caching. Two-day build vs. two-week build. Same quality. They shipped the simpler version and have never regretted it.

**Scenario 2: The team that learned why narrow RAG is hard.**
A team built narrow RAG (top-5 chunks) over a 500K-token research corpus. Quality was uneven — sometimes the right chunk wasn't in top-5. They switched to hybrid: top-50 chunks stuffed into long context. Quality jumped because Claude could synthesize across chunks the way the re-ranker couldn't. Cost went up 4× but value justified it.

**Scenario 3: The forgotten access control.**
A team stuffed company-wide docs into every prompt. A user from team A saw an answer that referenced confidential team-B information. They moved to RAG with per-user scopes — retrieval only pulls chunks the user has permission to see. Access control became a property of the retrieval step, not the prompt.

## Common mistakes to avoid

- **Stuffing huge corpora "because it's easy."** Cost compounds at scale.
- **Building RAG before checking if stuffing fits.** For small docs, RAG is overkill.
- **Ignoring caching when stuffing.** Repeat calls without cache_control burn money.
- **Burying critical info mid-prompt.** Move it to the top or bottom.
- **No access control on shared knowledge bases.** Different users need different scopes.
- **Top-5 RAG when synthesis is needed.** Some questions need many chunks; configure K accordingly.

## Read more

- [Long context use cases](https://docs.anthropic.com/en/docs/about-claude/use-cases/long-context)
- [Embeddings (Voyage AI integration)](https://docs.anthropic.com/en/docs/build-with-claude/embeddings)
- [Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)

## Summary

- Claude supports **200K token context**, but using it indiscriminately is rarely the right move.
- **Stuff** small corpora (<30K tokens) — simpler, often cheaper with caching.
- **RAG** for large corpora and narrow queries — much cheaper, faster, supports access control.
- **Hybrid** (generous retrieval + long-context synthesis) is the sweet spot for mid-large corpora needing synthesis.
- **Caching changes the math** — sometimes makes stuffing competitive.
- **Place critical info at the top or bottom** of long prompts; middle gets less attention.
- **Always validate with evals.** The right pattern depends on your query distribution.

Next: Contextual Retrieval — Anthropic's RAG upgrade that drops retrieval failures 40–67%.
