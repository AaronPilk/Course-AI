---
module: 1
position: 3
title: "Scenes and the scene hierarchy"
objective: "Organize multiple scenes; understand scene loading."
estimated_minutes: 5
---

# Scenes and the scene hierarchy

## What a Scene is

A Scene = a level / view in your game. Holds GameObjects, lighting, environment.

Games consist of multiple scenes:
- **Main Menu.** Title + options.
- **Level 1, 2, 3, ...** Game levels.
- **Game Over.** End screen.
- **Settings.** Configuration UI.
- **Loading.** Transition.

Each scene is a .unity file in Assets/Scenes/.

## Creating a Scene

File → New Scene → pick template:
- **Basic (Built-in).** Default scene with camera + light.
- **Empty.** No defaults.

Save as .unity in Assets/Scenes/.

## Loading scenes at runtime

SceneManager (Unity's API):
- **SceneManager.LoadScene("SceneName").** Replace current scene.
- **SceneManager.LoadScene("SceneName", LoadSceneMode.Additive).** Add scene on top.
- **SceneManager.LoadSceneAsync.** Async loading; doesn't freeze.

For: transitioning between menus, levels, gameplay states.

## Single vs. Additive loading

**Single:** unloads current; loads new. Standard for "go to next level."

**Additive:** keeps current; loads new on top. For:
- **Persistent UI / managers.** Keep across levels.
- **Streaming worlds.** Multiple scenes for sections.
- **Multi-player local scenes.** Each player's view.

For: complex scene management.

## Scenes in Build Settings

To load a scene at runtime, it must be in Build Settings:
- File → Build Settings.
- Drag scenes from Project into Scenes In Build list.
- Or: Add Open Scenes.

Order matters; scene index 0 is the first scene.

## Active scene

Multiple loaded scenes → one is "active":
- Where new GameObjects spawn by default.
- Lighting + skybox come from active.

Set via SceneManager.SetActiveScene.

## DontDestroyOnLoad

For persistent GameObjects (managers, controllers):
- DontDestroyOnLoad(gameObject) in script.
- Object survives scene transitions.

For: GameManager, AudioManager, persistent UI.

## Scene organization

Patterns:
- **Per-level scenes.** Each level its own file.
- **Hub + sub-scenes.** Central hub; load specific area as needed.
- **Persistent scene.** Always loaded; gameplay scenes additive on top.

For: organizing large games.

## Streaming scenes

For open worlds:
- Multiple scene files.
- SceneManager.LoadSceneAsync loads sections.
- LoadSceneMode.Additive layers them.
- Unload distant ones (SceneManager.UnloadSceneAsync).

Unity doesn't have automatic World Partition like Unreal; manual streaming.

For: large worlds; performance.

## Async loading

For: smooth transitions:
```csharp
AsyncOperation op = SceneManager.LoadSceneAsync("Level2");
while (!op.isDone) {
  yield return null;  // Wait
}
```

Coroutine pattern; non-blocking; can show progress.

## Loading screens

Pattern:
1. Show loading screen (currently loaded scene).
2. Load destination scene async.
3. Wait for completion.
4. Hide loading screen.
5. Activate new scene.

For: smooth UX during heavy loads.

## Scene-to-scene data passing

When changing scenes, data resets. To pass data:
- **Static variables.** Class variables marked static.
- **DontDestroyOnLoad.** Persistent GameObject holding data.
- **PlayerPrefs.** Disk-based key-value.
- **SaveGame system.** Custom file-based.
- **ScriptableObject.** Asset that persists.

For: cross-scene communication.

## ScriptableObjects for shared data

ScriptableObject = asset-based data container:
- Create in Project view → Create → ScriptableObject.
- Reference from multiple scenes.
- Persists between scenes + sessions.

For: game settings, level configs, runtime-shared state.

## Loading from URL / Asset Bundle

For: downloadable content; expansion packs:
- Asset Bundles (older).
- Addressables (newer).
- Build content separately from main game.
- Load on demand.

For: large games; live updates.

## Scene templates

Create reusable scene templates:
- Save common scene setup as template.
- Use to create new scenes with defaults.

For: standardized scene structures.

## Common patterns

**Main Menu → Game.**
- LoadScene("Game", Single).

**Hub → Dungeon → Hub.**
- LoadScene("Dungeon", Single); after: LoadScene("Hub", Single).
- Save player progress to ScriptableObject before transition.

**Persistent UI + Levels.**
- "Persistent" scene with UI + managers.
- LoadScene("Level1", Additive) on top.
- Switch levels by Unloading + Loading additive.

## Mistakes to avoid

- **Scene not in Build Settings.** Won't load.
- **Forget to set Active scene.** Lighting wrong; new objects spawn wrong place.
- **DontDestroyOnLoad on too many objects.** Memory bloat.
- **No async loading.** Game freezes during scene transitions.
- **No data persistence between scenes.** Player progress lost.

## Summary

- Scene = level / view; .unity files in Assets/Scenes/.
- SceneManager.LoadScene to switch scenes.
- Single (replace) or Additive (layer on top) modes.
- Async loading for smooth transitions.
- DontDestroyOnLoad for persistent objects.
- ScriptableObjects + PlayerPrefs for cross-scene data.
- Add scenes to Build Settings to be loadable.

Next: Prefabs.
