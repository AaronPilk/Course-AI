---
module: 5
position: 4
title: "Migrating to Tailwind from legacy CSS"
objective: "Incremental adoption that works."
estimated_minutes: 7
---

# Migrating to Tailwind from legacy CSS

## The migration challenge

You have an existing codebase with CSS — maybe Bootstrap, CSS Modules, styled-components, or hand-rolled SCSS. The team wants to adopt Tailwind. Now what?

Big-bang rewrites usually fail. Incremental migration over months works. The goal is to coexist Tailwind alongside existing CSS until you've moved everything, then remove the old.

## Start with new code

The simplest migration path: write all NEW components with Tailwind; don't touch existing code yet.

- New features → Tailwind.
- Bug fixes → Tailwind (small scope; localized changes).
- Existing pages → leave alone.

Over months, the proportion shifts. New code is the easy lift; you build up Tailwind muscle memory; existing code converts when feature work touches it.

After 6-12 months, most code is Tailwind; the old CSS is a shrinking remainder. At some point a focused sprint cleans up the rest.

## Setup with existing CSS

Install Tailwind alongside your existing CSS:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Add Tailwind to your CSS:

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Your existing CSS continues here */
@import './legacy-styles.css';
```

Order matters. Tailwind's `@tailwind base` includes a CSS reset (preflight) that may conflict with existing styles. Two options:

**Option A: Keep both resets.** Tailwind's preflight loads first, then your legacy reset overrides where they conflict.

**Option B: Disable Tailwind's preflight.**

```js
// tailwind.config.js
corePlugins: {
  preflight: false,
},
```

Now Tailwind's reset doesn't apply; your existing reset stays. Recommended for established codebases — less surprise.

You can re-enable preflight later when migrating fully to Tailwind.

## Component-by-component migration

Pick a leaf component (no children using CSS classes) and migrate:

**Before:**
```tsx
// components/Button.tsx
import styles from './Button.module.css';

