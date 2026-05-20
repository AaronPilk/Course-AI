---
module: 1
position: 1
title: "Orbital flight and delta-v"
objective: "Understand what reaching orbit actually requires."
estimated_minutes: 8
---

# Orbital flight and delta-v

## The puzzle

"Going to space" sounds like "going up." It isn't. Almost all the engineering of orbital rockets is about going *sideways* very fast, not going up. The hard part is not altitude — it's velocity.

This single insight reorganizes everything you'll learn about rockets. Let's get it right at the start.

## The simple version

To reach orbit you have to:

1. Get above most of the atmosphere (~100 km up).
2. Go fast enough sideways that you keep falling around Earth instead of into it (~7.8 km/s at low orbit).

Step 1 is the easy one. Step 2 dominates the engineering. "Delta-v" (Δv) is the rocket-engineer's word for "how much velocity change does this maneuver require." Reaching low Earth orbit requires roughly **9.4 km/s of delta-v** when you account for gravity losses, drag, and steering — even though the orbital velocity itself is only 7.8 km/s.

That gap (1.6 km/s of "losses") is one of the central enemies of rocket engineering.

## The technical version

### Why orbit is sideways

Imagine you fire a cannon horizontally from a very tall mountain. If you fire slowly, the cannonball arcs down and hits the ground. If you fire faster, it arcs further. At a specific speed, the curve of its fall matches the curve of Earth — and the cannonball keeps falling forever without hitting the ground.

That's an orbit. It's a controlled fall, sideways, fast enough that the ground keeps curving away beneath you.

The speed needed at low Earth orbit altitude (200-400 km) is about 7.8 km/s. That's roughly Mach 23. There is no aircraft on Earth that flies that fast, and the difference isn't small — it's the entire challenge.

### Delta-v as the universal currency

Aerospace engineers use **delta-v** (Δv, "change in velocity") to talk about how much capability a maneuver requires. Examples:

- Low Earth orbit (LEO) from surface: ~9.4 km/s.
- LEO to geostationary transfer orbit: ~2.5 km/s.
- LEO to Mars transfer: ~3.6 km/s.
- LEO to Moon landing: ~6.0 km/s round-trip.

