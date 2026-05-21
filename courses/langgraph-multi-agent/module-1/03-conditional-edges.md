---
module: 1
position: 3
title: "Conditional edges and routing"
objective: "Branch workflows based on state."
estimated_minutes: 5
---

# Conditional edges and routing

## Conditional edges

For dynamic routing:
```python
def router(state) -> str:
    if state["needs_tool"]:
        return "tool_node"
    elif state["is_done"]:
        return END
    else:
        return "agent_node"

graph.add_conditional_edges(
    "decision_node",
    router,
    {"tool_node": "tool_node", "agent_node": "agent_node", END: END}
)
```

For: branching workflows.

## Common routing patterns

**Tool routing.** Agent decides which tool to call.
**Validity check.** Continue if valid; else go to retry.
**Complexity routing.** Small model for easy; large for hard.
**Done check.** Loop until satisfied.

For: dynamic behavior based on state.

## ReAct pattern

The classic agent loop:
```python
graph.add_node("agent", llm_call)
graph.add_node("tool", execute_tool)

def should_continue(state):
    if state["messages"][-1].tool_calls:
        return "tool"
    return END

graph.add_conditional_edges("agent", should_continue)
graph.add_edge("tool", "agent")  # Back to agent after tool
```

LLM calls tool → tool runs → result back to LLM → LLM decides next step.

For: standard agent architecture.

## Parallel routing

For fan-out:
```python
graph.add_edge("plan", "subtask_a")
graph.add_edge("plan", "subtask_b")
graph.add_edge("subtask_a", "merge")
graph.add_edge("subtask_b", "merge")
```

For: parallel subtask execution; merge results.

## Send for dynamic parallel

For variable number of parallel calls:
```python
from langgraph.constants import Send

def dispatch(state):
    return [Send("worker", {"task": t}) for t in state["tasks"]]

graph.add_conditional_edges("planner", dispatch, ["worker"])
```

For: dynamic parallelism (variable task count).

## Mistakes to avoid

- **No END route.** Infinite loops.
- **Conditional without all branches.** State machine incomplete.
- **Routing on missing state key.** KeyError.

## Summary

- Conditional edges route by state.
- Function returns next node name (or END).
- ReAct: agent → conditional → tool → agent loop.
- Send for dynamic parallelism.

Next: cycles, loops, recursion.
