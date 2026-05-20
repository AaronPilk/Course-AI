---
module: 1
position: 1
title: "Meet Claude — the model family and what each one is for"
objective: "Pick the right Claude (Opus, Sonnet, Haiku) for a given task."
estimated_minutes: 11
videos:
  - title: "Anthropic Developer Channel"
    url: "https://www.youtube.com/@anthropic-ai"
    source: "Anthropic"
---

# Meet Claude — the model family and what each one is for

## The puzzle

You're about to ship a Claude-powered feature. You open the docs and see: Claude Opus, Claude Sonnet, Claude Haiku — plus version numbers like 4.6, 4.5, 3.5. What's the difference? Which one do you call?

Pick wrong and you either spend 10× what you needed to, or you ship a feature that's too slow and a little off. Pick right and the same product budget runs four times as much traffic.

This lesson is the map. By the end you'll know which Claude to reach for and when to swap.

## The simple version

Anthropic ships **three tiers**, each refreshed periodically with a new version:

- **Haiku** — fastest, cheapest. For high-volume, latency-sensitive, or simple tasks.
- **Sonnet** — the workhorse. Strong general intelligence at fraction of Opus cost. **Default for most production traffic.**
- **Opus** — most capable. Use for the hardest problems where quality matters more than speed or cost.

Picking by question:

- "Is this a high-volume classification or extraction job?" → Haiku.
- "Is this a general chat / agent / RAG product?" → Sonnet.
- "Is this complex multi-step reasoning, deep research, or hard code?" → Opus.

Like every choice in AI engineering, you can mix tiers within one product. Use a router (Lesson 5.1 of the OpenAI course covers the same pattern).

## The technical version

### What "tier" actually means

Tiers differ in three things: model size, training depth, and price. Bigger models cost more per token, take longer to respond, and produce higher-quality output on hard tasks. Within a generation, the gap between tiers is meaningful — Opus consistently beats Sonnet on hard reasoning, Sonnet consistently beats Haiku.

Between generations, lower tiers catch up. Claude Sonnet 4.6 (current as of writing) is often roughly as capable as Opus 3 was. So "use the cheapest model that meets your bar" is a moving target — re-evaluate when new versions ship.

### When Haiku is the right fit

Haiku shines for:

- **Classification** — sentiment, intent, category. Single-token outputs at high throughput.
- **Structured extraction** — pulling fields from short documents.
- **Quick rephrases / summarization** of short text.
- **Routing decisions** — "is this question easy or hard?" before sending to a bigger model.
- **High-volume real-time** — chatbots that don't need deep reasoning.

Pricing is the lowest in the family, response time the fastest. The tradeoff: it can miss nuance and is more prone to small mistakes on multi-step tasks.

### When Sonnet is the right fit

Sonnet is the default for most production AI products:

- **Chatbots and assistants** — strong intelligence, reasonable cost.
- **RAG over typical docs** — handles citations and grounding well.
- **Tool-using agents** — strong at following tool-use protocols.
- **Code assistance** — solid at code review, generation, and explanation.
- **Content generation** with brand voice — good adherence to style.

If you don't know which tier to start with, start here. Move to Haiku for cost, Opus for quality, once you know what's not working.

### When Opus is the right fit

Opus is for problems where being wrong is more expensive than being slow:

- **Hard reasoning** — math word problems, complex logic, multi-constraint optimization.
- **Code at the limit** — debugging gnarly issues, architecting systems, large refactors.
- **Deep research** — multi-hour analytical tasks with web search and citation.
- **High-stakes writing** — strategy memos, legal-style drafting, executive briefs.
- **Agent planning over many steps** — when the agent has to think several moves ahead.

Opus is several times more expensive than Sonnet and slower. Don't use it where Sonnet would do.

### Versioning and `claude-*` model strings

The API takes model strings like `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5`. Always pin a specific version in production — never use an alias that could update under you and shift behavior.

```js
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-6",  // pin the exact version
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello, Claude." }]
});
```

When a new version ships:

1. Run your eval suite (Module 5.3) against the new version.
2. If it passes, flip the version string behind a feature flag.
3. Watch metrics during rollout. Roll back if needed.

### Mixed-tier routing in production

A common pattern that drops cost by 60–80% with no quality loss:

```js
// Lightweight router (Haiku, single token)
const router = await anthropic.messages.create({
  model: "claude-haiku-4-5",
  max_tokens: 5,
  messages: [{
    role: "user",
    content: `Classify this question as "easy" or "hard":\n\n${userQuestion}\n\nOnly output one word.`
  }]
});

const difficulty = router.content[0].text.trim().toLowerCase();
const model = difficulty === "hard" ? "claude-opus-4-6" : "claude-sonnet-4-6";

const answer = await anthropic.messages.create({
  model,
  max_tokens: 1024,
  messages: [{ role: "user", content: userQuestion }]
});
```

The router call costs cents per thousand. The savings on swapping easy traffic to Sonnet (or even Haiku) is dollars per thousand.

### Capabilities that apply across the family

Some features work the same across tiers:

- **Vision** — Sonnet and Opus accept images and PDFs. Haiku has image support too, with limits.
- **Tool use** — All current tiers support it.
- **Long context** — All current tiers support a long context window (200K tokens on most current models).
- **Prompt caching** — Works on all current tiers (Module 5.1).
- **Streaming** — Works on all tiers.

Capabilities you don't lose at Haiku. What you lose is depth of reasoning on hard problems.

## Three real-world scenarios

**Scenario 1: The classifier that didn't need to be Sonnet.**
A team was running customer-feedback classification through Sonnet at $400/day. They switched to Haiku, ran their eval, accuracy dropped 1.5 points (still above their bar), and cost dropped to $35/day. Quality net-neutral, cost down 91%.

**Scenario 2: The chatbot that fell down on hard questions.**
A support bot ran entirely on Haiku to save money. Customer-satisfaction scores dropped after launch. Audit showed Haiku was missing context on multi-step questions. They added a router: easy → Haiku, hard → Sonnet. Costs went up 30% from Haiku-only but quality met the bar.

**Scenario 3: The research agent that needed Opus.**
A team built a competitive intel agent on Sonnet. It produced shallow summaries reps ignored. Upgraded to Opus for the synthesis step (only). Per-query cost went from $0.10 to $0.80. Reps now use it three times a day — replaces 30 minutes of prep each time. Worth every cent.

## Common mistakes to avoid

- **Always picking Opus "to be safe."** Most workloads don't need Opus. You're burning money.
- **Always picking Haiku to save money.** When quality drops below the bar, users churn — saving money on a dying product is not saving.
- **Not pinning the version.** Auto-updates shift behavior silently. Pin.
- **Ignoring routing.** Mixed-tier routing is the single biggest production cost lever.
- **Skipping eval on version bumps.** New is not always better for your specific workload.

## Read more

- [Claude models overview](https://docs.anthropic.com/en/docs/about-claude/models/overview)
- [Model deprecations and lifecycle](https://docs.anthropic.com/en/docs/about-claude/model-deprecations)
- [Choosing a model](https://docs.anthropic.com/en/docs/about-claude/models/choosing-a-model)

## Summary

- Claude has **three tiers**: Haiku (fast/cheap), Sonnet (workhorse default), Opus (hardest problems).
- **Sonnet is the right default**; move to Haiku or Opus only when you know why.
- **Pin model versions** in production. Test on new versions before flipping.
- **Mixed-tier routing** is the highest-leverage cost optimization — easy traffic to small models, hard traffic to big ones.
- Capabilities (vision, tools, long context, caching) work across the family; the difference is depth of reasoning.

Next: how to actually call Claude — the Messages API.
