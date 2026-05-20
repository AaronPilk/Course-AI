---
module: 5
position: 2
title: "Folder structure and component organization"
objective: "Patterns that scale to teams."
estimated_minutes: 7
---

# Folder structure and component organization

## Why structure matters

Folder structure is the first thing every new engineer sees. It's the second thing they need (after running the app). A good structure makes the codebase legible — you can predict where things live, find them quickly, and add new code without thinking too hard about placement.

Bad structure produces decision fatigue ("which folder does this go in?"), duplication, and growing entropy. By month 6, every team has either invested in structure or paid for not.

This lesson covers the patterns that hold up at scale.

## Feature-first (recommended)

Organize by feature/domain, not by file type:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── lib/
│   │   │   └── auth-utils.ts
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── posts/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── types.ts
│   └── settings/
│       └── ...
├── components/   (truly shared, app-wide)
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   └── layout/
├── lib/          (app-wide utilities)
├── hooks/        (app-wide hooks)
├── styles/
└── ...
```

Each feature is self-contained: components, hooks, API calls, types. Adding a feature = adding a folder. Removing a feature = removing a folder.

This works dramatically better than the file-type structure (`/components`, `/hooks`, `/utils`) at scale. Related code stays together; unrelated code doesn't cross-contaminate.

## File-type-first (avoid at scale)

```
src/
├── components/
│   ├── LoginForm.tsx
│   ├── PostList.tsx
│   ├── SettingsPanel.tsx
│   └── ... 200 files
├── hooks/
│   └── ... 50 files
├── utils/
│   └── ... 80 files
└── ...
```

Works for tiny apps. Breaks at scale:

- `/components` becomes a flat list of 200+ files.
- Finding things requires text search; predictability gone.
- Related code spreads across folders.
- Refactoring a feature touches many folders.

Acceptable for small projects (≤30 components). For real apps, switch to feature-first early.

## Public API per feature

Each feature exposes a public API via its `index.ts`:

```ts
// features/auth/index.ts
export { LoginForm } from './components/LoginForm';
export { SignupForm } from './components/SignupForm';
export { useAuth } from './hooks/useAuth';
export type { AuthUser } from './types';
// Internal helpers (auth-utils.ts) NOT exported.
```

Other features import from the public API:

```tsx
// features/dashboard/components/Header.tsx
import { useAuth } from '@/features/auth';
```

NOT:

```tsx
// ❌ Reaching into another feature's internals
import { useAuth } from '@/features/auth/hooks/useAuth';
```

The public API is the contract. Internals can refactor freely; consumers only depend on the exports.

## Shared components

The `components/ui/` folder for primitive, app-wide UI components: Button, Input, Modal, Card, Spinner. These are used everywhere; they don't belong to any feature.

Distinct from features-specific components — the `Button` in `components/ui/` is generic; the `LoginButton` in `features/auth/components/` is feature-specific.

A common rule: if a component is used by 3+ features, it's shared. Otherwise it lives in the feature.

## shadcn/ui pattern

Many React apps in 2026 use the shadcn/ui pattern: copy the source of UI primitives into your repo (instead of installing a UI library). Components live in `components/ui/`; you own them, you customize them.

```
components/ui/
├── button.tsx
├── input.tsx
├── dialog.tsx
└── ...
```

Benefits:
- No version lock with an external UI lib.
- Customize freely without forking.
- Bundle only contains what you use.

Drawbacks:
- More files in your repo.
- Updates require manual port.

The pattern is popular enough to be its own architectural choice.

## Pages vs components

In Next.js App Router:

```
app/
├── (marketing)/
│   ├── page.tsx
│   └── pricing/page.tsx
└── dashboard/
    ├── layout.tsx
    └── page.tsx
