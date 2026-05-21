---
module: 1
position: 4
title: "VAEs, encoders, and the latent space"
objective: "Understand the compression that makes Stable Diffusion fast."
estimated_minutes: 5
---

# VAEs, encoders, and the latent space

## What VAE means

VAE = Variational Autoencoder. A neural network that compresses images to a smaller "latent" representation and decompresses back to pixels.

In Stable Diffusion:
- VAE encodes 512x512 pixel images → 64x64 latent (8x smaller in each dimension, 64x smaller total in spatial size; 4 channels instead of 3 RGB).
- Diffusion happens in latent space.
- VAE decodes final latent → pixel image.

This compression is why Stable Diffusion is fast.

## Why latent space

Without latent diffusion:
- Diffuse 512x512x3 = 786,432 dimensions per step.
- Slow; needs huge model.

With latent diffusion:
- Diffuse 64x64x4 = 16,384 dimensions per step.
- 48x fewer dimensions; 48x faster (roughly).

For: practical real-time generation; lower VRAM.

## How VAE works

Encoder side: convolutional network compressing image → smaller representation.
Decoder side: convolutional network expanding representation → image.

Trained to reconstruct input image after round-trip. The latent representation captures semantic content efficiently.

## Latent space properties

The latent space:
- **4 channels.** Not RGB; learned representations.
- **8x smaller** spatial than pixel image.
- **Smooth.** Nearby latents = similar images.

For: diffusion operates here efficiently.

## VAE files

Each model has its VAE:
- SD 1.5 VAE.
- SDXL VAE.
- Flux VAE.
- Custom VAEs (e.g., MSE VAE for SDXL — sharper).

Sometimes packaged with checkpoint; sometimes separate.

For: best results, use the VAE matching your checkpoint.

## VAE swapping

Some communities create alternative VAEs:
- Sharper details.
- Better colors.
- Less prone to artifacts.

Swap via UI (e.g., A1111: VAE dropdown; ComfyUI: VAE node).

For SDXL: stock VAE works; "sdxl_vae.safetensors" is the official one.

## VAE artifacts

Common issues:
- **Color shift.** Slight tint after encode/decode.
- **Loss of fine detail.** Tiny features (eyelashes, text) lost or distorted.
- **Bleeding.** Edges soft / blurry.

For: high-detail work, choose VAE carefully; some run multiple decoders + combine.

## VAE tiling

For high-resolution images:
- Decoding full image at once = VRAM-heavy.
- Tile decoding: decode in patches; combine.

Most UIs auto-tile for large images.

For: 2048x2048+ generation without OOM.

## Text encoders

Separate from VAE: text encoder converts prompt to vector representation.

- **CLIP-L (small).** SD 1.5 uses one.
- **CLIP-L + CLIP-G (two).** SDXL uses both.
- **T5-XXL + CLIP-L (two).** Flux uses these.

The text encoder choice affects how prompts are understood. Flux's T5 enables much more nuanced prompts than SDXL's CLIP.

## Tokenizer + max prompt length

CLIP tokenizes prompts into tokens (sub-words):
- Max 75 tokens per "chunk" in SD/SDXL (some UIs chunk longer prompts).
- Each word = 1-3 tokens typically.
- Flux T5: much longer context (~512 tokens).

For: keep SD/SDXL prompts focused; Flux can take detailed descriptions.

## Long prompts in SD 1.5 / SDXL

Some UIs chunk long prompts:
- 1-75 tokens: first chunk.
- 76-150 tokens: second chunk (weighted average).

But chunks don't always interact well. For SDXL: < 75 tokens for cleanest results.

For Flux: write full descriptive paragraphs; T5 handles them naturally.

## Negative prompts + encoders

Negative prompt processed by same text encoder:
- Pulls generation AWAY from those concepts.
- CFG amplifies the difference between positive and negative.

For: pruning unwanted elements (ugly, deformed, bad anatomy, watermark).

## Token weighting

UI syntax to weight tokens:
- `(token)` = 1.1x weight.
- `((token))` = 1.21x weight.
- `(token:1.4)` = 1.4x weight.
- `[token]` = 0.91x weight.

For: emphasize / de-emphasize specific concepts. Used heavily in advanced prompts.

## Mistakes to avoid

- **Wrong VAE for model.** Color shifts / artifacts.
- **Forgetting VAE entirely.** Some checkpoints embedded VAE bug-out.
- **Massive prompts in SD/SDXL.** Token limit.
- **No negative prompt.** More artifacts than necessary.

## Summary

- VAE compresses pixels ↔ latent space; 8x smaller for diffusion efficiency.
- Each model family has its VAE; match VAE to checkpoint.
- Text encoder (CLIP / T5) converts prompts to conditioning vectors.
- Flux's T5 handles longer + more nuanced prompts than SDXL's CLIP.
- Token limits (~75 for SD/SDXL; ~512 for Flux).
- Token weighting syntax for emphasis.

Module 2 next: prompting for professional results.
