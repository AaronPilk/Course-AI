---
module: 4
position: 3
title: "tailwind-merge and conditional classes"
objective: "Avoid duplicate / conflicting utilities."
estimated_minutes: 7
---

# tailwind-merge and conditional classes

## The conflict problem

Tailwind utilities are CSS classes. When two conflicting utilities appear in a className, which one wins?

```tsx
<button className="px-4 px-8">
```

Both `px-4` and `px-8` ship in the final CSS at the SAME specificity. The CSS source order — not the order in the className string — decides which wins. With Tailwind's generated output, this can be unpredictable.

In practice: when you pass `className` to a component that already has internal classes, your override may or may not work.

```tsx
// Inside Button:
<button className="px-4 py-2 bg-blue-600" {...props} />

// Consumer:
<Button className="px-8" />  // px-8 may NOT win — CSS source order decides.
```

This is the most common 'why isn't my className overriding?' bug in Tailwind apps.

## tailwind-merge

`tailwind-merge` understands Tailwind's utility groups and resolves conflicts. When two utilities target the same property (`px-*`, `py-*`, `bg-*`, etc.), the LAST one in the className string wins:

```tsx
import { twMerge } from 'tailwind-merge';

twMerge('px-4 px-8');           // → 'px-8'
twMerge('bg-red-500 bg-blue-500'); // → 'bg-blue-500'
twMerge('p-4 px-8');             // → 'p-4 px-8' (different properties; both kept)
```

Without twMerge, both classes ship and CSS source order decides. With twMerge, the last-listed always wins.

## The cn helper

Combine with clsx for conditionals:

```tsx
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Use in every component:

```tsx
<button
  className={cn(
    'px-4 py-2 bg-blue-600',     // base
    isLarge && 'px-8',            // conditional — overrides base
    className,                     // consumer override — overrides everything
  )}
/>
```

- `clsx` flattens the conditionals into a string.
- `twMerge` resolves conflicts, last wins.

Order matters in the call to cn: base classes first, conditional overrides next, prop `className` last (so it wins).

## How twMerge knows the groups

twMerge has built-in knowledge of all Tailwind utility groups:

- All `px-*`, `pl-*`, `pr-*` are paddingX-related — among themselves, last wins. But `px-4` plus `pl-8` works as you'd expect (combines).
- All `text-*` for colors vs `text-*` for sizes don't conflict (different groups).
- Custom utilities you add via plugins are handled if they follow Tailwind conventions.

For custom utility prefixes that twMerge doesn't know, you can configure:

```tsx
import { extendTailwindMerge } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
  classGroups: {
    'my-text-stroke': [{ 'text-stroke': ['1', '2', '3', '4'] }],
  },
});
```

Rare; most teams don't need to customize.

## Conditional patterns

`clsx` (wrapped by cn) accepts several shapes:

```tsx
cn(
  'base',                      // always
  isActive && 'active-class',  // conditional via &&
  isActive ? 'a' : 'b',        // ternary
  {
    'class1': condition1,
    'class2': condition2,
  },                           // object form
  ['array', 'of', 'classes'],  // array
  undefined,                   // ignored
  null,                        // ignored
  false,                       // ignored
);
```

All shapes flatten. Pick what reads best per case. Conditional booleans (`&&`) are the most common.

## Forward className to wrapped elements

When a component renders other components or wraps things, pass className through:

```tsx
function Container({ className, children }) {
  return <div className={cn('mx-auto max-w-7xl px-4', className)}>{children}</div>;
}
```

Now consumers can adjust:

```tsx
<Container className="px-8">  {/* Overrides internal px-4 */}
<Container className="bg-gray-50">  {/* Adds background */}
```

Every component that has internal classes and could be customized should accept and merge className. Convention.

## Conflict resolution in practice

A real example. Internal Card:

```tsx
function Card({ className, children }) {
  return (
    <div className={cn(
      'rounded-lg border bg-white p-6 shadow-sm',
      className
    )}>
      {children}
    </div>
  );
}
```

A consumer wants a card with no padding (image fills) and different shadow:

```tsx
<Card className="p-0 shadow-lg">
```

Behavior with cn():
- `p-6` and `p-0` conflict → `p-0` wins (later in string).
- `shadow-sm` and `shadow-lg` conflict → `shadow-lg` wins.
- Other classes (rounded-lg, border, bg-white) unchanged.

Without twMerge, both `p-6` and `p-0` would ship; result is unpredictable.

## When merging gets tricky

twMerge handles standard cases well. Edge cases:

**Modifier prefixes.** `hover:bg-red-500` and `hover:bg-blue-500` are in the same group; later wins. `hover:bg-red-500` and `focus:bg-blue-500` are different groups; both kept.

**Arbitrary values.** `p-[13px]` and `p-4` conflict; later wins. twMerge knows.

**Negative values.** `-mx-4` and `mx-4` conflict in some cases; the tool handles correctly.

**Important modifiers.** `!p-4` and `p-8` — important always wins. twMerge respects this.

For deeply unusual patterns, twMerge may not resolve perfectly. Test edge cases; most teams never hit them.

## clsx vs classnames vs cn

Several class-string libraries exist:

- **clsx** — lightweight (under 1KB), most common, ESM-friendly.
- **classnames** — older, similar API, slightly heavier.
- **cn** — usually a project-local helper combining clsx + twMerge.

For 2026 React + Tailwind projects, `clsx + tailwind-merge` (wrapped as `cn`) is the standard.

## Performance

twMerge does work on every render — parsing class strings, classifying utilities, resolving conflicts. For most components, this is microseconds; immaterial.

For tight render loops (drawing 10,000 items at 60fps with computed classes), memoize:

```tsx
const className = useMemo(() => cn('base', conditional && 'extra'), [conditional]);
```

Usually unnecessary. Only profile-and-optimize.

## Alternative: no twMerge, more explicit classes

Some teams avoid twMerge by:

1. Not accepting `className` prop on internal components.
2. Or only accepting specific override props (`bg`, `padding`).

This works but loses flexibility. Most teams find twMerge's small overhead worth the cleanness.

## Mistakes to avoid

- **Plain clsx without twMerge.** Conflicts unresolved.
- **Not passing className through.** Components rigid; can't customize.
- **className in the middle of cn() instead of last.** Internal classes override user.
- **String concatenation without a helper.** Conditional logic gets ugly.
- **Forgetting cn for custom plugins.** Built-in groups handled; custom may need config.

## Summary

- twMerge resolves conflicting Tailwind utilities; last in string wins.
- `cn = (...args) => twMerge(clsx(args))` is the standard composition helper.
- Use cn() in every styled component for predictable behavior.
- Forward className through; merge as last arg.
- clsx handles conditionals (`&&`, ternary, object, array).
- Negligible performance cost; standard pattern in 2026 React + Tailwind.

Next: shadcn/ui and the copy-paste pattern.
