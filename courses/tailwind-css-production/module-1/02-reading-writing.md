---
module: 1
position: 2
title: "Reading and writing Tailwind"
objective: "Class ordering, modifiers, the layer model."
estimated_minutes: 7
---

# Reading and writing Tailwind

## The class anatomy

A Tailwind class generally follows: `{prefix}:{property}-{value}`

Examples:
- `p-4` — property `p` (padding), value `4` (scale step → 1rem).
- `bg-blue-500` — background color, blue at shade 500.
- `hover:bg-blue-700` — same with hover prefix.
- `md:p-8` — padding 8 at md breakpoint and above.
- `dark:bg-slate-900` — background in dark mode.

You can stack prefixes:

- `md:hover:bg-blue-700` — hover state, at md breakpoint.
- `dark:md:hover:bg-blue-900` — dark mode, md+, hover.

The order of prefixes doesn't matter for Tailwind, but conventions emerge:
**state-or-mode : breakpoint : utility** is a readable order, though Tailwind doesn't enforce.

## The scale

Numbers in Tailwind utilities reference a configurable scale, NOT pixel values:

- `p-1` = 0.25rem = 4px.
- `p-2` = 0.5rem = 8px.
- `p-4` = 1rem = 16px.
- `p-8` = 2rem = 32px.
- `p-16` = 4rem = 64px.

The base unit is `0.25rem` = `4px`. Multiply the number by 4 for the px equivalent. Memorize the common ones (`1, 2, 3, 4, 6, 8, 12, 16, 24, 32`).

Some properties don't use the spacing scale:

- Colors: `text-blue-500`, `bg-red-700` — palette with shades 50, 100, 200... 900, 950.
- Font sizes: `text-sm`, `text-base`, `text-lg`, `text-xl`, ..., `text-9xl`.
- Border radius: `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`.
- Shadows: `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`.

The pattern is the same: a configurable scale exposed via consistent naming.

## State variants

Pseudo-classes as prefixes:

```html
<button class="bg-blue-500 hover:bg-blue-700 active:bg-blue-900 focus:ring-2 disabled:opacity-50">
  Click
</button>
```

- `hover:` — mouse over.
- `focus:` — focused.
- `active:` — being clicked/pressed.
- `disabled:` — disabled attribute.
- `focus-visible:` — keyboard focus only (good for accessible focus rings).
- `focus-within:` — focus on any descendant.

For form elements:
- `checked:`, `placeholder-shown:`, `required:`, `invalid:`, `valid:`.

For position in collection:
- `first:`, `last:`, `odd:`, `even:`.

For dark mode:
- `dark:`.

The list is long. Use the Tailwind docs to find any you need; the naming maps to CSS pseudo-classes.

## Responsive breakpoints

Tailwind is mobile-first. Bare classes apply at all sizes; prefixed classes apply from that breakpoint up.

```html
<div class="p-2 md:p-4 lg:p-8">
  <!-- p-2 below 768px; p-4 from 768px; p-8 from 1024px -->
</div>
```

Default breakpoints:

- `sm:` ≥ 640px
- `md:` ≥ 768px
- `lg:` ≥ 1024px
- `xl:` ≥ 1280px
- `2xl:` ≥ 1536px

NO `max-`-only breakpoints by default (Tailwind 3+ added them as `max-md:` etc. if needed; mobile-first stays the recommended approach).

Customize breakpoints in your config when defaults don't fit your design.

## Group and peer

For styling based on parent or sibling state:

**group** — child responds to parent state:

```html
<a href="..." class="group">
  <h3 class="group-hover:text-blue-500">Title</h3>
  <p class="group-hover:text-gray-600">Description</p>
</a>
```

Hovering the link changes both title and description colors.

**peer** — sibling responds to sibling state:

```html
<input type="checkbox" class="peer" />
<div class="peer-checked:bg-green-100">
  Shows green when checkbox is checked
</div>
```

The peer relationship works for siblings; group for ancestors. Both unlock interactions without JS.

## Arbitrary values

When the scale doesn't have what you need:

```html
<div class="p-[13px] bg-[#FF5733] grid-cols-[1fr_2fr_1fr]">
```

Bracket notation accepts any valid CSS value. Use sparingly — frequent arbitrary values mean either your scale is wrong (fix the config) or your design isn't following the system (worth questioning).

