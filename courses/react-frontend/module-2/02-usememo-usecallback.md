---
module: 2
position: 2
title: "useMemo and useCallback"
objective: "When optimization is real and when it's noise."
estimated_minutes: 7
---

# useMemo and useCallback

## The misconception

Almost everyone overuses these hooks. The conventional advice "useMemo / useCallback for performance" is mostly wrong as stated. They're tools for specific problems, not blanket optimization.

Most cases where developers add useMemo/useCallback, they add overhead (the memoization itself costs something) without measurable benefit. Profile first; optimize second.

## What useMemo does

`useMemo` caches the result of a calculation between renders:

```tsx
const filteredItems = useMemo(
  () => items.filter(item => item.active),
  [items]
);
```

If `items` reference hasn't changed since last render, return the cached value. Otherwise, recompute.

Cost: React compares the deps array on every render; stores the value; runs the computation when deps change. The hook itself has overhead.

Use when:
- The computation is genuinely expensive (sorting 10k items, complex math, parsing).
- The result is used as a dep for another effect/memo (need referential stability).
- Profiling shows this computation matters.

Don't use when:
- The "computation" is cheap (filtering 10 items, simple arithmetic).
- You're just reading from state.

## What useCallback does

`useCallback` caches a function reference between renders:

```tsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

Returns the same function reference until `id` changes. Without useCallback, every render creates a new function instance.

Use when:
- The callback is passed to a child wrapped in `React.memo`, and you need to avoid invalidating its memoization.
- The callback is a dep of another effect/memo (need referential stability).
- Profiling shows ref instability is causing real re-renders.

Don't use when:
- The callback is just used in JSX (`onClick={() => ...}` is fine).
- The child isn't memoized — the callback ref doesn't matter.

## Why most uses are noise

```tsx
function List({ items }) {
  // ❌ Pointless: filter is cheap, result not used as dep.
  const filtered = useMemo(() => items.filter(i => i.active), [items]);
  
  // ❌ Pointless: handleClick is used in plain DOM elements.
  const handleClick = useCallback((id) => doSomething(id), []);
  
  return filtered.map(item => (
    <button key={item.id} onClick={() => handleClick(item.id)}>
      {item.name}
    </button>
  ));
}
```

useMemo adds overhead without benefit (filter is cheap). useCallback adds overhead without benefit (handleClick goes to a native button, no memoized child). Both can be removed and the component is faster.

## When useMemo actually helps

```tsx
function Dashboard({ logs }) {
  // Expensive aggregation — worth memoizing.
  const summary = useMemo(() => {
    return aggregateThousands(logs);  // Real work
  }, [logs]);
  
  return <Summary data={summary} />;
}
```

Or when the result must be referentially stable:

```tsx
const config = useMemo(() => ({ theme, locale }), [theme, locale]);

useEffect(() => {
  initSDK(config);
}, [config]);  // Without useMemo, config is a new object every render; effect re-runs forever.
```

The second case is critical — without memoization, the effect runs on every render.

## When useCallback actually helps

```tsx
const ExpensiveChild = React.memo(function ExpensiveChild({ onSubmit }) {
  // ... renders heavy UI
});

function Parent() {
  const [data, setData] = useState({});
  
  // Without useCallback, ExpensiveChild re-renders every Parent render.
  const handleSubmit = useCallback(() => {
    submit(data);
  }, [data]);
  
  return <ExpensiveChild onSubmit={handleSubmit} />;
}
```

`React.memo` on the child checks props by reference. New function every render = props change every render = memo doesn't help. useCallback keeps the function reference stable so memo works.

If `ExpensiveChild` isn't wrapped in `React.memo`, useCallback is irrelevant — the child re-renders anyway.

## React Compiler changes the equation

React 19 introduces React Compiler — automatically memoizes components, useMemo / useCallback at build time. With compiler enabled, manually adding these hooks is rarely needed; the compiler does it correctly.

For React 18 and earlier, manual memoization remains relevant. Going forward, this whole topic gets simpler.

## The cost of memoization

Both hooks have overhead:

- React stores the memoized value/function.
- React compares the deps array every render (shallow equality).
- The memo cache uses memory.

If the cached computation is cheap (filter 10 items), the comparison cost can exceed the computation cost. Net negative.

This is why profile-first matters. Adding memoization "to be safe" frequently makes things slower.

## React.memo basics

Different from useMemo — `React.memo` wraps a component to skip renders when props are reference-equal:

```tsx
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  return items.map(...);
});
```

Now `<ExpensiveList items={items} />` skips re-rendering if `items` reference is the same as last render.

Use when:
- The component renders frequently (parent re-renders often).
- The component is genuinely expensive (large list, complex layout).
- Props are stable across renders (or wrapped in useMemo / useCallback by parent).

Don't use when:
- Props change every render anyway (memo is wasted comparison).
- The component is trivial (memo overhead > render cost).

## Custom equality function

`React.memo` defaults to shallow equality. For custom checks:

```tsx
React.memo(Component, (prev, next) => {
  return prev.id === next.id && prev.version === next.version;
});
```

Use sparingly — custom equality is error-prone. Better to ensure stable references via useMemo at the parent.

## The deps array trap

```tsx
useMemo(() => compute(a, b), [a, b]);
```

If `a` and `b` are objects/arrays/functions created inline at the parent, they're new references every render. useMemo never hits its cache.

```tsx
function Parent() {
  const config = { theme };  // New object every render
  return <Child config={config} />;
}

const Child = React.memo(({ config }) => {
  // Memo never works — config is always a new reference.
});
```

Fix by memoizing the input:

```tsx
const config = useMemo(() => ({ theme }), [theme]);
```

Now `config` is stable when `theme` is stable. Child's memo works.

## When to NOT optimize

Most React apps don't need much memoization:

- Simple state updates re-rendering small subtrees: fast already.
- Lists of <100 items: usually fast to re-render.
- Static layouts: no perf problem.

Optimize when:
- React DevTools Profiler shows specific renders taking >16ms.
- The user notices lag.
- A particular interaction is provably slow.

If none of these apply, skip the memoization. Code stays simpler.

## A diagnostic process

When you suspect perf issues:

1. Open React DevTools Profiler.
2. Record an interaction that feels slow.
3. Look at the flame graph — what's rendering, how long?
4. Identify the specific slow component or chain.
5. Decide: should this not render? (memoize) Or is it inherently slow? (virtualize, lazy-load, defer).
6. Apply targeted optimization.
7. Profile again.

Without this process, you're guessing.

## Mistakes to avoid

- **Adding useMemo "for safety."** Usually slower than no memo.
- **useCallback for unrelated callbacks.** Only helps with memoized children.
- **Optimizing before profiling.** Wastes effort on non-bottlenecks.
- **Inline object props to memoized children.** Breaks the memoization.
- **Custom equality without need.** Error-prone.

## Summary

- useMemo for expensive computations OR referential stability needed downstream.
- useCallback for callbacks passed to React.memo'd children OR used as deps.
- React.memo for expensive components that re-render too often.
- Memoization has cost; skip when cheap to recompute.
- Profile first; optimize specific bottlenecks.
- React Compiler (coming with v19) automates most of this.

Next: custom hooks.
