---
module: 5
position: 2
title: "Animation and transitions"
objective: "From hover effects to Framer Motion."
estimated_minutes: 7
---

# Animation and transitions

## Transitions vs animations

Tailwind splits motion into two categories:

- **Transitions** — smooth changes between two states (default → hover, closed → open).
- **Animations** — repeating or scripted sequences (loading spinners, entrance effects).

Both are CSS-based when possible. For complex orchestration, JavaScript libraries (Framer Motion, motion.dev) take over.

## Basic transitions

The simplest case — smooth a hover effect:

```tsx
<button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
  Hover me
</button>
```

- `transition-colors` — animate color changes (bg, text, border).
- `duration-200` — 200ms.
- `hover:bg-blue-700` — the new state.

Without `transition-colors`, the hover state snaps instantly. With it, the change is smooth.

## What to transition

```tsx
transition-all          // all CSS properties (avoid; performance)
transition-colors       // background, border, color, fill, stroke
transition-opacity      // opacity
transition-shadow       // box-shadow
transition-transform    // transform (scale, rotate, translate)
transition             // shortcut for colors + opacity + transform + shadow
```

For most cases, `transition` (shorthand) is right. For specific needs, target what changes (better performance than `transition-all`).

## Timing functions

```tsx
ease-linear      // constant speed
ease-in          // slow start, fast end
ease-out         // fast start, slow end (default for UI)
ease-in-out      // slow ends, fast middle
```

`ease-out` is the most common for UI — interactions feel responsive (fast initial reaction) then settle. `ease-in-out` works for hover effects. `ease-linear` for things that shouldn't accelerate.

## Duration

```tsx
duration-75    // 75ms - barely visible
duration-150   // 150ms - quick
duration-200   // 200ms - common UI default
duration-300   // 300ms - noticeable
duration-500   // 500ms - slow
duration-700   // 700ms - very slow
duration-1000  // 1s - feels long
```

UI sweet spot: 150-300ms for hover effects, 300-500ms for entrance/exit animations. Faster feels instant; slower feels sluggish.

## Delays

```tsx
delay-100     // wait 100ms before transition
delay-200
```

Used for staggered animations or to prevent jitter:

```tsx
{items.map((item, i) => (
  <div className={`opacity-0 animate-fade-in`} style={{ animationDelay: `${i * 50}ms` }}>
```

Inline `style` for dynamic delays; Tailwind's preset `delay-*` for fixed values.

## Hover animations

Smooth transform on hover:

```tsx
<div className="transition-transform hover:scale-105 hover:-translate-y-1">
```

The card lifts slightly on hover. Subtle but adds polish.

```tsx
<div className="transition hover:shadow-lg hover:scale-[1.02]">
```

Cards with hover lift are common; combine shadow + scale for a tactile feel.

## Group animations

For parent-triggered child animations:

```tsx
<a className="group block">
  <h3 className="transition-colors group-hover:text-blue-500">Title</h3>
  <p className="transition-opacity group-hover:opacity-100 opacity-70">Description</p>
  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
</a>
```

Hovering the parent triggers smooth changes on all children. The arrow nudges right; opacity increases; title color changes — all coordinated.

## Tailwind's built-in animations

```tsx
animate-spin       // continuous rotation (loaders)
animate-ping       // ripple effect
animate-pulse      // breathing effect (skeleton loaders)
animate-bounce     // continuous bounce
```

The most common:

```tsx
<div className="animate-pulse">
  {/* skeleton placeholder */}
  <div className="h-4 bg-gray-200 rounded mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
</div>
```

`animate-pulse` for loading states; `animate-spin` for spinners (`<svg className="animate-spin" />`).

## Custom animations

Define in tailwind.config:

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
      'shimmer': {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
    },
    animation: {
      'fade-in': 'fade-in 0.3s ease-out',
      'slide-up': 'slide-up 0.4s ease-out',
      'shimmer': 'shimmer 2s linear infinite',
    },
  },
},
```

Use as utilities:

```tsx
<div className="animate-fade-in">Appears smoothly</div>
<div className="animate-slide-up">Slides up while appearing</div>
```

Custom animations bake brand-specific motion into the design system.

## tailwindcss-animate

The `tailwindcss-animate` plugin (used by shadcn/ui) adds pre-built animations:

```bash
npm install -D tailwindcss-animate
```

```js
plugins: [require('tailwindcss-animate')],
```

Adds utilities like `animate-in`, `fade-in`, `slide-in-from-top`, `zoom-in-50`, etc. with durations.

```tsx
<div className="animate-in fade-in zoom-in-95 duration-300">
```

Convenient for common entrance animations (modals, toasts, dropdowns).

## When to use Framer Motion / motion.dev

Tailwind transitions handle simple cases well. For complex animations:

- **Spring physics.** Realistic bouncy motion.
- **Drag and gestures.** Touch-aware interactions.
- **Layout animations.** Smoothly animating between layouts.
- **Orchestrated sequences.** Coordinated multi-element animations.
- **Exit animations.** Animating components OUT (Tailwind transitions only handle IN smoothly).

For these, Framer Motion (recently rebranded as motion.dev) is the standard:

```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

For AnimatePresence (handling exit animations):

```tsx
import { AnimatePresence, motion } from 'motion/react';

<AnimatePresence>
  {show && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Modal content
    </motion.div>
  )}
</AnimatePresence>
```

Combine with Tailwind for static styling + motion for dynamic motion.

## Performance considerations

CSS animations are GPU-accelerated when animating:

- `transform` (translate, scale, rotate).
- `opacity`.

Other properties (width, height, color, top/left) trigger layout/paint — slower. Stick to transform + opacity for smooth 60fps animations.

```tsx
<!-- ✅ GPU-friendly -->
<div className="transition-transform hover:translate-y-1 hover:scale-105">

<!-- ❌ Layout-heavy -->
<div className="transition-all hover:py-4 hover:px-8">  <!-- triggers layout -->
```

For complex hover effects, restructure to use transforms.

## Reduced motion

Respect users with `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Or per-animation:

```tsx
<div className="motion-safe:animate-bounce">
```

`motion-safe:` applies only when user doesn't have reduced motion preference. `motion-reduce:` for explicit overrides in reduced-motion mode.

For accessibility, respect this preference. Some users have vestibular disorders triggered by motion.

## Animation accessibility

Beyond reduced motion:

- **Don't auto-play essential information animations.** Make them on-demand.
- **No flashing > 3 times/second.** Triggers epilepsy.
- **Pause/stop controls** for long-running animations.
- **Animations don't replace content** — content is readable without them.

WCAG 2.1 has specific motion guidelines worth reading.

## Mistakes to avoid

- **transition-all everywhere.** Wasteful; use targeted properties.
- **Animating width/height for hover effects.** Triggers layout; use transform.
- **No prefers-reduced-motion respect.** Inaccessible.
- **Too-slow animations.** UI feels sluggish over 300ms for simple effects.
- **Too-fast animations.** Under 100ms feels glitchy.
- **Bouncy springy effects on app UI.** Save for delightful moments; not for utility actions.

## Summary

- Transitions for state changes (hover, open/closed).
- Animations for repeating effects (spinners, pulses).
- `transition` shorthand for common cases; targeted for performance.
- Custom animations via keyframes in tailwind.config.
- tailwindcss-animate plugin for pre-built entrance animations.
- Framer Motion (motion.dev) for complex/orchestrated motion.
- Use transform + opacity for GPU-accelerated smooth motion.
- Respect prefers-reduced-motion.

Next: common pitfalls.
