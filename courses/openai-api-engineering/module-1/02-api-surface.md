---
module: 1
position: 2
title: "The API surface — Responses, Chat Completions, and what's actually different"
objective: "Pick the right OpenAI API for any task and understand why the surface is the way it is."
estimated_minutes: 14
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# The API surface — Responses, Chat Completions, and what's actually different

## The puzzle

You go to OpenAI's docs. You see at least four different APIs:

- The **Responses API**
- The **Chat Completions API**
- The **Assistants API** (now marked legacy)
- The **Realtime API**

Each one has different request shapes, different parameters, different examples. Some Cookbook examples use Responses; others use Chat Completions. You read forum posts claiming Responses is the future and others claiming Chat Completions is "more battle-tested."

Which do you actually use?

This lesson resolves it. By the end, you'll know which API to use for any new project, when to migrate existing code, and what each one is actually doing under the hood.

## The simple version

For new projects in 2026, the answer is almost always: **use the Responses API.**

It's OpenAI's current primary API. It supports everything (text, tool use, structured output, streaming, agents), it cleanly handles multi-step interactions, and it's what new features ship to first.

Chat Completions is still supported and still widely used in existing codebases. Don't rewrite working Chat Completions code just to switch — it's not deprecated. But for new code, default to Responses.

The other APIs are specialized:
- **Realtime API** for voice and streaming audio interactions.
- **Assistants API** is legacy; OpenAI explicitly recommends migrating to Responses.

That's the short answer. The rest of the lesson is the *why*, which matters when you have to make real engineering decisions.

## The technical version

### What both APIs do

Both Responses and Chat Completions are doing roughly the same thing under the hood:

- You send some input text (a prompt or conversation).
- The API runs it through a model.
- The API returns generated output.

The differences are about **interface design**: how you express the input, how the API represents multi-turn interactions, how it handles tools, and how it composes with newer features like agents and reasoning.

### The Chat Completions API

The older interface, introduced in 2023. The shape:

```js
const response = await openai.chat.completions.create({
  model: "gpt-5-mini",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What's the capital of France?" }
  ],
});

console.log(response.choices[0].message.content);
// "Paris"
```

Properties:

- **Messages array**: you pass a flat list of messages, each with a `role` (`system`, `user`, `assistant`, or `tool`) and `content`.
- **Stateless**: the API doesn't remember anything between calls. You re-send the whole history each turn.
- **Tools/function calling supported**: you describe functions, the model decides when to call them, you execute, you send the result back as a `tool` message.
- **Wide ecosystem support**: most third-party libraries, frameworks, and tools target Chat Completions.

If you've written any OpenAI code before, this is probably what you've seen.

### The Responses API

The newer primary interface. Shape (simplified):

```js
const response = await openai.responses.create({
  model: "gpt-5-mini",
  input: "What's the capital of France?",
});

console.log(response.output_text);
// "Paris"
```

Or for a more complex interaction with system instructions:

```js
const response = await openai.responses.create({
  model: "gpt-5-mini",
  instructions: "You are a helpful assistant.",
  input: "What's the capital of France?",
});
```

The key differences from Chat Completions:

- **Unified `input`** that can be a string, a list, or structured items (text, images, file references, etc.).
- **Instructions** are a top-level field, not a system message in the array.
- **Built-in tool support** for OpenAI's first-party tools (web search, file search, computer use) — you opt in to them rather than wiring them yourself.
- **Conversation persistence** is built in: pass a `conversation_id` and the API tracks state for you across calls.
- **Reasoning model support** is first-class: `reasoning_effort` and reasoning token outputs are exposed cleanly.
- **Agent loop support**: the API knows about multi-step tool-using flows and handles them more naturally than Chat Completions.

Both APIs use the same underlying models. The output quality is identical. What changes is how you express what you want.

### When Responses is meaningfully better

A few scenarios where Responses is substantially nicer than Chat Completions:

