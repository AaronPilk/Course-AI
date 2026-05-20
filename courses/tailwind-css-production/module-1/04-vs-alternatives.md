---
module: 1
position: 4
title: "Tailwind vs CSS-in-JS vs CSS Modules"
objective: "The 2026 landscape."
estimated_minutes: 7
---

# Tailwind vs CSS-in-JS vs CSS Modules

## The styling debate, settled

For most of the 2010s, the React community thrashed through styling approaches: plain CSS, BEM, CSS Modules, styled-components, Emotion, vanilla-extract, CSS-in-JS, utility frameworks. By 2026, the dust mostly settled. Tailwind dominates new project starts. CSS Modules remain solid for teams that prefer them. CSS-in-JS shrank significantly.

This lesson explains why, and where the alternatives still fit.

## CSS Modules

CSS files where class names are locally scoped:

```css
/* Button.module.css */
.button {
  padding: 0.5rem 1rem;
  background: blue;
}
.primary {
  background: var(--brand-blue);
}
```

```tsx
import styles from './Button.module.css';

<button className={`${styles.button} ${styles.primary}`}>Save</button>
```

Behind the scenes, classes are hashed (`.button_abc123`) so they don't collide. You get scoped CSS without runtime overhead.

**Wins:**
- Familiar CSS syntax.
- Static (no runtime JS for styling).
- Works in any framework.
- Scoping prevents collisions.

**Drawbacks:**
- Two files per component (component + .module.css).
- Naming decisions persist.
- No built-in design system constraints — you can write anything.
- Refactoring still requires mental file-jumping.

CSS Modules are fine. Tailwind beats them on consistency and developer ergonomics for most teams. CSS Modules win when your team is uncomfortable with utility classes or you're integrating with a design system that's already CSS-based.

## CSS-in-JS (styled-components, Emotion)

JavaScript that produces CSS at runtime or build time:

```tsx
const Button = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.primary ? 'blue' : 'gray'};
  &:hover {
    opacity: 0.9;
  }
`;

<Button primary>Save</Button>
```

CSS-in-JS dominated 2017-2022. It has been declining since.

**Wins (historically):**
- Props-driven dynamic styling.
- Co-located with component.
- Powerful theming via context.

**Drawbacks:**
- **Runtime cost.** Many libraries inject styles at render; large surface for perf issues.
- **SSR complications.** Generating styles server-side adds complexity; React Server Components don't play well with most CSS-in-JS libraries.
- **Bundle size.** Styled-components is 12-15KB.
- **No build-time guarantees.** Errors in template literals only surface at runtime.

The big shift: **React Server Components don't work well with most CSS-in-JS libraries.** Libraries like styled-components require a runtime that doesn't fit RSC's serialization model. As Next.js App Router became dominant, CSS-in-JS lost ground rapidly.

Build-time CSS-in-JS (vanilla-extract, Linaria, Panda CSS) sidesteps some issues by generating static CSS. These remain viable; mainstream usage is shifting to Tailwind anyway.

## Plain CSS / Sass

Still works. Still fine for small projects, marketing sites, content-heavy work where templates dominate.

For app UI with many components and complex state-driven styling, Tailwind's developer ergonomics typically win.

## Tailwind's wins

Why Tailwind ate so much of the market:

**1. Design-system enforcement.** The constrained scale keeps designs consistent. CSS Modules and CSS-in-JS let you write arbitrary values; entropy creeps in.

**2. Zero-runtime.** Generated static CSS; no JS runtime cost.

**3. SSR/RSC friendly.** Static CSS works perfectly with server-side rendering.

**4. No naming.** A massive cognitive savings.

**5. Refactor speed.** Edit JSX directly; no class hunting.

**6. Component ecosystem.** shadcn/ui, headless UI libraries, all built on Tailwind.

The combination is hard to beat for app development.

## Where Tailwind doesn't win

**Email templates.** Most email clients require inline styles and don't support modern CSS. Use specialized email frameworks (MJML, Maizzle) or inline CSS.

**Highly custom design systems.** If your design system has primitives Tailwind's defaults can't easily express (e.g., a "vibe" scale rather than discrete sizes), a custom CSS architecture might fit better. Tailwind can be configured deeply, but at some point the config rewrites consume the win.

**Print stylesheets.** Tailwind supports print modifiers but for complex print layouts, hand-written CSS sometimes wins.

**Strictly content-driven sites.** A blog where authors write Markdown and a CMS injects styles — Tailwind helps less than just a clean typography pass.

## Hybrid approaches

You can mix:

- **Tailwind + CSS Modules.** Tailwind for most styling; CSS Modules for complex animations or print-specific styles.
- **Tailwind + plain CSS.** Tailwind for components; a global stylesheet for things that don't map to utilities (CSS variables, keyframe animations, third-party overrides).
- **Tailwind + build-time CSS-in-JS.** Niche; usually one or the other.

Most projects benefit from picking one and sticking with it. Hybrid invites confusion about where styles live.

## Migration paths

**From CSS Modules → Tailwind:** Pick a component; convert. Both can coexist; migrate at your pace.

**From CSS-in-JS → Tailwind:** More invasive. The component file changes significantly. Plan a feature-by-feature migration. Build a `migrateComponent.md` checklist; rewrite over a few sprints.

**From plain CSS → Tailwind:** Component by component. Strip the equivalent CSS rules as you go. Keep global resets and animations in plain CSS for now.

In all cases, don't try to rewrite everything in one PR. Incremental migration over months is realistic; big-bang is not.

## When to NOT switch

If your team is productive and the existing CSS works:

- Don't migrate because of fashion.
- Don't migrate without team buy-in.
- Don't migrate if you can't dedicate time to it.

A working CSS Modules codebase is better than a half-migrated one with two systems fighting.

Switch when there's a real pain point: design inconsistency, refactoring friction, slow style iteration, team frustration. Solve that problem; don't chase the latest.

## What about Tailwind v4?

Tailwind v4 (released 2024-2025) introduced significant changes: CSS-first config, automatic content scanning, faster compilation. The principles in this course apply to both v3 and v4 with minor syntax differences.

If you're starting fresh: use v4. If you have a v3 codebase: migration is straightforward but not urgent.

## Decision framework

For new projects in 2026:

- **App with many components, want design consistency:** Tailwind.
- **Content site with simple styling needs:** Plain CSS / Tailwind, either works.
- **Existing CSS Modules codebase, team productive:** stay with CSS Modules.
- **Existing CSS-in-JS codebase, considering React Server Components:** plan a Tailwind migration.
- **Mobile / React Native:** different ecosystem; NativeWind brings Tailwind to React Native if desired.

Tailwind has become the safe default. The alternatives have specific niches.

## What this course assumes

The rest of this course covers Tailwind in production: theming, responsive design, component patterns, performance. We won't re-litigate the styling debate in every lesson — assume you've picked Tailwind (or are evaluating it seriously) and want to use it well.

## Mistakes to avoid

- **Re-litigating styling weekly.** Pick one; commit.
- **Mixing approaches without intent.** Confusion grows.
- **CSS-in-JS in Next.js App Router with RSC.** Doesn't fit; will fight you.
- **Hand-writing CSS for things Tailwind already does.** Reinventing the scale.

## Summary

- Tailwind dominates new projects in 2026.
- CSS Modules remain solid for teams that prefer them.
- CSS-in-JS declined heavily; doesn't fit RSC well.
- Tailwind wins on design-system enforcement, zero-runtime, SSR friendliness, naming-free.
- Alternatives still fit specific niches (email, print, content sites).
- Migrate incrementally if at all; don't chase fashion.

Next module: theming and design tokens.
