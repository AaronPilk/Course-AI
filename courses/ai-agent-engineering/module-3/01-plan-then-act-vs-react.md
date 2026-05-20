---
module: 3
position: 1
title: "Plan-then-act vs. react — which loop fits your problem"
objective: "Pick a loop architecture and avoid the wrong-loop-for-the-task trap."
estimated_minutes: 10
---

# Plan-then-act vs. react — which loop fits your problem

## The puzzle

You've built an agent. It works on easy queries and fumbles on hard ones — picks the wrong second tool, double-fetches, contradicts itself across steps.

Sometimes the fix is more reasoning. Sometimes the fix is *upfront* reasoning — making the agent plan the whole task before any tool call.

These are the two main agent loop architectures: **react** (think-then-act, one step at a time) and **plan-then-act** (think the whole task through, then execute). Each fits a different class of problem.

## The simple version

**React** (the default agent loop):

```
loop:
  think a little → call a tool → observe → repeat
```

**Plan-then-act**:

```
plan the full task first
loop:
  execute next planned step → observe → re-plan if needed
```

React is responsive and flexible. Plan-then-act produces better outcomes on complex multi-step tasks but adds upfront latency. Most production agents are react; the hardest tasks benefit from planning.

## The technical version

### React in detail

The standard ReAct loop:

```
User: <task>

Agent thinks: "I should look up X first."
Agent calls tool: lookup_X(...)
Tool returns: <result>

Agent thinks: "Given X, I should now do Y."
Agent calls tool: do_Y(...)
Tool returns: <result>

Agent thinks: "I have enough to answer."
Agent responds: <final answer>
```

Each step is one model call. The model sees the conversation history and decides what to do next.

Strengths: simple, flexible, fast for shallow tasks. Weaknesses: the model can only see one step ahead; it can take suboptimal sequences without realizing.

### Plan-then-act in detail

```
User: <task>

Agent thinks: "Let me lay out the plan."
Agent emits a plan:
  1. Look up X.
  2. Compare X to Y.
  3. If diff > threshold, alert. Otherwise summarize.

Agent then executes step 1:
  Calls lookup_X
  Observes result

Step 2: Calls compare(...)
Step 3 fork: if diff > threshold, call alert(...)
            else: call summarize(...)
```

The plan is generated upfront. Then the loop walks the plan, optionally re-planning if observations contradict expectations.

Strengths: better tool selection on complex tasks, fewer "obvious" mistakes, visible to users for approval. Weaknesses: upfront latency cost, plans can become wrong if the world doesn't match expectations.

### When react fits

React is the right default for:

- **Short tasks** (1–5 tool calls).
- **Lookups and Q&A** with light multi-step.
- **Highly variable inputs** where planning would be wasted because the path depends so much on what you observe.
- **Latency-sensitive interactions**.

For most chat-style agents (support, simple Q&A, basic research), react is fine.

### When plan-then-act fits

Plan-then-act earns its cost on:

- **Multi-step tasks** (5+ steps).
- **Tasks with deep tool dependencies** (B needs result of A, C needs both, ...).
- **Tasks where wrong tool sequence is costly** (real money, real emails, real changes).
- **Tasks where the user wants to approve a plan** before execution.

Research agents, code-modification agents, and complex booking flows often benefit.

### Hybrid: plan-then-react

A common production pattern: plan the *outline*, then react within each step. The plan gives structure; the local loop handles details.

```
Plan: 
  1. Fetch customer data.
  2. Identify pain points.
  3. Draft outreach email.

Step 1 sub-loop (react):
  Call lookup_customer
  Call list_orders (because customer has multiple)
  Synthesize: customer profile

Step 2 sub-loop (react):
  Search transcripts
  Search tickets
  Synthesize: pain points

Step 3:
  Call draft_email with synthesized inputs
```

This balances the structure of planning with the flexibility of react inside each step. Good for tasks where the macro shape is predictable but the micro details aren't.

### Re-planning

What happens when an observation contradicts the plan? Two patterns:

