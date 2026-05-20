---
module: 3
position: 1
title: "Layouts and templates"
objective: "Shared UI without re-rendering."
estimated_minutes: 7
---

# Layouts and templates

## Why layouts matter

A typical app has UI that persists across multiple routes: header, sidebar, navigation, footer. Without layouts, you'd render these as part of every page, causing them to re-render and re-fetch every navigation. Worse — input state in the sidebar would reset.

Layouts solve this. A `layout.tsx` wraps all child routes; it renders once and persists across client-side navigations between siblings. The shell stays mounted; only the inner content swaps.

## How layouts work

```
app/
├── layout.tsx              ← root layout, wraps everything
└── dashboard/
    ├── layout.tsx          ← wraps /dashboard/*
    ├── page.tsx            ← /dashboard
    └── settings/
        └── page.tsx        ← /dashboard/settings
```

Going from `/dashboard` to `/dashboard/settings`:
- Root layout stays mounted (no re-render).
- Dashboard layout stays mounted.
- Page content swaps from dashboard's page to settings page.

Form state, scroll position, sidebar accordion state — all preserved.

## The root layout

`app/layout.tsx` is required:

```tsx
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'My App',
  description: 'Description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

Must include `<html>` and `<body>` tags. Renders for every route in the app.

The root layout is where global styles, fonts, theme providers, error boundaries, and analytics typically live.

## Nested layouts

Layouts compose by directory nesting:

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

The root layout wraps everything; the dashboard layout wraps `/dashboard/*`. Together:

```html
<html>
  <body>
    <!-- root layout -->
    <div class="dashboard-shell">
      <!-- dashboard layout -->
      <Sidebar />
      <main>
        <!-- the page -->
      </main>
    </div>
  </body>
</html>
```

Each layout can be a Server Component (default) or Client Component (if needed for state).

## Layouts can fetch data

Server Component layouts can fetch data:

```tsx
// app/dashboard/layout.tsx
async function DashboardLayout({ children }) {
  const user = await fetchCurrentUser();
  const notifications = await fetchNotifications(user.id);
  
  return (
    <div className="dashboard-shell">
      <Header user={user} notifications={notifications} />
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

The fetch happens once on initial load and persists; navigating between dashboard pages doesn't re-fetch. To force a re-fetch on navigation, use `template.tsx` (next section).

## When to use templates

Sometimes you DO want the layout to re-mount on every navigation:

- Animations between pages.
- Resetting state on every navigation.
- useEffect that should fire each page transition.

`template.tsx` works like `layout.tsx` but re-mounts on every navigation:

```
app/
├── layout.tsx      ← stable, persists
└── template.tsx    ← re-mounts every navigation
```

Use templates sparingly. Layouts are usually what you want.

## Shared elements between pages

Common patterns:

**Top nav + page content:**
```tsx
// app/(authenticated)/layout.tsx
<>
  <TopNav />
  {children}
</>
```

**Sidebar + main content:**
```tsx
<div className="flex">
  <Sidebar />
  <main className="flex-1">{children}</main>
</div>
```

**Two-column layout with sidebar from a route, content from page:**
Use parallel routes (covered later in this module).

## Layouts and metadata

Layouts can export metadata, including defaults for child pages:

```tsx
export const metadata = {
  title: {
    template: '%s | My App',
    default: 'My App',
  },
};
```

Child pages can set their own title:

```tsx
// app/blog/page.tsx
export const metadata = { title: 'Blog' };
// Renders as "Blog | My App"
```

Templates compose down the tree. Useful for consistent title formatting.

## When layouts re-render

Layouts persist across navigations between routes they wrap. They DO re-render when:

- The route navigation crosses layout boundaries (going from one layout's subtree to a different layout's subtree).
- The page is reloaded (hard navigation).
- A revalidation triggers their data to refresh.

Within a layout's subtree, navigating between sibling pages: no layout re-render. This is the win.

## Common gotcha: layout fetches that should be page fetches

If data is specific to one page but you fetch it in the layout, two problems:

1. It fetches on every page under the layout, wasting bandwidth.
2. It persists when you navigate to another page that doesn't need it.

Fetch in the page that needs the data; let the layout focus on shared shell.

## Forms that span layout + page

A form in the layout (e.g., a search bar) that navigates the user to a results page:

```tsx
// app/layout.tsx
<form action={async (formData) => {
  'use server';
  const query = formData.get('q') as string;
  redirect(`/search?q=${encodeURIComponent(query)}`);
}}>
  <input name="q" />
  <button>Search</button>
</form>
```

The layout's search bar persists; submitting navigates to a new page that the layout still wraps.

## Multiple root layouts via route groups

Route groups can create multiple root layouts in one project:

```
app/
├── (marketing)/
│   └── layout.tsx          ← root for marketing pages
├── (app)/
│   └── layout.tsx          ← root for app pages
└── api/
    └── ...
```

Each `layout.tsx` must include `<html>` and `<body>`. Useful when marketing pages and app pages have completely different chrome.

Note: with multiple root layouts, the navigation BETWEEN them is a full page reload (no client-side transition). Use this for genuinely separate experiences.

## Anti-patterns

**Putting heavy data in the root layout.** Re-runs on every cold start; bloats initial load. Keep root layout light.

**Layouts with state in the URL.** State that should be URL-driven (filters, search) belongs in the page, not the layout — the URL changes per page, the layout doesn't.

**Layouts wrapping unrelated routes.** If pages don't share UI, don't share a layout. Keep concerns localized.

## Mistakes to avoid

- **No root layout.** Build fails.
- **`<html>`/`<body>` outside root layout.** Build fails.
- **Heavy fetches in root layout.** Slow first paint.
- **State in layout that should be in page.** Wrong scope.
- **Template when you want layout.** Re-mounts unnecessarily.

## Summary

- `layout.tsx` persists across child route navigations.
- Composes via directory nesting; each layout wraps its subtree.
- Root layout is required; must include `<html>` and `<body>`.
- Server Components can fetch data; persists with the layout.
- `template.tsx` re-mounts on every navigation (use sparingly).
- Multiple root layouts possible via route groups.
- Keep layouts focused on shared shell; page-specific data in pages.

Next: dynamic routes and route groups.
