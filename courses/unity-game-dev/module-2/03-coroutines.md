---
module: 2
position: 3
title: "Update, FixedUpdate, coroutines"
objective: "Master Unity's main game loop methods."
estimated_minutes: 5
---

# Update, FixedUpdate, coroutines

## Update — every visual frame

Called every frame (60-120+ times/sec typically):
- Read input.
- Update visual state (non-physics).
- UI updates.
- Game state checks.

Use Time.deltaTime for frame-rate independence.

## FixedUpdate — physics

Called at fixed intervals (50/sec default):
- Rigidbody forces, velocity changes.
- Physics-dependent logic.

Predictable timing for physics stability.

## LateUpdate — after all Updates

Called after all Update + FixedUpdate calls:
- Camera following.
- Post-physics adjustments.
- Cleanup.

For: things that should react to current frame's results.

## Coroutines — multi-frame async

For: animations, timed actions, sequences over multiple frames.

```csharp
IEnumerator FadeOut(float duration) {
  float elapsed = 0;
  while (elapsed < duration) {
    elapsed += Time.deltaTime;
    color.a = 1 - (elapsed / duration);
    yield return null;  // Wait one frame
  }
}

void Start() {
  StartCoroutine(FadeOut(2f));
}
```

## Common yield instructions

- **yield return null.** Wait one frame.
- **yield return new WaitForSeconds(2f).** Wait 2 seconds.
- **yield return new WaitForFixedUpdate().** Wait one FixedUpdate.
- **yield return new WaitUntil(() => condition).** Wait until condition true.
- **yield return new WaitWhile(() => condition).** Wait while true.

For: timed sequences without complex state machines.

## Starting / stopping coroutines

```csharp
Coroutine cor = StartCoroutine(MyCoroutine());
// Later:
StopCoroutine(cor);
// Or:
StopAllCoroutines();
```

For: managing coroutine lifecycle.

## Coroutines vs. async/await

Unity supports both:
- **Coroutines.** Built-in; Unity-native.
- **async/await (C# Task).** Modern; cleaner syntax.

For most Unity work: coroutines (simpler, predictable). For complex async (multi-threaded, web requests): async/await.

## Common coroutine patterns

**Delayed action:**
```csharp
IEnumerator DoLater() {
  yield return new WaitForSeconds(2f);
  // Action
}
```

**Smooth movement:**
```csharp
IEnumerator MoveTo(Vector3 target) {
  while (transform.position != target) {
    transform.position = Vector3.MoveTowards(transform.position, target, speed * Time.deltaTime);
    yield return null;
  }
}
```

**Repeating action:**
```csharp
IEnumerator Repeat() {
  while (true) {
    // Action
    yield return new WaitForSeconds(1f);
  }
}
```

## Coroutine gotchas

- **Coroutines stop when GameObject is disabled.** OnDisable stops them.
- **Coroutines don't pause when Time.timeScale = 0** (unless using WaitForSecondsRealtime).
- **Coroutines can leak.** Stop on OnDestroy if needed.

## Invoke (alternative)

```csharp
Invoke("MyMethod", 2f);  // Call MyMethod after 2 seconds
```

For simple delayed calls; coroutines more flexible.

## Mistakes to avoid

- **Physics in Update.** Use FixedUpdate.
- **Forgetting Time.deltaTime.** Frame-rate dependent.
- **Camera follow in Update.** Camera lags behind; use LateUpdate.
- **No coroutine cleanup.** Memory issues.

## Summary

- Update: visual frame; use Time.deltaTime.
- FixedUpdate: physics; consistent timing.
- LateUpdate: after Updates; for camera + post-physics.
- Coroutines: multi-frame async via yield.
- Common yields: null (one frame), WaitForSeconds, WaitUntil.

Next: events, delegates, ScriptableObjects.
