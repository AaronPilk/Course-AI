---
module: 2
position: 1
title: "What Auto Layout actually does"
objective: "The most important Figma feature, demystified."
estimated_minutes: 5
---

# What Auto Layout actually does

## Auto Layout in one sentence

Auto Layout makes a frame's size and child positions automatically adjust based on content — like CSS Flexbox in your design tool. Add a button; the frame grows. Remove a list item; spacing reflows. Type more text; the bubble expands.

This is the single feature that distinguishes "Figma is a drawing tool" from "Figma is a real design system."

## Why it matters

Without Auto Layout:
- Resize a button by typing → text overflows.
- Add an item to a list → manually reposition everything below.
- Update padding → resize every element by hand.
- Multiple device sizes → completely separate copies.

With Auto Layout:
- Resize a button → frame adapts; padding stays.
- Add list item → other items push down with consistent spacing.
- Update padding → applies system-wide via the layout.
- Multiple sizes → same component flexes.

Maintenance time drops dramatically. Production designs become possible.

## Applying Auto Layout

Two ways:

**On selection:**
Select layers → Shift+A → wraps in Auto Layout frame.

**On a new frame:**
Create frame → in right panel → click "Auto Layout" → set direction.

The Auto Layout panel appears in the right sidebar (Design tab).

## The Auto Layout settings

For a frame with Auto Layout:

1. **Direction.** Horizontal or Vertical (or Wrap, recent addition).
2. **Spacing between items.** Pixel gap.
3. **Padding.** Top, right, bottom, left (or all at once).
4. **Alignment.** Where children align (top, middle, bottom × left, center, right) — 9 positions.
5. **Sizing.** How frame sizes (hug / fill / fixed) per axis.

Each setting has a click target in the panel.

## Direction

- **Horizontal.** Children flow left-to-right (or right-to-left in RTL).
- **Vertical.** Children flow top-to-bottom.
- **Wrap.** Children wrap to next row when they overflow (like CSS flex-wrap).

Pick by intent: a row of buttons → horizontal; a stack of list items → vertical; a grid of cards → wrap.

## Spacing

Distance between children, in pixels:

```
Spacing: 16
[Item 1][16px gap][Item 2][16px gap][Item 3]
```

Common values: 0, 4, 8, 12, 16, 20, 24, 32, 48. Stick to 8-point grid for visual rhythm.

Auto Layout also offers "auto" spacing — distributes items to fill available space (like flex justify-content: space-between).

## Padding

Inner space around children:

```
Padding: 16, 24, 16, 24 (top, right, bottom, left)

[24px][child][24px]
```

You can set:
- All edges equal.
- Vertical + horizontal (top=bottom, left=right).
- Each edge individually.

For most components: equal padding, or vertical / horizontal split. Per-edge varies for asymmetric needs.

## Sizing — hug, fill, fixed

The key concept for sizing each layer in Auto Layout:

- **Hug contents.** Layer size = content size (a button hugs its text + padding).
- **Fill container.** Layer size = parent's available space (a column fills its row).
- **Fixed.** Layer size = specific value (a fixed 80px sidebar).

Set per axis (width separate from height):
- Button text: hug horizontally, hug vertically.
- Content area: fill horizontally, hug vertically.
- Sidebar: fixed width, fill height.

## Alignment

Where children sit within the frame's interior:

Top-left, top-center, top-right.  
Middle-left, middle-center, middle-right.  
Bottom-left, bottom-center, bottom-right.

For horizontal Auto Layout: vertical alignment matters (top, center, bottom).
For vertical: horizontal alignment matters.

Visualized as a 3×3 grid; click the cell where children should align.

## Resizing Auto Layout frames

Drag edges:
- Width and height adjust per sizing settings.
- Items reflow automatically.

Test responsiveness within Figma; sizing matches what production code would do.

## Common Auto Layout patterns

**Button:**
- Horizontal Auto Layout, padding 16×8, hug.
- Children: icon + text.

**List row:**
- Horizontal, spacing 12, padding 16, fill width × hug height.
- Children: avatar + content (fill) + chevron.

**Card:**
- Vertical, spacing 12, padding 16, fill width × hug height.
- Children: image + title + body.

**Form:**
- Vertical, spacing 16, fill × hug.
- Children: label + input.

These compose: a screen is a vertical Auto Layout of card Auto Layouts.

## Nested Auto Layout

The real power: Auto Layout inside Auto Layout.

```
Screen (vertical Auto Layout)
├── Nav bar (horizontal Auto Layout)
│   ├── Back button
│   ├── Title (fill)
│   └── Action button
├── Content (vertical Auto Layout, fill)
│   ├── Card (vertical Auto Layout)
│   ├── Card (vertical Auto Layout)
│   └── Card (vertical Auto Layout)
└── Tab bar (horizontal Auto Layout)
```

Change any inner element; the whole layout flows. Add a card; it inherits parent spacing. Remove a card; others reflow.

This is how production-ready Figma designs are structured.

## When NOT to use Auto Layout

- **Free-form artwork.** Posters, illustrations, complex compositions.
- **Pixel-precise mockups for marketing.** Where you want explicit positioning.
- **Absolute-positioned overlays.** Tooltips, badges floating over Auto Layout content (mix freeform + Auto Layout in same parent).

For UI: Auto Layout. For art / hero illustrations: freeform.

## Common mistakes

- **Designing without Auto Layout.** Maintenance nightmare.
- **Auto Layout for art.** Wrong tool.
- **Fixed sizing everywhere.** Loses the flexibility.
- **Skipping nested Auto Layout.** Top-level only; inner content doesn't flow.
- **Padding too loose / tight inconsistently.** Visual rhythm broken.

## Summary

- Auto Layout = Figma's Flexbox; size + position children automatically.
- Direction + spacing + padding + alignment + sizing.
- Hug / fill / fixed per axis controls how layers resize.
- Nest Auto Layouts for complex screens.
- Use for UI; freeform for art.

Next: padding, spacing, alignment in detail.
