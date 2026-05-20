---
module: 2
position: 4
title: "Merlin and Raptor — SpaceX's engine families"
objective: "Walk through the two engines that define modern reusable launch."
estimated_minutes: 8
---

# Merlin and Raptor — SpaceX's engine families

## The puzzle

Two engines define SpaceX's vehicle program: Merlin (Falcon 9, Falcon Heavy) and Raptor (Starship). They look different, run on different propellants, use different cycles, and target different missions. Understanding both is understanding most of SpaceX's manufacturing and operational discipline.

## The simple version

**Merlin**: RP-1 + LOX, gas generator cycle, 9 engines per Falcon 9 first stage (1 in second stage). Workhorse of SpaceX. ~860 kN thrust at sea level. Has flown hundreds of times across many missions.

**Raptor**: Methane + LOX, full-flow staged combustion, 33 engines per Starship's Super Heavy booster (6 in the ship). Next-generation engine for the next-generation vehicle. ~2,300 kN thrust at sea level (Raptor 2; Raptor 3 reportedly higher).

Both share the SpaceX manufacturing philosophy: heavily-iterated designs, modular manufacturing, high reuse goals.

## The technical version

### Merlin in detail

The Merlin family powered SpaceX's first viable orbital vehicle. Versions:

- **Merlin 1A**: first variant, used on Falcon 1. Thrust ~340 kN. Several Falcon 1 failures involved Merlin issues.
- **Merlin 1C**: regeneratively-cooled version. Powered the first successful Falcon 1 orbital launch in 2008.
- **Merlin 1D**: significantly redesigned. Higher thrust (~720 kN initially), simpler manufacturing. Falcon 9 v1.1 onward.
- **Merlin 1D Full Thrust**: ~860 kN thrust at sea level, ~310 s sea-level Isp, ~340 s vacuum Isp. The version flying since ~2015.
- **Merlin Vacuum (MVac)**: vacuum-optimized version with large nozzle for second stage. ~980 kN thrust vacuum, ~348 s vacuum Isp.

Merlin design choices:

- **Pintle injector** instead of complex showerhead injectors. Simpler manufacturing, fewer parts, naturally combustion-stable. Pintle injectors came from Apollo Lunar Module engines — well-understood technology applied creatively.
- **Gas generator cycle**: simpler than staged combustion, faster to develop.
- **Open-cycle exhaust**: visible exhaust trail.
- **Throttleable**: 100% down to ~57%. Critical for landing.
- **Restartable**: yes, multiple restarts per flight for boost-back, entry, landing.

Merlin's reliability has gotten very high. SpaceX's mission success rate is now competitive with or exceeds legacy launch vehicles, and Merlin is the engine behind that.

### Raptor in detail

Raptor is the engine that took eight-plus years to develop. Versions:

- **Raptor 1**: first flight-test engines. ~1,800 kN thrust, ~330 s sea-level Isp. Powered early Starship test flights.
- **Raptor 2**: redesigned for manufacturing simplicity and higher performance. ~2,300 kN thrust, ~327 s sea-level Isp, ~363 s vacuum Isp. ~300 bar chamber pressure.
- **Raptor 3**: in development as of 2025-2026. Reportedly ~2,750-3,000 kN, ~350 bar chamber pressure, even simpler manufacturing (fewer parts, integrated welds).

Raptor design choices:

- **Full-flow staged combustion**: first engine to fly with this cycle.
- **Methane + LOX**: enabling Mars manufacturability and good reusability characteristics.
- **High chamber pressure**: 300+ bar enables compact engine.
- **Coaxial swirl injectors**: small, robust injector design suited to FFSC.
- **Electric ignition**: spark plug-style igniters; reliable restart.
- **Deep throttle**: 40% to 100% reportedly. Enables booster catch via "tower chopsticks."

Raptor's chamber pressure (~300 bar) is industry-leading. Russian engines like RD-180 hit ~260 bar; American SSME ~200 bar. Raptor 3 pushes higher.

