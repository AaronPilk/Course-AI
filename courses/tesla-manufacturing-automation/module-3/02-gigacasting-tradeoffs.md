---
module: 3
position: 2
title: "The cost and complexity tradeoffs of gigacasting"
objective: "Compare the gigacasting vs. traditional stamping economics."
estimated_minutes: 8
---

# The cost and complexity tradeoffs of gigacasting

## The puzzle

Gigacasting sounds like a no-brainer once you understand it: fewer parts, fewer welds, lower labor, simpler assembly. So why isn't everyone doing it? What are the trade-offs that make the decision actually hard?

## The simple version

Gigacasting wins on:

- Direct material + labor cost per part.
- Cycle time per body.
- Floor space.
- Assembly complexity.
- Long-term structural consistency.

Gigacasting loses on:

- Upfront capex (presses, dies, alloy supply).
- Repair cost (cast parts can't be welded back together).
- Design flexibility (changes require expensive new dies).
- Supply chain (concentrated suppliers, alloy supply risk).
- Recyclability complexity (mixed alloys harder to recycle than separated steel).

Pick gigacasting when scale, cycle time, and consistency outweigh capital cost, repair cost, and design rigidity.

## The technical version

### Per-part cost math

For a typical structural underbody:

**Traditional stamping + welding:**

- Raw steel sheet: ~$15-25 per part input.
- Stamping cycle: seconds; spread across many parts.
- Welds per body: hundreds. Each weld: robot cycle + consumables + inspection.
- Total labor + machine time: significant.
- Material yield: ~70-80% (scrap from stamping).

**Gigacasting:**

- Raw aluminum: ~$2-4/kg × 80kg part = $160-320 in material.
- Casting cycle: 1-2 minutes.
- No welds for the cast portion.
- Material yield: 90%+ (recyclable scrap).

So material cost is HIGHER for gigacasting per part. The savings come from eliminated welding, eliminated parts, simplified assembly.

Net per-vehicle cost: depends on press utilization. At Tesla's scale, gigacasting wins. At low volume, it doesn't.

### The breakeven volume

Roughly:

- Below 50K units/year: gigacasting capex doesn't pay back.
- 100-300K units/year: marginal — depends on specific part design.
- Above 300K units/year: gigacasting wins clearly.

Tesla operates well above the threshold for major models. Smaller manufacturers can't justify the press capex per program.

### Design flexibility cost

A stamping die costs hundreds of thousands of dollars. A gigacasting die costs millions to tens of millions. Changes to design require new dies — much more expensive iteration than swapping out a stamped part.

Implications:

- **Year 1 design must be right.** Tesla iterates extensively before committing to die tooling.
- **Mid-cycle refreshes are constrained.** Can't easily change the cast underbody for a refresh.
- **Variants are expensive.** Different countries' regulations sometimes require different structural details; multiple dies might be needed.

Stamping is more forgiving for design iteration. Gigacasting punishes mistakes.

### Supply chain implications

Gigacasting concentrates supply chains:

- **Press supply**: Idra Group makes most large presses; a few competitors. Lead times can be years.
- **Aluminum supply**: alloy formulation requires specific feedstock; supplier concentration.
- **Die makers**: specialist firms; few in the world.

Compare to stamping, where supplier networks are mature with many capable players globally.

When supply chains concentrate, individual supplier issues can shut down production. Tesla has hit this — press delivery delays, alloy supply tightness.

### Recyclability

Stamped steel parts are easy to recycle: separate by alloy, melt down, reuse. Established infrastructure.

Cast aluminum is trickier:

- Tesla uses specific alloy formulations; recycling requires separating these.
- Mixed alloys reduce future castability.
- Recycling streams for automotive aluminum are less mature than steel.

Long-term, this might matter for circular-economy economics. Short-term, it's a known issue with workarounds.

### Repair cost — already covered

From Lesson 3.1: gigacast parts are hard to repair. Total-loss thresholds are reached more easily. Insurance reflects this.

This is an externality of production cost reduction. Tesla benefits (lower production cost per vehicle); owners and insurers absorb the repair-cost increase.

### Energy use

Casting aluminum uses a lot of energy:

- Aluminum melting: ~5-7 kWh per kg from solid; less from continuous melting.
- A 80kg casting = ~400-560 kWh of melting energy.
- Plus cycle energy for the press itself.

Compared to stamping cycles (relatively low energy per part), gigacasting is energy-intensive. At Tesla's scale, energy cost is significant.

Tesla mitigates with:

- On-site solar and storage.
- Continuous melting (more efficient than batch).
- Recycled aluminum (saves the smelting energy).
- Process optimization for energy efficiency.

But energy is a real cost line.

### Press downtime

A Giga Press is a single point of failure. When it goes down (scheduled maintenance, unscheduled break), production of that part stops for that line.

Mitigations:

- Multiple presses for the same part (redundancy at cost of capex).
- Aggressive predictive maintenance.
- Inventory buffer of cast parts.
- Quick repair partnerships with press manufacturers.

But concentration risk is structural — one machine, many vehicles depending on it.

### When stamping still wins

Stamping is correct for:

- **Lower-volume programs** (below breakeven for gigacasting).
- **Frequent design changes** (refreshes, variants, country-specific tweaks).
- **Smaller parts** where the press capex doesn't amortize.
- **Companies without scale** to justify press investment.
- **Steel-frame vehicles** that need welded steel structures.

Most legacy automakers still stamp because their volumes don't justify gigacasting investment per program. As they consolidate to fewer platforms with higher volume, the math shifts.

### The hybrid approach

Some manufacturers use partial gigacasting:

- Cast major structural members (sub-frame, suspension towers).
- Stamp the rest of the body.
- Assemble via welding.

This captures some gigacasting benefits without committing to single-piece bodies. Lower-risk; lower-reward.

Tesla has moved more aggressively to all-cast underbodies. Volvo and BYD have similar moves. VW is incremental.

### When gigacasting decisions get made

For a new vehicle program:

1. Engineering reviews body design.
2. Cost analysis: cast vs. stamp vs. hybrid.
3. Volume projections.
4. Risk analysis: design churn, supplier concentration.
5. Capital availability.
6. Strategic preferences (Tesla aggressive; Toyota cautious).

The decision rolls up to executive level because it commits hundreds of millions in capex per major casting.

## Three real-world scenarios

**Scenario 1: The Model Y math.**
Tesla evaluated stamping vs. gigacasting for Model Y rear underbody. Volume projections of 500K+ units/year. Gigacasting clearly won on per-vehicle cost. Capex was material but justified. Decision made.

**Scenario 2: The legacy automaker hesitation.**
A traditional OEM with 15 EV models, each at 30-80K units/year, evaluated gigacasting. Volume per model didn't justify press capex per program. Conclusion: stay with stamping; revisit when they consolidate to fewer platforms.

**Scenario 3: The press delivery delay.**
Tesla had to wait years for some Giga Presses due to Idra's manufacturing constraints. Gigafactory build-outs were paced by press availability. Supply chain concentration showed itself.

## Common mistakes to avoid (when evaluating gigacasting)

- **Volume-blind decisions** — gigacasting requires scale.
- **Ignoring repair-cost externality** — affects customers, not just production.
- **Underestimating press lead times** — years, not months.
- **Treating capex as recoverable** — die capex is sunk per design.

## Read more

- Tesla's investor presentations on body manufacturing economics.
- Aluminum industry reports on automotive casting demand.
- Industry analyst pieces on EV body manufacturing trends.

## Summary

- **Gigacasting wins on**: direct cost per vehicle at scale, cycle time, floor space, assembly simplicity.
- **Loses on**: capex, repair cost, design rigidity, supply chain concentration, recyclability complexity.
- **Breakeven volume** ~300K units/year per program; below that, stamping wins.
- **Design changes are expensive** — die capex is sunk per design.
- **Supply chain concentrated**: presses, alloys, dies all from few suppliers.
- **Hybrid approaches** combine cast structural members with stamped panels.

Next: structural batteries and cell-to-pack.
