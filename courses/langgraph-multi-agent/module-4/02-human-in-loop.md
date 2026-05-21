---
module: 4
position: 2
title: "Human-in-the-loop approval"
objective: "Pause agents for human review before critical actions."
estimated_minutes: 5
---

# Human-in-the-loop approval

## Why human-in-the-loop

Some agent actions are too risky for full automation:
- Sending emails.
- Database writes.
- Financial transactions.
- Customer-facing communications.

Pause for human approval before executing.

## Interrupting graphs

```python
from langgraph.types import interrupt

def critical_node(state):
    decision = interrupt({
        "question": "Send this email?",
        "draft": state["email_draft"]
    })
    if decision == "approve":
        send_email(state["email_draft"])
    else:
        # Revise
        ...
```

Graph pauses at interrupt; UI surfaces decision; user approves/rejects; graph resumes.

## Approval pattern

Workflow:
1. Agent prepares action.
2. Interrupt with proposed action.
3. Human reviews via UI.
4. Approve/reject/edit.
5. Resume with decision.

For: high-stakes actions; build trust before full automation.

## Edit + approve

User can modify before approving:
```python
# User edits the draft, then approves
app.update_state(config, {"email_draft": "User-edited version"})
app.invoke(None, config)  # Resume
```

For: collaborative agent-human workflows.

## Selective interrupts

Not every action needs approval:
- High-confidence + low-risk → auto.
- Low-confidence OR high-risk → interrupt.

```python
def should_interrupt(state):
    return state["confidence"] < 0.8 or state["risk"] == "high"
```

For: balanced automation + safety.

## Mistakes to avoid

- **Interrupt everything.** Defeats automation purpose.
- **No interrupt for risky actions.** Disasters.
- **Bad approval UI.** Slow / unclear → users rubber-stamp.

## Summary

- interrupt() pauses graph for human input.
- Approval workflow: prepare → interrupt → user decides → resume.
- Edit + approve for collaborative.
- Selective interrupts based on risk + confidence.

Next: error handling.
