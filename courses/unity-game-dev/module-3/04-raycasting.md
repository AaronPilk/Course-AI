---
module: 3
position: 4
title: "Raycasting and detection"
objective: "Detect what's in front of, under, or around objects."
estimated_minutes: 5
---

# Raycasting and detection

## What raycasting is

A raycast = an invisible ray cast from a point in a direction. Returns the first thing it hits.

Use cases:
- **Ground check.** "Am I touching ground?" → cast down.
- **Shooting.** "What did the bullet hit?" → cast forward.
- **Interaction.** "What is the player looking at?" → cast from camera forward.
- **Line of sight.** "Can enemy see player?" → cast from enemy to player.
- **AI navigation.** "Is there a wall ahead?" → cast forward.

Essential for game logic detection.

## Basic Raycast

```csharp
RaycastHit hit;
if (Physics.Raycast(transform.position, Vector3.down, out hit, 10f)) {
  // Hit something within 10 units below
  GameObject target = hit.collider.gameObject;
  Vector3 hitPoint = hit.point;
  Vector3 hitNormal = hit.normal;
  float distance = hit.distance;
}
```

Returns true if ray hit something; out parameter has details.

## Raycast with LayerMask

```csharp
LayerMask groundMask = LayerMask.GetMask("Ground");
if (Physics.Raycast(pos, Vector3.down, out hit, 10f, groundMask)) {
  // Only check against Ground layer
}
```

For: surgical detection (don't hit player's own colliders, etc.).

## ScreenPointToRay (for mouse clicks)

For: clicking objects in 3D scene:
```csharp
Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
if (Physics.Raycast(ray, out hit)) {
  // Mouse hovered over hit object
}
```

For: RTS games (click to select); 3D UI in worldspace.

## SphereCast / CapsuleCast / BoxCast

For thicker rays:
```csharp
Physics.SphereCast(start, radius, direction, out hit, distance, layerMask);
```

For: character ground checks (sphere matches feet); broader weapon hit detection.

## OverlapSphere (snapshot of overlapping)

Returns all colliders within radius:
```csharp
Collider[] hits = Physics.OverlapSphere(position, radius, layerMask);
foreach (var col in hits) {
  // Each overlapping collider
}
```

For: area-of-effect damage; explosions; detecting nearby enemies.

## RaycastAll (all hits along ray)

```csharp
RaycastHit[] hits = Physics.RaycastAll(origin, direction, distance, layerMask);
```

For: bullets penetrating multiple targets; through-wall detection.

## Raycast for ground check

Common pattern for "is character on ground":
```csharp
bool IsGrounded() {
  return Physics.Raycast(transform.position, Vector3.down, 0.6f, groundLayer);
}
```

For: enable jumping only when on ground; sliding/landing logic.

## Raycast for interaction

```csharp
void Update() {
  Ray ray = new Ray(camera.position, camera.forward);
  if (Physics.Raycast(ray, out hit, interactDistance, interactableLayer)) {
    ShowInteractPrompt(hit.collider.gameObject);
    if (Input.GetButtonDown("Interact")) {
      hit.collider.GetComponent<IInteractable>()?.Interact();
    }
  } else {
    HideInteractPrompt();
  }
}
```

For: first-person interaction system.

## 2D raycasting

For 2D games:
- `Physics2D.Raycast(origin, direction, distance, layerMask)`.
- Returns RaycastHit2D.

Same patterns; 2D versions of the API.

## Visualizing raycasts

For debugging:
```csharp
Debug.DrawRay(start, direction * distance, Color.red, 1f);
```

Shows the ray in Scene view; helps see what's being cast.

## Mistakes to avoid

- **Raycast every frame for distant objects.** Wasteful; use periodic checks (every 5-10 frames).
- **No LayerMask.** Hits self / unwanted colliders.
- **Forgetting to check collider != null.** Crash on null reference.
- **Long rays without need.** Cost increases with distance.

## Summary

- Physics.Raycast for ray-based detection.
- LayerMask for filtering.
- ScreenPointToRay for mouse clicks in 3D.
- SphereCast / CapsuleCast / BoxCast for thicker shapes.
- OverlapSphere for area-of-effect detection.
- 2D versions (Physics2D) for 2D games.
- Debug.DrawRay for visualization.

Module 4 next: UI, animation, polish.
