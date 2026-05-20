---
module: 2
position: 3
title: "Revalidation and optimistic UI"
objective: "Make mutations feel instant."
estimated_minutes: 7
---

# Revalidation and optimistic UI

## The mutation problem

After a mutation, multiple parts of the UI need to reflect the new state:

- The list the user just added to.
- Sidebar counts.
- Search index.
- Cached data from related queries.

Get this wrong and the user creates a new item, sees the same old list, and reloads — frustrated. Get it right and mutations feel instantaneous.

Next.js gives you two tools: server-side revalidation (rebuild fresh server state) and client-side optimistic UI (show new state immediately, before the server confirms).

## revalidatePath

`revalidatePath(path)` tells Next.js: "the cache for this path is stale; rebuild it on the next request."

```tsx
'use server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  await db.posts.create({ data: { ... } });
  revalidatePath('/posts');         // Invalidates /posts
  revalidatePath('/profile/[id]');  // Invalidates dynamic /profile/* pages
}
```

The next request for `/posts` re-fetches fresh data instead of serving the cached version. Users see the new post.

Paths can be:

- Specific: `/posts/abc-123`.
- Dynamic templates: `/posts/[slug]` (revalidates all instances).
- Layouts: pass `'layout'` as second arg to revalidate everything under that layout.

```tsx
revalidatePath('/posts/[slug]', 'page'); // The page
revalidatePath('/', 'layout');           // Everything under root layout
```

## revalidateTag

`revalidateTag(tag)` invalidates fetches that were tagged with that key:

```tsx
// When fetching:
fetch(url, { next: { tags: ['posts'] } });

// When mutating:
'use server';
import { revalidateTag } from 'next/cache';
revalidateTag('posts');
```

Useful when one mutation should invalidate many paths. Tagging `posts` and revalidating that tag invalidates the homepage post list, the /posts page, any page that fetched posts — anywhere with the tag.

Pattern:

```tsx
// All post fetches share a tag:
async function getPosts() {
  return fetch('/api/posts', { next: { tags: ['posts'] } });
}

// On mutation:
async function createPost(data) {
  await db.posts.create({ data });
  revalidateTag('posts');  // Invalidates everywhere posts are fetched.
}
```

Cleaner than tracking which specific paths fetch posts.

## Tag granularity

For finer control, tag individually:

```tsx
fetch(`/api/posts/${id}`, { next: { tags: [`post:${id}`] } });

// Invalidate just one post:
revalidateTag(`post:${id}`);
```

Or by collection + ID:

```tsx
fetch(url, { next: { tags: ['posts', `post:${id}`] } });
revalidateTag(`post:${id}`);  // Just this one
revalidateTag('posts');       // All posts
```

Choose granularity based on what your mutations affect.

## Optimistic UI basics

Revalidation triggers a fresh fetch — fast, but there's a small lag. For mutations where the result is predictable, show the new state immediately:

```tsx
'use client';
import { useOptimistic } from 'react';
import { addItem } from './actions';

export function ItemList({ items }: { items: Item[] }) {
  const [optimisticItems, addOptimistic] = useOptimistic(
    items,
    (current, newItem: Item) => [...current, newItem]
  );
  
  async function handleAdd(name: string) {
    const optimisticItem = { id: 'temp-' + Date.now(), name };
    addOptimistic(optimisticItem);
    await addItem(name);
  }
  
  return (
    <ul>
      {optimisticItems.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}
```

Behavior:

1. User clicks add.
2. UI shows the new item immediately (optimistic).
3. Server Action runs.
4. On success: framework re-renders with real data; the optimistic and real states reconcile.
5. On failure: React reverts to the original state.

The user sees instant feedback. The server eventually confirms.

## useOptimistic semantics

```tsx
const [optimisticValue, addOptimistic] = useOptimistic(
  serverValue,   // The current server state
  reducer        // (current, newAction) => newState
);
```

`optimisticValue` is what to render. `addOptimistic(action)` updates it via the reducer. After the underlying Server Action completes (and revalidates), `serverValue` updates and `optimisticValue` re-syncs to it.

The reducer is like Redux's reducer — pure function applying the action to the current state.

## Combining revalidation and optimistic

The full pattern:

1. Client calls Server Action.
2. Client optimistically updates UI.
3. Server Action mutates DB.
4. Server Action calls `revalidatePath` / `revalidateTag`.
5. Client re-renders with fresh server data.
6. Optimistic state syncs to server state (or reverts on error).

The user sees: instant feedback → eventual real confirmation.

## When NOT to use optimistic UI

Don't use optimistic UI when:

- **The result isn't predictable.** Server might compute something the client can't know (a generated ID, a moderation outcome, a validation result).
- **Rollback would confuse.** A payment that "succeeds" then reverts looks alarming.
- **The mutation is rare and critical.** Reset password, account deletion — let the loading state show.

Use optimistic UI for high-frequency, low-risk operations (likes, todos, toggles, drag-and-drop).

## Showing in-flight state

For mutations not using optimistic UI, show loading state via `useFormStatus`:

```tsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending}>
      {pending ? <Spinner /> : 'Save'}
    </button>
  );
}
```

Combined with disabled-on-success and `useFormState` for errors, you have a clear loading → success / error flow.

## SWR / React Query in App Router

For complex client-side caching beyond what Server Components provide (real-time data, optimistic updates with sophisticated rollback, retry logic), libraries like SWR and TanStack Query still fit:

```tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function PostList() {
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });
  
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
  
  return <ul>{data?.map(...)}</ul>;
}
```

Use these for parts of your app that need client-side data lifecycle. Most pages don't.

## Sequencing revalidations

If a mutation affects multiple cached areas:

```tsx
'use server';

export async function publishPost(id: string) {
  await db.posts.update({ where: { id }, data: { published: true } });
  
  revalidateTag('posts');                // Post list
  revalidateTag(`post:${id}`);          // The specific post
  revalidatePath('/');                  // Homepage
  revalidatePath('/profile/[id]', 'page'); // Author profile
}
```

Call all the relevant revalidations in the action. The framework batches them efficiently.

## Server-Sent Events for live updates

For data that updates from non-mutation sources (websocket-style updates from external systems), neither revalidation nor optimistic UI works. Use SSE or WebSockets via API routes or Supabase Realtime:

```tsx
'use client';
useEffect(() => {
  const sse = new EventSource('/api/posts/stream');
  sse.onmessage = (e) => updateLocalState(JSON.parse(e.data));
  return () => sse.close();
}, []);
```

Beyond the scope of Server Actions; but it's where you reach when the data has its own update lifecycle.

## Mistakes to avoid

- **No revalidation after mutations.** Stale data displayed.
- **Optimistic UI without rollback handling.** Inconsistent state on failure.
- **Revalidating too aggressively.** Defeats caching wins.
- **Mixing client-state mutations and server-state mutations.** Confusing source of truth.
- **Forgetting `revalidatePath` for dynamic routes.** Specific instance vs template.

## Summary

- `revalidatePath(path)` and `revalidateTag(tag)` after mutations.
- Tags are cleaner when one mutation affects many paths.
- `useOptimistic` for instant UI feedback before server confirms.
- Use optimistic UI for high-frequency low-risk mutations only.
- `useFormStatus` for non-optimistic loading states.
- SWR / TanStack Query for complex client-side caching.

Next: authentication patterns.
