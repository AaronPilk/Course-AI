---
module: 3
position: 1
title: "Trainer API — supervised fine-tuning"
objective: "Fine-tune models on your data with minimal code."
estimated_minutes: 5
---

# Trainer API — supervised fine-tuning

## What the Trainer is

`Trainer` class in Transformers handles fine-tuning loop:
- Optimizer setup.
- Learning rate scheduling.
- Checkpointing.
- Logging.
- Evaluation.

You provide model + data + hyperparameters; Trainer runs training.

## Basic fine-tuning

```python
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    TrainingArguments, Trainer
)
from datasets import load_dataset

# Load
ds = load_dataset("imdb")
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased", num_labels=2
)

# Tokenize
def tokenize(examples):
    return tokenizer(examples["text"], truncation=True, padding="max_length")
ds = ds.map(tokenize, batched=True)

# Training args
args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    learning_rate=2e-5,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
)

# Train
trainer = Trainer(
    model=model,
    args=args,
    train_dataset=ds["train"],
    eval_dataset=ds["test"],
)
trainer.train()
```

For: classification, simple NLP tasks.

## Key TrainingArguments

- **output_dir.** Where checkpoints save.
- **num_train_epochs.** Passes through data.
- **per_device_train_batch_size.** Batch size per GPU.
- **gradient_accumulation_steps.** Effectively larger batches.
- **learning_rate.** Typical 1e-5 to 5e-5 for fine-tuning.
- **warmup_steps.** LR ramp-up.
- **weight_decay.** Regularization.
- **fp16 / bf16.** Mixed precision.
- **eval_strategy.** When to evaluate.
- **save_strategy.** When to save.
- **logging_steps.** How often to log.

For: tune per dataset + hardware.

## Metrics computation

```python
import numpy as np
from sklearn.metrics import accuracy_score

def compute_metrics(eval_pred):
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=1)
    return {"accuracy": accuracy_score(labels, predictions)}

trainer = Trainer(..., compute_metrics=compute_metrics)
```

For: track quality during training.

## Data collators

For dynamic padding:

```python
from transformers import DataCollatorWithPadding
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

trainer = Trainer(..., data_collator=data_collator)
```

For: efficient batches without padding to max.

## Callbacks

Hooks into training loop:

```python
from transformers import EarlyStoppingCallback
trainer = Trainer(...,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
)
```

Custom callbacks for logging, monitoring, custom early stop.

## Multi-GPU training

Accelerate handles distribution automatically:

```python
accelerate launch your_training_script.py
```

Trainer detects multi-GPU; distributes across.

For: faster training; larger effective batch sizes.

## Mixed precision

Speed + memory:

```python
args = TrainingArguments(..., fp16=True)  # or bf16=True for A100/newer
```

For: 2x faster training; less memory.

## Gradient accumulation

For larger effective batches without VRAM:

```python
args = TrainingArguments(
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8  # Effective batch = 16
)
```

For: train large models on small GPUs.

## Saving + loading

```python
trainer.save_model("./my-finetuned")
# Loads model + tokenizer

# Load
model = AutoModelForSequenceClassification.from_pretrained("./my-finetuned")
```

## Push to Hub

```python
trainer.push_to_hub("my-username/my-finetune")
```

For: share fine-tuned model.

## Hyperparameter tuning

```python
def model_init():
    return AutoModelForSequenceClassification.from_pretrained(...)

best_run = trainer.hyperparameter_search(
    direction="maximize",
    n_trials=10,
    backend="optuna"
)
```

For: find best hyperparameters.

## Mistakes to avoid

- **Too high learning rate.** Catastrophic forgetting.
- **Too many epochs.** Overfitting.
- **No evaluation set.** Don't know if it's good.
- **No metrics.** Flying blind.
- **Wrong batch size.** OOM or undertrained.

## Summary

- Trainer = high-level training loop.
- TrainingArguments configure everything.
- compute_metrics for evaluation.
- Multi-GPU via Accelerate.
- Mixed precision + gradient accumulation for memory.
- Push to Hub to share.

Next: PEFT and LoRA.
