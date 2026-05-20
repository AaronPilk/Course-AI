---
module: 3
position: 2
title: "Context: when it helps, when it hurts"
objective: "The re-render problem."
estimated_minutes: 7
---

# Context: when it helps, when it hurts

## What context does

Context provides values to a subtree without prop drilling. You create a Context, wrap a part of the tree in a Provider, and any descendant can read the value via useContext.

```tsx
const ThemeContext = React.createContext<'light' | 'dark'>('light');

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <ThemeContext.Provider value={theme}>
      <Layout />
    </ThemeContext.Provider>
  );
}

function DeeplyNested() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>...</div>;
}
```

No drilling through Layout, Header, Nav, etc. The leaf reads context directly.

## The re-render problem

Context has one significant gotcha: when the provider's value changes, EVERY component that consumes the context re-renders, regardless of whether they care about the specific change.

```tsx
const AppContext = React.createContext({ user: null, theme: 'light', notifications: [] });

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  
  const value = { user, theme, notifications };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
```

When `notifications` updates, every consumer (including ones that only care about `theme`) re-renders. The value object is new; React doesn't do field-level subscription.

For high-frequency updates with many consumers, this can crater performance. For stable values changing once in a while, it's fine.

## Splitting contexts

The standard fix: split into multiple smaller contexts.

```tsx
const UserContext = React.createContext(null);
const ThemeContext = React.createContext('light');
const NotificationsContext = React.createContext([]);

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  
  return (
    <UserContext.Provider value={user}>
      <ThemeContext.Provider value={theme}>
        <NotificationsContext.Provider value={notifications}>
          {children}
        </NotificationsContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}
```

Now updating `notifications` only re-renders `NotificationsContext` consumers. Each context has its own update cadence.

## Value identity matters

Every render of the Provider, a new object literal is created:

```tsx
<Context.Provider value={{ a, b }}>  // New object every render!
```

If `Provider` re-renders but `a` and `b` haven't changed, consumers still re-render because the value reference is new.

Wrap in `useMemo`:

```tsx
const value = useMemo(() => ({ a, b }), [a, b]);
return <Context.Provider value={value}>...
```

For setters returned from context, wrap in useCallback:

```tsx
const setUser = useCallback((u) => setUserState(u), []);
const value = useMemo(() => ({ user, setUser }), [user, setUser]);
```

Without these, every Provider re-render invalidates all consumers.

## Separate read and write contexts

A pattern for context-heavy apps: separate the value from the setter:

```tsx
const UserValueContext = React.createContext(null);
const UserSetterContext = React.createContext(() => {});

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserSetterContext.Provider value={setUser}>
      <UserValueContext.Provider value={user}>
        {children}
      </UserValueContext.Provider>
    </UserSetterContext.Provider>
  );
}

// Components that read user re-render when user changes.
// Components that only call setUser never re-render from user changes (setter is stable).
```

Useful when many components need to update the value but few need to read it (or vice versa).

## What context is good for

Genuinely subtree-wide values that change infrequently:

- **Theme** (light/dark).
- **Locale** for i18n.
- **Current user / session** (assuming login changes are rare).
- **Auth state** (logged in / out).
- **Feature flags.**
- **Modal/dialog stack** for app-level dialog management.

These have all the right shape: many consumers, slow updates, naturally scope to subtree.

## What context is bad for

- **High-frequency updates with many consumers.** Mouse position, scroll position, form state across many components.
- **State that only a few components share.** Lift instead.
- **Server data.** Use TanStack Query / SWR.
- **Anything you'd put in URL state.** Use URL.
- **State requiring derived selectors.** Use an external store with selector support.

If you find yourself optimizing context with multiple splits, useMemo dances, and selector workarounds, you've outgrown context. Move to a real store (Zustand, Jotai, Redux Toolkit).

## When to use external stores instead

Reach for Zustand / Jotai / Redux Toolkit when:

- Many components subscribe to state with different slices needed.
- You want selector-level subscription (re-render only on relevant changes).
- You want middleware (logging, persistence, devtools).
- You need state machines or complex transitions.
- You want to use state outside React components (services, utility functions).

Modern external stores are lightweight (Zustand is ~1KB). For non-trivial state, they often produce simpler code than context with selectors.

## Context with reducers

A common pattern: context + useReducer for app-wide state machines.

```tsx
type State = { /* ... */ };
type Action = { /* ... */ };

const StateContext = React.createContext<State>(initialState);
const DispatchContext = React.createContext<React.Dispatch<Action>>(() => {});

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

function useAppState() {
  return useContext(StateContext);
}

function useAppDispatch() {
  return useContext(DispatchContext);
}
```

Dispatch is naturally stable (React guarantees the reference). Consumers using only `useAppDispatch()` never re-render. Consumers using `useAppState()` re-render on state changes (but if you split state contexts further, you can scope this).

A poor person's Redux — works for medium-complexity apps without adding a dep.

## use(Context) — React 19

React 19 adds `use(Context)` that can be called conditionally:

```tsx
function MyComponent() {
  if (condition) {
    const theme = use(ThemeContext);  // OK
    // ...
  }
}
```

Solves a minor pain point — `useContext` had to be unconditional. Not a huge feature but useful for conditional context reads.

## Server Components and context

In Next.js App Router with Server Components: context is for Client Components. Server Components can't use `useContext` (no React state during server render).

For server-side "context" needs (passing values through a Server Component tree), use props. For client-side context, wrap with a Client Component provider near the top of the layout tree.

## Mistakes to avoid

- **One mega-context with everything.** Splits beat one big context.
- **No memoization of context value.** Re-renders on every Provider render.
- **Context for server data.** Use TanStack Query.
- **Context for high-frequency local state.** Lift, or use an external store.
- **Reaching for context before lifting.** Lift first; context for genuinely subtree-wide values.

## Summary

- Context = subtree-wide value sharing without drilling.
- Re-render gotcha: all consumers re-render when value changes.
- Split into smaller contexts; memoize value; consider read/write split.
- Good for: theme, locale, user, auth, feature flags.
- Bad for: high-frequency, narrow-sharing, server data.
- For complex needs, external stores beat context with optimization tricks.

Next: Zustand, Jotai, Redux Toolkit — modern state libraries.
