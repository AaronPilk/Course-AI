---
module: 5
position: 1
title: "Pawns, Controllers, GameMode, GameState"
objective: "Structure your game's core architecture."
estimated_minutes: 5
---

# Pawns, Controllers, GameMode, GameState

## The framework classes

UE5 provides a standard gameplay framework — core classes that orchestrate everything:
- **Pawn.** The body / object the player controls.
- **Character.** Specialized Pawn for humanoid characters (with movement component + capsule).
- **PlayerController.** Bridges player input + the Pawn.
- **GameMode.** Game rules + default classes per level.
- **GameState.** Per-level shared state (score, time remaining).
- **PlayerState.** Per-player data (name, score, team).
- **GameInstance.** Persistent data across levels.

Understanding the hierarchy = understanding UE5 games.

## Pawn — the body

Pawn is the actor a player or AI controls. Has:
- Movement component (optional).
- Components for behavior.
- Possession (the controller "possesses" the pawn).

Examples: a tank in a tank game; a spaceship in space; a character.

Specialized: **Character** = Pawn + movement system (CharacterMovementComponent) + capsule collision + skeletal mesh — ideal for humanoid players.

## PlayerController — input + view

PlayerController:
- Receives input (Move action, Jump action, etc.).
- Possesses a Pawn.
- Controls the camera view.
- Handles UI / HUD.
- Persists when the Pawn dies (allows respawning).

Separation: input + control persist; Pawn (body) can be swapped.

For: respawn on death; swap characters mid-game; possess vehicles.

## GameMode — the rules

GameMode defines:
- **Default Pawn class** spawned for players.
- **PlayerController class.**
- **HUD class.**
- **GameState class.**
- **PlayerState class.**
- **Spectator class.**
- Game-specific rules (win conditions, lives, time limit, score thresholds).

Per-level via World Settings → GameMode Override. Different rules per level.

For: lobby vs. battle vs. menu — each level has its own GameMode.

## GameState — shared per-level state

GameState (one per server / level):
- Round time remaining.
- Current score.
- Win condition tracking.
- Replicated to all clients in multiplayer.

For: knowing the game's state outside any one player's perspective.

## PlayerState — per-player data

PlayerState (one per player):
- Player name.
- Player score.
- Team.
- Replicated to all clients.

For: identifying players + their state in multiplayer.

## GameInstance — persistent across levels

GameInstance:
- Lives the entire game session (from boot to quit).
- Doesn't reset when changing levels.
- For: save game data, settings, player progress.

For: anything that survives level transitions.

## Hierarchy in single-player

1. Game boots → GameInstance created.
2. Player loads a level → GameMode + GameState created per level.
3. Player spawn → Pawn (Character) + PlayerController + PlayerState created.
4. Player plays → input via PlayerController, body is Pawn.
5. Player dies → Pawn destroyed; PlayerController persists; respawn creates new Pawn.
6. Level changes → GameMode + GameState + Pawn destroyed; PlayerController + PlayerState may persist; GameInstance untouched.

For: clean architecture; reusable components.

## Multiplayer hierarchy

Same as single-player but:
- Server has one set of GameMode + GameState.
- Each client has their own PlayerController + Pawn.
- PlayerStates exist for all players (replicated).
- GameMode is server-only.

For: standard multiplayer; networked gameplay.

## Setting GameMode

World Settings → GameMode Override → pick.

Or set globally in Project Settings → Maps & Modes → Default GameMode.

For: per-level rules.

## Possessing a Pawn

PlayerController possesses a Pawn via:
- Auto-spawn at PlayerStart actor (default).
- Explicit Possess function call.

Switch Pawn: UnPossess current; Possess new.

For: vehicle gameplay (player exits character, possesses vehicle, drives, exits, possesses character back).

## Communication patterns

Within the framework:
- **Pawn ↔ PlayerController.** Reference each other (PlayerController.GetPawn(); Pawn.GetController()).
- **PlayerController ↔ GameMode.** Get player controller's game mode via Get Game Mode.
- **GameState.** Get Game State; access shared state.
- **GameInstance.** Get Game Instance; persistent data.

For: navigating between framework actors.

## Custom Pawn / Character

Create BP_MyCharacter as Character child:
- Add custom components (gun, inventory, ability system).
- Override movement properties.
- Add custom variables (health, energy, score).
- Override input handlers.

For: character-specific gameplay.

## Custom GameMode

BP_BattleGameMode as GameMode child:
- Override Default Pawn Class to BP_MyCharacter.
- Add win condition logic.
- Spawn enemies.
- Track score.
- Handle game end.

Place in level via World Settings → GameMode Override.

For: distinct gameplay per level.

## Multiplayer considerations

For networked games:
- **Authority.** GameMode + GameState exist on server only.
- **Replication.** State changes replicated client-to-server-to-client.
- **Possession.** Each client's PlayerController possesses their own Pawn.

For: clean network code; authoritative server.

## Common patterns

**Lobby + Battle + Menu.**
- Main menu level uses MenuGameMode (no character; just UI).
- Lobby level uses LobbyGameMode (character + lobby UI).
- Battle level uses BattleGameMode (character + combat rules + scoring).

Each level has appropriate rules.

**Persistent player data.**
- Game Instance stores player progress, settings, save data.
- Survives level transitions.
- Loaded on game start.

## Mistakes to avoid

- **Everything in Pawn class.** Hard to manage.
- **All logic in GameMode.** Too tightly coupled.
- **No separation of input + character.** Can't swap Pawns cleanly.
- **Game Instance for ephemeral data.** Wastes its persistence.
- **No PlayerState in multiplayer.** Can't identify players.

## Summary

- Pawn = body; Character = specialized humanoid Pawn.
- PlayerController = input + view; bridges player to Pawn.
- GameMode = per-level rules + class defaults.
- GameState = per-level shared state.
- PlayerState = per-player data.
- GameInstance = persistent across levels.
- Hierarchy: GameInstance → (GameMode + GameState per level) → (Pawn + PlayerController + PlayerState per player).

Next: character movement + input.
