---
module: 3
position: 1
title: "Cycles vs. Eevee — when to use which"
objective: "Pick the right render engine for your project."
estimated_minutes: 5
---

# Cycles vs. Eevee — when to use which

## Two render engines

Blender ships with two render engines:
- **Cycles.** Physically-based path tracer. Slow but accurate.
- **Eevee.** Real-time rasterization engine. Fast but approximated.

Pick per project; switch in Render Properties → Render Engine.

A third (in 2026 Blender): Eevee Next — the new real-time engine successor to Eevee with improved features.

## Cycles

Path tracing: simulates light by sending rays from camera; tracks how they bounce off surfaces; produces physically-correct images.

Pros:
- **Photorealistic.** Best-in-class realism.
- **Accurate reflections.** Light bounces correctly.
- **Realistic shadows.** Soft shadows, area lights, ray-traced.
- **Indirect lighting.** Light bouncing off surfaces illuminating others (global illumination).
- **Refraction.** Glass + water render physically correctly.
- **Subsurface scattering.** Skin, wax, milk look real.

Cons:
- **Slow.** Minutes to hours per frame, depending on complexity.
- **GPU-intensive.** Modern GPU recommended.
- **Noise.** Low sample counts produce grainy renders; need denoising.

For final still images / film: Cycles.

## Eevee

Rasterization: traditional game-engine-style rendering. Approximate light + shadows; not physically correct but very fast.

Pros:
- **Real-time.** 30-60 fps viewport; near-instant final renders.
- **Great for animation.** Hundreds of frames render in minutes.
- **Approximate reflections + refractions.** Often good enough.
- **Great for motion graphics + product viz when realism isn't critical.**

Cons:
- **Less realistic.** Reflections / refractions approximated.
- **Soft shadows are baked.** Not as good as Cycles.
- **Indirect lighting is limited.** No true global illumination.
- **Glass / volumetrics less accurate.**

For animation / motion graphics / interactive previews / quick stills: Eevee.

## Quick comparison

| Aspect           | Cycles          | Eevee            |
|------------------|-----------------|------------------|
| Realism          | Photorealistic  | Good approximation |
| Speed            | Slow            | Fast             |
| GPU intensive    | Yes (heavy)     | Yes (lighter)    |
| Animation cost   | Hours / minutes per frame | Seconds per frame |
| Reflections      | Ray-traced (perfect) | Screen-space (approximate) |
| Soft shadows     | Real-time path traced | Baked / approximated |
| Global illumination | Yes (accurate) | Baked / probes |
| Subsurface       | Excellent       | Good             |
| Volumetrics      | Excellent       | Good             |
| Best for         | Hero stills, film, photoreal | Animation, motion graphics, quick work |

## When Cycles wins

- **Final renders for portfolio / client work.**
- **Photorealistic product visualization.**
- **Architectural visualization (interior with daylight bouncing).**
- **Character renders with skin subsurface.**
- **Glass / water / liquid renders.**
- **Any single still image where quality matters.**

## When Eevee wins

- **Animation (per-frame cost dominates).**
- **Motion graphics (real-time iteration valuable).**
- **Look development (fast feedback loop).**
- **Real-time interactive applications (game engines via Eevee).**
- **Quick stills where 80% quality is enough.**
- **Stylized / illustrative renders (not aiming for photoreal).**

## Hybrid workflow

Many artists work hybrid:
- **Model + materials + lighting in Eevee.** Fast iteration.
- **Final render in Cycles.** Photoreal output.

Switch engines via Render Properties; same scene; same lights; same materials (mostly compatible, some differences in shaders).

## Common engine compatibility

Both engines support:
- Principled BSDF (PBR).
- Most textures.
- Most modifiers.
- Standard lights.

Differences:
- **Glass.** Cycles renders refraction accurately; Eevee approximates.
- **Subsurface.** Cycles is best; Eevee adequate.
- **Volumetrics.** Both support; Cycles more accurate.
- **Some Cycles-only shaders.** Use sparingly to maintain compatibility.

## GPU acceleration

Both engines can use GPU:
- **Cycles.** OptiX (Nvidia RTX), HIP (AMD), Metal (Apple), oneAPI (Intel Arc).
- **Eevee.** OpenGL / Vulkan.

For Cycles: a modern GPU (RTX 4070+, Apple M-series, AMD Radeon 7000+) makes Cycles usable for daily work.

Without GPU: CPU-only rendering is much slower; possible but painful for complex scenes.

Set: Render Properties → Device.

## Eevee Next (2026)

Blender 4.x introduced Eevee Next — successor to original Eevee with:
- **Improved indirect lighting.**
- **Real-time ray tracing on supported GPUs.**
- **Better volumetrics.**
- **Closer feature parity with Cycles.**

The future of real-time rendering in Blender. Original Eevee available for legacy projects.

## Choosing engine workflow

For new projects:
1. **What's the deliverable?** Animation = Eevee. Hero still = Cycles. Portfolio = Cycles. Marketing video = either; Eevee for speed, Cycles for hero shots.
2. **Realism need?** Photoreal = Cycles. Stylized = Eevee.
3. **Hardware budget?** Limited = Eevee or Cycles with proxies.
4. **Iteration speed?** Eevee for fast iteration; Cycles for final.

Default for hobbyists: start with Eevee (fast feedback); switch to Cycles for final.

## Render time mitigation in Cycles

To make Cycles practical:
- **Use denoising.** Built-in OIDN denoiser cleans up grain; lets you use lower samples.
- **Lower samples.** 128-512 for previews; 1024-4096 for finals.
- **Tile sizes.** Properties → Performance → Tiles. Larger for GPU, smaller for CPU.
- **Light path limits.** Lower bounces (e.g., 4 instead of 8) speed up.
- **Persistent data.** Caches scene data across frames in animation; faster.

## Final render checklist

Before launching final render:
- [ ] Engine selected (Cycles for hero; Eevee for motion).
- [ ] Resolution correct (Output Properties).
- [ ] Output format (PNG for stills; FFmpeg / EXR for animation).
- [ ] Samples appropriate (1024-4096 for Cycles still; lower for animation).
- [ ] Denoising on.
- [ ] Color management (Filmic for natural; Standard for stylized).
- [ ] Save path set.

## Mistakes to avoid

- **Cycles for everything.** Slow animation pipeline.
- **Eevee for hero still.** Misses the photoreal opportunity.
- **No denoising in Cycles.** Grain visible in finals.
- **Sample count too low.** Noise.
- **Sample count too high.** Wasted render time (diminishing returns past a threshold).

## Summary

- Cycles = path tracing; photoreal; slow.
- Eevee = rasterization; fast; approximated.
- Cycles for hero stills, film, archviz; Eevee for animation, motion graphics, iteration.
- Hybrid: develop in Eevee; final in Cycles.
- Modern GPU makes Cycles usable for daily work.
- Eevee Next (2026+) closes the gap.
- Pick engine based on deliverable, realism need, hardware, iteration speed.

Next: sampling, noise, and denoising.
