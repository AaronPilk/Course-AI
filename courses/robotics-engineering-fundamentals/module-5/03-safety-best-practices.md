---
module: 5
position: 3
title: "Safety + ROS 2 best practices"
objective: "Build robots that don't hurt people or break."
estimated_minutes: 5
---

# Safety + ROS 2 best practices

## Safety hierarchy

Layer defenses:
1. **Mechanical.** Soft padding, breakaway joints, current limiters.
2. **Hardware.** E-stops, redundant sensors.
3. **Firmware.** Joint limits, watchdog timers.
4. **Software.** Velocity limits, collision detection.
5. **Operational.** Workspace fencing, exclusion zones.

For: defense in depth.

## E-stop

Physical button cuts motor power instantly:
- Wired loop; any disconnect triggers.
- Multiple buttons (operator + robot mounted).
- Required by safety standards (ISO 13849).

Test weekly.

For: human override.

## Collision detection

Built into industrial arms: monitor joint torques. Exceed expected → stop:
```yaml
controller_manager:
  ros__parameters:
    joint_trajectory_controller:
      gains:
        joint_1: { collision_threshold: 5.0 }  # Nm
```

Modern arms (Franka, UR) sense ~5N contact reliably.

For: gentle around humans.

## Compliant control

Soft response to external forces:
- Impedance control: virtual spring + damper.
- Lower stiffness near humans.
- Recover safely from contact.

For: human-robot collaboration.

## Workspace limits

```cpp
if (joint_angle > MAX_ANGLE - SAFETY_MARGIN) {
    desired_velocity = std::min(desired_velocity, 0.0);
}
```

Software-enforced bounds prevent damage.

For: hardware protection.

## Watchdog timers

If control loop hangs >100ms, motor cut off:
- Real-time OS preferred (Linux PREEMPT_RT).
- Heartbeat from controller.
- Hardware-level watchdog.

For: fail-safe.

## Code quality for safety

- Static analysis (clang-tidy, ament_cppcheck).
- Unit + integration tests.
- Coding standards (MISRA-C for safety-critical).
- Code review mandatory.
- CI on every commit.

For: catch bugs before deployment.

## ROS 2 testing

```bash
colcon test
colcon test-result --verbose
```

Test types:
- `gtest` for C++.
- `pytest` for Python.
- `launch_testing` for integration.

For: confidence.

## SROS2 (security)

```bash
ros2 security create_keystore ~/sros2_keystore
ros2 security create_enclave ~/sros2_keystore /talker
```

Authenticated + encrypted DDS. Prevents:
- Unauthorized topic publish.
- Man-in-the-middle.

For: networked robots.

## Logging

```python
self.get_logger().info('Started moving')
self.get_logger().warn('Sensor noisy')
self.get_logger().error('Collision detected')
```

Log levels: DEBUG, INFO, WARN, ERROR, FATAL.

`ros2 bag record -a` records all topics for offline analysis.

For: debug + audit trails.

## Real-time considerations

Hard real-time needs:
- Linux PREEMPT_RT or Xenomai.
- CPU isolation (isolcpus).
- Lock-free comms.
- Pre-allocated memory (no malloc in loop).

For: deterministic control.

## Industrial standards

- **ISO 10218.** Robot safety.
- **ISO 13849.** Functional safety.
- **TS 15066.** Collaborative robots.
- **DO-178C.** Avionics (drones).

For: commercial deployment.

## ROS 2 best practices

- One node per logical function.
- Type-safe interfaces (custom .msg / .srv / .action).
- Lifecycle nodes for managed startup.
- Composable nodes for hot paths.
- ROS 2 launch tests for integration.

For: maintainable systems.

## Mistakes to avoid

- **No E-stop.** Mandatory.
- **No software limits.** Mechanical damage.
- **Test in simulation only.** Reality differs.
- **No logging.** Can't diagnose failures.

## Summary

- Defense-in-depth: mechanical → hardware → firmware → software → operational.
- E-stops, collision detection, workspace limits.
- SROS2 for networked security.
- Real-time OS for deterministic control.
- ISO 10218 + 13849 for commercial robots.

Next: career + industry trends.
