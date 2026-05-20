---
module: 3
position: 2
title: "The Agents SDK — building your first one"
objective: "Build a working OpenAI Agent that takes a task, uses tools, and returns a structured result."
estimated_minutes: 13
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# The Agents SDK — building your first one

## The puzzle

You've decided you need an agent. You start to build the loop manually:

- Track conversation state across iterations
- Detect tool calls in model output
- Execute tools
- Handle errors
- Format results for the next iteration
- Manage stop conditions
- Track tokens for budgeting
- Add logging
- Handle parallel tool calls
- Deal with reasoning tokens

Two days in, you've written 400 lines of orchestration code that mostly mirrors what every other agent implementation does. You're not solving your problem — you're rebuilding a framework.

OpenAI's **Agents SDK** is that framework. It handles the loop so you can focus on the agent's purpose. This lesson covers what the SDK does, how to use it, and when you'd skip it.

## The simple version

The Agents SDK gives you:

- A clean way to **define an agent** (instructions + tools + model).
- An automatic **agent loop** that runs until completion or a stop condition.
- Built-in **observability** (you can inspect every step the agent took).
- Hooks for **guardrails, approvals, and orchestration** between sub-agents.
- Native support for **OpenAI's first-party tools** (web search, file search, computer use, code interpreter).

You write the agent's instructions and tools. The SDK runs the loop.

For new agent code, default to the SDK. Drop down to manual orchestration only if you have a specific reason.

## The technical version

### A minimal agent

The most basic agent definition:

```python
from openai import OpenAI
from openai_agents import Agent, Runner

client = OpenAI()

agent = Agent(
    name="ResearchAgent",
    instructions="You research topics and return a concise summary.",
    model="gpt-5-mini",
    tools=[],  # no tools yet
)

result = Runner.run_sync(agent, "Summarize the EU AI Act in 3 paragraphs.")
print(result.final_output)
```

That's a complete agent. The SDK handles the LLM call, the loop logic (trivial here since there are no tools), and the result extraction.

### Adding tools

The same agent with a search tool:

```python
from openai_agents import Agent, Runner, function_tool

@function_tool
def search_web(query: str) -> str:
    """Searches the web for a query and returns top results."""
    return my_search_implementation(query)

agent = Agent(
    name="ResearchAgent",
    instructions="You research topics by searching the web and synthesizing findings. Always cite sources.",
    model="gpt-5-mini",
    tools=[search_web],
)

result = Runner.run_sync(
    agent,
    "What are the top criticisms of the EU AI Act from industry?"
)
print(result.final_output)
```

The `@function_tool` decorator handles:
- Generating the JSON schema for the model from the function signature
- Type validation on incoming arguments
- Catching and forwarding errors back to the model

The agent will:
- Read the user's request
- Decide it needs to search
- Call `search_web` (maybe multiple times)
- Synthesize an answer
- Return it

### Inspecting what the agent did

The result object includes detailed traces:

```python
result = Runner.run_sync(agent, "What's the latest on the EU AI Act?")

for item in result.new_items:
    print(item.type, ":", item)

# Output:
# message :  Assistant: I'll search for recent news...
# tool_call : search_web(query="EU AI Act recent news")
# tool_result : "..."
# message : Based on the search results...
```

You can see every reasoning step and tool call. Critical for debugging — and for evals (Module 4).

### Built-in OpenAI tools

The SDK supports OpenAI's first-party tools without you writing implementations:

```python
agent = Agent(
    name="ResearcherWithBuiltins",
    instructions="...",
    model="gpt-5-mini",
    tools=[
        "web_search",      # OpenAI's web search
        "file_search",     # search files you've uploaded
        "code_interpreter" # sandboxed Python execution
    ]
)
```

For things OpenAI provides, prefer the built-ins:
- Better optimized for the model
- Less code on your side
- Token-cost handled by OpenAI rather than padding your function definitions

### Structured output for agents

Agents often need to return structured data, not just text. Combine with a Pydantic (Python) or Zod (TS) model:

```python
from pydantic import BaseModel
from openai_agents import Agent, Runner

class CompetitorReport(BaseModel):
    competitors: list[str]
    summary: str
    citations: list[str]

agent = Agent(
    name="CompetitorResearcher",
    instructions="Research competitors and return structured results.",
    model="gpt-5-mini",
    tools=[search_web],
    output_type=CompetitorReport,
)

result = Runner.run_sync(agent, "Find Acme Corp's top 3 competitors.")
report: CompetitorReport = result.final_output_as(CompetitorReport)
print(report.competitors)
```

The SDK wires up structured output automatically. The final `result.final_output_as(T)` gives you a typed object.

### Multi-agent orchestration

For more complex workflows, you can have agents call other agents:

```python
researcher = Agent(
    name="Researcher",
    instructions="Find facts.",
    model="gpt-5-mini",
    tools=[search_web],
)

writer = Agent(
    name="Writer",
    instructions="Write content based on research.",
    model="gpt-5",  # bigger model for the harder writing task
)

orchestrator = Agent(
    name="Orchestrator",
    instructions=(
        "You coordinate research and writing. "
        "First hand off to the Researcher, then to the Writer."
    ),
    model="gpt-5-mini",
    handoffs=[researcher, writer],
)

result = Runner.run_sync(
    orchestrator,
    "Write a 500-word brief on the EU AI Act's impact on startups."
)
```

The `handoffs` mechanism lets the orchestrator delegate sub-tasks to specialized agents. Each agent stays focused.

### Configuration that matters

Useful agent-level config:

- **`model`** — picks the model per agent. Light agents on mini; heavy ones on full GPT-5 or reasoning.
- **`output_type`** — Pydantic / Zod schema for structured output.
- **`max_turns`** — max iterations before the runner stops. Hard limit.
- **`tools`** — list of available tools.
- **`handoffs`** — sub-agents this agent can delegate to.
- **`guardrails`** — input/output validation hooks (next lesson).

Per-run config:

- **Inputs** — the user's task or message.
- **Stop conditions** — wall-clock timeout, max tokens, etc.

### When to skip the SDK

The SDK is the recommended path, but you might skip it when:

- **You're targeting non-OpenAI models** too. The SDK is OpenAI-specific. For multi-provider, frameworks like LangChain might fit better.
- **You need ultra-custom control** of the loop (rare).
- **You're building something small** where the SDK feels like overkill (also rare in real products).

In most cases, the SDK is the right default.

### TypeScript / JS support

The Agents SDK is available for Python and JavaScript/TypeScript. The TypeScript API is closely analogous:

```ts
import { Agent, run, tool } from "openai-agents";
import { z } from "zod";

const searchWeb = tool({
  name: "search_web",
  description: "Searches the web.",
  parameters: z.object({ query: z.string() }),
  execute: async ({ query }) => mySearch(query),
});

const agent = new Agent({
  name: "ResearchAgent",
  instructions: "You research topics by searching the web.",
  model: "gpt-5-mini",
  tools: [searchWeb],
});

const result = await run(agent, "Summarize the EU AI Act.");
console.log(result.finalOutput);
```

Same mental model. Same loop. Pick the SDK that matches your stack.

## An analogy: writing async code with vs without a framework

You can write async code with raw callbacks. You can also write it with promises or async/await. The mechanics are the same; the framework just removes boilerplate.

The Agents SDK is async/await for agents. You can still build the loop by hand — and people did, for two years — but it was repetitive boilerplate that everyone wrote the same way.

The SDK replaces "write the loop again" with "define the agent." You spend your time on the unique parts: the agent's purpose, its tools, its guardrails. Not on iterating over `tool_calls` arrays.

## Three real-world scenarios

**Scenario 1: The team that deleted 600 lines of orchestration code.**
A team had hand-rolled an agent loop with custom tool registry, retry logic, conversation state management, and observability hooks. ~600 lines. Migrating to the Agents SDK removed all of it. Their actual agent logic (tools + instructions) was unchanged. They shipped two new agents the following month with minimal additional code.

**Scenario 2: The orchestrator pattern that solved a regression problem.**
A team had a monolithic agent that did "research + write" together. Quality on long-form writing was inconsistent — sometimes the research was great but the writing flat, sometimes vice versa. Splitting into a `Researcher` (mini, fast, focused on retrieval) + `Writer` (full GPT-5, focused on prose) + `Orchestrator` (mini, light) fixed both. Quality went up; cost went *down* because only the writer used a big model.

**Scenario 3: The agent without `max_turns` that ran for hours.**
An agent without a max-turns config got into a tool-error loop in production. It ran for 4 hours, consumed $200 in API costs, and produced nothing. Adding `max_turns=15` fixed it instantly. Lesson: never deploy an agent without hard limits.

## Common mistakes to avoid

- **Skipping the SDK for "control."** Most teams who do this rebuild the same loop and ship slower.
- **No `max_turns` limit.** Runaway agents are real and expensive.
- **One giant agent for everything.** Split into focused sub-agents; orchestrate from a smaller agent.
- **No observability.** The SDK gives you traces — use them.
- **Mixing reasoning and non-reasoning models in one agent without thinking.** Be intentional about which steps need thinking.

## Read more

- [Agents SDK overview](https://platform.openai.com/docs/guides/agents) — primary reference
- [Quickstart](https://platform.openai.com/docs/guides/agents/quickstart) — first agent in 5 minutes
- [Orchestration patterns](https://platform.openai.com/docs/guides/agents/orchestration) — multi-agent designs

## Summary

- The Agents SDK handles the agent loop, tool dispatch, observability, structured output, and orchestration.
- Define an agent with name, instructions, model, tools, and (optionally) output_type and handoffs.
- Use built-in OpenAI tools where they fit; define custom tools as functions decorated for the SDK.
- Use the orchestrator + specialized-tool pattern for non-trivial workflows.
- Always set `max_turns` and other hard limits.
- Same SDK in Python and TypeScript with parallel APIs.

Next: tool design patterns that survive production load.
