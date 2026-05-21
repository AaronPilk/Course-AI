---
module: 5
position: 1
title: "Sculpting — high-detail organic forms"
objective: "Use Blender's sculpting tools for organic detail beyond polygon modeling."
estimated_minutes: 5
---

# Sculpting — high-detail organic forms

## What sculpting is

Sculpting in 3D is digital clay. Instead of moving polygons individually, brush strokes push, pull, smooth, pinch the surface.

For organic detail (faces, creatures, anatomical work, surface micro-detail), sculpting is faster + more intuitive than polygon modeling.

Blender's sculpting tools rival ZBrush (the industry standard) for many tasks.

## When to sculpt vs. polygon model

- **Polygon model.** Hard-surface (mechanical, architectural), low-poly characters, simple shapes.
- **Sculpt.** High-detail organic (skin pores, wrinkles, scales), creatures, characters with anatomical detail.

Most professional character work: low-poly polygon model → sculpt high-detail → bake details to maps → low-poly + maps for animation.

## Sculpting workspace

Workspace → Sculpting (top tabs).

Default view: 3D viewport + sculpt tool panel + brush settings.

Object goes to Sculpt Mode (Ctrl+Tab → Sculpt). Now brushes work on the mesh surface.

## Brushes

The brushes you'll use most:
- **Draw.** Adds material (raises surface).
- **Crease.** Creates sharp lines / wrinkles.
- **Smooth.** Smoothes out detail.
- **Clay.** Adds material with a flat back (good for building up forms).
- **Clay Strips.** Like Clay but with directional flow.
- **Inflate.** Puffs out the surface.
- **Pinch.** Pulls vertices together (creates folds).
- **Grab.** Drag a region of mesh.
- **Flatten.** Reduces variation.
- **Mask.** Hide parts from sculpting.

Press hotkeys (X for Draw, S for Smooth, F to resize brush, Shift+F for strength).

## Brush settings

For each brush:
- **Radius (F).** Size.
- **Strength (Shift+F).** How much material per stroke.
- **Falloff.** Shape of brush (smooth, sharp, custom curve).
- **Direction.** Add or subtract.

For: dramatic strokes — big brush + high strength. For: fine detail — small brush + low strength.

## Dyntopo (Dynamic Topology)

For sculpting: turn on Dyntopo (Sculpt menu → Dyntopo). Now mesh subdivides as you sculpt:
- More detail where you brush.
- Less detail elsewhere.
- Polygons adapt to strokes.

For: high-detail organic sculpting; faces with wrinkles.

Without Dyntopo: sculpt operates on existing topology; can't add detail beyond what's there.

## Remesh

Alternative to Dyntopo: Remesh creates a new uniform mesh at a chosen resolution.

Sculpt menu → Remesh → set Voxel Size → click Apply.

For: starting from a low-poly base mesh; remesh to high-poly for detailed sculpting.

For: clean topology output after rough sculpting (vs. Dyntopo's chaotic topology).

## Multires modifier

Multiresolution Modifier: stores multiple levels of subdivision.

- Sculpt at high level (level 4 = 256x detail).
- Display at lower level (level 1 = base mesh) for performance.

For: workflows where you want a clean low-poly base + sculpted high-detail.

Modern alternative to Multires: sculpt with Remesh; bake the detail to Normal Maps onto a low-poly retopology.

## Sculpting workflow

1. **Start with low-poly base mesh** (a quad sphere or simple shape).
2. **Add Remesh** with high voxel resolution (0.01-0.05) → dense mesh.
3. **Sculpt rough forms** with big brushes (Draw, Clay).
4. **Refine** with medium brushes (Crease, Pinch).
5. **Add fine detail** with small brushes (Sharpen, Smooth).
6. **Mask + unmask** for region-specific work.
7. **Retopology** (Module 1) → low-poly clean mesh.
8. **Bake details** (Normal Map, Displacement Map) to the low-poly.

End: low-poly + maps = animation-ready high-detail look.

## Symmetry in sculpting

Sculpt → Symmetry: enable X (mirror left-right). Strokes mirror across the axis.

For symmetric characters: enable; sculpt one side; both update.

Verify by toggling symmetry off + comparing.

## Masking

Mask a region:
- M key + paint to mask.
- Ctrl+M + paint to unmask.
- Ctrl+I to invert.

Masked areas don't receive sculpt strokes.

For: isolate detail areas (e.g., mask everything except eyes; sculpt eye detail without affecting elsewhere).

## Face Sets

Group faces into "Face Sets" (named groups). Hide / show / mask per-face-set.

For: organize sculpt regions (face, ear, neck, hair).

Right-click → Face Sets → assign.

## Custom brushes

Beyond built-in brushes:
- **Stencil.** Use an image as brush shape (skin pores, scars, scale patterns).
- **Texture-driven.** Brush deformation follows an image's grayscale.
- **Cloth brushes** (Blender 2.8+). Cloth-like deformation.

For: production-quality detail without manually painting every pore.

## Cloth simulation in sculpt mode

Modern feature: drag cloth-like behavior on the model.

Cloth Brush:
- Treats the mesh as cloth.
- Drag = cloth folds + drapes.

For: quickly adding skin folds, fabric wrinkles, ear cartilage flow.

## Multiplane scrape

For hard-edge detail in organic models:
- **Multiplane Scrape** brush flattens to a plane based on brush angle.
- Creates sharp creases between flatter regions.

For: chiseled faces, geometric stylization, mech-organic hybrids.

## Smoothing

The Smooth brush (S key) reduces variation:
- Smooths out brush strokes.
- Levels the surface to average.

Used after every other brush: Sculpt → Smooth → Sculpt → Smooth. Smoothing is the cleanup; without it, surfaces look noisy.

For different smoothness types: Sharpen brush (does opposite — emphasizes edges).

## Sculpting from a low-poly base

Common workflow:
1. Low-poly base mesh (~5,000 polys for a character body).
2. Subdivide once or twice for detail capacity.
3. Sculpt rough forms (anatomy proportions, gesture).
4. Apply Remesh at higher voxel resolution.
5. Continue sculpting fine details.
6. Retopology when done.

Each stage: more polygons; more detail.

## Brush textures (alpha)

Brushes can use an Alpha texture:
- Brush strokes follow the alpha pattern.
- For: skin pores, fingerprints, scale patterns, leather grain.

Source alphas: free + paid packs (Texturing.xyz, Surface Alphas, custom).

For high-detail skin / surface: alphas + stencil brushes = photoreal detail.

## Performance considerations

Sculpting is GPU-intensive:
- High poly counts (1M+) slow down even modern GPUs.
- Multires modifier helps (display low-poly; sculpt high-poly).
- Performance Mode (Preferences) reduces viewport detail during sculpting.

For very high detail (5M+ polys): consider ZBrush still (more optimized for extreme poly counts).

## Mistakes to avoid

- **Sculpting on low-poly without subdivision.** Can't add detail.
- **No Dyntopo or Remesh.** Stuck with existing topology.
- **Asymmetric strokes when symmetry intended.** Toggle on.
- **No smoothing between brushes.** Noisy surface.
- **Sculpting without referent.** Anatomically wrong.

## Summary

- Sculpting = digital clay; brushes shape surface.
- Brushes: Draw, Clay, Crease, Pinch, Smooth, Grab.
- Dyntopo / Remesh for adaptive / clean topology.
- Multires for low-poly + high-detail workflow.
- Symmetry + masking + face sets for surgical work.
- Custom brushes + alphas for production detail.
- Retopology after sculpting for animation-ready mesh.

Next: Geometry Nodes.
