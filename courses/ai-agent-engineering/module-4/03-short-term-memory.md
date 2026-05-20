---
module: 4
position: 3
title: "Short-term memory — context, summaries, and compaction"
objective: "Manage what the agent remembers within a session."
estimated_minutes: 10
---

# Short-term memory — context, summaries, and compaction

## The puzzle

Your agent had a great first turn. By turn 15, it's confused, contradicting earlier decisions, or just slow. The conversation context has grown to 30K tokens and the model is drowning in it.

Short-term memory is the discipline of *what the agent remembers within a single session*. Done well, agents stay coherent across long conversations at controlled cost. Done badly, they're either forgetful or financially ruinous.

## The simple version

Three controls:

1. **Verbatim recent history** — keep the last N turns word-for-word.
2. **Rolling summary** — compact older turns into a short summary.
3. **Persistent task state** — separate from chat history, structured: "current order being processed: O-12345; refund pending: yes."

Stack them: a short summary + last N turns + task state. Per-turn input stays bounded; the agent doesn't forget the key facts.

## The technical version

### The naive approach (and why it fails)

```js
messages.push(userMessage);
const response = await llm.call(messages);
messages.push(response);
// Repeat forever.
```

By turn 50, `messages` is 25K tokens. Cost per turn is the cost of resending the whole history every time. Latency goes up. Quality often drops as the model picks signal from a wall of context.

### Sliding window

Keep only the last N turns:

```js
const RECENT_N = 10;
const trimmedMessages = messages.slice(-RECENT_N);
const response = await llm.call(trimmedMessages);
```

Simple. Cheap. Forgets earlier context permanently. Fine for short interactions; bad for tasks that span many turns where early context matters.

### Sliding window + summary

The production pattern:

```
[system prompt]
[summary of turns 1..N-K]
[last K turns verbatim]
[current user message]
```

Older turns get compacted into a rolling summary. Recent turns stay verbatim. Total input is bounded; the model still has the gist of earlier context.

```js
class ConversationMemory {
  constructor({ recentN = 8, summarizeAfter = 16 }) {
    this.summary = "";
    this.recent = [];
    this.recentN = recentN;
    this.summarizeAfter = summarizeAfter;
  }

  async append(role, content) {
    this.recent.push({ role, content });
    if (this.recent.length > this.summarizeAfter) {
      await this.compact();
    }
  }

  async compact() {
    const toCompact = this.recent.slice(0, -this.recentN);
    this.recent = this.recent.slice(-this.recentN);

    const newSummary = await summarize(this.summary, toCompact);
    this.summary = newSummary;
  }

  toMessages() {
    const head = this.summary
      ? [{ role: "system", content: `Earlier conversation summary:\n${this.summary}` }]
      : [];
    return [...head, ...this.recent];
  }
}
```

`summarize` is itself an LLM call (Haiku-tier is fine). Cost: a few cents per compaction. Savings: dollars across the conversation.

### Structured task state

For agents handling specific tasks, summaries alone aren't ideal — the model still has to extract structured facts from prose. Track structured state separately:

```js
const taskState = {
  current_order_id: "O-12345",
  refund_status: "pending_approval",
  user_email: "alex@x.com",
  steps_completed: ["lookup_order", "check_eligibility"],
};
```

Pass this state into the system prompt or as a tool result on each turn:

```
Current task state:
- Order: O-12345
- Refund: pending approval
- Steps complete: lookup_order, check_eligibility
```

The agent reads the state, picks the next action, updates the state via tools. State is concrete and small; summaries handle the prose-y parts ("user mentioned they're frustrated").

### What to keep, what to drop

Three categories in a conversation:

- **Facts about the world / user / task**: keep in state and/or summary.
- **Decisions made and their reasons**: keep in summary.
- **Tool call mechanics**: usually can drop after a few turns — the result is what matters, not the call sequence.

Don't compact recent tool calls — the agent needs them to know what it just did. Don't preserve every old tool result — compacting them into "earlier we found X, Y, Z" is enough.

### Compaction quality

