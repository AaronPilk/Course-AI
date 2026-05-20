---
module: 2
position: 4
title: "Custom plugins and extensions"
objective: "When the defaults don't fit."
estimated_minutes: 7
---

# Custom plugins and extensions

## When defaults aren't enough

Tailwind's built-in utilities cover 90% of common needs. The remaining 10% — animations, specific patterns, brand-specific helpers — benefit from plugins. The plugin API gives you the same generation power Tailwind uses internally for its own utilities.

This lesson covers the official plugins worth using and how to write your own.

## Official plugins

The Tailwind team maintains a few essential plugins:

**@tailwindcss/typography** — the `prose` class (covered last lesson).

**@tailwindcss/forms** — sane reset for form elements:

```js
plugins: [require('@tailwindcss/forms')],
```

Resets browser defaults for inputs, selects, checkboxes, radios. Now you can style with Tailwind utilities directly instead of fighting browser styles.

```tsx
<input className="rounded-md border-gray-300 focus:border-brand-500 focus:ring focus:ring-brand-500/20" />
```

Without `forms` plugin, the input has a default browser appearance that's hard to override consistently across browsers.

**@tailwindcss/container-queries** — `@container` support:

```tsx
<div className="@container">
  <h2 className="@md:text-2xl @lg:text-3xl">Title</h2>
</div>
```

Container queries let components be responsive to their container size, not the viewport. Covered in Module 3.

**@tailwindcss/aspect-ratio** — `aspect-w-16 aspect-h-9` legacy support. Modern Tailwind (3.0+) has native `aspect-video`, `aspect-square`, `aspect-[16/9]`. Use the plugin only for older browsers or specific aspect-ratio patterns.

## Writing a custom plugin

For utilities not in core:

```js
// tailwind.config.js
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function ({ addUtilities, theme }) {
      addUtilities({
        '.text-shadow': {
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-md': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      });
    }),
  ],
};
```

Now `text-shadow`, `text-shadow-md`, etc. work like any Tailwind utility — with all modifiers (`hover:text-shadow-md`).

## Generating utilities from theme

For more dynamic plugins:

```js
plugin(function ({ matchUtilities, theme }) {
  matchUtilities(
    {
      'text-stroke': (value) => ({
        '-webkit-text-stroke': value,
      }),
    },
    {
      values: theme('borderWidth'),
    }
  );
});
```

Now `text-stroke-2`, `text-stroke-4`, etc. generate based on the borderWidth scale.

`matchUtilities` is the engine behind Tailwind's own utilities — generating many utilities from a single definition + a scale.

## addComponents

For component-style classes (rare but legitimate):

```js
plugin(function ({ addComponents, theme }) {
  addComponents({
    '.card-base': {
      borderRadius: theme('borderRadius.lg'),
      backgroundColor: theme('colors.white'),
      boxShadow: theme('boxShadow.sm'),
      padding: theme('spacing.6'),
    },
  });
});
```

Components come earlier in the cascade than utilities, so utility classes override:

```tsx
<div className="card-base p-12">  {/* p-12 wins over the plugin's p-6 */}
```

Used sparingly for true design-system primitives that benefit from a name (cards, panels). For most cases, components in React are still cleaner.

## addBase

For base styles applied to elements:

```js
plugin(function ({ addBase, theme }) {
  addBase({
    'h1': { fontSize: theme('fontSize.4xl'), fontWeight: '700' },
    'h2': { fontSize: theme('fontSize.3xl'), fontWeight: '700' },
    'a': { color: theme('colors.brand.600'), textDecoration: 'underline' },
  });
});
```

Applies to all `<h1>`, `<h2>`, `<a>` in the project. Use sparingly — base styles affect every instance and can be hard to override later.

For typography defaults, `prose` is usually a better choice (scoped to content areas).

## Adding modifiers

You can add new pseudo-class modifiers:

```js
plugin(function ({ addVariant }) {
  addVariant('group-data-active', ':merge(.group)[data-state="active"] &');
});
```

Now `group-data-active:bg-blue-500` works — applies when a parent with `group` and `data-state="active"` exists.

Used heavily in headless UI libraries (Radix, React Aria) that toggle state via data attributes.

## Common third-party plugins

The community has many plugins:

- **tailwindcss-animate** — animation utilities. shadcn/ui uses it.
- **tailwind-scrollbar** — scrollbar styling.
- **tailwindcss-debug-screens** — shows the current breakpoint in dev.
- **tailwindcss-radix** — utilities for Radix UI integration.

Audit before adopting — many community plugins are sparsely maintained. If a plugin does one small thing, consider inlining its definition instead.

## Custom animations

A common need is custom animations beyond Tailwind's defaults (`animate-spin`, `animate-pulse`, `animate-bounce`):

```js
theme: {
  extend: {
    keyframes: {
      'fade-in': {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      'slide-up': {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },
    animation: {
      'fade-in': 'fade-in 0.3s ease-out',
      'slide-up': 'slide-up 0.4s ease-out',
    },
  },
},
```

Now `animate-fade-in`, `animate-slide-up` work as utilities. Use in entrance animations, hover effects, page transitions.

Covered more in Module 5 (animation).

## When NOT to write a plugin

If you find yourself writing a custom plugin for one-off styling, reconsider. Often:

- A React component is the better abstraction.
- A CSS variable is more flexible.
- A `style` prop suffices.

Plugins shine when you have a utility pattern you'll use 10+ times across many components. For one-off needs, keep it simple.

## Plugin order

The Tailwind config processes plugins in array order. Later plugins can override earlier ones:

```js
plugins: [
  require('@tailwindcss/typography'),
  require('./my-custom-typography'),  // Override prose styles
],
```

Generally, place official plugins first, custom plugins after. Tweaks to defaults come last.

## Disabling core plugins

To shrink the CSS or prevent specific utilities:

```js
corePlugins: {
  fontVariantNumeric: false,
  ringOffsetColor: false,
  // ...
},
```

The list is rarely worth touching. Tailwind's JIT only generates utilities you use; disabling core plugins matters for build-time edge cases.

## Plugin documentation

Tailwind's plugin docs cover the API in detail:
- `addUtilities` / `matchUtilities` — single utilities or scale-based.
- `addComponents` — reusable component classes.
- `addBase` — element defaults.
- `addVariant` — new modifier prefixes.
- `theme()` — access the design system.

Read these when you need to customize seriously.

## Composing with the design system

Plugins should reference the design system, not hardcoded values:

```js
// ❌ Bad — hardcoded
addUtilities({
  '.card-shadow': {
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
});

// ✅ Good — uses theme
addUtilities({
  '.card-shadow': {
    boxShadow: theme('boxShadow.lg'),
  },
});
```

`theme()` makes plugins respect your design system. Change the system once; plugin output updates.

## Mistakes to avoid

- **Writing plugins for one-off needs.** Component is usually better.
- **Plugins with hardcoded values.** Use `theme()`.
- **Too many community plugins.** Each adds maintenance burden.
- **Custom animations without considering reduced-motion.** Respect `prefers-reduced-motion`.
- **addBase that fights prose plugin.** Decide which owns typography.

## Summary

- Official plugins: typography, forms, container-queries.
- Custom plugins via `plugin()` from `tailwindcss/plugin`.
- `addUtilities`, `addComponents`, `addBase`, `addVariant` for different needs.
- `theme()` accesses your design system for consistent values.
- Custom animations via `keyframes` + `animation` in config.
- Plugins for utility patterns used many places; components for one-offs.

Next module: responsive and adaptive design.
