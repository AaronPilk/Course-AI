---
module: 5
position: 1
title: "iOS vs iPadOS vs macOS vs visionOS conventions"
objective: "Adapt design to each platform's idioms."
estimated_minutes: 6
---

# iOS vs iPadOS vs macOS vs visionOS conventions

## Platforms are not the same

iOS, iPadOS, macOS, visionOS share many principles but differ in:
- Input model (touch vs mouse vs gaze).
- Screen size and aspect ratio.
- Multitasking model.
- Idioms (tab bars vs menu bars vs ornaments).

A great app on each platform takes platform-specific design effort. Catalysts and port-it-once-run-everywhere solutions exist but rarely match handcrafted native.

## iOS — touch-first, single-window

- **Tab bar bottom.** ≤5 top-level destinations.
- **Navigation bar top.** Title + back button + actions.
- **Modal sheets** rise from bottom for self-contained tasks.
- **Touch targets ≥ 44pt.**
- **One screen at a time** typically; navigation pushes / pops.
- **Limited keyboard / external pointer.**

Optimize for one-thumbed use; reachable bottom controls.

## iPadOS — touch + pointer + multitasking

iPad runs iPadOS — same OS base as iOS, but with bigger screen + pointer + multitasking. Different design priorities:

- **Sidebars** common (NavigationSplitView). Master + detail (or master + middle + detail for triple-pane).
- **Multitasking.** Split View, Slide Over, Stage Manager. Your app may run at any width 320pt-1366pt.
- **Pointer support.** Hover effects via `.hoverEffect()`.
- **External keyboard.** Cmd-key shortcuts; focus model.
- **Apple Pencil.** Drawing apps; markup.

iPadOS apps that look like big iPhone apps feel wrong; the platform expects denser layouts that use the screen.

## macOS — windows, menu bar, keyboard primary

Macs run macOS with different idioms:

- **Menu bar at top of screen** (not the window). File, Edit, View, etc.
- **Windows resizable**; user drags corners.
- **Sidebars** on left for navigation.
- **Toolbar at top of window** for current-screen actions.
- **Mouse + keyboard primary** input.
- **Hover affordances** everywhere.

Mac apps must respect:
- **Multi-window.** User may open multiple instances of your app.
- **Save / restore state.** Quitting and relaunching should preserve.
- **Keyboard shortcuts.** Every action that's used often should have one.

Built via:
- **AppKit.** Native; full control; old Mac code.
- **Catalyst.** iPad app extended to Mac; quick port; less Mac-native feel.
- **SwiftUI for Mac.** Modern; reasonable Mac affordances; recommended for new apps.

## visionOS — spatial computing

Vision Pro runs visionOS. Different paradigm:

- **Windows float in space.** Multiple windows at different distances.
- **Eye tracking + hand gestures** primary input.
- **Pinch (like air-tap) = click.**
- **Look at element + pinch** = tap.
- **Immersive vs windowed** modes.
- **Ornaments** — UI elements that attach to a window's edges.
- **Depth.** 3D content vs flat panels.

visionOS apps don't have hover (eye-tracking replaces); use specific accent-on-look effects.

For most teams: visionOS is a separate workstream; iOS app on visionOS works (compatibility mode) but feels lacking.

## watchOS — tiny screen, glanceable

Apple Watch design focuses on:
- **Glanceability.** Information in <1 second.
- **Brief interactions.** 2-5 seconds typical.
- **Crown + tap + Siri.**
- **Complications** on watch face.
- **Pairing with iOS** for setup / data sync.

watchOS app design is its own discipline.

## tvOS — couch, remote, distant screen

Apple TV's tvOS:
- **Focus engine.** Highlighted element; remote up/down/left/right moves focus.
- **Large text** (viewing distance).
- **Limited input.** Siri Remote with touchpad, basic buttons.
- **Apps full-screen.**

Less common, but consistent within Apple's design language.

## Cross-platform pattern

Strategy choices:

**Native per platform.** Best UX per platform; most engineering. Recommended for flagship apps. Apple does this for first-party apps.

**SwiftUI sharing.** Significant code sharing; adapts to each platform. Per-platform refinement still needed; cheaper than full native.

**Catalyst (iOS → Mac).** Quick Mac port from iPad app; result is "iPad app on Mac." Acceptable for some apps.

**Cross-platform framework (Flutter, React Native).** Single codebase across iOS + Android + Web + sometimes Mac. UX rarely feels native on all.

Pick by what you can commit to. Underinvested apps on every platform are worse than great app on one platform.

## Adapting to each platform

For an app on iOS + iPad + Mac:

- **iPhone:** Tab bar + push navigation.
- **iPad:** NavigationSplitView with sidebar + detail.
- **Mac:** Sidebar + content; menu bar; window controls.

SwiftUI's `NavigationSplitView` handles much of this automatically — collapses to single column on iPhone, expands on iPad, becomes proper Mac sidebar.

Conditional adjustments:
```swift
#if os(macOS)
// Mac-specific
#elseif os(iOS)
// iOS
#endif

// Or runtime:
@Environment(\.horizontalSizeClass) var hSizeClass
if hSizeClass == .regular {
  // iPad / Mac
}
```

## Mac-specific idioms

Mac apps must include:
- **Window resize handles** at corners.
- **Cmd-W to close**, Cmd-Q to quit, Cmd-N for new.
- **Help menu** that's actually useful.
- **Preferences window** for settings (Cmd-,).
- **Drag and drop** support.
- **Document architecture** (if document-based).

These aren't optional for Mac feel; users notice their absence.

## iPad-specific idioms

iPad apps benefit from:
- **Sidebar that collapses** on narrow widths.
- **Multi-column layouts.**
- **Multitasking with Split View / Slide Over.**
- **Pencil support** for relevant apps.
- **Hover effects** for pointer users.
- **Cmd-key shortcuts** for keyboard users.

iPad-only apps that just enlarge iPhone UI fail to take advantage; users on iPad expect more.

## Common pitfalls

- **iPhone UI ported to iPad as-is.** Wastes screen.
- **iPad UI ported to Mac.** No menu bar; no window management.
- **Mac app without keyboard shortcuts.** Frustrates power users.
- **visionOS without considering 3D / spatial.** Compatibility-mode feel.
- **One UI pattern across all platforms.** Loses each platform's strengths.

## When NOT to do native

Some apps make sense as cross-platform:
- **Companion apps.** Phone is primary; Mac / iPad are nice-to-haves.
- **Browser-extension-like.** Same web functionality everywhere.
- **B2B utilities.** Function > native feel.

For these: cross-platform framework can be right; don't over-invest in native per platform if the value isn't there.

## Mistakes to avoid

- **One playbook for all platforms.** Loses per-platform strengths.
- **Ignoring Mac users.** They'll switch to a native competitor.
- **Treating iPad as big iPhone.** Wastes the screen.
- **visionOS without designing for it.** Awkward in compatibility mode.
- **No keyboard shortcuts on Mac.** Power-user dealbreaker.

## Summary

- iOS = touch-first, single-window.
- iPadOS = touch + pointer + multitasking; sidebars + Split View.
- macOS = mouse + keyboard; menu bar; windows; multi-document.
- visionOS = gaze + pinch; floating windows; depth.
- watchOS / tvOS = glanceable / focus-based.
- SwiftUI adapts much; per-platform refinement still needed.

Next: adaptive design across device classes.
