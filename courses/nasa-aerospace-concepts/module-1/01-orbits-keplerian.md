---
module: 1
position: 1
title: "Orbits and Keplerian elements"
objective: "Understand how things stay in orbit."
estimated_minutes: 5
---

# Orbits and Keplerian elements

## What an orbit is

Object falling around a body, perpetually missing the ground. Gravity pulls; tangential velocity carries past.

For Earth orbit: ~7.8 km/s at 400 km altitude (ISS).

For: intuition.

## Kepler's laws

1. **Ellipses.** Orbits are ellipses with central body at one focus.
2. **Equal areas.** Object sweeps equal areas in equal times → faster near perigee.
3. **T² ∝ a³.** Orbital period squared proportional to semi-major axis cubed.

Universal across two-body problem.

For: fundamentals.

## Six Keplerian elements

Define any orbit uniquely:
- **a (semi-major axis).** Size.
- **e (eccentricity).** Shape (0=circle, 0.99=elongated).
- **i (inclination).** Tilt vs. equator.
- **Ω (RAAN).** Where orbit crosses equator going north.
- **ω (argument of perigee).** Where lowest point is.
- **ν (true anomaly).** Where the object is now along orbit.

For: orbit parameterization.

## Orbital energy

```
E = -GM/(2a)     (specific orbital energy)
v² = GM(2/r - 1/a)   (vis-viva equation)
```

Energy determined by semi-major axis only.

For: motion math.

## Circular vs. elliptical

Circular: a constant; v constant.
Elliptical: a constant; v varies (faster at perigee, slower at apogee).

Energy same throughout orbit despite changing v + r.

For: motion characteristics.

## Period

```
T = 2π√(a³/GM)
```

ISS at 400 km: T ≈ 92 min.
GEO at 36,000 km: T ≈ 24 hours.

For: timing predictions.

## Why orbits don't decay (much)

At high altitude, atmosphere thin → minimal drag. Decay over years/centuries.

LEO (<2000 km): some drag; satellites reboost.
GEO (36,000 km): negligible; orbits last millions of years.

For: orbit lifetime.

## Mistakes to avoid

- **Treating speed as scalar.** Need vector for orbit prediction.
- **Forgetting perturbations.** Earth's J2 oblateness, Moon, Sun, solar wind.
- **Ignoring drag in LEO.** Reboost or deorbit.

## Summary

- Orbit = falling around body, missing.
- Kepler: ellipses, equal areas, T² ∝ a³.
- 6 elements (a, e, i, Ω, ω, ν) define orbit.
- Vis-viva for velocity given r + a.

Next: delta-v and transfers.
