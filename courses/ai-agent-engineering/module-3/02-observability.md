---
module: 3
position: 2
title: "Observability — tracing, logging, debugging multi-step systems"
objective: "Make agent runs debuggable in production."
estimated_minutes: 11
---

# Observability — tracing, logging, debugging multi-step systems

## The puzzle

A user reports: "The agent did something weird yesterday around 2pm."

Without observability, you have nothing. With it, you pull up the trace, see every model call, every tool call, every retry, every approval, and within five minutes you know what happened and why.

Agents without observability are unmaintainable. This lesson is the bare-minimum logging and tracing you need to ship.

## The simple version

Every agent run needs:

1. A **trace ID** that follows the run end-to-end.
2. A **log per model call** — prompt, response, tokens, latency, stop reason.
3. A **log per tool call** — name, args, result, error, latency.
4. A **persistent store** of traces (database, log aggregator, dedicated tool).
5. A **UI to inspect** traces — even a simple one beats nothing.

Without these, you debug by re-running and praying. With them, you debug by reading.

## The technical version

### The trace data model

A trace is a tree of events tied to one agent run:

```
trace {
  id: "trace_abc123",
  user_id: "u_456",
  started_at: "2026-05-19T14:02:11Z",
  ended_at: "2026-05-19T14:02:38Z",
  status: "completed" | "errored" | "step_cap_hit",
  steps: [
    {
      type: "model_call",
      latency_ms: 1240,
      input_tokens: 850,
      output_tokens: 230,
      stop_reason: "tool_use",
      content_summary: "...",
    },
    {
      type: "tool_call",
      tool_name: "lookup_customer",
      args: { email: "..." },
      latency_ms: 180,
      result_summary: "...",
      error: null,
    },
    ...
  ],
  total_input_tokens: 4200,
  total_output_tokens: 980,
  total_cost_usd: 0.034,
}
```

Each step is timestamped, sized, and contextual. Store them in a database where you can query by user, time, status, cost.

### Trace propagation

The trace ID is set once at the start of a request and threaded through every model call and tool call:

```js
async function runAgent(input, { traceId = uuid() } = {}) {
  logger.info({ event: "agent_start", traceId, input });

  // ... loop ...

  for (const toolCall of toolCalls) {
    await runTool(toolCall.name, toolCall.args, { traceId });
  }
}

async function runTool(name, args, { traceId }) {
  const start = Date.now();
  logger.info({ event: "tool_call_start", traceId, tool: name, args });
  try {
    const result = await TOOLS[name](args);
    logger.info({
      event: "tool_call_end",
      traceId,
      tool: name,
      latency: Date.now() - start
    });
    return result;
  } catch (err) {
    logger.error({ event: "tool_call_error", traceId, tool: name, error: err.message });
    throw err;
  }
}
```

Every log line carries the trace ID. Querying by trace ID assembles the full picture.

### What to log

Per model call:

- Model name and version.
- System prompt (or hash if PII-sensitive).
- Messages (or hash for sensitive content).
- Tools available.
- Response: text content, tool calls.
- Stop reason.
- Usage: input tokens, output tokens, cache reads/writes.
- Latency.

Per tool call:

- Tool name.
- Args.
- Result (size and shape; full payload if not sensitive).
- Error code and message (if errored).
- Latency.
- Approval status (if gated).
- Idempotency key (if used).

Per agent run:

- Start/end times.
- User ID (or anonymous bucket).
- Final status.
- Total tokens and cost.
- Step count.
- Inputs and final output.

### Don't log secrets

Even if input contains an API key, password, or PII, don't log it raw. Patterns:

- **Hash** sensitive fields before logging.
- **Mask** with placeholders (`<email>`, `<phone>`).
- **Whitelist** what's safe to log; drop everything else.
- **Encrypt at rest** for sensitive logs that must be kept.

The fastest path to a security incident is "we logged everything for debugging and forgot."

### Trace storage options

Several patterns:

**Postgres / your database**: tables for traces and steps. Query with SQL. Custom UI. Highest control; most work.

