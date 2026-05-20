---
module: 3
position: 4
title: "Streaming agents to the user — UX patterns"
objective: "Surface progress so a 30-second agent feels responsive."
estimated_minutes: 9
---

# Streaming agents to the user — UX patterns

## The puzzle

Your agent takes 30 seconds to complete a multi-step task. The user types their question, sees a spinner, waits — and most close the tab before the answer arrives.

The agent didn't get worse. The UX got worse the moment the task became multi-step. Streaming and progress UI are how you get the time back without speeding up the model.

## The simple version

Three layers of streaming UX:

1. **Stream the final answer** as it generates (the basic LLM stream).
2. **Surface intermediate steps** — "Looking up customer..." "Fetching orders..." — as tool calls happen.
3. **Show the plan** if you have one, so users know what's coming.

Layer all three. The user goes from "frozen spinner" to "live workspace they can watch."

## The technical version

### Streaming the final answer

LLM APIs (OpenAI, Anthropic, etc.) support response streaming via Server-Sent Events or similar. The first token arrives in hundreds of milliseconds; subsequent tokens trickle in.

```js
const stream = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "..." }],
  stream: true,
});

for await (const event of stream) {
  if (event.type === "content_block_delta") {
    process.stdout.write(event.delta.text);
  }
}
```

In a web UI, push each delta to the client over an SSE connection or WebSocket. The user sees text appearing instead of a spinner.

### Surfacing intermediate steps

In an agent, the model output is interleaved with tool calls. Surface those:

- When the model decides to call a tool: show "Calling: lookup_customer..."
- When the tool returns: show "✓ Got customer data."
- When the model is generating text again: stream that text.

This turns the agent's work into a visible timeline.

A common UI pattern:

```
🤔 Thinking...
🔧 Looking up customer Sarah Chen
✓ Got customer record
🔧 Fetching recent orders
✓ Got 12 orders
✓ Drafting response

[Final response streams in here]
```

Each line appears in real time. Users see progress; latency feels much shorter.

### Surface the plan upfront

If your agent uses plan-then-act (Lesson 3.1), show the plan:

```
Here's what I'll do:
1. Look up your account
2. Check your recent orders
3. Process the refund

[ Looking up your account... ]
```

This sets expectations and gives users a sense of scope. They can also abort if the plan looks wrong.

### Tool result truncation in UI

Tool results can be huge JSON blobs. Don't show raw payloads in the UI:

- "✓ Got 47 orders" (with optional "view details" link).
- "✓ Fetched 12 KB of policy data."
- "✓ Sent email to alex@example.com."

Show the *meaningful* part of the result. Hide the raw shape behind a disclosure if power users want it.

### Latency-aware progress

If you know a tool is slow, set expectation:

- "Searching the web (this can take 15-20s)..."
- "Reading 50-page document..."

Users tolerate waits when they know what they're waiting for. Surprise waits feel longer than anticipated ones.

### Streamable tool calls (parallel)

When tools run in parallel, surface them concurrently:

```
🔧 Looking up account... ⟳
🔧 Fetching orders... ⟳
🔧 Checking subscription... ⟳

✓ Account: Pro plan
✓ Orders: 12 in past year
✓ Subscription: active, renews Mar 2027
```

Users see parallelism explicitly. Even faster perceived progress.

### Cancel buttons

For agents that run more than a couple seconds, add a cancel button:

- Aborts the in-flight HTTP request to the model.
- Marks the trace as canceled.
- Returns the partial progress to the user with "canceled — here's what I had."

Without cancel, users feel trapped. With it, they're in control even on long runs.

### Reconnection and resumable streams

For longer agents, browser tabs close, networks blink, users navigate away. Two patterns:

**Resumable streams**: store partial output server-side; on reconnect, send what's been generated so far, then continue streaming.

**Background completion**: if the user disconnects, finish the run anyway and store the result. When they come back, deliver the completed answer.

For 5–30s agents, just letting the stream die when the user leaves is often fine. For multi-minute agents, build resumability.

### Showing errors mid-stream

When a tool errors:

- ❌ "Looking up customer... failed."
- Show why: "Database temporarily unavailable."
- Show recovery: "Trying alternate lookup..."

Don't hide errors. Visible recovery builds trust; silent retries feel like the system is stuck.

### Approval prompts in stream

When an approval gate fires mid-agent, surface it inline:

```
🤖 I'd like to send this email:

[Email preview here]

[ Approve ] [ Reject ] [ Edit and approve ]
```

The agent waits for the user's decision before continuing. This is approval-in-context — much better UX than a separate review queue for interactive agents.

### Don't over-stream

Some surfaces don't benefit:

- **Internal API endpoints** that return JSON to other services. Just wait for the answer.
- **Slack bot replies** where streaming isn't natively supported.
- **Batch jobs** that process many tasks in parallel — better to update overall progress than stream each.

Streaming is a UX upgrade for interactive UIs. Where there's no interactive UI, skip it.

### Streaming + caching + parallel = the latency stack

The combination that makes agents feel fast:

- **Prompt caching** (Lesson 5.1 Claude course) — first token arrives faster.
- **Parallel tool calls** — independent calls happen at the same time.
- **Streaming** — output appears as generated.
- **Plan surfacing** — user knows what's coming.

Stack all four and a 20-second agent feels like 5 seconds. Skip them and a 5-second agent feels like 20.

## Three real-world scenarios

**Scenario 1: The agent that felt 4× faster.**
A team's research agent took 15 seconds per query. Users were churning out of the feature. They added intermediate step display, plan surfacing, and final-answer streaming. Total time unchanged. User churn dropped 80%. Lesson: perceived speed is its own product surface.

**Scenario 2: The unstreamed deep-research debacle.**
A team launched a deep-research feature that took 60–90 seconds per query. No streaming, no progress UI. Users hit submit, waited 30 seconds, assumed it was broken, clicked refresh, lost the run. They added a progress UI streaming the agent's planning + step list + partial findings. Abandoned-run rate dropped from 60% to 8%.

**Scenario 3: The cancel button that paid for itself.**
A team's agent could occasionally take 2-3 minutes. Without a cancel button, users wrote angry reviews about "the AI freezes." Adding cancel reduced reviews and gave them a clean way to handle edge-case slow runs.

## Common mistakes to avoid

- **Spinner-only UI for multi-step agents.** Users assume frozen.
- **Streaming text but not tool calls.** Half the work is invisible.
- **Showing raw tool result JSON.** Visual noise; confusing to non-engineers.
- **Plan-then-act without surfacing the plan.** You did the work; show the user.
- **No cancel button on long runs.** Users feel trapped.
- **Hidden errors mid-stream.** Silent recovery feels stuck.

## Read more

- [OpenAI streaming](https://platform.openai.com/docs/api-reference/streaming)
- [Anthropic streaming](https://docs.anthropic.com/en/api/messages-streaming)
- [Vercel AI SDK streaming utilities](https://sdk.vercel.ai/docs/concepts/streaming)

## Summary

- **Stream the final answer** — basic LLM streaming.
- **Surface intermediate tool calls** — turn the agent into a visible timeline.
- **Show the plan** when you have one — sets expectations.
- **Truncate tool results** in the UI; raw JSON is noise.
- **Cancel button** on multi-second runs.
- **Visible error recovery** beats silent retries.
- Stack streaming + caching + parallel tools + plan surfacing for "feels fast" UX.

That wraps Module 3. Next: multi-agent and memory patterns.
