---
module: 3
position: 3
title: "ADCS: attitude determination + control"
objective: "Point the spacecraft accurately."
estimated_minutes: 5
---

# ADCS

## What ADCS does

Attitude Determination + Control System:
- **Determination.** Where am I pointing?
- **Control.** Adjust to desired attitude.

Critical for: comms (antennas), science instruments, solar panels.

For: pointing accuracy.

## Sensors

- **Star trackers.** Identify star patterns; arcsec accuracy. Best modern.
- **Sun sensors.** Coarse but reliable.
- **Earth sensors.** IR earth horizon.
- **Magnetometers.** LEO magnetic field.
- **Gyroscopes (IMU).** Rate sensing.

For: knowing orientation.

## Actuators

- **Reaction wheels.** Spin flywheels; conservation of momentum.
- **Magnetic torquers.** Push against Earth's field; LEO only.
- **Thrusters.** Burn propellant; coarse control.
- **Control moment gyros (CMGs).** Big reaction wheels; high torque (ISS).

For: changing orientation.

## Reaction wheels

Three (or four for redundancy) orthogonal wheels:
```
Spin up wheel → spacecraft rotates opposite direction
Spin down wheel → spacecraft rotates back
```

Issue: wheel can saturate (max RPM). Need momentum dumping via thrusters or magnetorquers.

For: most science satellites.

## Pointing accuracy

Mission requirements:
- **Coarse (>1°).** Earth observation.
- **Medium (0.1-1°).** Comm satellites.
- **Fine (10 arcsec).** Hubble, Kepler.
- **Sub-arcsec.** JWST, future telescopes.

For: spec-driven design.

## 3-axis stabilized

Spacecraft fixed orientation. Most modern.

Star trackers + reaction wheels + IMU.

Pointing computer continuously corrects.

For: precise pointing.

## Spin-stabilized

Spacecraft rotating about axis; gyroscopic stiffness:
- Simple; passive.
- Limited science (rotating field of view).
- Old satellites; some still.

For: simple missions.

## Gravity gradient

Long shape aligned with gravity gradient. Free torque. Limited accuracy.

For: simple sats; not used widely modern.

## Control modes

Spacecraft typically has multiple:
- **Acquisition.** Find sun + Earth after separation.
- **Safe.** Stable + survivable, low power.
- **Science.** Mission attitude.
- **Maneuver.** Active reorientation.

For: ops flexibility.

## Kalman filter for attitude

Fuse sensors:
```
gyro rates (high rate, drifts) +
star tracker (lower rate, precise) =
optimal attitude estimate
```

EKF in computer.

For: precision determination.

## Failure modes

- **Stuck wheel.** Can't spin; lose axis control.
- **Star tracker failure.** Use gyros (drift over time).
- **Thruster stuck open.** Catastrophic.

Redundancy critical.

For: reliability.

## Mistakes to avoid

- **Underestimating momentum dump frequency.** Wheels saturate.
- **No safe mode.** Lose spacecraft during fault.
- **Single string sensors.** Failure = mission loss.

## Summary

- ADCS = determination (sensors) + control (actuators).
- Star trackers + reaction wheels modern standard.
- Pointing accuracy: arcsec for telescopes, degrees for comms.
- Multiple control modes for ops flexibility.
- Kalman filter fuses sensors.

Next: communication.
