---
module: 4
position: 3
title: "Error handling and retries"
objective: "Make agents resilient to failures."
estimated_minutes: 5
---

# Error handling and retries

## Failure modes

Agents fail various ways:
- LLM API timeout / error.
- Tool execution fails.
- Invalid output (JSON parse error).
- Rate limit hit.
- Recursion limit.
- State corruption.

Production agents handle all gracefully.

## Try-except in nodes

Basic pattern:
```python
def node(state):
    try:
        result = risky_operation(state)
        return {"result": result}
    except RateLimitError:
        time.sleep(30)
        return {"retry": True}
    except Exception as e:
        return {"error": str(e)}
```

For: handle at node level; route based on outcome.

## Retry with exponential backoff

```python
from tenacity import retry, wait_exponential

@retry(wait=wait_exponential(multiplier=1, min=4, max=60))
def llm_call(prompt):
    return llm.invoke(prompt)
```

For: transient failures (rate limits, network); automatic retry.

## Conditional error routing

```python
def route(state):
    if state.get("error"):
        if state["error_count"] < 3:
            return "retry"
        return "fallback"
    return "next_step"
```

For: try recovery before giving up.

## Fallback strategies

When primary fails:
- **Different model.** Switch LLM.
- **Simpler approach.** Skip complex tool.
- **Default answer.** "I can't help with that right now."
- **Human handoff.** Escalate.

For: graceful degradation.

## Tool error responses

Tools should return errors as text:
```python
@tool
def search(query: str) -> str:
    try:
        return real_search(query)
    except Exception as e:
        return f"Search failed: {e}. Try a different query."
```

LLM reads error → adjusts. Don't crash the agent.

## Timeouts

Cap node execution time:
```python
import asyncio

async def node(state):
    try:
        async with asyncio.timeout(30):
            return await long_running_task(state)
    except asyncio.TimeoutError:
        return {"error": "Timeout"}
```

For: prevent hung agents.

## Recursion limit handling

```python
try:
    result = app.invoke(input, {"recursion_limit": 50})
except GraphRecursionError:
    # Agent looped without finishing
    return {"answer": "Couldn't complete task within limit"}
```

For: bounded execution.

## Mistakes to avoid

- **No error handling.** Single failure kills agent.
- **Infinite retries.** Costs spiral.
- **Crashes propagate.** State corruption.
- **No fallback.** Users get errors.

## Summary

- Try-except per node.
- Tenacity for retry with backoff.
- Conditional routing on errors.
- Fallback strategies (different model, simpler, default, escalate).
- Tools return errors as text; LLM adapts.

Next: cost + latency optimization.
