---
module: 2
position: 1
title: "Materials and the Shader Editor"
objective: "Make objects look like specific materials — metal, plastic, glass, fabric."
estimated_minutes: 5
---

# Materials and the Shader Editor

## What materials are

Materials define how an object's surface reacts to light:
- **Color.** Base color reflection.
- **Roughness.** Smooth (mirror-like) vs. rough (matte).
- **Metallic.** Insulator (plastic, wood) vs. conductor (metal).
- **Transparency.** Glass, water, plastic film.
- **Emission.** Light-emitting (LEDs, screens).

Blender uses Physically-Based Rendering (PBR) — materials defined by real-world physical properties. Inputs match how light behaves in reality.

## Adding a material

Select object → Properties → Material Properties (red sphere icon) → New.

A new material slot appears, named "Material" by default. Rename for clarity ("Steel", "Skin", "Glass").

Multiple materials per object: + button adds another slot; assign to specific faces in Edit Mode.

## Principled BSDF

The default shader. The Swiss army knife — handles 90% of material needs.

Properties:
- **Base Color.** Surface color.
- **Metallic.** 0 = insulator (plastic, wood, paint); 1 = metal (steel, copper, gold).
- **Roughness.** 0 = mirror; 1 = chalk. Most materials 0.3-0.8.
- **Specular.** For non-metals; how reflective.
- **Subsurface.** For skin, wax, milk — light penetrates surface.
- **Sheen.** For fabric, velvet.
- **Clearcoat.** For car paint, varnished wood.
- **Transmission.** Glass, water (light passes through).
- **Emission.** Self-illuminating.
- **Alpha.** Transparency cutoff (for textures with transparent areas).
- **Normal.** Normal map input (surface detail simulated via map).

Tune via sliders + color pickers.

## PBR principles

For real-world accuracy:
- **Metals.** Metallic=1; base color is the metal color; roughness defines polish.
- **Plastics.** Metallic=0; base color is plastic color; roughness 0.3-0.5; some specular.
- **Wood.** Metallic=0; base color via wood grain texture; roughness 0.5-0.7.
- **Glass.** Transmission=1; roughness 0; IOR 1.45 (typical glass).
- **Skin.** Metallic=0; base color skin tone; subsurface enabled; sheen 0.2-0.4.

Reference real-world materials: photos, sample swatches. Get the values approximately right; tune to taste.

## The Shader Editor

Window → Shader Editor. Node-based editor for building materials.

Default has 2 nodes: Principled BSDF + Material Output. Plug Principled BSDF into Material Output.

For complex materials: add more nodes between them. Mix shaders, blend textures, drive parameters from procedural patterns.

## Adding nodes

In Shader Editor: Shift+A → Add menu. Categories:
- **Input.** Image Texture, Color Attribute, Geometry.
- **Texture.** Noise, Voronoi, Checker, Brick.
- **Color.** ColorRamp, Mix RGB, Invert.
- **Vector.** Mapping, Normal Map, Vector Math.
- **Converter.** Math, RGB to BW.
- **Shader.** Principled BSDF, Mix Shader, Glass BSDF, Emission, Volume.
- **Output.** Material Output.

Drag connections between node sockets.

## Image textures

For real-world surfaces:
- Add Image Texture node.
- Open file (.jpg, .png, .exr).
- Plug Color output into Principled BSDF's Base Color.

For high-quality material packs: Quixel Megascans, AmbientCG, PolyHaven, Substance Source.

## PBR texture maps

A complete material from textures typically uses:
- **Diffuse / Albedo.** Color.
- **Roughness.** Per-pixel roughness map.
- **Metallic.** Per-pixel metallic map.
- **Normal.** Surface detail.
- **Displacement / Height.** Geometric displacement (use sparingly).
- **AO (Ambient Occlusion).** Pre-baked shadows in crevices.

Plug each into respective Principled BSDF input. Voilà — photoreal material.

## Normal maps

Normal maps simulate surface detail without geometry:
- Generated from high-poly sculpts or photos.
- Plug Normal map into Principled BSDF's Normal input via Normal Map node.

For: brick textures, wood grain, fabric weave, detailed surfaces that would require millions of polygons if modeled.

## Mix Shader

Combine two materials:
- Skin = Principled BSDF (color) + Sheen shader (sheen) mixed via Mix Shader.
- Wet metal = Metal BSDF mixed with Glossy BSDF based on a wetness map.

Mix Factor: 0 = first input; 1 = second input; gradient between.

## ColorRamp

A gradient: input value (0-1) → output color.

Use for:
- Tinting masks (procedural noise → color via ColorRamp).
- Roughness driven by grayscale texture remapped via ColorRamp.
- Aging effects (worn vs. fresh based on a wear map).

## Procedural textures

Built-in mathematical textures (no image required):
- **Noise.** Random patterns.
- **Voronoi.** Cell-like patterns.
- **Checker.** Tiled checker.
- **Brick.** Brick pattern.
- **Wave.** Stripes / waves.
- **Magic.** Psychedelic patterns.

For: procedural materials that don't need image textures; clouds, marble, wood, stone.

## Node Wrangler addon

Enable in Preferences → Add-ons → search "Node Wrangler". Adds productivity shortcuts:
- **Ctrl+Shift+click on node.** Connects node to material output (for previewing intermediate results).
- **Ctrl+T on Image Texture.** Auto-adds Mapping + Texture Coordinate.
- **Shift+ctrl+T on Principled BSDF.** Auto-imports a PBR set (all textures from a folder).

Mandatory for serious shader work.

## Material previews

The viewport has three shading modes:
- **Solid.** Flat color (fast).
- **Material Preview.** Approximates materials with simple HDR (medium speed).
- **Rendered.** Full render preview (slowest, most accurate).

Toggle: Z menu or top-right buttons.

For material work: Material Preview to see your shaders in approximated lighting.

## Material sharing

A material can be shared across multiple objects:
- Object 1 + Object 2 → click "Browse Material" dropdown in Properties → pick Object 1's material → Object 2 now uses same material.

Edits to the material propagate to all sharing objects.

## Material slots

One object can have multiple materials assigned to different faces:
- Edit Mode → select faces.
- Material slot list → + (new slot) → assign material.
- Click "Assign" with faces selected.

For: a character with skin material, clothing material, hair material; or a vehicle with body paint, glass, chrome trim.

## Saving materials

Save a material as part of the .blend file. For reuse across projects:
- **Asset Library (covered later).** Mark as Asset; appears in asset browser across projects.
- **Append.** File → Append → another .blend file → Material → pick. Imports the material.

## Mistakes to avoid

- **Wrong Metallic value.** Wood with Metallic=1 looks like silver wood.
- **Wrong Roughness.** Glossy plastic that should be matte.
- **No textures.** Solid colors look fake.
- **Texture scale wrong.** Bricks looking like stripes; wood looking like blobs.
- **No Normal Map.** Flat surfaces lack realism.

## Summary

- Materials define how surfaces interact with light.
- Principled BSDF handles 90% of material needs.
- PBR: Metallic + Roughness define the look (insulator vs. conductor; smooth vs. rough).
- Shader Editor for node-based material building.
- Image Texture + Normal + Roughness + Metallic + AO = full PBR material.
- Procedural textures (Noise, Voronoi, Brick) for image-free materials.
- Node Wrangler addon for productivity.
- Multiple materials per object via Edit Mode face assignment.

Next: textures and UV unwrapping.
