---
module: 2
position: 4
title: "Gazebo simulation"
objective: "Simulate robots before hardware."
estimated_minutes: 5
---

# Gazebo simulation

## Why simulate

- **Cheap.** No hardware needed.
- **Safe.** No damage from bugs.
- **Fast.** Iterate quickly.
- **Reproducible.** Same conditions repeatedly.
- **Scalable.** Train RL with millions of trials.

Real robots: 1 trial. Simulator: 1,000,000 trials/hour on cluster.

For: development speed.

## Gazebo

Open-source robot simulator. Major versions:
- **Gazebo Classic.** Legacy; ROS 1 ecosystem.
- **Gazebo (formerly Ignition).** Current; ROS 2.

Realistic physics, sensors, environments.

For: standard simulator.

## Install

```bash
sudo apt install ros-humble-gazebo-ros-pkgs ros-humble-gazebo-ros2-control
```

For Jazzy: install `ros-jazzy-gz-*` packages.

For: setup.

## Run

```bash
# Start gazebo with empty world
ros2 launch gazebo_ros gazebo.launch.py

# Spawn URDF robot
ros2 run gazebo_ros spawn_entity.py -topic /robot_description -entity my_robot
```

For: getting started.

## SDF format

Gazebo native format (alternative to URDF):
```xml
<sdf version="1.7">
  <world name="default">
    <include><uri>model://ground_plane</uri></include>
    <include><uri>model://sun</uri></include>
    <include>
      <uri>model://my_robot</uri>
      <pose>0 0 0.5 0 0 0</pose>
    </include>
  </world>
</sdf>
```

URDF → SDF auto-conversion possible.

For: world building.

## Robot description with Gazebo

```xml
<!-- URDF -->
<gazebo reference="base_link">
  <material>Gazebo/Blue</material>
</gazebo>

<gazebo>
  <plugin name="differential_drive" filename="libgazebo_ros_diff_drive.so">
    <left_joint>left_wheel_joint</left_joint>
    <right_joint>right_wheel_joint</right_joint>
    <wheel_separation>0.4</wheel_separation>
    <wheel_diameter>0.2</wheel_diameter>
  </plugin>
</gazebo>
```

For: integrating ROS controllers.

## Sensor simulation

Built-in plugins simulate:
- Cameras (RGB, depth, stereo).
- LiDAR (2D, 3D).
- IMU.
- GPS.
- Contact sensors.

Realistic noise + lag models for sim2real transfer.

For: full perception stack.

## Worlds

Pre-built worlds:
- Empty plane.
- Obstacle course.
- Office building.
- Outdoor terrain.

Build your own in Gazebo's editor or write SDF.

For: scenarios.

## ros2_control + Gazebo

Industrial controllers run in simulation:
```yaml
controller_manager:
  ros__parameters:
    update_rate: 100
    diff_drive_controller:
      type: diff_drive_controller/DiffDriveController
```

Same controllers run sim + real.

For: code reuse across sim2real.

## Headless mode

For CI / cluster training:
```bash
gz sim -v 3 -s   # Server only; no GUI
```

For: scalable training.

## Performance tips

- Run physics at realistic step (0.001s typical).
- Limit number of sensors.
- Use simpler collision meshes (not visual meshes).
- Disable GUI for headless.

For: smooth simulation.

## Alternative simulators

- **NVIDIA Isaac Sim.** Photorealistic; CUDA-accelerated.
- **Webots.** Open source; multi-platform.
- **PyBullet.** Python-friendly; physics-only.
- **CARLA.** Self-driving specialist.
- **AirSim (deprecated).** Microsoft drones.

Each has strengths.

For: tool choice.

## Sim2Real challenges

Simulator ≠ reality. Differences cause "reality gap":
- Sensor noise unrealistic.
- Friction models simplified.
- Dynamics approximations.

Mitigations:
- Domain randomization.
- Realistic sensor models.
- Final fine-tuning on hardware.

For: bridging gap.

## Mistakes to avoid

- **Trust simulator 100%.** Always test on hardware.
- **Massive meshes for collision.** Slow physics.
- **Skipping domain randomization.** Brittle policies.

## Summary

- Gazebo = standard ROS simulator.
- SDF + URDF for robots + worlds.
- Sensor plugins simulate cameras, LiDAR, IMU.
- ros2_control runs in sim + real with same code.
- Bridge sim2real gap with domain randomization.

Module 2 complete. Module 3: perception.
