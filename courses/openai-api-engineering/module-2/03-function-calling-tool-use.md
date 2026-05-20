---
module: 2
position: 3
title: "Function calling and tool use"
objective: "Wire OpenAI models up to call your own functions and external APIs, with proper error handling."
estimated_minutes: 15
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# Function calling and tool use

## The puzzle

The model is good at language. It's terrible at:

- Doing math reliably
- Looking up current information
- Querying your database
- Calling external APIs
- Modifying state in the real world

If your product needs any of that, you need **function calling** (also called *tool use*). It's the bridge between the model's reasoning and your application's actual capabilities. Without it, the model is a brilliant conversationalist who can't pick up a phone.

This lesson is the mental model + the patterns that survive production.

## The simple version

Function calling works like this:

1. **You describe functions** to the model. Each one has a name, a description, and a parameter schema.
2. **The user makes a request.** The model reads it.
3. **The model decides whether to call a function.** If so, it returns a structured "I want to call `function_name` with these arguments."
4. **You execute the function.** OpenAI doesn't run it — *you* do, in your code.
5. **You send the function's result back to the model.** It uses the result to produce its final response.

The model is doing reasoning *about* tools. Your code is doing the work *with* tools. This separation matters: the model can stay sandboxed, and you keep full control over what code actually runs.

## The technical version

### The basic loop

A working example in JavaScript:

```js
// 1. Define your function
const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get the current weather for a city.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g., 'San Francisco'" },
          unit: {
            type: "string",
            enum: ["celsius", "fahrenheit"],
            description: "Temperature unit."
          }
        },
        required: ["city", "unit"],
        additionalProperties: false
      },
      strict: true
    }
  }
];

// 2. Send the user request along with tool definitions
let messages = [
  { role: "user", content: "What's the weather in Paris in celsius?" }
];

const response1 = await openai.chat.completions.create({
  model: "gpt-5-mini",
  messages,
  tools,
});

const message = response1.choices[0].message;

// 3. Check if the model wants to call a function
if (message.tool_calls) {
  for (const call of message.tool_calls) {
    if (call.function.name === "get_weather") {
      const args = JSON.parse(call.function.arguments);
      // 4. Execute the function (your code)
      const result = await fetchWeather(args.city, args.unit);
      // 5. Append the tool call and result to the message history
      messages.push(message); // assistant's tool_call message
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  // 6. Call the model again with the result
  const response2 = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages,
    tools,
  });

  console.log(response2.choices[0].message.content);
  // "It's currently 18°C and partly cloudy in Paris."
}
```

That's the basic shape. The model decides; you execute; you feed back; the model finishes.

### The Responses API version (simpler)

The Responses API handles much of this loop natively:

```js
const response = await openai.responses.create({
  model: "gpt-5-mini",
  input: "What's the weather in Paris in celsius?",
  tools: [
    {
      type: "function",
      name: "get_weather",
      description: "Get the current weather for a city.",
      parameters: { /* same as above */ }
    }
  ],
});

// You'll see tool calls in response.output_items
// Handle them; resubmit with results; the API can manage the loop more cleanly
```

For multi-step agentic workflows, the Responses API + the Agents SDK is much cleaner. Module 3 covers agents in depth.

### Writing good function definitions

The function description and parameter schemas are *prompt content* to the model. They affect when and how the model decides to call your functions.

**Good function name and description:**

```js
{
  name: "get_customer_orders",
  description: "Retrieves the list of orders placed by a customer. Use this when the user asks about their order history, recent purchases, or specific past orders.",
  parameters: { ... }
}
```

Notice:
- Verb-first name (`get_*`, `create_*`, `update_*`).
- Description explains *when* the model should use it, not just *what* it does.
- Parameter descriptions guide the model on what values to pass.

**Bad function definition:**

```js
{
  name: "orders",
  description: "Order function.",
  parameters: { ... }
}
```

The model has to guess when to use this. It will sometimes use it inappropriately, sometimes miss obvious cases. Spending 30 seconds on a good description is the single biggest function-calling improvement.

### Parameter schemas

The `parameters` field is a JSON schema, same constraints as structured output. Use:

