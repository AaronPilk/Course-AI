---
module: 3
position: 4
title: "Parallel + sequential workflows"
objective: "Combine concurrent and sequential agent execution."
estimated_minutes: 5
---

# Parallel + sequential workflows

## Sequential

Default LangGraph: nodes run in order.
```
A → B → C
```

For: dependent steps; later needs earlier's output.

## Parallel (fan-out)

Multiple nodes from one starting point:
```python
graph.add_edge("start", "agent_a")
graph.add_edge("start", "agent_b")
graph.add_edge("start", "agent_c")
# Then merge
graph.add_edge("agent_a", "merge")
graph.add_edge("agent_b", "merge")
graph.add_edge("agent_c", "merge")
```

LangGraph runs A, B, C in parallel. Merge waits for all.

For: independent subtasks; faster overall.

## Dynamic parallel (Send)

For variable parallel count:
```python
from langgraph.constants import Send

def dispatch(state):
    return [Send("worker", {"task": t}) for t in state["tasks"]]

graph.add_conditional_edges("planner", dispatch, ["worker"])
graph.add_edge("worker", "aggregator")
```

For: process N items in parallel (N varies per query).

## Map-reduce pattern

Common combo:
1. **Map.** Split work; process each in parallel.
2. **Reduce.** Combine results.

```
input → split → [worker × N] → aggregate → output
```

For: scalable parallel processing.

## State merging in parallel

When parallel nodes update same state field:
- Last write wins (default).
- Use reducer (sum, list append, etc.).
- Define carefully to avoid conflicts.

For: prevent data loss across parallel.

## When parallel wins

- **Independent tasks.** Process 100 documents simultaneously.
- **Multi-source search.** Web + docs + database concurrently.
- **Ensemble.** Multiple agents on same task; vote.

For: latency reduction via concurrency.

## When sequential wins

- **Dependent steps.** Output of A feeds B.
- **Resource-limited.** Can't parallelize on small infrastructure.
- **Reasoning chain.** Sequential thought process.

For: tasks with dependencies.

## Mistakes to avoid

- **Parallelizing dependent tasks.** Race conditions; wrong results.
- **No state reducer for parallel.** Lost updates.
- **Excessive parallelism.** Resource exhaustion.

## Summary

- Sequential: edges in order; default.
- Parallel: multiple edges from one node; concurrent execution.
- Send: dynamic parallel count.
- Map-reduce: split → parallel workers → aggregate.
- State reducers prevent parallel write conflicts.

Module 4 next: production patterns.
