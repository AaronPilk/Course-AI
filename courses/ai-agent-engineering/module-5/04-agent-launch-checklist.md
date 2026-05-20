---
module: 5
position: 4
title: "The agent launch checklist — from prototype to live system"
objective: "Walk the full pre-launch checklist for any agent."
estimated_minutes: 12
---

# The agent launch checklist — from prototype to live system

## The puzzle

Your agent works in development. The team is excited. The PM wants to ship.

What separates "works in dev" from "works for 10,000 users every day for a year without a 3am page"? The checklist below.

## The simple version

A production-ready agent has:

1. **Capability scoping** — only the tools it needs.
2. **Approval gates** on irreversible tool calls.
3. **Sandboxing** on code/file/system tools.
4. **Step caps + per-tool timeouts + wall-clock cap**.
5. **Circuit breakers** on external deps.
6. **Cost caps** at user/feature/API-key levels.
7. **Per-step observability** with trace IDs.
8. **Multi-axis evals** running in CI.
9. **Feature flag** with one-click disable.
10. **Streaming UX** for any user-facing agent.
11. **User feedback path** (thumbs up/down, escalate to human).
12. **Runbook** for on-call.

Skip any of these and you're shipping known risk. Walk the list every launch.

## The technical version

### 1. Capability and tool design

- [ ] Tools are narrow and composable.
- [ ] 5–15 tools per agent (split into specialized agents above ~20).
- [ ] Each tool description is precise: what, when, when NOT, params with examples, return shape.
- [ ] Schemas tight: enums, patterns, required fields, `additionalProperties: false`.
- [ ] Each tool's reversibility classified (read-only, idempotent, non-idempotent, destructive).

### 2. Safety controls

