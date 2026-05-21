---
module: 2
position: 4
title: "Streaming and observability"
objective: "See what agents are doing in real-time."
estimated_minutes: 5
---

# Streaming and observability

## Streaming intermediate steps

For real-time UX:
```python
async for event in app.astream(input):
    print(event)
# Each event: node name + state update
```

Show progress as agent works.

## Streaming tokens

For chat-style streaming:
```python
async for event in app.astream_events(input, version="v2"):
    if event["event"] == "on_chat_model_stream":
        print(event["data"]["chunk"].content, end="")
```

Tokens appear as generated.

## LangSmith

LangChain's observability platform:
- Trace every agent run.
- See node-by-node execution.
- View LLM calls (prompts + responses).
- Tool invocations + results.
- Latency + cost per step.
- Errors + stack traces.

Setup:
```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-key"
```

Every LangGraph run auto-traced.

For: debugging + monitoring production agents.

## Tracing in code

For custom spans:
```python
from langchain_core.tracers import LangChainTracer

with tracer.start_as_current_span("my_step"):
    do_work()
```

For: custom observability beyond auto.

## Logging

For local debugging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Or in node:
def my_node(state):
    logging.info(f"Processing: {state}")
    ...
```

For: dev-time visibility.

## Metrics to track

For production agents:
- **Latency per node.**
- **LLM tokens (input + output).**
- **Tool call success rate.**
- **Recursion depth used.**
- **Cost per conversation.**
- **User satisfaction.**

For: ops dashboards.

## Error handling

Catch + log errors:
```python
def safe_node(state):
    try:
        return do_work(state)
    except Exception as e:
        logging.exception("Node failed")
        return {"error": str(e)}
```

Route to error handler node on failure:
```python
def router(state):
    if state.get("error"):
        return "handle_error"
    return "next_step"
```

For: graceful failure.

## Replay + debugging

LangSmith allows:
- View any past run.
- See exact state at each step.
- Re-run from any point.
- Compare runs.

For: post-hoc debugging.

## Mistakes to avoid

- **No tracing.** Black box; debug nightmare.
- **No streaming.** Bad UX (long waits).
- **No metrics.** Can't optimize.
- **Errors silent.** Production failures invisible.

## Summary

- astream / astream_events for streaming.
- LangSmith for production tracing.
- Track latency, tokens, errors, cost.
- Stream UX = users see progress.
- Error handling routes to recovery node.

Module 3 next: multi-agent orchestration.
