---
module: 5
position: 3
title: "Common pitfalls and how to avoid them"
objective: "Dynamic class names, ordering, specificity."
estimated_minutes: 7
---

# Common pitfalls and how to avoid them

## The recurring Tailwind bugs

This lesson catalogs the bugs that come up over and over in Tailwind codebases. Most are fixable; many are preventable with the right patterns.

## Dynamic class names

By far the most common bug:

```tsx
const color = 'red';
return <div className={`bg-${color}-500`}>;
```

Tailwind's scanner sees `bg-${color}-500` as a literal string — never `bg-red-500`. The class isn't generated; nothing renders.

**Fix 1: Use full class strings.**

```tsx
const colorClass = color === 'red' ? 'bg-red-500' : 'bg-blue-500';
```

Both literal strings appear in source; both generate.

**Fix 2: Map of full strings.**

```tsx
const colors = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
};
return <div className={colors[color]}>;
```

Cleaner for many options.

**Fix 3: Safelist (sparingly).**

```js
// tailwind.config.js
safelist: [
  'bg-red-500',
  'bg-blue-500',
  { pattern: /bg-(red|blue|green)-(100|500|900)/ },
],
```

Forces classes to generate even if not seen in source. Use when classes truly are computed at runtime (e.g., from server data, theme picker UI). Defeats tree-shaking; don't overuse.

**Fix 4: Inline style for truly dynamic.**

```tsx
return <div style={{ backgroundColor: someComputedColor }}>;
```

When the value is from user input or computed math, inline style is the right tool.

## Classes that don't override

```tsx
// Inside Button:
<button className="px-4 py-2 bg-blue-600" {...props}>

// Consumer:
<Button className="px-8" />
```

Sometimes `px-8` wins; sometimes `px-4`. Inconsistent.

**Fix: tailwind-merge via cn().**

```tsx
import { cn } from '@/lib/utils';

<button className={cn('px-4 py-2 bg-blue-600', className)} {...props}>
```

`twMerge` resolves conflicts — later in string wins predictably.

## CSS not loading

Class is correct; rendering nothing. Several possibilities:

**Wrong content path.**

```js
content: [
  './app/**/*.{ts,tsx}',  // Add all paths that use Tailwind
  './components/**/*.{ts,tsx}',
],
```

If your code lives in a folder not listed, scanned files don't include those, classes don't generate.

**Tailwind not in build pipeline.**

Verify postcss.config.js has Tailwind:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Or for newer setups (Next.js, Vite with @tailwindcss/postcss):

```js
plugins: {
  '@tailwindcss/postcss': {},
},
```

**CSS file not imported.**

```tsx
// app/layout.tsx
import './globals.css';  // Must import in root layout
```

If globals.css with `@tailwind` directives isn't imported, no Tailwind CSS in the bundle.

## Specificity issues

Sometimes a class doesn't take effect because something else has higher specificity:

```html
<!-- Tailwind utility -->
<button class="bg-blue-500">

<!-- Conflicting CSS in another stylesheet: -->
<style>
  button { background: red !important; }
</style>
```

`!important` always wins. ID selectors win over classes. Inline styles win over classes (unless those are also `!important`).

**Diagnosis:** DevTools → Computed → see which rule won, and why.

**Fix:** find the conflicting style, remove it. Or use Tailwind's `!` modifier:

```tsx
<button className="!bg-blue-500">  <!-- ships as !important -->
```

Use `!` sparingly — escalation in specificity war that you'll regret later.

## Hover/focus states not working

```tsx
<div className="bg-blue-500 hover:bg-blue-700">
```

Doesn't work because:

- The element isn't hoverable (a `<div>` is hoverable on desktop but not focusable for keyboard users).
- The element has `pointer-events: none` somewhere.
- A child element is intercepting the hover.
- It's a touch device (no hover state).

**Fix:** For interactive elements, use `<button>` or `<a>` — they're naturally interactive. For non-interactive elements that need hover, add appropriate ARIA and tabindex.

For touch-friendly versions, pair `hover:` with `focus:` and tap detection.

## Dark mode in wrong place

```tsx
// In a component file:
<div className="dark:bg-gray-900">
```

If `darkMode` isn't configured, or if the `.dark` class isn't on a parent, dark variants don't apply.

**Fix:**

