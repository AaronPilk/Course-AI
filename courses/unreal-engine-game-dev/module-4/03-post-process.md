---
module: 4
position: 3
title: "Post-process volumes"
objective: "Apply cinematic effects + color grading globally or per-area."
estimated_minutes: 5
---

# Post-process volumes

## What post-processing is

Post-processing = effects applied after the scene renders, before display. Like Lightroom for game frames:
- Color grading.
- Tone mapping.
- Bloom.
- Depth of field.
- Motion blur.
- Vignette.
- Lens flares.
- Film grain.

All applied per-frame; affect overall look.

## Post Process Volume

The actor that holds settings. Place in level:
- Place Actors → Volumes → Post Process Volume.
- Set Unbound = true for global effect.
- Or: set bounds (volume shape) so effect only applies inside that area.

For: per-area mood (cave = darker / cooler; outdoor = brighter / warmer); global look across level.

## Priority

Multiple Post Process Volumes can overlap. Priority determines which wins:
- Higher priority overrides lower.
- For: room-specific effects (Bedroom volume with priority 5) overriding global (priority 0).

## Effect parameters

Each parameter has:
- **Override toggle.** Whether this volume changes that parameter.
- **Value.** What the override is.

For: each volume overrides only the parameters you care about; leaves others to inherit / blend.

## Color grading

Most impactful section. Includes:
- **Saturation.** Color intensity.
- **Contrast.** Difference between brights / darks.
- **Gamma.** Mid-tone adjustment.
- **Gain.** Highlights.
- **Offset.** Shadows.
- **Temperature.** Warm / cool tint.
- **Tint.** Magenta / green.

For: cinematic look (teal & orange, vintage, bleach bypass).

## Color grading per shadows / midtones / highlights

Tone wheels: separate adjustments for:
- **Shadows.** Darks.
- **Midtones.** Mid-range.
- **Highlights.** Brights.

For: warm shadows + cool highlights = "teal & orange" cinematic look.

## Bloom

Bright pixels bleed into surroundings:
- **Intensity.** Strength.
- **Threshold.** Brightness floor.
- **Method.** Standard / Convolution.

For: lights look bright; sunlit edges glow; emissive materials cast halos.

## Tone Mapper

Maps high-dynamic-range scene to display-range output:
- **Tone Curve.** Standard ACES / Filmic. Default works well.
- **Highlights / Shadows shape.** Curves bend output.

For: avoid blown highlights (lost detail in bright areas) and crushed shadows.

## Depth of field (DoF)

Subject sharp; rest blurs:
- **Focal Distance.** Where focus is.
- **Aperture.** F-stop; lower = shallower DoF.
- **Auto-focus.** Tracks target actor.

For: cinematic shots, dialogue scenes, gameplay moments.

## Motion blur

For: fast camera moves; vehicle gameplay:
- **Amount.** Intensity.
- **Max.** Max amount.

For: realism + dynamic feel; carefully tuned to avoid sickness.

## Vignette

Dark edges:
- **Intensity.** Darkness.
- **Offset.** Distance from center.

For: focus eye to center; cinematic look.

## Film grain

Noise overlay simulating film grain:
- **Intensity.** Grain amount.
- **Size.** Grain particle size.

For: film aesthetic; reduces digital perfection.

## Lens flares

Bright bloom + ghost artifacts from intense lights:
- **Intensity.** Strength.
- **Threshold.** Light level required.

For: sunlight through windows; bright neon; dramatic lighting.

## Auto-exposure

Camera-like exposure adapting to scene brightness:
- **Method.** Manual (fixed) / Auto Exposure Histogram (adapts).
- **Min / Max Brightness.** Range.
- **Speed Up / Down.** How fast adaptation.

For: indoor → outdoor transitions; flashbang effects; eye adjustment realism.

## Look-Up Tables (LUTs)

For specific color grades:
- LUT = pre-computed color transformation.
- Load LUT into Post Process Volume's Color Grading LUT.

For: matching specific film grade; consistent look across project.

Sources: free LUT packs; paid (Lutify, Frame.io); custom.

## Per-area volumes

For atmospheric variation:
- Outdoor volume = bright + warm.
- Cave volume = dark + cool + lots of vignette.
- Boss room = high contrast + bloom.

Blend transitions smoothly via Blend Weight + Blend Radius.

## Performance considerations

Heavy post-processing costs:
- Bloom + DoF + motion blur each add GPU work.
- For mobile / low-end PC: reduce / disable.
- For high-end: tune to taste.

For: 60 FPS targets, profile post-process cost.

## Scalability settings

Per-platform post-process quality:
- Engine Scalability Settings → Post Processing → Low / Medium / High.
- Adjust per platform.

For: console runs Medium; PC runs High.

## Combining post-process

Multiple volumes blend by priority + distance:
- Player inside Cave volume → cave effects.
- Player moves to Outdoor → smooth blend over distance.

For: dynamic mood transitions; immersion.

## Mistakes to avoid

- **Heavy post-processing.** Performance crash on lower platforms.
- **Single global volume forever.** No environmental variation.
- **No tone mapper.** Blown highlights / crushed shadows.
- **No bloom.** Bright surfaces look flat.
- **Overuse of effects.** Distracting; gameplay obscured.

## Summary

- Post Process Volume = container for post-effects.
- Global (Unbound) or per-area (bounded).
- Priority for stacking; Blend for smooth transitions.
- Color grading: saturation / contrast / wheels per tone range.
- Effects: Bloom / DoF / Motion blur / Vignette / Film grain / Lens flares.
- Tone mapper: HDR scene → display range.
- LUTs for specific color grades.
- Per-area volumes for atmospheric variation.

Next: lighting + atmosphere.
