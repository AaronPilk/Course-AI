---
module: 5
position: 1
title: "Simulation to real (sim2real)"
objective: "Transfer simulated policies to real robots."
estimated_minutes: 5
---

# Simulation to real (sim2real)

## The reality gap

Simulator ≠ reality:
- Sensor noise underestimated.
- Friction / damping approximations.
- Compliance, deformation simplified.
- Latency differs.

Policy trained in sim often fails in real.

For: core challenge.

## Domain randomization

Vary sim parameters during training:
```python
friction = uniform(0.1, 1.5)
mass = uniform(0.5, 2.0) * nominal_mass
sensor_noise = uniform(0.0, 0.1)
lighting = random_color()
texture = random_texture()
```

Policy generalizes across params → likely covers real-world.

For: robustness.

## System identification

Measure real robot parameters; tune sim to match:
- Friction, inertia, gear backlash.
- Sensor noise variance.
- Latency.

Reduces gap mathematically.

For: precision.

## Real-world fine-tuning

Pretrain in sim → fine-tune on real:
- Faster than pure real-world RL.
- Recovers sim2real residual.
- Few hours of real data often sufficient.

For: practical sim2real.

## Adaptive controllers

Online adaptation:
- Identify dynamics in deployment.
- Adjust policy parameters.

Robust if model class wide enough.

For: dealing with surprises.

## Visual sim2real

For vision:
- Domain-randomize textures, lighting, camera params.
- Use synthetic + real data jointly.
- Style transfer to make sim images look real.

Often the hardest gap.

For: vision-based policies.

## Real robot data collection

For imitation:
- VR teleoperation (Aloha, NVIDIA Groot).
- Hand-guided.
- Kinesthetic recordings.

5-100 demos often enough with modern methods.

For: bootstrapping.

## Safety in real-robot training

Limits:
- Joint torque caps.
- Workspace box.
- Emergency stop pendant.
- Compliant control (no rigid contact at high speed).

For: don't break $50k hardware.

## Mistakes to avoid

- **No domain randomization.** Brittle.
- **No real fine-tune.** Persistent gap.
- **Same envs every train.** Overfits.

## Summary

- Reality gap is real; sim ≠ reality.
- Domain randomization + sysid + real fine-tune.
- Safety boundaries during deployment.

Next: robot platforms.
