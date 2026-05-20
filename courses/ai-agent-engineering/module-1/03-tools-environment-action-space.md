---
module: 1
position: 3
title: "Tools, environment, and the action space"
objective: "Define what an agent can do, see, and change."
estimated_minutes: 10
---

# Tools, environment, and the action space

## The puzzle

An agent's intelligence is famous; its action space is often an afterthought. You define a few tools, hand them to the model, and hope it figures things out.

But the action space — the set of things the agent can do — is what determines whether the agent is useful, safe, or dangerous. Bad action spaces produce bad agents no matter how smart the model is.

This lesson is about designing the action space deliberately.

## The simple version

An agent operates over three surfaces:

1. **Tools** — what the agent can do (call APIs, run code, query data, send messages).
2. **Environment / observations** — what the agent can see (results of tools, conversation history, system state).
3. **Constraints** — what the agent shouldn't do (refusal rules, approval gates, scope limits).

Design each deliberately. Tools should be *narrow and composable*. Observations should be *sufficient and minimal*. Constraints should be *explicit and enforceable*.

## The technical version

### Action space — what's in it

The action space is the union of all tools the agent has. Two principles:

**1. Make actions narrow.** A single tool should do one thing well. `start_refund(order_id, reason)` is better than `process_order(order_id, action, args...)`.

**2. Make actions composable.** A complex behavior should emerge from chaining narrow tools, not from one tool with twelve flags. `find_customer(email)` + `list_orders(customer_id)` + `start_refund(order_id, reason)` composes cleanly.

Narrow + composable means the model can mix and match for unanticipated tasks. Wide tools with many parameters confuse models and break in production.

### Action space sizing

How many tools should an agent have?

- **2–5 tools**: simple agent, fast, easy to test, easy to reason about.
- **5–15 tools**: standard production agent. Sweet spot for most products.
- **15–50 tools**: complex agent. Needs careful tool descriptions and probably grouping/scoping.
- **50+ tools**: usually a sign you should split into multiple agents (Module 4.2) or apply tool gating per route.

Each tool adds tokens to the prompt (the definition lives in input) and adds choices the model must weigh. More isn't better.

### Observations — what the agent sees

Tool results are the agent's window onto the environment. They should be:

- **Sufficient** — enough info to make the next decision.
- **Minimal** — no irrelevant fields padding the context.
- **Structured** — JSON or formatted text, not stream-of-consciousness.
- **Stable** — same input → same output (or explainable variance).

A `list_orders` tool that returns 50 fields per order will explode token usage. Return just the fields the agent needs (id, date, status, total). The agent can call a `get_order_details` tool for the full record if needed.

### State that lives outside the tool result

Some context isn't tool output — it's environmental:

- The current user's ID and permissions.
- The current time and timezone.
- The conversation history.
- The agent's role and constraints (system prompt).

Decide what's in the system prompt (always available) vs. what's in messages (turn-specific) vs. what's in tool descriptions (capability-specific). Mixing these confuses the model.

### Constraints

Constraints define what the agent must NOT do. Three places to enforce them:

**1. System prompt rules.** "You only help with X. For other topics, respond: '...'"

**2. Tool design.** Don't expose a `run_arbitrary_sql` tool if you don't want SQL execution. The simplest constraint is to not have the capability.

**3. Approval gates.** For tools where you need the capability but want a human check (refunds, emails, deletes), require approval in your tool runner (Lesson 2.4).

If the agent shouldn't do X, the safest pattern is: don't give it a tool that does X. Second-safest: gate the tool. Last resort: rely on prompt instructions alone.

### Tool description = the model's API doc

Models read tool descriptions to decide when to call. Write them like API docs for a junior dev:

- **What the tool does.**
- **What the parameters mean** (with examples).
- **What it returns** (shape and meaning).
- **Constraints** ("only for orders < 30 days old").
- **When NOT to use it** ("use `get_user` instead for cached lookups").

Bad description:

```
get_orders: Returns orders.
```

Good description:

```
list_recent_orders: Return the user's last 10 orders, sorted by date (newest first).
Use for "show my orders" or "what did I order last?" type questions.
For older orders, prefer search_orders with a date range.
Returns: [{ id, date, status, total }, ...]
```