export function Button({ variant, children }) {
  return (
    <button className={`${styles.btn} ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

```css
/* Button.module.css */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
}
.primary {
  background: #2563eb;
  color: white;
}
.primary:hover {
  background: #1d4ed8;
}
```

**After:**
```tsx
import { cn } from '@/lib/utils';

export function Button({ variant, children, className, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium transition',
        variant === 'primary' && 'bg-blue-600 hover:bg-blue-700 text-white',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

Delete the .module.css file. Done.

Process for each component:

1. Open the component file.
2. Open its CSS file alongside.
3. Translate each CSS rule to the equivalent Tailwind utility.
4. Update the JSX to use the utilities.
5. Delete the CSS file (if used only here) or remove the unused rules.
6. Test.

Set a goal — "5 components per sprint" — and progress accumulates.

## Translating common patterns

A reference of common CSS → Tailwind translations:

```css
padding: 1rem 2rem;          → px-8 py-4
margin: 0 auto;              → mx-auto
display: flex;
align-items: center;
justify-content: space-between;  → flex items-center justify-between
background: #2563eb;         → bg-blue-600
color: white;                → text-white
border-radius: 0.5rem;       → rounded-lg
box-shadow: 0 4px 6px rgba(...); → shadow-md
font-size: 1.125rem;         → text-lg
font-weight: 600;            → font-semibold
line-height: 1.5;            → leading-relaxed (or leading-6)
position: absolute;
top: 0; left: 0;             → absolute top-0 left-0
width: 100%;                 → w-full
overflow: hidden;            → overflow-hidden
cursor: pointer;             → cursor-pointer
transition: all 0.2s;        → transition duration-200
```

Most CSS values map to Tailwind utilities directly. For arbitrary values:

```css
padding: 13px;               → p-[13px]
background: #FF5733;         → bg-[#FF5733]
```

But arbitrary values are a smell — usually you want to add the value to your scale (Module 2 Lesson 1).

## Migration order — which to convert first

Strategies:

**Bottom-up (leaf components first).**
Start with the simplest components — buttons, badges, basic UI primitives. No nested dependencies; easy to test in isolation.

**Top-down (page templates first).**
Convert the page layout; gradually convert children. Useful when the layout is reusable.

**Feature-by-feature.**
Pick one feature (auth, dashboard, etc.) and convert everything within it. Other features stay unchanged. Easier to manage in PRs.

**By visibility.**
Marketing pages first (high visibility, less risky), app UI second, internal tools last.

Bottom-up is usually safest. Each component migration is small; tests catch regressions; team builds Tailwind familiarity.

## Mixing during migration

You'll temporarily have:

- Some components on Tailwind.
- Some on CSS Modules / styled-components / etc.
- Some files importing both.

That's fine. Don't try to be pure during migration; pragmatism wins.

When a converted component is used by an unconverted parent:

```tsx
// Parent (still CSS Modules):
import styles from './ParentPage.module.css';
import { Button } from '@/components/Button'; // already converted

return (
  <div className={styles.container}>
    <Button variant="primary">Save</Button>  {/* uses Tailwind internally */}
  </div>
);
```

Works fine. The button's Tailwind classes don't conflict with the parent's CSS Module classes.

## Removing dependencies

After all components are migrated:

```bash
npm uninstall styled-components  # or whatever you migrated from
```

Delete:

- `*.module.css` files.
- styled-components or Emotion config.
- Global stylesheets that are now in Tailwind.
- Sass build pipeline if you used Sass.

Run the build; the bundle should be significantly smaller. CSS-in-JS deps especially shed weight.

## Migrating from Bootstrap

Bootstrap uses utility-like classes (`.text-center`, `.flex`, `.mt-4`) similar to Tailwind. Migration is mechanical:

- `.text-center` → `text-center` (same).
- `.btn .btn-primary` → custom Button component.
- `.row .col-md-6` → `grid grid-cols-1 md:grid-cols-2`.
- `.container` → Tailwind `container` (or custom max-width).

Most Bootstrap utilities have direct Tailwind equivalents. Components (Modal, Carousel, etc.) need to be rebuilt — usually with shadcn or hand-rolled.

The migration is straightforward but tedious; each Bootstrap class needs translation.

## Migrating from CSS-in-JS

styled-components and Emotion migrations are more invasive — the component file structure changes:

**Before:**
```tsx
import styled from 'styled-components';

const StyledButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.primary ? '#2563eb' : '#f3f4f6'};
  color: ${props => props.primary ? 'white' : 'black'};
`;

<StyledButton primary>Save</StyledButton>
```

**After:**
```tsx
import { cn } from '@/lib/utils';

<button
  className={cn(
    'px-4 py-2',
    primary ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black'
  )}
>
  Save
</button>
```

The styled-components variant turns into a regular React component with className. Migrate one styled component at a time; test; commit; repeat.

## Migrating from Sass

Sass features that don't have Tailwind equivalents:

- **Variables** — replace with tailwind.config or CSS variables.
- **Nested rules** — flatten via Tailwind classes; no nesting needed.
- **Mixins** — usually become components or cva variants.
- **@extend** — same approach as @apply; use components.
- **Functions** — Tailwind utilities are pre-computed; functions usually aren't needed.

After migration, you don't need a Sass compile step; native CSS + Tailwind is enough.

## When migration takes too long

If after 6 months you're still 40% migrated and progress stalled:

- **Team commitment dropped.** Re-discuss whether to continue.
- **No measurable benefit yet.** Did Tailwind actually solve your pain?
- **Sprint allocations don't include migration.** Make it explicit work.

Sometimes the right answer is "stop migrating; accept the hybrid state." Two systems working together isn't ideal but better than half-migrated chaos.

## Mistakes to avoid

- **Big-bang rewrite.** Almost always fails.
- **Migrating during high-stakes work.** Bug risk; rollback risk.
- **No tests.** Migration changes appearance; regressions slip through without visual tests.
- **Not deleting old CSS.** Bundle grows; confusion grows.
- **Mixing during migration but treating it as wrong.** It's fine; pragmatism wins.
- **Forgetting to disable preflight if it conflicts.** Style surprises.

## Summary

- Don't rewrite in big bang; migrate incrementally.
- New code → Tailwind; existing code → leave or convert when touched.
- Disable Tailwind's preflight if it conflicts with legacy reset.
- Component-by-component, leaf-first, is usually safest.
- Bootstrap is mechanical; CSS-in-JS is invasive.
- Delete deps and CSS files after migration to capture savings.
- Sometimes accepting the hybrid state is the right call.

Course complete.
