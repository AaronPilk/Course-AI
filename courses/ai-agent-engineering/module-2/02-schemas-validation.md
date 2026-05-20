---
module: 2
position: 2
title: "Schemas, validation, and structured arguments"
objective: "Constrain inputs with JSON schemas so agents can't misfire."
estimated_minutes: 10
---

# Schemas, validation, and structured arguments

## The puzzle

You define a tool `start_refund(order_id, reason)`. The model calls it with `order_id: "the one from last week"` instead of an actual ID. Or with `reason: ""`. Or with extra fields you didn't define.

JSON Schema is what stops this. Used well, it makes "the model called a tool with bad arguments" a near-zero failure mode.

## The simple version

Every tool has an `input_schema` (JSON Schema). The model generates arguments to match. Tight schemas give you:

- **Type safety** — strings stay strings, numbers stay numbers.
- **Required fields** — the model can't skip them.
- **Enums** — the model can't invent values.
- **Patterns and formats** — IDs match expected shapes.

Loose schemas accept anything. Tight schemas catch bugs before they hit your tool runner.

## The technical version

### Schema basics

A JSON Schema describes the shape and constraints of an object. For tool inputs, the typical shape is:

```json
{
  "type": "object",
  "properties": {
    "field_a": { "type": "string", "description": "..." },
    "field_b": { "type": "integer", "minimum": 0 }
  },
  "required": ["field_a"],
  "additionalProperties": false
}
```

`type`, `properties`, `required`, and `additionalProperties: false` are your bread and butter. The last one is especially important — it stops the model from inventing extra fields.

### Enums constrain choices

When a parameter has a fixed set of values, use `enum`:

```json
{
  "reason": {
    "type": "string",
    "enum": ["damaged", "not_as_described", "changed_mind", "wrong_item"],
    "description": "Reason for refund — must match one of the standard categories."
  }
}
```

Without the enum, the model invents reasons like "user didn't like it" or "customer service request." With the enum, you get one of the four. Schema-level constraint > prompt-level instruction.

### Patterns for IDs

For IDs with predictable format, use `pattern`:

```json
{
  "order_id": {
    "type": "string",
    "pattern": "^O-[0-9]{8}$",
    "description": "Order ID in format 'O-<8-digit-number>', e.g. 'O-12345678'."
  }
}
```

The pattern enforces format. Combined with a clear description and an example, hallucinated IDs drop dramatically.

### Numbers with bounds

For numeric parameters, set `minimum` and `maximum` where they make sense:

```json
{
  "amount": {
    "type": "number",
    "minimum": 0,
    "maximum": 10000,
    "description": "Refund amount in USD. Must be ≥ 0 and ≤ the original order total."
  },
  "quantity": {
    "type": "integer",
    "minimum": 1,
    "maximum": 100,
    "description": "Number of items, must be ≥ 1."
  }
}
```

Bounds prevent obvious errors (negative amounts, ridiculous quantities). Pair with runtime validation for business-rule limits the schema can't express.

### Dates

Two patterns:

**Option A: `format: "date"`**

```json
{
  "purchase_date": {
    "type": "string",
    "format": "date",
    "description": "Purchase date in YYYY-MM-DD format."
  }
}
```

Models recognize `format: "date"` and emit ISO dates. Validate strictly at the tool runner.

**Option B: enum / pattern for tighter control**

Sometimes you want "the date the user mentioned" preserved as natural language. Use a separate string field with a clear description and parse it server-side.

The big mistake is accepting `MM/DD/YY` style and parsing ambiguously. ISO format every time.

### Nested objects

For structured records, nest schemas:

```json
{
  "shipping_address": {
    "type": "object",
    "properties": {
      "line1": { "type": "string" },
      "line2": { "type": "string" },
      "city": { "type": "string" },
      "state": { "type": "string" },
      "postal_code": { "type": "string" },
      "country": { "type": "string", "minLength": 2, "maxLength": 2 }
    },
    "required": ["line1", "city", "country"],
    "additionalProperties": false
  }
}
```

Treat each nested object the same way — required fields, enums, patterns. Models handle nested structure well *when the schema is tight*; they hallucinate fields when it isn't.

### Arrays

For lists, constrain item shape:

```json
{
  "items": {
    "type": "array",
    "minItems": 1,
    "maxItems": 50,
    "items": {
      "type": "object",
      "properties": {
        "sku": { "type": "string", "pattern": "^SKU-[A-Z0-9]+$" },
        "qty": { "type": "integer", "minimum": 1 }
      },
      "required": ["sku", "qty"],
      "additionalProperties": false
    }
  }
}
```

`minItems` and `maxItems` bound list sizes. Always tight on the item schema — that's where hallucination lives.

### Validation at the runtime

Schema enforcement at the model level is partial. Always validate again in your tool runner:

```js
import Ajv from "ajv";
const ajv = new Ajv();

async function runTool(name, input) {
  const tool = TOOLS[name];
  const validate = ajv.compile(tool.input_schema);
  if (!validate(input)) {
    return {
      error: "Invalid arguments",
      details: validate.errors
    };
  }
  return await tool.handler(input);
}
```

Return validation errors as `tool_result` with `is_error: true`. The agent reads them and corrects. This belt-and-suspenders catches edge cases where the model emits something close to but not exactly matching the schema.

### Schema for "any of these shapes"

When a tool can take multiple input shapes, use `oneOf`:

```json
{
  "oneOf": [
    { "properties": { "type": { "const": "email" }, "address": { "type": "string", "format": "email" } } },
    { "properties": { "type": { "const": "sms" }, "phone": { "type": "string", "pattern": "^\\+[0-9]+$" } } }
  ]
}
```

Models handle this OK when the schemas are clearly distinct. They struggle when shapes overlap. Prefer splitting into two tools (`send_email` and `send_sms`) when the schemas would meaningfully diverge.

### Schema-aware error returns

When you return an error, make it actionable:

```js
return {
  is_error: true,
  content: JSON.stringify({
    error: "ORDER_NOT_FOUND",
    message: "No order found with ID 'O-12345678'. Check the ID or try search_orders instead.",
    suggested_tool: "search_orders"
  })
};
```

The agent reads this and tries the suggested alternative. Compare to:

```js
{ error: "Internal Server Error" }
```

…which gives the agent nothing to work with.

### Schemas + tool descriptions reinforce each other

The schema enforces; the description explains. Together:

- Description: "Use when you have a confirmed order ID."
- Schema: pattern matches `^O-[0-9]{8}$`.

The model reads both, picks correctly, formats correctly, hits the tool with valid data.

If schema and description disagree, the model gets confused. Keep them aligned.

## Three real-world scenarios

**Scenario 1: The hallucinated date format.**
A team accepted dates as plain strings. The model emitted "11/12/24" — was that Nov 12 or Dec 11? Bug parsed it both ways depending on locale. They switched to `format: "date"` (ISO required) and added "Use YYYY-MM-DD format" to the description. Date bugs disappeared.

**Scenario 2: The runaway argument hallucination.**
A tool's schema allowed any string for `reason`. The model emitted increasingly creative reasons. They locked it with an enum of 6 standard reasons. The model now picks from the list. Downstream reporting actually works.

**Scenario 3: The extra-fields bug.**
The model emitted a tool call with extra fields the team didn't define. The handler crashed parsing them. They added `additionalProperties: false`. The model stopped inventing fields. The handler became simpler.

## Common mistakes to avoid

- **Loose schemas** (no enums, no patterns, no bounds).
- **Skipping `additionalProperties: false`** — model adds fields you don't expect.
- **No runtime validation.** Belt-and-suspenders catches edge cases.
- **Accepting ambiguous date formats.** ISO 8601 or bust.
- **`oneOf` with overlapping shapes.** Split into separate tools instead.
- **Generic error returns.** Tell the agent what's actionable.

## Read more

- [JSON Schema](https://json-schema.org/understanding-json-schema)
- [Anthropic — tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)
- [OpenAI structured outputs](https://platform.openai.com/docs/guides/structured-outputs)

## Summary

- **JSON Schema** is the model's contract — tight schemas prevent bad calls.
- Use **enums** for fixed choice sets, **patterns** for ID formats, **bounds** for numbers, **`additionalProperties: false`** everywhere.
- **Nested schemas** for structured records; same tightness inside.
- **Always validate at the runtime** with a JSON Schema validator — return actionable errors.
- **Align schema and description** so the model gets consistent signal.
- For divergent input shapes, **split into multiple tools** rather than using `oneOf`.

Next: idempotency, retries, and graceful error returns.
