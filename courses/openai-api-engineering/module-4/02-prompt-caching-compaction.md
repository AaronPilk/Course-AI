---
module: 4
position: 2
title: "Prompt caching, context compaction, and the cost game"
objective: "Cut request cost and latency dramatically by structuring prompts for caching and compacting long histories."
estimated_minutes: 12
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# Prompt caching, context compaction, and the cost game

## The puzzle

Your AI feature launches. Costs are fine for a week. Then volume scales. Within a month:

- Your AI bill is $40K and growing.
- Latency creeps up as requests get longer.
- The CFO is in your office asking questions.

You audit. The bill isn't model choice. It's that every request is sending the same 4,000-token system prompt, repeatedly, from scratch. And your chat history is now 30 turns long on average.

Two patterns fix this — and they're so high-leverage that they often *cut bills by 70–90%* without changing the model or the user experience.

## The simple version

**Prompt caching**: OpenAI's API caches stable prefixes of your prompts. Subsequent requests with the same prefix pay much less for that portion (often ~50% off, sometimes more, plus lower latency). To benefit, put stable content at the *start* of every prompt, byte-identical across requests.

**Context compaction**: long conversations get expensive because input tokens grow per turn. Summarize older turns periodically; keep recent turns verbatim. Cost stays roughly flat per turn instead of growing.

These two patterns plus the model-choice decisions from Module 1 cover most production cost optimization.

## The technical version

### Prompt caching mechanics

OpenAI caches **prompt prefixes**. When your new request shares a prefix with a recent cached prompt, the cached portion is billed at the lower cache rate (~50% off, sometimes more) and is faster to process.

Important rules:

- **Byte-identical prefixes are required.** A single character difference at byte 1,500 invalidates the cache for everything from byte 1,500 onward.
- **The cached prefix has to be substantial.** Tiny prompts don't benefit much. Most providers require prefixes of ~1,000+ tokens.
- **Caches expire.** Recently-used prefixes stay hot; rarely-used ones drop out.
- **Cache hits are reported in the response.** Check usage metadata to verify your structure is working.

### Structure for cache hits

The simple rule: **stable content goes first, variable content goes last.**

Bad structure (cache breaks every turn):

```
[user query] + [stable system instruction] + [tool defs]
```

Good structure (cache hits on stable parts):

```
[stable system instruction] + [tool defs] + [stable RAG context if any] + [user query]
```

In code:

```js
// BAD — user input at the start invalidates caching
input: `User asked: ${userQuery}\n\nYour instructions: ${SYSTEM_PROMPT}\nTools: ${TOOLS}`

// GOOD — stable first, variable last
input: `${SYSTEM_PROMPT}\n\nTools: ${TOOLS}\n\nUser asked: ${userQuery}`
```

For the Responses API, the `instructions` parameter is naturally at the start of the effective prompt — use it for stable content.

### What can be cached

In typical agent / chat code:

- System instructions / role descriptions
- Tool definitions and schemas
- Few-shot examples used on every call
- Stable RAG context that doesn't change between calls
- Formatting templates

What shouldn't be in the cached portion:

- User-specific input
- Per-request context (current date, user ID if it varies)
- Dynamic retrieved content

Put the per-request stuff at the end. Even one character difference at the start invalidates everything.

### How much it saves

A typical chat product:

