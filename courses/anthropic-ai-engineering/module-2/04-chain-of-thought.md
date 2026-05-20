---
module: 2
position: 4
title: "Chain-of-thought prompting that actually helps"
objective: "Add thinking steps to prompts where they improve quality, skip them where they don't."
estimated_minutes: 10
---

# Chain-of-thought prompting that actually helps

## The puzzle

You've heard "just add 'think step by step' to your prompt and quality improves." So you tried it. Some tasks got better. Some got the exact same output, just with three paragraphs of obvious reasoning in front of it.

Chain-of-thought (CoT) prompting is real and useful, but it's not free and it's not universal. This lesson covers when CoT actually helps, how to structure it on Claude, and when to skip it.

## The simple version

**Chain-of-thought** = asking the model to think before answering. On hard tasks, it improves accuracy. On easy tasks, it adds tokens without value.

Three flavors:

1. **Trigger phrase** — "Think step by step before answering." Cheap, sometimes effective.
2. **Structured thinking** — explicit `<thinking>` and `<answer>` blocks. More reliable; output is parseable.
3. **Extended thinking** — Claude's built-in "think more before responding" mode on supported models.

Use CoT when the task involves multi-step reasoning, math, logic, or careful judgment. Skip it for lookups, classification, or simple extraction.

## The technical version

### When CoT helps

CoT improves accuracy on:

- **Math and quantitative reasoning** — word problems, multi-step calculations.
- **Logical reasoning** — constraint problems, ordering, deduction.
- **Multi-step analysis** — "is this contract favorable to us, why or why not?"
- **Plan-then-act** — agents that need to decide what to do before acting.
- **Code review and design** — thinking through implications before recommending.

The common thread: tasks where a smart human would naturally pause and think before answering.

### When CoT doesn't help

CoT is overkill for:

- **Lookups** ("what's the capital of France?")
- **Classification** ("is this email spam?")
- **Extraction** (pulling structured fields from a doc)
- **Translation**
- **Simple rephrasing**

For these, CoT just adds tokens and latency. Skip it.

### Trigger-phrase CoT

The simplest version. Add to the user message or system prompt:

```
Think step by step before answering.
```

Or more directive:

```
Before answering, walk through your reasoning out loud. Then give your final answer.
```

Works on most models but has a downside: the reasoning is mixed in with the answer. If you want to parse just the answer, you'll need to extract it.

### Structured CoT — recommended on Claude

Use XML tags to separate thinking from answer:

```
Read the customer email and decide whether it qualifies for a refund.

<refund_policy>
- Full refund within 30 days of purchase.
- 50% refund within 60 days if unused.
- No refund after 60 days unless item arrived damaged.
</refund_policy>

<email>
${customerEmail}
</email>

First, work through your reasoning inside <thinking> tags. Then give your final decision inside <decision> tags.

Use this format:
<thinking>
1. When was the purchase?
2. How long ago was that?
3. Was the item used or damaged?
4. Which refund tier applies?
</thinking>

<decision>
<refund_eligible>yes | partial | no</refund_eligible>
<refund_percent>0-100</refund_percent>
<reason>brief justification</reason>
</decision>
```

Now you can parse `<decision>` cleanly and surface `<thinking>` only for debugging or audit. The model thinks structured, and you keep the response parseable.

### Showing the thinking in few-shot examples

You can demonstrate the thinking process in your examples:

```
<example>
<question>Sam has $40. He buys 3 books at $9 each. How much does he have left?</question>
<thinking>3 books × $9 = $27 spent. $40 - $27 = $13 remaining.</thinking>
<answer>$13</answer>
</example>

<example>
<question>Lila wants to bake cookies. The recipe makes 24 cookies and needs 2 cups of flour. She wants 60 cookies. How much flour?</question>
<thinking>60 cookies / 24 cookies per batch = 2.5 batches. 2.5 × 2 cups = 5 cups.</thinking>
<answer>5 cups</answer>
</example>

Now solve:
<question>${question}</question>
```

The model picks up the pattern: think first, then answer. Combined with prefilling (`{ role: "assistant", content: "<thinking>\n" }`), the structure is guaranteed.

