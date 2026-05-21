---
module: 3
position: 4
title: "Communication + Deep Space Network"
objective: "How spacecraft talk to Earth."
estimated_minutes: 5
---

# Communication + Deep Space Network

## Frequency bands

- **VHF / UHF.** Cubesats; amateur.
- **S-band.** 2-4 GHz; ISS, near-Earth.
- **X-band.** 8-12 GHz; deep space.
- **Ka-band.** 26-40 GHz; high data rate.
- **Optical (laser).** Future; Gbps.

For: spectrum choice.

## Antennas

- **High Gain (HGA).** Big dish; pointed at Earth. Voyager: 3.7m.
- **Low Gain (LGA).** Omni; emergency comm.
- **Medium Gain (MGA).** Compromise.
- **Phased array.** Electronically steered (Starlink).

For: data rate vs. complexity.

## Link budget

```
SNR = (transmit_power × antenna_gain × earth_antenna_gain) / (range² × bandwidth × noise)
```

Quadruple distance → 16× less signal. Need bigger antennas + more power.

For: feasibility check.

## DSN (Deep Space Network)

NASA's 3 ground complexes:
- Goldstone (CA).
- Madrid (Spain).
- Canberra (Australia).

Spaced ~120° around Earth → always one in view of any deep-space mission.

70m + 34m antennas. Receives from Voyager 24 billion km away.

For: deep-space comms.

## Data rates

Mission examples:
- Cassini (Saturn): ~165 kbps.
- Mars Reconnaissance Orbiter: 6 Mbps.
- JWST: 28 Mbps (Ka-band).
- Lunar Reconnaissance Orbiter: 100 Mbps.

Earth-orbiting can have Gbps+.

For: scale.

## Delay (latency)

Light travel time:
- Earth-Moon: 1.3 s.
- Earth-Mars: 4-24 min.
- Earth-Voyager 1: 22 hours.

No real-time control of distant probes; pre-programmed sequences.

For: ops implication.

## Modulation + coding

- BPSK/QPSK for deep space.
- Reed-Solomon + convolutional codes (Voyager).
- LDPC + turbo codes (modern).

Recovers data from noisy signals.

For: data integrity.

## Relay satellites

Mars rovers can't always see Earth. Use orbiters:
- Mars Reconnaissance Orbiter.
- MAVEN.
- Trace Gas Orbiter.

Relay data → DSN.

For: orbital relay.

## TDRSS (Tracking and Data Relay Satellite System)

NASA's GEO satellites for LEO missions:
- ISS comms.
- Hubble.
- Earth observation.

Avoid coverage gaps from single ground station.

For: continuous LEO contact.

## Future: optical comms

Laser instead of radio:
- LCRD demonstrated (NASA, 2021).
- Psyche mission tests laser.
- 10-100× higher data rates.

Requires precise pointing; clear weather (for ground rx).

For: high-bandwidth future.

## Authentication + encryption

Sensitive comms encrypted:
- AES on payload.
- Authenticated commands (uplink).
- Frequency hopping for jamming resistance (military).

For: security.

## Mistakes to avoid

- **No omnidirectional antenna.** Lose comms when off-pointing.
- **Underestimating range losses.** Signal too weak.
- **No data compression.** Wasted bandwidth.

## Summary

- S/X/Ka bands for radio; optical emerging.
- DSN handles deep space; TDRSS handles LEO.
- Range² loss; need big dishes + high power.
- Latency: minutes to hours for deep space.
- Error correction codes recover noisy data.

Module 3 complete. Module 4: atmosphere + reentry.
