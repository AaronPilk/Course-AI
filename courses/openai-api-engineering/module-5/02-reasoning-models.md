---
module: 5
position: 2
title: "Reasoning models and the new 'think first' paradigm"
objective: "Understand when reasoning models help, how reasoning tokens and effort work, and how to integrate them in production."
estimated_minutes: 12
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# Reasoning models and the new 'think first' paradigm

## The puzzle

You give GPT-5-mini a math word problem. It answers fast and wrong.

You give the same problem to a reasoning model. It takes 20 seconds, spends 8,000 invisible "reasoning tokens" thinking, and answers correctly with a clean explanation.

Both are valid tools. Neither is universally better. Reasoning models are a new category — capable in ways earlier models weren't, but with different cost, latency, and integration patterns.

This lesson covers what reasoning models are, when to use them, and how to integrate them cleanly into production code.

## The simple version

A **reasoning model** is trained to generate hidden "thinking" steps before producing its final answer. The thinking happens server-side, billed as **reasoning tokens** that you pay for but never see.

What makes them different:

- They're slower (the thinking takes time).
- They're more expensive (you pay for reasoning tokens).
- They're much better at hard problems: math, code, multi-step logic, complex tool use.
- They can be tuned with a `reasoning_effort` knob: `minimal`, `low`, `medium`, `high`.

When to use them: hard problems where quality matters more than speed.

When to avoid: real-time UI, voice agents, simple lookups, anything latency-sensitive.

## The technical version

### What's actually happening

Earlier GPT-class models generate output tokens directly from the prompt. Reasoning models generate two streams:

1. **Reasoning tokens** — a private chain of thought the model uses to work through the problem.
2. **Output tokens** — the visible answer it returns to you.

You see only the output. You pay for both.

This pattern came from research showing that letting the model "think" before answering dramatically improves performance on multi-step problems. The model isn't doing anything you couldn't simulate with explicit "let's think step by step" prompting — but it's been trained to do it well, and the thinking is structured and efficient.

### When reasoning models win

Tasks where reasoning models reliably outperform regular models:

- **Math and quantitative reasoning** — word problems, calculations with constraints, optimization.
- **Code generation for hard problems** — algorithms with edge cases, code review, debugging.
- **Multi-step planning** — agents that need to think through 5–10 steps before acting.
- **Logic puzzles and structured constraint problems.**
- **Research synthesis** — pulling together information from multiple sources into a coherent answer.
- **High-stakes judgments** — anything where being wrong matters more than being fast.

### When reasoning models lose

Tasks where reasoning models are a bad fit:

- **Real-time chat UI** — the extra latency is painful for short conversational turns.
- **Voice agents** — adds seconds; breaks the interactive feel.
- **Simple lookups and extractions** — no reasoning needed; smaller models are better.
- **Streaming-heavy UX** — reasoning tokens delay first output.
- **High-volume cheap traffic** — cost amplifies fast.

A rough rule: if a smart human could answer the question in under 5 seconds without thinking hard, a reasoning model is overkill.

### Reasoning effort

Reasoning-capable models accept a `reasoning_effort` parameter that controls how many reasoning tokens they're willing to use:

```js
const response = await openai.responses.create({
  model: "gpt-5",
  reasoning: { effort: "medium" },  // minimal | low | medium | high
  input: "Plan a 7-day trip to Tokyo for $3,000 including flights from SFO."
});
```

Tradeoffs:

- **`minimal`** — fastest, cheapest. Almost no thinking. Use for easy turns inside a reasoning model.
- **`low`** — modest thinking. Good default for moderately hard tasks.
- **`medium`** — solid thinking. Good for most production reasoning tasks.
- **`high`** — extensive thinking. Use only for genuinely hard problems where quality must be maximized.

A common production pattern: set `medium` as the default, escalate to `high` only on cases that fail the eval at `medium`. Most workloads don't need `high`; it's expensive and slow.

### Reading the response

Reasoning model responses include the visible output text plus metadata about tokens used:

```js
console.log(response.output_text);
console.log("Reasoning tokens:", response.usage.reasoning_tokens);
console.log("Output tokens:", response.usage.output_tokens);
console.log("Input tokens:", response.usage.input_tokens);
```

Watching `reasoning_tokens` is how you spot expensive cases. A reasoning model that's burning 30,000 tokens of thinking on a single call is either tackling a genuinely hard problem or stuck in a loop. Either way, you want to know.

### Tool use with reasoning models

Reasoning models work well with tool use — in fact, they're often *the* right choice for agents that need to plan multi-step tool sequences. They reason about which tool to call, what arguments to use, and how to handle results.

Pattern: a reasoning model orchestrates the high-level plan and tool sequencing; cheaper models or direct API calls do the leaf work.

Beware: latency compounds. A reasoning model that calls 5 tools sequentially might take a minute or more. Plan UI around the wait — show progress, stream intermediate steps, give users a "stop" button.

### When NOT to add reasoning

A common anti-pattern: adding a reasoning model to a chat product because "it makes the bot smarter." Then the bot feels slow, users hang up, and the metric you care about (engagement, completion) drops.

Reasoning is a tradeoff: latency and cost for quality. If your product doesn't have a *quality* problem on hard reasoning tasks, reasoning models won't help. They'll just hurt.

Before adding a reasoning model, run an eval:

1. Does the current model fail on the cases you care about? (If not, don't switch.)
2. If yes, does switching to a reasoning model fix those cases? (Run the eval on both.)
3. Is the latency/cost increase acceptable? (Measure it.)

If all three yes, ship it. Otherwise, keep the current model.

### Selective routing

The same routing pattern from Module 1 and Module 4 applies here: route most traffic to a regular model, route hard cases to a reasoning model.

```js
// Lightweight classifier (small model, fast, cheap)
const classifier = await openai.responses.create({
  model: "gpt-5-nano",
  input: `Classify this query as "easy" or "hard":\n\n${userQuery}\n\nOnly output one word.`,
  max_output_tokens: 5
});

const difficulty = classifier.output_text.trim().toLowerCase();

// Route to the right model
const model = difficulty === "hard" ? "gpt-5" : "gpt-5-mini";
const reasoning_effort = difficulty === "hard" ? "high" : undefined;

const response = await openai.responses.create({
  model,
  reasoning: reasoning_effort ? { effort: reasoning_effort } : undefined,
  input: userQuery
});
```

This pattern routinely cuts reasoning-model bills 60–80% with no quality loss on the easy cases.

### Reasoning models and streaming

Reasoning models stream — but the first output token doesn't appear until the reasoning is done. So in a streamed UI, the user sees a long pause, then output starts streaming fast.

UX patterns to handle this:

- **Show a "thinking" indicator** during reasoning. Users tolerate waits much better when they see progress.
- **Stream intermediate states** if you control the agent loop. ("Looking up flight prices... considering routes... drafting response...")
- **Set timeouts** so a stuck reasoning call doesn't leave the user staring forever.

### Cost of reasoning models

Reasoning tokens are billed at the output-token rate. A reasoning model doing serious work can easily use 5,000–20,000 reasoning tokens per call. At GPT-5 rates, that's $0.10–$0.40 per call on top of visible output.

Cost management:

- Use reasoning models only on routes that need them.
- Set `reasoning_effort` to the minimum that clears your eval bar.
- Cap output (`max_output_tokens`) to prevent runaway generations.
- Consider Batch API for offline reasoning tasks — ~50% off.

### Reasoning model vs. step-by-step prompting

Old pattern: tell a regular model "think step by step before answering." This works to some extent — it nudges the model to generate chain-of-thought before its answer.

New pattern: use a reasoning model. The reasoning is built in, optimized by training, and not shown to the user (so the visible output stays clean).

When to use which:

- **Regular model + "think step by step" prompt** — when you want chain-of-thought *visible* to the user (educational products, debugging UIs).
- **Reasoning model** — when you want quality on hard problems without exposing the thinking.

For most production use, reasoning models are cleaner. The thinking stays private; the output is focused.

## An analogy: chess clocks

Blitz chess and classical chess use the same rules but different time controls. In blitz, you move fast; you make mistakes; you win on tempo. In classical, you can think for 30 minutes per move; you find deeper moves; you win on insight.

Same player, same board, very different game.

Regular models are blitz chess. Reasoning models are classical. The right tool depends on what game you're playing.

A chat assistant is blitz. A research agent is classical. A code reviewer is closer to classical. A voice agent is blitz with an even shorter clock.

Use the right time control for the situation.

## Three real-world scenarios

**Scenario 1: The math tutor that finally worked.**
A team built an AI math tutor. With GPT-5-mini, it would confidently produce wrong answers on word problems half the time. They switched the verification step to a reasoning model at `medium` effort. Wrong-answer rate dropped from 50% to 8%. Latency went from 2s to 12s, which was acceptable for a tutoring product.

**Scenario 2: The voice agent that broke when they added reasoning.**
A team added a reasoning model to their phone-based voice agent thinking it would handle complex customer questions better. Every turn now had a 6–10 second pause. Customers hung up. They reverted within a day. Lesson: latency is the product in voice. Reasoning models don't belong in the hot path.

**Scenario 3: The research agent that paid for itself.**
A team built an agent that synthesized competitive intel for sales reps. With a regular model, it produced shallow summaries reps ignored. With GPT-5 at `high` reasoning effort, the agent took 90 seconds per query but produced reports reps actually used. Cost: $1.20 per query vs. $0.05. Value: replaced 30 minutes of human research. Worth every cent.

## Common mistakes to avoid

- **Reasoning models in latency-critical paths.** Voice, chat UI, anything user-watching-output. Bad fit.
- **Always-on `high` reasoning effort.** Expensive. Use only on cases that need it.
- **No latency/cost measurement.** Reasoning model costs run away silently.
- **Adding reasoning without an eval to prove it helps.** Sometimes it doesn't.
- **Streaming UX with no "thinking" indicator.** Users see a long pause and assume the app froze.
- **Forgetting `max_output_tokens` cap.** Runaway generations on hard problems get expensive fast.

## Read more

- [Reasoning models guide](https://platform.openai.com/docs/guides/reasoning)
- [Model selection guide](https://platform.openai.com/docs/guides/model-selection)
- [Reasoning best practices](https://platform.openai.com/docs/guides/reasoning-best-practices)

## Summary

- **Reasoning models** think before answering — they generate hidden reasoning tokens, then visible output.
- Strong on **math, code, multi-step planning, hard logic, research, high-stakes judgment.**
- Weak fit for **real-time UI, voice agents, simple lookups.** Latency and cost are real.
- **`reasoning_effort`** tunes the depth: `minimal` to `high`. Default `medium`; escalate only when needed.
- Track `reasoning_tokens` in usage metadata to spot expensive calls.
- **Selective routing** (small model + reasoning model on hard cases) cuts costs 60–80% without quality loss.
- UX patterns: thinking indicator, stream intermediate states, timeout protection.
- The right choice depends on whether quality or speed matters more — most products want both, and the answer is *combining* models, not picking one universally.

Next: multi-step workflows — deep research, computer use, voice agents.
