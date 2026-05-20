---
module: 1
position: 1
title: "Components, elements, and the render cycle"
objective: "What actually happens when state changes."
estimated_minutes: 7
---

# Components, elements, and the render cycle

## The mental model

Most React bugs come from a fuzzy mental model of what happens when state changes. Once you understand the render cycle clearly, bugs become predictable and fixes obvious.

The core loop:

1. State or props change in a component.
2. React calls the component function (this is "rendering").
3. The function returns a React element tree (what UI should look like).
4. React diffs the new tree against the previous one (reconciliation).
5. React updates the DOM to match.
6. After DOM updates, React fires effects (`useEffect`, `useLayoutEffect`).

Each step has rules. Misunderstanding them produces stale closures, infinite loops, wrong UI, slow renders. Understanding them fixes most React problems.

## Components are functions

A React component is just a function that returns elements:

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}
```

When React "renders" `<Greeting name="Aaron" />`, it calls the function with `{ name: 'Aaron' }` and gets back `<h1>Hello, Aaron</h1>`.

Components run every render. Variables declared inside them are local to that render — different from the previous render, different from the next. This is critical for understanding closures (next lessons).

## Elements vs components

A common confusion: components are the function definitions; elements are what you create when you use them.

```tsx
const element = <Greeting name="Aaron" />;
// element is a plain object: { type: Greeting, props: { name: 'Aaron' } }
```

Elements are descriptions of what should render. Cheap to create. React then decides whether to instantiate / update / remove the actual DOM based on the element tree.

When you "render a tree," you're really constructing a tree of element objects. React turns that into DOM.

## What triggers a re-render

A component re-renders when:

- Its own state changes (via `setState` from `useState` or `useReducer`).
- Its parent re-renders (causing it to receive new props or just to be re-invoked).
- A context it consumes updates.

NOT triggered by:

- Mutating an object's properties (React compares by reference; mutated objects look the same).
- Ref changes (`useRef`'s `.current` updates).
- Anything that doesn't go through React's setState mechanisms.

The implication: state updates must be immutable. Don't `state.items.push(x)`; do `setState([...state.items, x])`. The new array has a new reference; React sees it as changed.

## Re-render propagation

When a parent re-renders, all its children re-render by default — even if their props didn't change.

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>+</button>
      <Counter />          {/* Re-renders every time, even though no props changed */}
      <Display value={42} /> {/* Same */}
    </>
  );
}
```

This is usually fine — React's render is cheap. But for genuinely expensive components, you can wrap with `React.memo` to skip re-renders when props haven't changed.

`memo` adds a check: are props the same as last time (shallow equality)? If yes, skip the render. Use sparingly — checks have their own cost.

## State updates batch

Multiple state updates in the same event get batched into one render:

```tsx
function handleClick() {
  setCount(count + 1);
  setName('Aaron');
  setActive(true);
  // Only ONE re-render happens after this function returns.
}
```

React 18+ batches across most async boundaries too (setTimeout, promises, fetch).

This means: `setCount(count + 1)` followed by another `setCount(count + 1)` in the same handler increments by 1, not 2 — because `count` is captured from the closure of the current render.

To increment based on previous state, use the updater function:

```tsx
setCount(c => c + 1);
setCount(c => c + 1);
// Now count goes up by 2.
```

The updater receives the latest state, even if other updates are queued.

## Stale closures

A subtle bug: variables in a render are from THAT render. If a setTimeout fires after several renders, it sees the stale values.

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setTimeout(() => {
      console.log(count);  // Prints the count at the time handleClick was called.
    }, 3000);
  }

  return <button onClick={handleClick}>Click</button>;
}
```

Click → counter is 0; setTimeout schedules. You click again — state updates to 1. After 3 seconds: still prints 0, not 1.

The fix: use a ref to always have the current value, or use the updater function pattern, or use useEffect properly.

## Render is pure

Rendering should be a pure function of props + state. No side effects. No API calls. No DOM manipulation. No mutating state.

```tsx
function BAD({ id }) {
  fetch(`/api/posts/${id}`);  // ❌ Side effect during render
  return <div>...</div>;
}
```

Side effects go in `useEffect`:

```tsx
function GOOD({ id }) {
  useEffect(() => {
    fetch(`/api/posts/${id}`);
  }, [id]);
  return <div>...</div>;
}
```

Render runs many times; side effects shouldn't.

## Why this matters

Common React bugs traced to render-cycle misunderstanding:

- **Infinite loops**: setState inside render → re-renders → setState → loop.
- **Stale closures**: setTimeout captures old state.
- **State that doesn't update**: mutating instead of setting.
- **Excessive re-renders**: not memoizing context values or callbacks.
- **Render happening at wrong time**: side effects in render instead of useEffect.

All fixable once you know the rules.

## Debugging renders

React DevTools Profiler shows what re-rendered and why:

1. Install React DevTools (browser extension).
2. Profile a session.
3. See flame chart of renders.
4. Hover over a render → "Why did this render?" shows props/state changes.

When unsure why something re-renders, the Profiler answers it.

## Concurrent rendering (React 18+)

Modern React can interrupt renders. If a high-priority update happens (user input) while a low-priority render is in progress, React pauses, handles the high-priority one, then resumes.

Implications:

- A component can render, get interrupted, and render again before mounting.
- Effects don't fire until the render commits.
- `useTransition` and `useDeferredValue` let you mark updates as low-priority.

For most code, this is transparent. For libraries, the rules are stricter — pure renders only; no side effects in render.

## Mistakes to avoid

- **Mutating state.** `state.x = 1` doesn't trigger re-render.
- **setState in render.** Infinite loop.
- **Side effects in render.** Belongs in useEffect.
- **Capturing stale values in async closures.** Use refs or updaters.
- **Assuming setState is synchronous.** Batched and async.
- **React.memo everywhere.** Adds overhead; use only when profiled.

## Summary

- Components are functions; elements are descriptions; render is calling the function.
- Re-renders triggered by setState, prop changes, context updates.
- State updates must be immutable.
- Renders batch within events; React 18+ batches more broadly.
- Render must be pure; side effects in useEffect.
- React DevTools Profiler shows why things re-rendered.

Next: reconciliation and keys.
