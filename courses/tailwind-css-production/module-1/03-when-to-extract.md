---
module: 1
position: 3
title: "When to extract components"
objective: "Avoiding the @apply trap."
estimated_minutes: 7
---

# When to extract components

## The reuse question

You've written a button with eight utility classes. Now you need the same button on three other pages. Three options:

1. Copy the classes everywhere.
2. Extract a `.button` CSS class using `@apply`.
3. Extract a React/Vue/Svelte `<Button>` component.

Tailwind's official guidance, and the broader community consensus: **prefer option 3**. Components are the right reuse unit in a utility-first workflow. The other options have specific trade-offs that mostly favor components.

## Why components beat @apply

`@apply` lets you extract Tailwind utilities into a CSS class:

```css
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700;
}
```

```html
<button class="btn-primary">Save</button>
```

Looks clean. So why is this discouraged?

**1. Loses utility-first benefits.** You're back to CSS naming and a separate CSS file. The mental model that made Tailwind valuable is gone.

**2. Specificity returns.** `.btn-primary` is a class; overriding it from inline utilities requires care: `class="btn-primary bg-red-500"` may or may not override depending on source order.

**3. Variants explode.** Now you need `.btn-secondary`, `.btn-large`, `.btn-disabled`. Combinations multiply CSS classes. Component props handle this cleanly.

**4. Refactoring is harder.** A change to the design system requires hunting `.btn-*` classes across CSS files. With components, edit one file.

**5. Tailwind's own documentation says so.** The team explicitly recommends components over @apply.

`@apply` has legitimate uses (third-party CSS that needs Tailwind-style values, base layer for typography defaults). For application UI, components are right.

## Component extraction

```tsx
// components/Button.tsx
type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  // ... other props
}

export function Button({ variant = 'primary', size = 'md', children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition',
        // Variant
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        variant === 'ghost' && 'hover:bg-gray-100',
        // Size
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4',
        size === 'lg' && 'h-12 px-6 text-lg',
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
```

Now:

- Refactor the button design in one file.
- Type-safe variants enforced at usage sites.
- Other components compose `<Button>` without thinking about classes.

`cn` is `clsx + tailwind-merge` — shorthand for conditional classes with conflict resolution.

## When to extract — the threshold

When you see the same class string ≥3 times, extract.

Exceptions:

- Truly one-off layouts (page hero used once). Inline.
- Small enough to be cheap to copy (two utilities). Inline.

For anything with combinations of states/variants, extract on first instance — even before you'd repeat.

## Class composition with cn

`clsx` and `tailwind-merge` together solve two problems:

```tsx
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:

```tsx
<button className={cn(
  'px-4 py-2 bg-blue-500',          // base
  isLarge && 'px-6 py-3',           // conditional
  className,                         // prop from parent
)}>
```

- `clsx` handles conditionals and falsy values.
- `twMerge` resolves conflicts (last `px-*` wins, not both ship).

Without `twMerge`: passing `className="px-8"` from the parent might not override `px-4` because they're both in the same source-order layer. With `twMerge`, the later value always wins, predictably.

This pattern is the standard for React + Tailwind in 2026. Pretty much every shadcn/ui-style codebase uses it.

## Variants with class-variance-authority

For more structured variants, `cva` formalizes the pattern:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export function Button({ variant, size, children }: ButtonProps) {
  return <button className={buttonVariants({ variant, size })}>{children}</button>;
}
```

Cleaner than inline conditionals. Types flow from the cva config. Covered in detail in Module 4.

## Composition over configuration

Instead of one mega-Button with 50 props, compose smaller pieces:

```tsx
<Button variant="primary">
  <IconSave />
  Save
</Button>
```

Not:

```tsx
<Button variant="primary" icon="save" iconPosition="left" loading={false} loadingText="Saving..." />
```

The first scales; the second collapses under props growth.

For component libraries, headless primitives (Radix UI, React Aria) provide accessible behavior; you style with Tailwind. Each component stays focused.

## The shadcn/ui pattern

shadcn/ui took component-based Tailwind to a new pattern: copy the source into your repo.

```bash
npx shadcn-ui@latest add button
```

This creates `components/ui/button.tsx` in your project. You own the file; customize freely; updates are manual but the component is yours.

Benefits:
- No external dep version lock.
- Edit the component to match your brand.
- Bundle contains only what you use.

Drawbacks:
- More files in your repo.
- Updates require checking shadcn changelog.

For 2026 React+Tailwind projects, this is increasingly the default approach for UI primitives.

## When components aren't enough

For style fragments that don't map to a component:

- **Typography prose styling.** `prose` utility from `@tailwindcss/typography` handles rich text consistently. Apply to article containers.
- **Form input styling.** Often via a component, but for consistent appearance across native inputs (form layouts), `@tailwindcss/forms` can help.
- **Animation utilities.** Some teams define custom animations in tailwind.config and use as utilities (`animate-fade-in`).

The exception list is small. For most reuse, components.

## Component file organization

Group UI primitives separately from feature components:

```
components/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── dialog.tsx
└── (feature folders)
features/
├── auth/
│   └── components/
│       └── LoginForm.tsx
```

UI primitives are app-agnostic and broadly reused. Feature components compose them for specific purposes.

## Mistakes to avoid

- **`@apply` for app UI.** Use components.
- **Mega-buttons with 30 props.** Compose smaller pieces.
- **Copying classes 5+ times.** Extract before the 3rd copy.
- **Forgetting `tailwind-merge`** with className prop forwarding. Conflicts appear.
- **Component files in random places.** Establish a convention.

## Summary

- Components are the reuse unit in Tailwind-based apps.
- `@apply` is mostly discouraged; use components.
- Extract at 3+ duplications, or earlier if variants emerge.
- `cn = clsx + twMerge` is the standard utility for class composition.
- `class-variance-authority` formalizes variant systems.
- shadcn/ui pattern: copy component source into your repo, own it.
- Group UI primitives in `components/ui/`; feature components alongside features.

Next: Tailwind vs CSS-in-JS vs CSS Modules.
