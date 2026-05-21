---
module: 5
position: 2
title: "Dev Mode and the engineer's view"
objective: "Hand designs to engineering with the right level of detail."
estimated_minutes: 5
---

# Dev Mode and the engineer's view

## What Dev Mode is

Dev Mode (introduced in 2023) is a Figma view tuned for engineers: read-only design inspection, code snippets, variable values, layer specs, and integration with code repos.

Toggle Dev Mode (top right toggle, or `Shift+D`). The UI shifts: simpler panel, code-focused.

## The Inspect tab

The classic engineer view in Design mode shows:
- **Layout.** Dimensions, position, padding, gap.
- **Typography.** Font family, size, weight, line-height.
- **Colors.** Fill / stroke values.
- **Effects.** Shadows, blurs.
- **Layer properties.** Borders, radius, opacity.

Inspect (or Dev Mode) auto-generates CSS / iOS / Android snippets engineers can copy.

## Dev Mode features

- **Code panel.** Auto-generated code for selected layer.
- **Snippet engine.** Customizable snippet format per project.
- **Variable references.** Shows variable names (not just resolved values) — engineers see `color/brand/primary` not just `#3B82F6`.
- **Component status.** Marks main components as "Ready for dev" or "In progress."
- **Asset export.** Direct download as SVG / PNG / PDF.
- **VSCode integration.** Plugin streams designs into the editor.

## Code snippets

Select a layer; the code panel shows:
```
.button {
  display: flex;
  padding: 12px 24px;
  border-radius: 8px;
  background: #3B82F6;
  color: white;
  font: 500 16px/1.5 Inter;
}
```

For frameworks: Tailwind, SwiftUI, Compose (Android), React Native — Figma generates plausible code; engineers refine.

## Variable name in snippets

With variables, the snippet uses the variable name:
```
.button {
  background: var(--color-brand-primary);
  padding: var(--space-3) var(--space-6);
}
```

Engineers see the token name; align with their CSS variables. This is the design-token handoff at the per-component level.

## Layer specs

Hover any layer; the spec panel shows:
- Width × height.
- Position (X, Y from parent).
- Distance to siblings.
- Padding to children.
- Gap between Auto Layout children.

For pixel-precise implementation, this is the source.

## Assets export

Right-click any frame / layer → Export → choose format + scale. SVG for icons; PNG for raster; PDF for print. Multiple scales for retina (1x, 2x, 3x).

In Dev Mode: direct download from the panel; no design context needed.

## Component status

Mark a main component:
- **Ready for dev.** Production-ready.
- **In progress.** Still iterating.
- **Deprecated.** Migrate away.

Engineers filter the components page by status; only consume "Ready for dev." Avoids implementing half-baked designs.

## Annotations

Add notes for engineers:
- Click annotation tool → place pin on a layer → write note.
- "This card collapses on mobile."
- "Button changes to loading state on submit."
- "Error message appears after 3s of no input."

Annotations stay anchored to layers across edits; engineers see them in Dev Mode.

## Measure tool

Hold Option (Mac) / Alt (Win); hover layers. Distances measured in pixels with red guides. Helpful for verifying spacing between elements during handoff.

## Code Connect

Figma Code Connect (advanced; paid tier): pair Figma components with their React / Vue / Swift component code. The Dev Mode panel then shows the actual component usage:
```
<Button variant="primary" size="medium">Save</Button>
```

Maps Figma variants to code props; engineers paste the snippet directly.

## Plugins for handoff

- **Figma to Code.** Generates HTML/CSS/Tailwind/React.
- **Figma Tokens (Tokens Studio).** Exports variables to design-tokens.json.
- **Figma Anima.** Generates React / HTML.
- **Figma Locofy.** AI-generated component code.

Quality varies; supplement with manual refinement.

## Read-only sharing

Share Figma files with view-only or "Can view dev resources" permission. Engineers get the inspection view without edit ability. Reduces risk of accidental design changes.

Most teams: design files are view-only for engineering; comments enabled.

## Spec docs alongside designs

Beyond Figma:
- **Notion / Linear page.** Background, requirements, acceptance criteria.
- **PRD.** Product requirements.
- **API contracts.** Backend integration.

Figma shows the visual + interaction; the spec doc covers the rest.

## Async handoff

Mature teams hand off async:
- Designer marks "Ready for dev"; pings engineer in Slack.
- Engineer reviews in Dev Mode; asks questions in Figma comments or async chat.
- Spec doc + Figma + occasional sync calls.

Reduces meeting overhead; documentation is the contract.

## Sync handoff

For complex flows: hand-off meeting.
- Designer walks engineer through the flow.
- Q&A on edge cases.
- Identify unknowns.

Mix: standard features hand off async; complex / novel features sync.

## Handoff content

A complete handoff includes:
1. **Visual designs.** Figma frames for every state (default, hover, loading, error, empty).
2. **Interaction spec.** Prototype + annotations for behavior.
3. **Component spec.** Variants + properties documented.
4. **Token reference.** Which variables to use.
5. **Assets.** Icons, images exported.
6. **Edge cases.** Long text, no data, slow network behavior.

Skipping any → engineering questions → loop time → delay.

## What engineers want

Common engineering asks:
- **Variable / token names, not just hex.** Maintain semantic alignment.
- **States.** All interactive states explicit, not implied.
- **Edge cases.** Empty / loading / error / overflow states.
- **Behavior spec.** Animations, durations, easing.
- **Asset readiness.** Exportable; correct format; correct scale.

Provide these proactively; reduces back-and-forth.

## Common handoff issues

- **Vague hover / focus states.** Engineers guess; consistency drifts.
- **Missing states.** Error / empty / loading not designed.
- **Token names absent.** Hardcoded hex in handoff.
- **Inaccessible content.** No alt text guidance.
- **Animation undefined.** "Make it smooth" without specifics.

Each adds engineer effort; multiplied across components = lots of effort.

## Engineer-friendly file structure

- **Components page.** Source components with statuses.
- **Variables.** All tokens defined.
- **Flow pages.** User journeys.
- **States pages.** All interactive states.
- **Specs pages.** Annotations + reference info.

Easier to find: faster handoff.

## Mistakes to avoid

- **Designs-only handoff.** No spec doc; engineers guess intent.
- **Variables absent.** Hardcoded hex; engineers can't align to CSS variables.
- **States missing.** Designer "We'll do error states later." Later = never.
- **Annotations skipped.** Tribal knowledge lost.
- **Component status absent.** Engineers implement half-baked designs.

## Summary

- Dev Mode is Figma's engineer-focused view: code snippets, variables, specs.
- Mark components "Ready for dev"; statuses prevent half-baked handoff.
- Annotations explain behavior; pin to layers; engineers see in inspection.
- Code Connect ties Figma components to React/SwiftUI/etc. code.
- Complete handoff: designs + interaction spec + token references + assets + edge cases.
- Async-first; sync for complex flows.

Next: comments, branching, version history.
