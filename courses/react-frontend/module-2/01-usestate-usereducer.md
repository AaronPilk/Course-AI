---
module: 2
position: 1
title: "useState and useReducer"
objective: "Picking the right state primitive."
estimated_minutes: 7
---

# useState and useReducer

## Two ways to manage local state

`useState` and `useReducer` both manage component-local state. They produce the same kind of values — state + setter — but with different shapes and trade-offs.

The short version: `useState` for simple values and independent state. `useReducer` when state updates have complex logic or multiple state fields update together.

## useState basics

```tsx
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);
```

Returns `[value, setter]`. Setter accepts:
- A new value: `setCount(5)`.
- An updater function: `setCount(c => c + 1)`.

Updater functions get the latest queued state — use them when the new state depends on the previous.

## Lazy initial state

If computing initial state is expensive:

```tsx
// ❌ Runs on every render (function is called, value discarded after first render):
const [data, setData] = useState(expensiveComputation());

// ✅ Runs only on first render:
const [data, setData] = useState(() => expensiveComputation());
```

The function form is called once on initial render. Use for parsing localStorage, computing initial complex state, or anything heavy.

## Multiple useState calls

For independent state, multiple useState calls is fine:

```tsx
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
}
```

React tracks them by call order; that's why hooks can't be conditional.

For state that always updates together, consolidating to one object is often cleaner:

```tsx
const [form, setForm] = useState({ name: '', email: '', age: 0 });

function updateField(field: keyof typeof form, value: any) {
  setForm(f => ({ ...f, [field]: value }));
}
```

Spread the previous state and override the changed field. Important: spread, don't mutate.

## When useState gets unwieldy

A few useState calls is fine. Many useState calls with interdependencies signals you should use useReducer.

Symptoms:

- 5+ useState calls in one component.
- State updates that always happen together (loading + data + error).
- State that depends on previous state in complex ways.
- Complex transitions (form steps, wizard flows).

These are useReducer cases.

## useReducer basics

A reducer is a pure function that takes state + action and returns new state:

```tsx
type State = { count: number; step: number };
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; step: number }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.step };
    case 'reset':
      return { count: 0, step: 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
  
  return (
    <>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'setStep', step: 5 })}>x5</button>
    </>
  );
}
```

Benefits:
- All state transitions in one place — easier to reason about.
- Dispatch is stable (same reference across renders); doesn't trigger child re-renders.
- Easier to test (reducer is a pure function).
- TypeScript narrows action types based on `type`.

## useReducer vs useState — picking

**useState:**
- Independent state.
- Simple updates.
- 1-3 state values per component.

**useReducer:**
- Coordinated state (multiple fields update together).
- Complex transitions (state machines).
- Many possible actions on the same state.
- Need to test transitions separately.
- Want stable dispatch reference.

Rule of thumb: start with useState. Migrate to useReducer when state updates become tangled.

## Reducers must be pure

Like all React rendering, reducers must be pure:

```tsx
// ❌ Bad — side effect in reducer
function reducer(state, action) {
  switch (action.type) {
    case 'add':
      localStorage.setItem('items', JSON.stringify(state.items));  // ❌
      return { ...state, items: [...state.items, action.item] };
  }
}

// ✅ Good — pure transition; side effect in useEffect
function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return { ...state, items: [...state.items, action.item] };
  }
}

useEffect(() => {
  localStorage.setItem('items', JSON.stringify(state.items));
}, [state.items]);
```

Reducers can be called multiple times for the same action under Strict Mode; side effects double-fire. Keep them pure.

## State machines

For complex state transitions, a state machine pattern is even cleaner:

```tsx
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: string };

type Action =
  | { type: 'fetch' }
  | { type: 'success'; data: Data }
  | { type: 'failure'; error: string }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'fetch':
      return { status: 'loading' };
    case 'success':
      return { status: 'success', data: action.data };
    case 'failure':
      return { status: 'error', error: action.error };
    case 'reset':
      return { status: 'idle' };
  }
}
```

The discriminated union prevents impossible states (e.g., `status: 'loading'` with `error` set). TypeScript narrows based on `status`.

For complex flows (multi-step forms, drag-and-drop, async workflows), libraries like XState provide formal state machine modeling on top of this pattern.

## Initial state from props

A subtle bug: initializing state from props once means later prop changes don't update state:

```tsx
function Comment({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);  // Only used on mount!
  // If `initial` changes, `text` stays at the original value.
}
```

If you need to "reset on prop change," use the key pattern from Module 1:

```tsx
<Comment key={comment.id} initial={comment.body} />
```

Changing `comment.id` remounts the component with the new initial.

Or, accept that you have controlled vs uncontrolled state and design accordingly.

## Storing functions in state

Be careful with useState and functions:

```tsx
const [handler, setHandler] = useState(() => myFunction);  // Works
const [handler, setHandler] = useState(myFunction);  // Calls myFunction!
```

The `useState(fn)` form treats `fn` as lazy init — calls it once. To store a function, wrap in another function: `useState(() => fn)`.

Same with setter:

```tsx
setHandler(myFn);  // ❌ Calls myFn as updater
setHandler(() => myFn);  // ✅ Sets value to myFn
```

Edge case but trips people up.

## When state lives elsewhere

useState is local. For state shared across components:

- **Lifted state:** move to a common ancestor.
- **Context:** wrap subtree, share value via useContext.
- **External store:** Zustand, Redux Toolkit, etc.
- **URL state:** for filterable/shareable state, the URL is a state container.

Covered in Module 3.

## Mistakes to avoid

- **Mutating state inside reducers.** Spread or use Immer.
- **Initial state from props expecting reactivity.** Use key remount.
- **Side effects in reducers.** Keep pure; effects in useEffect.
- **useState for tightly-coupled fields.** Migrate to useReducer.
- **Lazy init when not needed.** Only for genuinely expensive computation.

## Summary

- useState for simple independent state.
- useReducer for coordinated transitions, complex actions, state machines.
- Reducers must be pure — return new state, no side effects.
- Discriminated unions for type-safe state machines.
- Lazy init `useState(() => ...)` for expensive initial state.
- For shared state, lift / context / external store.

Next: useMemo and useCallback.
