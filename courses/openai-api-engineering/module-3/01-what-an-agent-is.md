---
module: 3
position: 1
title: "What an agent actually is (and isn't)"
objective: "Define the agent loop, distinguish agents from chatbots and pipelines, and recognize when an agent is the right architecture."
estimated_minutes: 12
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# What an agent actually is (and isn't)

## The puzzle

The word "agent" has been stretched so thin it's almost meaningless. In 2026:

- Some "agents" are just chatbots with a fancy name.
- Some are LLM-powered scripts that follow a fixed sequence.
- Some are autonomous systems that take real actions in the world.
- Vendors call almost anything an "agent" because it sells.

Before you can engineer one, you need a definition that's actually useful. This lesson is that definition.

## The simple version

An **agent** is a system that does three things in a loop:

1. **Reasons** about a goal (the LLM call).
2. **Acts** using tools (function calls).
3. **Decides what to do next** based on results.

The loop continues until the agent decides it's done or hits a limit.

What separates an agent from other LLM uses:

- A **chatbot** responds to one message at a time. The user drives.
- A **pipeline** runs a fixed sequence of steps. The developer drives.
- An **agent** decides its own next step. The agent drives, within the boundaries you set.

The "decides its own next step" is the defining property. Everything else is implementation detail.

## The technical version

### The agent loop

The canonical structure:

```
goal: "Find the top 3 competitors to Acme Corp and summarize their pricing."

iteration 1:
  agent thinks: "I need to find competitors first."
  agent calls tool: search_web("Acme Corp competitors")
  result: [list of company names]

iteration 2:
  agent thinks: "Now I need pricing for each."
  agent calls tool: search_web("CompetitorA pricing")
  result: ...

iteration 3:
  agent calls tool: search_web("CompetitorB pricing")
  ...

iteration N:
  agent thinks: "I have enough info. Summarize."
  agent produces final answer (no tool call)
```

Each iteration:
1. LLM call (reasons, may decide to call a tool)
2. Optional tool execution (your code runs)
3. Result added to the conversation history
4. Repeat until the LLM produces an answer with no tool call

That's it. Every "agent framework" is some variation of this loop with conveniences around it.

### When you actually want an agent

Agents shine when:

- **The path isn't known upfront.** You don't know which tools to call in which order — that depends on intermediate results.
- **Tasks require multiple coordinated steps.** Research, planning, multi-source synthesis.
- **The user gives a high-level goal**, not step-by-step instructions.

Agents are *not* the right choice when:

- **The task is well-defined.** If you know "always call tool A, then tool B, then return X," that's a pipeline. Pipelines are simpler, cheaper, more reliable.
- **Single-shot is enough.** "Summarize this document" doesn't need an agent loop.
- **Latency is critical.** Agent loops add seconds per iteration. Real-time UIs often can't afford that.

A useful test: **could a smart intern do this with a checklist?** If yes, pipeline. If they'd need to think and re-plan as they went, agent.

### The cost and latency profile

Agents are expensive:

- Multiple LLM calls per user request (often 3–10, sometimes 50+ for complex tasks).
- Each iteration burns input tokens (the conversation history grows).
- Each tool call adds round-trip latency.
- Reasoning models add even more cost when used inside an agent.

Rough numbers for a typical agent run:

- 5–10 LLM calls
- $0.10–$1.00 per run, depending on model
- 10–60 seconds end-to-end

Compare to a single LLM call: 1 model call, $0.001–$0.05, 1–3 seconds. Agents are 10–100× more expensive per run. They're worth it for the right problems and a money pit for the wrong ones.

### Anti-patterns

A few common "agent" patterns that aren't actually agents:

**Pipeline dressed as agent**: someone wraps a 5-step deterministic process in agent vocabulary. There's no decision-making — every input takes the same path. Just call it a pipeline; agent overhead buys you nothing.

**Multi-turn chatbot dressed as agent**: someone calls their chat product "an agent" because it has tools. It still just responds to user messages one at a time. That's a chatbot with tools, not an agent. (Useful! Just not an agent.)

**"Agentic" stack with no decisions**: prompts that say "you are an agent" but never actually need the agent to pick its own steps. Pure vibe marketing.

The cleanest line: does the LLM decide what to do next without the developer pre-specifying it? If yes, agent. If no, something else.

