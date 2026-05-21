---
module: 4
position: 1
title: "LoRA training — fast fine-tuning"
objective: "Teach the model your specific style, character, or concept."
estimated_minutes: 5
---

# LoRA training — fast fine-tuning

## What LoRA is

LoRA = Low-Rank Adaptation. A fine-tuning technique that adds a small set of trainable parameters to a pre-trained model without modifying the base.

Result: small file (10-200 MB) that contains your custom training; applied on top of base model.

For:
- **Specific characters.** Teach the model a person, character, mascot.
- **Specific styles.** Teach a particular aesthetic.
- **Specific concepts.** Objects, settings, clothing styles.
- **Brand consistency.** Your product looks.

## LoRA vs. full fine-tune

**Full fine-tune (Dreambooth).** Modifies entire model; produces ~7 GB checkpoint.

**LoRA.** Adds adapter; 10-200 MB file; faster training; smaller file; multiple LoRAs stack.

For most use cases: LoRA. Reserve full fine-tune for foundation work.

## Training requirements

For LoRA:
- **Dataset.** 10-50 images for character / style.
- **Captions.** Text descriptions per image (optional but improves results).
- **GPU.** 8 GB+ VRAM for SDXL LoRA; 24 GB+ for Flux LoRA training.
- **Time.** 30 min - 4 hours typical depending on dataset + settings.

For: producing your own LoRA. Cloud services (RunPod, fal.ai, Replicate) offer pay-per-train.

## Training tools

- **Kohya SS.** Most popular open-source LoRA trainer.
- **OneTrainer.** Newer; user-friendly UI.
- **AI Toolkit.** Modern toolkit for Flux LoRA training.
- **Cloud trainers.** Civitai's online trainer; fal.ai workflow.

For: pick based on platform + comfort level.

## Dataset preparation

For character LoRA:
- 15-30 photos of the character.
- Varied poses, angles, lighting.
- Clean (crop tight; no background distractions).
- Resized to training resolution (1024 for SDXL).

For style LoRA:
- 20-50 images in the style.
- Varied subjects (people, landscapes, objects in the style).
- Consistent style across images.

## Tagging / captioning

Each training image needs a caption:
- "a photo of [trigger word], standing in a forest, soft lighting."

The trigger word is what you'll use to invoke the LoRA later in prompts.

Auto-captioning tools:
- **BLIP / CogVLM.** Auto-describe images.
- **WD14 Tagger.** Anime-style booru tags.
- **Florence-2.** Recent option.

Then edit captions to add your trigger word.

## Trigger words

Pick something unique:
- "ohwxchar" instead of "John" (to avoid model's existing "John" associations).
- "myMascotXY" for brand mascot.
- "mystyleZZ" for style LoRA.

For: avoiding collision with model's learned concepts.

## Training parameters

Key settings in Kohya / OneTrainer:
- **Network Rank (Dim).** 4-128 typical; higher = larger LoRA + more capacity.
- **Alpha.** Usually rank / 2.
- **Learning Rate.** 1e-4 typical for SDXL.
- **Steps / Epochs.** 1000-3000 steps typical.
- **Batch Size.** 1-4 depending on VRAM.

For: typical character LoRA, defaults often work; tune per dataset.

## Overfitting

When the LoRA memorizes training images:
- Generated images look exactly like training set.
- Poor flexibility (struggles with new poses / scenes).
- Style transfers poorly.

Fixes:
- **Fewer training steps.**
- **Lower learning rate.**
- **More varied dataset.**
- **Regularization images** (generic class images).

## Using a LoRA

In prompt:
- A1111: `<lora:my_lora:0.8>` (weight 0.8).
- ComfyUI: Load LoRA node with strength parameter.

Place anywhere in prompt; affects whole generation.

For: invoke your custom training.

## LoRA weight

- **0.5.** Subtle effect.
- **0.8.** Strong but flexible.
- **1.0.** Maximum effect; can dominate.

For: balance LoRA influence + base model freedom.

## Stacking LoRAs

Multiple LoRAs in one prompt:
- `<lora:character:0.8> <lora:style:0.6>`.
- Character + style combined.

Caution: too many conflict; reduce weights for compatibility.

For: character in specific style; complex compositional control.

## Civitai LoRAs

Most-used LoRAs come from Civitai community:
- 100,000+ available.
- Search by concept, character, style.
- Some require subscriptions; many free.

For: pre-trained LoRAs covering common needs (specific characters, styles, concepts) without your own training.

## Commercial LoRAs

When training for commercial use:
- Verify base model license allows it.
- Verify dataset images are licensed for training.
- Some platforms (Civitai) provide license metadata.

For: legal commercial deployment.

## Mistakes to avoid

- **Tiny dataset (< 10 images).** Doesn't learn.
- **Massive dataset (1000+ images).** Wastes time; quality dilutes.
- **Same trigger word as existing concept.** Confused output.
- **No varied training data.** Overfits to specific poses.
- **No captions.** Slower learning, worse quality.

## Summary

- LoRA = small fine-tune file added on top of base model.
- For characters, styles, concepts, brands.
- 10-50 image dataset typical; captions improve results.
- Kohya SS / OneTrainer / AI Toolkit for training.
- Use in prompt: `<lora:name:weight>`.
- Stack LoRAs for combined effects.

Next: Dreambooth + full fine-tunes.
