---
module: 3
position: 3
title: "Component properties deep dive"
objective: "Master text, boolean, and instance swap properties for flexible components."
estimated_minutes: 5
---

# Component properties deep dive

## Four property types

Figma offers four property kinds on components:
1. **Variant** — the structural-version property (covered last lesson).
2. **Text** — editable text fields on instances.
3. **Boolean** — show/hide nested elements via toggle.
4. **Instance swap** — swap nested instances from a curated list.

Each serves a different need; combine for full flexibility.

## Text properties

A button's label is text. Without a text property, designers double-click the layer to edit. With one: edit in the right panel; faster, no risk of breaking layer structure.

Setup: select text layer → right panel → "Apply property" → name (Label) → default value (Button).

Now every instance shows a "Label" field in the right panel.

## Bound text vs. free text

Bound text (via property) survives main component edits. Free-text overrides (changing instance text without property) also survive but tie to the layer's name + position.

Properties are more robust. If you rename the layer or rearrange, free-text overrides can detach; bound text doesn't.

## Multiple text properties

Cards often need Title + Subtitle + Body. Apply three text properties, each bound to a different text layer.

Right panel shows all three fields with default values; instance users fill in.

## Boolean properties

For optional elements: hide icon, hide badge, hide trailing text.

Setup: select layer to be toggled → right panel → "Apply property" → boolean → name (HasIcon) → default (true or false).

Instance toggle in right panel; layer auto-hides via component logic.

## Nesting booleans

A complex card might have: HasAvatar, HasTimestamp, HasActions. Each layer auto-hides per toggle.

Use Auto Layout so hiding doesn't leave gaps — Auto Layout collapses hidden children's space.

## Instance swap properties

For nested instances that vary: icon component inside button. Allow swap from a curated set.

Setup: select nested instance → "Apply property" → instance swap → name (Icon) → preferred values (Icon/User, Icon/Settings, Icon/Search, etc.).

Instance picker shows only the curated set; cleaner than browsing all icons.

## Curated swap lists

Without curation, instance swap shows every component in the file — slow + noisy. Always set "Preferred values" to the actual swap candidates (e.g., your icon library).

This helps designers; they pick from 30 icons instead of 300 components.

## Combining property types

A real-world card:
- **Text properties.** Title, Subtitle, Body.
- **Boolean properties.** HasAvatar, HasTimestamp, HasActions.
- **Instance swap.** Avatar (swap to specific avatar), Actions (swap to specific action set).
- **Variants.** Layout (Vertical, Horizontal), Density (Comfortable, Compact).

The instance right panel shows all these as a tidy form; user configures without entering the component.

## Property ordering

In the right panel, properties appear in the order set up. Re-order via drag in the component's property list.

Convention: variants first (structural), then text, then boolean, then instance swap. Or: most-frequently-changed first.

## Property descriptions

Each property has an optional description shown as tooltip. Use to explain non-obvious values:
- "HasIcon: shows leading icon. Use sparingly."
- "Style: Primary for main action; Secondary for less important; Destructive for delete."

Documentation surfaces in the right panel for instance users.

## Resetting properties

Click reset arrow next to a property to return to default. Useful if an instance was customized but should match the standard.

Right-click → Reset all changes resets everything (text, boolean, swap, layout overrides).

## Property inheritance through nesting

Nested instances inherit their parent's properties. A Card containing a Button — the Card's properties don't override the Button's properties unless explicitly piped (via nested property exposure).

For deeper customization: expose nested instance properties at the parent level (advanced).

## Property exposure (nested)

For a Card containing a Button, you can expose the Button's Label property on the Card so card-instance users edit button-label directly from Card's right panel.

Setup: in Card component → select nested Button → "Expose property" → choose which.

Powerful for design systems where users shouldn't dig into nested components.

## Property limits

Components can have many properties but the right panel gets crowded. ~10 properties is workable; past 20 it's noise.

If a component needs 25 properties, it's doing too much — split into smaller components.

## Component reset behavior

When the main component changes (e.g., adds a new layer), instances inherit the new layer but keep their property overrides.

If a property is removed from the main, instances lose access — overrides reset to default.

## Boolean and Auto Layout interaction

Hiding a child in Auto Layout collapses its space — siblings re-flow. This is usually desired (hide avatar → text shifts left).

Sometimes you want the space preserved: use visibility property on a non-Auto-Layout wrapper, or set the child to "absolute position."

## Mistakes to avoid

- **No properties.** Designers double-click to edit; slow + error-prone.
- **Too many properties.** Right panel becomes a wall of toggles.
- **Bad names.** "Property 1" / "Boolean 2"; unhelpful.
- **No defaults.** New instances ship with empty/false; surprising.
- **Free-text instead of bound.** Overrides risk detachment.

## Summary

- Four property types: variant, text, boolean, instance swap.
- Text for editable copy; boolean for visibility toggles; instance swap for nested-instance choice.
- Curate instance swap preferred values; don't show every component in file.
- Combine property types for full flexibility (text + boolean + variant + swap).
- ~10 properties is workable; past 20 split components.

Next: libraries and team component consumption.
