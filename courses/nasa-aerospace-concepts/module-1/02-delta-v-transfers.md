---
module: 1
position: 2
title: "Delta-v and orbital transfers"
objective: "Move from one orbit to another."
estimated_minutes: 5
---

# Delta-v and orbital transfers

## What delta-v is

Change in velocity. Measured in m/s. The "currency" of orbital maneuvering.

Each engine firing changes orbit by adding delta-v. Total delta-v capability = rocket equation × fuel.

For: mission budgeting.

## Hohmann transfer

Most fuel-efficient between two circular orbits:
1. Burn at orbit 1 to enter transfer ellipse.
2. Coast to opposite side.
3. Burn again to circularize at orbit 2.

Two burns. Half orbit transfer time.

Standard for most missions.

For: efficient transfers.

## Delta-v for Hohmann

```
Δv1 = √(μ/r1) × (√(2r2/(r1+r2)) - 1)
Δv2 = √(μ/r2) × (1 - √(2r1/(r1+r2)))
Δv_total = Δv1 + Δv2
```

Example: LEO → GEO costs ~3.9 km/s.

For: planning fuel needs.

## Bi-elliptic transfer

Three burns; lower delta-v than Hohmann for very different orbit sizes (r2/r1 > 11.94).

Trade: longer time for less fuel.

For: extreme transfers.

## Plane change

Changing orbital plane requires:
```
Δv = 2 × v × sin(Δi/2)
```

90° plane change at LEO: ~10 km/s. Expensive!

Better: combine plane change with altitude change.

For: cost awareness.

## Delta-v budget

For Mars mission:
- LEO to LEO escape: ~3.2 km/s.
- Trans-Mars injection: ~3.7 km/s.
- Mars orbit insertion: ~2.1 km/s.
- Total: ~9 km/s from LEO.

Plus Mars EDL (entry, descent, landing) → 1+ km/s.

For: realistic budgets.

## Gravity assists

Use planet's gravity to gain (or lose) velocity:
- Voyager: Jupiter assist → +10 km/s.
- New Horizons: Jupiter assist → +14,000 mph.
- Parker Solar Probe: 7 Venus flybys to get close to Sun.

Free delta-v.

For: deep-space efficiency.

## Aerobraking + aerocapture

Use planet's atmosphere instead of fuel:
- **Aerobraking.** Multiple passes through upper atmosphere, slowly lowering orbit.
- **Aerocapture.** Single pass, captured immediately.

Saves significant fuel; risky.

Mars Reconnaissance Orbiter used aerobraking.

For: alternative to retro burn.

## Mistakes to avoid

- **Naive sum of delta-vs.** Inefficient.
- **Forgetting plane change cost.** Major expense.
- **Ignoring gravity losses during burn.** Real cost > vacuum delta-v.

## Summary

- Delta-v = orbital maneuvering currency.
- Hohmann standard, bi-elliptic for extreme.
- Plane changes expensive; combine with altitude.
- Gravity assists give "free" delta-v.
- Aerobraking saves fuel.

Next: Lagrange points.
