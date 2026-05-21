---
module: 4
position: 3
title: "Timeline — cinematics and sequences"
objective: "Build cinematic sequences combining animation, audio, and code."
estimated_minutes: 5
---

# Timeline — cinematics and sequences

## What Timeline is

Timeline = Unity's tool for sequenced cinematic / scripted events. Visual timeline editor; tracks for animation, audio, activation, signals, custom logic.

For:
- **Cutscenes.** Story moments; cinematic camera work.
- **Boss intros.** Dramatic enemy reveals.
- **Tutorials.** Scripted teaching sequences.
- **Replays.** Predetermined sequences.

## Creating a Timeline

GameObject → Create → Timeline. Creates Timeline asset + PlayableDirector component.

Open Timeline window (Window → Sequencing → Timeline).

Add tracks (right-click in track area):
- **Animation Track.** Animates a GameObject.
- **Audio Track.** Plays sound clip.
- **Activation Track.** Enables/disables GameObject.
- **Signal Track.** Fires signals to scripts.
- **Cinemachine Track.** Camera control.
- **Control Track.** Triggers playables (other Timelines, particles, audio).

## Animation Track

For: making a GameObject animate during the timeline.

Add Animation Track → drag GameObject onto it → add Animation Clip or record new animation.

The GameObject animates during the Timeline; resets when Timeline finishes (unless configured otherwise).

## Audio Track

For: playing music/SFX synced to events.

Drag AudioClip onto Audio Track. Plays when timeline reaches that point.

For: cutscene music, dialogue, ambient.

## Activation Track

For: showing/hiding objects during sequence.

Drag GameObject onto Activation Track. Clip on the track = GameObject active for that duration.

For: revealing items, hiding props, switching sets.

## Cinemachine Track

For: cinematic camera work.

Add Cinemachine Track → drag Cinemachine Brain (the camera with the brain). Add Virtual Camera clips at different times → camera blends between them.

For: cinematic shot changes (wide → tight → over-shoulder).

## Signal Track

For: triggering scripts at specific timeline moments.

1. Create Signal Asset (Project view → Signal).
2. Add SignalReceiver component to a GameObject.
3. Signal Track on Timeline → add Signal at specific frame.
4. Receiver calls UnityEvent when Signal fires.

For: trigger gameplay events from cinematics ('enable enemy AI'; 'spawn boss'; 'fade out screen').

## Playing Timelines

PlayableDirector component:
- **Play On Awake.** Auto-play at scene start.
- **Wrap Mode.** None (stop), Loop, Hold.

Or via script:
```csharp
PlayableDirector pd = GetComponent<PlayableDirector>();
pd.Play();
pd.Pause();
pd.Stop();
```

For: gameplay-triggered cinematics.

## Cinemachine

Unity's modern camera system. Free package (Window → Package Manager).

- **CinemachineBrain.** On main camera; routes Cinemachine commands.
- **Cinemachine Virtual Cameras.** Multiple virtual cameras with priorities; highest priority controls Brain.
- **Cinemachine Confiner.** Restrict camera to bounds.
- **Cinemachine Composer / Transposer.** Auto-aim + auto-follow.

For modern Unity camera work: Cinemachine + Timeline combined.

## Sequencer pattern

For complex cinematics:
1. Timeline asset has all the sequence info.
2. Triggered via Blueprint / script when needed.
3. Player Controller disabled during cinematic; re-enabled after.
4. Optional skip via input → Timeline.Stop().

For: cinematic moments without freezing entire game.

## Mistakes to avoid

- **Long Timeline = brittle.** Many things sync; one mistake breaks downstream.
- **No skip option.** Players hate forced cinematics.
- **No disable of player control during cinematic.** Player drives mid-cinematic.
- **Audio not synced.** Off-by-frame frustration.

## Summary

- Timeline = sequenced cinematic / scripted events.
- Tracks: Animation, Audio, Activation, Signal, Cinemachine, Control.
- PlayableDirector component plays Timeline.
- Cinemachine for cinematic cameras (Brain + Virtual Cameras).
- Signals trigger script events at specific frames.

Next: audio + visual effects.
