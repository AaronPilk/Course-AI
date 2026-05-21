---
module: 5
position: 2
title: "Export presets and platform delivery"
objective: "Export the right file for every destination — YouTube, social, broadcast."
estimated_minutes: 5
---

# Export presets and platform delivery

## The export workflow

When the edit is locked:
1. Sequence selected.
2. File → Export → Media (Cmd+M).
3. Pick preset + tune settings.
4. Choose: Export (direct) or Send to Media Encoder (queue; keep editing).

For multiple exports (different platforms): Media Encoder lets you queue all and walk away.

## Codec basics

Codec = compression algorithm. Common choices:
- **H.264.** Universal; YouTube + most platforms; widely supported.
- **H.265 (HEVC).** Better compression than H.264 at same quality; less universal but increasingly standard.
- **AV1.** Newer; even better compression; growing platform support; slower encode.
- **ProRes.** Apple's intermediate codec; near-lossless; large files; great for archive / re-edit.
- **DNxHR.** Avid's equivalent of ProRes.

For YouTube / social delivery: H.264 or H.265.
For archive / handoff: ProRes / DNxHR.

## Container

The wrapper around the codec. Common:
- **.mp4.** H.264 / H.265 commonly; universal.
- **.mov.** ProRes / DNxHR / H.264; QuickTime.
- **.mxf.** Broadcast standard.

For most consumer delivery: .mp4 with H.264.

## Resolution

Match your sequence (typically):
- **1920×1080 (HD).** Standard for most YouTube.
- **3840×2160 (4K UHD).** Premium YouTube / streaming.
- **7680×4320 (8K).** Emerging; bandwidth-heavy.
- **1080×1920 (vertical 9:16).** TikTok / Reels / Shorts.
- **1080×1080 (square).** Instagram feed.

## Frame rate

Match sequence (typically):
- **23.976 / 24.** Cinematic / film.
- **29.97 / 30.** Standard YouTube / TV.
- **59.94 / 60.** Smooth motion / sports.
- **25 / 50.** Pal (Europe broadcast).

Mismatch → conversion → quality loss. Match sequence to output.

## Bitrate

How much data per second of video. Higher = better quality + bigger file.

Two modes:
- **CBR (Constant Bitrate).** Same throughout.
- **VBR (Variable Bitrate).** Adjusts based on content complexity.

VBR is standard for most delivery. Within VBR:
- **1-pass.** Faster encode; quality varies.
- **2-pass.** First pass analyzes; second encodes optimally. Slower but better quality.

For final delivery: 2-pass VBR.

## YouTube recommended bitrates

YouTube's recommendations (2026):
- **1080p 24/30.** 8 Mbps.
- **1080p 60.** 12 Mbps.
- **1440p 24/30.** 16 Mbps.
- **1440p 60.** 24 Mbps.
- **4K 24/30.** 35-45 Mbps.
- **4K 60.** 53-68 Mbps.
- **8K 24/30.** 80-160 Mbps.

These are recommendations; YouTube re-encodes at upload regardless. Aim for the recommended; higher is wasted bandwidth.

## H.264 vs. H.265 for YouTube

H.264 has been the YouTube standard for years; universal.
H.265 (HEVC) produces same quality at ~40% lower bitrate; great for upload bandwidth.

For uploads: either works; YouTube re-encodes. H.265 saves upload time on slower connections.

## Audio settings

- **Codec.** AAC (universal) or sometimes PCM (lossless).
- **Sample Rate.** 48000 Hz (broadcast standard).
- **Bit Rate.** 320 kbps stereo AAC (high quality); 192 kbps acceptable.

For most delivery: AAC 320 kbps. Don't compress audio more than necessary.

## Color space

- **Rec. 709.** Standard HD; default for most delivery.
- **Rec. 2020 PQ.** HDR; needs HDR-capable target.
- **DCI-P3.** Cinema; rare for web.

Match your delivery platform; mismatched color space = wrong colors on viewers' screens.

## Platform-specific presets

