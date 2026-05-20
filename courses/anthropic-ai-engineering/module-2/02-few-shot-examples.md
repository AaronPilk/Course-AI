---
module: 2
position: 2
title: "Few-shot examples and how Claude uses them"
objective: "Build example sets that nudge Claude toward your target output."
estimated_minutes: 10
---

# Few-shot examples and how Claude uses them

## The puzzle

You can describe what you want Claude to produce ("respond in friendly tone, JSON format, with a single recommendation field"). Or you can *show* Claude what you want with 2–3 examples.

Showing wins most of the time. It's faster to write, more reliable, and produces output that matches the examples in subtle ways descriptions can't capture.

This is **few-shot prompting** — and on Claude, when paired with XML tags, it's one of the highest-leverage techniques in the toolkit.

## The simple version

Add 2–5 examples before your real input:

```
<examples>
<example>
<input>...sample input...</input>
<output>...sample output...</output>
</example>

<example>
<input>...another input...</input>
<output>...another output...</output>
</example>
</examples>

Now process this:
<input>${realInput}</input>
```

Claude reads the examples, infers the pattern, and applies it. Most tasks need 2–3 examples. Format-sensitive tasks may need 5–7.

## The technical version

### When few-shot wins

Few-shot is the right tool when:

- **Output format is specific and structured** — JSON with particular fields, a specific tone, a fixed schema.
- **The task has obvious good and bad versions** — and examples make the bar tangible.
- **You can't describe the rules** — the pattern is easier to show than explain.
- **Style or voice matters** — examples capture style better than adjectives.

### When few-shot is overkill

Skip examples when:

- The task is simple ("answer this question").
- Output format is freeform and the model handles it natively.
- You'd need so many examples that prompts become unwieldy.

If Claude does the task correctly without examples, save the tokens.

### Choosing good examples

Three rules:

**1. Cover the input distribution.** If real inputs come in 3 shapes (short, long, structured), have at least one example of each. Don't show 3 short ones if a quarter of your real inputs are long.

**2. Include edge cases.** Show how to handle ambiguity, refusals, missing fields, and weird inputs. The examples define the policy.

**3. Show good output exactly as you want it.** Format, tone, length. Claude treats examples as ground truth.

A common mistake: cherry-picking three easy examples that all look the same. The model learns the easy pattern and breaks on real traffic.

### Example structure

For structured tasks, wrap each example explicitly:

```
<examples>
<example>
<email>Hi, I never received my order #4421. Can you check?</email>
<output>
{
  "category": "order_status",
  "order_id": "4421",
  "urgency": "medium",
  "next_step": "lookup_order"
}
</output>
</example>

<example>
<email>This is the THIRD time I've been double-charged. Refund me NOW or I'm disputing with my bank.</email>
<output>
{
  "category": "billing_dispute",
  "urgency": "high",
  "next_step": "escalate_to_billing_team"
}
</output>
</example>

<example>
<email>What time do you guys open?</email>
<output>
{
  "category": "general_question",
  "urgency": "low",
  "next_step": "auto_reply_hours"
}
</output>
</example>
</examples>

Now classify:
<email>${customerEmail}</email>
```

Three examples covering routine, urgent-with-escalation, and trivial. The model gets the urgency scale, the action vocabulary, and the schema all at once.

### Vary your examples

If your three examples all use the same output sentence structure, Claude will copy that structure. Sometimes that's fine; sometimes you want variation. Vary the examples deliberately:

- Different input lengths.
- Different output lengths where appropriate.
- Different edge cases.
- Different "right answers" — show that the right answer depends on input.

### The classic chain-of-thought example

For reasoning tasks, examples can include the *thinking* alongside the answer:

```
<example>
<question>Sara has 3 apples. She gives 1 to Tom and eats 1. How many does she have?</question>
<thinking>Sara starts with 3. She gives 1 away, leaving 2. She eats 1, leaving 1.</thinking>
<answer>1</answer>
</example>
```

The model learns to think step-by-step in the same format. We'll go deep on chain-of-thought in Lesson 2.4.

### Negative examples (use carefully)

Sometimes you want to show what NOT to do. Be explicit about the label:

```
<bad_example>
<input>Customer is unhappy with shipping speed.</input>
<output>Sorry to hear that. Please contact support.</output>
<why_bad>Generic and unhelpful. Doesn't address the issue or offer next steps.</why_bad>
</bad_example>

<good_example>
<input>Customer is unhappy with shipping speed.</input>
<output>I'm sorry your order is taking longer than expected. Let me check the tracking — can you share your order number? In the meantime, here's how our shipping windows work: ...</output>
</good_example>
```

Used sparingly, negative examples sharpen the model's understanding of the bar. Used carelessly, they confuse it. Default to positive examples; use negatives only when there's a specific failure mode to teach against.

### Cost of examples

Examples cost input tokens on every call. For high-volume features, this adds up. Two ways to manage:

1. **Cache the example block** with `cache_control` (Lesson 5.1). Repeat calls pay ~10% of the example cost.
2. **Fine-tune** (covered in the OpenAI course as a general pattern — Anthropic also offers fine-tuning) to bake examples into the model so you can drop them from runtime prompts.

For most production features, caching examples is the right move long before fine-tuning.

### Examples and adversarial input

Examples shape behavior on *normal* inputs. They don't reliably shape behavior on *attacks*. For safety-sensitive features, your refusal rules need to be explicit in the system prompt (Lesson 1.3), not just demonstrated via examples.

## Three real-world scenarios

**Scenario 1: The classifier that improved 25 points.**
A team's intent classifier was at 68% accuracy with a description-only prompt. They wrote 4 examples covering common intents, edge cases, and a refusal case. Accuracy jumped to 93%. Same model, same input — different shape of prompt.

**Scenario 2: The tone problem solved by examples.**
A bot's tone was inconsistent. The team had been adding adjectives ("warm but professional"). They replaced the adjectives with 3 example responses written in the target voice. Tone became consistent across thousands of calls. Adjectives were too vague; examples made the voice concrete.

**Scenario 3: The runaway examples.**
A team added 15 examples to a prompt to be thorough. Cost ballooned and Claude started copying the examples too literally — outputs felt rote. They cut back to 4 examples that covered the distribution well and added `cache_control`. Cost dropped, outputs became natural again.

## Common mistakes to avoid

- **Cherry-picking easy examples.** The model learns the easy pattern; real traffic breaks it.
- **All examples in the same format.** Output ends up uniform; vary deliberately if you want variation.
- **Negative examples without a clear label.** Confuses the model. Label them `<bad_example>` and explain.
- **Too many examples.** Diminishing returns and copy-cat output. 2–5 covers most tasks.
- **No caching on stable example blocks.** Hot money flowing out as token costs.
- **Examples in adversarial settings.** Use system-level refusal rules, not just demonstrations.

## Read more

- [Multishot prompting](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting)
- [Be clear and direct](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct)

## Summary

- **Few-shot prompting** — show 2–5 examples and Claude infers the pattern.
- **Examples capture format, tone, and judgment** in ways descriptions can't.
- **Cover the input distribution** including edge cases; don't cherry-pick easy ones.
- **Wrap examples in XML tags** (`<example>`, `<input>`, `<output>`) for clean structure.
- **Cache stable example blocks** with `cache_control` to control cost at scale.
- For safety, lean on **system-level rules**; examples alone won't stop attacks.

Next: prefilling — shaping Claude's response before it generates a single token.
