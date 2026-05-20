---
module: 2
position: 3
title: "Supply chain on-site — co-locating suppliers"
objective: "Map Tesla's approach to bringing suppliers into the campus."
estimated_minutes: 8
---

# Supply chain on-site — co-locating suppliers

## The puzzle

A traditional car factory receives parts from hundreds of suppliers worldwide. A bolt from Mexico. A wiring harness from Romania. A seat foam from Tennessee. Logistics teams coordinate the daily ballet — JIT shipments arriving hours before they're needed.

Tesla still has hundreds of suppliers. But many are physically on or near the Gigafactory campus, sometimes in adjacent buildings, occasionally operating WITHIN the Tesla plant. Why? What does this change?

## The simple version

Co-location:

- **On-site suppliers**: lease space in or adjacent to the Gigafactory; produce just-in-time within walking distance of consumption.
- **Industrial cluster suppliers**: located in the same city/region, often within minutes by truck.
- **Strategic partners**: integrate at the engineering level, not just logistics.

Benefits: less inventory, lower logistics cost, faster engineering iteration, supply continuity. Costs: less competitive bidding, lock-in risk, real estate commitments.

## The technical version

### Why co-locate

Reasons:

**1. Logistics cost** — heavy/bulky parts (battery cells, seats, doors) cost a lot to ship. On-site = trivial transport cost.

**2. Inventory reduction** — JIT works better at minute-scale than day-scale. Suppliers next door deliver in hours; suppliers across countries require buffer stock that ties up working capital.

**3. Engineering velocity** — when Tesla wants to redesign a connector or change a tolerance, the supplier engineer is in the next building. Same day collaboration. Versus weeks of back-and-forth with a remote supplier.

**4. Quality coordination** — quality issues caught early. Supplier shifts and Tesla shifts align. Joint daily standups possible.

**5. Supply continuity** — geopolitical disruptions, shipping delays, port issues affect distant supply more than next-door supply.

### What gets co-located

Typically:

