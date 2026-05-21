---
module: 4
position: 4
title: "Reinforcement learning for control"
objective: "Learn control policies from experience."
estimated_minutes: 5
---

# Reinforcement learning for control

## When RL beats classical

Classical control fails when:
- Dynamics too complex to model (cloth, fluids).
- Many DoF (humanoids).
- Contact-rich (manipulation).
- Need to learn from demonstrations.

RL: learn policy from trial + reward.

For: hard control problems.

## RL basics

```
state s_t → policy π(a|s) → action a_t
                                ↓
                            environment
                                ↓
                          next state s_{t+1}, reward r_t
```

Goal: maximize expected discounted reward.

For: framework.

## Modern algorithms

- **PPO (Proximal Policy Optimization).** On-policy; robust + popular.
- **SAC (Soft Actor-Critic).** Off-policy; sample-efficient.
- **TD3.** Continuous control.
- **DreamerV3.** Model-based; sample-efficient.

PPO is workhorse for robotics RL.

For: choosing.

## Simulation-first

RL needs millions of trials. Must use simulator:
- **NVIDIA Isaac Gym / Sim.** GPU-accelerated; 1000+ parallel envs.
- **Mujoco / MJX.** Fast physics.
- **Gazebo.** Slower but realistic.

Train in sim → deploy to real.

For: practical RL.

## Reward shaping

Sparse reward (only at goal): hard to learn.
Dense reward (per-step shaping): easier but biases solution.

```python
# Sparse
reward = 1 if at_goal else 0

# Dense
reward = -distance_to_goal - 0.1 * energy + 5 if at_goal else 0
```

For: training success.

## Domain randomization

Vary sim parameters to span real-world possibilities:
- Friction coefficients.
- Mass / inertia.
- Sensor noise levels.
- Lighting / textures (visual).

Policy generalizes to real-world variation.

For: sim2real.

## Imitation learning

Learn from human demos:
- **Behavior cloning.** Supervised learning on demo data.
- **GAIL.** Generative Adversarial Imitation Learning.
- **DAgger.** Iterative data aggregation.

Faster than pure RL when demos available.

For: bootstrapping policies.

## Hierarchical RL

Decompose:
- High level: choose sub-goal ("walk to door").
- Low level: motor commands.

Each level learned separately.

For: long-horizon tasks.

## RL in robotics today

Industrial uses:
- **Boston Dynamics Atlas.** Backflip, dancing.
- **Tesla Optimus.** Walking gait.
- **DeepMind RT-2.** Vision-language-action models.
- **Sergey Levine's lab.** Manipulation breakthroughs.

Commercial: still mostly classical + RL polish.

For: state of art.

## Foundation models

VLA (Vision-Language-Action) models:
- Trained on internet-scale data + robot demos.
- Generalize across tasks.
- Examples: RT-2, OpenVLA, Octo.

Emerging paradigm; 2024+ shows promise.

For: future.

## Practical considerations

- Real-robot RL takes weeks/months → unreliable.
- Sim2real often best.
- Hybrid: RL on top of classical baseline.
- Demos compress training.

For: realistic adoption.

## Mistakes to avoid

- **Pure RL from scratch.** Slow.
- **Bad reward design.** Local optima.
- **No domain randomization.** Sim2real gap.
- **Ignore safety during deployment.** Crashes.

## Summary

- RL for problems hard to model classically.
- PPO/SAC/TD3 modern algorithms.
- Sim-first (Isaac Gym, Mujoco) for sample efficiency.
- Domain randomization bridges sim2real.
- Imitation + RL hybrid is practical sweet spot.
- VLA foundation models = emerging frontier.

Module 4 complete. Module 5: deployment.
