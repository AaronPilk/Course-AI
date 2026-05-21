---
module: 5
position: 2
title: "Geometry Nodes — procedural modeling"
objective: "Build models procedurally with node graphs."
estimated_minutes: 5
---

# Geometry Nodes — procedural modeling

## What Geometry Nodes are

Geometry Nodes = a node-based system for procedural geometry. Instead of modeling by hand, you define rules: "scatter 1000 rocks on a surface," "build a brick wall from one brick," "instance trees with random rotation."

The output is the geometry; tweak parameters → geometry regenerates.

Introduced in Blender 2.92 (2021); matured significantly through 3.x and 4.x.

## When to use

For:
- **Scattering.** Trees, rocks, grass on surfaces.
- **Procedural building.** Walls, fences, repetitive structures.
- **Parametric models.** Adjust slider; geometry updates.
- **Effects.** Cloth-like simulations, particle-like behaviors.
- **Instancing.** Many copies of an object with variations.

Saves hours of manual modeling for repetitive / pattern-driven content.

## Adding Geometry Nodes

Select object → Modifiers tab → Add Modifier → Geometry Nodes.

Click "New" to create a node tree. Geometry Nodes Editor opens.

Two default nodes: Group Input + Group Output. Connect Input's Geometry → Output's Geometry = pass-through.

## Basic node graph

Add nodes via Shift+A. Common starting nodes:
- **Geometry Input nodes.** Cube, Sphere, Curve.
- **Geometry Operations.** Translate, Scale, Rotate, Bevel.
- **Mesh Operations.** Subdivide, Extrude.
- **Curves.** Bezier, Spline operations.
- **Mesh to Curve / Curve to Mesh.**
- **Instances.** Instance on Points.
- **Math / Vector / Compare.**

Connect outputs to inputs by dragging.

## Common patterns

**Scatter:**
- Geometry Input → Distribute Points on Faces → Instance on Points → Geometry Output.
- Adjustable: density, random rotation per instance, random scale.

**Repeating pattern:**
- Mesh Line → Instance on Points → Geometry Output.
- Adjustable: count, spacing.

**Curve to extrusion:**
- Bezier Curve → Curve to Mesh → Geometry Output.
- Adjustable: profile shape, curve resolution.

These three patterns cover ~60% of Geometry Nodes use cases.

## Distribute Points on Faces

Scatter points on a mesh:
- **Density.** Points per unit area.
- **Distance Min.** Avoid clustering.
- **Random / Poisson.** Distribution algorithm.

For: tree scattering on terrain, grass on lawn, rock dispersal.

## Instance on Points

Place objects on points:
- Source: another object collection.
- Random selection from collection.
- Random rotation + scale.

Creates dozens / hundreds / thousands of instances; each with variation. Performance: instances share data (low memory; fast render).

## Modifying instances

For variation:
- **Random Value.** Generates random number per instance.
- **Map Range.** Remap random values to useful ranges.
- **Vector / Math / Boolean / Compare nodes.** Computations on instance attributes.

Plug into Rotate Instance / Scale Instance to vary per-instance.

## Inputs and outputs

The modifier panel shows the Group Input's exposed parameters:
- **Slider for Density.** Adjustable per scene.
- **Object pickers for collection.**
- **Numeric values for various parameters.**

Users tweak in Properties Panel; the node tree re-evaluates.

For: shareable / artist-friendly setups; non-coder colleague can tweak.

## Real-world examples

**Brick wall:**
- Mesh Line for brick column → Instance on Points → randomize per-brick scale + tint.

**Forest:**
- Distribute Points on Terrain → Instance Trees Collection → randomize rotation + scale per tree.

**Spiral staircase:**
- Curve Line → Instance Steps Along Curve → adjust step count + rotation per step.

**Particle emitter (effects):**
- Animated point distribution → instance particles → instance shape per particle.

## Reading the graph

Connections flow left to right:
- Input nodes at left.
- Output node at right.
- Operations in between.

Think of it like a recipe: ingredients (input) → cooking steps (nodes) → final dish (output).

## Attribute system

Each vertex / instance / face has named attributes:
- **Position.** Spatial location.
- **Normal.** Surface direction.
- **Custom attributes.** Anything you compute (e.g., per-instance random value).

For: working with sub-elements of geometry; sophisticated procedural setups.

## Performance

Geometry Nodes is GPU + CPU intensive:
- **Heavy graphs slow viewport.** Profile via timer nodes.
- **Many instances OK.** Instance system efficient.
- **Heavy computations expensive.** Optimize unnecessary calculations.

For complex setups: bake the result (apply modifier) at end of workflow.

## Procedural vs. destructive

Geometry Nodes are non-destructive — adjust slider any time, geometry updates.

For final / archive: apply modifier to commit the geometry (destructive).

For ongoing iteration: keep as nodes.

## Node Groups

Combine nodes into reusable groups (Ctrl+G):
- Encapsulate a pattern.
- Reuse across modifiers.
- Share with team via asset library.

For: "Brick Wall Generator" group → reuse in any project.

## Asset library + Geometry Nodes

Saved Geometry Nodes node trees → asset library → drag onto any object.

For: building a library of procedural generators (forests, walls, scatters); use across projects.

## Examples from Blender Studio

Open Movies (Blender Foundation's films) often release with Geometry Nodes assets:
- Forest generators.
- City generators.
- Particle systems.
- Architectural patterns.

Study these to learn techniques.

## Mistakes to avoid

- **Manually modeling repetitive elements.** Use Geometry Nodes for repetition.
- **Heavy graphs without optimization.** Slow.
- **Exposing every parameter.** Cluttered modifier UI.
- **No documentation in node tree.** Hard to revisit.
- **Skipping Apply for final.** Stuck with computation cost.

## Summary

- Geometry Nodes = node-based procedural geometry.
- Common patterns: Scatter, Instance, Curve-to-Mesh.
- Distribute Points on Faces + Instance on Points = scattering workhorse.
- Modify instances with Random Value + Math / Vector nodes.
- Group Input exposes parameters for user adjustment in modifier panel.
- Apply when done to commit geometry; keep as nodes for ongoing iteration.
- Asset library for reusable Geometry Nodes setups.

Next: asset management.
