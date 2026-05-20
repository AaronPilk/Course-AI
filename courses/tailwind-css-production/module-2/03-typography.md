---
module: 2
position: 3
title: "Typography and the prose plugin"
objective: "Rich text without fighting Tailwind."
estimated_minutes: 7
---

# Typography and the prose plugin

## The rich-text problem

Tailwind's utility model breaks down a little for rich text. You can't add `text-lg` to every `<p>` in a Markdown-rendered blog post — you don't control the HTML. You need defaults that apply automatically to nested elements.

The `@tailwindcss/typography` plugin solves this. It defines a `prose` utility that styles all nested typographic elements (`<p>`, `<h1>` through `<h6>`, `<ul>`, `<ol>`, `<code>`, `<blockquote>`, `<a>`, etc.) consistently.

## Installation

```bash
npm install -D @tailwindcss/typography
```

```js
// tailwind.config.js
module.exports = {
  // ...
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

## Basic usage

```tsx
<article className="prose">
  <h1>The Title</h1>
  <p>Some content with <strong>bold</strong> and <em>italic</em> text.</p>
  <ul>
    <li>First item</li>
    <li>Second item</li>
  </ul>
  <pre><code>function example() { return 42; }</code></pre>
</article>
```

The `prose` class:
- Sets max-width, line-height, font sizing.
- Adds margins between elements.
- Styles links with hover.
- Styles code blocks, inline code, blockquotes, lists.
- Provides smart spacing between heading and content.

Without prose: bare HTML with no margins, default browser styles. With prose: looks like a well-designed blog post.

## Size variants

```tsx
<article className="prose prose-sm">  {/* smaller text */}
<article className="prose prose-base">  {/* default */}
<article className="prose prose-lg">  {/* larger */}
<article className="prose prose-xl">  {/* even larger */}
<article className="prose prose-2xl">  {/* huge */}
```

For long-form reading, `prose-lg` is often nicer than the default. For dense content (docs, technical articles), `prose` or `prose-sm`.

## Color variants

```tsx
<article className="prose prose-slate">  {/* slate gray text */}
<article className="prose prose-stone">
<article className="prose prose-neutral">
<article className="prose prose-gray">
```

Each variant applies a different gray tone to the typography (text, headings, etc.). Pick what matches your design.

## Dark mode

The plugin supports dark mode via `prose-invert`:

```tsx
<article className="prose dark:prose-invert">
```

In dark mode, the colors invert to light text on dark background.

For more control, customize per-color:

```js
// tailwind.config.js
plugins: [
  require('@tailwindcss/typography')({
    className: 'prose',
  }),
]
```

```css
.dark .prose {
  --tw-prose-body: theme('colors.gray.300');
  --tw-prose-headings: theme('colors.white');
  --tw-prose-links: theme('colors.blue.400');
  /* ... */
}
```

CSS variables inside `prose` control individual colors.

## Overriding specific elements

Sometimes you need to tweak a specific element within prose:

```tsx
<article className="prose prose-headings:font-display prose-h1:text-4xl prose-a:text-blue-600">
```

The plugin adds modifier classes:
- `prose-headings:` — all heading levels.
- `prose-h1:`, `prose-h2:`, etc. — specific levels.
- `prose-p:` — paragraphs.
- `prose-ul:`, `prose-ol:`, `prose-li:` — lists.
- `prose-blockquote:`, `prose-code:`, `prose-pre:` — quotes, code.
- `prose-a:` — links.
- `prose-strong:`, `prose-em:` — emphasis.

Each can take any utility (color, font, size, etc.).

## Custom prose styles

For deep customization, configure in tailwind.config:

```js
plugins: [
  require('@tailwindcss/typography')({
    className: 'prose',
  }),
],
theme: {
  extend: {
    typography: ({ theme }) => ({
      DEFAULT: {
        css: {
          color: theme('colors.gray.700'),
          a: {
            color: theme('colors.brand.600'),
            '&:hover': { color: theme('colors.brand.800') },
            textDecoration: 'none',
            borderBottom: `1px solid ${theme('colors.brand.300')}`,
          },
          'h1, h2, h3': {
            fontFamily: theme('fontFamily.display'),
          },
        },
      },
    }),
  },
},
```

Now `prose` includes your custom defaults; you don't need to override per usage.

## Beyond prose — your own typography

For non-Markdown content (UI text), use Tailwind's font utilities directly:

```tsx
<h1 className="text-4xl font-bold tracking-tight text-gray-900">Title</h1>
<p className="text-lg leading-relaxed text-gray-600">Lead paragraph.</p>
<small className="text-sm text-gray-500">Footnote.</small>
```

Typography utilities:
- `text-{size}` — size from scale.
- `font-{weight}` — `font-light`, `font-normal`, `font-medium`, `font-semibold`, `font-bold`.
- `tracking-{value}` — letter-spacing. `tracking-tight`, `tracking-wide`.
- `leading-{value}` — line-height. `leading-tight`, `leading-relaxed`.
- `text-{align}` — `text-left`, `text-center`, `text-right`, `text-justify`.

Combine to express the design system's type hierarchy.

## Type scale

Decide a type scale and stick to it. Common pattern:

```tsx
// Display headings
text-5xl  // h1
text-4xl  // h2 (or h1 alt)
text-3xl  // h3

