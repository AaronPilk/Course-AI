---
module: 4
position: 2
title: "Full reusability — both stages back"
objective: "Understand the booster catch and ship landing."
estimated_minutes: 8
---

# Full reusability — both stages back

## The puzzle

Falcon 9 reuses one stage. Starship reuses both. The Super Heavy booster gets caught by the launch tower's chopstick arms. The Starship upper stage performs a belly-flop reentry then flips to vertical for a propulsive landing. Each maneuver is unprecedented.

How does both-stage recovery actually work, and why does it matter?

## The simple version

**Super Heavy returns to the launch tower**:
1. Stage separation; booster flips around.
2. Boost-back burn (a portion of 33 engines fire).
3. Coast and reorient.
4. Entry through atmosphere.
5. Final landing burn slows booster to ~0 m/s at the launch tower's chopstick arms.
6. Chopsticks close around the booster, supporting it without landing legs.

**Starship returns to Earth (eventually any landing site)**:
1. De-orbit burn brings ship into atmospheric entry.
2. Belly-flop maneuver: ship orients horizontal, presents its broad flat side to the airflow (maximum drag).
3. Forward and rear flaps adjust trim during descent.
4. At low altitude, ship flips from horizontal to vertical using flaps.
5. Three sea-level Raptors ignite for the landing burn.
6. Ship lands on landing pads, future tower catches, or destination surface (Moon, Mars).

Full reusability changes the economics fundamentally — no expendable parts at all (eventually).

## The technical version

### Why both-stage reuse matters

Falcon 9's upper stage costs ~$8-15M and is expended every flight. Across 100 launches/year, that's $800M-1.5B in expendable upper stages — dwarfing all the first-stage savings.

Recovering the upper stage too:

- Eliminates that expendable cost.
- Enables lower per-launch costs (target <$10M per Starship launch eventually).
- Supports higher cadence (no need to build new upper stages every flight).
- Enables in-orbit refueling architecture (Starship as tanker).

The challenge: upper-stage reentry is much harder than first-stage. Higher speeds, more heat, longer trajectories. This is why no orbital upper stage has been reused before (Space Shuttle was technically a reusable orbital vehicle but with massive between-flight overhaul).

### Super Heavy catch sequence

The booster catch is the more "visual" of the two recovery maneuvers. Steps:

**1. Stage separation**: Starship hot-stages from Super Heavy at ~70 km altitude.

**2. Boost-back burn**: 13 of 33 Super Heavy engines fire to reverse downrange velocity. The booster aims back toward the launch tower.

**3. Coast**: Super Heavy travels back ballistically, falling toward Boca Chica.

**4. Entry**: Super Heavy re-enters atmosphere, slowing aerodynamically.

**5. Landing burn**: Center cluster of engines ignites for the final ~30-40 seconds. Throttle profile brings booster to ~0 m/s exactly as it arrives at the launch tower.

**6. Chopstick catch**: The two arms close around the booster's grid fin region. Booster comes to rest hanging in the arms.

**7. Lower to mount**: Tower lowers the booster onto its launch mount for refurbishment.

The catch eliminates landing legs (significant mass savings, fewer parts, faster turnaround). The first successful catch was October 2024.

### Catch challenges

Catching a 70+ meter, ~150-ton booster with hydraulic arms is genuinely hard:

- **Approach precision**: booster must arrive at chopstick height with horizontal and vertical position to within ~1 meter.
- **Vertical velocity**: must be near-zero at catch.
- **Timing**: tower arms must close at the exact moment.
- **Failure modes**: a missed catch is catastrophic for both booster and tower.

SpaceX has demonstrated multiple successful catches. The reliability will improve with operations.

### Starship reentry — belly-flop

Starship's reentry profile is novel:

1. **De-orbit burn**: small Raptor burn to lower orbit; Starship enters atmospheric descent.

2. **Hypersonic entry**: ship orients with heat shield (tile-covered side) facing the direction of motion. Speed: ~7,000-8,000 m/s.

3. **Atmospheric heating**: tiles experience peak heating. Ship slows aerodynamically.

4. **Belly-flop**: as Starship descends to ~30-50 km altitude, it pitches over and assumes a horizontal orientation. Now the flat (windward) side faces the airflow, presenting maximum drag.

5. **Glide-flop descent**: ship falls in belly-flop attitude. Two forward flaps and two rear flaps control orientation and trajectory. This is unique — no spacecraft has descended this way before.

6. **Final flip**: at low altitude (~1-2 km), ship uses its flaps and small thrusters to flip from horizontal to vertical orientation.

7. **Landing burn**: 3 sea-level Raptors ignite, throttle for soft touchdown.

The belly-flop minimizes propellant needed for descent (atmosphere does most of the work) and enables a precise final landing.

### The flaps

Starship has 4 flaps:

- 2 forward flaps (near nose).
- 2 rear flaps (near landing engine area).

Each flap is independently steerable. During belly-flop, the flaps act like air rudders, adjusting the ship's pitch and roll during the unpowered descent. During the flip maneuver, flaps and thrusters cooperate.

Flap design has iterated. Early designs were thicker; later are thinner and more aerodynamically refined.

### Heat shield tiles

Starship has ~18,000 thermal protection tiles. They:

- Cover the windward side (the belly during reentry).
- Are hexagonal, made of ceramic material.
- Attach mechanically to studs welded onto the stainless steel.
- Are replaceable individually.

