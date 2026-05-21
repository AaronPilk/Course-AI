---
module: 5
position: 4
title: "The accessibility audit Apple expects"
objective: "A practical checklist to ship accessible Apple-platform apps."
estimated_minutes: 5
---

# The accessibility audit Apple expects

## The audit framework

Apple publishes accessibility guidance; here's a synthesized checklist for shipping a new app or auditing an existing one. Run through each area; remediate failures; repeat after major changes.

## 1. Labels and traits

For every screen:
- [ ] Every interactive element has an accessibility label.
- [ ] Decorative images are marked `.accessibilityHidden(true)`.
- [ ] Icons have labels describing function, not appearance.
- [ ] Composite controls grouped (`.accessibilityElement(children: .combine)`).
- [ ] Custom controls have correct traits (`.isButton`, etc.).

Test: enable VoiceOver; navigate by swipe; every focus stop announces meaningfully.

## 2. Dynamic Type

- [ ] All text uses named text styles (`.body`, `.title`, etc.).
- [ ] Custom fonts wrapped with UIFontMetrics.
- [ ] Layouts adapt at largest accessibility size (A5) — stack vertically; respect overflow.
- [ ] Truncation only where necessary; wrap where possible.

Test: set system text size to AX5; visit every screen; nothing critical is cut off / unreadable.

## 3. Contrast

- [ ] WCAG AA contrast for text (4.5:1 normal; 3:1 large).
- [ ] WCAG AA contrast for icons / controls (3:1).
- [ ] Tested in light AND dark mode.
- [ ] Tested with Increase Contrast on.

Test: Xcode Accessibility Inspector → Color Audit. Address all flagged failures.

## 4. Color independence

- [ ] No information conveyed by color alone.
- [ ] State changes include icon / text / position cues.
- [ ] Tested with color-blindness simulator.
- [ ] Differentiate Without Color setting works.

Test: open Sim Daltonism; review each screen. State indicators readable without color.

## 5. Motion and animation

- [ ] Honor Reduce Motion: replace dramatic transitions with cross-fades.
- [ ] No looping non-essential animations.
- [ ] Animations 100-500ms typical; not too slow.
- [ ] Parallax effects respect Reduce Motion.

Test: enable Reduce Motion; verify experience degrades gracefully.

## 6. Touch targets

- [ ] All tappable elements ≥ 44×44pt (use `.contentShape` to expand if needed).
- [ ] Adequate spacing between adjacent targets (≥ 8pt).
- [ ] No tap targets within home gesture / status bar zones.

Test: enable AssistiveTouch; verify every action is reachable.

## 7. VoiceOver

- [ ] Navigate every screen by VoiceOver swipe.
- [ ] Activate every element.
- [ ] Reading order matches visual / logical flow.
- [ ] Critical gestures have accessibility actions.
- [ ] Adjustable elements (sliders, segmented controls) work.

Test: Settings → Accessibility → VoiceOver → On. Walk through critical user flows.

## 8. Switch Control

- [ ] All interactive elements reachable by scanning.
- [ ] No time-sensitive interactions.
- [ ] Predictable focus order.
- [ ] Visible focus indicators (system handles for standard controls).

Test: enable Switch Control with virtual switch; perform a complete user flow.

## 9. Voice Control

- [ ] Labels are speak-friendly (no special characters; short).
- [ ] No two elements share the same label.
- [ ] "Show numbers" shows numbers on every tappable element.

Test: enable Voice Control; say commands to navigate the app.

## 10. Multitasking and adaptive layout

- [ ] iPhone portrait and landscape both work.
- [ ] iPad multitasking: Split View 50/50, 33/66; Slide Over.
- [ ] Mac window resize from minimum to large.
- [ ] All screens functional across modes.

Test: Xcode preview multiple devices + simulator multitasking.

## 11. Dark mode

- [ ] All text readable in dark mode.
- [ ] No hardcoded light-mode colors.
- [ ] Custom brand colors have dark variants.
- [ ] Materials behave correctly.

