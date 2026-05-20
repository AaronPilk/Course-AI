---
module: 4
position: 2
title: "Routing, supervisor, and hand-off patterns"
objective: "Implement the three production multi-agent topologies."
estimated_minutes: 10
---

# Routing, supervisor, and hand-off patterns

## The puzzle

You've decided multi-agent is the right call. Now: how do agents actually communicate? Who decides who runs next? Where does state live?

Three patterns cover almost every production multi-agent system: **routing**, **supervisor**, and **hand-off**. Pick the right one for your task and the rest is implementation.

## The simple version

- **Routing**: a small classifier sends each request to a specialist. The specialist handles the whole task. One agent runs per request.
- **Supervisor**: a "manager" agent orchestrates several specialists. Manager calls specialist as a tool; specialist returns; manager decides what's next.
- **Hand-off**: agents pass control like a relay race. Agent A talks to the user, decides "I need a specialist," hands off to agent B. Agent B continues the conversation.

Each fits different workloads. Most production systems are routing or supervisor; hand-off is for human-style conversations.

## The technical version

### Routing in detail

```
User request
   ↓
[Classifier]  →  picks one specialist
   ↓
[Specialist agent runs and responds]
```

The classifier is a small fast model (Haiku, GPT mini) that picks the right specialist. The specialist runs as a normal single-agent.

```js
async function routeAndRun(userInput) {
  // Step 1: classify
  const route = await classify(userInput);
  // → "support" | "billing" | "technical" | "general"

  // Step 2: run the right specialist
  return await SPECIALISTS[route](userInput);
}
```

This is the lowest-overhead pattern. One classifier call + one specialist agent. Cleanly bounded; easy to test.

Best for: products with clearly separable categories where each specialist is mostly independent.

### Supervisor in detail

```
User request
   ↓
[Supervisor agent]
   ↓ calls specialist (as a tool)
[Specialist 1] → returns result
   ↓
[Supervisor] decides next move
   ↓ calls another specialist
[Specialist 2] → returns result
   ↓
[Supervisor] composes final answer
```

The supervisor is the brains. Specialists are "tools" that happen to be other agents.

```js
const supervisorTools = [
  {
    name: "research_agent",
    description: "Do deep research on a topic. Returns structured findings.",
    input_schema: { ... },
  },
  {
    name: "writing_agent",
    description: "Write a polished document from structured input.",
    input_schema: { ... },
  },
  {
    name: "fact_check_agent",
    description: "Verify factual claims in a document against sources.",
    input_schema: { ... },
  },
];

// Supervisor's runTool calls into the relevant specialist
async function runTool(name, args) {
  if (SPECIALISTS[name]) {
    return await runAgent({ system: SPECIALISTS[name].system, ... }, args);
  }
}
```

The supervisor reasons; specialists do. Coordination lives in one place.

Best for: tasks that decompose into specialized sub-tasks but require holistic synthesis at the end.

### Hand-off in detail

```
User and Agent A chat
   ↓
Agent A decides: "this needs a specialist"
   ↓ hands off
User and Agent B chat (Agent A is gone)
   ↓
Agent B can hand back or to another agent
```

The conversation passes between agents. Each agent has context; the next inherits or summarizes.

```js
// In agent A's tool set
{
  name: "handoff_to_billing",
  description: "Transfer the conversation to a billing specialist when the issue is billing-related.",
  input_schema: { type: "object", properties: { reason: { type: "string" } }, required: ["reason"] }
}

// Your code recognizes the handoff and switches the active agent
```

Hand-off is most useful for human-style conversations where a "front desk" agent triages and routes to deeper specialists.

Best for: chat products with multiple personas where the user benefits from the impression of being routed to "the right person."

### Comparison

| Pattern | Latency | Cost | Complexity | Best for |
| --- | --- | --- | --- | --- |
| Routing | Low | Low | Low | Clear category separation |
| Supervisor | Medium | Medium | Medium | Task decomposition + synthesis |
| Hand-off | Low | Low | Medium | Conversational personas |

