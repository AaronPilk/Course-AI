---
module: 3
position: 4
title: "Libraries and team consumption"
objective: "Publish components for team use; manage updates and adoption."
estimated_minutes: 5
---

# Libraries and team consumption

## What a library is

A library is a Figma file whose components are published for use in other files. Teams build a "Design System" library; product files consume its components.

The published file exposes components, styles (typography, color), and variables for downstream files to use without copying.

## Publishing a library

In the design system file: right panel → Assets → Libraries → Publish.

Figma scans for components and styles; prompts you to confirm what's published; pushes to the workspace.

Other files in the workspace can now enable this library.

## Library updates

When you edit a component in the library file → publish again → consumers see "Updates available" in their file.

Designers click "Update" → instances refresh to the new version. Or click "Review changes" to see diffs before accepting.

## Selective updates

Sometimes the library changes more than the team wants to adopt yet. Consumers can:
- **Update all.** Accept everything.
- **Review changes.** See diffs per component; accept or skip.
- **Skip update.** Keep current; the badge persists.

For breaking changes (e.g., Button color refactor), team coordination matters — usually a Slack ping when shipping.

## Library structure

A typical design system library:
- **Foundations.** Color styles, type styles, effect styles, variables.
- **Atoms.** Button, Input, Icon, Avatar, Tag.
- **Molecules.** Form fields, list rows, navigation items.
- **Organisms.** Cards, sections, navigation bars.
- **Patterns.** Sign-in flow examples, dashboard layouts.

Organize each in its own page. Use cover pages with system documentation.

## Enabling a library in a consumer file

In product file: Assets tab → Libraries → toggle library on.

Now the asset panel shows the library's components; drag in to use. Variables and styles from the library are available in pickers.

## Multiple libraries

A team might have:
- **Core.** Primitive components used everywhere.
- **Marketing.** Site-specific components (heroes, pricing).
- **Product.** App-specific components (dashboards, settings).

Files enable only the libraries they need; reduces noise.

## Library hygiene

Track:
- **Component health.** Old / deprecated marked clearly.
- **Versioning.** Major changes in semantic-version notes.
- **Coverage.** What's in the library vs. what's still custom in product files.

A dashboard or doc tracks: "Card v2 deprecates Card v1; migrate by Q3."

## Deprecating components

Don't delete — break instances everywhere. Instead:
- Rename to `[DEPRECATED] Button/Old`.
- Add a description: "Use Button/New instead."
- Hide from suggestions: in main → component description → "deprecated."

Consumers see the deprecation in component picker; eventually all instances migrated; safe to delete.

## Branching

Figma branching: create a branch from main file → make experimental changes → merge when ready.

Useful for:
- Refactoring a major component without breaking active product designs.
- Trying a new direction without committing.
- Collaborating on a feature with multiple designers.

Branches don't auto-publish; merge to main to push to consumers.

## Library best practices

- **Document.** Each component has a description: usage, dos/don'ts.
- **Version notes.** "What's new" page; ship with each library update.
- **Deprecation policy.** Clear migration timeline before deletion.
- **Asset paths.** Consistent / naming so asset panel groups well.
- **Ownership.** One team owns each library; PRs come through them.

## Component reviews

For mature design systems, component changes need review:
- **PR-style.** Designer proposes change in a branch; design system team reviews.
- **Async review.** Slack thread with screenshots; team approves.
- **Synchronous.** Design system meeting weekly.

Process avoids surprise breaking changes for downstream consumers.

## Theming through libraries

For multi-brand products: separate libraries per theme.

- **Brand A library.** Components with brand A colors / type.
- **Brand B library.** Components with brand B colors / type.

Product files enable the right library per project. Or use variables (next module) for cleaner theming.

## Performance with libraries

Heavy libraries (1000+ components) can slow Figma. Optimize:
- **Variants over multiple components.** Fewer entries in asset panel.
- **Hide internal-only components.** Right-click → Hide from publish.
- **Split libraries.** Don't bundle marketing + product in one.

For large orgs, performance tuning matters; Figma's documentation has profiling guidance.

## Common library structures

**Small team (5-10 designers):**
- 1 library: "Design System" with everything.

**Medium team (20-50):**
- Foundations + Components.

**Large team (50+):**
- Foundations, Components, Marketing, Mobile, Web, etc.

The structure mirrors org structure; align with engineering team boundaries.

## Onboarding new designers

When a designer joins:
- **Enable libraries.** Walk through which to turn on.
- **Library tour.** Show structure + docs.
- **First task.** Use existing components for a new screen; force-engages with the system.

Without onboarding, new designers default to copy-paste — bypassing the system.

## Library evolution

Libraries evolve:
- Year 1: build out atoms / molecules.
- Year 2: refactor for variants / properties.
- Year 3: add variables; theming.
- Year 4: bridge to code (tokens-to-code pipeline).

Each phase is months of work; libraries are products themselves.

## When NOT to use a library

For one-off projects with no reuse expectations: skip. The overhead of library + publishing + updating isn't worth it.

For small teams (1-2 designers, single product): a Components page in the design file may suffice without publishing.

Threshold: 3+ files referencing the same components = library worth it.

## Mistakes to avoid

- **No library.** 50 product files each with copy-pasted Button.
- **Mega-library.** Everything bundled; performance + cognitive overload.
- **No documentation.** Adopters use wrong components.
- **No versioning.** Surprise breaking changes.
- **No deprecation policy.** Old + new components coexist forever.

## Summary

- Publish design files as libraries for team consumption.
- Updates flow library → consumer files with review option.
- Organize: foundations + atoms + molecules + organisms.
- Multiple libraries for large orgs (core, marketing, product).
- Deprecate before delete; document with descriptions.
- Branching for experimental changes; merge to main to publish.

Next module: variables and design tokens.
