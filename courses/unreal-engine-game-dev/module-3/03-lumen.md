---
module: 3
position: 3
title: "Lumen — dynamic global illumination"
objective: "Get film-quality lighting in real-time without baking."
estimated_minutes: 5
---

# Lumen — dynamic global illumination

## What Lumen is

Lumen is UE5's real-time global illumination system. It computes how light bounces between surfaces dynamically, without precomputed lightmaps.

Before Lumen: indirect lighting required baking (computing offline; storing in lightmaps; lengthy build times; static lights only).

With Lumen: dynamic lights cast indirect bounce lighting instantly. Move a light, change time of day, modify environment — lighting updates in real-time.

This is film-quality lighting at game frame rates.

## What "global illumination" means

Direct lighting: light from source hitting surface directly.

Global illumination (GI): light bouncing off surfaces and lighting other surfaces. The red wall reflects red light onto the floor; the sky bounces blue onto the ceiling.

GI is what makes scenes feel "real" rather than "lit by spotlights."

## Lumen vs. baked lighting

**Baked lightmaps (legacy):**
- Compute offline; store per-texel data.
- Long build times (hours for complex levels).
- Static lights only.
- Memory-efficient at runtime.

**Lumen (UE5):**
- Real-time; no build.
- Dynamic lights supported.
- More expensive per frame.
- Quality approaches baked but iterates much faster.

For 2026 projects: Lumen by default; baked lighting legacy.

## Lumen features

- **Diffuse Indirect.** Color bouncing off surfaces.
- **Specular Indirect.** Reflections on surfaces.
- **Emissive Mesh Lighting.** Meshes with emissive materials emit light.
- **Sky Lighting.** Atmosphere contribution.
- **Direct Lights.** Standard lights enhanced with Lumen GI.

All work together for full GI.

## Enabling Lumen

Project Settings → Rendering → Global Illumination → Lumen.
Plus: Reflections → Lumen.

Default for new UE5 projects.

For migrating: change setting; rebuild lighting (if previously baked).

## Lumen quality settings

Engine Scalability → Lumen quality:
- **Low.** Performance focus; lower quality.
- **Medium.** Balance.
- **High / Epic.** Quality focus; more GPU.

For: per-platform tuning. Console / mobile = Low/Medium; PC = High/Epic.

## Hardware ray tracing (HWRT) vs. software (SWRT)

Lumen offers two paths:

**Software (SWRT, default):**
- Uses screen-space + distance fields for ray tracing.
- Works on any modern GPU.
- Performance: good on most hardware.

**Hardware (HWRT):**
- Uses GPU ray tracing hardware (RTX 4070+, equivalent AMD).
- Higher quality reflections + GI.
- More expensive performance.

Choose based on target hardware. Consoles can switch between.

## Lumen for indoor vs. outdoor

Lumen excels both:
- **Indoor.** Light bounces between walls; rooms feel inhabited.
- **Outdoor.** Sun + sky bounce; foliage shadows; mountain glow.

For: realistic environments without baking time.

## Sky atmosphere + Lumen

Place actor: Sky Atmosphere (or use included Sky Sphere Blueprint).

Lumen samples the sky for ambient color throughout scene. Time of day = automatic ambient color shifts.

For: golden hour scenes; night scenes with moon lighting; day-night cycles.

## Emissive meshes and Lumen

Meshes with emissive materials (e.g., LED screens, neon signs, glowing crystals) emit light onto surroundings via Lumen.

Workflow: 1) Material with high emissive value. 2) Apply to mesh. 3) Lumen automatically picks it up and casts light from the surface.

For: ambient atmospheric lighting; sci-fi glow effects; environmental storytelling.

## Performance considerations

Lumen is GPU-intensive:
- 4K + High quality + many lights = expensive.
- Mid-range GPUs (RTX 4060, RX 7600) may need Medium quality at 1080p.
- High-end (RTX 4070+, RX 7800 XT+) handle High quality at 1440p comfortably.

Tune based on target hardware; performance > quality for 60 FPS targets.

## Light limits

Lumen handles unlimited lights but per-frame cost compounds. Best practices:
- **Few key lights.** Each light costs.
- **Most lights movable.** Static still benefits from Lumen (free baking).
- **Hierarchical light importance.** Most-affecting lights at highest quality.

For: huge dynamic scenes, profile light costs.

## Lumen + Nanite synergy

Lumen reads Nanite's geometry for ray tracing. The combination:
- Nanite handles detail.
- Lumen handles indirect lighting on that detail.
- Both update real-time.

For: realistic environments at any detail level.

## Reflections

Lumen Reflections:
- **Screen-space.** Cheaper; works for visible surfaces.
- **Probes / Lumen GI.** Captures world reflections via the Lumen Scene.
- **Hardware ray-traced.** Highest quality if GPU supports.

For: dynamic mirrors, water reflections, polished floors.

Switch quality in Lumen settings.

## Sky light vs. Sun light

- **Directional Light.** The sun. Strong directional shadows.
- **Sky Light.** Ambient + reflections from sky.

For UE5 + Lumen: use both. Directional for direct light; Sky Light for ambient.

Default scenes include both.

## Sky atmosphere + height fog

For atmosphere:
- **Sky Atmosphere actor.** Physically-based sky model.
- **Height Fog actor.** Atmospheric fog density vs. altitude.
- **Volumetric Cloud actor.** Procedural 3D clouds.

These combined with Lumen + Sun = real-world atmospheric look.

For: realistic outdoor scenes; epic landscapes.

## Lumen Scene

A view of the world that Lumen uses for ray tracing. Updates in real-time.

Toggle visualization: View → Lumen Scene → shows what Lumen sees.

For debugging GI: switch to Lumen Scene view; identify under-illuminated areas.

## Light leaks

Sometimes Lumen has light leaks (light passing through walls). Fix:
- **Thicker geometry.** Walls > 5cm typically; thin walls leak.
- **Proper collision.** Lumen uses distance fields; complex thin geometry has gaps.
- **Reduce Lumen Range.** Less far-distance leakage.

For: high-quality interior scenes, address thin geometry.

## Real-world examples

UE5 Lumen showcases:
- **The Matrix Awakens demo.** Dynamic city lighting.
- **Hellblade II.** Cinematic indirect lighting.
- **Black Myth: Wukong.** Atmospheric forests + caves.

Each iterates on Lumen + Nanite + virtual texturing.

## Mistakes to avoid

- **Disabling Lumen without testing.** Often required for modern visuals.
- **Heavy Lumen quality on low-end target hardware.** Performance crash.
- **No Sky Atmosphere setup.** Flat sky = flat ambient.
- **Thin walls causing leaks.** Thicken or add inner shells.
- **Over-emission meshes.** Lumen interprets as light source; can blow out.

## Summary

- Lumen = real-time global illumination; replaces baked lightmaps for UE5 projects.
- Dynamic lights, indirect bounce, emissive mesh lighting, sky atmosphere — all real-time.
- Software ray tracing default; hardware ray tracing on capable GPUs.
- Combines with Nanite for AAA real-time visuals.
- Tune quality per target platform.
- Use Lumen Scene visualization for debugging.

Next: performance.
