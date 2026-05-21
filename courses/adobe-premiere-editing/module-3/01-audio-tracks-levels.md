---
module: 3
position: 1
title: "Audio tracks, levels, and the mixer"
objective: "Set up the audio side of your sequence so it sounds professional."
estimated_minutes: 5
---

# Audio tracks, levels, and the mixer

## Why audio matters

Audiences forgive poor video; they don't forgive poor audio.

Mumbled dialogue, background hiss, blown-out music, jarring level shifts — all kill viewer retention faster than mediocre footage.

Pro editing is 50% audio. Most novice editors under-invest; most pro editors over-invest. The bar is high.

## Audio track types

Premiere has multiple audio track types:
- **Standard.** Mono or stereo dynamically; flexible.
- **Mono.** Single channel.
- **Stereo.** Two channels (L + R).
- **5.1.** Six-channel surround.
- **Adaptive.** Modern; flexible channel routing.

For most YouTube / commercial / interview work:
- Dialogue tracks: Mono (most boom + lav mics are mono recordings).
- Music tracks: Stereo.
- SFX tracks: Stereo or Mono.

Set per track: right-click header → Modify → Audio Channels.

## Standard track layout

Typical organization:
- **A1.** Boom dialogue or primary mic.
- **A2.** Lavalier dialogue or secondary mic.
- **A3.** Camera audio (reference, often muted).
- **A4.** Music.
- **A5.** Music (if stereo separate).
- **A6.** SFX.
- **A7.** Ambience / room tone.

For larger projects: more tracks; group by source/character.

## Track headers

Each track header shows:
- **Track name.** Default A1 / A2; rename via double-click for clarity.
- **M (mute).** Silences that track during playback.
- **S (solo).** Mutes all OTHER tracks; helpful for isolating.
- **Lock icon.** Prevents edits.
- **Sync lock.** Determines if track ripples.
- **Audio meter.** Shows live levels during playback.

Color-coding tracks (right-click → set color) makes scanning faster.

## Audio levels — dB

Audio levels measured in dB (decibels). Reference points:
- **0 dB.** Maximum digital level; anything above clips (distorts irreversibly).
- **-6 dB.** Headroom; common peak target.
- **-12 dB.** Comfortable; safe for most content.
- **-18 dB / -20 dB.** Broadcast reference; below typical dialogue level.
- **-∞ dB.** Silence.

For YouTube / web: -6 to -12 dB peak. For broadcast: -18 dB peak. For cinematic: -23 LUFS integrated (more on this later).

## Clipping

When audio exceeds 0 dB, it clips — the waveform is "cut off" at the maximum; distorts irrecoverably.

Visible: yellow → red on audio meters, especially the red "clip" indicator at the top.

Pro audio engineers leave 6 dB of headroom (peak around -6 dB) to avoid accidental clips on transients.

## Audio meter

Window → Audio Meters → docked panel showing real-time levels during playback.

Watch this while playing back to spot:
- Clipping (red indicator).
- Levels too low (peaks below -12 dB; sound thin).
- Inconsistent levels (some dialogue much louder than others).

Pro habit: keep meters visible always.

## Setting clip volume

Two methods:
1. **Clip-level keyframes.** Click clip → Effect Controls → Volume → adjust value or add keyframes.
2. **Drag the rubber band line.** Audio clips have a thin horizontal line; drag to raise/lower volume.

For per-clip volume balance: rubber bands are quick.

## Track-level volume

Mixer panel: Window → Audio Track Mixer.

Each track has a fader — slide to adjust the entire track's output level.

For overall mix: track faders. For per-clip variance: clip rubber bands.

## The Essential Sound panel (preview)

Window → Essential Sound. The main tool for fixing audio in 2026 Premiere — covered fully next lesson.

Quick preview: select audio clips → assign type (Dialogue, Music, SFX, Ambience) → use sliders to clean, balance, polish.

Game-changer for solo editors who don't want to learn Audition.

## Loudness normalization

Modern delivery requires LUFS-based loudness:
- **YouTube.** -14 LUFS integrated.
- **Spotify.** -14 LUFS.
- **Apple Podcasts.** -16 LUFS.
- **Broadcast TV.** -23 LUFS (US: ATSC A/85) / -23 LUFS (EU: EBU R128).

LUFS = perceived loudness (closer to how humans hear); replaces older peak-only metering.

Premiere's Essential Sound panel has Loudness measurement; checks against target.

## Match audio level

For dialogue normalization: right-click clip → Audio Gain → Normalize Max Peak (or Normalize All Peaks).

Sets the peak to a chosen value (typically -3 dB or -6 dB). Brings up quiet clips; brings down loud ones.

Apply per-clip or batch (select all dialogue clips → normalize together).

## Audio fades

Default cuts have abrupt audio starts/ends — can cause clicks/pops.

Add fades:
- **Audio transition (constant power) at clip edges.** Cmd+Shift+D applies default audio transition.
- **Manual keyframes.** Drag the rubber band line down at the start/end.

Even 1-frame fades eliminate click artifacts; standard practice.

## Crossfades

Between two adjacent clips: apply Crossfade (the default audio transition).

Smooth handoff from one clip to next; eliminates pops at the edit point.

For music transitions: longer crossfade (1-3 seconds) blends two songs.

## Audio routing

Master output: where all audio mixes to. Usually stereo.

For surround/stems: route specific tracks to specific outputs (e.g., dialogue stem, music stem, FX stem).

Set in Window → Audio Track Mixer → top dropdown per track → Output Assign.

For broadcast: deliver as stems (separate dialogue / music / FX files) for international dub.

## Track effects

Apply effects (compressor, EQ, reverb) to an entire track:
- Mixer → top of track → Effects Inserts (the "fx" panel) → add effect.
- Edit effect parameters.
- Affects all clips on that track.

vs. clip-level effects: applied to one clip only.

Track-level for things you want everywhere (light compression on dialogue track); clip-level for surgical fixes (de-essing a specific take).

## Stereo vs. mono

Dialogue is usually mono (single mic). On stereo timeline: the mono clip plays center (both speakers).

For music (stereo): plays L+R separately. Pan controls available per clip / per track.

Mixing mono dialogue with stereo music: standard; works fine.

## Pan

Pan = where in stereo image the sound sits (L 100% to R 100%, with center = both).

For dialogue: pan center.
For music: typically stays stereo (don't pan).
For SFX: pan to match action (footsteps L → R as character walks).

Pan control: clip's Effect Controls > Audio > Pan.

## Mistakes to avoid

- **Clipping (peaks above 0 dB).** Distortion in your master file.
- **Inconsistent levels.** Some dialogue much louder than others.
- **Music too loud.** Drowns out dialogue.
- **No fades.** Clicks at cuts.
- **No audio meter visible.** Levels drift; problems go unnoticed.

## Summary

- Audio matters more than viewers consciously notice; under-invest at your peril.
- Track types: Mono (dialogue), Stereo (music, SFX); Adaptive for flexibility.
- Levels in dB; 0 dB = clip; aim for -6 to -12 dB peaks; -14 LUFS for streaming.
- Audio meters always visible during playback.
- Clip rubber bands for per-clip volume; track faders for overall mix.
- Audio fades on every cut to prevent clicks.
- Essential Sound panel is the modern audio cleanup tool.

Next: Essential Sound panel deep dive.
