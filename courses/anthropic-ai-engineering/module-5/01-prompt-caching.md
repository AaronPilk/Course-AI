---
module: 5
position: 1
title: "Prompt caching with Claude — 90% cost cuts on repeated context"
objective: "Use cache_control breakpoints to slash bills on repeated prompts."
estimated_minutes: 11
---

# Prompt caching with Claude — 90% cost cuts on repeated context

## The puzzle

Your chatbot has a 4,000-token system prompt and tool definitions that don't change. You send them on every single call. Across 50,000 daily calls, that's 200M repeated input tokens paid at full price — every day.

Anthropic's **prompt caching** is the fix. Mark stable content as cacheable, and repeated calls pay roughly **10%** of the normal input cost on the cached portion. For most chat and agent products, this is the single biggest cost lever in production.

## The simple version

Add `cache_control: { type: "ephemeral" }` to a content block. Anthropic caches it. Subsequent calls that share that exact prefix pay ~10% for the cached portion. The cache lasts ~5 minutes (extendable to 1 hour with a paid setting).

Two rules:

1. **Cache the stable, expensive parts** — system prompt, tool definitions, few-shot examples, document context.
2. **Put variable content after cached content.** Cache only hits prefixes; if user input comes first, nothing gets cached.

## The technical version

### Mechanics

Caching works on prefixes. Each `cache_control` breakpoint creates a cacheable region from the start of the prompt up to (and including) that block. Subsequent calls that match that prefix byte-for-byte hit the cache.

```js
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  system: [
    {
      type: "text",
      text: LARGE_SYSTEM_PROMPT,                    // 3,000 tokens
      cache_control: { type: "ephemeral" }
    }
  ],
  tools: [
    ...TOOL_DEFINITIONS                              // 1,500 tokens
  ],
  messages: [
    { role: "user", content: userQuestion }          // variable, after cached blocks
  ]
});
```

Pricing math at Sonnet rates (input $3/M, cache hit $0.30/M):

- **First call**: write to cache = 4,500 input tokens × $3.75/M (writes cost slightly more) ≈ $0.017
- **Subsequent calls** within 5 min: 4,500 cached × $0.30/M + variable bits ≈ $0.0014 on the cached portion

That's roughly **8% of the original cost** on repeat calls. Across thousands of calls per day, the savings compound dramatically.

### What counts as the same prefix

The cache matches **byte-identical prefixes**. A single character difference at byte 500 invalidates the cache from byte 500 onward.

Implications:

- **Don't insert timestamps or user IDs into the system prompt** unless you want a per-user cache (which costs more to maintain).
- **Don't reorder tool definitions** dynamically — that breaks the cache.
- **Don't recompute the prompt on every request** — the templating must be deterministic.

The simplest pattern: define your stable system prompt and tool array as constants. Don't touch them. Variable content goes only in `messages`.

### Cache breakpoints

You can place up to 4 `cache_control` breakpoints in a single request. This lets you cache multiple layers:

```js
// Breakpoint 1: stable system prompt
system: [
  { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }
],

// Breakpoint 2: stable few-shot examples
messages: [
  {
    role: "user",
    content: [
      { type: "text", text: FEW_SHOT_EXAMPLES, cache_control: { type: "ephemeral" } },
      { type: "text", text: realUserQuery }
    ]
  }
]
```

