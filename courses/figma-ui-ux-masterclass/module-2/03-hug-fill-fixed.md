---
module: 2
position: 3
title: "Hugging vs filling vs fixed"
objective: "Master the three sizing options."
estimated_minutes: 4
---

# Hugging vs filling vs fixed

## The sizing trio

Inside Auto Layout, each layer has a sizing setting per axis (width separate from height):

- **Hug contents.** Size = content size. Frame is "just big enough" to wrap its children.
- **Fill container.** Size = parent's available space. Layer expands to fill the parent.
- **Fixed.** Size = specific value. Doesn't change.

Pick one per axis. The choice cascades through Auto Layout behavior.

## Visual examples

**Button:**
- Width: hug (button hugs text width + padding).
- Height: hug (button hugs text height + padding).

When text changes, button resizes. When parent resizes, button doesn't change (its size depends on content, not parent).

**Content area:**
- Width: fill (takes all available width).
- Height: hug (fits children).

When parent gets wider, content area gets wider. When children stack taller, content area grows.

**Sidebar:**
- Width: fixed (e.g., 240px).
- Height: fill (stretches full parent height).

Fixed width regardless of content; height tracks parent.

## When to use each

**Hug.** Anywhere content drives size:
- Buttons (text length determines width).
- Icons.
- Tags / chips.
- Small badges.

**Fill.** Anywhere "take what's available":
- Main content area.
- Form fields in a row.
- Flexible columns.
- Cells in a row that should expand.

**Fixed.** Anywhere size shouldn't depend on anything:
- Sidebars.
- Icons (specific 24×24 size).
- Fixed-width inputs (date, time, code fields).
- Avatars.

Default: hug for new layers. Adjust per intent.

## Per-axis independence

Width and height are independent:

```
Layer:
  Width: fill
  Height: hug
```

Common — a card fills the column width but hugs its content vertically.

Or:

```
Layer:
  Width: fixed (200)
  Height: fill
```

Common — fixed-width sidebar at full parent height.

Mix freely.

## When fill doesn't fill

Sometimes "fill" doesn't visibly expand. Causes:

- **Parent isn't Auto Layout.** Fill only works inside Auto Layout.
- **Parent is hug.** Parent depends on children; "fill" inside a hug-parent has no available space to fill.
- **Sibling is also fill, no constraint.** They split available space.

Check parent's sizing first; "fill inside a hug" is a frequent confusion.

## Fill behavior with siblings

If multiple siblings have "fill":
- They split available space proportionally based on their "Fill weight" or content size.

For specific ratios (1:2:1 column widths), Auto Layout doesn't directly support — you'd use fixed widths or manual proportions.

For "all equal width" siblings: each set to fill; they distribute evenly.

## Min and max sizes

Auto Layout supports min / max:

- **Min width / height.** Don't shrink below this size.
- **Max width / height.** Don't grow above this.

Useful:
- Button: hug width but min-width 88px (so short labels still look like buttons).
- Text: max-width 600px (prevents lines too wide on big screens).

Configure in the layer's properties when "Auto" sizing.

## Distribute evenly

In Auto Layout, if all children are "fill," they distribute evenly across the parent. Equal-width columns; equal-height rows.

For a 3-column grid: parent horizontal AL with three children all set to fill; they become equal width.

## Sizing for responsive design

For multi-device designs:

**Mobile (compact width):**
- Single-column.
- Content fills width.
- Sidebars become drawers.

**Desktop (regular width):**
- Multi-column.
- Sidebars become fixed-width.
- Content fills remaining.

In Figma: design at one size with proper Auto Layout sizing; resize the parent frame to test. The layout adapts.

For component variants by size: separate components, OR responsive properties (advanced).

## Common patterns

**Stacked cards filling column:**
- Parent vertical AL, fill width × hug height.
- Cards: fill width × hug height.

**Side-by-side fixed:**
- Parent horizontal AL.
- Children: fixed width × hug height.

**Hero + sidebar:**
- Parent horizontal AL.
- Hero: fill × hug.
- Sidebar: fixed × hug.

**Form:**
- Parent vertical AL, fill × hug.
- Fields: fill × hug.

These compose; complex layouts emerge from simple sizing decisions.

## When fixed is necessary

Sometimes sizing must be fixed:
- Specific design constraints (logo width must be 120px).
- Icons that should never resize (24×24 always).
- Aspect ratios (square avatars, 16:9 thumbnails).

For aspect ratios specifically: Figma's "aspect ratio" property locks a layer's ratio while still allowing fill/hug for one dimension.

## Mistakes to avoid

- **Default hug everywhere.** Doesn't adapt to parent.
- **Fill everywhere.** Loses intentional sizing.
- **Fixed for all dimensions.** Defeats Auto Layout.
- **Fill inside a hug parent.** Doesn't work; check parent first.

## Summary

- Three sizing modes: hug (content-driven), fill (parent-driven), fixed (explicit).
- Per axis independently; common combos: fill × hug for content areas.
- Min / max sizes constrain.
- Multiple fill siblings distribute evenly.
- Fill inside hug doesn't work — check parent.

Next: nested Auto Layout patterns.
