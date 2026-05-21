---
module: 2
position: 3
title: "Radar + ADS-B"
objective: "How ATC sees aircraft."
estimated_minutes: 5
---

# Radar + ADS-B

## Primary radar

- Pulses microwaves; receives echoes.
- Range, bearing of aircraft.
- No identity or altitude.
- Range: 60-250 NM.

For: basic detection.

## Secondary surveillance radar (SSR)

- Ground station interrogates aircraft transponder.
- Transponder replies with code + altitude.
- Mode A (code), Mode C (altitude), Mode S (data link + ID).

Standard for ATC.

For: positive identification.

## Transponder codes

- 1200: VFR default.
- 7000: outside US.
- 7500: hijack.
- 7600: lost comm.
- 7700: emergency.
- Assigned: 0001-7777 (avoid emergency codes).

For: vital identification.

## ADS-B Out

Aircraft automatically broadcasts via GPS:
- Position, altitude, velocity, vector.
- Updates 1 Hz.
- Range 200+ NM.

Required since Jan 2020 in most controlled airspace.

For: modern position reporting.

## ADS-B In

Receive:
- **TIS-B.** Traffic Information Service.
- **FIS-B.** Flight Info: weather, NOTAMs.
- Real-time on EFB (ForeFlight, Garmin).

Free service.

For: cockpit awareness.

## Radar limitations

- Line-of-sight (mountains block).
- Refresh rate ~5-12 seconds per sweep.
- Weather can attenuate.
- Older tech being phased toward ADS-B.

For: why ADS-B better.

## Trilateration vs. radar

Multi-station trilateration (using ADS-B signals) more accurate than radar. Ground stations triangulate positions.

For: positioning precision.

## NextGen radar replacement

ADS-B effectively replaces radar. FAA decommissioning many radar sites:
- Saves operating cost.
- More accurate.
- Better tracking through gaps.

For: modernization trend.

## SSR Mode S

Newer transponder mode:
- Selective interrogation (efficient).
- More data exchange.
- Required for ADS-B Out.

Replaces older Modes A/C in newer aircraft.

For: standard equipment.

## TCAS (Traffic Collision Avoidance System)

Onboard system:
- Detects nearby transponders.
- Issues TA (Traffic Advisory) + RA (Resolution Advisory).
- "Climb! Climb!" or "Descend! Descend!"

Required on most airliners.

For: collision avoidance.

## Drone surveillance

Remote ID requirement for drones (>250 g) since 2024:
- Broadcasts position similar to ADS-B.
- Authorities can identify operator.

For: drone integration.

## Mistakes to avoid

- **Wrong transponder code.** Triggers alerts.
- **No ADS-B in required area.** $$ fine.
- **Transponder OFF in flight.** ATC can't see you.

## Summary

- Primary radar: basic detection.
- SSR + transponder: identity + altitude.
- ADS-B Out: GPS broadcast; required since 2020.
- ADS-B In: free weather + traffic in cockpit.
- TCAS: airliner collision avoidance.
- Codes: 1200 VFR, 7700 emergency, 7600 lost comm, 7500 hijack.

Next: NextGen modernization.