### Manufacturing differences

Both engines are designed for serial production at scale:

**Merlin**: SpaceX produces Merlin engines at a rate of roughly one every 4-5 days. By 2025, Merlin has flown thousands of times in aggregate across the fleet. Each Falcon 9 has 9 Merlins in stage 1 + 1 MVac in stage 2 = 10 engines per launch.

**Raptor**: SpaceX explicitly targets very high production cadence. Each Starship stack has 33 Raptors in Super Heavy + 6 (3 sea-level + 3 vacuum) in Starship = 39 engines per stack. To support flight rates, SpaceX needs Raptor production well into the hundreds per year.

Raptor 2 and especially Raptor 3 explicitly simplify manufacturing — fewer parts, integrated tubing, easier-to-machine geometry. The engine isn't optimized just for performance; it's optimized for "easy to make a thousand of these."

### Reuse cycles

**Merlin**: reuse confirmed at 10+ flights per booster (specific boosters tracked in SpaceX press materials). Between flights, engines are inspected, occasional refurbishment. Single boosters have logged 20+ flights.

**Raptor**: still proving out long-term reuse. Initial flights show engines surviving entry and landing. Goal: rapid reusability with minimal between-flight work.

### Throttle and restart

Both engines throttle and restart, but their landing roles differ:

- **Merlin throttling enables Falcon 9 first-stage landing**: the booster lights 3 engines for entry burn, then 1 engine for landing burn, throttling carefully to land at the right velocity (~0 m/s at touchdown).
- **Raptor throttling enables Super Heavy catch**: the booster slows enough that the launch tower's "chopstick" arms can grab it as it descends. Goal: skip landing legs entirely.

The deep throttling of these engines is one of the engineering achievements that makes reusability possible.

### Engine count tradeoffs

Falcon 9 uses 9 engines per first stage. Why?

- Each engine smaller, easier to develop than one giant engine.
- Engine-out redundancy: Falcon 9 can lose one or two engines and still reach orbit.
- Allows different engine counts for different missions (Falcon Heavy: 27 first-stage engines across 3 boosters).
- Throttling all 9 lets you control thrust precisely.

Super Heavy uses 33 engines. Why so many?

- Same redundancy advantages.
- Spreads the total thrust across smaller engines that are easier to manufacture, transport, test.
- Failure of a single engine is survivable.
- Enables fine-grained thrust vectoring.

The "Soviet N1 lesson" looms: the Soviet N1 moon rocket had 30 engines and failed multiple times due to engine-cluster issues. Modern engine clusters with modern controls (rate sensors, real-time engine monitoring, computer flight control) handle this safely. SpaceX has demonstrated this at smaller scale on Falcon Heavy (27 engines) and now Super Heavy (33).

### Sea-level and vacuum variants

Both engine families have sea-level and vacuum variants:

- **Merlin** (sea-level) for Falcon 9 stage 1.
- **Merlin Vacuum (MVac)** for Falcon 9 stage 2.
- **Raptor** (sea-level) for Super Heavy booster and 3 of Starship's 6 engines (for landing).
- **Raptor Vacuum (RVac)** for 3 of Starship's 6 engines (for orbital insertion and beyond-LEO burns).

Vacuum variants have much larger nozzles. RVac's bell is enormous — visibly so on Starship.

### Engine startup

Starting these engines is a precisely-choreographed sequence:

**Merlin startup**: pre-chill engines with LOX, open valves in sequence, hypergolic igniter (TEA-TEB — triethylaluminum + triethylborane) lights the engine. The famous green flash at Falcon 9 ignition is TEA-TEB.

**Raptor startup**: more complex due to FFSC. Pre-burners must light before the main chamber, fuel and ox sides must coordinate. Electric ignition (spark plugs) replaces hypergolic. Sequence handles two pre-burners and main chamber with millisecond timing.

