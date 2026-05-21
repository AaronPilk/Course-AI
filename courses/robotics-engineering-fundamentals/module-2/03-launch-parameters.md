---
module: 2
position: 3
title: "Launch files + parameters"
objective: "Orchestrate multi-node systems."
estimated_minutes: 5
---

# Launch files + parameters

## Launch files

Python files coordinating multi-node startup:

```python
# my_robot/launch/robot.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_robot',
            executable='controller',
            name='controller_node',
            parameters=[{'speed': 0.5}],
            remappings=[('/cmd_vel', '/robot/cmd_vel')]
        ),
        Node(package='my_robot', executable='sensors'),
        Node(package='my_robot', executable='planner')
    ])
```

Run:
```bash
ros2 launch my_robot robot.launch.py
```

For: scripted startup.

## Launch arguments

```python
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration

def generate_launch_description():
    use_sim_arg = DeclareLaunchArgument('use_sim', default_value='false')
    use_sim = LaunchConfiguration('use_sim')

    return LaunchDescription([
        use_sim_arg,
        Node(
            package='my_robot',
            executable='node',
            parameters=[{'use_sim_time': use_sim}]
        )
    ])
```

```bash
ros2 launch my_robot robot.launch.py use_sim:=true
```

For: configurable startup.

## Parameters

Runtime configuration per node:
```python
self.declare_parameter('max_speed', 1.0)
max_speed = self.get_parameter('max_speed').value

self.declare_parameter('robot_name', 'turtle')
```

Set on launch:
```bash
ros2 run my_robot node --ros-args -p max_speed:=2.0

# Or from file
ros2 run my_robot node --ros-args --params-file params.yaml
```

For: tuning without recompile.

## YAML param files

```yaml
# params.yaml
my_node:
  ros__parameters:
    max_speed: 2.0
    debug: true
    waypoints: [1.0, 2.0, 3.0]
    description: "Patrol robot"
```

For: organized config.

## Composable nodes

Run multiple nodes in single process for IPC efficiency:
```python
ComposableNodeContainer(
    name='my_container',
    package='rclcpp_components',
    executable='component_container',
    composable_node_descriptions=[
        ComposableNode(package='my_robot', plugin='SensorNode'),
        ComposableNode(package='my_robot', plugin='FilterNode')
    ]
)
```

Zero-copy intra-process pub/sub.

For: high-performance pipelines.

## Lifecycle in launch

```python
LifecycleNode(
    name='managed_node',
    namespace='',
    package='my_robot',
    executable='managed_node'
)
```

Then activate via service call. Coordinated multi-node startup.

For: structured deployment.

## Conditional include

```python
from launch.actions import IncludeLaunchDescription
from launch_ros.substitutions import FindPackageShare
from launch.launch_description_sources import PythonLaunchDescriptionSource

IncludeLaunchDescription(
    PythonLaunchDescriptionSource(
        [FindPackageShare('nav2_bringup'), '/launch/bringup_launch.py']
    ),
    launch_arguments={'use_sim_time': 'true'}.items()
)
```

Compose larger systems from sub-launch files.

For: modular deployment.

## Logging + debug

```bash
ros2 launch my_robot robot.launch.py --debug
ros2 launch my_robot robot.launch.py --log-level DEBUG

# Show what gets launched
ros2 launch my_robot robot.launch.py --print
```

For: troubleshooting.

## Common params

```yaml
# Often used
use_sim_time: true     # Use /clock topic instead of system time
robot_description: ... # URDF
qos_overrides: ...     # QoS per topic
```

For: typical config.

## Bringup pattern

```
my_robot_bringup/
  launch/
    bringup.launch.py   # Top-level
    drivers.launch.py    # Sensor + motor drivers
    description.launch.py # URDF + state publishers
    navigation.launch.py  # Nav2 stack
```

Compose smaller for clarity.

For: scalable project structure.

## Mistakes to avoid

- **Hardcoded values.** Use parameters.
- **Massive launch file.** Compose smaller.
- **Missing param declarations.** Silent failures.

## Summary

- Launch files (Python) coordinate multi-node startup.
- Parameters: runtime config; YAML files or CLI.
- Composable nodes for zero-copy IPC.
- Bringup pattern for modular project layout.

Next: Gazebo simulation.
