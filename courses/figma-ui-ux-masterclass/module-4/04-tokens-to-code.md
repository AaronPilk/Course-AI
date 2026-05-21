---
module: 4
position: 4
title: "Tokens to code — handoff strategies"
objective: "Bridge design tokens to engineering implementation."
estimated_minutes: 5
---

# Tokens to code — handoff strategies

## The handoff problem

Design tokens in Figma; engineering uses CSS variables, Tailwind config, or a design-tokens.json. Without bridging, they drift:
- Design ships new blue; engineers still use old hex.
- Engineering adds a value; design doesn't know.
- Both sides maintain parallel sources of truth.

The fix: a pipeline from Figma variables → code tokens.

## The Design Tokens Spec

W3C Design Tokens Community Group has a standard format: `design-tokens.json` with structure like:
```
{
  "color": {
    "brand": {
      "primary": { "$value": "#3B82F6", "$type": "color" }
    }
  }
}
```

Many tools read/write this format; positions tokens as portable between design and code.

## Pipeline options

**Manual export.**
- Designer updates Figma variables.
- Exports JSON via plugin.
- Engineer commits to repo.
- Tedious; error-prone; lag time.

**Plugin-driven.**
- Plugin syncs Figma variables to GitHub.
- Designer changes → plugin pushes to repo.
- CI builds CSS variables / Tailwind config.

**Engineering-driven.**
- Tokens defined in code first.
- Designer imports JSON to Figma via plugin.
- Code is source of truth.

Each has trade-offs; pick based on team velocity.

## Tokens Studio plugin

Popular plugin for token management:
- Define tokens in plugin UI (or import from JSON).
- Push to Figma variables.
- Export to JSON / Style Dictionary / CSS variables.
- Sync to GitHub for version control.

For teams treating tokens seriously, Tokens Studio is the standard.

## Style Dictionary

Amazon's build system for tokens. Reads design-tokens.json → transforms → outputs platform-specific formats:
- CSS variables.
- Tailwind config.
- Swift / Kotlin / Android XML.
- SCSS / LESS / JS objects.

Single source → multiple platforms; great for cross-platform products.

## CSS variables

The web standard. Define once; reference everywhere:
```
:root {
  --color-brand-primary: #3B82F6;
  --space-4: 16px;
  --radius-md: 8px;
}
```

Components reference `var(--color-brand-primary)`; runtime swappable for theming.

## Tailwind config

Tailwind ships with tokens in `tailwind.config.js`:
```
theme: {
  colors: {
    'brand-primary': '#3B82F6',
    ...
  },
  spacing: {
    '4': '16px',
    ...
  }
}
```

Utilities: `bg-brand-primary`, `p-4`, `rounded-md`. Tokens compiled into class names; great for fast iteration.

## Modes / theming in code

CSS variables flip on selector:
```
:root { --color-bg-surface: white; }
[data-theme="dark"] { --color-bg-surface: black; }
```

Tailwind: dark mode utilities (`dark:bg-black`); or CSS variable + utility hybrid.

The Figma variable's mode maps to this pattern.

## Naming alignment

Figma tokens and code tokens should align:
- Figma: `color/brand/primary`.
- CSS: `--color-brand-primary`.
- Tailwind: `colors.brand.primary`.

Slashes / hyphens / dots vary by syntax; the structure stays the same. This alignment helps designers + engineers communicate.

## Handoff workflow

A mature workflow:
1. Designer defines tokens in Figma variables.
2. Plugin exports to design-tokens.json.
3. JSON committed to design-tokens repo.
4. CI runs Style Dictionary → outputs CSS variables + Tailwind config.
5. Web/mobile teams import generated files.
6. Components reference tokens by name.

Changes flow design → code in minutes, not weeks.

## Code-first vs. design-first

**Design-first.** Figma is source of truth; code derives.

**Code-first.** Code repo is source of truth; Figma imports.

Trade-offs:
- Design-first feels natural; designers control vocabulary.
- Code-first ensures engineering reality (some values are platform-constrained).

Many teams: code-first for hard constraints (engineering reality), design-first for visual decisions.

## Versioning tokens

Treat tokens as APIs:
- Semantic versioning: MAJOR.MINOR.PATCH.
- MAJOR for breaking changes (rename, deletion).
- MINOR for additions.
- PATCH for value tweaks.

Token versions ship with library updates; consumers can choose when to adopt.

## Token coverage in code

Audit your codebase: how much uses tokens vs. hardcoded?
- High coverage: 90%+ of values reference tokens.
- Tokenization gaps: hardcoded hex / pixel values flag tech debt.

ESLint rules can enforce: no hardcoded colors / spacing. Force token references.

## Documentation

Tokens need docs in two places:
- **Design.** Figma variable descriptions (visible in picker).
- **Code.** Comments / README explaining purpose.

Token names should be self-documenting; descriptions add nuance ("use this for primary actions only").

## Platform translations

Tokens translate per platform:
- **Web.** CSS variables, Tailwind, or CSS-in-JS.
- **iOS.** Swift constants, asset catalogs.
- **Android.** XML resources, Kotlin objects.
- **React Native.** Theme object.

Style Dictionary handles these transformations; one design-tokens.json → all platforms.

## Update propagation

When design changes a token:
- Mature pipeline: change reaches code in CI run; engineers see PR with diff.
- Manual pipeline: designer pings engineer; engineer copies value.

Automate when team is large enough to justify (10+ engineers or 5+ designers).

## Common tools

- **Tokens Studio.** Figma plugin for token management.
- **Style Dictionary.** Build system.
- **Figma Tokens to Code plugin.** Direct export.
- **Specify.** Hosted token platform.
- **Supernova.** Hosted token platform.

Start with Tokens Studio + Style Dictionary; both free.

## Mistakes to avoid

- **No pipeline.** Hand-copying values; drift.
- **Two sources of truth.** Figma + code disagreeing.
- **No versioning.** Surprise breaking changes.
- **Naming drift.** Figma uses one name; code uses another.
- **Skipping documentation.** Adopters don't know which token to use.

## Summary

- Tokens flow design → code via a pipeline.
- Design Tokens Spec (`design-tokens.json`) is the portable format.
- Style Dictionary transforms tokens to platform-specific outputs.
- CSS variables / Tailwind / Swift / Kotlin all consume the same source.
- Tokens Studio plugin syncs Figma variables to code.
- Treat tokens as APIs: versioned, documented, stable.

Next module: prototyping, handoff, collaboration.
