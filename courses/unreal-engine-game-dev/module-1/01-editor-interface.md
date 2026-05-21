---
module: 1
position: 1
title: "Editor interface and viewport navigation"
objective: "Find your way around Unreal Engine's interface; move through 3D worlds."
estimated_minutes: 5
---

# Editor interface and viewport navigation

## Why UE5's interface is dense

Unreal Engine's editor packs in real-time rendering, level design, Blueprint visual scripting, material editing, animation systems, audio, networking, debugging — all in one application. The interface reflects this scope.

On first launch, the editor shows 8-12 visible panels. Daunting but learnable.

## The main editor windows

Default panels:
- **Viewport** (center) — 3D scene view.
- **Content Browser** (bottom) — project asset library.
- **Details panel** (right) — properties of selected actor.
- **Outliner** (right-top) — list of actors in the level.
- **Toolbar** (top) — Play, Build, Settings.
- **Place Actors panel** (left) — drag actors into the scene.

Plus optional panels (statistics, animation, materials, etc.) opened as needed.

## Viewport navigation

Multiple navigation modes:

**Fly mode (default):**
- **Right-click + WASD.** Move forward / left / back / right while looking.
- **Right-click + Q / E.** Move down / up.
- **Right-click + drag.** Look around.
- **Shift.** Faster movement.
- **Scroll wheel.** Change movement speed.

This is the game-style navigation. Most natural for level work.

**Orbit mode:**
- **Alt + left-click drag.** Orbit around focus point.
- **Alt + right-click drag.** Zoom.
- **Alt + middle-click drag.** Pan.

Familiar from Maya / Blender. For inspecting models from all angles.

## Multiple viewports

Click the four-pane icon in viewport corner; splits into 4 views (top, side, front, perspective).

For: level layout where you need multiple angles simultaneously. Most editors use single perspective view.

## Viewport modes

Top-left of viewport — dropdown:
- **Lit.** Standard view with all lighting.
- **Unlit.** Material color only; no lighting.
- **Wireframe.** Show polygon structure.
- **Player Collision.** Show collision shapes.
- **Lighting Only.** Just the lighting (gray world).
- **Detail Lighting.** Lighting + texture.

For debugging: switch mode based on what you're investigating.

## Show flags

Show menu in viewport: toggle visibility of:
- Grid, Lights, Volumes, Brushes, Nanite Wireframe, Lumen Scene, etc.

For: hide distractions; isolate what you're working on.

## Selecting actors

- **Left-click.** Select.
- **Shift + click.** Add to selection.
- **Ctrl + click.** Add / remove.
- **F.** Frame selection (focus camera on selected).

For: selecting deep in nested actors, hierarchical selection (Outliner is easier).

## Transforming actors

After selecting:
- **W.** Translate (move).
- **E.** Rotate.
- **R.** Scale.

Gizmo widgets appear; drag to transform. Snap to grid via toggle in top bar.

For numerical input: Details panel → Transform → enter values.

## Snapping

Top-right of viewport — snapping settings:
- **Position snap.** Snap to grid (e.g., 10 units).
- **Rotation snap.** Snap to angle (e.g., 15°).
- **Scale snap.** Snap to factor.

For: precise placement; avoid sub-pixel drift.

## Content Browser

Bottom panel; browse all project assets:
- Folders for organization.
- Asset types (Material, StaticMesh, Texture, Blueprint, etc.).
- Drag from Content Browser into Viewport to add actors.
- Right-click → New Asset / Folder / etc.

Master Content Browser for productivity.

## Place Actors panel

Left side (toggle with Window menu if hidden):
- **Basic.** Cube, Sphere, Cylinder, Camera, Light.
- **Lights.** Various light types.
- **Volumes.** Triggers, Post Process, Audio.
- **All Classes.** Everything else.

For: dragging actors into the scene.

## Outliner

Right side; hierarchical list of all actors in the level:
- Folders for organization (right-click → Create Folder).
- Search (top of panel).
- Hide / show / lock per actor.

For navigating large scenes; faster than clicking in viewport.

## Details panel

Right side; shows selected actor's properties:
- Transform (position, rotation, scale).
- Component list (mesh, lights, collisions, etc.).
- Material slots.
- Various class-specific properties.

For: configuring actors after placement.

## Modes

Top-left of toolbar:
- **Selection mode.** Default; pick/move actors.
- **Landscape mode.** Sculpt terrain.
- **Foliage mode.** Paint vegetation.
- **Mesh Paint mode.** Paint vertex colors.
- **Brush mode.** Carve geometry with brushes (BSP).

For: switching context for specific work.

## Workspaces

Window menu → Load Layout. Pre-built layouts:
- **Default.** General work.
- **Animation.** Animation-focused panels.
- **Sequencer.** Cinematic editing.

Save your own (Window → Layout → Save).

## Hotkeys mastery

Critical shortcuts:
- **F.** Focus.
- **G.** Game view (hide editor UI in viewport).
- **End.** Drop to floor.
- **Ctrl+D.** Duplicate selected.
- **Delete.** Remove from scene.
- **Ctrl+S.** Save current level.
- **Ctrl+Shift+S.** Save All.
- **Ctrl+Z.** Undo.
- **Ctrl+P.** Pilot actor (camera follows).

Master ~30 shortcuts; productivity multiplies.

## Project Settings vs. World Settings

- **Project Settings.** Global to the project (rendering, input, packaging).
- **World Settings.** Per-level (default GameMode, lighting, post-process).

Edit → Project Settings vs. Settings → World Settings.

## Plugins

Edit → Plugins. Hundreds of plugins extend UE5:
- Built-in (Lumen, Nanite, Niagara, MetaHuman).
- Community plugins.
- Epic Marketplace (free + paid).

Enable plugins as needed; some require restart.

## Editor preferences

Edit → Editor Preferences:
- Viewport behavior.
- Auto-save (recommended every 5-10 min).
- Keyboard shortcuts customization.
- Theme.

Configure once; rarely revisit.

## Performance considerations

Real-time editor is GPU-intensive:
- **Modern GPU recommended.** RTX 4070+ for editing 4K Nanite scenes.
- **Disable unnecessary features.** Lumen / Nanite cost GPU.
- **Lower viewport quality** for editing (settings reverted at play).

For laptop work: reduce viewport scale + features.

## Mistakes to avoid

- **Single panel layout forever.** Customize for tasks.
- **Slow navigation.** WASD + right-click is fast; click-and-drag less.
- **No snapping.** Geometry drifts.
- **Ignoring Outliner.** Hunt-and-click for selection.
- **No auto-save.** Editor crashes; lose work.

## Summary

- UE5's interface: Viewport, Content Browser, Outliner, Details, Place Actors.
- WASD + right-click for fly navigation; Alt+drag for orbit.
- W/E/R for translate / rotate / scale.
- Snapping for precise placement.
- Outliner for hierarchical actor selection.
- Custom layouts saved per task.
- Master ~30 shortcuts.

Next: project creation and asset organization.