Premiere ships with presets for:
- **YouTube.** 1080p / 4K / 8K HD.
- **Vimeo.** Similar to YouTube.
- **Facebook.** 1080p; slightly different bitrate.
- **Instagram.** Multiple sizes (square, story, reel).
- **TikTok.** 1080×1920 9:16.
- **Twitter/X.** 1080p.
- **Apple Devices.** iPhone / iPad / Apple TV optimized.
- **Broadcast.** Various delivery formats.

Pick the closest preset; tune if needed.

## Custom presets

Tune settings; save as preset (gear icon → Save Preset).

For repeated workflows: one preset for "YouTube channel masters"; another for "Instagram Reels"; another for "client delivery."

Apply via Preset dropdown in Export panel.

## Multiple exports at once

For one sequence → multiple deliverables:
1. Add Output (+ button in Media Encoder queue).
2. Choose different preset per output.
3. Click Start Queue.
4. AME exports all in turn; walk away.

Common for social campaigns: 16:9 YouTube + 9:16 Reels + 1:1 Instagram from same source.

## In/out points for partial export

For exporting a section:
- Set in/out points on timeline.
- Export → Range → Sequence In/Out (not Entire Sequence).
- Only the in/out range exports.

For exporting selected clips: select clips → Export → Range → Selected.

## Export quality vs. speed

- **Hardware Encoding (use hardware acceleration).** Modern GPUs + Apple Silicon encode H.264/H.265 much faster than CPU. Almost always enable.
- **Quality.** Higher (slower) vs. Lower (faster). For final: Highest. For dailies / preview: Medium.

For most YouTube creators: Hardware Encoding on, Quality high, 2-pass VBR.

## Verify the export

Before delivering:
- **Play the exported file** end-to-end. Catch artifacts, sync issues, encoding errors.
- **Check audio levels** with audio meters during playback.
- **Spot-check color** on a calibrated display.
- **Compare to source** for any unexpected changes.

A 30-min video deserves a 30-min verification.

## Color management gotchas

If sequence is HDR but export is SDR: tone-mapping happens; can produce unexpected results.

If sequence is 4K but export is 1080p: downscaling; resolution lost.

If sequence is 24fps but export is 30fps: pulldown conversion; potential judder.

For consistency: match sequence to export targets where possible.

## Compress for upload

For uploading to platforms (YouTube, Vimeo) that re-encode anyway:
- Higher bitrate at upload = better post-re-encode quality.
- But upload time vs. quality trade-off.
- Sweet spot: YouTube's recommended bitrate + 50% headroom.

For HDR or low-light content: even higher bitrate to preserve detail through re-encoding.

## Closed captions / subtitles

Premiere's captions:
- Create new caption track: File → New → Captions.
- Generate auto-captions (AI): right-click clip → Speech to Text.
- Edit, verify, time-correct.
- Burn-in (visible on video) or sidecar (separate .srt file).

For YouTube: sidecar .srt or .vtt; YouTube ingests both.

For social: burn-in (so captions visible without taps to enable).

## Delivery checklist

Before shipping:
- [ ] Right resolution + frame rate.
- [ ] Color space matches target.
- [ ] Audio levels at platform target (-14 LUFS YouTube).
- [ ] Captions / subtitles included.
- [ ] Title-safe / action-safe respected.
- [ ] No clipping in audio.
- [ ] No frozen frames / dropped frames.
- [ ] File size reasonable for platform.

## Mistakes to avoid

- **Wrong resolution for platform.** Pillarboxed YouTube; cropped Instagram.
- **Bitrate too low.** Compression artifacts.
- **Bitrate way too high.** Wasted upload bandwidth; same final quality.
- **Hardware encoding off.** Slow export for no reason.
- **No verification.** Errors ship to final delivery.

## Summary

- Export = Cmd+M; pick codec / container / resolution / frame rate / bitrate.
- H.264 / H.265 for delivery; ProRes / DNxHR for archive.
- Platform-specific presets cover most cases.
- 2-pass VBR for final; 1-pass for previews.
- Hardware encoding on; massively faster on modern GPUs.
- Multiple outputs from one sequence via Media Encoder queue.
- Verify exports before delivery.

Next: Team Projects and collaborative editing.
