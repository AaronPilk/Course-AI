---
module: 2
position: 2
title: "Tools and tool calling"
objective: "Give agents the ability to act in the world."
estimated_minutes: 5
---

# Tools and tool calling

## What tools are

Functions agents can call. From simple to complex:
- Web search.
- Calculator.
- Code execution.
- Database query.
- API call.
- File system access.
- Custom business logic.

For: extending LLM beyond text generation.

## Defining tools

```python
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    # Implementation
    return f"The weather in {city} is 72°F sunny"

@tool
def search_web(query: str) -> str:
    """Search the web for current information."""
    return "search results..."

tools = [get_weather, search_web]
```

Docstring becomes tool description; LLM uses it to decide when to call.

## Tool calling

Modern LLMs support structured tool calling:
```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o").bind_tools(tools)
response = model.invoke("What's the weather in Paris?")
# response has tool_calls: [{name: "get_weather", args: {"city": "Paris"}}]
```

For: LLM-controlled action.

## ToolNode

LangGraph's prebuilt:
```python
from langgraph.prebuilt import ToolNode
tool_node = ToolNode(tools)
graph.add_node("tools", tool_node)
```

Auto-executes whatever tool the LLM requested.

## Tool arguments

Use Pydantic for complex args:
```python
from pydantic import BaseModel, Field

class SearchArgs(BaseModel):
    query: str = Field(description="Search query")
    num_results: int = Field(default=5, description="Number of results")

@tool(args_schema=SearchArgs)
def search(query: str, num_results: int = 5) -> str:
    return "..."
```

For: structured tool inputs.

## Built-in tools

LangChain provides many:
- TavilySearchResults (web search).
- WolframAlphaQueryRun.
- PythonREPL.
- SQLDatabaseToolkit.
- BraveSearch.

For: skip implementing common tools.

## Custom complex tools

For business logic:
```python
@tool
def query_orders(customer_id: str, status: str) -> str:
    """Query customer orders by status."""
    orders = db.query(...)
    return json.dumps(orders)
```

For: agent operates on your data.

## Error handling in tools

Tools should handle errors gracefully:
```python
@tool
def risky_tool(input: str) -> str:
    try:
        return do_thing(input)
    except Exception as e:
        return f"Error: {e}. Try a different approach."
```

LLM reads error → adjusts. Don't raise uncaught.

For: agent resilience.

## Tool safety

For dangerous tools (code exec, file writes, API calls with side effects):
- Sandboxing.
- Permission checks.
- Human approval (covered later).
- Audit logs.

For: production safety.

## Mistakes to avoid

- **No tool docstrings.** LLM can't decide when to use.
- **Massive tool count (20+).** LLM confused.
- **Tools that crash.** Agent gives up.
- **No safety on dangerous tools.** Risk.

## Summary

- @tool decorator creates tools from functions.
- Docstring becomes LLM-visible description.
- ToolNode auto-executes called tools.
- Pydantic args for complex schemas.
- Built-in tools for common needs.
- Handle errors; return text for LLM to react.

Next: memory and context.
