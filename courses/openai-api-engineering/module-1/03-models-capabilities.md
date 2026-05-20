---
module: 1
position: 3
title: "Models, capabilities, and how to pick the right one"
objective: "Choose between GPT-5 family, reasoning models, and specialized variants based on task, budget, and latency."
estimated_minutes: 13
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# Models, capabilities, and how to pick the right one

## The puzzle

You open OpenAI's model list. You see:

- `gpt-5`, `gpt-5-mini`, `gpt-5-nano`
- `gpt-5-thinking` and related reasoning models
- `text-embedding-3-large` and `text-embedding-3-small`
- Image generation models, video generation models, audio models
- Older models still listed for legacy use
- "Specialized models" for deep research, computer use, code interpretation

Each costs differently. Each performs differently. Some are faster. Some are smarter. Some only do one thing.

Which one do you use for your feature?

Picking the wrong model is one of the most common (and expensive) mistakes in OpenAI engineering. This lesson teaches the decision framework.

## The simple version

Three things drive model choice:

1. **The task.** Is it text generation? Reasoning? Embedding? Vision? Audio?
2. **The quality requirement.** Does this need to be "good enough" or "as accurate as possible"?
3. **The cost/latency budget.** How fast does it need to be? How much can each request cost?

A sensible default for most text tasks: **start with `gpt-5-mini`**. It's fast, cheap, and competent for the vast majority of tasks. Only move up to `gpt-5` or a reasoning model when you measurably need more capability. Only move down to `gpt-5-nano` when you measurably need lower cost or latency.

For embeddings, **use `text-embedding-3-large` at reduced dimensions** (e.g., 1536) — best quality at manageable size.

For images, vision, and audio: use the specialized models for the specific modality.

That's the short answer. Now let's get useful.

## The technical version

### The GPT-5 family

The current general-purpose text models. Roughly:

- **`gpt-5-nano`** — smallest, fastest, cheapest. Good for high-volume simple tasks: extracting structured fields, simple classification, transforming short text.
- **`gpt-5-mini`** — the workhorse. Strong general capability at moderate cost. Default starting point for most text features.
- **`gpt-5`** — the largest non-reasoning model. Substantially better at complex tasks, long-context understanding, and following intricate instructions. Higher cost, slower.

The three are *not* "good, better, best" linearly. They're optimized differently:

- For *simple* tasks: nano performs almost as well as full GPT-5 at a fraction of the cost. Using GPT-5 for "extract the name from this string" is overkill.
- For *complex* tasks: GPT-5 measurably outperforms mini, which outperforms nano. The gap widens as task difficulty grows.

The right move: **build with mini, evaluate quality, move up or down based on data, not vibes.**

### Reasoning models

A distinct category: **reasoning models** spend internal "thinking" tokens before producing output.

The lineup (names approximate; check the docs for current models):

- **`gpt-5-thinking` / o-series models** — full reasoning, slow, accurate on hard problems
- **`gpt-5-thinking-mini`** — smaller reasoning model, balance of capability and speed
- Reasoning effort can often be tuned via `reasoning_effort: "minimal" | "low" | "medium" | "high"`

When reasoning models help:

- **Math.** Reasoning models dramatically outperform regular models on multi-step arithmetic and word problems.
- **Code.** Reasoning models catch subtle bugs and write more correct code, especially for complex problems.
- **Logic puzzles, planning, multi-step decisions.** Anything where "thinking ahead" matters.
- **Ambiguous inputs that need careful interpretation.** Where the right answer depends on careful parsing of the request.

When reasoning models *don't* help:

- **Simple text generation.** Summarization, rewriting, formatting — regular models are faster and just as good.
- **Latency-sensitive flows.** Reasoning adds seconds of latency. For interactive UIs where the user is waiting, regular models are usually better.
- **High-volume cheap tasks.** Reasoning tokens cost real money. At scale, the difference can be a 5–10× cost multiplier.

The decision rule: **use a reasoning model when accuracy on a hard problem matters more than speed or cost. Use a regular model otherwise.**

### The embedding models

For semantic search, RAG, deduplication, classification by similarity:

- **`text-embedding-3-large`** — best quality. 3,072-dimensional vectors by default. Supports reducing dimensions via the `dimensions` parameter (e.g., to 1,536 or even 256) with relatively modest quality loss.
- **`text-embedding-3-small`** — cheaper, lower quality. 1,536-dimensional default. Fine for low-stakes use cases.
- Older embedding models (`text-embedding-ada-002` etc.) are legacy. Use `3-*` for new code.

The standard recommendation: **`text-embedding-3-large` at `dimensions: 1536`**. You get the quality of the large model with vectors small enough to fit pgvector's HNSW index limits and to keep vector storage costs reasonable.

Embeddings cost is per input token, paid only once (when you create the vector). Once stored, similarity search is essentially free.

### Image, video, and audio models

For each modality, OpenAI has specialized models:

- **Image generation**: `gpt-image-1` (or current equivalent). Generates images from text prompts. Variants for editing existing images.
- **Vision** (image understanding): Built into the GPT-5 family. Pass an image as part of input; the same model interprets it.
- **Audio transcription** (speech-to-text): Whisper and successor models.
- **Text-to-speech**: `tts-1` and variants. Converts text into audio.
- **Video generation**: Sora and successor models, where available.

When in doubt: **use vision (image input → text output) directly via GPT-5; use specialized models when you need generation in a specific modality.**

### Specialized capabilities

A few models / capabilities target specific use cases:

- **Deep research** — multi-step research workflows, available as a capability/tool.
- **Computer use** — models that can drive a browser or desktop. The "Operator" family.
- **Code interpreter** — sandboxed Python execution available as a tool.
- **Realtime models** — speech-to-speech and low-latency streaming, used via the Realtime API.

These aren't usually "models you choose" — they're capabilities you enable. They show up as configurable tools on regular GPT-5 family calls, or as dedicated APIs.

### Context window: not all the same

Different models support different context windows:

- Current GPT-5 family: ~200K–400K tokens (check current docs for specifics).
- Reasoning models: similar, plus you also pay for reasoning tokens.
- Embeddings: input limit of a few thousand tokens per call.

The context window affects two engineering decisions:

1. **Does my input fit?** Long documents, long conversation histories, long retrieved contexts — all consume window.
2. **Will quality degrade?** Even within the window, very long inputs degrade quality (the "lost in the middle" effect). For inputs over ~30K tokens, consider retrieval over stuffing.

### The cost game

The general pattern (specific prices change; check current pricing):

- Nano models: cheapest per token, by an order of magnitude or more.
- Mini models: moderate cost, the workhorse.
- Full GPT-5: substantially more expensive.
- Reasoning models: cost reasoning tokens *in addition to* normal input/output tokens. Can be 5–10× the base cost.
- Embeddings: very cheap per token; storage and query of vectors is the real cost at scale.
- Image generation, video, audio: priced per output (per image, per second of video, etc.), not per token.

The practical implication: model choice has a 100× cost range across the catalog for "the same task." Picking right matters financially.

### The actual decision tree

Here's the framework I use:

1. **What modality?**
   - Text only → GPT-5 family
   - Text + images in → GPT-5 family with vision
   - Image out → image generation model
   - Audio in → transcription model (or Realtime)
   - Audio out → TTS model (or Realtime)
   - Embeddings → embedding model

2. **For text tasks: is it primarily reasoning-heavy?**
   - Math, code correctness, complex planning, hard logic → reasoning model
   - Everything else → regular GPT-5 family

3. **Within the GPT-5 family, what's the difficulty?**
   - Simple extraction / classification / transformation → nano
   - Most general-purpose tasks → mini
   - Complex tasks needing strong instruction-following → full GPT-5

4. **Evaluate. Don't guess.**
   - Whenever you can, set up a quick eval that runs your prompt on a few real examples against different models. The 10-minute investment usually pays for itself in the first month.

### Picking specifics: real examples

**"Customer support email categorizer."** Simple classification. Nano. ~$0.001 per email.

**"Generate marketing copy from a product description."** General text gen. Mini. ~$0.01 per call.

**"Write code that handles complex edge cases."** Reasoning-heavy. `gpt-5-thinking` with `reasoning_effort: high`. ~$0.10–$0.30 per call.

**"Semantic search across customer documentation."** Embeddings. `text-embedding-3-large` at 1536 dims. ~$0.001 to embed a typical doc; queries effectively free.

