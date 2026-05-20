---
module: 1
position: 1
title: "How OpenAI's models actually work (no math required)"
objective: "Build a working mental model of how LLMs generate text — enough to predict their behavior in your code."
estimated_minutes: 14
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# How OpenAI's models actually work (no math required)

## The puzzle

You're about to ship a feature that uses GPT to summarize customer support tickets. You write a prompt. You test it on 10 tickets. It works perfectly.

You ship it. Within a day, you discover:

- It sometimes makes up information that wasn't in the ticket.
- It sometimes refuses tickets that should be fine.
- It returns different results when you ask the same question twice.
- It rambles on tickets longer than 2,000 words.
- It costs 10× more than your estimate when traffic peaks.

You knew none of these were guaranteed risks because you didn't have a mental model of *how the model actually works*. You were treating it as a black box.

This lesson is the model. You won't learn the math. You won't learn the transformer architecture in detail. What you'll learn is the *behavioral model* that lets you predict, before you ship, what the model will do.

## The simple version

OpenAI's models — GPT-5, the reasoning models, the embeddings models — are all variations on one core idea: **they predict the next token in a sequence, one token at a time.**

Everything you observe about their behavior follows from that:

- They generate text by predicting the next likely token, then the next, then the next.
- They have a fixed-size *context window* — the maximum amount of input + output they can see and produce at once.
- They have *no memory* between requests. Each API call is a clean slate.
- They sometimes "hallucinate" because predicting the next likely token can produce a confident-sounding sentence that happens to be false.
- They cost more on longer inputs and outputs because every token requires computation.

If you internalize this — a token-by-token next-token predictor with no memory and a fixed window — you've internalized enough to predict most LLM behavior in your code.

## The technical version

### What's a token?

A **token** is the unit the model reads and writes in. It's not a character. It's not a word. It's something in between.

Some rough rules of thumb for English:

- One token ≈ 4 characters of common text
- One token ≈ ¾ of a word
- 1,000 tokens ≈ 750 words ≈ 1.5 pages of a paperback book

The actual tokens are determined by a **tokenizer** — a deterministic algorithm that converts your text into a sequence of integers (token IDs). Different model families use different tokenizers, which is why "the same prompt" can be a different number of tokens in different models.

When you send a request, OpenAI:

1. Tokenizes your input.
2. Passes the token sequence through the model.
3. Has the model predict the *next most likely token* given the sequence so far.
4. Appends that token to the sequence.
5. Repeats steps 3–4 until the model decides to stop (or hits your `max_tokens` limit).
6. Detokenizes the output back to text.

That whole process happens server-side. You don't see the intermediate tokens unless you stream the response.

### Why this matters for your code

The next-token-prediction model explains many quirks:

**1. Output isn't deterministic.** At each step, the model picks among several "likely" next tokens probabilistically. Setting `temperature: 0` makes it pick the single most likely token at each step, which makes runs *more* repeatable — but not always identical, because of subtle hardware-level non-determinism. If you absolutely need the same output for the same input, you have to test repeatability and possibly cache.

**2. Hallucination is a feature, not a bug.** The model's job is to predict plausible-sounding text. Sometimes the most plausible continuation is something false. This isn't a malfunction; it's the model doing what it was designed to do. The fix isn't to "tell the model not to hallucinate" — the fix is to give it enough context (via retrieval, structured data, or examples) that the most plausible continuation is also correct.

**3. Long inputs degrade quality.** As input grows, the model's attention spreads thinner. Important details buried in the middle of a 50,000-token input often get less weight than the same details in a 2,000-token input. This is known informally as the "lost in the middle" problem. Strategies: put critical information near the start or end, or use retrieval to surface only the relevant context.

**4. The model can't remember between calls.** Every API request is stateless. The model doesn't know what you asked it yesterday. If you want a conversation, you have to *send the full conversation history each time* (or use a `conversation` parameter the API persists for you). This has direct cost implications — long conversations get expensive.

**5. Output length affects cost and latency proportionally.** Each output token costs the same amount of compute regardless of what it is. Asking for "a one-line answer" vs "a detailed paragraph" can be a 10× difference in cost for the same input.

### The context window

Every model has a maximum **context window** — the total number of tokens (input + output) it can handle in a single request.

Current GPT-5 family models support windows in the 200K+ token range. That's roughly 150K words of input + output combined.

The window matters for three reasons:

1. **Hard ceiling.** If your request exceeds the window, the API returns an error.
2. **Practical ceiling.** Even when you fit in the window, very long inputs degrade output quality.
3. **Cost ceiling.** Long inputs cost more — and you pay for the full input length even if the model produces short output.

A common engineering decision: when context is long, do you stuff it all in (simple, expensive, sometimes lower quality), or use retrieval to send only the relevant slices (more code, cheaper, often better quality)? Module 2 covers retrieval in depth.

### Reasoning models vs. regular models

A newer development: **reasoning models** like the o-series and GPT-5-thinking variants.

The difference, behaviorally:

- A regular model reads the input and starts producing output immediately, token by token.
- A reasoning model produces "thinking" tokens internally first, then produces the final output.

