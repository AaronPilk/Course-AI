---
module: 5
position: 1
title: "After Effects roundtripping via Dynamic Link"
objective: "Use Premiere + After Effects together without exports."
estimated_minutes: 5
---

# After Effects roundtripping via Dynamic Link

## What Dynamic Link is

Dynamic Link is Adobe's live-link between apps. Edit in After Effects; changes appear in Premiere immediately — no exports, no re-importing.

The opposite of the old workflow: export AE comp to MP4; import to Premiere; AE change requires re-export and re-import.

Saves hours; enables iterative motion graphics + VFX work alongside editing.

## When to use After Effects

Premiere is for editing; After Effects is for motion + VFX:
- **Complex motion graphics.** Beyond what Essential Graphics handles.
- **Compositing.** Layering elements with masks, mattes, blending.
- **VFX.** Removing wires, sky replacement, beauty work.
- **Tracking.** Surgical motion tracking + parenting.
- **3D camera moves.** True 3D layers and cameras.
- **Custom transitions.** Beyond Premiere's library.

For everyday lower thirds and basic graphics: Essential Graphics in Premiere. For sophisticated motion: After Effects.

## Replace with After Effects Composition

The dynamic link workflow:
1. In Premiere timeline: select clip (or clips).
2. Right-click → Replace with After Effects Composition.
3. After Effects launches; creates a comp containing those clips with matching settings (resolution, frame rate, duration).
4. Edit in AE — add effects, motion, compositing.
5. Save AE project; switch back to Premiere.
6. The clip on Premiere's timeline shows the AE composition live; updates as AE changes.

No export step. AE saves → Premiere updates.

## New After Effects Comp

For from-scratch graphics:
1. In Premiere: File → New → After Effects Composition.
2. Or right-click in Project panel → New Item → After Effects Composition.
3. AE launches; new empty comp matches sequence settings.
4. Build the graphic in AE.
5. Drag the AE comp into Premiere timeline.

For intros, end cards, custom transitions, etc.

## Import After Effects project

Existing AE work:
- File → Import → select .aep file.
- Or drag .aep into Project panel.
- Comps inside the AE project appear in Premiere.
- Drag into timeline.

For consistent graphics across multiple Premiere projects: maintain one AE project with the templates; import into each Premiere project.

## Performance considerations

Dynamic Link comps are LIVE renders — Premiere asks After Effects to render each frame on demand. Slower than playing back a rendered MP4.

Heavy AE comps stutter in Premiere playback. Solutions:
- **Render previews.** Sequence → Render In to Out around the dynamic-linked section.
- **Pre-render to file.** Export the AE comp to ProRes; replace in Premiere; lose dynamic link but gain performance.
- **Reduce playback resolution** (1/2 or 1/4).
- **Simplify AE comp.** Avoid unnecessary layers / effects.

For final delivery: dynamic link works; for active editing of long sequences with many comps: pre-render some.

## When to pre-render

Pre-render an AE comp when:
- The comp is final (no more iteration).
- Heavy effects causing playback stutters.
- Sequence has many comps; cumulative load too high.
- Other editors will work without AE installed.

When to keep dynamic-linked:
- Still iterating on the graphic.
- Comp is simple (light load).
- Solo workflow with both apps open.

## After Effects basics for Premiere editors

In AE:
- **Comp panel.** The canvas; layered like Photoshop.
- **Timeline panel.** Layers + their durations + effects.
- **Project panel.** Files in your AE project.
- **Effects & Presets panel.** Drag effects onto layers.

Layers: every element is a layer (footage, text, shape, solid, light, camera).

For Premiere editors who haven't done AE: easier to think of it as Photoshop+timeline.

## Common AE workflows for editors

**Text animation.**
- New text layer; type.
- Animation menu → Apply Animation Preset (hundreds of pre-built text animations).
- Pick one; preview; tweak duration.

**Logo reveal.**
- Import logo (PNG / AI).
- Animate Position / Opacity / Scale over 1-2s.
- Add easing (right-click keyframes → Easy Ease).
- Done.

**Smooth transitions.**
- Take last frame of clip A + first frame of clip B into AE.
- Mask / morph / blend between them.
- Replace the cut on Premiere's timeline with the AE comp.

## Motion Graphics Templates (MOGRT)

In AE: build a comp; expose properties for editing.
- Window → Essential Graphics (in After Effects).
- Click "Solo Supported Properties" on properties to expose.
- Or drag specific properties into the Essential Graphics panel.
- Save: Export As Motion Graphics Template (.mogrt).

Now usable in Premiere via Essential Graphics → drag .mogrt → use.

For a YouTube creator building a custom lower-third: build in AE; export MOGRT; use forever in Premiere.

## Tracking with AE

AE has 2D and 3D camera tracking far beyond Premiere's:
- **2D Mocha.** Planar tracking; insert objects onto planar surfaces (signs, screens, walls).
- **3D Camera Tracker.** Reconstructs 3D camera move from footage; lets you place 3D objects in scene.
- **Stabilization.** Smooths shaky footage.

For sign replacement, screen replacement, complex stabilization: AE.

## Color grading in AE

AE has its own color tools but Premiere's Lumetri is usually better for grading.

For VFX work that requires color matching of inserted elements: do color in AE. For general grading of footage: Premiere.

## Render queue vs. dynamic link

Two ways to deliver AE work:
1. **Render Queue (AE).** Output to file (ProRes, MP4); import to Premiere as regular clip.
2. **Dynamic Link.** Live; no file output.

Render queue for final delivery; dynamic link for iteration.

Many editors render-queue at end of project; the dynamic link cost during edit becomes a static file for final export.

## Adobe Media Encoder integration

Both Premiere and AE send to AME for renders. AME can render multiple jobs in queue while you keep editing.

For batch AE renders: queue them in AME; let them run overnight.

## Versioning AE projects

Save Numbered Increments: File → Save Increment (Cmd+Option+S). Generates .aep, .aep_v01, .aep_v02 over time.

For risky AE changes: increment before modifying.

## After Effects + Premiere productivity tips

- Keep both open simultaneously when iterating.
- Use Window menu in either app to switch.
- AE preview can be slow; use 1/4 resolution + smaller comp area for fast preview.
- Cache AE comps frequently (Ctrl+0 / Cmd+0 toggles cache).

## Mistakes to avoid

- **Heavy AE work without pre-rendering.** Premiere stutters in playback.
- **Multiple unsaved AE projects.** Lose work to crashes.
- **Mixing color grade between apps.** Inconsistent.
- **Exporting AE → importing to Premiere when dynamic link would work.** Slow iteration loop.
- **AE for things Essential Graphics handles.** Over-engineered for simple text.

## Summary

- Dynamic Link = live connection between Premiere + After Effects.
- Edit in AE; save; Premiere updates automatically.
- "Replace with After Effects Composition" sends Premiere clips to AE.
- Pre-render finalized comps for performance; keep dynamic-linked while iterating.
- AE for motion graphics, VFX, tracking, 3D, custom transitions.
- Essential Graphics for simpler in-Premiere work.
- Render Queue (AE) → ProRes file → Premiere is the final-output path.

Next: export presets and platform delivery.
