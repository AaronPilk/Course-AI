---
module: 1
position: 4
title: "Plugins worth your time"
objective: "The plugins that pay back daily."
estimated_minutes: 4
---

# Plugins worth your time

## The plugin ecosystem

Figma has thousands of plugins; most you'll never use. A small set covers ~90% of designer needs. Focus on these; ignore the rest until you have specific need.

Install via right-click → Plugins → Manage plugins → browse / search Community.

## Content and dummy data

**Content Reel.** Generates lorem ipsum, names, addresses, emails, dates. Fills your design with realistic-looking placeholder content.

**Unsplash.** Adds photos from Unsplash directly. Click a shape; pick a photo; it fills.

**Lorem Ipsum.** Generates text at varying lengths.

For mockups beyond "Item 1, Item 2, Item 3": these plugins make designs look real.

## Icons and assets

**Iconify.** Access to many icon libraries (Material, Heroicons, Tabler, etc.) within Figma. Pick a set; insert as SVG; recolor; resize.

**Feather Icons / Phosphor Icons / Lucide.** Specific icon-pack plugins.

For Apple-specific work: SF Symbols (separate macOS app, not a Figma plugin — paste SVG export).

## Design system / variables

**Variables Importer / Exporter.** Sync Figma variables with code (JSON, Style Dictionary). Useful if you maintain tokens in Figma.

**Component Cleaner.** Detects orphaned variants, unused components.

**Design Tokens.** Generates token files for development frameworks.

## Accessibility

**Stark.** Accessibility checker — contrast ratios, color-blindness simulation, focus order, more. Mandatory if accessibility matters.

**A11y - Color Contrast Checker.** Simpler contrast check.

**Able.** Quick check; ARIA suggestions.

For ship-ready designs: run Stark on every screen. Catches issues that affect real users.

## Spec / handoff

**Inspect Element** (built into Figma's Dev Mode now).

**Figma Tokens.** Token management; pairs with code.

**Anima.** Generates React / Vue / HTML from Figma. Quality varies; useful for marketing pages, less for production apps.

## Productivity

**Find and Replace Color.** Bulk swap colors across a file.

**Batch Styler.** Apply styles in batch.

**Component Replacer.** Swap one component for another across a file.

**Master.** Helps manage components / styles.

For maintenance work on large files: these save hours.

## Animation and prototyping

**Figmotion.** Animation timeline within Figma.

**Lottie Files.** Import / preview Lottie animations.

**ProtoPie.** Advanced prototyping (separate tool with plugin).

Figma's native prototyping handles most needs; reach for these for complex motion.

## Specific format exporters

**SVG Export.** More options than Figma's built-in.

**TinyImage.** Image compression on export.

**Image Optim.** PNG / JPG compression.

Built-in Figma export is fine for most cases; reach for these when optimizing for production assets.

## Plugins to avoid (mostly)

- **AI plugins generating UI.** Quality variable; can be useful but check carefully.
- **Plugins requiring excessive permissions.** Some plugins want full file write — audit.
- **Outdated plugins.** Check last update; Figma's API evolves.
- **One-purpose plugins for things you do once.** Better to do manually if needed once.

## How to use plugins efficiently

- **Pin frequently-used.** Right-click in Plugins menu → Pin. Quick access at top.
- **Keyboard shortcut via Quick Actions** (Cmd+/) → type plugin name.
- **Learn the plugin's hotkeys.** Some have their own (Stark uses Cmd+Shift+S).

## Plugin organization

Pin 5-10 plugins to top of menu; remove the rest from your view. Less menu noise; faster access to ones you use.

For each plugin install: ask "does this solve a real problem I have, or am I just collecting?" Most won't earn their place.

## Updating plugins

Plugins update independently; you'll see notifications. Most updates are bug fixes. Occasionally a plugin breaks (Figma API changes); switch to alternative if maintainer doesn't update.

## When to build your own plugin

For team-specific needs:
- Custom design system import/export.
- Team-specific naming conventions.
- Brand-specific quick-add components.
- Specific workflow automation.

Figma's Plugin API supports custom plugins; learn TypeScript + their API. Most teams don't need this; some larger orgs build internal plugins.

## Mistakes to avoid

- **Installing every "top" plugin.** Plugin bloat; slows Figma.
- **Trusting AI-generated UI without review.** Quality varies.
- **Forgetting plugins exist.** Doing things manually that a plugin would handle.
- **Not running Stark.** Accessibility issues miss.

## Summary

- Content / dummy data: Content Reel, Unsplash, Iconify.
- Accessibility: Stark (mandatory).
- Productivity: Find and Replace Color, Batch Styler, Component Replacer.
- Pin 5-10 frequently used; remove the rest from view.
- Run Stark before shipping designs.
- Don't install every plugin; curate.

Module 1 complete. Next module: Auto Layout.
