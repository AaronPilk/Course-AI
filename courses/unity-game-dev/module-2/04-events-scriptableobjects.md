---
module: 2
position: 4
title: "Events, delegates, ScriptableObjects"
objective: "Decouple Unity systems for maintainable architecture."
estimated_minutes: 5
---

# Events, delegates, ScriptableObjects

## C# events

For pub-sub pattern in Unity:
```csharp
public class HealthSystem : MonoBehaviour {
  public event Action<int> OnHealthChanged;
  private int health;
  public void TakeDamage(int amount) {
    health -= amount;
    OnHealthChanged?.Invoke(health);
  }
}
```

Subscribers:
```csharp
void Start() {
  healthSystem.OnHealthChanged += UpdateHealthUI;
}
void OnDestroy() {
  healthSystem.OnHealthChanged -= UpdateHealthUI;  // Cleanup
}
void UpdateHealthUI(int newHealth) {
  healthText.text = newHealth.ToString();
}
```

For: decoupled communication; HUD updates on health change.

## UnityEvents (Inspector-driven)

Alternative — UnityEvent serializable in Inspector:
```csharp
public UnityEvent<int> OnHealthChanged;
```

In Inspector: drag target objects + functions to call. Designers configure without code.

For: designer-friendly event wiring.

## Delegates

The underlying type:
```csharp
public delegate void HealthChangedHandler(int newHealth);
public HealthChangedHandler OnHealthChanged;
```

Action / Func are pre-defined delegates (simpler than custom).

For: type-safe function references.

## ScriptableObjects

Data assets that persist outside of scenes:
```csharp
[CreateAssetMenu(menuName = "Game/Enemy Data")]
public class EnemyData : ScriptableObject {
  public string enemyName;
  public int health;
  public Sprite icon;
  public AudioClip deathSound;
}
```

Create asset: Right-click Project view → Create → Game → Enemy Data.

For:
- Game balance / data tables.
- Shared configuration.
- Cross-scene data containers.
- Event channels (advanced).

## ScriptableObject vs. MonoBehaviour

**MonoBehaviour:** attached to GameObject in scene; per-instance.

**ScriptableObject:** standalone asset; shared reference.

For data not tied to specific GameObjects: ScriptableObject.

## ScriptableObject event channels

Advanced pattern for decoupled events:
```csharp
[CreateAssetMenu]
public class GameEvent : ScriptableObject {
  private List<GameEventListener> listeners = new();
  public void Raise() {
    foreach (var l in listeners) l.OnEventRaised();
  }
  public void Register(GameEventListener l) { listeners.Add(l); }
  public void Unregister(GameEventListener l) { listeners.Remove(l); }
}
```

Create event assets (PlayerDied, LevelComplete, ItemPickedUp). Listeners reference the asset; raise / listen.

For: cross-scene events; designer-configurable; no direct code coupling.

## Static singletons

For globally-accessible managers:
```csharp
public class GameManager : MonoBehaviour {
  public static GameManager Instance { get; private set; }
  void Awake() {
    if (Instance == null) { Instance = this; DontDestroyOnLoad(gameObject); }
    else { Destroy(gameObject); }
  }
}
```

Access from anywhere: `GameManager.Instance.SomeMethod()`.

For: single-instance managers.

## Observer pattern via interfaces

Define interface:
```csharp
public interface IDamageable {
  void TakeDamage(int amount);
}
```

Implement in MonoBehaviours:
```csharp
public class Enemy : MonoBehaviour, IDamageable {
  public void TakeDamage(int amount) { /* ... */ }
}
```

Use:
```csharp
var damageable = other.GetComponent<IDamageable>();
damageable?.TakeDamage(10);
```

For: polymorphism across unrelated MonoBehaviours.

## Common architecture patterns

**MVC (Model-View-Controller):** separate data, UI, logic. Less common in Unity than other engines.

**MVVM (Model-View-ViewModel):** for complex UI.

**ECS (Entity Component System):** Unity DOTS / Burst-compiled performance. For 1000s of entities.

**Composition + Events:** the Unity-native pattern. MonoBehaviours composed via Components; communicate via C# events + UnityEvents + ScriptableObjects.

## Memory management

C# uses garbage collection:
- **Avoid allocations in tight loops.** Frame-by-frame allocations = GC pressure.
- **Object pooling for frequent spawning.** Bullets, particles, etc.
- **Cache strings.** Avoid string concatenation in Update.

For: smooth performance.

## Async/await alternative

Modern C# alternative to coroutines:
```csharp
async Task FadeOut(float duration) {
  for (float t = 0; t < duration; t += Time.deltaTime) {
    color.a = 1 - (t / duration);
    await Task.Yield();
  }
}
```

For: cleaner syntax; better error handling.

Some prefer; some still use coroutines. Unity supports both.

## Mistakes to avoid

- **Forgetting to unsubscribe from events.** Memory leaks.
- **Public events without proper cleanup.** Crash on destroyed targets.
- **Singletons for everything.** Hard to test.
- **ScriptableObjects for transient data.** They persist; modified at runtime persists to asset.

## Summary

- C# events for decoupled communication.
- UnityEvents for Inspector-wired callbacks.
- ScriptableObjects for shared data assets.
- ScriptableObject event channels for cross-scene events.
- Singletons for global managers (used sparingly).
- Interfaces (IDamageable, IInteractable) for polymorphism.
- Object pooling + caching for performance.

Module 3 next: physics + input + interactions.
