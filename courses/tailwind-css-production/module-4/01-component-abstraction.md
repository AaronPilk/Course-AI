---
module: 4
position: 1
title: "The component as the abstraction unit"
objective: "Tailwind classes inside React components."
estimated_minutes: 7
---

# The component as the abstraction unit

## The right level of abstraction

In Tailwind, the component is the abstraction unit. Utilities go in JSX; reuse happens via component reuse. This is fundamentally different from how teams use CSS Modules or styled-components, where the abstraction is "this is a Button" and the styles live separately.

Mastering this means building components that:

1. Encapsulate their styles via Tailwind classes inline.
2. Accept structured variants via props.
3. Compose with each other naturally.
4. Stay small enough to read at a glance.

## Anti-patterns the component model fixes

**Anti-pattern: copying class strings.**

```tsx
// Page 1
<button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium">Save</button>

// Page 2
<button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium">Continue</button>

// Page 3
<button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium">Submit</button>
```

A class string copied across files is a hidden component waiting to be extracted. Refactoring the button design requires touching every file.

**Anti-pattern: `@apply` to extract.**

```css
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium;
}
```

```tsx
<button className="btn-primary">Save</button>
```

Looks clean but loses utility-first benefits (covered Module 1). Variants explode into CSS classes; refactoring spreads across CSS files; specificity issues return.

**The fix: extract a component.**

```tsx
// components/ui/button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
        variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400',
        variant === 'ghost' && 'hover:bg-gray-100 focus-visible:ring-gray-400',
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

Usage:

```tsx
<Button>Save</Button>
<Button variant="secondary">Cancel</Button>
<Button size="lg">Continue</Button>
<Button variant="ghost" disabled>Pending</Button>
```

Now the design lives in one file. Refactor once; every button updates. Variants are type-safe.

## The cn helper

`cn` (used throughout this course) is `clsx + tailwind-merge`:

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

What it does:
- `clsx` handles conditionals (`condition && 'classes'`) and falsy values.
- `twMerge` resolves conflicting utilities (`px-4` and `px-8` → `px-8` wins).

Together, you get clean conditional class composition with predictable conflict resolution. The standard pattern in 2026.

## Spreading props through

Notice the component accepts `...props` and spreads them onto the button:

```tsx
<button {...props}>
```

This lets consumers pass `onClick`, `disabled`, `aria-*`, `data-*`, anything a button accepts:

```tsx
<Button onClick={handleClick} disabled={isLoading} aria-label="Save">
  Save
</Button>
```

Without spreading, you'd have to enumerate every prop. Spreading + extending the native HTML interface (`React.ButtonHTMLAttributes<HTMLButtonElement>`) gives you full button capabilities for free.

## className prop for escape hatches

The component also accepts a `className` prop:

```tsx
<Button className="w-full">Save</Button>
```

`cn(...)` merges this LAST, so users can override internal classes. `tailwind-merge` resolves conflicts (the user's `px-8` overrides the internal `px-4`).

Without `className` support, consumers can't tweak the component for one-off uses. With it, the component stays flexible.

Convention: every styled component accepts `className` as a prop and passes it through `cn()`.

## Compound components

For complex UI, break into compound components:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Hello</CardTitle>
    <CardDescription>Some description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Body content here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

Each piece is its own component with its own styles. Consumers compose them. This is the shadcn/ui pattern.

```tsx
// components/ui/card.tsx
export function Card({ className, ...props }: HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-white text-gray-900 shadow-sm',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLProps<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

// ... CardDescription, CardContent, CardFooter follow the same pattern
```

Benefits:
- Each piece is independently styleable.
- Consumers control composition (e.g., card without a header).
- Same pattern works for Dialogs, Forms, Tabs, anything with multiple parts.

## When to extract a component

Extract when:

- The class string repeats 3+ times.
- A pattern has variants or states.
- The HTML structure benefits from semantic naming (Card, Modal, Form).
- Different teammates might need to use it.

Don't extract when:

- The structure is unique to one page (page-specific layouts).
- It's a single instance with no variants.
- Extracting would create indirection without payoff.

Be slightly aggressive about extracting common UI primitives (buttons, inputs, cards). Be less aggressive about extracting page-level layouts.

## Where to put components

Standard structure:

```
components/
├── ui/                          (app-wide UI primitives)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
└── (feature folders)
features/
├── auth/
│   └── components/
│       └── LoginForm.tsx        (feature-specific compositions)
```

UI primitives (Button, Input, Card, Dialog) live in `components/ui/`. Feature components compose them.

`shadcn/ui add button` puts the file directly here, by convention.

## Owning your components

The shadcn/ui approach: don't install components as a dependency; copy the source into your repo. You own the file; customize freely.

```bash
npx shadcn-ui@latest add button
```

This drops `components/ui/button.tsx` into your project. You can edit it. Updates require manual port — usually a small diff to apply.

Benefits:
- No version lock.
- Customize without forking a library.
- Your design system, not theirs.

Drawbacks:
- More files in your repo.
- Manual updates.

For 2026 React + Tailwind projects, this is the dominant pattern.

## Composition over configuration

A long-running architectural choice: compose primitives, or build mega-components with many props?

```tsx
// ❌ Mega-Button
<Button
  variant="primary"
  size="lg"
  icon="save"
  iconPosition="left"
  loading={false}
  loadingText="Saving..."
  href="/save"
  fullWidth
  iconColor="white"
/>
```

```tsx
// ✅ Composition
<Button variant="primary" size="lg" asChild>
  <Link href="/save">
    <IconSave />
    Save
  </Link>
</Button>
```

Composition scales; mega-components collapse under prop growth. Use Radix's `asChild` pattern (or React's `cloneElement`) to compose flexibly.

## Mistakes to avoid

- **No `className` prop pass-through.** Component is rigid; consumers can't override.
- **Forgetting `cn()`.** Conflicting classes break unpredictably.
- **Not extending native props.** Consumers can't use standard attributes.
- **Too many props for one component.** Split via composition.
- **Component files in random locations.** Establish conventions.

## Summary

- Components are the abstraction unit in Tailwind-based apps.
- Use `cn = twMerge(clsx(...))` for class composition.
- Accept `className` prop; pass through via `cn()`.
- Extend native HTML attributes (`React.ButtonHTMLAttributes`) and spread props.
- Compose compound components for complex UI.
- shadcn/ui copy-paste pattern owns components in your repo.
- Composition over configuration; small focused components beat big ones.

Next: variants with class-variance-authority.
