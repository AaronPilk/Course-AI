---
module: 5
position: 1
title: "How Tailwind generates CSS"
objective: "JIT, purging, the output size question."
estimated_minutes: 7
---

# How Tailwind generates CSS

## The compilation model

Tailwind doesn't ship a static stylesheet. It generates CSS at build time based on what you actually use. Two important properties:

1. **Only utilities you use ship.** If you never write `text-purple-700`, that class doesn't exist in your CSS.
2. **Generation is fast.** Modern Tailwind (JIT compiler) generates utilities on demand in milliseconds.

This is why Tailwind apps can have thousands of theoretically-available utilities but ship 10-30KB of actual CSS.

## Just-in-time (JIT)

Tailwind v3+ uses JIT — Just-In-Time compilation:

1. Tailwind scans source files for class strings.
2. For each unique class found, generates the corresponding CSS.
3. Outputs minified CSS.

No "purging" step; it's all generation. Classes you don't use never exist. Classes you do use generate exactly once.

This means:

- Build is fast even with huge codebases.
- Dev mode is fast — hot reload regenerates only the new classes.
- Final CSS is tiny.

## The scanning step

Tailwind scans files configured in `content`:

```js
content: [
  './app/**/*.{ts,tsx,js,jsx,mdx}',
  './components/**/*.{ts,tsx}',
  './node_modules/@your-org/ui/**/*.tsx',
],
```

For each file, Tailwind extracts class strings via regex pattern matching. It doesn't actually parse JSX or evaluate JavaScript — it looks for class-like substrings.

Implications:

- **Static class strings only.** Tailwind can see `'bg-red-500'`; it can't see `'bg-' + color + '-500'`.
- **Comments work.** A line with `// 'bg-red-500'` (commented out) still triggers generation. The scan doesn't understand JS comments.
- **Multiple files OK.** Add as many content paths as you need; scan is fast.

## Dynamic classes — the gotcha

This is the most common Tailwind bug:

```tsx
// ❌ Doesn't work
const color = 'red';
return <div className={`bg-${color}-500`}>;
```

Tailwind's scanner sees `bg-${color}-500` as a string literal — never `bg-red-500`. The class is never generated; the div has no background.

Fixes:

```tsx
// ✅ Full class strings in source
const colorClass = color === 'red' ? 'bg-red-500' : 'bg-blue-500';
return <div className={colorClass}>;
```

Both `bg-red-500` and `bg-blue-500` appear literally; both generate.

Or for truly dynamic:

```tsx
// ✅ Use inline style for actually-dynamic values
return <div style={{ backgroundColor: someComputedColor }}>;
```

When the value can't be enumerated at build time, inline style is the right tool.

Or the safelist:

```js
// tailwind.config.js
safelist: [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  {
    pattern: /bg-(red|green|blue)-(100|500|900)/,
  },
],
```

Forces specific classes to generate even if not found in source. Use sparingly — defeats the tree-shaking benefit.

## What ships in the final CSS

For a typical app:

- **Base layer:** Tailwind's preflight (CSS reset). Few KB.
- **Components layer:** anything you added via plugins or custom CSS. Usually empty or tiny.
- **Utilities layer:** all the utilities you've used. Bulk of the file.

After minification + gzip:

- Small site: 10-15KB.
- Medium app: 20-40KB.
- Large app with many classes: 50-100KB.

Even very large apps typically come in under 100KB of CSS. Compare to hand-written CSS in large legacy projects (200-500KB+).

## Output size factors

What makes Tailwind CSS larger:

- **Lots of unique color/spacing combinations used.** Each gets its own class.
- **Many breakpoint variants of each class.** `md:p-4 lg:p-4 xl:p-4` triples that class's footprint.
- **Many hover/focus/dark variants.** Each variant generates its own class.
- **Arbitrary values.** Each unique arbitrary value (`p-[13px]`) is its own class.

Tailwind's JIT is efficient — only what you use ships — but using many variations of many things still adds up.

