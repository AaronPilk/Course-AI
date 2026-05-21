---
module: 5
position: 4
title: "Deployment with LangGraph Platform"
objective: "Ship LangGraph agents to production."
estimated_minutes: 5
---

# Deployment with LangGraph Platform

## LangGraph Platform

LangChain's managed hosting for LangGraph agents:
- One-click deploy.
- Auto-scaling.
- Built-in checkpointing.
- LangSmith integration.
- API + UI.

For: production LangGraph without managing infra.

## Self-hosting options

- **Docker container.** Run LangGraph as web service.
- **AWS Lambda / Cloud Run.** Serverless.
- **Kubernetes.** For scale.
- **FastAPI wrapper.** Custom API.

For: control + cost optimization.

## FastAPI deployment

```python
from fastapi import FastAPI
app_api = FastAPI()

@app_api.post("/chat")
async def chat(thread_id: str, message: str):
    config = {"configurable": {"thread_id": thread_id}}
    response = await app.ainvoke({"messages": [HumanMessage(message)]}, config)
    return {"response": response["messages"][-1].content}
```

Deploy via Docker → AWS ECS / Cloud Run / Render.

## Streaming endpoint

```python
@app_api.post("/chat/stream")
async def chat_stream(thread_id: str, message: str):
    async def event_stream():
        async for event in app.astream(...):
            yield f"data: {json.dumps(event)}\n\n"
    return EventSourceResponse(event_stream())
```

For: real-time UX via Server-Sent Events.

## Authentication

For production:
- API keys.
- OAuth.
- JWT tokens.

Per-user thread_ids; data isolation.

## Rate limiting

For abuse prevention:
- Per-user QPS limits.
- Total cost budgets.
- Token quotas.

## Multi-region

For latency:
- Deploy in regions near users.
- Distribute checkpointer DB (cross-region replication).
- Load balancer routes to nearest.

## Monitoring + alerting

- LangSmith for traces.
- Datadog / Prometheus for infrastructure.
- Cost monitoring.
- Alerting on errors / latency / cost.

## Versioning

For safe rollouts:
- Versioned graph definitions.
- Canary deployments.
- Rollback ready.

## Cost considerations

LangGraph Platform pricing: per-invocation + storage.
Self-hosted: infra cost + LangSmith for tracing.

For small-medium: Platform simpler.
For high volume: self-host often cheaper.

## Mistakes to avoid

- **No streaming endpoint.** Bad UX.
- **No rate limiting.** Cost / abuse risk.
- **No multi-region for global.** High latency.
- **No monitoring.** Blind to issues.

## Summary

- LangGraph Platform for managed hosting.
- FastAPI for custom; Docker → AWS / GCP / Render.
- Streaming endpoint, auth, rate limiting.
- LangSmith for observability.
- Multi-region for global.

## Course complete

You've covered LangGraph end-to-end. Build agents that reason, use tools, collaborate, persist, and ship to production. Next steps: build a small agent in your domain (research, support, automation); deploy to LangGraph Platform or your stack; iterate based on real usage. The agent paradigm is the AI architecture of 2026; LangGraph is the production-grade open framework.
