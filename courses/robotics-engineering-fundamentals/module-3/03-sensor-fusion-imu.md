---
module: 3
position: 3
title: "Sensor fusion + IMU"
objective: "Combine sensors for robust state estimation."
estimated_minutes: 5
---

# Sensor fusion + IMU

## Why fuse

Single sensor unreliable:
- GPS: no signal indoors.
- IMU: drifts over time.
- Camera: blurry / dark.
- Wheel encoders: slip on smooth floors.

Combined: each compensates for others' weaknesses.

For: robust pose.

## Kalman Filter (KF)

Linear state estimator. Two steps repeated:
```
1. Predict:  x_new = F × x_old (model prediction)
2. Update:   x_new ← x_new + K × (measurement - H × x_new)
```

K (Kalman gain) balances model vs. measurement.

For: optimal linear estimation.

## Extended KF (EKF)

For non-linear systems (most real ones): linearize around current estimate.

```python
from robot_localization import ekf_node   # ROS 2 package
```

Used in: most ROS navigation stacks.

For: real-world systems.

## Unscented KF (UKF)

Better for highly non-linear; uses sigma points instead of linearization.

For: aerospace, drones.

## Particle Filter

Represent belief as samples:
- 1000+ particles, each = possible state.
- Update each via motion + measurement.
- Resample by likelihood.

Handles arbitrary distributions; multi-modal.

Used in: AMCL (Adaptive Monte Carlo Localization) for ROS robots in known map.

For: localization in known map.

## VIO (Visual-Inertial Odometry)

Camera + IMU fusion:
- IMU provides high-rate motion (200Hz+).
- Camera provides drift correction.
- Combined: smooth + accurate.

Implementations: OKVIS, VINS-Mono, ORB-SLAM3.

For: visual inertial localization.

## LIO-SAM (LiDAR-Inertial)

LiDAR + IMU + GPS fusion. State-of-the-art for outdoor robots.

For: autonomous vehicles.

## robot_localization package

ROS 2 standard fusion node:
```yaml
# ekf.yaml
ekf_filter_node:
  ros__parameters:
    frequency: 30
    odom0: /odom
    odom0_config: [true, true, false, ...]  # x,y,yaw enabled
    imu0: /imu/data
    imu0_config: [false, false, false, ...]  # only orientation
```

Combines odometry + IMU + GPS + visual into single state estimate.

For: production fusion.

## IMU pre-integration

For VIO: integrate IMU between frames as constraint. More efficient than per-IMU-sample update.

For: optimization-based SLAM.

## Mistakes to avoid

- **Wrong sensor noise covariance.** Estimator overconfident.
- **Forgetting time sync.** Stale data corrupts fusion.
- **One sensor dominant.** Loses redundancy.

## Summary

- Sensor fusion combines noisy sensors → robust estimate.
- KF / EKF / UKF for linear-ish systems.
- Particle filter for multi-modal.
- robot_localization package = standard ROS fusion.
- VIO / LIO state-of-the-art for outdoor.

Next: SLAM.
