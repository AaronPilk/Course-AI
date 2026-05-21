---
module: 4
position: 2
title: "Primary correction — white balance, contrast, saturation"
objective: "Fix every shot to a neutral baseline before grading."
estimated_minutes: 5
---

# Primary correction — white balance, contrast, saturation

## What primary correction is

Primary correction = global adjustments to make a shot "look right" — neutral colors, correct exposure, sensible contrast, natural saturation.

It's the foundation. Grading (Module 4 Lesson 3 + 4) is the creative layer on top. Without primary correction, grading stacks on broken footage.

## Order of operations

1. **Input LUT** (if log/RAW footage).
2. **White balance.**
3. **Exposure / Whites / Blacks** (set the dynamic range).
4. **Contrast / Highlights / Shadows** (shape the midtones).
5. **Saturation / Vibrance.**

Top-to-bottom in Lumetri's Basic Correction panel; mirror this order in your work.

## White balance — eye-dropper

If there's a clearly neutral area in the frame (white shirt, gray wall, white paper):
1. Lumetri Color → Basic Correction → click the eye-dropper next to White Balance.
2. Click the neutral area.
3. Premiere shifts Temperature + Tint so that area reads as truly neutral.

For most footage with a recognizable neutral: this single click fixes the cast.

## White balance — manual

If no neutral area:
- **Temperature.** Drag left (cooler / blue) or right (warmer / yellow).
- **Tint.** Drag left (green) or right (magenta).

Watch the Parade scope: balance the channels at the gray-point.

For tungsten light shot as daylight (orange cast): cool down + slight green tint correction.

For shade or overcast (blue cast): warm up.

## Exposure

Sets overall brightness.
- **+1.00** = double brightness (one stop up).
- **-1.00** = half brightness (one stop down).
- **±0.30** = subtle 1/3 stop adjustments.

For under-exposed footage: +0.5 to +1.0.
For over-exposed: -0.5 to -1.0.

Watch the histogram / waveform: data should span the range without clipping.

## Whites and Blacks

Set the extremes:
- **Whites.** Brightest pixel's level. Pull up to push highlights closer to 100; pull down to recover detail.
- **Blacks.** Darkest pixel's level. Pull down to deepen shadows; pull up to recover detail.

The classic move:
- Whites slightly up (~+5 to +15).
- Blacks slightly down (~-5 to -15).

Result: image spans the full range; feels punchy without clipping.

## Highlights and Shadows

Surgical mid-range adjustments:
- **Highlights.** Affects the upper midtones to highlights region. Pull down to recover bright detail (clouds, faces in bright light); pull up to push.
- **Shadows.** Affects the lower midtones to shadows. Pull up to lift dark detail (faces in shadow); pull down for deeper shadows.

Classic recovery move:
- Highlights down (-20 to -50): recovers bright skies, faces near windows.
- Shadows up (+20 to +50): brings out detail in dark areas.

For HDR-style "flat" looks: shadows up + highlights down dramatically. For high-contrast cinematic: opposite.

## Contrast

Single slider — overall darks vs. brights difference.

- **+15 to +30** for typical "boost" after flat-shot footage.
- **-15 to -30** for low-contrast / hazy look.

Most modern cameras shoot in "flat" / log mode (lower contrast for grading flexibility); contrast boost is standard in correction.

## Curves (alternative to sliders)

Lumetri → Curves → RGB Curves. Drag points to shape brightness:
- **S-curve.** Drop shadows a bit, raise highlights a bit → adds contrast in a "filmic" way.
- **Lift shadows.** Single point pulled up in the lower-left → recovers shadow detail.
- **Roll-off highlights.** Single point pulled down in upper-right → soft highlight recovery.

Curves give surgical control beyond sliders. Pro colorists use curves heavily.

## RGB Curves (color correction)

Curves panel has separate Red, Green, Blue curves:
- **Lift Red in shadows.** Removes blue cast from shadows.
- **Drop Blue in highlights.** Removes blue tint from skies.
- **Lift Green in midtones.** Adds warmth or removes magenta cast.

Color correction via channel-curves is surgical; you can address casts in specific brightness regions without affecting others.

## Saturation

Overall color intensity. +20 boosts; -20 desaturates.

For most modern footage: slight boost (+10 to +20) after correction. Cameras tend toward subdued; viewers prefer punchy.

## Vibrance

Smarter saturation — boosts under-saturated colors more than already-saturated, and protects skin tones.

Default in Creative section: drag Vibrance for natural boost without skin going orange.

Use Vibrance over Saturation for portraits / interviews; Saturation for landscape / abstract.

## Skin tones

Skin tones are the most important color in most footage — viewers notice errors immediately.

The "I-line" on the Vectorscope (a diagonal line from center toward 10-11 o'clock) is where natural skin tones sit. Vectorscope cluster on the I-line = skin tones correct.

For skin tones off the I-line: white balance is wrong; correct.

For surgical skin tone work: HSL Secondary (next lesson).

## Match shots to a reference

For shot continuity:
1. Pick a "hero" reference shot from the sequence.
2. Open Comparison View on monitor (toggle Comparison icon).
3. Show reference + current shot side-by-side.
4. Adjust current shot's parameters until scopes (and eyes) match reference.

Tools that help:
- **Color Wheels & Match → Color Match.** AI-driven auto-match (covered next lesson).
- **Apply Match.** One-click apply.
- **Manual tweak.** Refine.

## Save grade as preset

After tuning a clip, save as preset for similar shots:
- Lumetri menu → Save Preset.
- Name: "Interview Wide - corrected" or "Outdoor day - corrected."
- Apply to other similar clips: drag preset from Effects panel.

For long projects with consistent setups: presets save hours.

## Adjustment layers for sequence-wide grades

Apply primary correction once on an Adjustment Layer covering the whole sequence:
- New Item → Adjustment Layer (or right-click in Project panel).
- Drop on V2 (above all clips).
- Apply Lumetri Color to the Adjustment Layer.
- Effects propagate to all clips below.

For overall grade tweaks: one place to adjust; no per-clip changes.

## Working in Color workspace

Window → Workspaces → Color. Premiere arranges panels for color work: Lumetri Color, Lumetri Scopes, Comparison View prominent.

Pro habit: switch to Color workspace for the grading pass; back to Editing for cuts.

## When primary correction is enough

For many YouTube / corporate / interview projects: primary correction is the entire grade. Neutral, balanced, slightly contrast-boosted, slightly saturated.

Not every project needs a stylized "look." Sometimes "looks real and good" is the entire goal.

## Mistakes to avoid

- **Skipping correction; jumping to grade.** Stacked problems.
- **No scope verification.** Eyes deceive.
- **Over-saturated skin tones.** Orange faces; amateur.
- **Crushed shadows.** Lost detail; muddy.
- **Clipped highlights.** Lost detail; harsh.
- **No reference shot.** Every clip looks different; sequence feels inconsistent.

## Summary

- Primary correction = global fixes to a neutral baseline.
- Order: LUT (if needed) → White Balance → Exposure / Whites / Blacks → Contrast / Highlights / Shadows → Saturation / Vibrance.
- White balance eye-dropper on neutral area (single click fix).
- Whites + slight, Blacks - slight = punchy without clipping.
- Skin tones on I-line of Vectorscope.
- Use Vibrance over Saturation for portraits (protects skin).
- Adjustment Layers for sequence-wide grades; presets for similar shots.

Next: secondary grading and LUTs.
