---
module: 3
position: 2
title: "The agent loop with Claude"
objective: "Build a multi-step agent that uses tools to complete a goal."
estimated_minutes: 11
---

# The agent loop with Claude

## The puzzle

A single tool call is simple. But what you want is usually a *task*: "find Jane's latest order, check its status, email her an update if it's delayed."

That's three tool calls, in order, with reasoning between them. The pattern that does this is the **agent loop** — Claude calls a tool, you run it, you send back the result, Claude calls another tool, repeat until Claude decides it's done.

This lesson is the loop. Once you've built one, you've built them all.

## The simple version

```
while True:
  response = call_claude(messages, tools)

  if response.stop_reason == "end_turn":
    return response  # Claude is done
  
  if response.stop_reason == "tool_use":
    for tool_use in tool_uses_in(response):
      result = execute_tool(tool_use)
      messages.append(tool_result_message(tool_use.id, result))
    continue
  
  # Other stop reasons handled here
```

Loop until Claude returns `end_turn`. That's the entire pattern.

## The technical version

### Reference implementation

```js
async function runAgent({ userInput, tools, runTool, maxSteps = 10 }) {
  const messages = [{ role: "user", content: userInput }];

  for (let step = 0; step < maxSteps; step++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools,
      messages,
    });

    // Append the whole assistant response to history.
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      return { messages, response };
    }

    if (response.stop_reason === "tool_use") {
      const toolResults = [];

      // Could run these in parallel — see Lesson 3.3
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        try {
          const result = await runTool(block.name, block.input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        } catch (err) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify({ error: String(err.message) }),
            is_error: true,
          });
        }
      }

      messages.push({ role: "user", content: toolResults });
      continue;
    }

    if (response.stop_reason === "max_tokens") {
      throw new Error("Hit max_tokens before completion.");
    }

    throw new Error(`Unhandled stop_reason: ${response.stop_reason}`);
  }

  throw new Error("Agent exceeded max steps.");
}
```

This is the entire agent. Everything else is what you put in `tools` and `runTool`.

### `maxSteps` is non-negotiable

Always cap the loop. A bug, an ambiguous goal, or a deliberately adversarial input can make Claude loop forever — and you pay per step.

A reasonable default is 10–20. For deep-research style agents, 50 might be needed. Above that, something is structurally wrong.

When you hit the cap, raise an error and either escalate to a human or return a partial answer. Don't just retry blindly.

### Logging every step

You will debug agents in production. Make this trivial by logging:

- The model call (input, output, token usage).
- Every tool call (name, args, result, error).
- A trace ID so you can reconstruct a full session.

```js
async function runTool(name, input) {
  const start = Date.now();
  logger.info({ event: "tool_call", name, input });
  try {
    const result = await tools[name](input);
    logger.info({ event: "tool_result", name, ms: Date.now() - start });
    return result;
  } catch (err) {
    logger.error({ event: "tool_error", name, error: err.message });
    throw err;
  }
}
```

Future-you will thank present-you.

### Approvals on irreversible actions

Some tools should never run without a human OK:

- Sending an email.
- Charging a card.
- Deleting data.
- Calling external APIs that cost money.

Bake an approval step into your tool runner:

```js
async function runTool(name, input) {
  if (IRREVERSIBLE_TOOLS.has(name)) {
    const approved = await requestApproval(name, input);
    if (!approved) {
      return { error: "User did not approve" };
    }
  }
  return await tools[name](input);
}
```

For approvals to work, you need a UI for them. Even a CLI prompt or a Slack approval is enough for early stages. Don't ship destructive tools to production without one.

### System prompt for agents

A good agent system prompt explains:

- What the agent does.
- What tools are available (Claude already sees the definitions, but a high-level summary helps).
- Constraints and refusals.
- When to ask the user for clarification vs. proceed.

```
You are a customer support agent for FitTrack.

You have tools to look up accounts, check subscription status, issue refunds (with approval), and send emails.

Rules:
- Always look up the customer before answering account-specific questions.
- Confirm refunds with the user before calling issue_refund.
- If you're missing critical information, ask the user rather than guessing.
- Stay within support topics. Politely decline unrelated requests.

When you're done helping the user, respond with a final message — don't call any more tools.
```

### Plan-then-act

For complex requests, ask Claude to plan before acting:

```
Before calling any tools, lay out the steps you'll take inside <plan> tags. Then execute the plan one tool call at a time.
```

The plan becomes part of the conversation; you can show it to the user as "what I'm about to do." Often catches bad plans before they cost tool calls.

### Handling multi-turn agents

User says one thing → agent does work → user says another thing → agent picks up from where it left off. The same `messages` array carries through; just keep appending.

You may want to compact older turns (summarize them) if conversations run long. See the OpenAI course Module 4 for compaction patterns — they apply directly here.

### Streaming agents

You can stream the agent's output to the UI as it goes:

- Stream text blocks character by character.
- Show "Calling tool X..." between blocks.
- Update the UI when each tool returns.

This makes a slow agent feel responsive. The Realtime / streaming feel is what users notice — even when total wall time is 30 seconds.

### Errors mid-loop

What happens when a tool fails:

1. Return the error as a `tool_result` with `is_error: true`.
2. Claude usually adapts — apologizes, tries different arguments, or escalates.

What happens when the API call fails:

1. Retry with backoff.
2. After N failures, abort the agent and surface the failure to the user.

What happens when Claude tries to call a tool that doesn't exist:

1. Return a tool_result saying "Tool not found."
2. Claude usually self-corrects.

## Three real-world scenarios

**Scenario 1: The agent that worked end-to-end in 12 hours.**
A team built a customer support agent in an afternoon: 6 tools, a system prompt, an approval step for refunds, and the loop above. Two days of refinement on prompts and tool descriptions, and it handled 60% of tickets without human intervention. The loop is small; the work is the tools.

**Scenario 2: The agent that ran forever.**
A team shipped an agent without `maxSteps`. A user asked a question that put the agent into a fetch-retry-fetch-retry loop. By the time they noticed (overnight), the bill was $400. They added `maxSteps: 15` and an alert on consecutive tool errors. Never repeated.

**Scenario 3: The forgotten approval gate.**
A team's agent had an `email_customer` tool that the model called freely during testing. In production, a single misclassified intent caused the agent to email 80 customers an apology for a problem they didn't have. They added an approval step for any send-email call. Embarrassment one-time only.

## Common mistakes to avoid

- **No `maxSteps`.** Bug + loop = bill.
- **Forgetting `tool_result`.** Loop spins on the same tool.
- **No approval on irreversible tools.** Disasters waiting.
- **No logging.** Debugging multi-step agents without logs is impossible.
- **No system prompt.** Agent picks tools randomly because it doesn't know the policy.
- **No plan step on complex requests.** Agent makes 5 wrong calls when 1 plan would have caught the issue.

## Read more

- [Tool use overview](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)
- [Building with Claude — agents](https://docs.anthropic.com/en/docs/agents-and-tools/overview)
- [Implementing agentic systems](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)

## Summary

- The **agent loop**: call Claude, run any tools it asked for, send results back, repeat until `end_turn`.
- **Cap iterations** with `maxSteps`. Always.
- **Log every step** with a trace ID for debugging.
- **Approval gates** on irreversible tools.
- A clear **system prompt** with tools and policies drives reliable behavior.
- **Plan-then-act** for complex multi-step requests.
- **Stream output** so the agent feels responsive even when it's slow.

Next: parallel tool calls and structured outputs.
