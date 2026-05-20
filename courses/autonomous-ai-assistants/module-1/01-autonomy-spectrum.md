---
module: 1
position: 1
title: "The autonomy spectrum — from chatbot to coworker"
objective: "Place your product on the autonomy spectrum and pick the right level."
estimated_minutes: 10
---

# The autonomy spectrum — from chatbot to coworker

## The puzzle

"Autonomous AI assistant" sounds clear until you try to define it. Is ChatGPT autonomous? Cursor's agent mode? The Slack bot that summarizes your channels? They're all called "AI" but they behave very differently.

The word "autonomous" actually covers a spectrum — from "responds when spoken to" all the way to "decides what to do, when, and how." Picking the right level for your product is the first design decision. Get it wrong and either your assistant feels useless or it scares users away by acting too freely.

## The simple version

The autonomy spectrum has roughly five levels:

1. **Chatbot** — responds to user messages.
2. **Tool-using assistant** — calls APIs/tools on user's behalf, but only when prompted.
3. **Initiative assistant** — proposes actions, executes after approval.
4. **Scheduled assistant** — runs on a schedule or triggers, surfaces results.
5. **Background coworker** — observes, decides, acts within trust boundaries.

Pick deliberately. Most successful "autonomous" products live at level 3 or 4. Level 5 is the future for niche products but breaks user trust if you ship it too soon.

## The technical version

### Level 1 — Chatbot

Pure conversational AI. User asks; bot answers. No tools, no actions, no memory across sessions (or just basic).

- Examples: vanilla ChatGPT, FAQ bots.
- Trust required: low (it can't do anything).
- Best for: information products, learning, quick tasks.

### Level 2 — Tool-using assistant

Bot has tools and uses them in response to user requests. Still triggered by the user, but capable of acting.

- Examples: customer support agents that look up orders, dev assistants that read code.
- Trust required: medium (the user knows what was asked and sees the result).
- Best for: chat surfaces with access to your product's data.

### Level 3 — Initiative assistant

Bot proposes actions even when not asked, but executes only on approval.

- Examples: an email assistant that drafts replies for you to send, Cursor's agent mode (proposes edits, you accept).
- Trust required: medium-high. The user is in control but the assistant is more proactive.
- Best for: productivity tools where the user reviews the assistant's work.

### Level 4 — Scheduled assistant

Bot runs on a schedule (daily brief, weekly digest) or in response to events (new email matching a pattern). Surfaces results; doesn't take destructive action without approval.

- Examples: morning briefing assistants, daily code-review summarizers, weekly meeting prep.
- Trust required: high. The assistant is doing work while you're not looking.
- Best for: knowledge work where the user benefits from having work done in advance.

### Level 5 — Background coworker

Bot decides what to do, when, and acts within trust boundaries — including actions the user didn't pre-authorize for that instance. Boundaries are set by user policy; details are at the bot's discretion.

- Examples: "respond to non-critical emails as me," "handle scheduling end-to-end."
- Trust required: very high. Mistakes can have real impact.
- Best for: well-defined, low-stakes domains where the user genuinely wants the work taken off their plate.

Level 5 is the future but the slope of trust is steep. Most "fully autonomous" products either operate in narrow domains or have an early-adopter cohort comfortable with the risk.

### How to pick a level

Three questions:

**1. What's the user's willingness to delegate?**

Some users want maximum delegation. Some want approval on everything. Default to mid-spectrum (level 3) and let users opt up.

**2. What's the reversibility of mistakes?**

Drafting an email: low-stakes, fully reversible (you read before sending). Sending an email: high-stakes, harder to undo. Match autonomy level to reversibility.

**3. What's your eval coverage?**

You can ship at any level if you have evals proving the assistant behaves well in that range. Without evals, default conservative — level 3 maximum.

### Level shift across the product lifecycle

Successful autonomous products typically start lower and ramp up:

- Week 1: pure chatbot (level 1) for early access. Build trust.
- Month 2: tool-using assistant (level 2). User asks, assistant acts.
- Month 4: initiative assistant (level 3). Bot drafts; user approves.
- Month 6+: scheduled tasks (level 4). User opts in per task.
- Year 1+: background actions in narrow domains (level 5).

This ramp matches user trust growth and gives you eval coverage at each step.

### Anti-patterns

- **Launching at level 5 with a marketing campaign.** Users haven't built trust yet; one mistake torches the product.
- **Locking at level 1 forever.** Users wanted an assistant; you gave them search. They churn.
- **Mixed-level features without clear demarcation.** User thinks level 2; the product is silently doing level 5 things. Trust collapses on first surprise.

### What "autonomous" should NOT mean

Some patterns are sold as "autonomy" but really aren't:

- **Multi-step tool use within one user request** — that's just an agent (level 2 or 3).
- **A bot that runs faster than humans** — that's automation; speed isn't autonomy.
- **A bot that has been "given access to all your tools"** — access ≠ autonomy. What it does with that access is what matters.

Use the word precisely. It changes user expectations.

### Trust-building patterns at each level

To shift users up the spectrum:

- **Show the work**: surface what the assistant did and why.
- **Confirm before risky actions**: even at level 4-5, gate destructive operations.
- **Easy undo**: every action should have a rollback path.
- **User-tunable autonomy**: let users set per-feature trust ("auto-respond to known senders only").
- **Trail receipts**: log every action so users can audit later.

Trust isn't a switch. It's an account you grow with each successful, transparent interaction.

## Three real-world scenarios

**Scenario 1: The product that grew with users.**
A team launched an "AI assistant for engineering managers." V1 was level 2 — answered questions, looked up data. V2 added level 3 features (drafts of team updates for review). V3 added level 4 (scheduled morning briefings). By V4, opted-in users let the assistant respond to routine pings on their behalf (level 5). Each ramp had a trust-building moment.

**Scenario 2: The level-5 launch that backfired.**
A startup launched "your AI executive assistant" with the assistant booking meetings, responding to emails, and rescheduling on its own. Within a week, three users had high-profile mistakes (wrong meeting cancellations). They reverted to level 3 (propose, then approve). Recovered, but the marketing damage took months.

**Scenario 3: The level-2 ceiling.**
A consumer product positioned itself as "your AI assistant" but the actual capability was level 2 — it answered questions about your data. Users wanted scheduling and email drafting. They felt the product oversold. Churn was high until they added real assistant features in v3.

## Common mistakes to avoid

- **Shipping above your eval coverage.** Autonomy needs proportional safety controls.
- **Lying about the level.** "AI agent does X for you" when actually X is "you press a button."
- **No way to step down.** Locking users at level 5 with no level-3 fallback creates anxiety.
- **Trust burning on first big mistake.** Without graceful undo, users abandon after one bad action.
- **Mixed signals.** Some features level 3, others silently level 5 without clear UX cue.

## Read more

- [Anthropic — building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents)
- [SAE Levels of Autonomy (analog)](https://www.sae.org/standards/content/j3016_202104/) — the autonomy-level mental model from self-driving

## Summary

- Autonomy is a **spectrum** from chatbot (1) to background coworker (5), not a binary.
- **Most successful "autonomous" products live at level 3-4.** Level 5 is high reward but high risk.
- Pick a level based on **user delegation willingness, reversibility of mistakes, and eval coverage**.
- **Ramp up over time** as trust and evals catch up.
- **Use the word precisely** — access ≠ autonomy.
- **Trust-building** patterns: show work, confirm risky actions, easy undo, user-tunable autonomy, audit trail.

Next: assistant vs agent vs chatbot — naming things clearly.