- [ ] Approval gates on all irreversible tool calls.
- [ ] Code/file/system tools sandboxed (disposable containers).
- [ ] Privilege scoping: agent can only operate on entities the user is authorized for.
- [ ] Prompt injection defenses: XML-tagged external content + "treat as data" system rules.
- [ ] Explicit refusal text in system prompt for out-of-scope requests.
- [ ] Output filtering at egress (don't leak secrets, PII, internal state).

### 3. Loop bounds

- [ ] Step cap appropriate to task (5–15 for most agents, 30–50 for research).
- [ ] Per-tool timeouts (5s for fast tools, up to 90s for slow tools).
- [ ] Wall-clock cap on the whole run.
- [ ] Circuit breakers on external dependencies.
- [ ] Hitting any limit raises an observable error; never silent.

### 4. Cost controls

- [ ] Per-request cost estimated before shipping.
- [ ] Per-user daily spend cap.
- [ ] Per-feature daily spend cap.
- [ ] API-key monthly cap as airbag.
- [ ] Alerts on absolute thresholds and drift.
- [ ] p50/p95/p99 cost dashboards.
- [ ] Top expensive traces reviewed regularly.

### 5. Observability

- [ ] Trace ID propagated through every model call and tool call.
- [ ] Per-step logs: tokens, latency, cost, error, approval status.
- [ ] Traces persisted with searchable query path.
- [ ] Replay capability for any past run.
- [ ] PII handling: hash, mask, or whitelist what's logged.

### 6. Evals

- [ ] 50+ case eval suite covering happy paths, edge cases, adversarial, regression cases.
- [ ] Multi-axis grading: output quality + tool selection + step count + approval respect.
- [ ] Programmatic graders where possible; LLM judge calibrated against humans.
- [ ] CI integration with merge-blocking thresholds.
- [ ] Production traffic sampling with automated grading.
- [ ] Every fixed bug leaves a regression case in the eval.

### 7. Rollout

- [ ] Feature flag wrapping the agent.
- [ ] Gradual rollout: 1% → 10% → 50% → 100% with monitoring at each step.
- [ ] One-click disable tested in staging.
- [ ] Model and prompt versions pinned (no auto-update aliases).
- [ ] Rollback plan documented.

### 8. UX

- [ ] Streaming output to the user.
- [ ] Tool calls surfaced with meaningful labels (not raw JSON).
- [ ] Plan surfaced when applicable (plan-then-act agents).
- [ ] Cancel button on long-running runs.
- [ ] Error states visible, not silent.
- [ ] Approval prompts inline for interactive agents.
- [ ] Escalate-to-human path.

### 9. Memory and state

- [ ] Short-term memory: sliding window + summary + task state.
- [ ] Long-term memory (if used): user-scoped, confidence-tagged, reviewable.
- [ ] Cross-user retrieval explicitly tested and blocked.
- [ ] Memory writes are deliberate, not every-turn.

### 10. Multi-agent (if applicable)

- [ ] Topology chosen deliberately (routing, supervisor, hand-off).
- [ ] Each agent has its own eval; system has end-to-end eval.
- [ ] Trace IDs propagate across agent boundaries.
- [ ] System-level step cap in addition to per-agent caps.
- [ ] Concentrated risk: action-taking tools live in tightly scoped agent.

### 11. Documentation

- [ ] Runbook: what the agent does, tools it uses, how to debug common issues.
- [ ] On-call playbook: who pages, what to check, when to escalate.
- [ ] Architecture diagram showing data flow.
- [ ] Common failure modes documented with debug steps.
- [ ] Stakeholder summary: what it does, what risks it carries.

### 12. Privacy and compliance

- [ ] PII data flow reviewed; minimization applied.
- [ ] Data retention policy for traces, conversations, memory.
- [ ] Right-to-delete plumbing for user data requests.
- [ ] Regional residency if applicable.
- [ ] Provider data settings configured (opt-out of training where needed).

### The "minimum bar"

If you can only check five things before shipping:

1. **Eval suite** covering ≥30 cases with CI integration.
2. **Per-request logging** with trace IDs.
3. **Daily spend cap** on the API key.
4. **Feature flag** with one-click disable.
5. **Approval gates** on irreversible tool calls.

These catch the majority of production agent disasters. Everything else is hardening for the long tail.

### Triage when something goes wrong

When an agent misbehaves in production, work through:

1. **Is it the model?** Check provider status. Try a different model version.
2. **Is it the prompt?** Did anything change? Check version control.
3. **Is it the input?** Look at the failing traces. Pattern?
4. **Is it a tool?** Did an upstream dep change behavior? Check tool logs.
5. **Is it memory?** Stale context? Cross-user leak?
6. **Is it the loop?** Step cap hit? Step count drift?
7. **Is it cost?** Cache hit rate dropped? Compaction failed?
8. **Is it volume?** Traffic shift to a different shape?

Most production agent incidents are one of these eight. Logs + traces tell you which.

### Post-launch rhythm

The launch isn't the end:

- **First 48 hours**: dashboard-watch closely; alerts tuned tight.
- **First 2 weeks**: weekly review of expensive runs, eval drift, user feedback.
- **Ongoing**: monthly review of cost trends, eval evolution, regression cases added.
- **Quarterly**: full re-audit of safety, capability scope, model versions.

Agents drift. Treating launch as a one-time event is how slow regressions accumulate.

## Three real-world scenarios

**Scenario 1: The launch that went smoothly.**
A team walked the checklist before launching. 80-case eval, daily caps, feature flag, gradual rollout. Day 1 was uneventful. Day 3 a cost spike alerted within hours; root-caused to a cache regression; rolled back. Total damage: $40 not $4,000. Nobody outside the team noticed.

**Scenario 2: The launch that didn't.**
A team shipped an agent with no step cap, no spend cap, no flag, no eval. Day 1: misclassified intent triggered a loop. Bill hit $11K overnight. They paid it, added the controls retroactively. Lesson cost more than the feature.

**Scenario 3: The slow drift.**
A team launched with the full checklist. Six months later, eval pass rate had drifted from 91% to 78%. The agent had stayed the same; user requests had shifted to harder shapes. They rotated old cases out, sampled production failures into the suite, added prompt refinements. Quality recovered. Lesson: ongoing maintenance is the price of running an agent in production.

## Common mistakes to avoid

- **Skipping items because "we're prototyping."** Prototypes become production faster than you think.
- **Approval-by-checkbox.** Treating the list as ritual instead of substance.
- **No post-launch review cadence.** Drift unseen.
- **One person's checklist.** Make it a team review.
- **Reusing checklists without adapting** to the agent's risk profile.

## Read more

- [Anthropic — building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- [OpenAI agent best practices](https://platform.openai.com/docs/guides/agents)
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)

## Summary

- The launch checklist has **12 areas**: capabilities, safety, loop bounds, cost, observability, evals, rollout, UX, memory, multi-agent, docs, privacy.
- **Minimum bar**: eval suite, per-request logging, daily spend cap, feature flag, approval gates on destructive tools.
- **Triage when things break**: model? prompt? input? tool? memory? loop? cost? volume?
- **Post-launch rhythm**: watch closely first 48h, weekly reviews first 2 weeks, monthly cost reviews, quarterly safety re-audits.
- Treat the launch as a milestone, not the finish line. Agents drift; maintenance is the price.

## You finished the course

The five modules of AI Agent Engineering Systems:

1. **What an Agent Actually Is** — agent vs workflow, the universal loop, action space, when not to build one.
2. **Designing Tools Agents Can Actually Use** — descriptions, schemas, idempotency, approval gates.
3. **Building a Production Agent** — plan-then-act vs react, observability, step caps and circuit breakers, streaming UX.
4. **Multi-Agent and Memory Patterns** — single vs multi-agent, topologies, short and long-term memory.
5. **Evals, Safety, and Shipping** — agent evals, safety patterns, cost monitoring, the launch checklist.

You now have the full agent engineering stack: from picking the right pattern through tool design, loop architecture, multi-agent topologies, memory strategy, and the launch checklist that separates demo agents from production ones.

Now go build something. And when you launch, walk the checklist.
