---
module: 4
position: 3
title: "Secondary grading and LUTs"
objective: "Target specific colors and apply cinematic looks."
estimated_minutes: 5
---

# Secondary grading and LUTs

## Secondary vs. primary

Primary corrections affect the WHOLE image — every pixel.

Secondary corrections target SPECIFIC parts — a color range (skin tones, sky), a region (vignette, masked area), or a luminance band (shadows only).

After primary correction sets the baseline, secondary refines: "make the sky bluer," "warm up just skin tones," "darken the corners."

## HSL Secondary

Lumetri Color → HSL Secondary. The main tool for targeting colors.

Workflow:
1. **Key.** Click the eye-dropper; click the color you want to target (e.g., subject's blue shirt).
2. Premiere creates a mask of pixels matching that color.
3. **Adjust ranges.** Hue / Saturation / Luminance sliders refine the mask (expand or contract the selection).
4. **Output.** Adjust Temperature / Tint / Contrast / Saturation / Sharpness ON THE MASKED AREA ONLY.
5. **Toggle B/W mask preview** to see exactly what's being affected.

For surgical color changes: HSL Secondary is the tool.

## Targeting skin tones

Common workflow:
1. HSL Secondary.
2. Eye-dropper on subject's skin.
3. Range adjusts (skin tones span a hue band).
4. Add slight saturation, slight warm tint → skin glows without affecting the rest.

For multi-person interviews where one person has too-orange skin: target that person's specific skin tone; pull back.

## Targeting sky

For dull skies:
1. HSL Secondary; eye-dropper on sky.
2. Refine to include only blues (exclude bluish skin tones).
3. Increase saturation + slight push toward cyan + brighten.

Result: sky pops without affecting subjects.

## Targeting brand colors

For product shots:
1. HSL Secondary; eye-dropper on the brand color.
2. Adjust saturation + hue.

For consistent brand color across all product shots: one HSL Secondary preset.

## LUTs (Look-Up Tables)

A LUT is a mathematical transformation that maps input colors to output colors. Two types:
- **Technical LUTs.** Convert color spaces (e.g., S-Log3 → Rec. 709). Used in primary correction.
- **Creative / Look LUTs.** Apply a stylized look (e.g., "Teal & Orange," "Vintage Film," "Bleach Bypass").

Creative LUTs are the fastest way to apply a "look" without manual curves.

## Applying a LUT

Lumetri Color → Creative → Look → dropdown.

Or import custom LUT: Look → Browse → select .cube / .3dl file.

Then adjust Intensity slider (0-100%) to control strength.

## Where to get LUTs

- **Premiere built-in.** Dozens of looks in the dropdown.
- **Free LUT packs.** Many on YouTube creator sites; varying quality.
- **Paid LUT packs.** Lutify.me, Color Grading Central, Filmconvert, Cinematic Color.
- **Custom.** Save your own grade as a LUT (advanced).

For YouTubers wanting "cinematic" looks fast: paid LUT packs ($30-80) give consistent results.

## LUT intensity

Don't max out — looks at 100% are often over-the-top. 30-60% intensity blends the look with the original; more natural.

Pro habit: apply LUT at 80%; tune to taste.

## LUTs come AFTER correction

LUTs assume correctly-exposed, color-balanced input. Applying a LUT to uncorrected footage produces unpredictable results.

Correct first; then LUT for stylization.

## The Creative section

Lumetri Color → Creative panel has:
- **Look.** LUT selector.
- **Intensity.** Strength of LUT.
- **Faded Film.** Lifted blacks; vintage film look.
- **Sharpen.** Edge enhancement.
- **Vibrance.** Smart saturation.
- **Saturation.** Direct saturation boost.

Beyond LUTs, these sliders provide quick stylization.

## Curves for grading

Beyond corrective curves, creative curves:
- **Hue vs. Saturation curve.** Adjust saturation per hue. Pull saturation of reds up while desaturating yellows; selective color treatment.
- **Hue vs. Hue.** Shift one hue to another (greens → cyan; reds → orange).
- **Hue vs. Luma.** Brighten reds; darken blues.
- **Luma vs. Saturation.** Saturate midtones; desaturate shadows + highlights.

These create the "looks" of high-end commercials and films.

## Color Wheels

Lift / Gamma / Gain wheels:
- **Lift.** Affects shadows.
- **Gamma.** Affects midtones.
- **Gain.** Affects highlights.

Drag the center dot to push colors. Classic move: warm Lift (orange shadows) + cool Gain (blue highlights) = "teal & orange" complementary look.

Sliders below wheels for fine-tuning.

## The teal & orange look

Hollywood's go-to:
1. Warm skin tones (Lift toward orange).
2. Cool everything else (Gain toward blue/teal).
3. Result: skin tones pop against a cool background.

Done via:
- LUT preset.
- Or manually: Color Wheels (lift orange, gain teal) + HSL Secondary (boost skin tones).

Effective; can be overused.

## Vignette

Lumetri Color → Vignette section. Adds dark edges:
- **Amount.** -1 to +1; negative = darker edges.
- **Midpoint.** Where the vignette begins.
- **Roundness / Feather.** Shape.

For drawing eye to center; common in cinematic looks.

Use subtly — heavy vignettes look amateur.

## Masking for region-specific grades

For grading specific regions:
1. Apply Lumetri Color effect.
2. Use Effect Controls → Mask (the shape icon: ellipse, rectangle, pen).
3. Draw mask around the area.
4. Adjustments inside Lumetri apply only within the mask.

For: brightening a subject's face; darkening a distracting background; targeted color shift in part of frame.

Combine with mask tracking (next): mask follows subject across frames.

## Mask tracking

After drawing a mask: Effect Controls → mask → Track Forward (or Backward).

Premiere AI-tracks the mask through the clip. For a face mask: follows the head.

For dynamic subjects: tracked masks let region-specific grades follow movement.

## Stacked Lumetri

Apply multiple Lumetri Color instances to a clip:
- Lumetri 1: primary correction.
- Lumetri 2: HSL Secondary (skin tones).
- Lumetri 3: Creative LUT for look.

Each is separate; reorder via drag in Effect Controls. Modular grading workflow.

## Saving Lumetri presets

Tune a complete grade (primary + secondary + creative). Save: Lumetri panel → submenu → Save Preset.

Apply to other clips: drag from Effects panel.

For a YouTube channel with consistent look: one preset = consistent grade across episodes.

## Mistakes to avoid

- **LUT without correction.** Unpredictable.
- **LUT at 100% always.** Looks over-cooked.
- **No mask preview.** HSL Secondary affecting more than intended.
- **Heavy vignette.** Amateur tell.
- **One grade for entire sequence.** Some shots need surgical adjustment.

## Summary

- Secondary = targeted (HSL Secondary, masks, curves on hue ranges).
- HSL Secondary: eye-dropper on color; refine mask; adjust output.
- LUTs apply stylized looks fast; intensity slider for taste.
- Color Wheels (Lift/Gamma/Gain) for traditional grading.
- Hue vs. Saturation / Hue / Luma curves for creative looks.
- Masks for region-specific grades; track for moving subjects.
- Save presets for consistency.

Next: titles, lower thirds, Essential Graphics.
