---
module: 2
position: 1
title: "Blueprint basics — nodes and execution flow"
objective: "Build gameplay logic visually without writing code."
estimated_minutes: 5
---

# Blueprint basics — nodes and execution flow

## What Blueprints are

Blueprints = Unreal's visual scripting system. Build gameplay logic via nodes connected in a graph, no C++ required.

Equivalent to:
- Coding in C++ but visual.
- Unity's Visual Scripting.
- Game Maker's drag-and-drop.

Performance: Blueprints are slower than equivalent C++ but fast enough for most gameplay logic. For performance-critical systems: C++ + Blueprint integration.

## When to use Blueprints

For: most gameplay logic — character behaviors, UI, items, triggers, AI, save systems.

For: prototyping.

For: design-driven iteration (designers tweak without coder).

When NOT to use Blueprints: massive math-heavy systems, low-level engine work — write in C++ instead.

The hybrid model is standard: C++ for performance-critical foundations; Blueprints for gameplay layer above.

## Creating a Blueprint

Content Browser → Right-click → Blueprint Class → pick parent class:
- **Actor.** General-purpose game object.
- **Pawn.** Possessable by player or AI.
- **Character.** Pawn with character-specific features (movement, capsule).
- **PlayerController.** Controls a Pawn.
- **GameMode.** Game rules.
- **HUD.** Heads-up display.
- **Actor Component.** Adds functionality to actors.

Name with BP_ prefix (e.g., BP_Door, BP_Item, BP_Enemy).

## Opening a Blueprint

Double-click Blueprint in Content Browser → opens Blueprint Editor.

Tabs at top:
- **Viewport.** 3D view of components.
- **Construction Script.** Runs at level load (setup).
- **Event Graph.** Main gameplay logic (events + functions).

For most work: Event Graph.

## The Event Graph

Where gameplay logic lives. Nodes:
- **Events** (red). Triggered by gameplay (BeginPlay, Tick, OnCollision, KeyPressed).
- **Functions** (blue). Reusable logic blocks.
- **Variables** (pink/colored). Stored data.
- **Macros** (green). Multi-node groups.
- **Operations** (gray). Math, comparison, logic.

Connect via wires. Execution flows white wires (top); data flows colored wires (bottom).

## Basic node types

**Event.** "When something happens."
- BeginPlay — runs once when actor spawns.
- Tick — runs every frame.
- OnComponentBeginOverlap — runs when actor overlapped.

**Function.** "Do this."
- Print String — debug message.
- Set Actor Location — move the actor.
- Spawn Actor — create new actor in world.

**Get / Set Variable.** Read or write stored data.

**Branch.** "If / Then."

**Cast To.** Convert one type to another (e.g., cast actor to specific Blueprint class).

## Adding nodes

In Event Graph: right-click → search node name. Pick from list; node appears at cursor.

Or: drag a connection from existing node → release on empty space → context menu of compatible nodes.

Context-sensitive search: when dragging from a wire, only relevant nodes shown.

## Connecting nodes

Click and drag from output pin to input pin. Type-matched (you can't connect a Boolean output to an Integer input directly without a conversion node).

White triangle pins = execution (sequence of actions).
Colored circle pins = data (variables, return values).

Execution flows along white wires; data flows along colored wires.

## A simple Blueprint

For "Print 'Hello' when game starts":
1. Open Blueprint.
2. Event Graph tab.
3. Find Event BeginPlay (already there by default).
4. Right-click → search "Print String".
5. Connect BeginPlay's execution output to Print String's execution input.
6. Set Print String's "In String" parameter to "Hello".
7. Compile (top toolbar).
8. Place Blueprint in level.
9. Press Play → "Hello" appears on screen.

5-step "Hello World" of Blueprint.

## Variables

For data the Blueprint remembers:
- Add Variable in left panel (My Blueprint).
- Pick type (Boolean, Integer, Float, String, Vector, Actor reference, etc.).
- Name (e.g., Health).
- Default value.

Use in graph:
- Drag variable from panel onto graph → choose Get (read) or Set (write).
- Or right-click → search variable name.

## Common variable types

- **Boolean.** True / false.
- **Integer.** Whole number.
- **Float.** Decimal.
- **String.** Text.
- **Vector.** XYZ (position, direction).
- **Rotator.** Rotation.
- **Actor.** Reference to another actor.

Choose based on what data you need.

## Compile and save

After changes:
- **Compile** (top toolbar). Validates + bakes the Blueprint.
- **Save.** Stores to disk.

Errors during compile: nodes show red icons; warnings: yellow. Fix before play.

## Print String for debugging

Print String is the Blueprint equivalent of console.log:
- Outputs text to viewport during play.
- Customize color, duration.
- Useful for verifying logic flow.

For: "did this event fire?", "what value did this variable have?", "did this branch take the True or False path?"

## Branch (if/else)

Branch node:
- Input: Condition (Boolean).
- Outputs: True, False execution paths.

For: "if player is alive, take damage; else, die."

## Sequence

For executing multiple actions from one event:
- Sequence node has multiple execution outputs (Then 0, Then 1, Then 2...).
- All fire in order.

For: "on death: play sound, show UI, end game" — three actions from one event.

## ForEach loop

For iterating over an array:
- ForEachLoop node: input = array; output = current element + index.

For: "for each enemy in level: damage them."

## Casting

For converting one Blueprint type to another:
- Cast To node: input = actor reference; output (if successful) = specific type.
- Pin "Cast Failed" for when conversion doesn't work.

For: "get the player character (cast generic Actor to MyCharacterClass)."

## Functions

For reusable logic:
- My Blueprint panel → +Function.
- Add inputs / outputs in Details panel.
- Build logic inside.
- Call from Event Graph via right-click → search function name.

For: "Heal player by amount X" function called from multiple places.

## Macros

Like functions but lower-level (no separate frame; execute in caller's context):
- Faster than functions for tight loops.
- Limited to simpler operations.

For 95% of work: functions are sufficient.

## Components

In Blueprint Viewport tab:
- Add Component → pick (Static Mesh, Camera, etc.).
- Configure in Details panel.
- Reference in Event Graph (drag from Components panel).

For: Blueprint with multiple visual / functional parts (door = static mesh + audio + collision).

## Construction Script

Runs at level load:
- For setup that varies per instance (procedural generation, applying materials based on properties).
- Different from Event Graph (which runs at gameplay).

For: build the Blueprint's components based on configurable properties.

## Mistakes to avoid

- **No naming conventions.** "Variable_25" instead of "Health".
- **Spaghetti graphs.** Wires crossing everywhere; impossible to read.
- **No comments.** Future-you forgets what graph does.
- **Too much in Event Graph; nothing in functions.** Hard to maintain.
- **Forgetting to Compile.** Changes don't apply.

## Summary

- Blueprints = Unreal's visual scripting; no C++ required for most work.
- Event Graph = main logic; Construction Script = setup logic.
- Nodes: Events (red), Functions (blue), Variables (colored), Operations.
- White wires = execution; colored wires = data.
- Variables for data; Branch for if/else; Sequence for multiple actions.
- Functions / Macros for reusable logic.
- Compile + Save after changes.

Next: variables, functions, events deep dive.
