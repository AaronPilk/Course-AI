---
module: 3
position: 2
title: "Semantic colors and dark mode"
objective: "Build interfaces that work in light and dark from the same code."
estimated_minutes: 5
---

# Semantic colors and dark mode

## Dark mode isn't inverted light mode

A common mistake: invert the colors and call it dark mode. Result: weird teals where blue was; readable text becomes harsh white on pitch-black.

Apple's dark mode is intentional:
- **Near-black backgrounds**, not pure black.
- **Off-white labels**, not pure white.
- **Desaturated colors.** Aggressive primaries dialed down.
- **Layered backgrounds** to convey depth in low-contrast environment.

System colors handle this for free. Custom palettes need design work.

## The semantic color system

UIKit / SwiftUI provides:

**Labels (text):**
- `label` — primary text.
- `secondaryLabel` — supporting text.
- `tertiaryLabel` — least prominent.
- `quaternaryLabel` — barely there.
- `placeholderText` — empty form placeholder.

**Backgrounds (plain):**
- `systemBackground` — main bg.
- `secondarySystemBackground` — alternating bg.
- `tertiarySystemBackground` — deeper layer.

**Backgrounds (grouped, for settings-style):**
- `systemGroupedBackground`
- `secondarySystemGroupedBackground`
- `tertiarySystemGroupedBackground`

**Fills (translucent):**
- `systemFill`, `secondarySystemFill`, `tertiarySystemFill`, `quaternarySystemFill`

Each adapts. Don't think "what color is this?" Think "what role does this play?"

## Color pairings

Apple's HIG has specific color pairings for different surface levels:

```
Plain hierarchy:
  systemBackground         (level 0)
  secondarySystemBackground (level 1, e.g., card on screen)
  tertiarySystemBackground  (level 2)

Grouped hierarchy:
  systemGroupedBackground
  secondarySystemGroupedBackground
  tertiarySystemGroupedBackground
```

Use plain hierarchy for most apps; grouped for settings-like screens with inset rows.

## Adopting dark mode

For new apps: easy if you've used semantic colors throughout. Test by toggling Appearance in Xcode preview, Simulator, or Settings.

For existing apps: audit color usage; replace hardcoded with semantic; provide dark variants for brand colors.

Set `userInterfaceStyle` in Info.plist:
- `Automatic` — follow system. Default.
- `Light` — always light.
- `Dark` — always dark.

Most apps: automatic. Locking forces brand decisions on users.

## Custom brand colors in dark mode

Your accent color may need dark mode variant:

- **Lighter** in dark mode to maintain contrast against dark backgrounds.
- **Less saturated** to avoid harsh appearance.

Test contrast in Xcode Accessibility Inspector. Aim for WCAG AA (4.5:1 for body text; 3:1 for large or non-text).

```swift
// Asset Catalog entry "BrandAccent" with light + dark variants
.tint(Color("BrandAccent"))
```

## Pure black vs near-black

Apple uses near-black, not pure black, for OLED backgrounds. Reasons:
- **Smearing artifacts.** True-black pixels can leave trails on OLED.
- **Comfort.** Pure black + pure white is harsh contrast that fatigues eyes.
- **Battery.** Near-black still saves significant battery on OLED vs pure black; pure black is excessive.

Use `systemBackground` (near-black in dark mode) over hardcoded black.

## Images and dark mode

Images often need dark variants:
- **Logos.** Light-on-dark vs dark-on-light versions.
- **Illustrations.** Color schemes that work in both modes.
- **SF Symbols.** Automatic — render in current text color, weight.

Asset Catalog supports "Any, Dark" appearance for images. SF Symbols handle automatically.

## Materials

Dark mode + materials interact:

```swift
.background(.thinMaterial)
```

Adapts to background. On light background → light translucency; on dark → dark translucency. Both look right.

Covered in next lesson on materials.

## Testing dark mode

Quick toggles:
- **Xcode preview.** `.preferredColorScheme(.dark)`.
- **Simulator.** Cmd-Shift-A.
- **Real device.** Settings → Display & Brightness → Dark.

Audit every screen in both. Common issues:
- Hardcoded white backgrounds.
- Black text invisible on dark.
- Images with white backgrounds peeking through.
- Insufficient contrast on translucent surfaces.

Fix by replacing hardcoded with semantic or providing dark variants.

## Forced light/dark per-view

Sometimes a specific view must stay light or dark (e.g., a photo editor that always shows on dark for color accuracy):

```swift
ContentView()
  .preferredColorScheme(.dark)
```

Use sparingly. Forcing one mode on a user who prefers the other = friction.

## Dynamic colors via UITraitCollection

UIKit's old way (still works):

```swift
let myColor = UIColor { trait in
  switch trait.userInterfaceStyle {
    case .dark:  return darkVersion
    default:     return lightVersion
  }
}
```

Asset Catalog is cleaner for static colors; dynamic UIColor for programmatically computed.

## Brand identity in dark mode

Some brands feel different in dark. Examples:
- **Spotify.** Dark-first; light mode optional and recent.
- **YouTube.** Light by default but dark works.
- **Apple.** Mostly mode-agnostic; both look great.

Decide whether your brand reads "dark-first," "light-first," or "both equally." Test marketing materials, screenshots, and app icon for both.

## Color contrast checks

Tools:
- **Accessibility Inspector.** Xcode → Open Developer Tool → Accessibility Inspector. Color audit.
- **Contrast checker websites.** WebAIM Contrast Checker.
- **Stark plugin** for Figma / Sketch.

Aim for WCAG AA minimum; AAA for critical content.

In dark mode specifically: low-contrast gray text on near-black is a common issue. Bump up.

## Mistakes to avoid

- **Hardcoded colors.** Doesn't adapt.
- **Inverted color schemes.** Looks weird; not Apple's approach.
- **Untested dark mode.** Bugs in production.
- **Pure white text on pure black.** Eye fatigue.
- **Brand color same in both modes.** Often needs lighter dark variant for contrast.

## Summary

- Dark mode = curated palette, not inverted.
- Semantic colors (label, background, fill) adapt automatically.
- Asset Catalog colors with light + dark variants for custom.
- Layered backgrounds convey hierarchy in low-contrast dark.
- Test contrast (WCAG AA); accessibility inspector helps.
- Don't force mode unless brand requires.

Next: materials and translucency.
