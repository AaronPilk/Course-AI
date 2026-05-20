---
module: 2
position: 4
title: "useRef, forwardRef, and imperatives"
objective: "When to escape declarative rendering."
estimated_minutes: 7
---

# useRef, forwardRef, and imperatives

## What refs are for

React is declarative — you describe what UI should look like, React reconciles to the DOM. But some things don't fit declaratively:

- Focusing an input.
- Measuring DOM size after layout.
- Triggering animations imperatively.
- Integrating with third-party libraries that control DOM.
- Storing values that change but shouldn't trigger re-renders.

`useRef` is the escape hatch. It gives you a stable mutable value across renders that doesn't cause re-renders when changed.

## useRef basics

```tsx
const inputRef = useRef<HTMLInputElement>(null);

function focus() {
  inputRef.current?.focus();
}

return <input ref={inputRef} />;
```

`useRef(initial)` returns `{ current: initial }`. The ref object is stable across renders — same object reference. Setting `ref.current = x` doesn't trigger a re-render.

For DOM refs, React assigns the DOM node to `ref.current` after the component mounts (and clears it on unmount).

## Two uses for useRef

**1. DOM access.**
```tsx
const inputRef = useRef<HTMLInputElement>(null);
// inputRef.current is the input element after mount.
```

**2. Mutable values without re-renders.**
```tsx
const renderCount = useRef(0);
renderCount.current += 1;
console.log(`Rendered ${renderCount.current} times`);
```

Use case: tracking values that change but don't affect rendering. State would cause re-renders; ref doesn't.

## When NOT to use refs

Refs are imperative — they bypass React's reactive model. Reach for them only when declarative approaches don't work.

```tsx
// ❌ Bad: ref for state
const valueRef = useRef('');
function handleChange(e) {
  valueRef.current = e.target.value;  // No re-render — input stays "empty" in UI.
}

// ✅ Good: useState
const [value, setValue] = useState('');
function handleChange(e) {
  setValue(e.target.value);
}
```

If the value needs to update the UI, use state. Refs are for things the UI doesn't directly reflect.

## Refs for DOM operations

Common DOM-ref patterns:

**Focus management:**
```tsx
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);
```

**Scroll into view:**
```tsx
const bottomRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

**Measuring:**
```tsx
const ref = useRef<HTMLDivElement>(null);
const [height, setHeight] = useState(0);
useLayoutEffect(() => {
  if (ref.current) setHeight(ref.current.offsetHeight);
}, []);
```

**Third-party library integration:**
```tsx
const mapRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (mapRef.current) {
    const map = new MapLibrary(mapRef.current);
    return () => map.destroy();
  }
}, []);
```

For each, the ref gives controlled access to the DOM without abandoning React's render lifecycle.

## forwardRef — passing refs through components

By default, refs only attach to DOM elements (and class components). To forward a ref through a function component:

```tsx
const FancyInput = React.forwardRef<HTMLInputElement, { placeholder: string }>(
  function FancyInput({ placeholder }, ref) {
    return <input ref={ref} placeholder={placeholder} />;
  }
);

function Parent() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <FancyInput ref={inputRef} placeholder="Type here" />;
}
```

Without `forwardRef`, `ref` on a function component is undefined. With it, the parent can pass a ref that lands on the inner DOM element.

Use when:
- You're building a reusable component that wraps an input/button.
- Consumers need to focus, measure, or otherwise interact with the inner element.
- Integrating with libraries that need DOM refs (form libraries, virtualization).

## useImperativeHandle

For when you want to expose a custom API instead of the raw DOM element:

```tsx
const TextInput = React.forwardRef<{ focus: () => void; clear: () => void }, Props>(
  function TextInput(props, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => { if (inputRef.current) inputRef.current.value = ''; },
    }), []);
    
    return <input ref={inputRef} {...props} />;
  }
);

// Parent uses:
const textRef = useRef<{ focus: () => void; clear: () => void }>(null);
textRef.current?.focus();
textRef.current?.clear();
```

The parent gets a custom interface, not the raw DOM. Use sparingly — usually exposing the DOM ref is fine. Custom imperative APIs invite over-coupling.

## Refs and the render cycle

A subtle gotcha: refs update during the render phase but their values are stable across that render. Writing to a ref in the render body is allowed but unusual:

```tsx
function Component() {
  const renders = useRef(0);
  renders.current += 1;  // OK; doesn't trigger re-render.
  // ...
}
```

Side effects (like DOM mutations) should still go in useEffect / useLayoutEffect, not in render.

## Callback refs

Instead of `useRef`, you can pass a function as the `ref` prop:

```tsx
function Component() {
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      console.log('mounted, height:', node.offsetHeight);
    } else {
      console.log('unmounted');
    }
  }, []);
  
  return <div ref={measureRef}>...</div>;
}
```

The function is called with the DOM node when mounted, and with `null` on unmount. Useful when you need to react to mount/unmount of an element (vs the imperative useRef pattern).

## Refs across re-renders

Refs persist across re-renders, including value changes:

```tsx
function Component({ id }: { id: string }) {
  const lastIdRef = useRef(id);
  
  useEffect(() => {
    if (lastIdRef.current !== id) {
      console.log('id changed from', lastIdRef.current, 'to', id);
      lastIdRef.current = id;
    }
  }, [id]);
}
```

This is the `usePrevious` pattern: store the last value, compare to current. Useful when you need "did this change" semantics.

## When state vs ref

A useful rule:

- **Anything affecting rendering → state.**
- **Anything that needs to survive renders but doesn't trigger them → ref.**

Examples:

- Input value displayed in UI → state.
- The last value we sent to an external API for comparison → ref.
- Whether a modal is open → state.
- A debounce timer ID → ref.
- Whether we've initialized a third-party SDK → ref.

State and refs aren't substitutes. They solve different problems.

## Imperative animations

For animations that depend on real-time DOM measurements:

```tsx
function ScrollIndicator() {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const onScroll = () => {
      const scrollPercent = (window.scrollY / document.body.scrollHeight) * 100;
      if (ref.current) {
        ref.current.style.width = `${scrollPercent}%`;
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  
  return <div ref={ref} className="indicator" />;
}
```

Updating `style.width` directly bypasses React rendering — fast, suitable for high-frequency updates. State would trigger a re-render every scroll event, lagging.

Use direct DOM mutations sparingly; React doesn't know about them. But for performance-sensitive animations (60fps scroll, drag-and-drop), this is legitimate.

## Refs in TypeScript

Type the ref carefully:

```tsx
// For DOM elements:
const inputRef = useRef<HTMLInputElement>(null);

// For mutable values:
const renderCount = useRef<number>(0);

// For values that might be set later:
const timerRef = useRef<NodeJS.Timeout | null>(null);
```

The initial value's type and the assigned type must align. TypeScript catches mismatches.

## Mistakes to avoid

- **Refs for state.** UI doesn't update.
- **Mutating refs in render to drive UI.** Doesn't work.
- **forwardRef where it's not needed.** Adds complexity.
- **useImperativeHandle for everything.** Encourages over-coupled APIs.
- **Direct DOM mutations affecting React-rendered content.** Conflicts on next render.

## Summary

- useRef = stable mutable container that doesn't trigger re-renders.
- DOM refs for focus, measurement, scroll, third-party integration.
- Mutable refs for values that should survive renders without rendering them.
- forwardRef to pass refs through function components.
- useImperativeHandle exposes custom imperative APIs (use sparingly).
- Callback refs for mount/unmount reactions.
- State for things affecting UI; refs for things that don't.

Next module: state management at scale.
