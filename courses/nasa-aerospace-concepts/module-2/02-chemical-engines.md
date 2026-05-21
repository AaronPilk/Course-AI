---
module: 2
position: 2
title: "Chemical engines + propellants"
objective: "Understand the workhorses of spaceflight."
estimated_minutes: 5
---

# Chemical engines + propellants

## How chemical rockets work

Fuel + oxidizer combust in chamber → hot gas expands through nozzle → thrust.

Newton's 3rd law: action = reaction.

Specific impulse limited by combustion temperature + molecular mass.

For: physics intuition.

## Propellant combinations

- **Kerosene + LOX (RP-1).** Falcon 9, Atlas. Dense, storable.
- **LH2 + LOX.** SLS, ULA Centaur. Highest Isp (~450s), low density.
- **Methane + LOX.** Starship Raptor, Vulcan BE-4. Clean, in-situ production possible.
- **Hypergolic (N2O4 + UDMH).** Russian launchers, deep space. Self-igniting; storable.
- **Solid (APCP).** SRBs, missile. Reliable; can't throttle.

For: trade-off of properties.

## Engine cycles

- **Gas generator.** Falcon 9 Merlin. Simple; some loss.
- **Staged combustion (closed cycle).** Raptor, RD-180. Efficient; complex.
- **Expander.** RL10. Self-pumping; small size.
- **Electric pump-fed.** Rocket Lab Rutherford. New; precise.

For: engineering complexity.

## Nozzle design

Bell-shaped nozzle expands gas. Optimized for:
- Vacuum nozzles: larger expansion ratio.
- Sea-level: smaller ratio.

Aerospike: alternative; adapts to altitude. Used in concepts, never flown commercial.

For: nozzle physics.

## Thrust vector control

Gimbal nozzle to steer:
- Mechanical gimbals (most engines).
- Electric gimbals (newer).
- Vernier engines (small thrusters).
- Differential throttling (multi-engine).

For: steering rockets.

## Throttling

Most chemical engines:
- 40-100% throttle range.
- Below 40%: combustion unstable.

Modern engines (Merlin, Raptor): deeper throttling for landing.

For: control capability.

## Reliability + redundancy

Multi-engine designs tolerate engine-out:
- Falcon 9: 9 engines stage 1; loses 1 → still reaches orbit.
- Starship: 33 + 6 engines; designed for some failures.

Single-engine launchers: catastrophic fail = mission loss.

For: reliability strategy.

## Cooling

Nozzle gets very hot. Methods:
- Regenerative cooling: fuel flows through nozzle walls.
- Film cooling: fuel layer along walls.
- Ablative cooling: walls slowly burn off.
- Radiative cooling: small engines.

For: thermal management.

## Engine examples

- **Merlin (SpaceX).** RP-1+LOX, gas generator, 282-311s Isp, 845 kN thrust.
- **Raptor (SpaceX).** CH4+LOX, full-flow staged combustion, 327-350s, 2300 kN.
- **RS-25 (NASA SLS).** LH2+LOX, staged combustion, 366-452s, 2280 kN.
- **F-1 (Saturn V).** RP-1+LOX, gas generator, 263-304s, 6770 kN (largest single chamber).

For: famous engines.

## Mistakes to avoid

- **Choosing LH2 for everything.** Low density → huge tanks.
- **Ignoring gimbal limits.** Can't steer enough.
- **Single engine on critical mission.** No redundancy.

## Summary

- Fuel + oxidizer combust + expand → thrust.
- LH2/LOX highest Isp; kerosene densest; methane balanced.
- Engine cycles: gas generator simple, staged efficient.
- Multi-engine for redundancy.
- Modern engines deep-throttle for landing.

Next: electric + nuclear.
