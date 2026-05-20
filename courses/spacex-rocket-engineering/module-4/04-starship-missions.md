---
module: 4
position: 4
title: "Starship missions — Starlink, lunar, Mars, refueling"
objective: "Map what Starship is actually for."
estimated_minutes: 8
---

# Starship missions — Starlink, lunar, Mars, refueling

## The puzzle

Starship is a vehicle without a clearly-defined mission set when you first see it. Why build something with 100+ tons of LEO payload and full reusability? What actually flies on it? Where does it go?

The answer is layered: near-term, it's about Starlink and reducing $/kg to orbit. Medium-term, NASA's lunar program. Long-term, Mars. And the architectural enabler across all of them is in-orbit refueling.

## The simple version

Starship's mission categories:

1. **Starlink v2**: massive next-generation satellites that don't fit on Falcon 9.
2. **NASA lunar landings**: Starship HLS as the lander for Artemis program.
3. **Mars missions**: long-term aspirational; Starship as primary vehicle.
4. **Commercial deep space**: heavy GEO, interplanetary probes, etc.
5. **Earth-to-Earth transport**: hypothetical point-to-point passenger travel.
6. **Refueling infrastructure**: tanker flights to enable the high-delta-v missions above.

The economic case rests on Starlink + lunar + commercial work generating revenue while Mars architecture matures. Each mission category drives different design and operational requirements.

## The technical version

### Starlink v2 — the immediate driver

Starlink v2 satellites are much larger than v1:

- Each v2 satellite weighs ~1,200 kg (vs. ~250 kg for v1).
- Each Starship carries ~60+ Starlink v2 satellites (vs. ~22 v1s per Falcon 9).
- Per-satellite-launched cost drops significantly.

Starship makes Starlink expansion economical at the scale SpaceX wants (tens of thousands of satellites). This is the immediate revenue driver — SpaceX's own demand.

Starlink itself is a major revenue source. If Starship can launch Starlink v2 at projected costs, it accelerates the constellation rollout and improves Starlink's margins.

### NASA Artemis and the lunar HLS

SpaceX won the NASA contract for Starship HLS (Human Landing System) — the spacecraft that will land NASA astronauts on the lunar surface.

The mission architecture:

1. **Multiple Starship tanker launches** to fuel a Starship in LEO.
2. **Crew launches separately** (via SLS/Orion, then transfers).
3. **Starship HLS departs LEO**, performs lunar transfer.
4. **Lands on Moon** propulsively.
5. **Crew explores, returns to Starship**.
6. **Starship lifts off** from Moon surface.
7. **Rendezvous with Orion** in lunar orbit, crew transfers back.
8. **Starship HLS** is technically expended after the mission (early plan).

Future versions: Starship as full Earth-to-lunar-surface-to-Earth vehicle without SLS.

Artemis 3 (originally targeted 2025-2026, slipping later) plans Starship as the lander. Critical milestones: orbital refueling proof, lunar Starship test flight, integrated Artemis demonstration.

The HLS contract is multi-billion dollars and a major SpaceX revenue source. It also drives Starship development priorities.

### The Mars vision

SpaceX's stated long-term goal: enable humans to settle Mars. Starship is the vehicle architecture for this.

Mars mission architecture:

1. **Cargo Starships** launch first, carrying habitats and supplies.
2. **Refueled in LEO** via tanker fleet.
3. **Trans-Mars injection** during Mars transfer windows (~every 2 years).
4. **Mars landing** via propulsive landing.
5. **Crew Starships** follow with humans.
6. **Methane and oxygen production** on Mars (Sabatier process using Martian atmosphere CO2 and water ice).
7. **Return trips** using locally-produced propellant.

This is multi-decade aspirational. Each step requires significant technology development:

- Long-duration crew life support.
- Mars propellant production.
- Mars surface operations.
- Reliable interplanetary cargo flights.

Critics argue the timeline is wildly optimistic; even SpaceX's internal targets have slipped multiple times. The cargo missions might happen in the 2030s; crewed Mars landings later.

### In-orbit refueling — the architectural unlock

In-orbit refueling is the technology that makes lunar and Mars missions work. The architecture:

- **Mission Starship** launches with payload to LEO with partially-full tanks.
- **Tanker Starships** (~6-15 launches depending on destination) deliver propellant to the mission Starship in LEO.
- **Refueled mission Starship** departs LEO for destination with full propellant load.

Why this matters:

Without refueling, Starship can deliver ~100 t to LEO but progressively less to higher destinations. With refueling, the LEO payload effectively becomes the propellant capacity for the mission, dramatically extending range.

This requires:

- **Propellant transfer technology** between two Starships in microgravity (challenging — propellant tends to slosh and migrate).
- **Docking and seal infrastructure** for fluid transfer.
- **Multiple tanker Starships** producing on time.
- **Tanker launch cadence** supporting refueling schedules.

SpaceX has demonstrated intra-vehicle propellant transfer (between tanks within one Starship). Inter-vehicle transfer is upcoming as of 2025.

### Earth-to-Earth transport

A speculative Starship mission: point-to-point passenger flights via space, achieving anywhere-on-Earth-in-an-hour transit.

The idea:

- Starship launches with passengers.
- Suborbital trajectory across half the planet.
- Lands at destination spaceport.
- Total flight time: ~30-90 minutes for transpacific or transatlantic routes.

Challenges:

- **Crew safety**: requires Starship to be passenger-rated.
- **Regulatory**: huge international and safety hurdles.
- **Spaceports**: would need many.
- **Economics**: ticket prices uncertain; competitive with current first-class flights at best.

