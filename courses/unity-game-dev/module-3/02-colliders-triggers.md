---
module: 3
position: 2
title: "Colliders and triggers"
objective: "Detect when objects touch or overlap."
estimated_minutes: 5
---

# Colliders and triggers

## Collider types

- **BoxCollider.** Box shape; cheap; for rectangular objects.
- **SphereCollider.** Sphere; cheap.
- **CapsuleCollider.** Pill shape; good for characters.
- **MeshCollider.** Match the mesh; complex; can be expensive.
- **Compound colliders.** Multiple primitive colliders on one GameObject for complex shapes.

For: collision detection + physics interactions.

## Solid colliders vs. triggers

- **Solid collider.** Physics prevents objects passing through; collisions push back.
- **Trigger.** Set Is Trigger = true; objects pass through but detection fires events.

For: triggers detect overlap without blocking movement (pickup zones, ability ranges, kill zones).

## Collision events

For solid colliders:
- **OnCollisionEnter(Collision other).** When collision starts.
- **OnCollisionStay(Collision other).** Every frame during contact.
- **OnCollisionExit(Collision other).** When separated.

For triggers:
- **OnTriggerEnter(Collider other).** When overlap starts.
- **OnTriggerStay(Collider other).** During overlap.
- **OnTriggerExit(Collider other).** When overlap ends.

Important: at least one of the two GameObjects must have Rigidbody (or it's a Kinematic Rigidbody).

## Pickup pattern

```csharp
void OnTriggerEnter(Collider other) {
  if (other.CompareTag("Player")) {
    player.GetComponent<Inventory>().AddItem(itemData);
    Destroy(gameObject);
  }
}
```

For: collect items by walking over.

## Collision layers

In Project Settings → Physics → Collision Matrix:
- Toggle which layers collide.
- Layer "Bullets" might collide with "Enemies" but not "Pickups".
- Layer "Triggers" might overlap with everything.

For: optimization + clean collision rules.

## Layer mask in scripts

```csharp
public LayerMask groundLayer;
Physics.Raycast(transform.position, Vector3.down, out hit, 10f, groundLayer);
```

For: raycast / sphere cast only against specific layers.

## Compound colliders

Multiple colliders on one object via child GameObjects:
- Parent has Rigidbody.
- Children have Colliders only.
- Parent's physics responds to all child colliders.

For: complex shapes (a sword: blade BoxCollider + hilt CapsuleCollider).

## Mesh Collider tips

- **Convex.** Required for moving Rigidbody objects.
- **Non-convex.** Only for static objects.
- **High poly = expensive.** Use simplified mesh.

For: complex static environments use non-convex Mesh Collider; moving objects use compound primitives.

## 2D colliders

- BoxCollider2D, CircleCollider2D, CapsuleCollider2D, PolygonCollider2D, EdgeCollider2D, CompositeCollider2D.
- Use with Rigidbody2D.

Same patterns as 3D.

## Mistakes to avoid

- **Physics calculations in collision callbacks.** Slow; use OnTriggerEnter sparingly.
- **No layer setup.** All-vs-all collision; expensive.
- **High-poly Mesh Colliders.** Performance crash.
- **No Rigidbody on either GameObject.** Triggers don't fire.

## Summary

- Colliders define collision shape; solid blocks movement, trigger fires events only.
- BoxCollider / SphereCollider / CapsuleCollider for simple shapes; MeshCollider for complex.
- OnCollisionEnter/Stay/Exit for solids; OnTriggerEnter/Stay/Exit for triggers.
- Collision Matrix for layer-based filtering.
- LayerMask for surgical raycasts.

Next: Input System.
