---
module: 1
position: 1
title: "Diffusion models — denoising your way to images"
objective: "Understand the core algorithm behind AI image generation."
estimated_minutes: 5
---

# Diffusion models — denoising your way to images

## The core idea

A diffusion model is trained to:
1. Take a clean image.
2. Progressively add random noise (the "forward" process).
3. Learn to reverse the noise step by step (the "reverse" process).

At inference time: start with pure noise → the model iteratively removes noise → after N steps, a clean image emerges.

The image generated is whatever the model "thinks" is hidden in the noise based on the text prompt.

## Forward process (training)

During training:
- Take an image from the dataset.
- Add a tiny bit of noise → slightly noisy version.
- Add more noise → noisier version.
- Continue until pure noise.
- At each step: train the model to predict the noise that was added.

The model becomes very good at predicting noise.

## Reverse process (inference)

To generate:
1. Start with a random noise image.
2. Pass through the model with text prompt as conditioning.
3. Model predicts the noise to remove for one step.
4. Subtract that noise → slightly cleaner image.
5. Repeat 20-50 times.
6. Result: clean image matching the prompt.

Each iteration = one "step." More steps = (usually) better quality, more compute.

## Why this works

The model has learned, from millions of training images, what real images look like at various noise levels. It can hallucinate clean images from noise because it's seen what "the path from noise → image" looks like for similar concepts.

Text conditioning steers WHICH image gets pulled out of the noise.

## Text conditioning

A text encoder (CLIP, T5, etc.) converts the prompt to a vector representation. The model uses this vector to influence its noise prediction.

Different prompt = different noise predicted = different image.

## Latent space

Stable Diffusion doesn't work on pixel images directly. Too slow.

Instead:
1. VAE (Variational Autoencoder) encodes pixel image into a small latent representation (8x smaller).
2. Diffusion happens in latent space (much faster).
3. VAE decodes latent back to pixel image.

This "latent diffusion" is the key efficiency innovation.

## Why CFG (Classifier-Free Guidance)

To make text prompts have stronger influence:
1. Predict noise WITH prompt → predicted noise A.
2. Predict noise WITHOUT prompt (empty) → predicted noise B.
3. Final noise = B + (A - B) * CFG_scale.

CFG_scale (typically 5-12) controls prompt strength:
- Low (3): more creative; weaker prompt adherence.
- High (12+): more literal; can over-saturate / burn.
- Sweet spot: 7-9.

## Models that use diffusion

- **Stable Diffusion 1.5.** Smaller; nostalgic; fast.
- **SDXL.** Larger; better quality; standard for most work.
- **SD3 / SD3.5.** Newer Stability AI models.
- **Flux.1 (Black Forest Labs).** State-of-the-art open source in 2026.
- **DALL-E 3 (OpenAI).** Closed; different architecture (autoregressive + diffusion).
- **Midjourney.** Closed; different architecture.

Open-source ecosystem largely SDXL + Flux + various community fine-tunes.

## The diffusion vs. other generative models

- **GANs.** Older; faster inference; less controllable.
- **VAEs.** Smoother latent space; lower quality.
- **Autoregressive (DALL-E).** Token-by-token; can be slow.
- **Diffusion.** Best quality-controllability trade-off in 2026.

For open-source image gen: diffusion dominates.

## Common terminology

- **Checkpoint.** Trained model weights file (.ckpt, .safetensors).
- **Sampler.** The algorithm choosing how to subtract noise per step.
- **Steps.** How many iterations.
- **CFG / Guidance.** Prompt influence strength.
- **Seed.** Random number for noise initialization (same seed + prompt = same image).
- **Resolution.** Image size (typically multiples of 64; common: 1024x1024 for SDXL).

For: navigating any Stable Diffusion UI / pipeline.

## Image quality factors

Quality depends on:
1. **Model choice.** SDXL > SD 1.5; Flux > SDXL for many tasks.
2. **Sampler choice.** DPM++ 2M Karras > older samplers for quality.
3. **Steps.** 20-30 typical; 50+ rarely better.
4. **CFG.** 7-9 sweet spot; varies by model.
5. **Prompt quality.** Clear, specific prompts.
6. **Resolution.** Match the model's training resolution (SDXL = 1024, SD 1.5 = 512).

For: producing professional images, dial each carefully.

## Compute requirements

For local generation:
- **SD 1.5.** 4 GB VRAM minimum; RTX 3060+ comfortable.
- **SDXL.** 8 GB VRAM minimum; RTX 3080+ comfortable.
- **Flux.1.** 12 GB+ VRAM; RTX 4070+ comfortable.
- **Apple Silicon.** M2 Pro / Max / Ultra workable; slower than Nvidia.

For cloud: RunPod, Replicate, Vast.ai rent GPU time per hour.

## Mistakes to avoid

- **Treating it as black box.** Understanding helps debug.
- **Wrong resolution for model.** SDXL trained at 1024; 512 produces ugly.
- **Too few steps.** Noisy results.
- **Too many steps.** Wasted compute.
- **CFG too high.** Burned / oversaturated.

## Summary

- Diffusion models learn to denoise → generate images from noise.
- Latent space diffusion (Stable Diffusion) for efficiency.
- Text encoder + CFG steer generation by prompt.
- Samplers + steps + CFG + seed control the process.
- Open ecosystem: SDXL + Flux + community fine-tunes.

Next: model families.