**OpenTelemetry**: standard tracing protocol. Spans become traces; export to Jaeger, Honeycomb, Datadog, etc. Standardized; integrates with existing observability infrastructure.

**Dedicated AI observability tools**: LangSmith, Helicone, Phoenix (Arize), Weights & Biases, Braintrust, etc. These specialize in LLM traces with first-class understanding of prompts, completions, tool calls.

For a small team starting out, pick the simplest option (database table or LangSmith-style hosted) and move when you outgrow it.

### Cost as a first-class metric

Track per-trace cost. Roll up:

- Cost per user per day.
- Cost per feature per day.
- Cost per "completed task" if that maps cleanly.

Surface anomalies:

- p95 / p99 cost per trace (a few traces can dominate the bill).
- Cost trend over time (drift up after a prompt change is a signal).

The single most expensive production AI incidents are runaway loops that drained budgets while nobody was looking. Cost dashboards catch them in hours, not weeks.

### Replaying traces

A trace should be enough to re-run the agent:

- Same input.
- Same model + version.
- Same tools.
- Same system prompt.

Build a "replay" function. When you investigate a weird trace, you can re-run it locally with a tweaked prompt or different model and see if the issue reproduces. Invaluable for debugging.

### Dashboards

What you want on your operational dashboard:

- **Runs per minute** by feature.
- **Error rate** (failed runs, tool errors).
- **p50/p95/p99 latency** per agent.
- **Cost per day** with breakdown by model.
- **Eval pass rate** on production samples (Lesson 5.1).
- **User feedback** (thumbs up/down per response).

Set alerts on the ones that catch incidents: error rate spikes, latency spikes, cost spikes, eval drops.

### Observability vs. privacy

Sensitive data complicates things. Patterns:

- **Tiered retention**: detailed traces for 7 days; summarized after.
- **Hashing**: keep statistical signal without raw PII.
- **Sampling**: full trace for 1–10%; metadata only for the rest.
- **User opt-in** for full detailed traces.

For high-regulation industries (health, finance), consult legal before deciding what to log.

## Three real-world scenarios

**Scenario 1: The debug session that took 5 minutes.**
A user reported strange agent behavior. The team pulled the trace by user ID + timestamp, read the steps, saw an unexpected tool selection, wrote an eval case, fixed the description, deployed. Total time from report to fix: under an hour. Without traces: hours of guessing.

**Scenario 2: The cost spike caught early.**
A prompt change accidentally disabled prompt caching (variable timestamp slipped in). Per-call cost doubled. The cost dashboard alerted within 2 hours. Rolled back. Total damage: $40, not $4,000.

**Scenario 3: The PII logging incident.**
A team logged full conversation content for debugging. Customer data ended up in logs accessible to a wider team. Quick remediation, but better practice was to log hashes or whitelisted fields from the start. Always design for the post-incident question: "what would have made this worse?"

## Common mistakes to avoid

- **No trace ID** propagation. You can't reconstruct runs.
- **Logging only on error.** Successful runs hold most of the diagnostic value.
- **Raw PII in logs.** Security incident waiting.
- **No cost dashboard.** Surprise bills.
- **No replay.** Debugging is re-running blindly.
- **Logs without retention policy.** Disk fills up or compliance dings you.

## Read more

- [OpenTelemetry semantic conventions for AI](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- [LangSmith documentation](https://docs.smith.langchain.com/)
- [Honeycomb on tracing](https://www.honeycomb.io/blog/learning-distributed-tracing)

## Summary

- **Trace IDs** thread every model call and tool call together.
- **Log** model calls (prompt, response, tokens, latency) and tool calls (name, args, result, error, latency).
- **Persist** to a database, OpenTelemetry backend, or dedicated AI observability tool.
- **Track cost as a first-class metric**, with p95/p99 visibility and alerts on drift.
- **Replay** traces for fast debugging — same input, same setup.
- **Mask or hash PII** — never log raw secrets.
- Without observability, agents are unmaintainable. Invest before scale, not after.

Next: step caps, timeouts, and circuit breakers.