Each breakpoint caches the prefix up to and including itself. Use multiple breakpoints when you have stable sections that might appear in different combinations across calls (e.g. some calls include examples, others don't — both get cache hits).

### Long context + caching = the sweet spot

The biggest wins from caching come on very long contexts:

- **A 100K-token corpus** stuffed into the prompt costs $300 per call without caching.
- **With caching**, repeat calls cost ~$30. After ~10 calls, you've amortized the cache write.

This is why "stuff + cache" can compete with RAG for medium-sized corpora (Lesson 4.1). For corpora that fit in context AND see lots of queries, caching makes stuffing economical.

### TTL — short vs. long

Default cache lives 5 minutes after the last hit. After 5 minutes of inactivity, it expires.

A paid 1-hour cache TTL is available for higher-traffic scenarios. Use it when:

- Calls are sporadic but you want them to hit cache.
- You have a sustained workload where 5-minute idle gaps are common.

Costs slightly more to maintain but worth it for predictable hit rates.

### Verifying cache hits

Check the response's `usage` field:

```js
console.log(response.usage);
// {
//   input_tokens: 200,           // fresh input
//   cache_creation_input_tokens: 0,
//   cache_read_input_tokens: 4500,  // cached input — discounted
//   output_tokens: 350
// }
```

If `cache_read_input_tokens` is 0 when you expected a hit, something's wrong:

- Prefix doesn't match (check for whitespace, ordering, dynamic content).
- Cache expired.
- This is the first call (write, not read).

Log these per request — they're the canary for cache misconfiguration.

### Common caching patterns

**Stable system prompt, variable user message:**

```js
system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
messages: [{ role: "user", content: userMessage }]
```

**System + tool definitions:**

```js
system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
tools: TOOLS,  // tools are part of cached prefix
messages: [...]
```

**Document Q&A (cache the document):**

```js
messages: [{
  role: "user",
  content: [
    { type: "document", source: { ... }, cache_control: { type: "ephemeral" } },
    { type: "text", text: userQuestion }
  ]
}]
```

**Multi-turn chat with stable system + history compaction:**

```js
system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
messages: [
  ...compactedHistory,
  { role: "user", content: latestMessage }
]
```

### What NOT to cache

- **Truly variable content.** The user's specific question, the latest tool result, anything that changes per call.
- **One-off small prompts** under ~1K tokens. Cache writes have overhead; not worth it for short content.
- **Per-user PII you don't want sitting in cache.** Caches are scoped to your account but still: if it's sensitive, evaluate retention policies.

### Caching + Contextual Retrieval pipeline cost

Recall from Lesson 4.2: Contextual Retrieval generation is one Haiku call per chunk, with the whole document repeated. Caching the document on each call costs ~10% of the per-call rate. A 1M-token corpus with 2,000 chunks goes from ~$60 in generation cost down to ~$6. Effectively pennies per corpus.

This same pattern applies everywhere you call Claude repeatedly with overlapping context — caching is the make-or-break feature.

## Three real-world scenarios

**Scenario 1: The bill cut in half overnight.**
A team's bot was $8K/month on Sonnet. System prompt + tool definitions = ~4K stable tokens. They added two `cache_control` breakpoints. Next month's bill: $4.2K. One PR, half the cost, no quality regression.

**Scenario 2: The cache that didn't hit.**
A team added `cache_control` and saw no improvement. `cache_read_input_tokens` was always 0. Audit: they were templating a timestamp into the system prompt on every call. Removed the timestamp, cache hits started, cost dropped.

**Scenario 3: The 1-hour TTL upgrade.**
A team's product had bursty traffic — many calls within 10 minutes, then quiet for 20 minutes, then more bursts. Default 5-min TTL meant 1/3 of cache writes paid full price again. They upgraded to 1-hour TTL. Hit rate went from 70% to 96%. Net cost dropped 25% despite the slightly higher TTL price.

## Common mistakes to avoid

- **Forgetting `cache_control` entirely.** The default is no caching. You must opt in.
- **Variable content (timestamps, user IDs) in the cached prefix.** Cache never hits.
- **Variable content before stable content.** Cache never hits because prefix doesn't match.
- **Caching tiny prompts.** Not worth the write overhead under ~1K tokens.
- **Not monitoring `cache_read_input_tokens`.** No visibility = no debugging.

## Read more

- [Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [Prompt caching cookbook examples](https://github.com/anthropics/anthropic-cookbook)

## Summary

- **Prompt caching** discounts repeated prefix content by ~90% on Claude.
- Add `cache_control: { type: "ephemeral" }` to stable content blocks.
- **Cache the system prompt, tool defs, examples, stable documents.** Variable content goes after.
- Up to **4 breakpoints per request** — layer caches for different prefix patterns.
- Default TTL is **5 minutes**; **1-hour TTL** available for bursty traffic.
- **Verify hits** with `usage.cache_read_input_tokens` on every response.
- For chat / agent / RAG products, this is **the single biggest cost lever** in production.

Next: Message Batches — non-real-time work at half price.