## Reducing output size

If your CSS bundle is large:

**1. Audit excessive arbitrary values.**

```bash
grep -r '\[' app/ components/ | grep -E '(p|m|w|h|text)-\[' | head -50
```

Many `[arbitrary]` values suggest your design system is missing scale steps. Add to config; reuse.

**2. Limit color palettes.**

If you only use 3 shades of blue and 4 grays, configure the palette to only include those:

```js
theme: {
  extend: {
    colors: {
      brand: { 500: '...', 600: '...', 700: '...' },
      gray: { /* etc */ },
    },
  },
}
```

But ONLY override with intention. Tailwind's default palette is great; replacing it should be deliberate.

**3. Disable unused core plugins.**

```js
corePlugins: {
  preflight: false,        // if you don't want Tailwind's CSS reset
  fontVariantNumeric: false,
  // ...
},
```

Rarely necessary; usually the savings are minor.

**4. Review breakpoint usage.**

If you barely use `2xl:` variants, omit them from your default breakpoints. Or restructure to use container queries instead of viewport breakpoints (Module 3).

## CSS load order

```css
@tailwind base;        /* Tailwind reset + element defaults */
@tailwind components;  /* @layer components (rare) */
@tailwind utilities;   /* Your utility classes */

/* Your custom CSS goes here OR via @layer */
```

Order matters for cascade:

- Base layer: lowest specificity; element styles.
- Components layer: medium; can be overridden by utilities.
- Utilities layer: highest among these; wins over base/components.

Your custom CSS, if outside layers, comes after — winning over everything. Usually fine but can surprise.

## @layer for custom CSS

For organizing custom CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { @apply bg-white text-gray-900; }
}

@layer components {
  .prose-custom { /* custom styles */ }
}

@layer utilities {
  .scrollbar-thin { /* custom utility */ }
}
```

Putting custom CSS in `@layer` lets Tailwind purge unused styles and respect the cascade. Outside `@layer`, custom CSS won't be purged.

## Build performance

JIT is fast. For a typical Next.js project, Tailwind adds milliseconds to the build, not seconds. Dev mode hot-reloads instantly.

If your Tailwind build feels slow:

- **Check content paths.** Globbing too broadly can slow scanning.
- **Avoid `**/*` patterns.** Be specific.
- **Update Tailwind.** Newer versions are faster.
- **Check plugin overhead.** Some third-party plugins are slow.

For most projects, no tuning needed.

## Source maps

In development, Tailwind generates source maps so DevTools shows which class came from which source line. In production, omit source maps to save bandwidth.

Configured in your build tooling, not Tailwind directly.

## Production build

The standard build pipeline:

1. PostCSS runs Tailwind.
2. Tailwind scans content paths, generates CSS.
3. Minifier (cssnano, lightningcss) compresses.
4. Final CSS goes to the bundle.

Most frameworks handle this automatically. For Next.js: `npm run build` does it all.

Verify the output:

```bash
# After build, check the CSS size:
ls -lh .next/static/css/
```

Typical sizes: 10-50KB per CSS file (gzipped at serve time, even smaller wire).

## Mistakes to avoid

- **Dynamic class strings.** Most common bug.
- **Excessive arbitrary values.** Design system smell.
- **Custom CSS outside `@layer`.** Won't be purged or ordered properly.
- **Forgetting content paths.** Used utilities don't generate.
- **Disabling preflight unintentionally.** Tailwind's CSS reset is load-bearing.

## Summary

- Tailwind generates CSS at build time from class strings found in source.
- JIT compiler is fast; only used utilities ship.
- Dynamic class names (`bg-${color}-500`) won't generate — use full strings.
- Final CSS is typically 10-100KB even for large apps.
- safelist forces specific classes to generate (sparingly).
- Custom CSS in `@layer` for proper cascade and purging.
- Build is fast; rarely needs tuning.

Next: animation and transitions.
