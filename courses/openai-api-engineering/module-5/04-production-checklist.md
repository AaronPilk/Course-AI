---
module: 5
position: 4
title: "The production checklist — going from prototype to live system"
objective: "Walk a working prototype through every step needed to ship it as a reliable, observable, safe production AI feature."
estimated_minutes: 14
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# The production checklist — going from prototype to live system

## The puzzle

You've built an AI feature. It works in development. The team is excited. The PM wants to ship it next week.

There's a gap between "works on my laptop" and "works for 10,000 users, every day, without paging anyone at 3am." That gap isn't filled by a bigger model or a better prompt — it's filled by the unglamorous engineering work this whole course has been pointing at.

This is the production checklist. The questions you should be able to answer before flipping the launch flag.

## The simple version

A production-ready AI feature has:

1. An **eval suite** that runs before every change and catches regressions.
2. **Observability**: per-request logs, per-step traces, per-day cost rollups.
3. **Cost controls**: per-user and per-day limits, alerting on overruns.
4. **Safety controls**: moderation on inputs and outputs, guardrails on tool use, approvals on irreversible actions.
5. **Rate limit and error handling**: retries, backoff, graceful fallback.
6. **A rollback plan**: feature flags, gradual rollout, monitoring during ramp.
7. **A human-in-the-loop path**: when things go wrong, the user can escalate.
8. **An on-call playbook**: what to do when alerts fire.

If you can't check every box, you can ship — but understand what you're shipping. Almost every "AI launch went badly" story is one of these boxes unchecked.

## The technical version

### The full checklist

The rest of this lesson is the checklist itself, expanded. Read it once, then come back to it before each launch.

### 1. Evals

- [ ] **Eval suite exists** with at least 50 cases covering happy paths, edge cases, adversarial inputs, and known past bugs.
- [ ] **Pass rate target defined** (e.g. 90% on the suite).
- [ ] **Evals run in CI** on every prompt or pipeline change.
- [ ] **Production traffic sampled and graded** at least daily.
- [ ] **Every fixed bug leaves a regression case** in the eval set.

Why it matters: without evals, every change is a leap of faith. With them, you ship with confidence and rollback with evidence.

### 2. Observability

- [ ] **Per-request logging**: input, output, model used, tokens used, latency, cost, user ID.
- [ ] **Per-step tracing** for multi-step workflows: each tool call, retry, error logged with a shared trace ID.
- [ ] **Latency metrics**: p50, p95, p99 — not just averages.
- [ ] **Cost dashboard**: rolled up per day, per feature, per user.
- [ ] **Quality metrics**: eval pass rate over time, user thumbs-up rate, escalation rate.
- [ ] **Logs retention** that meets your compliance and debugging needs (typically 30–90 days for AI workloads).

Why it matters: when something breaks in production, you have minutes to diagnose it. Logs and traces are the difference between fixing in 5 minutes and fixing in 5 hours.

### 3. Cost controls

- [ ] **Per-request cost estimated** before shipping (rough order of magnitude).
- [ ] **Daily spend cap** on the API key.
- [ ] **Per-user usage limits** in your application.
- [ ] **Alerts** for daily cost > threshold, weekly cost growth > X%.
- [ ] **Cost regression checks**: if a prompt change increases tokens by 30%, flag it.
- [ ] **Caching, compaction, and batch API** considered for the workload.

Why it matters: AI bills surprise people. A misconfigured loop or runaway prompt can burn thousands of dollars overnight. Limits and alerts catch this within hours, not weeks.

### 4. Safety

- [ ] **Input moderation** (text and images, where applicable) on user-supplied content.
- [ ] **Output moderation** on model outputs going to users.
- [ ] **System prompt hardening** against prompt injection (Module 3.5).
- [ ] **Approval gates** on irreversible tool calls (refund, delete, send, transfer).
- [ ] **Audit log** for every tool call that changes external state.
- [ ] **Refusal patterns** for out-of-scope or harmful requests.
- [ ] **No secrets in prompts**: API keys, tokens, internal URLs never sent to the model.

Why it matters: AI features are a new attack surface. Prompt injection, social engineering, accidental data exposure are real. Build defenses in from day one.

### 5. Rate limits and error handling

