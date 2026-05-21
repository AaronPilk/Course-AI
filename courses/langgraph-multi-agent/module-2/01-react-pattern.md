---
module: 2
position: 1
title: "Single-agent ReAct pattern"
objective: "Build an LLM agent that reasons + acts iteratively."
estimated_minutes: 5
---

# Single-agent ReAct pattern

## ReAct = Reasoning + Acting

Agent pattern: LLM alternates between reasoning (think) and acting (call tools). Iteration until task complete.

For: AI that uses tools (web search, calculator, code exec, APIs) to solve problems.

## Pre-built ReAct agent

LangGraph has built-in:
```python
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o-mini")
tools = [search_tool, calculator_tool]
agent = create_react_agent(model, tools)

result = agent.invoke({"messages": [HumanMessage(content="What's 2025 revenue of NVIDIA?")]})
```

For: instant agent with tools.

## Custom ReAct graph

For control:
```python
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode

graph = StateGraph(MessagesState)
graph.add_node("agent", call_model)
graph.add_node("tools", ToolNode(tools))
graph.add_conditional_edges("agent", should_continue)
graph.add_edge("tools", "agent")
graph.set_entry_point("agent")
app = graph.compile()
```

For: customize behavior.

## Agent components

- **LLM** with bound tools.
- **Tool list.** What agent can call.
- **System prompt.** Agent's role/instructions.
- **Conditional logic.** When to stop.

For: standard agent kit.

## System prompt

For agent identity:
```
You are a research assistant. You have access to web search and calculator tools.
When asked a question:
1. Think about what info you need.
2. Use tools to gather info.
3. Synthesize answer.
4. Cite sources.
```

For: shape agent behavior.

## Termination

When does agent stop?
- LLM produces final answer (no tool calls).
- Max iterations hit.
- Error / timeout.

For: bounded execution.

## Mistakes to avoid

- **No system prompt.** Agent unfocused.
- **Too many tools.** Confused agent.
- **No max iterations.** Infinite loops possible.

## Summary

- ReAct = LLM reasoning + tool acting alternating.
- create_react_agent for quick start.
- Custom graph for control.
- System prompt + tools + termination = agent.

Next: tools and tool calling.
