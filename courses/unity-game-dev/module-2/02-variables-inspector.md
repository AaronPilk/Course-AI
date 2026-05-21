---
module: 2
position: 2
title: "Variables, references, and the Inspector"
objective: "Connect scripts to objects through references."
estimated_minutes: 5
---

# Variables, references, and the Inspector

## Variable visibility

- **public.** Accessible from other scripts + visible in Inspector.
- **private.** Internal only; not in Inspector.
- **[SerializeField] private.** Internal access but visible in Inspector.

For: encapsulation; tweak in Inspector without exposing publicly.

## Common variable types

- **int / float.** Numbers.
- **bool.** True/false.
- **string.** Text.
- **Vector2 / Vector3.** Position / direction.
- **Color.** RGBA.
- **GameObject.** Reference to GameObject.
- **Transform.** Reference to Transform component.
- **Rigidbody.** Reference to physics component.
- **AudioClip.** Audio asset.
- **Material.** Visual asset.

Each renders specifically in Inspector.

## Component references

To access components on the same GameObject:
```csharp
private Rigidbody rb;
void Awake() {
  rb = GetComponent<Rigidbody>();
}
```

To access on another GameObject:
```csharp
public Transform target;  // Drag in Inspector
// Then: target.position
```

## Finding GameObjects

Several methods:
- **GameObject.Find("Name").** By name. Slow.
- **GameObject.FindWithTag("Player").** By tag.
- **FindObjectOfType<Type>().** First of type.
- **FindObjectsOfType<Type>().** All of type. Slow.

Avoid in Update; use in Awake/Start and cache.

For dynamic lookup; better: Inspector references where possible.

## ScriptableObjects (preview)

For data assets:
```csharp
[CreateAssetMenu]
public class EnemyData : ScriptableObject {
  public string enemyName;
  public int health;
  public Sprite icon;
}
```

Create asset in Project view; reference from multiple GameObjects. Covered fully in lesson 4.

## Range attribute

```csharp
[Range(0, 100)] public float health;
```

Inspector shows slider 0-100. For: clamped designer-friendly input.

## Header / Tooltip

```csharp
[Header("Movement Settings")]
public float speed;
[Tooltip("How fast the player turns")]
public float turnSpeed;
```

For: Inspector organization + documentation.

## Mistakes to avoid

- **All public when SerializeField sufficient.** Breaks encapsulation.
- **No caching of components.** Slow.
- **GameObject.Find in Update.** Performance crash.
- **No Header / Tooltip.** Inspector chaos.

## Summary

- public vs. private vs. [SerializeField] private for visibility.
- Cache component references in Awake/Start.
- Inspector references > GameObject.Find for performance.
- [Range] for sliders; [Header] / [Tooltip] for Inspector polish.

Next: Update, FixedUpdate, coroutines.
