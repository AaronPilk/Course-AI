---
module: 1
position: 4
title: "Tokens, context windows, and the things that decide your cost"
objective: "Predict the token cost of a request before you send it, and structure prompts to stay within budget."
estimated_minutes: 13
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# Tokens, context windows, and the things that decide your cost

## The puzzle

Two engineers build the "same" feature using OpenAI's API. Both work. Both ship.

A month later:

- Engineer A's feature costs the company $200 in API usage.
- Engineer B's feature costs the company $18,000.

Same model. Same number of requests. Same general functionality.

What's the difference? Engineer A understood tokens. Engineer B didn't.

By the end of this lesson, you'll know exactly where the cost in your OpenAI requests comes from, how to estimate it before you send a single byte, and the handful of patterns that drop cost by 50–90% on real workloads.

## The simple version

OpenAI charges you based on **tokens** — units of text the model reads and writes.

- **Input tokens** are billed for everything you send: system instructions, user message, conversation history, retrieved documents, function definitions, structured output schemas. *Everything.*
- **Output tokens** are billed for everything the model generates: the text response, tool calls, structured output fields, reasoning tokens (on reasoning models).

The two are usually billed at different rates — input is cheaper than output. The rates also differ wildly by model (nano vs mini vs full GPT-5 vs reasoning).

Your job as an engineer:

1. Estimate the token cost of each call.
2. Trim every place where tokens are being wasted.
3. Pick the model where the token cost is justified by the task.

Get this right and your API bill is manageable. Get it wrong and you ship a feature that quietly drains money.

## The technical version

### Counting tokens

A token is the unit the tokenizer produces from text. Rough conversions for English:

- 1 token ≈ 4 characters
- 1 token ≈ ¾ of a word
- 1,000 tokens ≈ 750 words ≈ 1.5 paperback pages
- 1,000 tokens ≈ 250–300 lines of code

A few real examples:

- `"Hello, world."` → 4 tokens
- `"The quick brown fox jumps over the lazy dog."` → 10 tokens
- A typical paragraph (50 words) → ~65–70 tokens
- A 1,000-word article → ~1,300 tokens
- A 50,000-word novel → ~65,000 tokens

The exact tokenization depends on the model family. OpenAI provides tools (the `tiktoken` library for Python, similar for JS) to count tokens locally before sending a request.

### What you're actually paying for, per request

A single API call has *more* token cost than people realize. Let's break down a typical chat completion call:

**Input tokens include:**
- The `system` / `instructions` message (or `developer` role in newer surfaces)
- All `user` messages in the conversation
- All previous `assistant` messages (echoed back to maintain context)
- Tool definitions (function schemas) — these can be hundreds of tokens each
- Structured output schemas — also non-trivial
- Any retrieved context (RAG results, file content, etc.)
- Special tokens added by the API for formatting

**Output tokens include:**
- The text content of the response
- Tool calls (function name + arguments)
- Structured output fields
- Reasoning tokens (on reasoning models) — typically billed at the input rate

A typical "simple" GPT-5-mini request might be:
- 200 tokens system instruction
- 500 tokens user message
- 50 tokens of function definitions
- = 750 input tokens
- 300 tokens response output
- = 1,050 total billable tokens

A typical "fancy" request with tools and RAG might be:
- 500 tokens system instruction
- 3,000 tokens of retrieved RAG context
- 200 tokens user message
- 800 tokens of function definitions (multiple tools)
- 200 tokens structured output schema
- = 4,700 input tokens
- 600 tokens response output
- = 5,300 total billable tokens

The "fancy" request is roughly **5× more expensive** than the simple one. Multiply across thousands of requests per day and the cost gap is dramatic.

### The cost of conversation history

This is the single biggest cost trap.

In a stateless API, to maintain a conversation, you re-send the full history with each new turn:

- Turn 1: send 200 tokens, receive 100 tokens. Billed: 300 tokens.
- Turn 2: send 200 + 100 + 200 = 500 tokens, receive 100. Billed: 600 tokens.
- Turn 3: send 500 + 100 + 200 = 800 tokens, receive 100. Billed: 900 tokens.
- ...
- Turn 20: send ~6,000 tokens, receive 100. Billed: ~6,100 tokens.

