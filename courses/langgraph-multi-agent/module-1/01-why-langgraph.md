---
module: 1
position: 1
title: "Why LangGraph — beyond simple chains"
objective: "Understand when graph-based AI workflows beat linear chains."
estimated_minutes: 5
---

# Why LangGraph — beyond simple chains

## The chain limitation

LangChain's original `Chain` abstraction runs steps sequentially: prompt → LLM → output. Works for simple tasks but breaks for:
- **Cycles.** Agent loops (think → act → observe → think).
- **Branching.** Different paths based on conditions.
- **State.** Variables persisting across many steps.
- **Multi-agent.** Multiple AI actors collaborating.

For sophisticated AI workflows: chains insufficient.

## What LangGraph adds

LangGraph models workflows as a directed graph:
- **Nodes.** Steps (LLM call, tool use, decision, transform).
- **Edges.** Transitions between nodes.
- **State.** Shared data flowing through graph.
- **Cycles allowed.** Agents loop until done.

For: stateful, complex, multi-step AI applications.

## When to use LangGraph

- **Agents** with tool use.
- **Multi-agent systems** (researcher + writer + reviewer).
- **Human-in-the-loop** workflows (pause for approval).
- **Long-running** tasks with persistence.
- **Complex branching** logic.

For: anything beyond simple prompt → response.

## LangGraph vs. alternatives

- **LangChain Chains.** Simple linear.
- **LangChain LCEL.** Composable but mostly linear.
- **LangGraph.** Full graph; the modern way.
- **CrewAI.** Higher-level multi-agent (built on LangGraph).
- **AutoGen.** Microsoft's; conversation-oriented agents.
- **Custom code.** Always option.

For most production agent systems in 2026: LangGraph.

## Quick example

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class State(TypedDict):
    messages: list

def agent_node(state):
    # Call LLM
    return {"messages": state["messages"] + [response]}

def tool_node(state):
    # Execute tool
    return {"messages": state["messages"] + [result]}

graph = StateGraph(State)
graph.add_node("agent", agent_node)
graph.add_node("tool", tool_node)
graph.add_edge("agent", "tool")
graph.add_edge("tool", "agent")  # Loop
graph.set_entry_point("agent")

app = graph.compile()
```

For: agent that loops between thinking + acting.

## Production benefits

- **Observability.** See graph execution; debug visually.
- **Persistence.** Save state; resume later.
- **Streaming.** Show intermediate steps.
- **Human-in-loop.** Pause for human input.
- **Time travel.** Replay from any state.

For: pro production AI agent systems.

## Mistakes to avoid

- **Using LangGraph for simple chains.** Overkill.
- **Building agents from scratch.** Reinvents what LangGraph provides.
- **Skipping state design.** State sprawl.

## Summary

- LangGraph = graph-based AI workflows.
- Beyond simple chains: cycles, branching, state, multi-agent.
- Standard for production agent systems 2026.
- Built on LangChain ecosystem.

Next: state, nodes, edges.
