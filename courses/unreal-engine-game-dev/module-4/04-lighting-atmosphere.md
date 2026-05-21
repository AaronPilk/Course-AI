---
module: 4
position: 4
title: "Lighting and atmosphere"
objective: "Bring scenes to life with realistic light + sky + fog."
estimated_minutes: 5
---

# Lighting and atmosphere

## Lighting fundamentals

Light gives form, mood, attention:
- **Direct light.** From a light source.
- **Indirect light.** Bouncing off surfaces (via Lumen).
- **Ambient.** Sky / environment.

Combination creates the scene's perceived realism.

## Light actor types

**Directional Light:** the sun. Parallel rays from a direction. Strong shadows.

**Point Light:** light bulb. Omnidirectional. Cheap.

**Spot Light:** flashlight. Cone of light from a point. Direction + cone angle.

**Rect Light:** studio panel. Light from a 2D rectangle. Soft shadows.

**Sky Light:** ambient lighting from the sky.

Each has Intensity, Color, Attenuation Radius (Point / Spot / Rect), Direction (Directional / Spot).

## Light Mobility

Same as static meshes:
- **Static.** Light position + properties fixed; doesn't change at runtime. Bakeable.
- **Stationary.** Position fixed; some properties (color, intensity) can change. Indirect bounce baked; direct dynamic.
- **Movable.** Everything can change. Full dynamic; no baking; Lumen handles.

For UE5 + Lumen: Movable is increasingly common; less need for baking.

## Light units

Intensity measured in:
- **Lumens.** Real-world units for point lights.
- **Lux.** Real-world for area lights / sun.
- **Unitless.** Default; arbitrary brightness.

For physically-based: lumens (e.g., 60W bulb = ~800 lumens; LED bulb = ~1000 lumens).

For art-driven: unitless; tweak to taste.

## Color temperature

Lights have color:
- **Tungsten / Incandescent.** 2700-3200K (warm yellow).
- **Fluorescent.** 4000-5000K (neutral).
- **Daylight.** 5500-6500K (neutral blue tint).
- **Shade / Overcast.** 6500-10000K (blue).

For: realistic time-of-day; ambient color; mood.

## Directional Light setup

For sun:
- Place Directional Light.
- Rotation = sun direction.
- Intensity = 75,000 lux (full daylight) to ~110,000 (intense midday).
- Color = warm (sunset) to cool (midday).

For: outdoor scenes; cast strong directional shadows.

## Sky Light setup

For ambient:
- Place Sky Light.
- Captures from world or specified HDRI.
- Used for ambient + reflections.

For Lumen scenes: Sky Light captures from Sky Atmosphere; updates dynamically.

## Sky Atmosphere

The physically-based sky:
- Place Sky Atmosphere actor.
- Realistic atmospheric scattering (blue sky, sunset colors, twilight).
- Reacts to Directional Light (sun position changes sky).

For: realistic outdoor scenes; dynamic time of day.

## Volumetric Cloud

For 3D clouds:
- Place Volumetric Cloud actor.
- Procedural clouds with density + altitude.
- Real-time lighting from sun.

For: cinematic sky; landing aircraft over clouds; sky shots.

## Exponential Height Fog

For atmosphere / depth:
- Place Exponential Height Fog actor.
- Fog density vs. altitude.
- Volumetric Fog option for sun shafts + light bleed.

For: misty mornings; depth perception; mood.

## Light Attenuation

Point / Spot / Rect lights fall off with distance:
- **Attenuation Radius.** How far the light reaches.
- **Source Radius.** Light's physical size (softer shadows for larger).
- **Soft Source Radius.** For light bleeding.

For: small candle = small radius + low intensity; bonfire = larger radius + higher intensity.

## Light shadows

- **Cast Shadows.** Toggle.
- **Shadow Resolution Scale.** Quality.
- **Cast Static / Dynamic Shadows.** Type.
- **Source Size.** For soft shadows (Rect lights).

For artistic control: tune per light.

## Light Channels

For per-actor light filtering:
- Light has channels (0-7).
- Actor has channels (matching).
- Light only affects actors with matching channel.

For: lighting interior vs. exterior selectively; gameplay-specific light visibility.

## Indirect lighting

Lumen handles this automatically:
- Light bounces off surfaces; surfaces glow with that color.
- Emissive meshes act as light sources.

For: realistic interiors where light bounces between walls.

## Atmospheric scattering

Light traveling through fog / atmosphere:
- **Sun shafts.** Light beams through trees / windows.
- **Volumetric Fog.** Enables sun shaft visibility.

For: dramatic lighting; mood.

## Time of day systems

For dynamic day-night cycle:
- Directional Light rotation animated.
- Sky Atmosphere reacts.
- Sky Light auto-updates from atmosphere.
- Post-process changes over time (warmer at sunrise / sunset).

For: open-world games with continuous time progression.

## IES Profiles

For: realistic light shapes from real fixtures.

Import IES files; assign to Point / Spot / Rect lights. Provides accurate light distribution patterns.

For: archviz; movie sets; realistic interior lighting.

## Indoor lighting

For interiors:
- **Windows.** Directional Light + Sky Light bouncing in.
- **Practical lights.** Visible bulbs / fixtures providing local light.
- **Bounce light.** Lumen handles indirect bounces.

For realistic interiors: model the visible light sources; let Lumen handle the rest.

## Outdoor lighting

- **Sun.** Directional Light at appropriate angle (golden hour: ~30° from horizon; midday: ~60°).
- **Sky.** Sky Light + Sky Atmosphere.
- **Clouds.** Optional Volumetric Cloud.
- **Fog.** Optional Height Fog for atmosphere.

For: full daylight outdoor scenes; UE5 defaults cover most needs.

## Specular highlights

Where shiny surfaces reflect bright sources:
- **Light's specular contribution.** Some lights can be specular-only.
- **Material roughness.** Smooth = stronger highlights.

For: defining shapes via reflections.

## Mistakes to avoid

- **One light source only.** Flat lighting.
- **Way too many lights.** Performance cost.
- **No Sky Light.** Shadow areas pitch black.
- **All same color temperature.** Neutral / no mood.
- **No atmospheric effects.** Cold + clinical look.

## Summary

- Light types: Directional (sun), Point (bulb), Spot (flashlight), Rect (panel), Sky.
- Mobility: Static / Stationary / Movable. With Lumen, Movable is more common.
- Sky Atmosphere + Volumetric Cloud + Height Fog for realistic atmosphere.
- Color temperature (2700-10000K) sets mood.
- Three-point lighting principles (Key + Fill + Rim) apply to game scenes.
- Lumen handles indirect bounce automatically.
- IES Profiles for accurate fixture lighting.
- Indoor: practical lights + sky bounce. Outdoor: sun + sky + atmosphere.

Module 5 next: gameplay framework + shipping.
