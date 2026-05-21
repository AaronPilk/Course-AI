---
module: 4
position: 3
title: "Physics simulations — cloth, rigid body, fluid"
objective: "Add realistic motion via simulation."
estimated_minutes: 5
---

# Physics simulations — cloth, rigid body, fluid

## Why simulate

Hand-animating cloth folds, falling objects, water splashes is impractical. Physics simulations compute the motion based on physical rules:
- Cloth drapes naturally.
- Rigid bodies collide.
- Fluid flows.

Set up the scene; let the simulation compute.

## Cloth simulation

For: clothing, flags, curtains, hair-like surfaces.

Setup:
1. Add a mesh that will become cloth (e.g., a plane subdivided 20×20).
2. Properties → Physics → Cloth → enable.
3. Add collision objects (the body the cloth will drape over): select body → Physics → Collision → enable.
4. Play timeline (Spacebar) → cloth simulates per frame.

Settings:
- **Quality.** Iteration count; more = more accurate.
- **Mass.** Cloth weight.
- **Pinning.** Vertex group to "pin" specific vertices (e.g., shirt anchored to shoulders).

## Cloth presets

Cloth panel has presets: Silk, Cotton, Leather, Denim, Rubber.

Pick a preset; tune parameters per material.

For a t-shirt: Cotton with slight modification.
For a cape: Silk with reduced mass.

## Pinning

For clothing on character:
- Create Vertex Group named "Pin".
- Assign vertices that should stay fixed (collar, sleeves, shoulders).
- In Cloth Physics → Pinning → select Vertex Group "Pin".

Pinned vertices don't simulate; they follow the underlying mesh (body movement).

## Self-collision

Cloth colliding with itself (folds crossing):
- Cloth panel → Self Collisions → enable.
- Quality higher; slower simulation.

For: thick clothing with multiple folds. Skip if not needed (faster).

## Bake simulation

For final renders:
- Properties → Cache → Bake (or Bake All Dynamics).
- Stores simulation in cache; renders consistently.
- Without baking: simulation re-runs every viewport play; slow.

Baked sim = consistent + fast playback.

## Rigid Body simulation

For: falling objects, collisions, breaking, stacking.

Setup:
1. Select object → Physics → Rigid Body → Add.
2. Set Type: Active (moves), Passive (immovable but collidable).
3. Set Shape: Box, Sphere, Convex Hull, Mesh.
4. Play timeline → objects fall + collide.

Settings:
- **Mass.** Heavier = harder to push.
- **Friction.** 0 = ice; 1 = velcro.
- **Bounciness.** 0 = no bounce; 1 = super bounce.
- **Damping.** How fast motion decays.

## Common rigid body uses

- **Collapsing structures.** Stack objects; let them fall.
- **Vehicle physics.** Cars + collisions (approximate).
- **Breaking objects.** Fracture an object via the Fracture addon; rigid body the pieces.
- **Bouncing / rolling.** Balls, dice.

## Fluid simulation

For: water, smoke, fire.

Setup:
1. Add a domain (a cube; will contain the simulation).
2. Set domain to Fluid → Domain.
3. Add flow object (the source of fluid) → Fluid → Flow → Liquid / Gas.
4. Bake the simulation.
5. Render.

Settings:
- **Resolution.** Voxel grid resolution; higher = more detail; way slower.
- **Time scale.** Speed of simulation.
- **Boundary.** Open / closed domain.

Fluid sim is the most computationally expensive simulation; expect long bake times for high resolutions.

## Smoke simulation

Same domain-flow setup but type = Gas:
- Flow emits smoke.
- Domain renders the volumetric.
- Use case: campfires, dust, fog effects.

For: scene atmosphere; spell effects; vehicle exhaust.

## Fire simulation

Gas type with Fire enabled:
- Flow + fuel + ignition.
- Renders as volumetric fire.
- Use case: candles, torches, explosions.

## Hair simulation (not addressed in 2026 Particle System; uses Geometry Nodes Hair)

For hair / fur:
- Modern Blender uses Geometry Nodes Hair System (replacing legacy Particle System).
- Create hair via Geometry Nodes Hair Curves.
- Style with combing tools.
- Simulate via Physics → Hair Curves.

Standard for character hair: Geometry Nodes Hair + simulation.

## Particle systems

For: leaves, snow, dust, sparks.

Properties → Particle System → Add.

Types:
- **Emitter.** Particles emit + move.
- **Hair.** Legacy hair (replaced by Geometry Nodes Hair).

Settings: emission rate, lifetime, gravity, wind.

## Performance and quality trade-offs

Each simulation has knobs:
- **Resolution / Quality.** More = better look; way slower.
- **Substeps.** Inner iterations; more = more accurate.
- **Cache.** Storage of results.

For: previews, lower res; for final, higher res. Or use temp cache; bake later for final.

## Cache management

Simulations stored in cache:
- Properties → Cache → File Format → Disk.
- Cache directory specified.
- Cache files can be large (GB for fluid sims).

Clean cache (Clear All Bakes) when done iterating.

## Combining simulations

Cloth + rigid body in same scene:
- Cloth (e.g., a flag) responds to wind force.
- Rigid body (e.g., a falling object) collides with cloth.
- Hair sim on the cloth.

Each simulated independently; combine for realism. Computationally heavy; bake separately.

## Force fields

For controlling simulations:
- Add → Force Field → Wind / Vortex / Magnetic / etc.
- Affects nearby physics objects.

For: wind blowing a flag, vortex sucking particles, magnetic pull on rigid bodies.

## Mistakes to avoid

- **No collision objects.** Cloth falls through floor.
- **Forgot to bake.** Render glitches as sim re-runs differently.
- **Too high resolution.** Simulation takes hours.
- **Wrong cache location.** Disk full / sim disappears.
- **No pinning.** Cloth drops to floor instead of following body.

## Summary

- Cloth simulation: drape on body, pin shoulders, set fabric type.
- Rigid body: falling, stacking, colliding objects.
- Fluid: water, smoke, fire via Domain + Flow setup.
- Particle systems for leaves, dust, sparks.
- Geometry Nodes Hair for modern character hair.
- Always BAKE simulations before final render.
- Cache management essential for storage + speed.

Next: camera animation + rendering motion.
