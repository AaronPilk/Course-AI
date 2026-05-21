---
module: 2
position: 3
title: "Memory and context management"
objective: "Manage agent conversation history + long-term memory."
estimated_minutes: 5
---

# Memory and context management

## Short-term memory (conversation history)

Messages accumulate in state:
```python
class State(TypedDict):
    messages: Annotated[list, add_messages]
```

Each turn adds to list. LLM sees full history.

For: contextual conversations.

## Context window limits

LLM context capped:
- 8B Llama: 128K.
- GPT-4o: 128K.
- Claude 3.5: 200K.

Long conversations overflow. Need management.

## History trimming

Keep recent N messages:
```python
def trim_messages(state):
    return {"messages": state["messages"][-20:]}
```

Lose older context but fits window.

## Summarization

For preserving older context:
```python
def summarize_old(state):
    if len(state["messages"]) > 30:
        summary = llm.invoke("Summarize: " + str(state["messages"][:-10]))
        return {"messages": [summary] + state["messages"][-10:]}
    return {}
```

Compress old into summary; keep recent verbatim.

## Long-term memory (cross-session)

For agent remembering across conversations:
- Vector DB stores memories.
- Retrieve relevant at query time.
- Add to context.

```python
def retrieve_memories(state):
    relevant = vector_store.search(state["user_input"])
    return {"messages": [SystemMessage(content=f"Relevant memories: {relevant}")]}
```

For: persistent assistant.

## Memory types

- **Episodic.** Specific events ("User mentioned son's birthday in January").
- **Semantic.** Facts ("User prefers technical detail").
- **Procedural.** How to do things.

Different storage / retrieval strategies per type.

## LangMem

LangChain's memory library for sophisticated patterns:
- Auto-extract facts from conversations.
- Update memories over time.
- Forget irrelevant.

For: sophisticated agent memory.

## State persistence

Save state across runs via checkpointer:
```python
from langgraph.checkpoint.sqlite import SqliteSaver

memory = SqliteSaver.from_conn_string(":memory:")
app = graph.compile(checkpointer=memory)

# Resume same conversation
config = {"configurable": {"thread_id": "user_123"}}
app.invoke(input, config)
```

For: multi-turn conversations across sessions.

## Mistakes to avoid

- **Unlimited history.** Context overflow.
- **No summarization.** Lose distant context.
- **No persistence.** New conversation each invocation.
- **Memory bloat.** Store everything; retrieval slow.

## Summary

- Short-term: messages list in state.
- Trim or summarize when history exceeds context.
- Long-term: vector DB for cross-session.
- Memory types: episodic, semantic, procedural.
- Checkpointer for state persistence.

Next: streaming and observability.
