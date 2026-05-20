---
module: 4
position: 1
title: "Single-agent vs. multi-agent — when complexity is justified"
objective: "Decide whether routing, supervisor, or hand-off patterns fit."
estimated_minutes: 9
---

# Single-agent vs. multi-agent — when complexity is justified

## The puzzle

Multi-agent demos are everywhere. "A planner agent talks to a coder agent talks to a tester agent." Looks impressive. Then you build one for a real product and discover it's slower, costlier, more error-prone, and harder to debug than a single agent doing the same work.

Multi-agent earns its complexity sometimes. Most of the time, a single agent with the right tools wins. This lesson is the line between the two.

## The simple version

Reach for multi-agent when:

- The work cleanly splits into **specialized roles** with different prompts, tools, or models.
- A **single agent has too many tools** to reason about cleanly (15+).
- You need **parallelism** across logical workstreams.
- Different parts have different **safety or approval requirements**.

Stick with single-agent when:

- One competent agent could do the whole job with focused tools.
- Latency is critical (multi-agent adds coordination overhead).
- The task fits in one prompt with reasonable context.

Multi-agent isn't a complexity tax you pay because you can. It's a tool you reach for when single-agent is genuinely cracking.

## The technical version

### Why multi-agent often disappoints

In practice, naive multi-agent systems run into:

- **Coordination overhead**: each agent has its own prompt, context, retries, errors. The system has more moving parts.
- **Context loss**: handing off between agents loses nuance from the original conversation.
- **Cost amplification**: each agent is a separate set of LLM calls. A 3-agent system can be 5-10× the cost of equivalent single-agent.
- **Debug nightmares**: traces span agents. Finding where things went wrong requires understanding both agents' internal state.

These are real costs. Multi-agent should buy something concrete to justify them.

### When multi-agent is worth it

Specific patterns where multi-agent earns its keep:

**Specialized expertise per role.** A "coder agent" has different prompts, tools (run_tests, search_codebase), and possibly a different model (Opus for hard reasoning) than a "PM agent" that just classifies and prioritizes.

**Tool overload.** A single agent with 30 tools makes worse decisions than two agents with 15 tools each. Splitting on natural boundaries (support vs. ops, frontend vs. backend) is a clean win.

**Parallelism over logical workstreams.** A research task that legitimately needs "search a dozen domains" can fan out to multiple research sub-agents, each focused on its niche.

**Different safety profiles.** A "read-only research agent" + a "write-action agent with approval gates" lets you tightly scope the dangerous one without making the safe one slow.

### Anti-patterns

Common smells that you're multi-agent-ing for the wrong reason:

- **Two agents that always run sequentially with no parallelism gain.** That's a workflow.
- **A "supervisor" that just passes messages through.** Indirection without value.
- **An agent per microservice.** Architecture-mirroring rather than task-decomposition.
- **Marketing-driven multi-agent.** "We have 5 agents collaborating!" sounds cool but if a single agent would work, the 5 are overhead.

### The hidden complexity

Things multi-agent adds that you have to manage:

- **Inter-agent message passing.** What gets sent? Full conversation? Summary? Structured handoff?
- **Termination logic.** When does the whole system stop?
- **Error propagation.** What happens when one agent fails mid-flow?
- **Cost attribution.** Per agent? Per request? Per user?
- **Eval surface.** Each agent needs its own eval; the system also needs an end-to-end eval.

Single-agent has one set of these problems. Multi-agent has N. Plan for the N before committing.

### Heuristic: list the agents and the messages

For any multi-agent design, write down:

1. Each agent's name and one-sentence purpose.
2. Each tool each agent has.
3. The messages flowing between agents.

If the diagram is small and clear ("router classifies → specialist executes → return") you might have a valid multi-agent. If the diagram is a tangle, the design is wrong — either combine agents or untangle the responsibilities.

### When single-agent fits with a "supervisor in code"

A common compromise: one agent, but your code orchestrates multi-step flows around it. Eg.:

1. Code classifies intent (workflow step).
2. Code picks a tool list based on intent.
3. Single agent runs with the focused tool set.
4. Code post-processes.

This gives you most of the modularity of multi-agent without the coordination tax. Especially good for products where the "macro flow" is deterministic and the "micro flow" needs an agent.

### Multi-agent libraries and frameworks

If you do want multi-agent, several options exist:

- **OpenAI Agents SDK**: supports hand-off between agents natively.
- **CrewAI**: agent + crew abstractions with roles.
- **AutoGen**: chat-based multi-agent conversations.
- **LangGraph**: explicit graphs of agents and tools.

Pick one that fits your stack and team. The patterns transfer; the framework choice is mostly ergonomics.

### Cost reality

A 3-agent system that handles a task in 4 hand-offs:

- 4 model calls per agent on average = 12 calls.
- Each call sees its own context (often duplicated info).
- Total tokens 3-5× a single-agent equivalent.

For tasks where the value clearly exceeds the cost, fine. For tasks where the single-agent version was already producing the same answer, you're burning money.

## Three real-world scenarios

**Scenario 1: The single-agent that beat the multi-agent prototype.**
A team prototyped a multi-agent system: planner, researcher, writer, editor. Worked but slow ($0.40/run, 35s latency). They replaced with a single agent with the same 6 tools and a strong system prompt. Same quality on their evals, $0.10/run, 12s latency. Multi-agent had been complexity for the sake of it.

**Scenario 2: The multi-agent that was the right call.**
A code-modification feature needed deeply different roles: a "reader" (search, AST analysis, no writes) and a "writer" (file edits, run tests, approval gates). Different tools, different safety profiles, different models. Separating into two agents simplified the design and isolated the writer's safety surface.

**Scenario 3: The 5-agent demo that died in production.**
A team built a 5-agent system for marketing demos. In production, debugging was nightmarish — every issue spanned multiple traces. They eventually collapsed it to single-agent with workflow scaffolding. Same functionality, half the bugs.

## Common mistakes to avoid

- **Multi-agent because it looks impressive.** Reach for it when single-agent cracks.
- **Multi-agent for sequential work with no parallelism.** That's a workflow.
- **Multi-agent without clear role differentiation.** Cost without benefit.
- **Underestimating the coordination tax.** It's real.
- **No per-agent evals.** Hard to debug regressions when you can't measure each.
- **Treating multi-agent as more "agentic."** It's just more architecture.

## Read more

- [Anthropic — building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- [OpenAI Agents SDK — handoffs](https://platform.openai.com/docs/guides/agents)
- [LangGraph multi-agent docs](https://langchain-ai.github.io/langgraph/tutorials/multi_agent/)

## Summary

- **Multi-agent earns complexity** only with clear role differentiation, tool overload, parallelism, or safety scoping needs.
- **Default to single-agent.** Promote to multi-agent when single is genuinely cracking.
- **Compromise**: code orchestrates a workflow around a single focused agent.
- **Write the agent diagram explicitly** — if it tangles, the design is wrong.
- **Cost is 3-5× single-agent** for naive multi-agent designs; budget for it.
- **Each agent needs its own eval** + an end-to-end eval.

Next: routing, supervisor, and hand-off patterns.
