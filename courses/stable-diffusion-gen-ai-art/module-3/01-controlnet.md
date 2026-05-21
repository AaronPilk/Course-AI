---
module: 3
position: 1
title: "ControlNet — pose, depth, edge guidance"
objective: "Take precise control of what gets generated."
estimated_minutes: 5
---

# ControlNet — pose, depth, edge guidance

## What ControlNet is

ControlNet = a separate neural network that adds guidance to the diffusion process. Takes a "control image" (depth map, pose skeleton, edge map, etc.) and constrains generation to match.

Result: keep prompt's flexibility while controlling specific aspects (composition, pose, structure).

## Why ControlNet

Pure text prompts can't reliably control:
- Exact pose ("woman standing with arms raised at 45°").
- Specific composition ("subject in upper-left").
- Structural details (matching reference image's layout).

ControlNet solves these with image-based guidance.

## Common ControlNet types

- **Canny.** Edge detection; preserves outline structure.
- **Depth.** Depth map; preserves 3D structure.
- **OpenPose.** Skeleton; preserves human pose.
- **Lineart.** Drawing-style outlines.
- **Scribble.** Rough sketch; loosest control.
- **Normal Map.** Surface direction.
- **MLSD.** Architectural straight lines.
- **Seg.** Semantic segmentation (different regions).
- **Inpaint.** Limit changes to masked area.
- **Tile.** For upscaling (Module 5).

Each constrains a different aspect.

## Canny ControlNet

For: replicating composition / outline of reference image.

Workflow:
1. Source image (any reference).
2. Apply Canny edge detection → black/white edge map.
3. Feed to ControlNet with prompt.
4. Model generates new image with same outline structure but new style / content per prompt.

For: redesigning composition; style transfer with structure preserved.

## Depth ControlNet

For: preserving 3D structure.

Workflow:
1. Source image.
2. Generate depth map (close = white, far = black).
3. Feed to ControlNet.
4. Generation matches 3D layout.

For: same scene rendered differently; consistent perspective across variations.

## OpenPose ControlNet

For: human poses.

Workflow:
1. Reference photo of person.
2. Apply OpenPose detection → skeleton image.
3. Feed to ControlNet.
4. Generate new person in that exact pose.

For: character poses; action poses; reproducing specific gestures.

## Multi-ControlNet

Stack multiple:
- Canny + OpenPose: preserve structure + pose.
- Depth + Canny: precise 3D + edges.
- Pose + Style reference image: pose from one, style from another.

For: highly controlled generation.

## ControlNet strength

Each ControlNet has a strength parameter (0-1):
- 1.0: full influence; output matches reference closely.
- 0.5: hybrid; partial influence.
- 0.0: ControlNet disabled.

For: balance prompt freedom vs. structural matching.

## Start / end percent

Some ControlNets apply only during specific step ranges:
- Start 0, End 0.5: only first half of steps.
- Start 0.5, End 1: only second half.

For: structure first, then refine; or vice versa.

## ControlNet preprocessors

Each ControlNet needs a "preprocessed" version of your reference:
- Auto-preprocess via UI button.
- Or use existing depth/edge map.

For: prepare reference correctly per ControlNet type.

## Use cases

- **Concept art revision.** Same composition + different style.
- **Product photography.** Same product angle + different backgrounds.
- **Character art.** Consistent character in different poses.
- **Architecture viz.** Same building + different lighting / styles.
- **Comic / illustration sequencing.** Maintain consistency across panels.

For: production work requiring precise control.

## ControlNet for SDXL vs. SD 1.5

ControlNet originally for SD 1.5; SDXL versions exist but with caveats:
- SDXL ControlNets larger files.
- Sometimes less reliable than SD 1.5 equivalents.
- For some control types, SD 1.5 + upscaling produces better results than SDXL ControlNet directly.

For mature ControlNet ecosystem: SD 1.5 still relevant.

## ControlNet for Flux

Flux ControlNets emerging in 2024-2026. Quality improving but ecosystem newer:
- Flux Canny / Depth / Pose available.
- Less mature than SDXL/SD 1.5.

For: emerging workflows; check current state when planning.

## Mistakes to avoid

- **Wrong ControlNet preprocessor.** Canny needs canny preprocessing.
- **Too high strength.** Overrides prompt entirely.
- **Wrong resolution.** ControlNet image should match generation resolution.
- **Stacking too many ControlNets.** Conflicts; mess.

## Summary

- ControlNet adds image-based guidance to text prompts.
- Common types: Canny (edges), Depth, OpenPose (poses), Lineart, Scribble.
- Stack multiple ControlNets for complex control.
- Strength + start / end percent control influence.
- Preprocessors convert reference to ControlNet input format.

Next: inpainting + outpainting.
