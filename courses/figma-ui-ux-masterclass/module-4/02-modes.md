---
module: 4
position: 2
title: "Modes — theming and multi-brand"
objective: "Use modes to switch sets of values for light/dark and beyond."
estimated_minutes: 5
---

# Modes — theming and multi-brand

## What modes are

A mode is a named set of variable values within a collection. The collection has one variable (`color/bg/surface`); each mode defines its own value for that variable.

When a frame selects a mode, descendants resolve all variables in that collection to the selected mode's values.

## Setting up modes

In variables panel: select a collection → Settings (cog icon) → Add mode.

Default modes:
- **Light / Dark** (most common).
- **Brand A / B** (multi-brand).
- **Compact / Comfortable** (density).
- **High contrast** (accessibility variant).

Each mode is a column in the variables table; rows are variables; cells are values.

## Filling in mode values

For each variable, set values per mode:
- `color/bg/surface` — Light: `#FFFFFF`, Dark: `#0A0A0A`.
- `color/bg/elevated` — Light: `#FAFAFA`, Dark: `#1A1A1A`.
- `color/text/primary` — Light: `#0A0A0A`, Dark: `#FAFAFA`.
- `color/text/secondary` — Light: `#666666`, Dark: `#999999`.
- `color/border/default` — Light: `#E5E5E5`, Dark: `#262626`.

Cover the foundation: backgrounds, surfaces, text, borders, brand accents.

## Mode switching at the frame level

Select a frame → right panel → variables → mode dropdown → pick Light or Dark.

All variable references in descendants resolve to the chosen mode. Frame previews instantly in that mode.

## Default mode

The first mode set up is the default. New frames inherit it. Pick the typical case (Light, usually).

## Mode inheritance

Frames inherit mode from their parent. Setting a mode on a parent applies to all descendants.

Override at the descendant level: select a child frame → switch its mode → it overrides the parent for itself + its descendants.

This is how you preview light-mode content inside a dark-mode app shell, or vice versa.

## Mode-aware components

A Card component references variables: `color/bg/surface` for background, `color/text/primary` for text. When the Card instance is in a Dark mode frame, the Card automatically shows dark-mode colors.

Component design doesn't change between modes — values flip.

## Multi-brand modes

For a multi-brand product (e.g., parent company with two brands sharing the same app):
- Add modes: Brand A, Brand B.
- Set brand-specific variables: `color/brand/primary` differs per brand.
- App screens use the brand mode for their context.

Engineering side: same approach via CSS variables flipping on `data-brand` attribute.

## Density modes

For compact vs. comfortable layouts:
- Add modes: Comfortable, Compact.
- Set spacing variables: `space/4` is `16` (Comfortable), `12` (Compact).
- Switch mode → all spacing tightens.

Trade-off: design files preview both densities; product UI offers a density toggle.

## Accessibility modes

For high-contrast accessibility:
- Add mode: High Contrast.
- Set color variables: text/background contrast pushed to WCAG AAA (~7:1).
- Borders more visible; states more distinct.

Mode toggle previews the accessible variant without separate components.

## Mode performance

Each mode adds a column in the variables table. Practical limit: ~10 modes per collection.

For complex theming (3 brands × light/dark × 3 densities = 18 combos), separate collections per axis:
- **Theme collection.** Light / Dark.
- **Brand collection.** Brand A / B / C.
- **Density collection.** Compact / Comfortable.

Multiplied at runtime via mode-stacking on frames.

## Mode-aware effects

Drop shadows, blurs, inner shadows — all should be variable-driven for mode support:
- `effect/shadow/sm` — Light: `0 1px 2px rgba(0,0,0,0.1)`, Dark: `0 1px 2px rgba(0,0,0,0.8)`.

Effects look wrong in dark mode if not mode-aware (light-mode shadows on dark surfaces invisible).

## Naming modes

Use descriptive names:
- Light / Dark (clear).
- Compact / Comfortable (clear).
- Brand-A / Brand-B (clear).

Avoid:
- Mode 1 / Mode 2.
- Variant / Other.

Names propagate to consumers; clarity matters.

## Mode + Auto Layout

Variables for padding (`space/4`) referenced inside Auto Layout frames update per mode if the variable is mode-aware (density modes).

This lets you preview comfortable vs. compact layouts on the same components — no separate variants needed.

## Mode previews

Best practice: design pages with frame-level mode toggles.
- One page shows all screens in Light.
- Duplicate page; set mode to Dark → see Dark.
- Switch modes on demo frames for screenshots / docs.

Helps reviewers see modes at-a-glance.

## Mode and exporting

Exports respect the frame's mode. To export Dark assets: set frame to Dark; export.

Useful for app icon variants per mode; theme-aware screenshots; brand asset packs.

## When NOT to use modes

For one-off theme variations (e.g., a single page that's blue instead of brand color): just override locally; don't add a mode.

Modes are for systemic variations applied to many components. One-off styling doesn't benefit.

## Migration from style-based theming

Old approach: light-mode color styles + dark-mode color styles (different style names per mode).

New approach: variables with modes — one name, two values.

Migrate: convert pairs of light/dark color styles to single mode-aware variable. Less duplication, easier propagation.

## Mistakes to avoid

- **No modes.** Light/dark designed in separate files.
- **Too many modes.** 25 modes in one collection; picker noisy.
- **Bad names.** Mode 1 / 2; meaningless.
- **Forgotten variables.** Some colors hardcoded; mode switch leaves stragglers.
- **No effects in modes.** Shadows look wrong in dark mode.

## Summary

- Modes = named sets of variable values within a collection.
- Frame selects a mode; descendants resolve variables to that mode.
- Common modes: light/dark, brand A/B, density, accessibility.
- Multiple collections multiply (theme × brand × density via mode-stacking).
- Effects need mode awareness too; shadows differ per theme.
- Use modes for systemic variation; not one-off styling.

Next: token taxonomy and naming.