- **Battery cells** (Panasonic at Nevada; partners and Tesla's own production elsewhere).
- **Seats** (often a supplier with dedicated space).
- **Wiring harnesses** (some suppliers integrate within Tesla plants).
- **Body castings** (Tesla owns the gigacasting machines on-site).
- **Paint shop operations** (sometimes outsourced operationally to specialist suppliers).
- **Glass, in some cases**.
- **Some Tier-1 component suppliers** with dedicated facilities.

Not typically co-located:

- Commodity items (basic fasteners, lubricants).
- Items shipped from one location to many customers (chips fabbed at TSMC).
- Items with regulatory complexity (some chemicals, certain electronics).

### Operating models

Different flavors of co-location:

**1. Supplier-in-Plant**: the supplier operates inside Tesla's building. Tesla's facility hosts the production line; supplier's workers operate it. Used for seats, sometimes wiring.

**2. Adjacent-Facility**: supplier in next-door building. Daily deliveries by truck across the parking lot. Used for cells (Panasonic at Nevada), some Tier-1s.

**3. Industrial-Cluster**: supplier in the same region, minutes-to-hours away. Used for many medium-criticality components.

**4. Engineering Co-location**: supplier engineering team co-located even if production is elsewhere. Common for chips and electronics — Tesla and supplier engineers work side-by-side in design/qual offices.

### Trade-offs

Real downsides:

- **Reduced supplier competition**: a co-located supplier is hard to replace. Lock-in.
- **Real estate commitments**: co-locating ties up land and capital.
- **Geographic limits**: can't co-locate everywhere; some suppliers won't move.
- **Power dynamics**: when one supplier dominates one factory's input, they have leverage.

Tesla manages these by:

- Diversifying suppliers across multiple Gigafactories where possible.
- Owning critical pieces in-house (vertical integration; Module 1.3).
- Long-term contracts with co-located suppliers (commitments both ways).

### The traditional auto comparison

Toyota popularized "supplier parks" near plants in the 1990s. Some US plants followed. Tesla extends the pattern with newer software-driven coordination and physical integration depth.

The differences:

- **Toyota supplier parks**: physically near; logistically integrated; engineering still mostly remote.
- **Tesla approach**: physical + engineering + sometimes operational integration within the same building.

Toyota's TPS was the predecessor of the Tesla model; Tesla added depth.

### The political dimension

Co-location has political implications:

- **Local jobs**: state and city governments grant incentives for Gigafactories partly because suppliers follow. Nevada attracted Panasonic; Texas is attracting battery and refining partners.
- **Tax credits**: many incentives are structured around supplier ecosystems, not just primary employer.
- **Trade policy**: USMCA, EU local content rules, China policy all influence where suppliers can locate.

Tesla's site choices factor in supplier-attraction potential heavily.

### Risk concentration

The same logic that makes co-location efficient also concentrates risk:

- A fire at the cell supplier's adjacent building affects vehicle production.
- A labor strike at a supplier next door has immediate impact.
- A natural disaster affects the whole cluster.

Geographic diversification helps. Tesla's multi-site Gigafactory strategy distributes some risk — but each site has its own concentration.

### The technology stack

Co-located suppliers often share or interoperate with Tesla's manufacturing software:

- Suppliers see Tesla's production schedule in real time.
- Tesla sees supplier capacity and inventory.
- Quality data flows both directions.
- Engineering changes propagate via integrated systems.

This is technically hard. Most suppliers run their own systems. Tesla often requires API integration or shared dashboards as part of co-location agreements.

### Suppliers' perspective

Why suppliers agree to co-locate:

- **Guaranteed volume**: Tesla commits to multi-year contracts at scale.
- **Reduced sales effort**: one customer, big volume.
- **Co-engineering benefits**: closer collaboration drives their own learning.
- **Brand prestige**: being a Tesla supplier is a marketing asset.

Costs:

- **Customer concentration**: one customer accounts for big share of revenue.
- **Margin pressure**: Tesla negotiates hard.
- **Lock-in**: hard to serve other customers if dedicated to Tesla.
- **Cultural fit**: Tesla's pace stresses traditional supplier cultures.

It's a high-risk, high-reward deal for suppliers. Panasonic's relationship with Tesla has both ups (huge cell business) and downs (margin pressure, partnership strain). Other supplier relationships have ended.

### Comparison with Apple's supplier strategy

Apple uses similar concentration but different geography:

- Apple's suppliers cluster in Asia (Foxconn, Pegatron, etc.).
- Apple co-engineers tightly with suppliers but maintains arms-length operational separation.
- Apple doesn't typically have suppliers IN Apple buildings.

Tesla and Apple both extract scale and engineering benefits from concentration. Different mechanisms suit different industries.

## Three real-world scenarios

**Scenario 1: The Panasonic-Nevada alignment.**
Panasonic operates cell production inside the Nevada Gigafactory. When Tesla wants to change pack designs, Panasonic engineers are in the next room. Iteration cycles compress dramatically. Both companies benefit; both are locked-in.

**Scenario 2: The seat supplier crisis.**
Early in Tesla's history, a co-located seat supplier had quality issues. Because they were Tesla-dedicated, switching was hard. Tesla eventually brought seat production largely in-house — vertical integration in response to supplier-failure risk. The co-location made the dependency more visible faster.

**Scenario 3: The engineering co-design save.**
A specific wiring harness was hard to install. Traditional approach: train operators harder. Tesla engineer walks 50 feet to supplier engineer's office. Together they redesign the harness in a day. Installation cycle time drops; both teams happy. This kind of fast iteration is the operational dividend of co-location.

## Common mistakes to avoid

- **Co-locating everything** — commodities don't benefit from co-location's costs.
- **No supplier diversification** across sites — concentration risk.
- **Treating suppliers as interchangeable** when they're co-located and dedicated.
- **Ignoring supplier health** — when 80% of supplier revenue depends on you, their stability is your problem.

## Read more

- Tesla 10-K reports list supplier concentration risks.
- Toyota Production System literature on supplier parks (historical precedent).
- Recent EV industry analyst reports on supplier clustering.

## Summary

- **Co-location** = suppliers on-site, adjacent, or in the regional cluster.
- **Benefits**: lower logistics, less inventory, faster engineering iteration, supply continuity.
- **Costs**: reduced competition, lock-in, real estate commitments, concentration risk.
- **Operating models**: supplier-in-plant, adjacent-facility, industrial-cluster, engineering co-location.
- **Toyota precedent**: supplier parks. Tesla extends with deeper engineering + operational integration.
- **Suppliers face concentration risk** too — margin pressure + cultural fit + customer concentration.

Next: the energy + battery + vehicle stack at one site.
