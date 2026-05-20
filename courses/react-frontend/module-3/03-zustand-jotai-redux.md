---
module: 3
position: 3
title: "Zustand, Jotai, Redux Toolkit"
objective: "Modern state libraries compared."
estimated_minutes: 7
---

# Zustand, Jotai, Redux Toolkit

## The 2026 landscape

The state management library debate has settled into three legitimate options for client state:

- **Zustand** — small, hooks-first store. The pragmatic default.
- **Jotai** — atomic state. Granular subscriptions.
- **Redux Toolkit** — official Redux with modern ergonomics. Battle-tested.

Each fits different needs. The right choice depends on team familiarity, app shape, and complexity.

This lesson is a tour. None of them are wrong; they're trade-offs.

## Zustand — the simplest store

```tsx
import { create } from 'zustand';

interface BearStore {
  bears: number;
  increase: (by: number) => void;
  reset: () => void;
}

const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
  reset: () => set({ bears: 0 }),
}));

// In components:
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  return <h1>{bears} bears</h1>;
}

function Controls() {
  const increase = useBearStore((state) => state.increase);
  return <button onClick={() => increase(1)}>+</button>;
}
```

What you get:

- **Hooks-first.** No Provider, no context.
- **Selectors.** Components subscribe to specific slices; re-render only on slice change.
- **TypeScript-friendly.**
- **~1KB.**
- **Outside-React access.** Call `useBearStore.getState()` anywhere.
- **Middleware.** Persistence, devtools, immer, subscribeWithSelector.

Why teams pick Zustand:
- Minimal boilerplate.
- Selectors solve context's re-render problem.
- Easy to test (store is just a function).
- Works for small and medium apps without ceremony.

Drawbacks:
- No enforced structure — easy to write messy stores.
- Async logic lives in the store; no built-in conventions.

## Jotai — atomic state

```tsx
import { atom, useAtom, useAtomValue } from 'jotai';

const bearsAtom = atom(0);
const doubledAtom = atom((get) => get(bearsAtom) * 2);

function BearCounter() {
  const bears = useAtomValue(bearsAtom);
  return <h1>{bears} bears</h1>;
}

function Doubled() {
  const doubled = useAtomValue(doubledAtom);
  return <h1>{doubled} doubled</h1>;
}

function Controls() {
  const [, setBears] = useAtom(bearsAtom);
  return <button onClick={() => setBears(b => b + 1)}>+</button>;
}
```

What's different:

- **Atoms are individual state units.** Each atom subscribes independently.
- **Derived atoms.** Compute from other atoms; re-compute only when deps change.
- **No store object.** Atoms are top-level constants.
- **Async atoms.** Promise-based atoms integrate with Suspense.

Why teams pick Jotai:
- Granular subscriptions (only the atoms a component reads cause re-renders).
- Derived state is first-class.
- Pairs naturally with Suspense for async data.
- Feels like useState but global.

Drawbacks:
- Many small atoms can become hard to track.
- Less common than Zustand/Redux; smaller community.
- Mental model shift from store-based thinking.

## Redux Toolkit — official Redux

```tsx
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { Provider, useSelector, useDispatch } from 'react-redux';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },  // Immer-powered; looks mutable.
    decrement: (state) => { state.value -= 1; },
    incrementByAmount: (state, action) => { state.value += action.payload; },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

const store = configureStore({
  reducer: { counter: counterSlice.reducer },
});

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();
  
  return (
    <>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
    </>
  );
}
```

Redux Toolkit (RTK) is what Redux looks like in 2026. The old Redux pain points (boilerplate, action creators, immutability gymnastics) are mostly gone:

- **createSlice** generates actions and reducers together.
- **Immer integration.** Write mutating code; RTK produces immutable updates.
- **RTK Query** for server state (built-in alternative to TanStack Query).
- **createAsyncThunk** for async actions.
- **Strong devtools** (time-travel debugging, action replay).

Why teams pick RTK:
- Battle-tested at scale (very large React apps).
- Best-in-class devtools.
- Predictable conventions (everyone knows what Redux looks like).
- RTK Query for unified server + client state.
- Strict patterns prevent disasters in large teams.

Drawbacks:
- More boilerplate than Zustand/Jotai.
- Provider required.
- Mental overhead of actions, reducers, slices.
- Heavier bundle than alternatives.

## Picking

A rough decision tree:

