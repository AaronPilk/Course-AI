---
module: 3
position: 1
title: "Components and instances"
objective: "The building blocks of design systems."
estimated_minutes: 5
---

# Components and instances

## What components are

A component is a reusable design unit. Once defined, you create instances throughout your designs. Edit the master component → all instances update automatically.

This is the single feature that turns Figma from drawing tool into design-system tool.

## Creating components

Select a layer / frame → Cmd+Alt+K (or right-click → Create component). The layer becomes the "main component"; the original instance becomes the first usage.

Icon: ◆ in the layer panel indicates a component or instance.

## Main vs instances

**Main component.** The source of truth. Edit changes propagate to all instances.

**Instance.** A usage. Looks like the main but can override specific properties (text, color, swapped children).

Conceptually: main is the class; instances are objects.

## Common components

- **Buttons.** Various sizes / states (primary, secondary, tertiary).
- **Form fields.** Input, dropdown, textarea.
- **List items.** Row layouts.
- **Cards.** Content containers.
- **Avatars.** User images.
- **Tags / chips.** Status indicators.
- **Icons.** SF Symbols or custom.

Build once; use everywhere.

## Editing components

Open the main component (click → Edit master, or navigate to the component page). Make changes. All instances update.

Edits propagate automatically; no "rebuild" step.

For experimental changes: branch the file (covered in Module 5) so changes don't break others' work until merged.

## Overriding instance properties

Instances are NOT immutable copies. You can override:
- **Text.** Change text in one instance without affecting main.
- **Fill / color.** Override the main's fill.
- **Image.** Replace with different image.
- **Visibility.** Hide nested elements.
- **Layout properties.** Per-instance auto layout adjustments (limited).

Overrides survive when the main updates — Figma tries to preserve your local changes.

## Detaching instances

Right-click → Detach instance (Cmd+Alt+B).

The instance becomes a regular frame; no longer connected to the main. Future main updates don't reach it.

Use rarely. Detaching defeats the purpose of components. When tempted to detach: instead, refactor the main to handle your case (add variants, properties).

## Component thinking

The right mindset: "what design pattern is this?" rather than "this specific layer."

When you see something repeated 3+ times across screens, ask: should this be a component?

Common signals:
- Same shape with different text.
- Same color treatment.
- Same layout pattern.

Make it a component; instances replace the duplicates; future changes happen in one place.

## Component organization

A "Components" page typically:
- **Atoms.** Buttons, inputs, icons, tags.
- **Molecules.** Form fields (label + input), list rows.
- **Organisms.** Cards, full sections.

Or by feature:
- **Marketing.** Pricing components.
- **Dashboard.** Stat cards, charts.
- **Settings.** Settings rows.

Pick a structure; document; share with team.

## Atomic design

Brad Frost's atomic design framework:
- **Atoms.** Smallest UI pieces (button, icon).
- **Molecules.** Atoms combined (search bar = input + button).
- **Organisms.** Functional sections (card with avatar + name + actions).
- **Templates.** Page layouts.
- **Pages.** Actual content.

Useful structure for design systems; not mandatory. Many teams use atoms + molecules + organisms; templates and pages live in real designs not in the components.

## Naming components

Conventions:
- **/-separated paths.** `Button/Primary/Large`, `Button/Primary/Medium`, `Button/Secondary/Large`.
- **Capitalization.** TitleCase for major; lowercase for subtypes.

Figma's asset panel groups by `/` paths into folders. So `Button/Primary/Large` and `Button/Primary/Medium` group under Button → Primary.

For 20+ components, the structure matters; navigability degrades quickly without it.

## Asset panel

Press Shift+I (or click Assets tab in left panel). Browse + drag components into your design.

Filter by library; preview by hover; categorize via the / paths.

For teams with shared libraries: the asset panel is where reusable components live.

## When NOT to make a component

- **Used once.** No reuse benefit.
- **Genuinely unique design.** Don't force structure.
- **Pre-design experimentation.** Make a component once the pattern stabilizes.

Premature componentization is friction. Wait until the third occurrence.

## Components and Auto Layout

Modern Figma components are usually Auto Layout. A button component:
- Auto Layout, hug × hug, padding 16/8.
- Children: icon + text.

Instances inherit; can override text + icon; resize naturally.

Some components benefit from being non-Auto-Layout (fixed-size avatars, decorative elements). Mix.

## Component dependencies

Components can use other components. A card component might contain:
- An avatar component.
- A button component.
- A tag component.

Edit avatar → card updates. Nested dependencies; manage them as a system.

## Mistakes to avoid

- **Component for everything.** Over-engineering.
- **Component for nothing.** Same design copy-pasted everywhere.
- **Bad naming.** Can't find what you need.
- **Detaching constantly.** Loses the system benefit.
- **Inconsistent overrides.** Some instances customized, others not.

## Summary

- Components: design units; reusable; instances inherit + override.
- Main component is the source of truth; edit propagates to instances.
- Atomic design (atoms / molecules / organisms) for structure.
- Naming via /-separated paths for grouping in asset panel.
- Componentize when pattern repeats; don't over-engineer single-use designs.

Next: variants and properties.
