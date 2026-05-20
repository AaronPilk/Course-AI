---
module: 3
position: 3
title: "Structural batteries and the cell-to-pack approach"
objective: "Map the integration of battery into vehicle structure."
estimated_minutes: 8
---

# Structural batteries and the cell-to-pack approach

## The puzzle

Traditional EVs have a battery as a separate component: cells → modules → packs, with a protective enclosure, mounted to the chassis. The pack is essentially a big box of energy bolted on.

Tesla's newer designs make the battery PART OF the chassis. The pack is the floor. Cells contribute structural rigidity. The vehicle is built around the battery, not on top of it.

This shift — structural battery, cell-to-pack — drops weight, increases range, simplifies assembly. It also raises new manufacturing and repair challenges.

## The simple version

The battery integration journey:

1. **Cells → modules → packs → enclosure → chassis** (traditional EV).
2. **Cells → modules → pack acts as floor** (cell-to-pack, Tesla and BYD Blade).
3. **Cells embedded directly in structural floor** (cell-to-chassis, Tesla 4680 + structural pack).

Each step:
- Removes a layer of packaging.
- Reduces weight.
- Improves volumetric efficiency.
- Increases structural integration.
- Makes repair harder.

Tesla is leading the structural integration push. BYD's Blade is in the same family. Competitors are mostly still at conventional pack designs.

## The technical version

### Traditional pack design

```
Vehicle chassis (steel/aluminum frame)
  ↓
Battery pack enclosure (separate steel/aluminum box)
  ↓
Pack-level cooling, BMS, wiring
  ↓
Modules (groups of cells with frames + cooling)
  ↓
Cells (cylindrical or pouch or prismatic)
```

Each layer adds weight and volume that doesn't contribute energy storage. A traditional EV pack is maybe 60-70% cells by volume; rest is structure, cooling, wiring.

### Cell-to-pack (CTP)

Skip the module layer:

```
Vehicle chassis
  ↓
Pack enclosure (which is also part of the floor)
  ↓
Cells directly in pack (with cooling/BMS integrated)
```

Eliminating modules:
- Saves weight (~10% pack mass).
- Improves volumetric efficiency.
- Reduces parts count.
- Cuts assembly complexity.

BYD's Blade battery is a famous CTP example: prismatic cells used directly as structural elements within the pack.

### Cell-to-chassis / structural pack

Go further — the pack IS the chassis floor:

```
Vehicle structure includes the battery as a load-bearing component.
Cells are positioned to add structural rigidity.
Top and bottom of pack become parts of the body.
```

Tesla's 4680-pack design moves toward this. The pack is built with structural adhesives that bond cells together; cells contribute to bending stiffness; the vehicle's floor is the pack itself.

Benefits:
- Major weight reduction (~10% additional).
- Higher rigidity → better handling.
- Lower center of gravity.
- Simpler assembly (fewer steps to attach pack to body).

### The 4680 cell

Tesla's 4680 cells (46mm diameter, 80mm tall) were designed specifically for structural integration:

- **Larger format** = fewer cells per pack → less wiring and BMS complexity.
- **Tabless design** = better thermal management + lower internal resistance.
- **Higher capacity per cell** = fewer interconnections.
- **Optimized for structural use** = predictable mechanical properties.

The 4680 took years to ramp. Tesla announced it in 2020; full production at scale took until 2023+. The complexity of producing them at quality and volume is real.

### Why structural cells matter

A car body needs to be stiff (good handling), light (good range), and crash-safe (passenger protection). Three properties that usually trade off.

Structural battery cells let you:

- Add stiffness without adding weight (cells already exist; they now contribute).
- Reduce weight (eliminate separate pack structure).
- Improve crash safety (cells distribute crash loads).

This is the kind of physics-based optimization that first-principles thinking unlocks. The battery isn't just energy; it's also a structural element if you design for that.

### Manufacturing implications

Structural batteries change manufacturing:

- **Cell positioning matters more** — must be precise for structural and electrical reasons.
- **Adhesives and bonding** replace fasteners for many connections.
- **Pack assembly is more critical** — defects can affect both range and structural integrity.
- **Quality control more demanding** — failures of structural cells affect vehicle safety.

Tesla has invested heavily in automation for cell handling and bonding. Adhesive curing, position checking, electrical test all happen at production speed.

### Repair implications (much harder)

