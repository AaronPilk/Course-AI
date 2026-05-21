---
module: 1
position: 2
title: "Importing and organizing media"
objective: "Get footage into Premiere predictably; keep it findable."
estimated_minutes: 5
---

# Importing and organizing media

## Three import paths

1. **File → Import** (Cmd+I). Pick files / folders; Premiere catalogs them.
2. **Media Browser panel.** Premiere-aware file browser; previews clips before import.
3. **Drag from Finder/Explorer.** Drop into the Project panel.

Media Browser is the pro choice — previews clips, handles camera-specific formats (RED, ARRI, Sony XAVC), respects clip relationships.

## What "import" actually does

Premiere doesn't copy your files into the project. It creates references — pointers to the original files on disk.

This means:
- Moving / renaming source files breaks references (offline media).
- Project files (.prproj) are tiny (under 100 MB even for large projects).
- Multiple projects can reference the same files.

For long-term archiving: use Project Manager (covered later) to consolidate.

## Where to store source files

Best practice:
- **One project folder.** All files (sources + project + exports) under it.
- **Subfolders by type.** `01_footage/`, `02_audio/`, `03_graphics/`, `04_project/`, `05_exports/`.
- **Date / camera / day naming.** Day_1_Cam_A_2026-05-15.

Move the whole folder = project still works (Premiere finds relative paths).

## Native vs. transcoded

For modern footage:
- **H.264 / H.265 (most consumer cams).** Premiere plays natively but with GPU cost.
- **ProRes / DNxHD.** Higher quality intermediate; better playback performance.
- **RAW (R3D, ARRI, BRAW, ProRes RAW).** Highest quality; biggest files; sometimes need transcoding.

For long-form 4K projects, transcoding to ProRes or DNxHR (Adobe's equivalent) accelerates editing. For short-form / simple projects, native usually works.

## Proxies — Premiere's solution to high-res

Proxies = low-res versions Premiere plays during editing, swapping in high-res for export.

Setup:
- Right-click clip(s) → Proxy → Create Proxies.
- Pick preset (typically 1/4 resolution, ProRes Proxy).
- Premiere uses Adobe Media Encoder to generate.

Toggle proxy mode in Program monitor → wrench icon → Toggle Proxies. Smooth playback even on modest hardware.

Export uses originals automatically.

## Media Encoder

Adobe Media Encoder (AME) is Premiere's render/encode engine. Used for:
- **Proxy generation.**
- **Export.**
- **Watch folders.**
- **Custom encoding.**

Premiere sends jobs to AME; AME processes in background; you can keep editing.

For solo workflows: AME is essential for big exports running while you work on the next project.

## File formats Premiere handles

In 2026, Premiere supports almost everything:
- **Video.** ProRes, H.264, H.265, AV1, DNxHR, RED (R3D), ARRI (ARRIRAW), Blackmagic (BRAW), Sony XAVC, Panasonic AVC-Intra.
- **Audio.** WAV, AAC, MP3, AIFF.
- **Image.** PNG, JPG, TIFF, EXR, PSD, AI.
- **Graphics.** MOGRT (Motion Graphics Template).

Some formats need codec downloads (RED, BRAW historically needed plugins; now native).

## Multicam clips

For multiple cameras filming same event:
- Sync clips by timecode, audio waveform, or in/out markers.
- Right-click → Create Multi-Camera Source Sequence.
- In timeline, the multicam clip lets you cut between angles live (1 / 2 / 3 / 4 keys = camera switch).

Useful for interviews (wide + tight), podcasts (multiple speakers), events.

## Subclips

For a long clip with multiple usable sections:
- Set in / out points on the section.
- Right-click → Make Subclip (or Cmd+U).
- Subclip appears in Project panel, independent of original.

Helps organize "this part of clip is the wide shot, this part is the dolly move."

## Markers in source clips

Open clip in source monitor → press M during playback → marker added at playhead.

Markers transfer when clip is placed on timeline.

Use to flag: "best take starts here," "great reaction at 1:23," "skip ums."

## Metadata

Right-click clip → Metadata Display (or Window → Metadata).

Visible fields: name, frame rate, audio channels, duration, scene, shot, take, description, log notes.

Fill in for big projects; helps search later.

## Searching

Project panel → search box at top. Filters by name, label, metadata.

For 500+ clips: search is faster than scrolling.

## Production Assistant / Ingest

Some workflows ingest footage off camera cards into Premiere directly:
- **Open Project panel → Ingest settings.**
- **Set destination + format (transcode at ingest).**
- **Drag clips from Media Browser → Premiere copies + transcodes + adds to project.**

For multi-camera shoots: ingest sets the entire production up at the start.

## Camera-specific gotchas

**Sony XAVC.** Multi-format files; ensure entire card structure is copied (not just MP4 files).

**RED R3D.** Premiere reads natively; LUTs from camera carried via metadata.

**ARRI ALEXA.** Wide gamut + LogC color space; needs grading.

**BRAW.** Native in recent Premiere; full RAW control via Blackmagic settings.

**iPhone / Pixel.** HEIC + HEVC (H.265); Premiere supports but some older systems struggle.

## Offline media

If source files move / rename / get disconnected, Premiere shows "Media Offline." Red placeholders in the timeline.

Fix: Project panel → right-click → Link Media → point to current location. Premiere re-establishes references.

For network drives that disconnect: link media after reconnecting.

## Project Manager

For archive / handoff:
- File → Project Manager.
- Pick sequences.
- Options: Collect Files (copies referenced + consolidates), Transcode (creates new high-res or proxy), Trim (only used portions).

Outputs a clean folder with everything needed; great for handoff to colorist, archive, or another editor.

## Backup external drive

Editors back up source media + project files to an external drive on completion.

Storage isn't free; 1TB drives are $50; lose work = $thousands. Backup is cheap insurance.

## Mistakes to avoid

- **Source files scattered everywhere.** Some on desktop, some on external, some in Downloads.
- **No subfolder structure.** Hundreds of files at root.
- **Importing duplicate files.** Same clip in multiple bins; confusing.
- **No proxies for 4K+.** Editing stutters; productivity tanks.
- **No metadata.** Search returns nothing.

## Summary

- Media Browser (not File → Import) is the pro path; previews + format awareness.
- Premiere references files; doesn't copy. Move source files = offline.
- Bins + labels + markers + metadata organize the project panel.
- Proxies enable 4K / 6K / 8K editing on modest hardware.
- Media Encoder handles proxy generation + export jobs.
- Project Manager consolidates for archive / handoff.

Next: sequences, settings, and the timeline.
