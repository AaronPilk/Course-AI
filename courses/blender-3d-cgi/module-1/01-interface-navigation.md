---
module: 1
position: 1
title: "Interface and navigation"
objective: "Find your way around Blender; move in 3D space confidently."
estimated_minutes: 5
---

# Interface and navigation

## Why Blender's interface intimidates

Blender presents 50+ panels and 1000+ shortcuts on first launch. Looks impenetrable.

But it's organized once you know the pattern:
- **Editors.** Panels are configurable; each shows a specific tool (3D Viewport, Outliner, Properties, etc.).
- **Workspaces.** Pre-built layouts for common tasks (Modeling, Sculpting, UV Editing, Animation, Compositing).
- **Shortcuts.** Tied to whichever editor your cursor is over.

After a few hours, you stop seeing chaos; you see modularity.

## The default layout

When Blender opens, you see:
- **3D Viewport** (large center area) — your 3D scene.
- **Outliner** (top-right) — hierarchical list of scene objects.
- **Properties Panel** (bottom-right) — settings for selected object + scene.
- **Timeline** (bottom) — animation controls.

This is the "Layout" workspace — Blender's general-purpose default.

## Workspaces

Tabs at top of window: Layout, Modeling, Sculpting, UV Editing, Texture Paint, Shading, Animation, Rendering, Compositing, Geometry Nodes, Scripting.

Each switches to a panel layout tuned for that task. Click a tab → editor windows rearrange.

For each phase of work, switch to the matching workspace. Saves panel-rearranging.

## Custom workspaces

Modify any workspace; right-click tab → "Duplicate" to save your version. Or "+" to add new.

Pro habit: customize 1-2 workspaces to your hand; the defaults are starting points.

## 3D Viewport navigation

Three movements:
- **Orbit.** Middle-mouse-drag. Rotates camera around scene center.
- **Pan.** Shift + middle-mouse-drag. Moves view side-to-side / up-down.
- **Zoom.** Scroll wheel. Moves camera closer / farther.

Alternative: Numpad keys — 1 (front view), 3 (side view), 7 (top view), 0 (camera view), 5 (toggle perspective / orthographic).

Without a numpad: enable "Emulate Numpad" in preferences; use number row.

For tablets / laptops without middle-click: trackpad gestures or "Emulate 3-button Mouse" in preferences.

## Selecting objects

- **Left-click.** Select.
- **Shift + click.** Add to selection.
- **Ctrl + click.** Multi-select with last-selected as "active."
- **A.** Select all.
- **Alt+A.** Deselect all.
- **B.** Box select (draw rectangle).
- **C.** Circle select (paint over things).

Selected objects highlight; the most-recently-selected is the "active" object (slightly different color).

## The 3D cursor

Orange/red crosshair = the 3D cursor. Indicates where new objects spawn + pivot point for operations.

Move cursor: Shift+right-click in viewport. Reset to world origin: Shift+S → Cursor to World Origin.

For precise placement of new objects: position cursor first.

## Adding objects

Shift+A → Add menu → pick (Mesh > Cube, Sphere, Cylinder; Light > Point, Sun; Camera; etc.).

Object spawns at 3D cursor position.

Operator panel (bottom-left, "F9" to toggle) lets you adjust spawn parameters after-the-fact (e.g., cube size, subdivisions).

## Transforming objects

Three transforms:
- **G.** Grab (move). G then drag.
- **R.** Rotate. R then drag.
- **S.** Scale. S then drag.

Constrain to axes:
- **G + X.** Move along X axis only.
- **G + Y.** Y only.
- **G + Z.** Z only.
- **G + Shift+Z.** Free-move in X-Y plane (constrains OUT of Z).

Type a number while transforming: precise input (e.g., G + Z + 2 + Enter = move 2 units up).

## Edit Mode vs. Object Mode

Two main modes:
- **Object Mode.** Manipulate whole objects (move, rotate, scale, parent, link).
- **Edit Mode.** Modify the geometry inside an object (vertices, edges, faces).

Toggle: Tab key.

Most modeling happens in Edit Mode. Object Mode for scene-level work.

## Edit Mode selection types

