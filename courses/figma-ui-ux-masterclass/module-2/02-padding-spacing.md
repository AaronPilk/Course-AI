---
module: 2
position: 2
title: "Padding, spacing, alignment"
objective: "Get the inner geometry right."
estimated_minutes: 4
---

# Padding, spacing, alignment

## Padding vs spacing

Padding = space INSIDE the frame, between the frame's edge and its children.

Spacing = space BETWEEN children inside the frame.

```
┌──────────────────────────┐
│ padding-top              │
│   ┌─────┐ spacing ┌─────┐│  padding-right
│   │ A   │ ←─────→ │ B   ││
│   └─────┘         └─────┘│
│ padding-bottom           │
└──────────────────────────┘
  padding-left
```

Both controlled in Auto Layout settings. Different meanings; different defaults.

## Setting padding

In Auto Layout settings:
- **Vertical / horizontal mode.** Top = Bottom (one value), Left = Right (one value). Default.
- **All four sides equal.** One value.
- **Per side.** Click to open the per-side panel.

Common patterns:

```
Button: 16px horizontal, 8px vertical → wide and short
Card: 16px all sides → uniform
Form field: 12px horizontal, 12px vertical → cozy
```

Pick from 8-point grid: 4, 8, 12, 16, 20, 24, 32, 48.

## Setting spacing

Between-children gap:

```
Spacing: 8  → items 8px apart
```

Auto Layout's spacing is uniform — all gaps equal. For non-uniform spacing, use Spacers (next section).

Common patterns:
- **List items.** 0 (no gap; separators between items).
- **Form fields.** 16-20 (breathing room).
- **Buttons in a row.** 8-12.
- **Cards in a grid.** 16-24.

## Spacer trick

For non-uniform gaps within Auto Layout:

Add a spacer (empty Auto Layout frame, fill width, 0 padding) between children. The spacer expands to fill; children push to edges.

Used for layouts like "left items, gap, right items":

```
[Logo][Spacer (fills)][User menu]
```

Logo sticks left; user menu sticks right; spacer absorbs the middle. Common in nav bars.

Alternative: Auto Layout's "Space between" distribution mode achieves the same without spacers.

## Alignment within Auto Layout

The 3×3 alignment grid in Auto Layout settings determines how children sit within the frame's interior:

For HORIZONTAL Auto Layout, the relevant axis is VERTICAL — top, center, bottom.

For VERTICAL Auto Layout, the relevant axis is HORIZONTAL — left, center, right.

Click the alignment cell:

```
Top:   ┌────────┐
Left:  │ A      │
       │ B      │
       └────────┘

Center: ┌────────┐
        │    A   │
        │    B   │
        └────────┘
```

For most UI: horizontal AL with vertical center; vertical AL with left or center.

## Wrapping (newer feature)

Auto Layout supports wrap mode (similar to CSS flex-wrap):

```
Direction: Horizontal
Wrap: Yes
[A][B][C][D]
[E][F][G]
```

When the parent width is exceeded, children wrap to a new row. Useful for tag clouds, responsive grids, button groups.

Configure spacing in BOTH directions:
- Horizontal spacing (between siblings in a row).
- Vertical spacing (between rows).

## Resize behavior

When a frame's Auto Layout settings change:
- **Padding change.** Frame resizes; children stay.
- **Spacing change.** Frame resizes; children adjust gaps.
- **Alignment change.** Children reposition.
- **Direction change.** Children re-flow (horizontal ↔ vertical).

Test by toggling settings; watch the layout adapt. Real-time visualization.

## Auto Layout for non-content layouts

Auto Layout isn't only for content lists. Useful for:
- **Settings rows** with label + control.
- **Toolbar with buttons.**
- **Tag clouds.**
- **Stat displays** (number + label).
- **Modal layouts** (header + body + footer).

Almost anywhere with structured spacing benefits.

## Padding for specific UI patterns

Standard padding by component type:

| Component | Horizontal | Vertical |
|-----------|-----------|----------|
| Page (mobile) | 16-24 | varies |
| Page (desktop) | 24-48 | varies |
| Section | 16 | 24 |
| Card | 16 | 16 |
| Button | 16 | 8-12 |
| Form field | 12 | 12 |
| Modal | 24 | 24 |
| Toolbar | 12 | 8 |

These are starting points. Adjust per design system.

## Tokenizing padding

In design systems, padding values become tokens:
- `padding-xs` = 4.
- `padding-sm` = 8.
- `padding-md` = 16.
- `padding-lg` = 24.
- `padding-xl` = 32.

Variables / tokens cover this (next module). Once defined, designers + engineers reference the token instead of raw pixel values; system-wide changes possible.

## Mistakes to avoid

- **Random padding values.** Visual rhythm broken.
- **All sides padding when vertical / horizontal split fits.** Awkward.
- **Spacing where padding would work.** Confused layout.
- **No alignment thought.** Default top-left; sometimes wrong.
- **Spacers everywhere.** Use "Space between" distribution instead.

## Summary

- Padding = inside; spacing = between children.
- Stick to 8-point grid for both.
- Alignment grid (3×3) for child positioning inside frame.
- Wrap mode for responsive multi-row layouts.
- Tokenize values for design system consistency.

Next: hugging vs filling vs fixed.