A given rocket has a fixed delta-v capability based on its design (we'll see the equation next lesson). The capability has to exceed the required delta-v of the mission. If it doesn't, you don't reach orbit.

### The 9.4 km/s number, broken down

The 9.4 km/s required for LEO breaks down into:

- **~7.8 km/s** — the actual orbital velocity you need at the end.
- **~1.5 km/s** — gravity losses (energy spent fighting gravity while accelerating).
- **~0.1 km/s** — atmospheric drag losses.
- **~0.1 km/s** — steering and ascent profile losses.

Gravity losses are the biggest. They happen because your engines are burning while gravity is dragging you back down. The longer the burn, the more gravity loss. This is why rockets accelerate hard early — every second in the gravity well costs you.

### Why this is hard

To produce 9.4 km/s of delta-v requires a rocket that's roughly **90% propellant by mass**. The rocket itself, plus the payload, plus the engines, plus the structure — all of that is only about 10% of the total mass on the pad.

This is why rockets look the way they do: huge tanks, small payload at the top, engines at the bottom. It's not aesthetic. It's the math forcing the shape.

### What altitude actually buys you

Going up 100 km in altitude requires (in isolation) about 1.4 km/s of delta-v. So why does the total budget say 9.4 km/s?

Because altitude alone isn't orbit. A rocket that just goes straight up to 100 km comes straight back down. Suborbital — what Blue Origin's New Shepard does, what amateur high-altitude balloons technically can't reach. To stay up, you need the sideways velocity.

This is also why "the Karman line is 100 km" doesn't make something an orbital rocket. Reaching 100 km is the easy part; staying there is the hard part.

### Orbits at different altitudes

A higher orbit doesn't require dramatically more orbital velocity — actually slightly less, because gravity is weaker further out. But it requires more delta-v to *get there*, because you have to lift the rocket higher before you accelerate sideways.

- LEO (200-400 km): orbital velocity ~7.8 km/s.
- Medium Earth orbit (~2000-20000 km): orbital velocity 6-3 km/s.
- Geostationary (~35,786 km): orbital velocity ~3.1 km/s.

The delta-v cost to *reach* GEO from the surface is ~12-13 km/s. The orbital velocity itself is lower, but climbing the gravity well costs energy.

### Earth rotation helps

Earth rotates eastward at ~0.5 km/s at the equator. If you launch eastward from the equator, you get that 0.5 km/s for free. If you launch westward (rare), you have to pay an extra 0.5 km/s.

This is why launch sites are often near the equator (Cape Canaveral is at ~28° N, getting most of the benefit; French Guiana's Kourou is at 5° N, getting nearly all of it). Boca Chica in Texas, where SpaceX launches Starship, is at ~26° N.

Polar orbits (orbits that go over the poles, useful for observation satellites) get less help from Earth's rotation, so launches into polar orbits have higher delta-v cost. Vandenberg in California is used for polar launches.

### Why not airplanes-to-space

A common question: why not use a plane to get a rocket above the atmosphere, then launch the rocket? Some companies (Virgin Orbit, Stratolaunch) have tried this.

The math: a plane can give you maybe 0.3 km/s of velocity and reduce gravity losses slightly. Out of a 9.4 km/s budget, that's a 5-8% saving. Not nothing, but not enough to fundamentally change the economics. The complexity of mating a rocket to a giant aircraft often costs more than the saving.

This is why pure ground-launched rockets dominate.

### Why not space elevators / ramps / mass drivers

Various exotic schemes (space elevators, electromagnetic launch tracks, etc.) get proposed. They're physically possible at some level but currently massively impractical because of materials and infrastructure costs.

For now and the foreseeable future: chemical rockets, going sideways fast.

## Three real-world scenarios

**Scenario 1: Why Falcon 9 doesn't reach Mars in one shot.**
Falcon 9's total delta-v capability is enough to deliver a useful payload to LEO and a much smaller payload to GEO. Mars transfer requires ~3.6 km/s more delta-v from LEO, which a Falcon 9 second stage can do for small probes but not for human-class payloads. Starship is designed for the higher delta-v missions.

**Scenario 2: The amateur "we'll reach space" pitch.**
A startup says they'll reach space with a small rocket. Investors should ask: what altitude, and what velocity at that altitude? If the answer is "100 km altitude, low velocity" — that's suborbital, fundamentally different from orbital. Orbital launch is roughly 10× harder in delta-v terms.

**Scenario 3: Why some satellites need multiple launches to reach destination.**
A satellite headed for the Moon doesn't launch directly. It typically goes to LEO first, then a transfer orbit, then circularizes at the Moon. Each step has its own delta-v budget. The launch vehicle delivers it to LEO; the satellite's own engines handle the rest.

## Common mistakes to avoid

- **Confusing altitude with orbit** — getting to 100 km is not the same as orbiting.
- **Forgetting losses** — orbital velocity isn't the total delta-v; gravity and drag add ~1.6 km/s.
- **Underestimating how hard orbital is vs. suborbital** — it's roughly 10× more energy.
- **Ignoring Earth rotation** — launch site latitude matters.
- **Comparing rocket sizes by altitude reached** — what matters is delta-v capability with payload.

## Read more

- *Rocket Propulsion Elements* by Sutton — the standard text.
- NASA's "Beginner's Guide to Rockets" — accessible intro.
- *Ignition!* by John Clark — propellant history, classic.

## Summary

- **Orbit is sideways**, not up. You need ~7.8 km/s of horizontal velocity at LEO altitude.
- **Delta-v** is the rocket-engineer's currency. LEO requires ~9.4 km/s including losses.
- **Gravity losses** dominate non-velocity costs.
- **Rockets are ~90% propellant** by mass because of the math we'll see next lesson.
- **Higher orbits** are harder to reach but require lower orbital velocity once there.
- **Earth rotation** gives you ~0.5 km/s if you launch eastward from low latitudes.

Next: the equation that turns this physics into rocket design.
