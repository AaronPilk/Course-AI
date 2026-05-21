---
module: 1
position: 1
title: "The Unity Editor and Inspector"
objective: "Navigate Unity; understand the editor windows."
estimated_minutes: 5
---

# The Unity Editor and Inspector

## Why Unity matters in 2026

Unity powers:
- **50%+ of mobile games.** App Store + Google Play.
- **A huge share of indie + mid-tier PC games.** Steam top sellers heavily Unity-built.
- **VR / AR experiences.** Meta Quest, Vision Pro, Vive — Unity dominant.
- **AAA + console games.** Hollow Knight: Silksong, Beat Saber, Cuphead, Pokémon GO, Genshin Impact.
- **Industrial / automotive.** Real-time visualization beyond games.

Versatile + approachable + commercial-friendly licensing.

## The Unity Editor

Open Unity Hub → create new project → pick template (3D Core, 2D Core, Universal Render Pipeline (URP), High Definition Render Pipeline (HDRP)).

Editor opens. Main windows:
- **Scene view.** 3D edit view.
- **Game view.** What the player sees.
- **Hierarchy.** Scene's GameObjects.
- **Inspector.** Selected GameObject's components.
- **Project.** Asset library.
- **Console.** Debug + errors.

## Scene view navigation

For 3D scenes:
- **Right-click + drag.** Look around.
- **Right-click + WASD.** Fly while looking (FPS style).
- **Right-click + Q/E.** Down / Up.
- **Alt + left-click drag.** Orbit around focus point.
- **Alt + right-click drag.** Zoom.
- **Middle-click drag.** Pan.
- **F.** Frame selected.
- **Shift + F.** Lock view to selected.

Modern Unity (2021+): combines orbit + fly nicely.

For 2D scenes:
- **Middle-click drag.** Pan.
- **Scroll.** Zoom.
- **No vertical (Z) movement.** 2D only.

## Gizmos

In Scene view:
- **W.** Move (Translate).
- **E.** Rotate.
- **R.** Scale.
- **T.** Rect (for 2D).
- **Y.** Transform (combined).

Gizmo widgets appear; drag handles to transform.

## Snapping

Hold **Ctrl** while transforming → snap to grid.

Edit → Snap Settings to configure (e.g., 0.25 unit grid; 15° rotation).

For: precise placement.

## Inspector — the heart of Unity

When you select a GameObject, Inspector shows:
- Transform component (Position, Rotation, Scale).
- All other Components.
- Each component's properties.

Edit values; live update in Scene + Game view.

For: tuning everything about an object.

## Adding components

In Inspector:
- **Add Component button.** Search + add.
- **Drag scripts.** From Project view into Inspector.

Common components:
- Rigidbody (physics).
- Collider (collision).
- MeshRenderer (rendering).
- AudioSource (sound).
- Custom script (your logic).

For: building behavior on objects.

## Project view — assets

Browse project assets:
- Models, materials, textures, scripts, audio, scenes.
- Folders for organization.
- Drag assets into Hierarchy or Scene to use.

For: managing your project's content.

## Standard folder structure

Best practice:
- **Assets/Scripts/.** C# files.
- **Assets/Prefabs/.** Reusable objects.
- **Assets/Scenes/.** Level files.
- **Assets/Materials/.** Material assets.
- **Assets/Textures/.** Image assets.
- **Assets/Audio/.** Sound files.
- **Assets/Animations/.** Animation files.
- **Assets/UI/.** UI assets.
- **Assets/Plugins/.** Native plugins / third-party.

For: scaling projects; finding assets.

## Hierarchy — the scene tree

Lists every GameObject in current scene:
- Drag to nest (parent-child).
- Right-click → Create new GameObject types.
- Search filter at top.

For navigating dense scenes.

## Game view

What players see. Click Play (top-center) to test in editor.

- Tab between aspect ratios.
- Resolution scaling.
- Stats overlay (FPS, draw calls).

For: testing without building.

## Play mode

Press Play → game runs in editor.

While playing:
- Modifications to scene revert when you stop (intentional safety).
- Modifications to assets persist (be careful).

For: testing + iterating.

## Auto-save

Edit → Preferences → External Tools → Auto Save.

For: recovery after crashes; iterative work.

## Console

Logs, warnings, errors. Click messages to navigate to source.

Debug.Log("Hello") in scripts outputs to Console.

For: debugging; verifying script execution.

## Scene save

File → Save (Ctrl+S) saves the current scene.

Each scene is a .unity file in Assets/Scenes/.

For: version control + saving progress.

## Editor layouts

Window → Layouts → pick preset:
- **Default.** Standard.
- **Wide.** Wider Scene view.
- **2 by 3.** Comprehensive.

Save custom layouts (Window → Layouts → Save Layout).

## Hotkeys

Critical shortcuts:
- **Ctrl+S.** Save scene.
- **Ctrl+P.** Play / pause toggle.
- **Ctrl+Z / Ctrl+Y.** Undo / redo.
- **Ctrl+D.** Duplicate.
- **F.** Frame selected.
- **F2.** Rename.
- **Delete.** Remove.

Mac uses Cmd instead of Ctrl.

## Custom shortcuts

Edit → Shortcuts → customize.

For productivity: bind common actions to memorable keys.

## Render Pipeline templates

Unity has multiple render pipelines:
- **Built-in.** Default; older but compatible.
- **URP (Universal Render Pipeline).** Mobile + cross-platform.
- **HDRP (High Definition Render Pipeline).** PC + console; AAA visuals.

Pick at project creation. Different rendering features per pipeline.

For learning: URP is recommended (modern + cross-platform).

## Mistakes to avoid

- **No folder structure.** Flat Assets/.
- **Edit in Play mode without realizing.** Changes lost when stopped.
- **No auto-save.** Crash = lost work.
- **Render pipeline mismatch.** Materials don't render correctly.
- **Default layouts forever.** Productivity caps.

## Summary

- Unity Editor: Scene view (edit), Game view (play), Hierarchy (scene tree), Inspector (component editor), Project (assets), Console (logs).
- Navigation: WASD + right-click in 3D; pan + zoom in 2D.
- Gizmos: W/E/R for move / rotate / scale.
- Inspector + Add Component = build object behavior.
- Folder structure matters; standardize early.
- Play mode for testing; changes revert.
- Auto-save mandatory.

Next: GameObjects and Components.
