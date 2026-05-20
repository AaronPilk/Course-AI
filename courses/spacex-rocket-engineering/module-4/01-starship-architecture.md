---
module: 4
position: 1
title: "Starship architecture and design choices"
objective: "Walk through the vehicle and the why behind major decisions."
estimated_minutes: 8
---

# Starship architecture and design choices

## The puzzle

Starship is a fully-reusable two-stage rocket. It's the largest, most powerful rocket ever built. It's made of stainless steel. Its engines run on methane. Both stages return to Earth. It can refuel in orbit. Its target payload to LEO is ~150-250+ tons fully reusable — multiple Saturn Vs.

Every one of those design choices is unusual. Why?

## The simple version

Starship = Super Heavy booster (first stage) + Starship (second stage / spacecraft):

- **Total height**: ~120 m stacked (taller than Saturn V).
- **Total mass**: ~5,000 tons fully fueled.
- **First stage**: 33 Raptor engines, methane + LOX.
- **Second stage**: 6 Raptors (3 sea-level + 3 vacuum), methane + LOX.
- **Materials**: stainless steel structures.
- **Payload to LEO (fully reusable)**: target 100-150 tons; longer-term goal 250+ tons.
- **Recovery**: both stages return; booster caught by launch tower, ship lands propulsively.

The choices reflect SpaceX's bet on full reusability, Mars manufacturability, and aggressive cost reduction.

## The technical version

### The two stages

**Super Heavy (booster)**:
- 33 Raptor engines (13 inner, 20 outer).
- Methane + LOX propellants.
- ~71 m tall.
- ~3,400 tons total mass.
- Provides initial liftoff thrust and lifts Starship into the upper atmosphere.

**Starship (spacecraft)**:
- 6 Raptor engines: 3 sea-level (for landing) + 3 vacuum (RVac, for orbit and beyond-LEO).
- Methane + LOX propellants.
- ~50 m tall.
- ~1,600 tons total mass (fully fueled).
- Carries payload, performs orbital and interplanetary maneuvers, lands at destination.

Both stages stack to make the full vehicle.

### Why stainless steel

Almost no rocket since the Atlas (1950s) has used steel. Modern rockets use aluminum, aluminum-lithium, or composites. Starship uses 301-stainless and similar grades. Why?

- **Heat resistance**: stainless steel handles re-entry temperatures (1,500°C+) without ablative shielding for much of the vehicle. Aluminum melts well below this; composites char.
- **Strength at extremes**: stainless steel retains strength at cryogenic temperatures (loaded with cryogenic propellants).
- **Manufacturing**: stainless steel can be welded, rolled, and worked in shipyard-style facilities. Cheap and scalable vs. composite layup.
- **Cost**: stainless steel is dramatically cheaper than composites or aluminum-lithium.

Musk publicly explained the choice in 2019. The tradeoffs: stainless steel is denser, so the structural mass is higher. SpaceX accepts the mass penalty for the manufacturability, heat resistance, and cost.

Starship's stainless skin is bare on the windward (heatshield-facing) side; the leeward side is covered with thermal protection tiles. The metal itself handles much of the heat load.

### Why methane

Covered in Module 2: methane + LOX is the propellant choice. Recap reasons:

- Mars manufacturability (Sabatier process).
- Higher Isp than RP-1.
- Cleaner burning (less coking) for engine reuse.
- Reasonable density (better tank size than hydrogen).

### Why 33 + 6 engines

The 33-engine Super Heavy provides ~74,500 kN of thrust (more than twice Saturn V). Why 33 instead of 7-9 bigger engines?

- **Engine-out tolerance**: ~3 engines can fail without mission loss.
- **Manufacturing scale**: making 33 of the same engine is easier than 7 unique giant ones.
- **Logistics**: Raptor at its size can be transported and tested individually.
- **Throttle range**: 33 individually-controlled engines provide fine-grained thrust control.

Starship's 6 engines (3 sea-level + 3 RVac) provide:

