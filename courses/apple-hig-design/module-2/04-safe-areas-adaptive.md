---
module: 2
position: 4
title: "Safe areas, layout margins, and adaptive layouts"
objective: "Layouts that work on every device."
estimated_minutes: 5
---

# Safe areas, layout margins, and adaptive layouts

## The device fragmentation reality

Apple makes more iOS device sizes than commonly assumed:
- iPhone SE (small).
- iPhone 14/15/16 (regular).
- iPhone Pro Max (large).
- iPad mini, iPad, iPad Air, iPad Pro 11", iPad Pro 13".
- Landscape modes on all.
- Split View on iPad.
- Slide Over.
- Stage Manager.

Plus Dynamic Type at 11 sizes. Multiply: hundreds of combinations.

Adaptive layouts mean your UI works across all without per-device code paths.

## Size classes

Apple categorizes screen widths and heights as:
- **Compact width.** Phone portrait; phone landscape (limited width).
- **Regular width.** iPad portrait; iPhone Plus landscape.
- **Compact height.** Phone landscape.
- **Regular height.** Most else.

Same app can be `compact width × compact height` on iPhone landscape and `regular width × regular height` on iPad portrait. Layouts should adapt.

SwiftUI exposes via Environment:

```swift
@Environment(\.horizontalSizeClass) var hSizeClass
@Environment(\.verticalSizeClass) var vSizeClass

if hSizeClass == .regular {
  // sidebar + detail view
} else {
  // single-column with navigation
}
```

UIKit: `UITraitCollection.horizontalSizeClass`.

## Adaptive patterns

**One column on phone, two-column on iPad.**

```swift
NavigationSplitView {
  Sidebar()
} detail: {
  DetailView()
}
```

SwiftUI's `NavigationSplitView` handles this — collapses to single column on phone, expands to multi-column on iPad. Apple's framework adapts; you write once.

**Conditional UI per size class.**

```swift
if hSizeClass == .regular {
  HStack { Sidebar(); Content() }
} else {
  NavigationStack { ContentList() }
}
```

Used when the framework defaults don't fit.

## Orientation

Some apps lock to portrait (most utility). Others rotate (media, games, browsing).

In Info.plist: `UISupportedInterfaceOrientations`. Lock if rotation hurts UX; allow if it helps.

If allowing landscape: layouts must adapt — phone landscape has compact height; modals can't be tall.

## Multitasking on iPad

iPad apps can be in:
- **Full screen.**
- **Split View.** Two apps side by side (50/50 or 25/75).
- **Slide Over.** Floating window.
- **Stage Manager.** Multiple windowed apps (iPadOS 16+).

Your app's width can range from ~320pt (Slide Over) to 1366pt (iPad Pro full screen). Adaptive layouts handle all.

## Mac apps (Catalyst or native)

Mac apps differ:
- **Windows can be any size.** User drags corners.
- **Sidebar typical** on left.
- **Menu bar at top of screen** (not the window).
- **Keyboard + mouse.** Different interaction model.

Mac Catalyst lets iPad apps run on Mac with some adaptation. SwiftUI on Mac inherits much. Pure AppKit for Mac-first apps.

Either way: adaptive layouts essential.

## Aspect ratios

Photos, videos, illustrations should adapt to varied containers:
- **`.aspectRatio(.fit)`.** Fits within container; letterboxes if needed.
- **`.aspectRatio(.fill)`.** Fills container; crops if needed.
- **Custom aspect.** Specify ratio explicitly.

Pick based on intent: portrait photo in landscape container — fit (show full image) or fill (crop, but visually fills)?

## Adaptive font sizes

Combine Dynamic Type with viewport size:
- **iPhone.** Default Dynamic Type sizes.
- **iPad.** Sometimes one step larger (more screen, can use more space).
- **Mac.** Different scale entirely.

Apple's named text styles auto-adapt by platform. Custom sizes need manual scaling.

## Multi-column lists

iPad apps with lists benefit from columns:
- Default: single column.
- At iPad regular width: two columns (sidebar + detail).
- At full iPad Pro: maybe three (sidebar + master + detail).

Mail does this. Notes does this. Pattern: NavigationSplitView with multiple columns.

## Pop-overs vs modals

On phone: modal sheets (slide up from bottom).
On iPad: popovers (small floating windows from anchor).

```swift
.popover(isPresented: $showPopover) { ... }
```

iOS automatically renders popover as modal sheet on phone (compact width), as popover on iPad (regular width). Adaptive built in.

## Default appearance

For first launch on different devices, your app should look intentional everywhere:
- iPhone: comfortable, focused, vertical-scrolling.
- iPad: utilizes width with sidebars / columns.
- Mac: window-aware; uses menu bar; respects multi-window.

The "ran ported iPad app on Mac" feeling = something didn't adapt. Polish takes time but distinguishes great Mac/iPad apps from minimum-viable ports.

## Testing across devices

Xcode simulator covers most devices. For real testing:
- iPhone SE (smallest current).
- iPad mini (smaller iPad).
- iPhone Pro Max (large).
- iPad Pro 13".
- Mac.

Rotate everything; test at A5 Dynamic Type; resize windows on Mac. Adaptive bugs surface.

## When not to adapt

Some apps deliberately stay iPhone-only or iPad-only:
- iPhone-only: small utilities, fitness, fast-checkin apps.
- iPad-only: drawing apps optimized for the canvas (Procreate).

Declare in App Store Connect; don't ship a half-baked iPad version of an iPhone app.

## Mistakes to avoid

- **iPhone UI scaled to iPad.** Wastes the screen.
- **No rotation handling.** Crashes / broken layouts in landscape.
- **iPad Split View ignored.** App breaks at 320pt width.
- **Mac feels like a phone app.** No sidebars, menu bar usage, multi-window.
- **Untested at extreme sizes.** Bugs in production.

## Summary

- Size classes (compact / regular width × height) define adaptive breakpoints.
- NavigationSplitView for adaptive multi-column.
- iPad multitasking: app width can be 320-1366pt.
- Mac apps: windows, menu bars, mouse — different model.
- `.popover()` adapts: modal sheet on phone, popover on iPad.
- Test on smallest and largest devices + Dynamic Type extremes.

Module 2 complete. Next module: color, materials, dark mode.
