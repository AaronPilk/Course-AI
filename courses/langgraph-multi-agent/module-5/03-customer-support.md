---
module: 5
position: 3
title: "Customer support agent"
objective: "Build production customer service AI."
estimated_minutes: 5
---

# Customer support agent

## Architecture

Nodes:
1. **Triage.** Classify query (billing, technical, sales, general).
2. **Specialist.** Domain-specific agent handles.
3. **Tool use.** Lookup customer data, order status, KB articles.
4. **Resolution.** Provide answer.
5. **Escalation.** Human handoff if uncertain.

## Tools

- CRM lookup (customer info).
- Order status API.
- Knowledge base search.
- Ticket creation.
- Refund processing (with human approval).

## Conversation state

```python
class SupportState(TypedDict):
    messages: Annotated[list, add_messages]
    customer_id: str
    issue_type: str
    resolution: str
    escalated: bool
```

## Triage prompt

```
Classify this customer query:
- billing
- technical
- sales
- general

Query: {message}
```

Routes to appropriate specialist.

## RAG over docs

Knowledge base via vector search:
```python
def kb_lookup(query):
    results = vector_db.search(query)
    return results
```

For: factual answers from your support docs.

## Escalation pattern

When agent can't resolve:
- Confidence < threshold.
- Customer frustrated.
- Complex / unique issue.
- Specific keywords ("speak to human").

→ Interrupt, hand to human agent.

## Persistence

Each customer = thread_id. Conversations persist across sessions.

## Logging + analytics

Track:
- Resolution rate.
- Escalation rate.
- Common queries.
- Quality metrics.

For: improve agent + identify automation opportunities.

## Real production

Inspired by Intercom Fin, Zendesk AI, etc.

## Mistakes to avoid

- **No escalation path.** Frustrated customers.
- **Over-confidence.** Wrong info given confidently.
- **No persistence.** Customer re-explains each contact.

## Summary

- Triage → specialist → tools → resolution / escalation.
- RAG over KB; CRM tools.
- Persistence per customer.
- Escalation when uncertain.

Next: deployment with LangGraph Platform.