- 3 sea-level for landing burns and atmospheric work.
- 3 RVac for orbital insertion and beyond-LEO missions (massive vacuum nozzles, very high Isp).
- Engine-out tolerance during landing.

### The launch tower / chopsticks

Starship's launch tower at Boca Chica (and future sites) has "chopstick" arms that:

- Lift Super Heavy onto the launch mount.
- Lift Starship onto Super Heavy.
- Catch Super Heavy after its return flight (this is the new and stunning operational mode).

The chopsticks eliminate the need for landing legs on Super Heavy — significant mass savings. The booster's exit-velocity must be matched to chopstick speed precisely; the booster slows itself with its engines to ~0 m/s as it arrives at the chopsticks.

This is unprecedented in rocketry. As of 2024-2025, SpaceX has successfully caught Super Heavy boosters multiple times. Each catch eliminates landing legs from the booster's mass budget.

### Starship landing

Starship (the upper stage) lands propulsively at the destination — Earth, eventually Moon and Mars. Earth landing sequence:

1. **De-orbit burn**: small burn to lower orbit toward atmosphere.
2. **Entry**: re-enters with heat shield tiles facing forward.
3. **Belly-flop**: Starship orients horizontal during re-entry. The flat side faces forward, increasing drag, slowing descent.
4. **Final maneuver**: Starship flips from horizontal to vertical using flaps and small thrusters.
5. **Landing burn**: 3 Raptor sea-level engines ignite, throttling for a soft touchdown.

This belly-flop-then-flip maneuver is unique. It allows Starship to descend through atmosphere with high drag (good for slowing without engine fuel) then transition to vertical for landing.

### The heat shield

Starship has ~18,000 thermal protection tiles on its windward side. Each tile is hexagonal, mechanically attached. Reusable thermal protection has been a major engineering challenge for spaceflight — the Space Shuttle famously had tile maintenance issues.

SpaceX's approach: stainless steel base structure handles most heating; tiles only on the surfaces with peak heating. Tiles attach mechanically (replaceable). Heat shield design has iterated through multiple Starship vehicles.

Early Starship test flights had tile loss issues during re-entry. SpaceX has improved attachment, design, and inspection. Iteration continues.

### Propellant tanks and stage separation

Both Super Heavy and Starship have stainless tanks. Their volumes:

- **Super Heavy**: ~3,400 tons of propellant (mostly LOX, plus methane).
- **Starship**: ~1,200 tons of propellant.

Stage separation uses "hot staging" — Starship ignites its sea-level engines while still attached to Super Heavy, then separates. The exhaust passes through vents in the interstage. This avoids the no-thrust gap of cold staging and provides immediate thrust for upper stage.

Hot staging is uncommon in Western rockets but standard in Russian designs. SpaceX adopted it for Starship for performance reasons.

### In-orbit refueling

A key Starship capability: refueling in orbit. The plan:

1. **Launch Starship to LEO** with mission payload.
2. **Launch Starship tanker vehicles** (Starships configured for propellant transfer).
3. **Dock tanker to mission Starship in LEO**.
4. **Transfer propellant** between vehicles.
5. **Refueled Starship** continues to destination (Moon, Mars, geostationary, etc.) with full propellant load.

Without refueling, Starship can deliver ~100 t to LEO but only a fraction to higher orbits. With refueling, Starship can deliver substantial payload to lunar surface or Mars.

This requires multiple tanker launches per mission Starship. Cadence becomes a strategic capability — high cadence enables refueling missions. This is partly why SpaceX is building so many launch pads and so much production capacity.

### Variant Starships

SpaceX has discussed and is developing several Starship configurations:

- **Cargo Starship**: payload bay with deployer.
- **Crew Starship**: passenger cabin for orbital and Mars missions.
- **Tanker Starship**: simplified for propellant transfer to other Starships.
- **Lunar Starship (HLS)**: NASA-contracted lunar lander variant; refueled in orbit, lands on Moon.
- **Depot Starship**: persistent in-orbit propellant storage for tanker operations.

