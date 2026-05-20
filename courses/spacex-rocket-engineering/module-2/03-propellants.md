---
module: 2
position: 3
title: "Propellants — RP-1, methane, hydrogen, and the choice"
objective: "Understand why SpaceX uses what it uses."
estimated_minutes: 8
---

# Propellants — RP-1, methane, hydrogen, and the choice

## The puzzle

Rockets burn fuel and oxidizer. The choice of what to burn isn't just an Isp number — it determines tank size, structural complexity, manufacturing cost, ground handling, restart capability, and even where in the solar system you can refuel. SpaceX has used three different propellant systems across its vehicles, each chosen for specific reasons.

## The simple version

The main propellant choices for rockets:

1. **RP-1 (kerosene) + LOX**: dense, easy to handle, moderate Isp. Used by Merlin (Falcon 9/Heavy).
2. **Methane (CH₄) + LOX**: moderate density, higher Isp than RP-1, manufacturable on Mars. Used by Raptor (Starship).
3. **Hydrogen + LOX**: highest Isp, low density, very cold, complex to handle. Used by SSME, Centaur, BE-3.
4. **Hypergolics** (UDMH + N₂O₄, MMH + NTO): self-igniting, storable, toxic. Used in many in-space engines and older missiles.
5. **Solid propellants** (HTPB + ammonium perchlorate): pre-formed grain, no plumbing, no restart. Used in boosters (Shuttle SRB, Atlas V SRBs) and missiles.

Each has tradeoffs. The pattern: higher Isp tends to come with worse density and worse handling. Engineers pick the propellant that best matches the vehicle's mission.

## The technical version

### RP-1: refined kerosene

RP-1 is a highly refined kerosene — basically jet fuel with some sulfur and aromatic compounds removed for cleaner combustion. Standard since the 1950s.

Pros:

- **Dense** (~810 kg/m³ at room temperature) — smaller tanks for the same propellant mass.
- **Liquid at room temperature** — easy to store, handle, ground-operate.
- **Cheap** — refined from petroleum.
- **Well-understood** — 70+ years of operational experience.

Cons:

- **Coking** — RP-1 leaves carbon deposits at high temperatures, complicating regenerative cooling and reuse. This is one reason Merlin took several refurbishment cycles to get streamlined.
- **Lower Isp** than methane or hydrogen — typically 300-340 s.
- **Heavier exhaust molecules** (CO₂, H₂O) cap maximum exhaust velocity.

Used by: Merlin (Falcon 9), F-1 (Saturn V), RD-180 (Atlas V), Rutherford (Electron, methane variants also), most pre-2000 boosters.

### Methane: SpaceX's bet

Methane (CH₄) is the major propellant of Raptor. It sits between RP-1 and hydrogen on most metrics.

Pros:

- **Higher Isp than RP-1** (~360-380 s vacuum for Raptor).
- **Reasonable density** (~422 kg/m³ as liquid methane).
- **Clean burning** — minimal coking, easier on engine cooling channels and turbopumps. Good for reusability.
- **Manufacturable on Mars** — via Sabatier reaction (CO₂ + H₂ → CH₄ + H₂O) using Martian atmosphere and water ice. Critical for Starship's Mars mission.
- **Cheaper than hydrogen** to source and store.

Cons:

- **Cryogenic** — must be kept at ~-162°C as liquid. Slightly less cold than LOX (-183°C) so dual-cryo plumbing is simpler than methane+hydrogen.
- **Lower density than RP-1** — slightly bigger tanks.
- **Newer to operations** — fewer decades of operational history.

Used by: Raptor (Starship), Blue Origin's BE-4 (New Glenn), ULA Vulcan (also BE-4 powered), some smaller startups (Relativity, RocketLab Neutron).

Methane is having a moment in the 2020s. Almost every new large engine being developed uses methane.

### Hydrogen: highest Isp, hardest to handle

Liquid hydrogen has the highest specific impulse of any chemical fuel. Hydrogen + LOX engines achieve 450+ s Isp.

Pros:

- **Highest chemical Isp** (~450 s vacuum, ~366 s sea-level for SSME).
- **Clean exhaust** (just water vapor).

