---
module: 4
position: 2
title: "Dreambooth and full fine-tunes"
objective: "Modify base models for maximum customization."
estimated_minutes: 5
---

# Dreambooth and full fine-tunes

## What Dreambooth is

Dreambooth = fine-tuning technique that modifies the entire diffusion model on your custom data. Produces a new base checkpoint with your concept "baked in."

For:
- Maximum quality lock on a concept.
- New base models for specific aesthetics.
- Brand-specific generation models.
- When LoRA isn't strong enough.

Less common than LoRA in 2026; reserved for specific cases.

## Dreambooth vs. LoRA

**LoRA.** 10-200 MB adapter; quick (30 min - 4 hours); stack with other LoRAs.

**Dreambooth.** 7 GB+ checkpoint; long (8-24 hours); standalone model.

For most: LoRA. For specialized needs: Dreambooth.

## When to use Dreambooth

- **Base model for a series of related works.** Brand fine-tune for ongoing campaign.
- **Highest character likeness possible.** Where LoRA's quality isn't enough.
- **Stylistic foundation.** Where you'll generate many images in the same style; bake style into base.
- **Model merging.** Combine multiple Dreambooth checkpoints.

For ad-hoc / experimental: LoRA.

## Training requirements

- **Dataset.** 20-50 images (character) or 50-200 (style).
- **GPU.** 24 GB+ VRAM for SDXL; cloud GPUs (A100) for Flux.
- **Time.** 8-24 hours typical.
- **Cost.** Cloud rental ~$5-30 per training run.

For: occasional Dreambooth training; cloud is more practical than local.

## Training process

Similar to LoRA but trains entire model:
1. Dataset prep (same as LoRA).
2. Captioning.
3. Set Network Rank higher (entire model trains).
4. Run training; checkpoint saved every N steps.
5. Pick best checkpoint via test generations.

## Class images / regularization

For Dreambooth specifically:
- **Class images.** Generic images of the broader category (e.g., generic "man" if training a male character).
- **Regularization.** Prevents catastrophic forgetting (model forgetting prior knowledge).

For: maintaining base model's general capabilities while learning your concept.

## Hugging Face Diffusers

The library most Dreambooth scripts use:
- Python-based.
- Configurable.
- Cloud-friendly.

For: scripting custom training pipelines.

## Model merging

Multiple Dreambooth checkpoints can be merged:
- Weighted average of two checkpoints.
- Tools: Merge Block Weighted (A1111 extension), supermerger, etc.

For: combining characteristics of multiple fine-tunes.

## Risks

- **Catastrophic forgetting.** Model forgets prior knowledge if over-trained.
- **Overfitting.** Same as LoRA.
- **Quality regression.** Sometimes Dreambooth outputs are worse than base.

For: careful training + testing.

## Cloud services

For practical Dreambooth:
- **fal.ai.** Pay-per-train; SDXL + Flux supported.
- **Replicate.** Similar; flexible.
- **RunPod.** Rent A100s; manual setup; cheaper for long training.
- **Civitai.** Online trainer; LoRA only currently for many users.

For: avoid local GPU bottleneck; pay-as-you-go.

## Commercial considerations

- License of base model affects commercial use of fine-tune.
- Dataset rights matter.
- For commercial product: clear documentation of training data + base model.

For: legal compliance.

## Modern alternatives

In 2026, often skip Dreambooth in favor of:
- **High-quality LoRA + Multi-LoRA stacking.**
- **Latest Flux + targeted IP-Adapter.**
- **Domain-specific fine-tunes from community** (download instead of train).

For: most needs, alternatives suffice; Dreambooth for unique requirements.

## Mistakes to avoid

- **Dreambooth for one-off character.** LoRA is faster + sufficient.
- **Over-training.** Catastrophic forgetting.
- **No class images.** Concept collapses onto specifics.
- **Tiny dataset.** Insufficient signal.

## Summary

- Dreambooth = full fine-tune; 7 GB+ checkpoint.
- For maximum quality + foundation work; LoRA usually preferred.
- 20-50 images + class images for regularization.
- Cloud training cost-effective for occasional use.
- Risk of catastrophic forgetting; iterate carefully.

Next: dataset preparation + tagging.
