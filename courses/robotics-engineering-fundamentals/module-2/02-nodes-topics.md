---
module: 2
position: 2
title: "Nodes, topics, services"
objective: "ROS 2 communication primitives."
estimated_minutes: 5
---

# Nodes, topics, services

## Nodes

Independent processes. One node per logical function:
- camera_driver
- object_detector
- motion_planner
- robot_state_publisher

```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        self.get_logger().info('Hello')

def main():
    rclpy.init()
    rclpy.spin(MyNode())
    rclpy.shutdown()
```

For: modularity.

## Topics (pub/sub)

Asynchronous; one-to-many:
```python
from std_msgs.msg import String

# Publisher
pub = self.create_publisher(String, '/topic_name', 10)
pub.publish(String(data='hello'))

# Subscriber
self.create_subscription(String, '/topic_name', self.callback, 10)

def callback(self, msg):
    self.get_logger().info(f'Got: {msg.data}')
```

For: streaming data.

## Common topic types

```
/cmd_vel              geometry_msgs/Twist  (motion commands)
/odom                 nav_msgs/Odometry    (current pose)
/scan                 sensor_msgs/LaserScan (LiDAR)
/image                sensor_msgs/Image     (camera)
/joint_states         sensor_msgs/JointState (joint angles)
/tf                   tf2_msgs/TFMessage    (transforms)
```

For: standard data flow.

## Services (RPC)

Request/response; synchronous:
```python
from example_interfaces.srv import AddTwoInts

# Server
def callback(req, resp):
    resp.sum = req.a + req.b
    return resp

self.create_service(AddTwoInts, '/add_two_ints', callback)

# Client
client = self.create_client(AddTwoInts, '/add_two_ints')
req = AddTwoInts.Request()
req.a = 5
req.b = 3
future = client.call_async(req)
```

For: query/command.

## Actions

Long-running tasks with feedback + cancellation:
- Navigation to goal.
- Robot arm trajectory.
- Manipulation grasp.

Client sends goal → server provides feedback + result.

For: stateful tasks.

## QoS (Quality of Service)

DDS exposes QoS settings:
- **Reliability.** RELIABLE (TCP-like) vs. BEST_EFFORT (UDP-like).
- **Durability.** TRANSIENT_LOCAL (cache for late subscribers).
- **History.** KEEP_LAST(N) or KEEP_ALL.

Sensor data: BEST_EFFORT (high rate, lossy OK).
Commands: RELIABLE (every one matters).

For: communication tuning.

## ROS 2 CLI tools

```bash
ros2 node list                  # Running nodes
ros2 topic list                 # All topics
ros2 topic echo /cmd_vel        # See messages
ros2 topic hz /scan             # Message rate
ros2 service list
ros2 service call /add_two_ints example_interfaces/srv/AddTwoInts "{a: 5, b: 3}"
ros2 param list
```

For: debugging.

## Lifecycle nodes

Stateful nodes with managed transitions:
```
Unconfigured → Inactive → Active → Finalized
```

Lets supervisor coordinate startup.

For: structured deployment.

## Mistakes to avoid

- **Wrong QoS.** Subscribers miss messages.
- **Blocking in callbacks.** Misses incoming.
- **Singleton anti-pattern.** Make multiple nodes if needed.

## Summary

- Node = process; topic = pub/sub; service = RPC; action = long-running.
- Common topics: /cmd_vel, /odom, /scan, /image, /joint_states.
- QoS tunable per topic.
- CLI tools for debugging.

Next: launch files + parameters.