The difference between vague and specific tool descriptions is the difference between an agent that picks the right tool 60% of the time and 95%.

### Reversibility

Classify each tool by what happens if it runs incorrectly:

- **Read-only** — listing, looking up, searching. Worst case: wasted tokens.
- **Idempotent writes** — actions that can safely run twice with same args (set status, update flag). Worst case: redundant work.
- **Non-idempotent writes** — sending email, charging card, creating record. Worst case: external state breaks.
- **Destructive** — deleting, cancelling. Worst case: data loss.

For each tier, you want a different design:

- **Read-only**: no special handling.
- **Idempotent**: still use idempotency keys for safety.
- **Non-idempotent**: idempotency keys + retries safe + approval if it touches users.
- **Destructive**: approval gate + audit log + maybe a soft-delete pattern.

Module 2 goes deep on this.

### Capability-aware system prompt

Tell the agent what's in its action space in plain English in the system prompt:

```
You have these capabilities:
- Look up users by email or ID.
- List a user's orders, returns, and subscriptions.
- Start a return or refund (requires user confirmation).
- Send an email to the user (requires approval).

You do NOT have:
- Direct database write access.
- The ability to change subscription plans.
- The ability to refund without going through start_refund.

When a request needs something you can't do, explain to the user and offer to escalate.
```

The model already sees tool definitions, but a plain-English summary helps it reason about capability boundaries — especially for refusing requests outside the action space.

### Tools that hand off to humans

A specific pattern: a tool whose "implementation" is to escalate to a human reviewer:

```js
{
  name: "escalate_to_human",
  description: "Hand off to a human support agent when you can't resolve the user's issue, or when the user explicitly asks for a human.",
  input_schema: {
    type: "object",
    properties: {
      summary: { type: "string", description: "1-sentence summary of the issue" },
      attempted_actions: { type: "array", items: { type: "string" } }
    }
  }
}
```

Giving the agent an explicit "escalate" tool is much better than letting it improvise an escalation. The agent uses it; your code routes the user to a human queue.

## Three real-world scenarios

**Scenario 1: The agent that picked the wrong tool half the time.**
A team had two tools with vague descriptions: `get_user` and `find_user`. The agent flipped between them randomly. They renamed and rewrote: `get_user_by_id(id)` and `search_users_by_name(query)`. Wrong-tool calls dropped from ~50% to <5%. The fix was in the description, not the model.

**Scenario 2: The 50-tool monster.**
An agent had 50 tools — every internal API got exposed. Prompts were 8K tokens of definitions before any real input. Token cost was high; tool selection was poor. They split into three specialized agents (support, ops, research) each with 8–12 tools. Cost dropped 70%, accuracy went up.

**Scenario 3: The escalation that worked.**
A support agent kept "trying harder" on tickets it couldn't resolve, producing increasingly weird responses. Adding an `escalate_to_human` tool with a clear description fixed it. The model used the escalate tool 12% of the time — exactly the cases that needed human attention.

## Common mistakes to avoid

- **Wide tools with many flags.** Models pick wrong arguments; behavior is unreliable.
- **50+ tools on one agent.** Token cost balloons; selection quality drops.
- **Vague tool descriptions.** "Returns orders" doesn't tell the model when to use it.
- **No escalation tool.** Agent overreaches when it should hand off.
- **Exposing dangerous capabilities by default.** If you don't want it, don't expose it.
- **Tool result with 50 fields.** The agent gets distracted by irrelevant context.

## Read more

- [Anthropic — tool use overview](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)
- [OpenAI function calling guide](https://platform.openai.com/docs/guides/function-calling)
- [Building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)

## Summary

- **Tools, observations, constraints** together define the action space — design each deliberately.
- **Make tools narrow and composable.** A few good ones beat many wide ones.
- **5–15 tools** is the sweet spot for production agents.
- **Tool descriptions are the model's API doc** — write them precisely, with examples and use cases.
- **Classify tools by reversibility** and gate accordingly: read-only, idempotent, non-idempotent, destructive.
- **Always give the agent an escalation tool.** Hand-off beats overreach.
- **Summarize capabilities in plain English in the system prompt** — model reasons better about scope.

Next: when NOT to build an agent.
