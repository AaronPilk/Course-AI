---
module: 3
position: 3
title: "Parallel tool calls and structured outputs"
objective: "Use parallel tool calls and JSON schemas to get structured data reliably."
estimated_minutes: 10
---

# Parallel tool calls and structured outputs

## The puzzle

Two things slow down most Claude agents:

1. Tools are called one at a time, even when they're independent.
2. Parsing free-form responses for structured data is fragile.

This lesson covers both fixes. Parallel tool calls cut latency in half on multi-tool steps. Tool-based structured output replaces brittle regex with typed schemas.

## The simple version

**Parallel tool calls**: when Claude needs to call multiple tools whose results don't depend on each other, it returns them in one response. You execute them in parallel and send all the results back together.

**Structured output via tools**: define a tool with your desired schema, force Claude to call it, and read typed arguments back instead of parsing text.

Both come from the same primitive: tool use. Both are nearly-free wins.

## The technical version

### How parallel tool use looks

Claude returns multiple `tool_use` blocks in one response when calls are independent:

```js
response.content = [
  { type: "text", text: "Let me check both of those at once." },
  { type: "tool_use", id: "tu_1", name: "lookup_customer", input: { email: "jane@x.com" } },
  { type: "tool_use", id: "tu_2", name: "lookup_recent_orders", input: { email: "jane@x.com" } }
]
```

Both calls fire from one model decision; both should execute in parallel; both `tool_result` blocks go back in the next user message.

### Executing in parallel

```js
const toolUses = response.content.filter(b => b.type === "tool_use");

const results = await Promise.all(
  toolUses.map(async (block) => {
    try {
      const result = await runTool(block.name, block.input);
      return {
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      };
    } catch (err) {
      return {
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify({ error: err.message }),
        is_error: true,
      };
    }
  })
);

messages.push({ role: "user", content: results });
```

`Promise.all` is the whole pattern. Each tool runs independently; total latency is the slowest tool, not the sum.

### When Claude doesn't parallelize

Claude is smart about this. If tool B depends on tool A's result, Claude won't call them together — it'll call A, get the result, then call B. You don't need to hint at this; Claude reads its own tool descriptions.

If you find Claude calling tools serially when they could parallelize, the fix is usually in the descriptions. Make it clearer that the calls are independent.

### Forcing parallel use

If you specifically want Claude to call certain tools in parallel:

```
Look up the customer and their recent orders at the same time. These calls are independent — make both lookups in parallel.
```

Most of the time Claude figures it out on its own. Be explicit only when it doesn't.

### Latency win, sketched

A multi-step agent that calls 4 independent tools:

- **Serial**: 4 × ~500ms = 2,000ms total just for tool execution.
- **Parallel**: max(500ms, 500ms, 500ms, 500ms) = 500ms.

That's a 4× speedup on the tool-execution portion of the agent, before counting model time. For latency-sensitive products, this is the difference between fast and sluggish.

### Structured output via tools

Tool calling is the cleanest way to get structured JSON from Claude. Define a tool whose `input_schema` matches your desired output:

```js
const tools = [
  {
    name: "save_extracted_invoice",
    description: "Save extracted invoice data to the database.",
    input_schema: {
      type: "object",
      properties: {
        vendor: { type: "string" },
        invoice_number: { type: "string" },
        date: { type: "string", format: "date" },
        total_amount: { type: "number" },
        currency: { type: "string", enum: ["USD", "EUR", "GBP"] },
        line_items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              quantity: { type: "number" },
              unit_price: { type: "number" }
            },
            required: ["description", "quantity", "unit_price"]
          }
        }
      },
      required: ["vendor", "invoice_number", "date", "total_amount", "currency", "line_items"]
    }
  }
];

const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  tools,
  tool_choice: { type: "tool", name: "save_extracted_invoice" },
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "Extract the invoice data from this image." },
        { type: "image", source: { type: "base64", media_type: "image/png", data: imageBase64 } }
      ]
    }
  ]
});

const toolUse = response.content.find(b => b.type === "tool_use");
const invoiceData = toolUse.input;  // typed object, schema-validated
```

