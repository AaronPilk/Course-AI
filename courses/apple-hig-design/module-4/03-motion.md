---
module: 4
position: 3
title: "Motion: easing, duration, and intent"
objective: "Animation as communication, not decoration."
estimated_minutes: 5
---

# Motion: easing, duration, and intent

## Motion as language

Animation in Apple's UI conveys meaning:
- **Slide up.** New content emerging.
- **Slide right.** Going forward / deeper.
- **Fade.** Layers appearing / dismissing.
- **Scale.** Importance increasing / decreasing.
- **Bounce.** Resistance / arrival.

Each motion type signals something. Misused animations confuse; well-used animations clarify.

## Easing curves

Apple's defaults:
- **Linear.** Constant speed. Rare in UI.
- **EaseIn.** Slow start, fast end. Items leaving.
- **EaseOut.** Fast start, slow end. Items arriving (default for most UI).
- **EaseInOut.** Slow both ends. Repositions / transitions.
- **Spring.** Bouncy / physics-based. Apple favors for tap responses and presentations.

SwiftUI:
```swift
.animation(.easeOut, value: someValue)
.animation(.spring(response: 0.3, dampingFraction: 0.7), value: someValue)
```

Default for SwiftUI animations is `.easeInOut`. Custom springs feel "Apple-like."

## Duration

Apple's animations are fast:
- **Micro feedback** (button press, toggle): 100-200ms.
- **Transitions** (push, modal): 300-400ms.
- **Elaborate** (hero photo expand): 500ms max.

Slower feels sluggish. Faster feels jittery. Test on device; what felt right in Figma may need adjustment.

## Standard transitions

iOS-defined:
- **Push.** Navigate forward; new screen slides in from right.
- **Pop.** Navigate back; current screen slides right out.
- **Modal present.** Sheet rises from bottom.
- **Modal dismiss.** Sheet falls back.
- **Cross-fade.** Tab swap; views replace.
- **Hero / matched geometry.** Photo zooms from thumbnail to fullscreen.

Use system transitions where applicable. They feel native; users predict them.

## Animation purpose

Each animation should serve a purpose:

- **Indicate change.** Toggle flips; switch moves.
- **Convey hierarchy.** Modal rises from below; you sense it's "above."
- **Show progress.** Loading spinner; progress bar.
- **Reward action.** Button press depresses; toggle confirms.
- **Soften context shift.** Fade between screens.

Purposeless animation = noise. Especially: looping animations on idle screens distract.

## Reduce Motion

iOS setting Accessibility → Motion → Reduce Motion. Should:
- Eliminate dramatic transitions (zoom, parallax).
- Replace with simple cross-fades.
- Keep functional animations (loading) but minimize decoration.

Honor:

```swift
@Environment(\.accessibilityReduceMotion) var reduceMotion

withAnimation(reduceMotion ? .none : .spring) { ... }
```

For users with vestibular disorders, motion causes nausea. Reduce Motion isn't a preference; it's a need.

## Springs — Apple's signature

SwiftUI's spring animations:

```swift
.animation(.spring(response: 0.4, dampingFraction: 0.6), value: position)
```

- **response.** Time for the spring to settle (~200-500ms typical).
- **dampingFraction.** How bouncy (1.0 = no bounce; 0.5-0.7 = subtle bounce; <0.5 = pronounced).

For most UI: response 0.3-0.4, dampingFraction 0.7-0.8. Subtle physics; doesn't draw attention but feels alive.

Apple's iOS animations heavily use springs. Custom apps that use springs feel native.

## Interruption and continuity

Apple's animations are interruptible. If user starts dragging while a previous animation is in flight, the new gesture takes over smoothly — no waiting for animation to finish.

SwiftUI handles this with springs that respect velocity:

```swift
.animation(.interactiveSpring(), value: position)
```

For drags / pans: interactive springs are essential. Otherwise the UI feels heavy.

## Common motion patterns

**Modal sheet rises:**
- 350ms spring; from below screen.

**Push navigation:**
- 350ms ease; right-to-left slide.

**Pop navigation:**
- 350ms ease; current slides right.

**Tab switch:**
- 250ms cross-fade; no slide (signals "lateral" not "hierarchical").

**Button press:**
- 100ms ease; subtle scale + tint change.

**Toggle flip:**
- 200ms spring; thumb slides.

**Photo zoom from thumbnail:**
- 400ms spring; matched geometry.

Match these patterns; users expect.

## Hero animations (matched geometry)

SwiftUI's matchedGeometryEffect makes hero animations easy:

```swift
struct PhotoView: View {
  @Namespace var animation
  
  ThumbnailView()
    .matchedGeometryEffect(id: photo.id, in: animation)
  
  FullScreenView()
    .matchedGeometryEffect(id: photo.id, in: animation)
}
```

When transitioning between views with matched IDs, SwiftUI animates the geometry change. Photos zoom from thumbnail; cards expand; very polished.

Used heavily in Apple's Photos / Books apps. Worth investment for transitions that matter.

## Layered transitions

Multiple elements animating together create depth:
- Background dims.
- Modal rises.
- Foreground content lifts slightly.

Each subtly differs; sum is polished. Stage Manager / Picture in Picture use this heavily.

Custom: combine multiple animations with consistent springs. Synced timing reads "elegant" vs "chaotic."

## Easing for specific feels

- **Spring.** Playful / natural / iOS-native.
- **EaseInOut.** Smooth / formal / Mac-like.
- **Linear.** Mechanical / progress / data-driven (loading bar).

Pick based on tone. Apple-native feels = lots of springs. Linear progress bars for things-completing.

## Common mistakes

- **Animating everything.** Drowns out the meaningful ones.
- **Long durations.** Feel sluggish; users wait.
- **Looping idle animations.** Distract.
- **No Reduce Motion respect.** Excludes vestibular-sensitive users.
- **Linear easing in UI.** Feels robotic.

## Testing motion

- **Slow Animations** (in Simulator): Debug → Slow Animations. Catch interpolation bugs.
- **Real device.** Springs feel different on hardware vs simulator.
- **Reduce Motion on.** Test that experience.
- **60 fps minimum.** ProMotion devices want 120 fps.

## Mistakes to avoid

- **Animation for animation's sake.** Each should communicate.
- **Wrong easing for context.** Linear button press feels mechanical.
- **Too long durations.** > 500ms feels heavy.
- **Skipping Reduce Motion.** Real accessibility need.
- **Synchronized animations missing.** Hero animations require careful matching.

## Summary

- Motion communicates: emerging, dismissing, hierarchy.
- Springs feel Apple-native; ease for formal.
- Duration 100-500ms typical; faster = snappy, slower = sluggish.
- Honor Reduce Motion; replace dramatic with cross-fades.
- Matched geometry for hero / shared-element transitions.
- Test on device; on Slow Animations; with Reduce Motion.

Next: haptics and audio.
