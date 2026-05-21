---
module: 5
position: 3
title: "Asset management and the asset library"
objective: "Organize and reuse models, materials, node groups across projects."
estimated_minutes: 5
---

# Asset management and the asset library

## What the asset library is

Blender's asset library = curated collection of reusable items (models, materials, node groups, brushes, world setups) accessible across projects.

Drag from asset library → into current project. Asset is appended (or linked) and ready to use.

Saves time: build once; reuse forever.

## Asset library setup

Preferences → File Paths → Asset Libraries → Add Library:
- Name (e.g., "My Assets").
- Path (folder where assets live).

The folder contains .blend files; Blender scans them; surfaces items marked as assets.

## Marking items as assets

In any .blend file:
- Outliner → right-click object / material / node group → Mark as Asset.
- An asset preview thumbnail is generated.
- Optional: edit metadata (author, description, tags) in Asset Browser.

For: making a sofa model available to all your projects.

## Asset Browser

Window → Asset Browser. Browse assets across libraries:
- Library dropdown: current file, current project, system, my custom libraries.
- Search by name or tag.
- Filter by type (object, material, node group).

For finding assets across the library quickly.

## Drag-drop usage

In Asset Browser: drag asset to viewport / outliner / shader editor.

- Drag object → object placed in scene (with cursor as position).
- Drag material → applied to selected face / object.
- Drag Geometry Nodes group → added as modifier.

For: building scenes from library; instant material application.

## Library organization

Best practices:
- **By type.** Materials / Objects / Brushes / Node Groups.
- **By project.** Sci-fi / Fantasy / Modern / Architectural.
- **By function.** Furniture / Lights / Foliage / Vehicles.

For solo work: simple structure. For team: matched to projects + style guides.

## Append vs. Link

When importing:
- **Append.** Copies asset into your file. Independent.
- **Link.** References asset; updates as source changes.

For reusable assets where the source might update (template files): Link.
For one-off use: Append.

Append: File → Append (or drag asset and choose Append in Asset Browser).
Link: File → Link.

## Cross-file material sharing

Build a great material in one project; mark as Asset; use in any future project.

For: brand-color materials (your studio's color palette as materials); skin shaders; common metal / plastic / wood materials.

Library asset materials = consistency across projects.

## Node group asset library

Useful Geometry Nodes / Shader nodes saved as groups:
- "Brick Wall Generator" Geometry Nodes group.
- "Color Variation Tint" Shader nodes group.
- "Random Roughness" Shader nodes group.

Save once; reuse across projects.

For: building a personal kit of procedural tools.

## Brush asset library

Sculpting / Texture Paint brushes can be assets:
- Custom alpha-driven brushes.
- Specific shape brushes.

For: maintaining a personal brush kit (skin pore brushes; wood grain brushes; etc.).

## Posts library (for posing)

Save poses as assets:
- Action / pose → Mark as Asset.
- Drag onto rigged character; pose applied.

For: pose library across character animation projects.

## Collection-based asset packs

A whole Collection (group of objects) marked as asset:
- "Modern Living Room Set" — sofa + table + chair + lamp + plant.
- Drag into project; entire set arrives.

For: room kits, vehicle parts, character outfit sets.

## Distinguishing asset library systems

- **System library.** Blender's built-in (basic).
- **User library.** Your own (defined in Preferences).
- **Project library.** Per-project (within .blend).
- **Online libraries.** Polyhaven asset browser plugin pulls from polyhaven.com.

For 90% of work: User library + occasional Polyhaven.

## Polyhaven integration

Polyhaven (polyhaven.com) is a free open-source library:
- HDRIs, textures, models.
- Free for any use.
- Direct integration via Polyhaven addon → assets appear in Asset Browser.

For HDRIs + textures + base models: Polyhaven first.

## BlenderKit

BlenderKit = subscription asset service:
- Thousands of materials, models, scenes.
- Integrated panel within Blender.
- Free + paid tiers.

For commercial work needing diverse asset access without curating own library.

## Asset metadata

For each asset:
- **Name.** Display name.
- **Author.** Who made it.
- **Description.** Usage notes.
- **Tags.** Search keywords.
- **License.** Usage rights.

For shared / team libraries: metadata enables search + discovery.

## Library workflow

For a typical project:
1. **Open new file.**
2. **Asset Browser → drag in environment (room) from library.**
3. **Drag character from library.**
4. **Drag pre-made HDRI from library.**
5. **Drag materials onto specific objects.**
6. **Camera + lighting setup (perhaps from library template).**
7. **Tweak; render.**

What used to take hours (build everything) now takes minutes.

## Building a personal library

Over time, build:
- Common materials (skin, metals, woods, plastics).
- Common node groups (color tint, roughness variation).
- HDRI collection (studio, outdoor, indoor).
- Reusable models (props, vehicles, characters).
- Lighting setups (three-point + variations).
- Camera setups (focal lengths, DoF presets).

A solo artist can build a powerful library in 6-12 months of consistent saving.

## Mistakes to avoid

- **No library.** Rebuild same assets each project.
- **Library not organized.** Can't find what you need.
- **No metadata.** Search returns nothing.
- **One huge library.** Slow loading; cluttered browser.
- **Mixed licenses.** Unsure what's commercial-usable.

## Summary

- Asset library = reusable items across projects.
- Mark as Asset → preview + drag-drop.
- Asset Browser for browsing + search.
- Organize by type / project / function.
- Polyhaven addon for free assets.
- Mark node groups + materials + objects + brushes + poses as assets.
- Build personal library over months for compound productivity.

Next: Blender in production.
