---
module: 5
position: 3
title: "Saving, loading, and persistence"
objective: "Persist player progress between sessions."
estimated_minutes: 5
---

# Saving, loading, and persistence

## The save system

UE5's built-in save system:
- **SaveGame** = serializable data class.
- **Save Game to Slot** = write to disk.
- **Load Game from Slot** = read from disk.
- **Files stored** in Saved/SaveGames/ directory.

For most games: this stack handles save / load needs.

## SaveGame class

Create custom SaveGame:
- Content Browser → Blueprints → Save Game class.
- Add variables (PlayerHealth, CurrentLevel, Inventory, GameTime, etc.).
- Add functions (helpers for save/load).

Each SaveGame holds the data you want persisted.

## Saving to disk

In Blueprint:
1. Create SaveGame instance (Create Save Game Object node).
2. Populate variables from game state.
3. Save Game to Slot node — provide SaveGame, slot name, user index (0 for single-player).

For: "save game" menu button; auto-save at checkpoints.

## Loading from disk

In Blueprint:
1. Load Game from Slot node — provide slot name + user index.
2. Returns SaveGame instance (or invalid if no save exists).
3. Cast to your custom SaveGame class.
4. Read variables; apply to game state.

For: "load game" menu button; auto-load latest save.

## What to save

- Player progression (XP, level, unlocked content).
- Inventory contents.
- Quest state.
- Game time / elapsed.
- Current level + position (for save-and-quit).
- Settings (volume, controls, graphics).
- Per-checkpoint snapshots.

For: every kind of game has different needs; design what's important.

## Save slots

Multiple slot names:
- "DefaultSave" — main save.
- "AutoSave" — automatic.
- "QuickSave" — F5 shortcut.
- "Checkpoint_1", "Checkpoint_2" — story checkpoints.

For: multi-save support; protect against corrupt saves.

## Game Instance for persistent data

The Game Instance lives across levels:
- Hold currently-loaded SaveGame.
- Reference for "what's the current game state?".
- Functions: Save Current Game, Load Saved Game, etc.

For: clean persistence architecture.

## Save events

Where to save:
- **Manual.** Player triggers Save menu.
- **Auto-save.** Periodic; every 5 min OR at level transitions.
- **Checkpoint.** At designated story beats.
- **On Quit.** Save when game closes (App is suspending).

For: never lose progress.

## Saving game time + level state

For "save anywhere" games:
- Save current level reference (Asset Reference type).
- Save player Transform (position, rotation).
- Save NPC states, quest progress, world state.
- On Load: Load level → restore player Transform → restore world state.

Comprehensive; more code than simple checkpoint save.

## Settings persistence

Player settings:
- Audio volumes (Master, Music, SFX, Voice).
- Graphics quality (Low / Medium / High / Custom).
- Control bindings.
- Subtitle / accessibility options.

Stored in GameUserSettings (built-in) or custom SaveGame.

For: respecting player preferences across sessions.

## Cloud saves

For cross-device saves:
- Steam Cloud (Steam games auto-sync save folder).
- Epic Games Store (similar).
- Cross-platform games: handled by platform.

For PC: usually built-in. For mobile / cross-platform: more setup.

## Async loading

For: avoiding frame drops while loading saves.

Use async nodes:
- Load Asset Async.
- Async Load Game from Slot.

Game continues while loading; callback fires when complete.

For: smooth player experience.

## Versioning saves

Game updates change save format:
- Add version number to SaveGame class.
- On Load: check version; if old, migrate to new format.

For: not breaking saves with game updates.

## Save corruption handling

For: protecting players from broken saves.

- Multiple save slots (auto-save + checkpoints + manual).
- Validate loaded data (check for missing references).
- Fallback to previous valid save if corrupt.
- Backup saves to cloud if possible.

For: not losing player progress to crashes / bad data.

## Save-system patterns

**Checkpoint save.** Game saves at designated points; player loads → resumes from last checkpoint.

**Manual save anywhere.** Player saves explicitly anywhere; multiple slots.

**Auto-save.** Game saves continuously; only one save slot.

**Save-and-quit.** Save full state including position; load resumes exactly where left.

Each fits different game styles.

## Settings menu

Settings UI typically:
1. Categories (Audio, Graphics, Controls, Accessibility).
2. Each category has settings.
3. Apply button writes to disk.
4. Reset button restores defaults.
5. Cancel button reverts changes.

Standard UMG implementation.

## Console save behavior

Consoles (PS5 / Xbox / Switch) have platform-specific save APIs:
- Console certification requires specific save behaviors.
- Cloud save support per platform.
- Trophy / achievement save integration.

For: console games, integrate with platform's save system.

## Mistakes to avoid

- **No save system.** Players lose progress.
- **Single save slot.** Corrupt save = total loss.
- **No versioning.** Save break after updates.
- **No validation.** Corrupted data crashes game.
- **No auto-save.** Players forget; lose progress.

## Summary

- SaveGame class holds persisted data.
- Save Game to Slot / Load Game from Slot to disk.
- Multiple slots for protection.
- Game Instance holds current loaded data.
- Auto-save + manual save + checkpoint patterns.
- Settings persistence separate from gameplay saves.
- Version saves for game updates.
- Cloud + platform-specific saves for cross-device.

Next: packaging + shipping.
