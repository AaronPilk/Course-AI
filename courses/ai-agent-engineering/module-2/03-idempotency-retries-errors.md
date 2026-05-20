---
module: 2
position: 3
title: "Idempotency, retries, and error returns"
objective: "Design tools that survive being called twice and fail gracefully."
estimated_minutes: 10
---

# Idempotency, retries, and error returns

## The puzzle

An agent calls `send_email`. The call times out from the agent's side. The agent doesn't know if the email was sent. It tries again. The customer gets two emails.

Or: `issue_refund` succeeds. The agent's tool result message gets lost. The agent retries. The customer gets two refunds.

These aren't model bugs. They're tool design bugs. Every production agent needs tools that are **idempotent**, that **retry safely**, and that **return errors the agent can act on**.

## The simple version

Three rules:

1. **Idempotency keys** on every non-read tool. Pass the same key twice → same result, no duplicate effect.
2. **Retries are the agent runner's job**, not the model's. Decide retry policy in your runtime.
3. **Error returns must be structured and actionable.** Tell the agent what went wrong and what to do next.

## The technical version

### What idempotency means

A tool is idempotent if calling it twice with the same arguments produces the same effect as calling it once.

- ✅ `set_subscription_plan(user_id, plan)` — calling twice leaves the user on `plan`. Same outcome.
- ❌ `add_credit(user_id, amount)` — calling twice adds `amount` twice. Different outcomes.

For non-idempotent operations, add an **idempotency key**:

```js
{
  name: "issue_refund",
  description: "...",
  input_schema: {
    type: "object",
    properties: {
      order_id: { type: "string" },
      amount: { type: "number" },
      idempotency_key: {
        type: "string",
        description: "Unique key for this refund attempt. Reusing the same key returns the existing refund instead of creating a duplicate."
      }
    },
    required: ["order_id", "amount", "idempotency_key"]
  }
}
```

The agent generates a UUID; your handler stores `(idempotency_key) → result`. Repeat calls return the stored result instead of repeating the side effect.

Generate the key once at the start of each agent task. Carry it through retries.

### Stripe-style idempotency

The pattern from Stripe and other production APIs:

1. Client generates an idempotency key (UUID).
2. Client sends the request with the key.
3. Server checks: does this key exist?
   - Yes → return stored response.
   - No → perform the operation, store `(key → response)`, return response.

Implementing this in your tool handler:

```js
async function issueRefund({ order_id, amount, idempotency_key }) {
  const cached = await idempotencyStore.get(idempotency_key);
  if (cached) return cached;

  const result = await refundProvider.issue({ order_id, amount });
  await idempotencyStore.set(idempotency_key, result, { ttl: 7 * 24 * 3600 });
  return result;
}
```

TTL of a few days is enough to handle agent retries. After that, the key can expire.

### Where retries belong

Retries belong in the **tool runner**, not in the model loop. Specifically:

- **Transient network failures**: retry with exponential backoff inside the tool runner.
- **Rate limit (429)**: backoff and retry.
- **Tool result lost / timeout**: rely on idempotency keys; safe retry.
- **Deterministic errors (validation, not_found)**: return as error result to the agent — don't retry.

The agent shouldn't see retries unless they fail. If `runTool` retries internally 3 times before returning, the agent gets one clean result or one clear error.

```js
async function runTool(name, input) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await TOOLS[name](input);
      return result;
    } catch (err) {
      if (isTransient(err) && attempt < 2) {
        await sleep(2 ** attempt * 1000);
        continue;
      }
      return { error: err.message, attempted: attempt + 1 };
    }
  }
}
```

### Error result shape

When a tool fails, return a structured error the agent can read:

```json
{
  "error": "ORDER_NOT_FOUND",
  "message": "No order found with ID 'O-12345678'.",
  "suggested_action": "Try search_orders with a date range or customer email."
}
```

Three fields:

