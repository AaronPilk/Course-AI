---
module: 3
position: 2
title: "PEFT and LoRA for efficient training"
objective: "Fine-tune large models on small hardware."
estimated_minutes: 5
---

# PEFT and LoRA for efficient training

## What PEFT is

PEFT = Parameter-Efficient Fine-Tuning. HF library offering techniques to fine-tune large models efficiently:
- **LoRA.** Low-Rank Adaptation; most popular.
- **QLoRA.** LoRA + 4-bit quantized base.
- **Prefix Tuning.** Learnable prefix tokens.
- **P-Tuning.** Variant.
- **AdaLoRA.** Adaptive LoRA.

All train a small fraction of parameters while keeping base model mostly frozen.

## LoRA explained

LoRA adds small "adapter" matrices to each layer:
- Base weight: W (frozen).
- Adapter: W + B*A (where B and A are small matrices).
- Train: only A and B.

Parameters trained: 0.1-1% of full model.

For: efficient fine-tuning; same quality as full fine-tuning for many tasks.

## QLoRA

QLoRA combines:
- 4-bit quantized base model (memory savings).
- LoRA adapter for trainable parameters.

Result: fine-tune 70B model on single 24-48 GB GPU.

For: most practical large-model fine-tuning in 2026.

## PEFT setup

```python
from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM

# Load model (quantized)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    load_in_4bit=True,
    device_map="auto"
)

# Configure LoRA
lora_config = LoraConfig(
    r=16,  # rank
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)

# Apply LoRA
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# trainable params: 4M | all params: 8B | trainable%: 0.05
```

## LoRA config

Key parameters:
- **r (rank).** Adapter capacity. 4-128 typical; 16 common.
- **lora_alpha.** Scaling. Usually 2× rank.
- **target_modules.** Which layers to apply to. Common: attention projection layers.
- **lora_dropout.** Regularization.

For: most cases, r=16 + alpha=32 works.

## Target modules

Common patterns:
- **Attention only.** ["q_proj", "k_proj", "v_proj", "o_proj"]. Sufficient for many tasks.
- **All linear.** Apply LoRA to all linear layers. Stronger; more parameters.
- **MLPs included.** Add ["gate_proj", "up_proj", "down_proj"].

For: experiment per task. More target modules = stronger adaptation; more compute.

## Training LoRA

Same as Trainer; only adapter weights update:

```python
trainer = Trainer(model=model, args=args, ...)
trainer.train()

# Saves only adapter (~10-200 MB)
model.save_pretrained("./my-lora")
```

For: standard training pipeline; tiny output files.

## Loading LoRA at inference

```python
from peft import PeftModel

base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B")
model = PeftModel.from_pretrained(base_model, "./my-lora")
```

Or merge LoRA into base:

```python
model = model.merge_and_unload()  # No more adapter; merged into weights
```

For: deployment.

## Multiple LoRAs

Apply multiple LoRAs:

```python
model.load_adapter("./lora1", adapter_name="adapter1")
model.load_adapter("./lora2", adapter_name="adapter2")
model.set_adapter("adapter1")  # Active
```

For: swap personalities / tasks at runtime.

## Speed + memory

LoRA training:
- 5-10x faster than full fine-tuning.
- 50-90% less memory.
- Same or near-same quality.

For: democratized fine-tuning on consumer hardware.

## Combining with Trainer

Standard pattern:

```python
from peft import LoraConfig, get_peft_model
model = AutoModelForCausalLM.from_pretrained("model_id", load_in_4bit=True)
model = get_peft_model(model, LoraConfig(...))

trainer = Trainer(model, args, train_dataset, ...)
trainer.train()
```

For: LoRA fine-tuning via familiar API.

## Hyperparameters

LoRA needs different hyperparameters than full fine-tuning:
- **Learning rate.** 1e-4 to 5e-4 (higher than full fine-tune's 1e-5 to 5e-5).
- **Epochs.** 1-3 typical.
- **Batch size.** Larger possible since memory savings.

For: dial per task; LoRA tolerates wider hyperparameter range.

## Catastrophic forgetting reduction

LoRA naturally reduces forgetting:
- Base model frozen.
- Only adapter learns new task.
- Original capabilities preserved.

For: domain fine-tuning without losing general capabilities.

## Mistakes to avoid

- **Wrong target modules.** Too few = weak adaptation; too many = unnecessary compute.
- **Rank too low.** Insufficient capacity for complex tasks.
- **Same LR as full fine-tune.** LoRA needs higher.
- **Forgetting to merge / load adapter properly.** Inference uses base only.

## Summary

- PEFT = parameter-efficient fine-tuning library.
- LoRA = small adapter matrices; train 0.1-1% of params.
- QLoRA = 4-bit base + LoRA = fine-tune 70B on single GPU.
- Configure via LoraConfig (rank, alpha, target_modules).
- Use higher learning rate (1e-4 to 5e-4) than full fine-tune.
- Save / load only adapter (tiny files).
- Standard for fine-tuning in 2026.

Next: TRL for preference + instruction tuning.
