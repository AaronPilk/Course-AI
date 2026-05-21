---
module: 2
position: 4
title: "Common gameplay patterns"
objective: "Implement standard game mechanics using Blueprints."
estimated_minutes: 5
---

# Common gameplay patterns

## Pickup system

A pickup is an item the player walks over to collect.

Setup BP_Pickup:
- Static mesh component (visible model).
- Sphere collision component (overlap trigger).
- On Component Begin Overlap event → check if other actor is player → add to player's inventory / score → destroy self.

Variations:
- Health pickups (restore HP).
- Ammo pickups (add to weapon).
- Power-ups (apply buff).
- Coins / currency.

For: any pick-up-and-go item.

## Damage system

Damaging an actor (enemy hit by bullet, player hit by hazard):

**Apply Damage** node (the standard):
- Apply Damage from BP_Bullet to enemy.
- Enemy's Event Take Any Damage fires; receives damage amount + instigator.
- Enemy subtracts from Health; checks for death.

For: standardized damage flow across game.

## Health system

Standard pattern (often in a Health Component):
- Variable `CurrentHealth` (float, default 100).
- Variable `MaxHealth` (float, default 100).
- Function `TakeDamage(Amount)` → subtract Amount from CurrentHealth → check death.
- Function `Heal(Amount)` → add Amount, clamp to MaxHealth.
- Event `OnDeath` (Event Dispatcher) → broadcast when CurrentHealth ≤ 0.

For: any actor with HP (player, enemies, destructibles).

## Inventory system

For collecting + storing items:
- Variable `Inventory` (Map of Item -> Count).
- Function `AddItem(ItemClass, Count)` → adds or increments.
- Function `RemoveItem(ItemClass, Count)` → decrements or removes.
- Function `HasItem(ItemClass)` → check.
- Event `OnInventoryChanged` → for UI updates.

For: RPGs, survival games, anything with collected items.

## Input handling

Modern UE5 uses Enhanced Input System:
- Define Input Actions (Jump, Move, Look, Interact).
- Define Input Mapping Context (which keys/buttons bind to which actions).
- In Player Controller / Character: listen for input action events.

For: cross-platform input (keyboard + mouse, gamepad, touch); rebinding.

## Movement

Character movement standard:
- Get Movement Input from Move action (2D vector).
- Add Movement Input to character.
- Character Movement Component handles physics.

Look:
- Get Look Input from Look action.
- Apply to camera (yaw) + spring arm (pitch).

Jump:
- Jump action → Character.Jump() function.
- StopJump action → Character.StopJumping() function.

For most third / first person games: this stack handles ~80% of movement.

## Interaction system

Player interacts with world objects:
- Player raycast forward from camera (Line Trace by Channel).
- If hit object implements IInteractable: prompt "Press E to interact".
- On E: call IInteractable.Interact() on hit object.

For: doors, NPCs, switches, chests, vending machines.

## State machines

Track an actor's state:
- Enum `EEnemyState` { Idle, Patrol, Chasing, Attacking, Dead }.
- Variable `CurrentState` (EEnemyState).
- Function `SetState(NewState)` → update + trigger entry/exit logic.

For: AI behavior; player states (idle / walking / running / aiming).

## Simple AI

Bare-bones AI:
- Behavior Tree (UE's built-in AI system).
- Tasks: Move To Player, Wait, Attack.
- Selectors / Sequencers organize behavior.

Or in Blueprint:
- Tick → Get player location → MoveTo(player) → if close, attack.

For learning: pure Blueprint. For production: Behavior Trees.

## Spawning actors

Spawn at runtime:
- Spawn Actor from Class node.
- Inputs: class, transform.
- Output: reference to spawned actor.

For: bullets, particles, enemies, items, anything created during play.

## Destroying actors

Remove from world:
- Destroy Actor node → kills the actor.

For: pickups (after collection), enemies (after death), bullets (after impact), expired effects.

## Timer-based logic

For "every X seconds":
- Set Timer by Function Name (with looping = true).
- Function fires every X seconds.

For:
- AI ticks every 0.5s (not every frame).
- Health regen every 1s.
- Spawn timer (new enemy every 5s).

## Save / load (high level)

Persistent data:
- Game Instance holds the data (across levels).
- SaveGame object serializes to disk.
- Functions: Save Game to Slot, Load Game from Slot.

For: player progress, settings, in-progress saves. Module 5 Lesson 3 covers in depth.

## UI

UMG (Unreal Motion Graphics) for UI:
- Widget Blueprint (WBP_*) for UI elements.
- Design layouts in Widget Designer.
- Logic in Widget Blueprint's Event Graph.
- Add to viewport: Create Widget → Add To Viewport.

For: menus, HUD, inventory screens, dialogs.

## Particle effects

For visual effects (fire, smoke, sparks, magic):
- Niagara System (UE5's modern particle system).
- Drag into level or spawn at runtime via Spawn Emitter at Location.

For: combat impacts, environmental effects, magic / sci-fi visuals.

## Audio

For sound:
- Audio Component on actor (looping ambient).
- Play Sound at Location / Play Sound 2D (one-shot).
- Sound Cue for complex audio mixing.

Sound categories: SFX, Music, Ambient, Dialogue, UI — for per-category volume control.

## Common bugs in patterns

- **Forgotten compile.** Blueprint changes don't take effect.
- **Wrong target Actor.** Calling function on wrong reference.
- **Order issue.** Function called before referenced actor exists.
- **Tick over-use.** Performance suffers.
- **No null checks.** Crash when reference is None.

## Mistakes to avoid

- **No standardized damage system.** Each enemy implements differently.
- **No Health Component.** Health logic repeated everywhere.
- **No interaction system.** Player can't talk to world objects.
- **No state machines.** Enemy AI logic tangled.
- **No saving.** Players lose progress.

## Summary

- Pickup: collision trigger + add to inventory + destroy.
- Damage system: Apply Damage node + Health Component.
- Movement: Enhanced Input System + Character Movement Component.
- Interaction: line trace + IInteractable interface.
- State machine: enum + variable + state-change function.
- AI: Behavior Tree (production) or Blueprint pattern (learning).
- UI: UMG Widget Blueprints.
- Particles: Niagara Systems.
- Audio: Audio Components + Play Sound nodes.

Module 3 next: World Partition, Nanite, Lumen, performance.
