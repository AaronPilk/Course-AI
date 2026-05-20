---
module: 5
position: 1
title: "Agent evals — testing multi-step behavior"
objective: "Build an eval that catches multi-step regressions, not just single-shot output."
estimated_minutes: 10
---

# Agent evals — testing multi-step behavior

## The puzzle

Eval a single LLM call: easy. Pass input, grade output.

Eval an agent: harder. The agent took 7 steps. Step 3 was suboptimal. Step 5 corrected for it. Final output is fine. Is the agent good or bad?

Agent evals have to score behavior across steps, not just final output. This lesson covers the patterns that catch real multi-step regressions.

## The simple version

Eval agents on four axes:

1. **End-to-end output quality** — did the user get a good final answer?
2. **Tool selection** — did the agent pick the right tools in the right order?
3. **Efficiency** — did it take a reasonable number of steps?
4. **Safety** — did it avoid bad actions, refuse appropriately, respect approval gates?

Use programmatic graders where possible (tool sequences, step counts, approval checks). Use LLM-as-judge for output quality.

## The technical version

### Eval set structure

Each eval case is a multi-part contract:

```json
{
  "id": "support_01",
  "user_input": "I want to return order #4421",
  "expected_tools_called": ["lookup_order", "start_return"],
  "expected_tool_order_strict": true,
  "max_steps": 5,
  "expected_final_response_rubric": "Confirms return started; mentions next steps."
}
```

Each axis becomes its own check. The case can pass or fail any combination — and the failure mode tells you which axis to improve.

### Programmatic graders for agents

**Tool selection**: did the agent call the expected tools?

```js
function gradeTools(actualTools, expected, strict = false) {
  const actualNames = actualTools.map(t => t.name);
  if (strict) {
    return JSON.stringify(actualNames) === JSON.stringify(expected.tools);
  }
  // Loose: every expected tool was called, in some order
  return expected.tools.every(t => actualNames.includes(t));
}
```

**Argument correctness**: did the right arguments go to each tool?

```js
function gradeArgs(actualCall, expected) {
  for (const [k, v] of Object.entries(expected.args)) {
    if (actualCall.args[k] !== v) return false;
  }
  return true;
}
```

**Step count**: did the agent complete in a reasonable number of steps?

```js
function gradeSteps(trace, maxSteps) {
  return trace.steps.length <= maxSteps;
}
```

**Approval respect**: did the agent attempt destructive actions without approval (in a test sandbox)?

```js
function gradeApprovals(trace, gatedTools) {
  for (const step of trace.steps) {
    if (step.type === "tool_call" && gatedTools.has(step.tool) && !step.approval_granted) {
      return false;
    }
  }
  return true;
}
```

### LLM-as-judge for final output

For subjective qualities (helpfulness, accuracy, tone):

```js
const judgePrompt = `
Rate the assistant's response on a 1-5 scale.

USER REQUEST: ${input}
ASSISTANT FINAL RESPONSE: ${finalResponse}
EXPECTED CRITERIA: ${rubric}

JSON output: {"score": <int>, "reason": "<one sentence>"}
`;
```

Use a capable model (Sonnet+) for judging. Calibrate against humans on a sample (same pattern as Lesson 5.3 of the Anthropic course).

### The "explore the wrong path then recover" problem

Sometimes the agent does the right thing eventually but takes a roundabout route. Pure tool-sequence grading would fail it; end-to-end grading would pass it.

Decision: do you care about *efficiency* or only *correctness*?

For high-volume products: efficiency matters (each unnecessary step is real money). Add step count as a hard check.

For research / exploratory products: efficiency matters less. Final output quality dominates. Maybe a soft warning on excessive steps but don't fail the case.

### Eval cases that cover each axis

Cover each failure mode in your eval set:

- **Happy paths**: typical user requests with clear correct paths.
- **Tool selection challenges**: cases where multiple tools could plausibly fit.
- **Edge cases**: weird inputs, missing data, partial information.
- **Adversarial**: prompt injection, off-topic requests, requests to bypass safety.
- **Cost / efficiency stress tests**: complex requests where step count matters.
- **Regression**: every past production bug becomes a case.

A solid agent eval set is 50–150 cases. Smaller and you miss failure modes; larger and you slow down CI without proportional gain.

### Real production sampling

Sample 1–10% of production traffic, run automated graders on the traces, alert on:

- Tool-selection regressions.
- Cost-per-trace increases.
- Step count drift.
- User thumbs-down rate.

This catches issues your test set misses (distribution shifts, new edge cases, model drift).

### CI integration

Pre-merge gate:

```
on: pull_request
jobs:
  agent_eval:
    runs:
      - npx tsx scripts/run-agent-eval.ts --suite=staging
      - ./scripts/check-thresholds.sh tool_selection 0.95 step_count_p95 6 output_quality 4.0
```

Each threshold blocks merge if violated. Pre-commit you've validated end-to-end + each axis.

### Variance and flakiness

Agents are probabilistic. Two runs of the same case can differ. Patterns:

- **Run each case 3× or 5×** and require majority pass.
- **Pin temperature to 0** for eval runs (deterministic-ish).
- **Track flakiness separately** — cases that pass-fail randomly are themselves signal.

Don't over-correct for variance by writing maximally generous rubrics — that hides regressions. Find the floor of acceptable performance, eval against that.

### When the eval set is wrong

If the eval keeps flagging things humans say are fine, the eval is too strict. Calibrate the rubric. If the eval misses obvious regressions, the eval is too loose. Add cases.

Eval design is iterative. Treat the eval set like production code: review, version, refactor.

## Three real-world scenarios

**Scenario 1: The regression caught by tool-selection eval.**
A team's agent passed its end-to-end eval after a prompt change but their tool-selection eval flagged a 12-point drop. The agent was now taking 2 extra tool calls per task — same final answer, more cost. They reverted and fixed the prompt. Without the tool-selection axis, they'd have shipped the regression.

**Scenario 2: The expensive 'correct' agent.**
A team only graded final output quality. Their agent passed eval but took 12 steps when 5 would do. Cost in production was 2.5× expected. They added step-count grading; future versions were forced to be efficient.

**Scenario 3: The approval bypass.**
A regression let the agent skip approval on a destructive tool in a specific case. Production traces would have caught it eventually — but their pre-merge eval flagged it the first time. Engineer reverted before merge.

## Common mistakes to avoid

- **Only grading final output.** Hides tool-selection regressions.
- **No step-count check.** Cost regressions sneak through.
- **No approval-respect check.** Safety regressions sneak through.
- **Single-run eval cases.** Flakiness masks real signals.
- **No production sampling.** Test set drifts from real distribution.
- **Eval set never updated.** Becomes stale; loses sensitivity.

## Read more

- [OpenAI Evals API](https://platform.openai.com/docs/api-reference/evals)
- [Anthropic Workbench](https://console.anthropic.com)
- [LangSmith eval framework](https://docs.smith.langchain.com/)

## Summary

- Agent evals score **four axes**: output quality, tool selection, efficiency (step count), safety (approvals).
- **Programmatic graders** for tool sequences, args, step counts, approvals.
- **LLM-as-judge** for final output quality, calibrated against humans.
- **50–150 cases** covering happy paths, edge cases, adversarial, regression.
- **Production sampling** with automated grading catches drift the test set misses.
- **CI thresholds** block merges that regress any axis.

Next: safety patterns specific to agents.
