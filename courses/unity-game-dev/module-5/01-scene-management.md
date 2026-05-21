---
module: 5
position: 1
title: "Scene management and persistence"
objective: "Load scenes; persist data across them."
estimated_minutes: 5
---

# Scene management and persistence

## SceneManager API

Unity's scene loading:
```csharp
using UnityEngine.SceneManagement;

SceneManager.LoadScene("Level2");  // Replace current
SceneManager.LoadScene("Level2", LoadSceneMode.Additive);  // Add on top
SceneManager.LoadSceneAsync("Level2");  // Non-blocking
```

For: transitioning between menus, levels, gameplay states.

## Build Settings

To load a scene at runtime, add to Build Settings:
- File → Build Settings.
- Drag scenes from Project into "Scenes In Build".
- Scene at index 0 is first scene.

Missing scenes won't load.

## DontDestroyOnLoad

For persistent managers across scenes:
```csharp
void Awake() {
  if (Instance == null) {
    Instance = this;
    DontDestroyOnLoad(gameObject);
  } else {
    Destroy(gameObject);  // Prevent duplicates
  }
}
```

For: GameManager, AudioManager, SaveSystem.

## Async loading with progress

```csharp
IEnumerator LoadLevelAsync(string sceneName) {
  AsyncOperation op = SceneManager.LoadSceneAsync(sceneName);
  while (!op.isDone) {
    float progress = Mathf.Clamp01(op.progress / 0.9f);
    progressBar.value = progress;
    yield return null;
  }
}
```

For: smooth loading screens with progress.

## Persisting data across scenes

Options:
1. **DontDestroyOnLoad GameObject.** Persistent in-memory data.
2. **PlayerPrefs.** Disk-based key-value (small data).
3. **JSON to file.** Custom save format.
4. **ScriptableObject.** Asset-based (in-memory + can save to disk).
5. **Save system (custom).** Save / load to slot files.

For different data types: pick by persistence + size.

## PlayerPrefs

For: small key-value data:
```csharp
PlayerPrefs.SetInt("HighScore", 1000);
int score = PlayerPrefs.GetInt("HighScore", 0);  // Default 0
PlayerPrefs.SetString("PlayerName", "Alice");
PlayerPrefs.Save();
```

For: settings, high scores, simple preferences.

## JSON saves

```csharp
[System.Serializable]
public class SaveData {
  public int level;
  public int score;
  public Vector3 playerPosition;
}

string json = JsonUtility.ToJson(saveData);
File.WriteAllText(Application.persistentDataPath + "/save.json", json);

string loaded = File.ReadAllText(Application.persistentDataPath + "/save.json");
SaveData data = JsonUtility.FromJson<SaveData>(loaded);
```

For: structured save data; file-based.

## ScriptableObjects for shared state

For: shared between scenes:
```csharp
[CreateAssetMenu]
public class GameProgress : ScriptableObject {
  public int currentLevel;
  public int totalScore;
}
```

Create asset; reference from any script. Persists during session; reset on game restart unless saved separately.

For: cross-scene state without explicit save / load.

## Save / load workflow

For full game saves:
1. Save current player state (position, health, inventory, quest progress) → JSON / binary file.
2. Save current level reference + Transform.
3. On load: load file → restore data → load saved level → restore Transform.

For: "save anywhere" games or checkpoints.

## Application paths

- **Application.persistentDataPath.** Per-user save location (survives uninstalls).
- **Application.dataPath.** Read-only assets within the build.
- **Application.streamingAssetsPath.** Read-only assets shipped with the build (can read).

For: saving to disk; respect platform conventions.

## Mistakes to avoid

- **Scene not in Build Settings.** Won't load.
- **No DontDestroyOnLoad.** Managers reset every scene.
- **Saving in PlayerPrefs for large data.** Slow + size limits.
- **Forgetting async loading.** Game freezes during transitions.
- **No save versioning.** Updates break saves.

## Summary

- SceneManager.LoadScene / LoadSceneAsync for scene loading.
- LoadSceneMode: Single (replace) or Additive (layer).
- DontDestroyOnLoad for persistent managers + singletons.
- Async loading with coroutine + progress bar for smooth UX.
- PlayerPrefs for small key-value; JSON for structured saves; ScriptableObjects for session-shared.
- Application.persistentDataPath for save files.

Next: build pipeline.
