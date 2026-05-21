---
module: 3
position: 3
title: "Materials, blur, and translucency"
objective: "Apple's distinctive layered look."
estimated_minutes: 4
---

# Materials, blur, and translucency

## What materials are

Apple's UI layers blur and translucency to create depth. Translucent toolbars let underlying content show through; sidebars on macOS have a frosted-glass look; modals dim and blur the screen behind them.

This isn't just decoration. Translucency conveys:
- **What's on top is active.**
- **The layer below is paused / informational.**
- **Spatial relationship.** "I came from there."

SwiftUI provides standard materials:

```swift
.background(.ultraThinMaterial)
.background(.thinMaterial)
.background(.regularMaterial)
.background(.thickMaterial)
.background(.ultraThickMaterial)
```

Each blurs the background and tints based on light / dark mode.

## When to use materials

- **Toolbars.** Floating over content; background visible through.
- **Sidebars.** Sit "above" detail view; subtle blur.
- **Sheets / modals.** Layer above main content.
- **Cards on rich backgrounds.** Float above photos / textures.
- **Liquid Glass (visionOS, iOS 26+).** Apple's newer material system.

When NOT:
- **Solid content surfaces.** Notes' note view is solid; reading shouldn't be through blur.
- **Performance-sensitive.** Materials cost GPU; tons of them slow apps.

## Standard navigation bars

iOS navigation and tab bars use translucent backgrounds by default:

```swift
NavigationStack {
  ScrollView {
    Content()
  }
  .toolbarBackground(.thinMaterial, for: .navigationBar)
}
```

As you scroll, content disappears behind the translucent bar — you sense it's there. Visual continuity.

## Hierarchy via materials

Layered:
1. **Background:** systemBackground.
2. **Card or section:** secondarySystemBackground (slightly different color).
3. **Card hover / selected:** add subtle material on top.
4. **Modal:** sheet with material background atop dimmed parent.

Each layer reads as "above" the previous through tonal shift + slight depth cues.

## Custom translucency

For very specific needs:

```swift
.background(.regularMaterial.opacity(0.8))
```

Reduces translucency intensity. Use sparingly; standard materials usually suffice.

For UIKit:
```swift
let blur = UIBlurEffect(style: .regular)
let blurView = UIVisualEffectView(effect: blur)
```

## Vibrancy

Sometimes text needs to remain legible through translucent backgrounds. Vibrancy is a contrast-boost for text/content sitting on materials:

```swift
.foregroundStyle(.primary)  // primary content
.foregroundStyle(.secondary)
```

When placed on a material, these colors render with vibrancy — boosted contrast that maintains the translucent look while staying readable.

UIKit: `UIVibrancyEffect`.

## Liquid Glass (iOS 26+)

Apple's newer material design. Combines:
- Translucent blur.
- Subtle color shifts based on content underneath.
- Animated highlights as user interacts.
- Depth perception via parallax.

Most apps inherit by using standard SwiftUI containers in iOS 26+; Apple's framework handles the rendering.

For older OS: graceful fallback to standard materials.

## Reduce Transparency setting

Some users (vision impairment, motion sensitivity) prefer reduced transparency. Apple provides:

Settings → Accessibility → Display & Text Size → Reduce Transparency

When enabled, materials become more opaque (less blur). The system handles this automatically for standard materials; if you use raw blur effects, check the trait.

```swift
@Environment(\.accessibilityReduceTransparency) var reduceTransparency

.background(reduceTransparency ? Color(.systemBackground) : .regularMaterial)
```

Respect the user's preference.

## Performance

Materials are GPU work. A few are fine; many on screen at once slow scrolling.

- **A few large materials.** Toolbar, sheet — cheap.
- **Many small materials per cell.** Costs adds up; profile.
- **Scrolling lists with materials.** Especially risky; test on older devices.

When in doubt: use solid backgrounds; reserve materials for floating chrome.

## Materials and dark mode

Standard materials adapt to mode:
- Light mode: light blur tint.
- Dark mode: dark blur tint.

Don't override unless you have specific reason. The "white blur on white" or "black blur on black" auto-selection is what users expect.

## Designing for materials

In Figma / Sketch:
- **Apple Design Resources** have material samples.
- Approximate with translucent rectangles + Gaussian blur underneath.
- Test in app; on-device rendering differs from Figma approximations.

For production: trust SwiftUI's renderers; design mockups are guidance.

## Mistakes to avoid

- **Materials everywhere.** Performance hit + visual noise.
- **Custom translucency that fights system.** Stick to standard materials.
- **No vibrancy on material-backed text.** Hard to read.
- **Ignoring Reduce Transparency.** Excludes users.
- **Materials inside materials.** Layered translucency rarely works.

## Summary

- Materials = translucent blurred surfaces; depth + visual continuity.
- Standard materials: ultraThin to ultraThick.
- Toolbars, sheets, cards on rich content benefit.
- Vibrancy keeps text readable through materials.
- Reduce Transparency setting must be honored.
- Performance matters; don't go material-heavy.

Next: accessibility, contrast, color-blindness.
