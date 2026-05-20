---
module: 5
position: 1
title: "Component testing with React Testing Library"
objective: "Test behavior, not implementation."
estimated_minutes: 7
---

# Component testing with React Testing Library

## The testing philosophy

React Testing Library (RTL) became the dominant React testing tool by being opinionated about one thing: tests should resemble how users actually use the app.

The opposite — testing implementation — used to be common. Tests that asserted "this component has state called `count`," that mocked internal hooks, that knew about React's lifecycle. Those tests broke every refactor without catching real bugs.

RTL's approach: query the DOM the way a user would (by role, by label, by text), interact like a user (clicks, types), assert on what's visible. Refactor the internals freely; tests still pass if the user-facing behavior holds.

## Setup

```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Most React frameworks (Next.js, Vite, CRA) have testing presets. Configure Vitest or Jest as the test runner.

A test setup file:

```ts
// vitest.setup.ts (or jest.setup.ts)
import '@testing-library/jest-dom';
```

`jest-dom` adds matchers like `toBeInTheDocument()`, `toHaveTextContent()`, `toBeDisabled()`.

## Anatomy of a test

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

test('increments count on button click', async () => {
  const user = userEvent.setup();
  render(<Counter />);
  
  const button = screen.getByRole('button', { name: /increment/i });
  expect(screen.getByText('Count: 0')).toBeInTheDocument();
  
  await user.click(button);
  
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

Steps:
1. Render the component into a virtual DOM.
2. Find elements as a user would (by role, label, text).
3. Interact via `userEvent`.
4. Assert on the visible output.

No internal state inspection. No mocking React itself.

## Queries — finding elements

RTL's queries follow a priority order. Prefer:

1. **getByRole** — semantic role (`button`, `link`, `heading`, `textbox`).
2. **getByLabelText** — form fields by their labels.
3. **getByPlaceholderText** — inputs by placeholder.
4. **getByText** — visible text.
5. **getByDisplayValue** — current value of inputs.
6. **getByAltText** — images by alt attribute.
7. **getByTitle** — elements by title attribute.

Last resort:
8. **getByTestId** — `data-testid` attribute. Only when no semantic option works.

Querying by role matches how screen readers and keyboard users navigate. This naturally pushes you toward accessible components.

## get* vs query* vs find*

- `getBy*` — throws if not found. Use when you expect the element.
- `queryBy*` — returns null if not found. Use to assert absence.
- `findBy*` — async, retries until found or timeout. Use for elements that appear async.

```tsx
// Assert it's there:
expect(screen.getByRole('alert')).toBeInTheDocument();

// Assert it's not there:
expect(screen.queryByRole('alert')).not.toBeInTheDocument();

// Wait for it (after fetch, after delay):
expect(await screen.findByRole('alert')).toBeInTheDocument();
```

Picking the right variant gives clearer error messages and tests that handle async correctly.

## userEvent vs fireEvent

`userEvent` simulates real interactions (focus, hover, typing key by key). `fireEvent` dispatches one event directly. Prefer `userEvent` — closer to real usage.

```tsx
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'hello');
await user.tab();           // Tab to next element
await user.keyboard('{Enter}');
```

`userEvent` is async (returns Promises); always await. Realistic event sequences catch real bugs (focus issues, keyboard nav).

## Testing components with state

```tsx
test('toggles disclosure on click', async () => {
  const user = userEvent.setup();
  render(<Disclosure title="More" content="Hidden content" />);
  
  expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  
  await user.click(screen.getByRole('button', { name: /more/i }));
  
  expect(screen.getByText('Hidden content')).toBeInTheDocument();
});
```

The test interacts with the component normally. State changes are observed via DOM changes. No `wrapper.state()`, no implementation snooping.

## Testing forms

```tsx
test('submits form with valid data', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  
  render(<ContactForm onSubmit={onSubmit} />);
  
  await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
  await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
  await user.type(screen.getByLabelText(/message/i), 'Hello world');
  
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(onSubmit).toHaveBeenCalledWith({
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hello world',
  });
});

