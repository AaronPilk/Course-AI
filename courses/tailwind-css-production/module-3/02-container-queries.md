---
module: 3
position: 2
title: "Container queries"
objective: "Component-aware responsiveness."
estimated_minutes: 7
---

# Container queries

## The viewport-only limitation

Traditional media queries respond to the viewport — the browser window. That works when a component always lives at the same place in the layout. It breaks when the same component appears in different contexts: a card in a sidebar at 300px width vs the same card in a full-width section at 1200px.

With viewport queries, you can't make the card respond to its container's width. The viewport says "I'm on a desktop" but the card knows nothing about its own column.

Container queries fix this. A component can respond to the size of its containing element, regardless of viewport.

## The pattern

```tsx
<div className="@container">
  <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3">
    {items.map(...)}
  </div>
</div>
```

- `@container` marks the element as a container.
- `@md:`, `@lg:` modifiers refer to the CONTAINER's width, not the viewport's.

Now this grid is 1 column when the container is small, 2 columns when medium, 3 when large — regardless of viewport size.

## Setup

```bash
npm install -D @tailwindcss/container-queries
```

```js
// tailwind.config.js
plugins: [require('@tailwindcss/container-queries')],
```

Tailwind v4 supports container queries natively without the plugin.

## Container sizes

The `@container` modifier has its own breakpoints:

| Prefix | Min container width |
|--------|---------------------|
| `@sm:` | 24rem (384px) |
| `@md:` | 28rem (448px) |
| `@lg:` | 32rem (512px) |
| `@xl:` | 36rem (576px) |
| `@2xl:` | 42rem (672px) |
| `@3xl:` | 48rem (768px) |
| ... | ... |

These are usually smaller than viewport breakpoints because containers are often smaller than the viewport.

Customize in config:

```js
theme: {
  containers: {
    'card': '20rem',
    'wide': '48rem',
  },
}
```

```tsx
<div className="@card:flex-row">
```

## Real-world examples

**Card that changes layout based on column width:**

```tsx
<div className="@container">
  <div className="@md:flex @md:gap-4">
    <img className="w-full @md:w-1/3" src={img} />
    <div className="@md:w-2/3">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  </div>
</div>
```

Same card:
- In a narrow sidebar: image on top, text below.
- In a wide main column: image left, text right.

No conditional rendering, no JS. The card just adapts.

**Stats panel that shrinks gracefully:**

```tsx
<div className="@container border rounded-lg p-4">
  <h3 className="text-base @md:text-lg @lg:text-xl">{title}</h3>
  <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-2">
    {stats.map(stat => (
      <div key={stat.label} className="text-sm @md:text-base">
        <div className="font-bold">{stat.value}</div>
        <div className="text-gray-600">{stat.label}</div>
      </div>
    ))}
  </div>
</div>
```

Embeds in a sidebar at 300px (1 column, small text), in main content at 800px (4 columns, larger text), in a card at 500px (2 columns). All from the same component.

## Naming containers

For nested containers:

```tsx
<div className="@container/card">
  <div className="@container/inner">
    <div className="@md/card:flex @lg/inner:gap-4">
```

- `@container/name` names the container.
- `@modifier/name:` references the named container.

Useful when components nest and need to respond to a specific ancestor's size, not just the closest.

## Compared to media queries

| Feature | Media queries (`md:`) | Container queries (`@md:`) |
|---------|----------------------|---------------------------|
| Responds to | Viewport width | Container width |
| Use case | Layout-level breakpoints | Component-level responsiveness |
| Browser support | Universal | Modern (>2023) |
| Composition | Static at page level | Dynamic per-instance |

Most apps use both:
- Media queries for overall layout (sidebar vs no sidebar, narrow vs wide page).
- Container queries for component responsiveness within those layouts.

## When to reach for each

**Use media queries (`md:`, `lg:`):**
- Page-level layout decisions (show/hide sidebar).
- Navigation transformations (hamburger menu on mobile).
- Typography scale at viewport level.

**Use container queries (`@md:`, `@lg:`):**
- Cards or panels reused in different-width containers.
- Component libraries that don't know their container size.
- Sidebars where content responds to sidebar width.
- Email-like layouts where columns vary.

For component libraries (shadcn-style, design systems), container queries are increasingly the default — the component doesn't know where it's used.

## Browser support

Container queries shipped in all major browsers in 2023. By 2026 they're broadly supported (>95% of users). If you need to support older browsers, fallback to media queries for those cases.

Check with `@supports`:

```css
@supports (container-type: inline-size) {
  /* modern container query styles */
}
```

For most apps in 2026, browser support is no longer a blocker.

## A pattern for component libraries

A reusable component pattern:

```tsx
// components/StatCard.tsx
export function StatCard({ title, stats }) {
  return (
    <div className="@container/card rounded-lg border p-4 bg-white">
      <h3 className="text-sm @md/card:text-base font-semibold mb-3">{title}</h3>
      <div className="space-y-2 @md/card:space-y-0 @md/card:grid @md/card:grid-cols-2 @md/card:gap-2">
        {stats.map(stat => (
          <div key={stat.label} className="flex justify-between @md/card:flex-col">
            <span className="text-gray-600">{stat.label}</span>
            <span className="font-medium">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

The component adapts no matter where it's placed. Drop into a sidebar (compact layout), main column (expanded), or modal (responsive to modal width).

## Caveats

**Performance.** Container queries have slight CPU overhead vs media queries. Negligible for most apps; matters at extreme scale.

**Don't nest excessively.** A container watching a container watching a container can produce confusing layouts. Aim for 1-2 levels of container scoping.

**Mix carefully with media queries.** A component using both can produce unexpected behavior at boundaries. Test thoroughly.

**`container-type: inline-size` is required.** The `@container` class sets this; if you write custom CSS, the parent needs this property for `@container` to take effect.

## Migration path

If you have a media-query-heavy component library:

1. Identify components that appear in multiple-width contexts.
2. Wrap with `@container`.
3. Migrate `md:`, `lg:` modifiers to `@md:`, `@lg:` where component-level makes more sense.
4. Keep viewport queries where they belong (page layout, navigation).

Incremental migration; no need to rewrite all at once.

## Mistakes to avoid

- **Container queries on every component.** Use where it makes sense; media queries still fit page layout.
- **Confusing `md:` and `@md:`.** Same name, different meaning; review carefully.
- **Forgetting the parent `@container` class.** Container queries don't activate without it.
- **Excessive nested containers.** Confusing to reason about.

## Summary

- Container queries respond to a parent's width, not the viewport's.
- `@container` marks an element as a query container.
- `@md:`, `@lg:`, etc. modifiers refer to container size.
- Use for component-level responsiveness (cards in variable contexts).
- Media queries still fit page-level layout decisions.
- Browser support is broad in 2026; safe to use.
- Container query breakpoints are typically smaller than viewport breakpoints.

Next: fluid type and spacing.
