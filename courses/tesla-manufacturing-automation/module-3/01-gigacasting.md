---
module: 3
position: 1
title: "Gigacasting — what it is and why it matters"
objective: "Understand the high-pressure die casting that replaces dozens of stamped parts."
estimated_minutes: 10
---

# Gigacasting — what it is and why it matters

## The puzzle

A traditional car body has hundreds of metal parts welded together. Each part is stamped from sheet metal by a press, then welded to adjacent parts at joints. The body shop is a forest of weld robots assembling these parts into the body-in-white.

Tesla's Model Y rear underbody is made differently. One massive aluminum casting replaces 70+ stamped-and-welded parts. The machine that produces it is the largest pressure die-casting machine the auto industry has used. It's called a Giga Press, and the technique is "gigacasting."

This is the single most-discussed Tesla manufacturing innovation. Understanding it explains a lot of Tesla's structural cost advantage.

## The simple version

Gigacasting:

1. **Melt aluminum** in a furnace.
2. **Inject it at high pressure** into a steel die shaped like the target part.
3. **Cool, eject, trim** — one part comes out instead of many.

For Tesla:

- Front underbody: ~1 casting replaces ~70 parts.
- Rear underbody: ~1 casting replaces ~70 parts.
- Eventually: maybe an entire body in 2-3 castings.

The machines are huge (clamping forces of 6,000+ tons), the parts are huge (~1.5m × 2m), and the implications are huge: fewer parts, fewer welds, fewer robots, faster cycle times, lower cost per body.

## The technical version

### What's a Giga Press

A Giga Press is a high-pressure die-casting machine specifically built for very large automotive parts. The "Giga" in Giga Press is for the size, not connected to Gigafactory naming.

Specs (varies by machine):

- **Clamping force**: 6,000 to 9,000+ tons.
- **Shot weight**: 150+ kg of molten aluminum per cycle.
- **Cycle time**: 1-2 minutes per part.
- **Die size**: large enough for parts 1.5-2m on a side.

Manufactured by Idra Group (Italy) primarily; LK Group (China) also makes them. Tesla operates multiple Giga Presses at each major Gigafactory.

### The casting process

For each part:

1. **Aluminum alloy melted** in a centralized furnace (often Tesla-proprietary alloy with specific properties).
2. **Ladle transfers molten metal** to the casting machine.
3. **Vacuum pre-evacuation** of the die cavity (to reduce porosity).
4. **Injection** under thousands of tons of pressure, filling the die in milliseconds.
5. **Solidification** under continuous pressure (under a minute).
6. **Die opens** and part is ejected.
7. **Robotic transfer** to cooling station.
8. **Trim and finish** — removal of gates and runners.
9. **Quality inspection** — X-ray or CT scan for internal defects.

Each cycle produces one body part. Multiple Giga Presses run in parallel to feed the body shop's needs.

### Why aluminum

Tesla uses aluminum alloy (not steel) for gigacasting:

- **Lower melting point**: lower energy to melt; lower die wear.
- **Lighter weight**: each casting is ~80 kg; steel equivalent would be heavier.
- **Castable at scale**: aluminum casting is mature technology.
- **Recyclable**: scrap aluminum has good economics.

Disadvantages:

- Aluminum is more expensive per kg than steel.
- Different welding and assembly requirements vs. steel.
- Repair is harder (aluminum castings can't be easily welded post-damage).

### The parts-count revolution

The math:

- Traditional Model 3 rear underbody: ~70 stamped parts + welds + inspection at each weld.
- Model Y gigacast rear underbody: 1 part.

What's eliminated:

- 69 fewer stamping operations.
- Hundreds fewer welds.
- Many fewer inspection points.
- Many fewer parts to manage in BOM.
- Many fewer parts to stock and transport.

This is a structural cost reduction, not an incremental one. Every saved weld is a saved robot cycle, a saved consumable, a saved inspection.

### Quality implications

Fewer welds = fewer potential failure points. A cast structure has uniform material properties; welded structures have heat-affected zones at every joint where strength varies.

However: castings have their own quality risks. Internal porosity (gas bubbles), inclusion defects, dimensional variation. Tesla invests heavily in:

- Process control (temperature, pressure, vacuum during injection).
- X-ray / CT inspection on every part.
- Statistical process control on cycle-to-cycle variation.
- Alloy development for predictable casting behavior.

When it works, the result is more consistent. When it doesn't, an entire part is scrap (versus a single bad weld that could be rewelded).

### Cycle time and throughput

A Giga Press produces one part every 1-2 minutes. For Model Y production rates (hundreds of thousands per year), Tesla needs multiple presses running in parallel. Each Gigafactory might operate 4-8+ Giga Presses across front and rear underbody plus other parts.

Compare to a stamping-and-welding body shop: hundreds of robots, longer cycles per body. Footprint-per-vehicle is much higher.

### Capital cost

Each Giga Press costs ~$50-100M including ancillary equipment. Tesla has tens of them across Gigafactories. Plus dies (which are large and expensive). Plus aluminum melt infrastructure. Plus inspection equipment.

Capital cost is significant. But:

- One Giga Press replaces a section of stamping + welding line that costs more.
- Cycle times per body are lower.
- Floor space per body is smaller.
- Direct labor is dramatically lower.

Total economics favor gigacasting at Tesla's scale. Smaller producers can't justify the press capex.

### The supply chain implications

Gigacasting changes the supply chain:

- Fewer parts from stamping suppliers.
- More demand for aluminum (sourced upstream).
- More demand for die manufacturing.
- More demand for inspection equipment.

Tesla brought gigacasting in-house. Many automotive suppliers were slow to invest. As of mid-2020s, gigacasting capacity is concentrated at Tesla and a few competitors (BYD, Volvo experimenting).

### Repair and aftermarket

Gigacast parts are harder to repair than welded structures. A small dent in a stamped panel can be fixed; a crack in a cast part typically means replacing the entire casting.

Consequences:

- Higher repair costs for damaged vehicles.
- Insurance premiums may reflect this.
- Total-loss thresholds reached more easily.
- Body shops need new tools and training.

Tesla's bet: lower production cost > higher repair cost, in expectation. Whether insurance companies and customers agree is an ongoing market test.

### Beyond Tesla

The industry response:

- **Volvo / Polestar**: experimenting with gigacasting.
- **BYD**: has integrated gigacasting on multiple models.
- **VW**: announced gigacasting investments.
- **Toyota**: more cautious; prefers incremental approaches.

The race is on. Tesla has a years-long lead but the technology is licensable. The question is whether legacy supply chains can adapt fast enough.

### Limits and future

Tesla has talked about producing entire vehicle bodies in just a few castings:

- Front underbody (cast).
- Rear underbody (cast).
- Middle floor + structural battery (cast / structural integration).

If achieved, this would be 2-3 mega-castings per body instead of hundreds of parts. The implications: massive cost reduction, simplified assembly, but also single-point-of-failure risk on the casting machines.

This is speculative roadmap. Production at scale of such designs hasn't fully arrived as of 2026.

## Three real-world scenarios

**Scenario 1: The Model Y rear underbody.**
Tesla launched gigacasting for the Model Y rear underbody. ~70 stamped parts → 1 cast part. Cost analysis showed significant reduction per vehicle. Cycle time per body dropped. Body shop footprint shrunk.

**Scenario 2: The repair-cost backlash.**
Some Model Y owners experienced minor rear-end collisions that totaled the vehicle because the rear casting was damaged. Insurance companies noticed. Premiums adjusted for some Tesla models. Customer complaints emerged. This is the trade-off in production cost vs. repair cost playing out.

**Scenario 3: The aluminum supply lock-in.**
Gigacasting demands consistent, high-quality aluminum alloy. Tesla works with specific suppliers for alloy formulation. When supply tightens, gigacasting capacity is constrained by aluminum availability, not just press uptime. The supply chain story is the next chapter of the gigacasting story.

## Common mistakes to avoid

- **Underestimating capital cost** of gigacasting — only justified at scale.
- **Ignoring repair-cost implications** — affects customer total cost of ownership.
- **Assuming gigacasting is universal** — fits structural parts; not body panels or smaller pieces.
- **Treating it as silver bullet** — castings have quality risks too.

## Read more

- Idra Group product documentation (Giga Press specs).
- Tesla Investor Day presentations on body manufacturing.
- BYD and Volvo public statements on their gigacasting investments.

## Summary

- **Gigacasting** = high-pressure die casting at automotive scale; one part replaces dozens.
- **Aluminum alloy** at 6,000+ ton clamping forces, 1-2 minute cycles.
- **Structural cost reduction**, not incremental.
- **Quality tradeoffs**: porosity, inclusion risks; entire parts scrap on defects.
- **Capital-intensive**: $50-100M per press; multiple needed at scale.
- **Repair-cost externality**: castings are harder to repair than welded structures.
- **Industry adoption**: BYD, Volvo, VW investing; Toyota more cautious.

Next: the cost and complexity tradeoffs of gigacasting.
