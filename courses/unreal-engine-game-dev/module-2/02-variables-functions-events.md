---
module: 2
position: 2
title: "Variables, functions, and events"
objective: "Structure Blueprint logic for clarity and reuse."
estimated_minutes: 5
---

# Variables, functions, and events

## Variables — the building blocks

Variables store data the Blueprint uses. Each variable has:
- **Name.** Identifier.
- **Type.** What data it holds.
- **Default Value.** Initial value.
- **Tooltip.** Description (for UI display).
- **Category.** Folder grouping in editor.
- **Accessibility.** Public (editable in level), Private (Blueprint-only).

Add: My Blueprint panel → +Variable. Set in Details.

## Variable types

**Primitive types:**
- **Boolean.** True / false.
- **Integer.** Whole number (-2B to 2B).
- **Integer64.** Wider range.
- **Float.** Decimal (single precision).
- **Double.** Decimal (double precision).
- **Byte.** 0-255.
- **Name.** Short string (case-insensitive).
- **String.** Text.
- **Text.** Localizable text (for UI).

**Structures:**
- **Vector.** X, Y, Z.
- **Rotator.** Pitch, Yaw, Roll.
- **Transform.** Location + Rotation + Scale.
- **Color.** RGBA.
- **Linear Color.** RGBA float.

**References:**
- **Actor.** Reference to any actor.
- **Blueprint Class.** Reference to a specific class.
- **Object.** Generic object reference.

**Containers:**
- **Array.** List of items of same type.
- **Set.** Unique items.
- **Map.** Key-value pairs.

## Public vs. private variables

Public (Editable in level):
- Click the eye icon next to variable in My Blueprint panel.
- Variable appears in Details panel when actor instance is selected in level.
- Designers can tweak per-instance values (e.g., a Door has "Open Speed" public; designer adjusts per door).

Private:
- Not shown in level Details.
- Only modified by the Blueprint internally.

For gameplay variables (Health, Damage, Score): private + accessed via functions.

For design knobs (Speed, Color, Sound, Visual properties): public.

## Get / Set variables

Drag variable from My Blueprint into Event Graph:
- Choose Get (read) or Set (write).

Or right-click → search variable name → Get/Set node.

Get node: outputs the variable's current value.
Set node: writes new value (with execution flow input/output).

## Function vs. Macro vs. Event

**Function:** named reusable logic block.
- Called from anywhere.
- Has inputs / outputs.
- Executes when called.
- Has its own scope.
- Can return values.

**Macro:** like function but inlined (no separate execution frame).
- Faster than function for tight operations.
- Can have multiple execution outputs.
- Less encapsulated.

**Event:** triggered by something (game event, input, timer).
- Has inputs (event data).
- No return value.
- Multiple execution paths from event.

For: most reusable logic → Function. For loops or simple operations → Macro. For "do this when X happens" → Event.

## Creating a function

My Blueprint → +Function. Name it. New tab opens.

Add inputs / outputs in Details:
- **Inputs.** Parameters passed in.
- **Outputs.** Return values.

Build logic with nodes. The Entry node receives inputs; Return node outputs values.

Call from Event Graph: right-click → search function name → connect to execution wire.

## Function inputs / outputs

For: function "AddHealth(Amount)":
- Input: Amount (Float).
- Output: NewHealth (Float).

Inside the function:
- Get Health variable + Amount input → Add → Set Health → connect to Return.
- NewHealth = current Health + Amount.

For chained calls: Output flows into next function's Input.

## Pure functions

Functions can be marked Pure (no execution pin):
- Read data, return value.
- Don't change state.
- Multiple Get calls cached.

For: getter functions (GetHealth, IsAlive, GetSpeed).

For: state-changing operations (TakeDamage, Heal, Move) — keep as regular (non-pure) functions.

## Custom events

Add an Event:
- My Blueprint → +Function → Custom Event.
- Add inputs.
- Call from other Blueprints.

Like a function but no return value; useful for broadcast notifications.

For: cross-Blueprint communication.

## Built-in events

Unreal triggers these automatically:
- **BeginPlay.** When actor spawns / level starts.
- **Tick.** Every frame.
- **EndPlay.** When actor destroyed.
- **OnComponentBeginOverlap.** When overlapping starts.
- **OnComponentEndOverlap.** When overlapping ends.
- **OnComponentHit.** Collision.
- **OnTakeAnyDamage.** Damage applied.

Add to Event Graph: right-click → search event name → Event node added.

Connect to logic.

## Timers

For delayed / repeating logic:
- Set Timer by Function Name node.
- Inputs: function name, delay (seconds), looping (bool).

For: "kill player after 3 seconds of inactivity"; "heal 1 HP every 0.5 seconds while not in combat."

## Delay node

For simple "wait then do":
- Delay node: input = duration; execution continues after the duration elapses.

For: "after 2 seconds, hide UI."

Don't use Delay in tight loops or critical timing; use Timer for repeating.

## Tick — use sparingly

Tick fires every frame (e.g., 60-120 times per second). Expensive if heavy logic runs each tick.

Avoid:
- Heavy math in Tick.
- Loops in Tick.
- Multiple ticking Blueprints when not necessary.

Prefer:
- Event-driven logic (do something on collision, button press, timer expiration).
- Tick only for things that need per-frame updates (smooth movement, smooth interpolation).

For frame-rate independence: multiply Tick changes by Delta Seconds (the time since last tick).

## Blueprint communication

Three ways Blueprints talk to each other:
1. **Direct reference.** Blueprint A holds variable referencing Blueprint B; call functions on B directly.
2. **Cast.** Get generic Actor; Cast To specific Blueprint type; call functions if cast succeeds.
3. **Interfaces.** Define interface; Blueprints implement; call interface functions on any implementing Blueprint.
4. **Event Dispatcher.** Blueprint A broadcasts event; Blueprint B subscribes.

For most cases: direct reference for tight coupling; interfaces for loose coupling. Module 2 Lesson 3 covers communication patterns.

## Variable scoping

- **Variable.** Member of the Blueprint; persists for the actor's life.
- **Local Variable.** Within a function; reset each call.

Local: define inside a function's Details panel; scoped only to that function. For: temporary computation values.

## Naming conventions

Standard:
- **PascalCase** for functions + variables (HealthAmount, GetCurrentHealth).
- **bIsAlive** prefix for booleans (b for bool).
- **e** prefix for enums (eGameState).

For consistency across team: agree on convention; enforce.

## Mistakes to avoid

- **Tick for everything.** Performance suffers.
- **All variables public.** Designer accidentally breaks gameplay.
- **No naming conventions.** Random Variable_1 / Variable_2.
- **All logic in Event Graph.** No reusable functions.
- **Forgetting Delta Seconds.** Frame-rate-dependent behavior.

## Summary

- Variables store data; types include primitives, structures, references, containers.
- Public for designer-tweakable; Private for internal state.
- Get / Set to read / write.
- Functions = reusable logic with inputs / outputs.
- Pure functions for getters; regular for state-changers.
- Custom Events for cross-Blueprint notifications.
- Built-in events (BeginPlay, Tick, OnOverlap) for engine-driven triggers.
- Timers + Delays for time-based logic.
- Avoid Tick where possible; prefer event-driven.

Next: communication between Blueprints.
