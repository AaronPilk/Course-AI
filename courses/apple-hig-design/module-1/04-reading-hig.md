---
module: 1
position: 4
title: "Reading the HIG: how Apple writes its own rules"
objective: "Use Apple's documentation effectively."
estimated_minutes: 5
---

# Reading the HIG: how Apple writes its own rules

## The HIG as a document

The Human Interface Guidelines (`developer.apple.com/design/human-interface-guidelines/`) is Apple's living design specification. Reorganized in 2022 into:

- **Foundations.** Principles, accessibility, typography, color, icons.
- **Patterns.** App architecture, navigation, search, onboarding.
- **Components.** Buttons, controls, sheets, views.
- **Inputs.** Touch, pointer, keyboard, voice.
- **Technologies.** Specific Apple features (Live Activities, Widgets, etc.).

Plus per-platform pages (iOS, iPadOS, macOS, visionOS, watchOS, tvOS) where conventions differ.

Read all of it once. It's compact; well-written; the best design document Apple's ever produced.

## How the HIG writes

Apple's prose is opinionated but careful. Watch for:

**"Do" / "Avoid" examples.** Every section has these. Often illustrative more than absolute — read the surrounding paragraph to understand the principle.

**"Generally" / "Usually" / "Often."** Soft guidance, not law. Apple acknowledges exceptions.

**"Avoid" but not "never."** Sometimes there's a reason to break a guideline; Apple won't say "never."

**No prescriptive pixel measurements.** HIG uses point measurements; Apple wants you to think in semantic units, not pixel-precise rules.

The HIG isn't a rule book. It's a reasoning aid. Treat it as wisdom to apply, not laws to obey.

## What the HIG doesn't tell you

The HIG defines surfaces and principles. It doesn't say:

- How your features should work (your product).
- What to put on a screen (information architecture).
- What language to use (voice + tone are yours).
- What unique value to provide (positioning).

It tells you how to present once you know what.

For "what" questions: user research, product strategy, competitive analysis. HIG is the "how it should look and feel" layer above those decisions.

## When HIG contradicts itself

Sometimes guidance in one section contradicts guidance in another. Examples:
- Clarity wants prominent CTAs; deference says chrome should recede.
- Density wants information; spacing wants breathing room.

The HIG doesn't always reconcile. Real designers face these trade-offs; HIG points to the principles, you balance.

Pattern: clarity wins when truly important (safety, key features); deference wins when content matters (reading, watching, working). Use judgment.

## HIG by platform

iOS HIG covers iPhone conventions: tab bars, navigation stacks, modal sheets.

iPadOS HIG covers iPad-specific: sidebars, multi-column layouts, Stage Manager, keyboard/trackpad/Apple Pencil.

macOS HIG covers desktop: menu bars, sidebars, windows, document architecture, Mac Catalyst considerations.

watchOS HIG covers very small screens and Digital Crown.

visionOS HIG covers spatial computing — gaze, hand gestures, immersion levels, depth.

Read the platform you target. Cross-pollinate where ideas transfer; respect differences where they matter.

## SF Symbols app and Sketch / Figma libraries

Beyond the HIG document:

- **SF Symbols app** (Mac). Browse 5,000+ icons; preview at any weight; copy as image or code.
- **Figma's iOS UI Kit.** Free; semi-official; lets you mock with platform controls.
- **Apple's Sketch design resources.** Templates with system fonts, colors, controls.
- **Apple Design Resources** page: developer.apple.com/design/resources.

Use these for accurate mockups. Don't redraw system icons; you'll get them subtly wrong.

## WWDC sessions

Every year Apple drops design sessions at WWDC. Topics:
- New design APIs (Liquid Glass in 2025; Materials in 2020; SF Symbols intros).
- Specific patterns (sheets, search, navigation in iOS X).
- Accessibility deep dives.
- Design / engineering collaboration.

Catalog: developer.apple.com/videos/. Excellent presentations; designers worth following.

## Reading example: navigation in iOS

Open HIG → iOS → Navigation. What you'll find:

- **Tab bars** for ~5 top-level destinations.
- **Navigation bars** for hierarchical drilling.
- **Modal sheets** for self-contained tasks.
- **Drawers** (less common; iOS doesn't love them).

Each pattern: do's, avoids, examples from Apple apps.

Apply to your app: which pattern fits your information architecture? Pick one or two, not all of them.

## Living document

The HIG updates with each major OS release. iOS 26 added Liquid Glass language (translucent layered materials); visionOS introduced spatial paradigms.

Subscribe to changes (Apple's design blog, RSS feeds for developer.apple.com). Major changes ripple through the design community.

## Critique: Apple's gaps

The HIG isn't perfect:

- **Some discoverability issues** acknowledged but rarely solved (hidden gestures).
- **Inconsistency between Apple's own apps.** Music, App Store, TV have heavier marketing chrome than what the HIG suggests.
- **Sparse on edge cases.** Very specific UI patterns left to designers.
- **Mostly silent on internationalization / RTL** specifics.

Designers fill the gaps. Read with discernment; the HIG is a starting point, not the last word.

## Other design systems worth studying

- **Material Design (Google).** Different philosophy; informative comparison.
- **Fluent Design (Microsoft).** Cross-Microsoft consistency.
- **Polaris (Shopify).** Excellent for commerce apps.
- **Spectrum (Adobe).** Creative tools focus.
- **Carbon (IBM).** Enterprise feel.

Each has trade-offs vs Apple's HIG. Studying multiple reveals which decisions are platform-specific vs general-good-design.

## How to use the HIG day-to-day

For each design decision:
1. **Find the relevant HIG section.** Search the doc.
2. **Read Apple's recommendation.** Understand the principle.
3. **Consider your context.** Does your case differ?
4. **Default to HIG; deviate consciously if needed.**
5. **Document your departure for the team.**

The HIG isn't bureaucracy; it's a shortcut for decisions everyone else has made and validated.

## Mistakes to avoid

- **Treat HIG as optional.** Loses platform UX.
- **Treat HIG as law.** Can't innovate or differentiate.
- **Skim once.** Internalize once; re-read sections as you encounter problems.
- **Apply iOS HIG to macOS.** Different conventions.
- **Ignore WWDC design sessions.** Misses evolving thinking.

## Summary

- HIG is Apple's living design spec; foundational reading.
- Foundations, Patterns, Components, Inputs structure; plus per-platform pages.
- Reasoning aid, not rule book; balance trade-offs with judgment.
- SF Symbols, design resources, Figma kits accelerate mockups.
- WWDC sessions extend the HIG annually.
- Read; default to it; deviate consciously when justified.

Module 1 complete. Next module: typography and layout.