For computed values:

```html
<div style={{ '--col-count': cols }} class="grid-cols-[repeat(var(--col-count),_1fr)]">
```

CSS variables in arbitrary values let you bridge dynamic values into Tailwind.

## Class order

Tailwind doesn't care about order. But for readability, conventions help:

- **Layout** (flex, grid, position).
- **Spacing** (m-, p-).
- **Sizing** (w-, h-).
- **Typography** (text-, font-).
- **Colors** (bg-, text-color).
- **Borders** (border-, rounded-).
- **Effects** (shadow-, opacity-).
- **States and modifiers** (hover:, focus:, dark:).

The `prettier-plugin-tailwindcss` formatter auto-sorts classes to a canonical order. Install it; let it handle ordering. Saves bike-shedding and keeps diffs clean.

## The layer model

Tailwind organizes its generated CSS into three layers:

```css
@tailwind base;        /* Reset + element defaults */
@tailwind components;  /* Reusable component classes (sparingly) */
@tailwind utilities;   /* The utility classes */
```

Order matters for the cascade: utilities win because they come last and are most specific.

For your own custom CSS:

```css
@layer base {
  h1 { @apply text-4xl font-bold; }
  body { @apply bg-white text-gray-900; }
}

@layer components {
  .prose a { @apply text-blue-600 underline; }
}

@layer utilities {
  .scrollbar-thin { ... }
}
```

Custom utilities defined inside `@layer utilities` are tree-shaken alongside Tailwind's. Custom CSS outside layers won't be optimized — usually fine, but be intentional.

## Dynamic classes — the gotcha

Tailwind's JIT scans your source for full class strings. It can't see partially-constructed classes:

```tsx
// ❌ Doesn't work — Tailwind never sees 'bg-red-500'
const color = 'red';
return <div className={`bg-${color}-500`}>...</div>;

// ✅ Works — full classnames visible to the scanner
const colorClass = color === 'red' ? 'bg-red-500' : 'bg-blue-500';
return <div className={colorClass}>...</div>;
```

For dynamic classes, you must list the full class somewhere in your source code (or in the `safelist` config). Tailwind doesn't dynamically generate utilities at runtime.

This is one of the most common Tailwind bugs: "Why isn't `bg-red-500` showing?" Answer: Tailwind didn't see it because you built the string at runtime.

## Conditional classes

For toggling classes based on props/state, libraries like `clsx` or `cn` (from shadcn/ui) help:

```tsx
import clsx from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-900',
  disabled && 'opacity-50 cursor-not-allowed',
)}>
```

Pair with `tailwind-merge` to dedupe conflicting utilities (covered Module 4 Lesson 3).

## Common confusions

**`m-auto` for horizontal centering doesn't work without a fixed width.** Use `mx-auto` for centering elements with fixed width; use `flex justify-center` or `grid place-items-center` for layout-driven centering.

**`hidden` versus `invisible`.** `hidden` = display: none (removed from layout). `invisible` = visibility: hidden (still takes space). Pick by intent.

**`w-full` vs `w-screen`.** `w-full` is 100% of parent; `w-screen` is 100vw (viewport, can cause horizontal scroll if parent is narrower).

**`flex` without direction.** Tailwind's `flex` defaults to `flex-row`. Use `flex-col` for vertical stacking.

## Mistakes to avoid

- **Dynamic class strings.** Tailwind can't see runtime-constructed classes.
- **Arbitrary values everywhere.** Defeats the design system constraint.
- **Manual class sorting.** Use the Prettier plugin.
- **`@apply` for everything.** Tailwind team recommends against; use components.
- **Mixing breakpoints in odd orders.** Mobile-first; build up.

## Summary

- `{prefix}:{property}-{value}` is the class shape.
- Scale-based values (`p-4` = 1rem); palettes (`bg-blue-500`); pseudo-prefixes (`hover:`, `dark:`).
- Mobile-first responsive: `md:p-8` means "p-8 from md up."
- Group/peer for parent/sibling state styling.
- Arbitrary values via `[brackets]` when scale doesn't fit.
- Tailwind can't see dynamically-built classnames.
- Use Prettier plugin to auto-sort classes.

Next: when to extract components.
