---
module: 5
position: 3
title: "Monitoring, versioning, A/B testing"
objective: "Operate AI in production responsibly."
estimated_minutes: 5
---

# Monitoring, versioning, A/B testing

## What to monitor

For AI in production:
- **Quality metrics.** Accuracy, user satisfaction, refusal rate.
- **Performance.** Latency, throughput, error rate.
- **Cost.** Per-query, per-day, total.
- **Drift.** Quality changes over time.
- **Safety.** Inappropriate outputs, jailbreak attempts.

For: catch issues early.

## Quality metrics

Hard to define for generative AI:
- **Task-specific.** Accuracy for classification, ROUGE for summarization, BLEU for translation.
- **Human eval.** Rate sample of outputs.
- **LLM-as-judge.** Use stronger LLM to evaluate.
- **User signals.** Thumbs up/down, regenerate clicks, conversation length.

For: continuous quality tracking.

## LLM-as-judge

For scaled evaluation:
- Use stronger model (GPT-4 / Claude 3.5) to rate your model's outputs.
- Build rubric (helpfulness, accuracy, safety).
- Score each output 1-5.
- Track average over time.

For: quality monitoring without human raters at scale.

## Performance metrics

Track:
- **P50 / P95 / P99 latency.** Tail latency matters.
- **Throughput (QPS).** Requests served per second.
- **Error rate.** Timeouts, OOM, model errors.
- **Cost per query.**

Tools: Prometheus + Grafana, DataDog, Honeycomb.

## Drift detection

Things change over time:
- **Data drift.** User queries shift.
- **Model drift.** Same model produces different quality (rare in deterministic LLMs).
- **Concept drift.** What users want evolves.

Monitor: compare distributions of queries / responses over time.

For: catch when model becomes less relevant.

## Versioning

For reproducibility:
- **Model versions.** Tag each deployed version.
- **Dataset versions.** Hash + version data used.
- **Code versions.** Git commits.
- **Prompt versions.** Track prompt template changes.

For: rollback if version regresses.

## A/B testing

Compare two model / prompt versions:
- Split traffic 50/50.
- Measure quality + cost + latency.
- Statistical significance test.
- Pick winner.

For: data-driven model decisions.

## Shadow mode

Test new model without affecting users:
- Production traffic to current model (user sees this).
- Same traffic copied to new model (logged; user doesn't see).
- Compare offline.
- Promote new model when proven.

For: safe rollout.

## Canary deployment

Gradually shift traffic:
- 1% to new model; rest to old.
- If healthy: 10%, 50%, 100%.
- Rollback fast if issues.

For: production safety.

## Logging

For debugging + audit:
- Every request + response.
- Model version used.
- Latency + tokens.
- Errors + traces.

Privacy: be careful with PII; encrypt; have retention policy.

For: post-hoc analysis; compliance.

## User feedback

Collect signals:
- **Thumbs up / down.**
- **Regenerate clicks.**
- **Edit suggestions.**
- **Explicit corrections.**
- **Conversation continuation.**

For: real quality signal vs. proxy metrics.

## Cost monitoring

Track:
- Daily / weekly / monthly cost.
- Cost per query.
- Cost per user / customer.
- Forecasting.

Set alerts for anomalies (sudden 10x spike).

For: prevent surprise bills.

## Safety monitoring

For inappropriate outputs:
- Content moderation API on outputs.
- Jailbreak attempt detection on inputs.
- Bias monitoring on samples.
- PII leakage detection.

For: responsible deployment; legal compliance.

## Observability stack

Modern AI observability:
- **Langfuse / Helicone.** LLM-specific observability.
- **WandB.** Training + experiment tracking.
- **MLflow.** ML lifecycle.
- **Arize / WhyLabs.** ML monitoring.
- **OpenTelemetry.** General tracing standard.

For: comprehensive AI ops.

## Continuous evaluation

Set up:
- Test set with known answers.
- Run nightly against current production.
- Alert on quality regression.

For: catch silent quality drops.

## Iteration discipline

Pro AI teams:
- Hypothesis (new prompt / model improves X).
- Experiment design.
- A/B test.
- Measure result.
- Decision (deploy / abandon).

Vs. cowboy "try this new prompt; ship."

For: compound improvement.

## Mistakes to avoid

- **No monitoring.** Issues caught by user complaints.
- **No A/B testing.** Subjective model decisions.
- **No version tracking.** Can't reproduce / rollback.
- **No cost alerts.** Bill shock.
- **No safety monitoring.** PR / legal disasters.

## Summary

- Monitor: quality + performance + cost + drift + safety.
- LLM-as-judge for scalable quality eval.
- A/B testing + shadow mode + canary for safe rollouts.
- Versioning models + prompts + data + code.
- Logging for debug + audit.
- Observability stack: Langfuse / Helicone for LLM-specific.

Next: open-source vs. commercial trade-offs.
