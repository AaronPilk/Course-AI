---
module: 1
position: 2
title: "Sensors and actuators"
objective: "Know the hardware that makes robots see and move."
estimated_minutes: 5
---

# Sensors and actuators

## Sensors overview

Sensors convert physical phenomena to electrical signals. Robot needs:
- **Vision.** Cameras (RGB, depth, stereo).
- **Range.** LiDAR, ultrasonic, ToF.
- **Inertial.** IMU (gyro, accel, magnetometer).
- **Force/torque.** Strain gauges on joints.
- **Proximity.** Contact sensors, IR.
- **Encoders.** Joint position feedback.

For: perception inputs.

## Cameras

- **RGB.** Standard color image. ~$10-1000.
- **Depth (RGB-D).** Intel RealSense, Azure Kinect. Adds depth per pixel.
- **Stereo.** Two cameras computing depth via disparity.
- **Event.** Per-pixel asynchronous; high speed.
- **Thermal.** Heat signatures.

Frame rate: 30-60 Hz typical; cameras Mpx range 0.3-12+.

For: visual perception.

## LiDAR

Time-of-flight laser ranging. 360° scan typically.

- **2D LiDAR.** Single plane (Hokuyo, Slamtec). $200-2000.
- **3D LiDAR.** Multiple planes (Velodyne, Ouster, Livox). $1k-50k.
- **Solid-state LiDAR.** No moving parts; cheaper; emerging.

For: precise 3D mapping.

## IMU

Inertial Measurement Unit:
- **Accelerometer.** Acceleration in x/y/z.
- **Gyroscope.** Angular velocity.
- **Magnetometer.** Compass heading.

Integration over time gives velocity + position estimate (drift accumulates).

Common: MPU-6050 ($5), Bosch BMI088, professional VN-100 ($1k+).

For: orientation + motion.

## Encoders

Measure joint rotation:
- **Incremental.** Counts ticks since power-on; needs reset.
- **Absolute.** Reads exact position any time.

Resolution: 1000-1M counts/revolution.

For: position feedback.

## Force/torque sensors

Measure contact forces. Six-DoF F/T sensors at wrist tell robot how hard it's pressing.

Critical for: assembly, surgery, compliant manipulation.

For: feel.

## Actuators overview

Actuators convert electrical signals to motion:
- **DC motors + brushless.** Common; cheap; need encoders.
- **Servo motors.** Position-controlled (Dynamixel).
- **Stepper motors.** Precise without encoder; for printers, CNC.
- **Hydraulic.** High force (Boston Dynamics Atlas legs).
- **Pneumatic.** Compressed air; soft robotics.
- **Linear actuators.** Push/pull motion.

For: motion sources.

## Brushless DC (BLDC) motors

Industrial standard:
- High efficiency.
- Long lifespan.
- Need ESC (Electronic Speed Controller).
- Quadcopters, e-bikes, electric vehicles.

For: high-performance applications.

## Series elastic actuators

Motor + spring + sensor. Provides compliance + force feedback.

Used in: humanoid robots (Atlas), exoskeletons. Allows safe physical interaction.

For: compliance.

## Power systems

Robots need power:
- **Battery.** Mobile robots (LiPo for drones, LiFePO4 for safer).
- **Tethered.** Industrial; unlimited power.
- **Wireless.** Emerging for warehouse robots.
- **Solar.** Long-term outdoor.

Voltage common: 12V, 24V, 48V industrial; 3.7V (single LiPo cell) drones.

For: energy sourcing.

## Controllers

Compute lives somewhere:
- **Microcontroller.** Arduino, STM32. Real-time low-level control.
- **Single-board computer.** Raspberry Pi, NVIDIA Jetson. ROS + ML.
- **Industrial controller.** PLCs for factories.

Modern: dual-system (MCU for control, SBC for perception/planning).

For: compute architecture.

## Communication

Inside robot:
- **CAN bus.** Automotive + industrial.
- **EtherCAT.** Industrial, deterministic.
- **I2C / SPI.** Sensor connections.
- **USB.** Higher bandwidth (cameras).
- **Ethernet.** ROS communication.

For: integration.

## Sensor fusion

Single sensor unreliable; combine:
- **Vision + IMU.** Visual-Inertial Odometry (VIO).
- **GPS + IMU.** Outdoor navigation.
- **LiDAR + camera.** Better mapping.

Kalman filter / Extended Kalman / Particle filter algorithms fuse.

For: robust perception.

## Mistakes to avoid

- **Single sensor reliance.** All have failure modes.
- **Ignoring power budget.** Robot dies mid-task.
- **No emergency stop.** Safety violation.
- **Underestimating noise.** Real sensors have noise.

## Summary

- Sensors: cameras, LiDAR, IMU, encoders, F/T.
- Actuators: motors, servos, hydraulics, pneumatics.
- Controllers: MCU + SBC dual-system common.
- Sensor fusion (Kalman) for robust perception.

Next: kinematics + dynamics.
