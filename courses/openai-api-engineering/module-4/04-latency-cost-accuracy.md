---
module: 4
position: 4
title: "Latency, cost, accuracy — picking what to optimize"
objective: "Frame every AI engineering decision as a triangle of latency, cost, and quality, and pick the right knob for the problem at hand."
estimated_minutes: 11
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# Latency, cost, accuracy — picking what to optimize

## The puzzle

A PM asks: "Can we make the assistant faster, cheaper, and smarter?"

The answer is yes — but only along one axis at a time, and almost always at the expense of the others.

This is the fundamental tradeoff in AI product engineering. Every meaningful decision — model choice, prompt length, streaming vs. blocking, caching strategy, tool patterns — moves you along one or two of three axes:

- **Latency**: how fast the response comes back.
- **Cost**: how many dollars per call (or per million calls).
- **Quality**: how often the output is correct, complete, or helpful.

You can't always have all three. Engineering AI products well means knowing which axis matters most for *this specific feature* and tuning accordingly.

## The simple version

Think of it as a triangle. Push on any corner, the other two pull back.

- Faster usually costs more (smaller models lose quality; streaming adds engineering cost).
- Cheaper usually slower or lower quality (smaller models, batch API, less reasoning).
- Higher quality usually slower or more expensive (bigger models, reasoning, multi-step pipelines).

Two questions to ask for every feature:

1. **What's the cap?** ("Must respond in under 2 seconds." "Must cost under $0.01 per call.")
2. **What's the priority?** ("Quality first as long as we hit the latency cap." "Cost first as long as quality is acceptable.")

Once you've named the cap and the priority, the engineering decisions follow.

## The technical version

### The three axes in detail

**Latency** has several components:

- Time to first token (TTFT) — how long before the user sees anything. Critical for streamed UX.
- Total response time — how long until the full output is done. Critical for downstream code that waits.
- p50 vs. p95 vs. p99 — averages hide tail latency. Your worst 1% of calls might be 10× slower.

**Cost** is more than per-token price:

- Input token cost (typically lower).
- Output token cost (typically higher).
- Reasoning token cost (separate, often the largest line item for reasoning models).
- Cache hit discount (~50% off on cached prefixes).
- Embedding cost (cheap per call but adds up at scale).
- Multi-step amplification — agents that loop can spend 5–10× per user request.

**Quality** is multi-dimensional:

- Correctness (factually right).
- Completeness (covers what was asked).
- Faithfulness (sticks to provided context).
- Helpfulness (tone, structure, actionable).
- Safety (no jailbreaks, no PII leaks, no harmful output).

A model can score well on one quality dimension and poorly on another. Your evals (Lesson 4.3) should reflect the dimensions that matter for *your* product.

### Tradeoffs in practice

| Decision | Latency | Cost | Quality |
| --- | --- | --- | --- |
| GPT-5 → GPT-5-mini | faster | cheaper | usually slightly lower |
| Stream → block | feels slower | same | same |
| Add reasoning | slower | more expensive | better on hard tasks |
| Add few-shot examples | slower (longer prompt) | more expensive | usually better |
| Add RAG context | slower | more expensive | better on knowledge-heavy questions |
| Compact conversation | same | cheaper | slight context loss |
| Cache stable prefix | faster | cheaper | same |
| Batch API | much slower (~24h) | ~50% off | same |
| Tool use vs. one big prompt | slower (more calls) | more expensive | better for complex tasks |

These are heuristics, not laws. The right read is: every choice has predictable directional effects. Stack the ones that line up with your priority axis.

### Patterns by product type

Different products care about different axes:

**Real-time chat UI** — Latency matters a lot (especially TTFT). Quality matters a lot. Cost matters in aggregate but per-call is small.
- *Stack*: stream output, use mini-tier models by default, escalate to bigger model only when needed.
- *Tools*: prompt caching, conversation compaction.

