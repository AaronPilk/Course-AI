---
module: 1
position: 4
title: "Concurrent rendering and Suspense"
objective: "How React 18+ schedules work."
estimated_minutes: 7
---

# Concurrent rendering and Suspense

## What changed in React 18

React 18 introduced concurrent rendering: the ability to interrupt, pause, and resume renders. Older React rendered synchronously — once it started, it ran to completion before the browser could do anything else. Now React can yield to higher-priority work (user input, animations) mid-render and resume later.

This unlocked Suspense for data, useTransition, useDeferredValue, automatic batching across async boundaries, and Server Components — features that depend on concurrent rendering being possible.

For most code, concurrent rendering is transparent. For library authors and performance-sensitive code, the rules are stricter (pure renders, no side effects in render). For app developers, the new hooks (`useTransition`, `useDeferredValue`, `Suspense`) are the visible additions.

## Suspense

`<Suspense>` declaratively handles async loading states:

```tsx
<Suspense fallback={<Spinner />}>
  <SlowComponent />
</Suspense>
```

When something inside throws a Promise (the Suspense protocol), React shows the fallback until the Promise resolves, then renders the children.

Libraries that support Suspense:

- **React.lazy** for code-split components.
- **TanStack Query** with `useSuspenseQuery`.
- **Next.js Server Components** (covered in Course #17).
- **Relay** for GraphQL.

For traditional `useEffect`-based fetching, Suspense doesn't help — those don't throw Promises. Modern data libraries opt into Suspense.

## Code splitting with React.lazy

Split heavy components into separate bundles, loaded on demand:

```tsx
const Editor = React.lazy(() => import('./Editor'));

function App() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <Editor />
    </Suspense>
  );
}
```

`Editor` doesn't ship with the initial bundle. When this code runs, the import kicks off; Suspense shows the skeleton. When the chunk arrives, Editor renders.

Use for:
- Routes (each page as a separate bundle).
- Heavy components (charts, rich text editors, video players).
- Rarely-used dialogs.

## Multiple Suspense boundaries

Each Suspense boundary is independent — slow parts don't block fast parts:

```tsx
<div>
  <Header />  {/* Renders immediately */}
  <Suspense fallback={<ChartSkeleton />}>
    <SlowChart />  {/* Streams in when ready */}
  </Suspense>
  <Suspense fallback={<ListSkeleton />}>
    <SlowList />  {/* Streams in independently */}
  </Suspense>
</div>
```

Header renders instantly; chart and list each show skeletons; both stream in when their data is ready. Independent.

This is the streaming pattern from Next.js App Router; works in any concurrent-React app.

## useTransition

Mark a state update as low-priority, allowing React to interrupt it for higher-priority work:

```tsx
const [isPending, startTransition] = useTransition();

function handleSearch(query) {
  setQuery(query);  // High priority — update input immediately.
  startTransition(() => {
    setResults(filter(items, query));  // Low priority — can be interrupted.
  });
}
```

Without `startTransition`, both updates have equal priority — typing in the search bar can lag while React re-renders the results list.

With `startTransition`, the input updates immediately (the user sees their keystroke). The expensive results render happens as a background transition; if the user types again before it completes, React abandons it and starts fresh.

`isPending` tells you a transition is in progress — show a subtle loading indicator without blocking the UI.

## useDeferredValue

Similar to useTransition but for derived values rather than state setters:

```tsx
const deferredQuery = useDeferredValue(query);

return <ExpensiveList query={deferredQuery} />;
```

`deferredQuery` lags behind `query`. When `query` changes, React holds `deferredQuery` at the previous value for a moment; if more state updates happen quickly, the deferred value stays stale; when things settle, it catches up.

Use cases:

- Search input where the results are expensive — `query` updates instantly, `deferredQuery` updates after a beat.
- Filter UI where the filter list is huge.

The UI stays responsive while expensive renders happen in the background.

## How React prioritizes

Roughly:

- **Sync (highest):** User input (typing, clicking).
- **Default:** Most state updates.
- **Transition (low):** Wrapped in `startTransition` or `useDeferredValue`.

React interleaves renders, preferring high-priority. A transition can be paused if the user types; on completion, React resumes or re-starts the transition with the latest state.

## Side effects in concurrent rendering

Concurrent rendering can call a component twice for the same render. If you have side effects in render, they fire twice. Strict Mode catches this in dev by double-invoking constructors, render functions, and effects.

The rules:

- **Renders must be pure.** No side effects.
- **State updates must be idempotent.** Same input → same result.
- **Side effects belong in useEffect / event handlers.**

Most code already follows these rules. Library code is where bugs hide.

## What Strict Mode catches

```tsx
<React.StrictMode>
  <App />
</React.StrictMode>
```

In dev:

- Components render twice.
- Effects mount → cleanup → mount again.
- Some lifecycle methods double-fire.

This surfaces bugs that would matter under concurrent rendering. In production, behavior is normal.

If your component breaks under Strict Mode, it has a real bug — usually missing cleanup or impure rendering. Fix the bug rather than disabling Strict Mode.

## Automatic batching

React 18 batches state updates across more boundaries than before:

```tsx
async function handleClick() {
  await fetch('/api');
  setLoading(false);
  setData(result);
  setError(null);
  // React 18: one re-render.
  // React 17: three re-renders.
}
```

Pre-18, batching only happened in event handlers. React 18 batches in promises, setTimeout, async functions, and elsewhere.

This is usually invisible — slight performance improvement, same behavior. If your code accidentally depended on the old (un-batched) behavior, you can opt out per-update with `flushSync`:

```tsx
import { flushSync } from 'react-dom';

flushSync(() => {
  setLoading(false);  // Flushed synchronously
});
setData(result);  // Re-rendered separately
```

Use sparingly — usually a sign you're working against React's grain.

## Suspense and data fetching

For Suspense to work with data fetching, the data library must throw promises that React can catch.

Modern libraries that support this:

```tsx
// TanStack Query
const { data } = useSuspenseQuery({ queryKey: ['posts'], queryFn });

// Relay
const data = usePreloadedQuery(query, queryRef);
```

`useEffect`-based fetching doesn't throw promises — it just sets state when the fetch completes. The component renders with empty state first, then with data. Suspense doesn't help.

For complex data needs, migrate to a Suspense-compatible library.

## Streaming SSR

Server-rendered React 18 streams HTML to the client as components render — slow components don't block fast ones from reaching the browser.

```tsx
// Server-rendered with streaming.
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>
```

Server sends initial HTML with skeleton. As SlowComponent resolves, server streams its HTML; client patches it in.

Result: fast TTFB even with slow components. Covered in detail in the Next.js course.

## useId for stable IDs

In SSR contexts, `Math.random()` IDs cause hydration mismatches. `useId` generates stable IDs:

```tsx
function Form() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Name</label>
      <input id={id} />
    </>
  );
}
```

Same ID server and client. Use for form labels, ARIA attributes, anything needing a unique ID per component instance.

## When you don't need to think about concurrency

Most apps:

- Default behavior is fine.
- Suspense for data fetching (via library) is the main visible feature.
- Strict Mode catches bugs in dev.
- Automatic batching is just an optimization.

You only deeply care about concurrency when:

- You're writing a library that touches React internals.
- You have specific performance issues where useTransition / useDeferredValue help.
- You're seeing Strict Mode failures.

## Mistakes to avoid

- **Side effects in render.** Break under concurrent rendering.
- **Race conditions in fetches.** Use cleanup or proper libraries.
- **Math.random in render for IDs.** Hydration mismatch; use useId.
- **Disabling Strict Mode.** Hides real bugs.
- **flushSync everywhere.** Usually fighting the framework.

## Summary

- React 18 introduced concurrent rendering; most code transparent.
- Suspense for declarative loading states; pair with libraries that throw promises.
- React.lazy for code splitting.
- useTransition / useDeferredValue for low-priority updates.
- Renders must be pure; side effects in useEffect.
- Automatic batching across async boundaries.
- useId for SSR-safe unique IDs.
- Strict Mode in dev catches concurrent-rendering bugs.

Next module: hooks done right.
