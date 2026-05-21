---
module: 1
position: 3
title: "Datasets library — load + explore data"
objective: "Use datasets for training, evaluation, exploration."
estimated_minutes: 5
---

# Datasets library — load + explore data

## What Datasets is

HF Datasets = Python library for loading, processing, and sharing ML datasets:
```python
from datasets import load_dataset
ds = load_dataset("squad")  # Stanford QA dataset
```

5M+ rows loaded, ready to use.

## Loading datasets

```python
from datasets import load_dataset

# Public dataset
ds = load_dataset("imdb")

# Specific split
train = load_dataset("imdb", split="train")

# Subset
small = load_dataset("imdb", split="train[:1000]")

# Streaming (memory-efficient)
ds = load_dataset("c4", "en", streaming=True)
```

For: instant access to thousands of datasets.

## Common dataset types

- **Text classification.** IMDB, SST, AG News.
- **QA.** SQuAD, Natural Questions, MS MARCO.
- **Translation.** WMT, OPUS.
- **Summarization.** CNN/DailyMail, XSum.
- **NLI.** SNLI, MultiNLI.
- **Code.** CodeXGLUE, BigCode.
- **Speech.** Common Voice, LibriSpeech.
- **Image.** ImageNet, COCO, LAION.

For: standard benchmarks + training data.

## Dataset structure

A Dataset object:
```python
ds  # DatasetDict with 'train', 'validation', 'test'
ds["train"]  # Dataset object
ds["train"][0]  # First example (dict)
ds["train"]["text"]  # All texts (list)
ds["train"].features  # Schema
```

For: navigate + understand structure.

## Filtering + mapping

```python
# Filter
positive = ds["train"].filter(lambda x: x["label"] == 1)

# Map (transform)
def tokenize(example):
    return tokenizer(example["text"], truncation=True)
tokenized = ds["train"].map(tokenize, batched=True)

# Multi-step
ds["train"] = ds["train"].map(...).filter(...).map(...)
```

For: data preparation; preprocessing for training.

## Splits

Train / validation / test:
```python
# Splits if not provided
splits = ds["train"].train_test_split(test_size=0.2)
train = splits["train"]
test = splits["test"]
```

For: hold out evaluation data.

## Custom datasets

Load your own:
```python
# CSV
ds = load_dataset("csv", data_files="mydata.csv")

# JSON
ds = load_dataset("json", data_files="mydata.json")

# Multiple files
ds = load_dataset("csv", data_files={"train": "train.csv", "test": "test.csv"})

# Parquet (efficient)
ds = load_dataset("parquet", data_files="mydata.parquet")
```

For: working with your data.

## Saving + sharing datasets

```python
# Save to disk
ds.save_to_disk("/path/to/save")

# Push to Hub
ds.push_to_hub("my-username/my-dataset")
```

Then anyone can `load_dataset("my-username/my-dataset")`.

For: sharing your dataset with team / community.

## Streaming for huge datasets

For TB-scale datasets:
```python
ds = load_dataset("c4", "en", streaming=True)
# Iterate without loading all into memory
for example in ds["train"]:
    process(example)
```

For: train on data too large to fit in memory.

## Dataset viewer

Each HF dataset page has interactive viewer:
- Browse rows.
- Filter / search.
- See statistics.
- Check class distribution.

For: explore before downloading.

## Common operations

```python
# Shuffle
ds = ds["train"].shuffle(seed=42)

# Sort
ds = ds["train"].sort("length")

# Select columns
ds = ds["train"].select_columns(["text", "label"])

# Rename
ds = ds["train"].rename_column("text", "input")

# Cast types
ds = ds["train"].cast_column("label", ClassLabel(names=["neg", "pos"]))
```

For: data preparation.

## Tokenization for training

```python
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True)

tokenized_ds = ds["train"].map(tokenize_function, batched=True)
```

For: prepare text for transformer training.

## Image datasets

```python
ds = load_dataset("food101")
img = ds["train"][0]["image"]  # PIL Image

# Apply transforms
from torchvision import transforms
transform = transforms.Compose([
    transforms.Resize(224),
    transforms.ToTensor(),
])
def transform_fn(examples):
    examples["pixel_values"] = [transform(img) for img in examples["image"]]
    return examples
ds = ds.map(transform_fn, batched=True)
```

For: image task training.

## Dataset versioning

Datasets have versions via Git:
```python
ds = load_dataset("imdb", revision="v1.0")
```

For: reproducible experiments; pin dataset version.

## Mistakes to avoid

- **Loading huge datasets in memory.** Use streaming.
- **No tokenization batched.** Slow.
- **No splits.** No held-out evaluation.
- **Forget to shuffle.** Order bias in training.
- **Skip dataset viewer.** Discover quality issues post-download.

## Summary

- HF Datasets library: load + process + share datasets.
- `load_dataset("name")` for thousands of public datasets.
- Filter / map / split for preparation.
- Streaming for huge data.
- push_to_hub to share.
- Dataset viewer for exploration before download.

Next: model cards + licensing.
