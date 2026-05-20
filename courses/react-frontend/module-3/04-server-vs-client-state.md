---
module: 3
position: 4
title: "Server state vs client state"
objective: "Why TanStack Query / SWR matter."
estimated_minutes: 7
---

# Server state vs client state

## The distinction that changes everything

For years, React developers stored fetched data the same way as UI state: in useState, in Redux, in Context. That worked, but it was the wrong tool. Fetched data has different problems than UI state, and tools that conflate them produce buggy, hard-to-maintain code.

The conceptual shift is recognizing that "data fetched from a server" is a fundamentally different category than "is this modal open." Once you split them, your code gets dramatically better.

## What client state is

UI state owned entirely by the frontend:

- Is a modal open?
- What's typed in this input?
- Which tab is active?
- What's the current theme?
- Is the sidebar collapsed?

Properties:

- You own it; there's no source-of-truth elsewhere.
- It doesn't "go stale" — the latest value is the truth.
- Cheap to update; easy to reason about.

Tools: useState, useReducer, Context, Zustand, Jotai, Redux Toolkit.

## What server state is

Data that lives on a server, fetched and displayed:

- The list of products.
- Current user's profile.
- Comments on a post.
- Order history.

Properties:

- You don't own it; the server does.
- It can change without your knowledge (other users, jobs, integrations).
- It can be stale — what you have isn't necessarily current.
- Fetching costs time and bandwidth.
- Multiple components may want the same data.
- Refreshing matters, sometimes urgently.

Tools: TanStack Query, SWR, RTK Query, Relay.

## Why client-state tools fail for server state

When you store server data in useState/Redux, you re-implement (badly) what server-state libraries do well:

**Loading states.** You manually track `loading: boolean`. You probably forget the `error` state. Every fetch gets the same dance:

```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch('/api/posts')
    .then(r => r.json())
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

Multiply by every fetch in the app. Painful.

**Deduplication.** Two components both fetch `/api/me` → two HTTP requests for the same data. Server-state libraries deduplicate automatically.

**Caching.** Component unmounts and remounts → refetch from scratch. Libraries cache results; remount is instant.

**Stale-while-revalidate.** Show cached data immediately while refetching in background. Libraries do this; manual code skips it.

**Refetch on focus.** User comes back to the tab; library refetches automatically; manual code doesn't know.

**Refetch on reconnect.** Network drops and returns; library refetches. Manual code doesn't.

**Optimistic updates.** Mutation → show new state instantly → rollback on failure. Libraries provide primitives; manual code is hard.

**Cancellation.** Component unmounts during fetch → abort. Libraries handle. Manual code usually leaks.

**Retries.** Failed fetch → retry with exponential backoff. Libraries built in. Manual code rarely.

Add up the missing features. Server-state libraries solve them all in one dep.

## TanStack Query basics

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function PostList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(r => r.json()),
  });
  
  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;
  return <List posts={data} />;
}
```

That's a complete fetch with loading state, error state, caching, dedup, and (with default config) refetch-on-focus.

For mutations:

```tsx
function CreatePost() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (newPost) => fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(newPost),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
  
  return <button onClick={() => mutation.mutate(post)}>Create</button>;
}
```

Mutate → invalidate the posts query → automatic refetch → new data shows up everywhere.

## Query keys

Query keys identify cached data:

```tsx
useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
useQuery({ queryKey: ['posts', { status: 'published' }], queryFn: fetchPublished });
useQuery({ queryKey: ['post', postId], queryFn: () => fetchPost(postId) });
```

Same key = same cache entry. Different keys = different entries. Hierarchical: `invalidateQueries({ queryKey: ['posts'] })` invalidates everything starting with `posts`.

Keys are how the library knows what to dedupe and what to invalidate.

## Stale and cache times

Two concepts:

- **staleTime** — how long data is considered fresh; no refetch happens during this window.
- **cacheTime / gcTime** — how long unused data stays in cache before being garbage-collected.

