---
module: 2
position: 1
title: "MonoBehaviour and the Unity lifecycle"
objective: "Understand Unity's script base class and event methods."
estimated_minutes: 5
---

# MonoBehaviour and the Unity lifecycle

## What MonoBehaviour is

MonoBehaviour = Unity's base class for scripts attached to GameObjects.

Every script you attach to a GameObject inherits from MonoBehaviour:
```csharp
public class PlayerController : MonoBehaviour {
  void Update() {
    // Runs every frame
  }
}
```

Unity calls specific methods on MonoBehaviours at specific times.

## The script lifecycle

Unity invokes methods in order:
1. **Awake().** When script instance loads (before Start).
2. **OnEnable().** When GameObject becomes active.
3. **Start().** First frame the script is enabled.
4. **FixedUpdate().** Physics frame (typically 50/sec).
5. **Update().** Every visual frame.
6. **LateUpdate().** After all Updates.
7. **OnDisable().** When GameObject becomes inactive.
8. **OnDestroy().** When GameObject destroyed.

## Awake vs. Start

**Awake().** Called when the script instance is created (regardless of whether GameObject is enabled). Use for: initial setup that doesn't depend on other scripts.

**Start().** Called the first time the script is enabled. Use for: setup that uses references set by other scripts (other Awake() calls have completed).

Pattern:
- Awake: self-setup, GetComponent calls.
- Start: cross-script setup.

## Update

Called every visual frame:
- Read player input.
- Move objects (non-physics).
- Update UI.
- Check game state.

Frame rate varies (~60-120 FPS typically). Use Time.deltaTime to make movement frame-rate independent:
```csharp
transform.position += Vector3.forward * speed * Time.deltaTime;
```

## FixedUpdate

Called at fixed intervals (default 50 times/sec, regardless of frame rate):
- Physics calculations.
- Rigidbody force / velocity changes.
- Physics-dependent logic.

For physics: ALWAYS use FixedUpdate. Update fires irregularly; physics needs predictable timing.

Use Time.fixedDeltaTime if you need it (usually you don't — it's already the fixed interval).

## LateUpdate

Called after all Updates and all FixedUpdates:
- Camera following (after object moves, camera adjusts).
- UI updates dependent on game state.
- Cleanup logic.

For: anything that should react to the result of Update + FixedUpdate.

## OnEnable / OnDisable

**OnEnable().** When GameObject becomes active or script enabled.
**OnDisable().** When deactivated or disabled.

For: setting up / tearing down event listeners; resource management.

## OnDestroy

**OnDestroy().** When GameObject destroyed (or scene unloads with the GameObject in it).

For: cleanup (unsubscribe from events, save data).

## Custom event methods

Unity provides many built-in callbacks:
- **OnCollisionEnter / Exit / Stay.** Physics collisions.
- **OnTriggerEnter / Exit / Stay.** Trigger overlaps.
- **OnMouseDown / Over / Exit.** Mouse interaction (legacy; UI prefers EventSystem).
- **OnGUI.** Legacy UI rendering.
- **OnDrawGizmos.** Editor visualization.

For: responding to engine events.

## Time class

- **Time.deltaTime.** Time since last frame (in Update).
- **Time.fixedDeltaTime.** Fixed update interval.
- **Time.time.** Time since game start.
- **Time.timeScale.** Slow / fast motion.

For: frame-rate-independent code; pause functionality; time-based effects.

## Time.deltaTime for movement

Without:
```csharp
transform.Translate(Vector3.forward * 5);  // 5 units per frame; depends on FPS
```

With:
```csharp
transform.Translate(Vector3.forward * 5 * Time.deltaTime);  // 5 units per second; frame-rate independent
```

For: consistent gameplay across hardware.

## Coroutines

For multi-frame asynchronous logic:
```csharp
IEnumerator FadeOut() {
  for (float t = 0; t < 1; t += Time.deltaTime) {
    color.a = 1 - t;
    yield return null;  // Wait one frame
  }
}

void Start() {
  StartCoroutine(FadeOut());
}
```

For:
- Animations.
- Delayed actions (yield return new WaitForSeconds(2)).
- Iterative logic over multiple frames.

## Component caching

Calling GetComponent every frame is slow:
```csharp
// SLOW:
void Update() {
  GetComponent<Rigidbody>().AddForce(...);
}

// FAST:
private Rigidbody rb;
void Awake() {
  rb = GetComponent<Rigidbody>();
}
void Update() {
  rb.AddForce(...);
}
```

For: performance; cache references in Awake/Start.

## SerializeField

Make private variables visible in Inspector:
```csharp
[SerializeField] private float speed = 5f;
```

For: design tweaks via Inspector without making variables public.

## Public vs. SerializeField

- **public.** Visible in Inspector + accessible from other scripts.
- **[SerializeField] private.** Visible in Inspector but NOT accessible externally.

For: encapsulation; use SerializeField for Inspector visibility + private access.

## OnValidate

Editor-only callback:
```csharp
void OnValidate() {
  // Called when value changes in Inspector
  // Validate values, log errors
}
```

For: ensuring Inspector values are sensible at edit time.

## ExecuteAlways

For scripts that run in edit mode + play mode:
```csharp
[ExecuteAlways]
public class MyEditorScript : MonoBehaviour {
  void Update() {
    // Runs in edit mode too
  }
}
```

For: editor tools; visual debugging.

## Mistakes to avoid

- **GetComponent every frame.** Slow.
- **Movement without Time.deltaTime.** Frame-rate dependent.
- **Physics in Update.** Should be FixedUpdate.
- **Public when SerializeField sufficient.** Breaks encapsulation.
- **No cleanup in OnDisable / OnDestroy.** Event leaks.

## Summary

- MonoBehaviour = base class for Unity scripts.
- Lifecycle: Awake → OnEnable → Start → (Update / FixedUpdate / LateUpdate) → OnDisable → OnDestroy.
- Update for visual frames; FixedUpdate for physics.
- Time.deltaTime for frame-rate independence.
- Cache components via GetComponent in Awake/Start.
- Coroutines for multi-frame async.
- SerializeField for Inspector + private.

Next: variables, references, and the Inspector.
