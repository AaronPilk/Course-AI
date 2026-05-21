---
module: 2
position: 4
title: "Multicam editing"
objective: "Edit content shot with multiple cameras smoothly."
estimated_minutes: 5
---

# Multicam editing

## What multicam is

Multicam = multiple cameras filming the same event/scene. Common in:
- **Interviews.** Wide + tight + B-cam.
- **Podcasts.** One camera per host.
- **Events.** Wedding, conference, concert — multiple coverage angles.
- **Narrative.** Single scene shot from 3-4 angles.

Multicam editing lets you switch between angles smoothly, often in one pass through the footage.

## Sync — the first step

All cameras must be sync'd in time:
- **Timecode.** If cameras genlock'd / sync'd at shoot: easy; Premiere reads timecode.
- **Audio waveform.** Pro pick if cameras' audio captured same source (slate clap, ambient).
- **Markers.** Manual; align on a visible event (clapboard close).
- **In/out points.** Match specific frames.

Sync method depends on shoot setup. Audio waveform is the workhorse in 2026.

## Creating a multicam source sequence

1. In Project panel: select all camera angle clips (Cmd-click each).
2. Right-click → Create Multi-Camera Source Sequence.
3. Sync method dialog:
   - **Audio.** Best for matched audio.
   - **Timecode.** Best for sync'd cameras.
   - **Markers.** Manual.
   - **In Points / Out Points.** Specific frame match.
4. Premiere syncs the clips; creates a new multicam clip.
5. Drag the multicam clip into your sequence.

The multicam clip plays as one clip; the program monitor lets you switch angles.

## Multicam program view

Open the multicam clip in source monitor → switch to multicam view (the icon with two squares, or wrench → Composite Video → Multi-Camera).

The source monitor now shows all camera angles in a grid (2-up, 4-up, 9-up, 16-up depending on count).

Click an angle (or press number key 1-9) → that angle becomes the active angle in timeline.

## Editing in real-time

The pro workflow:
1. Set timeline to record from multicam.
2. Play timeline.
3. While playing: click angles (or press keys 1-9).
4. Each click adds a cut at playhead; that angle takes over.
5. Result: timeline has cuts at each switch point, with the correct angle on each side.

Like a live TV director switching cameras — except recorded for refinement.

## Refining after live edit

The live multicam pass gives a rough cut. Then:
- **Slip (Y) on multicam clips.** Stays on same camera; changes content (offset within source).
- **Rolling (N) on edit points.** Adjust where the angle switch happens.
- **Right-click → Multi-Camera → [angle].** Change which angle a segment uses.
- **Match Frame (F).** Open source multicam; refine.

Most multicam content is "live cut + refine" — fast to get a structure; iterate to polish.

## Cutting on action

When switching between angles: cut on natural motion or beat:
- Speaker turns head → cut to wide.
- Music beat → cut to drummer.
- Audience reaction → cut to audience.

Cutting at random feels artificial; cutting on motion feels intentional.

## The "boring camera" rule

For each segment, pick the most interesting angle. Wide for context; tight for emotion; B-cam for variety.

Don't favor one camera; rotate. But also don't switch every 2 seconds — viewer needs to settle.

Typical rhythm: 5-15 seconds per angle, varying.

## Tight + wide pattern

Common multicam pattern:
- Start: wide (establish).
- Speaker emphasizes a point: cut to tight (emotion / focus).
- Quieter moment: back to wide (breath).
- Speaker emotional: tight again.

Rhythm of wide ↔ tight provides natural visual variation.

## B-camera role

If only 2 cameras: A is primary (interview tight), B is backup / wide.

If 3+: each has a role. C might be B-roll motion (zooming in on hands gesturing), D might be wide overhead.

Plan camera positions for what they capture; editing benefits.

## Audio in multicam

Each camera typically has its own audio (camera mic).

Best practice: pick the cleanest audio (usually boom mic on dedicated track) and use that. Mute camera audio tracks in the multicam clip; sync to boom.

For PA-fed interviews: lavalier mics provide clean dialogue. Camera audio is reference only.

## Master audio track

After syncing for picture: route all clean audio to a master track. Don't have audio jump between cameras' audio.

This means: even though picture cuts between A-cam and B-cam, audio stays on the boom-mic track throughout. Smooth.

## Multicam performance

Multicam playback = decoding all camera streams simultaneously. Hardware-intensive.

Solutions:
- **Proxies (essential for 4K+ multicam).** 1/4 res for all angles.
- **Lower playback resolution.**
- **Fewer angles in playback.** Toggle some angles off if not currently used.
- **Render previews after structuring the edit.**

Without proxies: 6-cam 4K multicam is unplayable on most hardware.

## Common multicam workflows

**Interview (2-cam).** Wide + tight. Edit: stay on tight for content; cut to wide for emotion/pacing.

**Podcast (3-4 cam).** Each host has their own camera; wide group shot. Edit: cut to whoever's speaking; group shot for laughs / reactions.

**Wedding (5-8 cam).** Wide + bride + groom + audience + B-roll. Edit: ceremony beats with multiple angles; first dance from multiple sides; reception flow.

**Concert (10+ cam).** Like a live TV switch — heavy work; usually live-cut then refined.

## Mistakes to avoid

- **No sync method planned.** Cameras drift in time; sync nightmares.
- **Editing native 4K multicam.** Stutter; productivity dies.
- **All angles weighted equally.** Boring; some angles are stronger.
- **Cuts at random.** Doesn't feel intentional.
- **Audio jumps between camera audio.** Sound levels change; ugly.

## Summary

- Multicam = multiple cameras of same event/scene; switching between angles.
- Sync method: timecode (best if genlock'd), audio waveform (workhorse), markers (manual).
- Create Multi-Camera Source Sequence; drag to timeline.
- Live-cut by clicking angles or pressing 1-9 during playback.
- Refine with Slip, Rolling, angle changes, Match Frame.
- Cut on motion; vary rhythm; pick most interesting angle.
- Audio: pick cleanest (boom / lav); don't jump between camera audio.
- Proxies essential for 4K+ multicam.

Module 3 next: audio for video.