**Background data pipeline** (categorize tickets, extract structured data from documents) — Latency doesn't matter at all. Cost matters a lot at volume. Quality must clear a threshold but doesn't need to be perfect.
- *Stack*: Batch API, smallest model that hits the quality bar.
- *Tools*: structured output, batched embedding requests.

**Voice agent** — Latency dominates everything. Anything over ~1 second feels broken.
- *Stack*: Realtime API, never use reasoning models in the hot path, pre-warm caches.
- *Tools*: token streaming, short prompts.

**Research agent** — Quality is everything. Latency of 30 seconds–5 minutes is acceptable. Cost per task can be high.
- *Stack*: reasoning models, multi-step pipeline, tool use, model judges.
- *Tools*: deep research, function calling, careful guardrails.

**Embedding-based search** — Latency must be sub-100ms after embedding. Cost at scale matters. Quality is "did we return the right docs."
- *Stack*: embeddings (smallest sufficient dimension), pre-indexed vectors, optional rerank step.
- *Tools*: text-embedding-3-large at 1536 dims, HNSW index.

### The model-tier ladder

When tuning the cost/quality axis, the cleanest lever is model tier. OpenAI offers (roughly, at the time of writing):

- **Nano tier** — cheapest, fastest, lowest capability. Good for classification, simple extraction, summarization of clean text.
- **Mini tier** — middle ground. Strong general capability at fraction of full-size cost. Default for most production traffic.
- **Full tier** (GPT-5) — top quality. Worth it for hard reasoning, nuanced writing, complex tool use.
- **Reasoning models** — best on complex multi-step problems, math, code. Slower and more expensive due to reasoning tokens.

A common production pattern: **router** at the top of the stack. A tiny model classifies "is this easy or hard?" then routes to the right tier. 80% of traffic goes to mini, 15% to full, 5% to reasoning. Cost stays low; quality stays high on the hard cases.

### When to invest where

A rule that holds across most teams:

1. **First**, make sure quality is acceptable on your eval set with the most expensive setup that's reasonable. Cost optimization on a broken product is pointless.
2. **Second**, optimize cost. Once quality is fine, look at: smaller models for easy turns, prompt caching, compaction, batch API for non-real-time work.
3. **Third**, optimize latency. Streaming for perceived speed, parallel tool calls, smaller models in the hot path.

Don't try to do all three at once on day one. Get quality right, then squeeze cost, then squeeze latency. Repeat.

### Latency optimizations beyond model choice

- **Stream output** — TTFT drops dramatically, perceived speed wins.
- **Cache stable prefixes** — saves processing time on the cached portion.
- **Parallel tool calls** — when an agent calls 3 tools that don't depend on each other, fire them in parallel, not serial.
- **Pre-fetch likely next calls** — if the next step is predictable, kick it off speculatively.
- **Smaller prompts** — every 1,000 tokens you cut is meaningful TTFT savings.
- **Edge regions** — call the API from a region close to your users.

The single biggest win for most products is **streaming + cache**. Both are nearly free engineering-wise and produce noticeable UX improvement.

### Cost optimizations beyond model choice

- **Prompt caching** — stable content first, byte-identical. ~50% off on cached prefix.
- **Compaction** — summarize long histories, cap input growth.
- **Batch API** — non-real-time, ~50% off.
- **Embedding deduplication** — don't re-embed the same text twice.
- **Cap output tokens** — `max_output_tokens` prevents runaway generations.
- **Tool gating** — don't include every tool definition on every call. Route to relevant ones.

A team running real production traffic without prompt caching and compaction is paying 3–5× too much. These two patterns alone often dwarf model choice.

### Quality optimizations beyond model choice

- **Better prompts** — clear instructions, examples, structured output. Often a bigger lever than model upgrade.
- **RAG** — give the model relevant context instead of relying on training data.
- **Tool use** — let the model fetch fresh data and take real actions.
- **Reasoning effort** — for reasoning-capable models, `medium` to `high` on hard problems.
- **Few-shot examples** — 2–5 examples in the prompt for narrow tasks.
- **Self-check / reflexion** — have the model review its own output before returning.
- **Model-based reranking** — generate N candidates, pick the best.

