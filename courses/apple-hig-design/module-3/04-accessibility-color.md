---
module: 3
position: 4
title: "Accessibility: contrast and color-blindness"
objective: "Color choices that work for every user."
estimated_minutes: 5
---

# Accessibility: contrast and color-blindness

## Why this lesson

About 8% of men and 0.5% of women have some form of color vision deficiency. About 12-15% of adults have reduced visual contrast sensitivity. Combined with low vision, sun glare, and dark-environment viewing — designing for color accessibility helps a lot of people, not just an "edge case."

Apple bakes accessibility into HIG. Your job is using its features correctly.

## Contrast ratios

WCAG (Web Content Accessibility Guidelines) defines:
- **AA Normal text.** 4.5:1 minimum.
- **AA Large text** (18pt+ or 14pt+ bold). 3:1.
- **AAA Normal.** 7:1.
- **Non-text (icons, controls).** 3:1.

Apple's HIG defers to WCAG. Aim for AA at minimum; AAA where critical.

Tools to check:
- **Xcode Accessibility Inspector** → Color audit.
- **WebAIM Contrast Checker.** Online.
- **Stark** plugin for Figma / Sketch.

Test in light AND dark mode. Pass both.

## Common contrast failures

- **Light gray text on white.** Trendy in some designs; often fails AA.
- **Brand color on white.** Brand colors often hit visual hierarchy but fail contrast. Adjust per context.
- **Placeholder text.** Defaults are usually fine; custom often too light.
- **Disabled states.** Easy to over-fade; users misidentify as available.
- **Dark mode insufficient.** Lighter-on-dark needs more contrast boost than you'd think.

Audit:
1. Run Accessibility Inspector.
2. Identify failures.
3. Adjust to pass AA.

## Increase Contrast

iOS setting (Accessibility → Display & Text Size → Increase Contrast). Boosts contrast app-wide.

Semantic colors handle automatically; some adjust to stricter values when this is on. Custom colors don't — write code to respect:

```swift
@Environment(\.accessibilityShowButtonShapes) var showButtonShapes
@Environment(\.colorSchemeContrast) var contrast

// contrast == .increased → use higher-contrast version
```

Test with the setting on. Apps should still look intentional, not jarring.

## Color-blindness types

Most common:
- **Deuteranopia / Deuteranomaly** (~5% males). Reduced green sensitivity. Red and green hard to distinguish.
- **Protanopia / Protanomaly** (~1% males). Reduced red sensitivity. Similar effect.
- **Tritanopia / Tritanomaly** (~0.01%). Blue-yellow confusion.
- **Monochromacy.** Rare; complete color-blindness.

For 90% of color-blindness: red vs green is the common problem. Design ASSUMING users can't distinguish.

## Differentiate Without Color

Apple HIG: never rely on color alone to convey information. Combine with:
- **Icon shape.** Different shapes for different states.
- **Text label.** "Error: Invalid email."
- **Position.** Specific area for warnings.
- **Pattern / texture.** Stripes vs dots (less common).

The "Differentiate Without Color" setting forces apps to be color-independent. Test with it on.

## Examples

**Status indicators:**
- **Wrong:** Red dot = error; green dot = OK.
- **Right:** Red dot + ⚠ icon = error; green dot + ✓ icon = OK. Color reinforces; icon carries primary meaning.

**Chart data:**
- **Wrong:** Two lines colored differently; only color differentiates.
- **Right:** Two lines colored + different line styles (solid vs dashed) + labels at the end.

**Selected state:**
- **Wrong:** Background tint change only.
- **Right:** Background tint + checkmark icon + slightly elevated.

## Color-blindness simulators

Test your designs through CB-vision simulators:
- **Sim Daltonism** (macOS, free).
- **Color Oracle.** Cross-platform.
- **Chrome DevTools.** Built-in CB filters.
- **Figma plugins.** "A11y - Color Contrast Checker," etc.

Run major screens through. Notice where color was carrying primary meaning. Fix.

## Specific palette considerations

- **Red + green.** Most confused pair. Avoid as the only differentiator.
- **Red on amber.** Often passes contrast but fails for protanopia.
- **Pastel palettes.** Often weak contrast across the board.
- **Brand color as link indicator.** Some brand colors fail; combine with underline.

Apple's system red, blue, green have been color-tested; they're picked to remain distinguishable. Hand-picked custom colors often fail.

## High Contrast variants

Some apps provide explicit "high contrast" toggles:
- Default theme.
- High contrast theme.

Useful for: data-dense apps where users need maximum legibility; older audiences; outdoor use.

Implementation: a setting + alternate color tokens. Significant work; only justified if your audience benefits.

## Beyond color: motion sensitivity

Some users (vestibular disorders, autism, anxiety) are sensitive to motion. Apple provides Reduce Motion:

```swift
@Environment(\.accessibilityReduceMotion) var reduceMotion

withAnimation(reduceMotion ? .none : .easeInOut) { ... }
```

Animations should be subtle when this is on, or eliminated for non-essential motion. Covered more in Module 4.

## Apple's accessibility commitment

Apple has invested heavily; the iOS / macOS / iPadOS accessibility features are best-in-class. As a developer / designer:
- Use semantic colors.
- Use named text styles.
- Use Apple's controls.
- Test with accessibility settings.

You inherit Apple's work. Don't fight it.

## Mistakes to avoid

- **Untested contrast.** Run the inspector.
- **Color-only state.** Combine with icon, text.
- **Trendy low-contrast designs.** Excludes too many users.
- **Brand color over-applied.** Both fights accent meaning AND fails contrast.
- **Ignoring Reduce Motion / Increase Contrast settings.** Excludes affected users.

## Summary

- WCAG AA: 4.5:1 normal text, 3:1 large, 3:1 non-text. Aim AA minimum.
- Test contrast in both modes; tools: Xcode Accessibility Inspector, Stark, WebAIM.
- 8% of men have color-vision deficiency; design for red-green confusion.
- Combine color with icon / text / position; never color alone.
- Respect Increase Contrast / Reduce Transparency / Reduce Motion settings.

Module 3 complete. Next module: controls, gestures, motion.
