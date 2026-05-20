---
module: 3
position: 3
title: "Parallel and intercepted routes"
objective: "Modals, dashboards, tabs done right."
estimated_minutes: 7
---

# Parallel and intercepted routes

## What problem they solve

Some UI doesn't fit the "one page per URL" model:

- A dashboard with multiple panels that load independently.
- A modal that appears over the current page (but bookmarkable).
- Tabs where each tab is its own route.
- Side-by-side views (chat list + chat detail).

Parallel routes let a single layout render multiple pages simultaneously. Intercepted routes let one route render in the context of another (modals).

These are advanced features but solve real UX problems cleanly.

## Parallel routes — slots

A folder prefixed with `@` is a "slot." Slots render alongside `children`:

```
app/dashboard/
├── @analytics/
│   └── page.tsx
├── @team/
│   └── page.tsx
├── layout.tsx
└── page.tsx
```

The layout receives both children and slots as props:

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>{children}</div>
      <div>{analytics}</div>
      <div>{team}</div>
    </div>
  );
}
```

Each slot loads independently. They can stream in independently. They can have their own loading and error states.

## Why parallel routes

Three big wins:

**1. Independent loading.** Each slot's data fetches in parallel. The page renders as parts complete; slow slots don't block fast ones.

**2. Independent error handling.** One slot fails → its error.tsx shows; other slots keep rendering.

**3. Bookmarkable shared state.** Each slot can have its own URL state via search params; bookmarks restore the whole composite view.

For dashboards with multiple panels, parallel routes are dramatically cleaner than building one giant page.

## Slot routing

Slots have their own routing logic. The default slot file `default.tsx` shows when the slot's route doesn't match:

```
app/dashboard/
├── @analytics/
│   ├── default.tsx          ← shown when no specific analytics route
│   ├── page.tsx             ← /dashboard (analytics overview)
│   ├── monthly/page.tsx     ← /dashboard/monthly
│   └── weekly/page.tsx      ← /dashboard/weekly
```

Navigating to `/dashboard/monthly` renders:
- children → the dashboard page or matching child route.
- @analytics → the monthly analytics page.
- Other slots → their `default.tsx` (or `page.tsx` if matched).

This lets one URL change reflect multiple slots simultaneously.

## Conditional slots

A slot can render different content based on state:

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        {authModal}  {/* renders if a modal route is active */}
      </body>
    </html>
  );
}
```

When the auth modal route is active, the slot shows the modal; otherwise it shows nothing (or default).

## Intercepted routes — modals over content

Intercepted routes let you show one route's content in the context of another. The classic use case: clicking a photo in a grid opens a modal showing the photo, but the URL changes and a direct link to the photo's URL still works (renders the photo full-page).

Folder convention:

- `(.)folder` — intercept same level.
- `(..)folder` — intercept one level up.
- `(..)(..)folder` — intercept two levels up.
- `(...)folder` — intercept from root.

Example:

```
app/
├── photos/
│   ├── page.tsx                          ← /photos (grid)
│   └── [id]/
│       └── page.tsx                      ← /photos/[id] (full page)
└── @modal/
    ├── default.tsx                       ← null
    └── (..)photos/
        └── [id]/
            └── page.tsx                  ← /photos/[id] in modal context
```

When the user clicks a photo from `/photos`:
- URL becomes `/photos/123`.
- The grid page stays rendered (children).
- The `@modal/(..)photos/[id]/page.tsx` route activates and shows the modal.

When someone visits `/photos/123` directly:
- The grid page doesn't render.
- The `app/photos/[id]/page.tsx` route renders full-page.

Two routes for the same URL, depending on context. Both are bookmarkable; clicking refresh on the modal URL shows the full-page version.

## Setting up a modal pattern

```tsx
// app/@modal/(..)photos/[id]/page.tsx
'use client';
import { useRouter } from 'next/navigation';

export default function PhotoModal({ params }) {
  const router = useRouter();
  return (
    <Modal onClose={() => router.back()}>
      <PhotoView id={params.id} />
    </Modal>
  );
}
```

`router.back()` closes the modal by navigating back. The page underneath stays rendered.

For Server Component modals (no client state needed), drop the `'use client'` and don't use router.

## Other modal patterns

Not every modal needs to be a route. Simple modals (confirm dialogs, brief popups) work better as local state in a Client Component:

```tsx
'use client';
function DeleteButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Delete</button>
      {open && <ConfirmDialog onCancel={() => setOpen(false)} />}
    </>
  );
}
```

Use intercepted routes for modals that:
- Should be bookmarkable.
- Should support direct linking.
- Show distinct content (e.g., a different page).

Use local state for ephemeral UI.

## Independent loading and error states per slot

Each slot can have its own:

```
app/dashboard/
├── @analytics/
│   ├── loading.tsx          ← shown while analytics loads
│   ├── error.tsx            ← shown if analytics throws
│   └── page.tsx
├── @team/
│   ├── loading.tsx
│   ├── error.tsx
│   └── page.tsx
└── layout.tsx
```

This is the killer feature for dashboards. The team slot showing an error doesn't break the analytics slot. The analytics slot's spinner shows independently of team's loading.

## Limitations and gotchas

- **Slots only work within the layout that defines them.** A slot in `app/dashboard/@analytics` is not accessible to `/about`.
- **Slot routing can be confusing.** Multiple URLs producing slot content; documentation helps.
- **`default.tsx` is required for every slot** if you don't want surprising behavior on routes that don't match the slot.
- **Intercepted routes require careful folder organization.** Bugs can arise from mis-pathing.

These features have learning curves. Start with `children`-only routing; reach for parallel/intercepted when you have a concrete use case.

## When NOT to use them

Skip parallel and intercepted routes when:

- The UI fits the standard one-page-per-URL model.
- Modals are local state, not bookmarkable.
- The team is new to App Router and learning fundamentals first.

These features unlock specific use cases. They're not the default tools.

## Mistakes to avoid

- **Missing `default.tsx` in a slot.** Routes that don't match the slot produce confusing behavior.
- **Over-using intercepted routes for simple modals.** Adds complexity without benefit.
- **Slots that need to communicate.** Tricky; usually better to use a shared parent state via Client Components.
- **Forgetting that slots can re-render independently.** Means each fetches its own data.

## Summary

- Parallel routes (`@slot`) render multiple pages in one layout simultaneously.
- Each slot has independent routing, loading, error.
- Use for dashboards with multiple panels; bookmarkable composite state.
- Intercepted routes (`(.)`, `(..)`, `(...)`) render one route in another's context.
- Use for bookmarkable modals (photo gallery, item details).
- Reach for these when the standard model doesn't fit; not as defaults.

Next: middleware and edge logic.
