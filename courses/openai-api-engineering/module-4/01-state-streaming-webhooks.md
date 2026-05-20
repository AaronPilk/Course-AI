---
module: 4
position: 1
title: "Conversation state, streaming, and webhooks"
objective: "Persist conversation state across turns, stream responses for fast perceived latency, and handle async work via webhooks."
estimated_minutes: 12
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# Conversation state, streaming, and webhooks

## The puzzle

A prototype call to OpenAI takes 3 seconds and prints the full response at once. Fine for a script.

In a real product:

- Users want to see the response appear *as it's being generated* (3-second silences feel broken).
- Conversations span turns; the model needs context from previous turns.
- Some operations take 30+ seconds; you can't hold the HTTP connection that long.

Three patterns solve these: **streaming**, **conversation state**, and **webhooks**. Each maps to a specific production need.

## The simple version

- **Streaming**: get tokens as the model produces them, so the user sees the response materialize. Sub-second to first token, even if total response takes seconds.
- **Conversation state**: persist the back-and-forth between turns. Either send the history yourself, or use the API's managed `conversation` parameter.
- **Webhooks**: for long-running work (deep research, complex agent runs), the API runs in the background and posts results to your endpoint when done.

You'll use streaming in almost every user-facing product. Conversation state in any multi-turn product. Webhooks in any product with operations longer than ~30 seconds.

## The technical version

### Streaming

In the Responses API:

```js
const stream = await openai.responses.create({
  model: "gpt-5-mini",
  input: "Write a 200-word summary of the EU AI Act.",
  stream: true,
});

for await (const event of stream) {
  if (event.type === "response.output_text.delta") {
    process.stdout.write(event.delta);
  }
}
```

Each chunk arrives as a server-sent event. Concatenate `delta` strings as they arrive.

Why it matters:

- **Perceived latency.** First token typically arrives within 200–600ms. Even if total response takes 5 seconds, users feel an instant response.
- **Long responses.** Without streaming, a 30-second generation looks like a hung connection.
- **Better UX.** Users can start reading while the model is still writing.

What you handle in client code:

- Render tokens as they arrive.
- Stop button to cancel an in-progress stream.
- Final-state handling (clean up partial state if the stream errors mid-flight).

Streaming + tool calls: you get a mix of `text.delta`, `tool_call.delta`, and other events. Most SDKs handle this; you usually iterate event types and dispatch.

### Conversation state — client-side

The historical pattern: you keep the message history client-side and send it with every turn.

```js
const messages = [];

async function chat(userMessage) {
  messages.push({ role: "user", content: userMessage });

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages,
  });

  const assistantMessage = response.choices[0].message;
  messages.push(assistantMessage);

  return assistantMessage.content;
}
```

Pros: simple, transparent, works anywhere.

Cons: input cost grows linearly with conversation length. Conversation history is your responsibility to persist (in a DB if you want it across sessions).

### Conversation state — managed (Responses API)

The Responses API can manage conversation state server-side:

```js
// First turn
const r1 = await openai.responses.create({
  model: "gpt-5-mini",
  input: "Tell me about transformers.",
  conversation: { id: "conv_user_42" }, // your conversation ID
});

// Second turn — just send the new input + same conversation ID
const r2 = await openai.responses.create({
  model: "gpt-5-mini",
  input: "Now explain attention specifically.",
  conversation: { id: "conv_user_42" },
});
```

The API tracks the conversation. You send only the new input each turn.

Pros:
- Less data over the wire.
- Possibly optimized for caching internally.
- Simpler client code.

Cons:
- Less visibility — you don't have the full history locally unless you fetch it.
- Bound to OpenAI's storage policies.

When to use which: managed is convenient for products that don't need to introspect or modify history; client-side is the right call when you need full control (e.g., compacting old turns, editing past assistant messages, audit-grade logging).

### Compaction (handling long conversations)

Even with managed state, you hit context limits and cost growth on long conversations. The pattern: **periodically summarize old turns into a much shorter summary**.

```
turns 1–10: verbatim
turn 11+: replace turns 1–10 with a summary like:
  "Earlier in the conversation, the user asked about X and we covered Y, Z..."
  recent turns: verbatim
```

How:

1. Track turn count or token count.
2. When it exceeds your threshold, kick off a compaction LLM call.
3. The summary replaces the old turns in the prompt going forward.

A typical pattern uses a sliding window: always keep the last N turns verbatim; everything older is folded into the summary, updated occasionally.

Compaction saves real money. We covered the cost math in Module 1 Lesson 4 — without it, chat product costs grow linearly per turn.

### Webhooks for long-running work

Some operations are too slow for synchronous HTTP:

- Deep research (multi-step agent, 30s–10min).
- Complex agent runs.
- Background batch processing.

The pattern:

1. Your code submits a request with a `background: true` flag and a webhook URL.
2. The API returns immediately with a `run_id`.
3. The operation runs server-side.
4. When complete, the API POSTs the result to your webhook URL.

Pseudo-code:

```js
const run = await openai.responses.create({
  model: "gpt-5-thinking",
  input: "Comprehensive market analysis...",
  background: true,
  webhook: { url: "https://example.com/openai-callback" }
});

// run.id = "run_xyz"
// Later, your /openai-callback endpoint receives:
// { run_id: "run_xyz", status: "completed", output: ... }
```

What your webhook handler does:

- Verify the webhook signature (OpenAI signs callbacks).
- Look up your internal job by `run_id`.
- Process the result (save to DB, notify user, etc.).

Webhook URLs need to be:

- Publicly accessible (or behind a tunnel in dev).
- Idempotent (you might receive duplicate deliveries on retry).
- Fast to respond (acknowledge quickly; process the actual work async if needed).

### Polling as an alternative

If you can't host a webhook endpoint, you can poll:

```js
const run = await openai.responses.create({
  model: "gpt-5-thinking",
  input: "...",
  background: true,
});

let status = "in_progress";
while (status === "in_progress") {
  await sleep(2000);
  const update = await openai.responses.retrieve(run.id);
  status = update.status;
  if (status === "completed") return update.output;
}
```

Use polling for:

- Local dev where you can't expose a webhook.
- Short-running background jobs where polling overhead is small.

Use webhooks for:

- Production at any scale.
- Operations that genuinely take a long time.

### Streaming for long operations

Streaming and background mode can coexist for some operations. If the operation supports streaming, you can stream partial results to the user *while* a background process completes the rest. Useful for things like deep research where you want to show progress.

The specifics depend on the model and operation. Check current docs for what supports what combination.

### The interactive vs background decision

A useful rule:

- **Latency < 30s expected, user is waiting**: synchronous + streaming.
- **Latency 30s–5min, user is waiting**: synchronous + streaming + progress UI, or background + polling with an early "started" response.
- **Latency > 5min, user is not waiting**: background + webhook. User gets an email or notification when done.

Set up your UI to match the actual operation length. Holding a user in a "loading" screen for 90 seconds breaks engagement; sending them an email when their report is done works fine.

## An analogy: the difference between a phone call and a contractor estimate

A phone call is synchronous: you say something, the other person responds in real time.

A contractor estimate is asynchronous: you describe the job, the contractor goes away, evaluates, and gets back to you with a written estimate later.

Both are useful. Mixing them up is awkward — you don't want a contractor to silently hang up after you describe the kitchen and then call back three days later. You expect them to acknowledge the request first, then deliver async.

OpenAI's API has both modes:

- Streaming = phone call. You get tokens immediately, conversation feels alive.
- Background + webhook = contractor estimate. The API acknowledges the request, runs in the background, calls you back when done.

Pick the right mode for the operation. Mixing them produces bad UX.

## Three real-world scenarios

**Scenario 1: The chat product that felt broken.**
A team launched a chat product without streaming. Every response had a 3–5 second silent gap. Users assumed the system had hung up; engagement was low. Adding streaming (with no other changes) dropped that gap to 300ms to first token. Engagement went up 40%. Same model, same answers, completely different feel.

**Scenario 2: The conversation that hit context limits.**
A chat product without compaction worked great for the first 30 turns. Around turn 60, users started getting errors — context exceeded. Cost was also 30× a single turn. After implementing compaction (sliding window keeping last 8 turns verbatim, older turns summarized), the conversation could continue indefinitely with stable per-turn cost.

**Scenario 3: The hanging "loading" screen.**
A team built a deep research feature that took 4–6 minutes. They held the user on a loading screen. Most users left after 90 seconds. Switching to background mode + email-on-complete: user submits the research request, gets an email when done. Completion rate went from 18% (loading screen) to 92% (email).

## Common mistakes to avoid

- **Not using streaming for user-facing responses.** Sub-second perceived latency is a massive UX win.
- **Sending full conversation history forever.** Compaction is non-negotiable past ~15 turns.
- **Holding users on loading screens for 60+ seconds.** Switch to background mode.
- **No webhook signature verification.** Anyone can POST to your endpoint without it.
- **Webhook handlers that aren't idempotent.** Duplicate deliveries happen on retry.
- **Treating polling as a long-term solution.** It works in dev; webhooks scale in prod.

## Read more

- [Streaming responses](https://platform.openai.com/docs/guides/streaming-responses)
- [Conversation state](https://platform.openai.com/docs/guides/conversation-state)
- [Webhooks](https://platform.openai.com/docs/guides/webhooks)
- [Background mode](https://platform.openai.com/docs/guides/background)

## Summary

- **Streaming**: render tokens as they arrive. Sub-second perceived latency. Use for any user-facing response.
- **Conversation state**: client-side for control, managed (via `conversation` param) for simplicity. Either way, implement compaction for long conversations.
- **Webhooks + background mode**: for long-running operations (30s+). User submits → API acknowledges → API calls back when done.
- **Polling**: simpler than webhooks but doesn't scale. Use in dev; switch to webhooks in prod.
- Match the UX to the latency. Holding users on loading screens past ~60 seconds is bad product.

Next: prompt caching and context compaction — the cost game in detail.