Test: toggle to dark mode in Settings; verify every screen looks intentional.

## 12. Localization

- [ ] All UI strings localized (NSLocalizedString or similar).
- [ ] RTL languages tested (Arabic, Hebrew).
- [ ] Date / time / number formats respect locale.
- [ ] Long translations (German) don't break layouts.

Test: change Settings → Language to a non-English locale; visit screens.

## 13. Specific iOS interactions

- [ ] Back navigation works (swipe from left edge, back button).
- [ ] Pull-to-refresh works where expected.
- [ ] Long-press menus where appropriate.
- [ ] Sheets dismiss via swipe-down or X button.
- [ ] Keyboard appears appropriately; dismisses on tap outside.

## 14. iPadOS specific

- [ ] Pointer hover effects (`.hoverEffect()` on tappable elements).
- [ ] Keyboard shortcuts for common actions.
- [ ] Apple Pencil support where relevant.
- [ ] Drag and drop where useful.

## 15. macOS specific

- [ ] Menu bar with File / Edit / View / Help.
- [ ] Cmd-key shortcuts for common actions.
- [ ] Window resize behavior.
- [ ] Multi-window if appropriate.
- [ ] Drag-drop between windows.

## 16. Performance

- [ ] 60fps minimum (120fps on ProMotion devices).
- [ ] No janky scrolling.
- [ ] Materials not over-applied (GPU cost).
- [ ] First-launch < 2s to interactive.

Test: real device; Instruments → Time Profiler.

## 17. Privacy and permissions

- [ ] App requests permissions only when needed.
- [ ] Permission rationale clear in Info.plist usage descriptions.
- [ ] No surprise tracking (App Tracking Transparency).
- [ ] Privacy nutrition labels accurate in App Store Connect.

## 18. App Store readiness

- [ ] App icon at all required sizes.
- [ ] Launch screen (or use SwiftUI's automatic).
- [ ] Screenshots for all device classes.
- [ ] Privacy policy + DPA if processing personal data.
- [ ] App Store description matches functionality.

## 19. Crash + error handling

- [ ] Graceful network failure messaging.
- [ ] No exposed internal error strings.
- [ ] Critical paths handle bad data.
- [ ] Crash reporting set up (Crashlytics, Sentry, App Store Connect crashes).

## 20. Build configuration

- [ ] Release build tested (some bugs only in optimized builds).
- [ ] Different language / region tested.
- [ ] Slowest supported device tested.
- [ ] Network conditions: offline, slow, normal.

## How to use this checklist

Print it; tape to wall; tick boxes before shipping. Or build it into your release process.

Some teams treat as gates (must pass to ship); others as guidance (ship with known gaps but tracked). Either way, having the checklist forces conversation about each area.

Apps that pass all of this feel polished, inclusive, and Apple-native. Apps that skip any feel less.

## Mistakes to avoid

- **Audit once before launch; never again.** Should run after every major feature.
- **Treat as bureaucracy.** Audit reveals real bugs.
- **Outsource without engaging.** Designers + engineers should run.
- **Skip on small features.** Quality compounds; small features add up.

## Summary

- Accessibility audit covers labels, contrast, motion, types, layouts.
- Run before launches and after major changes.
- Test with VoiceOver, Switch Control, Voice Control, Reduce Motion, A5 type.
- Localize, support RTL, handle Mac/iPad idioms.
- Performance, privacy, App Store readiness round it out.

## Course complete

You've covered the foundations of Apple's design language — clarity, deference, depth, plus typography, color, controls, gestures, motion, accessibility, and cross-platform adaptation. The principles apply whether you're building Apple-platform apps or any product that aspires to feel intentional.

Next steps: pick an app you've shipped or want to ship; run the accessibility audit; fix what you find. The audit will surface things you didn't notice; the fixes will compound into a more inclusive, polished product. Apple's HIG is one of the most studied design documents in software for good reasons; revisit specific sections as you encounter design problems.
