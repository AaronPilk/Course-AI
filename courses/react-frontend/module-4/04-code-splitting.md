---
module: 4
position: 4
title: "Code splitting and lazy loading"
objective: "Smaller bundles, faster pages."
estimated_minutes: 7
---

# Code splitting and lazy loading

## The bundle problem

By default, every line of JavaScript in your app ends up in one bundle (or a few). Visit any page → download the whole thing. A heavy charting library imported on the dashboard ships even to users who only visit the marketing page. A rich text editor used only in admin ships to every visitor.

Code splitting solves this: break the bundle into chunks, load chunks only when needed. The initial bundle stays small; non-critical code loads on demand.

This single optimization often shaves seconds off Time to Interactive (TTI).

## How code splitting works

The bundler (Webpack, Turbopack, Vite, etc.) understands `import()` (dynamic import) as a split point:

```tsx
// Static import — bundled with the rest:
import { Chart } from 'chart-library';

// Dynamic import — separate chunk, loaded on demand:
const ChartPromise = import('chart-library');
```

The dynamic import returns a Promise that resolves to the module. The bundler emits the imported code as a separate chunk; the user's browser fetches it only when the import runs.

## React.lazy

For React components, `React.lazy` wraps dynamic import in a Suspense-compatible API:

```tsx
import { lazy, Suspense } from 'react';

const Editor = lazy(() => import('./Editor'));

function Page() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <Editor />
    </Suspense>
  );
}
```

When the page first renders this section:
1. Editor's code isn't yet loaded.
2. React suspends.
3. The Suspense fallback shows (skeleton).
4. The browser fetches Editor's chunk.
5. Once loaded, Editor renders.

On subsequent renders, Editor is already loaded; no suspending.

## When to lazy load

Code-split when:

- **The component is heavy** (rich text editor, video player, complex chart).
- **The component is rarely used** (admin tools, settings panel, modal).
- **The component is below the fold** (not visible on first paint).
- **The component is route-specific** (one route only).

Don't code-split when:

- The component is tiny.
- It's always visible immediately (no benefit to splitting; loading screen flickers).
- The split chunk would be smaller than the network overhead of a separate request (very small components).

## Route-level splitting

The biggest win usually: split per route.

In Next.js App Router, each page is automatically a separate chunk. You don't lazy-load — the framework handles it.

In Vite + React Router:

```tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Suspense fallback={<PageSkeleton />}><Home /></Suspense>,
  },
  {
    path: '/dashboard',
    element: <Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense>,
  },
  {
    path: '/settings',
    element: <Suspense fallback={<PageSkeleton />}><Settings /></Suspense>,
  },
]);
```

Now the initial bundle contains the router + Home; Dashboard and Settings load when navigated to.

## Component-level splitting

For components like modals, drawers, dialogs — loaded when first opened:

```tsx
const SettingsModal = lazy(() => import('./SettingsModal'));

function Header() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpen(true)}>Settings</button>
      {open && (
        <Suspense fallback={<ModalSkeleton />}>
          <SettingsModal onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
```

The settings modal's JS isn't loaded until the user clicks. For modals that ~5% of users open, this is a huge savings.

## Library-level splitting

For heavy libraries used only in specific components:

```tsx
// Don't import at top:
// import { PDFViewer } from 'pdf-library';

// Wrap the component using it:
const PDFView = lazy(() => import('./PDFView'));  // Internally imports pdf-library

function DocumentPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PDFView document={doc} />
    </Suspense>
  );
}
```

`pdf-library` is now in PDFView's chunk, not the main bundle.

## Preloading

Sometimes you know in advance that a chunk will be needed soon:

```tsx
// On hover, start loading the chunk.
function PostLink({ to }) {
  return (
    <Link
      to={to}
      onMouseEnter={() => {
        import('./PostPage');  // Trigger the load early
      }}
    >
      Read more
    </Link>
  );
}
```

