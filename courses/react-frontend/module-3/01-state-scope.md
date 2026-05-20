---
module: 3
position: 1
title: "Local vs lifted vs global state"
objective: "Picking the right scope."
estimated_minutes: 7
---

# Local vs lifted vs global state

## The state placement question

Every piece of state has a right place to live. Put it too low (in a leaf component) and parent components can't read it. Put it too high (global store) and you've added complexity for nothing. Put it in the wrong layer and you fight the framework forever.

The skill is matching scope to need. Most state belongs locally; a meaningful portion belongs lifted; only a small set belongs globally.

## Local state

State that only one component cares about:

```tsx
function Disclosure({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}>{title}</button>
      {open && <div>{children}</div>}
    </div>
  );
}
```

`open` is local. Nothing outside `Disclosure` needs to know about it. Keep it there.

Examples of state that should usually be local:
- Form field values (until submit).
- Open/closed toggles.
- Hover/focus state.
- Animation state.
- Scroll positions.
- Local pagination state.

If you find yourself reaching for global state for these, slow down — it's usually wrong.

## Lifted state

State that two or more sibling components share. Lift to the nearest common parent.

Classic example: tabs.

```tsx
function Tabs() {
  const [active, setActive] = useState('home');
  
  return (
    <>
      <TabList active={active} onChange={setActive} />
      <TabContent active={active} />
    </>
  );
}
```

Both `TabList` and `TabContent` need `active`. Their common parent (`Tabs`) holds it.

The data flow:
- State lives in the parent.
- Parent passes the value down as a prop.
- Parent passes a setter down as a prop.
- Children call the setter to update.

Pure top-down data flow; predictable; easy to debug.

## Lifting too far

The common mistake: lifting state higher than the nearest common parent.

```tsx
// ❌ Bad: lifted way too high
function App() {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <Layout>
      <Sidebar />
      <Main>
        <ProductSearch query={searchQuery} onChange={setSearchQuery} />
      </Main>
    </Layout>
  );
}
```

`searchQuery` is only used by `ProductSearch` and probably its result list. Lifting to `App` means every other component re-renders when the query changes. Move state to the closest ancestor that genuinely needs it.

## Drilling vs context vs store

When state lives several levels up from where it's used, you "drill" props through intermediate components:

```tsx
<App theme={theme}>
  <Layout theme={theme}>
    <Header theme={theme}>
      <ThemeIcon theme={theme} />
    </Header>
  </Layout>
</App>
```

Every level passes `theme` through. Annoying, but explicit.

Three escape hatches:

**Composition.** Pass JSX as children instead of drilling props:

```tsx
<Layout>
  <Header>
    <ThemeIcon theme={theme} />
  </Header>
</Layout>
```

`Layout` and `Header` don't see `theme`; only the leaf that uses it. The cleanest fix when applicable.

**Context.** A subtree-wide store of values, accessed via useContext.

**External store** (Zustand, Redux Toolkit, etc.). For app-wide state.

Pick based on scope. Composition first; context for genuine subtree-wide values; external store for truly global.

## When global state is the right answer

Some state is genuinely global:

- **Current user / session.** Many components need it.
- **Theme.** Switching affects everything.
- **Notifications / toasts.** Triggered from anywhere, displayed at root.
- **Locale / i18n.** App-wide.
- **App-wide settings.** Feature flags, preferences.

For these, context or external store. Don't drill through 8 levels.

## When global state is the wrong answer

Some state should NEVER be global:

- **Form input values.** Local until submit.
- **Component-specific UI state.** Modal open, accordion expanded.
- **Page-specific filters.** Belong on the page.
- **Anything you'd reset on navigation.** Local or URL-bound.

The smell: a Redux/Zustand store with hundreds of keys most components don't touch. State has crept too far up.

## URL as state

For state that should be shareable, bookmarkable, or restored across navigation:

- Search queries.
- Filter selections.
- Pagination.
- Active tab (sometimes).
- Sort order.

The URL is a state container. Read from `searchParams`; write via router push.

```tsx
'use client';
import { useRouter, useSearchParams } from 'next/navigation';

function Filters() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get('category') || 'all';
  
  function setCategory(value: string) {
    const newParams = new URLSearchParams(params);
    newParams.set('category', value);
    router.push(`?${newParams.toString()}`);
  }
  
  return <select value={category} onChange={e => setCategory(e.target.value)}>...</select>;
}
```

URL-state automatically syncs across tabs, survives refresh, is shareable. Underused.

## Server state ≠ client state

A critical distinction. Server state is data fetched from a backend — posts, users, products. Client state is UI state — open modals, form values, theme.

These need different tools:

- **Client state:** useState, useReducer, context, Zustand, Jotai.
- **Server state:** TanStack Query, SWR, RTK Query.

Server state has different problems: caching, deduplication, stale-while-revalidate, refetching, optimistic updates, mutations. Client-state tools handle these poorly.

The mistake: using Redux/Zustand to store server data manually. You re-implement TanStack Query badly.

## Decision framework

When you have a new piece of state, ask:

1. **Does only one component care?** → Local (useState).
2. **Do siblings need it?** → Lift to common parent.
3. **Does a deep subtree need it?** → Composition or context.
4. **Does the whole app need it?** → External store (Zustand, Redux Toolkit).
5. **Should it persist across refresh/share?** → URL.
6. **Is it from the server?** → Server state library (TanStack Query, SWR).

Most state ends at step 1 or 2. Steps 4-6 are smaller categories than people assume.

## Avoiding premature globalization

A common evolution:

1. Build component with local state.
2. Another component needs it → lift.
3. A third component needs it → consider context.
4. Wait, what if we just put everything in Redux from the start?

The trap: adding a global store "in case." It's harder to remove than to add later. Start local; promote as needed.

## Co-located logic

Place state, the functions that update it, and the components that display it close together. If you find yourself jumping across files to track how a value flows, the scope is probably wrong.

```tsx
// ✅ Good: state and logic together
function TodoList() {
  const [todos, setTodos] = useState([]);
  
  function addTodo(text) {
    setTodos(prev => [...prev, { id: crypto.randomUUID(), text }]);
  }
  
  function removeTodo(id) {
    setTodos(prev => prev.filter(t => t.id !== id));
  }
  
  return (
    <div>
      <AddTodoForm onAdd={addTodo} />
      <List todos={todos} onRemove={removeTodo} />
    </div>
  );
}
```

Versus reaching into a global store from every leaf for a feature owned by one screen.

## When to refactor scope

Refactor state placement when:

- Many props drill through middle components that don't use them.
- A leaf component reaches for state that's nowhere logically near it.
- Several components need the same state but it's siloed.
- Performance — frequent updates to top-level state cause unrelated subtrees to re-render.

Don't refactor preemptively. Wait for actual pain.

## Mistakes to avoid

- **Global store as default.** Most state isn't global.
- **Lifting too high.** Re-renders unrelated subtrees.
- **Server data in client state.** Use server-state libraries.
- **Filter state in component state when URL would work.** Loses share/restore.
- **Drilling 5 levels.** Use composition or context.

## Summary

- Local for component-specific state.
- Lift to nearest common parent for shared sibling state.
- Composition / context for subtree-wide values.
- External store only for truly global state.
- URL for shareable / bookmarkable state.
- Server state via TanStack Query / SWR, not client-state tools.
- Match scope to need; start small and promote.

Next: context — when it helps, when it hurts.
