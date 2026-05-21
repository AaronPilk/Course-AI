---
module: 3
position: 2
title: "Thermal: extreme temperature swings"
objective: "Manage spacecraft temperatures."
estimated_minutes: 5
---

# Thermal: extreme temperature swings

## Space thermal environment

- Sunlight: 1,361 W/m² at Earth.
- No air conduction; only radiation.
- Cold side: -180°C in deep shadow.
- Hot side: +120°C in sunlight.
- Cycle every ~90 min in LEO → expansion fatigue.

For: thermal range.

## Heat transfer in space

Only two paths:
- **Radiation.** Emit IR to space.
- **Conduction.** Internal between components.

No convection (no atmosphere).

For: physics constraint.

## MLI (Multi-Layer Insulation)

Spacecraft "blanket":
- 15-25 layers of aluminized Mylar.
- Each layer reduces radiation.
- Total insulation 1000× single layer.

Wraps most of spacecraft.

For: passive insulation.

## Radiators

Reject heat to space:
- Aluminum or composite panels.
- Optical surface (white paint, OSR) high emissivity in IR.
- Sized for max heat load.

ISS has large external radiators.

For: heat rejection.

## Heat pipes

Transport heat via working fluid evaporation/condensation:
- Heat source: fluid evaporates.
- Cold end: condenses.
- Capillary action returns liquid.

Passive; no moving parts.

For: thermal redistribution.

## Heaters

Active heating for cold components:
- Resistive heaters with thermostat.
- Critical for electronics, propellant lines.
- Often 10-30% of power budget.

For: cold-side survival.

## Thermal cycling

LEO satellite: 5,000 orbits/year × 90-min cycles = 450,000 thermal cycles in 10 years.

Material expansion/contraction fatigues:
- Solder joints.
- Bonded connections.
- CTE mismatches.

For: reliability concern.

## Sun-pointing spacecraft

Always one face to sun → simpler thermal design:
- Cold side has radiators.
- Hot side has solar panels.

Most science missions point sun-side.

For: typical attitude.

## Cryocoolers

For cold instruments (telescopes):
- Mechanical: pulse tube, Stirling cryocoolers.
- Passive: thermal radiators to space.

JWST instruments at 50 K (passive); MIRI at 7 K (cryocooler).

For: ultra-cold needs.

## TPS (Thermal Protection System) for reentry

Atmospheric reentry: kinetic energy → heat (10,000°C+ plasma):
- Ablative shields (Apollo).
- Tile shields (Shuttle).
- Stainless steel + active cooling (Starship test).
- PICA-X (Dragon).

For: returning safely.

## Mistakes to avoid

- **Forget edges + bolted joints.** Heat leaks.
- **Undersized radiators.** Overheating.
- **No heaters on propellant lines.** Freeze + fail.

## Summary

- Space thermal: radiation + conduction only; no convection.
- MLI blanket for insulation.
- Radiators reject heat to space.
- Heaters protect cold-sensitive parts.
- TPS for reentry.

Next: ADCS.