test('shows error for invalid email', async () => {
  const user = userEvent.setup();
  render(<ContactForm onSubmit={vi.fn()} />);
  
  await user.type(screen.getByLabelText(/email/i), 'not-an-email');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
});
```

The form is tested end-to-end: type, submit, assert. Both happy path and validation errors.

## Mocking dependencies

For external dependencies (APIs, modules), mock at the import boundary:

**Mock API calls with MSW (Mock Service Worker):**

```ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/posts', () => {
    return HttpResponse.json([{ id: 1, title: 'Test post' }]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads posts', async () => {
  render(<PostList />);
  expect(await screen.findByText('Test post')).toBeInTheDocument();
});
```

MSW intercepts network requests; your component code runs normally (fetches happen, but get mocked responses). No fetch-mocking gymnastics.

**Mock modules with vi.mock / jest.mock:**

```ts
vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
}));
```

Replaces the module with a stub. Use for non-network external dependencies.

## Testing async behavior

For components that load data:

```tsx
test('shows loading, then data', async () => {
  render(<Profile userId="123" />);
  
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

`findBy*` waits for the element to appear. The test reads like a story: see loading, then see data.

For controlled timing (debounce, transitions), `vi.advanceTimersByTime()` with fake timers helps. Use sparingly.

## What NOT to test

- **Implementation details.** Don't test that state is named `count`. Test the visible count.
- **Library code.** Trust React, TanStack Query, etc. to work.
- **CSS / visual styles.** Use visual regression tools (Chromatic, Percy) for that.
- **Trivial render.** "Renders without crashing" tests are low-value. Test behavior.

## What to test

- **Happy paths.** Common user flows work.
- **Error paths.** Validation messages, error states, network failures.
- **Edge cases.** Empty states, max values, boundary conditions.
- **Accessibility critical paths.** Keyboard navigation, ARIA states.
- **Critical user journeys.** Sign up, checkout, primary CTAs.

Aim for high-value tests rather than coverage percentage. A small number of behavioral tests > many implementation tests.

## Testing custom hooks

Use `renderHook`:

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

test('increments', () => {
  const { result } = renderHook(() => useCounter());
  
  expect(result.current.count).toBe(0);
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

`act` wraps state updates so React processes them. Hooks are usually easier to test than components.

## Provider wrapping

For components that need providers (theme, store, query client):

```tsx
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

test('uses providers', () => {
  renderWithProviders(<MyComponent />);
});
```

Build a `renderWithProviders` helper once, use everywhere. Saves repetitive setup.

## Snapshot tests — use sparingly

Jest/Vitest snapshot tests capture rendered output as a string; future runs compare.

```tsx
test('matches snapshot', () => {
  const { container } = render(<Component />);
  expect(container).toMatchSnapshot();
});
```

Risks:

- Snapshots are auto-updated. Easy to commit broken output.
- Tiny changes (whitespace, attribute order) cause big diffs.
- Doesn't test behavior — just compares output.

Use for small, stable components (icons, error messages). Avoid for complex components or snapshots of entire pages.

## Coverage and CI

Set coverage thresholds in your test config. Aim for 70-80% of business-logic code. Don't chase 100% — diminishing returns.

Run tests in CI on every PR. Fail builds on test failures. Most teams run unit + integration tests on every push, e2e on a separate slower pipeline.

## Mistakes to avoid

- **Testing implementation.** Brittle, no signal.
- **Mocking React or RTL.** You'd test the mock, not your code.
- **Using getByTestId everywhere.** Add accessible attributes instead.
- **Forgetting `await` on user events.** Test passes for wrong reasons.
- **Snapshot tests of complex components.** Noise dominates signal.
- **100% coverage chase.** Trivial tests waste time.

## Summary

- RTL tests the way users use the app — semantic queries, real interactions.
- Prefer getByRole; fall back through label, placeholder, text.
- userEvent for real interactions; always await.
- MSW for API mocking at the network layer.
- Test happy paths, error paths, edge cases — not implementation.
- renderHook for custom hooks.
- High-value tests > coverage percentage.

Next: folder structure and component organization.
