---
module: 3
position: 2
title: "Sampling, noise, and denoising"
objective: "Get clean Cycles renders without doubling render time."
estimated_minutes: 5
---

# Sampling, noise, and denoising

## Why noise in Cycles

Cycles works by sending rays from camera; tracking bounces; averaging results. With few rays (samples): the average is imprecise = grainy / noisy image.

More samples = cleaner image; longer render time. The trade-off.

Eevee doesn't have this noise (different rendering technique); the trade-off is approximation rather than sampling cost.

## Sample counts

In Render Properties → Sampling:
- **Viewport.** Samples for viewport preview (16-128 typical).
- **Render.** Samples for final render (128-4096 typical).

Higher = less noise; slower.

For final stills: 1024-4096 samples.
For animation: 64-256 samples (with denoising).
For viewport preview: 16-64 samples.

## What controls noise

- **Light path complexity.** More bounces = more samples needed for convergence.
- **Material complexity.** Glossy / subsurface scattering require more samples.
- **Scene complexity.** Many lights, complex geometry, volumetrics increase need.
- **Resolution.** Higher resolutions can show more noise per pixel.

Some scenes converge fast (clean at 256 samples); others slow (still noisy at 4096).

## Adaptive sampling

Adaptive sampling stops adding rays once a pixel is "converged enough":
- Render Properties → Sampling → Adaptive Sampling → enable.
- **Noise Threshold.** Convergence target (lower = more strict, more samples).
- **Min Samples.** Don't stop before this count.

For most scenes: enable Adaptive Sampling; saves significant render time on smooth areas while keeping detail in tough spots.

## Denoising

Denoising removes noise from the rendered image, faking the look of higher sample counts:
- **OIDN (Open Image Denoise).** Intel's CPU-based denoiser. High quality.
- **OptiX Denoise.** Nvidia's GPU-accelerated denoiser. Fast.

Setup: Render Properties → Sampling → Denoising → enable. Pick OIDN or OptiX.

With denoising: 128 samples + denoise often equals 1024 samples without. 8x faster.

## Denoising quality

Denoising's downside: can smooth fine detail.

Adjust:
- **Prefilter.** Helps preserve detail.
- **Albedo / Normal passes.** Denoiser uses surface data for better results.

For most: default settings work. For fine textures (fabric weave, hair): test denoised vs. not.

## Sample distribution

Cycles uses different sampling distributions:
- **Sobol-Burley.** Modern; good for most cases.
- **Progressive Multi-Jittered (PMJ).** Older; still works.

Stick with Sobol-Burley unless reason otherwise.

## Light bounces

Render Properties → Light Paths → Max Bounces:
- **Total.** Maximum bounce count for any ray.
- **Diffuse / Glossy / Transmission / Volume / Transparent.** Per-type max.

More bounces = more accurate indirect lighting; slower.

Defaults (Total 12, Diffuse 4, Glossy 4) work for most scenes. Increase Transmission for glass + water-heavy scenes (need more bounces for refraction).

## Clamping

Bright pixels (a light source directly visible, a specular reflection of the sun) can cause "fireflies" — bright single-pixel artifacts.

Render Properties → Light Paths → Clamping:
- **Direct Light.** Cap brightness on direct light.
- **Indirect Light.** Cap on indirect bounce light.

Setting to ~10 prevents fireflies while preserving overall look.

## Tile size

For rendering: image divided into tiles; each tile rendered separately.

- **GPU.** Larger tiles (256x256 to 1024x1024) — GPU handles more parallelism.
- **CPU.** Smaller tiles (32x32 to 64x64) — better for many cores.

Auto-tile sizing usually picks reasonable defaults.

## Render time budgeting

Calculate: target time per frame × total frames = total render time.

For animation:
- Per frame budget = 30 minutes max for indie work.
- 24 fps × 30 sec = 720 frames × 30 min = 360 hours = 15 days.

This is why animation rarely uses Cycles without optimization. Or use Eevee.

## Persistent data

For animation: enable Persistent Data (Render Properties → Performance).

Caches scene data across frames; subsequent frames render faster (5-30% speedup).

Especially useful for animations where most of the scene doesn't change frame-to-frame.

## Light sampling

Each light contributes to noise:
- Many small lights = high noise (samples must hit each).
- Few large lights = low noise.

For complex scenes: simplify lighting where possible. Combine multiple small lights into fewer larger ones.

## Sample passes

Beyond final RGB image, Cycles can output passes:
- **Diffuse / Specular / Volume passes** for compositing flexibility.
- **Depth.** For DoF / atmospheric effects.
- **Normal.** For relighting.
- **Object Index.** For per-object masking.

Enable in View Layer Properties; use in Compositor.

## Render layers

Split a render into layers for compositing:
- Background as one layer.
- Mid-ground as another.
- Foreground as third.

Each layer renders separately; combine in Compositor. Allows per-layer adjustments + faster re-renders if only one layer changes.

## Choosing samples

Practical defaults:
- **Concept / draft.** 64-128 samples, denoise on. 1-5 min per frame.
- **Production preview.** 256-512 samples, denoise on. 5-15 min.
- **Final still.** 1024-4096 samples, denoise on. 30 min - hours.
- **Animation frame.** 128-512 samples, denoise on. 5-30 min.

Adjust based on scene complexity (volumetrics + subsurface need more).

## Final render verification

Before launching production renders:
- Test 1 frame at full quality; verify look + render time.
- Calculate total time for full job (frames × time/frame).
- Verify file output (PNG / EXR / video format correct).
- Verify resolution.
- Verify there's no obvious noise / artifacts.

A short verification beats discovering issues 48 hours into a render.

## Mistakes to avoid

- **No denoising.** Wastes render time chasing low noise.
- **Sample count way too high.** Diminishing returns; wasted time.
- **No clamping.** Fireflies in final.
- **No Persistent Data on animation.** Slow.
- **Different sample counts per frame.** Flickering between frames.

## Summary

- Cycles renders via sampling; few samples = noise.
- Adaptive Sampling stops sampling converged pixels; saves time.
- Denoising (OIDN or OptiX) fakes higher samples; 128 + denoise ≈ 1024 raw.
- Light bounces shape indirect lighting; clamping prevents fireflies.
- For animation: enable Persistent Data + lower samples + denoise.
- Test 1 frame before committing to full render.

Next: output settings and image quality.
