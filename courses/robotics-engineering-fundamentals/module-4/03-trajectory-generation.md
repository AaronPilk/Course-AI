---
module: 4
position: 3
title: "Trajectory generation"
objective: "Generate smooth, executable trajectories."
estimated_minutes: 5
---

# Trajectory generation

## Path vs. trajectory

- **Path.** Geometric: sequence of positions.
- **Trajectory.** Path + time: position(t), velocity(t), acceleration(t).

Path = "go here, then here." Trajectory = "be here at t=1, here at t=2."

For: temporal motion.

## Smoothness

Robots can't change velocity instantly. Smooth trajectories:
- **Continuous position.** No teleports.
- **Continuous velocity.** No instant direction change.
- **Continuous acceleration.** No infinite forces.
- **Continuous jerk (= da/dt).** Smoother motors.

Higher continuity = smoother motion + less wear.

For: motion quality.

## Polynomial trajectories

Quintic (5th order) polynomial:
```
position(t) = a0 + a1·t + a2·t² + a3·t³ + a4·t⁴ + a5·t⁵
```

6 coefficients solve for boundary conditions: start/end position, velocity, acceleration.

For: arm motion segments.

## Trapezoidal velocity profile

```
velocity
   ▲
   │   ────────
   │  ╱        ╲
   │ ╱          ╲
   └──────────────► time
   accelerate cruise decelerate
```

Simple; respects max velocity + acceleration.

For: industrial robots.

## S-curve / jerk-limited

Smooths corners of trapezoidal profile. Slower but gentler on hardware.

For: precision manipulation.

## Splines

Cubic / quintic splines connect waypoints smoothly.

```python
from scipy.interpolate import CubicSpline

t_pts = [0, 1, 2, 3]
positions = [0, 1, 4, 2]
spline = CubicSpline(t_pts, positions)
```

For: waypoint sequences.

## Time parameterization

Given path, compute timing:
- **TOTG (Time-Optimal Trajectory Generation).** Minimize total time given constraints.
- **TOTP.** Respect velocity / acceleration limits.

For: fast execution.

## MoveIt time parameterization

```python
plan = panda.plan()
# Plan now has time-parameterized trajectory
panda.execute(plan)
```

MoveIt handles internally.

For: production simplicity.

## ros2_control trajectory controller

```python
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint

trajectory = JointTrajectory()
trajectory.joint_names = ['joint1', 'joint2', 'joint3']

point = JointTrajectoryPoint()
point.positions = [0.5, 0.3, 0.2]
point.velocities = [0.0, 0.0, 0.0]
point.time_from_start = Duration(sec=2)
trajectory.points.append(point)
```

Send to JointTrajectoryController.

For: real robot execution.

## Replan during motion

Dynamic obstacles → blocked path → replan:
- Stop current trajectory.
- Compute new plan from current state.
- Smoothly transition.

For: dynamic environments.

## Mobile robot trajectories

Differential drive: forward velocity + angular velocity.
```python
twist = Twist()
twist.linear.x = 0.5    # m/s
twist.angular.z = 0.2   # rad/s
cmd_vel_pub.publish(twist)
```

Higher-level: planners (DWB, MPPI) compute these from path.

For: mobile robot motion.

## Quintic vs. cubic

Quintic: smooth jerk (5 continuous derivatives).
Cubic: smooth velocity but jerk discontinuous.

Choose by quality vs. compute.

For: tradeoff awareness.

## Mistakes to avoid

- **Ignoring velocity limits.** Tries to teleport.
- **Sharp transitions.** Damages motors.
- **Open-loop execution.** Disturbances diverge trajectory.

## Summary

- Path = positions; trajectory = positions + time.
- Smooth: continuous position/velocity/acceleration/jerk.
- Trapezoidal / S-curve / quintic for shapes.
- MoveIt handles time parameterization.
- JointTrajectoryController executes on real robots.

Next: reinforcement learning for control.