1. `darkMode: 'class'` in tailwind.config.
2. `.dark` class on `<html>` or `<body>` (typically via next-themes).
3. Verify by inspecting the DOM — is `.dark` actually applied to a parent?

## Build size surprising

CSS bundle is 200KB+ when expected to be 30KB.

**Diagnoses:**

- **Too many arbitrary values.** `p-[13px]`, `bg-[#FF5733]` everywhere.
- **All shades of all colors used somewhere.** Each generates a class.
- **Lots of `@apply` rules.** Each generates a class.
- **Old purge config.** Newer Tailwind versions don't need it.

**Fixes:**

- Audit arbitrary values; consolidate into scale.
- Restrict color palette in config if you only use a few.
- Move `@apply` to components.

For very large apps, 50-100KB is normal. 200KB+ usually means a config issue.

## Breakpoints not behaving

```tsx
<div className="md:flex">
```

Doesn't go to flex at md. Reasons:

- `md` breakpoint is at 768px; viewport may be smaller.
- Custom breakpoints in config override default values.
- Parent has `display` that overrides (e.g., `inline` parent makes flex impossible).
- Class isn't actually in the DOM (inspect to verify).

**Fix:** Open DevTools, set viewport size manually, inspect computed styles. Usually reveals the issue.

## Print styles

Tailwind ships `print:` modifier:

```tsx
<nav className="print:hidden">  <!-- hidden when printing -->
<div className="hidden print:block">  <!-- visible only in print -->
```

For complex print layouts, sometimes a separate stylesheet is cleaner than peppering `print:` everywhere.

## Server / client rendering mismatch

In Next.js with React Server Components, classes determined by server state (current theme, user preference) can differ between server and client renders, causing hydration warnings.

**Fix:**

- Use `next-themes` for theme handling (handles SSR safely).
- For conditional classes from session: gate render on `mounted` boolean.
- For initial render mismatches: `suppressHydrationWarning` on the wrapping element.

## Custom plugin not working

You added a plugin to tailwind.config.plugins but utilities don't appear.

**Fixes:**

- Dev server restarted? Some Tailwind config changes need a restart.
- Plugin imported correctly? `require('./my-plugin')` vs `import './my-plugin'` matters in CommonJS configs.
- Plugin actually generates utilities (check by logging from inside).
- content paths include where you USE the new utilities.

## prefers-color-scheme not detected

Building dark mode with `media` strategy but it ignores OS preference.

**Fix:**

- `darkMode: 'media'` in config (not `'class'`).
- Browser actually sends `prefers-color-scheme` — test with DevTools → Rendering → Emulate CSS media feature.
- No other CSS overriding `prefers-color-scheme:` behavior.

## Tailwind classes inside conditional render

```tsx
{isVisible && (
  <div className="bg-blue-500 hover:bg-blue-700">
)}
```

When `isVisible` becomes true, classes work. When it was always false, they're still in the source — Tailwind generates them. No issue here.

But if the class string is computed inside the conditional:

```tsx
{isVisible && (
  <div className={`bg-${color}-500`}>
)}
```

Same dynamic-classes problem from earlier. Static strings only.

## Layered approach for debugging

When something doesn't work, in order:

1. **Inspect the DOM.** Is the class actually on the element?
2. **DevTools Computed tab.** Is the rule applying? What's the winner?
3. **Search the source.** Is the class spelled exactly right somewhere?
4. **Check content paths.** Is the file with the class actually scanned?
5. **Rebuild.** Sometimes hot-reload misses changes; full rebuild helps.

90% of issues are in steps 1-3.

## Mistakes to avoid

- **Dynamic class strings.**
- **className not merged via cn().**
- **Wrong content paths.**
- **`!important` everywhere.**
- **No FOUC prevention for dark mode.**
- **Excessive arbitrary values.**
- **Ignoring hydration warnings.**

## Summary

- Dynamic class names: use full strings, maps, or safelist.
- className conflicts: use cn() with tailwind-merge.
- CSS not loading: check content paths, postcss config, CSS import.
- Specificity wars: avoid `!important`; understand the cascade.
- Build size: audit arbitrary values; review palette.
- Dark mode: verify config, class application, no SSR mismatches.
- Debug systematically: inspect DOM, computed styles, content paths.

Next: migrating to Tailwind from legacy CSS.
