---
module: 5
position: 2
title: "Adaptive design across device classes"
objective: "One design system, many screen sizes."
estimated_minutes: 5
---

# Adaptive design across device classes

## The adaptive mindset

A modern Apple app needs to work across iPhones (SE to Pro Max), iPads (mini to Pro 13"), Macs (laptop and external monitors), and possibly watch + TV. Plus Dynamic Type, orientation, multitasking, accessibility modes.

Adaptive design = one design system that responds gracefully to each. Not "design for iPhone, port to iPad later" — design for the matrix.

## Trait collections

iOS / iPadOS / macOS expose UITraitCollection with values like:
- `horizontalSizeClass` (compact / regular).
- `verticalSizeClass`.
- `userInterfaceStyle` (light / dark).
- `userInterfaceIdiom` (phone / pad / mac / tv / vision).
- `accessibilityContrast`.
- `legibilityWeight` (regular / bold).
- `preferredContentSizeCategory` (Dynamic Type size).

SwiftUI exposes via Environment:

```swift
@Environment(\.horizontalSizeClass) var hSizeClass
@Environment(\.userInterfaceIdiom) var idiom
```

UIKit: `traitCollection`.

## Conditional UI

```swift
if hSizeClass == .regular {
  // iPad, large iPhone landscape, or Mac
  HStack {
    Sidebar()
    Detail()
  }
} else {
  // iPhone, narrow iPad multitasking
  NavigationStack {
    ContentList()
  }
}
```

The framework recomputes when traits change (rotation, multitasking transition, dark/light toggle). UI adapts live.

## NavigationSplitView pattern

SwiftUI's built-in adaptive:

```swift
NavigationSplitView(sidebar: {
  Sidebar()
}, content: {
  ContentList()
}, detail: {
  DetailView()
})
```

Behavior:
- **iPhone (compact width):** Single column with push navigation.
- **iPad (regular width):** Two-column or three-column with sidebar.
- **Mac:** Sidebar + content + detail; resizable columns.

Adapt by framework; you write once. Most multi-column apps use this.

## Adaptive sheets and popovers

```swift
.popover(isPresented: $show) {
  Content()
}
```

Renders as:
- **iPhone:** Modal sheet from bottom (because popover doesn't make sense on small screens).
- **iPad / Mac:** True popover anchored to source view.

Same code, different presentation. Trust the framework.

## Conditional toolbars

Toolbars adapt by platform:

```swift
.toolbar {
  ToolbarItem(placement: .navigationBarTrailing) {
    Button("Add") { add() }
  }
}
```

On Mac: Appears in the window toolbar.
On iPad / iPhone: Appears in navigation bar.

The placement enum maps to platform-appropriate locations.

## Stack vs columns

For layout:

```swift
ViewThatFits {
  // First child: try this layout
  HStack { LeftPanel(); RightPanel() }
  // Falls back to next if doesn't fit
  VStack { TopPanel(); BottomPanel() }
}
```

`ViewThatFits` tries layouts in order; uses first that fits. Adaptive without explicit conditions.

## Form factors and gestures

Each device has different input:
- **iPhone:** Touch only.
- **iPad:** Touch + sometimes pointer + sometimes Pencil.
- **Mac:** Mouse + keyboard.

Gestures need conditional handling:

```swift
if idiom == .phone {
  // Use swipe-to-delete
} else {
  // Use hover-to-reveal-buttons
}
```

Or design gestures that work everywhere (tap for primary; long-press for menu — works on touch + pointer).

## Window sizing on Mac / iPad

Mac windows are user-resizable. iPad multitasking changes width dynamically.

Don't assume fixed widths. Use:
- Geometry readers to react to width.
- Relative spacing (percentages, fractions).
- Min / max constraints.

Test at smallest expected width (iPad Slide Over ~320pt) and largest (Mac 4K monitor).

## Aspect ratios for content

Photos, videos, illustrations should adapt:

```swift
Image("hero")
  .resizable()
  .aspectRatio(contentMode: .fill)
  .frame(maxHeight: 400)
  .clipped()
```

`contentMode: .fill` fills frame; clips overflow. `contentMode: .fit` fits within; letterboxes.

Different ratios for different placements — square thumbnails, 16:9 video cards, full-bleed banners. Define per use case.

## Adaptive type

Beyond Dynamic Type:
- **iPhone:** Default sizes.
- **iPad:** Sometimes one step up (more screen, can use more space).
- **Mac:** Often smaller for density (Mac users tolerate denser type).

SwiftUI's named text styles handle automatically per platform. Custom sizes need manual.

## Layout tokens

For maintainability:

```swift
struct LayoutConstants {
  static let contentPadding: CGFloat = 16
  static let sectionGap: CGFloat = 24
  static let cardCornerRadius: CGFloat = 12
}

#if os(macOS)
// Override for Mac (different feel)
#endif
```

Center the values; use throughout; adjust per platform centrally if needed.

## Testing adaptive layouts

Tools:
- **Xcode previews** with multiple device variants:
```swift
.previewDevice("iPad Pro 13\"")
.previewDevice("iPhone 16")
.previewDevice("Mac")
```
- **Simulator** for each device.
- **Real devices** for haptics / performance / final feel.
- **Window resizing** on Mac during dev.
- **Multitasking enabled** on iPad simulator.

For each major screen: verify at smallest device + largest + orientation change + Dynamic Type A5. The matrix is finite; cover it.

## When adaptive fails

Sometimes layouts don't adapt gracefully — drastically different design needed per platform:

- **Mac:** Keyboard-driven; menu bar; multi-window.
- **iPhone:** One-thumb-driven; bottom controls.

For these: accept that "one UI fits all" doesn't work; design distinct UIs per platform with shared backend.

SwiftUI helps; doesn't eliminate. Mac apps that look great as iPhone-shaped windows still feel like iPad ports.

## Mistakes to avoid

- **Hardcoded widths.** Break in multitasking / window resize.
- **Same UI everywhere.** Wastes platform strengths.
- **Untested at extreme sizes.** Slide Over width breaks; Mac wide breaks.
- **Per-platform forks without shared logic.** Maintenance nightmare.
- **Ignoring trait changes.** Rotation breaks; mode switch breaks.

## Summary

- Adaptive = responds to trait changes (size class, mode, idiom).
- `NavigationSplitView` for adaptive sidebar + detail across iPhone / iPad / Mac.
- `ViewThatFits` for layout-fallback logic.
- Conditional UI via `horizontalSizeClass` checks.
- Test at extreme sizes; preview across devices.
- Sometimes platform-specific UIs justified; share logic, not necessarily layout.

Next: VoiceOver, Switch Control, Voice Control.
