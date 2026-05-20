---
module: 3
position: 2
title: "Booster return — how landing actually works"
objective: "Understand the maneuvers, hardware, and software that make recovery possible."
estimated_minutes: 8
---

# Booster return — how landing actually works

## The puzzle

A Falcon 9 first stage cuts off at ~70 km altitude, moving at ~7,000 km/h, with engines pointing the wrong way for landing. About 7 minutes later, that same booster touches down on a drone ship or landing pad, vertical, still mostly intact, ready to refurbish and re-fly.

How? Each step is precise and unforgiving. Here's the full sequence.

## The simple version

After stage separation, Falcon 9's first stage:

1. **Flips around** using cold gas thrusters to point engines backward (i.e., toward direction of travel).
2. **Boost-back burn** (RTLS only): 3 engines fire to reverse the booster's downrange velocity.
3. **Coast and reorient**: booster falls through space, flipping to entry orientation.
4. **Entry burn**: 3 engines fire at high altitude to slow the booster as it re-enters dense atmosphere.
5. **Grid fin descent**: titanium grid fins control orientation and trajectory.
6. **Landing burn**: 1 engine ignites in the final ~30 seconds to slow to ~0 m/s at touchdown.
7. **Touchdown**: landing legs deploy; booster lands on pad or drone ship.

The whole sequence is choreographed by the flight computer. Manual control wouldn't be fast enough. Each burn has a precise duration and engine throttle profile calculated from real-time telemetry.

## The technical version

### Stage separation and flip

After MECO and stage separation (~3 seconds), the first stage is moving downrange at ~7,000 km/h, ascending and curving. The upper stage continues up; the booster needs to stop, turn around, and come back.

**Cold gas thrusters**: small nitrogen jets near the top of the booster fire to rotate the booster 180°. The engines now point in the direction of travel.

This flip takes ~10-20 seconds. After flip, the booster is pointing "backwards" relative to its motion — engines forward, body trailing.

### Boost-back burn (RTLS missions only)

For Return-to-Launch-Site (RTLS) missions, the booster must reverse its downrange velocity completely so it ends up back at the launch pad.

**Three center Merlins** ignite for ~30-50 seconds. Throttle profile varies by mission. The burn:

- Cancels remaining downrange velocity.
- Gives the booster a velocity back toward the launch site.
- Lifts the trajectory slightly so the booster passes over the right ground point.

This burn happens at high altitude (typically ~70-100 km) where there's almost no atmosphere. After boost-back, the booster is falling roughly toward the landing site.

For drone ship missions (heavier payloads), no boost-back is performed — the drone ship is positioned downrange where the booster naturally falls.

### Coast and reorient

After boost-back (or after stage separation for drone ship missions), the booster coasts ballistically. It's traveling at high altitude, gaining vertical velocity from gravity, slowly falling toward atmosphere.

During coast (~4-6 minutes for RTLS, longer for drone ship), the booster:

- Reorients to entry attitude (engines pointing forward, but at controlled angle).
- Tests grid fin deployment.
- Verifies engine readiness.
- Continues to communicate with ground.

This is a relatively quiet phase. The hard work comes when atmosphere returns.

### Entry burn

At ~70 km altitude during descent, the booster re-enters dense atmosphere. Velocity is ~6,000-8,000 km/h depending on mission.

**Three engines fire for ~15-25 seconds**: not for thrust toward landing, but to slow the booster before atmospheric heating becomes destructive.

Without entry burn, the booster would experience extreme heating and dynamic pressure that could destroy structural components or melt engines. The entry burn:

- Reduces velocity from ~7,000 km/h to ~3,000-4,000 km/h.
- Reduces peak dynamic pressure on the booster.
- Reduces peak heating on engine components.

Even with entry burn, the booster experiences plasma sheath visible from the ground — a glowing trail similar to a meteor.

### Grid fin descent

After entry burn, the booster falls through atmosphere with grid fins deployed. The fins:

- Steer the booster toward the landing site (lateral correction).
- Control booster orientation (pitch/yaw).
- Provide some aerodynamic drag to slow descent.

This is the most aerodynamically active phase. Booster is essentially a falling, slightly-controlled lawn-dart-shape until landing burn.

### Landing burn

In the final ~30 seconds, the booster's altitude is ~3-5 km, velocity ~1,000 km/h, falling fast. It needs to reach 0 m/s exactly at the landing surface.

**One engine ignites** (the center Merlin, often described as the "landing engine"). This single engine produces more thrust than the booster weighs — so it must fire briefly and land precisely. If the engine fires too long, the booster slows too much and stops mid-air (then falls again, crashing). Too short, and it hits the ground too fast.

The flight computer calculates the exact landing burn duration based on real-time altitude and velocity, then commands the engine. The engine throttles to the right level. Landing legs deploy in the final seconds. Touchdown happens with the engine still firing, then shuts off.

This is a "suicide burn" or "hoverslam" — there's no margin for hovering. The engine is too powerful at minimum throttle to hover. The booster must hit zero velocity at zero altitude.

### The math of the suicide burn

The flight computer solves an optimal control problem in real time:

- Current altitude h, velocity v.
- Engine thrust F, mass m.
- Gravity g.
- Acceleration if engine on: (F - m·g) / m.
- Time to land: solve for t such that v + (F-m·g)/m · t = 0 and h = v·t + 0.5·(F-m·g)/m · t².

Engine ignites at the calculated moment. If conditions change (winds, sensor noise), the computer recalculates and adjusts throttle. The whole burn takes ~30 seconds; the calculations refresh every few milliseconds.

