---
module: 2
position: 1
title: "Tsiolkovsky rocket equation"
objective: "Master the fundamental equation of rocketry."
estimated_minutes: 5
---

# Tsiolkovsky rocket equation

## The equation

```
Δv = Isp × g₀ × ln(m₀/mf)
```

Where:
- Δv: delta-v achievable.
- Isp: specific impulse (seconds).
- g₀: 9.81 m/s².
- m₀: initial mass (with propellant).
- mf: final mass (after burn).

For: fundamental constraint.

## Specific impulse (Isp)

Engine efficiency in seconds.
- **Chemical (kerosene + LOX).** ~280-340 s (Falcon 9).
- **Chemical (LH2 + LOX).** ~440 s (Space Shuttle).
- **Methane + LOX.** ~330 s (Starship Raptor).
- **Hypergolic (N2O4 + UDMH).** ~310 s.
- **Solid rocket.** ~250 s.
- **Ion (xenon).** ~3,000 s but very low thrust.
- **Nuclear thermal.** ~900 s, in development.

For: engine selection.

## Mass ratio

m₀/mf is the mass ratio. Rocket equation says delta-v grows logarithmically with mass ratio.

90% propellant = 10× ratio = 2.3 × Isp×g₀ delta-v.

For: design tradeoff.

## Why staging

Single stage cannot reach orbit:
- Need ~9.4 km/s for LEO.
- Best chemical Isp ~440 s gives ~4.3 km/s per "ln 2.3" mass ratio.
- Empty rocket mass dominates if carried entire ascent.

Stages drop dead mass:
- Stage 1: lift off ground.
- Stage 2: into orbit.
- Optional 3rd for deep space.

For: practical rocketry.

## Falcon 9 example

Mass ratio per stage ~10 (90% propellant).

Stage 1: 280 s Isp → 6.3 km/s
Stage 2: 348 s Isp → 7.8 km/s
Total: ~14 km/s capability vs. ~10 km/s needed → margin for payload + losses.

For: real numbers.

## Gravity losses

Rocket burns vertical thrust to fight gravity. Real delta-v needs > vacuum:
- LEO: ~9.4 km/s actual delta-v + 1.5 km/s gravity loss → ~10.9 km/s.

For: realistic budget.

## Tyranny of the rocket equation

Each additional capability requires exponentially more fuel.

To Mars + return: ~14+ km/s. With chemical, mass ratio explodes; multiple stages.

Why we haven't been to Mars: cost of fuel.

For: limit understanding.

## Cost per kg to LEO

- Saturn V (1969): ~$50,000/kg.
- Space Shuttle: ~$54,500/kg.
- Falcon 9 (reused): ~$2,700/kg.
- Starship (target): ~$10/kg.

100× reduction over 50 years; 5000× target.

For: economic context.

## Mistakes to avoid

- **Calculating without staging.** Implausible mass ratios.
- **Ignoring gravity losses.** Underestimate fuel.
- **Wrong Isp for engine.** Wrong delta-v prediction.

## Summary

- Tsiolkovsky: Δv = Isp × g × ln(m₀/mf).
- Higher Isp → more delta-v from same mass.
- Mass ratio dominates; staging required.
- Chemical Isp limit ~440 s; ion 3000 s but low thrust.

Next: chemical engines.
