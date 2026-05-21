---
module: 4
position: 2
title: "METARs, TAFs, PIREPs"
objective: "Decode aviation weather coding."
estimated_minutes: 5
---

# METARs, TAFs, PIREPs

## METAR decoding

```
METAR KSFO 152254Z AUTO 28012G18KT 10SM -RA BKN013 OVC025 12/09 A3015 RMK AO2 PRESRR SLP207 P0001 T01170094
```

Key parts:
- **AUTO.** Automated station.
- **28012G18KT.** 280° at 12 kts, gusting 18.
- **-RA.** Light rain.
- **BKN013 OVC025.** Broken 1,300; overcast 2,500.
- **A3015.** Altimeter 30.15".
- **RMK ...** Remarks.

For: full decoding.

## Special METAR (SPECI)

When conditions change significantly between hourly METARs.

Wind shift, vis change, ceiling change, etc.

For: rapid update.

## TAF format

```
TAF KSFO 151730Z 1518/1624 26015KT 6SM HZ BKN015
  FM160000 27010KT P6SM SCT020
  FM160600 VRB04KT P6SM SKC
  BECMG 1612/1614 21015KT
```

- **151730Z.** Issued 15th 17:30 UTC.
- **1518/1624.** Valid 15th 18:00 to 16th 24:00.
- **FM.** "From" — new period.
- **BECMG.** "Becoming" — gradual transition.
- **TEMPO.** Temporary; <1 hour fluctuations.
- **PROB30.** 30% chance.

For: forecast reading.

## Cloud cover terms

- **SKC / CLR.** Sky clear.
- **FEW.** 1/8 to 2/8.
- **SCT (Scattered).** 3/8 to 4/8.
- **BKN (Broken).** 5/8 to 7/8.
- **OVC (Overcast).** 8/8.

For: cloud reporting.

## VV (Vertical Visibility)

Used when sky obscured:
```
VV003 = sky obscured, vertical visibility 300 ft
```

Indefinite ceiling.

For: low ceilings.

## Visibility coding

```
3 = 3 statute miles
1/2 = 1/2 SM
M1/4 = less than 1/4 SM
P6SM = more than 6 SM
```

For: precision.

## Weather phenomena codes

- **RA.** Rain.
- **SN.** Snow.
- **DZ.** Drizzle.
- **FG.** Fog.
- **BR.** Mist (>5/8 SM but <6 SM).
- **HZ.** Haze.
- **TS.** Thunderstorm.
- **GR.** Hail.

Intensities: `-` light, no prefix moderate, `+` heavy.

For: weather symbols.

## PIREP format

```
UA /OV ABC180020 /TM 1845 /FL080 /TP C172 /SK BKN040 OVC080 /TA M02 /WV 28045 /TB MOD /IC LGT RIME /RM ICE FORMED AT 6000
```

- **UA.** Urgent (or PIREP).
- **/OV.** Location.
- **/TM.** Time.
- **/FL.** Flight level.
- **/TP.** Type aircraft.
- **/SK.** Sky condition.
- **/TA.** Temperature.
- **/WV.** Wind.
- **/TB.** Turbulence.
- **/IC.** Icing.
- **/RM.** Remarks.

For: real pilot reports.

## Turbulence reporting

- **SMOOTH.** No reports.
- **LGT.** Light.
- **MOD.** Moderate.
- **SEV.** Severe.
- **EXTRM.** Extreme.

Plus CAT (Clear Air Turbulence) vs. CHOP.

For: ride description.

## Icing reporting

- **NIL.** No ice.
- **TRACE.** Detectable; no adjustment.
- **LGT.** Light; intermittent.
- **MOD.** Moderate; deviation needed.
- **SEV.** Severe; immediate action.

Type: rime, clear, mixed.

For: icing severity.

## Filing PIREPs

Via:
- ATC during flight.
- FSS (122.2 typical).
- ForeFlight app.

Encouraged especially when conditions worse than forecast.

For: helping other pilots.

## Mistakes to avoid

- **Misreading altitude.** Above ground vs. above sea level.
- **Ignoring trends.** TAF says deteriorating? Plan accordingly.
- **Filing imprecise PIREP.** Less useful to others.

## Summary

- METAR = current; TAF = forecast; PIREP = real reports.
- Cloud cover: FEW/SCT/BKN/OVC by 1/8 increments.
- Weather symbols: RA/SN/FG/TS standard.
- File PIREPs to help others.
- Decode systematically for accuracy.

Next: flight planning.
