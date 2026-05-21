---
module: 4
position: 1
title: "Persistence and checkpointing"
objective: "Save agent state; resume across sessions."
estimated_minutes: 5
---

# Persistence and checkpointing

## Why persistence

Agents that:
- Resume conversations days later.
- Survive crashes mid-task.
- Multi-session workflows.
- Audit trails.

Persistence = save state at each step; reload on next invocation.

## Checkpointer

```python
from langgraph.checkpoint.sqlite import SqliteSaver
memory = SqliteSaver.from_conn_string("agent.db")
app = graph.compile(checkpointer=memory)
```

Every node execution saves state. Resume via thread_id.

## Thread IDs

Each conversation = unique thread:
```python
config = {"configurable": {"thread_id": "user_123_chat_456"}}
app.invoke(input, config)  # First call
app.invoke(input2, config)  # Same conversation continues
```

For: multi-turn conversations; per-user state.

## Persistence backends

- **MemorySaver.** In-process; lost on restart.
- **SqliteSaver.** Local SQLite file.
- **PostgresSaver.** Production; remote DB.
- **Redis.** Fast; ephemeral OK.

For production: PostgresSaver typical.

## Time travel

View state at any past step:
```python
# Get all checkpoints
checkpoints = list(app.get_state_history(config))

# Resume from specific checkpoint
app.invoke(None, {"configurable": {"thread_id": "x", "checkpoint_id": "..."}})
```

For: debug, replay, fork conversations.

## Updating state externally

For human intervention:
```python
app.update_state(config, {"key": "new_value"})
```

For: human edits before continuing agent.

## Mistakes to avoid

- **MemorySaver in production.** Lost on restart.
- **No thread_id management.** Conversations cross-contaminate.
- **No cleanup.** DB grows unbounded.

## Summary

- Checkpointer saves state per node execution.
- Thread IDs separate conversations.
- SqliteSaver / PostgresSaver for persistence.
- Time travel + state edit for advanced patterns.

Next: human-in-the-loop.
