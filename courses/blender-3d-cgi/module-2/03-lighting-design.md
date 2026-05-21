---
module: 2
position: 3
title: "Lighting design — three-point and beyond"
objective: "Light scenes for clarity, mood, and intentionality."
estimated_minutes: 5
---

# Lighting design — three-point and beyond

## Why lighting matters

Without good lighting, even great models look flat and lifeless. Lighting:
- Defines form (shadows reveal shape).
- Sets mood (warm/cool, harsh/soft).
- Directs attention (bright areas pull the eye).
- Establishes time + place (golden hour, midnight, indoor).

Lighting is 50% of perceived quality. Master it.

## Light types in Blender

Shift+A → Light:
- **Point.** Omnidirectional from a point. Like a bare bulb.
- **Sun.** Parallel rays from a direction. Like sunlight (infinitely far).
- **Spot.** Cone of light from a point. Like a flashlight or stage spot.
- **Area.** Light emitted from a 2D area. Soft, photo-style lights.

Each has Color + Strength (Power) + Size.

## Power values

Lights measured in Watts (rough analog to real-world bulbs):
- Candle: ~10W.
- Light bulb: ~60W.
- Desk lamp: ~100W.
- Studio strobe: ~500-1000W.
- Sun (Sun light): different unit (in Cycles, strength in W/m²; sun ~6.5 W/m² at 1.0 strength).

Adjust to taste; physical realism is a guide, not a constraint.

## Three-point lighting

Classic studio / film lighting setup:
- **Key light.** Main light; typically front-side at 30-45°. Defines the subject's primary illumination.
- **Fill light.** Opposite side of key; weaker (1/2 to 1/4 of key power). Softens shadows on the non-key side.
- **Rim / Back light.** Behind subject, pointing toward camera. Defines edges; separates subject from background.

For portraits, character renders, product shots: three-point as starting point.

## Key light placement

- **Side (45°).** Dramatic; strong shadows; classic Hollywood look.
- **Front (10-20°).** Flat; less dramatic; cosmetics / glamour photography.
- **Top.** Dramatic shadows down the face; horror / noir.
- **Bottom.** Unsettling; rarely used.

Match key light angle to mood.

## Light size and softness

Area lights:
- **Small.** Hard shadows; defined edges.
- **Large.** Soft shadows; diffused; flattering.

For portraits: large area lights (soft skin) are flattering.
For drama: small lights (hard shadows) are punchy.

Adjust size in light properties.

## Color temperature

Lights have color:
- **Warm (2000-3000K).** Reddish; candlelight, incandescent bulbs, golden hour.
- **Neutral (4500-5000K).** Daylight.
- **Cool (6000-10000K).** Bluish; midday sun, shade, fluorescent.

For mood:
- Warm key + cool fill = "magic hour" / sunset.
- Cool key + warm fill = clinical / mysterious.
- Same-temperature lights = neutral / documentary feel.

## HDRI lighting

HDRI = High Dynamic Range Image. A panoramic image used as environment lighting.

Setup:
- World Properties → Background → Sky Texture or Environment Texture → load HDRI.
- The scene now receives lighting from all directions based on the HDRI.

HDRIs include:
- **Outdoor.** Sunset, midday, sunrise, overcast.
- **Studio.** Various photo studio setups.
- **Architectural.** Interior spaces.

For product / architectural renders: HDRI alone often suffices. For characters / scenes: HDRI + 1-2 supplemental lights.

Source: PolyHaven (free), HDRIHaven, BlenderKit, Adobe Stock.

## Light linking (light collection visibility)

Some lights affect only specific objects; others affect the whole scene.

In Object Properties → Visibility → Ray Visibility, lights can be excluded from specific cycles passes.

For surgical lighting: rim light affects only the subject; key light affects everything.

## Shadow control

Each light has shadow settings:
- **Cast shadows.** Toggle on/off (usually on).
- **Shadow softness.** Bigger light = softer shadows.
- **Shadow color.** Usually black; some artistic uses for colored shadows.

Cycles renders shadows physically (no need to tune); Eevee approximates (more parameters).

## Indoor scenes

Indoor lighting strategy:
- **Window light.** Strong directional from one side (sun via window).
- **Ambient bounce.** HDRI in window or environment fill.
- **Practical lights.** Lamps in the scene (model + light).
- **Hidden fill.** Off-camera lights filling shadows where needed.

For realistic indoor renders: model the actual light sources visible in the scene.

## Outdoor scenes

- **Sun light.** Directional; harsh shadows.
- **Sky color.** World environment for ambient.
- **Bounce.** Surrounding surfaces add color to shadows (ground bouncing light up under subjects).
- **Atmosphere.** Volumetric fog / haze for depth.

Sun + Sky is the foundation; rest fills in.

## Multiple shots — consistent lighting

For a sequence of renders / shots:
- Same lights; reposition subjects.
- Or: light each shot for its mood.

For animation: lights stay (mostly); subjects + camera move.

For still illustrations: relight per composition.

## Light setup workflow

1. **Sketch the lighting intent.** Direction, mood, key light position.
2. **Set HDRI or sky.** Provides ambient.
3. **Place key light.** Front-side angle; check shadow direction.
4. **Add fill.** Reduces shadow harshness on opposite side.
5. **Add rim / back.** Edge highlight; separation from background.
6. **Tune intensity + color.** Iterate based on render previews.
7. **Final adjustments.** Practical lights (lamps), accent lights, mood lights.

Each step takes minutes to set up; the iteration is the work.

## Specular highlights

Where light reflects directly off shiny surfaces. Position lights so highlights fall in the right places:
- Bridge of nose for portraits.
- Top of eyeballs for life.
- Edge of metal objects for definition.

For specific specular control: spot lights positioned for the desired highlight.

## Cycles vs. Eevee lighting

- **Cycles.** Path tracing; physical light simulation; slow but photorealistic.
- **Eevee.** Rasterization; real-time; faster but less accurate.

Module 3 covers rendering choice. For lighting design: same principles; Eevee approximates Cycles' look but with limitations.

## Studio renders

For product / character pinups:
- Studio HDRI (or 3-light setup).
- Soft area lights.
- Neutral background.
- Heavy depth of field.

For organic / scene-driven renders:
- Natural lighting (sun + sky).
- Practical lights (lamps in scene).
- Complex shadows.
- Less DoF.

## Mistakes to avoid

- **One light, harsh shadows.** Flat, dramatic, often wrong.
- **All same color.** No mood.
- **All same intensity.** No hierarchy of attention.
- **No fill on shadow side.** Subject lost in dark.
- **No rim.** Subject blends into background.

## Summary

- Light types: Point, Sun, Spot, Area; each has Color + Strength + Size.
- Three-point lighting: Key + Fill + Rim is the foundation.
- Larger lights = softer shadows; smaller lights = harder.
- Color temperature creates mood (warm/cool, golden hour vs. midday).
- HDRI environment lighting for fast natural-feeling setups.
- Practical lights (model the visible lamps in the scene) for indoor realism.
- Iterate via render previews.

Next: cameras and composition.