// Body
text-base  // default body
text-lg    // lead text
text-sm    // small text
text-xs    // micro text (footnotes, labels)

// Functional
text-sm font-medium  // form labels
```

Avoid creating ad-hoc sizes for each new component. The scale gives consistency; deviations should be deliberate.

## Tracking and leading

Default Tailwind type sizes ship with reasonable line-heights, but for display text adjust:

```tsx
<h1 className="text-6xl font-bold leading-tight tracking-tight">
```

- `tracking-tight` (-0.025em) for large headings — tightens letter-spacing for visual balance.
- `leading-tight` (1.25) for headings — reduces line gap.
- `leading-relaxed` (1.625) for body text — opens up reading flow.
- `leading-none` (1) for hero text — cinematic feel.

Small adjustments make a big visual difference.

## Font loading and FOUT

Web fonts can cause FOUT (flash of unstyled text) or FOIT (flash of invisible text) if not handled. With `next/font`:

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

<html className={inter.variable}>
```

```js
// tailwind.config.js
fontFamily: {
  sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
},
```

- `display: 'swap'` shows fallback immediately, swaps to Inter when loaded.
- Self-hosted (no third-party DNS hit).
- Subsets to characters you need.

Covered in detail in the Next.js course; same principles for any framework.

## Accessibility

Typography choices affect accessibility:

- **Minimum body size:** ~16px (Tailwind's `text-base`). Don't go smaller for primary content.
- **Line length:** ~50-75 characters per line. Tailwind's `prose` enforces this via max-width.
- **Line height:** generous for body (1.5+), tighter for headings.
- **Color contrast:** body text ≥4.5:1 against background.

`prose` handles most of these out of the box. For custom typography, verify with contrast checkers.

## Mistakes to avoid

- **Using prose for UI text.** Designed for rich text in articles, not buttons/forms/nav.
- **Ad-hoc type sizes everywhere.** Use the scale.
- **Forgetting dark mode invert.** Prose looks weird in dark mode without `dark:prose-invert`.
- **Inline custom typography for everything.** Define defaults in config.
- **Tiny body text.** Below 16px is hard to read on mobile.

## Summary

- `@tailwindcss/typography` provides `prose` class for rich-text content.
- Size variants: `prose-sm` through `prose-2xl`.
- Color variants and `dark:prose-invert` for theming.
- `prose-headings:`, `prose-a:`, etc. for per-element tweaks.
- Configure custom defaults in `theme.typography`.
- For UI text, use Tailwind's font utilities directly.
- Adjust tracking and leading for display headings.

Next: custom plugins and extensions.
