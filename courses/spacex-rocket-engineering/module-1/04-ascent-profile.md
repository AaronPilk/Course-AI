---
module: 1
position: 4
title: "Trajectory, gravity losses, and ascent profile"
objective: "Track how a rocket actually gets to orbit."
estimated_minutes: 8
---

# Trajectory, gravity losses, and ascent profile

## The puzzle

A rocket doesn't just go straight up. Watch any launch and you'll see it tilt over within seconds, then curve away horizontally for most of the flight. By the time the first stage cuts off, the rocket is mostly flying sideways with relatively little vertical velocity remaining.

Why this specific curve? Why not go straight up, then turn at altitude? Why not 45 degrees the whole way? The ascent profile is the result of a specific optimization, and understanding it explains a lot about how rockets fly.

## The simple version

The optimal ascent profile:

1. **Vertical liftoff** for the first few seconds to clear the pad and gain a bit of altitude.
2. **Pitchover maneuver** to tilt the rocket slightly off-vertical, starting the turn.
3. **Gravity turn** — the rocket follows a curve set by gravity itself, slowly tilting horizontal as it accelerates.
4. **Throttle and engine cutoff** events tuned to hit the right velocity at the right altitude.
5. **Coast phase** if needed, then upper stage burn to orbital velocity.

The whole profile minimizes "gravity losses" (the cost of fighting gravity while accelerating) and "drag losses" (the cost of pushing through atmosphere). Every choice — when to throttle, when to pitch, when to cut off — is tuned to deliver maximum payload to the target orbit.

## The technical version

### Gravity loss in detail

Gravity loss is the amount of velocity you "lose" because you're burning your engine in a gravity field. If a rocket accelerates at 1g (9.81 m/s²) for 100 seconds while pointing straight up, it gains some velocity from the engine — but gravity is pulling it back at 1g the whole time. Net velocity gain = engine thrust minus gravity.

The total gravity loss during a burn is approximately:

```
ΔV_gravity = ∫ g × sin(θ) dt
```

where θ is the angle above horizontal (90° = vertical, 0° = horizontal) and t is burn time.

Key implications:

- **Vertical burns** have maximum gravity loss. Every second pointing up costs 9.81 m/s of velocity.
- **Horizontal burns** have zero gravity loss (sin(0) = 0).
- **Long burns** cost more than short burns at the same thrust.
- **High thrust** (high acceleration) reduces gravity loss because burn time shortens.

This is why rockets accelerate hard and turn horizontal as soon as practical.

### Drag loss

Atmospheric drag pushes back on a rocket moving through air. Drag force scales with velocity squared and air density. The famous "Max-Q" moment is when the product (dynamic pressure) is highest — usually about 60-90 seconds into flight, around 12-15 km altitude.

Drag losses for a typical orbital rocket: ~0.1-0.2 km/s. Significant but smaller than gravity losses.

Mitigations:

- **Aerodynamic shape**: pointy nose, smooth body, fairings around payload.
- **Throttle down at Max-Q**: reduce stress on the rocket during peak drag.
- **Trajectory choice**: ascend through atmosphere efficiently but quickly.

Falcon 9 throttles down during Max-Q, then back up after — visible in launch telemetry.

### The pitchover maneuver

Right after liftoff (typically 5-10 seconds in), the rocket performs a small pitchover: tilts a few degrees off-vertical. From then on, the rocket follows a "gravity turn" — gravity itself does most of the steering as the rocket accelerates.