src/
├── features/
└── components/
```

Pages live in `app/` (routing). Reusable code in `src/`. Pages should be thin — orchestrate features, pass data around. The work happens in feature components.

For SPAs (Vite + React Router):

```
src/
├── pages/    or  routes/
│   ├── Home.tsx
│   └── Dashboard.tsx
├── features/
└── components/
```

Same separation. Pages are thin; features carry the logic.

## When pages get heavy

If a page is 200+ lines, extract its parts into the feature folder:

**Before:**
```tsx
// app/dashboard/page.tsx (heavy)
export default function DashboardPage() {
  // 200 lines of UI, data fetching, handlers
}
```

**After:**
```tsx
// app/dashboard/page.tsx (thin)
import { DashboardView } from '@/features/dashboard/components/DashboardView';

export default function DashboardPage() {
  return <DashboardView />;
}
```

The page becomes a thin orchestration; the actual UI moves to the feature.

## Co-located tests

Tests live next to the code they test:

```
features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── LoginForm.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
```

Not in a separate `/tests/` folder. Co-location makes it easy to find tests for a file, harder to forget to write them, easier to delete tests when the file is deleted.

Same for stories (Storybook) and styles (CSS modules if used).

## Naming conventions

- **Component files:** PascalCase (`LoginForm.tsx`).
- **Hook files:** camelCase starting with `use` (`useAuth.ts`).
- **Utility files:** camelCase (`formatDate.ts`).
- **Type files:** camelCase or singular (`types.ts`, `user.ts`).
- **Folders:** kebab-case (`features/post-editor/`).

Internal preference; pick one and stick to it. Inconsistency adds friction.

## Default exports vs named exports

Most teams prefer named exports:

```tsx
// LoginForm.tsx
export function LoginForm() { /* ... */ }

// Imports:
import { LoginForm } from './LoginForm';
```

Reasons:
- IDE refactor renames consistently.
- No mismatched names (`import Foo from './Bar'` → `Foo` could be anything).
- Easier re-exports from index.ts.

Some frameworks (Next.js pages, lazy()) require default exports. Mix as needed; prefer named where you can choose.

## Avoiding deep nesting

```
features/posts/components/lists/list-items/single-item/SingleItem.tsx
```

Deep nesting is hard to navigate, hard to import (long paths), and signals over-abstraction. If you find yourself nesting beyond 3-4 levels, flatten.

Per-feature, aim for at most:
```
features/posts/components/PostListItem.tsx
```

Not folders inside folders inside folders.

## Path aliases

Configure `@/` to point at `src/`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```tsx
import { LoginForm } from '@/features/auth';
// instead of:
import { LoginForm } from '../../../features/auth';
```

Aliases keep imports short and survive file moves better than relative paths.

## Linting structural rules

ESLint can enforce structural conventions:

- `eslint-plugin-import` rules: restrict imports, prevent cycles.
- `eslint-plugin-boundaries`: enforce that features can only import their public APIs.
- Custom rules: prevent imports from `features/X` outside `features/X/index.ts`.

For larger teams, these prevent boundary violations from creeping in.

## When to refactor structure

Refactor when:

- New engineers consistently ask "where does this go?"
- Search-and-replace dominates feature work.
- Circular dependencies appear.
- Tests for a feature are scattered across folders.

Refactor incrementally — moving one feature at a time. Don't try to reorganize the whole codebase in one PR.

## Mistakes to avoid

- **File-type structure at scale.** Doesn't survive growth.
- **No public API per feature.** Other features depend on internals.
- **Default exports everywhere.** Refactoring nightmares.
- **Deep nesting.** Hard to navigate.
- **No path aliases.** Relative paths that break on file moves.
- **Mixing pages and shared code.** Confused architecture.

## Summary

- Feature-first beats file-type-first at scale.
- Each feature exposes a public API via index.ts.
- Shared UI in `components/ui/`; app-wide hooks in `hooks/`.
- Tests, stories, styles co-located with code.
- Path aliases (`@/`) keep imports short.
- Named exports for most things; defaults where required.
- Refactor incrementally as patterns emerge.

Next: forms and validation.
