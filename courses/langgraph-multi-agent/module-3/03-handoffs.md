---
module: 3
position: 3
title: "Agent-to-agent handoffs"
objective: "Agents pass work to each other peer-to-peer."
estimated_minutes: 5
---

# Agent-to-agent handoffs

## Handoff pattern

Without supervisor — peers transfer control directly:
- Customer support agent receives query.
- Realizes it's billing-related.
- Hands off to billing agent.
- Billing agent completes; hands back if needed.

For: dynamic peer-to-peer collaboration.

## Implementing handoffs

Each agent has tools to transfer:
```python
@tool
def transfer_to_billing(reason: str) -> str:
    """Transfer to billing specialist when query is billing-related."""
    return f"Transferring to billing: {reason}"
```

Agent calls this tool → graph routes to billing agent.

## LangGraph swarm

Library extension for peer-to-peer:
```python
from langgraph_swarm import create_swarm

agents = [agent_a, agent_b, agent_c]
swarm = create_swarm(agents, default_active_agent="agent_a")
```

Agents share state; one is "active" at a time; handoffs change active.

For: flat peer-to-peer multi-agent.

## When use peer vs. supervisor

**Supervisor.** Clear hierarchy; supervisor knows best routing.

**Peer-to-peer.** Specialists know their domain better than supervisor would.

For: domain expertise > centralized routing.

## State during handoffs

What passes:
- Conversation history (usually full).
- Active agent (current owner).
- Optionally: context summary from handoff-er.

For: receiving agent has context.

## Common patterns

**Customer support:**
- Triage agent → specialist (billing / tech / sales) → back to triage if needed.

**Coding:**
- Architect → coder → tester → coder → reviewer.

**Research:**
- Search agent → analysis agent → writer → search again if needed.

For: domain-driven workflows.

## Mistakes to avoid

- **Handoff loops.** Agent A → B → A → B forever.
- **Lost context.** New agent missing critical info.
- **Too eager handoffs.** Agent transfers everything; never solves anything.

## Summary

- Peer-to-peer handoffs via transfer tools.
- LangGraph Swarm for flat multi-agent.
- Specialists know their domain; supervisor unnecessary.
- Share state; track active agent.
- Avoid loops + context loss.

Next: parallel + sequential workflows.
