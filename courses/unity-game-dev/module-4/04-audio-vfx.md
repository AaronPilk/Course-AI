---
module: 4
position: 4
title: "Audio + visual effects"
objective: "Add audio and particles for polish."
estimated_minutes: 5
---

# Audio + visual effects

## Audio in Unity

Two key components:
- **AudioSource.** Plays audio (on a GameObject).
- **AudioListener.** Receives audio (usually on Main Camera).

For: most games, one AudioListener on player camera + many AudioSources on game objects.

## Playing sounds

```csharp
public AudioClip footstepSound;
private AudioSource audioSource;
void Awake() { audioSource = GetComponent<AudioSource>(); }
void PlayFootstep() {
  audioSource.PlayOneShot(footstepSound);
}
```

For: one-shot SFX without overwriting current audio.

## 3D Audio (spatial)

AudioSource → Spatial Blend slider:
- **0 = 2D.** Same volume everywhere (UI sounds, music).
- **1 = 3D.** Falls off with distance; positional (footsteps, explosions).

For: realistic 3D audio worlds.

## Audio Mixer

For: organized audio:
- Window → Audio → Audio Mixer.
- Groups (Music, SFX, Voice, Ambient).
- Volume sliders per group.
- Effects (reverb, EQ, compression).

For: pro audio mixing; player adjusts categories independently.

## AudioClip import settings

Per AudioClip in Inspector:
- **Load Type.** Decompress On Load / Compressed In Memory / Streaming.
- **Compression Format.** PCM / Vorbis / ADPCM.

For: optimize per platform; music streams; SFX preload.

## Particles via Niagara — wait, that's Unreal

Unity uses Shuriken (the built-in particle system) or Visual Effect Graph (VFX Graph; modern, GPU-based).

## Shuriken particles

Add → Effects → Particle System. Default emits.

Modules (each toggled):
- **Emission.** Rate per second.
- **Shape.** Where particles spawn (cone, box, sphere).
- **Velocity over Lifetime.** Particle motion.
- **Color over Lifetime.** Fade / color shift.
- **Size over Lifetime.** Grow / shrink.
- **Rotation over Lifetime.** Spin.

For: fire, smoke, sparks, magic, explosions.

## VFX Graph

For complex GPU particles (1000s):
- Node-based editor.
- Massive particle counts.
- Compute shader-driven.

Install via Package Manager. For: high-end VFX (sandstorms, magic spells, particle simulations).

## Spawning effects

```csharp
public GameObject explosionPrefab;
void Explode() {
  GameObject vfx = Instantiate(explosionPrefab, transform.position, Quaternion.identity);
  Destroy(vfx, 3f);  // Self-destruct after 3 seconds
}
```

For: dynamic VFX (hit effects, explosions, pickups).

## Post-processing

For screen effects (bloom, vignette, color grading):
- Post Process Volume (URP/HDRP).
- Layer set to Post Processing.
- Effects via Volume Override.

For: cinematic look; mood per area.

## Lighting (briefly)

Lights in Unity:
- **Directional.** Sun.
- **Point.** Bulb.
- **Spot.** Flashlight.
- **Area.** Studio panel.

Mobility:
- **Realtime.** Computed per frame; dynamic.
- **Mixed.** Baked + realtime hybrid.
- **Baked.** Lightmap; static.

For URP: Realtime + Probes typically.

## Mistakes to avoid

- **One Audio Source for everything.** Conflicts; can't play simultaneously.
- **No Audio Mixer.** No volume control.
- **CPU particles for 1000s of objects.** Use VFX Graph (GPU).
- **No post-processing.** Looks flat.
- **All Realtime lights.** Performance hit.

## Summary

- AudioSource + AudioListener for audio.
- PlayOneShot for one-shot SFX.
- 2D vs. 3D audio via Spatial Blend.
- Audio Mixer for organized mixing.
- Shuriken particles for typical VFX; VFX Graph for high-end.
- Post-processing for screen effects.
- Mix Realtime / Baked lighting per platform target.

Module 5 next: scene management + build pipeline.
