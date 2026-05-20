---
module: 2
position: 3
title: "Custom hooks"
objective: "Extracting logic without coupling."
estimated_minutes: 7
---

# Custom hooks

## What custom hooks are

A custom hook is a function that uses React hooks and returns values for components to consume. The convention: name it `useXxx`. That's the whole concept.

```tsx
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  
  return size;
}

// Use anywhere:
function Hero() {
  const { width } = useWindowSize();
  return <div>Width: {width}</div>;
}
```

Custom hooks let you share stateful logic between components without inheritance, HOCs, or render props.

## When to extract a custom hook

Extract when:
- The same hook logic appears in 2+ components.
- A component has many hooks doing one logical thing.
- A piece of stateful logic is testable independently.
- Naming the logic clarifies the component code.

Don't extract for:
- Single use with no clear reuse path (premature abstraction).
- Logic that's tightly coupled to one component's specific UI.

## Common patterns

**useToggle** — boolean state with a toggle:

```tsx
function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}

function Component() {
  const [isOpen, toggleOpen] = useToggle();
  return <button onClick={toggleOpen}>{isOpen ? 'Close' : 'Open'}</button>;
}
```

**useLocalStorage** — state synced to localStorage:

```tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue] as const;
}
```

**useDebounce** — debounce a value:

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  
  return debouncedValue;
}
```

**usePrevious** — track the previous value of a variable:

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

## Hooks for fetching

A common pattern in pre-TanStack-Query codebases:

```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    
    return () => { cancelled = true; };
  }, [url]);
  
  return { data, loading, error };
}
```

This works but lacks caching, deduplication, retry logic, race condition handling beyond cancellation. For real apps, use TanStack Query or SWR instead of rolling your own. Custom fetch hooks are educational but rarely the right answer in production.

## Composition

Custom hooks can use other custom hooks:

```tsx
function useDebouncedSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  const { data, loading } = useFetch(`/api/search?q=${debouncedQuery}`);
  
  return { query, setQuery, results: data, loading };
}
```

Compose simple hooks into more specific ones. Each layer is independently testable.

## Rules of hooks (still apply)

Custom hooks follow the same rules as built-in hooks:

- **Top-level only.** No conditional `if (x) useEffect(...)`.
- **In React functions only.** Components or other hooks.
- **Naming convention.** Starts with `use` — the linter enforces hook rules in such functions.

Breaking these gives runtime errors or stale state. The ESLint plugin `eslint-plugin-react-hooks` catches violations.

## Returning a single value vs multiple

Single-purpose hooks: return one value.

```tsx
const size = useWindowSize();
```

Multi-value hooks: return either an array (when order matters and tuples are useful) or an object (when fields have distinct meanings):

```tsx
// Array — like useState
const [isOpen, toggle] = useToggle();

// Object — when naming clarifies
const { data, loading, error } = useFetch('/api');
```

The convention: arrays for paired state+setter; objects for richer return values.

## Stable references

If your custom hook returns functions that consumers might pass to memoized children or use as effect deps, wrap them in `useCallback`:

```tsx
function useCounter() {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(0), []);
  
  return { count, increment, decrement, reset };
}
```

Now `increment`/`decrement`/`reset` are stable across renders; consumers can safely memo or use as deps.

For values returned from custom hooks that go into deps arrays, prefer stable references — saves the consumer from wrapping in their own useMemo.

## Hooks should be cohesive

A good custom hook handles ONE concept end-to-end:

- `useFormField` — value + validation + dirty state for one field.
- `usePagination` — current page + page size + setters.
- `useDocumentTitle(title)` — sets document.title; nothing else.

Anti-pattern: a "kitchen sink" hook that returns 20 unrelated things. Split into separate hooks per concern.

## Testing custom hooks

`@testing-library/react` provides `renderHook`:

```tsx
import { renderHook, act } from '@testing-library/react';

test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter());
  
  expect(result.current.count).toBe(0);
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

`act()` wraps state updates so React processes them before assertions. Custom hooks are typically simpler to test than components.

## When custom hooks aren't the answer

Some logic shouldn't be a hook:

- **Pure functions.** If it doesn't use hooks (state, effects, refs), make it a plain function: `formatDate(date)`, not `useFormatDate(date)`.
- **Class-based state.** If you have an OOP-style stateful object, sometimes a regular class with refs is cleaner.
- **External libraries.** Wrapping a non-React library in a custom hook is sometimes worth it (`useStripe`, `useAuth`); sometimes the library exports its own hook.

A common smell: a "hook" that returns the same value every time and doesn't use any React APIs. That's just a function; rename it.

## Mistakes to avoid

- **Custom hook just to wrap useState.** No abstraction value.
- **`use`-prefixed functions that aren't hooks.** Confuses tooling.
- **Hooks that don't follow the rules.** ESLint catches; trust it.
- **Returning unstable references unnecessarily.** Wrap in useCallback when consumers might need stability.
- **One mega-hook with 10 returns.** Split into smaller hooks.

## Summary

- Custom hooks share stateful logic between components.
- Convention: `useXxx` naming so linter enforces hook rules.
- Common patterns: useToggle, useLocalStorage, useDebounce, usePrevious.
- Compose smaller hooks into more specific ones.
- Return values: tuples for state+setter pairs; objects for richer returns.
- Wrap returned functions in useCallback for stable references.
- Test with `renderHook` from React Testing Library.
- Not everything should be a hook — pure functions stay functions.

Next: useRef, forwardRef, and imperatives.
