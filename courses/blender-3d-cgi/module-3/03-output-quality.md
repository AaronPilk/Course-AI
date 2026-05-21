---
module: 3
position: 3
title: "Output settings and image quality"
objective: "Configure render output for delivery."
estimated_minutes: 5
---

# Output settings and image quality

## Resolution

Output Properties → Format:
- **Resolution X / Y.** Pixels.
- **Percentage.** Multiplier (50% = half resolution; useful for quick previews).
- **Aspect.** Pixel aspect ratio (almost always 1:1).

Common targets:
- **1920×1080.** HD. YouTube, social media, web.
- **3840×2160.** 4K UHD. Premium delivery.
- **7680×4320.** 8K. Cinema / future-proofing.
- **1080×1920.** Vertical 9:16. TikTok, Reels.
- **2480×3508.** Print A4 at 300 DPI.

## Frame rate

For animation:
- **24 fps.** Cinematic.
- **30 fps.** YouTube / web standard.
- **60 fps.** Smooth motion / sports.
- **120 fps.** Slow-motion source / high-end.

Match playback target.

## Frame range

Animation: Start Frame + End Frame.

For 30 sec at 24 fps: 1-720.
For 10 sec at 60 fps: 1-600.

## File format

Output Properties → Output → File Format:
- **PNG.** Lossless; great for stills + composite-ready frames.
- **OpenEXR.** Lossless HDR; preserves linear color + extra passes; standard for film/VFX.
- **JPEG.** Lossy; smaller files; for web previews only.
- **TIFF.** Lossless; for print delivery.
- **FFmpeg (video).** For direct video output.

For animation:
- Render frames as PNG sequence; convert to video later in Premiere / FFmpeg / Blender's Video Sequencer. NOT direct video output (slower iteration; if crashes mid-render, you lose everything).

For finals:
- **EXR.** Production / film.
- **PNG.** Web / general.
- **TIFF.** Print.

## Color management

Render Properties → Color Management:
- **View Transform.** Filmic (default 2026; natural-looking); Standard (simpler); AgX (newer 2024+, broader color handling).
- **Look.** Contrast variants (Medium Contrast, High Contrast, Low Contrast, None).
- **Exposure.** Brighter / darker overall.
- **Gamma.** Mid-tone adjustment.

For most: Filmic with Medium Contrast Look. Natural-looking; preserves highlights.

For stylized: Standard or custom Look.

## Output path

Output Properties → Output → File path. Where renders save.

For animation: include #### in filename for frame numbers (e.g., `//renders/frame_####.png`).

Set to a fast SSD with plenty of free space (8K animation = many GB).

## Compression settings

For PNG: 100% quality (lossless).
For JPEG: 90-95% for delivery; 70-80% for previews.
For EXR: Lossless or DWA compression (DWA: smaller files with minimal quality loss).

## Render passes

Cycles can output multiple passes per frame:
- **Combined.** Standard final image.
- **Diffuse / Specular.** Separate light contributions.
- **Volume / Ambient Occlusion.** Specific contributions.
- **Depth (Z).** Distance from camera; for DoF in post.
- **Normal.** Surface normals; for relighting in compositor.
- **Mist.** Distance fog.
- **Object Index / Material Index.** Per-object / -material masks.

Enable via View Layer Properties → Passes.

For flexible compositing: render multipass; combine + adjust in Compositor.

## Render samples vs. output quality

More render samples = less noise; but doesn't directly equal higher resolution / quality.

Resolution sets pixel count; samples set rendering noise. Both matter.

Don't confuse: high samples + low resolution = clean but small image. Low samples + high resolution = noisy big image.

Balance: both appropriate for the deliverable.

## Tile output

For animation: Persistent Data caches between frames (covered last lesson).

For separate frames: each is a discrete render.

For tile-by-tile: Cycles renders one tile at a time; not parallel without GPU or render farm.

## Render Time prediction

Render → Render Image → status bar shows estimated time.

For animation: estimate per-frame; multiply.

Or: render 1 frame to see actual time; multiply.

## Color spaces

In Color Management: working color space, render color space, output color space.

- **Linear sRGB.** Working / render space (mathematically correct).
- **sRGB.** Display / output space (gamma-corrected for monitors).

Filmic / AgX handle these transforms; output PNG / JPEG / web-ready content.

For VFX integration with film: ACES color space (set Color Management → Color Space).

## HDR vs. SDR

- **SDR.** Standard Dynamic Range. JPEG / PNG / standard web.
- **HDR.** High Dynamic Range. HDR10, Dolby Vision. EXR / PNG-HDR.

For most delivery: SDR.
For premium TV / OLED phones: HDR (limited adoption still).

## Test render

Always: test render a small frame BEFORE committing to a long render.

- Resolution: 50%.
- Samples: lower.
- 1 frame of an animation.

Verify:
- Composition.
- Lighting.
- Materials.
- Color.
- Anything obviously broken.

A 5-minute test prevents 5-hour failed final renders.

## Animation: video vs. frames

For animation delivery:
- **Frames (PNG / EXR sequence).** Render to individual files. If crash: resume from last completed frame. Combine to video later.
- **Direct video.** Render to MP4 directly. If crash: lose progress. Faster final step.

Standard pro practice: frames sequence + assemble. Crash-resilient.

## Compositing in post

After rendering: Compositor + Video Sequencer for:
- Color grading.
- Lens distortion.
- Glow / bloom.
- Vignette.
- Animation tweaks.

Some artists do post in Blender's Compositor; others export to DaVinci Resolve / After Effects.

## Resolution scaling

Render at higher resolution; downscale in post = sharper image (effective supersampling).

Example: render at 4K; deliver at 1080p; final looks sharper than rendering directly at 1080p.

Trade-off: 4x render time. For high-stakes stills: worth it.

## Mistakes to avoid

- **Direct video render for animation.** Lose progress on crash.
- **Wrong resolution for target.** Pillarboxed / stretched delivery.
- **Wrong color space.** Final looks washed out / over-saturated.
- **No test render.** Discover problems after long renders.
- **Render path on a slow drive.** Storage bottleneck.

## Summary

- Resolution + frame rate + file format = output configuration.
- PNG / EXR for image stills + animation frames; FFmpeg for direct video.
- Filmic + Medium Contrast as default color management.
- Render passes for compositing flexibility.
- Test render at 50%, 1 frame before committing to full render.
- Animation = frame sequence (crash-resilient); not direct video.
- 4K render → 1080p delivery for sharper finals.

Next: compositing and post in Blender.
