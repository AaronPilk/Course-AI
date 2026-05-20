---
module: 3
position: 2
title: "Dynamic routes and route groups"
objective: "Catch-alls, optional segments, organization."
estimated_minutes: 7
---

# Dynamic routes and route groups

## The need for dynamic routing

Static routes match exact paths: `/about`, `/pricing`. Dynamic routes match patterns: `/blog/anything`, `/products/123`, `/docs/getting-started/installation`.

Next.js handles dynamic routing through bracket-named folders. The conventions are straightforward but pack a lot of expressive power.

## Single dynamic segment

```
app/blog/[slug]/page.tsx
```

Matches `/blog/anything`. The matched segment is available as `params.slug`:

```tsx
export default function Post({ params }: { params: { slug: string } }) {
  return <h1>Post: {params.slug}</h1>;
}
```

For `/blog/hello-world`, `params.slug = 'hello-world'`.

## Multiple dynamic segments

```
app/products/[category]/[id]/page.tsx
```

Matches `/products/electronics/laptop-123`:

```tsx
export default function Product({
  params,
}: {
  params: { category: string; id: string };
}) {
  return <h1>{params.category} / {params.id}</h1>;
}
```

Each segment becomes a key in `params`.

## Catch-all segments

For routes that match any number of segments:

```
app/docs/[...slug]/page.tsx
```

Matches:
- `/docs/getting-started`
- `/docs/api/reference`
- `/docs/guide/tutorials/intro/setup`

`params.slug` is an array:

```tsx
export default function Docs({ params }: { params: { slug: string[] } }) {
  // /docs/api/reference → params.slug = ['api', 'reference']
  return <Article path={params.slug.join('/')} />;
}
```

Use catch-all for documentation, file browsers, anything where the URL depth varies.

## Optional catch-all

```
app/shop/[[...slug]]/page.tsx
```

Like catch-all but also matches the bare path:
- `/shop` → `params.slug = undefined`
- `/shop/laptops` → `params.slug = ['laptops']`
- `/shop/laptops/gaming` → `params.slug = ['laptops', 'gaming']`

Useful for routes with a default and arbitrary sub-paths.

## Conflicts and specificity

When multiple routes could match, Next.js picks the most specific:

- Exact > dynamic > catch-all > optional catch-all.

Example:

```
app/products/page.tsx              ← /products (exact)
app/products/featured/page.tsx     ← /products/featured (exact)
app/products/[id]/page.tsx         ← /products/anything (dynamic)
app/products/[...rest]/page.tsx    ← /products/anything/else (catch-all)
```

`/products/featured` matches the exact one. `/products/123` matches `[id]`. `/products/a/b` matches `[...rest]`.

Don't define routes that conflict — Next.js will pick one but the behavior can surprise.

## generateStaticParams

For dynamic routes pre-rendered at build time:

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await db.posts.findMany({ select: { slug: true } });
  return posts.map(post => ({ slug: post.slug }));
}
```

Each returned object becomes a pre-rendered route. Combine with ISR (`export const revalidate = 60`) for periodic refresh.

For catch-all routes:

```tsx
export async function generateStaticParams() {
  return [
    { slug: ['getting-started'] },
    { slug: ['api', 'reference'] },
    { slug: ['guide', 'tutorials', 'intro'] },
  ];
}
```

The returned `slug` is an array matching the catch-all.

## dynamicParams

For dynamic routes, `dynamicParams` controls what happens when a request hits a path NOT returned by `generateStaticParams`:

```tsx
export const dynamicParams = true;  // default: render on-demand
// or
export const dynamicParams = false; // 404 if not in generateStaticParams
```

`true` is the default and usually correct — new posts can be added without re-running the build.

`false` is useful when you want to constrain to a known set (e.g., a fixed marketing taxonomy).

## Route groups — organizing without affecting URLs

Folders in parens don't become URL segments:

```
app/
├── (marketing)/
│   ├── about/page.tsx        → /about
│   ├── pricing/page.tsx      → /pricing
│   └── layout.tsx            (applies to marketing pages)
└── (app)/
    ├── dashboard/page.tsx    → /dashboard
    ├── settings/page.tsx     → /settings
    └── layout.tsx            (applies to app pages)
