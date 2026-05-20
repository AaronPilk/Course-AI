---
module: 1
position: 4
title: "Tokens, context windows, and pricing"
objective: "Estimate tokens, plan around context limits, and reason about Claude's cost model."
estimated_minutes: 10
---

# Tokens, context windows, and pricing

## The puzzle

You're sketching a feature. The customer wants to "feed our whole knowledge base into Claude on every question." Sounds good — until you do the math and realize that's 80,000 tokens per call at $3 per million input tokens, and you'll do 10,000 calls a day.

That's $2,400 a day. $72,000 a month. For one feature.

Most cost surprises with Claude come from one place: not understanding tokens. This lesson is the mental model that prevents those surprises.

## The simple version

- A **token** is roughly 4 characters of English text. 1,000 tokens ≈ 750 words.
- You pay **per token in** and **per token out**. Output is more expensive than input.
- The **context window** is the total tokens (input + output) Claude can handle in one call — 200K on current models.
- **Prompt caching** discounts repeat-prefix content by ~90%.
- **Batch API** discounts non-real-time work by 50%.

If you can keep these five facts in your head, you can sanity-check the cost of any Claude feature on the back of a napkin.

## The technical version

### What a token is

Claude tokenizes text into subword pieces. Common words = one token. Rare words / punctuation / spaces = additional tokens. Code and non-English text tokenize less efficiently than English prose.

Rough conversions:

- 1 token ≈ 4 chars of English ≈ 0.75 words
- 1,000 tokens ≈ 750 English words ≈ 1.5 single-spaced pages
- 100K tokens ≈ 75,000 words ≈ a 250-page book

These are approximations. Use the token-counting endpoint for actual numbers.

### Counting tokens before you call

```js
const count = await client.messages.countTokens({
  model: "claude-sonnet-4-6",
  system: SYSTEM_PROMPT,
  messages: [{ role: "user", content: userInput }],
});

console.log("Input tokens:", count.input_tokens);
```

Pennies per call versus dollars on the real model. Use it to:

- Validate input fits the context window.
- Estimate cost per call.
- Detect when a prompt has grown beyond expectations.

### The context window

Current Claude models (Sonnet 4.x, Opus 4.x, Haiku 4.x) support **200,000 tokens** of context. Some models offer extended-context options. Always check the docs for the exact current limit per model.

This 200K includes everything in the request: system prompt + all messages + any documents + tools + the response. If you stuff 195K tokens of input, you only have 5K for the response.

In practice, you don't want to use the whole window:

- **Cost** scales linearly with input. Bigger prompts = bigger bills.
- **Quality** can degrade on extremely long contexts. Claude does well at long context, but for narrow questions, RAG is usually cheaper and faster.
- **Latency** scales with input. Big prompts = slow first token.

Rule of thumb: use long context when you need *the whole document* available for follow-ups; use RAG when you just need *the relevant 1–5%* of a large corpus.

### Pricing model

You pay separately for:

- **Input tokens** — what you send (system, messages, tools, documents).
- **Output tokens** — what Claude generates.

Output is more expensive than input. Cached input is discounted. Batch processing is discounted.

Exact prices change. As of writing:

| Tier | Input ($/M) | Output ($/M) | Cache hit ($/M) |
|------|------------|-------------|-----------------|
| Haiku | ~$0.80 | ~$4 | ~$0.08 |
| Sonnet | ~$3 | ~$15 | ~$0.30 |
| Opus | ~$15 | ~$75 | ~$1.50 |

