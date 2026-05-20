---
module: 5
position: 4
title: "Accessibility fundamentals"
objective: "Build for everyone."
estimated_minutes: 7
---

# Accessibility fundamentals

## Why a11y matters

Accessibility (a11y — 11 letters between 'a' and 'y') is making your app usable by people with disabilities: screen reader users, keyboard-only users, users with low vision, motor impairments, cognitive differences.

It's not optional in 2026. Legally, the ADA (US), EAA (EU), and equivalents in other jurisdictions require it for most public-facing apps. Practically, accessible code is also better code — clearer semantics, better keyboard support, lower bug rates. A11y is one of the highest-leverage skills a frontend engineer can build.

## Semantic HTML first

The single biggest a11y win is using the right HTML element:

```tsx
// ❌ Bad
<div onClick={openMenu}>Menu</div>

// ✅ Good
<button onClick={openMenu}>Menu</button>
```

Semantic elements come with:
- Keyboard support (Tab focus, Enter/Space activation).
- Screen reader announcements ("button, Menu").
- Default styling (focus rings).
- Built-in roles for assistive tech.

The list of frequently-misused elements:

- `<button>` — clickable, in-form interactivity.
- `<a href="...">` — navigation to another URL.
- `<form>` — group of inputs that submit together.
- `<input>` with proper `type` — text, email, number, etc.
- `<label>` — connected to inputs (via `htmlFor` or wrapping).
- `<nav>` — navigation regions.
- `<main>` — primary page content.
- `<aside>` — secondary content.
- `<header>` / `<footer>` — page/section structure.

Use these. Avoid div-and-onclick patterns. The defaults are free a11y.

## Keyboard navigation

Every interactive element must work with a keyboard:

- Tab cycles through focusable elements.
- Enter / Space activates buttons.
- Enter submits forms.
- Arrow keys navigate within composite widgets (menus, tabs, sliders).
- Escape closes modals / cancels.

Test by unplugging your mouse:

1. Tab through every interactive element.
2. Activate each.
3. Verify focus is always visible.
4. Verify nothing's keyboard-trapped (can always escape).

If you can't keyboard-use the page, neither can many users.

## Focus management

When UI changes significantly (modal opens, content swaps), focus should follow:

```tsx
function Modal({ onClose, children }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    closeButtonRef.current?.focus();  // Move focus into modal on open
  }, []);
  
  return (
    <div role="dialog" aria-modal="true">
      <button ref={closeButtonRef} onClick={onClose}>Close</button>
      {children}
    </div>
  );
}
```

When the modal closes, focus should return to whatever opened it. Libraries like Radix UI and React Aria handle this automatically — strong reason to use accessible component libraries.

## ARIA — when HTML isn't enough

ARIA (Accessible Rich Internet Applications) attributes describe components that HTML alone can't express:

```tsx
<button
  aria-expanded={isOpen}
  aria-controls="menu-content"
  aria-label="Open settings menu"
>
  ⚙️
</button>
<div id="menu-content" hidden={!isOpen}>
  {/* menu items */}
</div>
```

- `aria-expanded` — is this disclosure open?
- `aria-controls` — which element this controls.
- `aria-label` — accessible name when text isn't visible (icon-only buttons).
- `aria-describedby` — additional description elsewhere.
- `aria-hidden` — hide from screen readers (decorative icons).
- `aria-live` — region updates announce dynamically (toast notifications).

The first rule of ARIA: don't use ARIA if HTML can do it. `<button>` is automatically `role="button"`. Don't write `<div role="button">` — write `<button>`.

The second rule: ARIA without keyboard support is broken. Adding `role="button"` to a div doesn't make it actually keyboard-operable; you'd need to also add tabindex, key handlers, and visual focus. Just use `<button>`.

## Forms and labels

Every form input needs a label, programmatically associated:

```tsx
// ✅ Explicit association via htmlFor
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Wrapping (also works)
<label>
  Email
  <input type="email" />
</label>

// ❌ Bad — no association
<div>Email</div>
<input type="email" />
```

Screen readers announce the label when the input receives focus. Without it, users hear "edit text" with no context.

For groups of related inputs (radio buttons, checkboxes for related options), use `<fieldset>` and `<legend>`:

```tsx
<fieldset>
  <legend>Notification preferences</legend>
  <label><input type="checkbox" /> Email</label>
  <label><input type="checkbox" /> SMS</label>
</fieldset>
```

