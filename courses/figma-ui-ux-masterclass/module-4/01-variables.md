---
module: 4
position: 1
title: "Variables — what and why"
objective: "Tokenize design values so changes flow through your system."
estimated_minutes: 5
---

# Variables — what and why

## What variables are

A variable holds a value (color, number, string, boolean) that you reference by name. Instead of hardcoding `#3B82F6` for a button background, you reference `color/brand/primary` — change the variable's value, and every place that uses it updates.

This is the design-token concept made native to Figma.

## Why variables matter

Hardcoded values:
- 200 buttons with `#3B82F6` background.
- Brand color changes → manually update 200 buttons.
- New buttons forget the value → drift.

Variable-driven:
- 200 buttons with `color/brand/primary` background.
- Change variable to `#1E40AF` → all 200 update.
- New buttons reference the variable → no drift.

This is the difference between a design + a design system.

## Variable types

Figma supports four types:
1. **Color** — hex / RGB / HSL values for fills, strokes, effects.
2. **Number** — for sizes (padding, gap, corner radius), opacity, etc.
3. **String** — for text content (rarely used; usually tokens).
4. **Boolean** — for true/false flags (less common in design tokens).

Most teams start with color + number; string + boolean less common.

## Creating variables

Right panel → 4-dot icon (Local variables) → opens variables panel.

Click "Create variable collection" → name (e.g., Tokens) → add variables: name + value.

Example: create color/brand/primary = #3B82F6.

## Variable scopes

Variables live in collections. Each collection can have multiple modes (light/dark, brand A/B). The variable's value differs per mode; references stay the same.

Set up:
- **Tokens** collection with light + dark modes.
- `color/bg/surface` = `#FFFFFF` (light), `#0A0A0A` (dark).
- Components reference `color/bg/surface`; mode switches change everything.

## Referencing variables

In any color picker (fill, stroke, effect): click the variable icon next to the value → pick a variable.

In a number field (padding, gap, corner radius): right-click → "Apply variable" → pick.

Once referenced, the field shows the variable name; clicking it shows the resolved value.

## Naming variables

Conventions:
- **Slash-separated paths.** `color/brand/primary`, `color/bg/surface`, `color/text/primary`.
- **Semantic over literal.** `color/bg/surface` not `color/white`.
- **Hierarchical groups.** `color`, `spacing`, `radius`, `font-size`.

Slashes group in the picker (folder structure).

## Semantic vs. raw variables

A two-tier system:
- **Raw / primitive.** Direct values. `blue-500 = #3B82F6`, `gray-50 = #FAFAFA`.
- **Semantic / alias.** References to primitives. `color/brand/primary = blue-500`, `color/bg/surface = gray-50`.

Components reference semantic; semantic references primitive. To rebrand: change semantic mappings; primitives untouched.

## Variable hierarchies

Variables can reference other variables. Aliases:
- `color/text/primary = color/gray/900`
- `color/text/secondary = color/gray/600`

Chain: components → semantic → primitive. Three layers of indirection; trades flexibility for naming overhead.

## Number variables

For spacing and sizing:
- `space/0 = 0`, `space/1 = 4`, `space/2 = 8`, `space/3 = 12`, `space/4 = 16`, `space/6 = 24`, `space/8 = 32`.

Components use `space/4` for padding-large; change the system's base unit and all spacing updates.

## Variable modes

A collection has modes. Each mode has its own value per variable.

Default modes:
- **Light / Dark.** For theming.
- **Brand A / Brand B.** For multi-brand products.
- **Compact / Comfortable.** For density.

Mode switching at the frame level applies that mode's values to descendants.

## Switching modes

Select a frame → right panel → variables → select mode (Light / Dark). All variable references in descendants resolve to the selected mode's values.

Use to preview light vs. dark instantly; design dark-mode versions without separate components.

## Variable collections

Multiple collections in a file:
- **Tokens.** Foundation variables.
- **Components.** Component-specific values.
- **Brand.** Per-brand overrides.

Collections can be published as part of a library; consumers reference variables across files.

## Local vs. library variables

- **Local variables.** Defined in the current file; only usable here.
- **Library variables.** Published from a library file; usable in any file enabling that library.

For team design systems, variables live in the library. Always.

## Variables and components

Variables + components are the design-system pairing:
- Components define the shapes (Button, Input, Card).
- Variables define the values (colors, spacing, type).

Together: a Button component with `color/brand/primary` fill and `space/4` padding. Change the variable → all buttons update.

## Variable limits

Practical limits:
- ~200 color variables before picker slows.
- ~50 spacing variables (most teams use 8-12).
- ~20 type-size variables (often replaced by named text styles).

Past these, audit: are some variables unused? Can semantic aliases consolidate?

## Migration from styles to variables

Old Figma: "Styles" for color + type + effect. New Figma: variables can replace color styles (more flexibility, mode support).

Migration path:
- Keep type + effect styles (less benefit moving to variables).
- Migrate color styles to variables.
- New work: variables only.

## When NOT to use variables

For one-off colors / spacing not in the system: just type the value. Don't force a variable for unique cases.

For experimental designs: hardcode while exploring; tokenize when settled.

The tokenization threshold: 3+ uses of the same value across components.

## Mistakes to avoid

- **No variables.** Hardcoded colors everywhere; future changes painful.
- **Variables for everything.** Tokenizing single-use values; structure without benefit.
- **Bad names.** `color1`, `color2`; meaning lost.
- **No semantic layer.** All variables are primitives (`blue-500` directly); brand changes touch every component.
- **No modes.** Light/dark designed as separate files; double maintenance.

## Summary

- Variables hold tokenized values (color, number, string, boolean).
- Reference by name; change value → every reference updates.
- Modes switch sets of variable values (light/dark, brand A/B).
- Two-tier system: primitive (raw values) + semantic (aliases for meaning).
- Variables + components = design-system foundation.
- Slash-separated semantic naming groups in picker.

Next: modes for theming.