- `required` arrays for fields that must always be present.
- `enum` for fields with a fixed set of values (the model picks from the list).
- `description` on every field — these guide the model.
- `additionalProperties: false` so the model can't sneak in unexpected fields.
- `strict: true` to enforce the schema rigidly.

The principles are the same as structured output: the schema is *prompt* to the model. Clearer schemas → better calls.

### Handling errors and edge cases

In production, functions fail. APIs are down. Inputs are wrong. Records don't exist. Your function-calling code has to handle these.

A robust pattern:

```js
async function executeToolCall(call) {
  try {
    const args = JSON.parse(call.function.arguments);
    const fn = functionRegistry[call.function.name];
    if (!fn) {
      return { error: `Unknown function: ${call.function.name}` };
    }
    const result = await fn(args);
    return { result };
  } catch (err) {
    return { error: err.message };
  }
}

// Feed the result (success or error) back to the model.
// The model sees the error and decides what to do — apologize,
// try a different tool, ask the user for clarification, etc.
messages.push({
  role: "tool",
  tool_call_id: call.id,
  content: JSON.stringify(resultOrError),
});
```

The key insight: **send errors back to the model as tool results**, not as exceptions in your code. The model can handle them gracefully. It might retry with different arguments, apologize to the user, or try a different tool. The conversation continues.

### When the model calls multiple tools

A single model response can contain *multiple* tool calls. Common patterns:

