---
module: 2
position: 3
title: "Spacing, alignment, and the 8pt grid"
objective: "Make layouts feel intentional without measuring everything."
estimated_minutes: 5
---

# Spacing, alignment, and the 8pt grid

## The 8pt grid

Apple's interfaces use multiples of 8 (sometimes 4) for spacing. Padding, margins, gaps between elements all snap to 8, 16, 24, 32, etc.

Why 8:
- **Even subdivision.** 8pt scales cleanly across @1x, @2x, @3x screens; pixels align.
- **Visual rhythm.** Consistent spacing creates calm; arbitrary spacing creates noise.
- **Decision shortcut.** Designers don't agonize over "13 vs 14pt"; pick from the set.
- **Composability.** Tokens compose: 8 + 8 = 16; 16 + 8 = 24.

For finer needs: 4pt sub-grid. Within elements (small icon padding, fine adjustment), 4pt steps OK. Between elements: 8pt minimum.

## Standard spacing values

```
4pt    fine internal (icon to text gap)
8pt    tight gap (between related items)
12pt   medium (form field spacing, between paragraphs)
16pt   standard (default content margins; section gaps)
24pt   loose (major section breaks)
32pt   large (top/bottom of screens)
44pt   touch target row spacing
```

Pick from this set. Avoid 13, 17, 21pt arbitrary numbers.

## SwiftUI defaults

SwiftUI's stack spacing defaults are tuned to HIG:

```swift
VStack(spacing: 16) {
  Text("Title")
  Text("Body")
}
.padding()  // default 16pt all sides
```

`.padding()` is 16pt; explicit values when finer control needed.

## Safe areas

iOS devices have screen real estate that's not safe:
- **Top.** Notch, status bar, dynamic island.
- **Bottom.** Home indicator on Face ID devices.
- **Sides.** Curved corners.

Safe area inset = the region content should respect. Place primary content within; let backgrounds extend beyond.

```swift
ScrollView {
  // content here
}
.background(Color.brand)  // extends to edges including under nav
.safeAreaInset(edge: .bottom) {
  // sticky footer respecting safe area
}
```

UIKit: safe area layout guides.

Backgrounds (color fills, images) often extend edge-to-edge for design; interactive content stays within safe area.

## Layout margins

Apple defines layout margins per device class:
- **iPhone (compact width).** 16pt left/right.
- **iPad (regular width).** 20pt left/right; sometimes more.

These are starting points. Honor them; align content to these margins for that "native" feel.

## Alignment

Within a card / row:
- **Leading-align text by default.** Reading order; users scan from start.
- **Center-align display headers.** Page titles, big numbers.
- **Trailing-align numbers in tables.** Decimal points line up.

Mixed alignment in one screen feels chaotic. Pick one primary; deviate consciously.

## Visual rhythm — consistent spacing throughout

Apps with mixed spacing (16pt here, 22pt there, 18pt elsewhere) feel sloppy. Apps with consistent rhythm (every section gap is 24pt; every form field gap is 12pt) feel deliberate.

Establish a spacing scale per app:
- **Tight (8pt).**
- **Normal (16pt).**
- **Loose (24pt).**
- **Generous (32pt).**

Use these as design tokens. New designers join → easier to maintain consistency.

## Density vs breathing room

Density: more information per screen. Useful for power users (Mail in Mac), data tables, dashboards.

Breathing room: more whitespace. Useful for casual users, content-focused apps, reading-intensive.

Apple's mobile apps lean toward breathing room. Mac apps allow denser layouts (Mail's three-pane view fits a lot).

Match density to use case. Don't blindly apply mobile breathing room to desktop data tables.

## Grid systems

Beyond 8pt spacing, formal grid systems:
- **Column grids.** Useful on iPad and Mac. 12-column or similar.
- **Modular grids.** Cards align to a grid; sized in 1-, 2-, 4-column blocks.

iOS phone apps rarely need formal grids — vertical stacks dominate. iPad and Mac apps benefit from grids for multi-column / responsive layouts.

## Whitespace as design

Empty space is design. The instinct to fill empty space loses readability; the discipline to leave space gains polish.

Look at Apple's settings: every section has top + bottom whitespace; every row has internal padding. Density is intentional, not maximal.

## SwiftUI tools for layout

Beyond `VStack` / `HStack` / `ZStack`:
- **LazyVGrid / LazyHGrid.** Grids with adaptive column counts.
- **Spacer.** Pushes views apart.
- **Geometry reader.** Dynamic sizing based on parent.
- **Layout protocol.** Custom layout algorithms.

UIKit: Auto Layout, UIStackView, UICollectionView.

For most apps: stacks + padding + Spacer covers 90% of layout. Reach for fancier tools when needed.

## Practical spacing system

For a new app, define tokens:

```swift
enum Spacing {
  static let xs: CGFloat = 4
  static let sm: CGFloat = 8
  static let md: CGFloat = 16
  static let lg: CGFloat = 24
  static let xl: CGFloat = 32
}

// Usage
.padding(Spacing.md)
```

Same in design tools (Figma variables). Designers + engineers reference the same token names; alignment in execution.

## Mistakes to avoid

- **Random spacing values.** 11pt here, 19pt there.
- **Ignoring safe areas.** Content under notch.
- **Tight against edges.** Looks unfinished; respect margins.
- **Crammed forms.** No breathing room; user fatigue.
- **Misaligned across screens.** Same sections, different spacing.

## Summary

- 8pt grid for spacing; 4pt for fine internal adjustments.
- Safe areas matter; content respects, backgrounds extend.
- Layout margins per device class (16pt iPhone, 20pt iPad).
- Leading-align text; trailing-align numbers in tables.
- Define a spacing scale; use as tokens.
- Whitespace is design; resist filling every pixel.

Next: safe areas and adaptive layouts.