Bad compaction loses important context. To improve:

- **Compact with a strong model** (Sonnet, not Haiku, for summarization-of-summaries).
- **Include critical facts explicitly** in the compaction prompt ("preserve: user ID, order IDs, decisions, errors").
- **Run eval cases** that span 20+ turns — make sure post-compaction context still produces good answers.

If you're not sure compaction is preserving what matters, audit a few real long conversations.

### Caching + compaction

Compaction shrinks the input you send each turn. Caching cuts the cost of what you do send. Combined, the cost per turn of a long conversation drops dramatically:

- **Without either**: 30K tokens × $3/M = $0.09 per turn at 50-turn mark.
- **With caching + compaction**: 3K compacted history × $0.30/M (cached system) + small fresh input ≈ $0.005 per turn.

The 18× difference compounds across thousands of users.

### When to summarize aggressively vs. conservatively

Aggressive (compact after 8 turns):

- High-volume products where cost matters.
- Tasks with focused goals (support, lookup) — context naturally ages out.

Conservative (compact after 30+ turns):

- Multi-day or multi-session conversations.
- Tasks where early context might matter at any point.
- High-quality agents where any context loss is costly.

Default conservative; tune aggressive when cost is the binding constraint.

### Memory in multi-agent systems

Each agent in a multi-agent system has its own short-term memory. The supervisor's memory is the orchestration history; specialists' memories are their own sub-conversations.

When agents hand off, you choose what state crosses the boundary. Often: a structured handoff payload (the facts) + a short summary of relevant chat (the texture). Don't dump full multi-agent transcripts into each agent's context.

### Anti-patterns

- **One giant `messages` array that grows forever.** Cost grows linearly; quality degrades.
- **Aggressive compaction that loses key facts.** Agent forgets the user's order ID two turns later.
- **No compaction on long-running agents.** Bill explodes.
- **Compaction with a tiny model that drops nuance.** Use Haiku for short summaries, Sonnet for important ones.

## Three real-world scenarios

**Scenario 1: The agent that lost its memory at turn 20.**
A team had sliding-window memory (last 10 turns). At turn 20, the agent forgot the user's order ID from turn 3 and asked for it again. Annoying. They added structured task state alongside the window. Critical facts persisted; UX improved.

**Scenario 2: The 50-turn $20 conversation.**
A support agent had no compaction. A 50-turn conversation hit 35K tokens of history, costing $0.15-$0.20 per turn. Across the conversation: $5-$10. Multiplied across users: thousands a month. Added compaction with last-8-turns verbatim + rolling summary. Per-turn cost dropped to $0.01-$0.02.

**Scenario 3: The compaction that dropped a key fact.**
A team compacted aggressively after every 5 turns. The summary lost the user's preferred name. Agent started addressing them by their first name when they'd specifically asked for last-name address. Switched to a stronger compactor model + explicit "preserve user preferences" instruction. Fixed.

## Common mistakes to avoid

- **No memory strategy at all.** Costs grow linearly.
- **Aggressive compaction that loses critical facts.** Bad UX.
- **Conflating short-term memory with persistent memory** (Lesson 4.4).
- **No structured task state.** Agent has to extract facts from prose every turn.
- **Compacting recent turns.** The agent needs them.
- **Skipping evals on long conversations.** Compaction bugs hide at high turn counts.

## Read more

- [OpenAI conversation state](https://platform.openai.com/docs/guides/conversation-state)
- [Anthropic — prompt caching for chat](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [LangChain memory documentation](https://python.langchain.com/docs/concepts/memory)

## Summary

- **Short-term memory** = what the agent remembers within a session.
- **Sliding window + rolling summary + structured task state** is the production pattern.
- **Compact older turns** with a small/fast model; keep recent turns verbatim.
- **Persist critical facts** as structured state — don't rely on the summary to preserve them.
- **Caching + compaction stack** for major cost reduction on long conversations.
- **Audit compaction quality** by checking what the agent remembers at turn 20, 30, 50.

Next: long-term memory across sessions.
