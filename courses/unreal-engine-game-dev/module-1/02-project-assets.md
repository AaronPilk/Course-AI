---
module: 1
position: 2
title: "Project creation and asset organization"
objective: "Start projects right; organize assets to scale."
estimated_minutes: 5
---

# Project creation and asset organization

## Creating a project

Epic Games Launcher → Unreal Engine → Library → Launch → Unreal Editor opens.

Project Browser appears:
- **Games / Film / Architecture / Automotive** categories.
- **Templates** within each (Blank, First Person, Third Person, Top Down, etc.).
- **Starter Content** option.
- **Project Defaults** (Blueprint or C++).
- **Quality presets.**

Pick template + name + location → Create Project.

## Template choices

For learning:
- **Third Person Blueprint.** Most general; includes a character, basic level, animations.
- **First Person.** FPS basics included.
- **Top Down.** Strategy / RPG basics.
- **Blank.** Empty; you build everything.

For specific genres: pick matching template; modify.

## Starter Content

Toggle on for first projects:
- Basic materials, meshes, lights, particle effects.
- Saves hours hunting for placeholder assets.
- Disable for production projects (clutters Content Browser).

For prototyping: always include.

## C++ vs. Blueprint

**Blueprint:** visual scripting only; no code.
**C++:** code-based with Blueprint integration.

For learners: start Blueprint-only. Build skill; add C++ later if needed.

For professional studios: C++ for performance-critical systems; Blueprint for designers + iteration.

Most indie + small studio games are heavily Blueprint with selective C++.

## Folder structure (Content directory)

Standard organization:
- **`/Game/`** — your project assets (always under Content/).
- **`/Game/Characters/`** — character-related.
- **`/Game/Environments/`** — level assets.
- **`/Game/Materials/`** — materials, textures.
- **`/Game/Blueprints/`** — Blueprint classes.
- **`/Game/Audio/`** — sound files.
- **`/Game/UI/`** — UMG widgets.
- **`/Game/FX/`** — particles, Niagara.
- **`/Game/Maps/`** — level files (Levels).

Then subfolders by feature / system.

For 1000+ asset projects: discipline pays off.

## Naming conventions

Epic's recommended naming:
- **SM_** — Static Mesh (e.g., SM_Wall).
- **SKM_** — Skeletal Mesh.
- **M_** — Material.
- **MI_** — Material Instance.
- **T_** — Texture.
- **BP_** — Blueprint.
- **WBP_** — Widget Blueprint (UI).
- **NS_** — Niagara System.
- **L_** — Level.
- **A_** — Sound.
- **AS_** — Animation Sequence.

Plus suffixes for variants (e.g., M_Wood, M_Wood_Worn).

## The Project file

`.uproject` = project metadata (engine version, modules, plugins).
`Content/` = all assets.
`Source/` = C++ source (if C++ project).
`Saved/` = autosaves, logs, cache.
`Intermediate/` = build artifacts (regenerable).

Backup: Content/ + Source/ + .uproject. Skip Saved/ and Intermediate/ (regenerable).

## Source control

For team / long-term work: Perforce (game industry standard) or Git LFS.

UE5 has built-in source control panels:
- Source Control → Submit (commit).
- Source Control → Sync (pull).

For solo work: incremental project backups suffice.

## Asset references

Assets reference each other:
- Material references textures.
- Blueprint references meshes + materials.
- Level references actors + Blueprints.

The Reference Viewer (right-click asset → Reference Viewer) shows the dependency graph.

For: understanding impact of changes; finding unused assets.

## Migrate assets

Move assets between projects:
- Right-click asset → Asset Actions → Migrate.
- Pick destination project's Content folder.
- Asset + all references copied.

For: reusing characters / environments across projects.

## Asset references and broken links

If you move / rename assets in OS file browser (outside Unreal): references break.

ALWAYS rename / move via Unreal's Content Browser. Updates references automatically.

## Marketplace

Epic Marketplace (free + paid asset packs):
- High-quality models, materials, sound packs.
- Subscription-style "Free for the Month" assets.
- Add to project: Marketplace → Add to Project → import.

For: quick asset acquisition; production-grade content.

## Quixel Megascans

Quixel (acquired by Epic) provides 15,000+ scanned assets:
- Free for Unreal use.
- Trees, rocks, textures, foliage, decals.
- Integrated via Quixel Bridge (built-in to UE5).

For environment work: Megascans is the go-to.

## MetaHumans

MetaHuman Creator (epicgames.com/metahuman) — photoreal human characters:
- Web-based creator.
- Customizable face, body, hair.
- Free for Unreal projects.
- Rigged and ready for animation.

For: realistic characters without modeling humans from scratch.

## Asset performance

Imported assets carry data:
- **Texture size.** 4K textures = large memory.
- **Mesh polygon count.** High-poly = expensive.
- **Material complexity.** Layered shaders = render cost.

For optimization: profile early; identify expensive assets; optimize as needed.

## Auto-save

Edit → Editor Preferences → Loading & Saving → Auto Save Settings:
- Every 5-10 minutes.
- Keep 20+ versions.

For: recovery after crashes.

## Mistakes to avoid

- **No folder structure.** Flat Content/; everything in one place.
- **No naming conventions.** Random names; hard to find.
- **Moving files in OS file browser.** Broken references.
- **No Starter Content / Marketplace assets used.** Spending time on placeholder.
- **Single template forever.** Use specific templates for genre-fit start.

## Summary

- Create project: pick template (Third Person typical for general learning).
- Folder structure: by feature (Characters, Environments, Materials, etc.).
- Naming conventions: SM_, BP_, M_, etc. (Epic standard).
- Marketplace + Quixel + MetaHumans for free / paid assets.
- Always rename / move via Content Browser; never OS-level.
- Source control for team work.

Next: levels, actors, and components.
