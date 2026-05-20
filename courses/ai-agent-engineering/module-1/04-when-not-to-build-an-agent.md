---
module: 1
position: 4
title: "When NOT to build an agent"
objective: "Recognize the cases where a simple workflow or single LLM call beats an agent."
estimated_minutes: 9
---

# When NOT to build an agent

## The puzzle

There's a strong pull toward agents right now. Every framework, every demo, every conference talk shows an agent solving something. The temptation: build an agent for your next feature because "everyone's doing it."

The result, over and over, is teams shipping slow, expensive, unreliable agents to solve problems a single LLM call would have handled in a tenth the time.

This lesson is the contrarian half of agent engineering: **the cases where agents are the wrong tool.**

## The simple version

Don't build an agent when:

1. **The steps are predictable.** Use a workflow.
2. **The task is single-shot.** Use one LLM call.
3. **Latency matters.** Agents are slow.
4. **Cost is dominant.** Agents are expensive on average.
5. **Reliability requirements are high.** Agents have more failure modes.
6. **The task is mostly classification or extraction.** Structured output beats agentic.
7. **You don't have an eval suite.** You can't ship an agent you can't test.

If two or more of these apply, you probably don't want an agent.

## The technical version

### The cost gradient

Roughly:

- **Single LLM call** with structured output: $0.001–$0.01 per task.
- **Workflow** (2–4 LLM calls): $0.01–$0.05 per task.
- **Agent** (5–10 steps): $0.05–$0.30 per task.
- **Deep agent** (research-style, 20+ steps): $0.50–$5 per task.
- **Multi-agent system**: $1–$20 per task.

For a feature running 10,000 times a day, the gap between $0.01 and $0.10 is $300/day → $9K/month. The decision is real, not theoretical.

### The latency gradient

- **Single call** (Haiku-tier): 300–800ms.
- **Single call** (Sonnet): 1–3s.
- **Workflow**: 2–8s.
- **Agent (5 steps)**: 10–30s.
- **Deep agent (20+ steps)**: 1–10 minutes.

For real-time UX, agents past a few steps stop feeling like a product and start feeling like a script.

### When a single LLM call wins

- **Classification.** Intent, sentiment, category — one call, often Haiku, often <500ms.
- **Extraction.** Pull fields from a document — one call with structured output.
- **Summarization.** Condense text — one call.
- **Translation.** Convert language — one call.
- **Rephrasing.** Change tone — one call.
- **Decision-making with bounded options.** "Is this complaint urgent?" — one call.

For these, agents add nothing but cost and latency.

### When a workflow wins

- **Pipelines with known steps.** Onboarding email: classify persona → look up profile → draft → send.
- **Batched transforms.** Clean, normalize, embed.
- **Multi-step but deterministic** flows. Lead enrichment, document processing, report generation.

If the diagram for the task is a straight line with no branches, build a workflow.

### When an agent wins

The cases where an agent earns its cost:

- **Open-ended research.** "Find out X and explain why." Steps depend on what's discovered.
- **Customer support with branching.** Decision tree too deep to hard-code.
- **Code or system manipulation.** Editing a codebase, running queries, taking arbitrary actions.
- **Long-horizon tasks** where the path can't be enumerated in advance.

These are tasks where the *value* is the system figuring out what to do. An agent earns its cost by being autonomous.

### The "I'm using an agent for X" smell test

If you can write down the steps your "agent" takes on a typical run and they're the same most of the time, you don't have an agent — you have a workflow with a more expensive runtime.

Symptoms of misplaced agency:

- Agent always calls the same 3 tools in the same order.
- The system prompt says "always start by doing X, then Y, then Z."
- Output variability is undesirable; you keep tightening prompts to make the agent more deterministic.

Each of these is the agent trying to be a workflow. Make it a workflow.

### The reliability problem

Agents are probabilistic. They can:

- Pick the wrong tool.
- Call the right tool with wrong arguments.
- Loop on edge cases.
- Hallucinate intermediate results.
- Decide to stop prematurely.

For each failure mode, you mitigate (evals, approval gates, step caps, tool design). But you don't *eliminate*.

For products where reliability requirements are high — billing flows, account changes, security-relevant decisions — a workflow with bounded LLM steps is much easier to reason about. Bring in agents only where the flexibility justifies the new failure surface.

### The "agentic UI" trap

Some teams build agents to deliver an "agentic feel" — model thinking out loud, tools surfacing live, etc. — even when the underlying task is a single decision.

You can fake the UX without the actual agent loop:

- Stream a single LLM response.
- Surface tool calls in the streamed output.
- Show a "thinking..." indicator.
- Render a final answer.

Users get the agentic feeling. You get workflow cost and reliability. Best of both.

### The bootstrap rule

For any AI feature, start with the simplest pattern that *might* work and promote upward only when needed:

1. **Try a single LLM call** with the best prompt you can write.
2. **If that's not enough, try a workflow** (predetermined steps).
3. **If that's not enough, try an agent** with a step cap and full observability.
4. **If that's not enough, try a multi-agent system.**

Most teams skip steps 1 and 2 because they want to build "the cool thing." They end up with expensive, slow agents solving problems that a $0.001/call structured output would have nailed.

## Three real-world scenarios

**Scenario 1: The "agent" that was a switch statement.**
A team built a 6-tool agent to classify and route customer messages. Audit: in production, the agent always called `classify_intent` followed by `route_to_team`. They replaced it with a workflow: one LLM call returning `{intent, team}` structured output. Cost dropped 95%, latency dropped from 4s to 600ms, reliability went up.

**Scenario 2: The research feature that needed the agent.**
A B2B sales tool's "research the prospect" feature needed multi-step web browsing + synthesis. Workflow couldn't cover it because the path depended on what was found. Agent worked. Cost was $0.40/query but each query saved 30 minutes of sales rep time. The pattern fit the problem.

**Scenario 3: The reverted agent.**
A startup launched an "AI agent" for SaaS billing. It could refund, upgrade, downgrade, etc. Edge cases caused incorrect refunds. They reverted to a workflow that proposed actions and required user confirmation. Lost the "agent" marketing but gained reliable billing. Lesson: reliability requirements limit how agentic the system should be.

## Common mistakes to avoid

- **Choosing "agent" for marketing reasons.** Pattern should match problem, not buzzwords.
- **Skipping simpler patterns.** Try a single call and a workflow before reaching for an agent.
- **Wrapping deterministic flows in agent loops.** Adds cost and failure modes for nothing.
- **Treating agent variance as a bug.** Built-in. If you can't tolerate variance, don't use an agent.
- **Building agents without evals.** You'll ship things you can't measure.

## Read more

- [Anthropic — Building Effective Agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- [OpenAI Agents SDK overview](https://platform.openai.com/docs/guides/agents)

## Summary

- **Agents are powerful but expensive, slow, and probabilistic** — they're the wrong default.
- **Use single LLM calls** for classification, extraction, summarization, rephrasing.
- **Use workflows** for predictable multi-step flows.
- **Use agents** for open-ended problems where steps depend on intermediate results.
- **Bootstrap upward**: try the simplest pattern first; promote only when needed.
- **High-reliability domains** (billing, security) usually prefer workflows.
- **Agentic UX can be faked** with streaming and tool-use display — don't build an agent just for the feel.

That wraps Module 1. Next module: designing tools agents can actually use.
