---
module: 2
position: 1
title: "Text generation and prompting — what actually works"
objective: "Write prompts that produce reliable output, using the patterns OpenAI's own prompt engineering guide endorses."
estimated_minutes: 15
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# Text generation and prompting — what actually works

## The puzzle

You hand the same prompt to two engineers:

> "Generate a marketing email for our new product launch."

Engineer A's results are passable. They send the email; it gets revised heavily.

Engineer B's results are *good*. They go out almost as-is. Customer engagement is measurably better.

What did Engineer B know? Not a magical incantation. They understood a handful of repeatable patterns that change how the model interprets the request. Once you see them, you'll write prompts that perform an order of magnitude better — and you'll stop chasing prompt-engineering folklore that doesn't work.

## The simple version

OpenAI's own prompt engineering guide endorses a small number of patterns that genuinely improve output:

1. **Be specific.** Vague prompts produce vague output. Specific prompts produce specific output.
2. **Provide context.** The model only knows what you tell it. Tell it.
3. **Use examples.** Showing the model 1–3 examples of the format you want is often more powerful than describing it.
4. **Use system instructions.** Set the role, tone, and constraints upfront.
5. **Ask for the format you want.** Structured output if you need machine-readable; clear formatting hints if not.
6. **Decompose hard problems.** When one prompt isn't enough, chain multiple smaller calls.

Get these right and most of the "advanced prompt engineering" folklore on the internet becomes unnecessary.

## The technical version

### Specificity beats elegance

A common pattern: someone writes a beautiful, elegant prompt — and the output is mediocre. The fix is usually not making the prompt more elegant; it's making it more *specific*.

**Vague:** "Write a marketing email."

**Specific:** "Write a marketing email for [product]. Audience: small business owners with 5–50 employees. Tone: friendly but professional, no exclamation marks, no superlatives like 'revolutionary' or 'game-changing.' Length: 120–160 words. Include a single CTA at the end linking to the product page. The email should focus on [specific benefit], not features."

The second prompt produces dramatically better output not because of any magic words — because the model has clear constraints to work within.

Rule of thumb: if a junior employee couldn't execute your prompt without follow-up questions, neither can the model.

### Provide context the model can't infer

The model knows what was in its training data up to its cutoff. It doesn't know:

- Anything specific to your business
- Anything that happened after the training cutoff
- Anything the user said in a previous session
- The current date, location, user identity (unless you tell it)
- Internal product names, terms of art, abbreviations
- Tone-of-voice guides, style guides, brand vocabulary

If your task depends on any of these, include them explicitly. Most "the model got it wrong" issues are actually "I didn't tell the model enough."

A practical pattern:

```
[system / instructions]
Role and tone: ...
Brand vocabulary: ...
Constraints: ...
Output format: ...

[user]
Today's date: 2026-05-19
User context: [name, role, language, etc.]
Specific task: ...
```

The model has everything it needs to do the right thing. Most prompts are missing 2–4 of those rows.

### Examples are more powerful than instructions

For tasks where format and style matter, one well-chosen example is often more effective than three paragraphs of description.

**Just instructions:**
"Extract the customer's company, role, and main concern from the email below. Return as JSON."

**Instructions + one example:**
"Extract the customer's company, role, and main concern from the email below. Return as JSON like this:

Email: 'Hi, I'm Sarah from Acme Corp's marketing team. We're struggling with attribution.'
Output: `{ "company": "Acme Corp", "role": "marketing", "concern": "attribution" }`

Now extract from this email: ..."

The example does work that no amount of instructions can match. The model now knows exactly what "JSON" you mean, what counts as "role," and what "concern" looks like in this domain.

**Two or three examples** is usually enough. Past five, you're often adding noise — and burning input tokens for diminishing return.

This pattern is sometimes called "few-shot prompting." The name is technical jargon for "include examples." Most prompt-engineering wisdom reduces to this.

### Use system instructions for stable context

The system message (or `instructions` in the Responses API) is the right place for things that don't change across turns:

- Role and personality
- Output format requirements
- Constraints (tone, length, what not to do)
- Brand vocabulary
- Domain-specific rules

The user message is the right place for the *specific* request: the question, the data to process, the user's actual ask.

Two reasons this distinction matters:

1. **Clarity.** Mixing stable instructions into every user message is hard to maintain.
2. **Prompt caching.** As covered in Module 1, stable content at the start of a prompt benefits from prompt caching. System instructions are perfect candidates.

### Ask for the format you want

If you want JSON, ask for JSON — or better, use structured output (next lesson). If you want a numbered list, ask for a numbered list. If you want plain prose, ask for plain prose.

The model defaults to "balanced, slightly formal explanatory prose" unless you tell it otherwise. That default is often wrong for your use case.

Specific format requests:

- "Respond in 1–2 sentences."
- "Return as a bulleted list, one bullet per item."
- "Use markdown formatting."
- "Use plain text only, no markdown."
- "Respond with only the answer, no preamble or sign-off."

The last one — "no preamble" — is surprisingly common. Models often start responses with "Sure! Here's..." or "Great question..." If your downstream code can't handle that, ask explicitly.

### Decompose hard problems

When a single prompt can't reliably do a complex task, split it into multiple calls.

**Bad pattern**: "Read this 50-page contract, identify the 10 most important clauses, summarize each in 2 sentences, then write a 3-paragraph executive summary of the risks." That's four operations stuffed into one prompt. Quality on all of them suffers.

**Better pattern**:
1. Call 1: Extract clauses + classifications.
2. Call 2 (parallel per clause): Summarize each clause.
3. Call 3: Write the executive summary using the structured outputs from calls 1 and 2.

