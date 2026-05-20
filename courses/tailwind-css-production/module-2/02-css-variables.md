---
module: 2
position: 2
title: "CSS variables for runtime theming"
objective: "Dark mode and brand themes."
estimated_minutes: 7
---

# CSS variables for runtime theming

## Why CSS variables

Hardcoded colors in tailwind.config work great for a single theme. The moment you need multiple themes (light + dark, brand A + brand B, day mode + night mode), CSS variables become essential.

The pattern: Tailwind classes reference CSS variables; the variables hold actual values; you swap variable values to change theme. Tailwind utilities stay the same; the rendered colors change.

## The basic setup

In your global CSS:

```css
/* app/globals.css */
:root {
  --bg: 255 255 255;        /* RGB space-separated values */
  --fg: 15 23 42;
  --primary: 59 130 246;
  --primary-fg: 255 255 255;
  --muted: 241 245 249;
  --muted-fg: 100 116 139;
  --border: 226 232 240;
}

.dark {
  --bg: 15 23 42;
  --fg: 248 250 252;
  --primary: 96 165 250;
  --primary-fg: 15 23 42;
  --muted: 30 41 59;
  --muted-fg: 148 163 184;
  --border: 51 65 85;
}
```

In tailwind.config:

```js
theme: {
  extend: {
    colors: {
      background: 'rgb(var(--bg) / <alpha-value>)',
      foreground: 'rgb(var(--fg) / <alpha-value>)',
      primary: {
        DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
        foreground: 'rgb(var(--primary-fg) / <alpha-value>)',
      },
      muted: {
        DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
        foreground: 'rgb(var(--muted-fg) / <alpha-value>)',
      },
      border: 'rgb(var(--border) / <alpha-value>)',
    },
  },
},
```

Now in components:

```tsx
<div className="bg-background text-foreground border border-border">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Save
  </button>
</div>
```

The button reads "background: primary color, text: primary foreground." Light vs dark mode swaps the underlying variables; same classes, different appearance.

## Why RGB space-separated

The `rgb(var(--primary) / <alpha-value>)` syntax lets you use Tailwind's alpha modifiers:

```tsx
<div className="bg-primary/50">  {/* 50% opacity primary */}
<div className="bg-primary/10">  {/* 10% opacity for subtle backgrounds */}
```

Without the RGB-space format, `bg-primary/50` doesn't work. The `<alpha-value>` placeholder is Tailwind's way of injecting the alpha modifier into the rgb() function.

If you use HSL format, the same pattern applies:

```css
--primary: 217 91% 60%;
```

```js
primary: 'hsl(var(--primary) / <alpha-value>)',
```

Either works. RGB is slightly more common; HSL is easier for designers to reason about (hue + saturation + lightness).

## Switching themes

Adding/removing a class on `<html>` or `<body>` toggles the theme:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

The `.dark { --bg: ...; }` selector overrides the `:root { --bg: ...; }` values when the `dark` class is on the html element. CSS variables cascade naturally.

## next-themes

For Next.js apps, `next-themes` handles theme switching with SSR safety:

```tsx
// app/providers.tsx
'use client';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```

```tsx
// app/layout.tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <Providers>{children}</Providers>
  </body>
</html>
```

Features:
- Reads OS preference by default.
- Persists user choice in localStorage.
- Handles SSR without flash of wrong theme.
- `useTheme()` hook for toggle UI.

```tsx
'use client';
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle
    </button>
  );
}
```

Standard part of any Tailwind + Next.js app with dark mode.

## tailwind.config darkMode

Tell Tailwind how dark mode triggers:

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // or 'media' for prefers-color-scheme
  // ...
};
```

- `'class'` — dark mode active when `.dark` is on a parent (html). Use with next-themes.
- `'media'` — dark mode follows OS preference automatically.
- `'selector'` (v3.4.1+) — use custom selector for advanced cases.

`class` is the common choice — gives users control over their experience independent of OS.

## Multi-theme branding

Beyond light/dark, you can support multiple brand themes:

```css
:root,
[data-theme='default'] {
  --primary: 59 130 246;
}

[data-theme='emerald'] {
  --primary: 16 185 129;
}

[data-theme='rose'] {
  --primary: 244 63 94;
}
```

```tsx
<html data-theme="emerald">
```

Switch themes by changing the data attribute. Same Tailwind utilities; different rendered colors.

Useful for:
- Multi-tenant SaaS (each customer gets their brand).
- A/B testing color schemes.
- Light/dark + accent color combos.

## Semantic tokens vs raw colors

A common pattern split:

**Raw palette tokens** (defined directly in config):

```js
colors: {
  blue: { 50, 100, ..., 950 },
  red: { 50, 100, ..., 950 },
  // ...
}
```

**Semantic tokens** (via CSS variables, theme-aware):

```js
colors: {
  background: 'rgb(var(--bg))',
  foreground: 'rgb(var(--fg))',
  // ...
}
```

Components use SEMANTIC tokens (`bg-background`, `text-foreground`). Decorative one-offs use RAW palette (`bg-blue-500`, `text-red-700`).

Mixing intentionally: most styling uses semantic; specific decorative needs reach for raw.

## CSS variables for non-color tokens

Beyond colors, CSS variables work for spacing, sizing, type — any value that should change at runtime:

```css
:root {
  --radius: 0.5rem;
  --header-height: 4rem;
}

.compact {
  --radius: 0.25rem;
  --header-height: 3rem;
}
```

```js
borderRadius: {
  DEFAULT: 'var(--radius)',
},
spacing: {
  'header': 'var(--header-height)',
}
```

For complex theming systems, this lets one mode change radius, spacing, and colors together.

## Avoiding flash of unstyled content

Without care, the page may briefly render in the wrong theme before JS sets the user's preference. next-themes handles this; for custom solutions, set the class server-side or via an inline script before React loads:

```html
<head>
  <script>
    (function() {
      const stored = localStorage.getItem('theme');
      const preferred = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.add(preferred);
    })();
  </script>
</head>
```

The script runs before React; sets the right class; no flash. next-themes does this for you.

## Mistakes to avoid

- **Hex colors in components.** Use semantic tokens.
- **CSS variables that aren't RGB-formatted.** Lose alpha modifier support.
- **Mixing `bg-blue-500` with `bg-primary` randomly.** Pick semantic for app UI; raw for specific decorative needs.
- **No FOUC prevention.** Flash of wrong theme on every load.
- **Hardcoded dark variants.** Use `dark:` modifier or theme tokens.

## Summary

- CSS variables enable runtime theming.
- Tailwind config references variables; variables hold actual values; swap to change theme.
- RGB space-separated format enables Tailwind's alpha modifiers.
- next-themes for Next.js dark mode with SSR safety.
- Semantic tokens for app UI; raw palette for one-offs.
- Multi-theme branding via data attributes.
- Prevent FOUC via inline script or library.

Next: typography and the prose plugin.
