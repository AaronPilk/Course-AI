---
module: 3
position: 1
title: "The system color palette"
objective: "Apple's built-in colors and when to use them."
estimated_minutes: 5
---

# The system color palette

## Apple's curated palette

Apple ships a defined set of system colors:

**System colors (tints):**
- Red, Orange, Yellow, Green, Mint, Teal, Cyan, Blue, Indigo, Purple, Pink, Brown, Gray.

Each has light + dark variants automatically. Each has been color-tested by Apple's design team for legibility and accessibility.

```swift
Color.red       // adapts to dark mode
Color.blue
Color.green
```

UIKit: `UIColor.systemRed`, `UIColor.systemBlue`.

These aren't just "red" — they're carefully calibrated to look right on iOS.

## Why use system colors

- **Free dark-mode adaptation.** Each color has different RGB values in dark mode; system handles.
- **Accessibility-checked.** Contrast tested across modes.
- **Consistent with iOS.** Familiar to users; aligns with system UI.
- **Updated by Apple.** Future iOS versions may tweak; you inherit.

Custom colors require:
- Defining light + dark variants.
- Checking contrast in both.
- Maintaining over time.

For accent color and brand: define custom. For most other UI: use system.

## Standard semantic colors

Beyond raw colors, semantic ones describe purpose:

```swift
Color.primary        // main text (black light, white dark)
Color.secondary      // secondary text (gray, but mode-adapted)
Color.accentColor    // your app's accent (configurable)
```

UIKit:
```swift
UIColor.label           // primary text
UIColor.secondaryLabel  // secondary text
UIColor.tertiaryLabel   // less prominent
UIColor.placeholderText // placeholder
UIColor.systemBackground       // main background
UIColor.secondarySystemBackground  // grouped background
UIColor.tertiarySystemBackground
```

Semantic colors automatically adapt to:
- Light vs dark mode.
- Increase Contrast.
- Reduce Transparency.

Hardcoded colors don't. Always prefer semantic.

## System fill colors

For controls / backgrounds within content:

```swift
UIColor.systemFill        // tint behind buttons
UIColor.secondarySystemFill
UIColor.tertiarySystemFill
UIColor.quaternarySystemFill
```

These translucent fills layer with the background, creating depth. Used for capsule buttons, search bars, "destructive" backgrounds.

## Grouped backgrounds

iOS has two background contexts:
- **Plain.** Most screens; flat background.
- **Grouped.** Settings-style; rows on a light gray background with inset cards.

Each has matching backgrounds:

```swift
UIColor.systemBackground               // plain
UIColor.systemGroupedBackground        // grouped
UIColor.secondarySystemGroupedBackground  // card on grouped
```

Match the context. A grouped table on plain background looks wrong.

## Accent color — your brand thumbprint

The biggest brand decision. iOS applies your accent color to:
- Tab bar selected items.
- Navigation back button.
- Button text and icons.
- Switch on-state.
- Selected list rows.
- Slider thumb.

Configure once:

```swift
.tint(.brand)                       // SwiftUI app-wide
window.tintColor = .brand           // UIKit
```

Or in Asset Catalog: define "AccentColor"; system uses it.

Pick:
- **Distinctive.** Avoid generic system blue.
- **Accessible.** WCAG AA contrast against backgrounds in both light + dark.
- **Color-blind safe.** Test with simulators / Sim Daltonism.

One well-chosen accent + system everything else = native-feeling branded app.

## Color in dark mode

Each color shifts in dark mode:

- **System red.** Slightly desaturated to feel less aggressive on dark.
- **Backgrounds.** White → near-black, but not pure black (true black creates harsh contrast).
- **Labels.** Black → near-white (white text on black is fatigue; off-white is gentler).

You don't manage this; system colors do. Just don't hardcode `Color.white`.

## Custom colors with mode support

For custom brand colors, define both:

```swift
extension Color {
  static let brandPrimary = Color("BrandPrimary")  // Asset Catalog has light + dark
}
```

In Asset Catalog: create color set; provide "Any" and "Dark" appearance values.

Now `Color.brandPrimary` adapts automatically.

UIKit equivalent: define UIColor with `dynamicProvider`:

```swift
let brand = UIColor { trait in
  trait.userInterfaceStyle == .dark ? darkBrandColor : lightBrandColor
}
```

## What "accent" means specifically

The HIG: accent color signals interactivity. The accent appears on things you can tap / change / activate.

Backgrounds, text, decorations should NOT use accent — that dilutes the signal.

Sometimes designers accent everything; lose the meaning. Pull back; reserve accent for interactive.

## Don't use color alone

For state (selected, error, success):
- **Color is signal.** Use it.
- **Plus icon / weight / text.** Color-blind users need alternatives.

```
Selected: blue background + checkmark icon
Error: red border + error text
Success: green tag + ✓ symbol
```

The HIG calls this "Differentiate Without Color" — combine color with other signals.

## Brand color quantity

Used sparingly. The eye fatigues on heavy color; design loses calm.

- **Lots of color in chrome.** Cluttered.
- **One accent, rest grayscale + content.** Calm.

Apple's apps use minimal color in chrome. Try squinting at Notes — barely any color in UI; content provides what color exists.

## Mistakes to avoid

- **Hardcoded `Color.white` / `Color.black`.** Doesn't adapt.
- **Skipping accent color.** App feels generic.
- **Accent everywhere.** Loses meaning.
- **Color-only state.** Excludes color-blind users.
- **Custom colors without dark variant.** Dark mode broken.

## Summary

- System colors (red, blue, etc.) + semantic (label, background) free for dark mode + accessibility.
- Custom brand color = define light + dark via Asset Catalog.
- Accent color = brand thumbprint applied system-wide via `.tint`.
- Don't use color alone for state; combine with icon / text.
- Restraint with color; sparse use beats heavy use.

Next: semantic colors and dark mode.
