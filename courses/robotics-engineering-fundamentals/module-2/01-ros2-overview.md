---
module: 2
position: 1
title: "ROS 2 overview"
objective: "Understand Robot Operating System 2."
estimated_minutes: 5
---

# ROS 2 overview

## What ROS 2 is

ROS 2 (Robot Operating System 2) = open-source middleware + ecosystem for robot software. NOT an OS; runs on Linux/macOS/Windows.

Provides:
- Communication framework.
- Standard messages + interfaces.
- Tools (RViz, rqt, simulation).
- Vast package ecosystem.

For: industry-standard robot software.

## ROS 1 vs ROS 2

| | ROS 1 | ROS 2 |
|--|-------|-------|
| Communication | TCPROS / XMLRPC | DDS (Data Distribution Service) |
| Real-time | Limited | Yes |
| Multi-robot | Hard | Native |
| Embedded | Difficult | Supported |
| Security | None built-in | SROS2 |
| Production-ready | Yes (mature) | Yes (since Foxy) |

ROS 1 EOL May 2025. New projects → ROS 2.

For: choosing version.

## ROS 2 distributions

LTS releases:
- **Foxy** (2020-2023, EOL).
- **Humble** (2022-2027, current).
- **Iron** (2023-2024).
- **Jazzy** (2024-2029, current LTS).
- **Kilted** (2025-2026).

Use latest LTS (Humble or Jazzy) for production.

For: stability planning.

## Install

```bash
# Ubuntu 22.04 + ROS 2 Humble
sudo apt update && sudo apt install software-properties-common
sudo add-apt-repository universe
curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
sudo apt update
sudo apt install ros-humble-desktop

# Source environment
source /opt/ros/humble/setup.bash
```

For: getting started.

## DDS (Data Distribution Service)

Underlying communication standard:
- Decentralized; no master node.
- Quality of Service (QoS) configurable per topic.
- Multi-vendor implementations (Eclipse Cyclone DDS, Fast DDS).

For: networking layer.

## Core concepts (preview)

- **Node.** Independent process.
- **Topic.** Publish/subscribe channel.
- **Service.** Request/response RPC.
- **Action.** Long-running task with feedback.
- **Parameter.** Configuration value.
- **Launch file.** Coordinates multi-node startup.

For: vocabulary.

## Build system

`colcon` builds packages:
```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python my_robot_pkg

cd ~/ros2_ws
colcon build
source install/setup.bash
ros2 run my_robot_pkg my_node
```

For: workflow.

## Common packages

- **MoveIt 2.** Motion planning.
- **Navigation 2.** Mobile robot navigation.
- **Cartographer / SLAM Toolbox.** Mapping.
- **OpenCV bridge.** Vision integration.
- **PCL bridge.** Point cloud processing.

For: ecosystem.

## When NOT to use ROS

- **Resource-constrained** (microcontroller). Use micro-ROS instead.
- **Single-purpose** (toaster). Overkill.
- **Mission-critical real-time** beyond ROS 2 guarantees. Custom stack.

For: scope.

## Industry adoption

Companies using ROS:
- Boston Dynamics (Spot SDK).
- NVIDIA (Isaac).
- Open Robotics (TurtleBot, OSRF).
- BMW (assembly robots).
- Amazon Robotics (warehouse).

For: relevance.

## Summary

- ROS 2 = middleware for robotics.
- DDS-based; decentralized; real-time capable.
- Use Jazzy (2024 LTS) or Humble (2022 LTS).
- Core: nodes, topics, services, actions, parameters.

Next: nodes, topics, services.