If a traditional pack is damaged, you can replace the pack or sometimes a module. With structural integration:

- A damaged pack means damaged chassis.
- Cell replacement is much harder; might require unbonding (often impractical).
- Repair shops need new tools, training.
- Insurance and warranty implications.

Tesla's bet: production efficiency gains > repair difficulty cost. Insurance markets are pricing this in.

### Comparison with traditional pack designs

Traditional pack (e.g. older Tesla Model S, most legacy EVs):

- Pack is a separate unit.
- Can be removed for service.
- Cells are in modules, easier to swap.
- Heavier, less volumetrically efficient.

Structural pack:

- Pack is part of the body.
- Removal is more complex.
- Cells are positionally integrated.
- Lighter, more efficient.

The trade is consistent: more integration = better operational metrics, harder service.

### Industry adoption

- **BYD**: Blade battery widely used in their lineup. CTP at scale.
- **CATL**: their Cell-to-Pack 3.0 design adopted by multiple OEMs.
- **Tesla**: structural pack with 4680 cells; rolling out across new programs.
- **Legacy automakers**: mostly conventional packs; some moving to CTP.

The industry is shifting toward more integration. Tesla and Chinese manufacturers are ahead; legacy auto catching up.

### Cooling implications

Battery cooling is critical. Traditional modules have cooling plates between cell groups. Structural packs need new cooling approaches:

- **Liquid cooling channels** integrated into the pack floor.
- **Cell-level thermal management** for hotspot control.
- **Phase-change materials** in some designs.

This is mechanical-thermal-electrical engineering at high complexity. Done well: better thermal performance than traditional. Done poorly: thermal runaway risk increases.

### Crash safety

A counterintuitive benefit: structural cells can improve crash safety. Reasons:

- Cells distribute crash loads.
- Lower center of gravity reduces rollover risk.
- Floor stiffness improves cabin integrity.

But: damaged structural cells can leak electrolyte, short, ignite. Trade-off vs. crashworthy design.

Regulators are watching. Tesla's structural pack designs have passed crash tests, but the failure modes are different from traditional batteries. Long-term safety data is still accumulating.

### Cost implications

Structural batteries are cheaper per kWh once at scale:

- Fewer parts.
- Less wiring.
- Simpler assembly.
- More cells per pack volume.

But ramp is expensive:

- New cell formats (4680) require new manufacturing.
- New pack designs require new tooling.
- Quality control investments are substantial.

Tesla's structural pack is now cost-competitive with traditional packs and getting cheaper as ramp continues.

## Three real-world scenarios

**Scenario 1: The Cybertruck structural pack.**
Cybertruck uses Tesla's structural pack with 4680 cells. The pack is part of the vehicle's structure. Weight savings contribute to range targets. Crash performance has been demonstrated. Cost competitive once 4680 ramp completed.

**Scenario 2: The repair cost reality.**
A Model Y owner had a low-speed accident affecting the rear of the vehicle. Repair estimate included potential pack damage assessment. If structural pack is affected, repair cost can total the vehicle. Insurance adjustments followed.

**Scenario 3: The 4680 ramp delay.**
Tesla announced 4680 cells in 2020 with ambitious volume targets. Actual ramp took several years longer than projected — manufacturing the new cell format at quality and yield was harder than expected. Vehicle launches dependent on 4680 supply were affected. Lesson: cell innovation is hard at scale.

## Common mistakes to avoid

- **Underestimating manufacturing complexity** of structural packs.
- **Ignoring repair cost externality**.
- **Treating cell improvements as silver bullet** — manufacturing ramp can dominate paper specs.
- **Skipping incremental approaches** — CTP before structural; learn first.

## Read more

- Tesla AI Day presentations on structural battery + 4680.
- BYD Blade battery technical materials.
- CATL Cell-to-Pack 3.0 announcement.

## Summary

- **Cell-to-pack (CTP)** = skip the module layer; cells directly in pack.
- **Structural battery** = pack IS the floor; cells contribute structurally.
- **Tesla's 4680 cells** designed for structural integration.
- **Benefits**: weight reduction, range increase, volumetric efficiency, structural rigidity.
- **Costs**: harder manufacturing, harder repair, harder thermal management.
- **Industry shifting toward integration**; Tesla + Chinese makers ahead.

Next: where gigacasting breaks down.
