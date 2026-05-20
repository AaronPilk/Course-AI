---
module: 1
position: 1
title: "Agent vs. workflow — when each is the right tool"
objective: "Distinguish a pipeline from an agent and pick the right pattern for the task."
estimated_minutes: 12
---

# Agent vs. workflow — when each is the right tool

## The puzzle

A PM walks in with a request: "Build an AI agent that handles customer onboarding."

You could literally build a multi-step agent — looping, planning, tool-calling. Or you could build a deterministic workflow: classify intent → fetch profile → personalize email → send. Both produce onboarding emails. They're not the same thing.

The mistake is to default to "agent" because it sounds more advanced. The win is picking the right pattern for the actual task.

## The simple version

**Workflow**: a fixed sequence of LLM calls and tool calls. You decide the steps; the LLM fills in the content.

**Agent**: a loop in which the LLM decides the next step. The model picks tools, chooses arguments, and decides when it's done.

Workflows are simpler, faster, cheaper, and more reliable. Agents are flexible — they handle problems where the steps depend on intermediate results.

Reach for an agent only when a workflow can't do the job.

## The technical version

### What a workflow looks like

A workflow has predetermined steps. You wire them together in code:

```js
async function onboardNewUser(user) {
  const profile = await fetchUserProfile(user.id);
  const persona = await classifyPersona(profile);  // LLM call 1
  const email = await draftWelcomeEmail(profile, persona);  // LLM call 2
  await sendEmail(user.email, email);
}
```

Three steps in a fixed order. LLM is used twice. Total tokens, total cost, total latency — all bounded and predictable. Easy to test, easy to debug.

The steps don't change run to run. If you need a fourth step, you write it.

### What an agent looks like

An agent loop puts the model in charge of step selection:

```js
async function onboardingAgent(user) {
  const messages = [{ role: "user", content: `Onboard user: ${JSON.stringify(user)}` }];

  for (let step = 0; step < 15; step++) {
    const response = await llm.call({ messages, tools: ONBOARDING_TOOLS });
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") return;

    for (const tool of toolCallsIn(response)) {
      const result = await runTool(tool.name, tool.input);
      messages.push({ role: "tool", tool_use_id: tool.id, content: result });
    }
  }
}
```

Same goal — onboard a user. But now the model decides what tools to call and when to stop. The number of steps varies per run. Tokens, cost, and latency are all unbounded (within the step cap).

This is much more flexible. It's also harder to test, harder to debug, more expensive on average, and slower.

### The decision heuristic

Build a workflow when:

- The steps are **predictable** — same sequence every time.
- The problem is **narrow** — a clear input shape, a clear output.
- **Latency matters** — workflows are usually faster.
- **Cost matters at volume** — fewer LLM calls per task.
- **Reliability matters** — fewer moving parts means fewer failure modes.

Build an agent when:

- The steps **depend on intermediate results**. ("If profile is complete, do A; if not, ask for B, then C.")
- The problem **requires open-ended tool use**. ("Find the answer to this question — search, browse, compute, synthesize.")
- The input shape **varies dramatically**.
- A workflow would have **too many branches** to maintain.
- You **genuinely need autonomy** — the value is the system figuring out what to do.

If you're unsure, default to workflow. You can always promote to an agent later.

### The hybrid pattern: workflow with agent sub-steps

Many production systems are workflows that occasionally invoke an agent for a single open-ended sub-task:

```js
async function supportTicketFlow(ticket) {
  const intent = await classifyIntent(ticket);   // workflow step
  if (intent === "research_question") {
    const answer = await researchAgent(ticket);  // agent sub-task
    await reply(ticket, answer);
  } else {
    await routeToTeam(ticket, intent);           // workflow step
  }
}
```

The workflow gives you the deterministic structure; the agent handles the unbounded sub-problem. Best of both worlds for many real products.

### Cost comparison sketched

Same task, both implementations:

