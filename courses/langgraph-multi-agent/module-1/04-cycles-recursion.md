---
module: 1
position: 4
title: "Cycles, loops, and recursion limits"
objective: "Handle iterative workflows safely."
estimated_minutes: 5
---

# Cycles, loops, and recursion limits

## Why loops matter

Agents iterate:
- Think → Act → Observe → Think.
- Search → Evaluate → More search → Done.
- Generate → Test → Fix → Generate.

LangGraph supports cycles natively. Edges can point back to earlier nodes.

## Recursion limit

To prevent infinite loops:
```python
app = graph.compile()
result = app.invoke(input, {"recursion_limit": 25})
```

Default 25 steps. Errors if exceeded.

For: safety against runaway agents.

## Tracking iterations in state

```python
class State(TypedDict):
    iterations: int
    messages: list

def increment_counter(state):
    return {"iterations": state["iterations"] + 1}

def should_continue(state):
    if state["iterations"] >= 10:
        return END
    return "agent"
```

For: explicit iteration tracking; custom max.

## Loop termination conditions

Define clear exit criteria:
- **Task complete.** Agent returns final answer.
- **Max iterations.** Safety cap.
- **Quality threshold.** Output good enough.
- **Resource exhausted.** Budget hit.

For: bounded loops; no infinite runs.

## Common loop patterns

**Self-correction:**
```
generate → check_quality → if low: refine → check_quality → ... → output
```

**Tool use:**
```
agent → tool → agent → tool → ... → finish
```

**Plan-execute-replan:**
```
plan → execute_step → if more steps: plan → execute_step → ... → done
```

## Streaming intermediate states

For UX during loops:
```python
async for event in app.astream(input):
    print(event)  # Show progress
```

For: real-time progress UI.

## Debugging loops

Common issues:
- **Infinite loop.** Missing termination.
- **Wrong state update.** Loop doesn't progress.
- **Recursion limit hit too soon.** Need larger limit or fewer steps.

Tools: LangSmith for visual debugging; print intermediate states.

## Production safety

For agent loops in production:
- **Max iterations.** Always cap.
- **Cost cap.** Per-conversation budget.
- **Timeout.** Total time limit.
- **Quality monitoring.** Detect degraded outputs.

For: prevent runaway costs / behavior.

## Mistakes to avoid

- **No recursion limit.** Runaway costs.
- **Loop without progress.** Same state repeats.
- **Wrong termination logic.** Misses real done states.
- **Tiny recursion limit.** Cuts off legitimate work.

## Summary

- LangGraph supports cycles natively.
- recursion_limit default 25; configure per workflow.
- Track iterations in state for custom limits.
- Always have termination conditions.
- Stream intermediate states for UX.
- Production safety: max iter + cost cap + timeout.

Module 2 next: building agents.