A 20-turn conversation costs roughly 20× a single turn — not 1× as users intuit. By turn 50, you're paying real money for every "hi" from the user.

Three mitigation patterns:

1. **Use the Responses API's `conversation` parameter.** Lets OpenAI manage history server-side, possibly with internal optimizations.
2. **Compaction.** Periodically summarize old turns into a much shorter summary, keep recent turns verbatim. Often 70–90% cost reduction.
3. **Truncation.** For very long conversations, drop older turns entirely. Hurts continuity but caps cost.

We go deeper on this in Module 4.

### The cost of tools

Every tool you define adds tokens to every request that uses it.

A typical function schema (JSON Schema describing the function name, parameters, types, descriptions) is 100–500 tokens. If your agent has 20 tools, you might be sending 2,000–10,000 tokens of tool definitions on every call — even if only one tool is used per call.

Three mitigation patterns:

1. **Don't define tools the model won't use.** Audit your function set; remove ones with no recent usage.
2. **Use dynamic tool sets.** Pick which tools to send based on the request (e.g., classify the request first, then send only the relevant tools).
3. **Use OpenAI's built-in tools** where possible. Built-in tools (web search, file search) are often more token-efficient than custom equivalents.

### The cost of structured output

If you use structured output (JSON schema mode), the schema is included in the input — and is typically a few hundred tokens.

Plus, the model has to generate the JSON structure character-by-character (or token-by-token), which means longer outputs than free-form text.

Generally worth the cost for reliability gains, but worth knowing about. For simple extractions, function calling can be more token-efficient than structured output.

### The cost of reasoning models

Reasoning models generate "thinking" tokens internally before producing output. You pay for these tokens.

A reasoning model call might:
- 200 input tokens (your prompt)
- 2,000 reasoning tokens (the model thinks)
- 300 output tokens (the answer)
- Total billable: 2,500 tokens at varying rates

Compared to the same input on a regular model:
- 200 input tokens
- 300 output tokens
- Total billable: 500 tokens

The reasoning model is roughly **5× more expensive** per call — *if it produces a comparable-quality answer*. For hard problems it does; for easy ones, you're paying 5× for the same answer.

### Prompt caching — the biggest single optimization

OpenAI supports **prompt caching**: when a prefix of your prompt is identical to a recently-sent prompt, the cached portion is billed at a much lower rate (often ~50% off, sometimes more).

This is huge. If you have:
- A long system instruction (2,000 tokens)
- A short, varying user message (50 tokens)

…and you make many requests, the 2,000-token system instruction is sent over and over. With caching, after the first call, the system prompt is cached and subsequent calls pay much less for it.

To make caching work:

1. **Put stable content at the start of your prompt.** System instructions, tool definitions, persistent context — all should be at the *beginning* so the prefix matches.
2. **Put variable content (user-specific input) at the end.**
3. **Keep prompts byte-identical across calls** for the parts you want cached. A single character difference invalidates the cache.

A pattern that works: structure every prompt as `[stable system instructions] + [stable RAG context if any] + [varying user input]`. The first two parts get cached after the first call.

### Batch and async modes

For non-real-time work (analytics, backfills, bulk processing), OpenAI offers:

- **Batch API** — submit a batch of requests; results come back within ~24 hours at roughly 50% off.
- **Flex processing** — similar discount for non-urgent processing.
- **Background mode** — for long-running tool-using flows.

If your workload doesn't need synchronous responses, these can cut costs in half. Always check whether your use case fits.

### Estimating cost before you build

For any feature you're about to ship, estimate:

```
cost_per_request = (avg_input_tokens × input_price) + (avg_output_tokens × output_price)
total_monthly_cost = cost_per_request × monthly_requests
```

Plug in real numbers from your prompt + a representative model price. If the answer is "$50/month," you're fine. If it's "$5,000/month," reconsider model choice or prompt structure before shipping.

A back-of-the-envelope for a typical feature:

- 1,000 input tokens × $0.40/1M × 100,000 requests = $40
- 500 output tokens × $1.60/1M × 100,000 requests = $80
- **Total: ~$120 for 100,000 GPT-5-mini calls**

Same task on full GPT-5 might be 5× that, on a reasoning model 10× that.

## An analogy: the meter on a taxi

When you take a taxi, you pay for two things: the distance traveled and the time spent. You can predict your fare before you get in if you know the route and the rates.

OpenAI's API is the same. You pay for:
- **The tokens you send in** (your input)
- **The tokens the model sends back** (your output)
- Different "destinations" (models) have different rates
- Tools and structured output have toll booths along the route
- Traffic (reasoning tokens) can add to the meter

Engineers who internalize this calculate their fare before getting in the taxi. Engineers who don't get surprised by the monthly bill.

The good news: most cost problems have predictable fixes. Shorter prompts. Smaller models. Prompt caching. Compaction. Fewer tools. Batch mode where appropriate. None require black magic.

## Three real-world scenarios

**Scenario 1: The system prompt that didn't need to be 8,000 tokens.**
A team had a 60-line system prompt with extensive instructions, examples, and edge case handling. Token cost per call: 8,000 input tokens. After auditing, half the instructions weren't load-bearing — the model behaved the same with a 1,800-token system prompt. They cut costs by 60%, with no quality drop. The lesson: prompts grow over time; audit them periodically.

**Scenario 2: The RAG system paying for irrelevant context.**
A RAG system stuffed the top 10 retrieved chunks into every prompt — sometimes 15,000 tokens of context for a question that only needed one or two chunks. After implementing a reranking step and reducing to top 3 chunks (often 3,000 tokens), token cost dropped 75% and answer quality improved (less noise in context).

**Scenario 3: The "$3,000 per day" surprise.**
A startup launched a chat feature. By day 3 their API bill was $3K/day. Audit found two compounding issues: (1) no conversation compaction — long chats were sending 50K+ tokens per turn, (2) they were on full GPT-5 instead of mini. After implementing compaction and moving most calls to mini, daily cost dropped to $200. Lesson: cost surprises are almost always the same handful of fixable patterns.

## Common mistakes to avoid

- **Not counting tokens before shipping.** Estimate. Always.
- **Ignoring input token cost.** Long system prompts and big RAG contexts can dwarf output cost.
- **Sending full conversation history forever.** Use compaction past ~10 turns.
- **Defining tools the model never uses.** Audit and prune the function set.
- **Putting variable content at the start of prompts.** Defeats prompt caching.
- **Running batch workloads in real time.** Use Batch API or Flex mode for ~50% off.
- **Switching to a bigger model to "fix" quality issues without measuring.** A better prompt on a smaller model often outperforms a worse prompt on a bigger model.

## Read more

- [Pricing](https://openai.com/api/pricing/) — Current per-token rates per model
- [Prompt caching guide](https://platform.openai.com/docs/guides/prompt-caching) — Setup and best practices
- [Counting tokens (tiktoken)](https://github.com/openai/tiktoken) — Local tokenizer for cost estimation
- [Batch API guide](https://platform.openai.com/docs/guides/batch) — 50% off for async workloads

## Summary

- You're billed per **input token** and per **output token**, at rates that vary by model.
- Input cost includes system instructions, conversation history, tools, schemas, and retrieved context — not just the user message.
- Conversation history grows linearly; cost per turn grows linearly with it unless you compact.
- **Prompt caching** is the single biggest optimization: stable content at the start, variable at the end, byte-identical across calls.
- **Reasoning models** add reasoning tokens to the bill — often a 5× cost multiplier.
- **Batch API** and **Flex mode** offer ~50% off for non-real-time work.
- Estimate cost per feature before shipping. The handful of common fixes (compaction, caching, smaller models, fewer tools, batch mode) solves 90% of real cost problems.

That wraps Module 1. You now have the working mental model of OpenAI's API: how the models work, which API surface to use, how to pick a model, and how to predict the cost. Every other module builds on this foundation.

Module 2 dives into the core capabilities: prompting, structured output, function calling, embeddings, multimodal. The actual day-to-day craft of building AI features.