**"Generate a product image from a description."** Image generation. Image model. ~$0.05 per image.

**"Summarize a 50-page PDF."** Vision + text. GPT-5 family with vision input (passes pages as images). Mini for cost-sensitive, full for quality. ~$0.05–$0.30 depending on model.

**"Multi-step research that requires browsing the web."** Deep research capability or a reasoning model with tool use. Higher cost; matched to the task complexity.

## An analogy: picking the right vehicle

You wouldn't drive a Ferrari to deliver pizzas, and you wouldn't deliver concrete with a Tesla Roadster. Each vehicle is optimized for a different load, speed, range, and cost profile.

OpenAI's model lineup is the same. A reasoning model is a heavy-duty truck for hard problems. A nano model is an electric scooter for short, frequent trips. GPT-5 mini is a Toyota Camry — fits most needs, reliable, reasonably economical.

Picking the wrong model is paying $200 in gas to deliver $5 of pizza, or trying to deliver concrete in a sports car. Both happen all the time in production OpenAI code. Most teams overpay by 5–10× because they default to GPT-5 or even a reasoning model when nano or mini would do.

The fix is the same as the vehicle metaphor: match the tool to the load. Start small. Move up only when you measurably need it.

## Three real-world scenarios

**Scenario 1: The "everything on GPT-5" cost blowup.**
A startup defaulted to full GPT-5 for every text feature, "because it's the best." Their monthly bill grew to $40K. Audit found 70% of calls were for simple tasks (categorization, extraction, formatting) where nano or mini would have produced identical output. They reorganized the prompts by task complexity and dropped costs to $8K/month with no measurable quality difference on the simple tasks.

**Scenario 2: The reasoning model that made the product unusable.**
A team building a chat product switched to a reasoning model for all turns, hoping for better answers. Latency went from 2 seconds to 12 seconds per response. User engagement dropped 60% — people weren't willing to wait. The fix: route by query type. Simple turns to a regular model; only complex queries (detected via a quick classification) to the reasoning model. Latency averages dropped back below 3 seconds; quality stayed high where it mattered.

**Scenario 3: The wrong embedding model.**
A RAG system used the cheaper `text-embedding-3-small`. Retrieval quality was inconsistent — sometimes the right chunk was retrieved, sometimes not. They switched to `text-embedding-3-large` at 1536 dims. Retrieval accuracy jumped substantially. Embedding cost roughly doubled (still pennies per document); query cost was unchanged. The investment was worth it.

## Common mistakes to avoid

- **Defaulting to the most expensive model "just to be safe."** You're paying 10× for capability you may not need.
- **Defaulting to a reasoning model for everything.** Slow + expensive without commensurate accuracy gain on simple tasks.
- **Not evaluating model choice with actual data.** "It feels better" isn't enough; measure.
- **Using older embedding models (`ada-002` etc.) on new code.** The `3-*` family is better at the same or lower price.
- **Generating images with a regular GPT-5 model.** Won't work — you need a dedicated image model.
- **Sending huge contexts to nano.** Small models also have shorter effective context utility; long inputs degrade nano output faster than mini or full.

## Read more

- [Models documentation](https://platform.openai.com/docs/models) — Current model list, capabilities, and pricing
- [Reasoning models guide](https://platform.openai.com/docs/guides/reasoning) — When and how to use reasoning models
- [Embeddings guide](https://platform.openai.com/docs/guides/embeddings) — How to use embedding models effectively

## Summary

- Start with `gpt-5-mini` for most text tasks. Move down to nano for high-volume simple work, up to GPT-5 or reasoning models when measurably needed.
- Reasoning models help on math, code, planning, and complex logic. They cost more and are slower; don't use them for everything.
- For embeddings: `text-embedding-3-large` at `dimensions: 1536` is the sensible default.
- Specialized modalities (image, video, audio) need their dedicated models.
- Model choice has 100× cost variance across the catalog. Match the model to the task — don't default to the biggest.
- Evaluate with real data. "It feels better" isn't enough.

Next: tokens, context windows, and the cost game in detail. After this lesson, you can pick the right model; after the next, you'll know exactly what each request will cost before you send it.