Cons:

- **Very low density** (~71 kg/m³ as liquid) — enormous tanks for a given propellant mass. Tank dry mass eats into the Isp advantage.
- **Extremely cold** (-253°C) — challenging insulation and material properties.
- **Hydrogen embrittlement** — degrades metals over time.
- **Tiny molecules leak** through seals.
- **Expensive** to liquefy and store.

Used by: SSME (Space Shuttle), RS-25 (SLS), RS-68 (Delta IV), Centaur upper stages, J-2 (Saturn V S-II and S-IVB), Blue Origin's BE-3 (New Shepard).

For upper stages where the tank size is less of a problem and Isp matters most, hydrogen is often the right choice. For first stages (where tank dry mass dominates), denser propellants tend to win.

### Why SpaceX skipped hydrogen

Falcon 9 uses RP-1; Starship uses methane. SpaceX never built a hydrogen engine. Reasons:

- **Cost**: hydrogen engines are expensive to develop and operate.
- **Tank complexity**: huge insulated tanks would dominate vehicle dry mass.
- **Reusability**: hydrogen embrittlement makes repeated engine cycling harder.
- **Mars relevance**: hydrogen is hard to make on Mars at scale.

The hydrogen Isp advantage is real, but it comes with operational and weight penalties that don't suit SpaceX's design space.

### Hypergolic propellants

Hypergolic propellants ignite on contact — no ignition system needed.

Common pair: UDMH (unsymmetrical dimethylhydrazine) fuel + N₂O₄ (dinitrogen tetroxide) oxidizer. Or MMH (monomethylhydrazine) + NTO.

Pros:

- **Storable at room temperature** — no cryogenics.
- **Trivial ignition** — just open the valves.
- **High reliability** for restartable in-space engines.

Cons:

- **Highly toxic and carcinogenic** — hazardous handling.
- **Lower Isp** than cryogenic propellants (~300-340 s).
- **Expensive** propellants.
- **Environmental concerns**.

Used by: Apollo Service Module engine, Soyuz orbital correction, ICBMs (historically), satellite station-keeping engines, the SpaceX Dragon's SuperDraco engines.

Modern designs increasingly use less-toxic alternatives (green propellants, electric thrusters). But hypergolics remain dominant for many in-space applications because of their reliability.

### Solid propellants

Solid rocket motors use a pre-formed mixture of fuel + oxidizer (often hydroxyl-terminated polybutadiene + ammonium perchlorate + powdered aluminum).

Pros:

- **Simple** — no pumps, plumbing, or moving parts.
- **Long storage** — solid grain stays usable for years.
- **High thrust per weight**.
- **Cheap to manufacture at scale**.

Cons:

- **Cannot throttle** — once lit, burns until done.
- **Cannot restart** — single-use ignition.
- **Lower Isp** (250-280 s).
- **Less controllable** thrust profile (set by grain geometry).

Used by: Space Shuttle SRBs, Atlas V SRBs, all ICBMs, all military missile boosters, many sounding rockets.

SpaceX doesn't use solids. Their reusability and operational flexibility goals favor liquid engines exclusively.

### Mass density matters more than you'd think

A given mass of propellant has a fixed energy content. But the tank to hold it scales with volume, not mass. Denser propellants mean smaller tanks, lower tank dry mass, better mass ratio.

Density-impulse (Isp × density) captures this:

- **RP-1+LOX**: ~330 kg·s/m³ density-impulse (high density, moderate Isp).
- **Methane+LOX**: ~280 kg·s/m³.
- **Hydrogen+LOX**: ~135 kg·s/m³ (huge tanks!).

For first stages where tank dry mass is a significant fraction of total dry mass, density matters enormously. This is why first stages tend to use dense propellants and upper stages use higher-Isp propellants.

### Oxidizer: liquid oxygen (LOX) is universal

Almost all modern liquid rockets use liquid oxygen as the oxidizer.

Pros:

- **Cheap**, abundant, made from air.
- **High specific energy** for the mass.
- **Clean exhaust** when burned with hydrocarbons or hydrogen.
- **No toxicity** (vs. NTO or N₂O₄).

