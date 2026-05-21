---
module: 3
position: 4
title: "Performance — keeping a smooth frame rate"
objective: "Hit 60 FPS on target hardware via profiling and optimization."
estimated_minutes: 5
---

# Performance — keeping a smooth frame rate

## Why frame rate matters

Games target frame rates based on platform + genre:
- **60 FPS.** Standard for most modern games; smooth feel.
- **30 FPS.** Cinematic / story games; acceptable on lower-end hardware.
- **120 FPS / 240 FPS.** Competitive games on high-end hardware.
- **VR.** 90 FPS minimum; sub-90 = motion sickness.

Below target = stuttering = bad player experience. Performance is non-negotiable for shipping.

## Profiling tools

UE5's built-in profiling:
- **stat unit** — frame time breakdown (Game thread, Render thread, GPU).
- **stat fps** — current FPS.
- **stat scenerendering** — what's expensive in the render thread.
- **stat scripttime** — Blueprint script cost.
- **GPU Visualizer** — what the GPU is spending time on per frame.
- **Unreal Insights** — comprehensive profiling tool.

Run these in PIE; identify bottlenecks.

## Frame time budgets

For 60 FPS: 16.67 ms per frame.
For 30 FPS: 33.33 ms.

Split between:
- **Game thread.** Blueprint / C++ logic. Aim < 8 ms for 60 FPS.
- **Render thread.** Submitting draw calls. Aim < 5 ms.
- **GPU.** Rendering. Aim < 12 ms.

If any exceeds budget: frame drops.

## Common performance issues

1. **Too many actors.** Hundreds of dynamic actors with Tick.
2. **Too many draw calls.** Engine submits a draw call per material instance per visible mesh.
3. **Heavy shaders.** Complex material graphs.
4. **Insufficient LODs / no Nanite.** Distant objects rendering at full poly.
5. **Too many dynamic lights.** Each adds cost.
6. **Heavy post-processing.** Expensive effects.
7. **Unoptimized Blueprints.** Tick logic, allocations.
8. **Heavy physics.** Many rigid bodies, large particle systems.

## Draw call reduction

Each draw call = command for GPU. Many = bottleneck.

Reduce by:
- **Combine static meshes.** Merge actors that always render together.
- **Material instances.** Share material across meshes.
- **Instanced Static Mesh.** For many identical actors (trees, props), use Hierarchical Instanced Static Mesh.
- **Nanite cluster culling.** Reduces draw calls automatically.

For: open worlds with hundreds of similar trees, Nanite + instancing.

## Material optimization

Heavy materials slow rendering:
- **Texture lookups.** Each costs.
- **Shader complexity.** Layered, complex graphs are expensive.
- **Translucent materials.** More expensive than opaque.

Tools:
- **Material Quality switches.** Provide simpler variant for lower platforms.
- **Material instances.** Reuse base materials; tweak parameters.
- **Shader Compile Worker.** Compiles in background; first uses are slow.

For: 60 FPS targets, keep materials lean.

## LODs for non-Nanite content

For skeletal meshes (characters): create multiple LODs:
- **LOD 0.** Full detail for close range.
- **LOD 1.** Medium for mid range.
- **LOD 2-3.** Low for distance.

Configure switches based on screen size or distance.

For Nanite content: handled automatically.

## Texture optimization

- **Resolution.** 4K textures consume 64MB+ each in memory.
- **Compression.** BC7 / DXT5 for color; BC4 for grayscale.
- **Mipmap.** Smaller versions for distance; generated automatically.
- **Streaming pool.** Engine streams texture levels per memory budget.

For: large worlds, optimize texture memory aggressively.

## Performance Budget

Realistic targets:
- **AAA console game.** 60 FPS at 1080p; 30 FPS at 4K.
- **AAA PC game.** 60-120 FPS at 1440p high-end GPU.
- **Indie game.** 60 FPS at 1080p on RTX 3060 / Steam Deck.
- **Mobile.** 30-60 FPS at 1080p / 720p on flagship devices.

