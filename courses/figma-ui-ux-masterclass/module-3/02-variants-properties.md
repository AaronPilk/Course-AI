---
module: 3
position: 2
title: "Variants and properties"
objective: "Group related components into a single configurable system."
estimated_minutes: 5
---

# Variants and properties

## What variants are

A variant groups related components into one. Instead of `Button/Primary`, `Button/Secondary`, `Button/Tertiary` as three separate components, they become one Button component with a Style property: Primary / Secondary / Tertiary.

Instance users pick from a dropdown rather than swapping components. Cleaner asset panel, faster iteration.

## Creating variants

1. Build the first component (Cmd+Alt+K).
2. Select it; in the right panel, click "Add variant" (or right-click → Combine as variants).
3. Figma creates a variant wrapper containing the original and a duplicate.
4. Modify the duplicate (e.g., change fill to secondary color).
5. Name the property (e.g., Style) and values (Primary, Secondary).

Each variant is a separate component frame visually grouped in a purple dashed boundary.

## Variant properties

A Button might have:
- **Style.** Primary / Secondary / Tertiary.
- **Size.** Small / Medium / Large.
- **State.** Default / Hover / Pressed / Disabled.
- **Icon.** None / Left / Right / Only.

Combinations multiply: 3 × 3 × 4 × 4 = 144 variants in the matrix. You don't have to build all — only the combinations actually used.

## Naming variants

Each variant has a name like `Style=Primary, Size=Large, State=Default`. Figma uses these as property values in the instance picker.

In the variant frame, the layer name is auto-generated; don't edit manually.

## The variant matrix

Variants are arranged in a grid: rows = one property's values, columns = another's. For a Button with Style × Size:

|         | Small | Medium | Large |
|---------|-------|--------|-------|
| Primary | ✓     | ✓      | ✓     |
| Secondary | ✓   | ✓      | ✓     |
| Tertiary | ✓    | ✓      | ✓     |

Building the matrix takes setup but the result is a single component instance users configure.

## Boolean properties

For two-state things (icon on/off, badge on/off): boolean property (True/False).

Instance toggle shows/hides nested elements based on the boolean. More compact than building Icon=None / Icon=Yes variants.

Setup: select the nested layer → in the variant component → right panel → "Apply boolean property" → name it → set initial value.

## Text properties

For text that varies per instance: text property.

Setup: select the text layer → right panel → "Apply text property" → name (e.g., Label) → default value.

Instance users edit the property directly in the right panel; no need to drill into the layer.

## Instance swap properties

For nested instances that vary (icon component inside button): instance swap property.

Setup: select the nested instance → "Apply instance swap" → choose which instances can be swapped in.

Instance users pick from a dropdown of allowed swaps; faster than detaching and replacing.

## Configuring variants from instances

After setup, the instance properties panel shows:
- **Style.** Dropdown: Primary / Secondary / Tertiary.
- **Size.** Dropdown: Small / Medium / Large.
- **Label.** Text input.
- **Icon.** Boolean toggle.
- **Icon-instance.** Instance picker.

Designers configure without entering the component; speed.

## When to use variants vs. separate components

**Variants:** related designs that share structure (button styles, input states, card layouts).

**Separate components:** unrelated designs (avatar vs. button vs. icon). Don't force into one variant.

Rule of thumb: if the designs differ only in style/state/size — variants. If they differ in structure — separate components.

## Variants and Auto Layout

Variants combine well with Auto Layout. Each variant in the matrix can have different padding, spacing, content — Auto Layout handles the layout differences.

A "small" button has smaller padding; "large" has larger. The structure is the same; values differ.

## Default variant

The first variant created becomes the default. When an instance is placed without overrides, this is what shows.

Choose carefully — typical / most common style as default.

## Variant organization

The variant frame can be on a "Components" page or the page where the component is used. Most teams: Components page with all reusable variants there.

Within the page, group related components: Buttons / Inputs / Cards / Modals.

## Documenting variants

Add notes to the variant frame:
- Use cases for each variant.
- Don't combinations (e.g., "Don't use disabled+pressed").
- Behavior expectations.

Documentation in the component frame helps adopters use correctly.

## Variant limits

Figma allows hundreds of variants per component. Performance degrades past ~50 — picking from a dropdown gets slow.

If a component has 100+ combinations, consider splitting: separate components per major dimension.

## Properties vs. variants

Variants = structural variations.
Properties = configuration knobs (text, boolean, instance swap).

Both coexist on the same component. A Button can have:
- Variants: Style (Primary/Secondary), Size (S/M/L).
- Properties: Label (text), HasIcon (boolean), Icon (instance swap).

This gives instance users both axes of customization.

## Common patterns

**Buttons.** Variants: Style, Size, State. Properties: Label, HasIcon, Icon.

**Inputs.** Variants: State (Default, Focus, Error). Properties: Label, Placeholder, Helper.

**Avatar.** Variants: Size (S/M/L/XL). Properties: Image, Initials (text fallback), HasBadge.

**Tag.** Variants: Style (Default, Success, Warning, Error). Properties: Label.

These patterns repeat across products; the variant + property setup is similar.

## Mistakes to avoid

- **Variant explosion.** 200+ variants when 20 would suffice.
- **Variants for unrelated things.** Card and Button as variants of "Surface"? No.
- **Inconsistent property names.** Some components use Style; others use Type. Pick one.
- **Missing defaults.** New instances ship with surprising values.
- **No documentation.** Adopters can't tell which to use when.

## Summary

- Variants: group related components into one configurable system.
- Properties: text / boolean / instance-swap for non-structural variation.
- Build matrix only with combinations actually used.
- Default variant matters; pick the typical case.
- Combine variants + properties for both structural and configurable axes.

Next: deep dive on component properties.