You never actually have to "execute" the tool — you just want the structured input Claude generated. The tool call IS the result.

### Why this beats prefilling for structured data

Prefilling (Lesson 2.3) is great for short responses. For structured data, tool-call output beats prefilling on three dimensions:

1. **Schema validation** — the API enforces the schema.
2. **Optional fields and enums** are first-class.
3. **Nested arrays and objects** are reliable.

The cost is one extra round-trip if you wanted to act on the data (you'd send a `tool_result` back to let Claude continue). For pure extraction tasks where you just want the JSON, you stop after the first response.

### When NOT to use tool-based structured output

- **Short text responses** — prefill is simpler.
- **When you want Claude to also speak naturally** — tool call output is JSON only.
- **When the schema is genuinely freeform** — don't force structure that doesn't fit.

### Combining: structured output as an agent step

You can mix tools with real side effects and tools that are just structured-output containers:

```js
const tools = [
  // Real side-effect tool
  { name: "send_email", description: "...", input_schema: { ... } },

  // Structured-output container — "tool" that Claude calls to give you a typed plan
  {
    name: "propose_plan",
    description: "Propose a plan before executing it. The user will review the plan before any side-effect tools run.",
    input_schema: {
      type: "object",
      properties: {
        steps: { type: "array", items: { type: "string" } },
        risks: { type: "array", items: { type: "string" } },
      },
      required: ["steps", "risks"]
    }
  }
];
```

You require Claude to call `propose_plan` first, surface the plan to the user, and then let the agent loop proceed only after the user approves. The plan is structured (because it's a tool call), and the side-effect tools are gated behind user review.

## Three real-world scenarios

**Scenario 1: The agent that went from 8 seconds to 2.**
A research agent called 4 independent search tools serially. Total time was 8s per query. They switched to `Promise.all` on the tool-execution step. New time: 2s. No code beyond `Promise.all` and the message construction.

**Scenario 2: The extraction that finally got reliable.**
A team extracted structured data from PDFs using free-form JSON prompts. Schema validation failed on ~3% of calls (missing fields, wrong types, extra commentary). They switched to forced tool calling with a strict input_schema. Failures dropped to ~0.1%, and the remaining failures returned cleanly typed `tool_use_error` events they could handle.

**Scenario 3: The plan-then-act pattern.**
An agent kept making suboptimal multi-step decisions. The team added a `propose_plan` tool that the agent had to call first. The plan was visible to the user; users could approve, edit, or reject. Quality jumped because the agent was forced to think structured before acting.

## Common mistakes to avoid

- **Serial tool calls when they could parallelize.** Easy win you're leaving on the table.
- **Mixing parallel results in the wrong order.** Match by `tool_use_id`, not by position.
- **Schema too loose.** "Type: string" with no enum means Claude might output anything sensible — including invalid options. Use enums and required fields aggressively.
- **Forcing tool use when it doesn't fit.** Don't pack everything into tool calls; some responses really should be text.
- **Forgetting `tool_choice` when you want forced output.** Without it, Claude might respond with text and skip the tool.

## Read more

- [Tool use overview](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)
- [Parallel tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview#parallel-tool-use)
- [JSON Schema reference](https://json-schema.org/understanding-json-schema)

## Summary

- **Parallel tool calls** happen automatically when Claude judges calls independent — execute with `Promise.all`.
- **Match results by `tool_use_id`**, not by position.
- **Structured output via tools**: define a tool with your schema, force it with `tool_choice`, read typed arguments.
- **Schemas with enums and required fields** are far more reliable than free-form output.
- **Mix real tools and structured-output tools** to build plan-then-act patterns.
- **Don't force tool use when text fits better.** Pick the right primitive for the task.

Next: MCP — the Model Context Protocol for connecting Claude to external systems.
