---
module: 3
position: 1
title: "Tool use — letting Claude call your functions"
objective: "Define a tool, handle Claude's tool_use response, and return tool_result."
estimated_minutes: 12
---

# Tool use — letting Claude call your functions

## The puzzle

Pure text generation can do a lot. But the moment your product needs Claude to *do* something — look up a customer, query a database, send a calendar invite, calculate an actual sum — text alone isn't enough.

You need tools. Claude calls your functions; your code runs them; the results go back to Claude; Claude continues.

This lesson is the full protocol. By the end you'll have a working tool integration in your head.

## The simple version

You declare tools when you call the API:

```js
tools: [
  {
    name: "get_weather",
    description: "Get current weather for a city.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name" }
      },
      required: ["city"]
    }
  }
]
```

Claude decides to call a tool by returning a `tool_use` content block. You execute the tool, then send the result back as a `tool_result`. Claude processes the result and either uses another tool or answers the user.

## The technical version

### The protocol

The full cycle:

1. **You**: send a user message + tool definitions.
2. **Claude**: responds with a `tool_use` block (or directly with text).
3. **You**: execute the tool, send back a `tool_result` with the same `tool_use_id`.
4. **Claude**: continues with text, or another tool_use.

This loop is the heart of every Claude agent.

### Defining a tool

A tool definition has three parts:

- **`name`** — a snake_case identifier.
- **`description`** — what the tool does. Claude reads this when deciding whether to call.
- **`input_schema`** — JSON Schema for the arguments. Claude generates the arguments to match.

Example:

```js
const tools = [
  {
    name: "lookup_customer",
    description: "Look up a customer by email. Returns name, plan, account_age_days, last_login.",
    input_schema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Customer email address"
        }
      },
      required: ["email"]
    }
  }
];
```

Description quality matters. Write it like you're documenting an API for a junior developer. Be specific about what the tool returns and any constraints.

### Making the call

```js
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  tools,
  messages: [
    { role: "user", content: "What plan is jane@example.com on?" }
  ]
});

console.log(response.stop_reason);   // "tool_use"
console.log(response.content);
// [
//   { type: "text", text: "Let me look that up for you." },
//   { type: "tool_use", id: "toolu_01ABC...", name: "lookup_customer", input: { email: "jane@example.com" } }
// ]
```

The response has `stop_reason: "tool_use"` and a `tool_use` content block with the arguments Claude wants you to pass.

### Executing and returning the result

You run the tool yourself — Claude has no idea what your database looks like:

```js
const toolUse = response.content.find(b => b.type === "tool_use");
const result = await myLookupCustomer(toolUse.input.email);
// e.g. { name: "Jane Doe", plan: "Pro", account_age_days: 312, last_login: "2026-05-18" }

const nextResponse = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  tools,
  messages: [
    { role: "user", content: "What plan is jane@example.com on?" },
    { role: "assistant", content: response.content },   // include the tool_use turn
    {
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(result)
        }
      ]
    }
  ]
});

console.log(nextResponse.content[0].text);
// "Jane is on the Pro plan."
```

Things to note:

