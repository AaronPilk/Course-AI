---
module: 1
position: 2
title: "Reconciliation and keys"
objective: "Why your list re-renders the wrong way."
estimated_minutes: 7
---

# Reconciliation and keys

## What reconciliation does

After a component re-renders and returns a new element tree, React has to figure out how to update the DOM. It doesn't rebuild from scratch — that would be slow and lose state in input fields, scroll positions, animations. Instead, React **reconciles**: it diffs the new tree against the previous and applies only the necessary DOM changes.

The algorithm has rules. Misunderstand them and you get subtle bugs — state attached to the wrong row, animations playing on the wrong element, inputs that randomly lose focus.

## The two rules of reconciliation

**Rule 1: Different element types produce different trees.** If a `<div>` becomes a `<span>`, React tears down the old DOM and rebuilds. Any state in the subtree is lost.

**Rule 2: Same type, compare by key (or position).** If both are `<div>`, React keeps the DOM node and updates its attributes. For lists of children, React uses keys to match old to new.

These two rules drive everything else.

## Why keys matter

When rendering a list:

```tsx
{items.map(item => <Item key={item.id} data={item} />)}
```

Keys tell React: "this element corresponds to that element from before." Without keys (or with bad keys like array index), React matches by position.

Example: list of 3 inputs, user types in the middle one. Then you re-render the list with a new item prepended.

**With index keys (`key={i}`):**
- Position 0: was input A, now input NEW. React keeps position 0's DOM, just updates props → input still has user's text (wrong!).
- Position 1: was input B, now input A. Same DOM reused.
- Position 2: was input C, now input B. Same DOM reused.

The user's text stays in position 0 but now position 0 represents the NEW item. State is attached to the wrong row.

**With ID keys (`key={item.id}`):**
- React sees key NEW is new → mount fresh input at position 0.
- Keys A, B, C exist before and after → React shifts them in the DOM, preserving their state.

The user's text follows item A to position 1. Correct.

## The index-key trap

`key={index}` is fine when:
- The list never reorders.
- Items are never added/removed in the middle.
- Items have no internal state (no inputs, no animations).

It's broken when:
- Items can be inserted/removed/reordered.
- Items contain inputs, focus state, expanded/collapsed state, animations.

The safe default is `key={item.id}` (or whatever stable unique identifier the item has). If items genuinely have no IDs, generate them when you create the items.

## Forcing a remount with key

You can deliberately force a component to remount by changing its key:

```tsx
<UserForm key={user.id} user={user} />
```

When `user.id` changes, React sees a different key, unmounts the old `UserForm`, mounts a new one. All internal state resets. Useful when:

- Editing different users in the same form — reset form state per user.
- Resetting a complex component when external context changes.
- Re-running mount effects on prop change.

The key-as-reset pattern is a clean alternative to manual `useEffect` resets.

## State preservation by tree position

Within a single component lifetime, state is tied to the position in the tree:

```tsx
{showFirst ? <Counter /> : <Counter />}
```

Toggling `showFirst` does NOT reset the counter — React sees the same component at the same position, just keeps the state.

```tsx
{showFirst ? <CounterA /> : <CounterB />}
```

Different components — React unmounts one and mounts the other; state resets.

```tsx
<div>
  {condition && <Counter />}
  <Counter />
</div>
```

Now there are two positions. The first `<Counter />` mounts/unmounts based on condition; the second is always there. Their states are independent.

Subtle but important: state lives at tree positions, not in your code.

## Conditional rendering gotchas

```tsx
{user ? <Profile user={user} /> : <Login />}
```

When `user` toggles, React swaps between `Profile` and `Login` — different components, full unmount/mount, no state preservation.

But:

```tsx
<Profile user={user || guestUser} />
```

This always renders `Profile` — state preserved across user changes. Sometimes you want this; sometimes you don't.

For login transitions, the swap is correct. For switching between two users, the swap might lose form state — use `key={user.id}` to control resets explicitly.

## Reconciliation with arrays vs fragments

```tsx
return [
  <h1 key="title">Hello</h1>,
  <p key="body">World</p>,
];
```

vs

```tsx
return (
  <>
    <h1>Hello</h1>
    <p>World</p>
  </>
);
```

Both work, but the fragment version doesn't require keys (it's a fixed tree shape). Use fragments for static structure; arrays only when the children are genuinely dynamic.

## React.memo and reconciliation

`React.memo` short-circuits reconciliation by checking props equality before re-rendering:

```tsx
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  return items.map(...);
});
```

If `items` reference is the same as last render, React skips calling the function entirely. Saves work for genuinely expensive components.

Caveats:
- Reference equality matters. New array literal every render = memo doesn't help.
- Custom comparison function via second arg if shallow isn't right.
- Overuse adds comparison cost. Profile first.

## Debugging reconciliation bugs

Symptoms:
- Input focus jumps to the wrong row.
- State sticks to the wrong item.
- Animations replay on wrong elements.

Diagnostic:
1. Open React DevTools.
2. Find the buggy component in the tree.
3. Check its key in the parent.
4. Is it `index`? Is the parent list reordered?
5. Switch to stable IDs.

90% of "weird list behavior" traces to index keys.

## Lists with item.id missing

If your data doesn't have IDs, generate them:

```tsx
// When creating items:
const newItem = { id: crypto.randomUUID(), ...data };

// Or stable hash from content:
const key = JSON.stringify(item);  // OK for small immutable items
```

Don't use array index. Don't combine multiple unstable fields. Don't reuse keys.

## Special case: keyed transitions

CSS / animation libraries (Framer Motion, etc.) often use keys for entry/exit animations:

```tsx
<AnimatePresence>
  {items.map(item => (
    <motion.div key={item.id}>...</motion.div>
  ))}
</AnimatePresence>
```

Keys here drive when an animation should run. Same reasoning — stable IDs let animations attach to specific items.

## Reconciliation across component boundaries

Reconciliation matches elements at the same position. Wrapping a component in a new wrapper changes the position:

```tsx
// Before:
<Counter />

// After:
<div><Counter /></div>
```

The `Counter` is now at a different position. React unmounts and remounts; state resets. Sometimes this surprises you; usually intentional.

If you must preserve state across a wrapper change, see "lifting state up."

## Mistakes to avoid

- **`key={index}`** for lists that change.
- **No keys** at all — React warns but still uses position.
- **Random keys** (`key={Math.random()}`) — remounts everything every render, killing performance.
- **Duplicate keys.** React warns; behavior is undefined.
- **Keys outside arrays.** Required only for lists of siblings.

## Summary

- Reconciliation diffs new element tree against previous and updates DOM minimally.
- Same type → update; different type → unmount + remount.
- Keys identify list items across renders; use stable IDs, not index.
- State is tied to tree position; conditional rendering can reset state.
- Use `key={id}` to force remount when needed.
- `React.memo` skips re-renders when props are reference-equal.
- 90% of weird list bugs trace to index keys.

Next: effects and the dependency array.
