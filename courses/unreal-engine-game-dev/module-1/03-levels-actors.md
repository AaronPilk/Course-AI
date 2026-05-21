---
module: 1
position: 3
title: "Levels, actors, and components"
objective: "Understand UE5's scene composition system."
estimated_minutes: 5
---

# Levels, actors, and components

## What a level is

A Level (.umap file) is a game scene — geometry, lights, actors, gameplay, anything in the world. Games consist of multiple levels.

UE5 calls them "Maps" or "Levels" interchangeably.

A new project starts with a default level (e.g., ThirdPersonExampleMap in Third Person template).

## Creating a level

File → New Level → pick template:
- **Empty Level.** Truly blank.
- **Basic.** Has Sky Sphere, lights, ground.
- **Time of Day.** Dynamic time of day setup.
- **Empty Open World.** For World Partition (covered later).

For learning: Basic.

## Saving a level

Ctrl+S saves the current level. Save Levels also saves child levels.

Save to `/Game/Maps/` typically.

## What an actor is

An actor = anything that can be placed in a level. Lights, cameras, meshes, sounds, blueprints, triggers — all actors.

Three actor categories:
- **StaticMeshActor.** Non-moving 3D model.
- **DynamicMeshActor.** Movable 3D model.
- **Custom Blueprint.** User-built combined actors.

Each actor instance in a level is unique.

## What a component is

A component = building block attached to an actor. Actors are containers; components do the work.

Common components:
- **StaticMeshComponent.** Renders a mesh.
- **SpotLightComponent.** Emits light.
- **AudioComponent.** Plays sound.
- **CapsuleComponent.** Collision shape.
- **TextRenderComponent.** Displays text.

An actor has one or more components; components are added to actors.

## Adding actors to level

From Place Actors panel: drag actor type into viewport.

Or:
- Right-click in viewport → Place Actor.
- Drag asset from Content Browser into viewport (creates appropriate actor).

Result: actor placed where you drop; instance added to level.

## Actor properties

Selected actor → Details panel shows properties:
- **Transform.** Location / Rotation / Scale.
- **Components.** Hierarchy of attached components.
- **Class-specific properties.** Defaults from the actor's Blueprint or C++ class.

Modify via Details panel; changes apply to this instance.

## Component hierarchy

In the Components section:
- **Root.** Top-level component (usually a Scene Component).
- **Children.** Components attached below.

Transform is relative to parent. Move parent → children move; move child → only child moves.

For: complex actors built from multiple components (vehicle = chassis + wheels + lights).

## World Outliner organization

Right-click in Outliner → Create Folder. Drag actors into folders.

For: organizing levels (Lights folder, Props folder, Triggers folder, etc.).

Pro habit: organize as you build; future-you saves hours.

## Layers

Window → Layers. Tag actors with layer names; toggle layer visibility on/off.

For: "show only lighting actors"; "hide everything except gameplay actors."

## Selecting in viewport

- **Click.** Select one.
- **Marquee select (drag in empty space).** Box select.
- **Ctrl+click.** Add to selection.
- **Shift+click.** Add (or use Ctrl).
- **Alt+click.** Drill into nested actor (when selecting a child).

For nested complex actors: use Outliner.

## Duplicating actors

- **Ctrl+D.** Duplicate selected; new actor placed at same location.
- **Alt+drag.** Duplicate-and-move.

For: replicating elements (fence posts, trees, identical props).

## Grouping actors

Select multiple → Ctrl+G → grouped together. Move/rotate/scale as one.

To ungroup: Ctrl+Shift+G.

For: scenes that move together (a chair + table grouped).

For more complex setups: convert to Blueprint (covered later).

## Static vs. Dynamic actors

**Static actors:** don't move during gameplay (walls, terrain, fixed lights). Marked "Static" in Mobility setting. Cheap to render; baked lighting possible.

**Movable actors:** can move (characters, doors, switches, dynamic lights). Marked "Movable." More expensive; real-time shadows.

Set Mobility in Details panel.

For: optimize by marking static where possible.

## Lighting actors

- **Directional Light.** Sun.
- **Sky Light.** Ambient + reflection.
- **Point Light.** Light bulb (omnidirectional).
- **Spot Light.** Flashlight (cone).
- **Rect Light.** Studio panel light.

Drag into level; configure in Details (intensity, color, attenuation).

For UE5 with Lumen: dynamic lighting; no light baking required.

## The Sky

A default level usually has a SkySphereBlueprint:
- Displays the sky.
- Controlled by Directional Light's rotation (sun position).
- Animated for time of day.

For custom sky: HDRI Backdrop actor, Volumetric Cloud system, or imported sky materials.

## Player Start

The PlayerStart actor marks where the player spawns. Levels need one.

Place in Empty Level: drag from Place Actors → Basic → PlayerStart.

For multiplayer levels: multiple PlayerStarts (different team spawns).

## Game Mode override (per level)

World Settings (Settings menu → World Settings):
- **GameMode override.** Per-level override of default Game Mode.
- **Pawn class, HUD class, etc.** Set defaults for this level.

For: different gameplay rules per level (lobby vs. battle vs. menu).

## Sublevels

World Composition (legacy) / World Partition (modern):
- Split a large world into multiple levels that stream in/out.
- Persistent level holds metadata; sublevels hold geometry.

For: open-world games. Covered in Module 3.

## Saving + version control

Levels are .umap files; can be source-controlled (Git LFS, Perforce).

Large levels are heavy files; binary; merge conflicts hard. Each level should typically be edited by one person at a time.

## Mistakes to avoid

- **Everything Movable when Static would do.** Wastes render time.
- **No Outliner organization.** Unfindable actors.
- **No grouping.** Many tiny separate actors.
- **All assets in one level.** Performance crash with large worlds.
- **No PlayerStart.** Game spawns player at origin.

## Summary

- Level (.umap) = scene; Actors are things in scene; Components are building blocks of actors.
- Drag from Place Actors / Content Browser to add actors.
- Component hierarchy: Root + children; relative transforms.
- Static vs. Movable mobility affects performance.
- Outliner / Layers / Groups for organization.
- World Settings for per-level overrides.

Next: importing assets from Blender / Maya.
