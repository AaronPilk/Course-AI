---
module: 2
position: 2
title: "Memoization done right"
objective: "React.memo, useMemo, useCallback rules."
estimated_minutes: 7
---

# Memoization done right

## The three memoization tools

React has three memoization primitives:

- **React.memo** — wrap a component to skip re-renders when props haven't changed.
- **useMemo** — cache a computed value between renders.
- **useCallback** — cache a function reference between renders.

Each one optimizes a specific thing. Each has overhead. Over-using them slows your app down.

## React.memo basics

```tsx
const ExpensiveItem = React.memo(function ExpensiveItem({ data }) {
  // ... heavy render
});
```

Now `<ExpensiveItem data={data} />` only re-renders when `data` reference changes (default shallow equality).

When it helps:

- The parent re-renders frequently.
- The child is genuinely expensive.
- The child's props are stable (or wrapped to be stable).

When it doesn't help:

- Props change every render anyway (memo wastes comparison time).
- Child is cheap (memo overhead > render cost).
- Parent rarely re-renders (memo unnecessary).

## React.memo + stable references

`React.memo` checks props with shallow equality. New object/function = different. Common trap:

```tsx
function Parent() {
  return <ExpensiveChild config={{ theme }} />;  // New object every render
}

const ExpensiveChild = React.memo(/* ... */);  // Doesn't help!
```

To make memo actually save renders, wrap object/function props with useMemo / useCallback:

```tsx
function Parent() {
  const config = useMemo(() => ({ theme }), [theme]);
  const handleClick = useCallback(() => {}, []);
  
  return <ExpensiveChild config={config} onClick={handleClick} />;
}
```

Now references are stable; memo's shallow check passes; renders skip when nothing material changed.

## Custom equality

For non-trivial props comparison:

```tsx
const ExpensiveItem = React.memo(
  function ExpensiveItem({ user }) { /* ... */ },
  (prev, next) => prev.user.id === next.user.id  // Only id matters
);
```

The comparator returns `true` if props are equal (skip render); `false` if different (render).

Use sparingly. Custom equality is error-prone — easy to miss a relevant field. Prefer ensuring stable references at the parent (cleaner).

## useMemo recipes

**Expensive computation:**

```tsx
const sorted = useMemo(
  () => items.sort((a, b) => b.score - a.score),
  [items]
);
```

Without memoization, the sort runs every render. With, only when `items` reference changes.

Caveat: sort is O(n log n). For 10 items, the memo overhead exceeds the sort cost. For 10,000, the memo saves real time.

**Referential stability for downstream:**

```tsx
const dependencies = useMemo(() => [a, b, c], [a, b, c]);

useEffect(() => {
  // ...
}, [dependencies]);
```

The downstream useEffect now only runs when the actual values change. Without useMemo, the array literal would be a new reference every render and the effect would run forever.

**Object props to memoized children:**

```tsx
const config = useMemo(() => ({ theme, locale }), [theme, locale]);
return <ExpensiveChild config={config} />;
```

Covered above. The pairing of useMemo + React.memo unlocks the perf win.

## useCallback recipes

**Callback passed to memoized child:**

```tsx
const handleClick = useCallback((id) => {
  doSomething(id);
}, []);  // Stable forever

return <MemoizedButton onClick={handleClick} />;
```

The child's memo check sees the same function reference; doesn't re-render.

**Callback as effect dependency:**

```tsx
const fetchData = useCallback(async () => {
  const result = await fetch(`/api/posts/${userId}`);
  setData(await result.json());
}, [userId]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

`fetchData` is stable when `userId` is stable; effect only runs when `userId` actually changes.

**Callback in a custom hook:**

```tsx
function useCounter() {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => setCount(c => c + 1), []);
  return { count, increment };
}
```

Consumers get a stable `increment` they can safely pass as a dep or to memoized children.

## When NOT to use useCallback

For callbacks passed to native HTML elements (not memoized React components):

```tsx
<button onClick={() => doSomething()}>...</button>
```

The native button doesn't care about callback identity. useCallback adds overhead with no benefit. Inline is fine.

For callbacks that aren't passed anywhere:

```tsx
function handleClick() {
  // ... internal logic only
}
```

If it's never a prop or dep, useCallback is pure overhead.

## The dependency array on memoization hooks

useMemo and useCallback both have deps arrays. Same rules as useEffect:

- Every reactive value used inside must be listed.
- ESLint's `exhaustive-deps` rule enforces.
- Lying about deps causes stale closures.

```tsx
const handler = useCallback(() => {
  doSomething(userId);  // userId is captured
}, []);  // ❌ Missing userId; will always use the initial userId
```

Linter catches this. Don't disable without understanding.

## Memoization doesn't compose well

A common antipattern:

```tsx
const memoA = useMemo(() => ({ x: a }), [a]);
const memoB = useMemo(() => ({ y: b }), [b]);
const combined = useMemo(() => ({ ...memoA, ...memoB }), [memoA, memoB]);
```

You've added three caches; each comparison costs time; the win is dubious unless the underlying object is genuinely expensive.

If your component has 10+ useMemo/useCallback calls, you've probably gone too far. Profile to see if any of them save measurable time; remove the ones that don't.

## React Compiler — coming relief

React 19 introduces React Compiler — an auto-memoizing build step. It analyzes your code and generates the equivalent of useMemo / useCallback / React.memo automatically and correctly.

With the compiler enabled:

- You don't write useMemo/useCallback manually.
- React.memo wrapping is unnecessary.
- The compiler avoids both over- and under-memoization.

For React 18 and earlier, manual memoization is still the way. For React 19+, the compiler does it better than humans. Worth watching the timeline; for some projects it's already production-ready.

## Stable identities from libraries

State libraries already provide stable refs:

- **useReducer's dispatch is stable.** Use it as a dep without useCallback.
- **Zustand actions are stable.** Same.
- **Refs from useRef are stable.** Same.

Don't wrap these in useCallback — they're already stable. Save useCallback for your own functions.

## When manual memo wins big

Some genuine wins from careful memoization:

- **List items in a 1000-item list.** Each memoized; only changed items re-render.
- **Heavy data transformations** (sorting, filtering, aggregation) cached at parent.
- **Stable callbacks passed to memoized children at the leaf of a tree.**
- **useMemo'd context value to avoid all-consumers-re-render storm.**

In each case, you can measure the improvement. That's the test.

## Mistakes to avoid

- **useMemo / useCallback on everything "for safety."** Adds overhead.
- **React.memo without stable props.** Memo's check always fails; net negative.
- **Custom equality without need.** Error-prone.
- **Memoizing cheap computations.** Cost > benefit.
- **Wrapping already-stable refs (dispatch, refs, store actions).** Pointless.

## Summary

- React.memo skips re-renders when props are shallow-equal.
- useMemo caches expensive computations or stable references.
- useCallback caches function references.
- Pair memoized children with stable prop references via useMemo/useCallback at the parent.
- Custom equality is error-prone; prefer stable refs.
- Don't over-memoize; profile to verify wins.
- React Compiler (v19) automates correct memoization.

Next: virtualization for long lists.