- **`error`**: a stable error code (uppercase enum). Useful for monitoring and for downstream code.
- **`message`**: human-readable. The agent reads this.
- **`suggested_action`** (optional): a hint about what the agent might try next.

Compare to:

```json
{ "error": "500 Internal Server Error" }
```

…which leaves the agent guessing.

### Common error categories

For most tools, your errors fall into:

- **`NOT_FOUND`** — the entity doesn't exist.
- **`UNAUTHORIZED`** — caller doesn't have permission.
- **`VALIDATION`** — bad input (handled by schema validation usually).
- **`CONFLICT`** — request conflicts with current state ("already refunded").
- **`RATE_LIMIT`** — too many calls; retry later.
- **`UPSTREAM_ERROR`** — external dependency failed.
- **`TIMEOUT`** — operation took too long.

Standardize across your tools so the agent learns to recognize them.

### Surfacing errors to the agent

When you return an error, set `is_error: true` (Claude) or include error data in the tool result the way your framework expects. The model is trained to handle errors — show error states and it adapts.

```js
return {
  is_error: true,
  content: JSON.stringify({
    error: "RATE_LIMIT",
    message: "Too many requests. Retry after 60 seconds.",
    retry_after: 60
  })
};
```

The agent reads this, waits or asks the user, and tries again. Without `is_error`, the agent may treat the error message as a normal result.

### Timeouts

Every tool call needs a timeout. Without one, a hung dependency hangs your agent.

```js
async function runTool(name, input) {
  return await Promise.race([
    TOOLS[name](input),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 30_000)
    )
  ]);
}
```

Pick the timeout per tool — quick lookups might be 5s, web searches 30s, deep analysis 90s. The 30s default is a reasonable starting point.

### Don't surface raw exceptions

Never return:

```
TypeError: Cannot read property 'id' of undefined at line 47
```

The agent gets nothing useful from a stack trace. Catch, log internally, return a structured error.

### Logging side effects

For non-idempotent tools, log every call before execution:

- Trace ID.
- Tool name.
- Input args.
- Timestamp.
- Idempotency key.

If something goes wrong, you can audit exactly what the agent did. Logs are also the input to evals (Module 5.1).

## Three real-world scenarios

**Scenario 1: The double-refund incident.**
A team's agent timed out waiting for `issue_refund`. The agent retried. Two refunds went out. They added idempotency keys generated at the start of each task. Retries became safe; double-charges disappeared.

**Scenario 2: The hung agent.**
An external service stopped responding. The agent's `lookup_order` call hung. The whole agent run timed out 8 minutes later, after the user closed the tab. They added a 10s per-tool timeout. Hung dependencies now surface as quick errors the agent can route around.

**Scenario 3: The cryptic error.**
A tool returned `{"error": "Internal Server Error"}`. The agent retried it 5 times, each time getting the same error. They added structured error codes and `suggested_action`. The agent stopped looping and gave the user a useful message instead.

## Common mistakes to avoid

- **Non-idempotent tools without keys.** Retry = duplicate side effect.
- **Retries inside the model loop.** Belongs in the tool runner.
- **No per-tool timeouts.** Hung tool = hung agent.
- **Raw exceptions surfaced to the model.** Useless context.
- **Inconsistent error shapes.** Agent can't learn the pattern.
- **No audit log for side-effect tools.** Can't debug post-incident.

## Read more

- [Stripe idempotency design](https://stripe.com/docs/api/idempotent_requests)
- [Anthropic tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)
- [OpenAI function calling](https://platform.openai.com/docs/guides/function-calling)

## Summary

- **Idempotency keys** make side-effect tools safe to retry.
- **Retries belong in the tool runner**, not in the model loop.
- **Structured error returns** (`error`, `message`, `suggested_action`) let agents recover.
- **Timeouts on every tool** prevent hung agents.
- **Audit logs** on side-effect tools — debugging requires them.
- **Standardize error categories** so the agent learns the patterns.

Next: approval gates and human-in-the-loop.
