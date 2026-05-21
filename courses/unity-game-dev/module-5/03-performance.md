---
module: 5
position: 3
title: "Performance optimization"
objective: "Hit target frame rate; ship smooth games."
estimated_minutes: 5
---

# Performance optimization

## Frame rate targets

- **60 FPS.** Standard for most games (16.67ms / frame).
- **30 FPS.** Mobile / lower-end (33.33ms / frame).
- **120 FPS.** Competitive PC games.
- **VR.** 90 FPS minimum.

Below target = stuttering = bad UX.

## The Unity Profiler

Window → Analysis → Profiler. Shows:
- **CPU.** Game thread, render thread costs.
- **GPU.** Rendering cost.
- **Memory.** Allocations + GC.
- **Audio / Physics / Network.** Specific subsystems.

For: identifying bottlenecks. Run in PIE or connect to device build.

## Frame Debugger

Window → Analysis → Frame Debugger. Step through every draw call in a frame:
- See exactly what renders + costs.

For: GPU bottleneck analysis.

## Common bottlenecks

1. **Too many draw calls.** Each = engine submitting to GPU.
2. **High poly count.** Without LODs.
3. **Expensive shaders.** Many texture lookups, complex math.
4. **Many lights.** Dynamic lights cost.
5. **Physics-heavy scenes.** Many rigid bodies.
6. **Tick-heavy Update.** Heavy logic per frame.
7. **GC allocations.** Frequent allocations = GC pauses.

## Draw call optimization

- **Batching.** Static Batching (combine static meshes) + Dynamic Batching (small movable meshes).
- **GPU Instancing.** Many copies of same mesh (e.g., trees) — single draw call.
- **SRP Batcher.** URP / HDRP optimization for materials sharing the same shader.

For: many-object scenes, reduce draw calls aggressively.

## LOD groups

LOD = Level of Detail. Distant meshes render lower-poly versions.

Setup: LODGroup component → assign LOD0 (high), LOD1 (medium), LOD2 (low) meshes. Configure transition distances.

For: large environments; many objects visible.

## Occlusion culling

Don't render what's behind walls:
- Window → Rendering → Occlusion Culling.
- Bake occlusion data.
- Engine auto-culls behind walls at runtime.

For: indoor scenes with line-of-sight blocking.

## Texture optimization

- **Compress** (BC7 / DXT / ASTC).
- **Reduce resolution.** 4K textures often overkill.
- **Texture streaming.** Engine streams texture levels per memory budget.
- **Atlas textures.** Combine small textures for batching.

For: smaller memory footprint + faster GPU.

## Object pooling

For frequently spawned objects (bullets, particles, UI popups):
- Pre-instantiate; deactivate vs. destroy; reactivate when needed.
- Avoids GC pressure from Instantiate / Destroy.

Unity provides ObjectPool<T> class.

For: smooth performance during heavy spawning.

## Avoid allocations in Update

Common GC offenders:
- **String concatenation.** `"Score: " + score` allocates string per frame.
- **Foreach on Lists.** Some allocate enumerator.
- **LINQ in Update.** Allocations everywhere.
- **new Vector3(...).** Per-frame Vector3 creation.

Fix:
- Cache strings; use StringBuilder.
- For loops instead of foreach when avoidable.
- Avoid LINQ in hot paths.
- Pre-allocate reusable Vectors.

## Reduce Update calls

- Disable scripts that don't need to update every frame.
- Use coroutines for periodic logic instead of Update + Time accumulator.
- Cache GetComponent results in Awake/Start.
- Use events instead of polling.

For: lower CPU baseline cost.

## Physics optimization

- **Use simpler colliders.** Box / Sphere over Mesh.
- **Static colliders for environment.** Cheaper than dynamic.
- **Reduce Fixed Timestep frequency if acceptable.** Less physics frames per second.
- **Layer-based collision filtering.** Avoid unnecessary pair checks.

For: physics-heavy games.

## Mobile-specific

- **Texture compression: ASTC.**
- **Lower resolution rendering + upscale.**
- **Disable expensive post-processing.**
- **Minimize alpha blending (transparent draws).**
- **Power-aware: detect device tier; adjust quality.**

For: 30+ FPS on mid-range mobile.

## Quality settings

Project Settings → Quality:
- Multiple Quality levels (Very Low, Low, Medium, High, Very High, Ultra).
- Adjust shadows, anti-aliasing, texture quality, particle limits per level.
- Auto-switch based on platform.

For: per-platform scalability.

## Mistakes to avoid

- **Optimize prematurely.** Profile first; optimize hot paths.
- **No target FPS set.** "Smooth enough" isn't a target.
- **Ignoring GC allocations.** Garbage = frame drops.
- **No object pooling for frequent spawning.** GC crashes performance.
- **Heavy shaders without quality switches.** Mobile crash.

## Summary

- Profile via Unity Profiler + Frame Debugger.
- Common bottlenecks: draw calls, poly count, shaders, lights, physics, Tick logic, GC.
- Batching + GPU Instancing for draw call reduction.
- LOD Groups + occlusion culling for environment.
- Object pooling + cache references for code performance.
- Avoid allocations in Update (strings, LINQ, foreach).
- Texture / audio compression per platform.

Next: publishing to platforms.
