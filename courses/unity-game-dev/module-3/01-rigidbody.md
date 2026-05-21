---
module: 3
position: 1
title: "Rigidbody and physics"
objective: "Make objects respond to physics realistically."
estimated_minutes: 5
---

# Rigidbody and physics

## What Rigidbody is

Rigidbody component makes a GameObject physics-driven:
- **Gravity** applies.
- **Forces** can be applied (AddForce).
- **Collisions** are computed.
- **Mass, drag, angular drag** properties.

Without Rigidbody: GameObject is static; ignores physics.

## Adding Rigidbody

Inspector → Add Component → Rigidbody (or Rigidbody2D for 2D).

Set:
- **Mass.** Heavier objects harder to push.
- **Drag.** Linear movement resistance.
- **Angular Drag.** Rotational resistance.
- **Use Gravity.** Toggle gravity.
- **Is Kinematic.** Disable physics but allow scripted movement.
- **Constraints.** Freeze rotation / position on axes.

## Applying forces

```csharp
Rigidbody rb = GetComponent<Rigidbody>();
rb.AddForce(Vector3.forward * 100);  // Add force in forward direction
rb.AddTorque(Vector3.up * 10);  // Add rotational torque
```

ForceMode:
- **Force.** Continuous over time (in FixedUpdate).
- **Impulse.** Instant push (good for explosions, jumps).
- **VelocityChange.** Direct velocity change (ignores mass).
- **Acceleration.** Continuous (ignores mass).

## Setting velocity directly

```csharp
rb.velocity = new Vector3(0, 10, 0);  // Jump up
```

For: direct movement control (e.g., character controller jumping).

## Kinematic Rigidbody

`rb.isKinematic = true;` — physics ignored; you control via scripts.

For: scripted movement (cutscenes, controlled animations) that still interacts with colliders.

## CharacterController vs. Rigidbody

For player characters: two options:
- **Rigidbody-based.** Physics-driven; realistic but complex tuning.
- **CharacterController.** Built-in component; more arcade-feel.

Many games use CharacterController for player + Rigidbody for environment. Hybrid.

## Physics Materials

For controlling collision behavior:
- Friction (high = grip; low = slippery).
- Bounciness (0 = no bounce; 1 = perfect bounce).

Create: Project view → Create → Physic Material; apply to Collider.

For: ice (low friction), trampoline (high bounciness), regular ground (normal friction).

## 2D physics

For 2D games:
- Rigidbody2D instead of Rigidbody.
- Collider2D variants (BoxCollider2D, CircleCollider2D, etc.).
- Same patterns; 2D versions.

## Mistakes to avoid

- **Physics in Update.** Use FixedUpdate.
- **No Rigidbody on movable objects.** No physics.
- **Setting Transform.position on Rigidbody.** Conflicts with physics; use rb.MovePosition.
- **Massive collider count.** Performance hit.
- **No constraints on Y axis.** Character falls / drifts up.

## Summary

- Rigidbody = physics simulation component.
- AddForce / AddTorque / velocity for movement.
- Mass / Drag / Constraints tune behavior.
- Kinematic for scripted control with collision interaction.
- Physics Materials for collision properties.

Next: colliders and triggers.