By the time the user actually clicks, the chunk is loaded or in-flight. No skeleton, no waiting.

Next.js does this automatically for `<Link>` components — preloads route chunks on hover. Other routers vary; some have similar features.

## next/dynamic

In Next.js, `next/dynamic` is the framework-aware version of `React.lazy`:

```tsx
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./Editor'), {
  loading: () => <EditorSkeleton />,
  ssr: false,  // Skip server-side rendering if not needed
});
```

Benefits over React.lazy:
- Built-in loading prop (no manual Suspense).
- SSR control (`ssr: false` for client-only components).
- Compatible with Next.js's routing.

## Avoiding hydration mismatches with lazy

If you lazy-load a Client Component in Next.js with default `ssr: true`:

- Server renders the placeholder.
- Client hydrates with the actual component.
- Brief mismatch.

For components that shouldn't render server-side (e.g., uses `window`), set `ssr: false`. Next.js skips server rendering; client loads on demand.

## Bundle analyzer

To see what's in your bundles:

**Next.js + @next/bundle-analyzer:**

```bash
ANALYZE=true npm run build
```

Opens visual treemap of bundle sizes. Identify:

- The biggest libraries — are they actually needed everywhere they're imported?
- Duplicate libraries (different versions imported by different packages).
- Components that drag in heavy deps unnecessarily.

For Vite + rollup-plugin-visualizer; Webpack + webpack-bundle-analyzer. Similar output.

## Tree shaking and named imports

Beyond code splitting, tree shaking removes unused exports from bundles:

```tsx
// ❌ Bad: imports the whole library
import _ from 'lodash';
const result = _.debounce(...);

// ✅ Good: imports only debounce
import debounce from 'lodash/debounce';
const result = debounce(...);

// Also good with modern ESM:
import { debounce } from 'lodash-es';
```

The first pulls in all of lodash (~70KB minified). The others pull in just debounce (~2KB).

Same with date libraries (`date-fns` named imports vs `moment` whole import). Tree shaking can shave 80%+ off some bundles when done correctly.

## Common heavy libraries to lazy

A few libraries are infamous for size:

- **Charts (Chart.js, Recharts, D3):** 80-300KB. Lazy-load chart components.
- **Rich text editors (TinyMCE, Quill, ProseMirror):** 200KB-1MB. Always lazy.
- **PDF viewers (pdf.js):** 500KB+. Lazy.
- **Video players (Video.js):** 100KB+. Lazy or use native `<video>` when possible.
- **Date pickers (some implementations):** 100KB+. Many have lighter alternatives.
- **Markdown renderers (marked, remark):** Variable. Often unnecessary; pre-render server-side instead.

Profile your bundle; find the heavy hitters; lazy-load them.

## SSR considerations

For components rendered server-side:

- The chunk has to be available on the server too.
- Lazy doesn't reduce server work; only client-side bundle size.
- Some components shouldn't SSR (use browser APIs); `ssr: false` for those.

In pure client-rendered apps (Vite SPA), this doesn't matter; the lazy chunk is purely client-side.

## Mistakes to avoid

- **Lazy-loading tiny components.** Network overhead exceeds savings.
- **No fallback UI.** Empty placeholder, flash of nothing.
- **Lazy-loading above-the-fold content.** Bad LCP.
- **Not preloading hover-likely routes.** Snappy nav becomes laggy.
- **Whole-library imports.** No tree shaking; lazy doesn't save much.
- **Two libraries doing the same thing.** Pick one.

## Summary

- Code splitting via dynamic import + React.lazy / next/dynamic.
- Split per route, per modal, per heavy component, per heavy library.
- Suspense fallback shows during chunk load.
- Preload on hover for snappy navigation.
- Bundle analyzer identifies what's actually in your bundles.
- Tree shake by importing named functions (`import { debounce } from 'lodash-es'`).
- Lazy = client-side bundle only; SSR still includes the code.

Next module: Testing and architecture.