Note: these usually increase cost and latency. They live on the quality corner of the triangle.

### Measuring the triangle

You can't optimize what you don't measure. For every AI feature in production, track:

- **Latency**: p50 / p95 / p99 of total response time, TTFT.
- **Cost**: per-call cost, per-day cost, per-user cost.
- **Quality**: eval pass rate, user thumbs-up rate, escalation rate to humans.

Plot trends. A drift in any direction tells you something — a prompt change, a model upgrade, a traffic shift.

The teams that ship the best AI products treat these three as first-class metrics, the same way a SaaS team treats uptime and conversion.

## An analogy: the car triangle

You can have a car that's fast, fuel-efficient, or cheap. Pick two.

- Fast and efficient → expensive (electric sports car).
- Cheap and efficient → slow (compact economy).
- Fast and cheap → fuel-hungry (old muscle car).

AI engineering is the same. There's no model that's the smartest, fastest, and cheapest. There's only the *right* model for the constraint that matters most for this feature.

The skill isn't finding the perfect car. It's knowing what you're driving it for. Highway commute? Picking up kids? Track day? The right tradeoff differs.

## Three real-world scenarios

**Scenario 1: The chat product that traded latency for quality.**
A customer support team had GPT-5 answering every question at 4–8 second TTFT. Customers complained the bot felt slow. They added streaming, routed 80% of traffic to mini, kept GPT-5 for cases the router flagged as hard. TTFT dropped to under 1 second on average. Quality held on the hard cases. Cost dropped 60%.

**Scenario 2: The data pipeline that didn't need to be fast.**
A team was running GPT-5 in real time to classify support tickets as they arrived. Cost was high. They switched to a nightly Batch API job processing tickets in 24-hour windows. ~50% cost reduction with no impact — the downstream system didn't need real-time anyway. The mistake was using a real-time API for a batch problem.

**Scenario 3: The voice agent that got slower with reasoning models.**
A team added a reasoning model to their voice agent thinking it would "make it smarter." The reasoning model added 4–8 seconds of latency per turn. The agent felt broken; users hung up. They reverted. Lesson: reasoning models belong in research pipelines, not voice loops. Pick tools by the corner of the triangle that matters most for that feature.

## Common mistakes to avoid

- **Optimizing cost before quality is solid.** A cheap broken product is still broken.
- **Treating "smarter" as universally better.** Reasoning models in latency-critical paths kill UX.
- **Not measuring p95/p99.** Averages hide horrendous tail latency.
- **One model for everything.** Routing easy and hard turns is a major lever.
- **Ignoring prompt caching and compaction.** The two highest-ROI cost moves in production.
- **No metrics, no trends.** Drift goes unnoticed until it's a bill problem or a customer problem.

## Read more

- [Model optimization guide](https://platform.openai.com/docs/guides/optimizing-llm-accuracy)
- [Latency guide](https://platform.openai.com/docs/guides/latency-optimization)
- [Cost optimization](https://platform.openai.com/docs/guides/cost-optimization)

## Summary

- AI product engineering is a triangle of **latency, cost, and quality.** Pushing any corner pulls back the others.
- **Latency** has multiple components (TTFT, total, p95/p99). Streaming, caching, parallelism, smaller models help.
- **Cost** is shaped by tier, caching, compaction, batch API, output caps.
- **Quality** is multi-dimensional (correctness, completeness, faithfulness, helpfulness, safety). Better prompts, RAG, tools, reasoning effort move it up.
- **Pick the priority corner first**, then stack engineering choices that align.
- **Use a router** to send easy traffic to small models, hard traffic to big ones.
- **Measure all three axes** in production — without metrics, you're guessing.
- **Order of optimization: quality → cost → latency.** Get the product working, then make it cheap, then make it fast.

That wraps Module 4. You can now stream, manage state, cache, compact, eval, and reason about tradeoffs. The next module is the production polish — fine-tuning, reasoning models, multi-step workflows, and the launch checklist.
