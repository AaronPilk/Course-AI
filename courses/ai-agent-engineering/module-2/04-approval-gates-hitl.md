---
module: 2
position: 4
title: "Approval gates and human-in-the-loop"
objective: "Add review steps on irreversible tool calls without breaking the agent's flow."
estimated_minutes: 10
---

# Approval gates and human-in-the-loop

## The puzzle

Your agent has a `send_email` tool. In testing, it works. In production, a misunderstood user intent caused it to email 80 customers with the wrong information. You're now writing apology emails.

The fix isn't "smarter model." It's an approval gate — a step where a human confirms before the destructive action runs.

This lesson covers the patterns for human-in-the-loop (HITL) approvals: when to use them, how to implement them, and how to keep them out of the way when they're not needed.

## The simple version

For any tool that's:

- **Sends a message** (email, SMS, notification).
- **Moves money** (charge, refund, transfer).
- **Deletes data**.
- **Changes external state irreversibly** (publish, cancel subscription, fire an event).

Insert an approval step between the agent's tool call and execution. The agent says "I want to do X with args Y." A human (or automated rule) approves or rejects. Only on approve does the tool run.

## The technical version

### The pattern in code

In your tool runner:

```js
const APPROVAL_REQUIRED = new Set([
  "send_email",
  "issue_refund",
  "cancel_subscription",
  "delete_user_data",
  "publish_post"
]);

async function runTool(name, input) {
  if (APPROVAL_REQUIRED.has(name)) {
    const approval = await requestApproval({
      tool: name,
      args: input,
      trace_id: currentTraceId
    });

    if (approval.status !== "approved") {
      return {
        is_error: true,
        content: JSON.stringify({
          error: "NOT_APPROVED",
          message: approval.reason || "Action not approved by reviewer."
        })
      };
    }
  }

  return await TOOLS[name](input);
}
```

`requestApproval` is whatever fits your product: a UI prompt, a Slack message, a queue with manual review, an automated rule engine.

### Approval UX patterns

Different products want different approval flows:

**Inline approval (chat UI).** The agent says "I'd like to send this email: [preview]. Approve?" The user clicks Approve or Reject. Common for consumer products and personal agents.

**Notification approval.** The agent fires an action; a notification goes to a human reviewer (Slack, email, admin dashboard); the reviewer approves later. The user sees "submitted for review" in the meantime.

**Rules-based approval.** A rule engine approves automatically based on conditions (refund < $50, customer in good standing, etc.); escalates ambiguous cases to a human.

**Two-person approval.** For very-high-stakes actions, require two distinct humans to approve. Common for financial and security tools.

Pick the pattern that fits the risk level and the UX.

### What to show the approver

When asking for approval, include:

- **What the tool will do** in plain English.
- **The exact args** (so the approver knows what's about to happen).
- **Why the agent wants to do this** (the conversation context).
- **Who triggered it** (the user, if relevant).
- **Reversibility** ("This refund cannot be undone").

If the approver can't see what they're approving, they'll either rubber-stamp everything (defeats the purpose) or freeze.

### Latency tradeoff

Approval gates add latency. For interactive agents, this is OK as long as the user is in the loop. For automated workflows, you may want a fast-path:

- **Auto-approve** under conservative thresholds (low risk, small amounts, known patterns).
- **Auto-reject** outside the safe envelope (large amounts, new patterns, off-hours).
- **Escalate** ambiguous middle cases to humans.

This three-way routing keeps approval pressure on humans only for the cases that need it.

### Logging approvals

Every approval — granted, rejected, expired — needs a log entry:

- Tool, args, trace ID.
- Approver identity.
- Decision, reason.
- Timestamp.

This is your audit trail. When something goes wrong post-launch, the approval log is what tells you who knew what and when.

### Approval doesn't replace evals

Approval gates catch individual bad decisions. They don't replace evals — you still need to test that the agent makes good decisions most of the time.

If an agent's behavior is so bad that human reviewers reject 50% of its proposals, you don't have an approval problem — you have a bad agent. Fix the agent.

### Approval doesn't replace tool design

Approval gates are not a substitute for narrow tool design. If you give an agent a `run_arbitrary_sql` tool with an approval gate, the human reviewer is now responsible for catching SQL injection, accidental data exposure, and bad query plans. They will miss things.

Prefer: narrow, well-scoped tools that don't need approval at all. Approval gates are for actions you genuinely can't make safer at the tool layer.

### When approval is overkill

Don't gate:

- **Read-only tools.** Reviewing every lookup is friction with no safety value.
- **Internal queries the user already invoked.** They asked for it; gating is annoying.
- **Tools where outcomes are visible and undoable.** Updating a draft, suggesting a result — let the user see and edit, don't pre-gate.

Approval is for irreversible side effects. Other safety needs are usually met better by validation, scoping, or eventual review.

### Asking-the-user variant

For consumer agents, the simplest approval is "ask the user before doing it":

```
Agent: "I'd like to refund order #4421 for $89.99. Should I go ahead?"
User: "Yes"
Agent: [calls issue_refund]
```

This is approval embedded in the conversation. Works well when the user is present and engaged. For background agents or multi-step automation, you'll want explicit approval queues instead.

### Mixing approval with audit

For some tools, you want:

- **Real-time approval** for high-impact calls (refunds > $500).
- **Post-hoc audit** for everything else (so a human reviews after the fact, but doesn't block).

The audit pattern: log every action, automatically flag suspicious ones for human review, ship the rest. Captures most of the safety value without latency.

## Three real-world scenarios

**Scenario 1: The 80-email apology.**
A team's agent had `send_email` with no approval gate. A misunderstood intent triggered 80 wrong emails. They added an approval gate that surfaces the email draft to the user before sending. Subsequent agents have never re-played that mistake.

**Scenario 2: The rule engine that automated 95% of refunds.**
A support team gated refunds at first — every one needed a human OK. Throughput suffered. They added a rule engine: refunds < $50 for customers in good standing get auto-approved; everything else still goes to a human. 95% of refunds now flow without delay; the 5% that need attention get it.

**Scenario 3: The unreviewed audit.**
A team added detailed audit logging — and never read it. A series of suspicious agent actions accumulated for months before someone noticed. Lesson: audit logs only work if someone actually reviews them. Build a dashboard, set alerts, or accept that the log won't catch anything in time.

## Common mistakes to avoid

- **No approval on irreversible tools.** Inevitable incident.
- **Approval everywhere.** Friction that defeats the purpose.
- **No context shown to approvers.** They rubber-stamp.
- **Approval logs nobody reads.** Audit theater.
- **Treating approval as a substitute for narrow tool design.** Reviewer can't catch everything.
- **No fallback when approval times out.** Agent stalls; user waits forever.

## Read more

- [Anthropic — building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- [OpenAI Agents SDK — human-in-the-loop](https://platform.openai.com/docs/guides/agents)

## Summary

- **Approval gates** sit between the agent's tool call and execution.
- Required for **irreversible side effects**: send, charge, delete, publish.
- Patterns: **inline (chat)**, **notification (async)**, **rules-based (automated)**, **two-person (high stakes)**.
- Show approvers: **tool, args, context, reversibility**.
- **Fast-path with rules** to keep humans focused on ambiguous cases.
- **Log every approval** decision — your audit trail.
- Approval is **not a substitute for narrow tools or evals** — layer all three.

That wraps Module 2. Next: building a production agent — observability, step caps, streaming, cost control.
