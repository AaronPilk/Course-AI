---
module: 3
position: 1
title: "Power: solar + batteries + RTGs"
objective: "How spacecraft stay powered."
estimated_minutes: 5
---

# Power: solar + batteries + RTGs

## Solar panels

Most common; convert sunlight to electricity.
- Si efficiency: 15-22% (commercial); 25-30% (multi-junction GaAs space-grade).
- 1 m² → ~150-300 W in Earth orbit (depending on sun angle).
- ISS panels: 75 kW continuous.

For: inner solar system missions.

## Solar power vs. distance

Solar flux drops with 1/r²:
- Earth orbit: 1,361 W/m².
- Mars: 600 W/m².
- Jupiter: 50 W/m².
- Saturn: 15 W/m².

Beyond Mars: solar impractical for high power.

For: mission design choice.

## Batteries

For eclipse periods (no sunlight):
- Li-ion most common.
- LEO: every 90 min spends 30+ min in shadow.
- Need batteries to ride through.

ISS: 48 batteries, 280 Ah each.

For: continuous power.

## RTG (Radioisotope Thermoelectric Generator)

Plutonium-238 decay → heat → electricity via thermocouples:
- ~5-300 W per RTG.
- Decay: 87 years half-life.
- Operates 30+ years.

Used by: Voyager, Cassini, Curiosity, Perseverance, New Horizons.

For: deep space + long missions.

## Nuclear reactor (future)

True nuclear power generation:
- Higher power than RTGs (kilowatts+).
- DARPA + NASA developing for mid-2020s.
- Targets: Mars surface, lunar permanent presence.

For: future high-power.

## Power budgeting

Spacecraft power balance:
```
Sources (solar, RTG) → batteries (during charge) → distribution → loads
```

Always size for worst case:
- Eclipse + maximum load.
- End-of-life degradation (solar panels lose 1-2%/year).

For: design constraint.

## Voltage standards

Spacecraft buses:
- 28V DC (small sats; legacy).
- 100V DC (modern; lower current).
- High voltage (kV) for ion thrusters.

For: electrical design.

## Power management

Sequence loads:
- Critical: comms, attitude control (always on).
- Variable: instruments (when needed).
- Heaters (thermal control).

If shortage: load shedding by priority.

For: graceful degradation.

## Failures

Common power problems:
- Solar panel deployment failure.
- Battery cell failure.
- Bus undervoltage.
- Radiation damage to electronics.

Redundancy required.

For: reliability planning.

## Mistakes to avoid

- **Forgetting eclipse.** Constant power assumption fails.
- **No battery margin.** Old batteries lose capacity.
- **Solar for outer planets.** Use RTG.

## Summary

- Solar panels for inner solar system.
- Li-ion batteries bridge eclipses.
- RTGs for deep space (Voyager → Mars rovers).
- Nuclear reactors emerging.
- Always size for worst case + degradation.

Next: thermal.