For: scope-set early; profile as you go.

## Quality vs. Performance trade-offs

Adjustable in Project Settings → Engine Scalability:
- **Resolution scale.** Render at lower res; upscale.
- **Shadow quality.** Lower = cheaper.
- **Foliage / particles density.** Reduce in low quality.
- **View distance.** Cull farther.

Default: provide Low/Medium/High/Epic presets; let player choose.

## Dynamic Resolution Scaling (DRS)

For consoles: dynamically lower resolution to maintain FPS:
- 4K at 60 FPS sustainable → 4K rendering.
- Heavy scene drops below 60 → render at 1800p, upscale to 4K.

For maintaining 60 FPS: DRS is standard on console.

## DLSS / FSR / TAAU

Upscaling technologies:
- **DLSS (Nvidia).** AI-based; high quality.
- **FSR (AMD).** Open standard; works on any GPU.
- **TAAU.** Unreal's built-in temporal upscaler.
- **TSR.** Unreal's newer temporal super resolution.

Use to render at lower resolution; upscale to target.

For: hitting 60 FPS at 4K on modest hardware.

## Open-world specific optimizations

For large worlds:
- **World Partition + HLOD.** Stream + simplify distance.
- **Instanced meshes for grass / foliage.** Massive draw call reduction.
- **Streaming source tuning.** Loading range balance.
- **Texture pool size.** Set per platform.

Without these: open worlds fail performance.

## Blueprint optimization

For Blueprint-heavy games:
- **Avoid Tick where possible.** Use events.
- **Cache references.** Don't recompute every frame.
- **Bake into C++.** Performance-critical Blueprints → migrate to C++.
- **Use Async Loading.** For asset loads.

For: 60 FPS Blueprint games, profile + optimize hot spots.

## Memory optimization

Each platform has memory budget:
- **PS5 / Xbox Series X.** 16GB total (some reserved for OS).
- **Xbox Series S.** 10GB.
- **Mid-range PC.** 32GB+; not as tight.

For: console targets, profile memory; tune texture pool sizes, streaming distances, persistent asset count.

## Networking performance

For multiplayer:
- **Replication budget.** Limit per-tick replicated data.
- **Network LOD.** Less detailed replication for distant players.
- **Authoritative server vs. client prediction.** Network architecture matters.

For: 32-player FPS, networking dominates over rendering.

## Build optimization

For shipping:
- **Cook your content.** Cook the project (Tools → Cook Content).
- **Package game.** File → Package Project.
- **Test the package.** Behaves differently than PIE in some ways.

For: catching cook-time issues; identifying shipping perf vs. dev perf.

## Production performance workflow

1. **Profile early.** Even at prototype, measure.
2. **Set per-platform targets.** What's the budget?
3. **Identify bottlenecks.** Game thread, render, GPU.
4. **Optimize highest-impact item first.** Pareto principle.
5. **Re-profile after changes.** Verify gains.
6. **Repeat.** Performance work is iterative.

For: shipping at quality + frame rate.

## Mistakes to avoid

- **Optimize prematurely.** Profile first; optimize hot spots.
- **No frame rate targets.** "Smooth enough" isn't a target.
- **Ignoring memory.** Console budgets matter.
- **Heavy Tick logic.** Optimize Blueprint patterns.
- **No texture compression.** Default uncompressed = memory bloat.

## Summary

- Profile with stat unit + GPU Visualizer + Unreal Insights.
- Frame time budgets: ~16ms for 60 FPS; split across threads.
- Optimize draw calls, materials, LODs, textures, dynamic lights.
- Nanite + Lumen automatic LOD + GI.
- Instanced meshes for many identical actors.
- DLSS / FSR / TSR for upscaling.
- Test packaged builds; PIE doesn't show all issues.
- Performance work is iterative; profile + optimize + re-profile.

Module 4 next: materials and post-processing.