- **Parallel calls** (model wants to fetch several things at once). You execute them in parallel for speed.
- **Sequential calls** (the model wants to do A, then B based on A's result). Each round-trip involves a model call.

Handle both. Don't assume only one tool call per response.

### Forcing or preventing tool calls

By default, the model decides whether to call any tools. You can override:

- **`tool_choice: "auto"`** (default) — model decides.
- **`tool_choice: "required"`** — model must call at least one tool.
- **`tool_choice: { type: "function", function: { name: "X" }}`** — model must call exactly function X.
- **`tool_choice: "none"`** — model cannot call any tools.

Useful for:

- Forcing a tool call when you know one is needed (e.g., a structured-extraction step).
- Preventing tool calls in a sub-conversation where you only want text output.

### Strict mode

For function definitions, `strict: true` makes the model's arguments conform exactly to the parameter schema. This is the function-calling analog of structured output's strict mode.

With strict mode:
- The model can't return arguments with missing required fields.
- The model can't add extra fields.
- Types are enforced (no string-for-number confusion).

In production, **always use strict mode** unless you have a specific reason not to. The reliability gain is large.

### The tool ecosystem: built-in vs custom

OpenAI provides several built-in tools you don't have to implement yourself:

- **Web search** — the model can search Google-style and incorporate results.
- **File search** — semantic search across files you've uploaded.
- **Code interpreter** — sandboxed Python execution.
- **Computer use** — drive a browser or desktop.

When a built-in tool fits your need, prefer it over building your own. They're better optimized and well-integrated.

For custom needs — your database, your APIs, your business logic — function calling is the standard.

### MCP — the cross-API standard

A newer pattern: **MCP (Model Context Protocol)** is a standard for AI tools that works across OpenAI, Anthropic, and other providers. Instead of defining tools inline in your API calls, you point the model at an MCP server.

OpenAI supports MCP connectors. If your team is building tools that will be used by multiple AI products (internal AI assistant, customer-facing agent, etc.), MCP is worth considering — it standardizes the integration. We cover MCP in detail in Module 3.

### Cost considerations

Function definitions count as input tokens on every call that includes them. A function with a detailed description and rich parameters can be 200–500 tokens. An agent with 10 such functions costs ~3,000–5,000 tokens of definitions *per call* — even when no function is used.

Optimizations:

1. **Dynamic tool sets.** Pre-classify the request, then send only relevant tools.
2. **Lean function definitions.** Trim descriptions to load-bearing detail. Avoid restating obvious context.
3. **Built-in tools** are often more token-efficient than custom equivalents.

For a 10-tool agent making 100,000 calls/month at 4,000 tokens of definitions per call, you're paying for 400M tokens just in tool definitions. Worth optimizing.

### Patterns for production reliability

A handful of patterns that show up in production OpenAI tool-using code:

**1. Validation between model and function.** Even with strict mode, sanity-check arguments before executing. Especially important for side-effecting tools (deletions, charges, irreversible actions).

**2. Idempotency.** Tools that can be retried safely. If the model calls a tool and the response is lost, retrying shouldn't double-charge a customer or duplicate a record.

**3. Approval gates for dangerous tools.** For destructive operations, route through a human-in-the-loop pattern. The model proposes; a human approves.

**4. Audit logging.** Log every tool call: function name, arguments, result, latency, errors. You'll need this for debugging and security review.

**5. Rate limiting.** A misbehaving model (or a malicious user) can spam tool calls. Apply rate limits server-side.

**6. Timeouts.** Don't let a slow tool block the entire conversation. Use sensible timeouts and surface them as errors back to the model.

We cover guardrails and approval patterns in detail in Module 3, Lesson 5.

## An analogy: hiring a researcher

You hire a brilliant researcher. They can think through any problem you give them. But they can't:

- Pick up the phone to call sources
- Open a database to look things up
- Send emails on your behalf

Unless *you* give them the phone, the database access, and an email client. And you teach them when to use each.

That's exactly function calling. The model is the researcher. The functions are the tools you provide. Your job: give them well-described tools, watch what they decide to do, and handle the calls they make.

The researcher decides *what* to do. The tools determine *what's possible*. Your function-calling code is the office around the researcher.

## Three real-world scenarios

**Scenario 1: The agent that hallucinated a database query.**
A team built an agent with a `get_customer` tool. They didn't write a description — just a name. The model called it with random customer IDs in tests, producing plausible-looking but fake data. After adding a description ("Returns customer info. Only call when you have a verified customer ID from a previous step.") and adding an explicit error when ID format was wrong, the agent stopped making things up. Lesson: descriptions are prompts to the model, not just documentation.

**Scenario 2: The 200-tool agent that cost $20K/month.**
A team built an "all-purpose" agent with 200 tools — every internal API exposed. Each call was sending ~80,000 tokens of function definitions. Monthly cost: $20K. They implemented dynamic tool sets — a fast classification step decides which 5–15 tools are relevant for each query, only those go to the agent. Cost dropped to $1,500/month. Quality stayed the same.

**Scenario 3: The retry loop that doubled customer charges.**
A team's payment tool wasn't idempotent. When network errors occurred between the model's tool call and receiving the result, the team's retry logic called the tool again. Some customers got double-charged. The fix: add an idempotency key parameter the model passes through, and check it server-side before processing. Standard distributed-systems hygiene, but easy to forget in AI code.

## Common mistakes to avoid

- **Vague function descriptions.** "Returns user info" is much weaker than "Returns user profile when the user asks about their own account. Use only after the user is authenticated."
- **Skipping strict mode.** Without it, the model can return malformed arguments.
- **Returning exceptions instead of error results.** Send errors *back to the model* — it can recover gracefully.
- **Not handling parallel tool calls.** A single response can contain multiple calls.
- **Defining 200 tools for an agent that uses 5.** Dynamic tool sets save real money.
- **Skipping audit logging.** You'll regret it the first time you need to debug an agent in production.
- **Not making side-effecting tools idempotent.** Distributed systems hygiene applies here too.

## Read more

- [Function calling guide](https://platform.openai.com/docs/guides/function-calling) — primary reference
- [Tool use overview](https://platform.openai.com/docs/guides/tools) — full tool ecosystem
- [OpenAI Cookbook on function calling](https://cookbook.openai.com) — production-grade examples

## Summary

- Function calling is the bridge between the model's reasoning and your application's capabilities.
- Pattern: define functions → user request → model decides to call → *you* execute → feed result back → model produces final response.
- Function descriptions and parameter schemas are *prompts* to the model. Invest in writing them well.
- Use strict mode for argument schemas. Use `additionalProperties: false` and explicit `required` arrays.
- Send errors back as tool results, not exceptions. The model handles them gracefully.
- Optimize tool token cost: dynamic tool sets, lean descriptions, built-in tools where applicable.
- Production patterns: idempotency, audit logging, approval gates for dangerous tools, rate limits, timeouts.

Next: embeddings and semantic search. The other half of "letting the model use your data" — how to retrieve relevant context from your own corpus and feed it to the model.