### Extended thinking (where available)

Newer Claude models support a built-in "thinking" mode where the model spends extra compute reasoning before producing visible output. Activate via the API:

```js
const response = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  thinking: {
    type: "enabled",
    budget_tokens: 10000  // how much thinking is allowed
  },
  messages: [{ role: "user", content: hardQuestion }]
});
```

The thinking happens server-side. You see the final answer; the thinking tokens are billed separately. Use this for genuinely hard problems where the visible answer should stay clean.

This mirrors OpenAI's reasoning models — same pattern, different API.

### Cost of CoT

Two costs:

1. **Output tokens** — thinking adds tokens to the response, which you pay for at the output rate.
2. **Latency** — more tokens means longer response time.

For high-volume features, this matters. Run an eval: does the accuracy improvement justify the cost?

A common pattern: route hard questions to a CoT prompt, easy questions to a direct prompt. A classifier (Haiku) decides which path.

### Anti-pattern: forced CoT on easy tasks

Adding "think step by step" to a classification prompt produces output like:

```
Thinking:
1. The question is asking me to classify this email.
2. The email is about a billing issue.
3. Therefore the category is billing.

Category: billing
```

You paid for 50 extra tokens to learn nothing. The model would have said "billing" anyway. Don't force CoT on tasks where the answer is obvious.

### Combining CoT with citations

For RAG (Module 4), CoT pairs nicely with citation:

```
<thinking>
The user is asking about return policy for opened items. 
Source #2 says: "Items can be returned within 30 days unless opened, in which case there's a 25% restocking fee."
Source #4 confirms this and adds details about exceptions for defects.
The answer depends on whether the item is defective.
</thinking>

<answer>
You can return opened items within 30 days, but there's a 25% restocking fee [source 2]. The fee is waived if the item is defective [source 4]. Was your item defective or in working condition?
</answer>
```

Thinking-with-citations makes both the reasoning *and* the grounding auditable.

## Three real-world scenarios

**Scenario 1: The math tutor that finally got it right.**
A math tutor app was getting 60% of word problems wrong without CoT. Adding structured thinking — `<thinking>` showing the steps, `<answer>` with the final result — jumped accuracy to 92%. They surfaced the thinking in the UI as "show your work" — students loved it.

**Scenario 2: The classifier that wasted tokens.**
A team added "think step by step" to their intent classifier "to make it smarter." Latency doubled, cost doubled, accuracy was unchanged. The task didn't need reasoning. They removed CoT and saved their budget for harder routes.

**Scenario 3: The agent that planned before acting.**
An agent was making poor tool choices on multi-step requests. The team added a CoT step at the start: "Before calling any tools, think through what the user wants and which tools you'll need, in what order." Tool sequence quality improved dramatically. The thinking step was a few hundred tokens; the avoided wrong-tool calls saved much more.

## Common mistakes to avoid

- **Adding CoT everywhere by default.** Wastes tokens on easy tasks.
- **Unstructured CoT.** Reasoning mixes with answer, hard to parse.
- **No way to skip the thinking in the response.** Surface it for audit but hide it in the UI by default.
- **CoT instead of evals.** CoT can boost a metric without solving the underlying issue; verify with evals.
- **Manual CoT when extended thinking exists.** For supported models, extended thinking is cleaner.
- **Forcing show-your-work in production UIs.** Users want answers, not a model's diary.

## Read more

- [Chain of thought prompting](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/chain-of-thought)
- [Extended thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking)

## Summary

- **Chain-of-thought** improves accuracy on multi-step, math, logic, and planning tasks.
- **Skip CoT on easy tasks** (lookups, classification, extraction).
- Use **structured CoT** with `<thinking>` and `<answer>` tags so output stays parseable.
- **Few-shot examples can demonstrate thinking** — the model picks up the pattern.
- **Extended thinking** on supported Claude models is the cleanest version — built-in, server-side, no visible reasoning to manage.
- **Don't blanket-enable CoT** — measure with evals, route hard questions to thinking, easy ones to direct prompts.

That wraps Module 2. Next module: tool use and agents.
