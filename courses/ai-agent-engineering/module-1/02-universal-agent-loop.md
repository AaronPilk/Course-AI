---
module: 1
position: 2
title: "The universal agent loop"
objective: "Implement the act-observe loop that every agent framework reduces to."
estimated_minutes: 11
---

# The universal agent loop

## The puzzle

OpenAI Agents SDK. Anthropic tool use. LangGraph. AutoGen. CrewAI. Pydantic AI. Vercel AI SDK. Each ships with a different API, different abstractions, different mental models.

Underneath, they're all the same thing: **a loop that calls a model, executes tools, and decides when to stop.**

If you can implement the loop in 30 lines of code, you understand every framework — because they're all that loop with bells.

## The simple version

```python
def agent_loop(initial_message, tools, max_steps=15):
    messages = [user_message(initial_message)]
    for step in range(max_steps):
        response = model.call(messages, tools=tools)
        messages.append(assistant_message(response))

        if response.is_done:
            return response

        for tool_call in response.tool_calls:
            result = run_tool(tool_call.name, tool_call.args)
            messages.append(tool_message(tool_call.id, result))

    raise StepLimitExceeded()
```

That's the loop. The model picks a tool; you run it; you feed the result back; repeat. Stop when the model says it's done or you hit a step cap.

## The technical version

### Why the loop works

LLMs are stateless. Each model call sees the whole conversation. The loop's job is to:

1. **Show the model** what's happened so far.
2. **Let the model** pick the next step.
3. **Execute** that step.
4. **Update** the conversation with the result.
5. **Loop**.

This is the **ReAct pattern** — reasoning and acting interleaved — first published in 2022 and now the foundation of every production agent framework.

### Reference implementation (vendor-agnostic)

The exact API varies by provider, but the structure is identical:

```js
async function runAgent({
  systemPrompt,
  userMessage,
  tools,
  runTool,
  maxSteps = 15,
}) {
  const messages = [{ role: "user", content: userMessage }];
  const trace = [];

  for (let step = 0; step < maxSteps; step++) {
    const response = await llm.complete({
      system: systemPrompt,
      messages,
      tools,
    });

    trace.push({ step, response });
    messages.push({ role: "assistant", content: response.content });

    // Check stopping conditions
    if (response.stopReason === "end_turn") {
      return { messages, trace, status: "complete" };
    }
    if (response.stopReason === "max_tokens") {
      return { messages, trace, status: "max_tokens_hit" };
    }

    // Execute all requested tool calls (parallel if independent)
    const toolCalls = extractToolCalls(response);
    const results = await Promise.all(
      toolCalls.map(async (call) => {
        try {
          const output = await runTool(call.name, call.args);
          return { id: call.id, output, error: null };
        } catch (err) {
          return { id: call.id, output: null, error: err.message };
        }
      })
    );

    messages.push({
      role: "tool",
      content: results.map(toToolResultBlock),
    });
  }

  return { messages, trace, status: "max_steps_exceeded" };
}
```

This is the loop. Every framework is a wrapper around it.

### Stop conditions

Five conditions where you should stop:

1. **`end_turn`** — model decided it's done.
2. **`max_tokens`** — generation hit your limit.
3. **`max_steps`** — your safety cap kicked in.
4. **Hard error** — irrecoverable failure (API down, auth broken, etc.).
5. **External cancel** — user clicked stop, or an upstream timeout fired.

Each needs handling. The most important is **`max_steps`** — without it, a buggy agent can run forever (and burn forever's worth of tokens).

### Step caps in practice

```js
maxSteps = 5    // tight loop, single intent
maxSteps = 15   // standard agent — chat, support, simple research
maxSteps = 50   // long-running research / deep tasks
maxSteps = 200  // genuinely autonomous agents (rare, needs strong observability)
```

Hitting the cap is an error, not a success. Surface it. The user (or your code) needs to decide what to do — escalate, retry with a different model, return partial.

### What's in `messages` matters

Every model call sends the full conversation. Things to know:

- **Append the full assistant response** (text + tool calls), not just the text.
- **Tool results go as a separate message** with the matching tool call ID.
- **Long histories** become expensive — apply compaction (Lesson 4.3 of the OpenAI course covers this).
- **Don't filter or summarize mid-loop** unless you have to. Summarization can hide important context.

### Parallel tool calls

When the model returns multiple tool_use blocks in one response, the calls are independent — execute them with `Promise.all`. This is a free speedup; we'll go deeper in the OpenAI and Claude course modules on tools (and you've already seen it if you read the Anthropic course).