- [ ] **Retry with exponential backoff** on 429s and 5xx errors.
- [ ] **Circuit breaker**: if errors spike, stop calling and fall back.
- [ ] **Timeouts on every request** so a hung call doesn't hang your service.
- [ ] **Graceful degradation**: if the AI feature fails, the rest of the app keeps working.
- [ ] **Streaming error handling**: clients handle partial outputs and disconnects.
- [ ] **Rate limit headers monitored** so you can request quota increases proactively.

Why it matters: the API will rate-limit you. It will have occasional outages. Your job is to make those moments invisible to users.

### 6. Rollback plan

- [ ] **Feature flag** wrapping the AI feature.
- [ ] **Gradual rollout**: 1% → 10% → 50% → 100%, watching metrics at each step.
- [ ] **One-click disable** if metrics regress.
- [ ] **Model version pinned** (don't use auto-updating model strings in production).
- [ ] **Prompt version pinned** in a stored configuration; changes go through code review.
- [ ] **Plan for what to do if OpenAI has an outage**: queue, fall back, fail open or closed.

Why it matters: you will ship something that goes wrong. Rolling back fast prevents a small problem from becoming a customer-trust problem.

### 7. Human-in-the-loop

- [ ] **Users can flag bad outputs** ("This isn't right" button).
- [ ] **Users can escalate to a human** (live chat handoff, ticket creation).
- [ ] **Users can override the AI** (cancel an action, request a redo).
- [ ] **Internal queue for human review** of flagged outputs or low-confidence cases.
- [ ] **Feedback loop**: flagged cases become training data or eval cases.

Why it matters: AI is probabilistic. It will be wrong. The product must give users a path forward when that happens.

### 8. Documentation and on-call

- [ ] **Runbook** for the feature: what it does, what tools it calls, what to check when it breaks.
- [ ] **Common failure modes documented** with steps to diagnose and resolve.
- [ ] **On-call playbook**: who gets paged, what they do, when to escalate.
- [ ] **Architecture diagram** showing data flow, models, tools, external dependencies.
- [ ] **Stakeholder summary**: what the feature does, what it doesn't, what risks it carries.

Why it matters: the person debugging at 3am may not be the person who built it. Documentation is what keeps the system maintainable through team changes.

### 9. Data and privacy

- [ ] **PII handling reviewed**: what user data goes to the model, what's logged, what's stored.
- [ ] **Data retention policy** for prompts and outputs.
- [ ] **OpenAI data settings configured** to opt out of training (zero-data-retention if needed).
- [ ] **Regional residency** considered if you have EU or other regulated users.
- [ ] **Right-to-delete plumbing** for compliance with user data requests.
- [ ] **Compliance review** if your industry requires it (healthcare, finance, government).

Why it matters: AI data flows are sensitive. A bug that leaks one user's data to another via prompt context is a major incident.

### 10. Performance under load

- [ ] **Load tested** at expected peak traffic.
- [ ] **Latency holds** under load (p95 doesn't blow up at 5× traffic).
- [ ] **Cost projection** at expected scale isn't shocking.
- [ ] **Backpressure plan** for traffic spikes (queueing, throttling).
- [ ] **Multi-region deployment** considered for latency-sensitive global features.

Why it matters: launches drive traffic spikes. A feature that works at 10 RPS and falls over at 100 RPS will fail at launch.

### 11. Launch process

- [ ] **Internal dogfooding** for at least a week before user rollout.
- [ ] **Beta cohort** (1–10% of users) for at least a week.
- [ ] **Quality metrics dashboard** watched daily during ramp.
- [ ] **Rollback rehearsal**: someone has tested the one-click disable.
- [ ] **Comms plan**: what users see, what support reps know, what marketing says.
- [ ] **Launch post-mortem scheduled** for 30 days post-launch to capture lessons.

Why it matters: rushed launches skip these and the cost shows up later. Disciplined launches catch problems before customers do.

### Quick triage when something goes wrong

When the feature misbehaves in production, work through:

1. **Is it the model?** Check OpenAI status. Try a different model version.
2. **Is it the prompt?** Did anything change recently? Check version control.
3. **Is it the input?** Look at the failing requests. Is there a pattern (length, language, content type)?
4. **Is it the data?** RAG retrieving wrong docs? Tool returning bad results?
5. **Is it the user?** Adversarial input? Edge case the eval missed?
6. **Is it the integration?** Network issue, timeout, rate limit, downstream service?
7. **Is it new?** Did volume change? Did a dependency change?

Most production AI bugs are one of these seven. A trace ID and a few logged samples usually tells you which.

### The minimum bar

If you can only do five things from this list, do these:

1. **Eval suite** with at least 30 cases.
2. **Per-request logging** with input, output, tokens, cost.
3. **Daily spend cap** on the API key.
4. **Feature flag** with one-click disable.
5. **Approval gates** on any tool call that touches money, sends communication, or deletes data.

These five catch maybe 90% of production AI disasters. Everything else on the list is hardening for the long tail.

## An analogy: launching a restaurant

A new restaurant has a great chef and great recipes. That's not enough.

You also need: a clean kitchen that passes inspection, a POS system that works, a reservation flow, a refund process when a steak is wrong, staff training, a phone that someone answers, a way to handle the night the line cooks call in sick.

The recipe is the prompt. The food is the model output. The everything else is the production checklist.

Restaurants without those systems don't make it past month two. Neither do AI features without theirs. The prompt is the easy part. The hard part is everything that makes the prompt safe, observable, affordable, and maintainable.

## Three real-world scenarios

**Scenario 1: The launch that went smoothly.**
A team launched an AI summarization feature with a full checklist: 80-case eval suite, per-request logging with trace IDs, $500/day cap, feature flag with 1%-10%-100% rollout, fallback to "no summary" if the API failed. Day 1 ran fine. Day 3 they spotted a 2× cost spike from longer inputs than expected — caught it via the daily alert, capped output tokens, cost normalized. Nobody outside the team noticed.

**Scenario 2: The launch that didn't.**
A team shipped a customer support assistant with no eval, no cost cap, no feature flag. Day 1, the assistant started refusing benign requests because of a flaw in the system prompt. By the time they noticed (afternoon, from customer complaints), thousands of users had a bad experience. They rolled back via a code push, took 3 hours. Net cost: a brand-tarnishing day of bad support and a postmortem the CEO read.

**Scenario 3: The cost surprise.**
A team launched an agent feature in beta. No per-day spend cap. A test script with an infinite loop hit production. By morning, the bill was $11,000 (vs. $200 expected). They paid it, added daily caps and circuit breakers, and never made the mistake again. The lesson cost more than the feature.

## Common mistakes to avoid

- **Shipping without evals.** Every change is a leap of faith. Regressions ship silently.
- **No cost controls.** Bills surprise founders.
- **No feature flag.** Rollbacks require a deploy under pressure.
- **No moderation on user inputs.** Prompt injection and abuse take hold.
- **No human escalation.** When the AI is wrong, users have no recourse.
- **Auto-updating model strings in production.** New model versions can quietly change behavior.
- **No load test.** Launch traffic kills the feature.

## Read more

- [Production best practices](https://platform.openai.com/docs/guides/production-best-practices)
- [Safety best practices](https://platform.openai.com/docs/guides/safety-best-practices)
- [Rate limits](https://platform.openai.com/docs/guides/rate-limits)
- [Data usage policies](https://openai.com/policies/api-data-usage-policies)

## Summary

- A **production-ready AI feature** is more than a great prompt. It needs evals, observability, cost controls, safety, error handling, rollback paths, human escalation, and on-call docs.
- The **minimum bar** before launch: eval suite, per-request logging, daily spend cap, feature flag, approval gates on risky tools.
- **Gradual rollout** (1% → 10% → 100%) catches problems before they hit everyone.
- **Pin model and prompt versions** — don't let auto-updating change behavior silently.
- **Document failure modes and on-call playbooks** for the team that will maintain the system after you.
- **Audit and revisit** post-launch — most lessons surface in the first month live.

## You finished the course

You now have the full OpenAI API engineering stack: how models work, how to call them, when to use which capability, how to build agents and tools, how to handle state and performance, and how to ship to production safely.

The five modules:

1. **Foundations** — what GPT-5 is, the API surface, model selection, tokens and cost.
2. **Core capabilities** — prompting, structured output, function calling, embeddings, multimodal.
3. **Agents and tools** — agent loops, the Agents SDK, tool patterns, MCP, guardrails.
4. **State, performance, evaluation** — streaming, caching, compaction, evals, tradeoffs.
5. **Production polish** — fine-tuning, reasoning models, advanced workflows, the launch checklist.

Most production OpenAI products are built from exactly these primitives. The differentiation isn't in any single component — it's in how you combine them, the constraints you respect, and the discipline you bring to ops.

Now go build something. And when you launch, walk the checklist.
