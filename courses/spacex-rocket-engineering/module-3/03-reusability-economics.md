---
module: 3
position: 3
title: "Reusability economics — what's actually saved"
objective: "Track where reusability changes launch cost and where it doesn't."
estimated_minutes: 8
---

# Reusability economics — what's actually saved

## The puzzle

Falcon 9 reuses its first stage. SpaceX advertises massive launch cost reductions vs. legacy rockets. But reusability isn't free — you pay in payload, in refurbishment, in development cost. Where does the money actually go, and how does the economics actually work?

## The simple version

Launch cost has three parts:

1. **Hardware cost**: cost to build the rocket (mostly first-stage, secondarily upper-stage).
2. **Operations cost**: labor, propellant, range fees, integration.
3. **Refurbishment cost** (for reusable rockets): inspection, replacement of consumables, requalification.

Reusability dramatically reduces #1 by amortizing the booster across many flights. But it adds #3, which can be significant. And it costs payload (~30% LEO), which means you might need more launches for some missions.

Net: SpaceX advertises Falcon 9 launches at ~$60-70M (for new boosters; reused boosters sometimes lower). Historic comparable rockets (Atlas V, Delta IV) were $150M-400M. Falcon 9 is dramatically cheaper, but the savings come from a combination of reusability AND vertical integration AND manufacturing scale AND minimal overhead.

## The technical version

### The expendable baseline

For an expendable rocket:

- Build cost = full cost per launch.
- Refurbishment = 0.
- Payload = full design capacity.

A Delta IV Heavy at ~$400M per launch represents an expendable cost structure: each launch builds a new rocket. The hardware cost dominates everything.

### What reusability changes

A reusable first stage:

- Build cost is amortized over flights. If a booster flies 10 times, that's ~1/10 the per-flight cost (minus refurbishment).
- Refurbishment cost is real but typically much less than building new.
- Payload drops ~30% for LEO recovery missions.

If a Falcon 9 first stage costs ~$25-35M to build (estimate), and a booster flies 10 times:

- Per-flight first-stage amortization: ~$2.5-3.5M.
- Per-flight refurbishment: maybe $1-2M.
- Total first-stage cost per flight: ~$4-5M.

Compare to expendable: ~$25-35M per flight on first stage alone. Even with payload penalty, this is massive savings.

### What you pay in payload

A Falcon 9 LEO recoverable mission delivers ~17,500 kg (vs. 22,800 kg expendable). That's a 23% reduction. For higher orbits:

- GTO recoverable: ~5,500 kg (vs. ~8,300 kg expendable, 34% reduction).
- Mars transfer recoverable: small or impossible; expendable mode used.

For most missions, the recoverable payload is sufficient and the cost savings dominate. For maximum-payload missions, expendable mode is still used (rare; Falcon Heavy provides extra capability instead).

### Refurbishment in practice

Early Falcon 9 reuse cycles took months between flights. By 2024-2025, some boosters re-fly within 30-60 days. The fastest turnaround has been ~21 days.

What's done between flights:

- **Visual inspection** of all surfaces, engines, structures.
- **Engine inspection**: borescope inspections, NDT of critical components.
- **Tank inspection**: pressure cycle, leak check.
- **Cleaning**: soot from RP-1 combustion removed.
- **Replace consumables**: TEA-TEB igniter cartridges, certain valves.
- **Component replacement**: any item flagged during inspection.
- **Static fire**: engines fire briefly on the pad before launch.

Some flights have noted boosters that re-fly with very minimal turnaround. Others have months of work. The variance reflects each booster's specific history and inspection findings.

### What re-flying does to the booster

Each flight stresses the booster:

- **Engine cycles**: thermal cycles, mechanical loads.
- **Tank cycles**: pressure cycling (full/empty cycles fatigue tank walls).
- **Re-entry heating**: outer skin sees high temperatures.
- **Landing impact**: leg deployment, structural shock.
- **Refurbishment cycles**: inspection access introduces fatigue.

Booster life is finite. Some Falcon 9 boosters have flown 20+ times; SpaceX hasn't published a hard limit but appears to be discovering it via operations. Eventually each booster is retired.

### Upper stage is expendable

Falcon 9's second stage burns up in atmosphere after deorbit. This:

- Costs ~$8-15M per flight (estimate; the upper stage is the more expensive single component to build).
- Eliminates upper stage refurbishment savings.
- Is acceptable because upper-stage recovery is much harder (re-enters from orbit, requires heat shield, etc.).

For ~70% of launches, this expendable upper-stage cost dominates the rocket cost. SpaceX optimizes Falcon 9's economics by amortizing the first stage; Starship will eliminate this expense by reusing both stages.

### Fairing recovery

Fairings cost ~$3-6M each. SpaceX recovers fairings via parafoils and water-landing systems with ships catching or retrieving them.

Recovered fairings are inspected and re-flown. Not all flights recover fairings (parafoil failures, weather), but recovery rates have improved. Each recovered fairing saves ~$3-6M.

### Crew Dragon and Cargo Dragon reuse

Dragon capsules are also reusable. After splashdown:

- Inspect heat shield.
- Refurbish trunk section.
- Replace ablated thermal protection material.
- Recertify for crew.

Each Dragon has flown multiple missions. NASA initially required new Dragons for some Crew missions; over time, certified reused Dragons for crewed flights.

### Manufacturing scale and reuse

Reusability fundamentally changes manufacturing requirements. SpaceX produces:

- Many upper stages per year.
- Fewer first stages per year (because each one flies many times).
- Many Dragons per year (small fleet, multiple flights each).
- Many fairings per year (some recovered).

The factory's primary throughput is upper stages. First stages are produced as needed to expand fleet or replace retirements. This shifts where engineering effort goes.

### Comparison to legacy launch economics

Pre-SpaceX, launch costs were ~$10,000-20,000/kg to LEO. Falcon 9 with recovery brings this to ~$2,000-3,000/kg. Falcon Heavy ~$1,400/kg. Starship targets ~$10-100/kg eventually.

This isn't just reusability — it's also:

- **Vertical integration**: SpaceX builds everything in-house, capturing supplier margins.
- **Manufacturing scale**: high cadence drives down unit costs.
- **Workforce efficiency**: SpaceX uses fewer people per launch than legacy.
- **Operational efficiency**: streamlined launch operations, automation.

Reusability is a major factor but not the only one. Some startups have launched expendable rockets at competitive prices to Falcon 9 — they made up reusability gap with manufacturing efficiency.

### The cost gap with US legacy launch

Why are SpaceX prices so much lower than ULA's Atlas V or Delta IV?

- **Atlas V** uses Russian RD-180 engines (procurement, geopolitics affect costs).
- **Delta IV Heavy** uses hydrogen-fueled RS-68 engines (expensive engines, expensive propellant ops).
- **Legacy operations**: more people, more procedures, more conservative ops.
- **Expendable**: each flight throws away new rocket.

ULA's response (Vulcan) targets lower costs via BE-4 methane engines, simplified operations, and eventual smart-reuse (recovering engines via parachute). ULA isn't matching SpaceX prices but is competing in the $100-150M range vs. legacy's $200M+.

### The Chinese cost question

Chinese rockets (Long March family, increasingly some private Chinese rockets) launch at significantly lower costs than Western legacy. Government subsidization plus lower labor costs plus less-aggressive safety/launch insurance environments combine to make them low-cost competitors.

Western private launch (SpaceX, Rocket Lab, others) compete by being more reliable, more sophisticated, and serving customers (especially DoD) who can't use Chinese launch. Reusability is a moat against Chinese competition that can't easily be replicated without similar reusability investment.

### The actual savings to customers

Customer perspective on Falcon 9:

- **Per-launch cost**: $60-70M for typical commercial Falcon 9.
- **Per-kg to LEO**: ~$3,000-4,000 in recovery mode, ~$2,500-3,000 in expendable mode.
- **Booking lead time**: short for non-priority launches.
- **Reliability**: very high in recent years.
- **Operational flexibility**: SpaceX accommodates timing changes.

For most commercial satellites, Falcon 9 is the obvious choice. For US government/military launches, NRO/DoD have their own qualification requirements and use both SpaceX and ULA. For exotic missions (heaviest planetary missions, the biggest GEO satellites), expendable Falcon Heavy or future Starship.

### Where reusability doesn't help

Some missions argue against reuse:

- **Single-launch deep space probes**: the marginal cost per launch matters less than payload capacity.
- **Heaviest commercial GEO satellites**: payload penalty makes recovery costly.
- **Time-critical defense launches**: rapid response sometimes outpaces refurbishment cycles.

For these, expendable mode or larger rockets are used. SpaceX still recovers the booster usually for fleet maintenance, but understands when not to.

## Three real-world scenarios

**Scenario 1: The first reused Falcon 9.**
March 2017. SES-10. The first Falcon 9 to reuse a previously-flown first stage. The booster had flown CRS-8 to ISS in April 2016. Refurbished over months. Re-flew successfully. The launch industry now had to absorb that reusability worked, with paying customers.

**Scenario 2: A booster that flew 20+ times.**
Specific Falcon 9 boosters (tracked by serial number) have flown 20+ missions. Each flight stresses the booster; SpaceX has continued to push the envelope while monitoring telemetry. Eventually individual boosters retire; the program continues with the next set.

**Scenario 3: The fairing fishing.**
SpaceX has used boats with giant nets to catch falling fairings. Not always successful — many fairings hit the water. Water-landing then recovery has proven more reliable. Each recovered fairing is ~$3-6M saved. Operations effort is paid back.

## Common mistakes to avoid

- **Treating reusability as pure cost savings** — it costs payload and refurbishment.
- **Ignoring upper-stage expense** — it's most of Falcon 9 cost.
- **Comparing prices without comparing reliability** — cheap launches that fail aren't cheap.
- **Underestimating manufacturing scale benefits** — they're a big part of SpaceX's cost story.
- **Assuming everyone can copy this** — capital, talent, operational discipline are required.

## Read more

- SpaceX press materials on Falcon 9 economics.
- *The Space Economy* (various 2020s books).
- Industry analyses from Bryce Tech, Quilty, etc.

## Summary

- **Reusability** dramatically lowers first-stage amortized cost.
- **Refurbishment** costs less than rebuilding but isn't free.
- **Payload penalty** ~30% LEO for recoverable mode.
- **Upper stage** is still expendable on Falcon 9 — dominant cost driver.
- **Manufacturing scale and vertical integration** also drive SpaceX's cost advantage.
- **Customer prices** are $60-70M typical Falcon 9; ~$2,500-3,000/kg to LEO.
- **Starship** targets dramatically lower cost via full reusability.

Next: Falcon Heavy and the launch cadence.
