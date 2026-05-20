---
module: 4
position: 1
title: "Profiling and finding bottlenecks"
objective: "React DevTools Profiler in practice."
estimated_minutes: 7
---

# Profiling and finding bottlenecks

## Don't optimize what you haven't measured

Almost every team has optimized the wrong things. They've added `React.memo` to components that weren't slow, useCallback to handlers that weren't drivers, lazy loading to bundles that were already tiny. The result: more code complexity, no speed improvement.

The fix is the React DevTools Profiler. Before any optimization, profile. Identify the actual bottleneck. Fix that specifically. Profile again.

This lesson is the workflow.

## Installing React DevTools

The browser extension (Chrome, Firefox, Edge):

1. Install "React Developer Tools" from the extension store.
2. Open DevTools on a React page.
3. New tabs appear: Components and Profiler.

For React Native or browser-less setups, there's a standalone DevTools. For 99% of web work, the extension is what you need.

## The Profiler tab

The Profiler records what rendered, when, and for how long. Basic usage:

1. Open DevTools → Profiler tab.
2. Click the record button (circle).
3. Interact with the page (click a button, type in a field, scroll, etc.).
4. Click stop.
5. See the flame chart of renders during that recording.

Each bar is a component render. Width = render duration. Position = chronological order. Color = severity (longer renders are warmer).

## Reading the flame chart

A few things to look at:

**Top-down:** What components rendered? Drill into the tree.

**Width:** Wider = slower render. Anything over 16ms in a single render is concerning (causes dropped frames at 60fps).

**Count:** If a component rendered 50 times for one user interaction, something's wrong.

**"Why did this render?":** Click a component in the flame chart. The panel shows what caused the render: props change, hooks change, parent rendered, state changed. This is the killer feature.

## "Why did this render?" cases

When the Profiler tells you why something rendered, you get specific diagnoses:

- **"Props changed: [list]."** Props came in different. Sometimes intentional, sometimes a parent issue.
- **"Hooks changed."** A useState or useReducer in this component fired.
- **"Parent component rendered."** No props changed but the parent re-rendered, pulling this child along.
- **"Context changed."** A consumed context's value updated.

If the cause is "Parent component rendered" and props didn't actually change, this is a `React.memo` candidate (assuming the child is expensive).

If the cause is "Props changed" but the props look identical, you have a reference identity issue — new object/function created in the parent's render.

## The interactions tab

In some Profiler versions, you can mark "interactions" — labeled events you want to measure. Useful for "from button click to render completion" timings.

For most use cases, the basic flame chart is enough.

## Component highlighting

In the React DevTools settings, enable "Highlight updates when components render." Now every time a component renders, you see a brief flash on the page.

Useful for:

- Verifying that components you optimized actually stopped re-rendering.
- Catching unexpected re-renders during ordinary interaction.

Don't leave it on permanently — distracting. Toggle when investigating.

## What's a real bottleneck

Common real bottlenecks in React apps:

