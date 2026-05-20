---
module: 5
position: 2
title: "Iterative engineering — testing in the open"
objective: "Understand SpaceX's development culture and tradeoffs."
estimated_minutes: 8
---

# Iterative engineering — testing in the open

## The puzzle

SpaceX develops rockets by building, testing, sometimes blowing up, learning, and iterating. Falcon 1's first three launches failed before the fourth succeeded. Falcon 9's first booster recovery attempts failed before success. Multiple Starship test articles ended in explosions. This is normal for SpaceX. It would be career-ending in legacy aerospace.

Why does it work? When does it not?

## The simple version

SpaceX's development culture:

1. **Build hardware fast** at relatively low cost per unit.
2. **Test in conditions that mimic real flight**.
3. **Lose some hardware** as the cost of learning.
4. **Apply learnings** to the next iteration.
5. **Iterate weekly or monthly** rather than yearly.

The pattern requires hardware cheap enough to lose, a culture that accepts failure as learning, and capital backing that can absorb visible setbacks.

The benefits: faster development, more real-world data, better final products. The risks: public optics, regulatory friction, occasional catastrophic loss.

## The technical version

### Where iteration works

Hardware iteration works well when:

- **Hardware cost per unit is low enough** that losing a vehicle is recoverable.
- **Failure modes are observable** (telemetry, video, post-mortem analysis).
- **Iteration cycle time is fast** (months not years).
- **Culture rewards learning from failure** rather than punishing it.
- **Capital backing tolerates visible setbacks**.

SpaceX checks all five boxes for stainless-steel Starship development. Their stainless steel and Raptor cost reductions made Starship hardware cheap enough to lose. Their telemetry and analysis capabilities let them extract lessons from each failure. Their iteration cadence is high. The culture is iteration-oriented. SpaceX/Musk's capital structure tolerates public setbacks.

### Where iteration doesn't work

Hardware iteration breaks down when:

- **Hardware is expensive** ($300M+ per unit makes loss impossible to recover from politically).
- **Failure modes are unclear** (hard to learn from disasters without telemetry).
- **Iteration cycle is slow** (multi-year cycles wash out the learning advantage).
- **Culture punishes failure** (engineers hide problems).
- **Capital structure can't tolerate visible setbacks** (publicly-traded, congressional oversight, etc.).

Legacy aerospace tends to break on most of these. SLS development took ~15+ years and ~$30B+ before first launch — the iteration cycle is too slow to apply learning effectively.

### The Falcon 1 lessons

SpaceX's first rocket, Falcon 1, had four launch attempts. Flight 1 (March 2006) failed due to a fuel leak fire. Flight 2 (March 2007) failed due to a slosh-driven coupling. Flight 3 (August 2008) failed during stage separation. Flight 4 (September 2008) succeeded. SpaceX was within months of bankruptcy.

Each failure produced specific engineering changes. Each next attempt was different. This was iterative development applied to orbital launch.

The pattern continued into Falcon 9: early launches had anomalies; engineers improved; current Falcon 9 has very high mission success rate.

### Starship test campaigns

Starship development has gone through:

- **Starhopper** (2019): brief hops to test Raptor.
- **SN-series prototypes** (SN1-SN15+): full-scale Starship test articles. Multiple explosions during static fire, hop tests, and landing attempts. SN15 first successful soft landing (May 2021).
- **Orbital Starship tests** (S20+): full Super Heavy + Starship stack. Multiple anomalies and full vehicle losses. Booster catch achieved 2024+. Tile retention improved iteratively.
- **Operational Starship missions** (2025-2026 and beyond): targeted as routine launches.

Each test campaign cost real vehicles. The lessons accumulated: tile attachment, engine restart reliability, atmospheric maneuvering, propellant management, control software.

### The Tesla-SpaceX iteration overlap

Both Tesla and SpaceX practice iterative development. Tesla on cars; SpaceX on rockets. Both companies:

- Build hardware fast.
- Test in real conditions.
- Iterate based on data.
- Accept some hardware loss as cost of learning.
- Don't wait for perfect designs before manufacturing.

The cultural and operational pattern transfers between the two companies. Engineers move between them. Practices spread.

### How iteration shapes design

When you know you'll iterate, you design differently:

- **Modular components** that can be swapped out.
- **Telemetry-rich systems** that produce learning data.
- **Margin** sufficient to survive small unknown failures.
- **Standardization** so improvements deploy across fleet.
- **Documentation** that captures what was learned.

SpaceX has invested in all of these. The infrastructure for iteration is itself a competitive capability.

### Iteration cost economics

The implicit calculation: cost per failure × probability of failure × value of learning > savings from avoiding failure.

For SpaceX:

- Starship hardware cost ~$20M each (estimate).
- Iteration cycle ~months.
- Learning per failure substantial.
- Time saved on traditional development phases significant.

Net: iteration pays back. Compared to legacy approach (extensive modeling and analysis to avoid failure, then expensive flight test, then often still find problems): iteration is faster and cheaper overall.

But this only works because Starship hardware is cheap. Legacy aerospace can't iterate the same way because hardware costs are too high per unit.