### Sharing state across agents

Three options for what flows between agents:

**Full conversation history.** Easy; expensive in tokens; can confuse a specialist with irrelevant context.

**Summary.** A summary of what's relevant for the next agent. Cheaper; requires a good summarizer.

**Structured handoff payload.** A schema-defined object: `{ task, context, constraints, user_id }`. Cleanest for supervisor patterns where the work is well-defined.

Default to structured payloads when possible. Fall back to summaries for conversational agents.

### Termination

Multi-agent systems need clear "we're done" signals:

- **Routing**: specialist finishes its loop, returns result.
- **Supervisor**: supervisor returns `end_turn` (no more specialist calls).
- **Hand-off**: a specific agent (often "front desk") returns end_turn.

Without explicit termination, the system can ping-pong. Add hard step caps at the system level, not just per-agent.

### Error propagation

When a specialist fails:

- **Routing**: surface the error to the user; no rerouting unless explicit.
- **Supervisor**: error is a tool result; supervisor decides whether to retry, switch specialists, or escalate.
- **Hand-off**: handoff target unavailable → graceful fallback to a generalist or human.

Each pattern needs an error-handling story. Build it before you ship, not after a 3am incident.

### Eval per agent + end-to-end

Each agent gets its own eval (does it handle its specialty correctly?). The system gets an end-to-end eval (does the user's request get answered well?). Both matter.

When end-to-end fails, you check per-agent evals to localize. Without the layered evals, multi-agent regressions are detective work.

### Observability across boundaries

Trace IDs must propagate across agent boundaries. If "supervisor invoked specialist 2 at step 3," that fact has to show up in the trace, with sub-spans for the specialist's own work.

OpenTelemetry-style spans within spans handle this naturally. Without it, your trace looks like a single agent and the multi-agent decisions are invisible.

## Three real-world scenarios

**Scenario 1: The routing pattern that scaled.**
A support product had 80% routine tickets and 20% specialty cases. They added a Haiku-tier router classifying each ticket. Routine → standard support agent. Specialty → billing, tech, escalation agents. Each agent stayed focused; overall throughput tripled because the routine path was fast.

**Scenario 2: The supervisor that beat the pipeline.**
A research feature needed planning + multiple sub-research tasks + synthesis. A workflow couldn't dynamically decide which sub-research to run. A supervisor agent that called specialists as tools fit perfectly. Latency was 30-60s; quality was significantly higher than a single agent attempting everything.

**Scenario 3: The hand-off that confused users.**
A team built a hand-off pattern where front-desk → specialist → another specialist. Users got "transferred" three times in one chat. Confused them; trust dropped. They consolidated to a routing pattern: classify once at the top, run a specialist through to the end.

## Common mistakes to avoid

- **Wrong pattern for the workload.** Routing for synthesis-heavy work; supervisor for trivial routing.
- **Full-history handoffs.** Cost balloons; specialist gets confused.
- **No system-level step cap.** Agents ping-pong between each other.
- **No per-agent evals.** Regressions are detective work.
- **No trace propagation.** Multi-agent debugging is guessing.
- **Visible hand-offs that feel like phone transfers.** Bad UX.

## Read more

- [Anthropic — building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- [OpenAI Agents SDK handoffs](https://platform.openai.com/docs/guides/agents)
- [LangGraph multi-agent tutorials](https://langchain-ai.github.io/langgraph/tutorials/multi_agent/)

## Summary

- Three patterns: **routing** (classify and dispatch), **supervisor** (orchestrate specialists), **hand-off** (relay control).
- Routing is lowest overhead; supervisor handles synthesis; hand-off fits conversational products.
- **Structured handoff payloads** over full-history when possible.
- **System-level step cap** plus per-agent caps prevents ping-pong.
- **Per-agent evals + end-to-end eval** for localization and overall quality.
- **Trace propagation** across boundaries — critical for debugging.

Next: short-term memory.
