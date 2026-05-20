---
module: 5
position: 3
title: "Cost monitoring and the long tail of agent runs"
objective: "Catch agent cost regressions before they become incidents."
estimated_minutes: 9
---

# Cost monitoring and the long tail of agent runs

## The puzzle

Your agent's average cost is $0.05 per run. The bill comes in 3× expected. You dig in: 1% of runs are costing $5 each. The mean is fine; the tail is destroying you.

Agents amplify whatever cost behavior they have. Average is the wrong number. The tail is where production AI costs actually live.

## The simple version

For agent cost:

1. **Track p50, p95, p99 per run** — not just average.
2. **Alert on tail growth** — p95 doubling matters even if average is steady.
3. **Cap costs per user, per feature, per API key**.
4. **Surface "expensive run" investigations** — every run over $X gets reviewed.
5. **Use Haiku/mini-tier where possible** — model choice dominates cost.

The averages lie. The tails are what get you.

## The technical version

### The distribution shape

Real agent runs look roughly like:

- **Most runs** (p50): 3-5 steps, normal complexity, $0.02-$0.05.
- **Frequent runs** (p90): 6-8 steps, slightly more complex, $0.10-$0.20.
- **Tail (p99)**: 15+ steps, edge cases, dependency retries, $1-$5.

The tail is small in count but can dominate the bill. A 1% tail at $3/run is the same total as 99% at $0.03/run.

### What to measure

Per-run metrics:

- Total tokens (input + output + cached + reasoning).
- Total cost in dollars (cents per run; sum daily).
- Step count.
- Per-step cost (the most expensive step is often the culprit).
- Per-tool cost.
- Latency.

Roll up:

- p50, p95, p99 per metric per feature per day.
- Top 10 most expensive traces per day (for investigation).
- Cost per user (alerting on outliers).
- Cost per feature trend over time.

### Why averages mislead

Day 1: 99% runs at $0.03, 1% at $0.30. Average: $0.033.

Day 2: 99% runs at $0.03, 1% at $3.00. Average: $0.060.

Average doubled. But it looks like "a small price increase." Actually a 10× tail explosion that ate 100× the marginal cost. Without p99 visibility, you'd treat this as noise.

### Per-step cost surfacing

When a trace is expensive, decompose:

```
Trace abc123: $1.20
  Step 1: $0.02 (model call)
  Step 2: $0.03 (tool: lookup_customer)
  Step 3: $0.95 (model call — 8K token history!)
  Step 4: $0.05 (tool: send_email)
  Step 5: $0.15 (model call)
```

One step is dominating. Find why: oversized prompt, missed cache, runaway compaction failure. Fix that step, not the whole agent.

### Common cost drivers

- **No prompt caching on stable system / tool defs.** The biggest cost driver — and the easiest fix.
- **No compaction on long conversations.** History balloons, every turn pays for it.
- **Always-Opus.** Big spend for marginal gain on most turns.
- **Retries amplifying cost.** A flaky upstream + 3 retries = 4× the calls.
- **Forgotten max_tokens.** One verbose response per run averages out the bill upward.
- **Multi-agent overhead.** Each agent doubles or triples the per-task token count.

### Caps and circuit breakers

Beyond observability, hard caps:

- **Per-run cost cap**: abort if a single run exceeds $X. Surface "too expensive" to user.
- **Per-user daily cap**: throttle when a user hits limit.
- **Per-feature daily cap**: disable when feature spend exceeds budget.
- **API-key spend cap**: last-resort airbag.

These prevent the 1% tail from becoming an incident.

### Alerting on cost regressions

Two patterns:

**Absolute thresholds**: alert if daily total > $X, or p95 per run > $Y.

**Relative drift**: alert if daily total is 50% above 7-day median, or p95 has moved 2× in 24 hours.

Drift alerts catch silent regressions (prompt change kills cache, model swap raised per-token cost). Absolute alerts catch incidents (runaway loop, abuse).

Use both.

### Cost attribution

Roll up cost by:

- **User** — heavy users vs. average.
- **Feature** — which routes dominate spend.
- **Tool** — which tools are expensive (web search >> DB lookups).
- **Model** — Opus calls vs. Sonnet calls vs. Haiku calls.

Without attribution, you can't prioritize cost work. With it, you know exactly where to focus.

### The "investigate every $1+ run" rule

For any user-facing agent, set a threshold (could be $1, could be $0.50) and look at every run over it. Patterns:

- "This user is asking very complex questions" — fine, expected.
- "This run hit the step cap repeatedly" — bug, fix it.
- "This run kept retrying a flaky tool" — fix the tool or back off harder.
- "This run had no caching for some reason" — cache regression, fix.

After a few weeks of investigations, you'll see the patterns. They'll inform where to invest engineering.

### Long-running tasks vs. agents

If your agent is *legitimately* expensive (deep research, autonomous coding, long-horizon planning), set user expectations:

- "This research will take 60-120 seconds and cost approximately $X. Continue?"
- Token-credit system that bills users by actual cost.
- Premium tier for power features.

You can't make expensive tasks cheap. You can make their cost transparent.

## Three real-world scenarios

**Scenario 1: The 1% tail.**
A team's agent averaged $0.04/run. They didn't watch p99. Over time, a small fraction of edge cases ran longer and longer, eventually hitting $5/run. By the time anyone noticed, the tail was 60% of the bill. p99 alerting would have caught it weeks earlier.

**Scenario 2: The caching regression.**
A prompt change introduced a timestamp into the system prompt. Cache hit rate dropped to 0%. Per-call cost went from $0.005 to $0.05 on cached portions. Daily total quadrupled. Caught by a cost-drift alert within 6 hours; rolled back.

**Scenario 3: The expensive feature that paid for itself.**
A research agent cost $0.80/run. The team almost killed it. Then they tracked cost per user and saw 12% of users were running it 3× a week with measurable productivity gains. They surfaced cost in the UI, added a credit system, and the feature became revenue-positive. Lesson: expensive isn't always wrong — but you need attribution to know.

## Common mistakes to avoid

- **Averaging only.** Tails hide.
- **No per-feature cost attribution.** Can't prioritize.
- **No drift alerts.** Silent regressions ship for weeks.
- **Reactive caps.** Setting caps after an incident, not before.
- **Treating expensive runs as bugs.** Some are legitimate; investigate to know.
- **No user-facing cost transparency on expensive features.** Surprise bills for users too.

## Read more

- [Anthropic — prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [OpenAI — cost optimization](https://platform.openai.com/docs/guides/cost-optimization)

## Summary

- **Track p50, p95, p99**, not just average. The tail dominates the bill.
- **Per-step cost decomposition** localizes the expensive operation.
- **Caps at user / feature / API-key levels**. Airbag for unanticipated spend.
- **Alert on drift** (silent regressions) and absolute thresholds (incidents).
- **Attribute cost by user, feature, tool, model** to prioritize work.
- **Investigate every $1+ run** until patterns stabilize.
- **Make expensive features transparent** — credit systems, expectation-setting.

Next: the agent launch checklist.