**Static plan**: the plan is fixed. If something breaks, the agent surfaces the failure to the user.

**Dynamic plan (re-plan)**: after each step, the agent checks whether the plan still makes sense. If not, it generates a new plan from the current state and continues.

Static plans are simpler and predictable. Dynamic plans handle unexpected results but can spiral if re-planning happens too often. For most production agents, lean static; add re-planning only when failures are common and recoverable.

### Surfacing the plan to users

A plan is a great UX artifact:

- **Show the plan** when the agent generates it.
- **Let the user edit** the plan before execution.
- **Show progress** as each step completes.
- **Let the user abort** mid-execution.

This pattern turns a black-box agent into something users can collaborate with. Especially valuable for long-running tasks where the user is investing minutes of waiting.

### Plan format

A common pattern: ask the model to emit a structured plan inside `<plan>` tags or via a tool call:

```
Before any other action, emit your plan inside <plan> tags as a numbered list:
<plan>
1. [step 1 description]
2. [step 2 description]
...
</plan>
```

Or via a tool:

```
{
  name: "submit_plan",
  description: "Submit a plan for the user to review before execution.",
  input_schema: {
    type: "object",
    properties: {
      steps: { type: "array", items: { type: "string" } },
      risks: { type: "array", items: { type: "string" } }
    },
    required: ["steps"]
  }
}
```

The tool-based version gives you structured data and an obvious place to render the plan in the UI.

### Cost comparison

For a 6-step task:

- **React**: 6 model calls + 6 tool calls. Model sees increasing history each call.
- **Plan-then-act**: 1 model call to plan + 6 model calls to execute + 6 tool calls. One extra model call upfront.

The upfront cost of plan-then-act is modest. The savings come from avoiding wrong-tool calls — a single avoided wrong call usually pays for the plan.

### The trap of over-planning

Plan-then-act fails when:

- The plan is over-specific and the world doesn't cooperate.
- The agent re-plans constantly and never commits.
- Plans get long and bureaucratic for simple tasks.

If your agent spends more time planning than acting, the planning step is overkill. Drop to react.

## Three real-world scenarios

**Scenario 1: The research agent that needed planning.**
A team's research agent (react-style) often produced shallow reports — it would call the first relevant tool and wrap up. They added a planning step: the agent emits a research plan, executes it, then synthesizes. Reports went from 1 paragraph to 5, with better source coverage. Latency went up but the output was actually useful.

**Scenario 2: The chatbot that didn't need planning.**
A team added planning to their support bot "to make it smarter." Every response now took 4 seconds longer for marginal quality gain on routine questions. They dropped planning except for explicitly complex queries (detected by intent). Latency on the 90% routine path went back to fast.

**Scenario 3: The plan that needed re-planning.**
A booking agent had a static plan. When a flight became unavailable mid-execution, the plan continued anyway and tried to book the unavailable flight repeatedly. They added a re-plan step that triggered when a tool returned "unavailable" — agent now adapts on the fly.

## Common mistakes to avoid

- **Always plan, regardless of task.** Wastes latency on simple cases.
- **Never plan, regardless of task.** Misses quality wins on complex cases.
- **Plans that aren't surfaced.** Internal plans are still useful but the UX win is real.
- **Re-planning every step.** Spirals, never commits.
- **Plans as the safety mechanism.** Plans bound complexity; they don't replace approval gates or evals.

## Read more

- [Anthropic — building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- [ReAct paper](https://arxiv.org/abs/2210.03629)
- [Reflexion paper](https://arxiv.org/abs/2303.11366)

## Summary

- **React**: think-then-act each step. Default for most agents.
- **Plan-then-act**: plan the whole task upfront, then execute. Earns its cost on complex multi-step problems.
- **Hybrid (plan-then-react inside steps)** is often the production sweet spot.
- **Surface plans to users** for collaboration and trust.
- **Re-plan only when observations contradict** — not every step.
- **Drop planning** on tasks where react is enough — the upfront latency isn't free.

Next: observability — making agent runs debuggable.
