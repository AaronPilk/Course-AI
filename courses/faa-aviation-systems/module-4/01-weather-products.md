---
module: 4
position: 1
title: "Aviation weather products"
objective: "Use FAA weather services for flight planning."
estimated_minutes: 5
---

# Aviation weather products

## Where to get weather

- **aviationweather.gov.** NOAA Aviation Weather Center; free.
- **1-800-WX-BRIEF.** Flight Service Station phone briefing.
- **ForeFlight.** Paid app integration.
- **DUATS.** Direct User Access Terminal (legacy).
- **Local FBO.** Computer terminals.

For: sources.

## Briefing types

- **Standard.** Complete preflight; required for IFR.
- **Abbreviated.** Updates to standard.
- **Outlook.** >6 hours before flight.

Get standard for most flights.

For: depth choice.

## Required weather sources

For FAA-legal flight:
- Standard briefing covers required items.
- ForeFlight legally counts for self-briefing.

For: legal compliance.

## METAR

Aviation routine weather report. Updated hourly.

```
METAR KSFO 152254Z 28012KT 10SM BKN013 12/09 A3015 RMK AO2 SLP207
```

Decode:
- **KSFO.** Airport identifier.
- **152254Z.** Date (15th) + time (22:54 UTC).
- **28012KT.** Wind 280° at 12 knots.
- **10SM.** Visibility 10 statute miles.
- **BKN013.** Broken clouds at 1,300 ft AGL.
- **12/09.** Temp 12°C, dewpoint 9°C.
- **A3015.** Altimeter 30.15".

For: current conditions.

## TAF (Terminal Aerodrome Forecast)

24-30 hour forecast for airport area.

```
TAF KSFO 151730Z 1518/1624 26015KT 6SM HZ BKN015
  FM160000 27010KT P6SM SCT020
  FM160600 VRB04KT P6SM SKC
```

Forecast changes by time.

For: future planning.

## PIREP (Pilot Report)

Real pilot observations of:
- Turbulence.
- Icing.
- Cloud tops.
- Wind shear.

Filed via radio to ATC or FSS. Vital reliable data.

For: real-world conditions.

## SIGMETs + AIRMETs

- **AIRMET.** Moderate turbulence, icing, IFR.
- **SIGMET.** Severe weather — thunderstorms, severe icing.
- **Convective SIGMET.** Thunderstorms specifically.

Affect large areas.

For: hazard awareness.

## Winds aloft

Forecast wind/temperature by altitude:
```
FT  3000  6000  9000  12000  18000
DEN 0708  2114-04  2226-07  2436-14  2455-25
```

Plan fuel + heading.

For: cruise planning.

## NEXRAD radar

Doppler weather radar mosaic. Shows precipitation + storms.

In-flight via ADS-B In on EFB.

For: convective avoidance.

## Satellite

Visible + infrared satellite imagery. Shows cloud cover, fog, frontal systems.

For: big picture.

## Convective outlooks

SPC (Storm Prediction Center):
- Day 1, 2, 3 outlooks.
- Tornado/hail/wind probabilities.

Avoid known convective areas.

For: severe weather avoidance.

## Icing forecasts

- Icing layers by altitude.
- Severity (trace, light, moderate, severe).

GA aircraft not certified for icing → avoid.

For: ice avoidance.

## Mistakes to avoid

- **Old weather data.** Conditions change fast.
- **Single source.** Cross-check.
- **Ignoring SIGMET.** Severe weather kills.

## Summary

- METAR (current) + TAF (forecast) + PIREP (real) + SIGMETs (severe).
- aviationweather.gov + ForeFlight standard tools.
- Pre-flight briefing required by regulation.
- Cross-check sources before launch.

Next: METAR/TAF/PIREP detail.
