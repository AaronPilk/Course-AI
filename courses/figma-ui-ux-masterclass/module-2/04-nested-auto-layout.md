---
module: 2
position: 4
title: "Nested Auto Layout patterns"
objective: "Build complex screens from composable Auto Layout."
estimated_minutes: 5
---

# Nested Auto Layout patterns

## Composition is the key

Real screens are nested Auto Layouts. A screen is a vertical AL of sections; each section is a horizontal AL of columns; each column is a vertical AL of components; each component is an AL of its parts.

Every level lifts the dynamic-resize property up. Change inner content; everything reflows.

## A typical screen structure

```
Screen (vertical AL)
├── Nav bar (horizontal AL)
│   ├── Back (hug)
│   ├── Title (fill)
│   └── Action (hug)
├── Content (vertical AL, fill height)
│   ├── Section header (horizontal AL)
│   │   ├── Title (fill)
│   │   └── More button (hug)
│   ├── List (vertical AL)
│   │   ├── Row (horizontal AL)
│   │   ├── Row
│   │   └── Row
│   └── ...
└── Tab bar (horizontal AL)
```

Each layer is purposefully Auto Layout. Add a row to the list; everything below adjusts. Change tab bar height; content reflows.

## Building bottom-up

Approach to building nested AL:

1. Build the smallest reusable component (a row, a card).
2. Test resizing it.
3. Build the section that contains it.
4. Build the screen that contains sections.

Bottom-up means each layer is solid before composing. Top-down often leads to redoing inner pieces.

## Common nested patterns

### List with header

```
Section (vertical AL, fill × hug)
├── Header (horizontal AL, fill × hug, padding 16)
│   ├── Title (fill, "Recent")
│   └── See all button (hug)
└── List (vertical AL, fill × hug, spacing 0)
    ├── Row 1
    ├── Row 2
    └── Row 3
```

### Card with image, title, body, footer

```
Card (vertical AL, fill × hug, padding 0)
├── Image (fill × fixed 200, clip)
├── Content (vertical AL, fill × hug, padding 16, spacing 8)
│   ├── Title
│   ├── Description
│   └── Metadata (horizontal AL, fill × hug, spacing 8)
│       ├── Author (fill)
│       └── Date (hug)
└── Footer (horizontal AL, fill × hug, padding 16, spacing 8)
    ├── Like button (hug)
    ├── Comment button (hug)
    └── Spacer (fill)
    └── Share button (hug)
```

### Form

```
Form (vertical AL, fill × hug, padding 16, spacing 20)
├── Field 1 (vertical AL, fill × hug, spacing 4)
│   ├── Label
│   └── Input (fill × fixed)
├── Field 2 (same)
├── Field 3 (same)
└── Submit (fill × hug)
```

### Tab bar

```
Tab bar (horizontal AL, fill × fixed 64, padding-h 8)
├── Tab 1 (fill × fill, vertical AL spacing 4)
│   ├── Icon
│   └── Label
├── Tab 2 (same)
├── Tab 3 (same)
├── Tab 4 (same)
└── Tab 5 (same)
```

Each tab fills equally because all are "fill" on a horizontal Auto Layout.

## Reading existing Auto Layouts

When you receive a Figma file, decode the structure:

1. Click the outermost frame.
2. Note: direction, spacing, padding, sizing.
3. Click into a child.
4. Repeat.

Within seconds you understand "this card is a vertical AL with fill width, hug height, spacing 8, padding 16."

The structure tells you how it resizes; useful for engineers reading designs.

## Mixed Auto Layout + freeform

Sometimes inside an Auto Layout frame, you need a freeform / absolutely positioned element:

- A "NEW" badge overlapping a card.
- A floating action button.
- A decoration that overlays content.

Hold Alt while moving the element OUT of Auto Layout flow → marks as "absolute position." It still belongs to the parent but doesn't participate in the layout flow.

Use sparingly; most elements should flow.

## Sizing across nesting

Sizing decisions propagate:

```
Screen: fill width × fill height (fills viewport)
  Content: fill × fill (takes screen interior)
    Section: fill × hug (takes content width; content-driven height)
      Card: fill × hug (takes section width; content-driven height)
        Content rows: fill × hug (etc)
```

Each level's "fill" works because the parent provides defined width.

## Performance considerations

Deeply nested Auto Layouts (10+ levels) can slow Figma noticeably. Flatten where reasonable; combine layers where possible.

Most production designs are 4-7 levels deep; this performs fine.

## Auto Layout vs free-positioning

Some elements work better outside Auto Layout:
- Tooltips / popovers.
- Modal dialogs (in their own context).
- Backgrounds and decorative overlays.

For these: free-position. Mix Auto Layout for structured content + free-position for floating overlays.

## Component nesting

Components (next module) can contain Auto Layout. A card component is internally an Auto Layout; the instance is part of a parent Auto Layout.

The instance behaves per its component definition (probably hug or fill); composes with parent flow.

## Resizing test workflow

For each major frame:
- Resize wider; verify content reflows.
- Resize narrower; verify content reflows.
- Add a child (paste in); verify it flows in.
- Remove a child; verify reflow.

If anything breaks: walk up the Auto Layout chain; find the layer with wrong sizing or padding.

## Common nesting mistakes

- **Not enough levels.** Inner elements not Auto Layout; don't reflow.
- **Too many levels.** Single component with 15 nested frames; hard to edit.
- **Mixed Auto Layout + free positioning carelessly.** Confused behavior.
- **Sizing chain breaks.** Fill works at top but a hug parent in middle breaks downward.
- **Auto Layout for non-content-driven layouts.** Sometimes free-position is right.

## Summary

- Real screens are nested Auto Layouts; each level adds dynamic-resize property.
- Build bottom-up: smallest component → section → screen.
- Standard patterns: list with header, card, form, tab bar.
- Mix freeform when needed (overlays, decorations).
- Sizing chain must work top-to-bottom for fill to propagate.

Module 2 complete. Next module: components, variants, properties.