The thinking tokens are tokens the model uses to work through the problem before answering. They cost money (they're billed as reasoning tokens). They make the model slower (latency increases). They make the model meaningfully more accurate on hard problems (math, code, complex reasoning).

For engineering decisions:

- Use a reasoning model when the task is hard and accuracy matters more than latency/cost.
- Use a regular model when speed and cost matter and the task is well-defined.
- The `reasoning_effort` parameter (where supported) lets you tune how much thinking happens — `minimal` is fast and cheap, `high` is slow and accurate.

We go deeper on model selection in Lesson 1.3.

### What the model doesn't know

A list of things people often assume the model knows but doesn't:

- **The current date.** Unless you tell it in the prompt or system message.
- **The user's identity, location, or preferences.** Unless you tell it.
- **Anything that happened after its training cutoff.** Models have a knowledge cutoff date. OpenAI publishes this; treat anything after that date as something the model doesn't know unless you provide it via tools or retrieval.
- **What you discussed in a previous API call.** Unless you re-send the relevant context.
- **The tools available to it.** Unless you describe them in the function calling schema.

The pattern: **the model only knows what's in its context window for this specific request.** Treat it as a brilliant but amnesiac contractor who walks in with no notes from previous meetings.

### The cost model in one sentence

You pay for every token going in (input tokens) and every token coming out (output tokens), at different rates. The rates depend on the model. Some operations — function calling, structured output — add a small overhead. Some optimizations — prompt caching, batch mode — cut cost significantly.

We cover the cost game in detail in Module 4. For now: every token costs money, and that's enough to predict the rough economics of any feature you might build.

## An analogy: the world's most well-read amnesiac contractor

Imagine you're working with a contractor who has read essentially every book, paper, and webpage on the internet up to a certain date. They speak fluently on almost any topic. They write well. They follow instructions.

But:

- They have **no memory** between meetings. Every meeting starts fresh.
- They don't know **what's happened recently**. Only what was in the books up to a certain date.
- They are **paid by the minute** — both for listening (input) and for talking (output).
- They have a **maximum meeting length** — they can only process so much in a single session.
- They're sometimes **confidently wrong** — they'll say things that sound right but aren't, especially when they're filling gaps in what they know.
- They **can't pick up the phone** unless you give them a phone and tell them how to use it (this is what tools are).

Almost every engineering decision you make with OpenAI's APIs is a consequence of this profile. Want them to remember the last meeting? Send the notes again. Want current information? Build a tool that fetches it. Worried about cost? Give shorter inputs and ask for shorter outputs. Worried about accuracy? Use a reasoning model or provide better context.

If you keep this picture in mind, the API will rarely surprise you.

## Three real-world scenarios

**Scenario 1: The "but I told it" bug.**
A team built a feature where the user picks a date range, then GPT summarizes activity during that range. The first version worked great — until they noticed reports for "last week" sometimes included data from three years ago. The bug: the date range was set in the UI but never passed to the model. The model was inferring "last week" from its training data — and "last week" in its training data was years ago. The fix: explicitly tell the model the current date and the requested date range in every prompt.

**Scenario 2: The "lost in the middle" RAG system.**
A startup built a RAG (retrieval-augmented generation) system for legal documents. They retrieved relevant document chunks and stuffed them all into the context — sometimes 50,000 tokens of context. The model's accuracy on the user's question was inconsistent. They discovered details placed in the middle of the context were often ignored. The fix: rerank retrieval results so the most relevant chunks appear near the start (and a copy near the end). Accuracy improved substantially.

**Scenario 3: The runaway cost incident.**
A team built a chat product. Each turn, they sent the full conversation history to the API. The first 10 messages cost pennies. By turn 50, individual API calls were costing $0.40 each because the input was now 200,000 tokens. Their cost projection was wrong by an order of magnitude. The fix: implement **conversation compaction** — periodically summarize old turns into a much shorter summary, keeping the recent turns verbatim. Costs dropped 80% with negligible quality impact.

## Common mistakes to avoid

- **Assuming the model "knows" things.** It only knows what's in the prompt right now. Always pass relevant context explicitly.
- **Treating the API as deterministic by default.** Without `temperature: 0` (and even then, not perfectly), responses vary. Build for variability.
- **Asking for "a short answer" but not setting `max_tokens`.** The model will sometimes produce long output anyway. Use `max_tokens` as a hard ceiling.
- **Ignoring the cost of input tokens.** Long prompts can cost more than long outputs, especially with cheap models. Audit prompt size.
- **Designing for the happy path only.** Models can refuse, ramble, or produce malformed output. Always handle the edge cases.
- **Trying to fix hallucination with stricter prompts.** "Don't make things up" is rarely enough. The real fix is usually better context (retrieval, examples, tools).

## Watch / Read more

- [OpenAI Cookbook](https://cookbook.openai.com) — Working examples that show idiomatic API use
- [Models documentation](https://platform.openai.com/docs/models) — Up-to-date model list, context windows, and capabilities
- [OpenAI Developer Channel on YouTube](https://www.youtube.com/@OpenAI) — Talks and demos from the team

## Summary

- Every OpenAI model — at the behavioral level — predicts the next token in a sequence, one at a time.
- They're stateless between requests. Treat each call as a fresh contractor with no memory.
- They have a fixed context window. They cost per-token in and per-token out.
- They sometimes hallucinate because their job is to produce plausible text, and sometimes plausible isn't true.
- They can't access current information, tools, or your data unless you pass it in the request.
- Reasoning models "think" before responding — more accurate, slower, more expensive.

This is the mental model. Every other lesson in this course refines it. Next up: the actual API surface — Responses vs Chat Completions vs the rest — and how to pick the right one.
