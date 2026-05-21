---
module: 1
position: 2
title: "State, nodes, edges"
objective: "Build LangGraph workflows from the three primitives."
estimated_minutes: 5
---

# State, nodes, edges

## State

The shared data flowing through your graph. Define via TypedDict:

```python
from typing import TypedDict, Annotated
from langgraph.graph import add_messages

class State(TypedDict):
    messages: Annotated[list, add_messages]
    user_input: str
    tools_used: list[str]
```

`Annotated` with `add_messages` reducer appends new messages vs. replacing.

## Nodes

Functions that take state, return state updates:

```python
def my_node(state: State) -> dict:
    # Do something
    return {"messages": [new_message]}
```

Add to graph:
```python
graph.add_node("my_node", my_node)
```

Nodes can be: LLM calls, tool executions, transformations, decisions.

## Edges

Connect nodes. Three types:

**Normal:** unconditional.
```python
graph.add_edge("node_a", "node_b")
```

**Conditional:** routes based on state.
```python
def router(state):
    return "node_b" if state["x"] else "node_c"

graph.add_conditional_edges("node_a", router)
```

**Entry / End:**
```python
graph.set_entry_point("first_node")
graph.add_edge("last_node", END)
```

## Compiling + running

```python
app = graph.compile()
result = app.invoke({"messages": [], "user_input": "hello"})
```

For: execute the workflow.

## Reducers

Control how state updates merge:
- **Default.** Replace value.
- **add_messages.** Append messages.
- **Custom.** Define merger function.

For: control state evolution.

## Visualizing

```python
from IPython.display import Image
Image(app.get_graph().draw_mermaid_png())
```

For: see the graph structure visually.

## Mistakes to avoid

- **Mutating state directly.** Return new dict instead.
- **No entry point.** Graph won't start.
- **Forgotten reducer for messages.** Replaces instead of appending.

## Summary

- State = TypedDict shared across nodes.
- Nodes = functions transforming state.
- Edges = transitions (normal / conditional / entry / END).
- Reducers control state merging.
- Compile + invoke.

Next: conditional edges.
