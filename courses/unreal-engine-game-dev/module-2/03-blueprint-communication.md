---
module: 2
position: 3
title: "Communication between Blueprints"
objective: "Make Blueprints work together without spaghetti coupling."
estimated_minutes: 5
---

# Communication between Blueprints

## The problem

Blueprints don't exist in isolation. The player Blueprint needs to damage enemies; enemies need to update score; UI needs to react to game state; doors need to talk to triggers; weapons need to spawn projectiles.

Bad communication = tight coupling = brittle code. Good communication = loose coupling = maintainable code.

## Four patterns

1. **Direct reference.** A holds a reference to B; calls B's functions.
2. **Cast.** Get generic Actor; cast to specific type; call functions.
3. **Interface.** Define interface; multiple Blueprints implement; call interface functions on any implementer.
4. **Event Dispatcher.** A broadcasts event; B subscribes and reacts.

Each fits different scenarios.

## Direct reference

Simplest pattern:
- BP_Door has variable `LockController` of type BP_LockController.
- Set the reference (in level or via code).
- Call `LockController -> CheckUnlock()`.

For: tightly-related Blueprints (a Door knows about its specific lock controller).

Drawback: Door knows about LockController's specific class; if you change LockController, Door breaks.

## Casting

Generic → specific:
- Get a reference of type Actor.
- Right-click → Cast To BP_Enemy.
- If successful: continue with specific type; call BP_Enemy's functions.
- If fail: handle gracefully (Cast Failed pin).

For: working with generic references (e.g., OnHit returns "OtherActor"; cast to determine what was hit).

Drawback: Casting creates a hard dependency (Blueprint A loads Blueprint B's class when A loads).

## Interfaces

Define a contract; multiple Blueprints implement it.

Create Interface:
- Content Browser → Right-click → Blueprints → Blueprint Interface.
- Define functions (e.g., `ApplyDamage(Amount)`, `Interact()`, `OnSelected()`).

In each Blueprint:
- Class Settings → Implemented Interfaces → Add.
- Implement the functions.

In caller:
- Right-click → Call Function on interface (or message).
- Blueprint Caller doesn't need to know the specific implementing class.

For: loose coupling — caller talks to any object implementing the interface.

## Interface example

Define IInteractable interface with `Interact()` function.

Implement in: BP_Door, BP_Chest, BP_NPC, BP_LightSwitch.

Caller (BP_Player): `On E key press → check for actor under cursor → call Interact() on it (as IInteractable)`.

Each object handles its own Interact() differently; player doesn't care what type.

This is dependency inversion / polymorphism — clean architecture.

## Event Dispatchers

Pub-sub pattern. A Blueprint broadcasts an event; subscribers react.

Create:
- My Blueprint → +Event Dispatcher.
- Define inputs.

Broadcast:
- In Blueprint A's logic: Call Event Dispatcher (with input values).

Subscribe:
- In Blueprint B (with reference to Blueprint A): right-click → Bind Event to Dispatcher → connect to handler function.

For: loose coupling where multiple subscribers might react.

## Event Dispatcher example

BP_GameManager has Event Dispatcher `OnScoreChanged(NewScore: Integer)`.

When score updates: Broadcast OnScoreChanged.

Subscribers:
- BP_HUD: Bind to OnScoreChanged → update score text.
- BP_AchievementSystem: Bind to OnScoreChanged → check thresholds.
- BP_SoundManager: Bind to OnScoreChanged → play score sound.

GameManager doesn't know about HUD / Achievements / Sound. They subscribe; react independently.

## Get / Reference patterns

Common: how to get a reference to other Blueprints?

**Player Controller:** Get Player Controller (function); returns the player's controller.

**Player Character:** Get Player Character (function); returns player's pawn.

**Game Mode:** Get Game Mode (function); returns the game's GameMode.

**Game State:** Get Game State.

**Game Instance:** Get Game Instance.

**Specific actor by class:** Get All Actors of Class → returns array → pick one.

**By tag:** Get All Actors with Tag.

These references give you starting points; from there, navigate via direct references or interfaces.

## Game Instance

A singleton object that persists across levels:
- For data that survives level transitions (player progress, save data, settings).
- Access via Get Game Instance.

For: cross-level persistent data.

## Game Mode

Per-level rules:
- Default Pawn class, HUD class, Player Controller class.
- Game-specific rules (score, win conditions, time limits).

Configure in World Settings → Game Mode Override.

For: distinct gameplay per level.

## Player Controller

Bridges player input + Pawn:
- Receives input.
- Possesses a Pawn (the controlled character).
- Handles player state (HUD, mouse cursor, input mode).

For: input handling not tied to specific Pawn (allows swapping characters without losing input).

## Pawn / Character

The body the player controls:
- Pawn = any possessable actor.
- Character = Pawn + movement component + capsule + skeletal mesh (typical for humanoid players).

For player: Character usually.
For vehicles, abstract entities: Pawn.

## Persistent vs. session data

- **Game Instance.** Lives entire game session; doesn't reset between levels.
- **Game State.** Lives current level; resets when level changes.
- **Per-actor.** Each actor's own state; destroyed with actor.

For player score across levels: Game Instance.
For round-specific state: Game State.
For per-enemy AI: Per-actor.

## Communication best practices

1. **Prefer interfaces over casting.** Loose coupling.
2. **Use Event Dispatchers for pub-sub.** When multiple subscribers might react.
3. **Avoid Tick-based polling.** Use events instead.
4. **Cache references.** Don't Get Player Controller every Tick.
5. **Limit Blueprint dependencies.** Module 2 Lesson 1's "spaghetti graphs" problem.

## Mistakes to avoid

- **Heavy casting throughout codebase.** Hard dependencies; recompilation cascades.
- **No use of interfaces.** Repeated logic for similar behaviors.
- **Event Dispatchers ignored.** Polling Tick for changes.
- **Direct references for everything.** Tight coupling.
- **Get All Actors of Class in Tick.** Massive performance cost.

## Summary

- Communication patterns: Direct Reference, Cast, Interface, Event Dispatcher.
- Direct: tight coupling; simple but brittle.
- Cast: generic → specific; creates hard class dependencies.
- Interface: loose coupling; polymorphism.
- Event Dispatcher: pub-sub; multiple subscribers.
- Game Instance for persistent data; Game Mode for level rules; Game State for round data.
- Avoid Tick-based polling; use events.

Next: common gameplay patterns.