```

URLs are `/about`, `/pricing`, `/dashboard`, `/settings`. The parens are purely organizational.

Use route groups to:

- Apply different layouts to different sections without nesting URLs.
- Co-locate related routes for clarity.
- Have multiple root layouts in one project.

## Private folders

Folders starting with `_` are excluded from routing entirely:

```
app/
├── _components/
│   ├── nav.tsx           (not a route)
│   └── footer.tsx
├── _lib/
│   └── utils.ts
└── about/page.tsx        → /about
```

Use private folders to colocate non-route files (components, helpers, types) inside the `app/` directory. Keeps related code together without polluting the route tree.

Common pattern:

```
app/
├── _components/  (project-wide components)
├── _lib/         (project-wide utilities)
├── dashboard/
│   ├── _components/   (dashboard-specific components)
│   ├── _hooks/        (dashboard-specific hooks)
│   ├── layout.tsx
│   └── page.tsx
└── ...
```

Co-located code at the same depth as the routes that use it.

## File conventions inside dynamic routes

All the special files work inside dynamic segments:

```
app/blog/[slug]/
├── page.tsx          → /blog/[slug]
├── layout.tsx        → layout for /blog/[slug]/*
├── loading.tsx       → loading state
├── error.tsx         → error boundary
└── not-found.tsx     → 404 for invalid slugs
```

Each layer of dynamic segments can have its own conventions.

## Linking to dynamic routes

```tsx
import Link from 'next/link';

<Link href={`/blog/${post.slug}`}>{post.title}</Link>
<Link href={`/products/${category}/${productId}`}>View</Link>
```

For type safety, you can wrap navigation in helper functions:

```tsx
// lib/routes.ts
export const routes = {
  blog: (slug: string) => `/blog/${slug}`,
  product: (category: string, id: string) => `/products/${category}/${id}`,
};

<Link href={routes.blog(post.slug)}>...</Link>
```

Centralizes path construction; refactoring URL structure becomes a single-file change.

## Common patterns

**Blog with categories:**
```
app/
├── blog/
│   ├── page.tsx                  → /blog (all posts)
│   ├── [slug]/page.tsx           → /blog/[slug] (post)
│   └── category/
│       └── [category]/page.tsx   → /blog/category/[category]
```

**Multi-tenant routing by org:**
```
app/
├── [org]/
│   ├── layout.tsx                (validates org access)
│   ├── page.tsx                  → /[org] (org home)
│   ├── projects/
│   │   ├── page.tsx              → /[org]/projects
│   │   └── [id]/page.tsx         → /[org]/projects/[id]
│   └── settings/page.tsx         → /[org]/settings
```

**File browser:**
```
app/files/[...path]/page.tsx      → /files/any/depth/of/folders
```

## Mistakes to avoid

- **Conflicting routes.** Choose specific vs dynamic carefully.
- **Forgetting generateStaticParams.** Each dynamic request hits the DB.
- **Catch-all when single dynamic would do.** Over-flexibility risks bugs.
- **Routing logic in the page when it belongs in middleware.** Middleware can rewrite URLs.
- **Hardcoding URLs.** Centralize in a helper.

## Summary

- `[slug]` for single dynamic segment.
- `[...slug]` for catch-all (multiple segments).
- `[[...slug]]` for optional catch-all (also matches bare path).
- `generateStaticParams` pre-renders at build time.
- `dynamicParams` controls on-demand rendering for new paths.
- Route groups `(folder)` organize without affecting URLs.
- Private folders `_folder` colocate non-route files.

Next: parallel and intercepted routes.
