---
module: 4
position: 1
title: "Lumetri scopes and the color workflow"
objective: "Read scopes; understand what color correction actually does."
estimated_minutes: 5
---

# Lumetri scopes and the color workflow

## Why color matters

Color does three things:
1. **Match shots.** Cameras, lenses, lighting differ; color brings shots together so the edit feels coherent.
2. **Set tone.** Warm yellow = cozy / inviting; cool teal = clinical / sad; saturated = energetic; desaturated = somber.
3. **Direct attention.** Brighter / more saturated areas pull the eye.

Color is the difference between "footage" and "look." A great edit with neglected color feels amateur. A mediocre edit with great color feels intentional.

## The color workflow

Two stages:
1. **Color correction.** Fix the footage — white balance, exposure, contrast, basic neutrality. Make every shot look "correct" / "real."
2. **Color grading.** Apply the look — teal/orange, vintage, high-contrast cinematic, etc. Make shots look "stylized."

Correction first; grading second. Skipping correction and going straight to a "look" stacks problems.

## Lumetri Color panel

Window → Lumetri Color (or Color workspace). The primary color tool in Premiere.

Sections (top-to-bottom):
- **Basic Correction.** White balance, exposure, contrast, highlights, shadows, whites, blacks, saturation.
- **Creative.** Looks (presets), faded film, vibrance.
- **Curves.** RGB + Hue/Saturation curves.
- **Color Wheels & Match.** Lift / Gamma / Gain wheels.
- **HSL Secondary.** Target specific colors.
- **Vignette.** Edge darkening.

Use top-to-bottom; correction first, creative grading later.

## Lumetri Scopes panel

Window → Lumetri Scopes. Measurement tools showing what's actually in your image.

Scopes:
- **Vectorscope.** Color distribution + saturation.
- **Histogram.** Brightness distribution.
- **Parade (RGB).** Red, Green, Blue levels across the image horizontally.
- **Waveform.** Brightness across the image horizontally.

Pro colorists work scopes-first; eyes-second. Eyes deceive (monitor calibration, ambient lighting, fatigue); scopes are objective.

## Reading the Waveform

The Waveform (YC or Luma) shows brightness:
- **Bottom.** Black point (0 IRE).
- **Top.** White point (100 IRE).
- **Middle.** Mid-tones.

The image's brightness laid out left-to-right; vertical position = brightness.

For most footage: shadows reach near 0, highlights near 100, midtones distributed. Crushed shadows (everything mashed at 0) = lost detail; blown highlights (everything mashed at 100) = lost detail.

## Reading the Parade (RGB)

Three columns: Red, Green, Blue channels.

For a NEUTRAL image (no color cast): all three channels reach similar levels at black, white, and midpoints.

Color casts visible: if Blue's black point is higher than Red's, image has a blue tint in shadows. Lift Red shadows to match; cast removed.

## Reading the Vectorscope

Polar plot of color information:
- **Center.** No saturation (gray).
- **Outer edge.** Maximum saturation.
- **Angle.** Hue (Red, Magenta, Blue, Cyan, Green, Yellow).

For natural skin tones: the cluster sits on the "I-line" (the line from center toward 10-11 o'clock).

For neutral images: most data clusters near center.

For graded looks: data extends along specific axes intentionally.

## Reading the Histogram

Brightness distribution histogram:
- **Left.** Darks.
- **Right.** Lights.
- **Height.** Number of pixels at that brightness.

A balanced exposure has data spread across the range. Skewed left = underexposed; skewed right = overexposed; clipping at edges = lost detail.

## White balance correction

If footage has a blue cast (cool / tungsten light shot as daylight):
1. Open Lumetri Color → Basic Correction.
2. Find a neutral area (gray, white) in the image.
3. Click the white balance eye-dropper.
4. Click that neutral area.
5. Premiere shifts color temperature + tint to make that area truly gray.

Or manually adjust Temperature (warm/cool) and Tint (green/magenta).

## Exposure correction

For under- or over-exposed footage:
- **Exposure slider.** Lifts or lowers overall brightness.
- **Highlights / Shadows.** Surgical recovery (pull highlights down; lift shadows up).
- **Whites / Blacks.** Sets the brightest / darkest points.

Goal: image's brightness range fills the scope (shadows near 0, highlights near 100) without clipping.

## Contrast control

Contrast = difference between brights and darks.

- **Contrast slider.** Increases or decreases.
- **Curves.** Surgical contrast (lift shadows + drop highlights = lower contrast; opposite = higher).

For most footage: increase contrast slightly (modern cameras shoot flat for grading flexibility; output needs more contrast).

## Saturation

Saturation = color intensity.

- **Saturation slider.** Overall control.
- **Vibrance** (in Creative section). Boosts less-saturated colors more than already-saturated; protects skin tones.

For most footage: slight boost (5-15) to make colors pop without looking unnatural.

## Matching shots

Two shots from different cameras or different lighting:
1. Open both clips in adjacent timeline positions.
2. Use Comparison View (Lumetri's two-up preview).
3. Compare scopes side-by-side.
4. Adjust one clip's parameters to match the other's scope.
5. Toggle to A/B compare on monitor.

For multi-camera or shot-on-different-days footage: shot-matching is essential for sequence cohesion.

Color Match feature: select reference shot → click Match in Lumetri → Premiere AI-guesses parameters.

## Color Match (AI)

Color Wheels & Match → Color Match section:
- **Comparison View** on monitor (toggle).
- Pick reference clip + target clip.
- Apply Match → Premiere auto-aligns target to reference.

Useful starting point; not always perfect; refine manually.

## Working from RAW or LOG

If footage shot in LOG profile (S-Log, V-Log, ARRI LOG, RED Log3G10):
- Image looks washed out / low contrast by default.
- Apply a LUT to convert to standard color (Rec 709) — Lumetri → Basic → LUT.
- After LUT: footage looks "normal"; apply further correction.

For RAW (R3D, BRAW): same approach; LUT brings to standard color space.

## Output color space

For YouTube / web: Rec. 709 (standard HD).
For HDR: Rec. 2020 PQ or HLG (much wider; HDR-capable displays).

Set in sequence settings → Color → Working color space.

Match delivery target; mismatched color space = wrong colors on viewers' screens.

## Master clip color

Apply color correction to the master clip in Project panel (right-click → Color in Project) → applies to all instances of that clip in any sequence.

For consistent color across multiple uses of the same clip: master clip color is the move.

## Saving Lumetri presets

Tune a look; save: Lumetri panel → submenu → Save Preset.

Apply later: drag preset onto clip.

For a YouTube channel with a consistent look: save once, apply forever.

## Mistakes to avoid

- **No scopes; eyes only.** Subjective; inconsistent; affected by monitor.
- **Grade before correcting.** Stacks problems.
- **Over-saturated.** Looks unnatural; cheap.
- **Crushed shadows.** Lost detail; muddy look.
- **Clipped highlights.** Blown-out skies; ugly.

## Summary

- Color workflow: correction first (real), grading second (stylized).
- Lumetri Color panel: top-down workflow (Basic → Creative → Curves → Wheels → HSL → Vignette).
- Lumetri Scopes (Vectorscope, Histogram, Parade, Waveform) are objective; trust scopes over eyes.
- White balance: eye-dropper on neutral area.
- Exposure / contrast / saturation surface controls.
- Match shots via Color Match AI + manual scope-matching.
- LUTs convert LOG / RAW to standard.
- Save presets for consistent looks.

Next: primary correction.
