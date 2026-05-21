---
module: 4
position: 2
title: "Reentry physics"
objective: "Survive coming back from space."
estimated_minutes: 5
---

# Reentry physics

## Reentry velocities

- From LEO: ~7.8 km/s.
- From Moon: ~11 km/s.
- From Mars: ~5.7 km/s.
- From interplanetary: 12-30 km/s.

Kinetic energy → must dissipate as heat.

For: severity scale.

## Energy to dissipate

```
E = 0.5 × m × v²
```

A 5000 kg capsule at 7.8 km/s: ~150 GJ kinetic energy.

Equivalent: 35 tons of TNT.

For: thermal scale.

## Aerodynamic heating

Reentry produces plasma at 10,000°C+. Vehicle skin reaches 1,500-3,000°C.

Mechanism: compression heating (not friction, mostly).

Bow shock heats air; convection + radiation to vehicle.

For: physics fact.

## Heat shield strategies

- **Ablation.** Material vaporizes, carrying heat away (Apollo, Mars rover backshells).
- **Insulating tiles.** Ceramic non-conductive (Shuttle).
- **Reusable surfaces.** Metal + thermal protection (Starship target).
- **Liquid-cooled.** Some hypersonic experiments.

For: TPS options.

## Reentry trajectories

- **Direct.** Steep angle; brief but intense heat. Apollo capsules.
- **Skip.** Bounce off atmosphere, slow gradually.
- **Lifting.** Generate lift to extend reentry, lower peak heating. Shuttle.

For: tradeoffs.

## Apollo reentry

8 minutes intense heating. 3,000°C plasma. Crew capsule blunt body shape.

Why blunt? Counter-intuitive: blunt shape produces detached bow shock that takes most heat in air, less to vehicle.

For: design insight.

## Reentry angle critical

Too steep: too hot, decelerate fast → crew killed by g-forces.
Too shallow: skip off atmosphere back to space.

Window often only 1-2° wide.

For: precision requirement.

## Mars EDL (Entry, Descent, Landing)

Mars atmosphere thin → less drag → high speed to surface:
1. Heat shield (slow from 5.5 km/s to ~400 m/s).
2. Supersonic parachute (slow to 100 m/s).
3. Rockets (final landing). Curiosity used Sky Crane.

7 minutes of terror.

For: difficult problem.

## Earth EDL

Earth's denser atmosphere helps:
1. Heat shield slows from orbit.
2. Drogue + main parachutes.
3. Splashdown (water) or land (USSR style, Soyuz).

For: standard return.

## Communications blackout

Plasma during reentry blocks radio:
- 3-5 minute blackout for Apollo.
- Modern: relay through TDRSS via top of vehicle.

For: ops awareness.

## Skip reentry

For lunar return: dip into atmosphere briefly, exit, re-enter:
- Spreads heating.
- Reduces peak heat.

Artemis Orion uses this.

For: high-velocity entry.

## Mistakes to avoid

- **Wrong entry angle.** Disaster.
- **Underestimating peak heating.** Burns through.
- **No backup TPS.** Single failure point.

## Summary

- Reentry dissipates massive kinetic energy as heat.
- Aerodynamic heating from compression, not friction.
- Blunt body + ablative shield = standard.
- Entry angle critical: too steep burns; too shallow skips.
- Mars EDL particularly hard due to thin atmosphere.

Next: heat shields + materials.
