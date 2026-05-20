---
module: 4
position: 4
title: "shadcn/ui and the copy-paste pattern"
objective: "Owning your components."
estimated_minutes: 7
---

# shadcn/ui and the copy-paste pattern

## The new model for UI libraries

For years, UI libraries (Material UI, Chakra, Ant Design) followed the same model: install as an npm dependency, import components, customize via props or theme overrides. This worked but had costs:

- **Version lock.** Library updates may break your code.
- **Limited customization.** Override the theme, accept the library's design choices.
- **Bundle inclusion.** Even unused parts often ship.
- **Forking is hard.** Fundamentally changing a component means abandoning the library.

shadcn/ui flipped the model. You don't install the components — you copy the source code into your repo. Each component is a file you own.

This sounds minor but changed how teams build UI in 2026.

## How shadcn/ui works

```bash
npx shadcn-ui@latest init        # one-time setup
npx shadcn-ui@latest add button   # copy Button into your repo
```

After running:

```
components/
└── ui/
    └── button.tsx     ← your file, owned, editable
```

You don't import from `@shadcn/ui`. You import from `@/components/ui/button` — a file in YOUR codebase.

Customize freely:
- Change the variant names.
- Add new variants.
- Remove variants you don't use.
- Restyle as needed.
- Delete files you don't want.

No version conflicts; no forks; no maintenance burden from someone else's release schedule.

## What's in a shadcn component

A shadcn Button file contains everything needed:

- The component implementation.
- The cva variants definition.
- TypeScript types.
- Exports.

```tsx
// Pasted from a real shadcn install:
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(/* ... */);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(/* ... */);

export { Button, buttonVariants };
```

Self-contained. The only external dependency is the Radix primitive it might use (e.g., `@radix-ui/react-slot`).

## Built on Radix primitives

shadcn components use Radix UI under the hood for accessible behavior. Radix handles:

- Keyboard navigation.
- Focus management.
- ARIA attributes.
- Screen reader announcements.
- Modal trapping, tooltip positioning, etc.

shadcn wraps Radix with Tailwind styling. You get accessible behavior + customizable styling, without writing either from scratch.

For complex components (Dialog, DropdownMenu, Combobox), shadcn installs the corresponding Radix package as a dependency:

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "...",
    "@radix-ui/react-dropdown-menu": "..."
  }
}
```

These are the only library dependencies. Everything else is your code.

## The big benefits

**1. Own the code.** No surprise breaking changes when shadcn updates. You pull updates manually if you want them.

**2. Customize freely.** Want this button to look completely different on this one project? Edit the file.

**3. Smaller bundles.** Only ship code you use. No unused theme code.

**4. Match your design system.** shadcn's defaults are a starting point — modify them to match your brand.

**5. Learn by reading.** The components are well-written; reading them teaches good Tailwind component patterns.

## The minor drawbacks

**1. More files in your repo.** Each component adds 50-200 lines.

**2. Manual updates.** When shadcn improves a component, you must run `npx shadcn add button` again to overwrite (or diff-apply selectively).

**3. Less centralized theming.** Library-wide changes need to touch every file (though CSS variables for tokens minimize this).

**4. Onboarding nuance.** New devs have to understand it's their code, not an external dep.

Most teams find the benefits outweigh these costs significantly.

## Adding components

The CLI handles dependencies:

```bash
npx shadcn-ui@latest add dialog
# Adds:
# - components/ui/dialog.tsx
# - Installs @radix-ui/react-dialog if needed
# - Adds any related deps to package.json
```

You can add many at once:

```bash
npx shadcn-ui@latest add button input card dialog dropdown-menu
```

Or browse the catalog at ui.shadcn.com and pick.

## Customizing the install

`components.json` (created on init) configures the install:

```json
{
  "style": "default",       // 'default' or 'new-york'
  "rsc": true,              // React Server Components compatible
  "tsx": true,              // TypeScript
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

These choices flow through every component added. Set up once at the start.

## The theme

shadcn ships with a CSS variable-based theme:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

```js
// tailwind.config.js
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  // ...
}
```

Components use semantic tokens (`bg-primary`, `text-primary-foreground`). Theme adjustments in CSS variables propagate everywhere.

## Customizing the theme

To make shadcn look like YOUR brand:

1. Pick a brand color.
2. Generate HSL values for primary palette (uicolors.app or similar).
3. Update CSS variables in `app/globals.css`.
4. Restart dev server.

Every shadcn component picks up the new palette. No code changes to individual components.

For deeper customization (different border radius, different shadows, different font), update the relevant variables and tailwind config.

## Pre-built blocks

Beyond individual components, shadcn offers "blocks" — entire page sections (dashboards, login pages, authentication flows, sidebars). Copy a block; integrate into your app.

```bash
npx shadcn-ui@latest add sidebar-01
```

Useful for prototyping or starting a project with a known-good layout.

## When NOT to use shadcn

shadcn fits when:

- You're building with React + Tailwind.
- You want to customize freely.
- You're OK with the component file count.

It doesn't fit when:

- You're not using React (though similar patterns exist for Vue, Svelte).
- You're not using Tailwind.
- You need a comprehensive library with hundreds of components (shadcn covers ~50, focused).
- You need very specific design system constraints that conflict with shadcn's defaults.

For most React + Tailwind apps in 2026, shadcn is the default choice.

## Alternatives

Other component patterns:

**Mantine, Chakra, MUI** — traditional npm-installable libraries. Mature, large component counts. Trade ownership for breadth.

**Radix Themes** — Radix Labs' own component library on top of their primitives. Less popular than shadcn but high quality.

**Park UI, Tremor, Mantine v8** — emerging or established alternatives with different philosophies.

shadcn dominates because the copy-paste pattern resonates with how teams actually want to work with components.

## Forking strategy

If shadcn updates a component you've modified:

1. **Diff manually.** Compare the new version to your modified file; apply changes selectively.
2. **Backup and re-add.** Save your version; run `add` again; merge changes.
3. **Stay frozen.** If your version works, you don't have to update at all.

You're the maintainer of your components. Updates are optional, on your schedule.

## Building your own pattern

You can adopt the same pattern without using shadcn:

1. Set up `cn`, `tailwind-merge`, `clsx`, `class-variance-authority`.
2. Create `components/ui/` folder.
3. Write Button, Input, Card following the cva + forwardRef + cn pattern.

You're now using "shadcn-style" components without the CLI. Same benefits; more work to bootstrap.

## Mistakes to avoid

- **Importing from external library when you've installed shadcn.** Use the local file.
- **Treating shadcn components as immutable.** They're yours; edit them.
- **Adding every component pre-emptively.** Add only what you need.
- **Not updating tailwind.config when adding components.** Some need theme tokens; check requirements.
- **Fighting the design system.** Customize the tokens, don't override per-component.

## Summary

- shadcn/ui copy-paste pattern: components are files in your repo, not deps.
- Built on Radix UI for accessibility.
- Customize freely; no version lock; manual updates.
- CSS variables for theming; tokens propagate everywhere.
- Default choice for React + Tailwind in 2026.
- Alternatives exist for different needs (MUI, Chakra, Mantine).
- You can adopt the pattern without the CLI; it's just a convention.

Next module: performance and production.
