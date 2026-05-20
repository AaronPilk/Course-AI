---
module: 1
position: 3
title: "Effects and the dependency array"
objective: "useEffect done right (and when not to)."
estimated_minutes: 7
---

# Effects and the dependency array

## What useEffect is actually for

`useEffect` synchronizes a component with something **outside React**: the DOM, a network request, a subscription, a timer, an analytics service. It runs after render commits to the DOM.

It is NOT for:

- Transforming data based on props or state (do that inline or with `useMemo`).
- Reacting to events (use event handlers).
- Initializing state (use `useState` with a function).
- Communicating between components (lift state or use context).

Most `useEffect` bugs come from using it for things it's not for. If you're reaching for `useEffect`, ask first: does this synchronize with something outside React? If no, you probably don't need it.

## The basic shape

```tsx
useEffect(() => {
  // Side effect runs after commit.
  
  return () => {
    // Cleanup runs before the next effect or on unmount.
  };
}, [dep1, dep2]);
```

Three parts:
- **Effect function** — runs after each render where deps changed.
- **Cleanup function** — runs before next effect and on unmount.
- **Dependency array** — controls when the effect re-runs.

## The dependency array rules

The deps array is not optional and not flexible. React requires every value used inside the effect to be listed.

```tsx
useEffect(() => {
  document.title = `Hello, ${name}`;
}, [name]);  // name is used inside; must be listed.
```

If you reference props, state, or other reactive values without listing them, you get stale closure bugs — the effect runs with old values.

The `react-hooks/exhaustive-deps` ESLint rule enforces this. Don't disable it without understanding why; almost every disabled instance is a bug waiting to happen.

## Three deps array shapes

**No array:** `useEffect(fn)` — runs after every render. Rare; usually a bug.

**Empty array:** `useEffect(fn, [])` — runs once on mount, cleanup on unmount.

**With deps:** `useEffect(fn, [a, b])` — runs when a or b changes.

For "run on mount" effects (subscribing to a global event, starting a timer once), empty array is correct. For effects that depend on props/state, list the deps.

## The cleanup function

Cleanup is the under-used half of useEffect. Run before each new effect and on unmount:

```tsx
useEffect(() => {
  const id = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(id);
}, []);
```

Without cleanup, every render that re-runs the effect adds another interval. After 10 re-renders, 10 intervals are firing.

Same pattern for:
- Subscriptions: subscribe in effect, unsubscribe in cleanup.
- Event listeners: addEventListener / removeEventListener.
- WebSocket connections.
- AbortController for fetches.

Forgetting cleanup is one of the top React performance bugs.

## Effect runs in Strict Mode

In development with Strict Mode (default in modern React), effects mount → unmount → mount on initial render. This catches missing cleanup.

If your effect doesn't tolerate "mount, cleanup, mount again" in dev, it has a real bug — production won't double-fire, but cleanup might still need to fire (route change, route back, etc.).

Write effects that work correctly when called multiple times. Subscriptions cleanup, fetches abort, timers clear.

## Stale closures in effects

```tsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);  // ⚠️ Captures count from THIS render's closure.
  }, 1000);
  return () => clearInterval(id);
}, []);  // Empty deps — effect runs once; closure is from initial render.
```

`count` is 0 in the closure. Every tick: `setCount(0 + 1)`. State goes to 1, never beyond.

Fix with updater function:

```tsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1);  // Always current state.
  }, 1000);
  return () => clearInterval(id);
}, []);
```

Or list `count` as a dep:

```tsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);  // Effect re-runs every count change — interval restarts.
```

The updater pattern is usually cleaner.

## Fetching in useEffect

A common pattern, with subtle issues:

```tsx
useEffect(() => {
  fetch(`/api/posts/${id}`)
    .then(r => r.json())
    .then(setData);
}, [id]);
```

Problems:
- **Race conditions.** id changes from 1 → 2 → 3 quickly; fetch 1 might resolve last, overwriting fetch 3's data.
- **No abort on unmount.** Fetch continues after component unmounts.
- **No error handling.**

Fix:

```tsx
useEffect(() => {
  let cancelled = false;
  const controller = new AbortController();
  
  fetch(`/api/posts/${id}`, { signal: controller.signal })
    .then(r => r.json())
    .then(data => {
      if (!cancelled) setData(data);
    })
    .catch(err => {
      if (err.name !== 'AbortError') console.error(err);
    });
  
  return () => {
    cancelled = true;
    controller.abort();
  };
}, [id]);
```

Better: use TanStack Query or SWR. They handle all this for you (race conditions, abort, retries, caching). For anything beyond trivial fetching, reach for them.

## When NOT to use useEffect

**Don't use for derived state:**

```tsx
// ❌ Bad
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);

// ✅ Good — derive during render
const fullName = `${first} ${last}`;
```

**Don't use for reacting to props:**

```tsx
// ❌ Bad
useEffect(() => {
  setCount(props.initialCount);
}, [props.initialCount]);

// ✅ Good — use key to reset, or accept the prop change directly
```

**Don't use to send events to parents:**

```tsx
// ❌ Bad
useEffect(() => {
  onChange(value);
}, [value, onChange]);

// ✅ Good — call onChange in the handler that sets value
```

The "do I need useEffect?" doc on react.dev lists more antipatterns. Worth reading.

## useLayoutEffect

Identical API to useEffect but runs synchronously after DOM updates, before the browser paints. Use when:

- You need to measure DOM size and adjust before paint.
- You need to read the new DOM and modify it without flicker.

```tsx
const ref = useRef(null);
useLayoutEffect(() => {
  if (ref.current.scrollHeight > 200) {
    ref.current.style.maxHeight = '200px';
  }
}, [content]);
```

Use sparingly — blocks paint, can hurt performance. useEffect is the default; useLayoutEffect is the escape hatch.

## Subscriptions and useSyncExternalStore

For subscribing to external stores (browser APIs, Redux, third-party state), React 18 added `useSyncExternalStore`:

```tsx
const isOnline = useSyncExternalStore(
  (callback) => {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    return () => {
      window.removeEventListener('online', callback);
      window.removeEventListener('offline', callback);
    };
  },
  () => navigator.onLine,
  () => true  // Server-side default
);
```

More correct than useEffect for external store subscriptions — handles concurrent rendering properly, prevents tearing.

For app code, libraries (TanStack Query, Zustand, Redux Toolkit) wrap this. Worth knowing exists.

## Object/function deps cause re-runs

```tsx
useEffect(() => {
  // ...
}, [{ id: 1 }]);  // New object every render → effect re-runs every render
```

Object literals and function expressions create new references every render. Wrap in useMemo / useCallback if you must include them as deps:

```tsx
const config = useMemo(() => ({ id }), [id]);
useEffect(() => {
  // ...
}, [config]);
```

Or refactor to depend only on primitives.

## Mistakes to avoid

- **Disabling exhaustive-deps without reason.** Almost always a bug.
- **No cleanup for subscriptions/timers.** Memory leaks.
- **Fetching without abort/race handling.** Stale data.
- **useEffect for derived state.** Render-time logic.
- **Object/function deps.** Re-run forever.
- **useLayoutEffect when useEffect would do.** Performance hit.

## Summary

- useEffect synchronizes with external systems; not for derived data.
- Deps array required; every reactive value used inside must be listed.
- Cleanup function handles subscriptions, timers, fetches.
- Strict Mode double-fires effects in dev to catch missing cleanup.
- For fetching, use TanStack Query / SWR instead of raw useEffect.
- useLayoutEffect for sync DOM measurement; useSyncExternalStore for external stores.

Next: concurrent rendering and Suspense.