The tile attachment has gone through multiple revisions. Early flights showed tile loss during reentry. SpaceX changed attachment methods, tile geometry, and entry profiles. Tile retention has improved significantly.

Heat shield robustness is critical for rapid reuse. The Space Shuttle's tile replacement was a major between-flight time sink; Starship targets minimal tile work per flight.

### Engine restart for landing

The Starship landing burn requires 3 Raptor restarts (3 sea-level engines for the flip-and-land). Raptor's electric ignition and propellant settling systems must work reliably each time. Failures here are catastrophic for Starship.

For Super Heavy's catch, a different subset of engines must restart for the landing burn. SpaceX has been refining this across many test flights.

### Both stages from one launch

A full Starship launch sequence ends with:

- **Super Heavy** caught by the tower at Boca Chica.
- **Starship** continuing to mission objective (orbit, lunar transfer, Mars transfer, etc.) and eventually landing back at Earth or destination.

Each stage has its own engineering challenge. Both must succeed for the launch to be fully reusable. This is significantly harder than Falcon 9's single-stage recovery.

### Time between flights

Target turnaround time for full Starship reuse:

- **Super Heavy**: hours to days. Catch, inspect, refurbish, re-launch.
- **Starship**: longer due to thermal protection inspection, possibly multiple weeks. But SpaceX targets dramatic improvement over Space Shuttle's months.

The "rapid reuse" goal is what makes the economics work. If turnaround is months, Starship economics suffer. If turnaround is hours-to-days, Starship can fly enough to support refueling architecture.

### Failure modes and recovery

Both stages have multiple recovery failure modes:

**Super Heavy**:
- Failed engine restart during landing burn.
- Missed approach to tower.
- Atmospheric anomaly causing tumble.
- Tile or external structure failure during reentry.

**Starship**:
- Tile loss during reentry.
- Heat shield burn-through.
- Engine restart failure during flip.
- Belly-flop control failure.
- Flap actuator failure.

Each failure mode loses the vehicle (or worse). SpaceX iterates through these via testing.

### Comparison with Space Shuttle

The Space Shuttle was the previous reusable orbital vehicle. Differences:

- **Shuttle**: orbiter reusable, fuel tanks expendable, solid boosters refurbishable but not rapidly.
- **Shuttle reentry**: airplane-like landing on runway.
- **Shuttle TPS**: tiles required extensive between-flight maintenance.
- **Shuttle cost per launch**: ~$1.5B.
- **Starship**: target both stages reusable, hours-to-days turnaround.
- **Starship reentry**: belly-flop then flip.
- **Starship TPS**: similar tiles but design for rapid reuse.
- **Starship cost target**: <$10M per launch.

The Shuttle achieved reuse but failed on rapid reuse and low cost per flight. Starship targets both simultaneously.

### When the architecture works

For Starship's economics to deliver:

- Both stages reliably recover and refly.
- Turnaround time approaches days, not months.
- Tile replacement minimal between flights.
- High cadence sustained.
- Manufacturing scales to support tanker missions and lunar/Mars campaigns.

If most of these come together (not necessarily perfectly), Starship transforms launch economics. If they don't, Starship still works as a heavy-lift vehicle, just with worse economics than promised.

## Three real-world scenarios

**Scenario 1: The first booster catch.**
October 2024. Super Heavy returned to the launch tower, decelerated with its engines, slowed to near-zero velocity at chopstick height, and was caught by the closing arms. Telemetry showed precise position control. The catch was unprecedented in rocketry. Subsequent flights have repeated the catch with increasing reliability.

**Scenario 2: A tile-loss reentry.**
Early Starship reentries lost significant tiles. The ship survived structurally (steel is robust) but it would have been hard to refly without major refurbishment. SpaceX changed tile attachment and entry trajectories. Later flights show much better tile retention. This is the iterative engineering cycle in action.

**Scenario 3: The propellant transfer demonstration.**
SpaceX has demonstrated propellant transfer between Starship tanks (intra-vehicle). Inter-vehicle transfer (one Starship to another in orbit) is planned. Success unlocks lunar and Mars missions. Failure forces a redesign of the architecture.

## Common mistakes to avoid

- **Treating Starship catches as routine** — early ones are still proving the technique.
- **Underestimating tile work** — heat shields are operationally important.
- **Comparing to Falcon 9 reuse directly** — upper-stage reuse is dramatically harder.
- **Ignoring failure-mode propagation** — single tile loss can cascade.
- **Assuming target turnaround is achieved** — it's a goal, not yet operational reality.

## Read more

- SpaceX Starship updates and webcasts.
- Eric Berger and Stephen Clark coverage.
- NASA HLS mission documentation.

## Summary

- **Super Heavy** lands at launch tower via chopstick arms — no landing legs.
- **Starship** does belly-flop reentry then flips to vertical for propulsive landing.
- **Heat shield tiles** cover Starship's windward side; mechanically replaceable.
- **Flaps** (4 total) control descent and flip maneuver.
- **Engine restart** is critical for both stages' landing burns.
- **Rapid turnaround** is the operational target — hours to days, not months.
- **Failure modes** are numerous; iterative engineering closes them.
- **Full reusability** is what enables Starship's projected cost economics.

Next: stainless steel, raptors, and manufacturing approach.
