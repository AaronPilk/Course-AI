---
module: 2
position: 1
title: "Pipelines — one-line inference"
objective: "Use any HF model in a single Python call."
estimated_minutes: 5
---

# Pipelines — one-line inference

## What pipelines are

The pipeline() function in Transformers is the highest-level API. Pass a task name; get a ready-to-use callable:

```python
from transformers import pipeline

generator = pipeline("text-generation", model="meta-llama/Llama-3.2-1B-Instruct")
result = generator("Tell me a joke about AI")
```

For: getting started, demos, prototyping, simple production.

## Common pipeline tasks

```python
# Text generation
gen = pipeline("text-generation")

# Sentiment analysis
sa = pipeline("sentiment-analysis")

# Summarization
summ = pipeline("summarization")

# Translation
trans = pipeline("translation_en_to_fr")

# Question answering
qa = pipeline("question-answering")
answer = qa(question="What is HF?", context="Hugging Face is...")

# NER
ner = pipeline("ner", aggregation_strategy="simple")

# Zero-shot classification
zsc = pipeline("zero-shot-classification")
zsc("I love this product", candidate_labels=["positive", "negative"])

# Image classification
ic = pipeline("image-classification")

# Image captioning
cap = pipeline("image-to-text")

# Speech recognition (Whisper)
asr = pipeline("automatic-speech-recognition", model="openai/whisper-large-v3")
```

Each loads appropriate model + tokenizer + handles preprocessing / postprocessing.

## Specifying models

Without specifying: HF picks default for task.

```python
# Default model for task
sentiment = pipeline("sentiment-analysis")

# Specific model
sentiment = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

# Different model size
gen = pipeline("text-generation", model="meta-llama/Llama-3.1-8B-Instruct")
```

For: control which model used.

## Device selection

```python
# CPU (default)
pipe = pipeline("text-generation", model="...", device=-1)

# GPU 0
pipe = pipeline("text-generation", model="...", device=0)

# Auto (uses Accelerate)
pipe = pipeline("text-generation", model="...", device_map="auto")
```

For: control performance + memory.

## Batching

```python
results = pipe(["text 1", "text 2", "text 3"], batch_size=8)
```

For: efficient bulk processing.

## Common arguments

```python
gen = pipeline("text-generation", model="...")
result = gen("Prompt", 
    max_new_tokens=100,
    temperature=0.7,
    top_p=0.9,
    do_sample=True,
    num_return_sequences=3
)
```

For: tune generation.

## Memory considerations

Large models = large memory:
- Use `device_map="auto"` (Accelerate) for multi-GPU.
- Use `torch_dtype=torch.float16` for half precision.
- Use `load_in_8bit=True` (bitsandbytes) for INT8.
- Use `load_in_4bit=True` for INT4.

```python
pipe = pipeline("text-generation",
    model="meta-llama/Llama-3.1-8B-Instruct",
    torch_dtype=torch.float16,
    device_map="auto"
)
```

For: fit large models on consumer GPUs.

## Chat templates

Modern LLMs use specific chat formats:

```python
messages = [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "Hello"}
]
pipe(messages, max_new_tokens=200)
```

For: instruction-tuned models; correct chat formatting.

## Streaming output

For real-time token generation:

```python
from transformers import TextStreamer
streamer = TextStreamer(tokenizer)
model.generate(input_ids, streamer=streamer, max_new_tokens=200)
```

For: chat-style UI.

## Mistakes to avoid

- **No device selection.** Slow CPU when GPU available.
- **No batching.** 100x slower for bulk work.
- **Loading huge model on small GPU.** OOM crash; use quantization.
- **No chat template for instruct model.** Bad outputs.

## Summary

- `pipeline()` = one-line model usage.
- Tasks: text-generation, sentiment, summarization, QA, NER, image, audio, etc.
- Specify model parameter for control.
- Device + quantization for memory.
- Chat template for instruct models.

Next: tokenizers + lower-level API.
