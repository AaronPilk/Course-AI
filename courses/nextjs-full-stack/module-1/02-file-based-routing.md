---
module: 1
position: 2
title: "File-based routing in the App Router"
objective: "layouts, pages, loading, error, not-found."
estimated_minutes: 7
---

# File-based routing in the App Router

## The convention

The App Router uses file-system-based routing under the `app/` directory. The directory structure IS the route structure. Each folder is a URL segment; specific filenames create the route's behavior.

```
app/
├── layout.tsx          → root layout (wraps everything)
├── page.tsx            → / (the home page)
├── about/
│   └── page.tsx        → /about
├── blog/
│   ├── page.tsx        → /blog (post list)
│   └── [slug]/
│       └── page.tsx    → /blog/[slug] (individual post)
└── dashboard/
    ├── layout.tsx      → shared layout for /dashboard/*
    ├── page.tsx        → /dashboard
    └── settings/
        └── page.tsx    → /dashboard/settings
```

Reading the structure tells you the routes. No router config file; no manual route registration.

## The special files

A handful of filenames have special meaning:

- **`page.tsx`** — the page UI for that route. Required to make a folder a route.
- **`layout.tsx`** — shared UI wrapping all children. Persists across navigations.
- **`template.tsx`** — like layout but re-mounts on navigation (rare; for animations).
- **`loading.tsx`** — shown via Suspense while the page is loading.
- **`error.tsx`** — error boundary; shown when a child throws.
- **`not-found.tsx`** — shown when `notFound()` is called or no route matches.
- **`route.ts`** — defines an HTTP API route (alternative to page.tsx).
- **`default.tsx`** — fallback for parallel routes.

Each is optional except `page.tsx` (for routes) or `route.ts` (for API endpoints).

## Layouts

A `layout.tsx` wraps all children below it. It persists across client-side navigations — when you go from `/dashboard` to `/dashboard/settings`, the dashboard layout doesn't re-mount.

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

Layouts nest:

```
app/
├── layout.tsx              (root, wraps everything)
└── dashboard/
    ├── layout.tsx          (wraps /dashboard/*)
    └── settings/
        ├── layout.tsx      (wraps /dashboard/settings/*)
        └── page.tsx
```

Each layout receives the lower tree as `children`. The layouts compose naturally.

The **root layout** in `app/layout.tsx` is special:

```tsx
// app/layout.tsx — REQUIRED
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

It must include `<html>` and `<body>` tags. It wraps every page in the app.

## Loading UI

`loading.tsx` is automatically wired to a Suspense boundary around the route. When the page is suspending (data fetching, slow async), the loading file shows instead.

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <Skeleton />;
}
```

No manual Suspense needed — the file convention handles it. The loading UI streams in immediately while the rest of the page resolves.

## Error boundaries

`error.tsx` catches errors thrown in the route's children. Required to be a Client Component (errors need state to handle):

```tsx
// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

Errors thrown by Server Components, Client Components, or in async data fetches all bubble to the nearest `error.tsx`.

## Not-found pages

Trigger via `notFound()`:

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';

export default async function Post({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();
  return <Article post={post} />;
}
```

Renders the nearest `not-found.tsx`:

```tsx
// app/blog/[slug]/not-found.tsx
export default function NotFound() {
  return <h1>Post not found</h1>;
}
```

A global `app/not-found.tsx` handles unmatched routes.

## Dynamic routes

Square brackets in folder names create dynamic segments:

```
app/blog/[slug]/page.tsx  → /blog/anything
```

```tsx
export default function Post({ params }: { params: { slug: string } }) {
  // params.slug contains the URL segment
}
```

For multiple dynamic segments:

```
app/[category]/[product]/page.tsx  → /electronics/laptop
```

For catch-all:

```
app/docs/[...slug]/page.tsx        → /docs/anything/here/too
                                     params.slug = ['anything', 'here', 'too']
```

Optional catch-all:

```
app/docs/[[...slug]]/page.tsx      → /docs OR /docs/anything
```

## Route groups

Folders in parens organize files without affecting URLs:

```
app/
├── (marketing)/
│   ├── about/page.tsx       → /about
│   └── pricing/page.tsx     → /pricing
└── (app)/
    ├── dashboard/page.tsx   → /dashboard
    └── settings/page.tsx    → /settings
```

Route groups let you organize related routes (and apply different layouts to them) without polluting the URL.

You can have multiple root layouts via route groups:

```
app/
├── (marketing)/
│   └── layout.tsx           (one root layout)
└── (app)/
    └── layout.tsx           (different root layout)
```

Useful when marketing pages and app pages have completely different chrome.

## Private folders

Folders starting with `_` are excluded from routing:

```
app/
├── _components/
│   └── nav.tsx              (not a route)
└── about/page.tsx           → /about
```

Use private folders to colocate non-route files (components, helpers, types) inside the `app/` directory without creating routes for them.

## API routes via route.ts

If a folder has `route.ts` instead of `page.tsx`, it's an HTTP endpoint:

```tsx
// app/api/posts/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const posts = await db.posts.findMany();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const post = await db.posts.create({ data: body });
  return NextResponse.json(post);
}
```

Each HTTP method maps to an exported function. Useful for webhook receivers, oAuth callbacks, file uploads — places where Server Actions don't fit.

## Generating metadata

Each page can export `metadata` (static) or `generateMetadata` (dynamic):

```tsx
// Static
export const metadata = {
  title: 'About',
  description: 'About this site',
};

// Dynamic
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.coverImage] },
  };
}
```

Next.js renders these into `<head>` automatically. SEO and social-share previews handled per page.

## Linking and navigation

Use `<Link>` from `next/link` for client-side navigation:

```tsx
import Link from 'next/link';

<Link href="/dashboard">Dashboard</Link>
<Link href={`/blog/${slug}`}>{title}</Link>
```

Click triggers client-side navigation; only the changed route segments re-render. Layouts above the changed segment persist.

For programmatic navigation in Client Components:

```tsx
'use client';
import { useRouter } from 'next/navigation';

function Form() {
  const router = useRouter();
  return <button onClick={() => router.push('/dashboard')}>Go</button>;
}
```

In Server Components, use `redirect()` from `next/navigation`:

```tsx
import { redirect } from 'next/navigation';

if (!user) redirect('/login');
```

## Mistakes to avoid

- **Missing `<html>` or `<body>` in root layout.** Build fails.
- **Forgetting `'use client'` on `error.tsx`.** Required.
- **Using Pages Router patterns in App Router.** Different model; check docs.
- **API routes when Server Actions fit.** Server Actions are usually cleaner.
- **Catch-all routes too aggressively.** Match conflicts with other dynamic routes.

## Summary

- `app/` directory + special filenames defines routes.
- `page.tsx` makes a route; `layout.tsx` wraps children persistently.
- `loading.tsx`, `error.tsx`, `not-found.tsx` handle UI states automatically.
- Dynamic routes via `[param]`, catch-all via `[...param]`.
- Route groups `(folder)` organize without affecting URLs.
- Private folders `_folder` colocate non-route files.
- API endpoints via `route.ts`.

Next: data fetching on the server.
