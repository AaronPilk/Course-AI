---
module: 5
position: 2
title: "Build pipeline and platform settings"
objective: "Take Unity project from editor to player's device."
estimated_minutes: 5
---

# Build pipeline and platform settings

## Build Settings

File → Build Settings. Configure:
- **Scenes in Build.** Drag scenes; index 0 loads first.
- **Platform.** PC/Mac/Linux, Android, iOS, WebGL, PS5, Xbox, Switch, etc.
- **Switch Platform** button (slow first time; cached after).

## Player Settings

Edit → Project Settings → Player. Per-platform settings:
- **Company Name + Product Name.** App identification.
- **Version.** App version string.
- **Bundle Identifier** (iOS) / **Package Name** (Android).
- **App icon** + splash screens.
- **Resolution + display settings.**
- **Quality settings** per platform.

For: customizing per platform.

## Build script

Build via:
- **File → Build And Run.** Builds + launches.
- **File → Build.** Builds only.
- **Build Script (C# editor code).** Automate via BuildPipeline.BuildPlayer.

For: CI/CD pipelines.

## Common platform settings

**PC/Mac/Linux:**
- IL2CPP (recommended) vs. Mono backend.
- Architecture (x86, x86_64, ARM64 for Apple Silicon).
- Standalone window mode (fullscreen / windowed).

**Android:**
- Minimum API Level.
- Target API Level (current Google Play requirements).
- AAB (App Bundle) for Play Store; APK for direct distribution.
- IL2CPP required for 64-bit (Play Store requirement).

**iOS:**
- Xcode export; build in Xcode for App Store.
- Provisioning profiles + certificates.
- Privacy manifest.

**WebGL:**
- Compression Format (Brotli for smaller; gzip for compatibility).
- Texture compression.
- Memory size limit.

## Scripting Backend

- **Mono.** Faster builds; legacy; some platforms require IL2CPP.
- **IL2CPP.** AOT compilation to C++; faster runtime; required for iOS, recommended for Android.

For most platforms: IL2CPP.

## Compression + asset settings

- **Texture Compression.** ASTC (Android/iOS), BC7 (PC), DXT (legacy).
- **Audio Compression.** Vorbis (small) vs. PCM (quality).
- **Mesh Compression.** Reduce file size.

For: smaller install size + better load times.

## App icons + splash screens

Player Settings → Splash Image, Icon. Set per platform:
- iOS: many sizes (App Store + various devices).
- Android: legacy + adaptive icons.
- PC: .ico / .icns.

Unity Splash auto-disabled in Pro / Plus subscriptions.

## Development build

For testing:
- Build Settings → Development Build = true.
- Includes debug symbols; allows profiler attachment; shows Unity logs.
- Larger + slower than release.

For: testing on actual device.

## Release build

For shipping:
- Development Build = false.
- Optimized.
- Stripped logging.

For: distribution.

## Profiling on device

For perf on target device:
- Development Build + Profiler Connect.
- Connect Unity Profiler to running build.
- See FPS, draw calls, memory live.

For: catching device-specific issues.

## Build sizes

Optimize:
- **Strip unused assets.** Resources folder + Addressables.
- **Compress textures.**
- **Use Asset Bundles / Addressables for delta updates.**
- **Audio compression per platform.**

For: app store size limits + faster downloads.

## Cloud builds

Unity Cloud Build (subscription): automated builds on Unity's servers; useful for CI/CD without local build machine.

Alternative: GitHub Actions + Unity Build Server / GameCI.

For: team workflows + automated nightly builds.

## Testing builds

Before shipping:
- Build on every target platform.
- Test all features (PIE may not catch all build-only bugs).
- Profile performance on actual device.
- Test crash scenarios (low memory, no internet).

For: catching issues pre-launch.

## Mistakes to avoid

- **Skip testing on device.** Editor != device perf.
- **Wrong scripting backend.** iOS requires IL2CPP.
- **No texture compression.** Bloat.
- **Development Build for release.** Larger + slower.
- **Wrong API level (Android).** Play Store rejects.

## Summary

- File → Build Settings to configure.
- Player Settings per platform.
- IL2CPP for most platforms; required iOS.
- Texture / Audio compression for size.
- Development Build for testing (with profiler); Release for shipping.
- Test on actual device before shipping.

Next: performance optimization.
