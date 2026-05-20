---
module: 3
position: 4
title: "Dark mode patterns"
objective: "class vs media, theming choices."
estimated_minutes: 7
---

# Dark mode patterns

## Why dark mode matters

Dark mode is no longer optional in 2026. Users expect it. iOS, Android, macOS, and Windows all support system-wide dark mode and pass the preference to browsers. Apps that respect the preference feel native; apps that ignore it feel dated.

Beyond user expectation, dark mode has real benefits:
- Eye comfort in low-light environments.
- Battery savings on OLED screens.
- Reduced eye strain for long sessions.
- Accessibility — some users need it.

The question isn't "should we support dark mode?" but "how?"

## Two strategies

Tailwind supports two dark mode strategies:

**1. `media` (OS preference):**
```js
darkMode: 'media',
```

Uses the `prefers-color-scheme` media query. Dark mode is on when the OS reports dark preference. No user toggle inside the app.

**2. `class` (user control):**
```js
darkMode: 'class',
```

Dark mode is on when a `.dark` class is on a parent (typically `<html>`). The app controls when dark mode applies. Users can toggle independent of OS.

`class` is the modern default — gives users explicit control. Pair with a toggle UI that respects (but doesn't enforce) OS preference.

## next-themes (Next.js)

For Next.js + class-based dark mode:

```bash
npm install next-themes
```

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
- `system` default reads OS preference.
- User can override; choice persists in localStorage.
- SSR-safe; no flash of wrong theme.
- `useTheme()` hook for toggle UI.

Toggle component:

```tsx
'use client';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800"
    >
      {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
```

`resolvedTheme` is the actual current theme (resolving `system` to either `light` or `dark`). Use it for icon display logic.

## The dark: modifier

In components, use `dark:` to apply styles only in dark mode:

```tsx
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  Content
</div>
```

The light mode classes always apply; `dark:` ones add only when `.dark` is on a parent.

You can stack:

```tsx
<button className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-400">
```

`hover:bg-blue-700` for light mode hover, `dark:hover:bg-blue-400` for dark mode hover.

## Semantic tokens approach

A cleaner pattern: CSS variables for theme-aware colors (covered Module 2 Lesson 2):

```css
:root {
  --bg: 255 255 255;
  --fg: 15 23 42;
}

.dark {
  --bg: 15 23 42;
  --fg: 248 250 252;
}
```

```js
colors: {
  background: 'rgb(var(--bg))',
  foreground: 'rgb(var(--fg))',
}
```

```tsx
<div className="bg-background text-foreground">
```

No `dark:` modifier needed. Same class works in both modes; the variables change.

For complex themes, this beats per-element `dark:` modifiers — less repetition, more central control.

## When to use dark: vs CSS variables

**Use `dark:` directly:**
- Simple sites with mostly default colors.
- Specific overrides where the semantic token doesn't fit.
- Quick prototypes.

**Use CSS variables:**
- Design systems with many colors.
- Multi-theme support beyond light/dark.
- Component libraries reused across themes.

Most production apps use both: CSS variables for semantic tokens, `dark:` for specific component overrides.

## Designing for dark mode

Dark mode isn't just "invert colors." Good dark mode design:

**Background isn't pure black.** True black (#000) has high contrast that strains eyes. Use very dark grays (#0F172A, #1E293B).

**Text isn't pure white.** Off-white (#F8FAFC, #E2E8F0) reduces glare while staying readable.

**Reduce shadows.** Shadows on dark backgrounds look weird; use them sparingly or replace with subtle borders.

**Adjust saturation.** Bright colors (#FF0000) look harsh on dark backgrounds. Use slightly desaturated variants.

**Test contrast.** WCAG contrast requirements still apply. Tools: Chrome DevTools accessibility audit, axe DevTools.

## Images and dark mode

Logos and brand imagery often need dark variants:

```tsx
<picture>
  <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
  <img src="/logo-light.svg" alt="Logo" />
</picture>
```

Or with class-based:

```tsx
<img src={resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'} />
```

For SVG logos, you can sometimes use CSS variables for colors:

```html
<svg fill="currentColor">...</svg>
```

Then `text-foreground` on the parent gives the SVG the right color in both modes. Saves having two SVG variants.

## Border and ring colors

Borders need extra care:

```tsx
<div className="border border-gray-200 dark:border-gray-800">
```

Default gray borders are nearly invisible in dark mode. Pick a slightly more visible dark variant; same for focus rings.

CSS variables solve this:

```css
:root { --border: 226 232 240; }
.dark { --border: 51 65 85; }
```

```tsx
<div className="border border-border">
```

The border adjusts automatically.

## Form elements in dark mode

Native inputs render with browser defaults that look wrong in dark mode. Use `@tailwindcss/forms` (Module 2 Lesson 4) which resets defaults; then style:

```tsx
<input className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500" />
```

Or with semantic tokens:

```tsx
<input className="bg-background text-foreground border-border focus:border-primary" />
```

The second pattern stays clean as themes evolve.

## Code blocks in dark mode

Syntax highlighting needs theme-aware colors. Options:

- **Highlight.js + theme switcher.** Switch CSS files based on theme.
- **Shiki** (often used in Astro, Next.js) — supports light + dark themes simultaneously via class-based theming.
- **Prism** with theme switching.

Shiki's dual-theme support is the slickest in 2026:

```tsx
// MDX with shiki:
<pre data-theme="light" className="dark:hidden">
<pre data-theme="dark" className="hidden dark:block">
```

Both render at build; the right one shows based on theme. No JS theme switching.

## Disabling dark mode for specific contexts

Sometimes you want light mode in a specific section regardless of user preference:

```tsx
<section className="bg-white text-gray-900">
  {/* This section stays light even in dark mode */}
</section>
```

Note: you have to explicitly set every style — not using `dark:` overrides means defaults apply. Useful for marketing pages, brand sections, terms/legal pages that should look uniform.

## Server-side rendering and dark mode

Without proper setup, the page server-renders in default theme, then JS applies user's preference — causing a flash. Fixes:

- **next-themes** handles this for Next.js.
- **Inline script** in `<head>` that reads localStorage and OS preference, sets the class synchronously before React loads.

```html
<head>
  <script>
    (function() {
      try {
        var stored = localStorage.getItem('theme');
        var preferred = stored ||
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.classList.add(preferred);
      } catch (e) {}
    })();
  </script>
</head>
```

The script blocks the page; sets the class before render; no flash.

## Mistakes to avoid

- **Pure black background.** Eye strain; use very-dark grays.
- **Untested contrast in dark mode.** Same WCAG requirements; verify both modes.
- **`dark:` overrides everywhere.** Use semantic tokens for the design system.
- **No flash prevention.** Bad first impression every page load.
- **Brand colors unchanged.** Bright colors often need desaturation for dark mode.
- **Forgetting borders.** Default gray borders invisible.

## Summary

- Use `darkMode: 'class'` for user-controllable dark mode.
- next-themes handles SSR-safe theming in Next.js.
- Semantic CSS variables beat `dark:` overrides for complex themes.
- Dark mode design: dark gray (not black) backgrounds, off-white text, reduced shadows, desaturated colors.
- Forms, code blocks, images may need theme-specific variants.
- Prevent flash via inline script or next-themes.
- Test contrast in both modes.

Next module: component patterns.