**1. Multi-step tool use.** If your agent calls a tool, gets a result, then calls another tool, then synthesizes — the Responses API handles the loop more elegantly. Less code, fewer round-trips, cleaner state management.

**2. Reasoning models.** When using reasoning models (o-series and reasoning variants of GPT-5), Responses exposes reasoning tokens and `reasoning_effort` controls directly. Chat Completions has these but they feel grafted on.

**3. OpenAI's built-in tools.** If you want web search, file search, computer use, or other OpenAI-native tools, Responses lets you enable them with a flag. In Chat Completions you'd have to wire them as custom functions.

**4. Long conversations with managed state.** The `conversation` parameter lets the API store conversation history server-side, so you don't have to re-send everything each turn. Often simpler and cheaper than client-side history management.

**5. Streaming with tool use.** Streaming responses while also doing tool calls is cleaner in Responses than Chat Completions.

### When Chat Completions is fine to keep using

Chat Completions is still production-supported, fully maintained, and not going away. Stick with it when:

- You have working code already. There's no reward for migration unless you need a Responses-specific feature.
- You're using a third-party framework that targets Chat Completions and works well.
- You're doing single-shot prompts with no tools and no fancy state management.
- You want to stay maximally compatible with non-OpenAI providers (most "OpenAI-compatible" APIs from other vendors mimic Chat Completions, not Responses).

### The Realtime API

A specialized API for **voice and streaming audio**. Use cases:

- Phone-call-like voice agents
- Real-time transcription with low latency
- Speech-to-speech conversation systems

The Realtime API uses WebSocket or WebRTC connections rather than HTTPS request/response. It's a different mental model — you stream audio in and stream tokens or audio out as the model generates them.

If you're not building voice, you don't need it. If you are, it's the right tool.

### The Assistants API

OpenAI's earlier attempt at managed agents and stateful conversations. It introduced concepts like *threads*, *assistants*, *runs*, and built-in file search and code interpreter.

OpenAI now explicitly recommends migrating to the Responses API. From the docs:

> "Assistants API: Migration guide" (the doc title itself is a migration guide.)

For new code: don't start with Assistants. For existing Assistants code: plan a migration when convenient. It's not deprecated tomorrow, but it's no longer the recommended path.

### A side-by-side: same task, three APIs

The task: ask a model a question with a system instruction, get the answer.

**Chat Completions:**

```js
const response = await openai.chat.completions.create({
  model: "gpt-5-mini",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Explain RAG in one sentence." }
  ],
});
const answer = response.choices[0].message.content;
```

**Responses:**

```js
const response = await openai.responses.create({
  model: "gpt-5-mini",
  instructions: "You are a helpful assistant.",
  input: "Explain RAG in one sentence.",
});
const answer = response.output_text;
```

