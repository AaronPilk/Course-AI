---
module: 1
position: 2
title: "Model families — SD 1.5, SDXL, SD3, Flux"
objective: "Pick the right model for your use case."
estimated_minutes: 5
---

# Model families — SD 1.5, SDXL, SD3, Flux

## The 2026 landscape

Major open-source diffusion model families:
- **Stable Diffusion 1.5** (2022). Smaller; nostalgic; massive ecosystem.
- **Stable Diffusion XL (SDXL)** (2023). Quality leap; standard mid-tier.
- **Stable Diffusion 3 / 3.5** (2024). Improved text + composition.
- **Flux.1** (2024, Black Forest Labs). State-of-the-art open source.
- **Closed: DALL-E 3, Midjourney, Imagen 3.** Available via APIs / web.

For most work in 2026: Flux for quality; SDXL for ecosystem depth; SD 1.5 for legacy / fast.

## Stable Diffusion 1.5

Released August 2022; trained at 512x512.

Pros:
- Massive ecosystem (LoRAs, fine-tunes, ControlNets).
- Fast (~4 GB VRAM, ~2-3 sec per image).
- Tons of community models on Civitai.

Cons:
- 512x512 native (1024 needs special handling).
- Older quality; struggles with hands, text, complex compositions.
- Less photoreal than newer models.

For: legacy projects; massive style libraries; learning.

## SDXL (Stable Diffusion XL)

Released 2023; trained at 1024x1024.

Pros:
- Quality leap from 1.5.
- Native 1024x1024 (less upscaling needed).
- Good ecosystem (many LoRAs, ControlNets).
- Photorealism + artistic capabilities.

Cons:
- 8 GB+ VRAM.
- Larger files (~7 GB per checkpoint).
- Hands still imperfect.
- Text inside images still bad (Flux fixed this).

For most workflows in 2024-2026: SDXL or fine-tuned SDXL variants.

## SD3 / SD3.5

Released 2024 by Stability AI.

Pros:
- Better text rendering (still not perfect).
- Better composition (multi-subject scenes).
- New transformer-based architecture.

Cons:
- Mixed community reception (initial SD3 release controversial; licensing).
- Smaller ecosystem than SDXL.
- 3.5 better than 3.

For some workflows: useful niche; not yet dominant.

## Flux.1

Black Forest Labs' breakout 2024 model. SOTA open source in 2026.

Pros:
- Best-in-class quality (rivals Midjourney for many tasks).
- Excellent text in images.
- Better hands.
- Photoreal + artistic excellence.
- Three variants: Pro (commercial; via API), Dev (open weights; non-commercial license), Schnell (open weights; Apache 2.0; fastest).

Cons:
- Larger (12 GB+ VRAM for Dev / Pro).
- Ecosystem growing; less than SDXL.
- Dev license restricts commercial use without licensing.

For 2026 quality: Flux.1 Dev (research / personal) or Pro (commercial via API).

## Fine-tunes

Each base model has community fine-tunes:
- **SD 1.5 fine-tunes.** Realistic Vision, DreamShaper, ChilloutMix (NSFW), many anime variants.
- **SDXL fine-tunes.** Juggernaut XL, RealVisXL, Pony Diffusion XL, AnimaPencilXL.
- **Flux fine-tunes.** Growing rapidly; Flux LoRAs especially common.

Find on Civitai (civitai.com); thousands of options per base model.

## Specialty models

Beyond general-purpose:
- **Anime models.** Anything V5, NovelAI-inspired.
- **Photorealistic.** Realistic Vision, RealVisXL.
- **3D / NSFW / specific styles.** Various.

For specific aesthetics: download specialty fine-tunes.

## Checkpoint files

Model weights stored as:
- **.safetensors.** Modern; safer than .ckpt.
- **.ckpt.** Legacy; pickle-based; theoretically less safe.

Always prefer .safetensors.

## Model size + format

- **SD 1.5.** ~2-4 GB.
- **SDXL.** ~6-7 GB.
- **Flux.1 Dev.** ~24 GB (Flux uses huge parameters).
- **Quantized versions.** FP8 / NF4 versions reduce size for lower VRAM (Flux NF4 ~12 GB).

For local: download appropriate; balance VRAM + size.

## Picking the right model

For:
- **Photorealism (people, scenes).** Flux Dev or RealVisXL.
- **Concept art / illustration.** SDXL fine-tune (Juggernaut, DreamShaper XL); Flux.
- **Anime.** Pony XL, Animagine XL, NoobAI-style models.
- **Cinematic / film-like.** Flux Dev, EpiCRealism.
- **Product photography / e-commerce.** Flux Dev for hero; SDXL for variants.
- **Fast iteration.** Flux Schnell or SDXL Turbo / Lightning.

For most pros in 2026: maintain 2-3 base models for different tasks.

## Commercial licensing

Be aware:
- **Flux Pro.** Commercial via API.
- **Flux Dev.** Non-commercial unless licensed.
- **Flux Schnell.** Apache 2.0 (commercial OK).
- **SDXL.** OpenRAIL-M license (commercial OK; restrictions on illegal use).
- **SD 1.5.** Same.
- **Community fine-tunes.** Inherit base license + creator's license.

For commercial work: verify before shipping. Use Flux Schnell for free commercial; Flux Pro API for highest quality commercial.

## When to use API vs. local

**API (Replicate, Stability API, Together, Black Forest API):**
- No GPU required.
- Latest models access.
- Pay per generation.
- Best for: testing, occasional use, production at scale.

**Local:**
- One-time cost (GPU).
- Privacy.
- Unlimited generations.
- Full control.

For: choose based on volume + needs.

## Mistakes to avoid

- **Using old SD 1.5 when SDXL / Flux available.** Lower quality.
- **Wrong resolution for model.** Train at 512 → ugly at 1024 (SD 1.5).
- **Commercial Flux Dev without license.** Legal issue.
- **Mixing model VAEs.** Color shifts.

## Summary

- Model families: SD 1.5 (legacy), SDXL (mid-tier standard), SD3 (niche), Flux (SOTA).
- Flux Dev best quality open source; Schnell for free commercial; SDXL for ecosystem depth.
- Fine-tunes on Civitai for specialty styles.
- .safetensors over .ckpt always.
- Match resolution to model's training resolution.

Next: samplers, schedulers, steps.