### The orchestrator pattern

A useful concept: an **orchestrator agent** decides at a high level what to do; **sub-agents or tools** do the actual work.

Example:

```
orchestrator: "I have a customer email asking about pricing.
              Step 1: classify intent.
              Step 2: lookup customer record.
              Step 3: draft response using their context.
              Done."

(orchestrator calls 3 tools, each of which might be a smaller LLM call)
```

Splitting the high-level decision from the detailed execution often produces cleaner agents than a single monolithic agent. The orchestrator stays small and focused; specialized sub-tools handle their domains.

OpenAI's Agents SDK is built around this pattern (next lesson).

### Hard limits and termination

Every production agent needs hard limits to prevent runaway loops:

- **Max iterations** — never more than N iterations per run. Set N to roughly 3× the expected typical.
- **Token budget** — kill the run if total tokens exceed a limit.
- **Wall-clock timeout** — kill the run after T seconds.
- **Cost ceiling** — kill the run if estimated cost exceeds a threshold.

Without these, an agent can spiral — calling tools in an infinite loop, exhausting your budget, or hitting an unexpected edge case that produces nonsense answers indefinitely.

Always implement at least max iterations and wall-clock timeout from day one. Add cost ceilings before going to production.

## An analogy: handing a task to a contractor

You can hand a contractor either:

1. **A detailed checklist.** "Do step 1, then step 2, then step 3, then send invoice." The contractor doesn't have to decide anything. (That's a pipeline.)

2. **A goal.** "Get the kitchen renovated for under $30K." The contractor decides what to do, in what order, with which subcontractors, until the goal is met. (That's an agent.)

The second produces better results when the path is genuinely complex. It produces worse results — and burns more money — when the task is simple enough for a checklist.

OpenAI agents are the same. Give them goals when the path is complex; checklists when it isn't. Most "I should use an agent for this" instincts are wrong — the checklist version is usually faster, cheaper, and just as good.

## Three real-world scenarios

**Scenario 1: The agent that found the right answer at 10× cost.**
A team built an agent to answer customer support questions. The agent retrieved docs, considered them, sometimes followed up with another search, then answered. It worked beautifully — and cost $0.40 per answer. Replacing it with a 2-step pipeline (single RAG retrieval + single answer) cost $0.03 per answer with 95% of the quality. Agent was the right architecture; pipeline was the right product decision for their margins.

**Scenario 2: The runaway agent.**
A team's research agent had no max-iteration limit. A user's ambiguous query caused it to chain 200+ tool calls in one run, generating $14 of API costs in 4 minutes. After adding a max-iterations cap of 12 and a $1 cost ceiling, the problem disappeared.

**Scenario 3: The "agent" that was actually a pipeline.**
A team called their email triage system an "agent." On inspection: every email went through the exact same 4 steps — classify, extract, route, log. No decision-making. They renamed it a pipeline, simplified the code, dropped a dependency on an agent framework, and shipped faster. The product was identical; the engineering was cleaner.

## Common mistakes to avoid

- **Reaching for an agent when a pipeline would work.** Agents are expensive and slower.
- **Skipping hard limits.** Max iterations and wall-clock timeouts must exist from day one.
- **Building monolithic single-agent designs.** Orchestrator + specialized tools often scales better.
- **Calling everything an agent.** Useful distinctions get lost when terminology gets sloppy.
- **No observability.** You can't debug what you can't see. Log every iteration's reasoning and tool calls.

## Read more

- [Agents overview](https://platform.openai.com/docs/guides/agents) — OpenAI's primary agents doc
- [Running agents](https://platform.openai.com/docs/guides/agents/running-agents) — the loop in detail
- [Orchestration](https://platform.openai.com/docs/guides/agents/orchestration) — multi-agent patterns

## Summary

- An agent is a loop: reason → act with tools → decide next step. The LLM picks each step.
- Chatbot: user drives. Pipeline: developer drives. Agent: agent drives within boundaries you set.
- Agents shine when the path isn't known upfront. They're overkill for fixed sequences.
- Cost and latency: 10–100× a single LLM call. Worth it for the right problems.
- Always implement hard limits: max iterations, wall-clock timeout, cost ceiling.
- The orchestrator + specialized-tools pattern scales better than monolithic single agents.

Next: actually building one with OpenAI's Agents SDK.
