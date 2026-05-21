---
module: 3
position: 2
title: "Hierarchical agent teams"
objective: "Compose supervisors recursively for complex tasks."
estimated_minutes: 5
---

# Hierarchical agent teams

## What hierarchical means

Top-level supervisor → mid-level supervisors → specialist agents.

Example:
- **CEO supervisor.** Top-level routing.
  - **Research team supervisor.** Routes within research.
    - Web researcher.
    - Document researcher.
    - Expert interview agent.
  - **Writing team supervisor.**
    - Content writer.
    - Editor.
  - **Review team supervisor.**
    - Fact checker.
    - Style reviewer.

For: very complex tasks with many specialists.

## Why hierarchical

Flat structure (one supervisor + 20 specialists):
- Supervisor decides between 20 options — error-prone.
- Long context to evaluate.

Hierarchical (supervisor + 3 sub-supervisors with 5 specialists each):
- Each level decides among 3-5 options.
- Cleaner decision-making.

For: scaling agent count beyond ~10.

## Building it

Each sub-team is its own compiled graph; treated as a "node" in parent.

```python
# Sub-team: research team
research_team = build_research_team_graph()  # Sub-graph

# Top-level
top_graph.add_node("research_team", research_team)
```

LangGraph supports composing graphs.

## State sharing

Decide what propagates:
- **Full state.** All info to all.
- **Filtered.** Sub-team sees only relevant slice.
- **Returned summary.** Sub-team returns just result.

Filtered + summary common; reduces context bloat.

## Mistakes to avoid

- **Too deep hierarchy.** Bureaucracy; slow.
- **State leak.** Sub-teams confused by irrelevant info.
- **No clear top-level direction.** All levels confused.

## Summary

- Hierarchical = supervisors of supervisors.
- For very complex multi-skill tasks.
- Compose sub-graphs as nodes.
- Filter state passed between levels.

Next: agent handoffs.
