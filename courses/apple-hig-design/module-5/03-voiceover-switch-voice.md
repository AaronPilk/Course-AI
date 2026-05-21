---
module: 5
position: 3
title: "VoiceOver, Switch Control, Voice Control"
objective: "Make apps usable for people who navigate differently."
estimated_minutes: 5
---

# VoiceOver, Switch Control, Voice Control

## Three assistive technologies

Apple ships three major input/output technologies for accessibility:

- **VoiceOver.** Screen reader for blind / low-vision users. Reads everything; user navigates by swipe.
- **Switch Control.** For users with limited motor function. Single-switch (or two-switch) input scans through UI, activates on switch press.
- **Voice Control.** Speech-driven; users say commands ("Tap Save", "Scroll down").

These cover most assistive input. Designing for them improves your app for everyone.

## VoiceOver basics

When VoiceOver is on:
- User swipes right → focus moves to next element; VoiceOver reads it.
- User swipes left → previous element.
- Double-tap → activate focused element.
- Three-finger swipe → scroll page.
- Many more gestures (rotor settings, custom actions).

Your app needs to:
- Provide labels for every element.
- Use proper traits (button, header, image).
- Group related elements.
- Skip decorative content.
- Order traversal logically.

## Labels — the foundation

```swift
Image(systemName: "trash")
  .accessibilityLabel("Delete item")
```

VoiceOver reads "Delete item, button." Without label, it reads "trash icon" or worse — meaningless to screen reader users.

UIKit: `accessibilityLabel`. SwiftUI: `.accessibilityLabel()`.

Every interactive element + meaningful content needs a label. Decorative images: `.accessibilityHidden(true)`.

## Traits

Beyond labels, traits describe the role:

```swift
Image(systemName: "trash")
  .accessibilityLabel("Delete")
  .accessibilityAddTraits(.isButton)
```

Common traits:
- `.isButton`
- `.isHeader`
- `.isLink`
- `.isImage`
- `.isSelected`
- `.isToggle`

Native SwiftUI controls (Button, Toggle) set these automatically. Custom views need explicit traits.

## Hints

For non-obvious interactions:

```swift
.accessibilityHint("Double-tap to delete the selected item")
```

VoiceOver says the hint after a pause; supplemental info. Don't repeat the label.

## Grouping

For composite views (e.g., a card with photo + name + status):

```swift
HStack {
  Image(...)
  VStack { Text(name); Text(status) }
}
.accessibilityElement(children: .combine)
.accessibilityLabel("\(name), \(status)")
```

VoiceOver reads one combined element instead of 3 separate. Faster navigation; clearer meaning.

## Custom actions

For elements with multiple actions (swipe to delete, double-tap to edit):

```swift
.accessibilityActions {
  Button("Edit") { edit() }
  Button("Delete", role: .destructive) { delete() }
}
```

VoiceOver users access via Rotor. Replaces gesture-only shortcuts with discoverable actions.

## Reading order

If your visual layout differs from reading order (sometimes for design reasons), specify:

```swift
.accessibilitySortPriority(10)  // higher reads first
```

VoiceOver respects priority; typical use is rare but valuable for unusual layouts.

## Testing VoiceOver

Methods:
- **Settings → Accessibility → VoiceOver → On.** Real device test.
- **Accessibility Inspector** in Xcode. Walkthrough simulated VoiceOver.
- **VoiceOver shortcut.** Triple-click side button on iPhone (or accessibility shortcut).

For every screen: enable VoiceOver; navigate by swipe; ensure flow makes sense; activate every interactive element. Bugs surface quickly.

## Switch Control

Users with motor limitations use 1-2 switches (head switch, eye switch, sip-and-puff, big buttons). Switch Control scans through UI; user presses switch to select.

For your app:
- **Standard controls** work automatically with Switch Control.
- **Custom controls** need accessibility traits.
- **Tap targets ≥ 44pt** (Switch Control "tap" is system-driven; size still matters for visibility).
- **No time-sensitive interactions.** Switch users may take 30+ seconds to scan + select; don't auto-dismiss.

Test in Settings → Accessibility → Switch Control. Configure with a virtual switch (long-press Home + side button) to simulate.

## Voice Control

Users speak commands; system interprets:
- "Tap Save."
- "Scroll up."
- "Open Settings."
- "Show numbers" (overlays numbers on every tappable element; user says number).

For your app:
- **Accessibility labels are voice commands.** "Delete item" lets user say "Tap Delete item."
- **Make labels speak-able.** Short, distinct, no special characters.
- **Group large lists** so commands disambiguate.

Test in Settings → Accessibility → Voice Control.

## AssistiveTouch

For users who can't perform multi-finger gestures: AssistiveTouch shows a floating menu with shortcuts. System handles; your app benefits if standard gestures are supported.

Don't make critical actions require multi-finger; AssistiveTouch helps but isn't perfect.

## Hover Text (formerly Hover)

iPad / Mac: hover with pointer to enlarge text. Your text scales automatically if using standard rendering.

Useful for low-vision users; free if you use standard controls.

## Sound Recognition

Apple's accessibility detects sounds (door knock, baby crying, alarm). Your app probably doesn't interact, but if you produce critical audio (game audio cues), be aware.

## Audio Descriptions

For video content: provide audio descriptions of visual scenes for blind users. Apple's HIG covers; specialized work.

## The accessibility mindset

Don't think of accessibility as "extra work for disabled users." Think of it as "designing for human variation."

Outcomes:
- VoiceOver labels improve search.
- Tap targets ≥ 44pt help everyone.
- High contrast reads better outdoors.
- Captions help noisy environments.
- Reduce Motion comforts everyone with vertigo.

The investment in accessibility pays back for all users. And ~25% of users have a disability of some kind during their lifetime; designing for them is non-trivial impact.

## Mistakes to avoid

- **No accessibility labels.** VoiceOver says "image" / "button"; useless.
- **Touch-only critical actions.** Switch Control / Voice Control miss.
- **Decorative images announced.** Clutters VoiceOver flow.
- **Bad reading order.** Logical-visual mismatch confuses.
- **Time-sensitive UIs.** Switch / Voice users may take long.

## Summary

- VoiceOver (screen reader) + Switch Control (motor) + Voice Control (speech).
- Accessibility labels on every interactive + meaningful element.
- Use traits (.isButton, .isHeader) for context.
- Group composite views via .accessibilityElement(.combine).
- Test with each technology; Apple's Inspector helps.
- Universal design benefits everyone, not just affected users.

Next: the accessibility audit.
