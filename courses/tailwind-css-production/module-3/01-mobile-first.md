---
module: 3
position: 1
title: "Mobile-first breakpoints"
objective: "The right way to use sm: md: lg:."
estimated_minutes: 7
---

# Mobile-first breakpoints

## The mental model

Tailwind is mobile-first. Bare classes apply at all sizes — including mobile. Prefixed classes apply from that breakpoint and up.

```html
<div class="text-base md:text-lg lg:text-xl">
```

Read as:
- text-base — applies at all sizes (the mobile default).
- md:text-lg — applies from 768px and up.
- lg:text-xl — applies from 1024px and up.

This is the inverse of how some developers think ("desktop-first"). Mobile-first reads from small to large; you scale up. Internalize this and responsive design becomes natural.

## Default breakpoints

| Prefix | Min width | Common use |
|--------|-----------|------------|
| `sm:` | 640px | Large phones, small tablets portrait |
| `md:` | 768px | Tablets portrait, small laptops |
| `lg:` | 1024px | Tablets landscape, laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

No bare prefix means "always" (mobile and up).

## Reading responsive classes

```html
<div class="flex flex-col md:flex-row gap-4 md:gap-8">
```

- Default (mobile): `flex flex-col gap-4` — vertical stack with 1rem gap.
- From md (768px): `flex flex-row gap-8` — horizontal layout with 2rem gap.

A useful trick when reading: blur out everything except the bare classes — that's the mobile view. Then add `md:` classes mentally for the tablet view.

## Common patterns

**Grid responsive:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

1 column mobile, 2 tablet, 3 desktop. The single most common responsive pattern.

**Hide on small, show on large:**

```tsx
<aside className="hidden lg:block">Desktop-only sidebar</aside>
<nav className="lg:hidden">Mobile nav</nav>
```

**Stack mobile, side-by-side desktop:**

```tsx
<div className="flex flex-col md:flex-row gap-4">
  <main className="flex-1">{content}</main>
  <aside className="w-full md:w-64">{sidebar}</aside>
</div>
```

**Responsive text:**

```tsx
<h1 className="text-3xl md:text-5xl lg:text-6xl font-bold">
```

Bigger headings on bigger screens. Bare = mobile-friendly size; ramps up.

## max- modifiers

Modern Tailwind (3.4+) added `max-` modifiers for descending breakpoints:

```html
<div class="block max-md:hidden">  <!-- visible from md up; hidden below md -->
<div class="text-lg max-sm:text-sm">  <!-- normal text; smaller below sm -->
```

Use sparingly. Mobile-first patterns are usually cleaner. Reach for `max-` when expressing the mobile-first equivalent would require many breakpoints stacked.

## min- modifiers (rarely useful)

Tailwind also supports `min-[600px]:` for arbitrary breakpoints:

```html
<div class="min-[900px]:flex">  <!-- only flex from 900px up -->
```

Useful for one-off custom breakpoints. For consistent use, add a new breakpoint to the config instead.

## Container

The `container` utility sets max-width based on breakpoint:

```tsx
<div className="container mx-auto px-4">
  {/* Centered, breakpoint-aware max-width */}
</div>
```

Defaults:
- Below sm: full width.
- sm: max-width 640px.
- md: 768px.
- lg: 1024px.
- ...

Customize in tailwind.config:

```js
container: {
  center: true,           // mx-auto
  padding: '1rem',        // px-4
  screens: {              // optional override
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',     // narrower than default
  },
},
```

For most apps, a custom layout component is more flexible than `container`. But it's there for quick prototyping.

## Custom breakpoints

Add breakpoints in tailwind.config:

```js
screens: {
  // Override defaults — but keep all defaults if extending
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
  '3xl': '1920px',     // ultra-wide
  'mobile': {'max': '767px'},  // legacy max-width style
},
```

Custom breakpoints fit your design's actual breakpoints, not the defaults.

For mobile-first sites where Tailwind's defaults work, no customization needed.

## The orientation problem

Tailwind's breakpoints are width-based, not device-type-based. A tablet in landscape can be 1024px — hits `lg:`, which you might have designed for desktop. Test your actual breakpoints on real devices.

For orientation:

```tsx
<div className="landscape:flex-row portrait:flex-col">
```

`landscape:` and `portrait:` modifiers respond to viewport orientation. Useful for mobile-specific layouts.

## Responsive design without classes

Some design needs are easier with CSS Grid or Flexbox without breakpoints:

```tsx
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
  {items.map(...)}
</div>
```

Auto-fit/auto-fill with `minmax()` creates a responsive grid that doesn't need breakpoints — columns fit as space allows. Cleaner than `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` for some layouts.

Same with `flex-wrap`:

```tsx
<div className="flex flex-wrap gap-4">
  {items.map(item => <Card className="w-full sm:w-48 md:w-64" key={item.id} {...item} />)}
</div>
```

Cards wrap naturally; no explicit grid breakpoints needed.

## Avoiding breakpoint hell

A common smell: 5+ breakpoint modifiers on one element:

```tsx
<div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
```

Each step looks fine but the combination is over-engineered. Either:

1. **Define a fluid type approach** (covered Module 3 Lesson 3 — clamp() and fluid type).
2. **Reduce to 2-3 breakpoints** that actually matter.
3. **Extract to a component** with `size="sm" | "md" | "lg"` props.

Most designs only really change at 2-3 breakpoints. The rest is noise.

## Mobile-first vs desktop-first

Why mobile-first wins:

- **Better defaults.** Mobile screens are smaller; designing mobile first forces you to consider what's essential.
- **Performance.** Mobile users on slow connections; lightweight is the right default.
- **Accessibility.** Touch targets, font sizes — mobile constraints overlap with accessibility constraints.
- **Tailwind's grain.** The framework was designed for this; fighting it adds friction.

Even if your traffic skews desktop, designing mobile-first usually produces a better product.

## Common gotchas

**Forgetting the bare class.** `md:flex` alone has no behavior below md (defaults to `block` for div). Always include the mobile default explicitly or rely on element defaults intentionally.

**Mixing prefix orders without intent.** `md:lg:text-xl` is the same as `lg:md:text-xl` — but readers expect a consistent order. Pick one (state/mode then breakpoint, or breakpoint then state) and stick to it.

**Testing only at breakpoints.** Resize the browser through every width between breakpoints — does anything look broken? Most breakpoint bugs hide between named sizes.

**Designing for one device.** "Looks good on my MacBook" isn't enough. Test on phone, tablet, laptop, large desktop. Hand the site to a non-developer with a different device.

## Mistakes to avoid

- **Desktop-first patterns.** Fight the framework.
- **Too many breakpoint modifiers per element.** Re-think with fluid or fewer breakpoints.
- **Testing only at exact breakpoint widths.** Bugs hide in between.
- **Custom breakpoints that don't match the design.** Source of off-by-one bugs.
- **Forgetting bare default classes.** Unexpected behavior below first breakpoint.

## Summary

- Tailwind is mobile-first: bare classes apply everywhere; prefixed classes from that breakpoint up.
- Default breakpoints: sm (640), md (768), lg (1024), xl (1280), 2xl (1536).
- Read responsive classes as scaling up from mobile baseline.
- `container` for quick max-width layouts.
- Custom breakpoints when defaults don't match your design.
- Auto-fit grids and flex-wrap for breakpoint-less responsiveness.
- Test at every width, not just at breakpoints.

Next: container queries.
