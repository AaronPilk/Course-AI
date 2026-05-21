---
module: 4
position: 2
title: "Material Instances and parameters"
objective: "Build flexible material families that scale across your project."
estimated_minutes: 5
---

# Material Instances and parameters

## What parameters are

Parameters = tweakable knobs on a Material that Material Instances can adjust without recompiling the shader.

Types:
- **Scalar Parameter.** Single number (Roughness, Brightness, Emission strength).
- **Vector Parameter.** 4 floats (Color, Tint).
- **Texture Parameter.** Texture reference (BaseColorMap).
- **Static Switch Parameter.** Boolean compile-time toggle.
- **Static Component Mask Parameter.** Channel selection (R / G / B / A).

For: every customizable aspect of a material.

## Creating parameters

In Material Editor:
- Right-click any constant / texture / color → Convert to Parameter.
- Name (e.g., "Roughness", "BaseColor").
- Set default value.

The parameter appears in My Blueprint panel; Material Instances can override.

## Parameter groups

For organization in Material Instance editor:
- Set Parameter's Group property (e.g., "Base", "Roughness", "Effects").
- Material Instance editor shows parameters grouped accordingly.

For: complex materials with 20+ parameters, organized UI.

## Creating Material Instance

Content Browser → right-click Material → Create Material Instance.

Name with MI_ prefix.

In Material Instance Editor: see all exposed parameters; adjust per variant.

## Material Instance hierarchy

Material Instances can inherit from other Material Instances:
- Master Material (M_Surface).
- Material Instance Constants (MI_Surface_Metal).
- Material Instance Constants (MI_Brass extends MI_Surface_Metal; overrides only certain parameters).

For: shared variations with surgical overrides.

## Dynamic Material Instances

At runtime: spawn a Dynamic Material Instance:
- Get the static Material Instance.
- Create Dynamic Material Instance.
- Set Parameter Value (Scalar / Vector / Texture).

Now the parameter changes per-instance at runtime.

For: per-character team colors, damage states, dynamic effects.

## Layer Materials

For complex stacked materials (UE5+):
- **Material Layer.** A reusable shading layer.
- **Material Layer Blend.** How to combine layers.
- **Material with Layer slots.** Combines layers for final shader.

For: skin with detail + scar overlay; metal with rust layer + paint chips; floor with base texture + dirt overlay.

Modern way to build complex layered materials.

## Subsurface scattering setup

For skin / wax / leaves:
- Shading Model = Subsurface.
- Subsurface Color = warm tint (e.g., red for skin).
- Opacity = how much light scatters.

For realistic organic surfaces.

## Decals

Material Domain = Deferred Decal:
- Project a material onto surfaces.
- Use cases: graffiti, blood splatters, road markings, footprints.

Setup:
- Decal Actor in level.
- Assign decal material.
- Position via Transform.

For: world detail without modifying base meshes.

## Post Process materials

Material Domain = Post Process:
- Applied as full-screen effect.
- Add to Post Process Volume.

For: custom screen effects (color tinting, distortion, vignettes).

## Procedural materials

Without textures, using math:
- **Noise nodes.** Built-in procedural patterns.
- **Voronoi.** Cellular patterns.
- **Checkerboard.** Tiles.

For: procedural surfaces, mathematical art.

## Material Functions

For reusable material logic:
- Content Browser → right-click → Materials → Material Function.
- Build logic.
- Use as node in other materials.

For: standardized roughness curves, custom blend modes, common operations.

## Material Quality Levels

For per-platform variation:
- Quality Switch node.
- Inputs for Low / Medium / High / Epic.
- Per platform, different output.

For: mobile / console / PC quality scaling.

## Bake Materials

For some workflows: bake complex materials into simpler textures.

Tools: Texture Baker plugins; runtime baking.

For: optimization of expensive materials on lower platforms.

## Naming + organization

Standards:
- **M_** prefix: master Materials.
- **MI_** prefix: Material Instances.
- **MF_** prefix: Material Functions.
- **MaterialLayer**: Material Layers.

For: 100s of materials, organization matters.

## Material Instance batch edit

For applying parameter changes to many MIs at once:
- Select multiple MIs → Asset Actions → Bulk Edit via Property Matrix.
- Edit parameter; applies to all selected.

For: tweaking a parameter across 20 wall variants.

## Mistakes to avoid

- **Edit master Material to change one variant.** Wastes Material Instance system.
- **No parameter groups.** Material Instance editor chaos.
- **No naming conventions.** Can't find materials.
- **Heavy procedural materials.** Performance hit.
- **No Material Functions for reused logic.** Duplication everywhere.

## Summary

- Parameters expose material aspects for tweaking.
- Material Instances inherit + override parameters.
- Dynamic Material Instances for runtime parameter changes.
- Material Functions for reusable logic.
- Material Layers for stacked complex materials.
- Decal Domain for world surface detail.
- Post Process Domain for screen effects.

Next: post-process volumes.
