---
module: 2
position: 1
title: "SF Pro and the system fonts"
objective: "Apple's typography stack and how to use it."
estimated_minutes: 5
---

# SF Pro and the system fonts

## The SF family

Apple's system fonts:

- **SF Pro.** Default UI font. Multiple optical sizes (SF Pro Text for body, SF Pro Display for headlines).
- **SF Pro Rounded.** Friendly variant.
- **SF Mono.** Monospaced; code, numbers in tables.
- **SF Compact.** Watch optimized.
- **New York.** Serif variant for reading-intensive contexts.

Each is free, pre-installed on Apple devices, and engineered for screens at every size.

For UI: SF Pro is the default. Reach for others (Rounded, NY) intentionally.

## Why SF Pro is a good system font

- **Wide weights.** Ultralight through Black; covers any hierarchy.
- **Italic + condensed variants.**
- **Glyphs for many languages.** Latin, Cyrillic, Greek, math, currency, arrows, etc.
- **Optical sizing.** SF Pro Text optimized for small body; Display for large headlines. Smooth transition.
- **Variable font.** Animated weight transitions.

Custom fonts rarely justify replacing SF for UI. Even branded SaaS often uses SF for body + custom for display only.

## Type scales — the system styles

Rather than picking arbitrary sizes, Apple defines named text styles:

```
Large Title
Title 1
Title 2
Title 3
Headline
Body
Callout
Subheadline
Footnote
Caption 1
Caption 2
```

Each has default size + weight + leading. In SwiftUI:

```swift
Text("Hello").font(.title)
Text("Hello").font(.body)
Text("Hello").font(.caption)
```

UIKit equivalent: `UIFont.preferredFont(forTextStyle: .body)`.

Why named styles matter: Dynamic Type. Users can scale text up or down; named styles scale predictably. Hardcoded sizes don't.

## Hierarchy at a glance

```
Large Title    34pt regular    (top of screen; page title)
Title 1        28pt regular    (section headers)
Title 2        22pt regular
Title 3        20pt regular
Headline       17pt semibold   (emphasized in lists)
Body           17pt regular    (paragraphs)
Callout        16pt regular    (slightly smaller body)
Subheadline    15pt regular    (less emphasized)
Footnote       13pt regular    (small annotations)
Caption 1      12pt regular    (tiny)
Caption 2      11pt regular    (tinier)
```

Default for body: 17pt. Don't go smaller without good reason; smaller text excludes vision-impaired users.

## Weights — used sparingly

```
Ultralight (100)
Thin (200)
Light (300)
Regular (400)
Medium (500)
Semibold (600)
Bold (700)
Heavy (800)
Black (900)
```

Most UI uses Regular for body and Semibold or Bold for emphasis. Three weights typically enough across an app.

Ultralight at small sizes is unreadable. Reserve for very large display.

## Line height (leading)

Default text styles include appropriate leading. If customizing:

- **Body text.** 1.3-1.5x font size.
- **Headlines.** 1.1-1.2x (tighter).
- **Captions.** 1.2-1.4x.

In iOS terms: lineSpacing or paragraph style. Default is usually right; don't override without reason.

## Tracking (letter spacing)

SF Pro adjusts tracking automatically based on size — wider tracking at small sizes for legibility; tighter at large for elegance. Don't override unless designing all-caps labels (which usually want slight added tracking).

## Numbers — tabular vs proportional

SF Pro has two number forms:
- **Proportional.** Variable widths; reads better in prose.
- **Tabular.** Fixed widths; aligns in columns.

For tables and timers: tabular. For body text and prose: proportional (default).

```swift
Text("123").font(.body.monospacedDigit())
```

## SF Mono

For code, terminal output, anywhere monospace matters. Use when alignment to columns matters more than readability of prose.

## New York

Apple's serif. Used in Books, Notes' "Title" style, and some long-form contexts.

```swift
Text("Reading").font(.system(.title, design: .serif))
```

Optional but available; gives a different texture for reading-intensive apps. Most UIs don't need it.

## SF Pro Rounded

For friendlier voice. Used in some apps (Fitness, kids apps). Same proportions as SF Pro but softer corners.

Use deliberately; mixing rounded and regular in the same app reads as inconsistent.

## Custom fonts — when justified

Reasons to use custom:
- **Distinct editorial brand.** Magazine apps; specialty publications.
- **Display-only.** Headlines / hero text; body still SF.
- **Cross-platform consistency.** Brand obligation to use same font everywhere.

Costs:
- **License fees.** Some commercial fonts.
- **Performance.** Font loading on first launch.
- **Dynamic Type complexity.** Need to provide scaling for accessibility.
- **Familiarity.** Users expect SF.

For body text in iOS apps: stick to SF unless you have a strong reason. The font is invisible when right; visible when wrong.

## Mistakes to avoid

- **Hardcoded font sizes.** Breaks Dynamic Type.
- **Custom font for everything.** Performance hit + familiarity loss.
- **Five different weights in one screen.** Hierarchy via 2-3 weights, not 5.
- **Ultralight at small size.** Unreadable.
- **No respect for Dynamic Type.** Users can't scale.

## Summary

- SF Pro is Apple's system font; comprehensive and free.
- Use named text styles (Large Title → Caption 2) for Dynamic Type compatibility.
- Body: 17pt regular default; don't go smaller without reason.
- 2-3 weights per app, used purposefully.
- SF Mono for code; New York for reading; Rounded for friendliness.
- Custom fonts: display only; respect Dynamic Type.

Next: Dynamic Type and accessibility scales.
