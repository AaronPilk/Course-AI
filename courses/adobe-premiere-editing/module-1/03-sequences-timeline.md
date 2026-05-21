---
module: 1
position: 3
title: "Sequences, settings, and the timeline"
objective: "Understand the timeline that holds your edit."
estimated_minutes: 5
---

# Sequences, settings, and the timeline

## What a sequence is

A sequence is a timeline. It holds the edit: which clips, in what order, with what effects.

Projects have multiple sequences:
- **Working sequences.** Active edits.
- **Final cuts.** Locked exports.
- **Selects reels.** Curated selection of best clips.
- **Versions.** v01, v02, v03 alongside each other.

The active sequence shows in the Program monitor; the Timeline panel reflects its tracks.

## Creating sequences

Three paths:
1. **From a clip.** Drag a clip onto the New Item icon (bottom of Project panel) — sequence auto-matches the clip's settings. The pro default.
2. **From a preset.** File → New → Sequence → pick preset (DSLR 4K, ARRI ProRes, Sony XAVC, etc.).
3. **Custom.** File → New → Sequence → Settings tab → manually configure frame rate, resolution, audio sample rate.

For most work: drag-a-clip method. Premiere picks correctly 95% of the time.

## Sequence settings

Critical:
- **Frame rate.** 23.976 (film), 24 (cinema), 25 (PAL), 29.97 (NTSC TV), 30 (web), 50 / 60 (slow motion).
- **Frame size.** 1920×1080 (HD), 3840×2160 (4K UHD), 1080×1920 (vertical 9:16).
- **Pixel aspect ratio.** Square pixels for modern; 16:9 for HD; mostly 1.0 (square).
- **Audio sample rate.** 48000 Hz (broadcast standard); sometimes 44100 (CD).
- **Display format.** Timecode for video; samples for audio.

Match source footage; mismatch → conform.

## Tracks

Tracks stack:
- **Video.** V1, V2, V3, ... ascending upward. Higher tracks composite on top.
- **Audio.** A1, A2, A3, ... ascending downward. All audio tracks mix together.

Defaults: 3 video tracks, 3 audio tracks. Add more via right-click in the track header area → Add Tracks.

## Track types

**Video tracks** — all the same.

**Audio tracks** — types matter:
- **Standard.** Mono or stereo (mixed dynamically).
- **Mono.** Single channel only.
- **Stereo.** Two-channel.
- **5.1.** Six-channel surround.
- **Adaptive.** Modern; flexible channel routing.

Set per track: right-click header → Modify → Audio Channels.

For dialogue (typically mono recordings): Mono tracks. For music (stereo): Stereo. For 5.1 surround mixes: 5.1 tracks.

## Timeline tools

The toolbox (left of timeline):
- **Selection (V).** Standard select / drag.
- **Track Select Forward (A).** Selects everything on a track from clicked point right.
- **Track Select Backward (Shift+A).** Same, leftward.
- **Ripple Edit (B).** Trim clip + shift adjacent clips.
- **Rolling Edit (N).** Trim edit point between two clips.
- **Rate Stretch (R).** Change clip duration; auto-adjusts speed.
- **Razor (C).** Cut at click point.
- **Slip (Y).** Change clip in/out without moving clip on timeline.
- **Slide (U).** Move clip; adjacent clips' edges adjust.
- **Pen (P).** Add keyframes.
- **Hand (H).** Pan timeline view.
- **Zoom (Z).** Zoom timeline.

Master at least Selection, Razor, Ripple, Rolling, Slip — these handle most edits.

## Playhead

The blue vertical line indicates current position. Click in timeline ruler to move; use J/K/L for transport; arrow keys to step frame-by-frame.

Spacebar plays/pauses.

The Program monitor shows the timeline at playhead position.

## Snapping

S key toggles snapping. With snap on: dragging clips to timeline snaps to edit points, playhead, markers.

Useful for precise placement. Toggle off when you want fine adjustment.

## In/Out points

Set on the timeline (not just clips):
- I = in point at playhead.
- O = out point at playhead.

Highlighted region. Export / render previews only this range.

## Adding clips

From Source monitor to timeline:
- **Insert (,).** Adds clip; shifts existing clips right.
- **Overwrite (.).** Adds clip; overwrites existing.

Or drag from Project panel / Source to timeline (visual drag).

For surgical editing: keyboard I/O on source → ,/. to add.

## The three-point edit

Premiere's classic workflow:
1. Set in/out on source clip (or skip = whole clip).
2. Set in (and optionally out) on timeline.
3. Press , or . → clip lands at timeline in-point.

The "three points" — source-in, source-out, timeline-in — determine the insert. Premiere computes the fourth.

Master this for fast cutting; covered more in next module.

## Track targeting

Yellow track headers (V1, A1) indicate "active" tracks for editing.

When inserting from source: clip goes to targeted tracks. Untarget tracks you don't want affected.

When patching from source: drag source's V/A indicators to specific timeline tracks (e.g., source A1 → timeline A3).

Mistake: forgetting which tracks are targeted; clips land wrong.

## Sync locks

Padlock icons on track headers:
- **Toggle Sync Lock (the rectangle).** Determines which tracks ripple together when you insert / delete.
- **Toggle Track Lock (the lock).** Prevents any edits on that track.

For preserving sync between picture + audio: keep sync locks engaged on related tracks.

## Linked clips

Video + audio recorded together (camera audio) are linked. Move the video → audio moves too.

Unlink: select clip → right-click → Unlink (or Cmd+L). Useful for replacing dialogue with separate boom recording.

## Markers in the timeline

M key in timeline → marker at playhead. Different from clip markers; timeline markers don't move with clips.

Use for:
- **Music beats** (sync edits to rhythm).
- **Chapter points** (long-form structure).
- **Notes** ("CG needed here," "rerecord this VO").

Color-code markers via right-click → Marker Color.

## Multiple sequences

Drag a sequence INTO another sequence — it becomes a nested sequence (a clip representing the inner sequence).

Useful for:
- **Reusable segments.** Title sequence used in multiple final cuts.
- **Effects grouping.** Apply one effect to a nested sequence containing many clips.
- **Pre-edits.** Edit a complex scene as one sequence; nest into the master.

Nesting compounds; don't over-do (multi-level nesting is hard to debug).

## Sequence duplication

Cmd+C / Cmd+V on a sequence in Project panel duplicates. Useful for versioning.

Or right-click → Duplicate.

Pro practice: duplicate before risky structural changes.

## Mistakes to avoid

- **Wrong sequence frame rate.** Conform issues; performance hit.
- **No track targeting.** Clips land on wrong tracks.
- **Snap always off.** Edits drift; sync breaks.
- **No markers.** Tribal knowledge lost.
- **Nesting overuse.** 5 levels deep; impossible to maintain.

## Summary

- A sequence is a timeline; projects have multiple sequences.
- Drag-a-clip method auto-matches sequence settings to source.
- Tracks stack video (composit upward), audio (all mix).
- Toolbox: Selection, Razor, Ripple, Rolling, Slip — core editing tools.
- Three-point editing: source in/out + timeline in → insert.
- Snapping, markers, track targeting, sync locks shape the edit.
- Nested sequences for reusable segments; don't over-nest.

Next: proxies and performance.
