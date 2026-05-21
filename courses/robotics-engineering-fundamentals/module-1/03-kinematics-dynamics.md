---
module: 1
position: 3
title: "Kinematics + dynamics"
objective: "Master the math of robot motion."
estimated_minutes: 5
---

# Kinematics + dynamics

## Forward kinematics

Given joint angles, compute end-effector pose:
```
joints (θ₁, θ₂, θ₃, ...) → end-effector position (x, y, z) + orientation
```

For robot arm, chain transformations from base to end:
```
T_final = T₁ × T₂ × T₃ × ... × Tₙ
```

Each Tᵢ is a 4x4 homogeneous transformation matrix.

For: predicting tool pose.

## Inverse kinematics (IK)

Given desired end-effector pose, find joint angles:
```
(x, y, z, R) → (θ₁, θ₂, θ₃, ...)
```

Hard problem: multiple solutions, singularities, no closed-form for 6+ DoF.

Solvers: KDL, TRAC-IK, MoveIt's KinematicsBase.

For: telling robot where to put hand.

## DH parameters

Denavit-Hartenberg: standard way to describe robot kinematic chain. Four parameters per joint: link length, offset, angle, twist.

URDF (Unified Robot Description Format) is XML alternative used in ROS.

For: robot models.

## Dynamics

Beyond positions: forces + torques.
```
τ = M(q)q̈ + C(q,q̇)q̇ + G(q) + F_external
```

Where:
- τ: joint torques.
- M: inertia matrix.
- C: Coriolis/centrifugal.
- G: gravity.
- F_external: external forces.

For: predicting motion under forces.

## Why dynamics matter

Lightweight robot: kinematics + PID suffice.
High-speed / heavy robot: must model dynamics:
- Feedforward torques for speed.
- Compensate gravity automatically.
- Plan within actuator limits.

For: performance.

## Jacobian

J maps joint velocities to end-effector velocities:
```
v_endeffector = J(q) × q̇
```

Used for:
- Velocity control.
- Singularity detection.
- Force / torque transformation.

For: workspace control.

## Singularities

Configurations where Jacobian loses rank → can't move in some direction.

Example: arm fully extended → can't move along arm axis.

Plan around singularities.

For: avoiding traps.

## Workspace

The set of poses an end-effector can reach. Different for each robot.

UR5: 850mm sphere minus base.
Quadcopter: full 3D (limited by altitude).
Humanoid arm: torso-relative reach.

For: design feasibility.

## Holonomic vs. non-holonomic

- **Holonomic.** All velocities independently controllable (omni-directional wheel robot).
- **Non-holonomic.** Constrained motion (car-like; can't move sideways instantly).

Affects planning algorithm choice.

For: motion design.

## DH vs. URDF in practice

ROS uses URDF (XML) describing links + joints. Visualize with RViz.

Most simulators (Gazebo, Isaac Sim) consume URDF.

For: standard interop.

## Mistakes to avoid

- **Ignoring singularities.** Robot freezes / shakes.
- **Wrong sign in Jacobian.** Wrong direction movement.
- **Real-time dynamics on slow CPU.** Misses control deadline.

## Summary

- Forward kinematics: joints → pose.
- Inverse kinematics: pose → joints (hard, multi-solution).
- Dynamics: forces, torques, equations of motion.
- Jacobian relates joint + end-effector velocities.
- Avoid singularities.

Next: coordinate frames + TF.