Each variant uses the same Super Heavy booster. Different upper-stage configurations.

### Construction at Boca Chica

Starships are built at SpaceX's "Starbase" facility at Boca Chica, Texas. The site has:

- **Production tents and high bays** for stainless steel rolling and welding.
- **Engine test stands**.
- **Launch pad and tower**.
- **Recovery infrastructure**.

The build-up of Starbase has been a major investment over years. It's now the primary Starship manufacturing site, with additional facilities planned (Cape Canaveral, possibly Florida or Texas Gulf coast).

### Build cadence

SpaceX has built and flown multiple Starship "S-numbers" and "B-numbers" (S20, S24, S25, B7, B9, etc.). Each represents a specific iteration with specific changes.

The build cadence is high relative to traditional aerospace: building, testing, and sometimes losing test vehicles in months rather than years. The pattern: build, test, learn, iterate.

### Cost and economics

Public statements from SpaceX:

- Each Raptor 2 engine costs <$250K (target).
- Each Super Heavy booster costs at scale ~$10-15M (estimate; not officially released).
- Each Starship costs ~$10-20M (estimate).
- Per-launch cost (operational) target: <$10M, eventually <$2M.

Compared to Falcon 9 ($60-70M per launch), Starship targets dramatic cost reduction. Reaching the target requires high cadence and proven reusability.

If achieved, Starship cuts $/kg to orbit by 10-50x vs. Falcon 9 — from ~$3,000/kg to $100-300/kg or lower. Whether this is achieved depends on operations, not just design.

## Three real-world scenarios

**Scenario 1: The 'stainless steel revelation.'**
2018, Musk announced Starship would be stainless steel instead of carbon composites. Many in aerospace dismissed it. By 2024, multiple Starships had flown to space, several Super Heavy boosters had been caught by the tower, and the steel-construction thesis was effectively proven. Cost and manufacturability beat performance optimization for this design space.

**Scenario 2: The booster catch.**
October 2024 (and subsequent flights), SpaceX successfully caught Super Heavy boosters with the launch tower chopsticks. The booster slowed itself with its engines as it approached the tower, the arms closed around it, the booster came to rest in the chopsticks. No landing legs needed. The visual was unprecedented; the engineering implications are significant for refurbishment.

**Scenario 3: A tile-loss anomaly during entry.**
Early Starship re-entry attempts saw tile damage and loss. SpaceX changed tile attachment, tile dimensions, and entry trajectories. Later flights showed dramatically improved tile retention. This iterative-fix-from-flight-data pattern is core to SpaceX's development style.

## Common mistakes to avoid

- **Treating Starship as just "bigger Falcon"** — design philosophy differs significantly.
- **Underestimating heat shield challenges** — they bedeviled the Shuttle and are central to Starship.
- **Ignoring refueling architecture** — it's how Starship reaches the Moon and Mars.
- **Assuming reuse is automatic** — both stages must survive their return cycles.
- **Comparing costs prematurely** — published targets are goals, not proven economics yet.

## Read more

- SpaceX Starship updates and Musk presentations.
- Eric Berger's coverage of Starship development.
- NASA's HLS lunar lander documentation.

## Summary

- **Starship**: two-stage fully-reusable rocket; largest ever built.
- **33 Raptors** on booster; **6 Raptors** on ship (3 sea-level + 3 RVac).
- **Stainless steel** construction (cheaper, more manufacturable, heat-resistant).
- **Methane + LOX** propellants (Mars-relevance, Isp, reusability).
- **Both stages return**: booster caught by launch tower chopsticks; ship lands propulsively.
- **In-orbit refueling** enables high-delta-v missions.
- **Variants**: cargo, crew, tanker, lunar (HLS), depot.
- **Cost target**: <$10M per launch eventually, dramatically lower $/kg to orbit.

Next: full reusability and both-stage recovery in detail.
