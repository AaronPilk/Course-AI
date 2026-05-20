---
module: 3
position: 3
title: "Fluid type and spacing"
objective: "clamp() and the Tailwind way."
estimated_minutes: 7
---

# Fluid type and spacing

## Breakpoint typography limitations

A common responsive type pattern:

```tsx
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
```

At each breakpoint, the type size jumps. Between breakpoints, nothing changes — so at 1023px the heading is 5xl, at 1024px it's 6xl. The jump is visible and feels rigid.

Fluid typography scales continuously based on viewport width. A heading at 800px viewport gets a calculated size between the 3xl and 6xl values, smoothly. No jumps.

## The clamp() function

CSS `clamp()` is the building block:

```css
font-size: clamp(MIN, PREFERRED, MAX);
```

- MIN: smallest allowed size.
- MAX: largest allowed size.
- PREFERRED: the calculated value (usually involving `vw`).

Example:

```css
font-size: clamp(1.5rem, 2.5vw, 4rem);
```

- Always at least 1.5rem (24px).
- Always at most 4rem (64px).
- Between, scales with viewport width (2.5% of viewport).

At 600px wide: 600 × 0.025 = 15px → falls below MIN, so 24px.
At 2000px wide: 2000 × 0.025 = 50px → between, so 50px.
At 3000px wide: 3000 × 0.025 = 75px → above MAX, so 64px.

The math gives smooth scaling between min and max.

## Fluid type in Tailwind

You can use arbitrary values directly:

```tsx
<h1 className="text-[clamp(1.5rem,2.5vw,4rem)]">
```

Or extend the theme:

```js
// tailwind.config.js
theme: {
  extend: {
    fontSize: {
      'fluid-base': 'clamp(1rem, 0.5vw + 0.875rem, 1.125rem)',
      'fluid-lg': 'clamp(1.125rem, 1vw + 1rem, 1.5rem)',
      'fluid-xl': 'clamp(1.25rem, 1.5vw + 1rem, 2rem)',
      'fluid-2xl': 'clamp(1.5rem, 2vw + 1rem, 3rem)',
      'fluid-display': 'clamp(2.5rem, 5vw + 1rem, 6rem)',
    },
  },
},
```

```tsx
<h1 className="text-fluid-display font-bold">
<p className="text-fluid-base">
```

Single class; smooth scaling; consistent across the design system.

## Computing the formula

The "PREFERRED" middle value combines a viewport unit and a base offset. The formula:

```
preferred = (slope * 100vw) + intercept
```

Where slope determines how fast it scales and intercept anchors a starting point.

To go from 16px at 320px viewport to 24px at 1280px viewport:

- slope = (24 - 16) / (1280 - 320) = 8/960 = 0.00833
- intercept = 16 - (0.00833 * 320) = 13.33px

Final:

```
font-size: clamp(1rem, 0.833vw + 13.33px, 1.5rem);
```

Tools like utopia.fyi or fluid.style generate these formulas for you. Pick two anchor points (mobile + desktop), they generate the clamp().

## Fluid spacing

Same pattern for spacing:

```js
spacing: {
  'fluid-2': 'clamp(0.5rem, 1vw, 1rem)',
  'fluid-4': 'clamp(1rem, 2vw, 2rem)',
  'fluid-8': 'clamp(2rem, 4vw, 4rem)',
  'fluid-16': 'clamp(4rem, 8vw, 8rem)',
},
```

```tsx
<section className="py-fluid-16 px-fluid-4">
```

Padding scales fluidly between mobile and desktop. No visible jumps at breakpoints.

## When fluid wins

**Hero sections.** Massive display text should scale with the viewport, not jump at fixed breakpoints.

**Heroes with long words.** A 6xl heading that overflows at 1023px and just barely fits at 1024px feels broken. Fluid scales just-fits at every width.

**Content sites.** Articles and marketing pages benefit from smooth typography — feels designed, not gridded.

**Wide range of viewports.** If your site is used on phones (375px) and ultra-wide monitors (3000px+), fluid is the only sane answer.

## When breakpoints still win

**App UI.** Predictable component sizing matters more than smooth scaling. A button shouldn't get bigger between breakpoints.

**Tight design constraints.** Sometimes the designer specified "16px on mobile, 18px on desktop" exactly. Fluid would violate the intent.

**Older browsers.** clamp() has broad support but if you must support IE11 (rare in 2026), fallback to fixed values.

Mix both: fluid for headings and section spacing, fixed for UI controls.

## Choosing min and max thoughtfully

The MIN should be readable on a phone. The MAX should not look comically large on a 4K monitor.

For body text: MIN 16px (don't go smaller), MAX maybe 18-20px (don't go larger).

For display headings: MIN ~30px (still impactful), MAX ~80px (cinematic but not absurd).

Test on real devices, not just by resizing in browser. Real phones and ultra-wide monitors look different than imaginary widths.

## Line-height with fluid

Line-height should also adjust:

```js
fontSize: {
  'fluid-display': [
    'clamp(2.5rem, 5vw + 1rem, 6rem)',
    { lineHeight: '1.1' },
  ],
},
```

The second argument to fontSize sets line-height (and optionally letter-spacing).

For display sizes, tight line-height (1.0 - 1.2) usually works. For body, generous (1.5 - 1.7).

## Fluid vs container query

Fluid scales with VIEWPORT. Container queries respond to CONTAINER. Different problems:

- **Fluid:** "make this heading scale smoothly as the browser gets wider."
- **Container query:** "make this card layout adapt based on the card's container width."

You can combine: container-query-driven layout with fluid type inside.

## Tools

- **utopia.fyi** — generates type and space scales with clamp() formulas based on min/max viewport and base sizes.
- **fluid.style** — similar.
- **min-max-value-interpolation** — for those who want the math.

Pick one; generate your scale; paste into tailwind.config.

## Animations and fluid

Fluid values transition smoothly because they're continuous. No "snap" at breakpoints.

For animations on fluid properties:

```tsx
<div className="text-fluid-xl transition-all">
```

The transition applies if other props animate; the fluid scaling itself doesn't need transition (it's continuous, not stepped).

## Mistakes to avoid

- **Fluid everywhere.** Some things should be fixed (UI controls).
- **Forgetting MIN and MAX.** Pure `vw` units = unreadable on phones, comically large on monitors.
- **Wrong slope.** Text scales too aggressively or barely at all.
- **No real-device testing.** Browser resize doesn't replicate phones.
- **Fluid font-size without fluid line-height.** Headings look cramped at large sizes.

## Summary

- `clamp(MIN, PREFERRED, MAX)` for fluid values.
- PREFERRED combines a `vw`-based slope and an offset.
- Use for headings, hero spacing, content site typography.
- Use breakpoints for app UI, controls, precise design needs.
- Define fluid sizes in tailwind.config under `fontSize` and `spacing`.
- Pair with sensible MIN (readability) and MAX (not absurd at huge viewports).
- Tools like utopia.fyi generate the formulas.

Next: dark mode patterns.
