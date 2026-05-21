---
module: 3
position: 3
title: "TRL — preference and instruction tuning"
objective: "Align models to human preferences."
estimated_minutes: 5
---

# TRL — preference and instruction tuning

## What TRL is

TRL = Transformer Reinforcement Learning. HF library for advanced fine-tuning:
- **SFT (Supervised Fine-Tuning).** Instruction tuning on demonstrations.
- **DPO (Direct Preference Optimization).** Train on chosen-vs-rejected pairs.
- **PPO (Proximal Policy Optimization).** RLHF-style RL.
- **KTO, ORPO, IPO.** Newer preference methods.

The library powering open-source RLHF / DPO workflows.

## SFT (Supervised Fine-Tuning)

For instruction tuning:

```python
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset

ds = load_dataset("HuggingFaceH4/ultrachat_200k")

config = SFTConfig(
    output_dir="./sft-model",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=2e-5,
)

trainer = SFTTrainer(
    model="meta-llama/Llama-3.1-8B",
    train_dataset=ds["train"],
    args=config,
)
trainer.train()
```

For: turning base model into instruct model.

## Dataset formats for SFT

Common chat format:
```python
{
  "messages": [
    {"role": "user", "content": "What is HF?"},
    {"role": "assistant", "content": "Hugging Face is..."}
  ]
}
```

TRL auto-handles chat template + tokenization.

## DPO (Direct Preference Optimization)

For aligning to preferences:

```python
from trl import DPOTrainer, DPOConfig

# Dataset: prompt + chosen + rejected
ds = load_dataset("Anthropic/hh-rlhf")

config = DPOConfig(
    output_dir="./dpo-model",
    beta=0.1,
    learning_rate=5e-7,
)

trainer = DPOTrainer(
    model=model,
    ref_model=ref_model,
    train_dataset=ds["train"],
    tokenizer=tokenizer,
    args=config,
)
trainer.train()
```

For: refine instruct model based on preferred outputs.

## DPO vs. RLHF

**RLHF (with PPO):**
- Train reward model from preferences.
- RL fine-tune policy against reward model.
- Complex; unstable.

**DPO:**
- Direct optimization on preferences.
- No separate reward model.
- Simpler; more stable.
- Often matches RLHF quality.

For most preference tuning in 2026: DPO.

## DPO dataset format

```python
{
  "prompt": "What is HF?",
  "chosen": "Hugging Face is the platform for open-source AI...",
  "rejected": "I don't know."
}
```

For: train model to prefer chosen over rejected style / content.

## Common preference datasets

- **Anthropic/hh-rlhf.** Helpful + harmless.
- **OpenAI WebGPT comparisons.**
- **Stanford SHP.**
- **UltraFeedback.** Synthetic preferences.

Or generate your own from human raters / LLM-as-judge.

## Combining SFT + DPO

Standard pipeline:
1. Start from base model.
2. SFT on instruction-following examples.
3. DPO on preference pairs.

Result: instruct model aligned to preferences.

For: producing competitive open-source instruct models.

## Newer preference methods

- **KTO (Kahneman-Tversky Optimization).** Uses binary (good/bad) labels; not pairs.
- **ORPO.** Combines SFT + preference in one stage.
- **IPO.** Improved over DPO; some stability benefits.

For: experimenting with newer alignment techniques.

## Constitutional AI / RLAIF

Variants using AI for preferences instead of humans:
- LLM judges + rates outputs.
- Use judged data for DPO.
- Scales without human labelers.

For: cheap preference data; can be noisy.

## Reward modeling

For RLHF specifically:
- Train reward model on preference data.
- RL fine-tune against reward model.

TRL supports via RewardTrainer + PPOTrainer.

For: full RLHF; complex but powerful.

## Aligning to your domain

For your use case:
1. Collect domain examples (or generate via LLM).
2. SFT on demonstrations.
3. Optional: collect preference pairs for refinement.
4. DPO for alignment.

For: specialized assistants (legal, medical, code, etc.).

## Mistakes to avoid

- **DPO without prior SFT.** Often poor.
- **Tiny preference dataset.** Doesn't learn pattern.
- **Beta too high in DPO.** Stays close to base; minimal change.
- **Mixing SFT + DPO data formats.** Trainer confused.

## Summary

- TRL = library for preference + RL fine-tuning.
- SFTTrainer for instruction tuning.
- DPOTrainer for preference alignment (simpler than RLHF).
- Newer: KTO, ORPO, IPO.
- Pipeline: base → SFT → DPO for competitive instruct models.
- RLAIF (LLM-as-judge) for scaled preference data.

Next: saving + sharing fine-tunes.
