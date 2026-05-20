---
module: 2
position: 2
title: "Engine cycles — gas generator, staged combustion, full-flow"
objective: "Map the major cycle families and their tradeoffs."
estimated_minutes: 8
---

# Engine cycles — gas generator, staged combustion, full-flow

## The puzzle

Modern rocket engines use turbopumps to push propellants into the combustion chamber at hundreds of bar of pressure. Spinning a turbopump that fast requires a lot of power — power that comes from burning some of the propellant in a special arrangement called an "engine cycle."

There are several ways to plumb this. Each cycle has tradeoffs: efficiency, complexity, cost, restartability. The cycle choice often determines whether an engine is competitive at all.

## The simple version

The major cycles:

1. **Pressure-fed**: tanks pressurized; no turbopumps. Simple, heavy, low performance.
2. **Gas generator**: small portion of propellant burns to spin turbopumps; that exhaust is dumped overboard. Used by Merlin (Falcon 9). Simpler but ~5% Isp penalty.
3. **Staged combustion**: turbopump exhaust feeds back into the main chamber. Higher Isp but complex; used by SSME (Space Shuttle) and many Russian engines.
4. **Full-flow staged combustion (FFSC)**: both fuel and oxidizer get pre-combusted before the main chamber. Highest Isp, most complex. Used by Raptor (Starship) — only engine in flight using this cycle.
5. **Electric pump**: electric motors drive the pumps; batteries discarded after burn. Used by Rocket Lab's Electron.

SpaceX uses two of these — gas generator for Merlin, full-flow staged combustion for Raptor. That's not an accident; the choice tracks their design philosophy.

## The technical version

### Why turbopumps matter

Rocket engines run at high chamber pressure (50-300+ bar). To inject propellant into a high-pressure chamber, you need pump pressure even higher. Turbopumps deliver this — small turbines spun by combustion gas, driving centrifugal pumps that push propellants forward.

A typical large-engine turbopump:

- Spins at 20,000-30,000 RPM.
- Produces tens of thousands of horsepower (Merlin: ~10,000 hp; Raptor: ~80,000+ hp).
- Survives extreme thermal gradients (cryogenic propellant in, hot gas through turbine).

How you power the turbopump defines the engine cycle.

### Pressure-fed engines

Simplest possible engine: pressurize the propellant tanks themselves, and the pressure pushes propellant into the chamber. No turbopumps needed.

Pros:

- Few moving parts; very reliable.
- Cheap to manufacture.
- Easy to restart.

Cons:

- Tank pressure is limited (heavy walls if pushed too high).
- Chamber pressure must be lower than tank pressure (minus losses), limiting Isp.
- Heavy tanks (high pressure structures) hurt mass ratio.

