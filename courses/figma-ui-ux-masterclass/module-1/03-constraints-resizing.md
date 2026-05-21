---
module: 1
position: 3
title: "Constraints and resizing"
objective: "Make designs that resize without breaking."
estimated_minutes: 4
---

# Constraints and resizing

## The resize problem

You design a card at 320px wide. The same card needs to work at 600px in some contexts and 200px in others. Hand-resizing every element is impractical.

Solution: constraints + Auto Layout. Constraints handle the simpler case (positioning); Auto Layout (next module) handles the more dynamic case.

## What constraints do

Constraints define how a child layer behaves when its parent frame resizes.

Per child, on each axis (horizontal + vertical), specify:
- **Left.** Pin to left edge; distance from left maintains.
- **Right.** Pin to right edge.
- **Left + Right.** Stretch with parent.
- **Center.** Stay centered.
- **Scale.** Resize proportionally.

```
Parent: 400 wide.
Child: 100 wide, positioned 20 from left.

Constraint = Left → on resize to 600 wide, child stays 100 wide at 20 from left.
Constraint = Right → on resize to 600 wide, child stays 100 wide at distance from right maintained.
Constraint = Left+Right → child stretches to 300 wide (filling).
```

For most layouts: pick the constraint that matches intent.

## Where to set constraints

Right panel → Design tab → constraints section (when a frame's child is selected).

Visual: two icons + a frame outline indicating which edge(s) the child is anchored to.

Set per child; defaults are Left + Top.

## When constraints suffice

Constraints alone work for:
- **Fixed-position children.** Logo at top-left of header.
- **Stretching backgrounds.** Background fills full parent.
- **Centered content.** Logo centered in screen.
- **Bottom-anchored.** Footer at bottom of frame.

For these: constraints + manual sizing handles resizing well.

## When constraints aren't enough

For dynamic content (variable text length, stacked items, padded layouts), Auto Layout is the right answer.

Examples constraints can't handle elegantly:
- **Button width adapting to text length.**
- **List of cards adding more items.**
- **Stacked elements with consistent gaps.**
- **Padded content that wraps.**

Constraints work on fixed-size elements; Auto Layout makes the parent itself dynamic.

## Resizing within Figma

To test constraints:
1. Select the frame.
2. Drag the right or bottom edge to resize.
3. Watch children behave per their constraints.

Or use the Width/Height fields in the right panel to set exact dimensions.

If children don't behave as expected, check each child's constraints; adjust.

## Anchor patterns

Common combinations:

| Goal | Horizontal | Vertical |
|------|-----------|----------|
| Top-left fixed | Left | Top |
| Top-right fixed | Right | Top |
| Centered horizontal | Center | (anything) |
| Bottom-pinned | (anything) | Bottom |
| Stretch full width | Left + Right | (anything) |
| Always centered both | Center | Center |
| Stretch + maintain margins | Left + Right | Top + Bottom |

## Scale constraint

"Scale" makes children resize proportionally with parent. Used for:
- **Logos / branding** that should grow with parent.
- **Icons** in dynamic frames.

Drawback: text inside scaled children doesn't look right at extreme sizes. Use for visual elements, not body text.

## Combining constraints with Auto Layout

Many real designs use both:
- **Outer container.** Auto Layout for top-level structure.
- **Inner fixed-position elements.** Constraints for visual decorations.

E.g., an Auto Layout card with an absolutely-positioned "NEW" badge in the top-right. The card flows; the badge stays put.

## Layer order and constraints

Frames also have a layer-order axis (front-back). Constraints don't affect this directly, but order matters for overlap.

Newer layers are in front by default. Right-click → Reorder; or Cmd+] / Cmd+[ to bring forward / send backward.

## Constraints vs Auto Layout — when to choose

| Need | Use |
|------|-----|
| Fixed-size child in resizing frame | Constraints |
| Content that should stack with gaps | Auto Layout |
| Dynamic-width container based on content | Auto Layout |
| Pin one thing to corner | Constraints |
| Whole row of elements with consistent spacing | Auto Layout |

Modern Figma workflows use Auto Layout heavily; constraints fill the gaps. Earlier Figma was constraint-only; capabilities expanded over time.

## Mistakes to avoid

- **Forgetting constraints when designing for multiple sizes.** Resizing breaks layout.
- **Using constraints for what Auto Layout handles better.** Awkward results.
- **Scaling text via Scale constraint.** Text doesn't render well at scaled sizes; awkward typography.
- **Not testing resize.** Designs break in production; engineers improvise.

## Summary

- Constraints define child behavior when parent resizes.
- Per-axis: Left, Right, Center, Left+Right, Scale.
- Use for fixed-position or stretching elements.
- Combine with Auto Layout for dynamic content.
- Test resize during design; engineers depend on consistent behavior.

Next: plugins worth your time.