- The tool result goes as a **`user` message** (counterintuitive, but that's the protocol).
- Match `tool_use_id` exactly — Claude uses it to correlate.
- Result content is a string. Stringify objects.

### Multiple tools

You can define many tools. Claude picks the right one based on the descriptions:

```js
const tools = [
  { name: "lookup_customer", description: "...", input_schema: { ... } },
  { name: "list_orders", description: "...", input_schema: { ... } },
  { name: "issue_refund", description: "...", input_schema: { ... } },
];
```

Best practices:

- Keep names distinct and descriptive.
- Don't define tools you don't actually want Claude to use.
- More tools = longer prompt (each definition counts toward input). 5–20 tools is typical; 50+ starts feeling heavy.

### Error handling

If your tool fails, return an error in the tool_result:

```js
{
  type: "tool_result",
  tool_use_id: toolUse.id,
  content: JSON.stringify({ error: "Customer not found" }),
  is_error: true
}
```

Claude reads `is_error` and adjusts — it might apologize, retry with different arguments, or escalate to the user.

### Parallel tool calls

Claude can return multiple `tool_use` blocks in one response when the calls are independent:

```js
response.content = [
  { type: "tool_use", id: "tu_1", name: "lookup_customer", input: { email: "..." } },
  { type: "tool_use", id: "tu_2", name: "list_orders", input: { customer_id: "..." } }
];
```

Run them in parallel; return both `tool_result` blocks in the next user message. Saves latency. Lesson 3.3 covers this in depth.

### Forcing tool use

Sometimes you want Claude to definitely call a tool (e.g. you're building a structured-output pipeline). Use `tool_choice`:

```js
tool_choice: { type: "tool", name: "extract_entities" }  // force a specific tool
tool_choice: { type: "any" }                              // force some tool
tool_choice: { type: "auto" }                             // default — let Claude decide
```

For pure structured output, define one tool with the schema you want and force it. Cleaner than parsing free-form text.

### Tool use + prefilling don't mix

The API doesn't allow prefilling when tools are defined. If you need both, pick one — usually tools win because the structured input_schema gives you most of what prefilling would.

### Costs

Tool use adds tokens — the tool definitions live in input on every call. For long tool sets:

- **Cache tool definitions** with `cache_control`.
- **Reduce tool count per call** — only include tools relevant to the route.
- **Use Haiku for routing decisions** before full Sonnet/Opus calls.

## Three real-world scenarios

**Scenario 1: The customer service agent that finally worked.**
A team built a support bot using free-form prompts ("if the user wants a refund, say so"). It hallucinated refund processing constantly. They added a `start_refund` tool with explicit arguments. The bot stopped pretending to do things and started either calling the tool or asking for missing info. Reliability jumped overnight.

**Scenario 2: The 50-tool agent.**
An engineer built an agent with 50 tools "just in case." Prompts ballooned to 8K tokens of tool definitions on every call. They split the agent into router (small set of tools) and specialists (focused tool sets). Token cost dropped 70% with no functional loss.

**Scenario 3: The forgotten tool_result.**
A developer was building an agent and only returned the tool_use to history, forgetting to include the tool_result. Claude kept asking to call the same tool because it never saw the answer. Spent two days debugging before realizing the loop was missing a step. Adding the tool_result fixed it.

## Common mistakes to avoid

- **Vague tool descriptions.** Claude calls the wrong tool. Write them like API docs.
- **Forgetting to send the tool_result back.** Agent loops forever.
- **Tool result not as user role.** The protocol requires user-role messages for tool_result.
- **Mismatched tool_use_id.** Claude can't correlate, behavior breaks.
- **Too many tools at once.** Token cost grows; quality of selection drops.
- **No error handling.** Tool failures return ugly stack traces to the model.
- **Stringifying nested objects without thought.** Big JSON eats tokens; trim where possible.

## Read more

- [Tool use overview](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)
- [Tool use parameters](https://docs.anthropic.com/en/api/messages#body-tools)
- [Tool choice](https://docs.anthropic.com/en/api/messages#body-tool-choice)

## Summary

- **Tool use** lets Claude call your functions. You define tools, Claude decides when to call them, your code executes, results flow back.
- A tool definition has **name, description, and input_schema**. Description quality drives selection quality.
- The protocol: **assistant `tool_use` → user `tool_result`** (with matching `tool_use_id`).
- **Multiple tools** are fine; keep names distinct, descriptions specific.
- **Parallel tool calls** when calls are independent — saves latency.
- **`tool_choice`** lets you force a specific tool (great for structured output).
- **Cache tool definitions** for high-volume features.

Next: the agent loop — putting tool use into a multi-step workflow.
