---
module: 5
position: 2
title: "Multi-model pipelines (chained inference)"
objective: "Combine multiple models for sophisticated workflows."
estimated_minutes: 5
---

# Multi-model pipelines (chained inference)

## Why multiple models

One model rarely does everything. Pipelines chain specialized models:
- Translation → summarization → translation back.
- Speech-to-text → translation → text-to-speech.
- Image → caption → embedding → search.
- Document → OCR → NER → categorization.

Each stage uses the best model for that task.

## Pattern: ASR + LLM

For voice assistants:
1. Audio → Whisper (speech-to-text).
2. Text → LLM (generate response).
3. Text → TTS (speech synthesis).

```python
asr = pipeline("automatic-speech-recognition", "openai/whisper-large-v3")
llm = pipeline("text-generation", "meta-llama/Llama-3.2-3B-Instruct")
tts = pipeline("text-to-speech", "suno/bark-small")

text = asr(audio_path)["text"]
response = llm(text)[0]["generated_text"]
audio = tts(response)
```

## Pattern: classify + branch

Decide which model to use:
1. Classifier determines query type.
2. Route to specialist model.
3. Return response.

```python
classifier = pipeline("zero-shot-classification")
labels = ["coding", "general", "math"]

result = classifier(query, candidate_labels=labels)
top_label = result["labels"][0]

if top_label == "coding":
    response = code_model(query)
elif top_label == "math":
    response = math_model(query)
else:
    response = general_llm(query)
```

For: specialized models per query type.

## Pattern: cascade by complexity

Try cheap first; fall back to expensive:
1. Small model attempts.
2. If confidence low / specific keywords / failure: use larger model.
3. Save cost.

For: most queries handled cheaply; complex use heavy.

## Pattern: ensemble

Multiple models vote:
1. Run query through 3 models.
2. Aggregate (majority vote, average, weighted).
3. Return consensus.

For: critical decisions; reduce single-model bias.

## Pattern: agentic loop

Tool-using AI:
1. LLM decides which tool to call (calculator, web search, code interpreter).
2. Tool runs.
3. Result returned to LLM.
4. LLM continues / decides next step.

Loops until task complete.

For: complex reasoning + actions.

## Multi-modal pipelines

Mixing modalities:
- **Image → text:** vision LM captions.
- **Text → image:** Stable Diffusion / Flux generates.
- **Audio → text → analyze.**
- **Video → frames → captions → summary.**

For: rich AI applications.

## LangChain / LlamaIndex

Frameworks for orchestrating multi-model pipelines:
- Chains: linear sequences.
- Agents: tool-using loops.
- Retrievers + LLMs together.
- Memory + state management.

For: complex production pipelines without rebuilding orchestration.

## Async parallel processing

For independent stages:
```python
import asyncio

async def process_query(q):
    results = await asyncio.gather(
        classify(q),
        embed(q),
        keyword_extract(q)
    )
    return combine(results)
```

For: latency reduction; parallel computation.

## Streaming through pipeline

For real-time chains:
- Each stage produces output as available.
- Downstream stage starts on partial input.
- Total latency less than serial.

For: chat applications, real-time analysis.

## Error handling

In pipelines:
- Each stage can fail (model timeout, API error, OOM).
- Pipeline must handle failures.
- Retry, fallback, graceful degradation.

For: production robustness.

## Latency budgeting

For real-time chains:
- Each stage adds latency.
- Total = sum of stages (sequential).
- Budget: 3 stages × 500ms = 1.5 sec total.

Optimize bottleneck stage; parallelize where possible.

## Cost in chains

Each model call costs. For chain of 3 stages × 100K queries/day:
- 300K total model calls/day.
- Costs add per stage.

Right-size each stage; cache where possible.

## Common production chains

**Document QA:**
1. PDF → OCR (if scanned).
2. Text → chunking.
3. Chunks → embedding → vector DB.
4. Query → embedding → retrieve.
5. Retrieved chunks + query → LLM → answer.

**Voice assistant:**
1. Audio → Whisper → text.
2. Text + context → LLM → response.
3. Response → TTS → audio.

**Image analysis:**
1. Image → object detection → boxes.
2. Crops → vision LM → descriptions.
3. Descriptions → LLM → narrative summary.

**Translation:**
1. Source text → translation model → target text.
2. Optionally: target → back-translate → verify.

## Mistakes to avoid

- **Monolithic single-model approach.** When chain would be better.
- **No error handling between stages.** Cascade failures.
- **Sequential when parallel possible.** Wasted latency.
- **No caching between stages.** Repeated work.

## Summary

- Multi-model pipelines chain specialized models.
- Patterns: ASR+LLM, classify+branch, cascade, ensemble, agentic.
- LangChain / LlamaIndex for orchestration.
- Async + parallel for latency.
- Error handling between stages.
- Cost adds per stage; optimize each.

Next: monitoring + versioning.
