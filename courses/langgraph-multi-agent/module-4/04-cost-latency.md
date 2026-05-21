---
module: 4
position: 4
title: "Cost and latency optimization"
objective: "Make agents fast + affordable in production."
estimated_minutes: 5
---

# Cost and latency optimization

## Where cost comes from

Agent costs:
- **LLM calls.** Per token; multiplied by reasoning loops.
- **Tool calls.** Some APIs cost (search, image gen).
- **Persistence.** DB storage + queries.
- **Infrastructure.** Compute hosting agent.

LLM calls usually dominate.

## Right-sized models

Use smallest model that works:
- Routing decision → small model (Phi 3.5, Llama 3.2 1B).
- Complex reasoning → large model (GPT-4, Claude 3.5 Sonnet).
- Simple text generation → mid (GPT-4o-mini).

Per-node model choice; mix in graph.

## Caching

For repeated computations:
- LLM call cache (same prompt → cached response).
- Embedding cache (same text → cached vector).
- Tool result cache (same query → cached result).

For: idempotent operations; huge savings.

## Streaming

For perceived latency:
- Show progress per node.
- Stream LLM tokens.
- User engaged during long generations.

Doesn't reduce actual latency; improves UX.

## Parallel where possible

Independent steps in parallel:
- Multi-source search concurrent.
- Multiple analyses concurrent.
- Save serial time.

For: latency reduction.

## Smart routing

Cheap model decides; expensive only when needed:
```python
def router(state):
    classification = small_model.invoke(state["query"])
    if classification == "simple":
        return "small_agent"
    return "large_agent"
```

For: 80% queries handled cheaply.

## Token budgets

Cap response length:
```python
llm.invoke(prompt, max_tokens=200)
```

Many responses don't need 1000 tokens. 200-500 suffices.

For: speed + cost.

## Tool minimalism

Each tool call = LLM input/output overhead. Use only needed tools.

For: fewer LLM round-trips.

## Recursion limits

Cap iterations:
- Default 25.
- Reduce to 10 for simple agents.
- Increase only when measured benefit.

For: bounded cost per query.

## Conversation compression

For long chats:
- Summarize old turns.
- Keep recent verbatim.
- Reduces context size = reduces cost.

For: long-running conversations.

## Monitoring + alerting

Track:
- Cost per conversation.
- P95 latency.
- Tool call frequency.
- Recursion depth.

Alert on anomalies (10x typical cost; >P99 latency).

For: catch issues early.

## Mistakes to avoid

- **All large models.** Wasteful for simple steps.
- **No caching.** Pay for repeated work.
- **No max_tokens.** LLM generates novellas.
- **No monitoring.** Surprise bills.
- **Sequential when parallel possible.** Slow.

## Summary

- LLM calls dominate cost.
- Mix model sizes per node.
- Cache + stream + parallel.
- Token budgets + tool minimalism.
- Monitor cost + latency + alert.

Module 5 next: real-world agent systems.
