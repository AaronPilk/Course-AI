---
module: 1
position: 1
title: "Workspace and project setup"
objective: "Configure Premiere right from the first frame; save yourself hours later."
estimated_minutes: 5
---

# Workspace and project setup

## The Premiere window

Premiere's UI splits into four primary panels:
- **Source monitor** — preview unedited clips.
- **Program monitor** — preview the timeline.
- **Timeline** — the edit itself.
- **Project panel** — your media library.

Plus secondary panels: Effect Controls, Lumetri Color, Essential Sound, Essential Graphics, Audio Track Mixer.

Pro editors keep what they need visible; hide what they don't. Workspaces save layouts.

## Workspaces

Window → Workspaces → choose preset (Editing, Color, Effects, Audio). Each preset shows the relevant panels arranged.

Save your own: arrange panels → Window → Workspaces → Save as new workspace.

Most editors customize: bigger source/program monitors, audio meters always visible, project panel left side.

## Creating a project

File → New → Project. Set:
- **Name** — descriptive.
- **Location** — fast drive; SSD preferred.
- **Renderer** — Mercury Playback Engine GPU Acceleration (use Metal / CUDA / OpenCL depending on hardware).
- **Scratch disks** — captured video, audio, previews; same fast drive as project.

Click Create. The .prproj file is born.

## Project organization

Inside the Project panel, create bins (right-click → New Bin):
- **01 Footage** — source clips, organized by day/location/camera.
- **02 Audio** — music, SFX, dialogue.
- **03 Graphics** — logos, titles, lower thirds.
- **04 Sequences** — your edit timelines.
- **05 Exports** — for reference, not the actual exports.

Naming bins with numbers controls sort order; clearer at-a-glance.

## Frame rate and resolution

Set sequence settings to match source footage. Common 2026 defaults:
- **YouTube / streaming.** 3840×2160 (4K UHD) at 24 / 30 fps. 6K and 8K still emerging but bandwidth limits.
- **Social vertical.** 1080×1920 (9:16) at 30 fps.
- **Broadcast.** 1920×1080 at 23.976 fps (film look) or 29.97 (TV).
- **Cinematic.** 24 fps.
- **High-frame-rate.** 60 / 120 fps for slow motion or high-action.

Mismatch = either letterbox / pillarbox or slow rendering. Match the timeline to your footage.

## The Edit > Preferences

Spend 10 minutes setting preferences:
- **General — Display the project item name and label color for all instances.** Helpful in timeline.
- **Auto Save — every 5-15 minutes; keep 20+ versions.** Crashes happen.
- **Media — Default Bin size; Indeterminate media timebase.** Set to your frame rate.
- **Playback — Audio device + buffer size.** Set to your audio interface.
- **Timeline — Default Audio Tracks (set to Stereo); Default Video Tracks (3-5).**
- **Memory — Optimize for: Performance.**

Premiere has 200+ preferences; the above cover 80% of common needs.

## Keyboard shortcuts

Premiere's productivity comes from keyboard shortcuts:
- **Spacebar.** Play / pause.
- **J / K / L.** Reverse / pause / play (tap L multiple times = faster forward).
- **I / O.** Set in / out points.
- **Q / W.** Ripple trim to playhead from start / end.
- **B / V.** Blade / Selection tool.
- **A.** Track Select Forward.
- **Cmd/Ctrl + K.** Add edit at playhead.
- **Cmd/Ctrl + Z.** Undo.
- **+/-** zoom in/out timeline.
- **F.** Match frame to source.

Master 20-30 shortcuts; editing speed multiplies.

## Custom shortcuts

Premiere → Keyboard Shortcuts (Cmd+Option+K). Search for any command; assign a key.

Veteran editors customize heavily; what feels natural becomes a personal kit.

Common customizations:
- Slip / Slide tools to Y / U.
- Lift / Extract to ; and '.
- Render preview to E.

## Scratch disks revisited

Critical for performance:
- **Captured video / audio.** Where ingested media lives.
- **Project autosave.** Backup project files.
- **Cache files.** Premiere's playback cache (large; fast SSD).
- **Preview files.** Rendered previews of effects.

All on a fast SSD; ideally not the OS drive. Caches can grow to 100s of GB on long projects.

## Backup and versioning

Premiere auto-saves to a folder. But for big projects:
- **Manual save before risky edits.** Cmd+S frequently.
- **Save As versioned.** project-v01.prproj → v02 → v03. Allows rolling back.
- **External backup.** Time Machine / cloud / external drive. Project files are small; back them up.

Lose a day's work to a corruption and you'll wish you backed up.

## Source clip basics

Drag a clip from the Project panel into the Source monitor. Or double-click. The source monitor previews; doesn't change the project clip.

Spacebar plays; J/K/L for transport; I sets in-point; O sets out-point.

Drag from source to timeline to insert just the selected portion.

## The timeline anatomy

The timeline is the edit. Tracks stack:
- **Video tracks** above the dividing line (V1, V2, V3, ...).
- **Audio tracks** below (A1, A2, A3, ...).

V1 is the base; V2 sits on top; track ordering matters for compositing.

A1-A2 typically dialogue / production sound; A3-A4 music; A5-A6 SFX. Or split by character / source.

## Sequences

A sequence is a timeline. Projects have multiple sequences (different cuts, exports, scenes).

New sequence: File → New → Sequence; pick a preset matching your footage, or duplicate an existing sequence.

The active sequence shows in the timeline / program monitor.

## Project panel best practices

- **Bins for grouping.** By day / camera / type.
- **Labels (colors).** Right-click clip → Label color. Marking action / dialogue / b-roll for quick scanning.
- **Markers.** Add to clips for "use this part" notes.
- **Metadata columns.** Frame rate, duration, audio channels visible at a glance.

For 8-hour shoots with 200 clips, organization is the difference between editing and excavating.

## Common setup mistakes

- **No bins.** Hundreds of clips in one flat panel.
- **Wrong sequence frame rate.** 30fps timeline; 24fps footage; conform issues.
- **Cache on OS drive.** Performance dies as it fills up.
- **No autosave.** Crash = hours lost.
- **Default workspace forever.** Customize for your workflow.

## Summary

- Workspaces save panel layouts; Editing for general work, Color / Effects / Audio for specialization.
- Bins + labels + markers organize the project panel.
- Sequence settings must match footage (frame rate, resolution).
- Scratch disks on fast SSD; cache + autosave + preview files.
- Keyboard shortcuts compound productivity; master 20-30 baseline.
- Auto-save + manual save + versioned saves + external backup.

Next: importing and organizing media.