- System prompt: 2,000 tokens (stable)
- Tools: 1,500 tokens (stable)
- Conversation history: 3,000 tokens (variable — but we'll handle this with compaction)
- User query: 200 tokens (variable)

Without caching: pay full rate on all 6,700 tokens of input per call.

With caching of the stable prefix (3,500 tokens): pay full rate on ~3,200 tokens, cache rate on 3,500 tokens. The cache rate is typically 50% off — so input cost drops ~25%.

At scale, that's the difference between a $40K bill and a $30K bill on the same workload. Compounded with compaction (next section), often a 70–90% total savings.

### Conversation compaction

Long conversations grow linearly:

- Turn 1: 200 token input → 200 billable input tokens (plus stable prefix)
- Turn 10: ~2,500 token input from history → 2,500 billable
- Turn 50: ~12,000 token input from history → 12,000 billable
- Turn 100: ~25,000 token input from history → 25,000 billable

Compaction replaces old turns with a much shorter summary:

```
turns 1–40: a single 400-token summary of "what we covered earlier"
turns 41–50: verbatim (recent context preserved)

result: ~2,000 token history instead of 12,000
```

Three patterns to implement:

**1. Sliding window with summary.** Keep last N turns verbatim. Older turns get summarized into a single rolling summary block.

**2. Periodic full compaction.** Every K turns, replace all but the last few turns with a fresh summary.

**3. Token-budget compaction.** When total history exceeds T tokens, compact the oldest half.

The pattern is the same: trade some context fidelity for stable token cost.

### Implementing compaction

A simple sliding-window implementation:

```python
class ConversationStore:
    def __init__(self, recent_turns=8, summary_threshold=12):
        self.summary = ""  # rolling summary of older turns
        self.recent = []   # last N turns verbatim
        self.recent_turns = recent_turns
        self.summary_threshold = summary_threshold

    def append(self, role, content):
        self.recent.append({"role": role, "content": content})
        if len(self.recent) > self.summary_threshold:
            self._compact()

    def _compact(self):
        # Take everything except the last `recent_turns` to summarize
        to_summarize = self.recent[: -self.recent_turns]
        self.recent = self.recent[-self.recent_turns:]
        summary_text = run_summary_llm(self.summary, to_summarize)
        self.summary = summary_text

    def to_messages(self) -> list[dict]:
        messages = []
        if self.summary:
            messages.append({
                "role": "system",
                "content": f"Earlier conversation summary:\n{self.summary}"
            })
        messages.extend(self.recent)
        return messages
```

Compaction is itself an LLM call (often on a small/fast model — nano works fine for summarization). Cost: a few cents per compaction. Savings: dollars per long conversation.

### Cost of compaction

Compaction isn't free:

- Each compaction call uses tokens (input: the turns being summarized; output: the summary).
- Compaction runs occasionally (every K turns), not every turn.

At typical settings, compaction costs ~5% of what it saves. Worth it.

### Batch API and Flex processing

For non-real-time work, OpenAI offers:

**Batch API**: submit a batch of requests; get results within ~24 hours; pay roughly 50% off the per-token rate.

**Flex processing**: similar discount for non-urgent flow. Lower priority queue.

Use cases:

- Analytics / data backfills.
- Bulk document processing.
- Periodic content generation (newsletters, summaries).
- Embedding large corpora.

Don't use for:

- User-facing real-time responses.
- Anything where latency matters.

The cost savings are significant. Always check if a workload qualifies before sending it through the standard API at full price.

### Reasoning model cost considerations

Reasoning models cost more because they generate reasoning tokens internally. Two specific levers:

**`reasoning_effort`** — most reasoning-capable models accept a parameter to tune thinking depth. `minimal` is fast/cheap; `high` is slow/accurate. For most workflows, `medium` is a fine default; use `high` only for genuinely hard problems.

**Selective routing** — for chat or agent products, route easy turns to a regular model and only hard turns to a reasoning model. A small classification step (on a tiny model) decides which.

These can drop reasoning-model bills by 60–80% without quality loss on the easy turns.

### Cost monitoring

A pre-launch checklist:

- Estimate cost per request before shipping.
- Add per-day / per-user cost limits.
- Alert when daily cost exceeds N.
- Audit weekly: which features dominate spend?
- Watch the cache hit rate. If it's low, your prefixes aren't structured well.

Treat cost as a first-class metric, not an afterthought. AI products with no cost observability tend to get expensive surprises.

## An analogy: utility bills

You can leave the lights on, the heat blasting, and every appliance running — your house works fine. Then the utility bill arrives.

The fix isn't "use less electricity" in some abstract sense. It's specific:

- Turn off lights in unused rooms (compaction).
- Insulate so heat doesn't escape (caching).
- Run the dishwasher off-peak (batch API).

Each is a small architectural choice with compounding effect.

OpenAI cost optimization is the same. Generic "be efficient" doesn't help. Specific patterns — cache stable prefixes, compact old context, batch non-urgent work, route by difficulty — drop bills 70–90% without changing what the product does.

## Three real-world scenarios

**Scenario 1: The $40K bill cut to $9K.**
A chat product was running at $40K/month. Audit found: no compaction (history grew to 25K tokens per turn), poor prompt caching (user input at the start broke prefix matching), all calls on full GPT-5. The fix: implement compaction (cut input size 70%), restructure prompts for caching (cut input cost 30% on stable parts), route 80% of turns to mini (cut per-call cost 5×). Combined: bill dropped to $9K. No quality regression.

**Scenario 2: The agent that became 4× faster.**
A team's research agent ran 5–10 LLM calls per request. Each call sent ~6,000 tokens of tool definitions and system prompt. After restructuring for caching (stable prefix first, varying content last) and verifying cache hits in the response metadata, total agent latency dropped 4× — the cached prefix is faster to process. Cost dropped too.

**Scenario 3: The compaction quality regression.**
A team implemented compaction with an overly aggressive policy (summarize after just 3 turns). The summary was lossy; later turns lost important context. They tuned to keep last 10 turns verbatim with summaries only for older content. Quality recovered; cost was still much lower than uncompacted.

## Common mistakes to avoid

- **User input at the start of prompts.** Defeats prompt caching for everything after it.
- **No compaction on long conversations.** Cost grows linearly per turn.
- **Compacting too aggressively.** Aim to keep enough recent history that immediate context isn't lost.
- **Real-time workload sent through the standard API when Batch would work.** Half off, no quality difference, just patience.
- **Reasoning models on easy turns.** 5× cost without quality benefit.
- **No cost monitoring.** Surprises happen.

## Read more

- [Prompt caching guide](https://platform.openai.com/docs/guides/prompt-caching)
- [Compaction guide](https://platform.openai.com/docs/guides/compaction)
- [Batch API](https://platform.openai.com/docs/guides/batch)
- [Cost optimization](https://platform.openai.com/docs/guides/cost-optimization)

## Summary

- **Prompt caching**: stable content at the start, byte-identical across calls. ~50% off on cached prefixes.
- **Compaction**: summarize older conversation turns to cap input size. Stable cost per turn instead of linear growth.
- **Batch API / Flex**: ~50% off for non-real-time work.
- **Selective routing**: use small/fast models for easy turns, big/reasoning models for hard ones.
- **Cost monitoring**: per-request estimates, daily caps, weekly audits. Treat cost as first-class.
- Combined, these patterns routinely cut bills by 70–90% on production workloads.

Next: evals — how to know if your AI product is actually getting better.