## Error messages

Form errors should be programmatically associated with their input:

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid={!!errors.email}
  aria-describedby="email-error"
/>
{errors.email && (
  <p id="email-error" role="alert">{errors.email.message}</p>
)}
```

`aria-describedby` connects the error to the input. `role="alert"` makes screen readers announce the error when it appears.

## Color and contrast

Text must be readable:

- WCAG AA requires contrast ratio of 4.5:1 for normal text, 3:1 for large.
- WCAG AAA (stricter) requires 7:1 and 4.5:1.

Test with browser DevTools (Lighthouse, contrast checkers). Common offenders:

- Light gray text on white.
- Placeholder text that looks like value.
- Color-only state indication (red = error, green = success — colorblind users can't tell).

Always pair color with another signal — icon, label, position.

## Don't rely on hover

Hover-only interactions don't work for touch users or keyboard users. Every hover effect should have an equivalent that triggers on focus or tap:

```tsx
<div className="hover:shadow-lg focus-within:shadow-lg">
  <button>Action</button>
</div>
```

Or use `:focus-visible` for keyboard-only focus indication.

Tooltips that only show on hover are inaccessible. Use libraries that handle keyboard focus, or skip tooltips when the information isn't critical.

## Screen reader announcements

For dynamic content (loading complete, item added, error):

```tsx
<div role="status" aria-live="polite">
  {loaded && "Posts loaded"}
</div>

<div role="alert" aria-live="assertive">
  {error && error.message}
</div>
```

- `aria-live="polite"` — announce when idle (status updates).
- `aria-live="assertive"` — interrupt immediately (errors, urgent).

Use sparingly — too many announcements overwhelm users.

## Skip links

For users who tab through pages, a "Skip to main content" link bypasses repeated navigation:

```tsx
<a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
<header>...</header>
<main id="main">...</main>
```

`sr-only` (visually hidden but available to assistive tech); `focus:not-sr-only` makes it visible on focus. Standard pattern.

## Headings and landmarks

A logical heading hierarchy:

```tsx
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
<h2>Another Section</h2>
```

Don't skip levels (h1 → h3 without h2). Don't use h-tags for visual styling — that's CSS.

Landmark elements (`<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`) let screen reader users jump between page regions.

## Accessible component libraries

Building accessible components from scratch is hard — focus management, ARIA, keyboard support all need to be right. Libraries that get this right:

- **Radix UI** — unstyled accessible primitives. Strongly recommended.
- **React Aria** (Adobe) — hooks for accessible component logic.
- **shadcn/ui** — built on top of Radix; copy-paste components.
- **Headless UI** — Tailwind UI primitives.

These handle the hard a11y stuff so you can focus on styling and product behavior. Strongly prefer using one of these over building from scratch.

## Testing accessibility

Automated tools catch ~30% of a11y issues. Manual testing catches the rest.

**Automated:**

- **axe DevTools** browser extension — most popular.
- **eslint-plugin-jsx-a11y** — catches issues during dev.
- **Lighthouse Accessibility audit** — built into Chrome DevTools.
- **@axe-core/react** — integrate into your test suite.

**Manual:**

- Tab through the page.
- Use a screen reader (VoiceOver on Mac, NVDA on Windows, JAWS in enterprise).
- Zoom to 200%; verify everything still works.
- Test in high-contrast mode.

Combined, you'll catch the majority of issues.

## Mistakes to avoid

- **`<div onClick>` instead of `<button>`.** Loses keyboard support, semantics.
- **No labels.** Screen reader users can't identify inputs.
- **Color-only state.** Excludes colorblind users.
- **Hover-only interactions.** Excludes keyboard/touch users.
- **`aria-label` over visible text.** When text is visible, use it; aria-label is for when there's no visible label.
- **Focus traps without escape.** User stuck in a modal.
- **Skipping levels (h1 → h3).** Screen reader users navigate by headings.

## Summary

- Semantic HTML first; `<button>` not `<div onClick>`.
- Every interactive element keyboard-accessible.
- Focus management when UI changes significantly.
- ARIA for what HTML can't express; not as replacement.
- Forms need labels; errors need association.
- Color paired with another signal.
- Use accessible component libraries (Radix, React Aria).
- Automated testing catches ~30%; manual testing catches the rest.

Course complete.
