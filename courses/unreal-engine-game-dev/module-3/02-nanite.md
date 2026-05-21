---
module: 3
position: 2
title: "Nanite — virtualized geometry"
objective: "Render scenes with millions of polygons at 60 FPS."
estimated_minutes: 5
---

# Nanite — virtualized geometry

## What Nanite is

Nanite is UE5's virtualized micropolygon geometry system. It renders meshes with effectively unlimited polygon counts at high frame rates.

Without Nanite: 60 FPS budget = ~5-10 million polygons total in scene. Meshes need LODs to scale.

With Nanite: 60 FPS budget = effectively unlimited. Single mesh can be 10+ million polygons; engine streams + culls per pixel.

This is the "film-quality assets at runtime" promise UE5 made.

## How Nanite works (simplified)

Nanite represents meshes as hierarchical clusters of polygons:
- Original high-poly mesh decomposed into clusters.
- Each frame: engine determines which clusters are visible at what level of detail (cluster-level LOD).
- Renders only what's needed at pixel resolution.

Effective LOD: each pixel gets the right polygon density automatically.

## Enabling Nanite

Per-mesh setting (Static Mesh editor → Nanite Settings → Enable).

Or batch: select multiple meshes in Content Browser → Asset Actions → Bulk Edit via Property Matrix.

Default for new high-poly imports: enable Nanite.

## What Nanite supports

- **Static meshes.** Yes (primary use).
- **Skeletal meshes.** Partial (in UE5.4+; preview).
- **Instances (foliage scatter).** Yes.
- **World Partition tiles.** Yes.

For: hero environments, scanned assets (Megascans), high-detail props.

## What Nanite doesn't support (or limits)

- **Translucent materials.** No (opaque only).
- **Materials with WPO (World Position Offset).** Limited / experimental.
- **Skinned meshes.** Limited (advancing in newer UE5).
- **Tessellation.** No (Nanite replaces it).
- **Very small meshes.** Inefficient (use traditional rendering).

For foliage with wind animation: traditional mesh OR Nanite-compatible material setups.

## When to use Nanite

- **High-poly environment assets.** Rocks, statues, scanned Megascans.
- **Architectural detail.** Brick walls with millions of bricks, ornate facades.
- **Distant geometry.** Mountains, landmarks visible from far away.
- **Hero objects.** Characters with insane detail (Nanite skeletal preview).

For: most game environments built with Quixel Megascans.

## When NOT to use Nanite

- **Translucent materials.** Glass, water — use traditional.
- **Cloth simulation.** WPO required.
- **Tiny / simple meshes.** Engine overhead > benefit.
- **VFX particles.** Specialized engines (Niagara).

For these: traditional static / skeletal mesh.

## Nanite asset preparation

For optimal Nanite:
- **High polygon count.** Nanite shines with 100K+ polys per mesh.
- **Single mesh.** Don't combine multiple disjoint meshes into one.
- **Clean topology.** No degenerate triangles.

Source from: Quixel Megascans, ZBrush sculpts, photogrammetry scans, high-detail Blender / Maya models.

## Nanite + Materials

Materials work on Nanite meshes but with some considerations:
- Standard PBR materials: yes.
- World Position Offset (for vertex displacement): limited.
- Tessellation: no (Nanite handles displacement differently).
- Translucent: no.

For: most opaque materials work natively.

## Visualization modes

Show menu → Nanite Visualization:
- Nanite Mask (what's Nanite vs. traditional).
- Triangles (how many polys are rendering at this view).
- Cluster (the cluster-level LOD decisions).
- Material Complexity.

For debugging: see what Nanite is doing.

## Stats

`stat Nanite` in console shows runtime cost:
- Vertices per frame.
- Triangles per frame.
- Memory used.

For optimization: identify expensive Nanite assets.

## Combining Nanite + non-Nanite

A scene mixes:
- Nanite static meshes (most environment).
- Traditional skeletal meshes (characters).
- Particle effects (Niagara).
- Foliage (Nanite-compatible).
- Water / glass (translucent; traditional).

Each rendered by the right system. Engine combines for final image.

## Nanite + HLOD

For open worlds: HLOD generates simplified proxies. Nanite then handles per-cluster LOD automatically within the proxies.

Combination: 1) Distant world rendered as HLOD (already simplified). 2) Loaded cells use Nanite for per-pixel detail. 3) Seamless transition.

## Nanite + Lumen

Lumen (global illumination, next lesson) interacts with Nanite:
- Nanite meshes can be lit by Lumen.
- Lumen uses Nanite's geometry data for ray tracing.

Both work together; both default-enabled in UE5 projects.

## Nanite performance

GPU-intensive feature; requires:
- **DirectX 12 / Vulkan / Metal.** Modern graphics API.
- **Modern GPU.** RTX 4070+ for high-detail Nanite scenes; RTX 4090 for 4K Nanite.
- **64-bit binaries.** Required for Nanite cluster data.

On consoles: PS5 / Xbox Series X / S support Nanite natively.

Older GPUs: Nanite falls back to traditional rendering (not as performant; LODs needed).

## Optimization tips

- **Use Nanite for high-poly assets.** Where it shines.
- **Don't use for tiny meshes.** Overhead.
- **Aggregate similar assets.** Better Nanite efficiency.
- **Build levels with Nanite in mind.** Place expensive Nanite assets carefully.

For: maintaining 60 FPS while using Nanite, profile + tune.

## Real-world examples

- **The Matrix Awakens demo.** Open-world cityscape with billions of polygons via Nanite.
- **Hellblade II.** Cinematic environments with film-quality detail.
- **Black Myth: Wukong.** Action RPG showcasing Nanite + Lumen.

These prove Nanite's capability at AAA scale.

## Mistakes to avoid

- **Disabling Nanite without measuring.** Sometimes Nanite is faster than traditional.
- **Using Nanite for tiny meshes.** Engine overhead.
- **Mixing Nanite + non-supported features.** Translucent + Nanite = visual issues.
- **Older GPU + heavy Nanite.** Performance crash.

## Summary

- Nanite = virtualized micropolygon geometry; effectively unlimited poly count at runtime.
- Enable per-mesh in Static Mesh editor.
- Supports static meshes + foliage + (preview) skeletal meshes.
- Doesn't support translucent, heavy WPO, tessellation.
- Best for high-poly environment assets (Megascans, sculpts, scans).
- Combines with Lumen + HLOD for AAA open worlds.
- Modern GPU (RTX 4070+) required for heavy Nanite scenes.

Next: Lumen.