In Edit Mode (with a mesh):
- **1.** Vertex selection.
- **2.** Edge selection.
- **3.** Face selection.

Switch as needed for the operation.

Selection shortcuts in edit mode: A (all), Alt+A (none), B (box), C (circle), L (linked — selects all connected to clicked).

## The Properties Panel

Right side; tabs:
- **Render Properties.** Engine, samples, render output.
- **Output Properties.** Resolution, frame rate, output format.
- **View Layer Properties.** Layer settings.
- **Scene Properties.** Units, gravity, audio.
- **World Properties.** World background, HDRI.
- **Object Properties.** Transform values, visibility.
- **Modifiers.** Stack of non-destructive modifiers.
- **Particles.**
- **Physics.**
- **Object Constraints.**
- **Object Data.** Mesh data (vertex groups, shape keys).
- **Material Properties.** Materials assigned to object.
- **Texture Properties.**

Each tab shows context-specific settings. Click around to see what's there.

## The Outliner

Hierarchical scene browser. Collections → Objects → Data.

Right-click for context menu (delete, duplicate, parent, hide).

Toggle visibility (eye icon), selectability (cursor icon), and renderability (camera icon) per object.

## Collections

Folders for organizing scene objects. Right-click in Outliner → New Collection. Drag objects in/out.

For complex scenes: collections by role (Characters, Props, Environment, Lights, Cameras).

Toggle visibility of whole collections at once.

## Save and load

- **Ctrl+S.** Save current .blend file.
- **Ctrl+Shift+S.** Save As.
- **File → Open Recent.** Recent files.

.blend = Blender's project file format. Contains scene + objects + materials + textures (or links to textures) + animations.

For backup: keep multiple versions (Ctrl+Alt+S saves an incremented version).

## Auto save

Edit → Preferences → Save & Load → Auto Save: every 2 minutes.

Recovery: File → Recover → Auto Save.

Hugely important; Blender crashes happen.

## Undo / Redo

- **Ctrl+Z.** Undo.
- **Ctrl+Shift+Z.** Redo.

Default 32 undo steps. Increase in Preferences → System → Memory & Limits.

Use heavily; don't fear experimentation.

## Search

F3 (or Spacebar in older versions) → search any command by name. "Bevel" → finds + executes.

Useful when you don't remember shortcuts.

Saves browsing menus.

## Preferences

Edit → Preferences. Tabs:
- **Interface.** Theme, font, language.
- **Themes.** Color schemes (Blender Light, Blender Dark, others).
- **Viewport.** Display settings.
- **Lights.** Studio lights for viewport rendering.
- **Editing.** Edit Mode behavior.
- **Animation.** Auto-Keyframing settings.
- **Add-ons.** Built-in and external plugins (enable / disable).
- **Input.** Keymap (3-button mouse emulation, numpad emulation).
- **Navigation.** Orbit-around-selection toggles.
- **Keymap.** Customize shortcuts.
- **System.** GPU, memory.
- **Save & Load.** Auto save.
- **File Paths.** Asset library locations.

Configure once; rarely revisit.

## Common addons to enable

Out of the box, enable:
- **Node Wrangler.** Shader editor enhancements.
- **LoopTools.** Modeling helpers.
- **Bool Tool.** Boolean operations interface.
- **Extra Objects.** Adds more primitive types.

Edit → Preferences → Add-ons → search + check.

## Mistakes to avoid

- **Skipping navigation practice.** Confusion compounds.
- **Not customizing shortcuts.** Default mouse middle-click on laptop is painful.
- **No auto-save.** Lose work to crashes.
- **One workspace forever.** Switch to the workspace for the task.
- **Hidden objects forgotten.** Outliner visibility toggles cause "where's my object?"

## Summary

- Blender = panels in workspaces; switch workspace per task.
- 3D Viewport: middle-mouse orbit, shift+middle pan, scroll zoom.
- Transform: G / R / S; constrain with X/Y/Z; type numbers for precision.
- Object Mode = whole objects; Edit Mode = geometry inside.
- 3D Cursor sets spawn position + pivot.
- Outliner organizes scene; collections group objects.
- Auto-save + undo + Ctrl+S frequently.
- F3 search finds any command.

Next: polygon modeling fundamentals.