### Drone ship vs. RTLS

Two landing options:

**RTLS (Return to Launch Site)**: booster returns to a pad near the launch site. Used for lighter missions where boost-back is affordable. Cape Canaveral has Landing Zones LZ-1 and LZ-2; Vandenberg has LZ-4.

**Drone ship (Of Course I Still Love You, Just Read the Instructions, etc.)**: booster lands on a barge positioned downrange. Used for heavier missions where boost-back fuel would eat too much payload. Drone ship moves to the calculated landing position.

The drone ship is an autonomous spaceport. It positions itself via dynamic positioning systems, holds station to within meters, even in moderate seas. Falcon 9 lands on a pad ~50m × 50m on a ship that's moving and rolling.

### Drone ship landing challenges

Drone ship landings are harder than land landings:

- **Moving target**: ship's position drifts and rolls.
- **Visibility**: cameras and radar must work in maritime conditions.
- **Approach geometry**: booster must land on a precise spot on a moving ship from a falling trajectory.
- **Wind effects**: stronger over open ocean than at land sites.

SpaceX has lost boosters to drone ship landing failures more often than to land landings. But the rate has improved with experience; most attempts succeed.

### What survives, what breaks

A successful landing recovers most of the booster intact:

- 9 Merlin engines: typically intact, can be re-fired.
- Tank structure: usually intact.
- Grid fins: titanium fins reused.
- Landing legs: deploy mechanism is one-shot per landing, sometimes refurbished.
- Avionics: typically intact.

Refurbishment between flights:

- Engine inspection and partial disassembly.
- Tank inspection (pressure cycle, structural integrity).
- Cleaning soot from RP-1 exhaust.
- Replacing landing legs / mechanisms.
- Replacing fairings if necessary (separate flow).

Some boosters have flown 20+ times. Refurbishment time has dropped from months early in the program to days for some flights.

### Engineering iteration

The first attempts at Falcon 9 booster landings (2014-2015) all failed: hit the drone ship too hard, tipped over, exploded. Each failure provided telemetry that informed the next attempt. December 2015 saw the first successful land landing (Orbcomm OG2). April 2016 saw the first successful drone ship landing (CRS-8).

The development was iterative: tune software, attempt landing, learn from failure, retune. SpaceX accepted that early boosters would be lost. The investment paid off.

Other companies (Blue Origin's New Shepard has demonstrated suborbital landing; New Glenn's first-stage will attempt orbital booster recovery) are following similar paths. Some are decades behind.

### Heat shields and engine bell protection

Engines and engine bells face extreme heating during atmospheric entry. Falcon 9 uses:

- **Heat shields around critical components**.
- **Engine bell insulation** specifically to survive re-entry.
- **Outer skin treatments** on the booster body.

Starship pushes this further with stainless steel construction, eliminating ablative heat shielding for the most part.

### Engine restart for landing

Merlin must restart in-flight twice (boost-back, entry, landing — that's potentially 3 ignitions). Each restart requires:

- **Reliable ignition** (TEA-TEB hypergolic) — limited to ~3 restarts per booster.
- **Propellant settling** in microgravity — small ullage thrusters or RCS jets push propellant to feed lines.
- **Engine pre-chill** with LOX — quick.

Failure to restart at any point is catastrophic for the landing. SpaceX has lost boosters to engine restart failures during entry burns.

## Three real-world scenarios

**Scenario 1: The first successful Falcon 9 landing.**
December 2015. SpaceX had failed multiple landing attempts. This time, the booster came down through Florida sky, ignited engines, deployed legs, touched down on LZ-1 at Cape Canaveral. The crowd in Hawthorne erupted; the booster sat intact on the pad. It changed the launch industry overnight.

**Scenario 2: The 'starship-style' suicide burn.**
Many ask why Falcon 9 doesn't hover before landing for precision. Answer: the engine is too powerful at minimum throttle to hover. Single-engine minimum thrust exceeds the dry booster weight. So the booster must arrive at the pad with the exact velocity that will reach zero at landing — no hovering possible. The flight computer's job is to time the burn exactly.

**Scenario 3: A failed landing.**
2016, CRS-8 lost a center engine during entry burn. Booster tumbled, broke up, lost. SpaceX investigated, identified the failure mode (a specific valve issue), fixed it, kept flying. Single failures inform fleet improvements. No single landing failure stops the program.

## Common mistakes to avoid

- **Thinking landing is just gentle descent** — it's a precisely-timed suicide burn.
- **Underestimating engine restart reliability** — multiple restarts per flight are part of the design.
- **Comparing land and drone-ship landings without context** — drone ship is significantly harder.
- **Assuming all engines fire for landing** — only one in the landing phase itself.
- **Ignoring the iteration cost** — early landings failed; the program needed those failures.

## Read more

- SpaceX live mission webcasts — telemetry visible during landing.
- Eric Berger's *Liftoff* and *Reentry* — landing program development.
- Public talks by Hans Koenigsmann and Hans-Peter Klett (former SpaceX engineers).

## Summary

- **Sequence**: flip → boost-back (RTLS only) → coast → entry burn → grid fin descent → landing burn → touchdown.
- **Boost-back burn** reverses downrange velocity for RTLS.
- **Entry burn** slows the booster before atmospheric heating becomes destructive.
- **Grid fins** control orientation during atmospheric descent.
- **Landing burn** is a precisely-timed single-engine burn — no hover possible.
- **Drone ship landings** are harder than land landings.
- **Booster refurbishment** has dropped from months to days.
- **Engine restart** (multiple times) is critical for the whole sequence.

Next: the economics of reusability.
