---
module: 2
position: 2
title: "Structured output — making the model return JSON you can trust"
objective: "Use structured output and JSON schema mode to get parseable, predictable responses."
estimated_minutes: 13
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# Structured output — making the model return JSON you can trust

## The puzzle

You ask the model to return JSON. The output looks like JSON. You write `JSON.parse(response)`.

It crashes.

You look at the response: there's a sneaky markdown code fence wrapping the JSON. You strip it.

Next call: the JSON is missing a field you asked for. The call after that: a number came back as a string. The call after that: the JSON is *almost* valid, but one comma is missing.

You're now writing a regex-based "JSON repair" function. You hate your job.

This entire category of pain has a clean solution: **structured output**. The model is forced — not asked, *forced* — to produce output matching a schema you provide. No fences. No missing fields. No type confusion. Just parseable JSON, every time.

## The simple version

OpenAI's structured output feature lets you pass a JSON schema along with your prompt. The API guarantees the response will conform to that schema.

Three big benefits:

1. **No parser errors.** The model can't return invalid JSON.
2. **No missing fields.** Every field in your schema is present in the response.
3. **No type confusion.** Numbers are numbers. Strings are strings. Arrays are arrays.

This works on both the Responses API and Chat Completions. It's available on most current models. There's a small cost overhead (the schema counts as input tokens) but the reliability gain is dramatic.

Use structured output any time downstream code needs to consume the model's output programmatically.

## The technical version

### How structured output works

You pass a `response_format` (Chat Completions) or `text.format` (Responses API) specifying:

- A `type` of `json_schema`
- The actual JSON schema describing what you want
- A `strict: true` flag that enforces conformance

The model is then constrained — at the token-generation level — to produce only tokens that keep the output valid relative to your schema. It physically can't generate a malformed response.

### A working example (Responses API)

```js
const response = await openai.responses.create({
  model: "gpt-5-mini",
  input: "Extract details from: Sarah Chen, Marketing Director at Acme Corp. Concerned about ad attribution.",
  text: {
    format: {
      type: "json_schema",
      name: "lead_extraction",
      strict: true,
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          company: { type: "string" },
          concern: {
            type: "string",
            description: "Their primary stated business concern."
          },
          confidence: {
            type: "number",
            description: "Confidence in extraction, 0–1."
          }
        },
        required: ["name", "role", "company", "concern", "confidence"],
        additionalProperties: false
      }
    }
  }
});

const parsed = JSON.parse(response.output_text);
// parsed.name = "Sarah Chen"
// parsed.role = "Marketing Director"
// parsed.company = "Acme Corp"
// parsed.concern = "ad attribution"
// parsed.confidence = 0.95
```

Three things to notice:

1. **`strict: true`** — the model is forced to comply with the schema. No "close enough."
2. **`additionalProperties: false`** — the model can't sneak extra fields in. Critical for downstream type safety.
3. **`required: [...]`** — every field listed must be present in the response.

### What "strict" means in practice

OpenAI's structured output supports a constrained subset of JSON schema features. The big ones:

- Basic types: `string`, `number`, `integer`, `boolean`, `null`
- `object` with `properties`, `required`, `additionalProperties`
- `array` with `items`
- `enum` for string fields with fixed options
- `anyOf` for unions
- `description` (used for guidance but doesn't constrain the value)

A few features *not* supported in strict mode:

- Complex regex patterns
- `minLength` / `maxLength` (you can describe in the field's description)
- `minimum` / `maximum` on numbers
- Conditional schemas

For 90% of real use cases, the supported subset is enough. When you need a constraint the schema can't express (e.g., "name must be 1–50 chars"), describe it in the `description` field and validate in post-processing.

### Where structured output earns its keep

Every use case where the next step in your code depends on the structure:

- **Data extraction.** Pulling fields from text into a record.
- **Classification.** Returning a category from a fixed enum.
- **Routing.** Picking which downstream code path to take.
- **Forms processing.** Mapping PDF / image / email content to a structured object.
- **Function arguments.** When a tool call's parameters need specific shapes.
- **Generating UI configurations.** Returning a JSON config for a downstream renderer.
- **Test fixtures and synthetic data.** Generating consistent objects for testing.

### Where structured output isn't worth it

For free-form text output (essays, emails, summaries, code), structured output adds overhead without benefit. You'd just be wrapping the text in `{ "content": "..." }`, which is pointless.

The simple test: is downstream code parsing the response? If yes, use structured output. If a human reads the response directly, skip it.

### Structured output vs function calling

A subtle distinction: structured output and function calling both produce structured data, but they're for different things.

- **Function calling** says "the model decides to call a function with these arguments." It's about *intent* — the model is invoking something.
- **Structured output** says "the model's text response will conform to this schema." It's about *format* — the model is returning data.

You can use both in one call: the model can decide to call a function (function calling) and also return structured fields as the function's arguments (structured output, applied to the argument schema).

For new code, the lines have blurred — both are supported across modern OpenAI APIs and you'll often combine them. The mental model: function calling is for *actions*, structured output is for *data*.

### Cost and latency overhead

Schemas count as input tokens. A reasonably complex schema is 200–500 tokens. For high-volume use cases that's real cost.

Two optimizations:

1. **Reuse schemas.** If your schema is byte-identical across calls, prompt caching can amortize the cost.
2. **Don't over-specify.** Only include fields the model needs. Adding "nice to have" fields adds tokens.

Latency is mostly unaffected — the structural constraints don't significantly slow generation.

### Validation: still your job

Structured output guarantees the *shape* of the response. It doesn't guarantee:

- The values make sense (the model can still produce nonsense within valid types).
- Numbers are in valid ranges.
- Strings are well-formed (emails are real emails, URLs are reachable, etc.).
- The data is consistent across fields.

After parsing, apply your usual validation. Structured output gets you to "parseable" — it doesn't replace your business logic checks.

### A real pattern: form-from-text

A common workflow that benefits dramatically from structured output:

1. User submits unstructured text (an email, a PDF page, a chat message, a transcribed voice note).
2. Model extracts structured fields.
3. Your app uses those fields downstream.

Without structured output: parser errors, missing fields, edge cases, type confusion. Half your code is defensive parsing.

With structured output: parse JSON, get a typed object, move on. Your code can stay focused on business logic.

This pattern alone justifies adopting structured output across most data-extraction use cases.

### TypeScript-friendly patterns

For Node / TypeScript teams, a nice pattern is to define your schema *and* your TypeScript type from a single source — often using Zod:

```ts
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const LeadSchema = z.object({
  name: z.string(),
  role: z.string(),
  company: z.string(),
  concern: z.string(),
  confidence: z.number(),
});

const response = await openai.responses.create({
  model: "gpt-5-mini",
  input: "...",
  text: {
    format: zodResponseFormat(LeadSchema, "lead_extraction"),
  },
});

// fully typed
const lead: z.infer<typeof LeadSchema> = JSON.parse(response.output_text);
```

The OpenAI SDK provides `zodResponseFormat` helpers (or similar) that bridge Zod schemas to OpenAI's JSON schema format. You get one source of truth for both runtime validation and TypeScript types.

For Python: `pydantic` plays the same role. The OpenAI SDK has pydantic helpers.

## An analogy: the difference between a form and a free-text response

A doctor's office uses two kinds of intake:

- **Free-text intake**: "Please describe your symptoms." Patients write anything. Some are precise; some are rambling; some forget to mention important details. Staff have to read every one and figure out what to do.

- **Structured form**: "Symptoms: [checkbox list]. Pain level (1–10): [____]. Duration: [____]. Allergies: [____]." The structure forces completeness. Staff can process forms 10× faster.

Structured output is the difference between asking the model for free-text and giving it a structured form to fill out. The form approach is dramatically more reliable for any downstream processing.

When the goal is *communication with a human*, free-text is fine. When the goal is *data extraction or routing*, fill out the form.

## Three real-world scenarios

**Scenario 1: The "JSON repair" function that disappeared.**
A team had ~200 lines of custom code to clean up the model's "JSON-ish" output — strip markdown fences, fix trailing commas, handle wrong types, repair missing fields. After moving to structured output, they deleted all 200 lines. The model now returns valid JSON every time. Six weeks later: zero parser errors in production.

**Scenario 2: The form-extraction pipeline at 99% accuracy.**
A company processed inbound emails to extract leads. Without structured output, accuracy of "all fields correctly extracted" was ~84% (missing fields, wrong types). With structured output, accuracy hit 99%. The model couldn't omit a required field even when uncertain — it just had to guess, which improved with prompt tuning. Net: 15-point accuracy gain at trivial integration cost.

**Scenario 3: The agent that became debuggable.**
An agent had an orchestrator step that decided which tool to call next. The orchestrator returned free-text "Next tool: get_user_info" which downstream code had to regex-parse. It broke frequently. Switching the orchestrator to structured output with a strict schema (`{ next_tool: enum, reason: string, args: object }`) made the agent reliable and debuggable overnight.

## Common mistakes to avoid

- **Asking for JSON in the prompt instead of using structured output.** The model often complies but not always. Use the actual feature.
- **Forgetting `additionalProperties: false`.** Without this, the model can add unexpected fields and your TypeScript types lie.
- **Forgetting `required` arrays.** Without them, fields can be missing.
- **Over-specifying schemas.** Each extra field costs tokens and may confuse the model. Only include what's needed.
- **Treating structured output as validation.** It guarantees shape, not semantics. Still validate values.
- **Combining structured output with markdown formatting in the same call.** Pick one or the other; mixing reduces reliability.

## Read more

- [Structured Outputs guide](https://platform.openai.com/docs/guides/structured-outputs) — primary reference
- [JSON Schema docs](https://json-schema.org/) — full schema language (note: only a subset is supported in strict mode)
- [OpenAI Cookbook on structured outputs](https://cookbook.openai.com) — working examples

## Summary

- Structured output forces the model to produce JSON conforming to a schema you provide. No more parser errors.
- Use `strict: true` plus `additionalProperties: false` plus explicit `required` arrays. Otherwise structure isn't actually enforced.
- The supported schema subset covers ~90% of real use cases. For uncovered constraints, validate in post-processing.
- Best for *data extraction, classification, routing, form-filling, function arguments*. Skip for free-text essays.
- Pair with Zod (TS) or Pydantic (Python) for a single source of truth for schema and types.
- Validation is still your job — structured output guarantees shape, not meaning.

Next: function calling and tool use. Letting the model decide when to call your code, and patterns that survive production load.
