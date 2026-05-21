---
module: 5
position: 4
title: "Packaging and shipping to platforms"
objective: "Take your game from editor to player's device."
estimated_minutes: 5
---

# Packaging and shipping to platforms

## What packaging does

Packaging takes your editor project and creates a distributable build:
- Compiles code.
- Cooks assets (converts to platform-specific format).
- Bundles into executable + content files.
- Outputs to platform-specific directory.

The result: a folder players can run without needing the editor.

## Packaging vs. cooking

- **Cooking.** Converts assets to optimized platform-specific format (textures compressed, shaders precompiled, etc.).
- **Packaging.** Wraps cooked content with executable + dependencies into a distributable package.

In practice: usually done together.

## Package Project

In Editor:
- File → Package Project → pick platform.
- Or: Platforms menu → choose platform → Package.

Platforms:
- Windows.
- macOS.
- Linux.
- Android.
- iOS.
- PS5 (with PlayStation dev access).
- Xbox (with Xbox dev access).
- Switch (Nintendo dev license).
- HTML5 (legacy).

For most: start with Windows; expand later.

## Build configurations

Three main:
- **DebugGame.** Full debugging; slowest; for development.
- **Development.** Editor-like; reasonable speed.
- **Shipping.** Optimized; fastest; what players get; debugging stripped.

For player builds: Shipping. For testing builds: Development.

## Package settings

Project Settings → Packaging:
- **Build Configuration.** Shipping for releases.
- **Cooker settings.** What to cook.
- **Include / Exclude content.** Filter assets.
- **Compressed packages.** Smaller download.

For shipping: tune carefully.

## Project Settings → Maps & Modes

Critical settings:
- **Default Map.** Loaded first when game runs.
- **Server Default Map.** For dedicated servers.
- **Default Game Mode.** Default rules.
- **Default Pawn class.** Default character.
- **Default HUD.** Default UI.

Without these set: game spawns empty / broken.

## Platform-specific settings

Each platform has additional settings:
- **iOS.** App icon sizes, splash screens, bundle ID, provisioning.
- **Android.** Manifest, permissions, target API.
- **PS5 / Xbox.** Platform certification settings.

Configure in Platforms sub-menu of Project Settings.

## Testing the build

After packaging:
1. Navigate to output directory.
2. Find the executable (e.g., MyGame.exe on Windows).
3. Run it.
4. Test as a player would.

For: catching cook-time issues; player perspective bugs.

## Cooker errors

Common cook problems:
- Missing assets (deleted references).
- Cyclical references (assets loading each other infinitely).
- Platform-specific failures (texture format unsupported).
- Plugin issues (not configured for target platform).

Read the Output Log carefully; fix issues; re-cook.

## Optimizing build size

Builds can be huge (10-100 GB for AAA). Reduce:
- **Compressed packages.** Built-in compression.
- **Texture pool optimization.** Smaller textures.
- **Audio compression.** Lower bitrates for non-critical.
- **Asset exclusion.** Cook only what's used.

For: smaller downloads; faster install.

## Shaders precompiled

For: smooth player experience.

Shader compilation is expensive; precompile during packaging:
- Project Settings → Rendering → Materials → Precompile Shaders.
- Build includes precompiled shaders; players don't compile during play.

Without this: first time loading a level may take minutes as shaders compile.

## Splash screen / branding

For: professional first impression.

- Custom splash screen (configured per platform).
- Project Settings → Project → Splash Screens.
- Replace Unreal's default with your branding.

## Crash reporting

For shipped games: capture crashes:
- Project Settings → Crash Reporter → Configure.
- Sentry, Crashlytics, Unreal's built-in CrashReportClient.

For: identifying issues from players post-launch.

## Analytics

For tracking how players play:
- Analytics plugin (Project Settings → Plugins → Analytics).
- Send events on key actions (level completed, character died, item purchased).
- Backends: Unreal Analytics, GameAnalytics, Unity Analytics.

For: data-driven decisions on what to improve.

## Updating shipped games

After release: patches.
- Re-cook + re-package.
- Distribute via platform's update system (Steam, App Store, Console store).
- Delta patches reduce download size.

For: continuing support post-launch.

## Marketplace + distribution

Where to ship:
- **Steam.** PC gaming dominant; some submission requirements.
- **Epic Games Store.** Easy to ship; great revenue terms.
- **GOG.** DRM-free; smaller audience.
- **Itch.io.** Indie-friendly; low barrier.
- **Console stores.** Per-platform; certification required.
- **Mobile stores.** Apple App Store + Google Play.

Pick based on game + audience.

## Certification (console)

PS5, Xbox, Switch require certification:
- Per-platform requirements (UI standards, save behaviors, achievements integration).
- Technical Requirements Checklist (TRC).
- Submit build; platform reviews; iterate on failures.

For: console release, allocate weeks-to-months for cert.

## Launch checklist

Before launch:
- [ ] Tested on target hardware.
- [ ] No critical crashes.
- [ ] Settings menu functional.
- [ ] Save / load tested.
- [ ] Tutorial / first-time experience polished.
- [ ] All assets cleared for commercial use (no infringing content).
- [ ] Store page assets (screenshots, trailers, descriptions).
- [ ] Privacy policy.
- [ ] Crash reporting + analytics active.
- [ ] Backup of shipped build.

For: launching responsibly.

## Post-launch

After release:
- **Monitor.** Reviews, crash reports, analytics.
- **Patch.** Fix critical bugs immediately.
- **Iterate.** Roadmap updates, content updates, balance changes.
- **Engage.** Community management; respond to player feedback.

For: building long-term game success.

## Mistakes to avoid

- **Skipping testing of packaged builds.** PIE != shipped behavior.
- **Wrong build configuration.** Shipping uses Shipping config.
- **Missing platform-specific assets.** App icons, splash screens.
- **No crash reporting.** Blind to post-launch issues.
- **No backup of shipping build.** Lost golden version.

## Summary

- Packaging: cook + bundle for platform.
- Build configurations: Shipping for player releases.
- Project Settings → Maps & Modes for default maps + game modes.
- Per-platform settings (iOS / Android / consoles).
- Test packaged builds; PIE doesn't catch everything.
- Crash reporting + analytics for post-launch insight.
- Marketplace strategy: pick platforms by audience.

## Course complete

You've covered Unreal Engine end-to-end: interface + assets + levels + Blueprints + World Partition + Nanite + Lumen + performance + materials + post-processing + lighting + gameplay framework + character movement + saving + shipping. The breadth is intentional — UE5 is one of the most capable engines ever built; understanding the full stack enables informed decisions.

Next steps: build something. Start small (10-minute prototype) and apply patterns:
- Third Person template as starting point.
- Add custom character (MetaHuman + animations).
- Build a level (Megascans environment + lighting + post-process).
- Implement gameplay (pickups + damage + UI via Blueprints).
- Polish (audio + materials + final post-processing).
- Package for Windows; share with friends.

After 3-5 small projects: pick a longer-term project. Pro Unreal devs maintain side projects + commercial work; the variety keeps skills sharp. The community on Epic's Developer Forums, Discord, Reddit r/unrealengine, YouTube channels (Gorka Games, Smart Poly, Reid's Channel) all support continued learning. Unreal's depth is years' worth of learning; the foundations you have now scale to any project size; specialization comes naturally as you find what excites you most (level design, gameplay programming, technical art, VFX, etc.). Welcome to UE5.
