---
module: 4
position: 2
title: "PID controllers"
objective: "Control any output via feedback."
estimated_minutes: 5
---

# PID controllers

## Closed-loop control

```
target → [+] → [controller] → plant → output
                     ↑                      |
                     └──────────────────────┘
                            feedback
```

Continuously adjust input based on error.

For: tracking targets.

## PID formula

```
u(t) = Kp × error + Ki × ∫error dt + Kd × (d/dt) error
```

Where:
- **P (proportional).** React to current error.
- **I (integral).** Eliminate steady-state error.
- **D (derivative).** Damp oscillations.

For: workhorse controller.

## Tuning

Manual tuning:
1. Set Ki = Kd = 0.
2. Increase Kp until oscillation; back off.
3. Add Kd to damp oscillations.
4. Add Ki to remove steady-state offset.

Or Ziegler-Nichols method (find ultimate gain + period).

Auto-tuning available in many frameworks.

For: getting it working.

## Common pitfalls

- **Integral windup.** Integral grows unbounded during saturation. Clamp it.
- **Noise on D.** Differentiating noise amplifies it; filter measurements.
- **Wrong sign.** Robot runs away from target.
- **Insufficient sampling rate.** Aliasing.

For: troubleshooting.

## Implementation

```python
class PID:
    def __init__(self, kp, ki, kd):
        self.kp, self.ki, self.kd = kp, ki, kd
        self.integral = 0
        self.last_error = 0

    def update(self, error, dt):
        self.integral += error * dt
        derivative = (error - self.last_error) / dt
        self.last_error = error
        return self.kp*error + self.ki*self.integral + self.kd*derivative
```

For: basic implementation.

## Saturation handling

```python
output = pid.update(error, dt)
output = max(min_out, min(max_out, output))   # Clamp
if saturated:
    pid.integral -= error * dt   # Anti-windup
```

For: real-world plants.

## Cascade control

Inner loop (fast): velocity control.
Outer loop (slow): position control.

Common for: motor control, robot arms.

```
position target → [outer PID] → velocity target → [inner PID] → motor
```

For: complex systems.

## Feedforward

Combine model-based prediction with feedback correction:
```
u = feedforward(target) + PID(error)
```

Faster response; PID handles disturbances.

For: high-performance.

## ros2_control

Standard interface for industrial controllers:
```yaml
controller_manager:
  ros__parameters:
    update_rate: 100
    joint_trajectory_controller:
      type: joint_trajectory_controller/JointTrajectoryController
```

Manages multiple PIDs + advanced controllers uniformly.

For: ROS controller framework.

## Beyond PID

- **LQR (Linear Quadratic Regulator).** Optimal linear control.
- **MPC (Model Predictive Control).** Plans ahead; respects constraints.
- **Sliding mode.** Robust nonlinear.
- **Adaptive.** Learns parameters online.

PID still dominant; advanced for specific needs.

For: control hierarchy.

## Mistakes to avoid

- **Tuning by trial-and-error forever.** Use Ziegler-Nichols or auto-tune.
- **Ignoring sampling rate effects.** Discrete sampling adds delays.
- **No anti-windup.** Slow recovery from saturation.

## Summary

- PID = P (current) + I (history) + D (rate).
- Manual or Ziegler-Nichols tuning.
- Anti-windup + noise filter essential.
- Cascade structure for complex systems.
- ros2_control standardizes industrial use.

Next: trajectory generation.
