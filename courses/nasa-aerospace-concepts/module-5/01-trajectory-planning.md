---
module: 5
position: 1
title: "Trajectory planning"
objective: "Design a path from Earth to destination."
estimated_minutes: 5
---

# Trajectory planning

## Patched conics

Simplify n-body to series of 2-body problems:
- Earth-departure: 2-body Earth.
- Coast in heliocentric: 2-body Sun.
- Arrival: 2-body destination.

"Patches" at sphere-of-influence boundaries.

Used by JPL for decades.

For: analytical planning.

## Software tools

NASA uses:
- **GMAT.** Open-source trajectory designer.
- **STK (Systems Tool Kit).** Commercial AGI.
- **MONTE.** JPL internal.
- **Trajectory Browser (NASA Ames).** Online.

For: real planning.

## Launch energy (C3)

C3 = v²_∞ where v_∞ is excess velocity beyond Earth escape.
- LEO: C3 < 0 (orbit-bound).
- Lunar transfer: C3 ≈ -1.8 km²/s².
- Mars: C3 = 8-14 km²/s² depending on year.
- Jupiter: C3 = 80+ km²/s².

For: launcher capability matching.

## Launch windows

Limited times to launch:
- Earth + destination must be in right positions.
- Mars window every 26 months (2024, 2026, 2029, etc.).
- Jupiter window every 13 months.

Miss the window → wait years.

For: scheduling pressure.

## Interplanetary transfers

Standard: Hohmann between planet orbits:
- Earth-Mars Hohmann: 9 months one way.
- Earth-Jupiter: 6 years.
- Earth-Neptune: 30+ years.

Gravity assists shorten by trading delta-v for time.

For: realistic durations.

## Voyager grand tour

Late 1970s: planetary alignment every 175 years let Voyager 2 visit Jupiter + Saturn + Uranus + Neptune in 12 years.

Without alignment: would take centuries.

For: rare opportunities.

## Lambert's problem

Given two positions + transfer time, find trajectory:
```
Position1, Position2, Δt → orbit
```

Lambert solver = key algorithm in trajectory design.

For: math foundation.

## DRO + NRHO (lunar gateway)

- **DRO (Distant Retrograde Orbit).** Stable around Moon.
- **NRHO (Near-Rectilinear Halo Orbit).** Elliptical, halo at Earth-Moon L2.

NASA Lunar Gateway uses NRHO. Easier access to Moon + Mars.

For: modern lunar architecture.

## Mars sample return

Multi-mission:
1. Perseverance collects samples.
2. Future MAV (Mars Ascent Vehicle) launches samples to Mars orbit.
3. ERO (Earth Return Orbiter) catches + returns.
4. Sample container reenters Earth.

Each step trajectory critical.

For: complex multi-spacecraft.

## Ballistic capture

Alternative to Hohmann: low-energy capture via Lagrange dynamics. Saves fuel; longer transit.

Used: GRAIL (twin moon orbiters).

For: chaotic trajectories.

## Mistakes to avoid

- **Ignoring launch window.** Reschedule years.
- **Not accounting for arrival geometry.** Mission fails on arrival.
- **Underestimating perturbations.** Mid-course correction needed.

## Summary

- Patched conics simplify 3-body to series of 2-body.
- C3 measures escape energy.
- Launch windows govern departure timing.
- Hohmann for transfers; gravity assists shorten.
- DRO + NRHO emerging for lunar architecture.

Next: launch windows + ops.
