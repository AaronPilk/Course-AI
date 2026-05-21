---
module: 2
position: 2
title: "Dynamic Type and accessibility scales"
objective: "Build text that adapts to every reader."
estimated_minutes: 5
---

# Dynamic Type and accessibility scales

## What Dynamic Type is

Dynamic Type lets users change text size system-wide. Settings → Display & Brightness → Text Size offers a slider; Accessibility settings expose larger sizes. Apps that honor Dynamic Type scale text accordingly.

Why it matters:
- 1 in 4 adults over 50 has reduced vision.
- Outdoor reading in bright sun benefits from larger text.
- Aging Apple's audience needs accessibility built in.

For your app: use named text styles, support Dynamic Type, design layouts that adapt. Apple makes this practical.

## Dynamic Type sizes

Standard sizes (1-7):

```
xSmall    Small    Medium    Large (default)    xLarge    xxLarge    xxxLarge
```

Plus accessibility sizes (1-5):

```
A1    A2    A3    A4    A5
```

At A5, body text is roughly 3x the default. Layouts must adapt — a row of 4 buttons at default may need to stack vertically at A5.

## Implementation in SwiftUI

```swift
Text("Hello")
  .font(.body)   // scales automatically
```

Done. SwiftUI handles Dynamic Type for named styles.

For custom sizes that should still scale:

```swift
Text("Hero")
  .font(.system(size: 60, weight: .bold))
  .dynamicTypeSize(...DynamicTypeSize.accessibility3)  // cap at A3
```

The `.dynamicTypeSize(...)` modifier caps how large the text gets — sometimes layouts can't accommodate the largest accessibility sizes; better to cap than break.

## UIKit

```swift
label.font = UIFont.preferredFont(forTextStyle: .body)
label.adjustsFontForContentSizeCategory = true
```

The second line is critical — without it, the label uses preferred font at app launch but doesn't update if user changes the size during the session.

## Layouts that adapt

At very large text sizes, horizontal layouts break:

```
[Icon] Title text here    →    [Icon]
                                Title text here
                                (stacks vertically)
```

Use SwiftUI's `.adaptive` patterns or explicit checks:

```swift
@Environment(\.dynamicTypeSize) var typeSize

VStack {
  if typeSize.isAccessibilitySize {
    // Stack vertically
    Image("icon")
    Text("Title")
  } else {
    HStack {
      Image("icon")
      Text("Title")
    }
  }
}
```

For UIKit: similar with `UITraitCollection.preferredContentSizeCategory`.

## Truncation vs wrapping

If text doesn't fit, options:
- **Wrap.** Text flows to multiple lines. Almost always preferred.
- **Truncate.** End ellipsis (...). Use only when full text is available elsewhere (tap to expand).

Don't truncate where wrap would work.

```swift
Text(longTitle)
  .lineLimit(nil)  // no line limit; wrap freely
```

For lists: usually wrap titles; truncate after 2-3 lines. For cells: depends on hierarchy.

## Accessibility traits

Beyond size, accessibility includes:
- **Bold Text.** User preference for bolder weights.
- **Increase Contrast.** Stronger color contrast.
- **Reduce Motion.** Cut animations.
- **Differentiate Without Color.** Don't rely on color alone for state.

Check these via `Environment`:

```swift
@Environment(\.accessibilityEnabled) var accessEnabled
@Environment(\.legibilityWeight) var legibilityWeight  // .bold or .regular

Text("Hello")
  .fontWeight(legibilityWeight == .bold ? .bold : .regular)
```

UIKit equivalents exist. Plan for these from the start.

## Testing

The Accessibility Inspector (Xcode → Open Developer Tool) lets you simulate:
- Text size variations.
- Reduce Transparency.
- Color filters.
- VoiceOver.
- Voice Control.

Test at:
- **xxxLarge.** Largest non-accessibility size.
- **A3.** Mid-accessibility size.
- **A5.** Largest accessibility size.

Many apps work fine at default but break at A5. Test before you ship.

## When to use custom (non-text-style) fonts

Even with custom fonts, support Dynamic Type via scaling factors:

```swift
Text("Hero")
  .font(.custom("YourFont", size: UIFontMetrics(forTextStyle: .title1).scaledValue(for: 28)))
```

UIFontMetrics scales custom fonts to match the named style's size category. Now your custom font respects Dynamic Type too.

## Edge cases

- **Numbers in tables.** Tabular figures + Dynamic Type can collide; use monospaced digit variant.
- **All caps.** Don't scale all-caps elements as aggressively; can become unreadable.
- **Fixed-size UI** (game HUD, controls). Use sparingly; Dynamic Type concerns mostly apply to reading text.

For complex apps: test edge cases systematically.

## What Apple's own apps do

- **Mail.** Wraps long subjects; scales body text fully.
- **Messages.** Bubbles expand at large text sizes; layout adapts.
- **Settings.** Lists adjust row heights; text wraps.
- **Notes.** Body scales massively; rendering optimized for various sizes.

These are reference points. If Notes works at A5 with a thousand-character note, so should yours.

## Accessibility settings combinations

Real users combine settings:
- Large text + Bold text + Increase Contrast.
- Reduce Motion + Reduce Transparency.
- Voice Control + larger touch targets.

Test combinations. Apple's accessibility audit (covered in Module 5) walks through.

## Mistakes to avoid

- **Hardcoded sizes.** Excludes large-text users.
- **Layouts that overflow at A5.** Visual chaos.
- **Truncation when wrap would work.** Hides content.
- **Custom fonts without scaling.** Default font scales; yours doesn't.
- **No testing at accessibility sizes.** Bugs in the wild.

## Summary

- Dynamic Type lets users scale system-wide; honor it.
- Use named text styles (`.body`, `.title`) for automatic scaling.
- For UIKit: `adjustsFontForContentSizeCategory = true`.
- Adapt layouts at accessibility sizes — vertical stacks vs horizontal.
- Test at xxxLarge and A5 explicitly.
- Custom fonts: use UIFontMetrics for Dynamic Type support.

Next: spacing, alignment, the 8pt grid.