Check the current [pricing page](https://docs.anthropic.com/en/docs/about-claude/pricing) before doing real math.

### Estimating cost on a napkin

For one call:

```
cost = (input_tokens × input_price / 1M) + (output_tokens × output_price / 1M)
```

Worked example. You're building a chatbot:

- System prompt: 2,000 tokens
- Conversation history: average 3,000 tokens
- User message: 200 tokens
- Response: 500 tokens

On Sonnet at $3/$15:

- Input: 5,200 tokens × $3/M = $0.0156
- Output: 500 tokens × $15/M = $0.0075
- **Total per turn: $0.023**

Now scale:

- 1,000 turns/day → $23/day → ~$700/month
- 100,000 turns/day → $2,300/day → ~$70K/month

This is why caching matters. With the system prompt cached, the same call drops to:

- Cached input: 2,000 tokens × $0.30/M = $0.0006
- Uncached input: 3,200 tokens × $3/M = $0.0096
- Output: 500 tokens × $15/M = $0.0075
- **Total: $0.018 (~22% cheaper)**

Stack that with compaction on history and you're often 60–90% off the uncached cost.

### Three numbers to know about your product

For any Claude-powered feature, you should be able to answer:

1. **Tokens per call** — input + output, average and p95.
2. **Calls per user per day.**
3. **Cost per active user per month.**

If you don't know these, you don't know your costs. If you do, you can make sane decisions about which tier, when to cache, when to batch, when to compact.

### Token-saving tactics ranked

In rough order of leverage:

1. **Prompt caching** — Module 5.1. ~90% off the cached portion.
2. **Compaction** — summarize long histories.
3. **Right-sizing the model** — Sonnet vs Haiku where appropriate.
4. **Shorter system prompts** — once you've fine-tuned, you may not need the long version anymore.
5. **RAG instead of stuffing** — retrieve only the relevant 1–5% of a corpus.
6. **`max_tokens` caps** — prevent runaway generations.
7. **Stop sequences** — end generation as soon as Claude finishes the structured output.

Most production wins are caching + compaction. Get those right before chasing the long tail.

## Three real-world scenarios

**Scenario 1: The chatbot that was 5× over budget.**
A team's Claude bill was $5K/week on a feature they'd budgeted $1K for. Audit: they were stuffing the full knowledge base (80K tokens) into every call. They switched to RAG with embedding-based retrieval — only the relevant 3K tokens per call. Bill dropped to $400/week. No quality regression.

**Scenario 2: The forgotten cache_control.**
A team had a 4,000-token system prompt and 50K daily calls — same prompt every time. They weren't using `cache_control`. Adding one parameter cut $1,200/month from the bill. The change was four lines of code.

**Scenario 3: The `max_tokens` rescue.**
An engineer noticed Claude occasionally generated 4,000-token monologues on a feature meant for one-paragraph answers. Set `max_tokens: 500` and added a stop sequence at `</answer>`. Tail-of-distribution cost cases disappeared.

## Common mistakes to avoid

- **Not knowing your per-call token count.** You can't reason about cost without it.
- **Stuffing the full corpus on every call.** RAG is almost always cheaper.
- **Skipping prompt caching.** It's a one-line change with ~90% discount on hits.
- **Forgetting `max_tokens`.** Lets bad calls run away.
- **Using Opus when Sonnet would do.** 5× more expensive for no real benefit on easy turns.
- **Sending raw long history instead of compacting.** Cost grows linearly per turn.

## Read more

- [Pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)
- [Token counting](https://docs.anthropic.com/en/api/messages-count-tokens)
- [Models and context windows](https://docs.anthropic.com/en/docs/about-claude/models/overview)

## Summary

- A **token** is ~4 chars of English. 1K tokens ≈ 750 words.
- Claude supports **200K-token context windows** on current models — but using all of it is rarely the right move.
- **Output costs more than input.** Cached input is ~10× cheaper than fresh input.
- **Estimate cost per call** using token count × pricing. Multiply by call volume.
- **Caching, compaction, and right-sizing** the model are the highest-leverage cost moves.
- Know your **tokens-per-call, calls-per-user, and cost-per-active-user**. Without those numbers you're flying blind.

That wraps Module 1. Next module: prompt engineering — the specific techniques Claude is trained for.
