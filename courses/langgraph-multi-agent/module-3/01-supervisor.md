---
module: 3
position: 1
title: "Supervisor architecture"
objective: "Coordinate multiple agents via a supervisor."
estimated_minutes: 5
---

# Supervisor architecture

## The pattern

One supervisor agent routes work to specialist agents:
- **Supervisor.** Decides which specialist gets the task.
- **Specialists.** Each focused on one domain (researcher, writer, coder, analyst).
- **Supervisor again.** After specialist completes, decides next step.

For: complex tasks needing multiple skills.

## Building it

```python
from langgraph.graph import StateGraph

def supervisor(state):
    # LLM picks next agent
    return {"next": "researcher" or "writer" or "reviewer" or "FINISH"}

def researcher(state):
    return {"messages": [...]}

def writer(state):
    return {"messages": [...]}

graph = StateGraph(State)
graph.add_node("supervisor", supervisor)
graph.add_node("researcher", researcher)
graph.add_node("writer", writer)
graph.add_conditional_edges("supervisor", lambda s: s["next"])
graph.add_edge("researcher", "supervisor")
graph.add_edge("writer", "supervisor")
graph.set_entry_point("supervisor")
```

For: clean multi-agent coordination.

## When to use

- **Task has clear roles.** Research + write + review.
- **Specialists need different prompts / tools.**
- **Hierarchical reasoning helps.**

Don't use when:
- Single agent with tools suffices.
- Roles overlap heavily.

## Mistakes to avoid

- **Supervisor too smart.** Becomes one big agent.
- **Specialists too narrow.** Overhead exceeds benefit.
- **No FINISH path.** Loops forever.

## Summary

- Supervisor routes work to specialists.
- Each specialist focused on domain.
- Loop until supervisor says FINISH.
- Clean separation of concerns.

Next: hierarchical agent teams.