### Public optics of failure

SpaceX's Starship test failures are public. Videos of explosions circulate widely. Critics frame them as "blowing up rockets." Defenders frame them as iterative engineering.

SpaceX has been remarkably consistent in framing: failures are expected, learning is the goal, success comes from iteration. This communication discipline has shifted public expectations — Starship explosions during testing don't trigger the same crisis response as legacy aerospace failures.

The optics matter because:

- Customers (NASA, DoD, commercial) need confidence in operational reliability.
- Investors need confidence in trajectory.
- Regulators need confidence in safety processes.
- Public perception affects political support.

SpaceX manages this through transparency, technical communication, and demonstrating progress between failures.

### Regulatory friction

Iterative testing creates regulatory friction:

- **FAA launch licenses**: each failure can trigger investigation and license modification.
- **Environmental reviews**: especially for Starship's coastal environmental impact.
- **Air space and sea space restrictions**: during tests.
- **Crew safety certifications**: more conservative for human-rated systems.

SpaceX has worked through these by engaging early, providing data, and adjusting operations based on agency feedback. Not always smoothly, but workably.

### The "tower catch" iteration

Booster catch by tower chopsticks is a striking example of iteration:

- **First attempt** (late 2024): successful catch on the first try after years of preparation.
- **Subsequent attempts**: increasingly reliable.
- **Iterations on the technique**: adjusting approach trajectories, throttle profiles, tower control systems.

Each successful catch validates more of the architecture. Each unsuccessful catch (if any) would inform changes. The iteration cycle for catches is fast because the tower itself is reusable infrastructure.

### Critical mass for iteration

For iterative engineering to deliver:

- **Manufacturing scale** must support hardware cost reductions.
- **Test infrastructure** must support frequent tests.
- **Telemetry capability** must produce actionable learning.
- **Engineering throughput** must apply learnings between iterations.
- **Cultural alignment** must sustain through visible failures.

Companies that have one or two of these but not all struggle. SpaceX has built all five over years. New entrants must develop them.

### The Apollo comparison

Apollo Lunar Module development used some iteration (testing different lander concepts, prototype hardware) but most learning came from extensive analysis and ground testing. Apollo's pace was set by analytical confidence, not iterative testing.

Starship's pace is set by iterative testing — they don't wait for perfect analysis before flying. The result is faster development but different risk profile.

Both approaches have produced spaceflight successes. Iteration is one approach among several, suited to certain conditions (cheap hardware, telemetry-rich, fast cycles, culture of learning).

### When SpaceX doesn't iterate

Some SpaceX systems get more traditional engineering:

- **Crew Dragon life support**: extensive analysis and testing before crew flights.
- **Crew Dragon abort system**: not iterated through failures.
- **Engine certification**: thoroughly tested before each booster's flight.
- **Software flight code**: extensive verification before deploy.

SpaceX picks where to iterate and where to be more careful. Iteration where hardware can be lost; traditional engineering where lives or strategic missions are at stake.

## Three real-world scenarios

**Scenario 1: The fourth Falcon 1 launch.**
2008. SpaceX had failed three Falcon 1 launches and was running out of cash. Fourth flight was do-or-die. It succeeded. The iteration paid off; SpaceX survived; Musk has called this period the closest to bankruptcy. Iterative engineering produces survival when most needed if you can sustain through the early failures.

**Scenario 2: The Starship tile improvement.**
Early Starship reentries lost significant tiles. SpaceX investigated each failure pattern: tile attachment issues, geometry problems, peak heating concerns. Each subsequent flight had improved tile retention. Operational reuse becomes feasible only when tile retention is reliable — iteration is closing that gap.

**Scenario 3: A development decision avoiding iteration.**
SpaceX's Crew Dragon program followed more conservative development than Starship — extensive analysis, ground testing, in-flight abort demonstration before crew flights. They didn't iterate through crew flights with intentional failures. The choice tracked risk: crew lives at stake, no iteration appropriate.

## Common mistakes to avoid

- **Treating iteration as universally applicable** — sometimes traditional engineering is right.
- **Underestimating the infrastructure for iteration** — telemetry, manufacturing, analysis.
- **Ignoring the political cost of public failure** — managing optics matters.
- **Misreading SpaceX's culture** — it's iteration plus rigor where appropriate.
- **Assuming everyone can iterate the same way** — capital and culture differ.

## Read more

- *Liftoff* by Eric Berger — Falcon 1 development.
- *Reentry* by Eric Berger — Starship development.
- Walter Isaacson's Musk biography — cultural context.

## Summary

- **Iterative engineering**: build, test, fail, learn, repeat.
- **Works when**: hardware is cheap, failure modes observable, cycles fast, culture aligned.
- **Doesn't work when**: hardware expensive, cycles slow, culture punishes failure.
- **SpaceX has invested** in all infrastructure required for iteration.
- **Public optics** of failure is manageable through communication.
- **Regulatory friction** is real but workable.
- **Not all SpaceX systems iterate** — crew systems are more conservative.
- **Iteration is a competitive capability**, not just a development approach.

Next: the risks of SpaceX's overall approach.