**Workflow** — 2 LLM calls, 800 tokens each, $0.025 total. 100% predictable.

**Agent** — average 5 tool calls per run, ~1,500 tokens per turn (history grows), $0.10 per run on average. p95 might be 8 turns = $0.20.

Same outcome. Workflow is 4× cheaper on average and 8× cheaper p95.

The agent is worth the cost only if it produces *outcomes the workflow can't*. If both produce the same email, the workflow wins.

### Reliability comparison

Workflows are unit-testable. You can run an integration test and verify the email matches an expected format.

Agents are harder. They take different paths on different runs. You eval them with end-to-end test sets and accept some variance.

Production AI teams that ship aggressively tend to write *workflows wrapped in evals* for high-volume, narrow tasks, and *agents wrapped in evals* for open-ended, lower-volume tasks. The two patterns serve different jobs.

### The "agentic" spectrum

Reality isn't binary. There's a spectrum:

- **No LLM** (deterministic code).
- **Single LLM call** (classify, summarize, draft).
- **LLM with structured output** (extract typed data).
- **LLM with tool calls** (one or two — workflow with capabilities).
- **LLM in a loop with tool calls** (agent).
- **Multi-agent system** (Lesson 4.2).
- **Long-horizon autonomy** (research agents that plan over hours).

Most production systems live at "single LLM call" or "LLM with tools." Move up the spectrum only when the simpler pattern can't do the job.

### How frameworks compare

You'll see "agent frameworks" everywhere: OpenAI Agents SDK, Anthropic tool use, LangGraph, AutoGen, CrewAI, etc.

All of them reduce to: a loop, a way to define tools, and (sometimes) coordination primitives for multi-agent setups. The cheaper / simpler frameworks are usually fine for most products.

We'll cover the patterns in later modules in framework-agnostic terms. Pick your favorite stack; the patterns transfer.

## Three real-world scenarios

**Scenario 1: The team that built an agent and shipped a workflow.**
A team set out to build a "marketing email agent." Prototype: agent loop with 6 tools. Worked, but slow (8s per email) and inconsistent. They audited and realized 90% of cases followed the same path. They rewrote as a workflow with deterministic steps. New version: 2s per email, consistent output. The agent loop was solving a problem they didn't have.

**Scenario 2: The research feature that needed an agent.**
A B2B product wanted "answer any question about any prospect company." This required browsing, multi-step lookup, synthesis. A workflow couldn't cover the breadth. They built a research agent with web search + page reader tools. Latency was 30 seconds per query; cost was $0.50. Worth it — the use case demanded it.

**Scenario 3: The hybrid that scaled.**
A support tool used a workflow for 80% of tickets (deterministic flows) and routed the remaining 20% to a research agent for complex questions. The cheap workflow handled volume; the expensive agent handled value. Cost stayed low; coverage stayed high.

## Common mistakes to avoid

- **Defaulting to agent because it sounds advanced.** Workflows are usually right for narrow tasks.
- **Building an agent before evaluating a workflow.** Prototype both — pick the cheaper that works.
- **Mixing the two without observability.** A workflow that sometimes hands off to an agent needs traces across the boundary.
- **Treating agents as plug-and-play.** They need step caps, approvals, evals, and cost monitoring from day one.
- **Picking a framework before knowing the pattern.** All major frameworks reduce to the same loop.

## Read more

- [Anthropic: Building Effective Agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents)
- [ReAct paper](https://arxiv.org/abs/2210.03629)

## Summary

- **Workflow** = fixed steps, LLM fills content. Predictable, cheap, fast.
- **Agent** = LLM-driven loop, picks next step. Flexible, expensive, slower.
- **Hybrid** (workflow with agent sub-steps) is often the right production pattern.
- **Default to workflow.** Promote to agent only when the problem genuinely needs autonomy.
- **All frameworks reduce to the same loop** — pick your stack, the patterns transfer.

Next: the universal agent loop itself.
