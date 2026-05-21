---
module: 3
position: 4
title: "SLAM"
objective: "Simultaneous Localization And Mapping."
estimated_minutes: 5
---

# SLAM

## What SLAM is

Two interlocked problems solved together:
- **Localization.** Where am I?
- **Mapping.** What does the world look like?

Output: map of environment + robot's pose within it. Built incrementally as robot moves.

For: navigation in unknown spaces.

## SLAM front-end

Sensor data → features:
- **Visual SLAM.** Extract keypoints (ORB, SIFT, SuperPoint).
- **LiDAR SLAM.** Plane / edge / corner features from point cloud.
- **RGBD SLAM.** Depth + visual features.

For: data abstraction.

## SLAM back-end

Optimize map + poses given features:
- **Filter-based.** EKF SLAM, Particle filter SLAM.
- **Graph-based (modern).** Build pose graph; bundle adjustment.

Graph SLAM dominant now.

For: estimation method.

## Loop closure

When robot revisits a place:
- Detect "I've been here."
- Add constraint to graph.
- Optimization corrects accumulated drift.

Without loop closure: map drifts over time.

For: long-term accuracy.

## Popular SLAM packages

- **Cartographer.** Google; 2D + 3D LiDAR; great quality.
- **ORB-SLAM3.** Monocular / stereo / RGB-D visual SLAM.
- **SLAM Toolbox.** ROS 2 native; 2D LiDAR; production-ready.
- **LIO-SAM.** LiDAR + IMU.
- **VINS-Mono.** Visual-inertial.
- **Kimera.** Multi-sensor semantic SLAM.

For: tool selection.

## SLAM Toolbox in ROS 2

```bash
sudo apt install ros-humble-slam-toolbox
ros2 launch slam_toolbox online_async_launch.py
```

Real-time 2D LiDAR SLAM with loop closure.

For: easy start.

## Map formats

- **OccupancyGrid (2D).** Pixel = free / occupied / unknown.
- **Octomap (3D).** Voxel-based 3D.
- **Mesh (3D).** Reconstructed surfaces.
- **Pose graph.** For relocalization.

For: representation choice.

## Mapping → localization handoff

Typical workflow:
1. Run SLAM during exploration.
2. Save map.
3. Switch to localization (AMCL) using saved map.
4. Robot operates with known map.

For: deployment.

## Multi-robot SLAM

Multiple robots build shared map:
- Each runs local SLAM.
- Exchange features for cross-robot loop closure.
- Centralized or distributed.

For: large environments.

## Semantic SLAM

Add object class info to map:
```
Wall here, chair there, person at (x,y), door over there
```

Modern: use vision foundation models.

For: object-aware navigation.

## Pose graph optimization

g2o, GTSAM, Ceres — non-linear optimization libraries.

Constraints between poses + features minimized:
```
min Σ (predicted - measured)²
```

For: SLAM back-end math.

## Real-world challenges

- **Dynamic environments.** Moving people / objects confuse SLAM.
- **Featureless rooms.** White walls; nothing to track.
- **Symmetric environments.** Long hallways look identical.
- **Sensor failure.** Camera blocked, LiDAR rain.

For: robustness focus.

## Mistakes to avoid

- **Skipping loop closure.** Map drifts.
- **Wrong sensor for environment.** LiDAR fails in glass corridors.
- **No semantic info.** Loses high-level context.

## Summary

- SLAM = localization + mapping simultaneously.
- Front-end: features. Back-end: optimization.
- Loop closure corrects drift.
- Popular: Cartographer, ORB-SLAM3, SLAM Toolbox.
- Modern: semantic SLAM with foundation models.

Module 3 complete. Module 4: motion + control.
