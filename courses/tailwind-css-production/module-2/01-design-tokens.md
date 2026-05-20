---
module: 2
position: 1
title: "tailwind.config and the design system"
objective: "Tokens for color, spacing, type."
estimated_minutes: 7
---

# tailwind.config and the design system

## The config IS the design system

The Tailwind config file (`tailwind.config.js`, or CSS-based config in v4) defines what utilities exist. Default Tailwind ships with a sensible scale; customizing the config turns Tailwind into YOUR design system rather than the framework's.

This is the highest-leverage Tailwind investment. A well-configured Tailwind project is dramatically more consistent than one using defaults blindly.

## The shape of the config

```js
// tailwind.config.js (v3)
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { /* ... */ },
      spacing: { /* ... */ },
      fontFamily: { /* ... */ },
      // ... other tokens
    },
  },
  plugins: [
    // ...
  ],
};
```

Two keys matter most:

- `content` — files Tailwind scans for class usage.
- `theme.extend` — adds to (rather than replaces) defaults.

Using `theme` (without extend) replaces defaults entirely. Almost always use `extend` — you want to add your tokens alongside, not replace, Tailwind's sensible base.

In Tailwind v4, configuration moves to CSS files via `@theme` blocks; same concepts apply.

## Colors

The biggest customization area. Define your brand palette:

```js
theme: {
  extend: {
    colors: {
      brand: {
        50: '#eef9ff',
        100: '#daf1ff',
        200: '#bee5ff',
        300: '#91d4ff',
        400: '#5cb8ff',
        500: '#3496ff',
        600: '#1e76f4',
        700: '#175fe1',
        800: '#194eb6',
        900: '#1a458f',
        950: '#142e57',
      },
    },
  },
},
```

Now `bg-brand-500`, `text-brand-700`, `border-brand-200` are all available.

Generate palettes with tools like:

- **uicolors.app** — pick a hex, get a full 50-950 scale.
- **Tailwind's color palette generator.**
- **Radix Colors** — accessibility-tested palettes you can adapt.

Aim for a 10-step scale per color (50-950). Lets you express subtle differences (hover states a shade darker, disabled states two shades lighter).

## Semantic tokens

Beyond brand colors, define semantic tokens — colors named by role, not value:

```js
colors: {
  background: 'var(--bg)',
  foreground: 'var(--fg)',
  primary: 'var(--primary)',
  'primary-foreground': 'var(--primary-fg)',
  muted: 'var(--muted)',
  'muted-foreground': 'var(--muted-fg)',
  border: 'var(--border)',
  ring: 'var(--ring)',
}
```

Backed by CSS variables (next lesson). Now `bg-background`, `text-foreground`, `border-border` work across light/dark mode automatically.

The shadcn/ui pattern uses this heavily — your components use semantic tokens, and theme changes swap the underlying CSS variables.

## Spacing

The default scale (`0`, `0.5`, `1`, `1.5`, `2`, ..., `96`) covers most needs. Adjust if your design system has specific increments:

```js
spacing: {
  '13': '3.25rem',
  '15': '3.75rem',
  '128': '32rem',
}
```

Padding, margin, width, height, gap — all use the spacing scale by default.

A common temptation: define many custom spacing values. Resist. The constraint is the value.

## Typography

```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  serif: ['Georgia', 'serif'],
  mono: ['JetBrains Mono', 'monospace'],
  display: ['Cal Sans', 'Inter', 'sans-serif'],
},

fontSize: {
  // Override defaults if needed
  'xs': ['0.75rem', { lineHeight: '1rem' }],
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],
  // ...
},
```

Pair with `next/font` (covered Next.js course) to get self-hosted fonts:

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