Used in: small upper stages, in-space engines (like Apollo Lunar Module's descent engine), reaction control thrusters.

### Gas generator cycle

A small portion (1-5%) of the propellant burns in a separate "gas generator" combustor. The exhaust spins the turbopump turbines. After driving the turbines, the exhaust is dumped overboard — often producing the dark exhaust trail visible on some launches.

Pros:

- Simpler than staged combustion.
- Independent gas generator can be tuned separately from main chamber.
- Used by Merlin (Falcon 9, Falcon Heavy), F-1 (Saturn V), RS-68 (Delta IV), Vulcain (Ariane 5).

Cons:

- The 1-5% propellant used for the gas generator doesn't go through the main nozzle. It's wasted propulsion — pure overhead. Costs ~5% of Isp.

Most cost-effective for moderate-Isp engines. SpaceX's Merlin is a workhorse gas generator design.

### Staged combustion cycle

Gas generator exhaust is reinjected into the main chamber after driving the turbopumps. Now nothing is wasted — all propellant ends up contributing to thrust.

Pros:

- Higher Isp than gas generator (typically 15-30 s improvement).
- Better fuel efficiency for the same chemistry.

Cons:

- Massively more complex plumbing.
- Higher chamber pressure required (the turbopump exhaust has to be reinjected against the chamber pressure).
- More stress on every component.
- Russian engines pioneered this; American engineering initially considered it impossible (the "Russian inverter" problem).

Used by: SSME (Space Shuttle), RD-180 (Atlas V), RD-191 (Angara), many Russian engines. Soviet engineers solved staged combustion before US engineers because Soviet test infrastructure allowed more aggressive testing.

### Full-flow staged combustion (FFSC)

Both fuel and oxidizer have their own pre-burner (gas generator):

- Fuel-rich pre-burner drives the fuel turbopump.
- Oxidizer-rich pre-burner drives the oxidizer turbopump.

Both exhausts feed into the main chamber. Nothing wasted, and turbopumps operate at lower temperatures (each handling propellant-rich, not stoichiometric, combustion).

Pros:

- Highest Isp of any chemical cycle.
- Lower turbopump temperatures (since each side runs fuel-rich or ox-rich, not stoichiometric).
- Better restart capability.
- Better long-term durability.

Cons:

- Most complex cycle. Two pre-burners, complex sequencing, ox-rich pre-burner is particularly dangerous (everything wants to burn in oxygen-rich hot gas).
- Decades of attempted development (Soviet RD-270, US IPD) didn't fly.
- SpaceX's Raptor 2 is the first FFSC engine to fly to space (2023-2024).

Used by: Raptor 2 and Raptor 3 (Starship). Blue Origin's BE-4 uses oxygen-rich staged combustion but not full-flow. ULA's planned Vulcan engine variants and Russian engines historically pursued related cycles.

### Electric pump cycle

Use electric motors to spin the turbopumps, with batteries providing the power. After the burn, the batteries are discarded.

Pros:

- Simpler than turbopump-driven cycles — no pre-burners or gas generators.
- High pump pressure achievable.
- Engine restart is trivial (just energize motors).

Cons:

- Battery mass is significant; only works for small engines.
- Wasted battery mass after burn (or recovery problem).

Used by: Rocket Lab's Electron (Rutherford engine). Suits small launchers; doesn't scale well to large boosters because battery mass becomes prohibitive.

### Why SpaceX uses both

Merlin (gas generator) and Raptor (FFSC) reflect a deliberate strategy:

- **Falcon 9 in 2010 needed a workable engine fast.** Gas generator is well-understood and quick to develop. The Isp penalty is acceptable for a 2-stage workhorse rocket targeting LEO and GTO.
- **Starship needs maximum performance per kg of propellant** because of its scale and reuse strategy. FFSC unlocks higher Isp and better restart characteristics. The 8+ years SpaceX invested in Raptor were worth it.

A more conservative company would have stuck with gas generator forever. SpaceX bet on FFSC because Mars missions and full reusability require maximum chemical efficiency.

### Cycle choice and chamber pressure

Each cycle enables different chamber pressures:

- **Pressure-fed**: 5-30 bar.
- **Gas generator**: 50-150 bar.
- **Staged combustion**: 150-300 bar.
- **Full-flow staged combustion**: 250-400+ bar.

Higher chamber pressure means more efficient expansion, more compact engine, higher thrust-to-weight ratio. Raptor 3's chamber pressure is reportedly ~350+ bar — pushing the upper edge of what's been demonstrated.

### Cycle and ignition

How do you start a complex engine cycle? You need ignition that:

- Lights reliably on the first try.
- Doesn't cause damaging pressure spikes.
- Works repeatedly (for restartable engines).

Methods:

- **Hypergolic ignition**: starter fuel that auto-ignites with oxidizer. Common in older engines.
- **Pyrotechnic igniters**: like big sparkers. Single-use.
- **Torch igniters**: small ignition flames pre-burning before main flow. Reusable.
- **Electric ignition**: spark plugs. Used in Raptor.

Cycle complexity and ignition complexity are related. FFSC engines like Raptor have particularly intricate startup sequences because both pre-burners and the main chamber must light in coordinated order.

### Cycle failures

When cycles fail, they fail spectacularly:

- **Turbopump explosions**: catastrophic, usually destroying the engine.
- **Pre-burner instability**: pressure oscillations that can rip plumbing apart.
- **Ox-rich incidents**: any organic material entering hot oxygen-rich gas burns instantly.

The development history of every modern engine is largely a history of cycle failures and the fixes for them. Raptor development included multiple test explosions; SSME had its share too. This is normal for engine development.

## Three real-world scenarios

**Scenario 1: Why Merlin uses gas generator and Raptor doesn't.**
Merlin was developed when SpaceX needed working engines quickly and Falcon 9 needed competitive but not extraordinary Isp. Gas generator delivered. Raptor was developed for Starship — full reusability, methane fuel, Mars-class missions all benefit dramatically from FFSC's higher Isp and better restart. The development time was acceptable for a longer-horizon project.

**Scenario 2: The Soviet-American staged combustion gap.**
Soviet engineers solved staged combustion in the 1960s (NK-15, NK-33). American engineers in the same era believed it was impossible because of "burn-through" issues with oxygen-rich turbines. Different test approaches (Soviet: keep blowing things up until it works; American: model first then build) led to different outcomes. NK-33 engines from Soviet/Russian programs flew on US rockets in the 2010s (Aerojet's AJ-26 for Antares).

**Scenario 3: The IPD that never flew.**
NASA spent years in the 1990s-2000s on the Integrated Powerhead Demonstrator (IPD) — a full-flow staged combustion test program. It worked but never flew. SpaceX's Raptor incorporates much of what was learned in IPD and similar programs, applied with private-sector iteration speed. The IPD story is a useful reminder that engine cycles take a long time to mature even with good engineering.

## Common mistakes to avoid

- **Treating cycle choice as cosmetic** — it determines achievable chamber pressure and Isp.
- **Underestimating staged combustion complexity** — it's why FFSC took 60+ years from concept to flight.
- **Ignoring ox-rich risks** — hot oxygen-rich gas is uniquely dangerous.
- **Confusing high thrust with high Isp** — different cycles excel at different goals.
- **Forgetting cycle dictates ignition** — startup is part of cycle design.

## Read more

- *Sutton's Rocket Propulsion Elements* — chapter on engine cycles.
- Tom Mueller (former SpaceX propulsion lead) interviews.
- *Energomash* engine documentation (Russian staged combustion history).

## Summary

- **Engine cycle** determines how turbopumps are powered and propellant is delivered.
- **Pressure-fed**: simple, low performance.
- **Gas generator**: simple, ~5% Isp penalty. Used by Merlin.
- **Staged combustion**: better Isp, more complex. Used by SSME, many Russian engines.
- **Full-flow staged combustion**: highest Isp, most complex. Used by Raptor — the first to fly.
- **Electric pump**: small engines only. Used by Rocket Lab.
- **Higher chamber pressure** enabled by more complex cycles.
- **Cycle choice tracks design philosophy** — Merlin for fast workhorse, Raptor for maximum performance.

Next: the propellants themselves — RP-1, methane, hydrogen, and the choice.