The pitchover is critical: too aggressive and the rocket flies horizontal too early (high drag, can't reach altitude). Too gentle and the rocket flies too vertical (high gravity loss, wasted propellant). Each launch has a precisely-tuned pitchover angle.

### The gravity turn

After pitchover, the rocket doesn't have to actively steer much. Gravity pulls it slightly downward, which combined with its forward velocity naturally curves the trajectory. The rocket's nose stays aligned with the velocity vector (the direction it's moving).

This is the most fuel-efficient ascent: the rocket isn't fighting itself by steering against the velocity vector. The engines just push along the path, and gravity does the curving.

By the time first-stage cutoff happens (~2.5 minutes into a Falcon 9 launch), the rocket is mostly horizontal at ~70 km altitude, moving at ~7,000-8,000 km/h.

### Why not straight up

If you launch straight up and then try to turn horizontal at altitude, you waste enormous propellant fighting gravity during the vertical burn. The instantaneous-rotation-at-altitude trajectory is mathematically possible but uses far more fuel than a gravity turn.

Plus, going straight up requires you to *also* accelerate sideways from a standstill at altitude. Doing both costs more than spreading the velocity gains throughout the ascent.

### Why not 45 degrees throughout

Constant 45° ascent sounds intuitive but is suboptimal. You'd be losing gravity loss the whole way (sin(45°) = 0.707, so 70% of your engine output fights gravity vertically), and you wouldn't be optimizing the altitude/velocity tradeoff at each point.

The gravity turn naturally produces the right curve for the rocket's specific thrust-to-weight ratio. There's no manual angle schedule needed — physics steers.

### Throttle profile

Modern rockets vary their throttle through ascent:

- **Liftoff**: 100% thrust to overcome gravity and clear the pad fast.
- **Max-Q (60-90s)**: throttle down to 70-80% to reduce stress.
- **Post-Max-Q**: throttle back to 100% for maximum delta-v.
- **Late first stage**: may throttle down to keep G-loads tolerable for crew or payload.
- **Booster cutoff**: precise shutdown at calculated velocity.

The Saturn V famously throttled down its center engine during max-Q. Falcon 9 throttles all 9 engines together for Max-Q management.

### Engine cutoff and staging

First-stage cutoff (MECO — Main Engine Cutoff) happens at a precise moment chosen to:

- Achieve the right velocity for the upper stage to take over.
- Leave enough fuel margin for any contingencies.
- For reusable boosters: leave enough fuel for return-to-launch-site or drone-ship return.

Staging happens seconds later (clean separation). Upper stage ignites, continues to orbit.

### The Earth's rotation contribution

We mentioned this in Lesson 1: Earth's rotation gives you ~0.46 km/s if you launch eastward from the equator. The contribution falls with latitude:

- **0° latitude**: full 0.46 km/s benefit (eastward).
- **28° latitude** (Cape Canaveral): ~0.41 km/s.
- **45° latitude**: ~0.33 km/s.
- **90° latitude (pole)**: 0 km/s.

For polar orbits (launching into a north-south orbit), Earth's rotation doesn't help — you need the full delta-v from the rocket. Vandenberg Air Force Base in California is used for polar launches.

For high-inclination launches (orbits that go between equator and poles), partial help.

For geostationary missions, you want to launch as close to the equator as possible to minimize the inclination change needed later.

### The "gravity well" framing

Engineers sometimes describe Earth's gravity as a "gravity well" — a metaphor for the energy you have to spend to escape. Reaching LEO requires climbing partway out of the well. Reaching the Moon requires more. Reaching escape velocity from the solar system (currently only Voyager probes have achieved this from Earth) requires even more.

Each step out of the well costs delta-v. The deeper you start (closer to the surface), the more it costs. This is why launch from the surface is hard and why ideas about "starting from orbit" make some missions much cheaper.

### Trajectories beyond orbit

The ascent profile we've described is for reaching low Earth orbit. Higher orbits or planetary missions require additional burns:

- **Geostationary transfer orbit (GTO)**: rocket delivers payload to an elliptical orbit; payload uses its own engine to circularize at GEO.
- **Lunar transfer**: rocket delivers to LEO, then a translunar injection burn boosts toward Moon.
- **Mars transfer**: similar pattern, with a Mars injection burn.

Each phase has its own optimal trajectory. The Hohmann transfer (a specific elliptical orbit between two circular orbits) is the most fuel-efficient transfer between coplanar orbits. Real missions sometimes use gravitational assists (slingshot maneuvers around planets) to save more delta-v.

### The Falcon 9 ascent profile in numbers

Approximate timeline for a typical Falcon 9 LEO mission:

- **T+0**: Liftoff, 9 Merlin engines at ~7,600 kN total thrust.
- **T+10s**: Pitchover begins.
- **T+60-90s**: Max-Q, throttles to ~70%.
- **T+90-120s**: Max-Q past, throttle back to 100%.
- **T+150s**: Approaching MECO at ~70 km altitude.
- **T+155s**: MECO and stage separation.
- **T+165s**: Stage 2 ignition.
- **T+8-9 min**: Stage 2 cutoff, orbit reached.

For booster recovery, stage 1 then performs boost-back, entry, and landing burns, touching down ~9 minutes after launch.

## Three real-world scenarios

**Scenario 1: Why Falcon Heavy boosters land at Cape Canaveral together.**
On Falcon Heavy's first Tesla Roadster launch, the two side boosters separated, returned to land at Cape Canaveral, and touched down side by side. This was possible because their ascent profile sent them on a trajectory that boost-back could reverse with enough fuel. The center core continued downrange and attempted a drone ship landing (which failed on that mission — first stage center cores are harder than sides).

**Scenario 2: The polar launch from Vandenberg.**
A satellite needs polar orbit. Launching from Cape Canaveral (28° N) eastward would put it in the wrong inclination — you'd have to change inclination after orbit insertion, costing huge delta-v. Vandenberg launches southward over the Pacific Ocean (no landmass overflight risk), giving the right inclination but losing Earth-rotation benefit. Tradeoff: pay the Earth-rotation cost upfront to avoid the inclination-change cost later.

**Scenario 3: The aborted launch.**
Falcon 9 has aborted launches on the pad due to engine telemetry issues. The flight computer detects a problem, automatically scrubs, vents propellant, safes the rocket. This is a feature, not a failure — orbital rockets have so many failure modes that aborting on the ground beats losing the rocket in flight.

## Common mistakes to avoid

- **Thinking rockets go "straight up"** — they go sideways for most of the flight.
- **Ignoring gravity losses** — vertical burns are expensive.
- **Forgetting Max-Q stress** — engines throttle down for a reason.
- **Underestimating Earth-rotation contribution** — it's a significant gift for east-launching equatorial sites.
- **Confusing LEO ascent with planetary trajectory** — planetary missions need separate transfer phases.

## Read more

- *Orbital Mechanics for Engineering Students* — proper textbook treatment.
- NASA's "Launch Trajectory" pages.
- Scott Manley YouTube videos — excellent visual explanations.

## Summary

- **Vertical liftoff, pitchover, gravity turn, MECO, staging, second stage burn, orbit.**
- **Gravity losses** dominate when you point vertical for too long.
- **Drag losses** peak at Max-Q (~60-90s, ~12-15 km altitude).
- **Earth's rotation** gives you ~0.46 km/s eastward at the equator.
- **Optimal ascent** is a gravity turn, not constant angle.
- **Throttle profile** manages stress at Max-Q and acceleration limits.
- **Higher orbits and planetary missions** add transfer burns after LEO.

That wraps Module 1. Next module: engines and propellants.
