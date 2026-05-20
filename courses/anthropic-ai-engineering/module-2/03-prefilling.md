---
module: 2
position: 3
title: "Prefilling and shaping Claude's response"
objective: "Use response prefilling to lock format and skip preambles."
estimated_minutes: 9
---

# Prefilling and shaping Claude's response

## The puzzle

You ask Claude for a JSON object. Sometimes it returns clean JSON. Sometimes it returns "Sure! Here's the JSON: ```json {...}```". Sometimes it adds a paragraph of preamble. Your parser breaks on every variation.

You could add post-processing for every case. Or you can use **prefilling** — a Claude-specific feature where you start the assistant's response yourself, and Claude continues from there. The preamble goes away because there's no room for it.

## The simple version

In the Messages API, you can include an `assistant` message at the *end* of your `messages` array. Claude treats it as the start of its own response and continues from where you left off:

```js
messages: [
  { role: "user", content: "Generate a JSON object describing a cat named Mittens." },
  { role: "assistant", content: "{" }
]
```

Claude continues: `"name": "Mittens", "species": "cat", ...}` — no preamble, no `Sure!`, no markdown fence.

Prefilling is your "skip the preamble" button. Use it whenever you need to lock the response format.

## The technical version

### Mechanics

The Messages API accepts an `assistant` message as the last item. When present, Claude:

1. Treats it as the start of the response.
2. Generates a continuation from that point.
3. Returns only the continuation (the prefilled text is NOT in the response — you already had it).

```js
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 500,
  messages: [
    { role: "user", content: "Extract the entities from: 'Alex met Sam at Joe's Diner in Brooklyn.'" },
    { role: "assistant", content: "<entities>\n" }
  ]
});

console.log(response.content[0].text);
// Output:
// <person>Alex</person>
// <person>Sam</person>
// <place>Joe's Diner</place>
// <place>Brooklyn</place>
// </entities>
```

The response starts mid-document because Claude is continuing.

### When to use prefilling

Prefill when:

- **You need strict output format.** Locking the start guarantees the format.
- **You want to skip preamble.** "Sure! Here's..." vanishes.
- **You're producing tagged output.** Prefill with the opening tag.
- **You want to constrain the response style.** Prefill the first sentence in the desired tone.

### Common prefill patterns

**JSON output:**

```js
{ role: "assistant", content: "{" }
```

Or for more control:

```js
{ role: "assistant", content: "{\n  \"name\":" }
```

**Tagged XML output:**

```js
{ role: "assistant", content: "<analysis>\n<sentiment>" }
```

**Locked-format response:**

```js
{ role: "assistant", content: "TL;DR: " }
```

**Refusal pattern (combined with system rules):**

```js
{ role: "assistant", content: "I can only help with FitTrack-related questions." }
```

For the refusal case, you typically use prefilling conditionally — only when the input matches an off-topic pattern.

### Combining prefill with stop sequences

Sometimes you want to extract a specific piece without the full response. Pair prefill with `stop_sequences`:

```js
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 200,
  messages: [
    { role: "user", content: "Translate to French: 'Hello, how are you?'" },
    { role: "assistant", content: "<french>" }
  ],
  stop_sequences: ["</french>"]
});

console.log(response.content[0].text);
// "Bonjour, comment allez-vous ?"
```

The model produces only the translation, stopping before it can wrap up with extra commentary.

### Prefill + few-shot = bulletproof structured output

Stack prefilling with few-shot examples to get extremely reliable structured output:

```js
const messages = [
  {
    role: "user",
    content: `Extract structured data from emails.

<examples>
<example>
<email>Hi, I want to cancel my account.</email>
<output>{"intent": "cancel_account", "urgency": "low"}</output>
</example>
<example>
<email>I've been overcharged twice this month, fix it now.</email>
<output>{"intent": "billing_issue", "urgency": "high"}</output>
</example>
</examples>

Process this:
<email>${userEmail}</email>`
  },
  { role: "assistant", content: "{" }
];
```

The examples teach the schema; the prefill locks the format. You're nearly guaranteed clean JSON.

### What you can't prefill

A few limits:

- **Tool use responses** can't be prefilled. The tool calling protocol manages the response shape.
- **Very long prefills** are still bound by the model's `max_tokens` for the continuation.
- **You can't force Claude to lie or be unsafe** via prefill. Anthropic's training keeps safety behavior in place even with prefilled openings. (Don't try.)

### Prefill etiquette

Two notes:

1. **Don't leave a trailing space.** If your prefill ends with `"name": "`, Claude continues right after the quote. A trailing space (`"name": " `) can cause the model to insert a leading space awkwardly.

2. **Don't over-constrain.** A long prefill is essentially you writing the response. Use prefill to anchor the start; let Claude do the actual generation.

## Three real-world scenarios

**Scenario 1: The parser that stopped breaking.**
A team's JSON parser broke 5% of the time because Claude occasionally returned ` ```json {...}``` ` instead of raw JSON. They added `{ role: "assistant", content: "{" }` as a prefill. Markdown fences disappeared. Parse failures dropped to zero.

**Scenario 2: The chatbot that skipped the 'Sure!'.**
Every chatbot response opened with "Sure!" or "I'd be happy to help." Annoying for short factual questions. The team added a prefill that started with the first relevant word for that response type. Bot felt sharper instantly.

**Scenario 3: The translation extractor.**
A translation feature kept returning the translation plus a paragraph explaining the phrase. They prefilled with `<translation>` and added a stop sequence at `</translation>`. Output became just the translation. Latency improved too (less to generate).

## Common mistakes to avoid

- **Trailing space in the prefill.** Causes awkward double-space in the output.
- **Long prefills.** You're not generating; you're writing. Keep prefill short and anchoring.
- **Forgetting prefilled text isn't in the response.** Concatenate it yourself if you need the full output.
- **Trying to prefill safety bypass.** Doesn't work; will fail or refuse anyway.
- **Skipping prefill on structured output.** Easy reliability win you're leaving on the table.

## Read more

- [Prefill Claude's response](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prefill-claudes-response)
- [Stop sequences](https://docs.anthropic.com/en/api/messages#body-stop-sequences)

## Summary

- **Prefilling** = adding an `assistant` message at the end of `messages` to start Claude's response.
- Claude continues from your prefill, **skipping preamble** and locking format.
- **Pair with few-shot and tags** for bulletproof structured output.
- **Pair with stop sequences** to extract a specific fragment.
- Prefilled text isn't in the response — **concatenate** if you need the full output.
- Don't overuse: short anchoring prefills beat long ones.

Next: chain-of-thought — when adding thinking steps actually improves quality.
