---
module: 2
position: 2
title: "Textures and UV unwrapping"
objective: "Map 2D textures onto 3D surfaces correctly."
estimated_minutes: 5
---

# Textures and UV unwrapping

## What UV is

UV = a 2D coordinate system on a 3D surface. Each vertex on the mesh has UV coordinates (u, v) — its location on a 2D plane.

A 2D image texture maps to the 3D model via these UVs. Vertex at (u=0.5, v=0.5) samples the texture at the center.

Without UVs: textures map weirdly (stretched, wrong scale, distorted).

## Why unwrap

For complex models: a flat 2D layout of the 3D surface — the "unwrap" — lets you paint or apply textures predictably.

Imagine unfolding a paper model: the flat layout is the UV map. The texture image fills this layout.

## The UV Editor

UV Editing workspace (or Window → UV Editor) shows:
- **3D Viewport on the right.** The mesh.
- **UV Editor on the left.** The 2D unwrap layout.

Select faces in 3D viewport; their UVs highlight in UV Editor. Move / rotate / scale UVs in 2D space.

## Marking seams

A seam = where the unwrap "cuts" the surface to lay it flat. Like cutting along edges of a paper toy before unfolding.

Place seams:
- In Edit Mode → select edges → Edge → Mark Seam.

Strategic seams:
- **Hide on back side.** Seams under arms / behind ears for characters.
- **Follow natural lines.** Hairline, belt line.
- **Where two materials meet.** Boundary between metal and rubber on a tool.

Bad seams = visible on textured model. Good seams = invisible.

## Unwrap

After marking seams:
- Edit Mode → select all (A).
- U → Unwrap.

Blender computes the unwrap; UV Editor shows the 2D layout.

For simple objects: Unwrap often works first time. For complex: tweak seams + re-unwrap.

## Unwrap methods

Multiple algorithms:
- **Unwrap.** Standard angle-based unwrap.
- **Smart UV Project.** Auto-detects faces; works without seams on simple objects.
- **Cube / Cylinder / Sphere Projection.** For primitive-shaped objects.
- **Project from View.** Uses the current viewport angle.

For most: Unwrap with strategic seams.
For boxy mechanical objects: Smart UV Project.
For perfect cylinders: Cylinder Projection.

## UV layout

The UV space is 0-1 in both u and v. The texture maps to this square.

Pro practice:
- Pack UVs efficiently (no wasted space).
- Same scale (don't have one part 2x the texture density of another).
- Avoid overlap (unless intentional for symmetric models).

Tools:
- **U → Pack Islands.** Auto-packs UVs.
- **U → Average Islands Scale.** Normalizes scale across islands.

## Texture density

Texture density = pixels of texture per unit of 3D space. Higher density = sharper texture at close range.

For a character: face has higher density than back (visible more often).
For an environment: foreground has higher density than background.

Manage by scaling UVs in UV editor: larger UV island = higher density for that area.

## Tiling textures

For repeating textures (brick, fabric, wood floor):
- Texture is small (512x512 or 1024x1024) but tiles infinitely.
- UVs span beyond 0-1 range = texture tiles.

For unique textures (character face, hero prop):
- UVs stay within 0-1.
- High-resolution texture (4K, 8K) covers the area.

## UDIMs

For high-end production: UDIMs split a single mesh's UV across multiple 0-1 tiles, each with its own texture.

A character might have:
- UDIM 1001: face (4K texture).
- UDIM 1002: hands (4K texture).
- UDIM 1003: body (4K texture).
- UDIM 1004: clothing.

For game / film characters: UDIMs allow 16K+ effective texture resolution.

For YouTube / hobbyist work: single UV is usually enough.

## Texture coordinates

In the Shader Editor: Texture Coordinate node provides multiple coordinate spaces:
- **UV.** Use UV unwrap.
- **Generated.** Auto-generated from object bounds.
- **Object.** Object's local space.
- **Camera.** Camera projection.
- **Reflection.** For environment maps.

Most materials use UV; some procedural materials use Generated.

## Texture painting

Blender has texture paint mode:
- Workspace → Texture Paint.
- Paint directly on the 3D model.
- Or paint on the 2D UV layout.

For: face details, weathering, hand-painted textures.

For serious texture work: Substance Painter is the industry standard ($20/month subscription); Blender's texture paint is functional but less polished.

## Stencil painting

For applying decals (logos, stickers):
- Stencil paint mode.
- Position the stencil on the model.
- Paint where the stencil is visible.

For: brand logos on products, character faces, surface details.

## Procedural texturing without UVs

Procedural textures (Noise, Voronoi, Brick) often don't need UVs — they use 3D coordinates.

For abstract / mathematical materials: skip UV unwrap; use Generated or Object coordinates.

For image textures: UVs required.

## Common UV mistakes

- **No seams.** Algorithm produces distorted unwrap.
- **Random seams.** Visible seams on final model.
- **Inconsistent texture density.** One area sharper than another.
- **Overlapping UVs.** Textures repeated unexpectedly.
- **Wasted UV space.** Loss of effective texture resolution.

## Workflow: model + UV + texture

1. Model the object in Edit Mode.
2. Mark seams strategically.
3. Unwrap (U).
4. Verify UV layout in UV Editor; pack, average scale.
5. Add Material; assign textures or paint.
6. Render to verify look.

For game assets: optimize UV efficiency hard (UDIMs for high-detail; tight packing for memory).
For film / hero shots: less constrained; quality first.

## Mistakes to avoid

- **Skipping UV unwrap.** Textures map poorly.
- **All-auto unwrap without seams.** Hidden distortion.
- **Mixed texture densities.** Inconsistent quality.
- **UVs outside 0-1 unintentionally.** Tiling where you didn't want.
- **No baking ambient occlusion.** Misses subtle shadow detail.

## Summary

- UV = 2D coordinate system mapping textures to 3D surfaces.
- Mark Seams (Edit Mode) where the model should cut for unwrap.
- Unwrap (U) generates the 2D layout in UV Editor.
- Smart UV Project for boxy objects; Cylinder/Sphere for those shapes.
- Pack Islands + Average Scale for efficient UV layout.
- UDIMs for multi-texture production work.
- Texture Paint for direct painting; Substance Painter for serious work.
- Procedural textures may not need UVs (use Generated coordinates).

Next: lighting design.
