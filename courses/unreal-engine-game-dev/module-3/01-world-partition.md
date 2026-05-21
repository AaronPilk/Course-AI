---
module: 3
position: 1
title: "World Partition and large worlds"
objective: "Build expansive open worlds that stream efficiently."
estimated_minutes: 5
---

# World Partition and large worlds

## The large-world problem

A single-level approach hits limits:
- **Memory.** Loading a whole 10km × 10km world = gigabytes of RAM.
- **Performance.** Rendering everything every frame = unusable.
- **Editor.** Loading the whole world to edit a tiny corner = slow.
- **Source control.** One huge .umap file edited by one person at a time.

For open worlds: streaming. Load chunks as the player approaches; unload distant ones.

## World Partition

Unreal 5's solution: World Partition. Automatic spatial streaming.

The world is divided into a grid of cells (typically 25m or 50m). Each cell's actors stream in when the player approaches.

Editor: loads only what you're working on. Run-time: streams chunks dynamically.

## Creating a World Partition world

File → New Level → Empty Open World (uses World Partition).

Or: convert existing level via World Partition menu.

The level looks the same; the streaming layer is invisible.

## The Loading Range

Default: 25,600 cm (256m) loading distance. Actors within range loaded.

Configurable per project / per level. Larger range = more loaded = more memory.

## Editing in World Partition

To work on a section:
- World Partition window shows the cell grid.
- Click cells to load them in the editor.
- Or: navigate around in viewport; cells load as you approach (similar to run-time).

Save loaded cells via File → Save.

## Data layers

Tag actors as belonging to data layers:
- Layer "Day" / "Night" — toggle for time of day variants.
- Layer "Tutorial" / "Main" — toggle for tutorial mode.
- Layer "Quest_X" / "Quest_X_Completed" — toggle for quest state.

Layers can be activated / deactivated at runtime via Blueprint.

For: variations of the same world without separate levels.

## HLOD (Hierarchical Levels of Detail)

For distant scenery: HLOD pre-builds simplified versions of multiple actors.

When zoomed out / far away: see the HLOD (low-poly + simplified materials).
Closer: original actors stream in.

Built via World Partition's HLOD setup; UE5 auto-generates.

For: distant skylines, cities seen from afar, expansive vistas. Critical for open worlds.

## Streaming source

The player is the streaming source by default. Actors within the loading range load.

Multiple sources: spawn additional streaming sources (e.g., another player in coop, or a free-roaming camera in cinematics).

Configurable in Player Controller.

## World Partition + actor references

Actors in unloaded cells aren't accessible:
- Get All Actors of Class doesn't find them.
- Direct references to unloaded actors may be invalid.

For cross-cell references: use streaming-aware patterns (event dispatchers on Game Mode; soft object references).

## Soft object references

Variable type: Soft Class Reference / Soft Object Reference.
- Doesn't force the referenced asset to load.
- Loaded on demand (Load Asset Async).

For: optional / lazy-loaded assets in large worlds.

For: assets referenced by Blueprint in unloaded cells.

## Sublevels (legacy / hybrid)

Older Unreal had World Composition (sublevels):
- Multiple .umap files; persistent + sublevels.
- Sublevels stream in based on position.

UE5 still supports for backwards compatibility but World Partition is preferred.

For new projects in 2026: use World Partition.

## Asset organization in large worlds

For 10km world:
- Bulk environmental assets (rocks, trees, terrain materials).
- Region-specific assets (cities, dungeons, landmarks).
- Streaming-aware naming: prefix region (e.g., NorthForest_Tree_01, City_Building_01).

For: easy filtering + editing.

## Performance considerations

Open worlds can max performance:
- **Streaming hitches.** Cells load = brief frame drops.
- **GPU stress.** Many simultaneous actors.
- **Memory pressure.** Total loaded data near limits.

Mitigations:
- HLOD for distant content.
- Smaller cell sizes (faster individual streams).
- Persistent assets (always-loaded essentials).
- Texture streaming pools tuned per platform.

For: 60 FPS open world on Xbox Series X / PS5; serious tuning required.

## World Settings for streaming

World Settings (per level):
- Loading Range.
- Default cell size.
- HLOD configuration.
- Data layers.

Tune per project.

## Multiple sub-worlds

For very large worlds: hierarchical World Partition:
- Persistent World Partition.
- Sub-worlds with their own partitioning.
- Activated as player moves between regions.

For: 100km+ worlds (open seas, continental). Rare; most games stay within 10km.

## Modern open-world examples

UE5 open world ships:
- **Hellblade II.** Cinematic open paths.
- **Black Myth: Wukong.** Action RPG with vast environments.
- **Star Wars Outlaws.** Multi-planet open world.

These leverage World Partition + Nanite + Lumen + virtual texturing — UE5's full stack.

For learning: study these games' technical breakdowns (often shared at GDC / Epic developer talks).

## Mistakes to avoid

- **Single-level open world.** Performance + memory crash.
- **No HLOD.** Distant areas look ugly or pop in obviously.
- **Tight loading range.** Constant streaming hitches.
- **No source control for partitioned worlds.** Conflicts everywhere.
- **All actors in one data layer.** No variation possibilities.

## Summary

- World Partition = automatic spatial streaming for open worlds.
- Cell grid divides world; actors stream as player approaches.
- HLOD provides distant simplified geometry.
- Data layers enable variations (day/night, quest state).
- Streaming source = player by default; configurable.
- Soft references for cross-cell asset dependencies.
- HLOD + tuning critical for 60 FPS open worlds.

Next: Nanite.