<html className={inter.variable}>
```

```js
// tailwind.config.js
fontFamily: {
  sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
},
```

Now `font-sans` uses Inter; bundled, optimized, no layout shift.

## Border radius

```js
borderRadius: {
  'sm': '0.125rem',
  'DEFAULT': '0.25rem',
  'md': '0.375rem',
  'lg': '0.5rem',
  'xl': '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  '4xl': '2rem',
  'full': '9999px',
}
```

The defaults are usually fine. Adjust if your brand has a specific radius (very sharp, very round).

## Shadows

```js
boxShadow: {
  'soft': '0 2px 8px rgba(0,0,0,0.04)',
  'glow': '0 0 24px rgba(59,130,246,0.3)',
  'inner-soft': 'inset 0 1px 3px rgba(0,0,0,0.06)',
}
```

Add brand-specific shadow named for use ("card shadow," "modal shadow") rather than just step-based.

## Breakpoints

```js
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
}
```

Defaults work for most designs. Customize when your design uses non-standard breakpoints (e.g., a tablet-first layout where `md` should mean 700px).

## Custom plugins

For utilities not built-in:

```js
plugins: [
  require('@tailwindcss/forms'),       // Reset form element styles
  require('@tailwindcss/typography'),  // The `prose` class
  require('@tailwindcss/container-queries'), // @container support
  require('@tailwindcss/aspect-ratio'),
]
```

Custom plugins extend Tailwind for specific needs:

```js
plugin(function({ addUtilities }) {
  addUtilities({
    '.text-shadow': { textShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    '.text-shadow-md': { textShadow: '0 4px 8px rgba(0,0,0,0.15)' },
  });
});
```

For one-off utilities your design system needs.

## Where the config lives

`tailwind.config.js` lives at the project root. In Next.js / Vite / standard React projects, this is the standard location.

In monorepos, you might share a config across packages:

```js
// packages/config/tailwind.config.js
module.exports = {
  theme: { extend: { /* shared tokens */ } },
};

// packages/app1/tailwind.config.js
const sharedConfig = require('@my-org/config/tailwind.config');
module.exports = {
  presets: [sharedConfig],
  content: ['./src/**/*.tsx'],
};
```

`presets` lets configs compose. The shared config defines tokens; app configs add their own content paths and overrides.

## Content paths matter

`content` tells Tailwind which files to scan for class usage. Missing files = utilities not generated.

```js
content: [
  './app/**/*.{ts,tsx}',         // Next.js App Router
  './components/**/*.{ts,tsx}',
  './pages/**/*.{ts,tsx}',        // Next.js Pages Router (if used)
  // If using a UI library:
  './node_modules/@your-org/ui/**/*.{ts,tsx}',
],
```

Including too much is fine (just slower scans). Excluding files that use Tailwind classes = those classes never generated.

In Tailwind v4, automatic content detection eliminates most of this.

## Common config patterns

**1. Single-source-of-truth color palette:**

Define brand colors once in CSS variables; reference in Tailwind config; use semantic tokens in components.

**2. Component-class plugin:**

Some teams define common patterns as plugins:

```js
plugin(function({ addComponents }) {
  addComponents({
    '.btn-primary': {
      '@apply px-4 py-2 bg-brand-500 text-white rounded-md font-medium hover:bg-brand-600': {},
    },
  });
});
```

(This is the rare legitimate use of `@apply` — defining tokens, not component logic.)

**3. Disabled core plugins:**

If your design doesn't use certain Tailwind features, disable them to shrink the CSS:

```js
corePlugins: {
  // ...
  fontVariantNumeric: false,
},
```

Usually unnecessary — Tailwind's purging is good — but available for tight bundles.

## Type safety

For TypeScript projects, install `@tailwindcss/typography` types if using prose, and configure your editor with the official Tailwind IntelliSense extension. Autocompletes class names; warns on typos; previews colors inline.

Standard part of modern Tailwind setup.

## Migration of tokens

When updating design tokens (renaming colors, shifting scale):

1. Define new tokens alongside old.
2. Migrate components incrementally.
3. Remove old tokens once unused.

A rename mid-codebase requires global search-and-replace. For minor changes this works; for major design system shifts, a per-component migration plan is more controlled.

## Mistakes to avoid

- **Defining defaults without extend.** Wipes Tailwind's base.
- **Too many custom values.** Defeats the constraint.
- **Hex colors hardcoded everywhere.** Use config tokens.
- **Forgetting content paths.** Utilities silently missing.
- **Naming colors after appearance (`red`).** Prefer roles (`destructive`).

## Summary

- The Tailwind config IS your design system.
- Use `extend` to add to defaults, not replace.
- Define brand color palettes with 10-step scales.
- Add semantic tokens (background, foreground, primary) backed by CSS variables.
- Custom plugins for specific utility needs.
- `content` paths must cover all files using Tailwind.
- Editor IntelliSense extension is essential.

Next: CSS variables for runtime theming.