Defaults: stale immediately, cache for 5 minutes.

Tuning:

```tsx
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 60 * 1000,  // 1 minute fresh
  gcTime: 10 * 60 * 1000, // 10 minutes cache
});
```

For rarely-changing data (config, taxonomy), long staleTime saves requests. For real-time data (live scores), short or zero.

## Refetch policies

```tsx
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  refetchOnWindowFocus: true,    // Default true; refetch when tab regains focus
  refetchOnReconnect: true,       // Default true; refetch on network reconnect
  refetchInterval: 30 * 1000,     // Polling: every 30s
  refetchOnMount: 'always',       // Always refetch when component mounts
});
```

These knobs let you tune freshness vs network cost per query.

## Optimistic updates

```tsx
const mutation = useMutation({
  mutationFn: updatePost,
  
  // Run before the mutation fires
  onMutate: async (newPost) => {
    await queryClient.cancelQueries({ queryKey: ['post', newPost.id] });
    
    const previous = queryClient.getQueryData(['post', newPost.id]);
    queryClient.setQueryData(['post', newPost.id], newPost);
    
    return { previous };
  },
  
  // Rollback on error
  onError: (err, newPost, context) => {
    queryClient.setQueryData(['post', newPost.id], context.previous);
  },
  
  // Always refetch after settlement
  onSettled: (data, error, newPost) => {
    queryClient.invalidateQueries({ queryKey: ['post', newPost.id] });
  },
});
```

UI updates instantly; mutation runs; on failure, automatically reverts. Without a library, this is many lines of careful state machine code.

## SWR — the alternative

`useSWR` is similar in spirit, simpler API:

```tsx
import useSWR from 'swr';

function Profile() {
  const { data, error, isLoading } = useSWR('/api/me', fetcher);
  // ...
}
```

Stands for "stale-while-revalidate." Same core ideas as TanStack Query; slightly different API; smaller bundle. Picking between them is mostly preference.

## When NOT to use a server-state library

For very small apps with one or two fetches: raw useEffect can be fine. The library overhead exceeds the benefit.

For static data baked into the bundle: just import. No fetching, no library needed.

For real-time data via WebSocket / SSE: library helps with initial load + cache, but the streaming connection is separate.

For most apps with more than ~3 server fetches, a library wins quickly. Pay the small dep cost; reclaim all the manual state-management code.

## What goes where (the cleanup)

After splitting:

- **Server data:** TanStack Query / SWR. No more manual loading flags.
- **Form draft values:** local state (useState) or Form library (React Hook Form — covered later).
- **App-wide UI state:** Zustand / Context (theme, sidebar, modal stack).
- **Component UI state:** local useState (open/closed, active tab, hover).
- **URL state:** searchParams (filters, page, sort).

Each tool to its purpose. The store gets smaller; the components get simpler; bugs around data freshness mostly disappear.

## Migration strategy

If your codebase mixes server data into Redux:

1. Add TanStack Query to the app (small dep, no conflict).
2. Pick one feature; migrate its fetches to useQuery.
3. Strip its loading/error/data slices from Redux.
4. Repeat per feature.
5. Eventually Redux holds only client state — much smaller.

Incremental. Both can coexist during migration.

## Mistakes to avoid

- **Manual fetch in useEffect for everything.** Re-implementing the library, badly.
- **Server data in Redux/Zustand.** Confused store; missing features.
- **No query keys.** Cache misses; impossible to invalidate.
- **Forgetting to invalidate after mutations.** Stale UI.
- **Heavy reliance on `refetchInterval` everywhere.** Polling at scale; refetchOnFocus is usually enough.

## Summary

- Client state: UI you own. Server state: data the backend owns.
- Different problems require different tools.
- Server-state libraries handle caching, dedup, refetch, optimistic updates.
- TanStack Query and SWR are the standards.
- Query keys identify cached data; invalidate after mutations.
- Tune staleTime / gcTime per query.
- Migrate incrementally; both can coexist.

Next module: Performance.