Engine failures during startup are common in early development. Both Merlin and Raptor had their share. Modern flight engines have very reliable startup, but each generation of engine requires earning that reliability.

### Engine failures in flight

Both engines have had in-flight anomalies:

- **Merlin**: SpaceX has lost engines mid-flight without losing missions (CRS-1 lost a Merlin and reached orbit anyway). Engine-out tolerance is real.
- **Raptor**: many failures during Starship test campaign — both expected (early Raptor designs) and unexpected (later-generation issues during full-stack tests). Each iteration improves.

The pattern: engines mature through hundreds of test runs and dozens of flights. Reliability comes from operational experience, not from initial design alone.

### McGregor — where engines are tested

SpaceX tests engines in McGregor, Texas. Test stands run engines through full mission duty cycles before they're shipped to Hawthorne (manufacturing) or Boca Chica (Starship integration).

A typical Merlin test sequence: pre-fire checks, full-duration acceptance test, post-test inspection. Each engine accumulates test data before it ever sees a launch pad.

Raptor testing has been similarly intensive. Some Raptor engines have logged dozens of test firings before flight assignment.

### Cost trajectory

Engine cost has dropped dramatically. Approximate ballpark estimates from public sources:

- **Merlin 1D**: reportedly ~$1M per engine at full production rate.
- **Raptor 2**: SpaceX has stated targets of <$250K per engine at full Starship cadence; Raptor 3 reportedly lower still.

Compare to SSME at $40M+ per engine, or RS-25 (SLS) at $146M per engine. The order-of-magnitude cost reduction is partly the Merlin / Raptor manufacturing strategy: serial production, simplified designs, vertical integration.

## Three real-world scenarios

**Scenario 1: The pintle injector lesson.**
Tom Mueller (early SpaceX propulsion lead) chose pintle injectors for Merlin partly because they were simpler than the alternatives and partly because they were known stable. Saved years of development on combustion instability. Sometimes the simpler choice is the better choice.

**Scenario 2: The Raptor 2 redesign for manufacturing.**
Raptor 1 was a working FFSC engine but expensive to make. SpaceX redesigned to Raptor 2 with explicit manufacturing goals: fewer parts, integrated welds, simpler tubing. Performance went up; cost went down. Manufacturing-driven engine design is a recurring theme.

**Scenario 3: The Falcon Heavy demo flight.**
Falcon Heavy's first launch had 27 Merlins firing simultaneously — the largest US engine cluster since Saturn V. All 27 engines lit and stayed lit. The Tesla Roadster (test payload) reached its target trajectory. The achievement was as much about engine reliability and cluster control as about vehicle architecture.

## Common mistakes to avoid

- **Treating Merlin and Raptor as equivalents** — they target different missions.
- **Underestimating manufacturing as a design constraint** — both engines were re-engineered for production.
- **Ignoring engine-out redundancy** — multi-engine clusters tolerate failures.
- **Comparing chamber pressures without context** — cycle and propellant matter.
- **Assuming engine reliability is design-only** — operational reuse is where reliability is earned.

## Read more

- Tom Mueller interviews (former SpaceX propulsion lead).
- SpaceX Raptor presentations at IAC and other conferences.
- *Liftoff* by Eric Berger — Merlin's early development story.

## Summary

- **Merlin**: RP-1+LOX gas generator, 9 per Falcon 9 stage 1, workhorse of SpaceX.
- **Raptor**: methane+LOX FFSC, 33 in Super Heavy + 6 in Starship, next-generation.
- **Both throttle and restart** for landings and orbital maneuvers.
- **Manufacturing optimization** is a deliberate design constraint, not just performance.
- **Engine-out redundancy** in multi-engine clusters is a major feature.
- **Cost per engine** has dropped 10-100x vs. legacy hydrogen engines.
- **Reliability emerges from operations**, not just design.

That wraps Module 2. Next: Falcon 9 and Falcon Heavy in detail.