Each call is simpler. Each result is verifiable. The pipeline is debuggable.

The trade-off: more API calls = more total tokens + latency. But often the quality jump is worth it, especially for tasks where one call would fail unreliably.

We cover the most common decomposition patterns in Module 3 (agents are essentially decomposition + tools + memory).

### Temperature, top_p, and other sampling parameters

Two main controls over how "creative" or "deterministic" output is:

- **`temperature`** (0–2, default 1). Lower = more deterministic, picks the most likely tokens. Higher = more random.
- **`top_p`** (0–1, default 1). Caps the cumulative probability mass considered at each token. Lower = more focused.

For most engineering tasks: **`temperature: 0` or `temperature: 0.2`** is the right starting point. Deterministic output is easier to test and debug. Use higher temperatures only when you specifically want variability (creative writing, brainstorming).

`top_p` rarely needs to be tuned separately. Default it.

Reasoning models often don't take temperature; their internal "thinking" handles variability differently. Check the model's docs.

### Patterns that don't work

A lot of prompt-engineering folklore on the internet doesn't survive scrutiny. Things you can mostly ignore:

- **"Please" / "thank you" / "you are an expert" boilerplate.** Doesn't measurably help on modern models.
- **All-caps emphasis or punctuation magic ("!!!").** Doesn't matter.
- **"Take a deep breath" / "think step by step" prefixes.** Used to help on older models. Modern models already do internal reasoning where appropriate; reasoning models do it explicitly.
- **Threatening or bribing the model.** Doesn't work. Don't.
- **Multi-page "expert role" descriptions.** Token-expensive, often unnecessary. A simple "You are a [role]" line usually suffices.

The pattern: anything that sounds like magic words probably is. Real prompt engineering is **clarity, specificity, examples, and format requests**.

### Iteration is the actual prompt engineering

The single biggest skill: **iterate fast on real examples**.

Workflow:

1. Pick 10–20 representative inputs (real or synthetic).
2. Write your first prompt.
3. Run it on all examples; review outputs.
4. Note failure modes (wrong format, missing info, wrong tone, etc.).
5. Adjust prompt to address the most common failure mode.
6. Re-run; compare.
7. Repeat until quality is acceptable.

This is unglamorous. It's also where the actual quality comes from. The patterns in this lesson are the *toolkit*; iteration is the *practice*.

## An analogy: writing a brief for a freelance contractor

Imagine you're hiring a freelance writer to produce 100 emails per week. You can either:

- Send a one-line brief and hope they figure it out
- Send a detailed brief with role, audience, tone, format, length, and an example email you love

The detailed brief produces dramatically better output. The freelancer isn't smarter or worse depending on the brief — they're producing what they were asked to produce. With a vague brief, they guess. With a clear brief, they execute.

OpenAI models are the same. The "skill" of prompt engineering is the skill of writing a clear brief for a fast, capable, but literal contractor.

## Three real-world scenarios

**Scenario 1: The team that switched models when they should have switched prompts.**
A team was getting mediocre results on GPT-5-mini and upgraded to full GPT-5. Cost went up 5×. Quality improved marginally. Audit found the prompt was a one-liner ("summarize this article"). With a specific, structured prompt (role, audience, length, format, example) — even on mini — output quality matched the GPT-5 result at a fraction of the cost.

**Scenario 2: The customer support classifier that doubled in accuracy from one example.**
A team had a classification prompt with 200 words of instructions. Accuracy: 78%. They added a single labeled example of each category — 4 examples total, ~100 tokens. Accuracy jumped to 94%. Lesson: one example often beats ten paragraphs of description.

**Scenario 3: The 5,000-token prompt that didn't need to be.**
An agent had a system prompt with extensive "personality" instructions, behavioral rules, and edge case handling. Token cost: 5,000 tokens per call. Audit found ~70% of the content wasn't load-bearing — the agent behaved the same on a 1,400-token prompt. Cost dropped accordingly. Lesson: bloated prompts are easy to write and hard to spot. Audit periodically.

## Common mistakes to avoid

- **Vague prompts.** "Write a marketing email" → vague output. Be specific.
- **Forgetting to tell the model what it can't infer.** Date, user context, brand voice, internal terminology.
- **Using instructions when examples would work better.** One labeled example often beats three paragraphs of description.
- **Not asking for the output format you want.** Models default to balanced prose. Ask specifically.
- **Putting stable instructions in the user message.** They belong in the system message — clearer maintenance and better caching.
- **Cargo-cult "expert" preambles.** "You are a world-class expert in..." is mostly fluff on modern models.
- **Tuning prompts without real examples.** Iterate on actual representative inputs, not in your head.

## Read more

- [Prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering) — OpenAI's own primary source
- [Prompting overview](https://platform.openai.com/docs/guides/prompting) — Newer prompting concepts
- [OpenAI Cookbook](https://cookbook.openai.com) — Working examples

## Summary

- Specific prompts produce specific output. Specificity is the most underrated lever.
- Provide context the model can't infer: dates, user details, brand voice, terminology.
- Examples often beat instructions. One well-chosen labeled example is more powerful than paragraphs of description.
- Use system instructions for stable context; user messages for the specific ask.
- Ask for the format you want — JSON, list, length, "no preamble." Defaults are rarely right for your use case.
- Decompose hard problems into multiple smaller calls when one prompt isn't reliable enough.
- Ignore prompt-engineering folklore that's just magic words. Real engineering is clarity, examples, format requests, and iteration on real inputs.

Next: structured output — how to make the model return JSON you can actually trust to parse, every time, without hand-rolling parsers.
