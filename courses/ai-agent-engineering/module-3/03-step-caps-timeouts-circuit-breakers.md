---
module: 3
position: 3
title: "Step caps, timeouts, and circuit breakers"
objective: "Prevent runaway loops and runaway bills."
estimated_minutes: 9
---

# Step caps, timeouts, and circuit breakers

## The puzzle

Agents are loops. Loops can run away. Every "the agent ran overnight and burned $X" incident comes from missing safety controls — step caps, timeouts, or circuit breakers.

This lesson is the safety net. Three layered controls that turn "unbounded loop" into "bounded, observable, recoverable."

## The simple version

Three controls, layered:

1. **Step cap** — maximum loop iterations per run. Hard cap on cost per task.
2. **Timeouts** — per-tool and per-run wall-clock limits. Prevent hung dependencies.
3. **Circuit breakers** — stop the agent (or the whole feature) if errors spike.

Apply all three. Each catches a different failure mode.

## The technical version

### Step caps

Set `maxSteps` on every agent. Pick based on task:

- **Simple agents** (chat, lookup): 5–10.
- **Standard agents** (support, basic automation): 15–20.
- **Research agents** (web search + synthesis): 30–50.
- **Long-horizon autonomous agents**: 100+ — but you also need strong observability and approval gates.

Hitting the cap is an error, not a success. Raise it; route to a fallback (human, simpler response, cached answer).

```js
async function runAgent({ input, maxSteps = 15 }) {
  for (let step = 0; step < maxSteps; step++) {
    // ... loop body ...
  }
  return { status: "step_cap_hit", partial: messages };
}
```

### Per-tool timeouts

A hung tool hangs the agent. Wrap every tool call in a timeout:

```js
async function runToolWithTimeout(name, input, timeoutMs = 30_000) {
  return Promise.race([
    TOOLS[name](input),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TOOL_TIMEOUT")), timeoutMs)
    )
  ]);
}
```

Tune per tool:

- Database / cache lookups: 2–5s.
- Internal API calls: 5–10s.
- External APIs (search, third-party): 15–30s.
- Long computations (image gen, large LLM): 60–120s.

Surface timeouts as actionable errors so the agent can retry or escalate.

### Per-run wall-clock timeout

A run that's spent 5 minutes spinning probably shouldn't continue:

```js
async function runAgent({ input, maxSteps = 15, maxWallClockMs = 5 * 60 * 1000 }) {
  const deadline = Date.now() + maxWallClockMs;

  for (let step = 0; step < maxSteps; step++) {
    if (Date.now() > deadline) {
      return { status: "wall_clock_exceeded", partial: messages };
    }
    // ... loop body ...
  }
}
```

Two-layer protection: step cap bounds calls, wall-clock bounds time. Either limit can trip.

### Circuit breakers

A circuit breaker stops calling a dependency that's failing. Three states:

- **Closed**: normal. Requests flow through.
- **Open**: too many failures recently. Requests fail fast without trying.
- **Half-open**: testing recovery. Limited requests allowed; if they succeed, close the breaker.

Apply circuit breakers to:

- Upstream APIs that occasionally degrade.
- LLM providers (OpenAI, Anthropic) during outages.
- The agent feature itself if production error rate spikes.

Simple breaker shape:

```js
class CircuitBreaker {
  constructor(threshold = 5, windowMs = 60_000, cooldownMs = 30_000) {
    this.failures = [];
    this.threshold = threshold;
    this.windowMs = windowMs;
    this.cooldownMs = cooldownMs;
    this.openUntil = 0;
  }

  async call(fn) {
    if (Date.now() < this.openUntil) {
      throw new Error("CIRCUIT_OPEN");
    }
    try {
      const result = await fn();
      this.failures = [];
      return result;
    } catch (err) {
      this.failures.push(Date.now());
      this.failures = this.failures.filter(t => t > Date.now() - this.windowMs);
      if (this.failures.length >= this.threshold) {
        this.openUntil = Date.now() + this.cooldownMs;
      }
      throw err;
    }
  }
}
```

Real implementations have more — half-open testing, jittered backoff, per-key breakers. Libraries like `opossum` (Node) or `resilience4j` (JVM) handle the details.

### Cost-aware circuit breakers

Beyond errors, you can break on cost:

- **Per-user daily cap**: if a user has spent $X today, stop serving until tomorrow.
- **Per-feature daily cap**: if a feature's cost is over $Y, disable until reset.
- **Per-trace cost cap**: if a single run is going to exceed $Z, abort.

These prevent both abuse and unanticipated cost blow-ups.

### Daily spend caps at the API key level

Anthropic and OpenAI both let you set hard spend caps on API keys via their consoles. Use them. A misconfigured loop can burn through your monthly budget overnight if there's no cap.

This is your last-resort safety net — application-level controls should catch issues earlier, but the API-key cap is the airbag.

### What to do when a limit trips

Plan for each:

- **Step cap hit**: route to human, return partial, or try again with a simpler prompt.
- **Tool timeout**: return structured error; agent may retry with different args or skip.
- **Wall-clock hit**: same as step cap — surface partial, route to fallback.
- **Circuit open**: tell the user the feature is degraded; queue if applicable; alert oncall.
- **Cost cap**: graceful "limit reached" message to the user; alert team.

No limit should be silent. Each should be observable and actionable.

### Layering

Don't rely on one control. Layer them:

```
- Per-tool timeout (30s)
- Step cap (15)
- Wall-clock cap (5 min)
- Error-rate circuit breaker (5 errors in 60s)
- Per-user daily cost cap ($X)
- Per-feature daily cost cap ($Y)
- API key monthly cap ($Z)
```

The first ones catch most issues. The last ones are the airbags for everything else. Together they make "agent ran overnight and burned $X" a story that can't happen.

## Three real-world scenarios

**Scenario 1: The agent that didn't run overnight.**
A team had layered safety controls. A bug introduced a loop that should have run forever. The step cap fired after 15 iterations. Total damage: $0.30. Alert fired. Engineer woke up, fixed it before market open. The bug existed for hours; the cost was negligible.

**Scenario 2: The vendor outage handled gracefully.**
An external API the agent depended on went down. Without circuit breakers, every agent run would call it, time out after 30s, retry, time out, retry — burning latency and tokens. With circuit breakers, the agent quickly skipped the dependency, served degraded results with a clear "feature limited" note, and recovered automatically when the API came back.

**Scenario 3: The unbounded research agent.**
A team built a deep-research agent without a wall-clock cap. A complex query had it running for 45 minutes, generating dozens of tool calls. They added a 10-minute cap. Edge case bounded; users get a "research timeout — here's what I found so far" path.

## Common mistakes to avoid

- **No step cap.** Inevitable runaway eventually.
- **One step cap fits all.** Tune per task.
- **No per-tool timeouts.** Hung tool = hung agent.
- **No circuit breakers on external deps.** Outages cascade through your agent.
- **No cost caps.** Surprise bills.
- **Silent limit hits.** Users see nothing; team doesn't know.

## Read more

- [Anthropic — building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- [Circuit breaker pattern (Microsoft)](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)
- [Resilience4j](https://resilience4j.readme.io/)

## Summary

- **Step cap**: max iterations per run. Different limits for different task types.
- **Per-tool timeouts**: prevent hung dependencies from hanging the agent.
- **Wall-clock cap** on the whole run: catches the cases step cap misses.
- **Circuit breakers** on external deps and on agent-level error rates.
- **Cost caps** at user/feature/API-key levels: airbag for the unexpected.
- **No limit should be silent** — each needs an observable, actionable outcome.

Next: streaming agents to the user — UX patterns.
