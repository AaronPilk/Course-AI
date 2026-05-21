---
module: 4
position: 1
title: "Path planning algorithms"
objective: "Get from A to B avoiding obstacles."
estimated_minutes: 5
---

# Path planning algorithms

## Configuration space

C-space: each point = full robot configuration (joint angles or pose).

For 2DOF arm: 2D C-space.
For mobile robot: 3D (x, y, θ).
For 6DOF arm: 6D.

Obstacles → forbidden regions in C-space.

For: planning abstraction.

## Grid-based: A*

Discretize C-space into grid. A* heuristic search:
```
f(n) = g(n) + h(n)
       cost    heuristic
```

Optimal in finite grids. Standard for 2D mobile robot.

For: classic grid search.

## Dijkstra

Like A* but no heuristic (h=0). Slower but always optimal.

For: where heuristic unavailable.

## RRT (Rapidly-exploring Random Tree)

Sampling-based; great in high-DOF:
```
1. Sample random configuration.
2. Find nearest in tree.
3. Extend tree toward sample.
4. Repeat until goal reached.
```

Probabilistically complete; not always optimal.

For: high-dim spaces.

## RRT*

Optimal variant of RRT: rewires tree to find better paths over time.

For: optimality + scalability.

## PRM (Probabilistic Roadmap)

Pre-build roadmap; query many goals against it.

For: known environments, multiple queries.

## Lattice planners

State lattice: pre-computed primitives.

Used in: autonomous driving (smooth car-like trajectories).

For: vehicle planning.

## CHOMP / TrajOpt

Trajectory optimization: start with rough path; optimize for smoothness + collision-free.

For: smooth motion.

## MoveIt 2

ROS 2 motion planning framework. Wraps OMPL (Open Motion Planning Library):
```python
from moveit_py import MoveItPy

moveit = MoveItPy(node_name='moveit_py')
panda = moveit.get_planning_component('panda_arm')
panda.set_goal_state(configuration_name='extended')
plan = panda.plan()
robot.execute(plan)
```

For: production arm planning.

## Nav2

ROS 2 navigation stack for mobile robots:
- Global planner (NavFn, SmacPlanner).
- Local planner (DWB, MPPI).
- Costmaps.
- Recovery behaviors.

```bash
ros2 launch nav2_bringup tb3_simulation_launch.py
```

For: standard mobile robot navigation.

## Mistakes to avoid

- **Wrong heuristic.** Slow or incomplete.
- **Coarse grid for fine motion.** Misses solutions.
- **No re-planning.** Dynamic obstacles cause crash.

## Summary

- C-space abstracts planning.
- A* for grids; RRT/RRT* for high-DOF.
- MoveIt for arms; Nav2 for mobile.
- Re-plan continuously for dynamic environments.

Next: PID controllers.
