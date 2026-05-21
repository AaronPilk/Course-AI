---
module: 1
position: 4
title: "Importing assets from Blender, Maya, and elsewhere"
objective: "Get external 3D content into Unreal cleanly."
estimated_minutes: 5
---

# Importing assets from Blender, Maya, and elsewhere

## Common formats

Unreal supports:
- **FBX.** Industry standard; meshes + skeletons + animations.
- **OBJ.** Simple mesh; no animation.
- **glTF / GLB.** Modern open standard; web-friendly.
- **USD.** Pixar's Universal Scene Description; complex scenes.
- **Alembic.** For complex deformations (cloth, sim cache).
- **Datasmith.** CAD + architectural data.

For most game work: FBX.

## FBX export from Blender

In Blender:
- File → Export → FBX.
- Settings:
  - **Selected Objects.** Export only what's selected.
  - **Apply Transform.** Yes (cleaner transforms in Unreal).
  - **Forward / Up axis.** Match Unreal (-Y forward, Z up).
  - **Mesh: Apply Modifiers.** Yes (baked geometry).
  - **Armature: Add Leaf Bones off** (cleaner skeleton).
  - **Animation.** Enable; pick actions to export.

Export → .fbx file ready for Unreal.

## Importing FBX

In Unreal: drag the .fbx into Content Browser. Import dialog appears:
- **Skeletal Mesh.** Pick existing skeleton or create new.
- **Materials.** Use existing or import / create.
- **Animations.** Import if any.

For first import: create new skeleton; subsequent imports: reuse skeleton.

## Static mesh import

For static (non-animated) meshes:
- Drag .fbx → import dialog → Static Mesh.
- Confirm settings (collision, lightmap UVs).
- Import.

Static mesh appears in Content Browser. Drag into level.

## Skeletal mesh import

For characters / rigged animals:
- Drag .fbx → import dialog → Skeletal Mesh.
- Pick existing skeleton or create new.

The skeleton is shared across all characters that use it (humans share Mannequin skeleton; or use MetaHuman skeleton).

## Animation import

For motion / cycles:
- Drag .fbx → import dialog → Animation.
- Target skeleton: pick the matching skeleton.

The animation now belongs to that skeleton; usable on any character with that skeleton.

## Material translation

FBX includes material slot info but not the actual shader graphs. Unreal creates default materials (basic gray PBR).

You'll need to:
- Manually create Materials in Unreal (Module 4).
- Or use auto-assigned default materials.
- Or use Quixel Bridge for PBR textures auto-applied.

For: realistic look, separate material creation in Unreal.

## Textures + UVs

UVs come through FBX. Textures: 
- Embedded in FBX (rare).
- Or imported separately (drag .jpg/.png into Content Browser).

Apply texture: create Material → use texture as Base Color → assign to mesh.

## Quixel Bridge for materials

For environment / prop materials:
- Quixel Bridge (built into UE5).
- Drag PBR Megascans materials onto meshes.
- Auto-creates Material Instances with proper textures.

Saves hours vs. manual material setup.

## Datasmith for CAD / archviz

For architectural / CAD source:
- Datasmith plugin (free, included in UE5).
- Imports .3ds, .skp, .obj with materials and metadata.

For archviz workflows: huge time saver.

## Scaling and units

Unreal uses centimeters (1 unit = 1 cm).
Blender uses meters by default.

For consistent scale: in Blender, set scene units to centimeters; or apply scale 100 to objects before export.

If imported asset is too small/large: scale in Unreal via Details panel → Transform → Scale (but baking scale in source is cleaner).

## Pivot and origin

The asset's pivot/origin in Blender becomes Unreal's actor origin.

For doors: pivot at hinge (so rotation animates around hinge).
For buildings: pivot at base center (so placement on floor works).

Set pivot intentionally in source software; don't fight it in Unreal.

## Collision

Static meshes need collision geometry. Options:
- **Auto-generated.** Unreal computes simple collision from mesh bounds (Box, Sphere, Convex, Complex).
- **Custom collision in source.** Name collision meshes "UCX_OBJECTNAME" in Blender → Unreal imports as collision for OBJECTNAME mesh.

For: complex props that need accurate collision (chairs, weapons, vehicles).

## LODs (Levels of Detail)

For optimization: distant objects render at lower detail (fewer polys).

Options:
- **Auto-generate.** Unreal can compute LODs from a high-poly source.
- **Manual.** Provide multiple FBX files; Unreal uses them at different distances.

For 2026 with Nanite: LODs less critical for static meshes (Nanite auto-LODs); still important for skeletal meshes + non-Nanite content.

## Lighting

Static meshes need lightmap UVs (separate from texture UVs) for baked lighting:
- Auto-generate via Generate Lightmap UVs option.
- Or create in source software (Blender) and ensure clean second UV set.

For UE5 with Lumen: lightmap UVs less critical (dynamic lighting); still needed for some baked workflows.

## Reimporting

If source asset changes:
- Right-click mesh in Content Browser → Reimport.
- Unreal pulls latest version; updates references.

For: iterating on a model in Blender; updating in Unreal without reapplying materials.

## Asset Bridge (third-party)

Various tools for Blender → Unreal pipeline:
- **Send to Unreal** (Epic's plugin for Blender).
- **Auto-Setup for Blender** plugins.
- **One-click character send** plugins.

For solo or small team: streamlines iteration.

## Common import problems

- **Wrong axis.** Asset rotated 90°. Fix in source FBX export settings.
- **Wrong scale.** Bake scale before export.
- **Missing materials.** Recreate in Unreal.
- **Broken animations.** Verify skeleton match.
- **Missing collision.** Add custom UCX_ meshes or use auto.

For each: troubleshoot one variable at a time.

## Mistakes to avoid

- **No naming conventions in source.** Random asset names.
- **Wrong scale (huge or tiny objects).** Bake scale.
- **No collision.** Game characters fall through objects.
- **No LODs on large meshes.** Performance suffers.
- **No reimport workflow.** Manual re-attach materials every change.

## Summary

- FBX is the industry standard import format; from Blender / Maya / 3ds Max.
- Static Mesh, Skeletal Mesh, Animation are the main asset types.
- Materials need to be created or assigned in Unreal (FBX brings UVs but not shader graphs).
- Quixel Bridge for free Megascans assets + materials.
- Set scale + units correctly in source for clean import.
- Custom collision via UCX_ naming convention.
- Reimport workflow for iterating on source assets.

Module 2 next: Blueprints visual scripting.
