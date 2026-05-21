---
module: 4
position: 4
title: "Haptics and audio as design materials"
objective: "Use touch and sound as design — minimally."
estimated_minutes: 4
---

# Haptics and audio as design materials

## What haptics are for

iPhone's Taptic Engine produces precise vibration feedback. Used right, haptics confirm interactions invisibly:
- **Toggle switch.** Slight tap on flip.
- **Send message.** Light bump on send.
- **Critical alert.** Stronger pulse.
- **Long-press menu.** Crisp tap as menu appears.

Used wrong, haptics annoy: random buzzing, every-action vibration, constant feedback.

Apple's apps use haptics sparingly but meaningfully. Match that discipline.

## Types of haptics

iOS exposes three categories:

**Notification haptics:**
- `.success` — green checkmark vibe.
- `.warning` — caution.
- `.error` — error.

```swift
let generator = UINotificationFeedbackGenerator()
generator.notificationOccurred(.success)
```

**Impact haptics:**
- `.light` — subtle.
- `.medium` — standard tap.
- `.heavy` — emphatic.
- `.soft` — softer than light.
- `.rigid` — sharper than heavy.

```swift
let impact = UIImpactFeedbackGenerator(style: .medium)
impact.impactOccurred()
```

**Selection haptics:**
- For wheel pickers; happens automatically when selection changes.

```swift
let selection = UISelectionFeedbackGenerator()
selection.selectionChanged()
```

SwiftUI: `.sensoryFeedback()` modifier (iOS 17+).

## When to use haptics

Reward / confirm:
- Toggle flips.
- Critical action complete.
- Drag-release.
- Pull-to-refresh trigger.

Warn:
- Error states.
- Cancellation.

Don't:
- Every scroll.
- Every button tap (overkill).
- During typing (annoying).
- Looping (battery + irritation).

The HIG: haptics for "the system / app responded to me." Not for "I tapped something."

## Battery and haptics

The Taptic Engine uses real power. Excessive haptics drain battery + reduce engine lifespan.

Apple's guidance: short, infrequent haptics. Don't haptic every animation.

## Haptics across devices

- **iPhone 7+.** Full Taptic Engine.
- **iPhone older.** Basic vibration only; degrades gracefully (no-op on missing).
- **iPad.** Most iPads don't have Taptic; haptics are no-op.
- **Apple Watch.** Built-in haptic engine; central to watch UX.

Code should call haptics regardless; system handles availability. Don't conditionally — system does.

## Audio in UI

Sound design in apps is rare and risky:
- **System sounds.** Notification ping, message send. Subtle.
- **App-specific.** Confirmation tones (purchase complete), error beeps.
- **Background music / ambience.** For specific apps (meditation, focus tools).

Generally, iOS apps are silent by default. Sound adds value in specific contexts; default silence is the right call.

## When sound earns its place

- **Critical confirmations.** Payment processed (slight chime), photo captured (shutter sound).
- **Game / immersive apps.** Mechanic feedback.
- **Audio apps obviously.** Music, podcasts, calls.

Default mute most apps; let user opt in if you have sounds.

## System sound effects

SwiftUI offers:

```swift
import AudioToolbox

AudioServicesPlaySystemSound(SystemSoundID(1057))  // "Tock"
```

The IDs map to standard iOS sounds. Use sparingly; standard sounds blend; custom sounds stand out (sometimes annoyingly).

Don't compete with system sounds (text alerts, notification tones).

## Audio + haptics combined

Some interactions combine:
- **Camera shutter.** Sound + light haptic.
- **Pull-to-refresh.** Subtle haptic on trigger.
- **Drag-and-drop.** Haptic on pick up + drop.

Combined feedback feels concrete. Use when interaction has real-world analogue (shutter = camera click + haptic).

## Mute respect

iOS users use mute extensively. Honor:
- **Mute switch on.** No sound (unless user explicitly enabled "even in silent" — rare; needs justification).
- **Do Not Disturb.** No sound + reduced notifications.

Apps that play sound while muted = bad reviews. Test in mute mode.

## Audio session management

When playing audio, declare your session:

```swift
try AVAudioSession.sharedInstance().setCategory(.playback)
try AVAudioSession.sharedInstance().setActive(true)
```

- `.playback` — background play; e.g., music app.
- `.ambient` — non-critical; respects silence switch.
- `.soloAmbient` — interrupts other audio.

Default `.soloAmbient` for most; `.playback` for music / podcasts.

## Haptic feedback patterns for SwiftUI

```swift
.sensoryFeedback(.success, trigger: completedCount)
.sensoryFeedback(.selection, trigger: selectedItem)
.sensoryFeedback(.impact(weight: .light), trigger: tapCount)
```

Fires when trigger value changes. Clean syntax.

## Mistakes to avoid

- **Haptic on every button tap.** Annoying.
- **Sound on every action.** Annoying.
- **Looping haptics.** Battery + annoyance.
- **Ignoring mute switch.** Bad reviews.
- **Custom sounds that compete with system.** Confusing.

## Summary

- Haptics confirm intent + reward action; use sparingly.
- Three categories: notification (success/warning/error), impact (weight), selection.
- Sound: default silent for most apps; opt-in for sound-relevant features.
- Honor mute switch; declare audio session category correctly.
- Combined haptic + sound for real-world analogue interactions.
- iPad / Apple Watch differ in haptic capability; code calls; system adapts.

Module 4 complete. Next module: cross-platform and accessibility.
