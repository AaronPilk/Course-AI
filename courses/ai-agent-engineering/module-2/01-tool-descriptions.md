---
module: 2
position: 1
title: "Writing tool descriptions models actually read"
objective: "Write tool descriptions that drive correct tool selection."
estimated_minutes: 10
---

# Writing tool descriptions models actually read

## The puzzle

Two tools: `get_user` and `find_user`. The model flips between them at random. You change "find_user" to "search_user". The flipping continues. You add an exclamation point to the description. Nothing changes.

The problem isn't the model. It's that your tool descriptions are ambiguous — they don't tell the model when to use each one. Fixing the descriptions is almost always more impactful than fixing the model.

## The simple version

A good tool description has five parts:

1. **What the tool does** in one sentence.
2. **When to use it** — the trigger conditions in plain language.
3. **When NOT to use it** — point to the better alternative.
4. **What the parameters mean** — including examples.
5. **What it returns** — shape and meaning.

Write it like an API doc for a junior dev. Specific beats clever.

## The technical version

### A bad tool description

```
{
  name: "get_user",
  description: "Returns a user.",
  input_schema: { type: "object", properties: { id: { type: "string" } } }
}
```

What does the model know? Almost nothing. It returns a user. From what input? Email? ID? Username? Both `id` and `email` look reasonable; the model picks one and might get it wrong.

### A good tool description

```
{
  name: "get_user_by_id",
  description: "Look up a user record by their internal user ID (e.g. 'u_abc123'). Returns name, email, plan, created_at, last_login. Use when you have a confirmed user ID; for lookups by email or name, use search_users instead.",
  input_schema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "User ID in the format 'u_<alphanumeric>'. Example: 'u_abc123def456'."
      }
    },
    required: ["id"]
  }
}
```

The model now knows: it's an ID lookup (not email), the ID looks a specific way, what comes back, and what to do if it has an email instead.

### Name like you'd grep

Tool names show up in the model's reasoning. Make them distinct and descriptive:

- ✅ `get_user_by_id`, `search_users_by_name`
- ❌ `get_user`, `find_user` (too similar)

If two tools could both plausibly fit a query, the model will fumble. The name should disambiguate even before the description.

### Trigger conditions

The most useful part of a description is "when to use this." Frame it as a trigger:

- "Use when you have a confirmed order number."
- "Use when the user explicitly asks for a refund."
- "Use to look up policy details by topic name."

The model maps user intent → trigger condition → tool. Without trigger conditions, it maps intent → tool name → guess.

### Anti-triggers

Equally useful: when *not* to use it.

- "Do not use to query a different customer's data."
- "Do not use for historical orders older than 90 days — use `archive_search` instead."
- "Do not call without first confirming the user's intent."

These prevent overuse and steer the model toward the right tool when multiple could apply.

### Parameter descriptions

Each parameter needs:

- **Purpose** in plain language.
- **Format / shape** with example.
- **Constraints** (length, enum, range).

```
{
  email: {
    type: "string",
    format: "email",
    description: "Customer's primary email. Lowercased; no aliases. Example: 'alex@example.com'."
  },
  order_id: {
    type: "string",
    description: "Order ID in format 'O-<8-digit-number>'. Example: 'O-12345678'."
  }
}
```

Models do better when they know the format. Without it, you'll see hallucinated IDs.

### Return shape in the description

Tell the model what to expect back:

- "Returns: `{ name, email, plan, created_at, last_login }`."
- "Returns up to 10 matching orders, sorted by date (newest first)."
- "Returns: `{ success: true, refund_id }` on success; `{ success: false, error }` on failure."

The model uses the return shape to plan its next step.

### Examples in the description

For tools with complex inputs or unusual patterns:

```
description: `
Search the knowledge base for relevant articles.
Use when the user asks a factual question about products, policies, or how-to topics.

Examples of good queries:
- "refund policy for opened items"
- "how to enable two-factor authentication"
- "shipping speed for international orders"

Returns: array of { article_id, title, snippet, score }
`
```

The model picks up the query style from examples — much better than from abstract description alone.

### Consistency across tools

If you have 10 tools that all return user records, they should return the **same shape**. Inconsistent returns make the model do extra reasoning to figure out what it got.

Example pattern: every "get_X" tool returns `{ id, ...fields }`. Every "list_X" returns `{ items: [...], next_cursor }`. Every "search_X" returns `{ matches: [...], total }`.

Consistency makes the model faster and more accurate.

### Don't bury constraints

If a tool only works under certain conditions, say so plainly:

- "Only works for orders placed within the last 90 days."
- "Requires admin permissions; will return 403 for regular users."
- "Cost: ~$0.10 per call. Use sparingly."

Hidden constraints surface as runtime errors and confused agents. Surface them up front.

### Description length

There's no fixed limit, but:

- **2–4 sentences** for simple tools.
- **5–10 sentences** for tools with subtle usage.
- **Up to a paragraph** for tools with multiple modes, complex input formats, or unusual constraints.

Long enough to be precise; short enough to read on every call. Remember: tool descriptions live in the prompt on every call. Verbose descriptions = real ongoing token cost.

### Iterate descriptions, not models

When you see wrong-tool selection in production, the first move is **fix the description**, not change the model. Most "the model picked the wrong tool" bugs are description bugs.

Workflow:

1. Find the failing case.
2. Look at the model's reasoning (if visible) or guess what made it pick wrong.
3. Tighten the description — add a trigger, add an anti-trigger, clarify a parameter.
4. Add the case to your eval set.
5. Re-run; verify the fix.

Description iteration is faster, cheaper, and more reliable than model swaps for selection bugs.

## Three real-world scenarios

**Scenario 1: The 50-point accuracy jump.**
A team had three lookup tools (`get_user`, `find_user`, `lookup_user`). Selection accuracy was 50%. They renamed and rewrote: `get_user_by_id`, `search_users_by_name_or_email`, `lookup_user_by_phone`. Selection jumped to 96%. Pure description work.

**Scenario 2: The hallucinated ID problem.**
A team's tool used IDs like `O-12345678` but the description didn't show the format. The model called the tool with `12345678` (missing the prefix). They added "Format: `O-<8-digit-number>`. Example: `O-12345678`." to the parameter description. Hallucination dropped to 0.

**Scenario 3: The over-call problem.**
An agent kept calling `search_knowledge_base` for trivial questions Claude could answer from memory. They added to the description: "Only use for factual questions about products, policies, or how-to topics. Do not use for general knowledge questions." Over-calling dropped 80%.

## Common mistakes to avoid

- **Vague descriptions.** "Returns a user." Useless.
- **Identical-sounding tool names.** Model can't disambiguate.
- **No examples on complex inputs.** Models hallucinate formats.
- **Hidden constraints.** Surface them or face runtime errors.
- **Verbose descriptions for simple tools.** Wastes tokens on every call.
- **Inconsistent return shapes.** Forces the model to figure out each one.
- **Iterating model before iterating descriptions.** Slower, more expensive path to the same outcome.

## Read more

- [Anthropic — tool use best practices](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)
- [OpenAI function calling guide](https://platform.openai.com/docs/guides/function-calling)

## Summary

- Tool descriptions are **the model's API doc** — write them precisely.
- Include **what, when to use, when NOT to use, parameters with examples, return shape**.
- **Distinct names** disambiguate when descriptions can't.
- **Trigger and anti-trigger phrases** map intent to tool reliably.
- **Examples in the description** outperform abstract rules.
- **Consistency across tools** speeds up reasoning.
- **Fix descriptions before swapping models** — most selection bugs are description bugs.

Next: schemas, validation, and structured arguments.