1. **A list of N items where each item is expensive.** N items × cost-per-item. Optimize by memoizing children (so unchanged items don't re-render) or virtualizing (only render visible).

2. **A heavy component re-rendering when it shouldn't.** Parent re-renders → cascade. React.memo on the child fixes.

3. **A single render that's just slow.** Component does too much in one render. Lazy-load parts, defer with useTransition, simplify.

4. **Many small renders adding up.** Death by a thousand cuts. Usually traces to a context provider re-rendering everything.

5. **Re-render storms.** Hundreds of renders for one interaction. Almost always a state update triggering itself in an effect.

Each has a different fix. Profile to know which you have.

## Diagnosis examples

**Symptom:** Click a button; UI freezes for 500ms.

Profile: shows one component render taking 500ms. The component does a synchronous heavy computation.

Fix: useMemo the computation (if input is stable) or move to a Web Worker (if input changes often).

**Symptom:** Typing in a search field is laggy.

Profile: each keystroke triggers a render of a large list. The list renders take 100ms each.

Fix: useTransition for the list update (low priority); useDeferredValue on the query; memoize list items; consider virtualization.

**Symptom:** Page is slow when 100+ items are visible.

Profile: each item rendered, each took 5ms; 100 × 5 = 500ms total.

Fix: virtualize (render only visible items, ~20). Win is dramatic.

**Symptom:** A tooltip's appearance causes the whole page to re-render.

Profile: the tooltip is inside a Context provider. Showing/hiding triggers context value change.

Fix: lift the tooltip out of the provider, or use local state instead of context.

## The 16ms budget

For 60fps animations and smooth interactions, the browser has 16ms per frame to:

- Run JavaScript.
- Process layout.
- Paint.
- Composite.

If JavaScript (including React renders) takes more than ~10ms, you start dropping frames. The animation stutters or input lags.

Aim for individual renders under ~10ms; total work per interaction under ~50ms (some animations are forgiving). If profiling shows renders over 16ms, you have a real problem.

## When NOT to profile

Premature profiling is its own waste. Skip when:

- The app feels fast.
- You haven't shipped yet (profile representative data).
- The slow path isn't on the critical UX path.

Profile when:
- A specific interaction feels slow.
- Users report lag.
- A feature seems disproportionately heavy.
- You have a performance budget.

## Synthetic benchmarks vs real interactions

The Profiler measures real interactions. If you suspect a particular code path is slow, recreate the condition (a list with 1000 items, a complex form with 50 fields) and profile.

Synthetic React benchmarks ("renders 1M components in X ms") rarely predict real app performance. Profile your actual app.

## Production vs development

Development React is much slower than production. Profiling in dev gives directional info but absolute numbers are off:

- Dev: extra runtime checks, dev-only warnings, source-map overhead.
- Production: minified, optimized, much faster.

For accurate timings, profile a production build (`npm run build && npm run start`). For diagnosing causes, dev mode is fine.

## Profiling beyond React

React DevTools Profiler is for React renders. For other bottlenecks:

- **Network**: Chrome DevTools Network tab. API latency, payload size.
- **JavaScript execution**: Chrome DevTools Performance tab. Flame chart of JS execution including non-React work.
- **Layout/paint**: Chrome Performance with rendering insights.
- **Memory**: Chrome DevTools Memory tab.

Some bottlenecks aren't React's fault. Layout thrashing, massive bundles, slow APIs — different tools.

## Capturing user-side performance

For users in the wild:

- **Web Vitals** (Chrome User Experience report, Vercel Analytics).
- **Sentry Performance** for browser perf alongside errors.
- **Custom timings** via Performance API + analytics.

Synthetic profiling shows the upper bound. Real-user metrics show what users actually feel.

## Workflow

A canonical flow when investigating perf:

1. Reproduce the slow behavior.
2. Profile in DevTools.
3. Identify the slow render or render storm.
4. Determine the cause via "Why did this render?".
5. Apply targeted fix (memo, virtualize, lazy-load, defer).
6. Profile again to verify the fix.
7. Verify the fix didn't break anything else.

Without this loop, optimization is guesswork.

## Mistakes to avoid

- **Optimizing without profiling.** Adds complexity for nothing.
- **React.memo everywhere.** Slows things down with comparison overhead.
- **Trusting dev-mode timings.** Production is much faster.
- **Single-component focus.** Sometimes the bottleneck is parent re-renders, not the slow child.
- **Premature virtualization.** For lists under ~50 items, usually unnecessary.

## Summary

- React DevTools Profiler: install, record, see flame chart of renders.
- "Why did this render?" tells you the cause of each render.
- Real bottlenecks: slow renders, re-render storms, cascading parent renders, lack of virtualization.
- 16ms per frame for 60fps; aim for renders under ~10ms.
- Profile production builds for accurate timings; dev for cause diagnosis.
- Web Vitals + Sentry RUM for real-user perf.
- Profile → identify → fix → reprofile.

Next: memoization done right.
