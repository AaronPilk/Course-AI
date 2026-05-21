---
module: 1
position: 4
title: "Earth orbits: LEO, MEO, GEO, SSO"
objective: "Pick orbit for mission needs."
estimated_minutes: 5
---

# Earth orbits

## LEO (Low Earth Orbit)

160-2,000 km altitude.

Characteristics:
- Period ~90 min.
- Earth view: small swath; needs many satellites for global coverage.
- Atmospheric drag → decay if not boosted.
- Used by: ISS (400 km), Starlink, Earth observation, Hubble.

For: large constellations + cheap launch.

## ISS specifics

400 km altitude. 92 min period. 51.6° inclination (accessible from Baikonur + Cape Canaveral).

Atmospheric drag costs ~7 tons of fuel/year for reboosts.

For: human spaceflight.

## SSO (Sun-Synchronous Orbit)

Special LEO inclination (~98°) so sun angle is always same when satellite crosses equator.

Earth imaging satellites: shadows always similar; consistent image quality.

Examples: Landsat, Sentinel-2.

For: optical imaging.

## MEO (Medium Earth Orbit)

2,000-35,786 km.

GPS at ~20,200 km altitude. 12-hour period. 24 satellites in 6 planes for global coverage.

Other GNSS: Galileo, GLONASS, BeiDou.

For: navigation.

## GEO (Geostationary)

35,786 km equatorial circular orbit. Satellite appears stationary relative to ground.

Used by:
- Communications (DirecTV, Starlink Maritime).
- Weather (GOES).
- Some military.

Limited slots (360° around equator); spacing matters.

For: fixed coverage.

## GTO (Geostationary Transfer)

Elliptical orbit: perigee 200 km, apogee 35,786 km. Launch vehicles typically deliver here; satellite circularizes itself at GEO with apogee burn.

For: standard delivery orbit.

## HEO (Highly Elliptical Orbit)

Like Molniya: high eccentricity, slow at apogee.

Useful for: high-latitude coverage (Russia's geography). Spend lots of time over north.

For: regional coverage.

## Polar orbit

Inclination ~90°. Passes over poles. Eventually covers entire Earth.

Used for: imaging, recon, polar regions.

For: full-Earth coverage.

## Inclination tradeoffs

Lower inclination:
- Easier to launch from low latitudes (more rotational boost).
- Less coverage of high latitudes.

Higher inclination:
- Better polar coverage.
- More launch energy required.

For: launch site / coverage tradeoff.

## Orbital debris

LEO crowded:
- ~36,000 tracked objects > 10 cm.
- 1M+ smaller objects.
- Kessler syndrome risk: collisions creating more debris.

Active debris removal research.

For: space sustainability.

## Mistakes to avoid

- **Wrong altitude for goal.** LEO ≠ GEO ≠ MEO.
- **Forgetting drag in LEO.** Reboost needed.
- **GEO slot disputes.** Allocated by ITU.

## Summary

- LEO: 160-2k km; cheap, drag; ISS, Starlink.
- MEO: 2k-36k km; GPS at 20k.
- GEO: 36k km; fixed view; comm/weather.
- SSO: special LEO for consistent imaging.
- Polar: full-Earth coverage.

Module 1 complete. Module 2: rocket propulsion.