### Plan-then-act variant

Some loops add a planning step at the front:

```
Step 0: ask the model to lay out a plan inside <plan> tags before any tool calls.
Steps 1..N: execute the plan, tool by tool.
```

This trades a little extra latency for better tool selection. Worth it on complex tasks; overkill on simple ones. Lesson 3.1 of this course goes deep.

### Streaming the loop

For UX, you want the user to see progress as the agent runs:

- Stream text within each model response.
- Surface "calling tool X..." when a tool_use block appears.
- Show "got result, continuing..." after tool execution.
- Render a final message at end_turn.

A 30-second agent feels much faster when the user can watch it work.

### Loop variants by framework

A quick map:

- **OpenAI Agents SDK**: handlers + sessions. The loop is hidden but it's still the loop.
- **Anthropic tool use**: explicit assistant/user/tool message protocol; you write the loop yourself.
- **LangGraph**: explicit graph of nodes; the "agent" is a graph with a model node and tool nodes.
- **AutoGen / CrewAI**: multi-agent orchestrators on top of the loop.
- **Vercel AI SDK**: framework primitives around streaming + tools.

They all reduce to: call model, run tools, loop. Pick whichever fits your stack.

### Choosing a framework

A non-exhaustive heuristic:

- **Already on Next.js / Vercel**: Vercel AI SDK is the most ergonomic.
- **Already on OpenAI**: OpenAI Agents SDK.
- **Already on Anthropic**: write the loop yourself; it's 30 lines.
- **Want multi-agent / graph patterns**: LangGraph.
- **Want lots of pre-built agent shapes**: CrewAI, but verify the abstractions don't get in your way.

You can also write the loop yourself in 30 lines of code and skip frameworks entirely — that's what many production teams do.

## Three real-world scenarios

**Scenario 1: The 50-line agent.**
A team replaced their LangChain agent with a 50-line custom loop. Same tools, same behavior, much easier to debug. The LangChain abstractions had been hiding bugs the team kept tripping over. After the rewrite, the agent was easier to ship and maintain.

**Scenario 2: The framework lock-in.**
A team built on a 1.0 framework that broke compatibility in 2.0. Half their tooling stopped working overnight. They rewrote on plain SDK calls. The framework had been a 30-line wrapper around what they could have written themselves. Lesson: agents are simple loops; the framework choice should be reversible.

**Scenario 3: The forgotten step cap.**
An agent shipped to production without a step cap. A misclassified intent put it into a fetch-retry-fetch loop. By the time the team noticed, the bill was four figures. Step cap was added the next morning. Never repeated.

## Common mistakes to avoid

- **No step cap.** Bug + loop = bill.
- **Returning only the text from a response.** Tool calls get dropped; loop spins.
- **Forgetting to append tool results.** Model doesn't see what happened; loop repeats the call.
- **Hiding the loop behind a framework you don't understand.** Debugging requires seeing what's actually happening.
- **One step cap for all agents.** Tune per task — research needs 50, a quick lookup needs 5.

## Read more

- [ReAct paper](https://arxiv.org/abs/2210.03629)
- [Building effective agents (Anthropic)](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- [LangGraph docs](https://langchain-ai.github.io/langgraph/)

## Summary

- Every agent reduces to a **loop: call model → execute tools → feed results back → repeat.**
- **Step caps** are non-negotiable. Without one, a buggy agent costs forever's worth of tokens.
- **Append the full assistant response** (text + tool calls) and the tool results, in order.
- **Frameworks are wrappers** around this loop; you can write it yourself in 30 lines.
- **Streaming the loop** to the UI makes a slow agent feel responsive.
- **Choose frameworks by ecosystem fit**, not by feature checklist.

Next: tools, environment, and the action space.