**Assistants** (don't do this for new code, shown for comparison):

```js
const assistant = await openai.beta.assistants.create({
  model: "gpt-5-mini",
  instructions: "You are a helpful assistant.",
});
const thread = await openai.beta.threads.create();
await openai.beta.threads.messages.create(thread.id, {
  role: "user",
  content: "Explain RAG in one sentence.",
});
const run = await openai.beta.threads.runs.create(thread.id, {
  assistant_id: assistant.id,
});
// ... poll for completion, retrieve messages, etc.
```

Notice the trend: Responses is the most concise for simple tasks, Chat Completions is slightly more verbose, Assistants is dramatically more verbose. As complexity grows, Responses stays clean; Chat Completions adds boilerplate; Assistants becomes painful.

### The "completions" naming confusion

A historical note that confuses people: there used to be a `completions` endpoint (no "chat") in the original OpenAI API. It was the pre-Chat Completions API, before message-role formatting existed. It's marked deprecated and shouldn't be used.

So we have:
- **Completions** (deprecated, don't use)
- **Chat Completions** (current, fine to use, mature)
- **Responses** (current, primary, recommended for new code)
- **Assistants** (legacy, migrate to Responses)
- **Realtime** (specialized for voice)

The "Chat Completions" name is awkward because it has "Completions" in it but isn't the deprecated Completions endpoint. Welcome to API naming.

## An analogy: the iPhone SDK history

When the iPhone first launched, Apple gave developers UIKit — a powerful, somewhat verbose framework for building iOS apps.

Years later, Apple introduced SwiftUI — a more declarative, cleaner way to build the same kinds of UIs. UIKit didn't disappear; you can still use it, and lots of existing apps do. But for new code, SwiftUI is the recommended path.

You don't rewrite your existing UIKit app just to be on SwiftUI. But when starting fresh, you reach for SwiftUI by default.

OpenAI's API evolution is similar:

- **Chat Completions ≈ UIKit**: mature, widely supported, still works great.
- **Responses ≈ SwiftUI**: cleaner, more concise, where new features ship first.
- **Assistants ≈ a forgotten beta SDK**: existed for a while, didn't catch on, migrate when convenient.

The mental model: **for new code, default to Responses. For existing code that works, don't migrate without a reason.**

## Three real-world scenarios

**Scenario 1: The team that migrated and regretted the timing.**
A team had a working Chat Completions pipeline. After reading hype about Responses, they spent two weeks rewriting everything. The migration was clean — but introduced a few subtle behavior changes that took another week to debug. Net: ~3 weeks of engineering time for zero feature gain. They wish they'd waited until they needed a Responses-only feature.

**Scenario 2: The team that should have migrated and didn't.**
A team was building an agent with custom tool calling, retrieval, and a reasoning model. They built it on Chat Completions because that's what their existing code used. They ended up writing ~200 lines of custom orchestration code to manage the agent loop, tool execution, and reasoning token handling. After moving to Responses, the same logic was ~40 lines using the built-in agent and tool support. Lesson: when you're building something complex, Responses pays for itself fast.

**Scenario 3: The voice-only product.**
A startup was building a phone-based AI assistant. They initially built the prototype on Chat Completions with separate TTS and STT calls. Latency was bad — 2–4 seconds per turn. They migrated to the Realtime API. Latency dropped to under 600ms. The user experience went from clunky to natural. The Realtime API exists for exactly this case.

## Common mistakes to avoid

- **Starting new projects on Chat Completions out of habit.** Default to Responses unless you have a specific reason.
- **Migrating working Chat Completions code "just because."** Cost is real, benefit may be zero. Migrate when you need a Responses-specific feature.
- **Starting voice products on Chat Completions.** Use the Realtime API. The latency difference is dramatic.
- **Starting new code on the Assistants API.** OpenAI's own docs say migrate. Save yourself the future migration cost.
- **Confusing Chat Completions with the deprecated Completions endpoint.** Different APIs, only one is current.
- **Using third-party "OpenAI-compatible" APIs without checking if they support Responses.** Many only support Chat Completions.

## Read more

- [Migrate to Responses](https://platform.openai.com/docs/guides/migrate-to-responses) — the official migration guide
- [Responses API quickstart](https://platform.openai.com/docs/guides/text) — the new front door
- [Assistants migration guide](https://platform.openai.com/docs/assistants/migration) — if you have existing Assistants code

## Summary

- For new projects, default to the **Responses API**. It's OpenAI's current primary surface.
- **Chat Completions** is still fine — production-supported, mature, widely-used. Don't rewrite working code without reason.
- **Assistants API** is legacy. Migrate to Responses when convenient.
- **Realtime API** is for voice and low-latency streaming audio. Use it when you need that; otherwise ignore.
- The same model powers all of these — the difference is interface design, not output quality.
- The Responses API gets meaningfully cleaner as your code gets more complex: tool use, agents, reasoning, managed state.

Next lesson: there are *many* OpenAI models (GPT-5 family, reasoning models, specialized variants). We learn how to pick one for any task.
