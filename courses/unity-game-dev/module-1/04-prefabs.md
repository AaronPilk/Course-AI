---
module: 1
position: 4
title: "Prefabs — Unity's reusable asset system"
objective: "Save GameObject configurations as reusable templates."
estimated_minutes: 5
---

# Prefabs — Unity's reusable asset system

## What a Prefab is

A Prefab = a GameObject configuration saved as a reusable asset.

Examples:
- Enemy prefab (Enemy GameObject with mesh + collider + AI script).
- Bullet prefab (sphere + Rigidbody + Bullet script).
- Powerup prefab (visual + collider + pickup logic).
- UI button prefab (Button + Image + Text).
- Tree prefab (mesh + LODs + collision).

Build once; reuse forever.

## Creating a Prefab

In Hierarchy: drag a GameObject into the Project view (preferably a Prefabs folder).

Result: blue cube icon in Project view; original Hierarchy GameObject turns blue (linked to Prefab).

## Instantiating Prefabs

**In Editor:** drag from Project view into Hierarchy or Scene.

**In code:** `Instantiate(prefab, position, rotation)`.

For: dynamic spawning of enemies, bullets, items at runtime.

## Prefab editing

Changes to the original Prefab apply to all instances:

1. **Open Prefab** in Hierarchy → "Open" button in Inspector.
2. Or: double-click Prefab asset.
3. Edit in isolation; changes save to Prefab.
4. All scene instances auto-update.

For: maintaining consistency across many instances.

## Prefab variants

A specialized version of a Prefab:
- Right-click a Prefab → Create → Prefab Variant.
- Variant inherits from parent; can override specific properties.

For:
- Base Enemy + variants (Goblin, Skeleton, Bandit) — variants override mesh, color, stats; share core behavior.

For: hierarchical Prefab systems.

## Overrides per instance

In Hierarchy: open instance → Inspector → Override button.

Modify properties:
- Position, rotation, scale (always per-instance).
- Component values (text, color, etc.).

Apply overrides:
- Apply to Prefab (push changes back).
- Revert (discard overrides; restore to Prefab defaults).

For: per-instance customization while inheriting from Prefab.

## Nested Prefabs

A Prefab containing other Prefabs:
- Enemy Prefab containing a Weapon Prefab.
- Change Weapon Prefab → Enemy Prefab's Weapon updates.

For: modular asset structures.

## Prefab structure

When building reusable Prefabs:
- **Hierarchy.** Parent + children for visuals + colliders.
- **Components.** Standard set per Prefab.
- **Scripts.** Behavior code.
- **Default values.** Set in Inspector.

For: consistent, maintainable Prefabs.

## Pool patterns

For frequent spawning (bullets, particles, enemies):
- Object pool: pre-instantiate N copies; deactivate when "destroyed"; reactivate when "spawned."
- Avoids GC pressure from Instantiate/Destroy.

For: frequent gameplay spawning; performance.

## Prefab references in scripts

In code, reference Prefabs as variables:
```csharp
public GameObject enemyPrefab;
public void SpawnEnemy() {
  Instantiate(enemyPrefab, spawnPoint.position, Quaternion.identity);
}
```

Assign in Inspector (drag Prefab from Project view).

For: dynamic spawning controlled by code.

## Prefab variants for content

Common pattern: base enemy → variants:
- BP_Enemy_Base (master).
- BP_Enemy_Goblin (variant; small + green).
- BP_Enemy_Bandit (variant; medium + brown).
- BP_Enemy_Skeleton (variant; tall + white).

Shared behavior; visual + stat differences.

## Naming conventions

Standards:
- **P_ prefix** for Prefabs.
- **PV_ prefix** for Prefab Variants.

For: 100s of Prefabs, easy filtering.

## Organizational folders

Standard:
- Assets/Prefabs/Characters/
- Assets/Prefabs/Enemies/
- Assets/Prefabs/Items/
- Assets/Prefabs/Environment/
- Assets/Prefabs/UI/

For: navigability.

## Updating shipping Prefabs

For shipped games: changes to Prefab apply to all instances. Update Prefab → next build includes change.

For: live updates; balance changes; bug fixes.

## Mistakes to avoid

- **Modify Prefab instance vs. Prefab asset.** Confusion about where changes go.
- **No naming conventions.** Hard to find Prefabs.
- **All scripts in single mega-Prefab.** Hard to maintain.
- **Forget to drag into Project to make Prefab.** Lost work when scene unloads.
- **No Instantiate at runtime; manual placement only.** Hard to scale.

## Summary

- Prefab = reusable GameObject template; saved as asset.
- Create: drag from Hierarchy to Project view.
- Instantiate: drag into scene or Instantiate() in code.
- Open Prefab: edit in isolation; changes apply to all instances.
- Prefab Variants: inherit + override specific properties.
- Object pooling for frequent spawning.
- Naming + folder conventions matter.

Module 2 next: C# scripting in Unity.