Cons:

- **Cryogenic** (-183°C) — insulation and material concerns.
- **Strongly oxidizing** — any contact with organics is a fire risk.

LOX dominates because the chemistry just works. Methane and RP-1 burn cleanly with LOX. Hydrogen and LOX produce only water. Hard to beat.

### Tank materials and insulation

Liquid propellant tanks must:

- Be lightweight.
- Survive structural loads (pressure, thrust, vibration).
- Insulate cryogenic propellants from ambient heat.
- Resist corrosion or embrittlement from their contents.

Common materials:

- **Aluminum-lithium alloys** (Falcon 9 tanks).
- **Stainless steel** (Starship — chosen partly for high-temperature properties at reentry).
- **Carbon composites** (proposed for various advanced rockets; some flying use).

Insulation often combines vacuum jackets, foam, and multi-layer insulation. Starship's stainless steel is bare on the windward side because the metal itself handles the heat better than insulation could.

### Pad operations and propellant choice

Different propellants imply different pad operations:

- **RP-1**: stored at ambient. Loaded shortly before launch.
- **LOX**: cryogenic; topped off until close to launch as it boils off.
- **Methane**: cryogenic; similar to LOX with slightly easier insulation.
- **Hydrogen**: very cryogenic; major insulation requirements; tends to leak.
- **Hypergolics**: stored ambient; safe handling protocols.
- **Solid**: stored pre-formed; no pad loading.

Falcon 9 uses sub-cooled "densified" propellants — LOX and RP-1 cooled below standard temperatures to increase density (more propellant in the same tank). This requires precise timing during loading and was controversial when SpaceX introduced it.

## Three real-world scenarios

**Scenario 1: Why Raptor exists at all.**
SpaceX could have built a bigger gas-generator engine on RP-1 for Starship. Instead, they bet on methane + FFSC. Reasons: Mars manufacturability (Sabatier reaction), better reusability (less coking), higher Isp, lower turbopump temperatures. Each reason is debatable individually; together they justified an 8+ year engine development.

**Scenario 2: The Centaur upper stage that's older than I am.**
Centaur (hydrogen+LOX upper stage) first flew in 1962. It's still flying today (on Atlas V, soon on Vulcan). Why? Because for high-energy upper-stage missions (GEO, planetary), hydrogen Isp wins decisively. The tank-mass penalty is bearable for upper stages because they're small.

**Scenario 3: The choice between solids and liquids for a small launcher.**
A small launcher company can choose solids (cheap, simple) or liquids (better Isp, restartable). Choosing solids gets to market faster; choosing liquids enables reusability and better economics long-term. Rocket Lab famously chose liquid (electric-pump methane/RP-1) for Electron precisely because solids precluded reuse.

## Common mistakes to avoid

- **Optimizing Isp alone** — density matters for first stages.
- **Ignoring operational costs** — propellant choice affects every launch.
- **Ignoring reusability** — RP-1 coking limits long-cycle engine reuse.
- **Underestimating hydrogen's downsides** — high Isp comes with tank, leakage, embrittlement costs.
- **Treating propellant choice as static** — methane's rise is a major industry shift.

## Read more

- *Ignition!* by John Clark — propellant chemistry history.
- NASA's propellant data sheets (NTRS).
- SpaceX's Raptor presentations on methane choice.

## Summary

- **RP-1**: dense, cheap, moderate Isp. Falcon 9 / Merlin.
- **Methane**: balanced; rises in 2020s; manufacturable on Mars. Starship / Raptor.
- **Hydrogen**: highest Isp, hardest to handle. Upper stages and ULA/Blue Origin.
- **Hypergolics**: storable, toxic. In-space engines.
- **Solid**: simple, no throttle/restart. Boosters and missiles.
- **LOX** is the universal oxidizer for liquid engines.
- **Density-impulse** matters as much as raw Isp for first stages.
- **SpaceX never built hydrogen** — operational and Mars priorities argued against it.

Next: the two SpaceX engines that built the program — Merlin and Raptor.
