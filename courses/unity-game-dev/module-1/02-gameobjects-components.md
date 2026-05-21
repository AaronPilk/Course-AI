---
module: 1
position: 2
title: "GameObjects and Components"
objective: "Unity's foundational architecture: composition over inheritance."
estimated_minutes: 5
---

# GameObjects and Components

## What a GameObject is

A GameObject = the basic unit in Unity. Every visible / interactive thing in a scene is a GameObject:
- The player.
- An enemy.
- A wall.
- A light.
- A camera.
- A UI element.
- An invisible logic controller.

GameObjects are containers; they don't DO anything by themselves.

## What a Component is

Components attach to GameObjects to give them functionality:
- **Transform.** Position / Rotation / Scale (every GameObject has this).
- **MeshRenderer.** Renders a 3D mesh.
- **MeshFilter.** Specifies which mesh to render.
- **Rigidbody.** Physics simulation.
- **Collider.** Collision shape.
- **AudioSource.** Plays audio.
- **Light.** Emits light.
- **Camera.** Renders the scene.
- **Custom script.** Your behavior code.

Components are what make GameObjects act. Like Lego blocks.

## Composition over inheritance

Unity's design philosophy: don't build complex actor hierarchies; combine simple components.

A "Player" isn't a special class — it's a GameObject with:
- Transform (always).
- MeshRenderer + MeshFilter (visible).
- Rigidbody + Collider (physics).
- PlayerController script (your input + movement logic).
- AudioSource (sounds).
- Animator (animation).

For: flexibility; reusability; each component reusable across object types.

## Adding components

Three ways:
1. **Inspector → Add Component button.** Search + add.
2. **Drag script from Project view onto GameObject.**
3. **Code: gameObject.AddComponent<MyScript>();** at runtime.

For: building object behavior.

## Removing components

In Inspector: right-click component header → Remove Component.

Or in code: Destroy(GetComponent<MyScript>()).

## Component dependencies

Some components require others:
- MeshRenderer needs MeshFilter.
- Rigidbody works with Collider.
- AudioSource has Audio Output.

When you add a component that needs others, Unity auto-adds dependencies (or warns you).

## RequireComponent attribute

In your script:
```csharp
[RequireComponent(typeof(Rigidbody))]
public class Player : MonoBehaviour { ... }
```

For: ensure required components exist; Unity adds automatically when this script is added.

## Transform — always present

Every GameObject has Transform (Position + Rotation + Scale).

Cannot remove Transform; it's the spatial identity.

In scripts: this.transform or just transform (current GameObject's Transform).

## Parent-child relationships

In Hierarchy: drag one GameObject onto another → becomes child.

Child's Transform is RELATIVE to parent. Move parent → all children move.

For: complex objects built from multiple GameObjects (player = body + head + weapon attached to hand parented to body).

## Hierarchical scaling

Scaling parent scales children. Non-uniform scale (e.g., 2, 1, 1) on parent can squish children — sometimes wanted, often not.

For: avoid non-uniform scale on parents; transform individual children.

## Local vs. World

Transform has:
- **Local Position / Rotation / Scale.** Relative to parent.
- **World Position / Rotation / Scale (lossyScale).** Relative to scene origin.

For: positioning hierarchically (local) vs. absolute (world).

## Empty GameObjects

GameObjects can have no visible components — just Transform:
- Container objects for organization.
- Spawn points (Transform location only).
- Logic-only objects (have your script; no visuals).
- Trigger zones (Collider + script, no visuals).

For: scene organization without visual clutter.

## Tags + Layers

For categorizing GameObjects:
- **Tag.** Single label (Player, Enemy, Boss).
- **Layer.** For physics + rendering masks (Default, IgnoreRaycast, Water, UI).

In Inspector: top of GameObject's Inspector → Tag dropdown + Layer dropdown.

For: identifying objects in code; filtering physics + raycasts.

## Static GameObjects

For: objects that never move during gameplay:
- Click Static toggle in Inspector → marks Static.
- Unity uses this hint for performance optimizations (occlusion culling, batching, baked lighting).

For: most environment props; performance optimization.

## Prefab — saving GameObject as reusable asset

If you build a GameObject you want to reuse:
- Drag from Hierarchy into Project view → creates Prefab asset.
- Instances of the Prefab in scene are linked to the asset.
- Changes to Prefab apply to all instances.

Covered next lesson.

## Common patterns

**Player:** Transform + MeshRenderer + Rigidbody + Collider + Animator + AudioSource + PlayerController script.

**Enemy:** similar to Player + EnemyAI script + Health component.

**Pickup:** Transform + MeshRenderer + Collider (trigger) + Pickup script.

**Camera:** Transform + Camera component (built-in) + CameraController script.

**UI element:** GameObject as child of Canvas with RectTransform + Image / Text component.

Each is a GameObject with curated component combinations.

## Common mistakes

- **Trying to access component without GetComponent.** Returns null; NullReferenceException.
- **Wrong component on wrong GameObject.** Logic doesn't run.
- **Component dependencies missing.** Rendering / physics broken.
- **Naming inconsistency.** Hard to find references.
- **All in one giant script.** Hard to maintain.

## Summary

- GameObject = container; Component = behavior; GameObject = collection of components.
- Composition over inheritance: build characters/objects by combining components.
- Add Component button or drag scripts; remove via right-click.
- Transform always present; manages spatial state.
- Parent-child hierarchy for grouped objects.
- Empty GameObjects for organization + spawn points + logic.
- Tags + Layers for categorization.
- Prefabs for reusable GameObject templates.

Next: scenes and the scene hierarchy.
