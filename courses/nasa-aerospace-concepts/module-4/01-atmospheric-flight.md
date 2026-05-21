---
module: 4
position: 1
title: "Atmospheric flight + drag"
objective: "Understand flight in atmosphere."
estimated_minutes: 5
---

# Atmospheric flight + drag

## Aerodynamic forces

- **Lift.** Perpendicular to velocity.
- **Drag.** Opposing motion.
- **Thrust.** From engine.
- **Weight.** Gravity.

```
Lift = 0.5 × ρ × V² × CL × S
Drag = 0.5 × ρ × V² × CD × S
```

ρ: air density, V: speed, S: reference area.

For: flight math.

## Lift / drag ratio

L/D = efficiency. Higher = more glide.
- F-22 (supersonic): ~10.
- 737 (cruise): ~17.
- U-2 (high alt): ~24.
- Glider: ~50.

For: airplane efficiency.

## Compressible vs. incompressible

- **Mach < 0.3.** Incompressible (Bernoulli works).
- **0.3-0.8.** Subsonic compressible.
- **0.8-1.2.** Transonic (shockwaves form).
- **>1.2.** Supersonic.
- **>5.** Hypersonic (heating significant).

For: regime understanding.

## Drag types

- **Form (pressure) drag.** Shape.
- **Skin friction.** Boundary layer.
- **Induced drag.** Cost of generating lift.
- **Wave drag.** Supersonic shockwaves.

For: design knobs.

## Atmospheric density model

- Sea level: 1.225 kg/m³.
- 11 km (jet altitude): 0.36 kg/m³.
- 50 km: 0.001 kg/m³.
- 100 km (Kármán line): 0.0000006 kg/m³.

Exponential decay; effective edge of atmosphere at ~80-100 km.

For: regime selection.

## Stall

Lift drops sharply when angle of attack exceeds critical angle (~15-20°).

Airfoils designed to delay stall.

For: flight safety.

## Boundary layer

Thin layer near surface where viscosity matters:
- Laminar (smooth).
- Turbulent (chaotic; higher drag).

Flow control influences boundary layer behavior.

For: aero efficiency.

## Shockwaves

Supersonic: sudden pressure jump.
- Bow shocks form ahead of blunt bodies.
- Sonic booms heard on ground.

Aerodynamics design avoids unwanted shock losses.

For: high-speed physics.

## Hypersonic challenges

Mach 5+:
- Aerodynamic heating melts conventional materials.
- Real gas effects (ionization).
- Boundary layer instability.

Hypersonic vehicles (X-15, Hyperloop concepts, hypersonic missiles).

For: extreme regime.

## Atmospheric drag in LEO

Below ~600 km, atmosphere still drags satellites:
- ISS at 400 km: significant drag, regular reboosts.
- LEO below 200 km: deorbit within months.
- Beyond 700 km: minimal; orbits last centuries.

For: orbital lifetime.

## Mistakes to avoid

- **Treating air as constant density.** Wrong at altitude.
- **Ignoring boundary layer.** Drag estimates off.
- **Subsonic intuitions in supersonic.** Different physics.

## Summary

- Lift + drag from air movement around body.
- L/D ratio = efficiency.
- Subsonic / transonic / supersonic / hypersonic regimes.
- Atmospheric density exponentially decays with altitude.
- Drag affects LEO satellites.

Next: reentry physics.
