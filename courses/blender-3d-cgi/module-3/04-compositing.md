---
module: 3
position: 4
title: "Compositing and post in Blender"
objective: "Adjust your rendered output with Blender's Compositor."
estimated_minutes: 5
---

# Compositing and post in Blender

## What compositing is

Compositing = combining + adjusting rendered images after raw render. Like Lightroom for 3D renders.

Operations:
- **Color grading.** Adjust contrast, saturation, color balance.
- **Effects.** Glow, blur, lens distortion.
- **Combine layers.** Background + mid-ground + foreground.
- **Add overlays.** Text, logos, lens flares.

The Compositor workspace handles this without leaving Blender.

## When to composite vs. re-render

Re-render takes time. Compositing is fast.

For:
- Color adjustment: composite.
- Adding effects: composite.
- Tweaking exposure: composite.

For:
- Geometry change: re-render.
- Material change: re-render.
- Light change: re-render (usually).

Some changes can be approximated in compositing (relight via Normal Pass + lighting nodes — advanced).

## The Compositor

Window → Compositing workspace (or via dropdown).

Two main nodes auto-appear:
- **Render Layers.** Source — the rendered image / multipass.
- **Composite.** Output — the final composited result.

Use Compositing checkbox in Render Properties to enable.

## Basic color adjustment

Add nodes (Shift+A):
- **Color Balance.** Lift / Gamma / Gain wheels.
- **Hue/Saturation.** Adjust HSV.
- **Bright/Contrast.** Adjust brightness + contrast.
- **RGB Curves.** Curve adjustments per channel.
- **Color Correction.** Comprehensive panel.

Plug Render Layers → adjustment node → Composite.

Result: graded render.

## Glow + bloom

For bright highlights (light sources, specular):
- Add Glare node (Shift+A → Filter → Glare).
- Type: Fog Glow (soft bloom), Streaks (anamorphic streaks), Ghosts.
- Tweak strength + threshold.

Bloom adds production value to glossy / emissive renders.

## Lens distortion

Add Lens Distortion node:
- **Distortion.** Barrel (positive) / pincushion (negative).
- **Dispersion.** Chromatic aberration (color fringing).

Subtle (Distortion 0.05, Dispersion 0.01) mimics real lenses; not noticeable but adds 'photographed' feel.

## Depth of field in post

If you didn't enable DoF on camera: Add Defocus node.

Inputs:
- **Image (from Render Layers).**
- **Z Depth pass (from Render Layers).**
- **F-Stop.** Aperture.
- **Focus distance** (via blur amount).

Approximate; not as good as camera DoF; useful if DoF was forgotten.

## Vignette

Add Mask node (or use procedural mask from gradients):
- Create dark edges around the frame.
- Multiply with image (multiply blend mode).

Or quicker: enable Vignette in Color Management → Look settings (some look presets include subtle vignette).

## File output for multipass

If using render passes (Diffuse / Specular / etc.):
- Add File Output node.
- Each input becomes a separate output file.
- Configure file format + path.

For: archive renders with multipass data for future re-grading.

## Stacking adjustments

Compositor is node-based:
- Plug nodes in sequence: Render Layers → Color Balance → Glare → Lens Distortion → Composite.
- Each modifies the previous.
- Reorder by re-routing connections.

Like layers in Photoshop but more flexible.

## Color correcting per pass

For multipass renders:
- **Diffuse pass:** adjust brightness / saturation.
- **Specular pass:** adjust highlights.
- **Volume pass:** adjust atmosphere intensity.
- **Combine via Mix nodes (Add for light passes).**

This is the "compositing workflow" used in film + high-end animation.

## Animation compositing

For animation: Compositor runs per frame.

For consistent grading across frames: set up Compositor once; renders apply automatically.

For dynamic grading (color changes over frame range): use Animated values on Compositor nodes (keyframes).

## Real-time preview

Compositor has a Viewer:
- Add Viewer node (Shift+A → Output → Viewer).
- Connect any intermediate point.
- The Image Editor (set view to Viewer) shows that point's result.

For tuning: connect viewer mid-pipeline; see effect of each node.

## Save compositor setup

Compositor lives in the .blend file. Save = preserve compositing.

For reuse across projects: append nodes from one .blend to another. Or build into a Reusable Group (Ctrl+G).

## Common compositing nodes

Productivity examples:
- **Add Glare for bloom.**
- **Add Color Balance for tone.**
- **Add Lens Distortion for realism.**
- **Add Vignette for focus.**
- **Add Film Grain for texture.**

Mix-and-match per project; save as template.

## Compositing vs. external apps

Some artists prefer:
- **DaVinci Resolve.** For animation color grading.
- **After Effects.** For motion graphics + advanced compositing.
- **Nuke.** For high-end VFX.

Blender's compositor is competent for most workflows; external apps offer more depth.

Workflow: render in Blender; export EXR sequence; composite in external.

## Final delivery

After compositing:
- Render Animation (Ctrl+F12): re-renders with Compositor + saves to output path.
- For final delivery: PNG sequence + assemble to video.
- OR: in Compositor, output as final video format directly (FFmpeg through File Output).

## Mistakes to avoid

- **Compositing without using passes.** Limited adjustment range.
- **Heavy compositing covering bad render.** Garbage in / out.
- **Forgetting to enable Compositing.** Renders without effects applied.
- **No saved presets.** Rebuild same compositor every project.

## Summary

- Compositing = post-render adjustments without re-rendering.
- Compositor = node-based workspace; Render Layers → adjustment chain → Composite.
- Common effects: color balance, glare/bloom, lens distortion, vignette, grain.
- Multipass renders enable per-pass grading.
- Compositor lives in .blend; saved with project.
- For complex animation: external grading tools (DaVinci Resolve) may be better.

Module 4 next: animation, rigging, simulation.
