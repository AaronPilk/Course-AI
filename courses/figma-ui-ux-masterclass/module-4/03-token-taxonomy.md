---
module: 4
position: 3
title: "Token taxonomy and naming"
objective: "Structure your tokens so the system scales beyond ad hoc."
estimated_minutes: 5
---

# Token taxonomy and naming

## What taxonomy means

Token taxonomy is the structure of names + categories your design system uses. Without it, you get:
- `color1`, `color2`, `color3`.
- `bg-blue`, `blueButton`, `primary-color`.
- Names that conflict, duplicate, drift.

With taxonomy: predictable hierarchy, scalable to thousands of tokens.

## Common taxonomy patterns

**Category / Subcategory / Variant:**
- `color/text/primary`
- `color/text/secondary`
- `color/bg/surface`
- `color/bg/elevated`
- `color/border/default`
- `color/brand/primary`

**Property / Value:**
- `space/0`, `space/1`, `space/2`, ..., `space/16`.
- `radius/none`, `radius/sm`, `radius/md`, `radius/lg`, `radius/full`.
- `font-size/xs`, `font-size/sm`, `font-size/md`, `font-size/lg`.

## Semantic vs. primitive

Two layers:
- **Primitives.** Raw values. `blue-50`, `blue-100`, ..., `blue-900`. `gray-50` ... `gray-900`. `red-500`.
- **Semantics.** References to primitives. `color/brand/primary = blue-500`. `color/text/primary = gray-900`. `color/error = red-500`.

Components reference semantics. Primitives change rarely; semantics change for rebrands.

## Why the two-tier?

Imagine: brand changes from blue to purple. With one tier (`color/brand/primary = #3B82F6`), you update the value; done.

With two tiers (`color/brand/primary = blue-500`), you change the alias to `purple-500`; primitives untouched but blue still available for accents. More flexibility; minor naming overhead.

## Color naming

**Primitives** (one of these):
- **Numbered scales.** `blue-50, 100, 200, ..., 900` (Tailwind / Material).
- **Named.** `blue-light, blue, blue-dark` (simpler but less granular).

**Semantics** (functional):
- `color/text/{primary, secondary, tertiary, disabled, inverse}`
- `color/bg/{base, surface, elevated, raised}`
- `color/border/{subtle, default, strong}`
- `color/brand/{primary, secondary, accent}`
- `color/feedback/{success, warning, error, info}`

## Spacing naming

**T-shirt sizes:**
- `space/xs = 4`, `sm = 8`, `md = 16`, `lg = 24`, `xl = 32`, `2xl = 48`.

**Numbered (Tailwind-style):**
- `space/0 = 0`, `1 = 4`, `2 = 8`, `3 = 12`, `4 = 16`, `5 = 20`, `6 = 24`, `8 = 32`, `10 = 40`, `12 = 48`.

Most teams pick one; numbered is more granular, t-shirt is more semantic.

## Type tokens

**Font sizes:**
- `font-size/xs = 12`, `sm = 14`, `md = 16`, `lg = 18`, `xl = 20`, `2xl = 24`, `3xl = 30`, `4xl = 36`.

**Font weights:**
- `font-weight/regular = 400`, `medium = 500`, `semibold = 600`, `bold = 700`.

**Line heights:**
- `line-height/tight = 1.25`, `normal = 1.5`, `relaxed = 1.75`.

## Radius tokens

- `radius/none = 0`, `xs = 2`, `sm = 4`, `md = 8`, `lg = 12`, `xl = 16`, `full = 9999`.

The `full` for circles / pills. The rest for cards / buttons / inputs.

## Effect tokens

For shadows + blurs:
- `shadow/none`
- `shadow/sm`
- `shadow/md`
- `shadow/lg`
- `shadow/xl`

Each is a complete shadow definition (offset, blur, color); mode-aware.

## Component-level tokens

Beyond foundation: tokens scoped to components.
- `button/bg/primary = color/brand/primary`
- `button/text/primary = color/text/inverse`
- `button/padding/y = space/md`
- `button/radius = radius/md`

Why: lets you change Button styling without affecting other components. Semantic indirection at the component layer.

## Token hierarchy depth

Depth options:
- **One layer.** `bg-primary` (everything flat).
- **Two layers.** `color/bg/primary` (category + subcategory).
- **Three layers.** `color/bg/surface/elevated` (category + group + variant).
- **Four+.** `color/component/button/bg/primary` (deeper component-scoped).

Each layer adds clarity + verbosity. Two-three layers is the sweet spot for most teams.

## Naming conventions

**Slash-separated paths.** Figma's asset panel groups by `/`. `color/brand/primary` and `color/brand/secondary` group under Color → Brand.

**Lowercase.** `color/brand/primary` not `Color/Brand/Primary`.

**Kebab-case for compound words.** `font-size/xs` not `fontSize/xs`.

**Numeric scales for primitives.** `blue-500` (Tailwind convention); easy to interpolate.

## Documenting tokens

Each token should have a description:
- "color/text/primary: high-emphasis text on neutral backgrounds. Contrast ratio 7:1+."
- "space/md: standard spacing. Use for between related elements within a card."

Documentation is in the variable description field; consumers see in pickers.

## Token versioning

When you change token meaning:
- **Non-breaking.** Value tweak. Patch.
- **Breaking.** Rename or removal. Major version; deprecate first.

Treat tokens like APIs: stable contracts; consumers depend.

## Token coverage

Audit: how much of your design uses tokens vs. hardcoded?
- 100% (every value tokenized) — ideal but high overhead.
- 80%+ (foundations tokenized; components mostly tokenized) — practical target.
- 50% (some areas tokenized) — partial; gaps drift.
- 0% (no tokens) — drift everywhere.

Mature teams target 90%+. Tokenize as the system evolves; don't pause everything to tokenize Day 1.

## Token reference graph

Map dependencies:
- `color/brand/primary → blue-500`
- `button/bg/primary → color/brand/primary`
- `Card.bgColor → button/bg/primary` (instance)

When you change `blue-500`, the entire graph reacts. Visualize for big systems.

## Tokens to engineering

Tokens flow design → engineering:
- **Variables in Figma.** Source of truth.
- **Export to JSON / CSS variables.** Plugins or manual export.
- **Import to codebase.** Tailwind config, CSS variables, design-token-format files.

Tools: Tokens Studio plugin, Style Dictionary, Tokens UI plugin.

## Mistakes to avoid

- **No taxonomy.** Random names; no scalability.
- **Too deep.** `color/component/card/header/text/primary/hover` — overwhelming.
- **Too shallow.** All flat; conflicts.
- **No semantic layer.** Components reference primitives directly.
- **No documentation.** Adopters don't know which token to use.

## Summary

- Taxonomy = structure of names + categories.
- Two-tier (primitive + semantic) for flexibility.
- Common categories: color (text/bg/border/brand/feedback), space, font-size, radius, shadow.
- Slash-separated paths group in Figma's asset panel.
- 80-90% token coverage is practical target.
- Document tokens; treat as stable API.

Next: tokens to code — handoff strategies.
