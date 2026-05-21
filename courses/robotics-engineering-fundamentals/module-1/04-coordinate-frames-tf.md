---
module: 1
position: 4
title: "Coordinate frames + TF"
objective: "Manage many frames consistently."
estimated_minutes: 5
---

# Coordinate frames + TF

## Why frames matter

Every measurement is in some frame:
- Camera detects object → object pose in camera frame.
- Object needs to be reached → need pose in robot base frame.
- Robot must know where it is in world frame.

Converting between frames is a daily robotics task.

For: spatial reasoning.

## Tree of frames

ROS organizes frames in a tree:
```
map
└── odom
    └── base_link
        ├── base_laser
        ├── base_camera
        │   └── camera_optical
        └── arm_base
            └── shoulder
                └── elbow
                    └── wrist
                        └── gripper
```

Each parent → child has known transform.

For: navigation context.

## tf2 in ROS 2

`tf2` library handles tree:
```python
from tf2_ros import Buffer, TransformListener

buffer = Buffer()
listener = TransformListener(buffer, node)

# Get transform from camera_frame to base_link
transform = buffer.lookup_transform("base_link", "camera_frame", rclpy.time.Time())
```

For: lookups.

## Static + dynamic transforms

Static (publish once):
- Body-rigid links (base to mounted sensor).

Dynamic (publish continuously):
- Robot moving in world (odom → base_link).
- Joint angles (continuous updates).

```bash
# Static
ros2 run tf2_ros static_transform_publisher 0.1 0 0.2 0 0 0 base_link camera

# Dynamic via joint state publisher / robot state publisher
```

For: matching motion.

## Common frames

- **map.** Global world frame.
- **odom.** Drifts; reset on power cycle.
- **base_link.** Robot body center.
- **base_footprint.** On ground beneath base.
- **sensor frames.** Per sensor mounted.

For: standardization.

## Quaternions

Orientations in 3D often as quaternions (x,y,z,w):
- No gimbal lock (unlike Euler).
- Composable via multiplication.
- 4 numbers for orientation.

Euler angles (roll, pitch, yaw) easier to read but problematic.

```python
from tf_transformations import quaternion_from_euler
q = quaternion_from_euler(0, 0, 1.57)   # 90° yaw
```

For: orientation math.

## Visualization with RViz

```bash
ros2 run rviz2 rviz2
```

Add TF panel; see all frames visualized.

Diagnose issues:
- Missing transforms.
- Wrong parent-child.
- Stale transforms.

For: debugging.

## URDF (robot description)

```xml
<robot name="my_robot">
  <link name="base_link"/>
  <link name="arm_link"/>
  <joint name="shoulder" type="revolute">
    <parent link="base_link"/>
    <child link="arm_link"/>
    <origin xyz="0 0 0.5" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="100" velocity="1"/>
  </joint>
</robot>
```

robot_state_publisher publishes joint frames.

For: robot model definition.

## Frame conventions

Common conventions:
- **REP-103.** X forward, Y left, Z up (right-handed).
- **Camera optical.** X right, Y down, Z forward.
- **NED (aerospace).** X north, Y east, Z down.

Mistakes here = robot moves wrong direction.

For: standardization.

## Transform multiplication

Compose: `T_world_to_gripper = T_world_to_base × T_base_to_arm × T_arm_to_gripper`

Inversion: `T_a_to_b⁻¹ = T_b_to_a`.

For: chaining.

## Mistakes to avoid

- **Manual transform math.** Error-prone; use tf2.
- **Wrong frame convention.** Sign errors compound.
- **Stale transforms.** Outdated; rejected by tf2.
- **Frame name typos.** Hard to debug.

## Summary

- Frames organized in tree.
- tf2 manages lookups + publishing.
- Static (rigid) + dynamic (moving) transforms.
- Quaternions for orientations.
- RViz to visualize.

Module 1 complete. Module 2: ROS 2 ecosystem.
