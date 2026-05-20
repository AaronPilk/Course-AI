---
module: 1
position: 2
title: "The Messages API — how to actually call Claude"
objective: "Make a Claude API call, understand the request/response shape, and handle multi-turn conversations."
estimated_minutes: 10
videos:
  - title: "Anthropic Developer Channel"
    url: "https://www.youtube.com/@anthropic-ai"
    source: "Anthropic"
---

# The Messages API — how to actually call Claude

## The puzzle

You have an API key. You want Claude to answer a question. What endpoint do you hit, what do you put in the request, what comes back?

Anthropic's API is small — one main endpoint does almost everything. This lesson walks you from blank file to working multi-turn conversation in under 50 lines of code.

## The simple version

Claude is called through the **Messages API**: `POST /v1/messages`. You send:

- A `model` string.
- A `max_tokens` cap.
- A `messages` array (the conversation so far).
- Optionally a `system` prompt and `tools`.

You get back a response with the assistant's reply. To continue a conversation, append the response to your `messages` array and send the whole history again.

That's the entire surface for basic use. Everything more advanced — caching, tool use, vision, batches, citations — builds on this.

## The technical version

### A minimal call

JavaScript:

```js
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();  // reads ANTHROPIC_API_KEY from env

const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "Explain photosynthesis in one paragraph." }
  ]
});

console.log(response.content[0].text);
```

Python:

```python
from anthropic import Anthropic
client = Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Explain photosynthesis in one paragraph."}
    ]
)

print(response.content[0].text)
```

You don't *need* the SDK — it's a wrapper around HTTPS. But the SDK handles retries, streaming, and type definitions, so use it unless you have a reason not to.

### The request shape

Required fields:

- **`model`** — version string (e.g. `claude-sonnet-4-6`).
- **`max_tokens`** — cap on output tokens. Required. Set generously but not absurdly.
- **`messages`** — array of `{ role, content }`. Roles are `user` and `assistant`. Must alternate; must start with `user`.

Common optional fields:

- **`system`** — system prompt as a string (or array of structured blocks for caching).
- **`temperature`** — 0 to 1; lower is more deterministic. Default ~1. Use 0 for tasks where you want consistency.
- **`top_p`**, **`top_k`** — sampling controls. Most of the time, just use `temperature`.
- **`stop_sequences`** — strings that make Claude stop generating.
- **`stream`** — if true, response streams via Server-Sent Events.
- **`tools`** — for tool use (Module 3).
- **`metadata`** — pass `{user_id: "..."}` to help Anthropic with abuse detection.

### The response shape

```json
{
  "id": "msg_01ABC...",
  "type": "message",
  "role": "assistant",
  "model": "claude-sonnet-4-6",
  "content": [
    { "type": "text", "text": "Photosynthesis is the process by which..." }
  ],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 12,
    "output_tokens": 84
  }
}
```

Things to know:

- **`content` is an array** of typed blocks, not a single string. Text responses are one `text` block; tool-use responses include `tool_use` blocks; vision responses include `image` reasoning.
- **`stop_reason`** tells you why Claude stopped: `end_turn` (finished), `max_tokens` (hit cap), `stop_sequence` (matched one of your stop strings), `tool_use` (wants to call a tool).
- **`usage`** gives you input and output token counts — track these for cost.

### Multi-turn conversations

Claude is stateless. To continue a conversation, send the whole history each time:

```js
const messages = [
  { role: "user", content: "What's a good first language to learn?" }
];

let response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages,
});

// Append Claude's reply to history
messages.push({ role: "assistant", content: response.content });

// User asks follow-up
messages.push({ role: "user", content: "Why?" });

response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages,
});
```

Important: append the entire `response.content` array (not just `response.content[0].text`). Claude's responses can include multiple blocks (text + tool calls), and you need all of them in history.

### System prompts

The system prompt is the instructions Claude follows across the conversation. Pass it as `system`:

```js
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  system: "You are a friendly Python tutor. Explain code with clear examples.",
  messages: [{ role: "user", content: "What's a list comprehension?" }]
});
```

Lesson 1.3 covers system prompt structure. For now, know: system goes outside `messages`, not as a `role: "system"` message.

### Streaming

For chat UIs, stream the response so the user sees output as it generates:

```js
const stream = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Write a haiku about lakes." }],
  stream: true,
});

for await (const event of stream) {
  if (event.type === "content_block_delta") {
    process.stdout.write(event.delta.text);
  }
}
```

Each event is a typed delta. The SDK abstracts this so you can just consume the iterable; raw SSE works too if you're not using the SDK.

### Errors and retries

The API returns standard HTTP errors:

- **400** — bad request (malformed input).
- **401** — bad API key.
- **403** — quota / permission issue.
- **429** — rate-limited.
- **500/529** — server error / overloaded.

The SDK retries 429 and 5xx with exponential backoff by default. For non-SDK clients, implement your own with at least 3 retries and jitter.

### Counting tokens before you send

To estimate cost or check if your input fits, use the token counting endpoint:

```js
const count = await client.messages.countTokens({
  model: "claude-sonnet-4-6",
  messages: [{ role: "user", content: "Some text" }],
});

console.log(count.input_tokens);  // ~3
```

This is much cheaper than calling the real model. Use it when you need to validate prompts client-side.

## Three real-world scenarios

**Scenario 1: The forgotten max_tokens.**
A team shipped a feature without thinking about `max_tokens`. Claude generated reasonable-length answers most of the time, but occasionally produced 4,000-token deep-dives that broke their UI and cost 10×. They added a `max_tokens: 800` cap and added a stop sequence at `</answer>`. Costs normalized, UI stayed clean.

**Scenario 2: The chatbot that lost its memory.**
A developer was sending only the most recent user message in `messages` instead of the full history. Claude couldn't remember anything from earlier in the conversation. The fix was one line: keep appending to a history array instead of recreating `messages` each turn.

**Scenario 3: The tool-use bug from dropping a content block.**
A team built an agent and stored only `response.content[0].text` in history. When Claude returned a tool_use block, they dropped the tool call data. The agent kept asking for the tool result it had just (silently) discarded. Fixed by always appending the full `response.content` array.

## Common mistakes to avoid

- **Forgetting `max_tokens`.** The API requires it, but defaulting to something huge leads to surprise cost.
- **Putting system as a message.** It goes in the top-level `system` field, not in `messages`.
- **Only storing text from responses.** Always keep the full `content` array — you lose tool calls otherwise.
- **Sending only the latest message.** Claude is stateless. Send full history.
- **Skipping streaming for chat UI.** Users feel 4× the latency without it.
- **Not pinning the model version.** Auto-aliases shift behavior over time.

## Read more

- [Messages API reference](https://docs.anthropic.com/en/api/messages)
- [Streaming](https://docs.anthropic.com/en/api/messages-streaming)
- [Token counting](https://docs.anthropic.com/en/api/messages-count-tokens)
- [Errors](https://docs.anthropic.com/en/api/errors)

## Summary

- Call Claude via **`POST /v1/messages`** with `model`, `max_tokens`, and `messages`.
- **Messages alternate user/assistant** and must start with user.
- **System prompt** lives outside `messages` in the `system` field.
- **Response content is an array** of typed blocks — keep the whole array in history.
- **Stream for chat UI**; check `stop_reason` to know why Claude stopped.
- **Count tokens cheaply** before sending if you need to estimate cost or validate length.
- The Messages API is the foundation — caching, tool use, vision, and citations all build on the same shape.

Next: how to write system prompts that work with Claude's training.
