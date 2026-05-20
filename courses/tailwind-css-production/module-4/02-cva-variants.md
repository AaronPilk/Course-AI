---
module: 4
position: 2
title: "Variant patterns with class-variance-authority"
objective: "Type-safe component variants."
estimated_minutes: 7
---

# Variant patterns with class-variance-authority

## The variant problem

A button can have many variants: primary, secondary, ghost, destructive. And sizes: sm, md, lg. And states: loading, disabled. Combinations explode quickly.

Inline conditional classes work for simple cases:

```tsx
className={cn(
  'base classes',
  variant === 'primary' && 'primary classes',
  variant === 'secondary' && 'secondary classes',
  size === 'sm' && 'small classes',
  size === 'lg' && 'large classes',
)}
```

This works but gets noisy with 5+ variants and multiple variant axes. Enter `class-variance-authority` (cva).

## cva basics

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base classes (always applied)
  'inline-flex items-center justify-center rounded-md font-medium transition focus-visible:ring-2 disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        ghost: 'hover:bg-gray-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
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

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

Usage:

```tsx
<Button>Default</Button>
<Button variant="secondary" size="lg">Big secondary</Button>
<Button variant="destructive">Delete</Button>
```

Benefits:

- **Variants in one place.** All variants for the button live in the cva config.
- **Type-safe.** TypeScript infers variant types from cva; `<Button variant="banana" />` is a compile error.
- **defaultVariants.** Set sensible defaults; consumers can override.
- **Composable.** Multiple variant axes (variant + size + state) without conditional chains.

## Compound variants

Sometimes combining variants needs special handling:

```tsx
const buttonVariants = cva('base classes', {
  variants: {
    variant: { primary: '...', secondary: '...' },
    size: { sm: '...', lg: '...' },
  },
  compoundVariants: [
    {
      variant: 'primary',
      size: 'lg',
      class: 'shadow-lg',  // Extra shadow only for primary+large.
    },
    {
      variant: ['secondary', 'ghost'],
      size: 'sm',
      class: 'tracking-wide',  // For multiple variant matches.
    },
  ],
  defaultVariants: { variant: 'primary', size: 'md' },
});
```

Compound variants apply when ALL listed conditions match. Useful for combinations that need their own tweak (e.g., destructive + ghost should have a red text color but no red background).

## Boolean variants

cva supports boolean variants:

```tsx
const cardVariants = cva('rounded-lg border bg-white', {
  variants: {
    interactive: {
      true: 'hover:shadow-md transition cursor-pointer',
      false: '',
    },
    elevated: {
      true: 'shadow-lg',
      false: 'shadow-sm',
    },
  },
  defaultVariants: { interactive: false, elevated: false },
});

// Usage:
<Card interactive elevated>
```

Booleans flatten the API — `interactive` instead of `interactive="true"`.

## Inferring variant types

`VariantProps<typeof buttonVariants>` extracts the variant types:

```tsx
type ButtonVariants = VariantProps<typeof buttonVariants>;
// { variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'; size?: 'sm' | 'md' | 'lg'; }
```

Pass these through your component's props interface. TypeScript flows from cva config → component props → consumers. Rename a variant in cva; TypeScript catches every usage that needs updating.

## Reusable variant generators

For design systems with many components sharing variant axes (e.g., color variants used by Button, Badge, Tag):

```tsx
const colorVariants = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-100 text-gray-900',
  destructive: 'bg-red-600 text-white',
  success: 'bg-green-600 text-white',
};

const buttonVariants = cva('button base classes', {
  variants: { color: colorVariants, /* ... */ },
});

const badgeVariants = cva('badge base classes', {
  variants: { color: colorVariants, /* ... */ },
});
```

Shared variants stay synchronized. Add a new color; both components get it.

## When NOT to use cva

For simple components with 1-2 variants:

```tsx
<button className={cn(
  'px-4 py-2',
  primary && 'bg-blue-500',
)}>
```

Two conditionals is cleaner than cva. The cva ceremony pays off at 3+ variant axes.

For one-off components used in a single place:

```tsx
function PageHero({ children }) {
  return <div className="hero-specific-styling">{children}</div>;
}
```

No variants; no cva. Just write the classes.

cva shines when components have multiple variant axes used across the codebase. For everything else, conditional cn() is fine.

## shadcn/ui uses cva

Every shadcn/ui component uses cva for variants. When you `npx shadcn-ui@latest add button`, the generated file uses this pattern.

If you're building components from scratch, follow this convention — engineers familiar with shadcn will recognize it instantly.

## Combining with shadcn

shadcn buttons look like this:

```tsx
// components/ui/button.tsx — from shadcn/ui
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };
```

Patterns to notice:
- Variants use semantic tokens (`bg-primary`, `text-destructive-foreground`) for theme-awareness.
- `asChild` from Radix Slot for composition.
- `React.forwardRef` so refs propagate.
- Exports both `Button` component and `buttonVariants` (for advanced consumers who want the class string).

This is the canonical 2026 pattern.

## Exporting variants separately

Exporting `buttonVariants` lets consumers apply the same look to non-button elements:

```tsx
import { buttonVariants } from '@/components/ui/button';

<Link href="/" className={buttonVariants({ variant: 'primary' })}>
  Home
</Link>
```

Now a link looks like a button without rendering as one. Useful for nav items, "as link" cases. Combined with Radix's `asChild`, you can use the actual Button component to render as a link too.

## Mistakes to avoid

- **cva for one-variant components.** Overkill.
- **Hardcoded colors in variants when semantic tokens would work.** Forfeits theming.
- **Forgetting `defaultVariants`.** Components fail when no variant is passed.
- **Compound variants for everything.** Use sparingly; simple variants compose better.
- **Not exporting variant types.** Consumers can't accept VariantProps.

## Summary

- cva structures multi-variant components cleanly.
- TypeScript types flow from cva config to component props.
- `defaultVariants` sets sensible defaults.
- `compoundVariants` for special combinations.
- Boolean variants for flag-style props.
- Export variants for reuse on different elements.
- shadcn/ui uses cva universally.
- For 1-2 variants, conditional `cn()` is fine.

Next: tailwind-merge and conditional classes.
