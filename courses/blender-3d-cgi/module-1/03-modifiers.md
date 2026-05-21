---
module: 1
position: 3
title: "Modifiers — non-destructive modeling"
objective: "Stack effects on a mesh without committing to permanent changes."
estimated_minutes: 5
---

# Modifiers — non-destructive modeling

## What modifiers are

Modifiers are operations applied to a mesh at render/display time, without changing the underlying geometry. You can tune, reorder, or remove them at any time.

Think: filters in Photoshop applied to a layer. The base layer stays unchanged; the effects stack on top.

Modifier stack visible in Properties → wrench icon. Add via dropdown.

## Why non-destructive?

For iteration:
- Try a heavy bevel; don't like it; remove modifier; mesh unchanged.
- Apply subdivision surface; tweak the count; live preview.
- Mirror modeling on one half; modifier creates the other half.

Without modifiers: every operation is permanent. Mistakes harder to undo.

## Modifier categories

Blender's modifiers split into 4 groups:
- **Modify.** Data manipulation (Data Transfer, Mesh Cache).
- **Generate.** Creates new geometry (Subdivision Surface, Mirror, Array, Boolean, Solidify).
- **Deform.** Bends / warps existing geometry (Cast, Lattice, Shrinkwrap, Curve).
- **Physics.** Cloth, soft body, fluid.

Generate + Deform cover most modeling needs.

## Subdivision Surface

The most important modifier. Smooths the mesh by subdividing and averaging.

- **Viewport.** Subdivisions shown in viewport (lower = faster).
- **Render.** Subdivisions for final render (higher = smoother).

Typical: Viewport 2, Render 3. Each level multiplies polygons by 4x.

Without subdivision: blocky / faceted look. With: smooth surfaces.

For character / organic modeling: Subsurf is essential.

## Mirror

For symmetric models:
- **Mirror modifier** mirrors geometry across X / Y / Z axis.
- Edit only one side; the other appears as a reflection.

Settings:
- **Clipping.** Snaps vertices to the mirror plane (prevents accidental gaps).
- **Merge.** Joins vertices that cross the mirror line.

Workflow for character: build half; Mirror on X; check center seam alignment; continue modeling one side.

Apply Mirror at end to commit the symmetry.

## Array

Duplicates geometry in a pattern:
- **Relative Offset.** Each duplicate offset by a factor of bounding box.
- **Constant Offset.** Fixed distance between duplicates.
- **Object Offset.** Use an empty object's transform to control.

For: stairs, fences, columns, repeated patterns.

Stack: 3 Arrays = 3D grid of duplicates.

## Boolean

Combine two meshes:
- **Union.** Merge into one.
- **Difference.** Subtract second from first.
- **Intersect.** Keep only overlap.

For: hard-surface modeling, cuts, holes through objects.

Setup: place cutting object inside / through target; add Boolean modifier; select cutting object; pick operation.

Booleans can produce messy topology — clean up afterward if necessary.

## Solidify

Adds thickness to a flat / shell mesh:
- A plane becomes a slab.
- A curved surface gets internal volume.

For cloth, leaves, paper, sheet metal — anything with a thin profile that needs depth for shading / shadows.

## Bevel modifier

Like the Bevel tool in Edit Mode but as a modifier:
- Configurable post-creation.
- Applies to all edges in mesh (or limited via weights / angle).

Apply selectively via Limit Method:
- **Angle.** Bevel only edges where the angle between faces exceeds threshold (default 30°).
- **Weight.** Bevel only edges with bevel weight set (in Edit Mode, Ctrl+E → Edge Bevel Weight).

For consistent edge rounding across a model: Bevel modifier > per-edge manual beveling.

## Modifier stack order

Modifiers apply top-to-bottom. Order matters:
- **Mirror → Subsurf.** Mirror first; then subdivision smooths both sides. Standard order.
- **Subsurf → Mirror.** Subdivision first; then mirror. Wrong: subdivided geometry on one side; mirrored copy not subdivided.
- **Array → Bevel.** Array creates copies; bevel rounds all of them.
- **Bevel → Array.** Bevels one shape; array copies the beveled.

For most workflows: Mirror → Subsurf is the standard stack.

## Apply modifier

When you're done iterating: Apply (downward arrow on modifier panel).

Permanently bakes the modifier's effect into geometry. After apply: no longer adjustable.

Don't apply too early — keeps non-destructive flexibility.

## Common modifier stacks

**Character base mesh:**
- Mirror (X-axis).
- Subdivision Surface (viewport 2, render 3).

Edit one side; symmetric character with smooth surface.

**Mechanical part:**
- Bevel (angle 60°, segments 2).
- Subdivision Surface.

All sharp edges rounded; smooth surface.

**Object array (fence, stair):**
- Array (count 10).
- Mirror (if symmetric).

Repeating pattern.

**Boolean cut:**
- Boolean (difference, target = cutter object).
- Bevel (round new edges from cut).
- Subdivision Surface.

Clean cut through mesh with rounded edges.

## Modifier shortcuts

- **Ctrl+1 / Ctrl+2 / Ctrl+3.** Add Subdivision Surface at level 1/2/3.
- **Ctrl+A.** Apply modifier (with mouse hovering over the modifier).

For fast Subsurf application: Ctrl+2 adds level-2 Subsurf instantly.

## Linking modifiers

Right-click modifier → Copy to Selected. Applies the same modifier (with same settings) to all selected objects.

For: applying same bevel to multiple objects; consistent subdivision across a scene.

## Conditional modifier behavior

Some modifiers respect:
- **Vertex Groups.** Apply only to vertices in a named group.
- **Bevel weights.** Bevel only weighted edges.
- **Crease weights.** Sharpen specific edges (preserves them from subsurf softening).

For surgical modifier application: assign weights / groups in Edit Mode; modifiers respect them.

## Geometry Nodes (preview)

A node-based system for procedural geometry generation. More powerful than traditional modifiers.

Covered in Module 5. Modern Blender's "modifier 2.0" — for complex procedural setups.

## Mistakes to avoid

- **Stack order wrong.** Mirror after Subsurf = unsubdivided mirror.
- **Apply too early.** Lose iteration ability.
- **Forgetting Apply Scale.** Modifiers compute incorrectly.
- **Massive Subsurf levels.** Slow viewport (level 4+ on dense meshes).
- **Boolean on dirty geometry.** Produces N-gons and weird topology.

## Summary

- Modifiers = non-destructive operations stacked on a mesh.
- Generate (Subsurf, Mirror, Array, Boolean, Solidify, Bevel) creates / modifies geometry.
- Deform (Lattice, Shrinkwrap, Curve) warps existing geometry.
- Order matters: stack top-to-bottom applies in that order.
- Common stacks: Mirror → Subsurf (character); Bevel → Subsurf (hard-surface).
- Apply when committed; keep non-destructive while iterating.
- Vertex groups + bevel weights for surgical modifier control.

Next: topology and edge flow.
