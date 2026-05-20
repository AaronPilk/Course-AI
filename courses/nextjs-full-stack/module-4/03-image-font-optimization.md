---
module: 4
position: 3
title: "Image and font optimization"
objective: "next/image, next/font, and edge delivery."
estimated_minutes: 7
---

# Image and font optimization

## Why images and fonts matter

Images and fonts dominate page weight and Core Web Vitals. A homepage with three unoptimized hero images and unhosted Google Fonts often loads 2-5MB on first visit; the same page with optimized images and self-hosted fonts loads under 500KB.

Next.js provides first-class tooling for both: `next/image` for automatic image optimization and `next/font` for self-hosted, performance-optimized typography.

## next/image basics

```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority
/>
```

`next/image` automatically:

- Serves modern formats (WebP, AVIF) to supporting browsers.
- Generates and serves multiple resolutions (1x, 2x, 3x for retina).
- Lazy-loads off-screen images by default.
- Sets `width` and `height` to prevent layout shift (CLS).
- Caches optimized variants at the CDN.

The browser receives a perfectly-sized, properly-compressed image.

## Required props

`next/image` requires either:

- **Explicit `width` and `height`** — for known dimensions, prevents CLS.
- **`fill`** — image fills its container; container needs `position: relative` and dimensions.

```tsx
{/* Explicit size */}
<Image src="/hero.jpg" alt="..." width={1200} height={630} />

{/* Fill container */}
<div style={{ position: 'relative', width: '100%', height: '400px' }}>
  <Image src="/hero.jpg" alt="..." fill style={{ objectFit: 'cover' }} />
</div>
```

Forgetting both produces a build error. The constraint prevents the most common image performance bug (no dimensions = layout shift).

## priority for above-the-fold images

Above-the-fold images should opt out of lazy loading:

```tsx
<Image src="/hero.jpg" alt="..." width={1200} height={630} priority />
```

`priority` pre-loads the image and disables lazy-loading. Use on hero images, logos, anything visible immediately.

Without `priority`, the image lazy-loads after page render — fine for below-the-fold but bad LCP for hero images.

## External images

For images hosted elsewhere (CMS, S3, image services), configure allowed origins in `next.config.js`:

```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
    ],
  },
};
```

Then use the full URL:

```tsx
<Image src="https://cdn.example.com/hero.jpg" alt="..." width={1200} height={630} />
```

Next.js fetches the source, optimizes, and serves the optimized version. The CDN never sees the optimized request (caching at Next.js / Vercel layer).

## Sizes for responsive images

For responsive images that change size based on viewport:

```tsx
<Image
  src="/hero.jpg"
  alt="..."
  width={1200}
  height={630}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

`sizes` tells the browser which resolution to fetch based on viewport. Without it, the browser may fetch a larger image than needed.

For full-width images:
```tsx
sizes="100vw"
```

For 50% width above 768px, full width below:
```tsx
sizes="(max-width: 768px) 100vw, 50vw"
```

Critical for mobile performance — phones shouldn't download desktop-resolution images.

## Placeholders

Show a blurred placeholder while loading:

```tsx
<Image
  src="/hero.jpg"
  alt="..."
  width={1200}
  height={630}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..." // tiny inline blur
/>
```

For statically imported images, Next.js generates blur placeholders automatically:

```tsx
import heroImage from './hero.jpg';

<Image src={heroImage} alt="..." placeholder="blur" />
```

The build process creates a tiny blurred version embedded in the page. The user sees a smooth blur-to-sharp transition.

## next/font basics

Replace `<link>` to Google Fonts with `next/font`:

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

Behind the scenes:

- Downloads the font at build time.
- Self-hosts on your domain — no third-party requests.
- Inlines critical font CSS to prevent flash of unstyled text.
- Subsets fonts to only the characters used (smaller bundles).
- Pre-loads automatically.

Result: zero external font requests, zero layout shift from font loading, optimal performance.

## Multiple fonts

```tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const robotoMono = Roboto_Mono({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Use CSS variables for fonts that should be available class-by-class:

```tsx
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
```

```css
.heading {
  font-family: var(--font-inter), system-ui, sans-serif;
}
```

## Local fonts

For custom fonts hosted by you:

```tsx
import localFont from 'next/font/local';

const myFont = localFont({
  src: '../assets/fonts/my-font.woff2',
  display: 'swap',
});
```

Same optimizations as Google fonts; self-hosted; fully optimized.

## Font display strategies

```tsx
const inter = Inter({ subsets: ['latin'], display: 'swap' });
```

- **`'swap'`** — fall back to system font until web font loads, then swap. Default; no invisible text (FOIT).
- **`'block'`** — invisible text briefly until web font loads.
- **`'fallback'`** — short block, then swap, then permanent fallback if not loaded fast.
- **`'optional'`** — no waiting; if font isn't immediately ready, use fallback permanently for this load.

`'swap'` is the sane default. Use `'optional'` for non-critical decorative fonts.

## Subsetting

Loading only the character set you need:

```tsx
const inter = Inter({
  subsets: ['latin'],  // English only
});

// vs:
const inter = Inter({
  subsets: ['latin', 'cyrillic'],  // For multi-language sites
});
```

Smaller subsets = smaller font files. Default to `latin` for English sites; add more only when needed.

## Font weight optimization

Load only the weights you use:

```tsx
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],  // Regular + semibold
});
```

Default loads all weights; usually you only use 2-3. Specifying weights trims the bundle significantly.

For variable fonts (one file, all weights interpolated):

```tsx
const inter = Inter({
  subsets: ['latin'],
  // No weight specified — uses variable font automatically.
});
```

Variable fonts often beat multi-file weight loading on total size for sites using many weights.

## Image and font in Core Web Vitals

These directly impact:

- **LCP (Largest Contentful Paint):** the hero image is usually the LCP. `priority` + proper sizing + WebP/AVIF reduces it dramatically.
- **CLS (Cumulative Layout Shift):** missing image dimensions or font loading without `display: swap` cause layout shift.
- **FID/INP (interaction responsiveness):** unrelated, but huge image bundles delay interactivity.

Get image + font right and you're 80% of the way to good Web Vitals.

## Common mistakes

- **`<img>` tag instead of `<Image>`.** Loses all the optimization.
- **No width/height (and no fill).** Build fails or causes CLS.
- **No `priority` on hero image.** Slow LCP.
- **No `sizes` on responsive images.** Mobile downloads desktop-size images.
- **Google Fonts via `<link>`.** Third-party request; layout shift.
- **All Google Fonts weights.** Bundle bloat.

## Summary

- `next/image` automates format conversion, resizing, lazy-loading, dimensions.
- `priority` for above-the-fold images.
- `sizes` for responsive images.
- External images need `remotePatterns` config.
- `next/font` self-hosts and optimizes fonts; replaces Google Fonts `<link>`.
- Subset and weight-restrict for smaller font bundles.
- These two unlock most of Core Web Vitals.

Next: performance debugging.
