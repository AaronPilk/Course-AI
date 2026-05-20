---
module: 4
position: 3
title: "Virtualization for long lists"
objective: "Render only what's visible."
estimated_minutes: 7
---

# Virtualization for long lists

## The volume problem

Rendering 1,000 items in a list creates 1,000+ DOM nodes. The browser:

- Allocates memory for each node.
- Computes layout for each.
- Paints each.
- Manages event listeners for each.
- Re-runs all of this when state changes.

Past a few hundred items, performance degrades — scrolling stutters, interactions lag, mobile devices struggle. The fix is virtualization: render only the items currently visible in the viewport. As the user scrolls, swap DOM nodes in and out. With virtualization, a 100,000-item list feels as smooth as a 20-item list.

## How virtualization works

A virtualized list:

1. Measures the container height and item heights.
2. Calculates which items are in the visible window (plus a small overscan above/below).
3. Renders only those items.
4. Positions them absolutely so the scroll height represents all 100k items, even though only ~20 are in the DOM.
5. On scroll, recalculates which items are visible, swaps DOM accordingly.

The user sees a smooth list. The browser only handles ~20 nodes at a time. Memory and CPU stay flat regardless of list length.

## Libraries

You don't roll virtualization yourself. The libraries solve all the edge cases:

- **TanStack Virtual** — modern, headless, framework-agnostic. The current go-to.
- **react-window** — small (~5KB), simple API, well-tested.
- **react-virtuoso** — feature-rich (variable heights, infinite scroll, scroll-to-index).

For new code, TanStack Virtual or react-virtuoso. For lightweight needs, react-window.

## TanStack Virtual basics

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function LongList({ items }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,  // estimated row height
    overscan: 5,             // render 5 extra items above/below viewport
  });
  
  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <Item item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

Key parts:
- `parentRef` is the scrollable container.
- `count` is total item count.
- `estimateSize` is approximate row height (used for the placeholder before measurement).
- `overscan` renders extra items beyond the visible window — prevents flashes during fast scroll.

The virtualizer returns the items to render and their positions; you render them absolutely positioned.

## Variable heights

For lists where items have different heights:

```tsx
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
  measureElement: (element) => element.getBoundingClientRect().height,
  overscan: 5,
});

// When rendering:
<div ref={virtualizer.measureElement} data-index={virtualItem.index}>
```

The virtualizer measures actual heights when items render and updates the layout. Slightly more complex; necessary for content where heights vary (comments, chat messages).

## Horizontal virtualization

Same library, different axis:

```tsx
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 200,  // estimated width
  horizontal: true,
  overscan: 3,
});
```

For carousels, timelines, horizontal scrollers.

## Grid virtualization

For 2D grids:

```tsx
const rowVirtualizer = useVirtualizer({
  count: rows,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
});

const columnVirtualizer = useVirtualizer({
  count: columns,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
  horizontal: true,
});
```

Iterate both to build the visible grid. Used for spreadsheets, image galleries, large data tables.

## When to virtualize

Virtualize when:

- List length is 50+ items AND items are non-trivial.
- List length is 100+ regardless of item complexity.
- Performance profiling shows the list is the bottleneck.
- Users may scroll long lists frequently.

Don't virtualize when:

- List is under ~50 items.
- Items render as simple text or one-element rows (cheap).
- The list rarely shows long content (e.g., usually 5 items, edge case is 200).

For short lists, virtualization's complexity exceeds its benefit. Stick with `.map()`.

## Pitfalls

**Layout shift on scroll.** If items have actual heights different from `estimateSize`, the scroll position can jump as items measure. Mitigate with `measureElement` for variable heights or by getting the estimate close.

**Search and selection.** "Scroll to item X" requires the virtualizer to know item X exists and where it is. Use the library's `scrollToIndex` API.

**Focus management.** When an item scrolls out, its DOM node is removed. If it had focus, focus is lost. For accessible scrolling, manage focus carefully (libraries usually handle this).

**Memo'd item components.** Virtualized lists swap DOM nodes; memoizing items prevents unnecessary work when scrolling past previously-rendered items. Default to memoizing item components.

## Combining with infinite scroll

For lists where data loads as the user scrolls:

```tsx
const virtualizer = useVirtualizer({ /* ... */ });

const lastItem = virtualizer.getVirtualItems().at(-1);

useEffect(() => {
  if (lastItem && lastItem.index >= items.length - 5) {
    loadMore();  // Trigger when user is near the end
  }
}, [lastItem]);
```

Pair with TanStack Query's `useInfiniteQuery` for paginated data fetching. Combined, you get a smooth virtualized infinite scroll over an arbitrarily large dataset.

## Tables and virtualization

For data tables (sortable columns, etc.), TanStack Table + TanStack Virtual is the canonical pairing. Table handles sorting/filtering/columns; Virtual handles rendering only visible rows.

Massive performance win — tables of 50,000+ rows scroll smoothly.

## Reference timing

Rough timings (your machine will differ):

- Render 1,000 non-trivial items: 500-1000ms.
- Render virtualized 1,000 items (20 visible): 30-50ms.
- Scroll smoothness: 60fps vs 10fps.

Even for 200 items, virtualization can be the difference between snappy and sluggish on mid-range mobile.

## When not virtualization

Sometimes the right answer isn't virtualization — it's "fewer items":

- **Pagination.** Show 20 at a time; let the user navigate.
- **Search/filter.** Don't show 10,000 items; help the user narrow.
- **Hierarchical drill-down.** Show categories; expand on click.

UX-wise, infinitely scrolling 10,000 items is rarely what users want anyway. Sometimes virtualization is the band-aid for "we showed too much"; redesign with pagination or filters.

## Mistakes to avoid

- **Virtualizing 20-item lists.** Overhead exceeds benefit.
- **No memoization of items.** Each scroll triggers re-render.
- **Bad estimateSize.** Layout shift during scroll.
- **Forgetting overscan.** Flashes during fast scroll.
- **Not handling search/focus.** Broken keyboard accessibility.

## Summary

- Virtualize when lists exceed ~50-100 items.
- TanStack Virtual / react-virtuoso / react-window are the libraries.
- Render only visible items + small overscan.
- Variable heights via `measureElement`.
- Pair with `useInfiniteQuery` for infinite scroll.
- Combine with TanStack Table for huge data grids.
- Don't reach for virtualization on short lists.

Next: code splitting and lazy loading.
