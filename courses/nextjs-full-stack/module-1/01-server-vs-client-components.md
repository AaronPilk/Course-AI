---
module: 1
position: 1
title: "Server Components vs Client Components"
objective: "Where each runs and why it matters."
estimated_minutes: 7
---

# Server Components vs Client Components

## The core mental model

The App Router introduced a fundamental change in how React works in Next.js: **components run on the server by default**. You opt into client-side rendering with `'use client'` at the top of a file.

This is the inverse of the old model. In Pages Router (and Create React App, Vite, etc.), everything was a Client Component by default — JavaScript shipped to the browser, hydrated, ran there. Server-side rendering was a pre-rendering optimization but the runtime was client-side.

In App Router, **Server Components are the default**. They run on the server, never ship JavaScript to the client, can directly access databases and secrets, and emit HTML (well, a serialized React tree) for the browser to render.

Client Components — marked with `'use client'` — are what you've always known: React components that hydrate in the browser, can use hooks, handle events, manage state.

## What Server Components can do

Server Components run server-side at request time. They can:

- **Read from databases directly.** No API layer needed:
  ```tsx
  // app/posts/page.tsx (Server Component by default)
  import { db } from '@/lib/db';

  export default async function PostsPage() {
    const posts = await db.posts.findMany();
    return <PostList posts={posts} />;
  }
  ```
- **Read filesystem, env variables, secrets.** Available because this code runs on the server.
- **Call backend services with secret API keys** (OpenAI, Stripe, internal microservices).
- **Be async functions.** Yes, components themselves can be async; you await data directly in the render.
- **Avoid shipping their code to the client.** Smaller JS bundles.

What Server Components can NOT do:

- Use `useState`, `useEffect`, or any other hook.
- Handle browser events (`onClick`, `onChange`, etc.).
- Use browser APIs (`window`, `localStorage`, etc.).
- Re-render based on client-side state.

If you need any of those, you need a Client Component.

## What Client Components can do

Client Components are React components as you've always known them:

```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  );
}
```

The `'use client'` directive at the top marks this file (and everything it imports that isn't already a Server Component) as Client.

Client Components can:

- Use all React hooks.
- Handle events.
- Use browser APIs.
- Re-render on state changes.
- Be hydrated on the client.

What they can NOT do:

- Be async functions (well, can be async, but the framework treats them differently).
- Directly access server-only resources (databases, secrets).
- Avoid shipping JavaScript — their code ends up in the browser bundle.

## The composition rules

The combination model has rules:

**Rule 1: Server Components can import and render Client Components.** This works:

```tsx
// Server Component
import { Counter } from './counter';

export default async function Page() {
  const data = await fetchData();
  return (
    <div>
      <h1>{data.title}</h1>
      <Counter /> {/* Client Component */}
    </div>
  );
}
```

The framework serializes the boundary; the client receives a placeholder for the Client Component and renders it client-side.

**Rule 2: Client Components can NOT directly import Server Components.** This doesn't work:

```tsx
// counter.tsx
'use client';
import { ServerThing } from './server-thing'; // Error

export function Counter() {
  return <ServerThing />;
}
```

Why? Once you're in client land (`'use client'`), you can't pop back to the server. The boundary is one-way.

**Rule 3: But you CAN pass Server Components as children/props to Client Components.** This works:

```tsx
// page.tsx (Server)
import { Tabs } from './tabs'; // Client Component
import { ServerContent } from './server-content';

export default function Page() {
  return (
    <Tabs>
      <ServerContent />
    </Tabs>
  );
}
```

The Server Component is rendered on the server; its output (the React tree, not the source) is passed as a child to the Client Component. The client tree renders it as already-rendered HTML.

This is the key composition pattern. Use it to keep heavy data fetching in Server Components while wrapping interactive UI in Client Components.

## When to use which

**Default to Server Components.** Smaller bundles, faster initial load, direct data access. Most pages and most UI doesn't need client-side state.

**Use Client Components when:**
- You need state (`useState`).
- You need effects (`useEffect`).
- You need browser APIs.
- You're handling events.
- You're using a third-party library that uses any of the above.

A common pattern: a server page that fetches data and renders mostly server-rendered content, with small islands of Client Components for interactive bits (search bar, modal, theme toggle, etc.).

## The 'use client' boundary

When you mark a file `'use client'`, **everything that file imports** also becomes part of the client bundle (unless it's marked server-only). The boundary at `'use client'` defines a tree — that file and its dependencies are client-side.

To minimize client bundle, push `'use client'` as far down the component tree as possible. A leaf component being client doesn't drag the rest of the page into the bundle.

```
Server Page
├── Server Header (no JS shipped)
├── Server Main Content (no JS shipped)
└── Client SearchBar (small island of JS)
    └── Client ResultsList (still in the same client tree)
```

vs

```
Client Page (everything client now)
├── Header
├── Main Content
└── SearchBar
```

The first ships much less JS. Composition matters.

## Server-only and Client-only protections

Sometimes you have code that absolutely must not cross the boundary — secrets, server-only libraries, browser-only globals. Mark them:

```tsx
// lib/server-only.ts
import 'server-only';
import { DATABASE_URL } from './env'; // Secret

export function getSecret() { /* ... */ }
```

If a Client Component imports this file (directly or transitively), the build will fail with an explicit error. Same in reverse:

```tsx
// lib/client-only.ts
import 'client-only';
// Uses browser APIs
```

These guards prevent accidental leaks. Use `server-only` for files that touch secrets.

## Data fetching in Server Components

Server Components let you fetch data directly without an API layer:

```tsx
async function Page() {
  const [posts, user] = await Promise.all([
    db.posts.findMany(),
    fetchUser(),
  ]);
  return <Content posts={posts} user={user} />;
}
```

Parallel fetches are simple. The framework streams the response as data arrives (more on streaming in lesson 4).

No more REST endpoints, tRPC, or fetch-from-getServerSideProps. The data fetch is co-located with the component that uses it.

## When the model breaks down

Some scenarios are awkward:

- **Real-time updates.** Server Components render once at request time. For continuous updates, you need Client Components subscribing to data.
- **Heavy interactivity.** A canvas-heavy app, complex state machines, real-time editing — these are mostly Client Components anyway.
- **Existing client-heavy codebases.** Migrating from Pages Router takes work; you can run both routers side-by-side during migration.

The model is opinionated. It works wonderfully for content-heavy sites with focused interactivity. It's awkward for fully interactive apps where almost everything needs client state.

## Mistakes to avoid

- **Wrapping everything in 'use client'.** Defeats Server Component benefits.
- **Trying to use hooks in Server Components.** Won't compile.
- **Forgetting 'use client' on files using browser APIs.** Cryptic build errors.
- **Importing Server Components from Client Components.** Composition rule violation.
- **Putting secrets in Client Components.** They ship to the browser.

## Summary

- Server Components are default; run on the server; never ship to the client.
- Client Components opt in via `'use client'`; hydrate in the browser; handle interactivity.
- Server can render Client; Client can receive Server as children/props.
- Default to Server; reach for Client only when you need state, effects, or browser APIs.
- Push `'use client'` to leaf components to minimize bundle size.
- Use `server-only` / `client-only` to guard sensitive code.

Next: file-based routing in the App Router.
