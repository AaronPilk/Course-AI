---
module: 2
position: 1
title: "ATC structure: towers, centers, TRACON"
objective: "Know who's controlling what airspace."
estimated_minutes: 5
---

# ATC structure

## Three layers

1. **Tower (Local).** Surface to ~3,000 ft AGL around airport.
2. **TRACON (Approach/Departure).** Terminal area; ~30 NM, surface to 10,000 ft.
3. **Center (ARTCC).** Enroute; cruise altitudes; vast areas.

For: handoff logic.

## Control tower

Visual + radar control of:
- Takeoff/landing clearance.
- Ground movement (taxi).
- Pattern traffic.
- Local separation.

Big airports: tower 100-300 ft tall; spots traffic visually.

For: airport ops.

## Tower frequencies

Standard frequencies:
- **Ground.** 121.6-121.9 typical; for taxi.
- **Tower.** 118-122 MHz typical; for takeoff/land.
- **CTAF.** Common Traffic Advisory (uncontrolled).
- **UNICOM.** 122.7-123.0; non-government services.

For: comm setup.

## TRACON

Tracks aircraft within 30-50 NM of airports:
- Departures from + arrivals to multiple nearby airports.
- Vectors, altitudes, speeds.
- Hands off to/from Center.

Examples: SCT (Southern California TRACON), N90 (NY area), PCT (Potomac).

For: terminal area separation.

## ARTCC (Center)

20 enroute centers in US (e.g., Oakland Center, Albuquerque Center).

Each handles ~100,000 sq mi at cruise altitudes. Subdivided into sectors.

Coordinates with TRACONs + other centers.

For: enroute ATC.

## FAA Command Center (Vint Hill)

National flow control:
- Reroutes traffic around weather.
- Issues ground stops.
- Coordinates major events.

Strategic, not tactical.

For: big picture.

## Flight Service (FSS)

NOT ATC; advisory:
- Weather briefings (1-800-WX-BRIEF).
- Flight plan filing.
- Airport advisories at uncontrolled fields.
- Lost aircraft assistance.

Contracted to Leidos in U.S.

For: pilot services.

## Handoffs

When you cross sector/center boundaries:
- "Skyhawk 12345, contact Oakland Center 134.5."
- Pilot acknowledges: "Oakland 134.5, Skyhawk 12345."
- Pilot tunes new frequency, checks in: "Oakland Center, Skyhawk 12345, level 8,000."

Continuous chain across long flights.

For: enroute mechanics.

## Class B / C tower workflow

Big airport arrival:
```
Center hands to TRACON Approach (~30 NM out).
TRACON vectors + descends.
Hands to Tower (~5-10 NM).
Tower clears for landing.
Tower hands to Ground (after landing).
Ground taxis to gate.
```

For: arrival sequence.

## Class D tower workflow

Smaller field:
```
No TRACON involvement (you might call tower directly).
Tower sequences arrivals.
Lands.
Ground or Tower-controlled taxi.
```

For: smaller airport flow.

## Uncontrolled fields

No tower; pilots self-coordinate on CTAF:
```
"Lincoln traffic, Skyhawk 12345 entering downwind runway 32, Lincoln."
```

Standardized pattern + radio calls.

For: rural fields.

## Letter of agreement (LOA)

Adjacent ATC facilities formalize handoff procedures, sector boundaries, transition altitudes via LOAs.

For: behind-scenes coordination.

## ATC training

Air Traffic Controller path:
- FAA Academy 4 months.
- 2-3 years on-the-job training.
- High stress; mandatory retirement at 56.
- $40-180k salary.

Very competitive program.

For: career awareness.

## Mistakes to avoid

- **Calling wrong frequency.** Wasted time.
- **Forgetting to monitor handed-off frequency.** Lost.
- **Stepping on transmissions.** Listen before transmit.

## Summary

- Tower (airport), TRACON (terminal), Center (enroute).
- 20 ARTCC centers cover U.S. enroute.
- Handoffs maintain continuous coverage.
- Flight Service for weather/advisory, not control.
- Uncontrolled fields use CTAF self-coordination.

Next: clearances + communication.
