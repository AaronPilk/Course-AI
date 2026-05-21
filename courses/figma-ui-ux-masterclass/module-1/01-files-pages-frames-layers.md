---
module: 1
position: 1
title: "Files, pages, frames, layers"
objective: "Figma's organizational hierarchy and how to use it."
estimated_minutes: 5
---

# Files, pages, frames, layers

## The hierarchy

Figma organizes work in a clear hierarchy:

```
Team
  Project
    File
      Page
        Frame
          Layer
            Layer
              ...
```

Each level has a purpose. Knowing the hierarchy means knowing where to look + where to put things.

## Team and Project

**Team.** Your organization or design group. Has members + permissions.

**Project.** A folder of files within a team. Group by product, client, or initiative.

Examples:
- Team: "Acme Design"
- Projects: "Mobile App," "Marketing Site," "Brand System."

Files live in projects. Free Figma plans have limited projects; paid scales.

## Files

A file is a single Figma document. Contains pages, frames, and layers.

Files are the unit of:
- **Sharing.** Send a file URL; collaborators open.
- **Versioning.** Branch / merge; version history.
- **Library publishing.** A file can be a published library.

Best practice: one file per major feature or area. Massive files (hundreds of frames) slow down + are hard to navigate. Smaller files referencing shared libraries scale better.

## Pages

Pages are top-level sections within a file. Tabs at the left.

Common structure:
- **Cover.** First page; preview thumbnail; describes file.
- **Inventory.** All screens / components.
- **Working Draft.** Where current work happens.
- **Archive.** Old explorations.

Or by feature:
- **Onboarding.**
- **Dashboard.**
- **Settings.**
- **Components.**

Pages help organize; switching is fast. Use them.

## Frames

Frames are container shapes — like artboards in older tools, but more powerful. A frame:
- **Defines a coordinate space.** Children positioned within.
- **Has a size + style.** Display as a card / page / region.
- **Can be nested.** Frames inside frames.
- **Anchors Auto Layout.**

Press `F` to draw a frame. Or use device frame presets (iPhone, iPad, Web).

For screen designs: one frame per screen, sized to target device.

## Layers

Within a frame: layers. Rectangles, text, images, vectors, components.

Layer panel (left): tree view of nested layers. Click to select; drag to reorder; rename for clarity.

Naming layers matters:
- **Vague names ("Rectangle 2") hurt** as files grow.
- **Descriptive names ("Header Background")** help collaborators.

Rename on creation; future-you will thank you.

## Navigation gestures

- **Pan.** Hold spacebar + drag, or middle-click + drag.
- **Zoom.** Cmd/Ctrl + scroll, or pinch on trackpad.
- **Zoom to fit.** Shift+1.
- **Zoom to 100%.** Shift+0.
- **Zoom to selection.** Shift+2.
- **Select layer (any depth).** Cmd/Ctrl + click.

These eight shortcuts cover ~90% of navigation. Memorize.

## Selection

- **Single click.** Selects topmost.
- **Double click.** Drills into nested.
- **Cmd/Ctrl + click.** Selects layer regardless of depth.
- **Shift + click.** Adds to selection.
- **Right-click → Select all with same...** Same color, font, etc.
- **Enter / Esc.** Drill in / drill out of nested.

Selection efficiency = work speed.

## Layer organization

Group related layers:
- **Frames** create real containers.
- **Groups** (Cmd/Ctrl+G) bundle without geometry.
- **Components** are reusable groups.

Frames usually preferred over groups — they have padding, constraints, Auto Layout. Groups exist mainly for legacy / quick grouping.

## File-level tools

- **Cover thumbnail.** Top-left "Set thumbnail" — picks the frame to show as file preview.
- **Description.** File-level notes; visible to team.
- **Library publishing.** Make components / styles available to other files.

For team-visible files: set a cover thumbnail + meaningful name. Helps people find files later.

## Sharing and permissions

- **Public.** Anyone with link can view (no Figma account needed).
- **Team can view.**
- **Team can edit.**
- **Specific people.**

For client work: view-only links. For team collaboration: edit access.

## Version history

Figma auto-saves; you can browse history:
- Right-click → Show version history.
- Restore any past version.
- Add a name to current version (snapshots).

For major design decisions: name the version. ("Final logo direction.") Easier to find later.

## Common workflow

A typical Figma project for a new feature:

1. Create a file in the relevant project.
2. Page: "Working Drafts" for exploration.
3. Page: "Final Designs" for ship-ready.
4. Frames per screen.
5. Components / styles from the team library (linked).
6. Comments from PMs / engineers as feedback.
7. Branching for experimental directions.
8. Hand off to engineers via Dev Mode.

We'll cover each as we go.

## Mistakes to avoid

- **Unnamed layers.** Rectangle 137 is meaningless.
- **One giant file.** Slow + hard to navigate.
- **No pages.** Everything on Page 1 = chaos.
- **Loose layers.** Always in frames; never floating in the void.
- **No version names.** Can't find that great old design later.

## Summary

- Team → Project → File → Page → Frame → Layer hierarchy.
- One file per feature / area; pages organize within.
- Frames are containers; layers are the contents.
- Cmd/Ctrl+click selects through depth; Shift+1 fits content.
- Name layers; set cover thumbnails; name important versions.
- Branch for explorations; revert via history if needed.

Next: keyboard shortcuts that matter.
