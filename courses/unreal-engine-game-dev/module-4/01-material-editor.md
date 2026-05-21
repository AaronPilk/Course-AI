---
module: 4
position: 1
title: "Material Editor — PBR shaders"
objective: "Build materials that define how surfaces look."
estimated_minutes: 5
---

# Material Editor — PBR shaders

## What materials are in Unreal

Materials define how surfaces interact with light + the renderer. Each material specifies:
- **Base Color.** Albedo / diffuse color.
- **Roughness.** Smooth (mirror) to rough (matte).
- **Metallic.** Insulator (0) or conductor (1).
- **Normal.** Surface micro-detail.
- **Emissive.** Self-illumination.
- **Opacity.** Transparency / cutout.

UE5 uses Physically-Based Rendering (PBR) — materials defined by real-world physical properties.

## Material vs. Material Instance

**Material** = full shader graph; recompiles when changed.

**Material Instance** = lightweight variant; tweaks parameters without recompiling. For most work: use Material Instances.

Workflow:
- Build master Material (e.g., M_Concrete) once.
- Create Material Instances (MI_ConcreteWalls, MI_ConcreteFloor) for variants.
- Tweak Material Instances per object.

## Creating a Material

Content Browser → Right-click → Material. Name M_*.

Double-click to open Material Editor.

The Result Node is the output; connect from inputs to it.

## Material Editor interface

Three panes:
- **Graph editor (center).** Nodes + connections.
- **Details panel (right).** Selected node properties.
- **Preview viewport (top-right).** Real-time material preview on default sphere.

Right-click in graph → Add node from menu.

## Common nodes

- **TextureSample.** Image lookup.
- **Constant.** Single value (float / vector).
- **Add / Multiply / Lerp.** Math.
- **Lerp.** Linear interpolation.
- **TexCoord.** UV coordinates input.
- **Time.** Animated time value.
- **Panner.** Animate UVs.
- **VertexNormalWS.** Surface normal.

For: building complex materials from simple nodes.

## Texture parameters

Drag a TextureSample into graph; connect to Base Color.

For parameter (Material Instance-tweakable): right-click TextureSample → Convert to Parameter. Now Material Instances can swap the texture.

For Material Instance authoring: parameters are the knobs.

## PBR texture maps

For realistic materials:
- **Albedo / Base Color.** RGB color.
- **Roughness.** Grayscale; per-pixel roughness.
- **Metallic.** Grayscale; per-pixel metalness.
- **Normal Map.** RGB encoded surface normals (typically as DXT5n/BC5).
- **Ambient Occlusion (AO).** Grayscale shadow detail.
- **Height / Displacement.** For parallax / virtual displacement.

Plug each into Material's matching pin. Result: realistic PBR material.

## Texture parameters with default values

For Material Instance variation:
- Right-click TextureSample → Convert to Parameter → name (e.g., "BaseColorTexture").
- Set default texture.
- In Material Instance: change to different texture for that variant.

For: "metal" material with parameters; instances for "rusty metal", "polished steel", "brass".

## Scalar + Vector parameters

For numeric tweaks (color, roughness multiplier, brightness):
- Add Constant or Multiply Constant.
- Convert to Parameter.
- Material Instance can change.

For: tune material variations without rebuilding.

## Material Domain

Top of Material's Details panel → Material Domain:
- **Surface.** Standard surface (most common).
- **Deferred Decal.** Surface stickers / blood / decals.
- **Light Function.** Mask on light.
- **Volume.** Volumetric.
- **Post Process.** Full-screen post effect.

For most: Surface.

## Material Blend Modes

For Surface materials:
- **Opaque.** Standard solid.
- **Masked.** Cutout (alpha test); for foliage / fences.
- **Translucent.** See-through; for glass, water.
- **Additive.** Adds color (fire, energy).
- **Modulate.** Multiplies (shadows).

For: pick by physics of the material.

## Shading Models

For Surface materials:
- **Default Lit.** Standard PBR.
- **Unlit.** No lighting (UI, debug).
- **Subsurface.** Skin, wax, leaves.
- **Cloth.** Fabric with subtle sheen.
- **Hair.** Specialized hair shading.
- **Eye.** Specialized eye shading.

For most: Default Lit. Specialized for specific surfaces.

## Math operations

Common in materials:
- **Multiply.** Color tinting.
- **Add.** Brightness adjustment.
- **Lerp.** Blend two values by an alpha.
- **Power.** Exponentiation.
- **Clamp.** Limit range.
- **One Minus.** Invert (1 - x).

Combine for complex effects.

## Normal maps

For surface detail:
- Add TextureSample with normal map.
- Plug into Normal pin of Material output.

Normal maps are RGB-encoded surface normals; provide micro-detail (cracks, ridges) without geometry cost.

For: brick walls, fabric, weathering, scratches.

## Animated materials

Add Time node (drives a clock); Panner (animates UVs); Rotator (rotates UVs).

For: flowing water, scrolling textures, spinning patterns.

For: dynamic environmental effects.

## Material instances at runtime

In Blueprint: Set Material Parameter Value.
- Change scalar parameters (e.g., glow brightness).
- Change vector parameters (e.g., team color).
- Change texture parameters.

For: per-character team colors; dynamic damage states; interactive material changes.

## Material complexity

Show menu → Material Complexity. Visualizes shader cost per pixel:
- Green = cheap.
- Yellow = moderate.
- Red = expensive.

For: identifying expensive materials.

## Optimization

For shipping:
- **Use Material Instances heavily.** Avoid per-mesh full Material.
- **Limit texture lookups.** Each costs.
- **Avoid Lerp chains.** Long blend chains hurt.
- **Material quality switches.** Provide simple variants for lower platforms.

For: 60 FPS targets, profile + optimize materials.

## Mistakes to avoid

- **Edit master Material instead of Material Instance.** Recompile cost.
- **No parameters in master.** No instance flexibility.
- **Complex chains.** Slow shaders.
- **Wrong blend mode.** Translucent when masked would do.
- **Over-using emissive.** Lumen interprets as light source.

## Summary

- Materials define surface PBR properties (Base Color, Roughness, Metallic, Normal, etc.).
- Material vs. Material Instance — instances are lightweight variants.
- Material Editor uses node graph; PBR texture maps fill standard inputs.
- Material Domain (Surface / Decal / Post Process); Blend Mode (Opaque / Masked / Translucent); Shading Model (Default Lit / Subsurface / etc.).
- Parameters enable Material Instance customization.
- Time + Panner + Rotator for animation.
- Optimization matters; Material Complexity visualization.

Next: Material Instances + parameters.
