---
module: 1
position: 3
title: "Samplers, schedulers, and steps"
objective: "Tune the denoising process for quality + speed."
estimated_minutes: 5
---

# Samplers, schedulers, and steps

## What a sampler is

A sampler decides HOW to remove noise at each step. Different samplers use different math; produce different image results from same noise + prompt.

Choosing sampler affects:
- **Quality.**
- **Speed.**
- **Aesthetic.**
- **Convergence behavior.**

## Common samplers

**DPM++ family (recommended for most work):**
- **DPM++ 2M Karras.** Sharp, detailed; standard for SDXL.
- **DPM++ 2M SDE Karras.** Variant; sometimes better.
- **DPM++ 3M SDE Karras.** Best for SDXL in some workflows.

**Other common:**
- **Euler.** Fast; older; cleaner / softer look.
- **Euler a (ancestral).** Variant; more creative; less consistent across steps.
- **UniPC.** Fast convergence; good with low step counts.
- **LCM.** For LCM-LoRAs (4-8 steps only).

For: SDXL workflows, DPM++ 2M Karras is reliable default.

## Schedulers

The scheduler determines how the noise level changes per step:
- **Karras.** Smooth distribution; widely preferred.
- **Exponential.** Faster early steps; slower later.
- **Linear.** Older; less flattering.

Most pro workflows: Karras scheduler with DPM++ samplers.

## Step counts

Recommended:
- **SDXL.** 20-40 steps with DPM++ 2M Karras. Diminishing returns past 40.
- **SD 1.5.** 20-30 steps.
- **Flux.1 Dev.** 20-50 steps (Flux benefits from more).
- **Flux.1 Schnell.** 1-4 steps (designed for low steps).
- **LCM-LoRA.** 4-8 steps.
- **SDXL Lightning / Turbo.** 4-8 steps.

For: more steps != always better. Test 20 → 30 → 40; pick where quality plateaus.

## Step-quality trade-off

Each step costs compute. For real-time / iteration:
- 10-15 steps for previews.
- 25-30 for final.
- 50+ only if needed.

For mass-generating variations: fewer steps + faster sampler (Euler) at lower CFG for quick iteration.

## Sampler-step interactions

Some samplers need more steps:
- DPM++ 3M SDE: 30+ steps typical.
- DDIM: needs 50+ for parity.

Some need fewer:
- LCM samplers with LCM-LoRA: 4-8 steps perfectly.
- SDXL Turbo / Lightning: 1-8 steps.

For: match sampler to step budget.

## Convergence

Some images "converge" quickly (look good at 15 steps); others need 30+. Complex scenes (multiple subjects, intricate detail) need more steps.

For: test with different step counts; observe where stops improving.

## CFG-step relationship

High CFG (10+) often needs more steps to stabilize. Low CFG (3-5) often works with fewer steps.

For: balance both.

## Practical defaults

**SDXL daily use:**
- Sampler: DPM++ 2M Karras
- Steps: 25
- CFG: 7

**SDXL hero shot:**
- Sampler: DPM++ 3M SDE Karras
- Steps: 40
- CFG: 5-7

**Flux Dev daily:**
- Sampler: Euler / DPM++ 2M
- Steps: 25
- CFG (Flux-style guidance): 3-4

**Flux Schnell speed:**
- Sampler: Euler
- Steps: 4
- CFG: 1

**LCM-LoRA fast:**
- Sampler: LCM
- Steps: 6
- CFG: 1-2

## Seed

Random number that initializes the noise. Same seed + same params = same image (deterministic).

For: regenerating an image; iterating with small param changes; comparing settings.

Set seed to a number you can record; -1 / random for exploration.

## Batch generation

Generate multiple images at once:
- **Batch size.** Multiple images per generation (uses more VRAM but faster total).
- **Batch count.** Sequential batches (same VRAM; total generations multiplied).

For: exploration; pick best from batch.

## Mistakes to avoid

- **Random sampler choice.** Test; settle on a default.
- **Way too many steps.** Wasted compute.
- **Wrong sampler for model.** LCM sampler without LCM-LoRA looks bad.
- **High CFG + few steps.** Doesn't converge; looks bad.

## Summary

- Sampler = algorithm for denoising; affects quality + speed + aesthetic.
- DPM++ 2M Karras = standard for SDXL.
- Step counts: 20-30 typical; more for complex scenes; less for fast samplers (LCM, Lightning, Schnell).
- Karras scheduler with DPM++ recommended.
- Seed for reproducibility.

Next: VAEs, encoders, latent space.