- **Small to medium app, prefer minimalism:** Zustand.
- **Want fine-grained reactivity, lots of derived state:** Jotai.
- **Large team, strict patterns, devtools-heavy debugging:** Redux Toolkit.
- **Already on Redux:** RTK migration is easy; stay.
- **Already on Zustand:** rarely a reason to switch.
- **Existential confusion:** Zustand. It's the safe default in 2026.

For most new apps, Zustand. Jotai if you've felt context's re-render pain acutely. RTK if you're in a Redux shop or building something big.

## Patterns common across all three

**Slices / domains.** Split state by feature, not by data type. Each feature owns its actions and selectors.

**Selectors.** Don't read raw store state in every component. Define selectors near the slice; components import named selectors.

```tsx
// Zustand
const useBears = () => useBearStore((s) => s.bears);

// RTK
const selectBears = (state: RootState) => state.bears.count;
```

When state shape changes, only the selector needs updating.

**Actions, not setters.** Even in Zustand, define named actions:

```tsx
const useBearStore = create((set) => ({
  bears: 0,
  feedBear: () => set((s) => ({ bears: s.bears + 1 })),
  // not: setBears: (n) => set({ bears: n }),
}));
```

Named actions describe intent; setters describe mechanism. Intent ages better.

**Don't store server data.** Even with a great client store, server data lives in TanStack Query / SWR / RTK Query.

## Server state via RTK Query

If you pick Redux Toolkit, RTK Query is the built-in alternative to TanStack Query:

```tsx
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Post'],
  endpoints: (build) => ({
    getPosts: build.query<Post[], void>({
      query: () => 'posts',
      providesTags: ['Post'],
    }),
    addPost: build.mutation<Post, NewPost>({
      query: (body) => ({ url: 'posts', method: 'POST', body }),
      invalidatesTags: ['Post'],
    }),
  }),
});

export const { useGetPostsQuery, useAddPostMutation } = api;

// In components:
const { data, isLoading } = useGetPostsQuery();
const [addPost] = useAddPostMutation();
```

Caching, dedup, invalidation, polling — same primitives as TanStack Query, integrated with Redux. Worth knowing if you're already on RTK.

## Persistence

All three support persistence (saving to localStorage):

```tsx
// Zustand
import { persist } from 'zustand/middleware';

const useStore = create(persist((set) => ({ ... }), { name: 'app-store' }));

// Jotai
import { atomWithStorage } from 'jotai/utils';
const themeAtom = atomWithStorage('theme', 'light');

// RTK
import { persistReducer, persistStore } from 'redux-persist';
// ...
```

Each has well-tested persistence layers. Use for theme, draft form values, "remember me" settings.

## Devtools

- **Redux DevTools** — gold standard. Works with RTK out of the box; Zustand integrates via middleware; Jotai has its own devtools.
- **Time-travel** — replay actions to debug.
- **State diffing** — see what changed per action.

For complex apps, devtools matter. RTK has the deepest integration here.

## What NOT to put in your store

- **UI ephemera.** Form values in flight, modal open state, accordion expanded. Component state.
- **Server data.** Use a server-state library.
- **Refs, DOM nodes, non-serializable values.** Devtools can't replay; strict stores reject.
- **Computed values.** Compute on read via selectors; don't store derived values.

A clean store contains only persistent client state.

## Migrating between libraries

If you start with one and need to switch:

- **Zustand → RTK:** rewrite stores as slices. Selectors translate directly.
- **RTK → Zustand:** flatten reducers to setters. Selectors map.
- **Either → Jotai:** atom-by-atom; can coexist during migration.

Migrations are real work. Pick the right library upfront if possible; the cost of switching is meaningful but not prohibitive.

## Mistakes to avoid

- **Store as a junk drawer.** Many keys most components don't touch.
- **No selectors.** Raw store reads scatter across components.
- **Server data in client store.** Use server-state library.
- **Choosing based on hype.** All three work; pick what your team will operate well.
- **Multiple libraries for the same kind of state.** Pick one.

## Summary

- Zustand: minimal store, hooks-first, ~1KB. Safe default in 2026.
- Jotai: atomic state, granular subscriptions, Suspense-friendly.
- Redux Toolkit: official Redux modernized; best devtools; large-team friendly.
- All three support selectors, persistence, middleware.
- Use a server-state library (TanStack Query, SWR, RTK Query) for server data.
- Pick based on team familiarity and app shape, not hype.

Next: server state vs client state.
