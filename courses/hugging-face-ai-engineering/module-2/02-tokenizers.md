---
module: 2
position: 2
title: "Tokenizers, Models, and the lower-level API"
objective: "Use Transformers' building blocks directly."
estimated_minutes: 5
---

# Tokenizers, Models, and the lower-level API

## When to drop down from pipelines

For:
- Custom preprocessing.
- Direct logits / hidden states access.
- Custom generation loops.
- Production optimization.
- Research / experimentation.

Pipelines handle 95% of cases; lower-level for the 5%.

## Tokenizers

Convert text ↔ token IDs:

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.2-1B")

# Text to tokens
tokens = tokenizer("Hello world")
# {'input_ids': [1, 9906, 1917], 'attention_mask': [1, 1, 1]}

# Tokens back to text
text = tokenizer.decode([1, 9906, 1917])
# "Hello world"
```

For: any model needs this preprocessing.

## Tokenization details

```python
# Batch
tokens = tokenizer(["text 1", "text 2"], padding=True, truncation=True, return_tensors="pt")

# Max length
tokens = tokenizer("long text", max_length=512, truncation=True)

# Without special tokens
tokens = tokenizer("text", add_special_tokens=False)
```

For: control over preprocessing.

## Loading models

```python
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.2-1B-Instruct",
    torch_dtype=torch.float16,
    device_map="auto"
)
```

`AutoModelFor...` selects the right architecture for the task.

## Common AutoModel types

- **AutoModel.** Base; no task head.
- **AutoModelForCausalLM.** Text generation (GPT-style).
- **AutoModelForSequenceClassification.** Classification.
- **AutoModelForTokenClassification.** NER, POS.
- **AutoModelForQuestionAnswering.** QA.
- **AutoModelForMaskedLM.** BERT-style.
- **AutoModelForSeq2SeqLM.** Translation, summarization.
- **AutoModelForImageClassification.** Vision.

Pick the right class for your task.

## Generation manually

```python
import torch

prompt = "Once upon a time"
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

outputs = model.generate(
    **inputs,
    max_new_tokens=100,
    temperature=0.7,
    top_p=0.9,
    do_sample=True
)

response = tokenizer.decode(outputs[0], skip_special_tokens=True)
```

For: control over generation parameters.

## Direct model access

```python
# Get logits + hidden states
outputs = model(**inputs, output_hidden_states=True)
logits = outputs.logits  # (batch, seq_len, vocab_size)
hidden = outputs.hidden_states  # tuple per layer
```

For: research; custom inference logic.

## Embeddings

```python
from transformers import AutoModel

model = AutoModel.from_pretrained("BAAI/bge-large-en-v1.5")
outputs = model(**inputs)
embeddings = outputs.last_hidden_state[:, 0]  # CLS token
# Or mean-pool
embeddings = outputs.last_hidden_state.mean(dim=1)
```

For: RAG, similarity search, custom embedding workflows.

## SentenceTransformers wrapper

For embeddings specifically:

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("BAAI/bge-large-en-v1.5")
embeddings = model.encode(["sentence 1", "sentence 2"])
# Numpy array (2, 1024)
```

Easier than raw transformers for embeddings.

## Chat templates

For instruct models:

```python
messages = [{"role": "user", "content": "Hello"}]
prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
outputs = model.generate(**inputs, max_new_tokens=200)
```

For: correct chat format per model.

## Saving + loading

```python
# Save
model.save_pretrained("./my-model")
tokenizer.save_pretrained("./my-model")

# Load
model = AutoModel.from_pretrained("./my-model")
tokenizer = AutoTokenizer.from_pretrained("./my-model")
```

For: caching; fine-tuned model export.

## Pushing to Hub

```python
model.push_to_hub("my-username/my-model")
tokenizer.push_to_hub("my-username/my-model")
```

For: sharing your model.

## Mistakes to avoid

- **Wrong AutoModel class.** Crashes or wrong output.
- **No padding for batches.** Errors.
- **Forget to move to device.** Slow CPU inference.
- **No chat template for instruct.** Bad output.

## Summary

- AutoTokenizer + AutoModel for direct control.
- AutoModelFor[Task] picks right architecture.
- model.generate() for custom generation.
- Direct logits/hidden states for research / embeddings.
- SentenceTransformers wrapper for embeddings.
- Chat templates for instruct models.

Next: local vs. Inference API.