SpaceX has discussed this publicly but it's nowhere near operational. Mars development takes priority. Earth-to-Earth might happen eventually but isn't imminent.

### Commercial deep space and GEO

Beyond Starlink and lunar, Starship can launch:

- **Very heavy GEO satellites** (~6-8+ tons that would currently need Falcon Heavy or expendable).
- **Heavy planetary probes** (replacement for Falcon Heavy's role).
- **Constellation deployments** for other companies (large LEO constellations).
- **Space station modules** for commercial space stations (Axiom, etc.).

Pricing for these is competitive with current options. Whether customers move to Starship depends on Starship's reliability over time.

### Cargo vs. crew configurations

Starship variants:

- **Cargo Starship**: payload bay with deployer mechanism. The "pez dispenser" for Starlink-style deployment.
- **Crew Starship**: passenger cabin (10-100+ depending on configuration), life support, accommodations.
- **HLS Starship**: lunar lander with side door, smaller crew area, mission-specific.
- **Tanker Starship**: simplified for orbital propellant transfer; reduced cabin/payload bay.
- **Depot Starship**: long-duration LEO storage for propellant.

Each shares the same Super Heavy booster and Starship base structure. Different upper sections.

### The customer mix

Starship's revenue and use cases:

- **SpaceX internal (Starlink)**: dominant near-term driver.
- **NASA (Artemis HLS, science missions)**: multi-billion contracts.
- **DOD/Intelligence community**: classified payloads needing heavy lift.
- **Commercial GEO and constellations**: emerging.
- **Private crew missions** (Polaris, etc.): demonstrated already.
- **Eventually**: routine commercial launch + Mars.

Most early flights will be Starlink. NASA missions arrive as Artemis progresses. Commercial uptake depends on demonstrated reliability and cost.

### How this depends on cadence

Many of these missions require very high launch cadence:

- **Refueling missions**: 6-15 tanker launches per Mars or Moon mission.
- **Starlink v2**: hundreds of satellites = dozens of launches per year.
- **Multiple mission flow**: Starship launches need to be available for many customer windows.

Without high cadence, the architecture doesn't work economically. Without economic operation, the architecture doesn't scale. The dependencies are tight.

### Critical milestones ahead

For Starship to deliver on its missions, SpaceX must hit:

1. **Routine orbital launches** with reliable both-stage recovery.
2. **In-orbit propellant transfer** between Starships.
3. **Lunar Starship landing demonstration** before crewed Artemis missions.
4. **Refueling operations at cadence** (multiple tanker missions in days/weeks).
5. **Variant configurations** working (crew, HLS, etc.).
6. **Cost trajectory** delivering on <$10M/launch targets.

Each is in progress. Each could slip. The 2025-2030 period will determine whether Starship hits its stated goals or settles into a more modest role.

### Where Starship fits in the broader space economy

If Starship delivers, it transforms:

- **Launch market**: $/kg to LEO drops 10-50x.
- **Satellite economics**: enables much larger and more capable satellites.
- **Lunar exploration**: humans on Moon routinely.
- **Mars settlement**: long-term possibility.
- **Space stations**: commercial stations become feasible.
- **Manufacturing in space**: economic if launch is cheap enough.

If Starship doesn't fully deliver, it still helps significantly — even at $50M/launch it's competitive. The question is whether the economic transformation is dramatic (~$5M/launch) or incremental.

## Three real-world scenarios

**Scenario 1: The Starlink v2 launch.**
A Starship launches with 60+ Starlink v2 satellites. Both stages return. Per-satellite-to-orbit cost is dramatically less than Falcon 9 v1 equivalents. The constellation expands at a pace that wasn't economical before. SpaceX's own internal demand validates the architecture.

**Scenario 2: The Artemis HLS demonstration.**
A Starship HLS launches, refuels in LEO via multiple tankers, transits to lunar orbit, descends to the lunar surface, demonstrates lunar capability. This is the precondition for crewed Artemis missions. NASA's program timeline depends on this.

**Scenario 3: The cargo Mars mission.**
A Starship loaded with habitat modules and supplies launches during a Mars transfer window. Refueled in LEO. Trans-Mars injection. Six-month transit. Mars landing (the hardest part — atmospheric entry then propulsive landing at high mass). Cargo unloaded for future crew missions. This is the architecture — actually executing it is a 2030s-2040s prospect.

## Common mistakes to avoid

- **Treating Mars as imminent** — multi-decade vision.
- **Ignoring Starlink's role** — it's the near-term economics driver.
- **Underestimating refueling complexity** — it's the architectural critical path.
- **Comparing per-launch costs without operational context** — Starship at scale, not single launches.
- **Assuming all variants work** — each (HLS, crew, tanker) is its own engineering challenge.

## Read more

- SpaceX Starship updates and Musk presentations.
- NASA Artemis program documentation.
- Industry analysis on Starlink economics.

## Summary

- **Starlink v2** is the near-term driver — high SpaceX-internal demand.
- **NASA Artemis HLS** is the major external program; Starship lands astronauts on Moon.
- **Mars settlement** is the long-term aspirational goal.
- **In-orbit refueling** is the architectural unlock for high-delta-v missions.
- **Earth-to-Earth transport** is speculative; not near-term.
- **Commercial deep space and GEO** missions expand over time.
- **Cadence is critical** for refueling-dependent missions.
- **Many milestones** ahead before full architecture demonstrated.

That wraps Module 4. Next module: operations, risks, and the future.
